# Kế hoạch cập nhật FE — chuỗi e2e camera/IVSS

**Ngày lập:** 2026-08-03
**Dựa trên:** file `FE_Can_Sua.txt` (kế hoạch gửi Nam) + phân tích lại trực tiếp source BE hiện tại trên máy (`be_smartracking/capstone-be`), không suy đoán theo mô tả trong file mà đọc thẳng DTO/migration/seed thật.

**Kết luận quan trọng nhất:** sau khi đọc lại BE, **hầu hết các mục KHÔNG cần sửa code FE** — hoặc đã có sẵn cơ chế tương đương (FE1), hoặc là việc thuần BE chưa merge/deploy (FE2, FE3), hoặc bản chất khác hẳn giả định ban đầu (FE6). Chỉ có 1-2 việc nhỏ đáng làm ở FE, còn lại là **chờ + verify đúng cách**.

---

## FE1 — Ép đăng ký sinh trắc học lần đầu

### Đính chính Business Context
- **Avatar (Ảnh đại diện)**: Là tuỳ chọn (optional), không bắt buộc phải có.
- **Biometric (Sinh trắc học / Khuôn mặt)**: Là bắt buộc (required), phải force upload ở lần login đầu tiên để phục vụ hệ thống camera nhận diện.

### Đối chiếu BE thật
Mặc dù về mặt nghiệp vụ "Avatar" và "Biometric" là hai khái niệm khác nhau, nhưng hiện tại code BE đang dùng chung danh pháp. BE trả về `avatarReviewStatus`, `avatarRequired`, `shouldShowAvatarPopup` trong response `/auth/login` (tại `login-response.presenter.ts`) và xử lý upload `face_profiles` tại `AvatarController`. 
Do đó, các field mang tên `avatar*` từ BE hiện tại đang thực sự đóng vai trò là trạng thái của **Biometric**.

### Đối chiếu FE thật
- [`BiometricReminderModal.jsx`](../src/component/BiometricReminder/BiometricReminderModal.jsx) đã tồn tại, mount ở **cả 4 layout** (SystemAdmin/BusinessAdmin/Manager/Employee).
- Đọc `data.avatarReviewStatus === 'not_uploaded'` → xác định `isForced = true` → nhảy thẳng vào giao diện webcam (`setView('webcam')`), **ẩn hoàn toàn nút đóng và bỏ qua tuỳ chọn dùng ảnh avatar cũ** (dòng 72, 380, 517).
- Bằng cách này, người dùng không thể bỏ qua việc nộp ảnh sinh trắc học.

### Kết luận
✅ **Không cần làm gì mới cho FE1** — Dù tên field BE có chữ `avatar`, nhưng logic FE hiện tại đã tuân thủ đúng nghiệp vụ: nó đang ép chụp ảnh sinh trắc (webcam) nếu trạng thái là `not_uploaded` và không cho phép bỏ qua. Việc Avatar là optional cũng đã được xử lý đúng (ẩn tuỳ chọn dùng avatar cũ nếu user chưa có avatar).

### Việc nên làm (tối ưu, không bắt buộc)
Có thể đọc trực tiếp trạng thái `avatarRequired`/`shouldShowAvatarPopup` từ `localStorage.user` (được lưu sau khi login) để hiện modal ngay lập tức, thay vì gọi thêm một lần `GET /me/avatar-status`. **Không cấp bách**, chỉ là tối ưu UX.

---

## FE2 — Hủy họp, field `reason`

### Đối chiếu BE thật
`capstone-be/src/modules/meetings/dto/cancel-meeting.dto.ts`:
```ts
export class CancelMeetingDto {
  @IsOptional() @IsString() @MaxLength(1000)
  cancellationReason?: string;
}
```
**Chỉ có `cancellationReason`, KHÔNG có alias `reason`.** Nhánh `haitd` được nhắc tới trong file gốc **chưa merge vào code đang có trên máy**.

### Đối chiếu FE thật
FE gửi đúng như file mô tả: `{ reason }` ở cả `managerServices.js`, `employeeServices.js`, `businessAdminServices.js`.

### Kết luận
⚠️ **Đúng 1 nửa**: FE không cần đổi field (đợi BE thêm alias `reason`, không phải FE đổi tên field mình gửi thành `cancellationReason` — giữ nguyên `reason` để tương thích khi BE merge xong theo đúng thiết kế alias). Nhưng **ngay lúc này**, nếu test hủy họp, lý do sẽ **bị BE âm thầm loại bỏ** (ValidationPipe whitelist), không phải lỗi 400 — hành động hủy vẫn "thành công" nhưng thiếu lý do lưu lại. Đừng nhầm "không lỗi" = "đã hoạt động đúng".

### Việc cần làm
- Không sửa code FE.
- Verify sau khi BE merge+deploy thật: bấm hủy → mở lại chi tiết cuộc họp đã hủy → kiểm tra lý do hủy có được lưu và hiển thị đúng không (không chỉ kiểm tra "không lỗi 400").

