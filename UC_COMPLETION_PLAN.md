# Kế hoạch Hoàn thiện UC — FE SmartTracking

> **Ngày lập:** 2026-08-12  
> **Phạm vi:** UC-01 → UC-120 (theo SAVP_CHUC_NANG.pdf + SAVP_KE_HOACH_MO_RONG.pdf)  
> **Phương pháp:** Đối chiếu BE evidence với FE service/page/route inventory.

---

## Tóm tắt trạng thái

| Trạng thái | Số UC |
|---|---|
| ✅ Hoàn chỉnh cả BE lẫn FE | 82 |
| ⚠️ FE thiếu/cần bổ sung (BE đã có) | 18 |
| ❌ Cả BE + FE đều chưa có / không khả thi trong scope | 7 |
| 🔧 N/A cho FE (BE-only, cron, webhook) | 13 |

---

## Phần 1 — UC đã hoàn chỉnh ✅

Các UC sau đã wired đầy đủ từ BE đến FE (route + service + component):

UC-01, 02, 03, 04, 05, 06, 07, 09, 10, 11, 12, 13, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 52, 54, 59, 60, 61, 63, 64, 65, 66, 68, 69, 70, 71, 73, 74, 75, 76, 77, 79, 80, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 98, 100, 101, 103, 104, 108, 112, 113, 114, 115, 116, 117

---

## Phần 2 — UC cần bổ sung FE (BE đã sẵn sàng) ⚠️

### UC-08 — Đổi trạng thái tài khoản (activate/deactivate)

**Vấn đề:** `updateUserStatus()` đã định nghĩa trong `sysAdminServices.js` gọi `PATCH /users/:userId/status` nhưng **không nơi nào trong FE gọi hàm này**. Các nút lock/unlock đã wired, nhưng activate/deactivate (chuyển trạng thái active → inactive và ngược lại) hoàn toàn thiếu UI.

**File cần sửa:** `src/pages/bussinessAdmin/UserManagement.jsx` và `src/pages/systemAdmin/` (nếu có trang user riêng)

**Kế hoạch:**
- [ ] Thêm nút "Kích hoạt" / "Vô hiệu hóa" vào dropdown action menu của mỗi dòng user
- [ ] Gọi `updateUserStatus({ status: 'active' | 'inactive' })` tương ứng
- [ ] Cập nhật hiển thị trạng thái sau action thành công

**Ước tính:** 1–2 giờ | **Ưu tiên:** P1

---

### UC-14 — Cập nhật hồ sơ cá nhân (self-service)

**Vấn đề:** `Profile.jsx` gọi `updateSelfProfile()` → `PATCH /users/:userId`. Route này yêu cầu permission `accounts.user.update` chỉ cấp cho Admin → Employee/Manager tự sửa hồ sơ sẽ nhận **403 Forbidden**.

**File cần sửa:** `src/pages/shared/Profile.jsx`, có thể cần thêm route BE `/me/profile` hoặc dùng endpoint `/me` nếu BE có.

**Kế hoạch:**
- [ ] Kiểm tra BE có route `PATCH /me/profile` hay `PATCH /users/me` không
- [ ] Nếu có: thay `updateSelfProfile()` bằng gọi endpoint self-service đó
- [ ] Nếu không: tạo service function `updateMyProfile()` gọi đúng endpoint, cập nhật Profile.jsx
- [ ] Phân quyền UI: nếu user là Employee/Manager, ẩn các field chỉ Admin mới sửa được (role, departmentId)

**Ước tính:** 2–3 giờ | **Ưu tiên:** P1

---

### UC-39 — Phát hiện phòng trống sớm (Early Vacancy)

**Vấn đề:** BE chỉ push WS/notification khi phát hiện phòng trống sớm, không có REST list endpoint cho các case này. FE có `getEarlyVacancyConfig` / `updateEarlyVacancyConfig` nhưng **không có UI để xem danh sách case**.

**File cần sửa:** Có thể tích hợp vào `src/components/security/RealtimeRoomMonitor.jsx` hoặc tạo section mới trong `src/pages/systemAdmin/RoomOperations.jsx`

