import { addRole } from "./users.js";
export function addStudent(
  db,
  studentCode,
  fullName,
  { majorId = "maj_ktpm", email, registered = true } = {},
) {
  const entry = {
    studentCode,
    email: email ?? `${studentCode}@student.iuh.edu.vn`,
    fullName,
    dob: "2006-01-15",
    homeClass: `D${studentCode.slice(0, 2)}-${majorId.slice(4).toUpperCase()}`,
    majorId,
  };
  db.schoolDirectory.push(entry);
  if (!registered) return;
  const id = `usr_${studentCode}`;
  db.users.push({
    id,
    kind: "STUDENT",
    username: studentCode,
    passwordHash: "plain:demo1234",
    email: entry.email,
    phone: "0900000000",
    fullName,
    status: "ACTIVE",
    mustChangePassword: false,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: db.clock.now,
  });
  db.studentProfiles.push({
    userId: id,
    studentCode,
    dob: entry.dob,
    homeClass: entry.homeClass,
    majorId,
    isKSTN: false,
  });
  addRole(db, id, "STUDENT", null);
}
export function seedDirectory(db) {
  for (const [code, name] of [
    ["21094501", "Nguyễn Hoàng Nam"],
    ["21094518", "Trần Minh Khoa"],
    ["21094602", "Võ Gia Bảo"],
    ["21094777", "Lý Thanh Tú"],
    ["22073210", "Phạm Gia Hân"],
    ["21094650", "Đặng Quốc Việt"],
    ["26010011", "Hồ Ngọc Mai"],
    ["26010022", "Trương Gia Huy"],
  ]) {
    addStudent(
      db,
      code,
      name,
      code === "26010022" ? { email: `fail.${code}@student.iuh.edu.vn` } : {},
    );
  }
  addStudent(db, "26019999", "Phan Minh Khang", {
    email: "khang.26019999@student.iuh.edu.vn",
    registered: false,
  });
  addStudent(db, "26018888", "Lâm Bảo Ngọc", { registered: false });
  for (let n = 1; n <= 12; n++)
    addStudent(
      db,
      `2690${String(n).padStart(4, "0")}`,
      [
        "Nguyễn Minh An",
        "Lê Thanh Bình",
        "Trần Ngọc Châu",
        "Võ Minh Đức",
        "Ngô Minh Hiếu",
        "Phan Thu Hương",
        "Đỗ Minh Thư",
        "Lê Quốc Khánh",
        "Phạm Ngọc Lan",
        "Trần Minh Long",
        "Võ Ngọc Ngân",
        "Nguyễn Anh Phúc",
      ][n - 1],
      { majorId: n >= 7 ? "maj_mkt" : n >= 4 ? "maj_httt" : "maj_ktpm" },
    );
  // Authorized IUH alias used to demonstrate OTP-confirmed email changes.
  const nam = db.schoolDirectory.find(
    (entry) => entry.studentCode === "21094501",
  );
  db.schoolDirectory.push({ ...nam, email: "nam.21094501@student.iuh.edu.vn" });
}
