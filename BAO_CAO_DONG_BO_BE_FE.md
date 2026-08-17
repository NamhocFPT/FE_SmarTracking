# Báo cáo đối soát đồng bộ Backend ↔ Frontend & phủ Use Case

**Dự án:** SMRMPTS / SAVP — `capstone-be` (NestJS) ↔ `FE_SmarTracking` (React)
**Ngày rà soát:** 24/07/2026
**Phương pháp:** Đọc tĩnh code hai phía, đối chiếu route BE (`@Controller` + method decorator) với lời gọi API ở FE (`src/service/*.js`) và UI (`src/pages`).

---

## 1. Tổng quan kiến trúc

| | Backend | Frontend |
|---|---|---|
| Stack | NestJS + TypeORM | React (CRA) + fetch/axios |
| Base URL | `api/v1` (global prefix, `main.ts`) | `http://localhost:3000/api/v1` (`utils/request.js:1`) |
| Auth | JWT + refresh token | Có xử lý refresh + queue request khi 401 |
| Realtime | Socket.IO gateway, path `/ws` | `socket.io-client`, path `/ws` (`utils/socket.js`) |

---

## 2. Phần đã làm tốt (đồng bộ)

### 2.1 Hạ tầng & giao tiếp
- **Base URL khớp:** BE prefix `api/v1`, FE gọi đúng.
- **Response envelope thống nhất:** `{ success, data, meta, error: {message, code}, requestId }`. FE (`handleResponse`) xử lý phòng thủ tốt cho mọi trường hợp lỗi.
- **CORS:** BE cho phép `localhost:5173` / `localhost:3000`.

### 2.2 Authentication (rất tốt)
- Login / logout / me / change-password / password-reset (request + confirm) khớp hoàn toàn.
- **Token rotation:** FE tự refresh khi gặp 401, có cơ chế queue request chờ token mới (`request.js:91-145`).
- Danh sách public endpoint FE khai đúng với route không cần auth của BE.

### 2.3 Realtime / WebSocket (đồng bộ hoàn chỉnh)
- Path `/ws` khớp cả hai phía.
- Event khớp: `meeting:subscribe` / `meeting:unsubscribe` (FE emit ↔ BE `@SubscribeMessage`), `meeting.session.started` / `meeting.session.ended` (BE emit ↔ FE `.on()`).
- ⚠️ Realtime hiện diện phụ thuộc env `IVSS_REALTIME_ENABLED` (mặc định OFF) và mạng cloud↔camera (Tailscale).

### 2.4 Các nhóm API đã khớp method + path
Auth, **Analytics (đủ 9–11 endpoint)**, Users (CRUD + lock/unlock/status/import), Roles, Permissions, Role-Permissions, IoT-devices (đủ ~11 route), Minutes (ai-draft + meeting-minutes + issue), Transcription (jobs/transcript/segments/content/status), Attendance (đủ 5 route), Media-files, ANPR, Avatar (admin + `/me`), Scheduling, Meeting-requests (approve/reject), Reports, `GET /rooms/available`, `GET /me/schedule`, notes.

→ Ước tính **~80% bề mặt API đã đồng bộ**.

---

## 3. Lỗi đồng bộ — FE gọi endpoint BE KHÔNG có (sẽ 404 / hỏng tính năng)

> Nhóm này là "route mồ côi phía FE": FE gọi nhưng BE chưa có route khớp.

