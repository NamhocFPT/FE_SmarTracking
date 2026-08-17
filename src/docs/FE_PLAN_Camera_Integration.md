# FE PLAN — Camera Domain (SMRMPTS)
## Kế hoạch tích hợp FE cho phần camera · Dựa trên FE build hiện tại + BE mới nhất

> Đối chiếu trang FE hiện có ↔ service đã viết ↔ endpoint BE thật. Chia việc thành 3 loại:
> **A. Nối lại** (đã có màn + service, còn mô phỏng) · **B. Sửa lệch** (FE gọi endpoint sai/thiếu)
> · **C. Làm màn mới** (BE có endpoint, FE chưa có màn). Hợp đồng response chi tiết xem file
> `FE_PLAN_Camera_Endpoints.md`.

---

## 1. Ảnh chụp trạng thái hiện tại

| Chức năng | Màn FE | Service | Endpoint BE | Trạng thái |
|---|---|---|---|---|
| Danh sách thiết bị | DeviceManagement | `getDevices` ✅ | `GET /iot-devices` ✅ | Nối thật |
| Tạo/sửa/xóa/bật-tắt thiết bị | DeviceManagement | `registerDevice/updateDevice/deleteDevice/...` ✅ | `POST/PATCH/DELETE /iot-devices/*` ✅ | **Còn mô phỏng** (A) |
| Cấu hình RTSP / Face Server | DeviceManagement | `rtsp-config`, `face-server/rotate` ✅ | ✅ | **Còn mô phỏng** (A) |
| Đăng ký khuôn mặt | FaceRegistration | `registerFaceProfile` ✅ | `POST /users/:id/face-profile` ✅ | Gần nối (còn 2 mock) |
| Duyệt ảnh khuôn mặt | AvatarSubmissionsReview | avatarReviewService ✅ | ✅ | Nối thật |
| Ghi hình (config/list) | RecordingManagement | một phần | recording/media ✅ | Nối một nửa (A) |
| "Recordings của tôi" | employee/Recordings | `getMyRecordings` → `/me/recordings` | **KHÔNG có trên BE** | **Lệch** (B) |
| Dashboard (no-show/utilization/on-time) | dashBoard | analytics services ✅ | `/analytics/*` ✅ (9 controller) | Nối được |
| ANPR | ANPRManagement, MyVehicles | anprService ✅ | `/anpr/*` ✅ | Mới thêm — kiểm nối |
| **Bảng điểm danh cuộc họp** | — | — | `GET /meetings/:id/attendance` ✅ | **Chưa có màn** (C) |
| **Giám sát phòng / no-show** | — | — | `GET /rooms/realtime-status`, `GET /no-show-cases` ✅ | **Chưa có màn** (C) |
| **Hiện diện IVSS** | — | — | `GET /ivss/meetings/:id/presence` ✅ | **Chưa có màn** (C) |
| **Danh sách/phát lại media** | — | — | `GET /meetings/:id/media-files`, `/playback` ✅ | **Chưa có màn** (C) |
| **Cảnh báo khuôn mặt lạ / verify chưa map** | — | — | `GET /face-access/stranger-alerts`, `/unmapped-verifies` ✅ | **Chưa có màn** (C) |

---

## 2. Loại A — NỐI LẠI (đã có màn + service, đang mô phỏng)

### A1. DeviceManagement — nối mutation *(ưu tiên cao nhất)*
File: `src/pages/systemAdmin/DeviceManagement.jsx`. Service đã có đủ, chỉ cần thay 4 khối mô phỏng bằng gọi service thật.

| Dòng hiện tại (mô phỏng) | Thay bằng service |
|---|---|
| ~174 "Đã mô phỏng: Đăng ký..." | `await registerDevice(formData)` |
| ~216 "Đã mô phỏng: Cập nhật..." | `await updateDevice(deviceId, formData)` |
| ~238 "Đã mô phỏng: Xóa..." | `await deleteDevice(deviceId)` |
| ~250 "Đã mô phỏng chuyển đổi..." | `await enableDevice / disableDevice(deviceId)` |

Việc cần làm mỗi handler: gọi service trong try/catch → thành công thì `getDevices()` lại để refresh + toast thành công → lỗi thì hiển thị message BE trả về. Gỡ khối "Mock Fallbacks for offline development" (dòng ~68). Bổ sung nối: cấu hình RTSP (`rtspConfig`), Face Server rotate/revoke, check-availability (hiển thị kết quả reachable), gán phòng (`assignRoom`).

### A2. RecordingManagement — nối nốt phần còn mô phỏng
File: `src/pages/bussinessAdmin/RecordingManagement.jsx` (còn 3 chỗ mock). Nối start/stop/status polling + list media + playback + đổi visibility theo hợp đồng response ở `FE_PLAN_Camera_Endpoints.md` mục 2.6.

### A3. FaceRegistration — gỡ 2 mock còn lại
Nối trạng thái duyệt + kết quả upload thật (`registerFaceProfile` đã có).

---

## 3. Loại B — SỬA LỆCH FE↔BE

