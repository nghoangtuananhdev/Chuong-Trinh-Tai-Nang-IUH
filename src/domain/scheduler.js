import { timestamp, addHours, addDays, ictDate } from "./time.js";
import { studyYear, isFirstRound, latestList } from "./selectors.js";
import { assignmentChain, roleCovers } from "./scope.js";
import { audit, notify, queueEmail, applicationHistory } from "./events.js";

// Domain-only recipients helper, also used by mock services.
export function roleRecipients(db, roles, chain, now) {
  return [
    ...new Set(
      db.userRoles
        .filter(
          (r) =>
            roles.includes(r.role) &&
            !r.revokedAt &&
            (!r.validFrom || timestamp(r.validFrom) <= timestamp(now)) &&
            (!r.validTo || timestamp(r.validTo) >= timestamp(now)) &&
            roleCovers(r, chain) &&
            db.users.some((u) => u.id === r.userId && u.status === "ACTIVE"),
        )
        .map((r) => r.userId),
    ),
  ];
}
export function tick(source, now, config = source.config) {
  timestamp(now);
  const db = structuredClone(source),
    ctx = { now, actor: null },
    events = [];
  db.clock.now = now;
  const send = (userIds, template, vars, relatedEntity, title, link) => {
    notify(db, ctx, userIds, {
      type: template,
      title,
      body: vars.message ?? vars.roundName ?? "",
      link,
    });
    for (const id of new Set(userIds)) {
      const user = db.users.find((u) => u.id === id);
      if (user)
        queueEmail(db, ctx, { to: user.email, template, vars, relatedEntity });
    }
  };
  for (const round of db.rounds) {
    const cls = db.classes.find((c) => c.id === round.classId);
    const chain = assignmentChain(db, {
      scopeType: "CLASS",
      scopeId: round.classId,
    });
    const members = () =>
      db.memberships
        .filter(
          (m) =>
            m.classId === round.classId &&
            m.studyYear === studyYear(db, round) - 1 &&
            m.status === "ACTIVE",
        )
        .map((m) => m.studentUserId);
    const vars = {
      roundName: round.name,
      roundCode: round.code,
      classCode: cls?.code,
      studyYear: studyYear(db, round),
      deadline: round.intakeEnd,
    };
    if (
      round.status === "upcoming" &&
      timestamp(now) >= timestamp(round.intakeStart)
    ) {
      const before = structuredClone(round);
      const set = db.criteriaSets.find((c) => c.id === round.criteriaSetId);
      // An archived source remains valid for an already released round (D-11).
      if (!set) continue;
      round.criteriaSnapshot = structuredClone(set);
      Object.assign(round, { status: "open", openedAt: now });
      audit(db, ctx, {
        action: "CRITERIA_SNAPSHOT_TAKEN",
        entity: "round",
        entityId: round.id,
        before: null,
        after: round.criteriaSnapshot,
      });
      audit(db, ctx, {
        action: "ROUND_OPENED",
        entity: "round",
        entityId: round.id,
        before,
        after: round,
      });
      events.push({ type: "ROUND_OPENED", roundId: round.id });
      if (!isFirstRound(db, round))
        send(
          members(),
          "ROUND_OPENED",
          vars,
          round.id,
          "ĐXT lớp đã mở tiếp nhận",
          "/app/maintenance",
        );
    }
    if (round.status === "open") {
      // Do not issue stale "please submit" reminders after intake has ended.
      if (timestamp(now) < timestamp(round.intakeEnd)) {
        for (const app of db.applications.filter(
          (a) => a.roundId === round.id && a.status === "draft",
        )) {
          app.remindersSent ??= [];
          for (const hours of config.reminders.draftHoursBefore) {
            if (
              timestamp(now) < timestamp(addHours(round.intakeEnd, -hours)) ||
              app.remindersSent.includes(hours)
            )
              continue;
            app.remindersSent.push(hours);
            send(
              [app.studentUserId],
              "DRAFT_REMINDER",
              { ...vars, hours },
              app.id,
              "Bạn còn hồ sơ nháp chưa nộp",
              `/app/apply/${round.id}`,
            );
            audit(db, ctx, {
              action: "DRAFT_REMINDER",
              entity: "application",
              entityId: app.id,
              after: { hours },
            });
            events.push({
              type: "DRAFT_REMINDER",
              applicationId: app.id,
              hours,
            });
          }
        }
        if (
          timestamp(now) >= timestamp(addHours(round.intakeEnd, -48)) &&
          !round.closingReminderSent
        ) {
          round.closingReminderSent = true;
          const recipients = members().filter(
            (id) =>
              !db.applications.some(
                (a) =>
                  a.roundId === round.id &&
                  a.studentUserId === id &&
                  ["pending", "approved"].includes(a.status),
              ),
          );
          if (recipients.length)
            send(
              recipients,
              "ROUND_CLOSING",
              { ...vars, hours: 48 },
              round.id,
              "ĐXT sắp đóng tiếp nhận",
              "/app/maintenance",
            );
          audit(db, ctx, {
            action: "ROUND_CLOSING_REMINDER",
            entity: "round",
            entityId: round.id,
            after: { recipients },
          });
        }
      }
      if (timestamp(now) >= timestamp(round.intakeEnd)) {
        const before = structuredClone(round);
        Object.assign(round, { status: "review", reviewStartedAt: now });
        for (const app of db.applications.filter(
          (a) => a.roundId === round.id && a.status === "draft",
        )) {
          app.status = "cancelled";
          applicationHistory(
            db,
            ctx,
            app,
            "Hủy nháp",
            "Đã hết thời hạn tiếp nhận",
          );
          audit(db, ctx, {
            action: "APPLICATION_CANCELLED",
            entity: "application",
            entityId: app.id,
            before: { status: "draft" },
            after: { status: "cancelled" },
          });
        }
        notify(db, ctx, roleRecipients(db, ["LECTURER", "HEAD"], chain, now), {
          type: "REVIEW_STARTED",
          title: "ĐXT đã chuyển sang xét duyệt",
          body: `Có ${db.applications.filter((a) => a.roundId === round.id && a.status === "pending").length} hồ sơ cần duyệt`,
          link: `/app/rounds/${round.id}`,
        });
        audit(db, ctx, {
          action: "ROUND_REVIEW_STARTED",
          entity: "round",
          entityId: round.id,
          before,
          after: round,
        });
        events.push({ type: "ROUND_REVIEW_STARTED", roundId: round.id });
      }
    }
    if (round.status === "approving") {
      const list = latestList(db, round.id);
      if (list?.status !== "PENDING") continue;
      const previous = db.approvalSteps
        .filter((s) => s.listId === list.id)
        .sort((a, b) => timestamp(b.decidedAt) - timestamp(a.decidedAt))[0];
      const since = previous?.decidedAt ?? list.createdAt;
      const day = ictDate(now);
      list.reminderDays ??= [];
      if (
        timestamp(now) >=
          timestamp(addDays(since, config.reminders.approvalHoldDays)) &&
        !list.reminderDays.includes(day)
      ) {
        list.reminderDays.push(day);
        const level = {
          waiting_head: "HEAD",
          waiting_dean: "DEAN",
          waiting_training: "TRAINING",
        }[round.approvalSubstatus];
        send(
          roleRecipients(db, [level], chain, now),
          "LIST_REMINDER",
          {
            ...vars,
            days: Math.floor((timestamp(now) - timestamp(since)) / 86400000),
          },
          round.id,
          "Danh sách đang chờ phê duyệt",
          `/app/approvals/${round.id}`,
        );
        audit(db, ctx, {
          action: "LIST_REMINDER",
          entity: "admissionList",
          entityId: list.id,
          after: { day, level },
        });
        events.push({ type: "LIST_REMINDER", listId: list.id });
      }
    }
  }
  for (const app of db.applications.filter(
    (a) => a.status === "needs_update",
  )) {
    const round = db.rounds.find((r) => r.id === app.roundId);
    const request = db.reviewRequests
      .filter((r) => r.applicationId === app.id && !r.resolvedAt)
      .at(-1);
    if (
      round?.status !== "review" ||
      !request ||
      timestamp(now) <= timestamp(request.dueAt)
    )
      continue;
    const before = structuredClone(app);
    Object.assign(app, {
      status: "rejected",
      decisionNote: "Quá hạn bổ sung hồ sơ",
      decidedBy: null,
      decidedAt: now,
    });
    request.resolvedAt = now;
    applicationHistory(db, ctx, app, "Không đạt", app.decisionNote);
    send(
      [app.studentUserId],
      "NEEDS_UPDATE_EXPIRED",
      { applicationCode: app.code },
      app.id,
      "Hồ sơ quá hạn bổ sung",
      `/app/my-applications/${app.id}`,
    );
    audit(db, ctx, {
      action: "APPLICATION_EXPIRED",
      entity: "application",
      entityId: app.id,
      before,
      after: app,
    });
    events.push({ type: "APPLICATION_EXPIRED", applicationId: app.id });
  }
  for (const email of db.emailOutbox) {
    if (
      email.status === "SENT" ||
      email.attempts >= config.email.maxAttempts ||
      email.lastAttemptAt === now
    )
      continue;
    const before = structuredClone(email);
    email.attempts++;
    email.lastAttemptAt = now;
    const fails =
      Boolean(config.email.failPattern) &&
      email.to.includes(config.email.failPattern);
    email.status = fails ? "FAILED" : "SENT";
    email.lastError = fails ? "SMTP 550: Mailbox unavailable (mô phỏng)" : null;
    email.sentAt = fails ? null : now;
    audit(db, ctx, {
      action: fails ? "EMAIL_FAILED" : "EMAIL_SENT",
      entity: "email",
      entityId: email.id,
      before,
      after: email,
    });
    events.push({
      type: fails ? "EMAIL_FAILED" : "EMAIL_SENT",
      emailId: email.id,
    });
  }
  return { db, events };
}
