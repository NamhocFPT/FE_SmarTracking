# FE PLAN — Sửa lệch phần Camera (chỉ việc của FE team)

> Phạm vi: **chỉ phần camera**, **chỉ những gì FE tự sửa được** (không cần chờ BE).
> Các chỗ phụ thuộc BE thêm endpoint được liệt kê riêng ở Mục cuối — **không** nằm trong việc FE.
> Base URL `http://localhost:3000/api/v1`, response bọc `{ success, message, data, meta }`, phân trang dùng `limit`.

---

## FE-1 · Sửa path Stranger Alerts về đúng module BE *(bắt buộc)*

**Vấn đề:** service gọi sai base path `/ivss/stranger-alerts`, trong khi BE đặt ở `/face-access/stranger-alerts`.

**File:** `src/service/businessAdminServices.js`
- Dòng 183: đổi
  `get(\`/ivss/stranger-alerts${query}\`)` → **`get(\`/face-access/stranger-alerts${query}\`)`**

**Kết quả mong đợi:** `getStrangerAlerts` trả danh sách cảnh báo (response chỉ có metadata: `id, deviceCode, roomName, capturedAt` — **không có ảnh khuôn mặt**). UI `StrangerAlerts.jsx` không được chờ ảnh base64.

---

## FE-2 · Tách luồng "Stranger" và "Map danh tính" trong StrangerAlerts.jsx *(bắt buộc)*

**Vấn đề:** `StrangerAlerts.jsx` đang trộn hai nghiệp vụ khác nhau của BE làm một:
- **Stranger alert** = khuôn mặt lạ (BE: `GET /face-access/stranger-alerts`). Chỉ để **xem/đánh dấu xử lý**.
- **Map person↔user** = verify chưa khớp danh tính (BE: `GET /face-access/unmapped-verifies` + `POST /face-access/unmapped-verifies/map`). Đây mới là chỗ **gán user**.

Hiện component (dòng 4, 60, 95–107) lấy `getUsers` để "map user vào stranger" — sai nghiệp vụ: stranger là người lạ hoàn toàn, không map vào user; việc map thuộc luồng unmapped-verifies.

**Cách sửa:**
1. **StrangerAlerts.jsx** chỉ giữ chức năng xem danh sách + đánh dấu xử lý (không dropdown chọn user, bỏ `getUsers`, bỏ `mappedUserId`, bỏ nhánh `action === 'MAP_TO_USER'`).
2. Thêm service mới cho luồng map danh tính (trong `businessAdminServices.js` hoặc service phù hợp):
   ```js
   export const getUnmappedVerifies = async (params = {}) =>
       await get(`/face-access/unmapped-verifies${toQuery(params)}`);
   export const mapUnmappedVerify = async (data) =>   // data: { personId | verifyId, userId }
       await post(`/face-access/unmapped-verifies/map`, data);
   ```
3. Nếu cần UI map danh tính, làm **component riêng** (ví dụ `UnmappedVerifyReview.jsx`) — dùng `getUsers` cho dropdown ở đây, không phải ở StrangerAlerts.

> ⚠ Nút "resolve stranger" (đánh dấu đã xử lý) hiện gọi endpoint **BE chưa có** — xem Mục cuối. Tạm thời để nút disabled hoặc ẩn cho tới khi BE có endpoint.

---

## FE-3 · Sửa luồng chi tiết No-show trong RealtimeRoomMonitor *(bắt buộc)*

**Vấn đề:** `getNoShowStatus` (service dòng 165–166) gọi `GET /meetings/:id/no-show-status` — **BE không có** endpoint này.

**Cách sửa (FE tự làm, không cần BE):** đổi sang dùng endpoint list no-show đã có, lọc theo phòng.

**File:** `src/service/businessAdminServices.js` — đổi `getNoShowStatus`:
```js
// Trước: get(`/meetings/${meetingId}/no-show-status`)
// Sau: lấy case no-show theo phòng từ list đã có
export const getNoShowByRoom = async (roomId) =>
    await get(`/no-show-cases?roomId=${roomId}&status=DETECTED`);
```
Trong `RealtimeRoomMonitor.jsx`: khi bấm xem chi tiết một phòng, gọi `getNoShowByRoom(room.roomId)` → lấy `data[0]` (case mới nhất) để hiển thị `caseId, detectedAt, warningSentAt, status`. Các thao tác `releaseNoShowRoom(caseId)` và `handleNoShowCase(caseId, ...)` **giữ nguyên** — đã khớp BE (`/no-show-cases/:id/release`, `/no-show-cases/:id`).

**Lưu ý field:** response no-show case gồm `id, roomId, roomName, meetingId, status, detectedAt, warningSentAt, releasedAt` — dùng `id` làm `caseId`.