**Kế hoạch:**
- [ ] Xác nhận BE có endpoint `GET /early-vacancy-cases` hay không
- [ ] Nếu có: thêm tab/section "Phòng trống sớm" vào `RoomOperations.jsx` với danh sách case
- [ ] Nếu không: hiển thị via WebSocket notification list + filter theo `type = early_vacancy` trong `SecurityAlerts.jsx`

**Ước tính:** 3–4 giờ | **Ưu tiên:** P2

---

### UC-48 — Cấu hình kết nối thiết bị (configure/init callback token)

**Vấn đề:** BE có `PATCH /iot-devices/:deviceId/configure` (khởi tạo callback token lần đầu). FE đã wired `rtsp-config`, `rotate`, `revoke` nhưng **chưa có nút "Cấu hình kết nối lần đầu"** (gọi `/configure`).

**File cần sửa:** `src/pages/systemAdmin/DeviceManagement.jsx`, `src/service/sysAdminServices.js`

**Kế hoạch:**
- [ ] Thêm `configureDevice(deviceId)` vào `sysAdminServices.js` gọi `PATCH /iot-devices/:deviceId/configure`
- [ ] Trong DeviceManagement: thêm nút "Khởi tạo kết nối" hiển thị khi device chưa có token (trạng thái `not_configured`)
- [ ] Hiển thị token trả về cho admin copy (1 lần duy nhất)

**Ước tính:** 2–3 giờ | **Ưu tiên:** P2

---

### UC-51 — Xem & tra cứu thiết bị IoT (status-summary)

**Vấn đề:** BE có endpoint `GET /iot-devices/status-summary` (tổng hợp số lượng thiết bị theo trạng thái). FE đã có list/detail nhưng **dashboard tổng hợp (online/offline/faulty count) không được hiển thị**.

**File cần sửa:** `src/pages/systemAdmin/DeviceManagement.jsx` hoặc `src/pages/systemAdmin/dashBoard.jsx`

**Kế hoạch:**
- [ ] Thêm `getDeviceStatusSummary()` vào `sysAdminServices.js` gọi `GET /iot-devices/status-summary`
- [ ] Thêm card thống kê (Tổng / Online / Offline / Lỗi) ở đầu trang DeviceManagement
- [ ] Refresh sau mỗi action enable/disable

**Ước tính:** 1–2 giờ | **Ưu tiên:** P2

---

### UC-67 — Ghi âm theo từng người (multi-channel audio)

**Vấn đề:** FE chỉ gọi `POST /meetings/:id/recording-sessions/audio-upload` (1 file ad-hoc). BE đã có endpoint đa kênh thật `POST /meetings/:id/recording-sessions/:sessionId/audio-tracks` nhưng FE không wired.

**File cần sửa:** `src/components/transcription/AudioUploader.jsx`, `src/service/transcriptionServices.js`

**Kế hoạch:**
- [ ] Thêm `uploadAudioTrack(meetingId, sessionId, formData)` vào `transcriptionServices.js` gọi đúng endpoint đa kênh
- [ ] Cập nhật AudioUploader để chọn sessionId và upload từng track theo speaker
- [ ] Hiển thị danh sách tracks đã upload

**Ước tính:** 4–6 giờ | **Ưu tiên:** P3

---

### UC-72 — Chỉnh sửa transcript (version history)

**Vấn đề:** FE gọi `PATCH /transcripts/:id/segments` để sửa, nhưng **không có UI xem lịch sử phiên bản**. BE cũng chỉ bump revision counter, không lưu version-history thật.

**File cần sửa:** `src/components/transcription/TranscriptViewer.jsx`

**Kế hoạch:**
- [ ] Hiển thị `revision` number hiện tại trong TranscriptViewer
- [ ] Thêm nút "Xem lịch sử chỉnh sửa" (có thể chỉ hiển thị revision number + timestamp nếu BE không có full history)
- [ ] Xác nhận với BE team nếu cần endpoint lịch sử thật

**Ước tính:** 1–2 giờ | **Ưu tiên:** P3

---

### UC-78 — Xem & tra cứu biên bản (browse + search by person)

**Vấn đề:** `searchMinutesByPerson()` định nghĩa trong `businessAdminServices.js` gọi `GET /meeting-minutes/search-by-person` nhưng **không có UI nào gọi hàm này**. Không có trang browse danh sách biên bản tổng hợp.

