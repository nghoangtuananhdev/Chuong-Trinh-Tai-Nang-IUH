import { createEmptyDb } from "../schema.js";
import { seedCatalog } from "./catalog.js";
import { seedUsers } from "./users.js";
import { seedDirectory } from "./directory.js";
import { seedCriteria } from "./criteria.js";
import { seedRounds } from "./rounds.js";
import { seedApplications } from "./applications.js";
import { seedLists } from "./lists.js";
import { templates } from "./templates.js";
import { queueEmail } from "../../domain/events.js";
export function buildSeedDb() {
  const db = createEmptyDb();
  db.counters.cs = 5;
  db.config.templates = structuredClone(templates);
  seedCatalog(db);
  seedUsers(db);
  seedDirectory(db);
  seedCriteria(db);
  seedRounds(db);
  seedApplications(db);
  seedLists(db);
  const app = db.applications.find(
    (a) => a.studentCode === "26010022" && a.roundId === "DXT-2026-01",
  );
  queueEmail(
    db,
    { now: db.clock.now },
    {
      to: app.email,
      template: "APPLICATION_SUBMITTED",
      vars: {
        applicationCode: app.code,
        name: app.applicantName,
        roundName: "Xét tuyển KSTN khóa 22",
        time: db.clock.now,
      },
      relatedEntity: app.roundId,
    },
  );
  return db;
}
