# FE PLAN — Nhóm D + E: Cảnh báo pending mềm & Chi tiết xung đột khi duyệt/từ chối

> Bối cảnh: tiếp nối Nhóm A/B/C (kế hoạch tổng `KE_HOACH_XU_LY_XUNG_DOT_PHONG_GIO_HOP_2026-08-08.md`
> ở root repo). BE đã thêm field `pendingConflicts` (mỗi phòng trong kết quả tìm/kiểm tra phòng) và
> `conflictDetails` (mỗi meeting request pending, enrich từ query TƯƠI — không phải
> `conflict_summary_json`) + `payloadJson` trên notification `meeting_request_rejected`. Đối chiếu
> trực tiếp source thật (`MeetingApprovals.jsx`, `NotificationBell.jsx`, `Notifications.jsx`,
> `MeetingDetail.jsx` x2, `BookMeeting.jsx`) trong phiên này, không giả định API — dùng đúng field
> BE đã xác nhận qua test API trực tiếp.

## 1 · Nhóm D — Badge/banner cảnh báo mềm request pending khác

- `src/pages/employee/BookMeeting.jsx`: mỗi room card trong kết quả tìm phòng thêm dòng cảnh báo
  màu hổ phách nếu `room.pendingConflicts?.length > 0`: "N yêu cầu khác đang chờ duyệt cùng giờ".
  Không loại phòng khỏi danh sách, chỉ là thông tin.
- `src/pages/employee/MeetingDetail.jsx`, `src/pages/manager/MeetingDetail.jsx`: sau khi bấm nút
  "Kiểm tra trùng lịch & phòng" (Nhóm C), nếu phòng đang chọn (tra trong `rooms` theo `editRoomId`)
  có `pendingConflicts.length > 0`, hiện thêm 1 dòng cảnh báo hổ phách độc lập với banner ok/conflict
  hiện có — 2 việc khác chiều: banner ok/conflict nói về booking `approved`/`active`, dòng mới nói về
  request `pending` khác (informational, không impact validate).

## 2 · Nhóm E — Chi tiết xung đột thật thay vì text tĩnh

### 2.1 `MeetingApprovals.jsx` — **[BUG tìm thấy khi verify — đã sửa]**

Bản đầu chỉ thêm nhánh hiển thị `conflictDetails` LỒNG BÊN TRONG điều kiện
`conflictCheckStatus === 'warning' || 'blocked'`. Verify trực tiếp trên browser (sau khi phát hiện
và sửa lỗi môi trường mô tả ở mục 3) cho thấy banner đỏ **không bao giờ hiện** dù `conflictDetails`
có dữ liệu thật — vì với xung đột PHÒNG, `conflictCheckStatus` luôn là `'clear'` (field này chỉ có
giá trị đúng cho xung đột PARTICIPANT ghi lúc tạo; xung đột phòng phát hiện lúc `approve()` bị ghi
rồi rollback theo transaction, không bao giờ persist — xem BE plan). Đã sửa: quyết định hiện banner
đỏ dựa trên `conflictDetails.length > 0` (đáng tin, check tươi) TRƯỚC, `conflictCheckStatus` chỉ còn
là fallback cho trường hợp xung đột participant. Áp dụng sửa tương tự cho badge "Bị trùng lịch" ở
cả 2 view (Grid dòng ~394, Danh sách/bảng dòng ~539) — badge này trước giờ CŨNG luôn hiện "Không
trùng" sai cho xung đột phòng vì cùng lỗi field.

- Banner chi tiết (trong modal "Xem chi tiết"): liệt kê từng cuộc họp đang giữ chỗ (`meetingTitle`,
  `roomName`, giờ, `hostName`) thay vì câu văn tĩnh cũ.
- Badge trên card: "Bị trùng lịch" (đỏ) khi `conflictDetails` có phần tử HOẶC `conflictCheckStatus`
  warning/blocked (giữ tương thích ngược cho xung đột participant).

### 2.2 `src/component/NotificationBell.jsx`

- Thêm `payloadJson: item.payloadJson ?? null` vào mapping (trước đó bị lọc bỏ, chỉ pick
  id/title/body/timestamp).
- Render: nếu `item.payloadJson?.conflictDetails?.[0]` tồn tại, nối thêm
  ` — trùng với "<meetingTitle>"` vào cuối dòng body (dropdown nhỏ, giữ ngắn gọn).

### 2.3 `src/pages/systemAdmin/Notifications.jsx`

- Mapping đã sẵn `...item` (spread) nên `payloadJson` tự động có mặt, không cần sửa mapping.
- Render: thêm khối cảnh báo đỏ nhỏ dưới `noti.body` khi `noti.payloadJson?.conflictDetails?.length`,
  liệt kê từng xung đột + dòng "Phòng còn trống gợi ý: ..." từ `suggestedAlternatives`.

## 3 · Phát hiện môi trường quan trọng — `.env.development` trỏ về server REMOTE

`REACT_APP_API_BASE_URL` trong `.env.development`/`.env.production`/default fallback trong
`src/utils/request.js` đều là `https://api.smartracking.io.vn/api/v1` — **không phải
`http://localhost:3000`**. Nghĩa là `npm start` (dev server) mặc định gọi API server THẬT trên
internet, không phải backend chạy local dù `npm run start:dev` đang chạy song song. Điều này khiến
verify Nhóm D/E ban đầu "thất bại" (dữ liệu mới từ BE local không bao giờ tới FE) dù code đúng 100%
— không phải bug, mà do cấu hình môi trường. Để verify đổi tạm bằng phòng bằng cách tạo
`.env.local` (CRA ưu tiên cao nhất, không commit — đã xoá sau khi verify xong) với
`REACT_APP_API_BASE_URL=http://localhost:3000/api/v1`, restart `npm start`. **Lưu ý cho lần sau**:
nếu cần test FE với BE local, luôn tạo `.env.local` tương tự — đừng mất thời gian nghi ngờ cache/HMR
như phiên này.

**Test đã thực hiện** (qua `.env.local` tạm thời trỏ backend local, dọn sạch sau khi xong):
tạo 2 cặp cuộc họp trùng phòng/giờ qua API thật (tài khoản demo), approve 1 cái, xác nhận:
badge "Bị trùng lịch" + banner chi tiết đúng tên cuộc họp/phòng/host trên `MeetingApprovals.jsx`;
reject cái còn lại, xác nhận notification nhận được (`NotificationBell` dropdown) có dòng
" — trùng với ..." đúng tên cuộc họp đang giữ chỗ. Đã dọn toàn bộ dữ liệu test (cancel/reject) sau
khi verify.