**File cần sửa:** `src/pages/bussinessAdmin/` (thêm trang mới hoặc tab trong MeetingManagement)

**Kế hoạch:**
- [ ] Thêm tab "Biên bản" trong `MeetingManagement.jsx` hoặc tạo `MinutesManagement.jsx` mới
- [ ] Hiển thị danh sách biên bản với filter theo meeting, người tham gia
- [ ] Wire `searchMinutesByPerson()` vào search box theo tên/email người dùng

**Ước tính:** 4–5 giờ | **Ưu tiên:** P2

---

### UC-96 — Cấu hình chức năng AI camera

**Vấn đề:** BE có `PATCH /iot-devices/:deviceId/ai-config` để bật/tắt face recognition, stranger detection, occupancy counting. FE **không gọi endpoint này** ở bất kỳ đâu.

**File cần sửa:** `src/pages/systemAdmin/DeviceManagement.jsx`, `src/service/sysAdminServices.js`

**Kế hoạch:**
- [ ] Thêm `updateDeviceAiConfig(deviceId, config)` vào `sysAdminServices.js`
- [ ] Trong DeviceManagement detail/edit modal: thêm toggle switches cho từng AI feature
  - Face recognition: `faceRecognitionEnabled`
  - Stranger detection: `strangerDetectionEnabled`
  - Occupancy counting: `occupancyCountingEnabled`
- [ ] Chỉ hiển thị cho device loại `ip_camera`

**Ước tính:** 2–3 giờ | **Ưu tiên:** P1

---

### UC-107 — Xem lịch sử ra vào cổng (phía nhân viên)

**Vấn đề:** FE chỉ có trang `GateAccessManagement.jsx` gọi `getAdminGateAccessLogs` (admin view). **Không có trang "lịch sử ra vào của tôi"** cho nhân viên, dù BE có endpoint `GET /gate-access/history` cho self-service.

**File cần sửa:** Cần tạo trang mới hoặc thêm route

**Kế hoạch:**
- [ ] Thêm `getMyGateAccessHistory(params)` vào `anprService.js` hoặc service phù hợp
- [ ] Tạo component/page `MyGateAccessHistory.jsx` hoặc thêm section vào `UserJourney.jsx`
- [ ] Thêm route `/employee/gate-history`, `/manager/gate-history` vào router
- [ ] Hiển thị timeline ra/vào: thời gian, cổng, hướng (in/out), thời gian lưu lại

**Ước tính:** 3–4 giờ | **Ưu tiên:** P2

---

### UC-109 — Ghi nhận hiện diện theo khu vực (Zone Presence)

**Vấn đề:** BE có `GET /ivss/zones/:zoneId/access-log` nhưng **FE không gọi endpoint này**. Dữ liệu hiện diện theo zone không được hiển thị.

**File cần sửa:** `src/pages/systemAdmin/ZoneManagement.jsx` (đang được sửa)

**Kế hoạch:**
- [ ] Thêm `getZoneAccessLog(zoneId, params)` vào `sysAdminServices.js`
- [ ] Trong ZoneManagement detail panel: thêm tab "Nhật ký ra vào" hiển thị log
- [ ] Filter theo thời gian, loại sự kiện (enter/exit)

**Ước tính:** 2–3 giờ | **Ưu tiên:** P2

---

### UC-110 — Timeline & thời gian lưu theo khu vực

**Vấn đề:** BE có `GET /zone-presence/timeline` nhưng FE không gọi. `UserJourney.jsx` chỉ track theo người, không theo zone.

**File cần sửa:** `src/pages/systemAdmin/ZoneManagement.jsx` hoặc trang riêng

**Kế hoạch:**
- [ ] Thêm `getZonePresenceTimeline(zoneId, params)` vào `sysAdminServices.js`
- [ ] Trong ZoneManagement: thêm biểu đồ timeline người hiện diện theo giờ trong ngày
- [ ] Hiển thị avg dwell time (thời gian lưu trung bình)

**Ước tính:** 3–4 giờ | **Ưu tiên:** P3

---

### UC-111 — Phân tích lưu lượng + heatmap khu vực

**Vấn đề:** BE có `GET /zone-traffic/heatmap` nhưng FE chỉ có heatmap cho phòng họp (`RoomUsageAnalytics.jsx`), không có heatmap zone.

