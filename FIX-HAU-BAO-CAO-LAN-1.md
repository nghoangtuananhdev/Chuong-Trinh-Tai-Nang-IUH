# FIX-HAU-BAO-CAO-LAN-1 — Kế hoạch sửa sau báo cáo lần 1

> Tài liệu này dành cho một AI/lập trình viên **không có ngữ cảnh của phiên làm việc trước**. Đọc hết mục 1–4 trước khi sửa dòng code nào. Mọi đường dẫn tính từ thư mục gốc repo `web-kstn-iuh/`.
>
> Ngày lập: 12/11/2026. Trạng thái mã nguồn khi lập: nhánh `main`, commit `db5095b`, **245/245 test đạt**.

---

## 1. Bối cảnh dự án

### 1.1 Sản phẩm
Cổng xét tuyển chương trình **Cử nhân tài năng / Kỹ sư tài năng (CN/KSTN)** của IUH. Đây là **prototype chạy hoàn toàn trên trình duyệt**: không có backend thật, dữ liệu nằm trong `localStorage`, tệp minh chứng nằm trong IndexedDB, thời gian là **đồng hồ mô phỏng** (`db.clock.now`) điều khiển qua "Bảng điều khiển demo".

Sáu vai trò: Quản trị viên (ADMIN), Phòng Đào tạo (TRAINING), Ban lãnh đạo khoa (DEAN), Chủ nhiệm ngành — CNN (HEAD), Giảng viên phụ trách — GVPT (LECTURER), Sinh viên (STUDENT).

Thuật ngữ: **ĐXT** = đợt xét tuyển (`round`); **BB/UT** = tiêu chí bắt buộc/ưu tiên; **Luồng A/B/C** = đăng ký mới / nộp bổ sung / duy trì.

