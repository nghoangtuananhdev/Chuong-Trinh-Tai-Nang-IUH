import { ROLE_SCOPE } from "../../domain/constants.js";
export const DEMO_ACCOUNTS = [
  ["quantri", "Quản trị viên hệ thống", "ADMIN", null, "admin@iuh.edu.vn"],
  ["GV900", "Nguyễn Minh Anh", "TRAINING", null, "minhanh@iuh.edu.vn"],
  ["GV004", "PGS.TS. Lê Hoàng", "DEAN", "fac_cntt", "lehoang@iuh.edu.vn"],
  ["GV010", "TS. Võ Thanh Hà", "DEAN", "fac_qtkd"],
  ["GV005", "TS. Trần Ngọc Bình", "HEAD", "maj_ktpm", "tnbinh@iuh.edu.vn"],
  [
    "GV001",
    "ThS. Phạm Thị Dung",
    "LECTURER",
    "cls_ktpm_20",
    "ptdung@iuh.edu.vn",
  ],
  ["GV003", "ThS. Lê Minh Tâm", "LECTURER", "cls_ktpm_21"],
  ["GV002", "TS. Nguyễn Văn Hải", "HEAD", "maj_httt"],
  ["GV006", "ThS. Ngô Thu Trang", "LECTURER", "cls_httt_21"],
  ["GV007", "TS. Hoàng Minh Châu", "HEAD", "maj_mkt"],
  ["GV008", "ThS. Trần Mỹ Linh", "LECTURER", "cls_mkt_20"],
  ["GV009", "ThS. Đặng Thu Hà", "LECTURER", "cls_mkt_22"],
];
export function addRole(db, userId, role, scopeId) {
  const row = {
    id: `seed_role_${db.userRoles.length + 1}`,
    userId,
    role,
    scopeType: ROLE_SCOPE[role],
    scopeId,
    validFrom: "2020-01-01T00:00:00+07:00",
    validTo: null,
    grantedBy: "usr_quantri",
    revokedAt: null,
  };
  db.userRoles.push(row);
  return row;
}
export function seedUsers(db) {
  for (const [username, fullName, role, scopeId, email] of DEMO_ACCOUNTS) {
    const id = `usr_${username.toLowerCase()}`;
    // Prototype only: plain text passwords are deliberately NOT production-safe.
    db.users.push({
      id,
      kind: "STAFF",
      username,
      fullName,
      email: email ?? `${username.toLowerCase()}@iuh.edu.vn`,
      phone: "0900000000",
      passwordHash: "plain:demo1234",
      status: "ACTIVE",
      mustChangePassword: username === "GV009",
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: db.clock.now,
    });
    addRole(db, id, role, scopeId);
    if (username.startsWith("GV"))
      db.lecturerProfiles.push({
        userId: id,
        lecturerCode: username,
        facultyId: ["GV007", "GV008", "GV009", "GV010"].includes(username)
          ? "fac_qtkd"
          : "fac_cntt",
        title: fullName.split(" ")[0],
      });
  }
  addRole(db, "usr_gv005", "LECTURER", "cls_ktpm_22");
}