| # | FE gọi | BE thực tế | Tính năng ảnh hưởng | Vị trí FE |
|---|--------|-----------|---------|-----------|
| 1 | `POST /meetings/:id/check-in` | Không có route nào | **Check-in cuộc họp** | employeeServices:147, managerServices:201 |
| 2 | `GET /meetings` (list) | Chỉ có `GET /meetings/:id` | **Danh sách họp (Admin)** | businessAdminServices:229 |
| 3 | `GET /rooms` (list) | Chỉ có `/search`, `/available`, `/realtime-status` | **Danh sách phòng** | sysAdminServices:349 |
| 4 | `GET /rooms/:id/devices` | Không có | **Thiết bị theo phòng** | employeeServices:259, managerServices:333 |
| 5 | `GET /users/export` | Chỉ có `import` / `import/template` | **Xuất user** | businessAdminServices:132, sysAdminServices:328 |
| 6 | `GET & PATCH /departments/:id` | Controller chỉ có `POST` + `GET` (list) | **Sửa phòng ban** | businessAdminServices:149, sysAdminServices:285 |
| 7 | `PATCH /face-access/stranger-alerts/:id/resolve` | Chỉ có `GET` (list) | **Resolve cảnh báo người lạ** | businessAdminServices:208 |
| 8 | `PATCH /notifications/:id/read` + `/notifications/read-all` | Không có | **Đánh dấu đã đọc thông báo** | businessAdminServices:302/311, sysAdminServices:366/375 |
| 9 | `GET & PATCH /system-configurations` | Không có controller | **Trang cấu hình hệ thống** | sysAdminServices:241/252 |

### Sai method / sai path (khớp cấu trúc nhưng lệch)
| # | FE gọi | BE thực tế | Cách sửa |
|---|--------|-----------|----------|
| 10 | `PATCH /meetings/:id` (update chung) | Chỉ có `.../time` và `.../room` | Tách call `/time` và `/room` ở FE, hoặc BE thêm route update chung |
| 11 | `POST /zones/:id/devices` | BE là **`PATCH /zones/:id/devices`** (`zones.controller.ts:113`) | Đổi 1 trong 2 cho khớp method |
| 12 | `POST /live-meetings/:id/extension-requests` | BE là **`POST /meetings/:id/extension-requests`** (không có `live-`) | BE tự mâu thuẫn: route `decide` lại nằm ở `live-meetings/...` → thống nhất prefix |
| 13 | `POST /users/face-profile` (không id) | BE là `POST /users/:userId/face-profile` | Sửa FE `employeeServices:113` thêm userId (managerServices:167 đã đúng) |

---

## 4. Ghi chú chất lượng / cấu hình (không chặn nhưng nên xử lý)

- **FE hardcode base URL** `http://localhost:3000/api/v1` (`request.js:1`), trong khi socket dùng `process.env.REACT_APP_WS_URL` → nên đưa API URL ra biến môi trường để deploy được.
- **Còn code adapter json-server** (`request.js:211-217`) — dư thừa, nên xóa.
- **BE chưa đăng ký global `ValidationPipe` / `ResponseInterceptor`** trong `main.ts` — envelope dựng thủ công ở từng presenter, dễ lệch format khi thêm controller mới.
- **BE đặt tên param không đồng nhất** (`:id`, `:userId`, `:roomId`, `:meetingId`…) — chỉ là style, không ảnh hưởng chạy.

---

## 5. Đối soát phủ Use Case (154 UC — trừ chuỗi họp định kỳ UC-31→34)

### 5.1 Tổng hợp

| Mức | Số UC | Tỷ lệ | Ý nghĩa |
|---|---|---|---|
| ✅ **Đủ** (BE + FE, hoặc hệ thống tự động hoàn chỉnh) | **111** | ~72% | Dùng được từ UI hoặc chạy nền đúng thiết kế |
| 🟡 **Một phần** | **39** | ~25% | Đa số là **BE đã có route, FE chưa nối** |
| ❌ **Thiếu hẳn** | **4** | ~3% | UC-35, UC-52, UC-117, UC-140 |

→ Nếu chỉ tính **tầng BE** (có route + logic, bất kể FE): **~150/154 UC đã có nền**.

### 5.2 ❌ 4 UC thiếu hẳn