---

## FE3 — Duyệt/từ chối yêu cầu phòng cho MANAGER

### Đối chiếu BE thật — ĐÂY LÀ BUG THẬT, ĐÃ XÁC NHẬN CHÍNH XÁC HƠN FILE GỐC

`capstone-be/src/database/migrations/20260720000005-BackfillRolePermissions.ts` (migration mới nhất, ghi đè seed cũ):
```ts
{ code: 'meeting_request.approve', roles: ['SYSTEM_ADMIN'] },
{ code: 'meeting_request.read',    roles: ['BUSINESS_ADMIN', 'MANAGER', 'SYSTEM_ADMIN'] },
{ code: 'meeting_request.reject',  roles: ['SYSTEM_ADMIN'] },
```
**MANAGER chỉ có quyền ĐỌC (`meeting_request.read`), KHÔNG có quyền `approve`/`reject`** — chỉ `SYSTEM_ADMIN` mới có. File gốc nói "BE đã cấp quyền cho MANAGER (fix ở haitd)" — **chưa đúng với code hiện tại**, `haitd` chưa merge, hoặc merge nhưng seed migration chưa chạy lại trên môi trường.

### Đối chiếu FE thật
`fe_smartracking/src/routers/index.js` dòng 346: route `meeting-approvals` (dùng `ManagerMeetingApprovals` = [`MeetingApprovals.jsx`](../src/pages/manager/MeetingApprovals.jsx)) **chỉ được mount trong nhánh route của MANAGER** — không có role nào khác truy cập được màn này qua UI.

→ **Nghĩa là ngay lúc này, tính năng "Phê duyệt cuộc họp" trên UI của Manager chắc chắn 403 khi bấm Duyệt/Từ chối**, vì trang này chỉ dành cho MANAGER nhưng BE chỉ cho SYSTEM_ADMIN thao tác. Đây là gap thật, không phải hiểu nhầm.

### Việc cần làm
- **BE**: chạy migration/seed cấp `meeting_request.approve` + `meeting_request.reject` cho `MANAGER` (đúng như `meeting_request.read` đã có) — việc này 100% thuộc BE, đã note rõ trong file gốc.
- **FE (nhỏ, không bắt buộc nhưng nên làm ngay, không cần chờ BE)**: `MeetingApprovals.jsx` hiện bắt lỗi generic `err?.error?.message || err?.message` (dòng 157, 184) — khi BE trả 403 permission, thông báo sẽ là message chung chung "Thao tác phê duyệt thất bại, vui lòng thử lại." dễ gây hiểu lầm là lỗi tạm thời. Có thể thêm nhánh bắt riêng mã lỗi 403/`FORBIDDEN` để hiện thông báo rõ ràng hơn ("Bạn chưa có quyền phê duyệt yêu cầu này") — giúp việc test/verify sau này dễ phân biệt "còn thiếu quyền" vs "lỗi hệ thống thật".
- Verify **sau khi BE deploy xong seed mới**: bấm duyệt/từ chối thật ở tài khoản MANAGER, xác nhận hết 403.

---

## FE4 — Trạng thái `completed`

### Đối chiếu BE thật
Grep toàn bộ `capstone-be/src/modules/meetings` cho cron/auto-complete: **không tìm thấy dòng code nào** liên quan tới việc tự động chuyển trạng thái cuộc họp sang `completed` theo giờ. Tính năng này **chưa tồn tại trong BE hiện tại**, không chỉ "sắp có" mà là hoàn toàn chưa bắt đầu implement (theo code trên máy).

### Đối chiếu FE thật
`manager/MeetingDetail.jsx:379-380` đã xử lý đúng:
```js
const canJoin = meeting.status === 'scheduled' || meeting.status === 'in_progress';
const isCompleted = meeting.status === 'completed';
```
Không hardcode chỉ 2 trạng thái, `completed` đã được nhận diện riêng.

### Kết luận
✅ Ít nhất màn quan trọng nhất (chi tiết cuộc họp) đã sẵn sàng nhận `completed`. Vì BE cron chưa tồn tại nên **chưa có gì để verify ngay bây giờ** — không phải việc cấp bách.

### Việc cần làm (khi BE có cron thật)
Rà thêm các màn còn lại có hiển thị trạng thái cuộc họp dạng badge/filter (danh sách cuộc họp, tab báo cáo, dashboard) — chưa rà hết trong lần này vì phạm vi rộng và BE chưa có tính năng để test thật. Đề xuất: làm việc này **sau khi BE deploy cron**, lúc đó mới test được bằng dữ liệu thật thay vì đoán.

---

## FE5 — 13 UC BROKEN trong báo cáo `bao-cao-2026-07-31`

