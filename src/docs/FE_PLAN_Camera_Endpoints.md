# FE PLAN — Camera Domain (SMRMPTS)
## Mô tả Endpoint & Màn hình cho FE Team

> Tài liệu cho FE team: (1) các màn hình camera cần **thêm/sửa**, (2) **hợp đồng response chi tiết**
> cho các endpoint camera mà FE cần hiển thị nhưng hiện chưa có. Nội dung lấy trực tiếp từ code BE.

**Quy ước chung:**
- Base URL: `/api/v1`. Mọi endpoint (trừ webhook thiết bị) yêu cầu header `Authorization: Bearer <accessToken>`.
- Response bọc chuẩn: `{ success: boolean, message: string, data: ..., meta?: {...} }` (một số endpoint list có thêm `meta` phân trang).
- Field thời gian: ISO 8601 (`"2026-07-03T09:02:00.000Z"`).
- **KHÔNG** có endpoint nào trả ảnh base64/snapshot khuôn mặt (đã chặn ở BE vì lý do bảo mật) — FE đừng chờ ảnh khuôn mặt trong các payload này.
- Các endpoint `device-callbacks/*`, `internal/*`, `room-camera/*` là **webhook thiết bị gọi vào**, FE **không** dùng.

---

## PHẦN 1 — Màn hình cần THÊM / SỬA

### A. Cần SỬA (đã có màn nhưng còn mô phỏng / thiếu nối)

| Màn hình FE hiện tại | Vấn đề | Việc cần làm |
|---|---|---|
| `systemAdmin/DeviceManagement.jsx` | List gọi API thật, **tạo/sửa/xóa/cấu hình vẫn mô phỏng** (10 chỗ) | Nối các mutation thật: create, update, assign-room, rtsp-config, face-server rotate/revoke, disable/enable, check-availability |
| `bussinessAdmin/RecordingManagement.jsx` | Nối một nửa (mô phỏng 6 chỗ) | Nối start/stop, status polling, list media, playback, đổi visibility |
| `employee|manager/FaceRegistration.jsx` | Gần xong (mô phỏng 2 chỗ) | Nối trạng thái duyệt + kết quả upload thật |

### B. Cần THÊM MỚI (BE đã có endpoint, FE chưa có màn)

| Màn hình mới | Actor | Endpoint chính | Mục đích |
|---|---|---|---|
| **Chi tiết & cấu hình thiết bị** (tách từ list) | System Admin | `GET/PATCH /iot-devices/:id`, `rtsp-config`, `face-server/*`, `check-availability` | Cấu hình Face Server/RTSP, xoay token, kiểm tra khả dụng |
| **Bảng điểm danh cuộc họp** | Host/Admin | `GET /meetings/:id/attendance` | Hiển thị ai check-in/out, đúng giờ/muộn, tỉ lệ điểm danh |
| **Hiệu chỉnh điểm danh** (modal) | Host/Admin | `POST/PATCH .../attendance/...` | Điểm danh thủ công, sửa, đổi trạng thái, hủy hiệu lực |
| **Cảnh báo khuôn mặt lạ** | Admin | `GET /face-access/stranger-alerts` | Danh sách sự kiện stranger |
| **Duyệt verify chưa map** | Admin | `GET /face-access/unmapped-verifies` + `POST .../map` | Gán person↔user cho verify không khớp |
| **Giám sát phòng realtime + no-show** | Manager/Admin | `GET /rooms/realtime-status`, `GET /rooms/:id/status` | Trạng thái phòng, case no-show |
| **Hiện diện theo người (IVSS)** | Host/Admin | `GET /ivss/meetings/:id/presence` + `/presence/:userId` + `/report` | Timeline & tổng thời gian hiện diện từng người |
| **Danh sách & phát lại media** | Host/Admin | `GET /meetings/:id/media-files`, `/media-files/:id`, `/playback` | Xem/phát lại/tải bản ghi hình |

---

## PHẦN 2 — HỢP ĐỒNG RESPONSE CHI TIẾT

### 2.1. Quản lý thiết bị IoT/camera

#### `GET /iot-devices` — danh sách thiết bị
Query: `?page&pageSize&status&deviceType&roomId&search`
```jsonc
{
  "success": true,
  "message": "...",
  "data": [
    {
      "id": "uuid",
      "device_name": "Face Terminal Cửa P.301",
      "device_code": "FT-301",
      "device_type": "face_terminal",   // face_terminal | ip_camera | ivss
      "room_id": "uuid | null",
      "ip_address": "192.168.1.222 | null",
      "status": "active",               // active | disabled
      "health_status": "online",        // online | offline | unknown
      "last_seen_at": "ISO | null",     // mất heartbeat → cũ dần
      "metadata_json": { },             // đã mask trường nhạy cảm (token…)
      "created_by_name": "string | null",
      "created_at": "ISO",
      "updated_at": "ISO"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 }
}
```
**Gợi ý hiển thị:** badge màu theo `health_status` (online=xanh, offline=đỏ, unknown=xám); `last_seen_at` hiển thị dạng "x phút trước".

