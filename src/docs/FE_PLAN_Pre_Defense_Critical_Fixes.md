# FE PLAN — Sửa lỗi show-stopper trước bảo vệ

> Đối chiếu trực tiếp với `PLAN NAM` (Hải đã verify BE) + đọc lại source thật từng file trong phiên này.
> Kết quả đối chiếu: **1 mục đã tự fix trước đó (mục 2)**, các mục còn lại **xác nhận đúng là bug thật**, và
> **mục 4 lớn hơn nhiều so với mô tả gốc** — grep toàn repo tìm ra pattern "Đã mô phỏng ... thành công" ở
> **12 file, ~30 chỗ**, không chỉ riêng `MeetingManagement.jsx`. Đây là phần cần ưu tiên tuyệt đối trước buổi bảo
> vệ vì rủi ro mất uy tín cao nhất (hệ thống "giả kết quả" trước hội đồng).

**Thứ tự thực hiện đề xuất:** 4 (mở rộng) → 3 → 1 → 5 → 2 (chỉ còn playback) → 6 → 7 (chờ Hải) → lỗi nhỏ.
Lý do đảo thứ tự: mục 4 tuy liệt kê #4 trong plan gốc nhưng phạm vi thật lớn nhất và rủi ro demo cao nhất — nên
làm trước, không đợi đến lượt.

---

## 1 · [ĐÃ MỞ RỘNG PHẠM VI] ⚠️ Bỏ toàn bộ "thành công giả" — không chỉ ở MeetingManagement.jsx

**Xác nhận:** đúng như plan mô tả — `MeetingManagement.jsx:173,185,202` có `catch` block hiện
`"Đã mô phỏng: Tạo/Cập nhật/Huỷ cuộc họp thành công!"` sau khi request thật lỗi (payload còn gửi field `organizer`
mà BE không nhận → luôn rơi vào catch → luôn hiện "thành công").

**Nhưng grep `"mô phỏng"` toàn `src/` tìm thêm các file khác có CÙNG pattern, cần sửa hết trong đợt này:**

| File | Dòng | Hành động giả |
|---|---|---|
| `pages/bussinessAdmin/MeetingManagement.jsx` | 173, 185, 202 | Tạo/Cập nhật/Huỷ cuộc họp |
| `pages/employee/MeetingDetail.jsx` | 291, 311, 352 | Cập nhật thông tin / Huỷ / Cập nhật Agenda |
| `pages/manager/MeetingDetail.jsx` | 312, 332, 373 | Cập nhật thông tin / Huỷ / Cập nhật Agenda |
| `components/meetings/MeetingAttendance.jsx` | 63 | Cập nhật trạng thái điểm danh thủ công (**file này là dead code — xem mục "Dọn dẹp" cuối bài, xoá thẳng thay vì sửa**) |
| `pages/bussinessAdmin/UserManagement.jsx` | 272, 291, 442, 447 | Khoá/Mở khoá / Xoá tài khoản / Import Excel |
| `pages/bussinessAdmin/DepartmentManagement.jsx` | 255, 291, 363, 403, 432, 451 | Tạo/Cập nhật phòng ban, Tạo/Cập nhật/Khoá/Xoá tài khoản |
| `pages/bussinessAdmin/RoomManagement.jsx` | 139, 142, 159 | Thêm/Cập nhật/Xoá phòng họp |
| `pages/systemAdmin/SystemSettings.jsx` | 187, 211 | Cập nhật cấu hình hệ thống |
| `pages/bussinessAdmin/dashBoard.jsx` | 415, 418 | Gửi yêu cầu xuất báo cáo (UC-158) — xác nhận thật: cả nhánh `else` (response không success) **và** `catch` đều fake success |
| `pages/shared/Profile.jsx` | 238 | Cập nhật thông tin cá nhân |

**Cách sửa (áp dụng đồng loạt cho mọi chỗ ở trên):**
1. Xoá branch fake-success trong `catch` (và trong nhánh `else`/response-not-success nếu có, như ở `dashBoard.jsx`).
2. Thay bằng hiện lỗi thật cho user: `setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.')` (dùng đúng biến
   state lỗi sẵn có của từng file — hầu hết đã có `error`/`errorMsg` state, chỉ cần dùng thay vì bỏ qua).
