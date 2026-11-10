# KẾ HOẠCH TRIỂN KHAI PROTOTYPE FE + MOCK — WEB KSTN/CNTN IUH

> **Đối tượng đọc:** AI Agent (hoặc lập trình viên) sẽ code trong repo `web-kstn-iuh`. Agent **không có** ngữ cảnh của phiên lập kế hoạch này, nên mọi thứ cần biết đều nằm trong tài liệu này và các tệp được nêu tên.
> **Mục tiêu:** Đưa frontend hiện có về **đúng nghiệp vụ đã chốt** trong `Web KSNT - Development Plan - Master Plan.md` (gọi tắt **MP**). Kết quả là một **prototype chạy hoàn toàn ở trình duyệt**: không backend, dữ liệu là mock (seed + localStorage + IndexedDB), có **bộ test tự động cho logic nghiệp vụ** và **kịch bản UAT** để trình diễn.
> **Ngày lập:** 09/11/2026 · **Phiên bản kế hoạch:** 1.0

---

## Mục lục

0. [Cách dùng tài liệu & luật làm việc của Agent](#0-cách-dùng-tài-liệu--luật-làm-việc-của-agent)
1. [Phạm vi prototype](#1-phạm-vi-prototype)
2. [Hiện trạng code & phân tích sai lệch so với MP](#2-hiện-trạng-code--phân-tích-sai-lệch-so-với-mp)
3. [Nhật ký quyết định cho prototype (Decision log)](#3-nhật-ký-quyết-định-cho-prototype-decision-log)
4. [Kiến trúc mục tiêu](#4-kiến-trúc-mục-tiêu)
5. [Mô hình dữ liệu mock](#5-mô-hình-dữ-liệu-mock)
6. [Logic nghiệp vụ (domain) — đặc tả chính xác](#6-logic-nghiệp-vụ-domain--đặc-tả-chính-xác)
7. [Mock services (thay cho API ở MP §9)](#7-mock-services-thay-cho-api-ở-mp-9)
8. [Dữ liệu mẫu (seed) & kịch bản trình diễn](#8-dữ-liệu-mẫu-seed--kịch-bản-trình-diễn)
9. [Đặc tả màn hình](#9-đặc-tả-màn-hình)
10. [Hướng dẫn thiết kế UI](#10-hướng-dẫn-thiết-kế-ui)
11. [Lộ trình theo giai đoạn (có cổng nghiệm thu)](#11-lộ-trình-theo-giai-đoạn-có-cổng-nghiệm-thu)
12. [Kiểm thử: test tự động + UAT](#12-kiểm-thử-test-tự-động--uat)
13. [Ma trận truy vết MP → công việc](#13-ma-trận-truy-vết-mp--công-việc)
14. [Hàng rào kiểm soát, Definition of Done, mẫu báo cáo](#14-hàng-rào-kiểm-soát-definition-of-done-mẫu-báo-cáo)
15. [Phụ lục](#15-phụ-lục)

---

## 0. Cách dùng tài liệu & luật làm việc của Agent

### 0.1 Thứ tự ưu tiên nguồn sự thật (khi mâu thuẫn, nguồn đứng trước thắng)

1. Các mục **“ĐÃ CHỐT”** trong MP (bảng C1–C17 ở MP §3.2 và Q3, Q4, Q5, Q6, Q9, Q12, Q13 ở MP §15).
2. **Nhật ký quyết định §3** của tài liệu này (chỉ áp dụng cho những chỗ MP bỏ ngỏ hoặc tự mâu thuẫn).
3. Phần còn lại của MP (§4–§13).
4. `NGHIEP-VU.md` (quy tắc màn hình chuyên ngành, phân trang 10 dòng, xóa con trước cha).
5. `DESIGN.md` (hệ thống thiết kế hiện có: token, component, a11y).
6. Code hiện tại. **Code hiện tại KHÔNG phải nguồn sự thật về nghiệp vụ.**

> `UI-UX-UPGRADE-PLAN-V2.md` có nguyên tắc “giữ nguyên nội dung”. Nguyên tắc đó **chỉ còn áp dụng cho phần thị giác** (token, component, bố cục, a11y). Nội dung, menu, cột, luồng **được phép và phải thay đổi** khi cần để khớp MP.

### 0.2 Luật làm việc

- **Đọc trước khi code:** đọc hết tài liệu này, rồi đọc MP từ đầu đến cuối, rồi `DESIGN.md`, `NGHIEP-VU.md`. Sau đó đọc các tệp code ở §2.1.
- **Làm đúng thứ tự giai đoạn ở §11.** Không nhảy giai đoạn. Mỗi giai đoạn chỉ xong khi qua **cổng nghiệm thu** của nó.
- **Không backend, không gọi mạng.** Không thêm server, không fetch tới API thật. Mọi “API” là hàm JS trong `src/mock/services/`.
- **Không thêm dependency runtime mới** (xem D-15). Test dùng `node:test` có sẵn trong Node ≥ 20.
- **Logic nghiệp vụ nằm trong `src/domain/` và `src/mock/services/`, không nằm trong component.** Component chỉ gọi service và hiển thị. Đây là điều kiện bắt buộc để test được.
- **Kiểm tra quyền ở service** (giống backend thật, MP §9 cuối). Ẩn nút ở UI là phụ, không thay thế kiểm tra ở service.
- **Mọi thay đổi trạng thái/điểm/quyền/phê duyệt phải ghi audit log** (BR-15).
- **Không đổi token thiết kế** trong `src/styles/theme.css`. Không viết mã hex hay `text-[..px]` trong JSX (quy ước của `DESIGN.md`).
- **Toàn bộ chữ trên giao diện là tiếng Việt có dấu**, dùng đúng thuật ngữ MP §2 (ĐXT, GVPT, CNN, BLĐ khoa, PĐT, BB, UT…).
- **Không tự ý “cải tiến” nghiệp vụ.** Gặp chỗ chưa rõ: tìm trong §3. Nếu §3 không có, chọn phương án đơn giản nhất không vi phạm MP, ghi vào `coding_plan/DECISIONS-ADDENDUM.md` (tạo mới nếu chưa có) và báo trong báo cáo giai đoạn.
- **Không động vào** thư mục `.agents/`, `.impeccable/`, `node_modules/`, `dist/`. Không hoàn tác các thay đổi chưa commit có sẵn trong working tree mà không liên quan đến việc của mình.
- **Git:** chỉ commit khi người dùng cho phép. Nếu được phép, làm trên nhánh `feat/master-plan-alignment`, mỗi giai đoạn 1 commit, message dạng `feat(p3): auth + OTP mock theo MP 5.4`.
- **Chạy được trên máy không có pnpm:** dùng `node node_modules/vite/bin/vite.js build` để build và `node --test` để test (xem §12.1).

---

## 1. Phạm vi prototype

### 1.1 Trong phạm vi (phải làm)

| Nhóm | Nội dung | Tham chiếu MP |
|---|---|---|
| Xác thực | Đăng ký TK sinh viên bằng email IUH + đối chiếu MSSV + OTP (mock), đăng nhập bằng MSSV/mã GV/email, khóa tạm sau 5 lần sai, quên MK (link mock), đổi MK, buộc đổi MK khi `mustChangePassword` | C3, C4, C14, 5.4, 5.9 |
| Phân quyền | RBAC + phạm vi, nhiều vai trò trên 1 TK, bộ chọn vai trò, ma trận quyền 4.3, chặn gán quyền vượt phạm vi | 4.2, 4.3, BR-11, BR-14 |
| Danh mục | Khoa/Ngành (Quản trị viên), Chuyên ngành CN/KSTN, Lớp CN/KSTN + thành viên lớp theo năm đào tạo | 4.1, 5.1, `NGHIEP-VU.md` |
| Bộ tiêu chí | Bộ tiêu chí – tiêu chí – mức; 3 kiểu `NUMBER_THRESHOLD`, `COUNT`, `ACCUMULATIVE_ENUM`; BB/UT; xét hòa; tham chiếu giá trị; phiên bản, ban hành, lưu trữ; chia sẻ trong khoa + CRUD theo C12; xem trước điểm | 5.3, C9, C12, C16 |
| ĐXT | Vòng đời 6 trạng thái + bước con phê duyệt; mốc thời gian; chỉ tiêu; học kỳ/năm học; chế độ xếp hạng; snapshot bộ tiêu chí khi `open`; chuyển trạng thái tự động theo **đồng hồ mô phỏng** | 5.2, C5, C6, C10, C17 |
| Hồ sơ | Luồng A/B/C, form động theo bộ tiêu chí, minh chứng theo từng tiêu chí, lưu nháp, nộp, sửa, rút, bổ sung khi `needs_update` | 5.4, 5.5, C1, C7, C8, C14 |
| Xét duyệt | Xác minh từng tiêu chí, sửa giá trị có lý do, Đạt / Không đạt / Yêu cầu bổ sung, chốt & gửi phê duyệt | 5.5 |
| Phê duyệt | Danh sách đề xuất có phiên bản, CNN xác nhận → BLĐ khoa duyệt → PĐT duyệt & công bố, trả về kèm lý do, chạy lại từ CNN | 5.6, C2, BR-12 |
| Công bố | Một “transaction” cập nhật hồ sơ, `isKSTN`, thành viên lớp, email; danh sách công khai che bớt; tra cứu cá nhân bằng MSSV + OTP | 5.7, Q7 |
| Duy trì | `MAINTAIN_THEN_FILL`, `OPEN_COMPETITION`; SV cũ không nộp/không đạt → `DROPPED` | 5.8, Q2 |
| Thông báo & email | Chuông thông báo cho mọi vai trò; hàng đợi email mock (outbox) có gửi lỗi/gửi lại | 5.10, C15 |
| Vận hành | Nhật ký thao tác, báo cáo theo ĐXT + xuất CSV/in PDF, cấu hình hệ thống (mock), hàng đợi email | C13, C15, 4.3 |
| Trình diễn | Bảng điều khiển Demo: đồng hồ mô phỏng, hộp thư mô phỏng (xem OTP/email), đăng nhập nhanh, khôi phục dữ liệu mẫu | (phục vụ prototype) |
| Kiểm thử | Test tự động cho chấm điểm, state machine, xếp hạng, phân quyền, công bố; kịch bản UAT U1–U10 + bổ sung | 13.1, 13.2 |

### 1.2 Ngoài phạm vi (không làm)

Backend thật, DB thật, gửi email thật, JWT/refresh token, SSO, tích hợp hệ thống đào tạo, chữ ký số, ứng dụng di động, import điểm từ PĐT (Q10), hệ số cấp cuộc thi (Q14 chưa chốt — xem D-13), `PROTECTED_RATIO` (MoSCoW “Could”, chỉ để sẵn hằng số, không làm UI), “quyết định điều chỉnh” sau công bố (chỉ hiển thị thông điệp BR-13), quét virus file.

---

## 2. Hiện trạng code & phân tích sai lệch so với MP

### 2.1 Bản đồ code hiện tại (đã đọc trong phiên lập kế hoạch)

- Stack: React 19.2, Vite 8.2, Tailwind 4.3, `lucide-react`. `package.json` không có router, không có test runner (`"test": "vite build"`).
- 7 entry HTML (`index.html`, `quan-tri-vien.html`, `dai-dien-phong-dao-tao.html`, `ban-lanh-dao-khoa.html`, `chu-nhiem-nganh.html`, `giang-vien-phu-trach.html`, `sinh-vien.html`). Mỗi trang đặt `<body data-role="...">`, `src/main.jsx` đọc role đó → **vai trò cố định theo trang HTML, không có phiên đăng nhập**.
- `src/App.jsx`: `WorkspaceShell` chọn trang bằng state `activePage` + `switch` lớn. Không có URL/deep link.
- `src/data/demo-store.jsx`: Context duy nhất giữ `majors, classes, permissions, students, teachers, rounds, criteria, applications` trong localStorage key `iuh_talent_v2_admissions`; chứa luôn logic `submitApplication`, `reviewApplication`, `withdrawApplication`, `advanceRound`, `confirmEnrollment`.
- `src/data/admissions.js`: chấm điểm **viết cứng** (`commonCriteria`, `maintenanceCriteria`), `proposeAdmissions`, `canAccessRound` **viết cứng tên lớp/ngành/khoa**, `isStudentEmail`, `approvalSteps`.
- `src/data/fixtures.js`: `roles` (menu từng vai trò), `initialRounds`, lớp, GV, SV, `criteriaRows` (mảng chuỗi), `initialApplications`.
- `src/data/status-definitions.js`: `ROUND_STATUSES` (có `closed` thừa), `APPLICATION_STATUSES` (thiếu `cancelled`).
- `src/data/evidence.js`: lưu file minh chứng vào IndexedDB (giữ lại, mở rộng).
- Features: `public/*` (PublicHome, RoundDetailModal, PublicApplyModal, ApplicationLookupModal, LoginModal), `rounds/RoundsPage`, `criteria/CriteriaPage`, `approvals/*` (ApprovalsPage, ApplicationReviewModal, RoundApprovalPanel), `student-application/StudentApplicationPage`, `classes`, `majors`, `teachers`, `students`, `permissions`, `passwords`, `profile`.
- Component dùng chung tốt, **giữ và tái sử dụng**: `Button, IconButton, Tooltip, Field/Input/Textarea/Select/Checkbox/RadioCard, PasswordInput(+PasswordStrength), CodeTag, Avatar, Callout, Capacity, DescriptionList, Timeline, StatusBadge, FilterTabs, Stepper, FileDropzone/FileItem, EmptyState, Pagination, Modal, Drawer, FullscreenDialog, ConfirmDialog, ToastStack, useDialogA11y, TablePanel, TableToolbar, TableActions, ResponsiveTable, PageHeader, Sidebar, WorkspaceHeader, PublicHeader, usePagedFilter, useMediaQuery, AwardFields, EvidencePreview`.
- `pnpm` không có sẵn trên máy lập kế hoạch; build bằng `node node_modules/vite/bin/vite.js build` **chạy thành công**.

### 2.2 Bảng sai lệch (Gap) — Agent phải xử lý hết

| Mã | Hiện trạng (file) | Yêu cầu MP | Mức |
|---|---|---|---|
| G-01 | SV vãng lai nộp hồ sơ không cần TK qua `PublicApplyModal`; tra cứu bằng mã hồ sơ + email (`ApplicationLookupModal`) | C4, C14: bắt buộc đăng ký TK bằng email IUH + đối chiếu MSSV + OTP, đăng nhập để nộp/theo dõi/sửa/rút. Không còn “vãng lai nộp hồ sơ” | 🔴 |
| G-02 | Không có cờ `isKSTN`; SV có `status` “Chờ duyệt/Hoạt động” và `className` | C3, BR-03: TK SV có `isKSTN` (mặc định `false`), chỉ bật `true` khi công bố trúng tuyển | 🔴 |
| G-03 | Vai trò cố định theo file HTML; `LoginModal` ánh xạ email → file HTML, MK `12345678` | 4.2: 1 TK nhiều vai trò + phạm vi, bộ chọn vai trò; 5.9: đăng nhập bằng MSSV/mã GV/email, khóa 15′ sau 5 lần sai, MK ≥ 8 ký tự có chữ và số | 🔴 |
| G-04 | `canAccessRound` viết cứng `"KSTN-KTPM-K20"`, `"Kỹ thuật phần mềm"`, `"Khoa Công nghệ Thông tin"` | 4.2–4.3: kiểm tra quyền = permission + đối tượng nằm trong phạm vi, SCHOOL ⊃ FACULTY ⊃ MAJOR ⊃ CLASS | 🔴 |
| G-05 | `ROUND_STATUSES` có `closed`; fixture dùng `closed`; form ĐXT cho chọn trạng thái bằng radio, cho phép `draft → open` | C17, 5.2: đúng 6 trạng thái `draft → upcoming → open → review → approving → published`; `upcoming→open`, `open→review` tự động theo thời gian; `draft→upcoming` bằng thao tác “Phát hành” | 🔴 |
| G-06 | ĐXT tách `kind: initial/supplemental/maintenance`; đợt “maintenance” chặn SV mới nộp ở trang chủ | 5.8, thuật ngữ: ĐXT gắn **1 lớp + 1 năm đào tạo**; ĐXT đầu tiên của lớp = xét tuyển đầu vào; ĐXT tiếp theo **đồng thời** có SV cũ (duy trì, luồng C) và SV mới (bổ sung, luồng A/B) | 🔴 |
| G-07 | Bộ tiêu chí là mảng chuỗi `[loại, tên, điều kiện, điểm, thứ tự]`, không gắn ĐXT | 5.3: `CriteriaSet → Criterion → CriterionLevel`, 3 `valueType`, trạng thái DRAFT/PUBLISHED/ARCHIVED, phiên bản, snapshot khi `open`, CRUD theo C12 | 🔴 |
| G-08 | Chấm điểm viết cứng trong `admissions.js`, phân biệt bằng chuỗi `type.startsWith("Duy trì")` | 5.3.3: chấm theo snapshot bộ tiêu chí của ĐXT; BB không đạt ⇒ không đủ điều kiện; tổng = BB + UT; điểm tự khai vs điểm chính thức | 🔴 |
| G-09 | Form nộp hồ sơ cố định (GPA, TOEIC, giải thưởng) + **1 file PDF ≤ 5 MB** | 5.4: form động theo bộ tiêu chí, **ô minh chứng từng tiêu chí**, điểm dự kiến thời gian thực, cam kết; BR-16: PDF/JPG/PNG ≤ 10 MB/file | 🔴 |
| G-10 | Nháp lưu ở localStorage riêng (`student_draft`), không phải `Application.status = draft` | 5.4: nháp là `Application` trạng thái `draft`; hết hạn tiếp nhận ⇒ `cancelled`; nhắc trước 48h/24h | 🟠 |
| G-11 | `StudentApplicationPage` viết cứng `currentStudentId = "21094501"`, chỉ 1 menu “Hồ sơ của tôi” | 5.4 luồng C + §10: SV KSTN có Tổng quan · Cập nhật hồ sơ tích lũy (chỉ khi ĐXT lớp `open`) · Hồ sơ của tôi (dòng thời gian các năm) · Thông báo · Thông tin cá nhân | 🔴 |
| G-12 | Duyệt hồ sơ chỉ quyết định cả hồ sơ; không xác minh từng tiêu chí; hạn bổ sung cố định 72h | 5.5: GV đánh dấu ✔/✘ từng tiêu chí, sửa giá trị bắt buộc ghi lý do; hạn bổ sung do GV đặt và ≤ ngày kết thúc xét duyệt | 🔴 |
| G-13 | Chốt danh sách bị **chặn** khi đồng hạng ở vị trí cuối | 5.3.3 (5): đồng hạng sau khi xét hòa ⇒ đưa cả nhóm cho cấp phê duyệt quyết định, gắn cảnh báo | 🟠 |
| G-14 | Không có `AdmissionList` phiên bản, không có `ApprovalStep`; lưu `proposedIds` + `approvalStep` trên round | 5.6: `AdmissionList v1, v2…`; mỗi cấp duyệt đúng phiên bản; ý kiến + file đính kèm; trả về ⇒ `review`, chạy lại từ CNN | 🔴 |
| G-15 | Xếp hạng luôn ưu tiên “Duy trì” trước rồi theo điểm; không có `rankingMode` | C10, 5.8: `MAINTAIN_THEN_FILL` (mặc định) / `OPEN_COMPETITION` | 🔴 |
| G-16 | Sau công bố, SV phải tự bấm “Xác nhận nhập học” (`confirmEnrollment`) | 5.7: PĐT công bố ⇒ hồ sơ trúng tuyển tự động `confirmed`, `isKSTN = true`, `ClassMembership ACTIVE`; Q4: chỉ 1 lớp (xem D-08) | 🔴 |
| G-17 | Không có `ClassMembership` theo năm đào tạo; lớp có `current/capacity` nhập tay | 5.1: membership theo từng năm `ACTIVE/DROPPED/WITHDRAWN/GRADUATED`; sĩ số suy ra | 🔴 |
| G-18 | Không có thông báo trong hệ thống, không có email outbox, không có audit log, không có báo cáo, không có cấu hình hệ thống | 5.10, C13, C15, BR-15, §10 | 🔴 |
| G-19 | Menu từng vai trò khác §10 (VD: Quản trị viên không có Nhật ký/Hàng đợi email/Cấu hình; PĐT không có Báo cáo/Nhật ký; GVPT không có Báo cáo lớp/Thông báo) | §10 | 🟠 |
| G-20 | Phân quyền là văn bản tự do (`scope: "Lớp KSTN-KTPM-K20"`), xóa được mọi dòng | 5.9: gán/thu hồi vai trò + phạm vi + thời hạn; BR-14 không gán vượt phạm vi | 🔴 |
| G-21 | TK giảng viên bị **xóa**; đặt lại MK SV hiển thị **toàn bộ SV** cho GVPT, MK mặc định `12345678` | 5.9: khóa/mở khóa thay vì xóa; C11: GVPT chỉ đặt lại MK SV **lớp mình**; MK tạm ngẫu nhiên, gửi email, buộc đổi khi đăng nhập | 🟠 |
| G-22 | Trang chủ hiển thị trạng thái `closed`; kết quả không công khai; không có tra cứu bằng MSSV + OTP | 5.7 (5), Q7: công bố tối thiểu (MSSV che bớt + họ tên viết tắt), tra cứu cá nhân bằng MSSV + OTP | 🟠 |
| G-23 | Không có test tự động | 13.1: test chấm điểm, state machine, phân quyền, xếp hạng | 🔴 |
| G-24 | Hồ sơ không có `flow`, `selfScore`, `officialScore`, `rank`, `eligible`, `previousApplicationId` | MP §7.2 bảng `application` | 🔴 |
| G-25 | ĐXT dùng chuỗi `time: "01/11 - 30/11/2026"`; không có mốc xét duyệt, hạn phê duyệt; không có GVPT, bộ tiêu chí, chế độ xếp hạng | 5.2 bảng “Thông tin ĐXT” | 🔴 |

---

## 3. Nhật ký quyết định cho prototype (Decision log)

> Các quyết định dưới đây lấp chỗ MP bỏ ngỏ. Agent **phải tuân theo**, không tự chọn lại.

| Mã | Chủ đề | Quyết định | Lý do / nguồn |
|---|---|---|---|
| D-01 | Thời gian | Toàn hệ thống dùng **đồng hồ mô phỏng** `db.clock.now` (ISO, múi giờ `Asia/Ho_Chi_Minh`). Mặc định seed: `2026-11-09T09:00:00+07:00`. Bảng Demo cho phép đặt giờ, “+1 giờ”, “+1 ngày”, “Đến mốc kế tiếp của ĐXT…”. Mỗi lần đổi giờ chạy `scheduler.tick()` | MP 5.2 “chuyển tự động mỗi phút”; prototype cần trình diễn được mà không chờ thật. Không dùng `Date.now()` trong domain/service |
| D-02 | Năm đào tạo | `studyYear` của ĐXT = `năm bắt đầu của academicYear − class.startYear + 1` (VD: lớp K20 `startYear 2024`, ĐXT `2026–2027` ⇒ năm 3). Không nhập tay | MP §2 “ĐXT gắn 1 lớp + 1 năm đào tạo” nhưng bảng trường ĐXT chỉ có học kỳ/năm học |
| D-03 | Ràng buộc 1 ĐXT | Một lớp + một học kỳ + một năm học chỉ có **1 ĐXT không ở `draft`** (MP 5.2 Ràng buộc). Kiểm tra khi “Phát hành” | MP 5.2, BR-04 |
| D-04 | ĐXT đầu tiên | `isFirstRound` = lớp chưa có ĐXT nào ở `published` và ĐXT này là ĐXT không-nháp đầu tiên của lớp. ĐXT đầu tiên: `rankingMode` bị ẩn và coi như xếp hạng chung, mọi hồ sơ là SV mới | MP 5.2 “(ĐXT mở đầu không áp dụng)” |
| D-05 | ĐXT tiếp theo | **Luôn** nhận cả hồ sơ duy trì (luồng C, SV đang `ACTIVE` của lớp) và hồ sơ bổ sung (luồng A/B). Không còn khái niệm `kind`. Nhãn hiển thị: “Xét tuyển đầu vào” nếu `isFirstRound`, ngược lại “Duy trì & xét tuyển bổ sung – năm N” | MP 5.8 “hai nhóm cùng lúc”, G-06 |
| D-06 | Đồng hạng | Sau xét hòa vẫn bằng nhau tại ranh giới chỉ tiêu ⇒ danh sách có `tieGroup` + cảnh báo. **Cấp CNN** (cấp phê duyệt đầu tiên) phải chọn đủ số SV trong nhóm để lấp chỗ còn lại khi bấm “Xác nhận”; lựa chọn lưu vào bước phê duyệt (`tieResolution`), các cấp sau chỉ xem. Trả về ⇒ xóa lựa chọn | MP 5.3.3 (5) “đưa cả nhóm cho cấp phê duyệt quyết định”, BR-10 không vượt chỉ tiêu |
| D-07 | SV cũ vượt chỉ tiêu | `MAINTAIN_THEN_FILL`: nếu số SV cũ đạt BB > `quota` ⇒ chỉ giữ top `quota` SV cũ theo điểm (xét hòa như thường), còn lại `not_admitted`, gắn cảnh báo “SV cũ vượt chỉ tiêu” trên danh sách | BR-10 là ràng buộc cứng |
| D-08 | Trúng nhiều lớp (Q4) | Khi một ĐXT công bố, nếu một SV được chọn nhưng **đã có membership `ACTIVE` ở lớp khác trong cùng năm học** (do ĐXT khác công bố trước) ⇒ hồ sơ này thành `not_admitted` (ghi chú “Đã trúng tuyển lớp khác – BR-08”) và **suất được lấp bằng hồ sơ `approved` kế tiếp** trong thứ tự xếp hạng của chính phiên bản danh sách đã duyệt. Từ cấp CNN trở đi, danh sách hiển thị cảnh báo trước nếu phát hiện xung đột. Bỏ hẳn bước “SV xác nhận nhập học” | Q4 “nhường suất cho ứng viên kế tiếp trong danh sách chờ”; 5.7 tự động kích hoạt |
| D-09 | Mở lại quyết định | Trong `review`, GVPT/CNN được **“Mở lại để xét duyệt”** hồ sơ `approved`/`rejected` (bắt buộc lý do) ⇒ `pending`. Cần để sửa sau khi bị trả về (MP 5.6 “Sau khi chỉnh, GV phải chốt lại”) | Bổ sung tối thiểu cho vòng lặp trả về |
| D-10 | Ban hành bộ tiêu chí | “Ban hành” (DRAFT → PUBLISHED) được coi là thao tác **Update** theo C12: GVPT (chỉ bộ do mình tạo), CNN (bộ thuộc ngành mình), BLĐ khoa (mọi bộ trong khoa), Quản trị viên (toàn trường). Đặt trong hằng số `CRITERIA_PUBLISH_RULE` để đổi được | C12/Q13 ĐÃ CHỐT; MP §10 ghi BLĐ “ban hành” — coi là quyền BLĐ có, không phải độc quyền |
| D-11 | Sửa bộ đã ban hành | Không sửa trực tiếp bộ PUBLISHED. Nút “Tạo phiên bản mới” nhân bản thành DRAFT `version + 1` (cùng `rootId`). Xóa chỉ khi DRAFT và chưa ĐXT nào tham chiếu; ngược lại chỉ “Lưu trữ” (ARCHIVED — không chọn được cho ĐXT mới) | MP 5.3.3 (6), U8 |
| D-12 | Danh bạ email trường | Mock “hệ thống email IUH” bằng `db.schoolDirectory` (MSSV, email, họ tên, ngày sinh, lớp sinh hoạt, ngành). OTP **chỉ được “giao”** tới email có trong danh bạ và khớp MSSV. Phản hồi luôn chung chung: “Nếu thông tin hợp lệ, mã OTP đã được gửi tới email IUH của bạn” | U2 không lộ TK; C4 chống mạo danh |
| D-13 | Q11/Q14 chưa chốt | Tiếng Anh: tiêu chí dùng đơn vị “TOEIC”, `evidenceGuide` ghi “IELTS/khác quy đổi theo bảng của khoa”. Không làm hệ số cấp cuộc thi; khoa có thể mã hóa thành các mức riêng (VD “Nhất – cấp Quốc gia”) | MP §15 chỉ là đề xuất mặc định |
| D-14 | Mật khẩu demo | Mọi TK seed có MK `demo1234` (đạt chính sách ≥ 8 ký tự, có chữ và số). Lưu dạng `passwordHash = "plain:demo1234"` (mock, ghi rõ trong code là không an toàn) | 5.9 |
| D-15 | Phụ thuộc | **Không thêm dependency runtime**. Router: tự viết hash router nhỏ (`src/app/router.js`) vì deploy GitHub Pages và lockfile pnpm `--frozen-lockfile` trong CI. Test: `node:test` + `node:assert/strict`. Xuất Excel = CSV UTF-8 có BOM; PDF = trang in (`window.print`) | Giảm rủi ro CI/lockfile; MP 8.2 gợi ý React Router cho bản thật |
| D-16 | 7 file HTML | Giữ lại để link cũ không chết. `index.html` = ứng dụng chính. 6 file vai trò = **lối tắt demo**: `main.jsx` thấy `data-role ≠ public` ⇒ đăng nhập nhanh TK demo mặc định của vai trò đó rồi chuyển `#/app/dashboard`. Điều hướng nội bộ dùng hash, không chuyển file HTML nữa | Tương thích ngược + build hiện có |
| D-17 | U7 | Vì SV tự đặt MK khi đăng ký, “bắt buộc đổi MK lần đầu” áp dụng cho TK có `mustChangePassword = true`: TK GV do cán bộ tạo, TK được “Đặt lại MK mặc định”. Seed có 1 GV ở trạng thái này | 5.9, U7 |
| D-18 | Rút / sửa | SV sửa hồ sơ `pending` khi ĐXT `open` (giữ `pending`, ghi lịch sử “Chỉnh sửa hồ sơ”). Sau khi rút (`withdrawn`) SV được tạo hồ sơ mới trong cùng ĐXT nếu còn `open` | C14, BR-08 “1 hồ sơ hiệu lực” |
| D-19 | Hồ sơ cần xác minh đủ | Nút “Đạt” chỉ bật khi **mọi tiêu chí đã được xác minh** (VALID/INVALID) và kết quả chính thức đạt toàn bộ BB. “Không đạt” và “Yêu cầu bổ sung” không cần xác minh đủ nhưng bắt buộc ghi chú | 5.5, D-tối thiểu |
| D-20 | SV `isKSTN = true` | Chỉ được nộp hồ sơ luồng C vào ĐXT của **lớp mình**. Không được nộp vào lớp khác (ma trận 4.3: nộp mới/bổ sung chỉ cho `isKSTN=false`) | 4.3 |
| D-21 | Email gửi lỗi | Outbox mock: email tới địa chỉ chứa chuỗi `config.email.failPattern` (mặc định `"fail"`) sẽ `FAILED`; tự thử lại tối đa 3 lần khi `tick`; sau đó hiện ở danh sách gửi lỗi để Quản trị viên/PĐT “Gửi lại” | 5.7 (4) |
| D-22 | GVPT với lớp | Quyền “Quản lý lớp — L” của GVPT = xem lớp + thành viên, ghi nhận **SV tự rút khỏi lớp** (`WITHDRAWN`, có lý do), sửa mô tả lớp. Không đổi mã lớp/khóa/GVPT | 4.3, 5.1 |
| D-23 | Tra cứu công khai | Trang chủ có “Tra cứu kết quả”: nhập MSSV ⇒ OTP về email IUH (danh bạ) ⇒ xem trạng thái các hồ sơ của MSSV đó (chỉ đọc). Danh sách trúng tuyển công khai: MSSV che `21****01`, họ tên viết tắt `N. H. Nam` | 5.7 (5), Q7 |
| D-24 | Thông tin mở rộng SV | `studentProfile` chỉ có các trường ở MP §7.2. Không thêm thông tin ngoài (địa chỉ…) | MP 5.4 ghi chú |

---

## 4. Kiến trúc mục tiêu

### 4.1 Sơ đồ tầng

```
┌──────────────────────────────── Trình duyệt ────────────────────────────────┐
│  UI (React)  src/features/**, src/components/**, src/app/**                  │
│     │  chỉ gọi: useBackend().call(service, payload) + selectors              │
│     ▼                                                                        │
│  MockBackendProvider  src/mock/backend.jsx                                   │
│     │  giữ db (state), session; độ trễ giả 150–300 ms; bắt DomainError        │
│     ▼                                                                        │
│  Mock services  src/mock/services/*.js   (pure: (db, ctx, payload) → {db,result})
│     │  kiểm tra quyền, validate, gọi domain, ghi audit/notify/email          │
│     ▼                                                                        │
│  Domain  src/domain/*.js   (pure JS, không React, không window/localStorage) │
│                                                                              │
│  Persistence  src/mock/persistence.js → localStorage `iuh_talent_v3_db`,     │
│               `iuh_talent_v3_session`; file minh chứng → IndexedDB           │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Luật import (bắt buộc, kiểm bằng grep ở cổng P2):**
- `src/domain/**` không import gì ngoài `src/domain/**`.
- `src/mock/services/**` chỉ import `src/domain/**` và `src/mock/services/_kernel.js`.
- `src/features/**` **không** import `src/mock/services/*` trực tiếp để mutate state ngoài `call()`; được import selectors và hằng số domain.
- Mọi import tương đối phải có đuôi `.js`/`.jsx` (để `node --test` chạy được domain/services).

### 4.2 Cây thư mục đích

```
src/
  main.jsx                        # đọc data-role → đăng nhập nhanh demo (D-16)
  App.jsx                         # MockBackendProvider + Router + AppRoutes
  app/
    router.js                     # useHashRoute(), navigate(path), buildHref(path), parse params/query
    routes.jsx                    # bảng route public + workspace, guard theo đăng nhập/quyền
    menus.js                      # menu theo vai trò (đúng MP §10) + điều kiện hiển thị
    AuthGate.jsx                  # chặn route cần đăng nhập, buộc đổi MK
    WorkspaceLayout.jsx           # Sidebar + WorkspaceHeader (role switcher, chuông) + main
  domain/
    constants.js                  # enum, nhãn, tone, ROLE, SCOPE, VALUE_TYPE, OPERATOR...
    errors.js                     # DomainError, ERROR_CODES
    time.js                       # parse/format ICT, addDays, isBefore… (nhận `now` từ ngoài)
    identity.js                   # isIuhStudentEmail, extract MSSV, maskStudentCode, maskName, passwordPolicy
    scoring.js                    # scoreApplication(snapshot, items, {mode:'self'|'official'})
    ranking.js                    # buildAdmissionList(...)
    round-machine.js              # ROUND_TRANSITIONS, canTransition, editableFields(status)
    application-machine.js        # APP_TRANSITIONS, canTransition
    flows.js                      # classifyFlow(db, studentUserId, round)
    scope.js                      # resolveScopeChain(db, entityType, entity)
    permissions.js                # PERMISSION_MATRIX, can(), assertCan(), canAssignRole()
    scheduler.js                  # tick(db, now, config) → {db, events}
    publish.js                    # computePublishOutcome(db, round, list, now)
    selectors.js                  # view-model thuần: roundView, classView, applicationView...
    *.test.js                     # test node:test cạnh file
  mock/
    schema.js                     # SCHEMA_VERSION = 3, createEmptyDb()
    seed/
      index.js                    # buildSeedDb() ghép các phần
      catalog.js users.js directory.js criteria.js rounds.js applications.js lists.js
    persistence.js                # loadDb/saveDb/resetDb/loadSession/saveSession (try/catch)
    evidence-store.js             # (chuyển từ src/data/evidence.js) IndexedDB + kiểm magic bytes
    backend.jsx                   # MockBackendProvider, useBackend()
    services/
      _kernel.js                  # clone, nextId, audit(), notify(), queueEmail(), ctx helpers
      auth.js otp.js account.js me.js catalog.js users.js roles.js criteria.js
      rounds.js applications.js reviews.js lists.js publicPortal.js reports.js
      audit.js email.js system.js
      *.test.js
  components/                     # giữ nguyên + thêm mới (xem §10.2)
  features/
    public/        auth/          dashboard/     notifications/  profile/
    catalog/       programs/      classes/       lecturers/      students/
    permissions/   criteria/      rounds/        student-portal/ reviews/
    approvals/     records/       reports/       audit/          email-outbox/
    settings/      demo/
  styles/                         # KHÔNG đổi token
```

**Xóa ở giai đoạn dọn dẹp (P11):** `src/data/demo-store.jsx`, `src/data/admissions.js`, `src/data/fixtures.js`, `src/data.js`, `src/data/evidence.js` (đã chuyển), `src/features/public/PublicApplyModal.jsx`, `src/features/public/ApplicationLookupModal.jsx` (thay bằng trang mới), `src/features/approvals/RoundApprovalPanel.jsx` (thay bằng trang Phê duyệt danh sách). Cập nhật `src/dev/Gallery.jsx` để không import file đã xóa. `src/data/status-definitions.js` chuyển nội dung sang `src/domain/constants.js` (giữ `getStatusMeta` cho `StatusBadge`).

### 4.3 `MockBackendProvider` — hợp đồng

```js
// src/mock/backend.jsx
const BackendContext = createContext(null);

export function MockBackendProvider({ children, latencyMs = [150, 300] }) {
  // state: db (load từ persistence hoặc buildSeedDb), session ({userId, activeRoleId} | null)
  // effect: saveDb mỗi khi db đổi (try/catch → toast lỗi), đồng bộ đa tab qua sự kiện "storage"
  // effect: khi mount chạy system.tick để áp dụng chuyển trạng thái tự động theo clock
  // call(serviceFn, payload): Promise
  //   1. ctx = buildCtx(db, session)  → { now, config, actor: { user, roleAssignment } | null }
  //   2. const { db: next, result, effects } = serviceFn(db, ctx, payload)  // có thể throw DomainError
  //   3. setDb(next); nếu effects.session !== undefined → setSession(effects.session)
  //   4. resolve(result) sau độ trễ giả; reject(DomainError) nguyên vẹn
  // value: { db, session, me, activeRole, roles, call, can(permission, resource), now }
}
export const useBackend = () => useContext(BackendContext);
```

- `can(permission, resource)` ở UI chỉ để ẩn/hiện nút; service vẫn `assertCan`.
- Toast: giữ `ToastStack` hiện có; chuyển `showToast/hideToast` sang một `ToastProvider` nhỏ (`src/components/ui/ToastProvider.jsx`) để không phụ thuộc store cũ.
- Lỗi service: UI hiển thị `error.message` (tiếng Việt) bằng toast hoặc `Field error`. Lỗi `FORBIDDEN` hiển thị “Bạn không có quyền thực hiện thao tác này trong phạm vi hiện tại.”

### 4.4 Router (hash)

- `useHashRoute()` trả `{ path, segments, query }`, lắng nghe `hashchange`. `navigate("/app/rounds/DXT-2026-01")` đặt `location.hash`.
- Route public: `#/` · `#/dot/:roundId` · `#/ket-qua/:roundId` · `#/dang-nhap?returnTo=` · `#/dang-ky?returnTo=` · `#/quen-mat-khau` · `#/dat-lai-mat-khau?token=` · `#/tra-cuu`.
- Route workspace (cần đăng nhập): `#/app/:page` và `#/app/:page/:id` (bảng ở §9.2). Route không hợp lệ hoặc không có quyền ⇒ trang “Không tìm thấy / Không có quyền” (dùng `EmptyState`), không crash.
- Đổi trang: giữ hành vi hiện có của `App.jsx` (cuộn lên đầu, focus `[data-page-heading]`, `aria-live`).

---

## 5. Mô hình dữ liệu mock

> Bám MP §7.2, đổi sang camelCase. ID dạng chuỗi có tiền tố (`usr_`, `cls_`…) sinh bằng `nextId(db, prefix)` (bộ đếm trong `db.counters`). Thời gian là chuỗi ISO có offset `+07:00`.

### 5.1 Hằng số (src/domain/constants.js)

```js
export const ROLE = { ADMIN: "ADMIN", TRAINING: "TRAINING", DEAN: "DEAN", HEAD: "HEAD", LECTURER: "LECTURER", STUDENT: "STUDENT" };
export const ROLE_LABEL = { ADMIN: "Quản trị viên", TRAINING: "Đại diện phòng đào tạo", DEAN: "Ban lãnh đạo khoa", HEAD: "Chủ nhiệm ngành", LECTURER: "Giảng viên phụ trách", STUDENT: "Sinh viên" };
export const SCOPE = { SCHOOL: "SCHOOL", FACULTY: "FACULTY", MAJOR: "MAJOR", CLASS: "CLASS", SELF: "SELF" };
export const ROLE_SCOPE = { ADMIN: "SCHOOL", TRAINING: "SCHOOL", DEAN: "FACULTY", HEAD: "MAJOR", LECTURER: "CLASS", STUDENT: "SELF" };

export const ROUND_STATUS = ["draft", "upcoming", "open", "review", "approving", "published"]; // đúng 6 (C17)
export const ROUND_STATUSES = {
  draft:     { label: "Nháp", tone: "neutral" },
  upcoming:  { label: "Chưa mở", tone: "info" },
  open:      { label: "Đang tiếp nhận hồ sơ", tone: "success" },
  review:    { label: "Đang xét duyệt hồ sơ", tone: "warning" },
  approving: { label: "Chờ phê duyệt", tone: "info" },
  published: { label: "Đã công bố", tone: "success" }
};
export const APPROVAL_SUBSTATUS = {
  waiting_head:     { label: "Chờ Chủ nhiệm ngành xác nhận", level: "HEAD" },
  waiting_dean:     { label: "Chờ Ban lãnh đạo khoa phê duyệt", level: "DEAN" },
  waiting_training: { label: "Chờ Phòng Đào tạo phê duyệt & công bố", level: "TRAINING" }
};
export const APPLICATION_STATUSES = {        // MP 5.5
  draft:        { label: "Bản nháp", tone: "neutral" },
  pending:      { label: "Chờ duyệt", tone: "warning" },
  needs_update: { label: "Cần bổ sung", tone: "warning" },
  approved:     { label: "Đạt điều kiện", tone: "success" },
  rejected:     { label: "Không đạt", tone: "danger" },
  confirmed:    { label: "Trúng tuyển", tone: "success" },
  not_admitted: { label: "Không trúng tuyển", tone: "neutral" },
  withdrawn:    { label: "Đã rút", tone: "neutral" },
  cancelled:    { label: "Đã hủy", tone: "neutral" }
};
export const FLOW = { A: "A", B: "B", C: "C" };
export const FLOW_LABEL = { A: "Luồng A – Đăng ký mới", B: "Luồng B – Nộp bổ sung", C: "Luồng C – Duy trì" };
export const MEMBERSHIP_STATUS = { ACTIVE: "Đang học", DROPPED: "Không đạt duy trì", WITHDRAWN: "Tự rút", GRADUATED: "Tốt nghiệp" };
export const CLASS_STATUS = { NOT_OPEN: "Chưa mở", RECRUITING: "Đang tuyển sinh", ACTIVE: "Đang hoạt động", ENDED: "Đã kết thúc" };
export const CRITERIA_SET_STATUS = { DRAFT: "Nháp", PUBLISHED: "Đã ban hành", ARCHIVED: "Lưu trữ" };
export const CRITERION_KIND = { REQUIRED: "Bắt buộc", PRIORITY: "Ưu tiên" };
export const VALUE_TYPE = { NUMBER_THRESHOLD: "Ngưỡng số", COUNT: "Đếm minh chứng", ACCUMULATIVE_ENUM: "Tích lũy có quy đổi" };
export const OPERATOR = { GTE: "≥", GT: ">", EQ: "=", LTE: "≤", LT: "<", BETWEEN: "Trong khoảng" };
export const RANKING_MODE = { MAINTAIN_THEN_FILL: "Duy trì trước, bổ sung sau", OPEN_COMPETITION: "Cạnh tranh sòng phẳng" /* PROTECTED_RATIO: chưa làm */ };
export const VERIFY_STATUS = { UNVERIFIED: "Chưa xác minh", VALID: "Hợp lệ", INVALID: "Không hợp lệ" };
export const SEMESTERS = ["Học kỳ 1", "Học kỳ 2", "Học kỳ hè"];
```

### 5.2 Hình dạng `db` (src/mock/schema.js)

```js
{
  schemaVersion: 3,
  counters: { usr: 0, app: 0, ... },
  clock: { now: "2026-11-09T09:00:00+07:00" },
  config: {
    files: { maxMb: 10, allowedMime: ["application/pdf", "image/png", "image/jpeg"] },
    otp: { ttlMinutes: 10, maxPerStudent15m: 3, maxPerIpHour: 10, maxAttempts: 5, codeLength: 6 },
    login: { maxFailures: 5, lockMinutes: 15 },
    password: { minLength: 8 },
    resetLinkMinutes: 30,
    reminders: { draftHoursBefore: [48, 24], approvalHoldDays: 3 },
    email: { failPattern: "fail", maxAttempts: 3 },
    smtp: { host: "smtp.iuh.edu.vn", port: 587, username: "no-reply@iuh.edu.vn", fromName: "Cổng xét tuyển CN/KSTN" },
    templates: { /* key → { subject, body } có biến {{name}} {{code}} ... (§15.2) */ }
  },
  schoolDirectory: [ { studentCode, email, fullName, dob, homeClass, majorId } ],      // D-12
  faculties:   [ { id, code, name, status: "ACTIVE" } ],
  majors:      [ { id, facultyId, code, name } ],
  programs:    [ { id, majorId, type: "KSTN" | "CNTN", name, status: "ACTIVE" } ],      // “chuyên ngành CN/KSTN”
  classes:     [ { id, programId, code, cohort: "K20", startYear: 2024, lecturerId, description, endedAt: null } ],
  memberships: [ { id, classId, studentUserId, studyYear, status: "ACTIVE"|"DROPPED"|"WITHDRAWN"|"GRADUATED", sourceApplicationId, note, updatedAt } ],
  users: [ { id, kind: "STAFF"|"STUDENT", username, passwordHash, email, phone, fullName,
             status: "ACTIVE"|"LOCKED", mustChangePassword, failedLoginCount, lockedUntil, createdAt } ],
  userRoles: [ { id, userId, role, scopeType, scopeId /* null nếu SCHOOL/SELF */, validFrom, validTo /* null = vô hạn */, grantedBy, revokedAt: null } ],
  studentProfiles:  [ { userId, studentCode, dob, homeClass, majorId, isKSTN: false } ],
  lecturerProfiles: [ { userId, lecturerCode, facultyId, title: "ThS."|"TS."|"PGS.TS." } ],
  criteriaSets: [ {
    id, rootId, version, facultyId, majorId /* null = cấp khoa */, createdBy, name, description,
    status: "DRAFT"|"PUBLISHED"|"ARCHIVED", publishedBy, publishedAt, updatedAt,
    criteria: [ {
      id, name, kind: "REQUIRED"|"PRIORITY", valueType, unit, evidenceRequired: true, evidenceGuide,
      tieBreakOrder /* số nguyên hoặc null */, refCriterionId /* null */, sortOrder,
      countMode: "LEVEL"|"PER_ITEM" /* chỉ COUNT */, maxPoints /* null; ACCUMULATIVE_ENUM luôn null (C9) */,
      levels: [ { id, label, operator /* bỏ qua với ACCUMULATIVE_ENUM */, valueFrom, valueTo, points, sortOrder } ]
    } ]
  } ],
  rounds: [ {
    id, code: "DXT-2026-01", name, classId, semester, academicYear: "2026–2027", quota,
    criteriaSetId, criteriaSnapshot /* null đến khi open; sau đó là bản sao sâu của criteriaSet */,
    rankingMode, lecturerId, intakeStart, intakeEnd, reviewStart, reviewEnd, approvalDue /* null */,
    description, attachments: [ { fileKey, name, mime, size } ],
    status, approvalSubstatus /* null | waiting_head | waiting_dean | waiting_training */,
    createdBy, createdAt, releasedAt, openedAt, reviewStartedAt, publishedAt
  } ],
  applications: [ {
    id, code: "HS-2026-000123", roundId, studentUserId, studentCode, applicantName, dob, email, phone,
    homeClass, majorName, flow: "A"|"B"|"C", status, committed: false,
    items: [ {
      criterionId,
      declaredValue /* NUMBER_THRESHOLD */, declaredCount /* COUNT */,
      declaredEntries: [ { id, title, levelId, evidence: [EvidenceRef], verifyStatus, verifyNote } ] /* ACCUMULATIVE_ENUM */,
      evidence: [EvidenceRef] /* NUMBER/COUNT */,
      verifyStatus: "UNVERIFIED"|"VALID"|"INVALID", verifiedValue /* null = dùng declared */, verifyNote, verifiedBy, verifiedAt
    } ],
    selfScore, selfEligible, officialScore, officialEligible, rank,
    submittedAt, lastEditedAt, previousApplicationId, decisionNote, decidedBy, decidedAt,
    remindersSent: [], history: [ { at, actorId, actorName, actorRoleLabel, action, note } ]
  } ],
  reviewRequests: [ { id, applicationId, message, dueAt, createdBy, createdAt, resolvedAt } ],
  admissionLists: [ {
    id, roundId, version, createdBy, createdAt, status: "PENDING"|"RETURNED"|"PUBLISHED",
    payload: { quota, rankingMode, isFirstRound, retainedCount, slotsForNew, warnings: [string],
               rows: [ { applicationId, studentUserId, studentCode, name, flow, group: "RETAINED"|"NEW",
                         officialScore, tieKey: [..], rank, proposed: true|false, tieGroup: null|"T1", note } ] },
    tieResolution: null | { selectedApplicationIds: [], decidedBy, decidedAt }
  } ],
  approvalSteps: [ { id, listId, level: "HEAD"|"DEAN"|"TRAINING", decision: "APPROVED"|"RETURNED", comment, attachment /* EvidenceRef|null */, decidedBy, decidedAt } ],
  otpChallenges: [ { id, target /* email */, studentCode, purpose: "REGISTER"|"LOOKUP"|"CHANGE_EMAIL", codeHash, expiresAt, attempts, consumedAt, createdAt, ip: "127.0.0.1" } ],
  otpTokens:     [ { token, studentCode, email, purpose, expiresAt, usedAt } ],
  resetTokens:   [ { token, userId, expiresAt, usedAt } ],
  notifications: [ { id, userId, type, title, body, link /* hash path */, createdAt, readAt } ],
  emailOutbox:   [ { id, to, template, subject, body, status: "QUEUED"|"SENT"|"FAILED", attempts, lastError, createdAt, sentAt, relatedEntity } ],
  auditLogs:     [ { id, actorId /* null = Hệ thống */, actorName, actorRole, action, entity, entityId, before, after, reason, ip: "127.0.0.1", at } ]
}
// EvidenceRef = { fileKey /* key IndexedDB, null với file seed */, name, mime, size /* bytes */, sha256?: string, uploadedAt, sample?: true }
```

**Dữ liệu suy ra (không lưu, tính bằng selectors):**
- `round.studyYear` (D-02), `round.isFirstRound` (D-04), `round.class/program/major/faculty`.
- `class.status`: có `endedAt` ⇒ ENDED; có ĐXT `published` ⇒ ACTIVE; có ĐXT không-nháp chưa `published` và chưa từng `published` ⇒ RECRUITING; còn lại ⇒ NOT_OPEN.
- `class.size` = số membership `ACTIVE` ở `studyYear` lớn nhất của lớp.
- `student.isKSTN` là trường lưu (BR-03) nhưng phải nhất quán với membership; test bất biến ở §12.

---

## 6. Logic nghiệp vụ (domain) — đặc tả chính xác

### 6.1 Định danh (identity.js)

```js
// MSSV: đúng 8 chữ số (theo dữ liệu hiện có). Email: <local>@student.iuh.edu.vn, local chứa đúng chuỗi MSSV.
export function isIuhStudentEmail(studentCode, email) {
  if (!/^\d{8}$/.test(studentCode)) return false;
  const e = email.trim().toLowerCase();
  const m = e.match(/^([a-z0-9._+-]+)@student\.iuh\.edu\.vn$/);
  return Boolean(m && m[1].includes(studentCode));
}
export const maskStudentCode = (c) => c.length >= 4 ? `${c.slice(0, 2)}${"*".repeat(c.length - 4)}${c.slice(-2)}` : "****";
export const maskName = (full) => { const p = full.trim().split(/\s+/); return p.length < 2 ? full : `${p.slice(0, -1).map((w) => w[0].toUpperCase() + ".").join(" ")} ${p.at(-1)}`; };
// "Nguyễn Hoàng Nam" → "N. H. Nam"; "21094501" → "21****01"
export function checkPasswordPolicy(pw, minLength = 8) { /* ≥ minLength, có ít nhất 1 chữ cái và 1 chữ số → [] hoặc danh sách lỗi tiếng Việt */ }
```

### 6.2 Chấm điểm (scoring.js) — MP 5.3

```js
/**
 * scoreApplication(snapshot, items, mode)
 *  snapshot: criteriaSet (đã snapshot) ; items: application.items ; mode: "self" | "official"
 *  return { rows: [{criterionId, name, kind, valueType, value, matchedLevel, points, met, verifyStatus}],
 *           eligible, total, requiredTotal, priorityTotal, failedRequired: [criterionId] }
 */
```

Quy tắc từng tiêu chí (lấy `value`):
- `NUMBER_THRESHOLD`: `value = mode==="official" && item.verifiedValue != null ? item.verifiedValue : item.declaredValue`. Nếu `refCriterionId` ≠ null ⇒ lấy value của item tiêu chí được tham chiếu (UT TOEIC tham chiếu BB TOEIC, MP 5.3.3 ⚠️).
- `COUNT`: `value = official ? (verifiedValue ?? declaredCount) : declaredCount`.
- `ACCUMULATIVE_ENUM`: các entry hợp lệ = `self`: mọi entry có `levelId`; `official`: entry có `verifyStatus === "VALID"`. `points = Σ level.points` (không trần, không giới hạn số lượng — C9). `met = số entry hợp lệ ≥ 1`.

So khớp mức (`NUMBER_THRESHOLD`, `COUNT`): một level thỏa nếu
`GTE: v >= from` · `GT: v > from` · `EQ: v === from` · `LTE: v <= from` · `LT: v < from` · `BETWEEN: from <= v && v <= to`.
`matchedLevel` = level thỏa có `points` lớn nhất (“mức cao nhất mà số đó thỏa”). Không thỏa ⇒ `points = 0`, `met = false`. Giá trị rỗng/không phải số ⇒ không thỏa.
`COUNT` với `countMode = "PER_ITEM"`: `points = matchedLevel.points × value`.
Áp `maxPoints` nếu khác null (không áp cho `ACCUMULATIVE_ENUM`).

**Chế độ official:** item `verifyStatus === "INVALID"` ⇒ `met = false`, `points = 0` (với ACCUMULATIVE thì chỉ entry VALID được tính như trên). Item `UNVERIFIED` ở mode official ⇒ tính như declared nhưng `rows[i].verifyStatus = "UNVERIFIED"` để UI cảnh báo.

Tổng hợp: `eligible = mọi criterion kind REQUIRED có met`; `total = Σ points` (cả BB lẫn UT, MP 5.3.3 (3)); BB không đạt vẫn hiển thị tổng điểm nhưng `eligible = false` (BR-09).

**Test bắt buộc (dữ liệu MP 5.3.3 – Assessment Sample) — phải ra đúng 190:**

| Tiêu chí | Loại | valueType | Mức (operator → điểm) | Giá trị khai | Điểm |
|---|---|---|---|---|---|
| Số TC đạt | BB | NUMBER_THRESHOLD | ≥38 → 5 | 40 | 5 |
| Số TC không đạt | BB | NUMBER_THRESHOLD | =0 → 5 | 0 | 5 |
| GPA năm 2 | BB | NUMBER_THRESHOLD | ≥3.6 → 50; ≥3.4 → 40; ≥3.2 → 30 | 3.5 | 40 |
| Rèn luyện năm 2 | BB | NUMBER_THRESHOLD | >80 → 20 | 85 | 20 |
| Tiếng Anh | BB | NUMBER_THRESHOLD (unit TOEIC) | ≥450 → 20 | 600 | 20 |
| NCKH | BB | COUNT (LEVEL) | ≥1 → 20 | 1 | 20 |
| Tiếng Anh nâng cao | UT | NUMBER_THRESHOLD, `refCriterionId` = Tiếng Anh BB | ≥550 → 20 | (600) | 20 |
| Cuộc thi chuyên ngành | UT | ACCUMULATIVE_ENUM | Nhất 40, Nhì 30, Ba 20, KK 10 | Nhất + Ba | 60 |
| **Tổng** | | | | | **190**, `eligible = true` |

Và ví dụ MP 5.3.4: 4 giải Nhất + Ba + Ba + KK ⇒ 90 điểm. Biên toán tử: GPA 3.4 ⇒ 40 (≥ đúng ngưỡng); RL 80 ⇒ 0 và BB không đạt (> đúng ngưỡng); TC không đạt 1 ⇒ BB không đạt ⇒ `eligible = false` dù tổng cao.

### 6.3 Xét hòa & xếp hạng (ranking.js) — MP 5.3.3 (5), 5.8

```js
/**
 * buildAdmissionList({ round, snapshot, applications, isFirstRound, activeMemberIds, conflicts })
 *  applications: hồ sơ của ĐXT ở trạng thái "approved" (đã đạt BB chính thức)
 *  activeMemberIds: Set studentUserId đang ACTIVE ở lớp (năm trước) → nhóm RETAINED (chỉ khi !isFirstRound)
 *  return payload (đúng hình dạng §5.2 admissionLists.payload)
 */
```

1. `tieKey(app)` = `[officialScore, ...các tiêu chí có tieBreakOrder tăng dần → giá trị chính thức (NUMBER/COUNT: value; ACCUMULATIVE: points)]`. So sánh giảm dần từng phần tử.
2. `isFirstRound` hoặc `OPEN_COMPETITION`: mọi hồ sơ một nhóm, sắp theo `tieKey`, chọn top `quota`.
3. `MAINTAIN_THEN_FILL`: nhóm RETAINED = hồ sơ luồng C; nhóm NEW = A/B.
   - RETAINED: nếu `số lượng ≤ quota` ⇒ tất cả `proposed = true`; nếu vượt ⇒ top `quota` theo `tieKey`, thêm `warnings` (D-07).
   - `slotsForNew = max(0, quota − retainedProposed)`; NEW sắp theo `tieKey`, chọn top `slotsForNew`.
4. **Nhóm đồng hạng tại ranh giới:** nếu hồ sơ cuối được chọn và hồ sơ đầu bị loại (cùng nhóm cạnh tranh) có `tieKey` bằng nhau hoàn toàn ⇒ mọi hồ sơ có `tieKey` đó gắn `tieGroup = "T1"`, các hồ sơ đó `proposed = null` (chờ CNN chọn), `warnings.push("Có N hồ sơ đồng hạng tranh M suất cuối – cấp CNN cần quyết định")`.
5. `rank` = thứ tự trong nhóm sau sắp xếp (1-based); hiển thị hạng chung theo thứ tự RETAINED trước rồi NEW (với MAINTAIN_THEN_FILL).
6. `conflicts` (Set studentUserId đã ACTIVE ở lớp khác cùng năm học — D-08) ⇒ dòng gắn `note = "Đã trúng tuyển lớp khác"` và **vẫn xếp hạng**; việc thay thế xảy ra ở `publish.js`.

### 6.4 State machine ĐXT (round-machine.js) — MP 5.2

| Từ → Đến | Kích hoạt | Ai | Điều kiện | Tác dụng phụ |
|---|---|---|---|---|
| (tạo) → `draft` | `rounds.create` | ADMIN/DEAN/HEAD trong phạm vi lớp | lớp tồn tại, chưa `endedAt` | audit |
| `draft` → `upcoming` | `rounds.release` (“Phát hành”) | ADMIN/DEAN/HEAD | đủ trường bắt buộc 5.2; `criteriaSet` PUBLISHED cùng khoa; `intakeStart < intakeEnd ≤ reviewStart < reviewEnd`; `intakeStart > now`; D-03 | công khai trang chủ; audit |
| `upcoming` → `open` | scheduler (`now ≥ intakeStart`) hoặc thủ công | Hệ thống / ADMIN, DEAN (thủ công, bắt buộc lý do) | — | **snapshot** bộ tiêu chí (BR-06); thông báo + email SV `ACTIVE` của lớp “ĐXT đã mở” (nếu !isFirstRound); audit |
| `open` → `review` | scheduler (`now ≥ intakeEnd`) hoặc thủ công đóng sớm | Hệ thống / ADMIN, DEAN | — | hồ sơ `draft` ⇒ `cancelled`; thông báo GVPT + CNN “Có N hồ sơ cần duyệt”; audit |
| `review` → `approving` (`waiting_head`) | `lists.closeReview` (“Chốt & gửi phê duyệt”) | LECTURER (lớp) / HEAD (ngành) | không còn `pending`/`needs_update`; ĐXT ở `review` | tạo `AdmissionList v(n+1)` PENDING; thông báo CNN; audit |
| `approving` (`waiting_head`) → `waiting_dean` | `lists.approve` level HEAD | HEAD (ngành) | đúng phiên bản; nếu có `tieGroup` phải gửi `tieResolution` hợp lệ | ApprovalStep; thông báo BLĐ khoa |
| `waiting_dean` → `waiting_training` | `lists.approve` level DEAN | DEAN (khoa) | đúng phiên bản | ApprovalStep; thông báo PĐT |
| `waiting_training` → `published` | `lists.publish` | TRAINING | đúng phiên bản | xem §6.7 |
| `approving` (mọi bước) → `review` | `lists.return` | cấp đang giữ | lý do bắt buộc | list RETURNED; substatus null; thông báo GVPT + CNN (+ các cấp đã duyệt); BR-12 |

**Bị cấm (test phải chứng minh ném `INVALID_STATE`):** `draft→open`, `draft→review`, `upcoming→review`, `open→approving`, `open→published`, `review→published`, `review→open`, `approving→open`, `published→*`, publish khi substatus ≠ `waiting_training`, approve HEAD khi substatus ≠ `waiting_head`, approve DEAN khi ≠ `waiting_dean`.

**Trường được sửa theo trạng thái (`editableFields(status, role)`):**

| Trạng thái | ADMIN / DEAN / HEAD | LECTURER (lớp mình) |
|---|---|---|
| `draft` | mọi trường | không (không tạo/không sửa nháp) |
| `upcoming` | `name, quota, criteriaSetId, rankingMode, lecturerId, intakeStart, intakeEnd, reviewStart, reviewEnd, approvalDue, description, attachments` | `intakeStart, intakeEnd, reviewStart, reviewEnd, approvalDue` |
| `open` | `intakeEnd` (gia hạn, phải > now), `reviewStart, reviewEnd, approvalDue, description, quota` | `intakeEnd, reviewStart, reviewEnd, approvalDue` |
| `review` | `reviewEnd, approvalDue, quota` | `reviewEnd, approvalDue` |
| `approving`, `published` | không (BR-13 với published) | không |

Xóa ĐXT: chỉ `draft`, hoặc `upcoming` chưa có hồ sơ nào. Mọi chỉnh sửa ghi audit với before/after.

### 6.5 State machine hồ sơ (application-machine.js) — MP 5.5

| Từ → Đến | Ai | Điều kiện |
|---|---|---|
| (tạo) → `draft` | SV | ĐXT `open`; quyền theo luồng (§6.6); không có hồ sơ hiệu lực (`draft/pending/needs_update/approved`) khác trong ĐXT |
| `draft` → `draft` (lưu) | SV | ĐXT `open` |
| `draft` → `pending` (nộp) | SV | ĐXT `open`; đủ giá trị mọi tiêu chí (trừ tiêu chí có `refCriterionId`); đủ minh chứng cho tiêu chí `evidenceRequired`; `committed = true` |
| `draft` → `cancelled` | SV (xóa nháp) / Hệ thống khi `open→review` | — |
| `pending` → `pending` (sửa) | SV | ĐXT `open` (D-18) |
| `pending` → `withdrawn` | SV | ĐXT `open` |
| `pending` → `needs_update` | LECTURER/HEAD trong phạm vi | ĐXT `review`; `message` bắt buộc; `now < dueAt ≤ reviewEnd` |
| `needs_update` → `pending` | SV | ĐXT `review`; `now ≤ dueAt`; đã sửa minh chứng/giá trị; các item SV sửa reset `verifyStatus = UNVERIFIED` |
| `needs_update` → `rejected` | Hệ thống (scheduler) | `now > dueAt`; `decisionNote = "Quá hạn bổ sung hồ sơ"` |
| `pending` → `approved` | LECTURER/HEAD | ĐXT `review`; D-19 |
| `pending` → `rejected` | LECTURER/HEAD | ĐXT `review`; lý do bắt buộc |
| `approved`/`rejected` → `pending` (mở lại) | LECTURER/HEAD | ĐXT `review`; lý do bắt buộc (D-09) |
| `approved` → `confirmed` / `not_admitted` | Hệ thống khi publish | §6.7 |

Mỗi chuyển đổi: push `history` + audit + thông báo phù hợp (bảng §7.3).

### 6.6 Phân luồng A/B/C (flows.js) — MP 5.4, C7, C8

```js
export function classifyFlow(db, studentUserId, round) {
  const profile = studentProfile(db, studentUserId);
  const memberOfRoundClass = activeMembership(db, studentUserId, round.classId); // ACTIVE ở studyYear trước
  if (profile.isKSTN) {
    if (memberOfRoundClass && !isFirstRound(db, round)) return { flow: "C", allowed: true };
    return { flow: null, allowed: false, reason: "Sinh viên đang học lớp CN/KSTN chỉ cập nhật hồ sơ tích lũy cho lớp của mình." }; // D-20
  }
  const hasHistory = db.applications.some(a => a.studentUserId === studentUserId && a.status !== "draft" && a.status !== "cancelled")
                  || db.memberships.some(m => m.studentUserId === studentUserId);
  return { flow: hasHistory ? "B" : "A", allowed: true };
}
```

- Luồng B: form **kế thừa** họ tên/SĐT/lớp sinh hoạt/ngành từ TK và giá trị tiêu chí trùng tên từ hồ sơ gần nhất (`previousApplicationId`) — SV vẫn phải tải minh chứng mới nếu bộ tiêu chí yêu cầu.
- Luồng C: kế thừa như B, `previousApplicationId` = hồ sơ của năm trước trong cùng lớp; trang “Hồ sơ của tôi” hiển thị dòng thời gian các năm (MP 5.8 cuối).

### 6.7 Công bố (publish.js) — MP 5.7, D-08

`computePublishOutcome(db, round, list, now)` (pure) trả về danh sách thay đổi; service `lists.publish` áp dụng **tất cả trong một lần setDb** (mô phỏng transaction: nếu bất kỳ bước nào throw thì không đổi gì).

1. Xác định tập được chọn: `rows.proposed === true` + các `applicationId` trong `tieResolution`.
2. Với mỗi hồ sơ được chọn mà SV đã `ACTIVE` ở lớp khác cùng `academicYear` ⇒ chuyển sang loại, lấy hồ sơ `approved` kế tiếp (cùng nhóm cạnh tranh, theo thứ tự `rank`) chưa được chọn để thay. Ghi `note` cho cả hai.
3. ĐXT `published`, `approvalSubstatus = null`, `publishedAt = now`; list `PUBLISHED`.
4. Hồ sơ được chọn ⇒ `confirmed`; hồ sơ `approved` còn lại ⇒ `not_admitted`; `rejected/withdrawn/cancelled` giữ nguyên.
5. `confirmed` ⇒ `studentProfile.isKSTN = true`; upsert membership `(classId, studentUserId, studyYear)` = `ACTIVE`, `sourceApplicationId`.
6. Luồng C: SV `ACTIVE` ở `studyYear − 1` của lớp mà **không có hồ sơ** `confirmed` (không nộp / rút / hủy / không đạt / không trúng) ⇒ membership `studyYear` = `DROPPED`; `isKSTN = false` nếu SV không còn membership `ACTIVE` nào khác (Q2 mặc định, U9).
7. Email (outbox) cho mọi người nộp hồ sơ không-nháp + SV bị DROPPED, template `RESULT_*`; thông báo in-app; thông báo cho GVPT/CNN/BLĐ “ĐXT đã công bố”.
8. Audit `ROUND_PUBLISHED` (after chứa thống kê) và audit từng thay đổi `isKSTN`/membership.
9. Sau công bố: ĐXT bất biến. Mọi service sửa ĐXT/hồ sơ của ĐXT `published` ném `INVALID_STATE` với thông điệp “ĐXT đã công bố là bất biến. Sai sót cần xử lý bằng quyết định điều chỉnh (chưa hỗ trợ trong bản prototype).” (BR-13).

### 6.8 Phân quyền (permissions.js, scope.js) — MP 4.2, 4.3

`resolveScopeChain(db, type, entityOrId)` trả `{ facultyId, majorId, classId, studentUserId }`:
round → class → program → major → faculty; application → round …; membership → class …; criteriaSet → `{facultyId, majorId}`; user (GV) → lecturerProfile.facultyId; user (SV) → studentProfile.majorId → faculty + các classId SV có membership.

`roleCovers(assignment, chain)`:
- `SCHOOL` ⇒ luôn đúng · `FACULTY` ⇒ `chain.facultyId === scopeId` · `MAJOR` ⇒ `chain.majorId === scopeId` · `CLASS` ⇒ `chain.classId === scopeId` (hoặc `chain.classIds` chứa) · `SELF` ⇒ `chain.studentUserId === userId`.
- Vai trò chỉ hiệu lực khi `validFrom ≤ now ≤ (validTo ?? ∞)` và `revokedAt == null`.

`can(ctx, permission, resource)` dùng **vai trò đang hoạt động** của phiên (MP 4.2 “mỗi phiên dùng một vai trò”).

```js
// "*" = trong phạm vi vai trò; "OWNER" = chỉ bản ghi do mình tạo; "VIEW" chỉ dùng cho quyền .view
export const PERMISSION_MATRIX = {
  "catalog.manage":          { ADMIN: "*" },                                                   // Khoa/Ngành
  "catalog.view":            { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "program.manage":          { ADMIN: "*", TRAINING: "*", DEAN: "*" },                         // Chuyên ngành CN/KSTN
  "program.view":            { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "class.manage":            { ADMIN: "*", DEAN: "*", HEAD: "*" },                             // tạo/sửa/xóa/kết thúc lớp
  "class.updateOwn":         { LECTURER: "*" },                                                // D-22
  "class.view":              { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "lecturer.manage":         { ADMIN: "*", DEAN: "*", HEAD: "*" },                             // tạo/sửa/khóa
  "lecturer.view":           { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "lecturer.resetPassword":  { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "role.assign":             { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },              // + canAssignRole (BR-14)
  "student.manage":          { ADMIN: "*" },                                                   // khóa/mở khóa
  "student.view":            { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "student.resetPassword":   { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*", LECTURER: "*" }, // C11: LECTURER = lớp
  "criteria.view":           { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "FACULTY", LECTURER: "FACULTY" }, // dùng chung khoa
  "criteria.create":         { ADMIN: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "criteria.update":         { ADMIN: "*", DEAN: "*", HEAD: "*", LECTURER: "OWNER" },          // C12; publish/archive/delete dùng chung quyền này (D-10)
  "round.manage":            { ADMIN: "*", DEAN: "*", HEAD: "*" },
  "round.editTimeline":      { ADMIN: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "round.transitionManual":  { ADMIN: "*", DEAN: "*" },
  "round.view":              { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "application.submit":      { STUDENT: "*" },                                                 // + classifyFlow
  "application.view":        { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*", LECTURER: "*", STUDENT: "*" },
  "application.review":      { HEAD: "*", LECTURER: "*" },
  "list.close":              { HEAD: "*", LECTURER: "*" },
  "list.approve.HEAD":       { HEAD: "*" },
  "list.approve.DEAN":       { DEAN: "*" },
  "list.publish":            { TRAINING: "*" },
  "report.view":             { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "audit.view":              { ADMIN: "*", TRAINING: "*" },
  "config.manage":           { ADMIN: "*" },
  "email.view":              { ADMIN: "*" },
  "email.resend":            { ADMIN: "*", TRAINING: "*" }
};
```

- `"FACULTY"` cho HEAD/LECTURER ở `criteria.view` nghĩa là nới phạm vi ra **khoa chứa** ngành/lớp của họ (C12 “dùng công khai trong phạm vi Khoa”). Khi chọn bộ tiêu chí cho ĐXT cũng dùng quy tắc này (chỉ bộ PUBLISHED).
- `criteria.update` với HEAD: bộ có `majorId === scope major` **hoặc** bộ do GVPT trong ngành tạo; không được sửa bộ cấp khoa (`majorId = null`) — chỉ DEAN/ADMIN.
- `canAssignRole(ctx, targetRole, targetScope)` (BR-14): ADMIN gán mọi vai trò; TRAINING gán mọi vai trò trừ ADMIN; DEAN gán DEAN/HEAD/LECTURER có phạm vi nằm trong khoa mình; HEAD gán HEAD/LECTURER trong ngành mình; LECTURER không gán. Thu hồi theo cùng luật.
- `assertCan` ném `DomainError("FORBIDDEN", ...)` — tương đương 403 (U10).

### 6.9 Scheduler (scheduler.js) — MP 5.2, 5.4, 5.5, 5.6

`tick(db, now, config)` chạy theo thứ tự, idempotent (chạy nhiều lần cùng `now` không sinh thêm sự kiện):
1. `upcoming` có `now ≥ intakeStart` ⇒ `open` (+ snapshot, thông báo).
2. `open`: với mỗi mốc `h ∈ draftHoursBefore`, nếu `now ≥ intakeEnd − h giờ` và hồ sơ `draft` chưa có `remindersSent` chứa `h` ⇒ email + thông báo nhắc nộp; với SV `ACTIVE` của lớp (luồng C) chưa có hồ sơ `pending` ⇒ thông báo “ĐXT sắp đóng” (một lần, mốc 48h).
3. `open` có `now ≥ intakeEnd` ⇒ `review`; drafts ⇒ `cancelled`.
4. `needs_update` có `now > dueAt` ⇒ `rejected` (actor Hệ thống).
5. `approving`: nếu cấp đang giữ danh sách quá `approvalHoldDays` ngày kể từ bước trước (hoặc từ lúc chốt) ⇒ thông báo + email nhắc việc (tối đa 1 lần/ngày/danh sách).
6. Outbox: `QUEUED` ⇒ `SENT` (hoặc `FAILED` nếu `to` chứa `failPattern`, `attempts++`, `lastError = "SMTP 550: Mailbox unavailable (mô phỏng)"`); `FAILED` với `attempts < maxAttempts` thử lại.
7. Mọi thay đổi ghi audit actor `null` (“Hệ thống”).

`tick` được gọi: khi provider mount, sau `system.setClock`, và sau mỗi service mutate (cuối `call`).

---

## 7. Mock services (thay cho API ở MP §9)

### 7.1 Khung (`_kernel.js`)

```js
export function defineService(name, { permission, resolve, handler }) { /* trả fn(db, ctx, payload) */ }
// handler nhận draft = structuredClone(db), ctx, payload; phải return { result, effects? }
// helpers:
export const audit = (draft, ctx, { action, entity, entityId, before, after, reason }) => {};
export const notify = (draft, ctx, userIds, { type, title, body, link }) => {};
export const queueEmail = (draft, ctx, { to, template, vars, relatedEntity }) => {};   // render template từ config
export const nextId = (draft, prefix) => `${prefix}_${++draft.counters[prefix]}`;
export const fail = (code, message, details) => { throw new DomainError(code, message, details); };
```

Mã lỗi (`errors.js`): `FORBIDDEN, NOT_FOUND, VALIDATION, CONFLICT, INVALID_STATE, RATE_LIMITED, OTP_INVALID, OTP_EXPIRED, AUTH_INVALID, ACCOUNT_LOCKED, PASSWORD_POLICY`. Mỗi lỗi có `message` tiếng Việt hiển thị được và `details` (VD `{ field: "intakeEnd" }`) để gắn lỗi vào `Field`.

### 7.2 Danh sách service (ánh xạ MP §9)

| Service | Payload chính | Quyền / điều kiện | Tác dụng | MP |
|---|---|---|---|---|
| `auth.login` | `{username, password}` | công khai | username = MSSV / mã GV / email; sai ⇒ `failedLoginCount++`, ≥5 ⇒ `lockedUntil = now + 15′` (`ACCOUNT_LOCKED`); đúng ⇒ session `{userId, activeRoleId}` (vai trò đầu tiên còn hiệu lực), reset đếm; audit `LOGIN` | 5.9 |
| `auth.logout` | — | đăng nhập | xóa session | |
| `auth.switchRole` | `{roleId}` | role thuộc user, còn hiệu lực | đổi `activeRoleId` | 4.2 |
| `auth.forgotPassword` | `{username}` | công khai | luôn trả thông điệp chung; nếu TK tồn tại ⇒ `resetTokens` (30′) + email `PASSWORD_RESET_LINK` chứa `#/dat-lai-mat-khau?token=` | 5.9 |
| `auth.resetPassword` | `{token, newPassword}` | token hợp lệ chưa dùng | đặt MK, `mustChangePassword=false` | 5.9 |
| `auth.changePassword` | `{oldPassword, newPassword}` | đăng nhập | kiểm tra MK cũ + chính sách; audit | 5.9 |
| `otp.request` | `{studentCode, email, purpose}` | công khai | kiểm `isIuhStudentEmail`; rate-limit 3/15′/MSSV, 10/giờ/IP; nếu cặp có trong `schoolDirectory` ⇒ tạo challenge (10′) + email OTP; **luôn** trả `{ message: "Nếu thông tin hợp lệ, mã OTP đã được gửi…" , challengeId }` (challengeId giả nếu không giao) | 5.4, D-12 |
| `otp.verify` | `{challengeId, code}` | công khai | sai ⇒ `attempts++` (`OTP_INVALID`), quá 5 hoặc hết hạn ⇒ `OTP_EXPIRED`; đúng ⇒ `otpTokens` (15′) | 5.4 |
| `account.registerStudent` | `{otpToken, password, phone}` | token `REGISTER` | nếu MSSV đã có TK ⇒ `CONFLICT` “MSSV đã có tài khoản – vui lòng đăng nhập hoặc khôi phục mật khẩu” (an toàn vì đã qua OTP — U2/U3); tạo `user` STUDENT + `studentProfile` (`isKSTN=false`, thông tin lấy từ danh bạ) + `userRole` STUDENT/SELF; tự đăng nhập | C3, C4 |
| `me.get` / `me.update` | `{phone}` hoặc `{newEmail, otpToken}` | đăng nhập | SV đổi email phải qua OTP `CHANGE_EMAIL` và vẫn phải là email IUH chứa MSSV | 5.9 |
| `me.notifications.list/markRead/markAllRead` | | đăng nhập | | 5.10 |
| `catalog.faculty.*`, `catalog.major.*` | CRUD | `catalog.manage` | không xóa cha khi còn con (`NGHIEP-VU.md`) | |
| `programs.create/update/delete` | `{majorId, type, name}` | `program.manage` | trùng (major + name) ⇒ `CONFLICT` (UI hiện modal “đã có chuyên ngành giống hệt”); xóa khi còn lớp ⇒ `CONFLICT` | `NGHIEP-VU.md` |
| `classes.create/update/delete/end` | `{programId, cohort, startYear, lecturerId, description}` | `class.manage` | mã lớp tự sinh `KSTN-<MÃ NGÀNH>-K<n>`; 1 ngành + 1 khóa tối đa 1 lớp (MP §2); xóa khi còn ĐXT ⇒ chặn | 5.1 |
| `classes.withdrawMember` | `{membershipId, reason}` | `class.manage` hoặc `class.updateOwn` | membership ⇒ `WITHDRAWN`, cập nhật `isKSTN` | D-22 |
| `lecturers.create/update/lock/unlock` | | `lecturer.manage` | tạo ⇒ MK tạm ngẫu nhiên + `mustChangePassword` + email; **không xóa** | 5.9 |
| `users.resetPassword` | `{userId}` | `lecturer.resetPassword` / `student.resetPassword` theo loại TK, đúng phạm vi | MK tạm 10 ký tự, `mustChangePassword=true`, email `PASSWORD_TEMP`, thông báo; audit | 5.9, C11 |
| `students.lock/unlock` | | `student.manage` | | |
| `roles.assign/revoke` | `{userId, role, scopeType, scopeId, validFrom, validTo}` | `role.assign` + `canAssignRole` | chặn gán vượt phạm vi (`FORBIDDEN` có thông điệp rõ) | BR-14 |
| `criteria.create/update/delete/publish/archive/newVersion` | | §6.8 | D-10, D-11; publish kiểm tra: ≥1 tiêu chí; mỗi tiêu chí NUMBER/COUNT có ≥1 mức; ACCUMULATIVE có ≥1 mức; `refCriterionId` trỏ tới tiêu chí NUMBER_THRESHOLD cùng bộ; `tieBreakOrder` không trùng | 5.3 |
| `criteria.previewScore` | `{setId, items}` | `criteria.view` | trả kết quả `scoreApplication` | MP §9 |
| `rounds.create/update/delete/release/transition` | | §6.4 | | 5.2 |
| `applications.createDraft/saveDraft/submit/update/withdraw/deleteDraft/resubmit` | | SV chính chủ + §6.5, §6.6 | `submit` ⇒ email `APPLICATION_SUBMITTED` có **mã hồ sơ** (U1) | 5.4 |
| `files.upload` (trong `evidence-store.js`, không phải service thuần) | `File` | — | kiểm MIME khai báo + **magic bytes** (`%PDF`, `89 50 4E 47`, `FF D8 FF`), ≤ `config.files.maxMb`; lưu IndexedDB, trả `EvidenceRef` | BR-16, NFR |
| `reviews.verifyItem` | `{applicationId, criterionId, entryId?, verifyStatus, verifiedValue?, note?}` | `application.review` + ĐXT `review` + hồ sơ `pending` | sửa giá trị ⇒ `note` bắt buộc (5.3.3 (4)); tính lại `officialScore/officialEligible`; audit `SCORE_CHANGED` before/after | 5.5 |
| `reviews.decide` | `{applicationId, decision: "APPROVED"|"REJECTED"|"NEEDS_UPDATE", note, dueAt?}` | như trên | §6.5; NEEDS_UPDATE ⇒ `reviewRequests` + thông báo + email SV | 5.5 |
| `reviews.reopen` | `{applicationId, reason}` | như trên, hồ sơ `approved/rejected` | D-09 | |
| `lists.closeReview` | `{roundId}` | `list.close` | §6.3 + §6.4 | 5.5 |
| `lists.approve` | `{listId, level, comment, attachment?, tieResolution?}` | `list.approve.<level>` + đúng substatus + `listId` là phiên bản mới nhất PENDING | §6.4 | 5.6 |
| `lists.return` | `{listId, level, reason, attachment?}` | cấp đang giữ | §6.4 | 5.6 |
| `lists.publish` | `{listId, comment}` | `list.publish` | §6.7 | 5.7 |
| `public.listRounds` / `public.getRound` | | công khai | ĐXT ≠ `draft` | |
| `public.results` | `{roundId}` | công khai, ĐXT `published` | chỉ dòng `confirmed`, MSSV + tên che (D-23) | Q7 |
| `public.lookup` | `{otpToken}` (purpose `LOOKUP`) | công khai | trả danh sách hồ sơ của MSSV (chỉ đọc: ĐXT, trạng thái, điểm chính thức nếu đã công bố) | Q7 |
| `reports.roundSummary` / `reports.exportRoundCsv` | `{roundId}` | `report.view` theo phạm vi | đếm theo trạng thái/luồng, phổ điểm (bin 20), danh sách trúng tuyển; CSV UTF-8 BOM | C15 |
| `audit.list` | `{entity?, entityId?, actorId?, action?, from?, to?}` | `audit.view` | chỉ đọc, không có sửa/xóa | BR-15 |
| `email.list` / `email.resend` | | `email.view` / `email.resend` | resend ⇒ `QUEUED`, `attempts = 0` | 5.7 (4) |
| `system.getConfig/updateConfig` | | `config.manage` | audit `CONFIG_CHANGED` | C13 |
| `system.setClock` / `system.resetDemo` / `system.demoLogin` | | **chỉ Bảng Demo** | đặt giờ ⇒ tick; reset ⇒ seed mới + xóa IndexedDB minh chứng; demoLogin bỏ qua MK | prototype |

### 7.3 Sự kiện thông báo & email (MP 5.10)

| Sự kiện | Người nhận in-app | Email (template) |
|---|---|---|
| ĐXT mở (không phải ĐXT đầu tiên) | SV `ACTIVE` của lớp | `ROUND_OPENED` |
| ĐXT sắp đóng (48h) | SV `ACTIVE` chưa nộp; SV có nháp | `ROUND_CLOSING`, `DRAFT_REMINDER` |
| Nộp hồ sơ thành công | SV | `APPLICATION_SUBMITTED` (mã hồ sơ) |
| ĐXT chuyển `review` | GVPT lớp + CNN ngành | — |
| Yêu cầu bổ sung | SV | `NEEDS_UPDATE` (nội dung + hạn) |
| SV đã bổ sung | GV đã gửi yêu cầu | — |
| Hồ sơ quá hạn bổ sung ⇒ không đạt | SV | `NEEDS_UPDATE_EXPIRED` |
| Danh sách chờ mình (mỗi cấp) | CNN / BLĐ khoa / PĐT trong phạm vi | `LIST_WAITING` |
| Danh sách bị trả về | GVPT, CNN, các cấp đã duyệt | `LIST_RETURNED` |
| Nhắc việc giữ danh sách quá N ngày | cấp đang giữ | `LIST_REMINDER` |
| Công bố | mọi SV có hồ sơ; GVPT, CNN, BLĐ | `RESULT_CONFIRMED` / `RESULT_NOT_ADMITTED` / `RESULT_REJECTED` / `RESULT_DROPPED` |
| MK bị đặt lại | chủ TK | `PASSWORD_TEMP` |
| OTP | — | `OTP_REGISTER`, `OTP_LOOKUP`, `OTP_CHANGE_EMAIL` |

---

## 8. Dữ liệu mẫu (seed) & kịch bản trình diễn

> Mọi tên người, MSSV, điểm số là **minh họa** (PRODUCT.md: không biến dữ liệu demo thành sự thật). Đồng hồ seed: **09/11/2026 09:00 (GMT+7)**. Quy ước `startYear` của khóa: K20 = 2024, K21 = 2025, K22 = 2026 (D-02).

### 8.1 Tổ chức

- Khoa: **Khoa Công nghệ Thông tin (CNTT)**, **Khoa Quản trị Kinh doanh (QTKD)** + giữ danh mục các khoa/ngành khác từ `schoolMajorCatalog` hiện có (`src/data/fixtures.js`) để trang danh mục có đủ dữ liệu phân trang.
- Ngành (CNTT): Kỹ thuật phần mềm (KTPM), Hệ thống thông tin (HTTT), Khoa học dữ liệu (KHDL), Công nghệ thông tin, Khoa học máy tính, Trí tuệ nhân tạo. (QTKD): Marketing (MKT), Quản trị kinh doanh.
- Chuyên ngành CN/KSTN: KSTN-KTPM, KSTN-HTTT, KSTN-KHDL, CNTN-MKT.
- Lớp: `KSTN-KTPM-K20`, `KSTN-KTPM-K21`, `KSTN-KTPM-K22`, `KSTN-HTTT-K21`, `KSTN-KHDL-K22`, `CNTN-MKT-K20`, `CNTN-MKT-K22`.

### 8.2 Tài khoản (MK `demo1234`)

| Username | Họ tên | Vai trò (phạm vi) | Ghi chú demo |
|---|---|---|---|
| `quantri` | Quản trị viên hệ thống | ADMIN (SCHOOL) | |
| `GV900` / minhanh@iuh.edu.vn | Nguyễn Minh Anh | TRAINING (SCHOOL) | có danh sách R5 chờ công bố |
| `GV004` / lehoang@iuh.edu.vn | PGS.TS. Lê Hoàng | DEAN (Khoa CNTT) | có danh sách R4 chờ phê duyệt |
| `GV010` | TS. Võ Thanh Hà | DEAN (Khoa QTKD) | đã duyệt R5 |
| `GV005` / tnbinh@iuh.edu.vn | TS. Trần Ngọc Bình | HEAD (Ngành KTPM) **+** LECTURER (KSTN-KTPM-K22) | ví dụ đa vai trò MP 4.2; có danh sách R3 chờ xác nhận |
| `GV001` / ptdung@iuh.edu.vn | ThS. Phạm Thị Dung | LECTURER (KSTN-KTPM-K20) | duyệt R2 |
| `GV003` | ThS. Lê Minh Tâm | LECTURER (KSTN-KTPM-K21) | |
| `GV002` | TS. Nguyễn Văn Hải | HEAD (Ngành HTTT) | |
| `GV006` | ThS. Ngô Thu Trang | LECTURER (KSTN-HTTT-K21) | |
| `GV007` | TS. Hoàng Minh Châu | HEAD (Ngành MKT) | |
| `GV008` | ThS. Trần Mỹ Linh | LECTURER (CNTN-MKT-K20) | |
| `GV009` | ThS. Đặng Thu Hà | LECTURER (CNTN-MKT-K22), `mustChangePassword = true` | U7 |
| `21094501` | Nguyễn Hoàng Nam | STUDENT, `isKSTN=true`, ACTIVE K20 năm 1, 2 | luồng C; hồ sơ R2 = mẫu Assessment (190 điểm) |
| `21094518` | Trần Minh Khoa | STUDENT, `isKSTN=true`, K20 | hồ sơ R2 `pending` |
| `21094602` | Võ Gia Bảo | STUDENT, `isKSTN=true`, K20 | hồ sơ R2 `needs_update` (hạn 12/11/2026) |
| `21094777` | Lý Thanh Tú | STUDENT, `isKSTN=true`, K20 | **chưa nộp** hồ sơ R2 ⇒ U9 |
| `22073210` | Phạm Gia Hân | STUDENT, `isKSTN=false` | luồng B: `not_admitted` ở R8; nộp bổ sung R2 (`pending`) |
| `21094650` | Đặng Quốc Việt | STUDENT, `isKSTN=false`, membership K20 năm 2 = `DROPPED` | luồng B (từng bị loại) |
| `26010011` | Hồ Ngọc Mai | STUDENT, `isKSTN=false` | luồng A mới đăng ký, có **nháp** ở R1 |
| `26010022` | Trương Gia Huy | STUDENT, `isKSTN=false` | hồ sơ R1 `pending`; email chứa `fail` ⇒ minh họa email lỗi: `fail.26010022@student.iuh.edu.vn` |

`schoolDirectory` chứa mọi SV trên + **chưa đăng ký**: `26019999` – Phan Minh Khang – `khang.26019999@student.iuh.edu.vn` (dùng demo U1 đăng ký mới), `26018888` – Lâm Bảo Ngọc. Ghi các tài khoản này vào bảng “Đăng nhập nhanh” của Bảng Demo.

### 8.3 Bộ tiêu chí

| Mã | Tên | Phạm vi | Trạng thái | Nội dung |
|---|---|---|---|---|
| CS-1 | Xét tuyển đầu vào KSTN Khoa CNTT 2026 | Khoa CNTT (`majorId = null`), tạo bởi BLĐ | PUBLISHED v1 | GPA học kỳ gần nhất BB (≥3.2→30, ≥3.4→40, ≥3.6→50) · TOEIC BB ≥450→20 · TOEIC nâng cao UT ref ≥550→20 · Cuộc thi chuyên ngành UT ACCUMULATIVE (40/30/20/10). Xét hòa: GPA(1) → TOEIC(2) |
| CS-2 | Duy trì & bổ sung năm 3 – theo Assessment Sample | Ngành KTPM, tạo bởi CNN | PUBLISHED v1 | đúng 8 dòng bảng §6.2. Xét hòa: GPA(1) → Tiếng Anh(2) → Rèn luyện(3) (MP 5.3.3 (5)) |
| CS-3 | Duy trì năm 2 KTPM | Ngành KTPM | PUBLISHED v2 (v1 ARCHIVED, cùng `rootId`) | như CS-2 bỏ NCKH khỏi BB (theo MP C16: năm 2 Tiếng Anh ≥450 BB) |
| CS-4 | Bản nháp tiêu chí của ThS. Phạm Thị Dung | Ngành KTPM, tạo bởi GV001 | DRAFT | dùng để demo Owner CRUD (C12) |
| CS-5 | Xét tuyển CNTN Khoa QTKD | Khoa QTKD | PUBLISHED | GPA BB, Ngoại ngữ BB, Hoạt động ngoại khóa UT (COUNT, PER_ITEM 5đ/hoạt động, maxPoints 20) |

### 8.4 Đợt xét tuyển & hồ sơ

| ĐXT | Lớp | Năm học / HK | Năm ĐT | Trạng thái lúc seed | Mốc chính | Bộ TC / mode / quota | Hồ sơ & mục đích demo |
|---|---|---|---|---|---|---|---|
| R1 `DXT-2026-01` | KSTN-KTPM-K22 | 2026–2027 / HK1 | 1 (ĐXT đầu tiên) | `open` | nhận 01/11–30/11, duyệt 01/12–10/12 | CS-1 / — / 30 | Mai `draft`, Huy `pending`, 3 SV khác `pending`. Demo U1 (SV mới đăng ký và nộp) |
| R2 `DXT-2026-02` | KSTN-KTPM-K20 | 2026–2027 / HK1 | 3 | `review` | nhận 01/10–31/10, duyệt 01/11–20/11 | CS-2 / MAINTAIN_THEN_FILL / 4 | Nam `approved` (190), Khoa `pending`, Bảo `needs_update` (hạn 12/11 09:00), Hân B `pending`, Việt B `rejected`, Tú **không nộp**. Demo duyệt, U4, chốt, U9 |
| R3 `DXT-2026-03` | KSTN-KTPM-K21 | 2026–2027 / HK1 | 2 | `approving / waiting_head` | duyệt kết thúc 05/11 | CS-3 / MAINTAIN_THEN_FILL / 3 | list v1 PENDING, có **nhóm đồng hạng** 2 hồ sơ tranh 1 suất (D-06). Demo CNN xác nhận + chọn đồng hạng |
| R4 `DXT-2026-04` | KSTN-HTTT-K21 | 2026–2027 / HK1 | 2 | `approving / waiting_dean` | | CS-1 / OPEN_COMPETITION / 5 | list v1 RETURNED bởi BLĐ (“Cần rà soát minh chứng NCKH của 2 SV”), list v2 PENDING đã được CNN xác nhận. Demo U5 + lịch sử phiên bản |
| R5 `DXT-2026-05` | CNTN-MKT-K20 | 2026–2027 / HK1 | 3 | `approving / waiting_training` | | CS-5 / MAINTAIN_THEN_FILL / 3 | 1 SV cũ (Đỗ Minh Thư) + 2 SV mới approved + 1 SV cũ không nộp. Demo U6 công bố |
| R6 `DXT-2026-06` | CNTN-MKT-K22 | 2026–2027 / HK1 | 1 | `upcoming` | nhận 15/11–30/11 | CS-5 / — / 25 | Demo tự mở khi tua đồng hồ tới 15/11 |
| R7 `DXT-2026-07` | KSTN-KHDL-K22 | 2026–2027 / HK2 | 1 | `draft` | | CS-1 / — / 20 | Demo phát hành (validate mốc thời gian) |
| R8 `DXT-2025-01` | KSTN-KTPM-K21 | 2025–2026 / HK1 | 1 | `published` | | CS-1 / — / 3 | 3 `confirmed`, Hân `not_admitted`, 1 `rejected`. Trang kết quả công khai |
| R9 `DXT-2024-01` | KSTN-KTPM-K20 | 2024–2025 / HK1 | 1 | `published` | | CS-1 / — / 5 | lịch sử năm 1 của Nam, Khoa, Bảo, Tú, Việt |
| R10 `DXT-2025-02` | KSTN-KTPM-K20 | 2025–2026 / HK1 | 2 | `published` | | CS-3 v1 / MAINTAIN_THEN_FILL / 5 | lịch sử năm 2; Việt `rejected` ⇒ DROPPED |

- Hồ sơ của ĐXT đã `published`/`approving` phải có đủ `history`, `approvalSteps`, `admissionLists` khớp trạng thái (seed phải **tự nhất quán** — có test `seed.test.js`).
- Minh chứng seed: `EvidenceRef` có `sample: true`, `fileKey: null`. `EvidencePreview` với `sample` hiển thị **ảnh minh chứng mẫu** vẽ bằng `<canvas>` (khung giấy, tiêu đề “MINH CHỨNG MẪU – DỮ LIỆU DEMO”, tên file, MSSV) thay vì “Chưa có bản xem trực tiếp”.

### 8.5 Bảng Demo (src/features/demo/DemoPanel.jsx)

Nút nổi góc trái dưới “Bảng điều khiển demo” (icon `FlaskConical`), mở `Drawer` bên trái gồm 4 tab:
1. **Đồng hồ:** hiển thị giờ mô phỏng; `input type="datetime-local"`; nút “+1 giờ”, “+1 ngày”, “Đến mốc kế tiếp…” (dropdown ĐXT không-nháp → nhảy tới `intakeStart`/`intakeEnd`/`dueAt` gần nhất). Sau khi đặt: toast “Đã chạy tác vụ định kỳ: N thay đổi”.
2. **Hộp thư mô phỏng:** danh sách email outbox lọc theo người nhận; mở email xem nội dung (OTP in đậm, link đặt lại MK bấm được). Đây là cách người trình diễn lấy OTP.
3. **Đăng nhập nhanh:** bảng TK §8.2 (họ tên, vai trò, ghi chú) + nút “Đăng nhập”.
4. **Dữ liệu:** “Khôi phục dữ liệu mẫu” (ConfirmDialog) · “Xuất JSON db” · hiển thị `schemaVersion`.

Bảng Demo có dải cảnh báo nhỏ “Chỉ dùng cho bản prototype”. Mọi thao tác ở đây không cần quyền nhưng vẫn ghi audit actor “Demo”.

---

## 9. Đặc tả màn hình

### 9.1 Khung chung

**Header workspace (`WorkspaceHeader`, sửa):**
```
[☰] Breadcrumb: Vai trò › Trang hiện tại      [Vai trò: Chủ nhiệm ngành · Ngành KTPM ▾]  [🔔 3]  [Avatar Tên ▾]
```
- Bộ chọn vai trò chỉ hiện khi user có > 1 vai trò hiệu lực; đổi vai trò ⇒ `auth.switchRole`, về `#/app/dashboard`, toast “Đang làm việc với vai trò …”.
- Chuông: badge số chưa đọc; popover 5 thông báo mới nhất + “Xem tất cả” (`#/app/notifications`); bấm thông báo ⇒ đánh dấu đã đọc + điều hướng `link`.
- Menu tài khoản: Thông tin cá nhân · Đổi mật khẩu · Đăng xuất. **Bỏ** “chuyển vai trò nhanh giữa các file HTML” (chuyển sang Bảng Demo).
- Sidebar: giữ component, menu lấy từ `src/app/menus.js` theo vai trò đang hoạt động; nhãn phạm vi lấy từ assignment thật (VD “Phạm vi: Lớp KSTN-KTPM-K22”).

**Buộc đổi MK:** nếu `user.mustChangePassword` ⇒ mọi route `#/app/*` hiển thị màn hình “Đổi mật khẩu để tiếp tục” (không vào được trang khác).

### 9.2 Menu & route theo vai trò (bắt buộc đúng MP §10)

| Vai trò | Menu (thứ tự) → route `#/app/...` |
|---|---|
| SV KSTN (`isKSTN=true`) | Tổng quan `dashboard` · **Cập nhật hồ sơ tích lũy** `maintenance` (chỉ hiện khi ĐXT của lớp ở `open`, hoặc hồ sơ C đang `needs_update`) · Hồ sơ của tôi `my-applications` · Thông báo `notifications` · Thông tin cá nhân `profile` |
| SV ứng viên (`isKSTN=false`) | Tổng quan `dashboard` · Đợt xét tuyển đang mở `open-rounds` · Hồ sơ của tôi `my-applications` · Thông báo · Thông tin cá nhân |
| GVPT | Tổng quan lớp `dashboard` · Lớp của tôi `classes` · ĐXT của lớp `rounds` · **Duyệt hồ sơ** `reviews` · Bộ tiêu chí `criteria` · Đặt lại MK SV `student-passwords` · Báo cáo lớp `reports` · Thông báo |
| CNN | Tổng quan ngành · Lớp CN/KSTN `classes` · ĐXT `rounds` · Bộ tiêu chí `criteria` · Duyệt hồ sơ (ngành) `reviews` · **Xác nhận danh sách** `approvals` · TK & phân quyền GV ngành `lecturers` (tab Phân quyền) · Hồ sơ SV `records` · Báo cáo · Thông báo |
| BLĐ khoa | Tổng quan khoa · Chuyên ngành `programs` · Lớp `classes` · ĐXT `rounds` · Bộ tiêu chí `criteria` · **Phê duyệt danh sách** `approvals` · TK & phân quyền GV khoa `lecturers` · Hồ sơ SV `records` · Báo cáo · Thông báo |
| PĐT | Tổng quan toàn trường · Chuyên ngành `programs` · TK giảng viên `lecturers` · TK sinh viên `students` · Phân quyền `permissions` · Tra cứu ĐXT/lớp `rounds` (chỉ xem, có tab Lớp) · **Phê duyệt & Công bố** `approvals` · Báo cáo · Nhật ký `audit` · Thông báo |
| Quản trị viên | Danh mục Khoa/Ngành `catalog` · Chuyên ngành `programs` · TK giảng viên `lecturers` · TK sinh viên `students` · Phân quyền `permissions` · Lớp `classes` · ĐXT `rounds` · Cấu hình hệ thống `settings` · Nhật ký `audit` · Hàng đợi email `email-outbox` · Thông báo |

Route chi tiết: `rounds/:id`, `criteria/:id` (editor), `reviews/:applicationId` (workspace duyệt), `approvals/:roundId`, `records/:studentUserId`, `my-applications/:applicationId`, `apply/:roundId` (form SV), `classes/:id`.
Mỗi route khai báo `permission` cần có; vào route không có quyền ⇒ trang “Không có quyền truy cập”.

### 9.3 Trang công khai

**Trang chủ `#/`** (sửa `PublicHome`):
- Giữ hero + tìm kiếm + `FilterTabs`. Tab trạng thái: Tất cả · Đang tiếp nhận · Chưa mở · Đang xét duyệt · Chờ phê duyệt · Đã công bố. **Bỏ `closed`**.
- Bộ lọc phụ: **Năm học** và **Học kỳ** (C6: SV tra cứu năm đó ngành nào mở tuyển), **Khoa**.
- Thẻ ĐXT hiển thị: mã ĐXT, trạng thái, tên, **lớp + chuyên ngành + khoa**, nhãn loại (D-05), “Năm học 2026–2027 · Học kỳ 1”, khối ngày tiếp nhận (parse từ `intakeStart/intakeEnd`), sĩ số tối đa.
- CTA theo trạng thái & người xem:
  - `open` + chưa đăng nhập ⇒ “Nộp hồ sơ” → `#/dang-nhap?returnTo=/app/apply/<id>` (trang đăng nhập có nút “Chưa có tài khoản? Đăng ký bằng email IUH”).
  - `open` + SV `isKSTN=false` ⇒ “Nộp hồ sơ” → form.
  - `open` + SV KSTN của chính lớp đó ⇒ “Cập nhật hồ sơ tích lũy”; SV KSTN lớp khác ⇒ ghi chú “Bạn đang học lớp CN/KSTN khác” (D-20).
  - `published` ⇒ “Xem kết quả” → `#/ket-qua/<id>`.
  - còn lại ⇒ ghi chú trạng thái như hiện có.
- Nút hero “Tra cứu kết quả” → `#/tra-cuu` (thay “Tra cứu hồ sơ” cũ).

**Chi tiết ĐXT `#/dot/:id`** (giữ `RoundDetailModal` hoặc chuyển thành trang): thông tin §5.2 MP; **bảng tiêu chí** lấy từ snapshot (hoặc bộ đang gắn nếu chưa open): Loại BB/UT, tên, kiểu, các mức “≥ 3.6 → 50 điểm”, yêu cầu minh chứng (`evidenceGuide`), định dạng file cho phép; mốc thời gian dạng timeline 4 mốc (Tiếp nhận – Xét duyệt – Phê duyệt dự kiến – Công bố); mô tả; file đính kèm.

**Kết quả công khai `#/ket-qua/:id`:** tiêu đề ĐXT, ngày công bố, bảng `STT | MSSV (che) | Họ tên (viết tắt)`, phân trang 10, ghi chú “Danh sách hiển thị ở mức tối thiểu để bảo vệ dữ liệu cá nhân. Tra cứu kết quả cá nhân tại mục Tra cứu kết quả.”

**Tra cứu kết quả `#/tra-cuu`:** bước 1 nhập MSSV + email IUH → `otp.request(purpose LOOKUP)` → bước 2 nhập OTP (`OtpInput` 6 ô) → bảng hồ sơ: ĐXT, trạng thái, điểm chính thức (chỉ khi `published`), ý kiến GV nếu `needs_update` (kèm nút “Đăng nhập để bổ sung”).

### 9.4 Xác thực

**Đăng nhập `#/dang-nhap`** (thay `LoginModal`): `Tên đăng nhập (MSSV / mã GV / email)`, `Mật khẩu` (PasswordInput), “Quên mật khẩu?”, “Đăng ký tài khoản sinh viên”. Lỗi sai: “Tên đăng nhập hoặc mật khẩu chưa đúng. Còn N lần thử trước khi tài khoản bị tạm khóa 15 phút.” Bị khóa: “Tài khoản tạm khóa đến HH:mm.” Sau đăng nhập ⇒ `returnTo` hoặc `#/app/dashboard`.

**Đăng ký `#/dang-ky`** — `Stepper` 3 bước:
```
(1) Xác thực email IUH                (2) Nhập mã OTP                 (3) Hoàn tất tài khoản
 MSSV [________]                       Mã đã gửi tới k***9999@student…  Họ tên, Ngày sinh, Lớp sinh hoạt,
 Email IUH [_______@student.iuh.edu.vn] [_][_][_][_][_][_]             Ngành (đọc từ danh bạ – khóa)
 ⓘ Email phải chứa MSSV                 Hết hạn sau 09:41  Gửi lại (còn 2) SĐT [______]
 [Gửi mã OTP]                          [Xác nhận]                      Mật khẩu + PasswordStrength + Nhập lại
                                                                       [Tạo tài khoản]
```
- Bước 1 validate tại chỗ: sai đuôi ⇒ “Chỉ chấp nhận email sinh viên @student.iuh.edu.vn”; không chứa MSSV ⇒ “Email IUH phải chứa đúng MSSV của bạn”. Rate-limit ⇒ “Bạn đã yêu cầu quá 3 mã trong 15 phút. Thử lại sau HH:mm.”
- Bước 2: đếm ngược theo đồng hồ mô phỏng; sai ⇒ “Mã OTP không đúng (còn N lần)”.
- MSSV đã có TK (sau OTP) ⇒ `Callout` “MSSV này đã có tài khoản” + nút “Đăng nhập” / “Quên mật khẩu” (U2, U3).
- Thành công ⇒ toast + tự đăng nhập ⇒ `returnTo` (thường là form nộp hồ sơ).

**Quên MK / Đặt lại MK / Đổi MK:** như 5.9; dùng `PasswordInput` + `PasswordStrength`; hiển thị lỗi chính sách tại chỗ.

### 9.5 Sinh viên

**Tổng quan `dashboard` (SV):**
- Thẻ danh tính (giữ phong cách `academic-grid` của ProfilePage): họ tên, MSSV, trạng thái chương trình: “Sinh viên CN/KSTN – Lớp KSTN-KTPM-K20 (năm 3)” hoặc “Ứng viên (chưa thuộc lớp CN/KSTN)”.
- Khối “Việc cần làm”: hồ sơ `needs_update` (hạn), nháp chưa nộp (hạn tiếp nhận), ĐXT lớp đang mở (luồng C).
- Khối “ĐXT đang mở phù hợp” (ứng viên) / “ĐXT năm tới của lớp” (KSTN).

**Đợt đang mở `open-rounds` (ứng viên):** danh sách thẻ ĐXT `open` mà SV được nộp (classifyFlow allowed) + trạng thái hồ sơ của SV ở từng đợt (Chưa nộp / Bản nháp / Chờ duyệt…). BR-08: cho nộp nhiều ĐXT, hiển thị chú thích “Bạn có thể nộp nhiều đợt, nhưng chỉ được trúng tuyển vào 1 lớp CN/KSTN.”

**Form hồ sơ `apply/:roundId` và `maintenance`** (viết lại `StudentApplicationPage` thành component dùng chung `ApplicationForm`):
- Header: tên ĐXT, nhãn luồng (A/B/C), hạn tiếp nhận + đếm ngày còn lại, chỉ báo lưu nháp (giữ hành vi tự lưu 1.5s nhưng lưu vào `applications.saveDraft`).
- `Stepper` 3 bước (giữ): (1) Thông tin cá nhân · (2) Tiêu chí & minh chứng · (3) Kiểm tra & nộp.
- Bước 1: họ tên, MSSV, ngày sinh, email IUH (khóa), ngành (khóa – từ hồ sơ TK); **SĐT, lớp sinh hoạt** sửa được. (MP 5.4 “Form hồ sơ gồm…”)
- Bước 2: **render động** theo snapshot, nhóm “Tiêu chí bắt buộc (BB)” rồi “Tiêu chí ưu tiên (UT)”. Mỗi tiêu chí là `CriterionField`:
  ```
  ┌ GPA năm 2  [BB] [Ngưỡng số]                                     Dự kiến: 40 điểm ✓ ┐
  │ Mức: ≥ 3.6 → 50 · ≥ 3.4 → 40 · ≥ 3.2 → 30                                         │
  │ Giá trị [ 3.50 ] (thang 4.0)                                                       │
  │ Minh chứng: "Bảng điểm có xác nhận của PĐT, PDF"  (evidenceGuide của GV)          │
  │ [Kéo thả hoặc chọn tệp — PDF/JPG/PNG ≤ 10 MB]   bang-diem.pdf (1.2 MB) [Xem][Xóa]  │
  └───────────────────────────────────────────────────────────────────────────────────┘
  ```
  - `NUMBER_THRESHOLD`: `Input type="number"` + đơn vị; tiêu chí có `refCriterionId` không có ô nhập, hiển thị “Dùng giá trị của tiêu chí ‘Tiếng Anh’ (600)”.
  - `COUNT`: ô số lượng + nhiều file minh chứng (khuyến nghị 1 file/thành tích; cảnh báo nếu số file < số lượng).
  - `ACCUMULATIVE_ENUM`: danh sách thành tích (thay `AwardFields`): mỗi dòng = Tên thành tích + Select mức giải (từ `levels`) + file minh chứng; nút “Thêm thành tích”; tổng điểm cộng dồn hiện ngay (không trần — C9).
  - Chỉ báo ✓/⚠ cạnh từng tiêu chí (không chặn nhập).
- Cột phải sticky (≥1280px): **Điểm dự kiến** (tổng, BB đạt x/y, danh sách BB chưa đạt) — dùng `scoreApplication(mode "self")`. Ghi chú “Điểm chính thức do giảng viên xác minh có thể khác.”
- Bước 3: tóm tắt + danh sách minh chứng + ô cam kết trung thực (giữ câu chữ hiện có) ⇒ “Nộp hồ sơ chính thức”. Lỗi thiếu ⇒ liệt kê tiêu chí thiếu giá trị/minh chứng, bấm để nhảy tới.
- Khi hồ sơ `pending` & ĐXT `open`: trang chi tiết có “Chỉnh sửa hồ sơ” và “Rút hồ sơ” (ConfirmDialog nguy hiểm).
- Khi `needs_update`: `Callout warning` với nội dung yêu cầu + hạn; form mở ở bước 2, chỉ cho sửa; nút “Gửi bổ sung”.
- Khi ĐXT đã qua `open` và hồ sơ không `needs_update`: chỉ đọc.

**Hồ sơ của tôi `my-applications`:**
- Phần “Dòng thời gian chương trình” (luồng C/B): mỗi năm đào tạo một mốc — ĐXT, năm học, điểm chính thức, kết quả (`StatusBadge`), ý kiến GV, trạng thái membership (MP 5.8 cuối).
- Bảng tất cả hồ sơ (phân trang 10): Mã hồ sơ · ĐXT · Luồng · Ngày nộp · Điểm (tự khai/chính thức) · Trạng thái · Thao tác.
- Chi tiết `my-applications/:id`: thanh tiến độ (Nộp → Xét duyệt → Phê duyệt → Công bố) suy ra từ trạng thái hồ sơ + ĐXT; bảng điểm từng tiêu chí (tự khai vs chính thức sau công bố); `Timeline` lịch sử.

### 9.6 Giảng viên phụ trách / Chủ nhiệm ngành — Duyệt hồ sơ

**Danh sách `reviews`:**
- Bộ chọn ĐXT (chỉ ĐXT trong phạm vi, mặc định ĐXT `review` đầu tiên) + `Callout` trạng thái ĐXT (“Đang xét duyệt đến 20/11/2026 · Còn 3 hồ sơ chờ duyệt, 1 hồ sơ chờ bổ sung”).
- Bảng: MSSV · Họ tên · Luồng (chip A/B/C, C ghi “SV cũ”) · Điểm tự khai · Điểm chính thức · BB (✓ x/y) · Trạng thái · Thao tác (“Xét duyệt”/“Xem”). `FilterTabs` theo trạng thái có đếm. Sắp xếp theo điểm/trạng thái (MP 5.5).
- Nút chính “**Chốt & gửi phê duyệt**” (disabled + tooltip lý do khi còn `pending/needs_update` hoặc ĐXT không ở `review`). Bấm ⇒ Modal **xem trước danh sách đề xuất** (chạy `buildAdmissionList` ở UI để preview): chỉ tiêu, số SV cũ giữ lại, số suất bổ sung, bảng xếp hạng, cảnh báo đồng hạng/vượt chỉ tiêu ⇒ “Xác nhận chốt (tạo phiên bản vN)”.

**Workspace duyệt `reviews/:applicationId`** (nâng cấp `ApplicationReviewModal` → `FullscreenDialog` hoặc trang toàn màn hình) — **chia đôi** (MP §10 nguyên tắc UI):
```
┌──────────── Trái: thông tin khai báo ─────────────┬──────────── Phải: minh chứng ────────────┐
│ Trạng thái · Luồng C · Nộp 14/08 · Điểm 172 → 168  │  [Tab file 1][file 2][...]                │
│ 1. Thông tin SV (DescriptionList)                  │  ┌─────────────────────────────────────┐ │
│ 2. Tiêu chí (mỗi tiêu chí 1 hàng có thể mở rộng): │  │  iframe PDF / <img> / ảnh mẫu canvas │ │
│   GPA [BB] khai 3.50 → 40đ   [✔ Hợp lệ][✘ Sai][✎] │  │                                     │ │
│     ✎ sửa giá trị: [3.45] Lý do*: [..........]     │  └─────────────────────────────────────┘ │
│   Cuộc thi [UT] 2 thành tích: Nhất ✔ · Ba ✘(mờ)    │  Tải xuống                                │
│ 3. Lịch sử (Timeline) · Yêu cầu bổ sung trước đó    │                                          │
├────────────────────────────────────────────────────┴──────────────────────────────────────────┤
│ Ý kiến thẩm định*  [....................]  Hạn bổ sung [dd/mm hh:mm ≤ 20/11]                    │
│ [Đạt điều kiện] (cần xác minh đủ, BB đạt)   [Yêu cầu bổ sung]   [Không đạt]   [Mở lại] (D-09)  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```
- Bấm một tiêu chí ⇒ panel phải hiển thị minh chứng của tiêu chí đó.
- ✔/✘ gọi `reviews.verifyItem` ngay (lạc quan + toast lỗi nếu thất bại). ✘ yêu cầu ghi chú ngắn.
- Điểm chính thức + trạng thái BB cập nhật trực tiếp; nếu một BB `INVALID` ⇒ `Callout danger` “Hồ sơ không đạt tiêu chí bắt buộc: …”, nút “Đạt” disabled.
- Chế độ chỉ đọc (Hồ sơ SV, các cấp phê duyệt): ẩn toàn bộ thanh quyết định và nút xác minh.
- Dưới 1024px: giữ hành vi hiện có (thanh quyết định dính đáy), minh chứng mở bằng `Drawer`.

### 9.7 Phê duyệt danh sách (CNN / BLĐ khoa / PĐT) — `approvals`

**Danh sách:** thẻ cho mỗi ĐXT `approving` trong phạm vi, nhóm “Chờ tôi xử lý” (substatus khớp cấp của vai trò) và “Đang ở cấp khác / Đã công bố gần đây”. Mỗi thẻ: mã + tên ĐXT, lớp, phiên bản danh sách, `ApprovalStepper` 3 cấp (đã xong / đang chờ / chưa tới — giữ phong cách `RoundApprovalPanel`), số đề xuất / chỉ tiêu, cảnh báo.

**Chi tiết `approvals/:roundId`:**
```
DXT-2026-04 · KSTN-HTTT-K21 · Năm 2 · Cạnh tranh sòng phẳng · Chỉ tiêu 5       [Danh sách v2 ▾ (v1: Đã trả về)]
ApprovalStepper: ✓ CNN (TS. Nguyễn Văn Hải, 06/11) → ● BLĐ khoa (đang chờ) → ○ PĐT
⚠ Cảnh báo: (đồng hạng / SV cũ vượt chỉ tiêu / SV đã trúng lớp khác)
Bảng: Hạng · MSSV · Họ tên · Nhóm (SV cũ / SV mới) · Điểm chính thức · Đề xuất (✓ / Chờ chọn / —) · [Xem hồ sơ (chỉ đọc)]
Lịch sử phê duyệt: Timeline các ApprovalStep của mọi phiên bản (ai, khi nào, quyết định, ý kiến, file)
[Trả về]  [Xác nhận danh sách | Phê duyệt danh sách | Phê duyệt & Công bố]
```
- Hộp xác nhận: `Textarea` ý kiến (bắt buộc khi Trả về), `FileDropzone` 1 file đính kèm (VD biên bản họp). “Phê duyệt & Công bố” dùng `ConfirmDialog tone="danger"`-kiểu nghiêm trọng, liệt kê hậu quả: số SV trúng tuyển, số SV bị loại khỏi lớp (DROPPED), email sẽ gửi, “ĐXT sẽ bất biến”.
- Cấp CNN khi có `tieGroup`: bảng nhóm đồng hạng có checkbox, phải chọn **đúng** số suất còn lại mới bật nút “Xác nhận”.
- Luôn duyệt **phiên bản mới nhất PENDING**; phiên bản cũ chỉ xem.
- Sau công bố (PĐT): `Callout success` + thống kê + liên kết “Email gửi lỗi (N)” → danh sách outbox của ĐXT đó với nút “Gửi lại”.

### 9.8 Bộ tiêu chí — `criteria`, `criteria/:id`

**Danh sách:** tab “Tất cả trong khoa” · “Do tôi tạo” · “Lưu trữ”. Cột: Tên bộ · Phạm vi (Khoa / Ngành X) · Phiên bản · Người tạo · Trạng thái · Đang dùng bởi (số ĐXT) · Thao tác (Xem, Sửa nếu có quyền, Nhân bản phiên bản mới, Lưu trữ/Xóa). Nút “Tạo bộ tiêu chí”. Nút Sửa/Xóa ẩn khi không có quyền (C12) và service vẫn chặn.

**Editor `criteria/:id`:**
- Thông tin bộ: tên, mô tả, phạm vi (khoa cố định theo vai trò; ngành chọn được với BLĐ; CNN/GVPT cố định ngành mình).
- Danh sách tiêu chí (kéo thả hoặc nút ↑↓ để đổi `sortOrder`), mỗi tiêu chí mở `Drawer` sửa:
  - Tên · Nhóm BB/UT (`RadioCard`) · Kiểu tính điểm (`RadioCard` 3 lựa chọn, có mô tả ngắn từ MP 5.3.2) · Đơn vị · Bắt buộc minh chứng · **Mô tả yêu cầu minh chứng** (BR-16) · Thứ tự xét hòa (để trống = không dùng) · Tham chiếu giá trị (chỉ NUMBER_THRESHOLD, chọn tiêu chí NUMBER khác trong bộ).
  - Mức: bảng `Nhãn | Toán tử | Từ | Đến (BETWEEN) | Điểm`. Với ACCUMULATIVE_ENUM: `Mức giải | Điểm` (không toán tử). Với COUNT: thêm chế độ “Điểm theo mức / Điểm × số lượng” + điểm trần tùy chọn.
- Cột phải **“Xem trước điểm”**: form nhập thử giá trị cho từng tiêu chí (tái dùng `CriterionField` không có upload) → `criteria.previewScore`. Nút “Điền dữ liệu mẫu Assessment” điền bộ giá trị §6.2 (ra 190 với CS-2).
- Thanh hành động: “Lưu nháp” · “Ban hành” (validate §7.2) · với PUBLISHED: chỉ đọc + “Tạo phiên bản mới”. Banner nếu bộ đang dùng bởi ĐXT `open/review/...`: “ĐXT đang chạy dùng bản snapshot, thay đổi không ảnh hưởng” (U8).

### 9.9 Đợt xét tuyển — `rounds`, `rounds/:id`

**Danh sách:** `FilterTabs` 6 trạng thái (đúng C17) + lọc năm học/học kỳ. Cột: Mã đợt · Tên (+ lớp) · Năm học/HK · Năm ĐT · Tiếp nhận · Chỉ tiêu · Trạng thái (+ substatus) · Thao tác. Nút “Tạo đợt xét tuyển” chỉ khi `round.manage`.

**Form tạo/sửa (Modal lg)** — bỏ radio trạng thái:
- Lớp CN/KSTN (Select theo phạm vi; hiển thị suy ra Khoa · Ngành · Khóa · “Năm đào tạo thứ N” · “ĐXT đầu tiên của lớp” nếu đúng).
- Tên đợt (gợi ý tự động theo D-05) · Học kỳ · Năm học (Select `2025–2026`, `2026–2027`, `2027–2028`) · Sĩ số tối đa · Bộ tiêu chí (Select chỉ PUBLISHED cùng khoa; có link “Xem tiêu chí”) · GVPT (mặc định GVPT của lớp) · Chế độ xếp hạng (`RadioCard`, ẩn với ĐXT đầu tiên) · Tiếp nhận bắt đầu/kết thúc (`datetime-local`) · Xét duyệt bắt đầu/kết thúc · Hạn phê duyệt dự kiến · Mô tả/thông báo tuyển sinh · File đính kèm.
- Trường không sửa được theo `editableFields` ⇒ `Input locked`. Lỗi ngày gắn tại `Field`.

**Chi tiết `rounds/:id`:** header (mã, tên, trạng thái, substatus), **timeline mốc** (5 mốc với vị trí “hiện tại” theo đồng hồ), thông tin, bảng tiêu chí (snapshot nếu có, ghi “Snapshot lúc 01/11/2026 00:00 – phiên bản v1”), thống kê hồ sơ theo trạng thái/luồng, nút theo quyền: Sửa · Phát hành · Mở tiếp nhận sớm / Đóng tiếp nhận sớm (ADMIN/DEAN, Modal lý do) · Xóa · Đi tới Duyệt hồ sơ / Phê duyệt danh sách / Báo cáo. Tab “Nhật ký” (audit lọc theo ĐXT).

### 9.10 Danh mục, lớp, tài khoản, phân quyền

- **Danh mục Khoa/Ngành `catalog` (ADMIN):** 2 tab bảng Khoa (Mã, Tên, Số ngành, Trạng thái) và Ngành (Khoa, Mã, Tên, Số chuyên ngành CN/KSTN). Xóa cha khi còn con ⇒ chặn với minh họa `Khoa → Ngành → Chuyên ngành → Lớp` (giữ phong cách MajorManagement hiện có).
- **Chuyên ngành CN/KSTN `programs`:** **giữ đúng `NGHIEP-VU.md`**: cột `Khoa | Chuyên ngành | Số lượng lớp | Thao tác`; modal thêm (Khoa, Ngành, Loại KSTN/CNTN, Tên chuyên ngành); trùng ⇒ modal nhỏ “Đã có chuyên ngành giống hệt…”; xóa khi còn lớp ⇒ chặn; Xem chi tiết = danh sách lớp + trạng thái lớp (suy ra). Phạm vi: BLĐ chỉ thấy khoa mình; CNN chỉ xem.
- **Lớp `classes`:** cột Mã lớp · Chuyên ngành · Khóa · Năm bắt đầu · GVPT · Sĩ số (ACTIVE) / chỉ tiêu ĐXT gần nhất (`Capacity`) · Trạng thái (suy ra) · Thao tác. Form tạo: Chuyên ngành, Khóa, Năm bắt đầu, GVPT (chỉ GV cùng khoa), Mô tả — **bỏ nhập sĩ số tay**. Chi tiết `classes/:id`: tab Thành viên theo năm đào tạo (bảng MSSV · Họ tên · Năm ĐT · Trạng thái membership · Nguồn hồ sơ), tab ĐXT của lớp, nút “Ghi nhận SV tự rút” (D-22), “Kết thúc lớp” (class.manage, ConfirmDialog).
- **TK giảng viên `lecturers`:** cột Mã GV · Họ tên · Email · Khoa · Vai trò hiện có (chip) · Trạng thái · Thao tác (Xem, Sửa, Khóa/Mở khóa, Đặt lại MK). **Không có nút xóa.** Tab “Phân quyền” (với CNN/BLĐ) = component phân quyền giới hạn trong phạm vi. Nhập CSV (tùy chọn “Could”): mẫu cột `lecturerCode,fullName,email,title,facultyCode`.
- **TK sinh viên `students`:** cột MSSV · Họ tên · Email IUH · Ngành · `isKSTN` (chip “SV CN/KSTN” / “Ứng viên”) · Lớp hiện tại · Trạng thái TK · Thao tác (Xem: hồ sơ + membership + lịch sử; Khóa/Mở; Đặt lại MK). **Không có nút “Thêm SV”** (SV tự đăng ký — C3).
- **Đặt lại MK SV `student-passwords` (GVPT):** chỉ SV có membership ở lớp mình phụ trách (C11); MK tạm hiển thị một lần trong `Callout` + gửi email.
- **Phân quyền `permissions`:** bảng gán vai trò: Người dùng · Vai trò · Phạm vi (Khoa/Ngành/Lớp cụ thể) · Hiệu lực từ–đến · Người gán · Trạng thái (Đang hiệu lực / Hết hạn / Đã thu hồi) · Thao tác (Thu hồi). Form gán: chọn GV, vai trò (chỉ vai trò được phép gán), phạm vi (Select phụ thuộc vai trò, chỉ đối tượng trong phạm vi mình), ngày hiệu lực. Vi phạm BR-14 ⇒ lỗi tại chỗ “Không thể gán quyền vượt phạm vi của bạn”.

### 9.11 Hồ sơ SV `records`, Báo cáo, Nhật ký, Email, Cấu hình, Thông báo, Tổng quan cán bộ

- **Hồ sơ SV CN/KSTN `records`:** bảng SV trong phạm vi (có membership hoặc hồ sơ trong phạm vi) · `records/:studentUserId`: thẻ SV + dòng thời gian các năm + danh sách hồ sơ (mở workspace duyệt ở chế độ chỉ đọc).
- **Báo cáo `reports`:** chọn ĐXT trong phạm vi ⇒ thẻ số liệu (tổng hồ sơ, theo trạng thái, theo luồng, trúng tuyển/chỉ tiêu), **phổ điểm** (biểu đồ cột SVG tự vẽ, bin 20 điểm, dùng token màu `brand-*`), bảng danh sách trúng tuyển. Nút “Xuất CSV (Excel)” và “In / Lưu PDF” (print stylesheet ẩn sidebar/header).
- **Nhật ký `audit`:** bảng Thời gian · Người thực hiện · Vai trò · Hành động · Đối tượng · Lý do · [Xem before/after (Drawer, JSON đẹp)]. Lọc theo đối tượng, người, hành động, khoảng ngày. Không có nút sửa/xóa.
- **Hàng đợi email `email-outbox` (ADMIN):** tab Tất cả / Đã gửi / Gửi lỗi; cột Thời gian · Người nhận · Mẫu · Tiêu đề · Trạng thái · Số lần thử · Lỗi · Thao tác (Xem, Gửi lại).
- **Cấu hình hệ thống `settings` (ADMIN):** nhóm SMTP (mock, nút “Gửi email thử” ⇒ outbox), Giới hạn file (MB, định dạng), OTP & đăng nhập, Nhắc việc (giờ trước hạn, ngày giữ danh sách), Mẫu email (chọn mẫu → sửa tiêu đề/nội dung, liệt kê biến). Lưu ⇒ `system.updateConfig` + audit.
- **Thông báo `notifications`:** danh sách có lọc Chưa đọc/Tất cả, “Đánh dấu tất cả đã đọc”.
- **Tổng quan cán bộ `dashboard`:** thẻ “Việc cần làm” theo vai trò (GV/CNN: hồ sơ chờ duyệt, ĐXT sắp hết hạn xét duyệt; CNN/BLĐ/PĐT: danh sách chờ mình; ADMIN: email lỗi, ĐXT nháp), thẻ đếm ĐXT theo trạng thái trong phạm vi, “Mốc sắp tới” (7 ngày). Số liệu tính từ mock data, không bịa.

---

## 10. Hướng dẫn thiết kế UI

### 10.1 Tuân thủ hệ thống hiện có
- Dùng token và component theo `DESIGN.md` (Honor Rule cho tiêu đề trang, `CodeTag` cho mọi mã: mã ĐXT, MSSV, mã hồ sơ, mã lớp; `StatusBadge` cho mọi trạng thái qua `getStatusMeta(value, domain)` — thêm domain `membership`, `criteriaSet`, `email`, `roleAssignment`).
- Bảng: `TablePanel + TableToolbar + ResponsiveTable + usePagedFilter` (tối đa **10 dòng/trang**, `NGHIEP-VU.md`). Xem chi tiết: `Drawer`. Xác nhận/chặn: `ConfirmDialog`. Form: `Field` (lỗi tại chỗ `role="alert"`).
- Hành động không hoàn tác (Công bố, Trả về, Khóa TK, Rút hồ sơ, Khôi phục dữ liệu mẫu) dùng `ConfirmDialog` và bắt buộc lý do khi MP yêu cầu (MP §10).
- Responsive: trang SV (form nộp, hồ sơ của tôi, tổng quan, đăng ký, tra cứu) phải dùng tốt ở **390px**; màn hình duyệt/phê duyệt ưu tiên desktop nhưng không vỡ ở 1024px.
- A11y: label đầy đủ, focus trap overlay (`useDialogA11y`), `aria-live` cho điểm dự kiến và chỉ báo lưu nháp, nút icon có `label`.

### 10.2 Component mới (đặt trong `src/components/`)

| Component | Mô tả |
|---|---|
| `ui/ToastProvider.jsx` | Context `showToast/hideToast` + `ToastStack` (tách khỏi store cũ) |
| `ui/OtpInput.jsx` | 6 ô số, dán cả chuỗi, tự nhảy ô, `inputMode="numeric"`, `autocomplete="one-time-code"` |
| `ui/Countdown.jsx` | đếm ngược theo `now` của backend |
| `ui/StatCard.jsx` | thẻ số liệu (nhãn, số, mô tả, link) |
| `ui/MaskedText.jsx` | hiển thị MSSV/tên đã che |
| `ui/ScoreSummary.jsx` | tổng điểm, BB đạt x/y, danh sách BB chưa đạt (dùng cho form SV và workspace duyệt) |
| `ui/ScoreHistogram.jsx` | biểu đồ cột SVG thuần, có `<title>`/bảng dữ liệu ẩn cho screen reader |
| `domain-ui/CriterionField.jsx` | ô nhập theo `valueType` (+ upload khi `withEvidence`) |
| `domain-ui/AchievementList.jsx` | danh sách thành tích ACCUMULATIVE_ENUM (thay `AwardFields`) |
| `domain-ui/CriteriaTable.jsx` | bảng tiêu chí chỉ đọc (trang chi tiết ĐXT, editor) |
| `domain-ui/EvidenceUploader.jsx` | nhiều file/tiêu chí, kiểm định dạng + magic bytes + dung lượng theo `config.files` |
| `domain-ui/EvidenceViewer.jsx` | PDF iframe / ảnh / ảnh mẫu canvas cho `sample` |
| `domain-ui/ApprovalStepper.jsx` | 3 cấp CNN → BLĐ khoa → PĐT, trạng thái từng cấp + người + ngày |
| `domain-ui/RoundMilestones.jsx` | timeline mốc ĐXT, đánh dấu “hiện tại” |
| `domain-ui/AdmissionListTable.jsx` | bảng danh sách đề xuất (nhóm, hạng, đồng hạng, chọn) |
| `domain-ui/ProgramTimeline.jsx` | dòng thời gian các năm của SV |
| `layout/RoleSwitcher.jsx`, `layout/NotificationBell.jsx` | header |

Thêm các trang mới vào `src/dev/Gallery.jsx` khi phù hợp (tùy chọn).

### 10.3 Văn phong
- Thông báo lỗi nói **điều gì sai + cách sửa**: “Ngày kết thúc tiếp nhận phải trước hoặc bằng ngày bắt đầu xét duyệt.”
- Không emoji, không marketing copy, không số liệu bịa (DESIGN.md “Danh sách cấm”).
- Mọi nơi có dữ liệu demo nhạy cảm (điểm, MSSV) vẫn là dữ liệu minh họa; footer trang chủ thêm dòng nhỏ “Bản prototype – dữ liệu minh họa”.

---

## 11. Lộ trình theo giai đoạn (có cổng nghiệm thu)

> Mỗi giai đoạn: làm → chạy `npm test` (khi đã có) + build → tự kiểm theo cổng → viết báo cáo theo mẫu §14.3 vào `coding_plan/progress/P<n>-report.md`. **Không qua cổng thì không sang giai đoạn sau.**

### P0 — Chuẩn bị (≤ 0.5 ngày)
- Đọc tài liệu (§0.2). Chạy build gốc: `node node_modules/vite/bin/vite.js build` ⇒ phải thành công trước khi sửa.
- Thêm script vào `package.json` (giữ nguyên các script khác):
  ```json
  "test": "node --test \"src/**/*.test.js\"",
  "verify": "node --test \"src/**/*.test.js\" && vite build"
  ```
- Tạo `coding_plan/progress/`.
- **Cổng P0:** build gốc OK; `npm test` chạy được (0 test cũng được).

### P1 — Domain thuần + test (nền móng, ưu tiên cao nhất)
Tạo `src/domain/constants.js, errors.js, time.js, identity.js, scoring.js, ranking.js, round-machine.js, application-machine.js, flows.js, scope.js, permissions.js, scheduler.js, publish.js, selectors.js` theo §5–§6, kèm test §12.2.
- **Cổng P1:** `npm test` xanh; có test Assessment = 190; test mọi chuyển cấm của ĐXT; test xếp hạng 2 chế độ × (thiếu/đủ/vượt chỉ tiêu, đồng hạng); test BR-14; test mask/email; `grep -rE "window|localStorage|document|react" src/domain` không có kết quả.

### P2 — Mock backend, seed, persistence, Demo panel
- `src/mock/schema.js, persistence.js (key iuh_talent_v3_db / iuh_talent_v3_session), evidence-store.js, seed/*, services/*, backend.jsx`, `ToastProvider`.
- Seed đúng §8, `seed.test.js` kiểm tính nhất quán (§12.2).
- `DemoPanel` (4 tab) gắn vào cả trang công khai và workspace.
- `App.jsx` bọc `MockBackendProvider` + `ToastProvider`; tạm thời trang cũ vẫn chạy bằng **adapter** (`useDemoStore` cũ đọc từ backend mới) **hoặc** chuyển thẳng — Agent chọn, nhưng cuối P2 build phải xanh và trang công khai hiển thị ĐXT từ seed mới.
- **Cổng P2:** test service xanh (đăng ký OTP, publish transaction, permissions 403); mở Bảng Demo đổi giờ sang `2026-11-15 00:00` ⇒ R6 thành `open`; sang `2026-11-12 09:01` ⇒ hồ sơ Bảo thành `rejected`; khôi phục dữ liệu mẫu chạy được; luật import §4.1 đúng.

### P3 — Router, xác thực, khung workspace
- `src/app/router.js, routes.jsx, menus.js, AuthGate.jsx, WorkspaceLayout.jsx`; `main.jsx` theo D-16.
- Trang: đăng nhập, đăng ký 3 bước + OTP, quên/đặt lại/đổi MK, buộc đổi MK; header với `RoleSwitcher`, `NotificationBell`; trang Thông báo; trang Thông tin cá nhân (sửa SĐT; SV đổi email qua OTP).
- **Cổng P3:** U1 phần đăng ký (26019999) chạy trọn bằng OTP lấy từ Hộp thư mô phỏng; U2, U3, U7 đạt; đăng nhập sai 5 lần ⇒ khóa đến +15′ theo đồng hồ mô phỏng; `GV005` đổi vai trò HEAD ↔ LECTURER thấy menu & phạm vi khác; mở `giang-vien-phu-trach.html` tự đăng nhập `GV001`.

### P4 — Danh mục, lớp, tài khoản, phân quyền
- `catalog`, `programs` (đúng `NGHIEP-VU.md`), `classes` (+ chi tiết thành viên), `lecturers` (khóa thay xóa, đặt lại MK), `students`, `student-passwords` (C11), `permissions` (BR-14).
- **Cổng P4:** GVPT `GV001` chỉ thấy SV lớp K20 ở trang đặt lại MK; CNN `GV005` gán LECTURER cho lớp ngoài ngành ⇒ lỗi; xóa chuyên ngành còn lớp ⇒ chặn; trùng chuyên ngành ⇒ modal; không còn nút xóa GV.

### P5 — Bộ tiêu chí
- `criteria` list + editor + xem trước điểm + phiên bản/ban hành/lưu trữ (D-10, D-11, C12).
- **Cổng P5:** CS-2 xem trước với “Điền dữ liệu mẫu Assessment” ra **190**; `GV001` sửa được CS-4 nhưng không sửa được CS-2 (nút ẩn + service chặn); CNN sửa CS-4 được (thuộc ngành); tạo phiên bản mới từ CS-2 ⇒ v2 DRAFT, R2 vẫn hiển thị snapshot v1.

### P6 — Đợt xét tuyển
- `rounds` list/form/detail, phát hành, gia hạn, chuyển thủ công, snapshot, trang chủ & chi tiết ĐXT công khai mới.
- **Cổng P6:** phát hành R7 với mốc sai ⇒ lỗi tại `Field`; phát hành đúng ⇒ hiện ở trang chủ “Chưa mở”; tạo ĐXT thứ hai cùng lớp + HK + năm học ⇒ lỗi D-03; GVPT chỉ sửa được mốc thời gian; không còn chữ “closed”/“Đã kết thúc” cho ĐXT (`grep -rn "closed" src` chỉ còn trong ngữ cảnh khác).

### P7 — Cổng sinh viên & nộp hồ sơ
- `dashboard` SV, `open-rounds`, `apply/:roundId`, `maintenance`, `my-applications(/:id)`; form động; minh chứng nhiều file/tiêu chí; nháp/nộp/sửa/rút/bổ sung; luồng A/B/C; email mã hồ sơ.
- **Cổng P7:** U1 trọn vẹn (đăng ký → nộp R1 → email có mã hồ sơ); Hân (B) thấy thông tin kế thừa; Nam (C) chỉ thấy menu “Cập nhật hồ sơ tích lũy” khi ĐXT lớp `open` (tua đồng hồ về tháng 10 hoặc dùng ĐXT phù hợp để kiểm); Bảo bổ sung trước hạn ⇒ `pending` (U4a); file `.docx` hoặc > 10 MB ⇒ báo lỗi; trang SV dùng được ở 390px.

### P8 — Duyệt hồ sơ & chốt danh sách
- `reviews`, workspace chia đôi, xác minh từng tiêu chí, sửa giá trị có lý do, 3 quyết định + mở lại, chốt & preview danh sách.
- **Cổng P8:** `GV001` duyệt Khoa (✔ đủ ⇒ Đạt), yêu cầu bổ sung với hạn > reviewEnd ⇒ lỗi; tua đồng hồ qua hạn của Bảo ⇒ `rejected` (U4b); chốt R2 ⇒ list v1, ĐXT `approving/waiting_head`, CNN nhận thông báo; `GV002` (CNN HTTT) mở hồ sơ R2 ⇒ “Không có quyền” (U10).

### P9 — Chuỗi phê duyệt & công bố
- `approvals` (list + chi tiết), tie resolution, approve/return/publish, kết quả công khai, tra cứu MSSV + OTP, email gửi lỗi + gửi lại.
- **Cổng P9:** R3: CNN phải chọn đồng hạng mới xác nhận được; R4: BLĐ trả về ⇒ ĐXT `review`, CNN thấy lý do, GV mở lại/chốt lại ⇒ v3, chuỗi chạy lại từ CNN (U5, BR-12); R5: PĐT công bố ⇒ hồ sơ `confirmed/not_admitted`, `isKSTN` cập nhật, membership năm 3 ACTIVE/DROPPED, email trong outbox, ĐXT bất biến (U6, U9); trang `#/ket-qua/DXT-2026-05` che MSSV/tên; email tới `fail.*` ở trạng thái gửi lỗi và gửi lại được.

### P10 — Vận hành & tổng quan
- `reports` (+ CSV + in), `audit`, `email-outbox`, `settings`, `dashboard` các vai trò cán bộ.
- **Cổng P10:** mọi thao tác ở P3–P9 xuất hiện trong Nhật ký với before/after; đổi `files.maxMb` ở Cấu hình thành 2 ⇒ upload 3 MB bị chặn; CSV mở bằng Excel hiển thị đúng tiếng Việt.

### P11 — Hoàn thiện, dọn dẹp, tài liệu
- Xóa file cũ (§4.2), sửa `Gallery.jsx`, cập nhật `DESIGN.md` mục 3 (luồng mới), viết `coding_plan/README-PROTOTYPE.md` (cách chạy, TK demo, kịch bản trình diễn 10 phút).
- Chạy toàn bộ UAT §12.3 và ghi kết quả vào `coding_plan/progress/UAT-results.md`.
- Kiểm 3 khổ màn hình 1440/1024/390, không cuộn ngang trang; console không lỗi/không cảnh báo key.
- **Cổng P11 = Definition of Done §14.2.**

---

## 12. Kiểm thử: test tự động + UAT

### 12.1 Lệnh

```bash
# Test logic (Node ≥ 20, không cần cài thêm gì)
node --test "src/**/*.test.js"          # hoặc: npm test
# Build (không cần pnpm)
node node_modules/vite/bin/vite.js build
# Chạy dev
node node_modules/vite/bin/vite.js      # http://127.0.0.1:5173/
```

Test viết bằng `import { test, describe } from "node:test"; import assert from "node:assert/strict";`. Test không được đụng `window`, `localStorage`, `indexedDB` (service nhận db thuần).

### 12.2 Danh sách test bắt buộc (tối thiểu)

| File | Ca kiểm thử |
|---|---|
| `domain/scoring.test.js` | Assessment = 190 & eligible; ví dụ 5.3.4 = 90; GPA 3.4 ⇒ 40 (biên ≥); RL 80 ⇒ 0 & BB fail (biên >); TC không đạt 1 ⇒ eligible false dù tổng cao; BETWEEN; COUNT PER_ITEM + maxPoints; ref criterion lấy giá trị BB; official: INVALID ⇒ 0, verifiedValue ghi đè; ACCUMULATIVE chỉ tính entry VALID; giá trị rỗng không thỏa |
| `domain/ranking.test.js` | ĐXT đầu tiên chọn top quota; MAINTAIN: SV cũ giữ hết + lấp chỗ; thiếu hồ sơ (ít hơn quota); SV cũ vượt quota ⇒ cắt + cảnh báo (D-07); OPEN_COMPETITION SV cũ có thể bị loại; xét hòa theo tieBreakOrder phân định được; đồng hạng hoàn toàn tại ranh giới ⇒ tieGroup, `proposed = null`; đồng hạng không ở ranh giới ⇒ không gắn nhóm |
| `domain/round-machine.test.js` | mọi chuyển hợp lệ ở §6.4; mọi chuyển cấm ném INVALID_STATE; `editableFields` theo trạng thái & vai trò |
| `domain/application-machine.test.js` | bảng §6.5, gồm withdraw chỉ khi open, needs_update chỉ khi review, dueAt > reviewEnd bị từ chối |
| `domain/permissions.test.js` | mỗi vai trò thử tài nguyên ngoài phạm vi ⇒ false (ADMIN luôn true trừ `application.review`/`list.*`); C11 GVPT reset MK SV lớp khác ⇒ false; C12 owner rules; BR-14 các tổ hợp; vai trò hết hạn/thu hồi ⇒ không có quyền |
| `domain/flows.test.js` | A (mới), B (từng trượt / từng DROPPED / có TK chưa nộp), C (ACTIVE lớp, ĐXT không phải đầu tiên), isKSTN lớp khác ⇒ không cho (D-20) |
| `domain/identity.test.js` | email đúng/sai đuôi/không chứa MSSV/MSSV 7 số; mask; chính sách MK |
| `domain/scheduler.test.js` | upcoming→open + snapshot; open→review + drafts cancelled; needs_update quá hạn ⇒ rejected; nhắc 48h/24h chỉ một lần; idempotent khi tick 2 lần; email FAILED/thử lại |
| `domain/publish.test.js` | confirmed/not_admitted; isKSTN; membership ACTIVE; DROPPED cho SV cũ không nộp/không đạt; D-08 thay thế bằng hồ sơ kế tiếp; tieResolution được áp dụng; tổng `confirmed` ≤ quota (BR-10) |
| `mock/seed.test.js` | seed hợp lệ: mọi FK tồn tại; mỗi trạng thái ĐXT & hồ sơ (trừ `cancelled`) có ≥ 1 bản ghi; hồ sơ Nam ở R2 có officialScore 190; isKSTN khớp membership; không có `closed`; mọi ĐXT không-nháp có criteriaSet PUBLISHED; ĐXT ≥ open có snapshot |
| `mock/services/*.test.js` | `otp.request` rate-limit & phản hồi chung chung (U2); `account.registerStudent` tạo isKSTN=false; MSSV đã có ⇒ CONFLICT sau OTP; `auth.login` khóa sau 5 lần; `reviews.decide` sai phạm vi ⇒ FORBIDDEN (U10); `lists.return` ⇒ review + chạy lại từ HEAD (U5); `lists.publish` atomic (ép lỗi giữa chừng ⇒ db không đổi); mọi mutate có audit log |

### 12.3 Kịch bản UAT (trình diễn & nghiệm thu thủ công)

> Thực hiện sau “Khôi phục dữ liệu mẫu”. Ghi kết quả Đạt/Không đạt + ảnh chụp (nếu có) vào `coding_plan/progress/UAT-results.md`.

| # | Kịch bản | Bước | Kết quả mong đợi |
|---|---|---|---|
| U1 | SV chưa có TK nộp hồ sơ ĐXT đầu tiên | Trang chủ → R1 “Nộp hồ sơ” → Đăng ký `26019999` / `khang.26019999@student.iuh.edu.vn` → lấy OTP ở Hộp thư → tạo TK → điền form, tải PDF → nộp | TK `isKSTN=false`; hồ sơ `pending` luồng A; email “Đã tiếp nhận hồ sơ” có mã hồ sơ |
| U2 | Mạo danh MSSV | Đăng ký MSSV `21094501` với email `hacker.21094501@student.iuh.edu.vn` | Thông điệp chung chung; Hộp thư **không** có email nào tới địa chỉ này; không lộ việc 21094501 đã có TK |
| U3 | SV đang học lớp vào trang chủ | Đăng ký với `21094501` + email đúng trong danh bạ → nhập OTP | “MSSV này đã có tài khoản” + chuyển đăng nhập; đăng nhập xong thấy menu luồng C |
| U4 | Bổ sung trong hạn / quá hạn | (a) Bảo đăng nhập, bổ sung trước 12/11 09:00 · (b) khôi phục seed, tua đồng hồ tới 12/11 09:01 | (a) `pending` · (b) `rejected` + email/notification |
| U5 | Khoa trả về danh sách | `GV004` mở R4 → Trả về (lý do) | ĐXT về `review`; GVPT/CNN nhận thông báo; sau khi chốt lại tạo v3 và CNN phải xác nhận lại |
| U6 | PĐT công bố | `GV900` mở R5 → Phê duyệt & Công bố | hồ sơ `confirmed/not_admitted`; `isKSTN` cập nhật; membership năm 3; email trong outbox; ĐXT chỉ đọc; kết quả công khai che bớt |
| U7 | Đăng nhập lần đầu bắt buộc đổi MK | Đăng nhập `GV009` | Chặn ở màn hình đổi MK đến khi đổi xong |
| U8 | Sửa bộ tiêu chí khi ĐXT đang chạy | `GV005` (HEAD) mở CS-2 (R2 đang review) | Không sửa trực tiếp được; “Tạo phiên bản mới” ⇒ v2; R2 vẫn dùng snapshot v1 |
| U9 | SV cũ không nộp hồ sơ tích lũy | Hoàn tất R2 tới công bố (duyệt hết, chốt, CNN, BLĐ, PĐT) | Tú: membership năm 3 `DROPPED`, `isKSTN=false`, email `RESULT_DROPPED` |
| U10 | CNN ngành A duyệt hồ sơ ngành B | `GV002` (HTTT) mở `#/app/reviews/<hồ sơ R2>` | Trang “Không có quyền”; gọi service trực tiếp ⇒ FORBIDDEN |
| U11 | Đa vai trò | `GV005` đổi HEAD ↔ LECTURER | Menu, phạm vi, dữ liệu thay đổi đúng |
| U12 | Chuyển trạng thái tự động | Tua đồng hồ 15/11 00:00 | R6 `open`, snapshot được tạo, audit actor “Hệ thống” |
| U13 | Nộp nhiều ĐXT (Q4) | SV ứng viên nộp R1 và một ĐXT khác cùng năm học; công bố ĐXT thứ nhất có SV trúng; công bố ĐXT thứ hai | ĐXT thứ hai: SV `not_admitted` (“Đã trúng tuyển lớp khác”), suất chuyển cho hồ sơ kế tiếp |
| U14 | Đồng hạng | `GV005` (HEAD) mở R3 | Phải chọn 1 trong 2 hồ sơ đồng hạng mới xác nhận được; BLĐ thấy lựa chọn đã lưu |
| U15 | GVPT đặt lại MK SV | `GV001` → Đặt lại MK SV | Chỉ thấy SV lớp K20; SV nhận email MK tạm, đăng nhập bị buộc đổi MK |

---

## 13. Ma trận truy vết MP → công việc

| MP | Nội dung | Giai đoạn | Nơi hiện thực |
|---|---|---|---|
| C1 | Cập nhật hồ sơ tích lũy ở “Tiếp nhận hồ sơ” | P7 | `menus.js` (điều kiện menu), `maintenance` |
| C2 | Trạng thái “Chờ phê duyệt” 3 bước con | P1, P9 | `round-machine.js`, `approvals` |
| C3 | TK SV tự đăng ký, `isKSTN`, trạng thái Application | P1–P3, P7, P9 | `account.js`, `application-machine.js`, `publish.js` |
| C4 | Email IUH + đối chiếu MSSV + OTP | P1, P3 | `identity.js`, `otp.js`, `#/dang-ky` |
| C5 | Bỏ GVPT trùng | P6 | form ĐXT (1 trường GVPT) |
| C6 | `quota`, `semester`, `academicYear` | P6 | form ĐXT, bộ lọc trang chủ |
| C7, C8, Q3 | Luồng A/B/C, SV bị loại được nộp lại | P1, P7 | `flows.js` |
| C9 | ACCUMULATIVE_ENUM không trần | P1, P5, P7 | `scoring.js`, `AchievementList` |
| C10 | `rankingMode` | P1, P6, P8 | `ranking.js` |
| C11, Q12 | GVPT reset MK SV lớp mình | P1, P4 | `permissions.js`, `student-passwords` |
| C12, Q13 | Chia sẻ bộ tiêu chí trong khoa, CRUD theo vai trò/owner | P1, P5 | `permissions.js`, `criteria` |
| C13 | Tách Quản trị viên (kỹ thuật) / PĐT (nghiệp vụ) | P3, P10 | `menus.js`, `settings`, `email-outbox` |
| C14 | Đăng nhập để theo dõi/sửa/rút | P3, P7 | xóa `PublicApplyModal`, `my-applications` |
| C15, BR-16 | Minh chứng theo tiêu chí; audit; thông báo; báo cáo; nộp nhiều đợt | P5, P7, P10, P9 | `evidenceGuide`, `EvidenceUploader`, `audit`, `reports`, D-08 |
| C16, BR-05 | Không ràng buộc bộ tiêu chí theo năm | P6 | form ĐXT chọn bất kỳ bộ PUBLISHED cùng khoa (bỏ ý “ràng buộc chọn bộ tiêu chí theo năm” ở MP 8.3) |
| C17 | 6 trạng thái ĐXT | P1, P6 | `constants.js` |
| 4.2, 4.3, BR-11, BR-14 | RBAC + phạm vi | P1, P3, P4 | `permissions.js`, `RoleSwitcher`, `permissions` |
| 5.1 | Vòng đời lớp, membership theo năm | P1, P4, P9 | `selectors.js`, `classes/:id` |
| 5.2, BR-04, BR-06 | Vòng đời ĐXT, ràng buộc, snapshot | P1, P2, P6 | `round-machine.js`, `scheduler.js` |
| 5.3, BR-09 | Chấm điểm | P1, P5 | `scoring.js` |
| 5.4, BR-01, BR-02, BR-07, BR-08 | Nộp hồ sơ | P3, P7 | `applications.js` |
| 5.5 | Xét duyệt | P8 | `reviews.js`, workspace duyệt |
| 5.6, BR-12 | Chuỗi phê duyệt, phiên bản | P9 | `lists.js` |
| 5.7, BR-03, BR-10, BR-13, Q2, Q7 | Công bố | P9 | `publish.js`, `#/ket-qua`, `#/tra-cuu` |
| 5.8 | Duy trì & cạnh tranh, dòng thời gian năm | P1, P7, P9 | `ranking.js`, `ProgramTimeline` |
| 5.9, U7 | TK, MK | P3, P4 | `auth.js`, `users.js` |
| 5.10 | Thông báo | P2, P3, P10 | `notify()`, `NotificationBell` |
| BR-15 | Audit | P2–P10 | `audit()` trong mọi service |
| §10 | Menu theo vai trò, nguyên tắc UI | P3–P10 | `menus.js` |
| §13 | Test & UAT | P1, P2, P11 | §12 |

---

## 14. Hàng rào kiểm soát, Definition of Done, mẫu báo cáo

### 14.1 Không được làm
- Không thêm backend/server, không fetch mạng, không thêm thư viện UI/router/state/test.
- Không đặt logic nghiệp vụ (điều kiện trạng thái, chấm điểm, quyền) trong component.
- Không viết cứng tên lớp/ngành/khoa/MSSV trong logic (chỉ được có trong seed).
- Không dùng `Date.now()`/`new Date()` không tham số trong `src/domain` và `src/mock/services` (dùng `ctx.now`).
- Không giữ trạng thái ĐXT `closed`, không giữ `kind` cho ĐXT, không giữ bước “SV xác nhận nhập học”, không giữ form nộp hồ sơ không cần đăng nhập.
- Không cho xóa TK giảng viên, không cho xóa audit log, không cho sửa ĐXT `published`.
- Không đổi token thiết kế, không thêm mã hex/`text-[..px]` vào JSX, không bỏ `useDialogA11y`/focus management hiện có.
- Không xóa/sửa tài liệu nguồn (`Web KSNT - Development Plan - Master Plan.md`, `NGHIEP-VU.md`, `PRODUCT.md`).

### 14.2 Definition of Done (toàn dự án)
1. `npm test` (hoặc `node --test "src/**/*.test.js"`) xanh, đủ danh sách §12.2.
2. `node node_modules/vite/bin/vite.js build` thành công cho cả 7 entry HTML.
3. U1–U15 đạt, có ghi chép trong `coding_plan/progress/UAT-results.md`.
4. Tất cả G-01…G-25 ở §2.2 được đánh dấu xử lý trong báo cáo cuối, kèm đường dẫn file.
5. Không còn import tới `src/data/demo-store.jsx`, `src/data/admissions.js`, `src/data/fixtures.js`.
6. Kiểm tra grep:
   ```bash
   grep -rn "closed" src --include=*.js --include=*.jsx      # không còn là trạng thái ĐXT
   grep -rn "canAccessRound\|currentStudentId\|12345678" src  # 0 kết quả
   grep -rnE "Date\.now\(\)|new Date\(\)" src/domain src/mock/services   # 0 kết quả
   grep -rnE "#[0-9a-fA-F]{3,6}\b|text-\[[0-9.]+px\]" src --include=*.jsx  # 0 kết quả mới
   ```
7. Giao diện không cuộn ngang ở 1440/1024/390; console sạch.
8. `coding_plan/README-PROTOTYPE.md` có: cách chạy, bảng TK demo, kịch bản trình diễn 10 phút (gợi ý: U1 → duyệt R2 → chốt → CNN/BLĐ/PĐT công bố R5 → tra cứu kết quả công khai).

### 14.3 Mẫu báo cáo giai đoạn (`coding_plan/progress/P<n>-report.md`)

```markdown
# Báo cáo P<n> – <tên giai đoạn>
- Ngày: …
- Trạng thái cổng: ĐẠT / CHƯA ĐẠT
## Đã làm
- … (file: đường dẫn)
## Gap đã xử lý
- G-xx: … (file)
## Kết quả kiểm tra
- npm test: <số test> pass / <số> fail (dán phần tóm tắt)
- build: OK / lỗi (dán)
- Kiểm thủ công theo cổng: từng mục Đạt/Không đạt
## Quyết định phát sinh (đã ghi vào DECISIONS-ADDENDUM.md)
- …
## Rủi ro / việc còn lại
- …
```

---

## 15. Phụ lục

### 15.1 Seed tiêu chí CS-2 (dạng dữ liệu)

```js
{
  id: "cs_2", rootId: "cs_2", version: 1, facultyId: "fac_cntt", majorId: "maj_ktpm", createdBy: "usr_gv005",
  name: "Duy trì & bổ sung năm 3 – theo Assessment Sample", status: "PUBLISHED",
  criteria: [
    { id: "c_tc_dat",  name: "Số tín chỉ đạt",            kind: "REQUIRED", valueType: "NUMBER_THRESHOLD", unit: "tín chỉ", evidenceRequired: true,  evidenceGuide: "Bảng điểm năm học có xác nhận (PDF).", tieBreakOrder: null, refCriterionId: null, sortOrder: 1, levels: [ { id: "l1", label: "Đạt", operator: "GTE", valueFrom: 38, points: 5 } ] },
    { id: "c_tc_rot",  name: "Số tín chỉ không đạt",      kind: "REQUIRED", valueType: "NUMBER_THRESHOLD", unit: "tín chỉ", evidenceRequired: false, evidenceGuide: "Dùng chung bảng điểm.", tieBreakOrder: null, sortOrder: 2, levels: [ { id: "l1", label: "Không nợ môn", operator: "EQ", valueFrom: 0, points: 5 } ] },
    { id: "c_gpa",     name: "GPA năm 2",                 kind: "REQUIRED", valueType: "NUMBER_THRESHOLD", unit: "/4.0",   evidenceRequired: true,  evidenceGuide: "Bảng điểm năm 2 (PDF).", tieBreakOrder: 1, sortOrder: 3, levels: [ { id: "l1", label: "Giỏi", operator: "GTE", valueFrom: 3.2, points: 30 }, { id: "l2", label: "Giỏi+", operator: "GTE", valueFrom: 3.4, points: 40 }, { id: "l3", label: "Xuất sắc", operator: "GTE", valueFrom: 3.6, points: 50 } ] },
    { id: "c_rl",      name: "Rèn luyện năm 2",           kind: "REQUIRED", valueType: "NUMBER_THRESHOLD", unit: "điểm",   evidenceRequired: true,  evidenceGuide: "Phiếu điểm rèn luyện (PDF/ảnh).", tieBreakOrder: 3, sortOrder: 4, levels: [ { id: "l1", label: "Tốt", operator: "GT", valueFrom: 80, points: 20 } ] },
    { id: "c_ta",      name: "Tiếng Anh",                 kind: "REQUIRED", valueType: "NUMBER_THRESHOLD", unit: "TOEIC",  evidenceRequired: true,  evidenceGuide: "Chứng chỉ còn hạn; IELTS/khác quy đổi theo bảng của khoa.", tieBreakOrder: 2, sortOrder: 5, levels: [ { id: "l1", label: "Chuẩn", operator: "GTE", valueFrom: 450, points: 20 } ] },
    { id: "c_nckh",    name: "Thành tích NCKH",           kind: "REQUIRED", valueType: "COUNT", countMode: "LEVEL", unit: "thành tích", evidenceRequired: true, evidenceGuide: "Mỗi thành tích 1 minh chứng (giấy chứng nhận/bài báo).", sortOrder: 6, levels: [ { id: "l1", label: "Có ≥ 1 thành tích", operator: "GTE", valueFrom: 1, points: 20 } ] },
    { id: "c_ta_ut",   name: "Tiếng Anh nâng cao",        kind: "PRIORITY", valueType: "NUMBER_THRESHOLD", unit: "TOEIC",  evidenceRequired: false, refCriterionId: "c_ta", sortOrder: 7, levels: [ { id: "l1", label: "Nâng cao", operator: "GTE", valueFrom: 550, points: 20 } ] },
    { id: "c_contest", name: "Cuộc thi chuyên ngành",     kind: "PRIORITY", valueType: "ACCUMULATIVE_ENUM", unit: "giải", evidenceRequired: true, evidenceGuide: "Giấy chứng nhận giải (PDF/ảnh) cho từng giải.", maxPoints: null, sortOrder: 8, levels: [ { id: "g1", label: "Giải Nhất", points: 40 }, { id: "g2", label: "Giải Nhì", points: 30 }, { id: "g3", label: "Giải Ba", points: 20 }, { id: "g4", label: "Giải Khuyến khích", points: 10 } ] }
  ]
}
// Hồ sơ mẫu (Nam, R2): c_tc_dat 40 · c_tc_rot 0 · c_gpa 3.5 · c_rl 85 · c_ta 600 · c_nckh count 1 · c_contest entries [g1, g3] ⇒ 190
```

### 15.2 Mẫu email (giá trị mặc định `config.templates`)

| Key | Tiêu đề | Nội dung (rút gọn, có biến) |
|---|---|---|
| `OTP_REGISTER` | [IUH CN/KSTN] Mã xác thực đăng ký tài khoản | Mã OTP của bạn là **{{code}}**, hiệu lực {{ttl}} phút. Không chia sẻ mã này. |
| `OTP_LOOKUP` | [IUH CN/KSTN] Mã tra cứu kết quả | Mã OTP tra cứu: **{{code}}** ({{ttl}} phút). |
| `OTP_CHANGE_EMAIL` | [IUH CN/KSTN] Xác nhận email mới | Mã xác nhận: **{{code}}**. |
| `PASSWORD_RESET_LINK` | Đặt lại mật khẩu | Truy cập {{link}} trong {{ttl}} phút để đặt lại mật khẩu. |
| `PASSWORD_TEMP` | Mật khẩu tạm thời | Mật khẩu tạm: **{{password}}**. Bạn sẽ được yêu cầu đổi ngay khi đăng nhập. |
| `APPLICATION_SUBMITTED` | Đã tiếp nhận hồ sơ {{applicationCode}} | Hồ sơ của {{name}} vào {{roundName}} đã được tiếp nhận lúc {{time}}. Mã hồ sơ: {{applicationCode}}. |
| `DRAFT_REMINDER` | Nhắc nộp hồ sơ – còn {{hours}} giờ | Bạn còn bản nháp ở {{roundName}} chưa nộp. Hạn: {{deadline}}. |
| `ROUND_OPENED` | {{roundName}} đã mở tiếp nhận | Lớp {{classCode}} mở ĐXT năm {{studyYear}}. Vui lòng cập nhật hồ sơ tích lũy trước {{deadline}}. |
| `ROUND_CLOSING` | {{roundName}} sắp đóng tiếp nhận | Còn {{hours}} giờ để cập nhật hồ sơ tích lũy. |
| `NEEDS_UPDATE` | Yêu cầu bổ sung hồ sơ {{applicationCode}} | {{message}} — Hạn bổ sung: {{dueAt}}. |
| `NEEDS_UPDATE_EXPIRED` | Hồ sơ {{applicationCode}} quá hạn bổ sung | Hồ sơ được ghi nhận Không đạt do quá hạn bổ sung. |
| `LIST_WAITING` | Danh sách {{roundCode}} chờ bạn xử lý | Phiên bản v{{version}} đang chờ {{levelLabel}}. |
| `LIST_RETURNED` | Danh sách {{roundCode}} bị trả về | {{levelLabel}} trả về: {{reason}}. |
| `LIST_REMINDER` | Nhắc việc phê duyệt {{roundCode}} | Danh sách đã chờ {{days}} ngày. |
| `RESULT_CONFIRMED` | Kết quả xét tuyển {{roundName}} | Chúc mừng {{name}} đã trúng tuyển lớp {{classCode}}. |
| `RESULT_NOT_ADMITTED` | Kết quả xét tuyển {{roundName}} | Hồ sơ đạt điều kiện nhưng ngoài chỉ tiêu. Bạn có thể nộp ở các ĐXT bổ sung tiếp theo. |
| `RESULT_REJECTED` | Kết quả xét tuyển {{roundName}} | Hồ sơ không đạt điều kiện: {{reason}}. |
| `RESULT_DROPPED` | Kết quả duy trì lớp {{classCode}} | Bạn không tiếp tục là thành viên lớp từ năm đào tạo {{studyYear}} (lý do: {{reason}}). Bạn vẫn có thể nộp ở các ĐXT bổ sung sau. |

### 15.3 Mã hành động audit (gợi ý, dùng thống nhất)

`LOGIN, LOGIN_FAILED, ACCOUNT_LOCKED, PASSWORD_CHANGED, PASSWORD_RESET, ROLE_SWITCHED, STUDENT_REGISTERED, PROFILE_UPDATED, CATALOG_CREATED/UPDATED/DELETED, PROGRAM_*, CLASS_*, MEMBERSHIP_WITHDRAWN, LECTURER_CREATED/UPDATED/LOCKED/UNLOCKED, STUDENT_LOCKED/UNLOCKED, ROLE_ASSIGNED, ROLE_REVOKED, CRITERIA_SET_CREATED/UPDATED/DELETED/PUBLISHED/ARCHIVED/VERSIONED, ROUND_CREATED/UPDATED/DELETED/RELEASED/OPENED/REVIEW_STARTED/TRANSITION_MANUAL, CRITERIA_SNAPSHOT_TAKEN, APPLICATION_DRAFT_SAVED/SUBMITTED/EDITED/WITHDRAWN/CANCELLED/RESUBMITTED, ITEM_VERIFIED, SCORE_CHANGED, APPLICATION_APPROVED/REJECTED/NEEDS_UPDATE/REOPENED/EXPIRED, LIST_CREATED, LIST_APPROVED, LIST_RETURNED, TIE_RESOLVED, ROUND_PUBLISHED, IS_KSTN_CHANGED, MEMBERSHIP_CHANGED, EMAIL_RESENT, CONFIG_CHANGED, DEMO_CLOCK_SET, DEMO_RESET`

### 15.4 Câu lệnh tự kiểm nhanh cho Agent

```bash
# 1. Domain không phụ thuộc trình duyệt/React
grep -rnE "window|document|localStorage|indexedDB|from \"react" src/domain src/mock/services
# 2. Không còn dùng store cũ
grep -rn "useDemoStore\|demo-store\|data/admissions\|data/fixtures" src
# 3. Test + build
node --test "src/**/*.test.js" && node node_modules/vite/bin/vite.js build
```

---

_Hết tài liệu. Nếu một yêu cầu trong tài liệu này mâu thuẫn với mục “ĐÃ CHỐT” của Master Plan, Master Plan thắng — ghi lại mâu thuẫn trong báo cáo giai đoạn._