| UC | Nội dung | Tình trạng |
|---|---|---|
| **UC-35** | Đặt phòng ad-hoc (đột xuất) | Không có endpoint booking riêng — chỉ đặt gián tiếp qua tạo họp (UC-18) |
| **UC-52** | Xử lý xung đột đặt phòng | Không có endpoint riêng — chỉ xử lý ngầm (trả 409) khi tạo họp |
| **UC-117** | Dừng ghi âm (live) | Chỉ có dừng ghi hình; ghi âm theo cơ chế upload/segment, không có luồng start/stop live |
| **UC-140** | Xem chi tiết 1 tệp đính kèm biên bản | Chỉ có list + delete, thiếu route GET chi tiết |

### 5.3 🟡 39 UC "một phần" — chia theo loại

**Loại 1 — BE xong, FE chưa gọi (chỉ cần bổ sung FE, ~28 UC):**
- Thành viên & agenda: UC-24 (import Excel), UC-25 (gỡ thành viên), UC-27/28/29 (xem/sửa/xóa agenda)
- Phòng & cấu hình: UC-14 (route `/users/manage`), UC-38 (chi tiết phòng), UC-39 (lịch sử phòng), UC-47/48 (ngưỡng no-show / early-vacancy), UC-49 (xuất báo cáo phòng)
- Điểm danh/hiện diện/recording: UC-82 (chi tiết bản ghi), UC-88 (lịch sử vào/ra per-user), UC-99 (timeline họp), UC-113 (audio segment), UC-121 (chi tiết media)
- **Biên bản (khoảng trống FE rõ nhất):** UC-133 (xóa nháp), UC-134 (lọc theo thời gian), UC-135 (tìm theo nhân sự), UC-136 (visibility/share), UC-138/139/141/142 (đính kèm & link resource), UC-147 (xuất PDF/Word)
- Thông báo do Host/hệ thống gọi: UC-143 (thư mời), UC-145 (thông báo hủy), UC-146 (phân phối biên bản)

**Loại 2 — Lệch path/method (FE gọi sai, cần sửa FE):**
- **UC-19/UC-20**: FE gọi `PATCH /meetings/:id` chung, nhưng BE chỉ có `.../time` và `.../room` → cập nhật thời gian/phòng họp không trúng route.
- **UC-36**: BE có `/rooms/realtime-status` nhưng FE lại dùng `/rooms/search`.
- **UC-17** (đánh ✅ nhưng có bug): `employeeServices.js:113` gọi `/users/face-profile` thiếu `:userId`.

**Loại 3 — Thiếu một nhánh ở cả 2 phía / chưa hoàn thiện:**
- **UC-68**: logic cấu hình Face Server có sẵn nhưng chưa wire route (chỉ có rotate/revoke token) → có thể hở luồng khởi tạo.
- **UC-104**: ghi chú chỉ lọc, thiếu tìm theo từ khóa (cả BE lẫn FE).
- **UC-112**: không có luồng "bắt đầu ghi âm live theo channel/seat" (chỉ ingest/upload).
- **UC-124**: chỉ set trạng thái FAILED + poll, chưa đẩy notification chủ động.
- **UC-144**: cron nhắc lịch họp còn TODO, chưa implement.
- **UC-150**: không có endpoint dashboard điểm danh tổng hợp riêng (ghép từ on-time + no-show).
- **UC-128**: bảo mật STT — thực thi bằng guard/permission, không có UI riêng (đúng bản chất phi chức năng, coi như đạt).

---

## 5B. Đối soát SCOPE MỞ RỘNG SAVP (31 UC — UC-90→120, cách đánh số addendum)

> Đây là scope mới trong file kế hoạch SAVP (Zone, phương tiện, cổng, hành lang, trung tâm cảnh báo, dashboard khuôn viên). **Lưu ý:** codebase (24/07) mới hơn file kế hoạch (18/07) một tuần — nhiều phần "chưa có" trong PDF đã được code (migration 21–23/07).

### 5B.1 Tổng hợp