**File cần sửa:** `src/pages/systemAdmin/ZoneManagement.jsx` hoặc `src/pages/shared/RoomUsageAnalytics.jsx`

**Kế hoạch:**
- [ ] Thêm `getZoneTrafficHeatmap(params)` vào `sysAdminServices.js`
- [ ] Trong ZoneManagement: thêm tab "Lưu lượng" với heatmap 24h x 7 ngày
- [ ] Màu sắc gradient theo mật độ người

**Ước tính:** 4–5 giờ | **Ưu tiên:** P3

---

### UC-118 — Xuất báo cáo ra vào khuôn viên

**Vấn đề:** BE có `POST /reports/gate-access/exports`. FE có `ExportReportModal` component nhưng **không có nút export** trong `GateAccessManagement.jsx`.

**File cần sửa:** `src/pages/systemAdmin/GateAccessManagement.jsx`, `src/service/sysAdminServices.js`

**Kế hoạch:**
- [ ] Thêm `exportGateAccessReport(params)` vào `sysAdminServices.js`
- [ ] Thêm nút "Xuất báo cáo" trong GateAccessManagement, mở `ExportReportModal`
- [ ] Truyền date range và format (xlsx/csv) vào request

**Ước tính:** 1–2 giờ | **Ưu tiên:** P1

---

### UC-119 — Xuất báo cáo phương tiện

**Vấn đề:** BE có `POST /reports/vehicle/exports`. FE chưa có nút export trong `ANPRManagement.jsx` hay `VehicleRegistrations.jsx`.

**File cần sửa:** `src/pages/bussinessAdmin/ANPRManagement.jsx`, `src/service/anprService.js`

**Kế hoạch:**
- [ ] Thêm `exportVehicleReport(params)` vào `anprService.js`
- [ ] Thêm nút "Xuất báo cáo" trong ANPRManagement

**Ước tính:** 1–2 giờ | **Ưu tiên:** P1

---

### UC-120 — Xuất báo cáo sự kiện an ninh

**Vấn đề:** BE có `POST /reports/security-alerts/exports`. FE chưa có nút export trong `SecurityAlerts.jsx`.

**File cần sửa:** `src/pages/systemAdmin/SecurityAlerts.jsx` (và BusinessAdmin), `src/service/securityAlertService.js`

**Kế hoạch:**
- [ ] Thêm `exportSecurityAlertReport(params)` vào `securityAlertService.js`
- [ ] Thêm nút "Xuất báo cáo" trong SecurityAlerts.jsx

**Ước tính:** 1–2 giờ | **Ưu tiên:** P1

---

## Phần 3 — UC thiếu cả BE lẫn FE (defer hoặc out-of-scope) ❌

| UC | Tên | Lý do defer |
|---|---|---|
| UC-20 | Tạo chuỗi họp định kỳ | BE block cứng `RECURRING_SERIES_SCOPE_NOT_SUPPORTED`; cần thiết kế lại BE trước |
| UC-21 | Hủy chuỗi họp định kỳ | Tương tự UC-20 |
| UC-81 | Giám sát & thử lại thông báo thất bại | BE chỉ có Bull retry nội bộ; không có REST admin endpoint |
| UC-95 | Sơ đồ lắp đặt camera | BE thiếu cột tọa độ pixel per-camera; cần migration BE trước |
| UC-97 | Lịch ghi hình theo camera | BE không có recording schedule độc lập theo lịch |
| UC-99 | Duyệt đăng ký phương tiện | BE entity chỉ có active/disabled, không có pending/approve flow |

---

## Phần 4 — UC N/A cho FE (BE-only, đúng thiết kế) 🔧

UC-53, UC-55, UC-56, UC-57, UC-58, UC-62, UC-102, UC-105, UC-106

---

## Phần 5 — Kế hoạch thực hiện theo ưu tiên

### P1 — Làm ngay (impact cao, nỗ lực thấp)