#### `GET /iot-devices/:id` — chi tiết
Trả về **một** object như phần tử ở trên.

#### `POST /iot-devices` — tạo thiết bị
Body: `{ device_name, device_code, device_type, ip_address?, room_id? }` → trả object thiết bị vừa tạo.

#### `POST /iot-devices/:id/assign-room` — gán phòng
Body: `{ room_id }` → trả thiết bị đã cập nhật (`room_id` mới).

#### `PATCH /iot-devices/:id` — cập nhật thông tin
Body: các field cho phép sửa (`device_name`, `ip_address`…) → trả object đã cập nhật.

#### `PATCH /iot-devices/:id/rtsp-config` — cấu hình RTSP (IP camera)
Body: `{ rtsp_url }` (dạng `rtsp://user:pass@host:554/...`) → trả `{ success, message, data: { id, status } }`.
**Lưu ý:** BE che (mask) credential trong response — FE đừng hiển thị lại URL kèm mật khẩu.

#### `POST /iot-devices/:id/face-server/rotate` & `.../revoke` — xoay/thu hồi callback token
- `rotate` → trả token mới **một lần** để hiển thị/ghi lại: `{ success, message, data: { callback_token, callback_url } }`.
- `revoke` → `{ success, message }`.
**Gợi ý:** hiển thị token trong modal "chỉ hiện một lần", có nút copy.

#### `POST /iot-devices/:id/disable` & `.../enable` — vô hiệu hóa/kích hoạt
→ trả thiết bị với `status` mới.

#### `POST /iot-devices/:id/check-availability` & `POST /iot-devices/probe-status` — kiểm tra khả dụng (RTSP probe)
→ `{ success, message, data: { device_id, reachable: boolean, checked_at: "ISO", detail?: "string" } }`.
**Gợi ý:** nút "Kiểm tra" → spinner → hiện kết quả reachable (✓/✗) + thời điểm.

### 2.2. Điểm danh (Attendance)

#### `GET /meetings/:meetingId/attendance` — bảng điểm danh
Query: `?page&pageSize&status&search`
```jsonc
{
  "success": true,
  "message": "Danh sach diem danh...",
  "data": {
    "meeting": { "id","title","status","startTime","endTime","roomId" },
    "permissions": { "canViewAttendanceSource": true },   // FE ẩn cột nguồn nếu false
    "summary": {
      "scope": "internal_participants_only",
      "totalParticipants": 12, "checkedInCount": 9, "presentCount": 8,
      "lateCount": 2, "absentCount": 3, "notCheckedInCount": 3,
      "attendanceRate": 0.75
    },
    "items": [
      {
        "participantId": "uuid", "userId": "uuid",
        "avatarUrl": "string | null",
        "fullName": "Trần Đức Hải",
        "departmentName": "string | null",
        "positionTitle": "string | null",
        "participantRole": "host",        // host|attendee|approver|note_taker
        "attendanceStatus": "present",    // present|late|absent|not_checked_in|...
        "checkInTime": "ISO | null",
        "attendanceSource": "face_terminal | null",  // chỉ khi có quyền
        "checkInMethod": "face | manual | null",      // chỉ khi có quyền
        "isLate": true, "lateMinutes": 7
      }
    ]
  },
  "meta": { "page":1,"pageSize":20,"total":12,"totalPages":1 }
}
```
**Gợi ý:** header là 4 số tổng hợp (`checkedInCount/lateCount/absentCount/attendanceRate`); bảng dưới list `items`, badge theo `attendanceStatus`, hiện `lateMinutes` khi `isLate`.

#### `POST /meetings/:meetingId/attendance` — điểm danh thủ công
Body: `{ userId, checkInTime?, note? }` → trả `ManualAttendanceResponseDto`:
```jsonc
{
  "id":"uuid","meetingId":"uuid","userId":"uuid","participantId":"uuid|null",
  "checkInMethod":"manual","attendanceSource":"manual",
  "checkInTime":"ISO|null","checkOutTime":"ISO|null",
  "isLate":false,"lateMinutes":null,"leftEarly":false,
  "attendanceStatus":"present","verifiedBy":"uuid|null","verifiedAt":"ISO|null",
  "note":"string|null","createdAt":"ISO","updatedAt":"ISO"
}
```