Chưa tìm thấy file báo cáo này trong cả 2 repo. **Không thể rà nếu không có nội dung cụ thể của 13 UC.** Gửi file hoặc dán nội dung để rà tiếp theo đúng phương pháp đã áp dụng ở FE2/FE3 (đọc thẳng DTO/migration BE, không suy đoán).

---

## FE6 — Ảnh ANPR (Parking Detection Detail) — bản chất khác hẳn giả định ban đầu

### Đối chiếu BE thật — quan trọng, thay đổi cách FE nên xử lý

Grep toàn bộ module `anpr` cho `imageBase64`, tất cả kết quả đều là comment/code cùng 1 nội dung: **"SEC-01: KHÔNG log/audit/persist imageBase64"**. Cụ thể `vehicle-unknown.service.ts:41`:
> "SEC-01: KHÔNG imageBase64 (UC5 vốn không lưu)"

**Đây KHÔNG phải giới hạn phần cứng tạm thời như file gốc mô tả — đây là quyết định bảo mật CHỦ ĐÍCH và VĨNH VIỄN của BE**: ảnh biển số nhận từ webhook bridge (`VehicleEventDto.imageBase64`) chỉ tồn tại trong khoảnh khắc xử lý webhook, **không bao giờ được lưu vào DB, không bao giờ trả ra qua bất kỳ API đọc nào** (list/detail/history). Vì vậy field này **sẽ vĩnh viễn không có giá trị** ở phía FE khi đọc dữ liệu vehicle — không phải "chờ bridge gửi" rồi sẽ có.

### Đối chiếu FE thật
- Không tìm thấy component nào tên chính xác "Parking Detection Detail" trong code.
- `ANPRManagement.jsx` và `VehicleControlList.jsx` (2 màn quản lý ANPR chính) **hiện không render ảnh nào cả** — không có rủi ro crash vì tính năng hiển thị ảnh chưa được viết.
- Modal gần nhất có xử lý ảnh: "Chi tiết phiên ra vào" trong [`GateAccessManagement.jsx:448-453`](../src/pages/systemAdmin/GateAccessManagement.jsx) — nhưng đây là ảnh gate-access session (`image_url`), khác domain với ANPR vehicle (`imageBase64`) — đã null-safe đúng cách sẵn.

### Việc cần làm
- **Không cần "chờ BE sửa" như file gốc đề xuất** — vì BE sẽ không bao giờ trả field này (đúng thiết kế bảo mật SEC-01), FE phải coi "không có ảnh" là trạng thái vĩnh viễn.
- Nếu có kế hoạch làm màn hiển thị chi tiết phát hiện xe (biển số + ảnh) trong tương lai: **thiết kế UI ngay từ đầu không có ảnh** (chỉ hiển thị biển số/thời gian/camera nhận diện dạng text), không nên dựng UI kỳ vọng có `imageBase64` rồi né null — vì null sẽ là 100% trường hợp, không phải edge case.
- Xác nhận lại với người viết file gốc: cần tên chính xác/route của màn "Parking Detection Detail" nếu nó thực sự tồn tại ở đâu đó tôi chưa tìm ra, để rà đúng chỗ.

---

## Tổng kết hành động cho FE

| # | Việc | Ai làm | Mức ưu tiên |
|---|---|---|---|
| FE1 | Đã ghi nhận: Avatar là optional, Biometric là required. Logic ép chụp hình hiện tại trên FE đã đáp ứng đúng nghiệp vụ này. | FE (tối ưu gọi API, không gấp) | Thấp |
| FE2 | Không sửa field. Verify lại **sau khi BE merge thật + kiểm tra lý do có lưu**, không chỉ kiểm tra hết lỗi 400 | FE verify | Trung bình, chờ BE |
| FE3 | Thêm message rõ ràng khi 403 ở `MeetingApprovals.jsx` (nhỏ, làm ngay được). Verify duyệt/từ chối thật sau khi BE cấp quyền MANAGER | FE làm ngay (UX) + verify sau | Cao (chặn chuỗi core) |
| FE4 | Không có gì để làm — BE chưa có cron. Rà thêm badge/filter khi BE deploy | Chờ BE | Thấp hiện tại |
| FE5 | Cần file báo cáo `bao-cao-2026-07-31` để rà tiếp | Chờ input | — |
| FE6 | Đổi cách hiểu: null ảnh là vĩnh viễn, không phải tạm thời. Không cần sửa code hiện tại (chưa có UI hiển thị ảnh ANPR nào để sửa) | Ghi nhận, không hành động ngay | Thấp |

**Việc duy nhất tôi đề xuất làm ngay trong lần này:** thêm xử lý message 403 rõ ràng cho `MeetingApprovals.jsx` (FE3) — là cải thiện nhỏ, an toàn, không phụ thuộc BE, giúp việc verify sau này dễ phân biệt lỗi quyền vs lỗi hệ thống thật.