### 1.2 Công nghệ và lệnh
- React 19, Vite 8, Tailwind v4, `lucide-react`. **Không thêm dependency mới** (kể cả thư viện đọc `.xlsx`).
- Test: `node --test "src/**/*.test.js"` (Node ≥ 20, không cần pnpm).
- Build kiểm tra: `node node_modules/vite/bin/vite.js build --outDir /tmp/kstn-prototype-build` — **không ghi đè `dist/`**.
- Chạy dev: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173`. Tài khoản mẫu đều dùng mật khẩu trong `src/mock/seed/users.js` và `src/mock/seed/directory.js`.

### 1.3 Kiến trúc (bắt buộc tuân thủ — có test kiến trúc canh)
```
src/domain/          Luật nghiệp vụ thuần. KHÔNG import ngoài domain, KHÔNG dùng window/document/Date.now()/new Date().
src/mock/services/   Mỗi thao tác là một service tạo bằng defineService(). Chỉ import từ domain/ và ./_kernel.js.
src/mock/seed/       Dữ liệu mẫu.
src/mock/client.js   Hàng đợi gọi service; sau MỖI lần gọi sẽ chạy scheduler tick().
src/features/        Màn hình. Đọc thẳng `db` từ useBackend(), ghi qua `call()` / `useAction().run()`.
src/components/      ui/, layout/, data/, domain-ui/ dùng chung.
```
- `src/mock/architecture.test.js` kiểm tra luật import và đuôi `.js` đầy đủ trong mọi import của domain/service.
- Service trả `{ result, effects }`, ném `DomainError` qua `requireValue(cond, code, message)`. Mọi thay đổi phải ghi `audit(...)`; thay đổi trạng thái hồ sơ ghi thêm `applicationHistory(...)`.
- Quyền: `PERMISSION_MATRIX` trong `src/domain/permissions.js`; phạm vi qua `resolveScopeChain` trong `src/domain/scope.js` (đã hỗ trợ các `type`: faculty, major, program, class, round, application, membership, criteriaSet, user).
- `useAction().run(name, payload, message)` trong `src/features/shared/FeatureKit.jsx`: tham số thứ ba là nội dung toast thành công, mặc định `"Đã lưu thay đổi."`; truyền `""` để **không** hiện toast.

### 1.4 Quy ước giao diện (xem `DESIGN.md`)
- Tiếng Việt có dấu. Chỉ dùng semantic token; **cấm** mã hex, `text-[..px]`, màu Tailwind mặc định, gradient, emoji, thẻ lồng thẻ.
- Bảng dùng `DataList`/`ResponsiveTable`, phân trang tối đa 10 dòng.
- Form dùng `Field`; xác nhận dùng `ConfirmDialog`; form trong `Modal` đặt `closeOnBackdrop={false}`; xem chi tiết dùng `Drawer`.
- Kiểm tra ở 1440, 1024 và 390px: không cuộn ngang toàn trang.

### 1.5 Tài liệu nghiệp vụ gốc (nền vẫn giữ nguyên)
- `coding_plan/KSTN-PROTOTYPE-IMPLEMENTATION-PLAN.md` — kế hoạch gốc, có các mã quyết định D-xx, BR-xx.
- `coding_plan/DECISIONS-ADDENDUM.md` — quyết định bổ sung A-01…A-15. **Các quyết định mới của tài liệu này ghi tiếp từ A-16.**
- `NGHIEP-VU.md`, `DESIGN.md`, `coding_plan/UAT-TEST-GUIDE.md`, `coding_plan/Huong-Dan-Demo.md`.

**Nguyên tắc:** chỉ thay đổi những gì nêu ở mục 4–5. Mọi nghiệp vụ khác (chốt danh sách, phê duyệt ba cấp CNN → BLĐ khoa → PĐT, xếp hạng, công bố, tiêu chí, phân quyền) giữ nguyên.

---

## 2. Nhận xét của giảng viên (nguyên văn) và cách hiểu

| # | Nguyên văn | Cách hiểu dùng trong kế hoạch | Gói việc |
|---|---|---|---|
| N1 | "duyệt: cho GV duyệt thoải mái, không bị ghan thời gian" / "Cho duyệt bất kể thgian" | GV được xác minh và ra quyết định hồ sơ ngay khi hồ sơ đã nộp, không phải chờ hết thời gian tiếp nhận, không bị chặn bởi ngày kết thúc xét duyệt. | WP1 |
| N2 | "nhận hồ sơ (ngày bắt đầu và kết thúc); ngày xét duyệt (ngày bắt đầu & kết thúc – thời gian có thể overlap lên giai đoạn nhận hồ sơ)" | Mỗi ĐXT có hai khoảng thời gian độc lập. Khoảng xét duyệt được phép chồng lên khoảng tiếp nhận. | WP1 |
| N3 | "các khoảng thời gian này GV đều có thể chỉnh sửa được" / "Customize các giai đoạn" | GVPT sửa được cả bốn mốc (kể cả rút ngắn/gia hạn, mở lại tiếp nhận). | WP1 |
| N4 | "chỗ duyệt hồ sơ khi không hợp lệ: không cần thông báo đỏ lên, chỉ cần tick không hợp lệ ngay tiêu chí đó là được" | Bỏ khung cảnh báo đỏ ở đầu màn duyệt; đánh dấu "Không hợp lệ" bằng một thao tác ngay tại tiêu chí, không bị chặn bởi toast lỗi đòi nhập lý do. | WP2 |
| N5 | "duyệt hồ sơ xét tuyển đang bị bug ở luồng sửa đổi bổ sung" | Giảng viên không nói rõ lỗi nào. Mục 3.3 liệt kê các lỗi đã tái hiện được; sửa hết. | WP2, WP3 |
| N6 | "Nộp hồ sơ rồi thì chỉ thông báo đã nộp thành công" | Sau khi nộp, sinh viên thấy màn xác nhận nộp thành công, không quay lại wizard với điểm dự kiến. | WP4 |
| N7 | "Không thể liên kết được với dữ liệu gốc của trường (Phải được import sẵn chỉ từ các chủ nhiệm ngành)" / "Import danh sách của sinh viên các khóa vô trước rồi đăng ký sau." | Bỏ khái niệm "danh bạ IUH có sẵn". CNN nhập danh sách sinh viên theo khóa; chỉ sinh viên có trong danh sách mới đăng ký được tài khoản. | WP5 |
| N8 | "Đăng ký trước tài khoản và hệ thống sẽ xác định các lớp phù hợp. (Buộc phải đăng ký tài khoản trước)" | Phải có tài khoản mới nộp hồ sơ (đã đúng). Sau khi đăng nhập, hệ thống tự xác định lớp CN/KSTN phù hợp theo **ngành + khóa** của sinh viên và chỉ cho nộp vào ĐXT của lớp đó. | WP5 |

### Giả định cần người dùng xác nhận (không chặn việc thực thi)
- **G1 — "Customize các giai đoạn"** được hiểu là tùy chỉnh **thời gian** của hai giai đoạn tiếp nhận/xét duyệt. Không làm tính năng thêm/bớt/đổi tên giai đoạn tùy ý.
- **G2 — "Lớp phù hợp"** = lớp có cùng ngành và cùng khóa với sinh viên trong danh sách CNN đã nhập (NGHIEP-VU.md: mỗi ngành mỗi khóa có một lớp).
- **G3 — N6** được hiểu là cả màn xác nhận sau khi nộp lẫn việc ẩn wizard/điểm dự kiến khi xem lại hồ sơ đã nộp.

Nếu khi thực thi phát hiện giả định mâu thuẫn với code/tài liệu, ghi vào báo cáo cuối và làm theo cách hiểu trong bảng.

---

## 3. Hiện trạng mã nguồn liên quan

### 3.1 Mô hình thời gian hiện tại (nguyên nhân của N1–N3)
- `src/domain/round-machine.js`
  - `ROUND_TRANSITIONS`: `draft → upcoming → open → review → approving → published` (approving có thể quay về review).
  - `validateTimeline()` bắt buộc `intakeEnd <= reviewStart` ⇒ **không cho chồng lấn**.
  - `editableFields(status, role)`: GVPT ở `open` chỉ sửa `intakeEnd/reviewStart/reviewEnd/approvalDue`; ở `review` chỉ `reviewEnd/approvalDue`.
- `src/mock/services/rounds.js` → `update`: khi `open`, `intakeEnd` chỉ được **gia hạn**, không được rút ngắn.
- `src/domain/scheduler.js` → `tick()`: `upcoming → open` khi tới `intakeStart` (chụp snapshot tiêu chí); `open → review` khi tới `intakeEnd` (hủy toàn bộ bản nháp). `reviewStart`/`reviewEnd` **không** tạo chuyển trạng thái nào.
- `src/domain/application-machine.js` → `assertTransition()`: GVPT/CNN chỉ được ra quyết định khi `round.status === "review"`; hạn bổ sung phải `<= round.reviewEnd`; sinh viên chỉ gửi bổ sung khi `round.status === "review"`.
- `src/mock/services/reviews.js` → `reviewing()`: chặn `verifyItem`/`decide` nếu `round.status !== "review"`.
- `src/features/reviews/ReviewsPage.jsx`: `editable = !readOnly && target.status === "review" && app.status === "pending"`.

Hệ quả: GV phải chờ hết hạn tiếp nhận mới duyệt được; quá `reviewEnd` thì không đặt được hạn bổ sung.

### 3.2 Màn duyệt hồ sơ (`src/features/reviews/ReviewsPage.jsx`, `src/mock/services/reviews.js`)
- Có `<Callout tone="danger">Hồ sơ chưa đạt tiêu chí bắt buộc: …</Callout>` ở đầu trang ⇒ đây là "thông báo đỏ" (N4).
- Bấm "Không hợp lệ" mà chưa gõ ô "Ý kiến thẩm định" (nằm tận cuối trang) ⇒ toast lỗi "Vui lòng ghi lý do minh chứng không hợp lệ." (do `verifyItem` bắt buộc `note` khi INVALID).
- Một ô `note` dùng chung cho: ghi chú xác minh từng tiêu chí, lý do điều chỉnh giá trị, lý do quyết định, lý do mở lại.

### 3.3 Lỗi đã tái hiện ở luồng "yêu cầu bổ sung" (N5)
Tái hiện bằng GV001 → hồ sơ `seed_app_6` (SV 21094518, ĐXT `DXT-2026-02`) → đánh dấu không hợp lệ → Yêu cầu bổ sung → đăng nhập SV → Gửi bổ sung.

| Mã | Lỗi | Vị trí |
|---|---|---|
| B1 | Ghi chú xác minh bị dùng lại: gõ một lý do rồi bấm xác minh tiêu chí khác thì cùng lý do đó bị ghi vào tiêu chí khác và vào cả quyết định (lịch sử hiện hai dòng cùng nội dung). | `ReviewsPage.jsx` (state `note` dùng chung, không xóa sau `verify`) |
| B2 | Bấm "Hợp lệ"/"Không hợp lệ" lần sau làm mất giá trị điều chỉnh đã lưu (`item.verifiedValue` bị gán `null` khi không gửi `verifiedValue`). | `reviews.js` → `verifyItem` |
| B3 | Bấm "Yêu cầu bổ sung" khi chưa chọn hạn ⇒ toast khó hiểu "Thời gian không hợp lệ. Vui lòng nhập đủ ngày, giờ và múi giờ." Ô hạn luôn hiển thị nhưng không có dấu bắt buộc. | `ReviewsPage.jsx`, `application-machine.js` |
| B4 | Sau khi yêu cầu bổ sung, màn duyệt còn trơ một ô "Ý kiến thẩm định" không có nút nào; GV không thấy mình đang chờ gì, đến khi nào, và không hủy được yêu cầu (bị kẹt, không chốt được danh sách tới khi quá hạn). | `ReviewsPage.jsx`, `application-machine.js` |
| B5 | Sinh viên chỉ thấy lời nhắn chung, **không biết tiêu chí nào bị đánh dấu không hợp lệ**. | `StudentPortal.jsx`, `CriterionField.jsx` |
| B6 | Đầu trang hồ sơ SV vẫn ghi "Hạn tiếp nhận: 31/10/26" (đã qua) trong khi đang ở hạn bổ sung. | `StudentPortal.jsx` |
| B7 | Gửi bổ sung xong: toast chung "Đã lưu thay đổi.", trang đứng yên ở bước 3 của wizard với mỗi nút "Quay lại". | `StudentPortal.jsx` |
| B8 | Gửi bổ sung khi chưa sửa gì ⇒ chỉ báo lỗi sau khi bấm; nút không bị vô hiệu trước. | `StudentPortal.jsx` |
| B9 | Sau khi SV gửi bổ sung, GV không biết tiêu chí nào vừa được sửa. | `applications.js`, `ReviewsPage.jsx` |
| B10 | Không đặt được hạn bổ sung sau `reviewEnd` dù ĐXT vẫn ở trạng thái `review`. | `application-machine.js` |

### 3.4 Đăng ký và "danh bạ" (N7, N8)
- `db.schoolDirectory` được seed sẵn trong `src/mock/seed/directory.js` (giả lập dữ liệu gốc của trường). Không có chức năng nhập.
- `src/mock/services/otp.js` → `request`: chỉ gửi OTP khi `studentCode + email` khớp một dòng `schoolDirectory`. `src/mock/services/account.js` → `registerStudent`: tạo `users` + `studentProfiles` từ dòng đó.
- `src/domain/flows.js` → `classifyFlow()`: **không** xét ngành/khóa; sinh viên chưa thuộc lớp nào nộp được vào mọi ĐXT đang mở.
- Lớp có sẵn trường `cohort` (ví dụ `"K22"`), `programId → majorId` (`src/mock/seed/catalog.js`). Sinh viên/danh bạ **chưa có** trường khóa.

---

## 4. Quyết định thiết kế (ghi vào `coding_plan/DECISIONS-ADDENDUM.md`)

**A-16 — Xét duyệt tách khỏi trạng thái ĐXT.** Giữ nguyên 6 trạng thái ĐXT. Ý nghĩa mới: `open` = đang tiếp nhận (GV đã được duyệt); `review` = đã đóng tiếp nhận, còn xét duyệt. GVPT/CNN được xác minh và ra quyết định khi ĐXT ở `open` **hoặc** `review`. `reviewStart`/`reviewEnd` là **khung dự kiến để hiển thị**, không chặn thao tác.

**A-17 — Luật thời gian mới.** `intakeStart < intakeEnd`; `reviewStart < reviewEnd`; `intakeStart <= reviewStart`; `intakeEnd <= reviewEnd`; `approvalDue >= reviewEnd` (nếu có). Bỏ luật `intakeEnd <= reviewStart`.

**A-18 — GVPT sửa được các mốc thời gian.** Theo trạng thái:
| Trạng thái | Trường thời gian sửa được (mọi vai trò có `round.editTimeline`) |
|---|---|
| draft | giữ như cũ (GVPT không sửa bản nháp) |
| upcoming | cả 5 mốc (như cũ) |
| open | `intakeEnd`, `reviewStart`, `reviewEnd`, `approvalDue` — `intakeEnd` được **rút ngắn hoặc gia hạn**, miễn là sau thời điểm hiện tại |
| review | `intakeEnd`, `reviewStart`, `reviewEnd`, `approvalDue` — đặt `intakeEnd` sau hiện tại = **mở lại tiếp nhận** (ĐXT về `open`) |
| approving, published | không sửa (như cũ) |

**A-19 — Hạn bổ sung.** Chỉ cần sau thời điểm hiện tại; bỏ ràng buộc `<= reviewEnd`. Vẫn bắt buộc có hạn; quá hạn hệ thống tự chuyển "Không đạt" như cũ (GV mở lại được). GV được **hủy yêu cầu bổ sung** để lấy hồ sơ về "Chờ duyệt".

**A-20 — Một hồ sơ sống cho mỗi sinh viên trong một ĐXT.** Vì hồ sơ có thể bị "Không đạt" ngay khi ĐXT còn mở, trạng thái `rejected` cũng chặn tạo hồ sơ mới trong cùng ĐXT (muốn làm lại: GV mở lại hoặc yêu cầu bổ sung). Chỉ `withdrawn`/`cancelled` mới cho tạo hồ sơ mới.

**A-21 — Đánh dấu không hợp lệ không bắt buộc lý do.** Lý do chỉ bắt buộc khi **điều chỉnh giá trị** sinh viên khai và khi ra quyết định "Không đạt"/"Yêu cầu bổ sung"/"Mở lại". Ghi chú xác minh là tùy chọn và thuộc riêng từng tiêu chí/thành tích.

**A-22 — Danh sách sinh viên do CNN nhập.** `db.schoolDirectory` giữ tên collection nhưng đổi ý nghĩa thành "danh sách sinh viên được phép đăng ký", chỉ CNN nhập cho ngành mình, theo khóa. Giao diện không còn dùng chữ "danh bạ IUH".

**A-23 — Lớp phù hợp.** Sinh viên chưa thuộc lớp CN/KSTN chỉ được nộp vào ĐXT của lớp có `program.majorId === profile.majorId` và `class.cohort === profile.cohort`. Sinh viên đang học lớp CN/KSTN (luồng C) giữ luật cũ.

**A-24 — Tăng `SCHEMA_VERSION` lên 4** để dữ liệu cũ trong trình duyệt tự nạp lại seed mới.

---

## 5. Các gói việc

Thực hiện đúng thứ tự WP1 → WP6. Sau mỗi gói: chạy toàn bộ test, sửa test cũ bị ảnh hưởng **theo luật mới** (không xóa test để cho qua), thêm test mới nêu trong gói.

---

### WP1 — Tiếp nhận và xét duyệt chồng lấn, duyệt không bị gắn thời gian (N1, N2, N3)

#### 1A. Domain
`src/domain/round-machine.js`
1. `ROUND_TRANSITIONS.review` thành `["approving", "open"]`.
2. Thêm và export:
   - `canReviewApplications(round)` → `["open", "review"].includes(round?.status)`.
   - `phaseState(start, end, now)` → `"upcoming" | "active" | "ended"` (dùng `timestamp` từ `./time.js`).
3. `validateTimeline()` theo A-17. Thông báo lỗi:
   - "Ngày bắt đầu xét duyệt không được trước ngày bắt đầu tiếp nhận." (`field: "reviewStart"`)
   - "Ngày kết thúc xét duyệt không được trước ngày kết thúc tiếp nhận." (`field: "reviewEnd"`)
   - giữ các thông báo còn lại.
4. `editableFields()` theo bảng A-18 (thêm `intakeEnd`, `reviewStart` cho trạng thái `review`; phần `quota`/`description` cho vai trò quản lý giữ nguyên).

`src/domain/application-machine.js` → `assertTransition()`
5. Nhánh GVPT/CNN: điều kiện giai đoạn đổi thành `canReviewApplications(round)`; cho thêm chuyển `needs_update → pending` (hủy yêu cầu bổ sung, bắt buộc `note`). Thông báo: "Chỉ GVPT hoặc CNN được xét duyệt hồ sơ khi ĐXT đang tiếp nhận hoặc đang xét duyệt."
6. Hạn bổ sung: chỉ còn `timestamp(now) < timestamp(dueAt)`; thông báo "Hạn bổ sung phải sau thời điểm hiện tại." Nếu `dueAt` rỗng: "Vui lòng chọn hạn bổ sung." (kiểm tra trước khi gọi `timestamp`).
7. Sinh viên `needs_update → pending`: cho phép khi `canReviewApplications(round)` và chưa quá hạn.
8. Nhánh `system`: `needs_update → rejected` cho phép khi `canReviewApplications(round)`.

`src/domain/scheduler.js`
9. Vòng tự chuyển hồ sơ quá hạn bổ sung: điều kiện `round?.status !== "review"` đổi thành `!canReviewApplications(round)`.
10. Thông báo lúc đóng tiếp nhận: tiêu đề "ĐXT đã đóng tiếp nhận hồ sơ", nội dung giữ số hồ sơ chờ duyệt.
11. Khi `upcoming → open`: thêm thông báo cho GVPT + CNN trong phạm vi (dùng `roleRecipients`): "ĐXT đã mở tiếp nhận — có thể xét duyệt hồ sơ ngay khi sinh viên nộp", link `/app/reviews?round=<id>`.

#### 1B. Service
`src/mock/services/reviews.js`
12. `reviewing()`: dùng `canReviewApplications(round)`; thông báo "Chỉ xét duyệt hồ sơ chờ duyệt khi ĐXT đang tiếp nhận hoặc đang xét duyệt."
13. Thêm service `reviews.cancelRequest` (`permission: "application.review"`): hồ sơ `needs_update` → `pending`, đóng `reviewRequest` đang mở (`resolvedAt = ctx.now`, thêm `cancelledBy`), bắt buộc `reason`, ghi history "Hủy yêu cầu bổ sung", audit `APPLICATION_REQUEST_CANCELLED`, thông báo cho sinh viên.

`src/mock/services/rounds.js` → `update`
14. Khi ĐXT `open` và đổi `intakeEnd`: chỉ yêu cầu `intakeEnd > now`; thông báo "Ngày kết thúc tiếp nhận phải sau thời điểm hiện tại." (bỏ luật không được rút ngắn).
15. Khi ĐXT `review` và đổi `intakeEnd`: yêu cầu `intakeEnd > now`, sau đó `assertTransition("review", "open")`, đặt `status = "open"`, `reviewStartedAt = null`, audit `ROUND_INTAKE_REOPENED`, thông báo GVPT + CNN. Không khôi phục các bản nháp đã bị hủy.
16. Đoạn tự chuyển `manual transition` (`rounds.transition`) giữ nguyên.

`src/mock/services/applications.js`
17. `createDraft`: thêm `"rejected"` vào danh sách trạng thái chặn (A-20); thông báo giữ nguyên.
18. `mutate("resubmit")`: không đổi luật, nhưng đánh dấu các tiêu chí vừa sửa — xem WP3 bước 4.

`src/mock/services/lists.js` — **không sửa luật**. `closeReview` vẫn chỉ chạy khi ĐXT ở `review` (đã đóng tiếp nhận) và không còn hồ sơ `pending`/`needs_update`.

#### 1C. Giao diện
`src/features/reviews/ReviewsPage.jsx`
19. Đợt mặc định: ưu tiên ĐXT `open`/`review` có hồ sơ `pending`, rồi tới `review`, rồi phần tử đầu.
20. `editable` dùng `canReviewApplications(target)`; khối quyết định hiển thị theo cùng điều kiện.
21. Panel đầu danh sách: bỏ tiêu đề "Xét duyệt đến …". Thay bằng hai dòng mô tả trung tính: "Tiếp nhận: {bắt đầu} – {kết thúc} · {Chưa bắt đầu | Đang diễn ra | Đã kết thúc}" và "Xét duyệt dự kiến: {bắt đầu} – {kết thúc} · {…}", kèm "Còn N hồ sơ chờ duyệt / chờ bổ sung." Không dùng `Callout` đỏ khi ngoài khung dự kiến.
22. Nút "Chốt & gửi phê duyệt": khi ĐXT còn `open`, vô hiệu với `title` "Cần đóng tiếp nhận trước khi chốt danh sách"; các điều kiện khác như cũ.

`src/features/rounds/RoundsPage.jsx`
23. Form sửa tự theo `editableFields` (đã làm sẵn). Thêm `hint` cho hai trường xét duyệt: "Có thể chồng lên thời gian tiếp nhận. Đây là khung dự kiến, giảng viên vẫn duyệt được ngoài khung này."
24. Khi ĐXT `review` và form có `intakeEnd`: hint "Đặt ngày sau thời điểm hiện tại để mở lại tiếp nhận."
25. Cột "Tiếp nhận" ở danh sách giữ nguyên; thêm cột "Xét duyệt" (ẩn dưới 1024px) cùng định dạng.

`src/components/domain-ui/RoundMilestones.jsx`
26. Viết lại thành hiển thị **hai giai đoạn song song** (giữ tên file và tên export để không vỡ import): hai hàng "Tiếp nhận hồ sơ" và "Xét duyệt hồ sơ", mỗi hàng gồm khoảng ngày và nhãn trạng thái từ `phaseState()`; bên dưới là "Hạn phê duyệt dự kiến" và "Công bố" nếu có. Khi hai khoảng chồng nhau, thêm chú thích "Hai giai đoạn diễn ra đồng thời từ {reviewStart} đến {intakeEnd}." Dùng `StatusBadge`/token sẵn có, không tự vẽ biểu đồ Gantt.

`src/components/domain-ui/RoundTrack.jsx` — giữ nguyên (vẫn thể hiện `round.status`).

`src/features/student-portal/StudentPortal.jsx`
27. `editable`: nhánh bổ sung đổi `round.status === "review"` thành `canReviewApplications(round)`.
28. Ba chỗ dò hồ sơ hiện có (`["draft","pending","needs_update","approved"]`) thêm `"rejected"`.

`src/features/public/PublicHome.jsx`, `src/features/dashboard/Dashboard.jsx` — chỉ rà nhãn: chỗ nào ghi "Hết hạn xét duyệt" đổi thành "Kết thúc xét duyệt dự kiến".

#### 1D. Seed
29. `src/mock/seed/rounds.js`: đổi `DXT-2026-01` (đang `open`, tiếp nhận 01/11–30/11) sang xét duyệt `11-10` → `12-10` để demo chồng lấn. Các đợt khác giữ nguyên.

#### 1E. Test
Sửa các test đang khẳng định luật cũ trong `src/domain/round-machine.test.js` (dòng ~36–70), `src/domain/application-machine.test.js` (test "Hạn bổ sung > reviewEnd…"), `src/mock/services/services.test.js` (test "…hạn bổ sung ≤ reviewEnd"), `src/domain/scheduler.test.js`, `src/mock/uat.test.js` nếu vỡ.

Thêm test:
- `validateTimeline` chấp nhận `reviewStart` nằm trong khoảng tiếp nhận; từ chối `reviewStart < intakeStart` và `reviewEnd < intakeEnd`.
- GVPT `verifyItem` + `decide` thành công khi ĐXT `open`; sinh viên vẫn nộp hồ sơ mới được trong cùng ĐXT đó.
- Sinh viên sửa hồ sơ `pending` khi ĐXT `open` sau khi GV đã xác minh ⇒ tiêu chí bị sửa về `UNVERIFIED`.
- Hạn bổ sung sau `reviewEnd` được chấp nhận; hạn rỗng báo "Vui lòng chọn hạn bổ sung."
- GVPT rút ngắn `intakeEnd` khi `open`; đặt `intakeEnd` trong quá khứ bị từ chối.
- ĐXT `review` + `intakeEnd` tương lai ⇒ về `open`, có audit `ROUND_INTAKE_REOPENED`.
- Hồ sơ `rejected` chặn `createDraft` cùng ĐXT; `withdrawn` thì không.
- `reviews.cancelRequest` đưa hồ sơ về `pending`, đóng request.
- `closeReview` vẫn bị từ chối khi ĐXT `open`.

**Nghiệm thu WP1:** đăng nhập GV005 (vai trò GVPT lớp KSTN-KTPM-K22), mở "Duyệt hồ sơ" của `DXT-2026-01` đang tiếp nhận ⇒ duyệt được ngay; mở "ĐXT của lớp" → Sửa ⇒ thấy bốn mốc thời gian, lưu khoảng xét duyệt chồng lên tiếp nhận thành công.

---

### WP2 — Màn duyệt: tick "Không hợp lệ" tại tiêu chí, sửa luồng bổ sung phía GV (N4, N5: B1–B4, B9, B10)

File chính: `src/features/reviews/ReviewsPage.jsx`, `src/mock/services/reviews.js`.

#### 2A. Service `reviews.verifyItem`
1. Bỏ yêu cầu `note` khi `verifyStatus === "INVALID"` (A-21). Giữ yêu cầu `note` khi `verifiedValue` khác giá trị sinh viên khai.
2. Sửa B2: chỉ ghi `item.verifiedValue` khi payload **có** khóa `verifiedValue` (`p.verifiedValue !== undefined`); `null` = xóa điều chỉnh; không gửi = giữ nguyên.
3. History: dùng `p.note` nếu có, ngược lại dùng tên tiêu chí kèm kết quả, ví dụ "GPA năm 2 — Không hợp lệ".

#### 2B. Bố cục màn chi tiết hồ sơ
4. **Xóa** `<Callout tone="danger">Hồ sơ chưa đạt tiêu chí bắt buộc…</Callout>`. Thay bằng một dòng chữ trung tính trong panel thông tin sinh viên: "Tiêu chí bắt buộc đạt {x}/{y} · Đã xác minh {a}/{b}". Không dùng tone `danger` cho dòng này.
5. Mỗi tiêu chí (và mỗi thành tích của tiêu chí tích lũy) có **một cụm chọn hai lựa chọn** "Hợp lệ" / "Không hợp lệ" (dùng `FilterTabs` hoặc hai nút có `aria-pressed`; lựa chọn hiện tại được tô theo `verifyPill`). Bấm là lưu ngay bằng `action.run("reviews.verifyItem", …, "")` — **không toast thành công**, không đòi lý do.
6. Dưới cụm chọn: ô một dòng "Ghi chú cho sinh viên (không bắt buộc)" riêng cho tiêu chí/thành tích đó, lưu khi rời ô (`onBlur`) nếu nội dung đổi, gọi lại `verifyItem` với trạng thái hiện tại + `note`. Chỉ hiện khi tiêu chí đã được đánh dấu.
7. "Điều chỉnh giá trị" (chỉ với tiêu chí nhập số, không tham chiếu): thu gọn mặc định sau nút dạng link "Điều chỉnh giá trị". Mở ra gồm ô số + ô "Lý do điều chỉnh" (bắt buộc) + nút "Áp dụng". Gọi `verifyItem` với `verifyStatus: "VALID"`, `verifiedValue`, `note`. Khi đã có điều chỉnh, hiện "Đã điều chỉnh: {khai} → {xác minh}" và nút "Bỏ điều chỉnh" (`verifiedValue: null`).
8. Sửa B1: bỏ state `note` dùng chung cho xác minh. State ghi chú theo khóa `criterionId` hoặc `criterionId:entryId`, khởi tạo từ `verifyNote` đã lưu.
9. Điểm hiển thị từng tiêu chí giữ như cũ.

#### 2C. Khối quyết định
10. Hồ sơ `pending` + được phép duyệt: ba nút "Không đạt", "Yêu cầu bổ sung", "Đạt điều kiện". Bỏ ô ý kiến và ô hạn luôn hiển thị.
    - "Đạt điều kiện": vô hiệu khi chưa xác minh đủ hoặc chưa đạt BB; ngay dưới hàng nút có một dòng `text-body-sm text-ink-600` nêu lý do ("Còn {n} tiêu chí chưa xác minh" / "Chưa đạt đủ tiêu chí bắt buộc").
    - "Yêu cầu bổ sung": mở `Modal` gồm "Nội dung yêu cầu" (bắt buộc, **điền sẵn** danh sách tiêu chí đang "Không hợp lệ" kèm ghi chú, mỗi tiêu chí một dòng) và "Hạn bổ sung" (bắt buộc, mặc định = đồng hồ mô phỏng + 3 ngày, tính bằng `addDays(db.clock.now, 3)` rồi `toIct(...).slice(0, 16)`). Lỗi hiển thị tại ô (`Field` `error`), không chỉ bằng toast (B3).
    - "Không đạt": mở `ConfirmDialog` có ô "Lý do" bắt buộc, điền sẵn theo cùng cách.
11. Hồ sơ `needs_update`: thay cho ô trống (B4), hiện panel trung tính: "Đang chờ sinh viên bổ sung đến {hạn}", nội dung yêu cầu, và nút "Hủy yêu cầu bổ sung" (mở `ConfirmDialog` có ô lý do → `reviews.cancelRequest`).
12. Hồ sơ `approved`/`rejected`: nút "Mở lại để xét duyệt" mở `ConfirmDialog` có ô lý do bắt buộc.
13. Trạng thái khác hoặc không được phép duyệt: không render khối quyết định.
14. Sửa B9: nếu hồ sơ có request đã được sinh viên giải quyết gần nhất, hiện dòng trung tính "Sinh viên đã gửi bổ sung lúc {giờ}." và gắn nhãn nhỏ "Vừa cập nhật" cạnh tên các tiêu chí có `updatedAt` ≥ thời điểm tạo request (xem WP3 bước 4).

#### 2D. Test
- `verifyItem` INVALID không cần `note`; điều chỉnh giá trị thiếu `note` vẫn bị từ chối.
- Gọi `verifyItem` VALID không kèm `verifiedValue` sau khi đã điều chỉnh ⇒ `verifiedValue` giữ nguyên; gửi `null` ⇒ xóa.
- Cập nhật `src/mock/services/regression.test.js` nếu test cũ dựa vào hành vi bị đổi.

**Nghiệm thu WP2:** ở màn duyệt, bấm "Không hợp lệ" trên một tiêu chí BB ⇒ nhãn đổi ngay, **không** toast lỗi, **không** khung đỏ đầu trang; dòng tóm tắt đổi thành "…đạt 5/6". Yêu cầu bổ sung không chọn hạn ⇒ lỗi hiện ngay tại ô trong modal.

---

### WP3 — Luồng bổ sung phía sinh viên (N5: B5–B8)

File chính: `src/features/student-portal/StudentPortal.jsx`, `src/components/domain-ui/CriterionField.jsx`, `src/mock/services/applications.js`.

1. B5 — `CriterionField` nhận thêm prop `feedback` (boolean). Khi bật: với tiêu chí/thành tích có `verifyStatus === "INVALID"` hiện nhãn "Không hợp lệ" cạnh tên (kiểu pill như màn duyệt, không dùng `Callout`) và dòng ghi chú của giảng viên nếu có; với `VALID` hiện nhãn "Hợp lệ". `ApplicationForm` bật `feedback` khi hồ sơ không còn là `draft`.
2. Khi hồ sơ `needs_update`, sắp các tiêu chí "Không hợp lệ" lên đầu bước 2 và hiện một dòng "Giảng viên đánh dấu {n} tiêu chí cần xem lại."
3. B6 — phần đầu trang: khi có request đang mở, hiển thị "Hạn bổ sung: {giờ}" thay cho "Hạn tiếp nhận: …".
4. B9 (phần dữ liệu) — trong `applyValues()` của `applications.js`, tiêu chí nào bị đổi thì gán thêm `updatedAt: <thời điểm>`; truyền `ctx.now` vào hàm. Không đổi logic so sánh.
5. B8 — nút "Gửi bổ sung" vô hiệu cho tới khi form có thay đổi (`dirty`), kèm dòng trợ giúp "Hãy chỉnh giá trị hoặc minh chứng được yêu cầu trước khi gửi." Luật service giữ nguyên.
6. Khi `needs_update`, nút "Lưu chỉnh sửa" vẫn ẩn (không có service lưu tạm cho trạng thái này) — giữ hộp thoại cảnh báo rời trang hiện có.
7. B7 — xử lý chung ở WP4.

Test: `applyValues` gắn `updatedAt` đúng tiêu chí bị sửa; `resubmit` khi ĐXT `open` thành công (liên quan WP1).

**Nghiệm thu WP3:** sinh viên mở hồ sơ cần bổ sung ⇒ thấy ngay tiêu chí nào bị "Không hợp lệ" và ghi chú của giảng viên; nút gửi chỉ bật sau khi sửa.

---

### WP4 — Sau khi nộp chỉ thông báo nộp thành công (N6, B7)

File: `src/features/student-portal/StudentPortal.jsx`.

1. Sau khi `applications.submit` hoặc `applications.resubmit` thành công (gọi với message `""`): **không** điều hướng; đặt state cục bộ `done = "submit" | "resubmit"` và render thay cho toàn bộ form một màn xác nhận dùng `StatePage` (tone thành công) hoặc `Panel`:
   - Tiêu đề: "Nộp hồ sơ thành công" / "Đã gửi bổ sung thành công".
   - Nội dung: mã hồ sơ (`CodeTag`), tên ĐXT, thời điểm nộp (`formatIct`), câu "Kết quả xét duyệt sẽ được gửi qua email và mục Thông báo."
   - Nút: "Xem hồ sơ đã nộp" (→ `/app/my-applications/<id>`, đặt lại `done`) và "Về tổng quan" (→ `/app/dashboard`).
   - Không hiển thị điểm tự khai, không hiển thị trạng thái đạt/không đạt BB.
   - Đưa focus vào tiêu đề màn xác nhận.
2. `applications.update` (sửa hồ sơ đang chờ duyệt): giữ toast, nội dung "Đã cập nhật hồ sơ."
3. Xem lại hồ sơ **đã nộp và không còn sửa được** (`editable === false`): bỏ `Stepper`, bỏ cột `ScoreSummary` "Điểm dự kiến", bỏ bước "Kiểm tra & nộp". Hiển thị một trang chỉ đọc: khối trạng thái + thời điểm nộp, thông tin cá nhân, danh sách tiêu chí đã khai kèm minh chứng (dùng `CriterionField readOnly feedback`), rồi "Lịch sử xử lý". Điểm chính thức chỉ hiện khi ĐXT đã `published` (khối sẵn có).
4. Hồ sơ còn sửa được (`draft`, `pending` khi ĐXT `open`, `needs_update`): giữ wizard ba bước và `ScoreSummary` như hiện tại.

**Nghiệm thu WP4:** nộp hồ sơ mới bằng SV 26010011 (có sẵn bản nháp ở `DXT-2026-01`) ⇒ thấy màn "Nộp hồ sơ thành công" với mã hồ sơ; bấm "Xem hồ sơ đã nộp" ⇒ trang chỉ đọc, không có "Điểm dự kiến".

---

### WP5 — CNN nhập danh sách sinh viên, đăng ký tài khoản, xác định lớp phù hợp (N7, N8)

#### 5A. Dữ liệu và quyền
1. `src/mock/schema.js`: `SCHEMA_VERSION = 4`. Rà các chỗ ghi cứng số 3: `src/mock/services/system.js` (`ctx.seedDb?.schemaVersion === 3` → so với hằng số; vì service không được import `mock/schema.js`, chuyển hằng `SCHEMA_VERSION` sang `src/domain/constants.js` và cho `schema.js` re-export), `src/mock/persistence.test.js`, tên file xuất ở `src/features/demo/DemoPanel.jsx`. **Không đổi** `DB_KEY`/`SESSION_KEY`.
2. Dòng `schoolDirectory` thêm trường: `cohort` (ví dụ `"K22"`), `importedBy`, `importedAt`, `batchId` (seed: `importedBy` = CNN của ngành nếu có, ngược lại `null`).
3. `studentProfiles` thêm `cohort`.
4. `src/domain/permissions.js`: thêm `"student.import": { HEAD: "*" }`.

#### 5B. Domain
5. File mới `src/domain/student-import.js` (thuần, không API trình duyệt):
   - `parseStudentTable(text)` → `{ headers, rows }`. Bỏ BOM; tự nhận dấu phân cách tab / `;` / `,`; hỗ trợ ô có dấu nháy kép; bỏ dòng trống. Dòng đầu là tiêu đề, nhận các tên cột (không phân biệt hoa thường, bỏ dấu khi so): `mssv|ma sinh vien`, `ho ten|ho va ten`, `ngay sinh`, `email`, `lop|lop sinh hoat`, `khoa` (tùy chọn).
   - `normalizeStudentRow(raw, { defaultCohort })` → `{ studentCode, fullName, dob, email, homeClass, cohort, errors[] }`. Luật: MSSV đúng 8 chữ số; họ tên không rỗng; ngày sinh nhận `dd/mm/yyyy` hoặc `yyyy-mm-dd`, lưu ISO `yyyy-mm-dd`; email rỗng thì mặc định `<mssv>@student.iuh.edu.vn`, có thì phải qua `isIuhStudentEmail` (`src/domain/identity.js`); khóa chuẩn hóa `22`/`k22`/`K22` → `"K22"`, thiếu thì lấy `defaultCohort`.
   - `planStudentImport(db, majorId, rows)` → mỗi dòng một kết quả: `CREATE`, `UPDATE` (MSSV đã có trong danh sách cùng ngành), `ERROR` (kèm lý do: dữ liệu sai, trùng MSSV trong file, MSSV đã thuộc danh sách ngành khác). Kèm cờ `registered` nếu MSSV đã có tài khoản.
6. `src/domain/selectors.js`: thêm `eligibleClasses(db, studentUserId)` → các lớp chưa kết thúc có `program.majorId === profile.majorId && cls.cohort === profile.cohort`.
7. `src/domain/flows.js` → `classifyFlow()`: trong nhánh sinh viên **chưa thuộc lớp CN/KSTN**, nếu `round.classId` không nằm trong `eligibleClasses` ⇒ `{ flow: null, allowed: false, reason: "Đợt xét tuyển này không dành cho ngành và khóa của bạn." }`. Nhánh luồng C không đổi.

#### 5C. Service
8. File mới `src/mock/services/directory.js`, đăng ký namespace `directory` trong `src/mock/service-registry.js`:
   - `directory.import` — `permission: "student.import"`, `resolve: (db, p) => ({ type: "major", id: p.majorId })`. Payload `{ majorId, cohort, rows }` (rows là dữ liệu thô đã tách cột). Service **tự chuẩn hóa và lập kế hoạch lại** bằng hàm domain (không tin kết quả xem trước từ client). Áp dụng các dòng `CREATE`/`UPDATE`, bỏ qua `ERROR`. Dòng `UPDATE` của MSSV đã có tài khoản: cập nhật danh sách và đồng bộ `cohort`, `homeClass` sang `studentProfiles`; **không** đổi email/tên đăng nhập của tài khoản. Kết quả `{ batchId, created, updated, skipped, errors: [{ line, studentCode, reason }] }`. Audit `STUDENT_LIST_IMPORTED` (chỉ ghi số lượng, khóa, `batchId`).
   - `directory.remove` — cùng quyền; chỉ xóa dòng **chưa có tài khoản**; audit `STUDENT_LIST_ENTRY_REMOVED`.
9. `src/mock/services/account.js` → `registerStudent`: chép `cohort` sang `studentProfiles`; đổi thông báo "…không khớp danh bạ IUH." thành "Thông tin xác thực không khớp danh sách sinh viên đã được nhập."
10. `src/mock/services/otp.js`: giữ nguyên thông báo chung (không tiết lộ MSSV có trong danh sách hay không).

#### 5D. Giao diện
11. Trang mới `student-import`, nhãn menu "Danh sách sinh viên", chỉ ở menu CNN, đặt sau "Lớp CN/KSTN":
    - `src/app/menus.js` (`MENUS.HEAD`, `PAGE_PERMISSION["student-import"] = "student.import"`), `src/app/routes.jsx` (`WORKSPACE_PAGES`), `src/data/page-meta.js`, nơi ánh xạ trang → component (cùng chỗ đang render `ManagementPage`/`ReviewsPage`; tìm bằng `grep -n "ReviewsPage" src`), và bản đồ icon của sidebar.
    - Component `src/features/students/StudentImportPage.jsx`.
12. Nội dung trang:
    - Dòng mô tả: "Chỉ sinh viên có trong danh sách này mới đăng ký được tài khoản và nộp hồ sơ. Hệ thống không kết nối dữ liệu gốc của trường."
    - Bộ lọc theo khóa + tìm kiếm; bảng `DataList` (10 dòng/trang): MSSV, Họ tên, Khóa, Lớp sinh hoạt, Email, Tài khoản ("Đã đăng ký"/"Chưa đăng ký"), Thao tác (xóa — chỉ khi chưa đăng ký, qua `ConfirmDialog`).
    - Chỉ hiển thị sinh viên thuộc ngành trong phạm vi vai trò đang dùng (`activeRole.scopeId`).
    - Nút "Nhập danh sách" mở `Modal` cỡ lớn, ba bước:
      1. Chọn **Khóa** (danh sách `cohort` của các lớp thuộc ngành + cho nhập khóa mới), rồi chọn tệp `.csv` (`FileDropzone` sẵn có, đọc bằng `file.text()` trong component) **hoặc** dán trực tiếp từ Excel vào `Textarea`. Có link "Tải tệp mẫu" sinh CSV UTF-8 có BOM (xem cách tạo `Blob` ở `src/features/operations/OperationsPage.jsx`). Ghi chú: "Tệp Excel: chọn Lưu thành → CSV UTF-8, hoặc sao chép vùng dữ liệu và dán vào ô bên dưới."
      2. Xem trước: tổng "Thêm mới {a} · Cập nhật {b} · Lỗi {c}" và bảng từng dòng kèm lý do lỗi. Dòng lỗi không chặn việc nhập các dòng hợp lệ.
      3. Kết quả sau khi gọi `directory.import`.
13. Trang đăng ký `src/features/auth/AuthPages.jsx` (`/dang-ky`): thêm dòng trợ giúp ở bước 1: "Chỉ sinh viên có trong danh sách do Chủ nhiệm ngành nhập mới đăng ký được. Nếu không nhận được mã OTP, hãy liên hệ Chủ nhiệm ngành của bạn." Bước 3 hiển thị thêm Ngành và Khóa lấy từ danh sách (chỉ đọc).
14. Tổng quan sinh viên (`StudentPortal`, `page === "dashboard"`): thêm panel "Lớp phù hợp với bạn" từ `eligibleClasses`: mã lớp, ngành, khóa, GVPT, và tình trạng ĐXT của lớp (đang mở → nút "Nộp hồ sơ"; chưa mở → ngày mở; không có → "Chưa có đợt xét tuyển"). Không có lớp nào ⇒ `EmptyState` "Chưa có lớp CN/KSTN cho ngành và khóa của bạn." Sinh viên đang học lớp CN/KSTN: không hiện panel này.
15. Đổi câu "Bạn có thể nộp nhiều ĐXT, nhưng chỉ được trúng tuyển vào một lớp CN/KSTN." thành "Hệ thống chỉ hiển thị đợt xét tuyển của lớp phù hợp với ngành và khóa của bạn."
16. Trang công khai: nút "Nộp hồ sơ" giữ luồng đăng nhập + `returnTo`. Nếu sinh viên không phù hợp, `ApplicationForm` đã hiện thông báo lỗi của `createDraft` qua `StatePage` — thêm nút "Về tổng quan" vào đó.
17. Rà toàn bộ chuỗi "danh bạ" trong `src/` và các file `.md` hướng dẫn, đổi thành "danh sách sinh viên đã nhập".

#### 5E. Seed
18. `src/mock/seed/directory.js` → `addStudent` nhận thêm `cohort`, ghi vào cả dòng danh sách lẫn `studentProfiles`. Gán theo bảng:

| Sinh viên | Ngành | Khóa | Ghi chú |
|---|---|---|---|
| 21094501, 21094518, 21094602, 21094777, 21094650 | maj_ktpm | K20 | thành viên lớp KSTN-KTPM-K20 |
| 22073210 | maj_ktpm | K21 | |
| 26010011, 26010022, 26019999 (chưa đăng ký), 26018888 (chưa đăng ký) | maj_ktpm | K22 | dùng để demo đăng ký và nộp vào `DXT-2026-01` |
| 26900001–26900003 | maj_ktpm | K21 | thành viên lớp K21 |
| 26900004–26900006 | maj_httt | K21 | |
| 26900007–26900012 | maj_mkt | K20 nếu là thành viên lớp CNTN-MKT-K20, còn lại K22 | xác định theo `memberships` trong `seed/applications.js` |

19. Seed hiện có vài hồ sơ **lệch ngành/khóa** (ví dụ 26900004–06 ngành HTTT có hồ sơ `pending` ở `DXT-2026-01` của lớp KTPM-K22; 22073210 có hồ sơ ở cả lớp K20 và K21). Xử lý:
    - Với ĐXT đang `open`/`upcoming`: thay các hồ sơ lệch bằng hồ sơ của sinh viên đúng ngành + khóa. Thêm 3 sinh viên mới ngành KTPM khóa K22 (ví dụ 26900013–26900015) để giữ ba hồ sơ `pending` của `DXT-2026-01`.
    - Với ĐXT đã qua tiếp nhận (`review`, `approving`, `published`): **giữ nguyên** dữ liệu (đang phục vụ các test về BR-08, đồng hạng, luồng B). Ghi rõ trong A-23 rằng đây là dữ liệu lịch sử trước khi áp luật lớp phù hợp.
20. Sau khi sửa seed, cập nhật các con số/khẳng định bị lệch trong `src/mock/seed.test.js`, `src/mock/uat.test.js`, `src/mock/services/*.test.js`, `coding_plan/UAT-TEST-GUIDE.md`, `coding_plan/Huong-Dan-Demo.md`.

#### 5F. Test
- `parseStudentTable`: CSV dấu phẩy, dấu chấm phẩy, TSV dán từ Excel, có BOM, ô có dấu nháy chứa dấu phẩy, tiêu đề có dấu tiếng Việt.
- `normalizeStudentRow`: MSSV sai độ dài; ngày `15/01/2006` → `2006-01-15`; email sai miền; khóa `22` → `K22`.
- `directory.import`: CNN ngành KTPM nhập được; CNN ngành khác/GVPT/ADMIN bị `FORBIDDEN`; MSSV đã thuộc ngành khác bị báo lỗi và không bị ghi đè; nhập lại cùng tệp ⇒ toàn `UPDATE`, không sinh dòng trùng.
- Luồng đầy đủ: nhập sinh viên mới → `otp.request` + `otp.verify` + `account.registerStudent` thành công → `studentProfiles.cohort` đúng → `classifyFlow` cho phép ĐXT của lớp cùng ngành + khóa, từ chối lớp khác khóa và lớp khác ngành.
- MSSV không có trong danh sách ⇒ không có email OTP nào được tạo.
- Seed: mọi hồ sơ luồng A/B thuộc ĐXT `open`/`upcoming` đều của sinh viên phù hợp với lớp của ĐXT.
- `loadDb` với dữ liệu `schemaVersion: 3` ⇒ nạp lại seed.

**Nghiệm thu WP5:** đăng nhập GV005 (vai trò CNN ngành Kỹ thuật phần mềm) → "Danh sách sinh viên" → nhập 3 dòng khóa K22 (1 dòng cố ý sai MSSV) ⇒ xem trước báo 2 hợp lệ, 1 lỗi; nhập xong, đăng ký tài khoản bằng một MSSV vừa nhập (lấy OTP ở "Hộp thư mô phỏng") ⇒ tổng quan hiện "Lớp phù hợp với bạn: KSTN-KTPM-K22" và nộp được vào `DXT-2026-01`; không thấy ĐXT của lớp khác.

---

### WP6 — Rà soát giao diện, tài liệu, báo cáo

1. Chạy trình duyệt ở 1440, 1024, 390px cho các màn đã sửa: Duyệt hồ sơ (danh sách + chi tiết), ĐXT (chi tiết + form sửa), Hồ sơ của tôi (wizard, trang chỉ đọc, màn nộp thành công), Tổng quan sinh viên, Danh sách sinh viên (bảng + modal nhập), Đăng ký. Kiểm: không cuộn ngang, không lỗi console, focus trap trong modal, nút nổi "Bảng điều khiển demo" không che nút hành động.
2. Rà `grep -rnE "#[0-9a-fA-F]{3,6}\b|text-\[[0-9.]+px\]" src --include=*.jsx` ⇒ không có kết quả mới.
3. Cập nhật tài liệu:
   - `coding_plan/DECISIONS-ADDENDUM.md`: thêm A-16 … A-24 (nội dung mục 4, kèm lý do "theo nhận xét giảng viên sau báo cáo lần 1, 11/11/2026").
   - `DESIGN.md` mục 3: sửa điểm 2 (đăng ký từ danh sách CNN nhập), 4 (màn nộp thành công, trang chỉ đọc), 5 (tick không hợp lệ không cần lý do; hạn bổ sung không gắn `reviewEnd`; duyệt được khi `open`), 7 (hai giai đoạn chồng lấn, GVPT sửa mốc), 8 (trang Danh sách sinh viên).
   - `coding_plan/UAT-TEST-GUIDE.md` và `coding_plan/Huong-Dan-Demo.md`: sửa các bước bị ảnh hưởng, thêm mục "Kịch bản sau báo cáo lần 1" gồm bốn kịch bản nghiệm thu của WP1, WP2+WP3, WP4, WP5.
4. Viết `coding_plan/progress/FIX-HAU-BAO-CAO-LAN-1-report.md`: việc đã làm theo từng WP, test thêm/sửa, số test đạt, điểm lệch so với kế hoạch và lý do, việc còn mở.

---

## 6. Ngoài phạm vi

- Không đổi quy trình chốt danh sách, phê duyệt ba cấp, xếp hạng, công bố, bộ tiêu chí, phân quyền vai trò.
- Không thêm/bớt/đổi tên trạng thái ĐXT; không làm giai đoạn tùy biến động (G1).
- Không đọc trực tiếp `.xlsx`; không thêm dependency.
- Không sửa `dist/`, cấu hình build/deploy, 7 tệp HTML entry.
- Không đổi nội dung chuỗi hiển thị, cột bảng, menu ngoài những chỗ nêu ở mục 5.

---

## 7. Tiêu chí hoàn thành

- [ ] `node --test "src/**/*.test.js"` đạt 100% (số test ≥ 245 + test mới).
- [ ] Build ra `/tmp/kstn-prototype-build` thành công cho cả 7 entry.
- [ ] Bốn kịch bản nghiệm thu ở cuối WP1, WP2, WP4, WP5 chạy được trên trình duyệt, không lỗi console.
- [ ] Màn duyệt không còn khung đỏ "Hồ sơ chưa đạt tiêu chí bắt buộc"; bấm "Không hợp lệ" không sinh toast lỗi.
- [ ] Mười lỗi B1–B10 ở mục 3.3 đều được kiểm lại và ghi kết quả trong báo cáo.
- [ ] GVPT duyệt được hồ sơ khi ĐXT đang tiếp nhận; sửa được bốn mốc thời gian; khung xét duyệt chồng lên tiếp nhận được lưu.
- [ ] Sinh viên không có trong danh sách CNN nhập không đăng ký được; sinh viên đã đăng ký chỉ thấy/nộp ĐXT của lớp cùng ngành + khóa.
- [ ] Tài liệu ở WP6 bước 3–4 đã cập nhật.
- [ ] Ba giả định G1–G3 được nhắc lại trong báo cáo để người dùng xác nhận với giảng viên.