#### `PATCH .../attendance/:recordId/status` — đổi trạng thái
Body: `{ attendanceStatus }` → trả bản ghi đã cập nhật.

#### `PATCH .../attendance/:recordId` — sửa hồ sơ (checkInTime/checkOutTime/note)
→ trả bản ghi đã cập nhật (BE lưu vết before/after).

#### `POST .../attendance/:recordId/invalidate` — hủy hiệu lực
Body: `{ reason }` → `{ success, message }`.

### 2.3. Face Access — cảnh báo & duyệt mapping

#### `GET /face-access/stranger-alerts` — cảnh báo khuôn mặt lạ
Query: `?page&pageSize&deviceId&from&to`
```jsonc
{
  "success": true, "message": "Stranger alerts retrieved",
  "data": [
    {
      "id": "uuid",
      "deviceCode": "FT-301",
      "roomName": "string | null",
      "capturedAt": "ISO"
      // KHÔNG có ảnh/base64 — chỉ metadata
    }
  ],
  "meta": { "page":1,"pageSize":20,"total":5,"totalPages":1 }
}
```

#### `GET /face-access/unmapped-verifies` — verify chưa khớp mapping
```jsonc
{
  "success": true, "message": "Unmapped verifies retrieved",
  "data": [
    { "id":"uuid","deviceCode":"FT-301","personName":"string|null",
      "roomName":"string|null","verifiedAt":"ISO" }
  ],
  "meta": { ... }
}
```

#### `POST /face-access/unmapped-verifies/map` — gán person↔user
Body: `{ personId, userId }` (hoặc `{ verifyId, userId }` — xác nhận field name với BE khi nối)
→ `{ success, message, data: { mappingId } }`.

### 2.4. Room Utilization & No-show

#### `GET /rooms/realtime-status` — trạng thái phòng realtime
```jsonc
{
  "success": true, "message": "...",
  "data": [
    { "roomId":"uuid","roomName":"P.301","status":"occupied", // occupied|vacant|reserved|no_show
      "currentMeetingId":"uuid|null","occupancyCount":3,"updatedAt":"ISO" }
  ]
}
```

#### `GET /rooms/:roomId/status` — chi tiết trạng thái một phòng
→ object như trên + lịch sử/thông tin no-show gần nhất.

#### No-show case (Manager thao tác)
- `PATCH /no-show-cases/:id` — cập nhật trạng thái case.
- `POST /no-show-cases/:id/release` — giải phóng thủ công. Body: `{ reason? }`.
- `GET /no-show-config`, `GET /early-vacancy-config` — đọc ngưỡng để hiển thị/cấu hình.

**Realtime:** trạng thái phòng & presence đẩy qua **WebSocket** — FE nên subscribe để cập nhật live thay vì poll.

### 2.5. Hiện diện theo người (IVSS)

#### `GET /ivss/meetings/:meetingId/presence` — hiện diện cả cuộc họp
```jsonc
{
  "success": true, "message": "IVSS meeting presence retrieved",
  "data": {
    "meetingId": "uuid",
    "users": [
      {
        "userId":"uuid","fullName":"string|null",
        "durationMs": 2820000,           // tổng thời gian hiện diện
        "firstAt":"ISO|null","lastAt":"ISO|null",
        "method":"interval|cluster",
        "segments":[ {"start":"ISO","end":"ISO","state":"present","source":"interval"} ]
      }
    ]
  }
}
```
**Gợi ý:** render `segments` thành thanh timeline ngang; hiển thị `durationMs` đổi ra phút.

#### `GET /ivss/meetings/:meetingId/presence/:userId` — hiện diện một người
→ `data` là object user như trên (một phần tử).

#### `GET /ivss/meetings/:meetingId/presence/report` — xuất PDF
→ trả **file PDF** (`Content-Type: application/pdf`, attachment). FE mở tab mới / tải về, không parse JSON.

#### `GET /ivss/health` — trạng thái kết nối IVSS/bridge
→ `{ success, data: { bridgeReachable: boolean, ivssConnected: boolean, checkedAt:"ISO" } }`. Dùng cho badge trạng thái ở màn admin.

### 2.6. Ghi hình & Media

#### `POST /live-meetings/:meetingId/recording/start-video` — bắt đầu ghi
Body: `{ deviceId? }` → `{ success, message:"Video recording started", data: { sessionId, status:"recording", startedAt:"ISO" } }`.

#### `POST /live-meetings/:meetingId/recording/:sessionId/stop-video` — dừng ghi
→ `{ success, message, data: { sessionId, captured: boolean, mediaFileId?:"uuid" } }`.
Nếu `captured=false`: hiển thị "Đã dừng nhưng không ghi được video".