3. **Không** cập nhật state danh sách cục bộ (`setMeetingsList(prev => ...)`, v.v.) khi request thật thất bại — đó
   chính là phần "giả DB" khiến UI trông như đã lưu dù backend không đổi gì.
4. Sau khi xoá fake-success, các request sẽ lộ ra lỗi 400 thật nếu payload sai (như `organizer` ở mục 3) — **phải
   sửa luôn payload đúng lúc này**, không sửa xong bug 1 (ẩn lỗi) mà để lộ bug 2 (payload sai) làm user thấy lỗi
   liên tục. Xem mục 3 cho case `MeetingManagement.jsx`; các file khác (UserManagement, DepartmentManagement,
   RoomManagement, SystemSettings, Profile) cần kiểm tra riêng từng payload theo đúng DTO thật của BE trước khi
   coi là xong — **chưa đối chiếu DTO các module này trong phiên hiện tại, cần làm khi vào code**.

**Test:** với mỗi hành động ở bảng trên — nếu BE trả lỗi (vd tắt mạng, hoặc payload cố tình sai) → phải thấy
banner/toast lỗi đỏ, KHÔNG được thấy "thành công". Nếu payload đúng → hành động phải thật sự phản ánh trong DB
(F5 lại trang, dữ liệu vẫn còn).

---

## 2 · [CRITICAL, ĐÃ TỰ FIX MỘT PHẦN] Recordings Employee — chỉ còn phần playback

**Xác nhận:** đọc `Recordings.jsx` hiện tại, phần `getMySchedule` **đã được sửa đúng từ trước** (có comment
`// FE-4:` trong code xác nhận đã fix): `view: 'month'` ✓, đọc `scheduleRes.data?.items` ✓, đọc `meeting.meetingId`
✓, đọc `meeting.room?.roomName` ✓. **Không cần sửa lại phần này.**

**Còn lại 1 vấn đề thật — khớp đúng mục I-9 trong plan gốc:** `handlePlayback` (dòng 124-138) dùng
```js
const playbackUrl = `/api/v1/media-files/${fileId}/playback`;
window.open(playbackUrl, '_blank');
```
URL tương đối + `window.open` không gắn Bearer token → route cần JWT sẽ trả 401 (hoặc 404 nếu FE không có proxy
tới đúng origin BE, giống lỗi ExportReportModal ở mục 5).

**Cách sửa:** áp dụng đúng pattern đã xác nhận hoạt động đúng ở `RecordingManagement.jsx:146-158`
(`getMediaFileSecureDownload` → nhận `res.data.downloadUrl` đã ký sẵn token → `window.open(downloadUrl)`). Cần 1
service tương đương cho employee (kiểm tra `employeeServices.js` đã có hàm secure-download/playback chưa, nếu
chưa thì thêm, gọi đúng permission employee được phép).

**Test:** bấm play/download 1 recording ở trang Employee → mở được file, không 401/404.

---

## 3 · [CRITICAL, XÁC NHẬN ĐÚNG] MeetingManagement — field `organizer` không tồn tại trong DTO

**Xác nhận:** `MeetingManagement.jsx:135-141` (create) và cùng object cho update đều gửi
`organizer: formData.organizer`. Đúng như plan mô tả — payload thừa field khiến `forbidNonWhitelisted` từ chối
toàn bộ request.

**Cách sửa:**
- Payload **create**: bỏ `organizer`, giữ `title/roomId/startTime/endTime/description` (xác nhận lại đúng field
  `CreateMeetingDto` nhận trước khi code — không suy đoán).
- Payload **update**: theo plan, `UpdateMeetingDto` (PATCH) chỉ nhận `title`/`description` — bỏ hẳn
  `roomId/startTime/endTime/organizer` khỏi payload update; nếu UI cho phép đổi phòng/giờ thì phải gọi route
  riêng (`/room`, `/time` — xác nhận tên route thật với Hải trước khi code phần đổi phòng/giờ, chưa có trong
  phạm vi sửa lỗi 400 lần này).
