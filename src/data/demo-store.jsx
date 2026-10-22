import { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  createInitialMajors,
  createInitialClasses,
  createInitialPermissions,
  initialStudents,
  initialTeachers,
  initialApplications,
  initialRounds,
  criteriaRows,
  roles
} from "./fixtures.js";

const DemoStoreContext = createContext(null);

const STORAGE_KEY_PREFIX = "iuh_talent_v2_";

export function DemoStoreProvider({ children, initialRole = "public" }) {
  const [currentRoleKey, setCurrentRoleKey] = useState(initialRole);

  // Entities
  const [majors, setMajors] = useState(createInitialMajors);
  const [classes, setClasses] = useState(createInitialClasses);
  const [permissions, setPermissions] = useState(createInitialPermissions);
  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [rounds, setRounds] = useState(initialRounds);
  const [criteria, setCriteria] = useState(criteriaRows);
  const [applications, setApplications] = useState(initialApplications);

  // Toast notifications
  const [toasts, setToasts] = useState([]); // [{ id, message, type: 'success' | 'error' | 'warning' | 'info' }], tối đa 3
  const toastSeq = useRef(0);

  const showToast = useCallback((message, type = "success") => {
    toastSeq.current += 1;
    const id = `${Date.now()}-${toastSeq.current}`;
    setToasts((prev) => [...prev, { id, message, type }].slice(-3));
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Student Draft Persistence ---
  // `silent`: tự lưu nháp — chỉ cập nhật chỉ báo ở trang, không bắn toast thành công.
  const saveStudentDraft = useCallback((draftData, { silent = false } = {}) => {
    try {
      const payload = {
        data: draftData,
        savedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}student_draft`, JSON.stringify(payload));
      if (!silent) showToast(`Đã lưu bản nháp lúc ${payload.savedAt}`, "info");
      return payload.savedAt;
    } catch {
      showToast("Không thể lưu bản nháp trên trình duyệt này.", "error");
      return null;
    }
  }, [showToast]);

  const loadStudentDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}student_draft`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  }, []);

  // --- Application Actions ---
  const submitApplication = useCallback((appData) => {
    const newApp = {
      id: `HS-2026-${String(applications.length + 1).padStart(3, "0")}`,
      studentId: appData.studentId || "21094501",
      studentName: appData.studentName || "Nguyễn Hoàng Nam",
      studentClass: appData.studentClass || "KSTN-KTPM-K20",
      major: appData.major || "Kỹ thuật phần mềm",
      roundCode: appData.roundCode || "DXT-2026-02",
      roundName: appData.roundName || "Duy trì KSTN năm 3",
      type: appData.type || "Duy trì năm 3",
      gpa: Number(appData.gpa) || 3.5,
      creditsEarned: Number(appData.creditsEarned) || 38,
      creditsFailed: Number(appData.creditsFailed) || 0,
      trainingScore: Number(appData.trainingScore) || 85,
      toeicScore: Number(appData.toeicScore) || 500,
      achievement: appData.achievement || "Không có",
      documents: appData.documents || [
        { name: "bang-diem-minh-chung.pdf", size: "1.2 MB" },
        { name: "chung-chi-ngoai-ngu.pdf", size: "850 KB" }
      ],
      totalScore: "Đang tính",
      status: "pending",
      submittedAt: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
      reviewLevel: "Chờ phê duyệt",
      reviewerNote: "",
      history: [
        {
          date: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
          actor: appData.studentName || "Nguyễn Hoàng Nam",
          role: "Sinh viên",
          action: "Nộp hồ sơ",
          note: "Hồ sơ đã được gửi thành công và chờ cán bộ xét duyệt."
        }
      ]
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast("Hồ sơ đã được nộp thành công và chuyển sang trạng thái chờ duyệt.", "success");
    return newApp;
  }, [applications.length, showToast]);

  const reviewApplication = useCallback((appId, decision, note = "", reviewerInfo = {}) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;

        const dateStr = new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
        const actorName = reviewerInfo.name || "Cán bộ xét duyệt";
        const actorRole = reviewerInfo.role || "Cán bộ";

        let newStatus = app.status;
        let actionLabel = "";
        let newLevel = app.reviewLevel;

        if (decision === "approve") {
          newStatus = "approved";
          actionLabel = "Phê duyệt hồ sơ";
          newLevel = `${actorRole} đã duyệt`;
        } else if (decision === "confirm") {
          newStatus = "confirmed";
          actionLabel = "Xác nhận trúng tuyển";
          newLevel = "Trúng tuyển chính thức";
        } else if (decision === "needs_update") {
          newStatus = "needs_update";
          actionLabel = "Yêu cầu bổ sung";
          newLevel = "Cần sinh viên bổ sung";
        } else if (decision === "reject") {
          newStatus = "rejected";
          actionLabel = "Từ chối hồ sơ";
          newLevel = "Không đạt yêu cầu";
        }

        const newHistory = [
          ...(app.history || []),
          {
            date: dateStr,
            actor: actorName,
            role: actorRole,
            action: actionLabel,
            note: note || (decision === "approve" ? "Đã thẩm định hồ sơ đạt tiêu chuẩn." : "Đã cập nhật trạng thái.")
          }
        ];

        return {
          ...app,
          status: newStatus,
          reviewLevel: newLevel,
          reviewerNote: note,
          history: newHistory
        };
      })
    );

    if (decision === "approve") {
      showToast("Đã phê duyệt hồ sơ sinh viên thành công.", "success");
    } else if (decision === "confirm") {
      showToast("Đã xác nhận danh sách trúng tuyển chính thức.", "success");
    } else if (decision === "needs_update") {
      showToast("Đã gửi yêu cầu bổ sung hồ sơ đến sinh viên.", "warning");
    } else if (decision === "reject") {
      showToast("Đã ghi nhận quyết định từ chối hồ sơ.", "info");
    }
  }, [showToast]);

  const currentRole = roles[currentRoleKey] || roles.admin;

  return (
    <DemoStoreContext.Provider
      value={{
        currentRoleKey,
        setCurrentRoleKey,
        currentRole,
        majors,
        setMajors,
        classes,
        setClasses,
        permissions,
        setPermissions,
        students,
        setStudents,
        teachers,
        setTeachers,
        rounds,
        setRounds,
        criteria,
        setCriteria,
        applications,
        setApplications,
        submitApplication,
        reviewApplication,
        saveStudentDraft,
        loadStudentDraft,
        toasts,
        showToast,
        hideToast
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const context = useContext(DemoStoreContext);
  if (!context) {
    throw new Error("useDemoStore must be used within a DemoStoreProvider");
  }
  return context;
}
