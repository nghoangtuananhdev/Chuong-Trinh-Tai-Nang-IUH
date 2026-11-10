export const templates = {
  OTP_REGISTER: {
    subject: "[IUH CN/KSTN] Mã xác thực đăng ký tài khoản",
    body: "Mã OTP của bạn là {{code}}, hiệu lực {{ttl}} phút. Không chia sẻ mã này.",
  },
  OTP_LOOKUP: {
    subject: "[IUH CN/KSTN] Mã tra cứu kết quả",
    body: "Mã OTP tra cứu: {{code}} ({{ttl}} phút).",
  },
  OTP_CHANGE_EMAIL: {
    subject: "[IUH CN/KSTN] Xác nhận email mới",
    body: "Mã xác nhận: {{code}}.",
  },
  PASSWORD_RESET_LINK: {
    subject: "Đặt lại mật khẩu",
    body: "Truy cập {{link}} trong {{ttl}} phút để đặt lại mật khẩu.",
  },
  PASSWORD_TEMP: {
    subject: "Mật khẩu tạm thời",
    body: "Mật khẩu tạm: {{password}}. Bạn sẽ được yêu cầu đổi ngay khi đăng nhập.",
  },
  APPLICATION_SUBMITTED: {
    subject: "Đã tiếp nhận hồ sơ {{applicationCode}}",
    body: "Hồ sơ của {{name}} vào {{roundName}} đã được tiếp nhận lúc {{time}}. Mã hồ sơ: {{applicationCode}}.",
  },
  DRAFT_REMINDER: {
    subject: "Nhắc nộp hồ sơ – còn {{hours}} giờ",
    body: "Bạn còn bản nháp ở {{roundName}} chưa nộp. Hạn: {{deadline}}.",
  },
  ROUND_OPENED: {
    subject: "{{roundName}} đã mở tiếp nhận",
    body: "Lớp {{classCode}} mở ĐXT năm {{studyYear}}. Vui lòng cập nhật hồ sơ tích lũy trước {{deadline}}.",
  },
  ROUND_CLOSING: {
    subject: "{{roundName}} sắp đóng tiếp nhận",
    body: "Còn {{hours}} giờ để cập nhật hồ sơ tích lũy.",
  },
  NEEDS_UPDATE: {
    subject: "Yêu cầu bổ sung hồ sơ {{applicationCode}}",
    body: "{{message}} — Hạn bổ sung: {{dueAt}}.",
  },
  NEEDS_UPDATE_EXPIRED: {
    subject: "Hồ sơ {{applicationCode}} quá hạn bổ sung",
    body: "Hồ sơ được ghi nhận Không đạt do quá hạn bổ sung.",
  },
  LIST_WAITING: {
    subject: "Danh sách {{roundCode}} chờ bạn xử lý",
    body: "Phiên bản v{{version}} đang chờ {{levelLabel}}.",
  },
  LIST_RETURNED: {
    subject: "Danh sách {{roundCode}} bị trả về",
    body: "{{levelLabel}} trả về: {{reason}}.",
  },
  LIST_REMINDER: {
    subject: "Nhắc việc phê duyệt {{roundCode}}",
    body: "Danh sách đã chờ {{days}} ngày.",
  },
  RESULT_CONFIRMED: {
    subject: "Kết quả xét tuyển {{roundName}}",
    body: "Chúc mừng {{name}} đã trúng tuyển lớp {{classCode}}.",
  },
  RESULT_NOT_ADMITTED: {
    subject: "Kết quả xét tuyển {{roundName}}",
    body: "Hồ sơ đạt điều kiện nhưng ngoài chỉ tiêu. Bạn có thể nộp ở các ĐXT bổ sung tiếp theo.",
  },
  RESULT_REJECTED: {
    subject: "Kết quả xét tuyển {{roundName}}",
    body: "Hồ sơ không đạt điều kiện: {{reason}}.",
  },
  RESULT_DROPPED: {
    subject: "Kết quả duy trì lớp {{classCode}}",
    body: "Bạn không tiếp tục là thành viên lớp từ năm đào tạo {{studyYear}} (lý do: {{reason}}). Bạn vẫn có thể nộp ở các ĐXT bổ sung sau.",
  },
};