- Làm đồng thời với mục 1 (bỏ fake-success) — nếu chỉ sửa payload mà không bỏ catch-fake-success thì sẽ không
  bao giờ nhìn thấy lỗi thật để biết đã sửa đúng chưa.

**Test:** BA tạo họp mới (không đổi phòng/giờ ở bước update) → không 400; sửa title/description → không 400; F5
lại thấy dữ liệu đã lưu thật.

---

## 4 · [CRITICAL, XÁC NHẬN ĐÚNG] BookMeeting — Agenda gửi thừa field `fileName`/`fileSize`

**Xác nhận:** `BookMeeting.jsx:578-583` đúng như mô tả — gửi cả `fileName`/`fileSize` trong mỗi agenda item, 2
field này không có trong `AgendaItemDto` → 400 mọi lần → agenda không bao giờ lưu được (bọc trong try/catch nên
lỗi bị nuốt thành `subWarnings`, không phải fake-success nhưng vẫn là mất dữ liệu âm thầm).

**Cách sửa:** đổi payload trong `agendaList.map(...)` — chỉ giữ `title`, `plannedDurationMinutes`. Bỏ hẳn
`fileName`/`fileSize`; nếu cần hiện tên file đã chọn trên UI thì giữ ở state local `agendaList` (đã có sẵn, vì
`item.file` đang được dùng để tính `fileName`/`fileSize` — chỉ cần dùng `item.file` để hiển thị UI, không đưa vào
payload gửi BE). Nếu về sau cần lưu file đính kèm thật, phải upload file trước lấy `fileId` rồi gửi `fileId` (BE
DTO có hỗ trợ field này theo plan gốc) — không nằm trong phạm vi sửa lỗi 400 lần này.

**Test:** đặt phòng họp có thêm agenda item → không còn warning "lưu chương trình họp thất bại"; vào lại chi tiết
cuộc họp thấy agenda đã lưu.

---

## 5 · [CAO, XÁC NHẬN ĐÚNG] ExportReportModal — link tải báo cáo chết

**Xác nhận:** `ExportReportModal.jsx:91-93` — `getDownloadLink()` trả `/api/v1/media-files/${outputFileId}` dùng
trực tiếp trong thẻ `<a href>` (dòng 127-133), không qua service có gắn token.

**Cách sửa:** thay `getDownloadLink()`/thẻ `<a>` tĩnh bằng gọi service secure-download (cùng pattern đã xác nhận
đúng ở `RecordingManagement.jsx:146-158`, dùng `getMediaFileSecureDownload(outputFileId)` nếu module report dùng
chung media-files, hoặc endpoint tương đương của module report nếu khác) → nhận `downloadUrl` đã ký → mở bằng
`window.open`/gán vào `<a href>` động sau khi có URL thật.

**Test:** tạo báo cáo, đợi `jobStatus === 'completed'`, bấm "Tải xuống file" → file tải về, không 404/401.

---

## 6 · [CAO] Hủy họp — `reason` vs `cancellationReason`

**Đã kiểm tra 3 service:** `employeeServices.js:151-153`, `managerServices.js:215-217`,
`businessAdminServices.js:256-258` — cả 3 đều gửi `{ reason }` tới `POST /meetings/:id/cancel`.

**⚠ CHƯA rõ trạng thái quyết định của Hải** (plan gốc ghi "Hải đang cân nhắc sửa BE, sẽ báo"). **Trước khi sửa
mục này, phải hỏi lại Hải xem BE đã chốt nhận `reason` hay `cancellationReason`** — tránh sửa nhầm chiều rồi phải
sửa lại lần 2. Nếu BE giữ nguyên chỉ nhận `cancellationReason`: đổi field ở cả 3 file trên, chỉ đổi tên key, giữ
nguyên giá trị/logic còn lại.

**Test:** hủy họp ở cả 3 role (employee/manager/business-admin) → không 400.

---

## 7 · [CHỜ HẢI QUYẾT] Ẩn nút ghi hình cho Employee