| UC | Công việc | File chính | Ước tính |
|---|---|---|---|
| UC-96 | Thêm AI camera config toggles | `DeviceManagement.jsx`, `sysAdminServices.js` | 2–3h |
| UC-118 | Nút export báo cáo gate access | `GateAccessManagement.jsx`, `sysAdminServices.js` | 1–2h |
| UC-119 | Nút export báo cáo phương tiện | `ANPRManagement.jsx`, `anprService.js` | 1–2h |
| UC-120 | Nút export báo cáo an ninh | `SecurityAlerts.jsx`, `securityAlertService.js` | 1–2h |
| UC-08 | Nút activate/deactivate user | `UserManagement.jsx` | 1–2h |

### P2 — Tuần tiếp theo (impact trung bình, nỗ lực vừa)

| UC | Công việc | File chính | Ước tính |
|---|---|---|---|
| UC-51 | Device status-summary cards | `DeviceManagement.jsx` | 1–2h |
| UC-48 | Nút configure device (init token) | `DeviceManagement.jsx`, `sysAdminServices.js` | 2–3h |
| UC-78 | Browse & search biên bản | `MeetingManagement.jsx` hoặc page mới | 4–5h |
| UC-107 | Trang lịch sử gate access cho employee | Router + page mới | 3–4h |
| UC-109 | Zone access log trong ZoneManagement | `ZoneManagement.jsx`, `sysAdminServices.js` | 2–3h |
| UC-14 | Sửa profile self-service (tránh 403) | `Profile.jsx`, service | 2–3h |

### P3 — Sau (impact thấp hơn hoặc phụ thuộc BE)

| UC | Công việc | File chính | Ước tính |
|---|---|---|---|
| UC-39 | Early vacancy case list | `RoomOperations.jsx` | 3–4h |
| UC-67 | Multi-channel audio upload | `AudioUploader.jsx` | 4–6h |
| UC-72 | Transcript revision indicator | `TranscriptViewer.jsx` | 1–2h |
| UC-110 | Zone presence timeline | `ZoneManagement.jsx` | 3–4h |
| UC-111 | Zone traffic heatmap | `ZoneManagement.jsx` | 4–5h |

---

## Phần 6 — Danh sách service function còn thiếu

Cần thêm vào các service file tương ứng:

### `sysAdminServices.js`
```js
updateDeviceAiConfig(deviceId, config)   // PATCH /iot-devices/:deviceId/ai-config  [UC-96]
configureDevice(deviceId)                // PATCH /iot-devices/:deviceId/configure   [UC-48]
getDeviceStatusSummary()                 // GET   /iot-devices/status-summary         [UC-51]
exportGateAccessReport(params)           // POST  /reports/gate-access/exports        [UC-118]
getZoneAccessLog(zoneId, params)         // GET   /ivss/zones/:zoneId/access-log      [UC-109]
getZonePresenceTimeline(zoneId, params)  // GET   /zone-presence/timeline             [UC-110]
getZoneTrafficHeatmap(params)            // GET   /zone-traffic/heatmap               [UC-111]
updateUserStatus(userId, status)         // PATCH /users/:userId/status (đã có, chưa dùng) [UC-08]
```

### `anprService.js`
```js
getMyGateAccessHistory(params)   // GET  /gate-access/history       [UC-107]
exportVehicleReport(params)      // POST /reports/vehicle/exports    [UC-119]
```

### `securityAlertService.js`
```js
exportSecurityAlertReport(params)  // POST /reports/security-alerts/exports  [UC-120]
```

---

## Phần 7 — Ghi chú kỹ thuật

### EmployeeOnTimeAnalytics.jsx
Field names đã đúng với BE spec: `onTimeCount`, `lateCount`, `absentCount`, `totalRequiredParticipants`, `onTimeRate`, `trend[]`, `lateByHourOfDay[]`, `lateByDepartment[]`, `lateMeetings[]`, `meetingTitle`, `scheduledStartTime`. **Không cần sửa thêm.**

### ExportReportModal
Component `src/components/common/ExportReportModal.jsx` đã tồn tại — có thể tái sử dụng cho UC-118, 119, 120. Chỉ cần wire đúng service function và params.

### GateAccessManagement.jsx
Hiện gọi `getAdminGateAccessLogs` và `getAdminGateAccessHistory` (admin view). Route `/employee/gate-history` cần thêm riêng, gọi endpoint self-service của employee.

### ZoneManagement.jsx
Đang trong trạng thái modified (git status). Thích hợp để tích hợp UC-109, 110, 111 vào đây.