### B1. `getMyRecordings` gọi endpoint không tồn tại
`employeeServices.getMyRecordings` gọi `GET /me/recordings` — **BE không có endpoint này**. BE dùng `GET /meetings/:meetingId/media-files` + `GET /media-files/:id`.
→ Cách xử lý: đổi service employee sang dùng `media-files` (theo cuộc họp), HOẶC yêu cầu BE thêm endpoint tổng hợp `/me/recordings`. **Chốt với BE trước khi sửa.**

### B2. `GET /rooms` (list phòng) không tồn tại — đã đánh dấu deprecated
`employeeServices.getRooms` tự ghi `@deprecated Backend chưa có endpoint list phòng`. Các màn cần list phòng dùng `GET /rooms/available` (đã có) thay thế, hoặc yêu cầu BE thêm list. Không dùng hàm deprecated.

### B3. Xác nhận field name device
Service device dùng response BE — nhắc FE lấy đúng field theo hợp đồng (`device_name`, `health_status`, `last_seen_at`, `metadata_json` đã mask token). Không hiển thị lại RTSP URL kèm mật khẩu.

---

## 4. Loại C — LÀM MÀN MỚI (BE đã có endpoint)

Thứ tự theo giá trị demo. Mỗi màn cần: thêm hàm service gọi endpoint + dựng UI theo hợp đồng response (`FE_PLAN_Camera_Endpoints.md`).

### C1. Bảng điểm danh cuộc họp *(giá trị demo cao nhất)*
- Endpoint: `GET /meetings/:id/attendance` (response mục 2.2 — có `summary` + `items`).
- UI: header 4 số (checkedIn/late/absent/attendanceRate) + bảng list items, badge theo `attendanceStatus`, hiện `lateMinutes`.
- Modal hiệu chỉnh: `POST/PATCH .../attendance/*` (điểm danh thủ công, sửa, hủy hiệu lực).
- **Lưu ý:** cột `attendanceSource`/`checkInMethod` chỉ hiện khi `permissions.canViewAttendanceSource=true`.
- Actor thấy màn: Host (MANAGER), Business Admin, System Admin.

### C2. Giám sát phòng & No-show
- `GET /rooms/realtime-status` (danh sách phòng + trạng thái) + `GET /no-show-cases?status=&roomId=` (bảng case no-show — **BE vừa thêm**, response: `id, roomId, roomName, meetingId, status, detectedAt, warningSentAt, releasedAt`).
- Thao tác: giải phóng thủ công `POST /no-show-cases/:id/release`, cập nhật case `PATCH`.
- **Nên subscribe WebSocket** cho trạng thái phòng realtime thay vì poll.
- Actor: Manager, Business Admin, System Admin.

### C3. Danh sách & phát lại media
- `GET /meetings/:id/media-files`, `GET /media-files/:id`, `GET /media-files/:id/playback` (stream — gắn vào `<video>`, không parse JSON), `PATCH .../visibility`.
- Actor: Host, người dự (EMPLOYEE có quyền play), Business Admin.

### C4. Hiện diện IVSS (làm sau khi có phần cứng)
- `GET /ivss/meetings/:id/presence` (response mục 2.5 — `users[].segments` render timeline ngang, `durationMs` đổi ra phút) + `/presence/report` (PDF).
- Actor: Host, Admin. **Đánh dấu Pending** — phụ thuộc nghiệm thu IVSS thật.

### C5. Cảnh báo khuôn mặt lạ / verify chưa map *(ưu tiên cuối)*
- `GET /face-access/stranger-alerts`, `GET /face-access/unmapped-verifies` + `POST .../map`.
- **Không có ảnh khuôn mặt** trong payload — UI chỉ dựa metadata (thiết bị, phòng, thời gian, tên person nếu có).
- Actor: System Admin.

---

## 5. Thứ tự ưu tiên tổng

1. **A1 — DeviceManagement nối mutation** (nhỏ, là màn camera lõi, đang mock nhiều nhất).
2. **C1 — Bảng điểm danh** (demo cao, response chuẩn sẵn).
3. **C2 — Giám sát phòng & no-show** (BE vừa xong endpoint, cần WebSocket).
4. **A2/A3 — Nối nốt RecordingManagement, FaceRegistration.**
5. **C3 — Media list & playback.**
6. **B1/B2 — Sửa lệch `/me/recordings`, `/rooms` (chốt với BE).**
7. **C4 — Hiện diện IVSS** (sau khi nghiệm thu phần cứng).
8. **C5 — Stranger/unmapped review.**

---

## 6. Lưu ý xuyên suốt cho FE team

- **Base URL** `http://localhost:3000/api/v1`, token Bearer đã có sẵn ở `utils/request`.
- **Bọc response** `{ success, message, data, meta }` — đọc list ở `data`, phân trang ở `meta` (dùng `limit`, không phải `pageSize`).
- **RBAC hiện tại:** quyền camera vừa seed — nếu gọi endpoint bị **403**, kiểm tra role tài khoản test có quyền tương ứng chưa (xem `RBAC_Camera_Decisions.md`). Ví dụ EMPLOYEE xem được media playback nhưng KHÔNG quản lý thiết bị.
- **File nhị phân** (`playback`, `presence/report`, `secure-download`): stream/PDF, không parse JSON.
- **Không hiển thị** RTSP URL kèm credential, không chờ ảnh base64 khuôn mặt (BE không trả).
- **WebSocket** cho realtime: trạng thái phòng, presence trong họp, lỗi ghi hình.