| Mức | Số UC | UC |
|---|---|---|
| ✅ **Đủ** (BE + FE) | **6** | 90, 91, 92, 93, 100*, 102 |
| 🟡 **Một phần** | **21** | 94, 96, 98, 101, 103, 104, 105, 106, 107, 108, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120 |
| ❌ **Thiếu hẳn** | **4** | 95, 97, 99, 109 |

→ Đặc trưng scope này: **BE làm gần xong, FE hầu như chưa nối.** Cả khối trung tâm an ninh + dashboard khuôn viên + báo cáo (UC-110→120) có route BE nhưng **0 FE**.

### 5B.2 Nền Zone — ĐÃ CÓ (khác với mốc 18/07 trong PDF)

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| Entity + bảng `zones` | ✅ Có | `zones/entities/zone.entity.ts`; migration `20260721000001-CreateZonesTable.ts` |
| Cột `iot_devices.zone_id` | ✅ Có | `20260721000002-AddZoneIdToIotDevices.ts` |
| Cột `iot_device_events.zone_id` | ✅ Có | `20260721000003-AddZoneIdToIotDeviceEvents.ts` |
| Bảng `zone_presence_events` | ✅ Có | `20260721000005-...`; entity `zone-presence-event.entity.ts` |
| Bảng `gate_access_logs` (có `zone_id`) | ✅ Có | `20260721000004-CreateGateAccessLogsTable.ts` |
| Toạ độ GPS zone | 🟡 Có cột nhưng KHÔNG ghi/đọc được qua API | `20260722000010-AddZoneCoordinates.ts` (thiếu trong DTO + response) |

Zone types: `room, gate, corridor, lobby, parking` — khớp UC-90.

### 5B.3 ❌ 4 UC thiếu hẳn

| UC | Nội dung | Tình trạng |
|---|---|---|
| **UC-95** | Sơ đồ lắp đặt camera | Không có toạ độ camera ghi được (chỉ GPS zone không dùng được), không endpoint, không UI |
| **UC-97** | Lịch ghi hình theo camera (độc lập lịch họp) | `recording-config` chỉ gắn cuộc họp, không có lịch định kỳ theo camera |
| **UC-99** | Duyệt/từ chối đăng ký phương tiện | Không có hàng đợi "pending" — đăng ký kích hoạt ngay `status:'active'`; `PATCH /:id/status` chỉ bật/tắt, không phải duyệt |
| **UC-109** | Ghi nhận hiện diện theo khu vực | Không có pipeline ghi `zone_presence_events` từ event thật (IVSS handler còn stub), không realtime zone; dữ liệu chỉ là seed demo |

### 5B.4 🟡 21 UC "một phần" — chia theo loại

**Loại 1 — BE xong, FE chưa nối (chỉ cần bổ sung FE, ~15 UC):**
- Zone/cổng/AI: UC-96 (AI config camera), UC-106 (tính thời gian trong khuôn viên), UC-107 (lịch sử ra vào cổng)
- Phương tiện: UC-101 (tra cứu admin `/anpr/admin/vehicle-registrations`), UC-103 (control-list — BE CRUD đủ, FE 0), UC-104 (thống kê lưu lượng + `reports/vehicle/exports`)
- **Trung tâm an ninh + dashboard + báo cáo (toàn bộ 0 FE):** UC-110 (timeline zone), UC-111 (heatmap zone), UC-112 (cảnh báo tụ tập — cron), UC-113 (alert-rules CRUD), UC-114 (security-alerts REST), UC-115 (xâm nhập khu vực hạn chế — cron), UC-116 (watchlist người), UC-117 (dashboard khuôn viên — FE đang gọi nhầm `/analytics/...` thay vì `/campus-dashboard/overview`), UC-118/119/120 (xuất báo cáo gate-access/vehicle/security — BE async job đủ, FE chưa gọi)