---

## FE-4 · Sửa "Recordings của tôi" (employee) *(bắt buộc)*

**Vấn đề:** `employeeServices.getMyRecordings` (dòng 159–161) gọi `GET /me/recordings` — **BE không có**. Trang `employee/Recordings.jsx` sẽ lỗi.

**Cách sửa (FE tự làm):** dùng endpoint media-files theo cuộc họp mà BE đã có.
- Nếu trang liệt kê recording theo từng cuộc họp: đổi sang `GET /meetings/:meetingId/media-files` (cần meetingId từ context/lịch họp của user).
- Playback: `GET /media-files/:fileId/playback` (stream — gắn vào `<video src>`, **không** parse JSON).
- Bỏ/sửa `getRecordingDownloadUrl` nếu nó cũng trỏ endpoint không tồn tại (kiểm dòng 167).

> Nếu FE thấy khó vì không có sẵn meetingId, đây là ứng viên để **BE thêm endpoint tổng hợp** `/me/recordings` — xem Mục cuối. Nhưng trước mắt FE có thể chạy qua media-files theo meeting.

---

## FE-5 · Rà nốt các thao tác thiết bị trong DeviceManagement *(kiểm tra, sửa nếu thiếu)*

DeviceManagement đã nối `registerDevice/updateDevice/enableDevice/disableDevice/rotateFaceServerToken` (đã xác nhận). **Kiểm tra và nối nốt nếu còn thiếu** (service đã có sẵn, BE đã có endpoint):
- `handleDeleteDevice` (dòng 206) có thực sự gọi `deleteDevice(id)` không, hay chỉ xóa khỏi state.
- Gán phòng: `assignRoom(id, {roomId})` → `POST /iot-devices/:id/assign-room`.
- Cấu hình RTSP: `updateRtspConfig(id, {rtsp_url})` → `PATCH /iot-devices/:id/rtsp-config`.
- Kiểm tra khả dụng: `checkAvailability(id)` → `POST /iot-devices/:id/check-availability` (hiển thị `reachable` + `checked_at`).
- Revoke token: `revokeFaceServerToken(id)` → `POST /iot-devices/:id/face-server/revoke`.
- Token rotate: hiển thị token trả về trong modal "chỉ hiện một lần", có nút copy; không log token.
- **Không** hiển thị RTSP URL kèm mật khẩu (BE đã mask).

---

## FE-6 · Lưu ý RBAC khi test *(không sửa code, chỉ để test đúng)*

Quyền camera đã seed. Khi một endpoint trả **403**, không phải lỗi FE — do vai trò tài khoản test chưa có quyền:
- Thiết bị IoT (create/config): chỉ **SYSTEM_ADMIN**.
- Điểm danh thủ công, presence IVSS: **SYSTEM_ADMIN, MANAGER**.
- Xem/phát lại media: **SYSTEM_ADMIN, MANAGER, EMPLOYEE**.
- Giám sát phòng/no-show: **SYSTEM_ADMIN, MANAGER, BUSINESS_ADMIN**.
- Stranger/unmapped: chỉ **SYSTEM_ADMIN**.

→ Test mỗi màn bằng tài khoản đúng vai trò (ví dụ StrangerAlerts phải test bằng SYSTEM_ADMIN, không phải BUSINESS_ADMIN).

---

## Thứ tự làm (FE)

1. FE-1 (đổi path stranger) — 5 phút.
2. FE-3 (no-show theo list) — nhỏ, gỡ lỗi RealtimeRoomMonitor.
3. FE-4 (recordings qua media-files) — nhỏ.
4. FE-5 (rà nốt thao tác thiết bị) — kiểm tra + nối thiếu.
5. FE-2 (tách stranger vs map danh tính) — lớn nhất, làm sau cùng.

---

## PHỤ THUỘC BE — KHÔNG phải việc FE *(chỉ để FE biết, chuyển cho BE team)*

Hai endpoint sau BE chưa có; FE đã tạm xử bằng cách khác (FE-3, FE-4) nhưng nếu muốn đúng ý thiết kế thì BE cần thêm:
1. **`PATCH /face-access/stranger-alerts/:id/resolve`** — để đánh dấu cảnh báo đã xử lý (nút resolve ở StrangerAlerts đang chờ cái này). Nếu BE không làm → FE bỏ nút resolve.
2. **`GET /me/recordings`** (tổng hợp recording của user hiện tại) — tùy chọn; nếu không có, FE dùng media-files theo meeting như FE-4.

Các thao tác `no-show-cases release/patch`, `stranger-alerts GET`, `unmapped-verifies GET/map`, media-files, attendance, presence, realtime-status — **BE đã có đủ**, FE chỉ cần gọi đúng path.