#### `GET /live-meetings/:meetingId/recording/:sessionId/status` — trạng thái phiên (poll)
→ `{ success, data: { sessionId, status, startedAt, stoppedAt?, errorMessage? } }`.
`status`: `recording | stopping | completed | failed`. **Gợi ý:** poll 3–5s khi đang ghi; hiển thị chấm đỏ "REC" khi `recording`.

#### `GET /meetings/:meetingId/recording-config` / `POST` / `PATCH` — cấu hình ghi hình
Response (`RecordingConfigResponseDto`):
```jsonc
{ "id":"uuid","meetingId":"uuid","enableAudio":true,"enableVideo":true,
  "enableTranscription":false,"videoSourceDeviceId":"uuid|null",
  "audioSourceMode":"string|null","autoStart":false,"consentRequired":true,
  "retentionDays":30,"status":"configured","configuredBy":"uuid|null","configuredAt":"ISO" }
```

#### `GET /meetings/:meetingId/media-files` — danh sách file
Query: `?page&pageSize&type` → `{ success, message:"Media files retrieved", data: [ mediaFile ], meta }`.
Mỗi `mediaFile`:
```jsonc
{ "id":"uuid","meetingId":"uuid","fileName":"string","mimeType":"video/mp4",
  "size": 10485760, "durationSec": 1820, "type":"video|audio",
  "visibility":"visible|hidden","createdAt":"ISO" }
```

#### `GET /media-files/:fileId` — chi tiết một file (như phần tử trên).

#### `GET /media-files/:fileId/playback` — phát lại (stream)
→ **KHÔNG phải JSON**: BE stream video, hỗ trợ HTTP Range. FE gắn thẳng URL này (kèm Bearer) vào `<video src>` hoặc player.

#### `PATCH /media-files/:fileId/visibility` — ẩn/hiện
Body: `{ visibility: "visible" | "hidden" }` → file đã cập nhật.

#### `GET /media-files/:fileId/secure-download?token=...` — tải bằng signed token
Dùng token HMAC (không cần JWT). FE lấy link tải rồi mở.

### 2.7. ANPR (Bonus) — nếu FE làm

- `GET /anpr/vehicle-history`, `/anpr/admin/vehicle-history`, `/anpr/admin/unknown-vehicles` — lịch sử/ẩn danh xe.
- `GET/POST/PATCH/DELETE /anpr/vehicle-registrations`, `PATCH .../:id/status` — CRUD & duyệt đăng ký xe.
- Response theo pattern `{ success, message, data, meta }`. (Xác nhận field cụ thể với BE khi làm tới.)

---

## PHẦN 3 — LƯU Ý TÍCH HỢP CHO FE TEAM

1. **Phân trang:** endpoint list dùng `?page&pageSize`, đọc tổng ở `meta.total/totalPages`.
2. **Realtime (WebSocket):** occupancy phòng, presence điểm danh, lỗi ghi hình được đẩy realtime. Ưu tiên subscribe thay vì poll cho `rooms/realtime-status` và bảng điểm danh trong-họp; riêng recording status có thể poll khi đang ghi.
3. **Bảo mật ảnh:** không endpoint nào trả ảnh khuôn mặt/base64 — thiết kế UI cảnh báo stranger/unmapped chỉ dựa trên metadata (thiết bị, phòng, thời gian, tên person nếu có).
4. **Quyền (permission):** một số field (`attendanceSource`, `checkInMethod`) chỉ trả khi `permissions.canViewAttendanceSource=true` — FE phải kiểm tra cờ này để ẩn/hiện cột.
5. **Field masking:** URL RTSP và token trả về đã được che credential; token callback chỉ hiện một lần khi rotate.
6. **File nhị phân:** `presence/report` (PDF), `media-files/:id/playback` và `secure-download` KHÔNG trả JSON — xử lý như file/stream.
7. **Xác nhận trước khi code:** với các endpoint tôi ghi "(xác nhận field name với BE)" — ping Tú/BE để chốt tên field chính xác, tránh nối sai.

---

## PHẦN 4 — THỨ TỰ ƯU TIÊN ĐỀ XUẤT (cho FE team)

1. **Sửa `DeviceManagement`** (nối mutation) — vì đây là màn camera lõi, đang mock nhiều nhất.
2. **Bảng điểm danh** (`GET meetings/:id/attendance`) — giá trị demo cao, response đã chuẩn.
3. **Ghi hình & media** (start/stop/status + list/playback) — demo được luồng ghi hình.
4. **Giám sát phòng & no-show** (`rooms/realtime-status`) — cần WebSocket.
5. **Hiện diện IVSS** (`ivss/.../presence`) — làm sau khi có phần cứng IVSS chạy thật.
6. **Stranger / unmapped review, ANPR** — ưu tiên cuối.