**Loại 2 — Mắt xích BE bị gãy (có code nhưng chưa nối vào luồng thật):**
- **UC-105** (nghiêm trọng nhất): `writeGateLog` tồn tại nhưng `VehicleResolveService.onVehicleEvent` KHÔNG gọi → `gate_access_logs` không có dữ liệu thật → **UC-106/107 chỉ chạy trên seed demo**.
- **UC-108**: cảnh báo control-list ✅ (BE tạo `security_alerts`), nhưng **xe chưa đăng ký chỉ lưu unmatched, không phát cảnh báo**.

**Loại 3 — Thiếu một nhánh nghiệp vụ:**
- **UC-98**: đăng ký phương tiện có, nhưng **không có luồng "chờ duyệt"** (kích hoạt ngay) — gắn với UC-99 thiếu.

**Loại 4 — Lệch hợp đồng / bug FE (load-bearing):**
- **UC-94**: BE `PATCH /zones/:id/devices`, FE `assignDeviceToZone` gọi **POST** (`zoneServices.js:57`) → gán thiết bị vào zone sẽ lỗi (nhánh gỡ DELETE thì đúng).
- **UC-100 (đánh ✅ nhưng có bug enum):** BE chấp nhận `'active' | 'disabled'`, FE gửi `'ACTIVE'/'INACTIVE'` và so sánh `=== 'ACTIVE'` (`MyVehicles.jsx`) → `toggleMyVehicleStatus` **400**, badge trạng thái luôn sai.

### 5B.5 Gap phụ trên BE (không phải FE)
- **UC-114** chưa có realtime WebSocket (module `alerts` không import websocket) — "trung tâm gom cảnh báo realtime" mới ở mức REST/poll.
- **UC-109** IVSS event handler còn stub (`default-ivss-event.handler.ts` "Defer mapping presence") → các UC downstream (110/111/112/115) đang đọc dữ liệu seed.

---

## 6. Lưu ý phạm vi

1. **Realtime hiện diện** (UC-86, 100, 101…) phụ thuộc env `IVSS_REALTIME_ENABLED` (mặc định OFF) và mạng cloud↔camera (Tailscale) — route/socket đã có nhưng thực tế chạy được hay không phụ thuộc cấu hình/phần cứng.
2. **Scope mở rộng SAVP (UC-90→120)** đã đối soát chi tiết ở **mục 5B** (không nằm trong 154 UC gốc mục 5). Trái với mốc 18/07 trong PDF, phần lớn **đã được code ở BE** (migration Zone 21/07): 6 ✅ / 21 🟡 / 4 ❌ — khoảng trống chính là **FE chưa nối** (đặc biệt toàn bộ khối an ninh/dashboard/báo cáo UC-110→120) và vài mắt xích BE chưa wire (UC-105, 109).
3. **Hai chiều lệch đồng bộ:**
   - Mục 3 = FE gọi nhưng BE thiếu (route mồ côi FE).
   - Mục 5.3 Loại 1 = BE có nhưng FE chưa gọi (khoảng trống FE).

---

## 7. Đề xuất hành động ưu tiên

1. **Ưu tiên CAO — sửa lệch path/method (rẻ, rủi ro thấp):** UC-19/20 (`/time`, `/room`), UC-36 (`/rooms/realtime-status`), UC-17 (face-profile `:userId`), zones devices (POST→PATCH), extension-requests prefix.
2. **Ưu tiên CAO — bổ sung route BE đang thiếu (chặn tính năng):** check-in họp, list meetings, list rooms, `/system-configurations`, `/notifications/:id/read` + `read-all`, `PATCH /departments/:id`, `/users/export`, stranger-alerts resolve.
3. **Ưu tiên TRUNG BÌNH — nối FE cho ~28 UC "BE xong":** ưu tiên nhóm Biên bản (UC-133/134/135/136/138/139/141/142/147) và Agenda (UC-27/28/29).
4. **Ưu tiên THẤP — dọn cấu hình:** đưa API base URL ra env, xóa code json-server, cân nhắc global ValidationPipe/ResponseInterceptor ở BE.