Giữ nguyên như plan gốc — chưa hành động cho tới khi Hải xác nhận Employee có được ghi hình hay không. Nếu cần
ẩn: sửa ở `pages/shared/InMeetingRoom.jsx` (nút Start/Stop ghi hình trong phiên họp) và `BookMeeting.jsx` (phần
bật `recordingEnabled`/`audioRecordingEnabled` khi đặt phòng) theo điều kiện role === Employee.

---

## Dọn dẹp — xoá dead code

`src/components/meetings/MeetingAttendance.jsx` (lưu ý khác thư mục `components/` số nhiều, không phải
`component/` số ít) — **xác nhận không được import ở bất kỳ đâu** (grep toàn `src/` không có file nào import từ
đường dẫn này). Component đang được dùng thật là `src/component/MeetingAttendanceBoard.jsx` (import bởi
`pages/manager/MeetingDetail.jsx` và `pages/shared/InMeetingRoom.jsx`). Xoá thẳng file `MeetingAttendance.jsx` —
không cần sửa (nó cũng có 1 chỗ "mô phỏng" ở dòng 63, nhưng vì là dead code nên không cần vá, xoá luôn).

---

## Lỗi nhỏ (làm sau nếu còn thời gian — chưa verify lại trong phiên này, tin theo plan gốc)

- I-10: nối `isRead` + mark-read API (thay localStorage badge) — `Notifications.jsx:40`, `NotificationBell.jsx:65`
- I-11: `NotificationBell.jsx:51` đọc `zone_name` — API list chỉ trả `zone_id` → hiện "Không xác định khu vực"
- I-12: `VehicleRegistrations` search param bị strip (cosmetic)

---

## CHECKLIST NAM (đã sắp lại theo mức độ xác nhận + rủi ro)

- [x] 1. ⚠️ Bỏ TOÀN BỘ "thành công giả" — đã sửa 9 file (10 file trong bảng gốc, 1 là dead code đã xoá thẳng ở mục dọn). Đồng thời phát hiện + sửa thêm 2 pattern cùng họ chưa liệt kê trong bảng gốc: mock fallback data ở `MeetingManagement.jsx` (`fetchMeetingsList`/`loadRooms` tự bịa dữ liệu khi API lỗi) và fake Excel-import simulation (`UserManagement.jsx` — set Timeout giả lập validate file dựa trên `file.size % 2`)
- [x] 2. Recordings employee — đã sửa `handlePlayback` dùng `getMediaFileSecureDownload` (secure-download có token)
- [x] 3. MeetingManagement — đã bỏ field `organizer` khỏi payload create/update (đối chiếu đúng `CreateMeetingDto`/`UpdateMeetingDto` thật); tiện thể sửa luôn cột hiển thị "Người tổ chức" đọc nhầm field (`m.organizer` → `m.organizerName`)
- [x] 4. BookMeeting agenda — đã bỏ `fileName`/`fileSize` khỏi payload
- [x] 5. ExportReportModal — đã đổi sang `getMediaFileSecureDownload`-style secure-download có token
- [ ] 6. (hỏi Hải trước) hủy họp `reason` → `cancellationReason` ở 3 service — CHƯA làm, cần xác nhận Hải trước
- [ ] 7. (chờ Hải) ẩn nút ghi hình Employee nếu cần — CHƯA làm, chờ quyết định
- [x] Dọn: đã xoá `components/meetings/MeetingAttendance.jsx` (xác nhận dead code, không nơi nào import)
- [ ] Lỗi nhỏ I-10/I-11/I-12 (không chặn demo, chưa làm — để cuối nếu còn giờ)

**Verify đã làm:** `CI=true npm run build` — không có lỗi cú pháp/module ở các file đã sửa; các cảnh báo ESLint hiện lên (43 file) đều là nợ kỹ thuật có sẵn từ trước, không phát sinh mới từ đợt sửa này (đối chiếu qua `git diff` từng file). **Verify CHƯA làm:** chưa test tay trên trình duyệt (cần đăng nhập nhiều role thật — ngoài khả năng của agent), khuyến nghị Nam tự test theo đúng mục "Test" ở từng phần bên trên trước khi coi là xong.
