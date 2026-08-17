# BÁO CÁO ĐÁNH GIÁ TIẾN ĐỘ 120 UC + RÀ LỖI TÍCH HỢP FE↔BE

| | |
|---|---|
| **Ngày** | 31/07/2026 |
| **Phạm vi** | BE `capstone-be` (NestJS, 84 controllers) + FE `FE_SmarTracking` (React, 19 service files) |
| **Chuẩn đối chiếu** | `D:\capstone-be\docs\SAVP_USE_CASE_TONG_HOP_2026-07-29.md` (120 UC) |
| **Phương pháp** | Script trích xuất route/call (kiểm chứng đủ 100% decorator) + đối chiếu tự động + đọc code xác minh từng finding + `npx jest` toàn repo + `tsc --noEmit` + ESLint no-floating-promises |
| **Phụ lục** | `be-routes.tsv` (277 route BE), `fe-calls.tsv` (333 call FE), `match-report.txt` (đối chiếu) — cùng thư mục |

## TÓM TẮT ĐIỀU HÀNH

- **120 UC: 95 ✅ DONE (79%) · 9 🟡 BE-only · 13 🔴 BROKEN · 3 ⬜ MISSING · 0 🟠 FE-only.**
- **Khớp route rất tốt**: 327/329 lời gọi FE có endpoint BE đúng method+path. Chỉ 1 lệch thật (`POST /meetings/:id/check-in`) và là dead code.
- **Nhưng lỗi nằm ở tầng sâu hơn route**: 2 lỗi CRITICAL khiến **không role nào hủy được cuộc họp** (lệch tên field `reason` vs `cancellationReason`) và **không ai duyệt được yêu cầu đặt phòng** (permission chỉ seed cho SYSTEM_ADMIN nhưng màn duyệt nằm ở Manager) — đây là 2 luồng lõi của hệ thống.
- Nhóm lỗi lớn thứ hai: **hàng loạt 403 do seed permission lệch role↔màn** (Business Admin gần như "read-only" trên chính màn quản trị của mình) và **3 chỗ FE hiển thị "thành công" giả khi API lỗi**.
- BE: 2 bug CAO (route shadowing giết endpoint PDF hiện diện IVSS; 10 controller thiếu ValidationPipe → validator DTO là dead code). Jest 19 suite đỏ — **hầu hết là test hết hạn**, không phải bug production.
- Nhiều cron nghiệp vụ (no-show, face-sync, crowd-alert, restricted-zone, ivss-portrait…) **default OFF qua env** — logic thật nhưng phải bật khi demo.

---

# PHẦN 1 — BẢN ĐỒ API

## 1A. BE — 277 endpoint thật

Trích từ 84 controllers, ghép đúng 3 tầng `api/v1` + `@Controller(prefix)` + `@Get/@Post(path)`, kèm `@RequirePermissions`/guard/`@Public` từng route. **Bảng đầy đủ: [`be-routes.tsv`](./be-routes.tsv)** (cột METHOD · ROUTE · FILE:LINE · HANDLER · PERMISSIONS · GUARDS · PUBLIC). Độ phủ đã kiểm chứng: 285 match thô − 8 decorator nằm trong comment = 277 route, khớp 100%.

Phân bố theo module (số route): meetings 23 · iot-devices 14+12 callback · users 14 · minutes 18 · anpr 14 · live-meeting 9 · recording 17 · zones 9 · alerts 15 · rooms 16 · accounts (roles/permissions/departments/biometric) 27 · analytics 12 · campus-dashboard 6 · gate-access 6 · ivss 7 · reports 5 · notifications 8 · còn lại: auth 7, attendance 8, equipment 5, scheduling 3, transcription 6, administration 4, search 1, health/dev/app 4.

**52 route BE chưa có FE nào gọi** (danh sách đầy đủ trong `match-report.txt` mục "BE ROUTES NEVER CALLED"). Phân loại:
- *Hợp lệ (webhook/internal/system — không cần FE)*: 24 route — `device-callbacks/*`, `hb|vf|sf/*`, `internal/ivss/*`, `internal/no-show-cases`, `internal/meetings/:id/late-checkin-alerts`, `room-camera/occupancy-snapshots`, `auth/refresh` (request.js gọi qua fetch riêng), `health`, `dev/*`, app root.
- *FE thiếu màn (nguồn của các UC 🟡)*: `campus-dashboard/overview`, `campus-dashboard/zones/:zoneId/timeline`, `campus-dashboard/zones/traffic`, `reports/gate-access|vehicle|security-alert/exports`, `iot-devices/:id/ai-config`, `gate-access/history` (+`/:id` self), `scheduling/*` (service FE có nhưng không page nào import), `live-meetings/:id/extension*`.
- *Đính chính extractor*: `DELETE /alert-rules/:id`, `DELETE /anpr/vehicle-registrations/:id`, `DELETE /person-control-list/:id`, `DELETE /anpr/admin/control-list/:id` **thực chất CÓ được gọi** qua alias `dele as del` (anprService.js:56,140; alertRuleService.js:51; personControlListService.js:47) — match-report ghi thiếu.
- *Lẻ*: `GET /media-files/:fileId` (FE dùng làm href tĩnh — chính là bug I-9), `GET /me/schedule/:meetingId`, `GET /meetings/:id/attendance/:recordId`, `GET /meetings/:id/timeline`, `GET /analytics/rooms/usage-history`, `GET /users/manage`, `DELETE /roles/:roleId/permissions/:permissionId`, `GET /ivss/health`, `GET /gate-access-logs` (bản public-token cho thiết bị).

## 1B. FE — 333 lời gọi API

329 call qua helper `src/utils/request.js` (get/post/patch/put/dele/request, base = `{API_BASE_URL}/api/v1`) + 4 call `del()` alias bổ sung sau kiểm chứng. **Bảng đầy đủ: [`fe-calls.tsv`](./fe-calls.tsv)** (METHOD · PATH · FILE:LINE · FUNC). Nguồn: 19 file `src/service/*.js` + gọi trực tiếp trong `src/pages/shared/*.jsx`, `src/component/ExportReportModal.jsx`.

**Kết quả so khớp:** 331/333 khớp method+path với BE (path param so đúng từng segment). 2 call không khớp = `POST /meetings/:id/check-in` (xem I-1).

---

# PHẦN 2 — LỖI TÍCH HỢP FE↔BE (trọng tâm)

> Mỗi mục có mã **I-x** để trỏ chéo từ bảng UC. Mọi finding đã xác minh trực tiếp trên code (không suy đoán từ tên).

## 2A. FE gọi BE không tồn tại

| # | FE gọi | FE file:line | Kết luận |
|---|---|---|---|
| I-1 | `POST /meetings/:id/check-in` | [employeeServices.js:160](../src/service/employeeServices.js#L160), [managerServices.js:224](../src/service/managerServices.js#L224) | BE không có route này (đã grep toàn bộ controllers). **Nhưng không page/component nào gọi `checkInMeeting`** → dead code chờ "BE-11", không phải show-stopper. Nếu ai nối nút check-in vào hàm này sẽ 404. |

Đó là mismatch 2A **duy nhất**. Không có case sai method, sai prefix, sai số segment nào khác (đã đối chiếu tự động 333 call × 277 route, kể cả `request()` với method tùy biến: `PUT /no-show-config`, `PUT /early-vacancy-config`, `PUT /users/:id/roles` — đều khớp).

## 2B. FE gọi sai route — dạng đặc biệt: route ĐÚNG nhưng bị BE shadow

| # | Mô tả | Dẫn chứng | Hậu quả |
|---|---|---|---|
| I-2 | FE gọi `GET /ivss/meetings/:id/presence/report` ([managerServices.js:190](../src/service/managerServices.js#L190) ← [MeetingPresenceIVSS.jsx:125](../src/component/MeetingPresenceIVSS.jsx#L125)) — route BE **có tồn tại** nhưng bị route `@Get(':meetingId/presence/:userId')` khai TRƯỚC nuốt mất (ivss-presence.controller.ts:29 vs :65) | Chi tiết ở B-1 (Phần 3) | `userId="report"` → `ParseUUIDPipe` → **400 mọi lần bấm nút xuất báo cáo hiện diện** |

## 2C. Lệch shape request/response (bug âm thầm)

### CRITICAL

**I-3 · Hủy cuộc họp chết với MỌI role — `reason` vs `cancellationReason`.**
FE gửi `{reason}`: [employeeServices.js:151](../src/service/employeeServices.js#L151), [managerServices.js:215](../src/service/managerServices.js#L215), [businessAdminServices.js:256](../src/service/businessAdminServices.js#L256) (BA còn mặc định `reason:'Huỷ bởi quản trị viên'`). BE `CancelMeetingDto` chỉ có field `cancellationReason` (`cancel-meeting.dto.ts:4-10`), pipe route cancel `forbidNonWhitelisted:true` (`meetings.controller.ts:583-590`) → **400 "property reason should not exist" 100% số lần**. Tệ hơn: BA MeetingManagement catch lỗi và hiện **"Đã mô phỏng: Huỷ thành công" giả** ([MeetingManagement.jsx:200-203](../src/pages/bussinessAdmin/MeetingManagement.jsx#L200)).

### HIGH

**I-4 · Lưu agenda khi đặt phòng luôn 400 → agenda không bao giờ được tạo từ UI.**
[BookMeeting.jsx:578-583](../src/pages/employee/BookMeeting.jsx#L578) gửi mỗi item `{title, plannedDurationMinutes, fileName, fileSize}`; BE `AgendaItemDto` không có `fileName/fileSize` + pipe PUT `/meetings/:id/agendas` `forbidNonWhitelisted` (`meetings.controller.ts:1083-1090`) → 400 mọi lần; FE chỉ hiện cảnh báo phụ. Màn này mount cho cả 4 role (routers/index.js:182,282,322,390).

**I-5 · Trang Recordings của Employee luôn trống (3 lỗi chồng nhau).**
[Recordings.jsx:54](../src/pages/employee/Recordings.jsx#L54) gửi `view:'list'` — BE enum chỉ `day|week|month` (`my-schedule-query.dto.ts:12-20`) → 400 ngay khi load; `:59` đọc `data?.length` trong khi BE trả `{items,range,empty}`; `:66-68` đọc `meeting.id/roomName/organizerName` — BE trả `meetingId`, `room.roomName`, không có organizer. (PersonalCalendar.jsx:51-59 làm đúng — copy pattern từ đó.)

**I-6 · BA MeetingManagement create/update luôn 400 + hiện thành công giả.**
[MeetingManagement.jsx:135-148](../src/pages/bussinessAdmin/MeetingManagement.jsx#L135) gửi `organizer` (create) và `roomId/startTime/endTime/organizer` (update); `CreateMeetingDto` không có `organizer`, `UpdateMeetingDto` PATCH chỉ nhận `title/description` — cả 2 route `forbidNonWhitelisted` (meetings.controller.ts:147-155, 308-313) → 400; catch tại `:158-188` **nuốt lỗi, hiện "Đã mô phỏng ... thành công"** → BA tưởng đã tạo/sửa nhưng DB không đổi.

**I-7 · FaceRegistration bước liên kết luôn fail.**
[FaceRegistration.jsx:183-197](../src/pages/employee/FaceRegistration.jsx#L183) (employee + bản manager tương tự): đọc `uploadRes.data?.imageFile?.id` — response thật chỉ có `{faceProfileId, biometricReviewStatus, submittedAt}` (`biometric-submission-response.dto.ts:4-8`) → undefined → dùng fileId **hardcode**; rồi gửi **JSON** vào `POST /users/:id/face-profile` vốn là **multipart** `FileInterceptor('file')` + service bắt buộc file (`face-profile.controller.ts:38-44`) → 400 → user bị đẩy lại scanner dù ảnh bước 1 đã submit thành công.

**I-8 · Nút "Tải xuống" của xuất báo cáo chết — URL tương đối + không token.**
[ExportReportModal.jsx:93,127-133](../src/component/ExportReportModal.jsx#L91): `href="/api/v1/media-files/{id}"` — (a) FE không có proxy (không `"proxy"` trong package.json, không setupProxy.js) → link trỏ về origin FE thay vì `api.smartracking.io.vn` → 404; (b) kể cả cùng origin, thẻ `<a>` không gửi Bearer mà route cần JWT + `recording.files.read` (media-files.controller.ts:53) → 401. Tương tự **I-9**: [Recordings.jsx:125](../src/pages/employee/Recordings.jsx#L125) `window.open('/api/v1/media-files/:id/playback')` — cùng 2 lỗi (route cần `recording.files.play`). Ngược lại [RecordingManagement.jsx:145-152](../src/pages/bussinessAdmin/RecordingManagement.jsx#L145) làm ĐÚNG: gọi secure-download qua service có token → nhận `downloadUrl` → mở. Còn dashboard BA/manager xuất meeting-activity chỉ tạo job rồi dừng — **không có UI tải file nào** ([dashBoard.jsx:411-419](../src/pages/bussinessAdmin/dashBoard.jsx#L411), catch cũng hiện "mô phỏng thành công" giả).

### MEDIUM / LOW

- **I-10** [MEDIUM] Trạng thái đã-đọc thông báo: BE có `isRead` (Redis) + `PATCH /notifications/:id/read`, `/read-all` (notifications.controller.ts:171-188) nhưng FE bỏ qua — [Notifications.jsx:40](../src/pages/systemAdmin/Notifications.jsx#L40) hardcode `read:false` kèm comment sai "BE chưa hỗ trợ"; [NotificationBell.jsx:65-76](../src/component/NotificationBell.jsx#L65) đếm badge bằng localStorage → không đồng bộ giữa thiết bị.
- **I-11** [LOW] NotificationBell.jsx:51 đọc `item.zone_name` — list `/security-alerts` chỉ trả `zone_id` (zone summary chỉ có ở detail) → luôn "Không xác định khu vực".
- **I-12** [LOW] Ô tìm kiếm VehicleRegistrations (SA) gửi param `search` — DTO admin không có, pipe ANPR chỉ whitelist (không forbid) → bị strip im lặng, ô tìm kiếm không lọc gì (VehicleRegistrations.jsx:17-21 → sysAdminServices.js:517-520).
- **I-13** [LOW] `src/components/meetings/MeetingAttendance.jsx` (dead component, không được mount): gửi `note` vào DTO chỉ nhận `reason` + import `manualCheckInAttendance` không tồn tại. Bản đang dùng là `src/component/MeetingAttendanceBoard.jsx` — payload đúng. Bẫy nếu ai mount lại.
- **I-14** [INFO] `/auth/me` không có caller; shape lệch login (`roles` object thay vì string[], thiếu `permissions`, thiếu field biometric popup) — nếu sau này refresh user bằng /auth/me sẽ vỡ ProtectedRoute/BiometricReminder.

### Các flow đã soi và KHỚP (không cần soi lại)
Auth login · ANPR self/admin (snake_case đúng `@Expose`) · Zones (enum zone_type khớp) · Security alerts (resolution_note, bulk ids, severity lowercase) · Alert rules payload · Attendance read (status lowercase 2 phía) · Meeting requests (query + decisionNote/rejectionReason) · Mọi upload multipart dùng field `file` khớp `FileInterceptor('file')` · GET /meetings query BA (chỉ lệch cột hiển thị `organizer` vs `organizerName` — cột trống, cosmetic).

## 2D. Permission mismatch (role màn hình ↔ @RequirePermissions ↔ seed)

Nguồn sự thật: roles thật = `SYSTEM_ADMIN, BUSINESS_ADMIN, MANAGER, EMPLOYEE` (migration `20260720000002-SeedCoreRoles.ts:31-56`); map chuẩn = migration `20260720000005-BackfillRolePermissions.ts` (+ các migration sau 20/07). ⚠ Thư mục `src/database/seeds/*` **không nằm trong migration glob** (`data-source.ts:30` chỉ load `./migrations/*`) và nhiều file grant cho role `'ADMIN'` không tồn tại → **no-op**. PermissionsGuard đòi đủ **tất cả** permission khai báo (permissions.guard.ts:45-48). FE **không kiểm permission**, chỉ gate theo role trong localStorage (ProtectedRoute.jsx:44-51) → mọi lệch chỉ lộ bằng 403 runtime.

| # | Mức | Lỗi | Dẫn chứng | Hậu quả |
|---|---|---|---|---|
| P-1 | **CRITICAL** | Manager không duyệt/từ chối được yêu cầu họp | Màn `/manager/meeting-approvals` ([MeetingApprovals.jsx:149,176](../src/pages/manager/MeetingApprovals.jsx#L149)) → `POST /meeting-requests/:id/approve\|reject` cần `meeting_request.approve\|reject` (meetings.controller.ts:747,792); backfill :358-375 chỉ cấp **SYSTEM_ADMIN**; seed cũ grant 'ADMIN' → no-op | Manager thấy danh sách (có `meeting_request.read`) nhưng mọi nút duyệt → **403**. SA có quyền thì **không có màn** approvals → luồng phê duyệt đặt phòng (điểm nghẽn của mọi cuộc họp mới) chết toàn hệ |
| P-2 | HIGH | BA mất Lịch cá nhân | `/business-admin/schedule` → `GET /me/schedule` cần `schedule.read.self` — seed: EMPLOYEE/MANAGER/SA, không BA | BA mở Lịch trình → 403, lịch trống vĩnh viễn |
| P-3 | HIGH | Employee & BA không tạo/đọc/sửa cấu hình ghi hình | BookMeeting bật ghi hình → `recording.config.create/read/update` = MANAGER/SA only (recording-config.controller.ts:29-72) | Cuộc họp do Employee/BA tạo: recording-config 403 → mất im lặng, ghi hình không bao giờ kích hoạt |
| P-4 | HIGH | Employee & BA không điều khiển ghi hình trong phòng | InMeetingRoom (mount cả 4 role) nút Start/Stop → `recording.video.start/stop/status` = MANAGER/SA only (recording-session.controller.ts:34-121,239) | Host là Employee/BA bấm ghi hình → 403 |
| P-5 | HIGH | BA bị 403 hàng loạt trên màn của chính mình | (a) `POST/PATCH /departments` cần `department.create/update` = MANAGER/SA — màn DepartmentManagement là của BA; (b) sửa/hủy meeting cần `meeting.update.own/cancel.own/time.update` — không BA; (c) participants external/import — không BA; (d) `GET /roles` cần `account.role.read` = **SA only** → dropdown role trong UserManagement/DepartmentManagement 403 (FE fallback mock che lỗi) | Persona BUSINESS_ADMIN gần như read-only + mock trên màn quản trị |
| P-6 | HIGH | Manager không đổi được phòng họp | [manager/MeetingDetail.jsx:282](../src/pages/manager/MeetingDetail.jsx#L282) → `PATCH /meetings/:id/room` cần `meeting.room.update` = **SA only** (meetings.controller.ts:528-533) | Đổi giờ OK (`meeting.time.update` có MANAGER), đổi phòng → 403. Employee cũng dính tương tự |
| P-7 | MEDIUM | Employee thiếu `iot.device.read` | InMeetingRoom panel thiết bị → `GET /iot-devices` (iot-devices.controller.ts:37-40); seed: MANAGER/SA + BA (migration 20260729000006), không EMPLOYEE | Panel thiết bị phòng họp của Employee 403/trống |
| P-8 | MEDIUM | Employee thiếu `security_alert.read` | NotificationBell (mount mọi role) gọi `GET /security-alerts` (alerts.controller.ts:40-42); seed: BA/MANAGER/SA | Nhánh alerts trong chuông chết im lặng với Employee (Promise.allSettled nuốt 403) |
| P-9 | LOW | Service BA trỏ endpoint SA-only chưa có màn gọi | `getAuditLogs` (`audit.system.read`), `getStrangerAlerts` (`face.stranger.read`) trong businessAdminServices.js:120,207 | Bẫy 403 nếu dashboard BA nối các hàm này |
| P-10 | INFO (đính chính) | Permission dạng colon `iot_devices:create/assign_room/configure_face_server/configure_rtsp` | **Seed CÓ đúng nguyên văn** trong backfill (SYSTEM_ADMIN); caller duy nhất là màn SA | Hoạt động bình thường — chỉ lệch convention đặt tên, không phải bug |

---

# PHẦN 3 — BUG BE

## 3A. Lỗi rõ

**B-1 [CAO] Route shadowing: `GET /ivss/meetings/:meetingId/presence/report` không bao giờ chạy được.**
`ivss-presence.controller.ts:29` khai `@Get(':meetingId/presence/:userId')` (kèm ParseUUIDPipe) TRƯỚC `@Get(':meetingId/presence/report')` (dòng 65) cùng controller → Nest đăng ký theo thứ tự khai báo → mọi request `/presence/report` match `:userId="report"` → **400 "uuid is expected"**. `IvssPresenceReportService.buildMeetingReport` (241 dòng) là dead code qua HTTP — và FE **có** nút gọi nó (I-2). Fix 1 dòng: chuyển method `report` lên trước. *(Đã quét cả 277 route: 4 cặp param/static còn lại — iot-devices/status-summary, minutes/search-by-person, users/export, users/manage — đều đúng thứ tự; không có xung đột cross-controller.)*

**B-2 [CAO] Không có global ValidationPipe + 10 controller quên khai pipe → validator DTO là dead code trên các route đó.**
`main.ts:6-26` không có `useGlobalPipes`, không `APP_PIPE` toàn repo (comment tại zones.controller.ts:28 tự thừa nhận luật này). 43 controller khai đúng; các controller sau **quên**:
- `roles.controller.ts:64,87` — `CreateRoleDto/UpdateRoleDto`: regex + uppercase-transform roleCode không chạy → roleCode chữ thường/có space phá invariant RBAC (`roles.includes('SYSTEM_ADMIN')`); thiếu `roleName` → NOT NULL → **500**.
- `permissions.controller.ts:62,85` — permission_code sai định dạng lọt thẳng vào bảng nguồn của PermissionsGuard.
- `role-permissions.controller.ts:42` — `permissionIds` không UUID → cast 22P02 → **500** (QueryFailedFilter chỉ map 23505).
- 5 report controllers (`reports/controllers/*-report.controller.ts:29-38`) — `from:"abc"` vượt check bù (NaN so sánh luôn false, gate-access-report.service.ts:129-157) → tạo job rác rồi worker chết; `format:"csv"` âm thầm thành pdf (worker processor :79).
- `biometric-submission.controller.ts:128` — service có check consent bù nên không bypass được (mức thấp); `dev.controller.ts` (dev-only).

**Route trùng tuyệt đối (cùng method+path 2 handler): 0.** **Controller gọi service method không tồn tại: 0** (đối chiếu script + `tsc --noEmit` = 0 lỗi trên source non-spec).

## 3B. Lỗi runtime tiềm ẩn

- **Thiếu await**: ESLint `no-floating-promises` toàn bộ services+controllers → chỉ 2 vị trí `logAction()` trong `analytics/dashboard-overview.service.ts:83,119` — audit best-effort có try/catch, không phải bug.
- **Null-guard webhook**: đã đọc toàn bộ handler ingest (ivss-webhook, ivss-occupancy, vehicle-webhook, device-callbacks, room-camera) — đều DTO-validate + try/catch + ack-always; payload rác không crash (chi tiết: `parseVerifyPayload` `body?.info ?? {}`, `getValidDate` chặn Invalid Date, `Number.isInteger` chặn NaN occupancy).
- **Circular dependency**: đồ thị `@Module` imports **không có vòng**, repo không dùng `forwardRef`. 38 vòng import mức file đều là entity-relation/pure-util — nợ kiến trúc, không rủi ro runtime.
- Nhặt rác: comment AI để sót `iot-device-events.service.ts:70` ("Wait, the spec says…").

## 3C. Jest toàn repo

```
Test Suites: 19 failed, 341 passed, 360 total
Tests:       109 failed, 3838 passed, 3947 total  (93.6s)
```

Phân loại 19 suite đỏ — **không có suite nào chứng minh bug production**:

| Nhóm | Suites | Nguyên nhân (đã đọc lỗi thật) |
|---|---|---|
| Chết ở build() — thiếu mock sau khi code thêm dependency | meetings.controller, meeting-request-review.controller, live-meeting ×3, roles-permissions.service | `Nest can't resolve ParticipantImportService` (meetings), `JwtService` cho JwtAuthGuard (52 lần xuất hiện) — spec chưa cập nhật theo constructor mới |
| Fixture ngày cứng đã thành quá khứ | create-meeting.dto.spec (startTime `2026-07-15`), time-suggestion.service.spec (`searchRangeStart không được ở quá khứ`), attendance.service.spec (fixture 2026-06-16), meetings.service.spec | Test hết hạn — hôm nay 31/07/2026 |
| Expectation cũ so với code mới (code là đúng) | vehicle-registration.controller.spec (code thêm perm `vehicle_alert.read`, test expect 1 perm), auth-email.service.spec (tiêu đề mail đổi sang không dấu), is-department-*-unique (code chuyển `IsNull()` FindOperator, test expect `null`), vehicle-webhook.spec (plate thiếu → "UNDEFINED" thay "") | Cập nhật lại expectation |
| DTO spec chết vì validator cần DI container | create-department.dto.spec, create-permission.dto.spec (`Cannot read properties of undefined (reading 'count')`) | Validator async check-unique cần mock dataSource — lỗi hạ tầng test |
| Cần xem thêm (khả năng đổi hành vi chủ đích) | live-meeting-warning.service.spec (T-P10/11/18/19: boundary "next booking tại đúng endTime" giờ trả Branch A thay B) | Logic buffer conflict đã đổi; xác nhận với người viết trước khi sửa test |

---

# PHẦN 4 — BẢNG 120 UC

> Trạng thái: ✅ DONE · 🟡 BE-only · 🟠 FE-only · 🔴 BROKEN (có 2 phía nhưng lỗi tích hợp — mã I-x/P-x/B-x trỏ về Phần 2-3) · ⬜ MISSING. UC-20, UC-21, UC-97 đã cắt khỏi phạm vi (§C.2 tài liệu gốc). BE path so với `D:\capstone-be\`, FE so với `D:\FE_SmarTracking\`.

## Phần A — Nền tảng phòng họp (87 UC + UC-121, UC-123)

### FT-01 Xác thực

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-01 | Đăng nhập | auth.controller.ts:57,95 | authService.js:10 + pages/auth/login | ✅ | JWT + refresh |
| UC-02 | Đăng xuất | auth.controller.ts:137 | authService.js:19 | ✅ | |
| UC-03 | Quên MK (OTP) | auth.controller.ts:182,214 | authService.js:34,46 + pages/auth/forgotpassword/* | ✅ | |
| UC-04 | Đổi mật khẩu | auth.controller.ts:245 | authService.js:57 | ✅ | |

### FT-02 Tài khoản

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-05 | Tạo TK (+Excel) | users.controller.ts:74,148,129 | businessAdminServices.js:80,128,132 + UserManagement.jsx | ✅ | |
| UC-06 | Cập nhật TK | users.controller.ts:517 | businessAdminServices.js:84 | ✅ | |
| UC-07 | Phân quyền & vai trò | roles/permissions/role-permissions.controller + users.controller.ts:219 | permissionServices.js + RolePermissionManagement.jsx | ✅ | ⚠ B-2: 3 controller RBAC thiếu ValidationPipe |
| UC-08 | Đổi trạng thái TK | users.controller.ts:297,375,451 | sysAdminServices.js:104-130 | ✅ | |
| UC-09 | Xóa tài khoản | users.controller.ts:592 | sysAdminServices.js:139 | ✅ | |
| UC-10 | Xem & tra cứu TK | users.controller.ts:652,696,797,752 | businessAdminServices.js:67-76 + UserManagement.jsx | ✅ | |
| UC-11 | Tạo phòng ban | departments.controller.ts:48 | businessAdminServices.js:150 + DepartmentManagement.jsx | 🔴 | **P-5a**: màn là của BA nhưng `department.create` chỉ seed MANAGER/SA → 403 |
| UC-12 | Cập nhật phòng ban | departments.controller.ts:162 | businessAdminServices.js:154 | 🔴 | **P-5a**: `department.update` không có BA → 403 |
| UC-13 | Xem DS phòng ban | departments.controller.ts:110 | businessAdminServices.js:146 | ✅ | BA có `department.read` |
| UC-14 | Hồ sơ cá nhân | users.controller.ts:517 + avatar-photo.controller.ts:44 | employeeServices.js:102 + Profile.jsx | ✅ | |
| UC-15 | Đăng ký & liên kết khuôn mặt | biometric-submission.controller.ts:59,89 + face-profile.controller.ts:34 | avatarService.js:15 + FaceRegistration.jsx (employee+manager) | 🔴 | **I-7**: bước liên kết luôn fail (đọc field không tồn tại + JSON vào multipart). Bước submit ảnh chạy. face-profile dùng MockPermissionsGuard (nợ) |
| UC-16 | Duyệt ảnh khuôn mặt | admin-biometric-review.controller.ts:44,89,108 | avatarReviewService.js:9-22 + BiometricSubmissionsReview.jsx | ✅ | |

### FT-03 Cuộc họp

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-17 | Tạo cuộc họp | meetings.controller.ts:143 (→ sinh MeetingRequest PENDING, meetings.service.ts:609-652) | employeeServices.js:40 + BookMeeting.jsx | ✅ | Luồng chính OK; nhưng agenda (I-4) và recording-config (P-3) trong wizard fail im lặng; BA tạo qua MeetingManagement 400 (I-6) |
| UC-18 | Cập nhật / dời lịch | meetings.controller.ts:192 (time), :528 (room), :304 | employeeServices.js:133-141 + MeetingDetail.jsx (emp/mgr) | 🔴 | Đổi giờ OK; **đổi phòng 403 với Employee+Manager** (P-6, `meeting.room.update` SA-only); BA update 400 (I-6) |
| UC-19 | Hủy cuộc họp | meetings.controller.ts:579 | employeeServices.js:152 + MeetingDetail | 🔴 | **I-3 CRITICAL**: `reason` vs `cancellationReason` → 400 với mọi role |
| UC-22 | Quản lý thành viên | meetings.controller.ts:392,467,897,950 | employeeServices.js:67 + ImportParticipantsModal, AddExternalParticipantModal | ✅ | BA thiếu perm external/import (P-5c) — actor chính Host OK |
| UC-23 | Quản lý Agenda | meetings.controller.ts:1026,1061,1132,1211 | employeeServices.js:58 + BookMeeting/MeetingDetail | 🔴 | **I-4**: PUT replace 400 mọi lần vì `fileName/fileSize` → agenda không tạo được từ UI |
| UC-24 | Lịch cá nhân | meetings.controller.ts:837,866 | employeeServices.js:76 + PersonalCalendar.jsx | ✅ | Employee/Manager OK; BA 403 (P-2) |

### FT-04 Phòng họp

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-25 | Tạo phòng | rooms.controller.ts:84 | businessAdminServices.js:216 + RoomManagement.jsx | ✅ | |
| UC-26 | Cập nhật phòng | rooms.controller.ts:128 | businessAdminServices.js:220 | ✅ | |
| UC-27 | Xóa phòng | rooms.controller.ts:205 + :177 (deletion-impact) | businessAdminServices.js:224 | ✅ | |
| UC-28 | Xem & tra cứu phòng | rooms.controller.ts:60 + meetings.controller.ts:660 | businessAdminServices.js:173 + employeeServices.js:13 | ✅ | |

### FT-05 Thiết bị tài sản

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-29 | Đăng ký thiết bị | equipment.controller.ts:45 | equipmentServices.js:19 + EquipmentManagement.jsx | ✅ | |
| UC-30 | Cập nhật trạng thái TB | equipment.controller.ts:93 | equipmentServices.js:29 | ✅ | Chỉ route fault |
| UC-31 | Phân bổ TB vào phòng | equipment.controller.ts:220 | equipmentServices.js:39 | ✅ | |
| UC-32 | Xóa thiết bị | equipment.controller.ts:151 | equipmentServices.js:49 | ✅ | |
| UC-33 | Xem & khả dụng | equipment.controller.ts:181 | equipmentServices.js:10 | ✅ | |

### FT-06 Lập lịch

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-34 | Đề xuất phòng & giờ | scheduling.controller.ts:42,133 | schedulingServices.js:10,28 **không page nào import** | 🟡 | FE service = dead code, không màn gợi ý |
| UC-35 | Phát hiện xung đột | scheduling.controller.ts:91 + meetings.service.ts:166-177 (chặn 409 khi tạo/dời) | N/A (system, chạy trong create/update) | ✅ | |

### FT-07 No-show

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-36 | Giám sát phòng realtime | rooms.controller.ts:238,253 + room-usage-history.controller.ts:42 | businessAdminServices.js:177 + RealtimeRoomMonitor.jsx | ✅ | |
| UC-37 | No-show & tự giải phóng | scheduler.service.ts:168,197 + no-show-detection/lifecycle.service + no-show.controller.ts:59-95 | dashBoard.jsx (BA), RoomOperations.jsx (SA) | ✅ | Cron thật, gate `SCHEDULER_NO_SHOW_CHECK_ENABLED` **default OFF** |
| UC-38 | Giải phóng thủ công | no-show.controller.ts:95 | businessAdminServices.js:193 | ✅ | |
| UC-39 | Phòng trống sớm | scheduler.service.ts:220 → early-vacancy.service.ts | N/A (system) | ✅ | Gate env default OFF |
| UC-40 | Cấu hình ngưỡng | no-show-config.controller.ts:27,35 + early-vacancy-config.controller.ts:29,37 | sysAdminServices.js:550-565 + RoomOperations.jsx | ✅ | |

### FT-08 Trong cuộc họp

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-41 | Bắt đầu phiên | live-meeting.controller.ts:64 | employeeServices.js:168 + InMeetingRoom.jsx | ✅ | |
| UC-42 | Kết thúc phiên | live-meeting.controller.ts:252 | employeeServices.js:223 | ✅ | |
| UC-43 | Gia hạn phiên | live-meeting.controller.ts:120,180 | Service có (employeeServices.js:240,248) — **không UI nào gọi** (grep extension/gia hạn *.jsx = 0) | 🟡 | |
| UC-44 | Hiện diện trực tiếp | live-meeting.controller.ts:305,471 | employeeServices.js:232 + InMeetingRoom.jsx | ✅ | |
| UC-45 | Ghi chú trong họp | live-meeting.controller.ts:564,624 | employeeServices.js:211,215 | ✅ | |

### FT-09 Thiết bị IoT

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-46 | Đăng ký IoT | iot-devices.controller.ts:81 | sysAdminServices.js:201 + DeviceManagement.jsx | ✅ | |
| UC-47 | Gán TB vào phòng | iot-devices.controller.ts:125 | sysAdminServices.js:422 | ✅ | |
| UC-48 | Cấu hình kết nối | iot-devices.controller.ts:182,240,273 | sysAdminServices.js:426-434 | ✅ | Token rotate/revoke đủ |
| UC-49 | Cập nhật TB | iot-devices.controller.ts:153,211 | sysAdminServices.js:211 | ✅ | |
| UC-50 | Vô hiệu/gỡ TB | iot-devices.controller.ts:300,317 | sysAdminServices.js:438,442 | ✅ | |
| UC-51 | Xem & tra cứu TB | iot-devices.controller.ts:37,54,68 | sysAdminServices.js:183,192 | ✅ | |
| UC-52 | Giám sát tình trạng TB | device-callbacks + short-callbacks + scheduler.service.ts:154 (offline) + probe :109,334 | N/A (system) + DeviceManagement probe | ✅ | |
| UC-53 | Pipeline sự kiện TB | iot-devices.service.ts:1665 (verify), :2011 (stranger) — 2202 dòng logic thật | N/A (system) | ✅ | |
| UC-54 | Ánh xạ person↔user | unmapped-review.controller.ts:30,45 | sysAdminServices.js:459,467 + UnmappedVerifyReview.jsx | ✅ | |
| UC-55 | Cấp phát khuôn mặt theo họp | scheduler.service.ts:119 → face-provisioning.service.ts (430 dòng) | N/A (system) | ✅ | Gate `FACE_SYNC_ENABLED` default OFF |
| UC-56 | Thu hồi sau họp | scheduler.service.ts:124 → deprovisionEndedMeetings | N/A (system) | ✅ | |
| UC-57 | Đồng bộ & đối soát | scheduler.service.ts:135 (reconcile) + :242 (ivss-person-sync, 390 dòng) | N/A (system) | ✅ | |
| UC-123 | Kho khuôn mặt IVSS thường trực | scheduler.service.ts:271 → ivss-portrait-sync.service.ts (421 dòng) | N/A (system) | ✅ | Default OFF **chủ ý** (comment scheduler.service.ts:91-96) |

### FT-10 Điểm danh & hiện diện

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-58 | Điểm danh tại cửa | iot-devices.service.ts:1883 → face-attendance.service.ts:42,155,226 | N/A (system) | ✅ | |
| UC-59 | Điểm danh thủ công | manual-attendance.controller.ts:59 | managerServices.js:295 + **MeetingAttendanceBoard.jsx** (component thật, payload đúng) | ✅ | Bản `components/meetings/MeetingAttendance.jsx` là dead code lỗi (I-13) |
| UC-60 | Hiệu chỉnh/hủy hiệu lực | manual-attendance.controller.ts:96,131,168 | managerServices.js:299-307 + MeetingAttendanceBoard.jsx | ✅ | |
| UC-61 | Xem điểm danh & timeline | attendance.controller.ts:43,88 + live-meeting.controller.ts:746 | employeeServices.js:195 + MeetingPresenceTimeline.jsx | ✅ | Route /timeline FE chưa gọi trực tiếp |
| UC-62 | Occupancy qua camera | room-camera.controller.ts:16 → occupancy-ingest.service (196 dòng) + ivss-occupancy.controller.ts:30 | N/A (system) | ✅ | |
| UC-63 | Hiện diện danh tính (IVSS) | ivss-webhook.controller.ts:32 → ivss-presence-ingestion.service (442 dòng) | N/A (system) | ✅ | Tài liệu để Pending chờ phần cứng — code đã có |
| UC-64 | Báo cáo hiện diện từng người | ivss-presence.controller.ts:29,50,65 → ivss-presence-report.service (241 dòng) | managerServices.js:182-190 + MeetingPresenceIVSS.jsx | 🔴 | **B-1/I-2**: route `/presence/report` bị shadow → nút xuất PDF 400 mọi lần; 2 view presence còn lại OK |
| UC-121 | Nhật ký ra/vào theo phòng | ivss-room-access.controller.ts:30 (148 dòng service) | sysAdminServices.js:570 + RoomAccessLogs.jsx | ✅ | |

### FT-11 Ghi hình

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-65 | Cấu hình ghi hình | recording-config.controller.ts:29,58,72 | employeeServices.js:49,284,288 + BookMeeting/InMeetingRoom | 🔴 | **P-3**: Employee/BA 403 (`recording.config.*` = MANAGER/SA) — actor Host chính là Employee |
| UC-66 | Điều khiển ghi hình | recording-session.controller.ts:34,58,83,103,239 | employeeServices.js:256-276 + InMeetingRoom.jsx | 🔴 | **P-4**: Employee/BA 403; pause/resume chưa nghiệm thu camera thật (§C.6-1) |
| UC-67 | Ghi âm theo người | recording-session.controller.ts:156,205 (logic thật :697,949) | transcriptionServices.js:11 + AudioUploader.jsx | ✅ | FE upload thủ công 1 file; chưa UI đa kênh theo seat |
| UC-68 | Xem & phát lại media | media-files.controller.ts:34,53,67,141,159 (signed token :125) | Recordings.jsx (emp) + RecordingManagement.jsx (BA) | 🔴 | **I-5** trang Employee luôn trống + **I-9** playback URL tương đối/không token; nhánh BA (secure-download) ĐÚNG. Nợ scope route face-server còn nguyên |
| UC-69 | Xóa/ẩn file | media-files.controller.ts:141 (visibility) | businessAdminServices.js:300 + RecordingManagement.jsx | ✅ | Chỉ ẩn/hiện, chưa có xóa mềm riêng |

### FT-12 Transcript

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-70 | Sinh transcript (STT) | transcription.controller.ts:41,78 + worker `workers/ai-transcription/*` (thật, có test) | transcriptionServices.js:20 + AudioUploader.jsx | ✅ | |
| UC-71 | Xem transcript | transcription.controller.ts:102 | transcriptionServices.js:38 + TranscriptViewer.jsx | ✅ | |
| UC-72 | Sửa transcript | transcript-segments.controller.ts:43,78,115 | transcriptionServices.js:51-69 | ✅ | |

### FT-13 Biên bản

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-73 | Tạo biên bản nháp | minutes.controller.ts:35 + minutes-ai-draft.controller.ts:39 | minutesServices.js:17,34 + MinutesTabContent.jsx | ✅ | Có nhánh AI draft |
| UC-74 | Cập nhật biên bản | minutes-list.controller.ts:215 | minutesServices.js:51 + MinutesViewerEditor.jsx | ✅ | |
| UC-75 | Xóa nháp | minutes-list.controller.ts:263 | minutesServices.js:59 | ✅ | |
| UC-76 | Ban hành & phân phối | minutes-list.controller.ts:305,344,567 + notifications.controller.ts:117 | minutesServices.js:67 + NotificationActionsPanel.jsx | ✅ | |
| UC-77 | Xuất biên bản | minutes-list.controller.ts:525 | businessAdminServices.js:427 + ExportMinutesModal.jsx | ✅ | Modal này dùng `job.result.downloadUrl` — ĐÚNG cách (khác ExportReportModal) |
| UC-78 | Xem & tra cứu biên bản | minutes-list.controller.ts:63,133,177 | MinutesTabContent.jsx:51 | ✅ | |

### FT-14 Thông báo

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-79 | Thông báo vòng đời họp | notifications.controller.ts:56,76,96 + meeting-notifications.service (772 dòng) + worker | businessAdminServices.js:337-347 + NotificationActionsPanel | ✅ | ⚠ Cron nhắc lịch tự động = **TODO stub** (scheduler.service.ts:364-372) — chỉ gửi thủ công |
| UC-80 | Cảnh báo vận hành | checkin-alert (scheduler :379), no-show warn (:177), stranger-alert.controller.ts:23, offline (:154) | StrangerAlerts.jsx + businessAdminServices.js:207 | ✅ | |
| UC-81 | Giám sát & retry DLQ | Chỉ auto-retry worker (notification-worker.service.ts:117, queue.service.ts:139). Không endpoint DLQ/retry thủ công (grep dead-letter = 0) | Không màn | ⬜ | |

### FT-15 Phân tích & quản trị

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-82 | Dashboard tổng quan KPI | dashboard-overview + 4 meeting-analytics + no-show-rate controllers | businessAdmin/manager/sysAdmin dashboards | ✅ | |
| UC-83 | Dashboard phòng & điểm danh | room-usage-dashboard.controller.ts:40,91 + on-time-rate.controller.ts:40,94 | RoomUsageAnalytics.jsx:63 + EmployeeOnTimeAnalytics.jsx:65 | ✅ | Drill-down thật |
| UC-84 | Audit log | audit-logs.controller.ts:45 | sysAdminServices.js:151 + AuditLogs.jsx | ✅ | |
| UC-85 | Cấu hình chính sách | system-config.controller.ts:50,75 | sysAdminServices.js:241,252 + SystemSettings.jsx | ✅ | |
| UC-86 | Xuất báo cáo tổng hợp | meeting-activity + room-utilization report controllers + background-jobs.controller.ts:41 | ExportReportModal.jsx + dashBoard.jsx:411 + homePage.jsx:329 | 🔴 | **I-8**: tạo job OK nhưng người dùng không bao giờ nhận file — nút tải của ExportReportModal chết (URL tương đối+không token), dashboard export không có UI tải, catch hiện "mô phỏng thành công" giả |

### FT-16 Đặt phòng

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-87 | Gửi yêu cầu đặt phòng | POST /meetings sinh MeetingRequest+RoomBooking PENDING (meetings.service.ts:609-652) + room-bookings.controller.ts:39 | BookMeeting.jsx | ✅ | Kiểm tra xung đột trước khi ghi |
| UC-88 | Phê duyệt đặt phòng | meetings.controller.ts:747 → meeting-request-review.service.ts:72 | managerServices.js:108 + MeetingApprovals.jsx | 🔴 | **P-1 CRITICAL**: Manager 403 (perm chỉ SA), SA không có màn → không ai duyệt được |
| UC-89 | Từ chối đặt phòng | meetings.controller.ts:792 | managerServices.js:116 + MeetingApprovals.jsx | 🔴 | **P-1** |

## Phần B — Mở rộng khuôn viên (30 UC + UC-122)

| UC | Tên | BE | FE | TT | Ghi chú |
|---|---|---|---|---|---|
| UC-90 | Tạo khu vực | zones.controller.ts:85 | zoneServices.js:28 + ZoneManagement.jsx | ✅ | |
| UC-91 | Cập nhật khu vực | zones.controller.ts:170 | zoneServices.js:38 | ✅ | |
| UC-92 | Xóa khu vực | zones.controller.ts:192 (soft) | zoneServices.js:47 | ✅ | |
| UC-93 | Xem & tra cứu khu vực | zones.controller.ts:56,72 | zoneServices.js:10,19 + ZoneManagement/AlertRules/dashboards | ✅ | |
| UC-94 | Gán camera vào khu vực | zones.controller.ts:113,142 | zoneServices.js:57,67 | ✅ | |
| UC-95 | Sơ đồ lắp camera | **Không có** — 0 field tọa độ trong zones/iot entity | Không có page canvas | ⬜ | Chưa bắt đầu 2 phía (Extended P3) |
| UC-96 | Cấu hình AI camera | iot-devices.controller.ts:211 (ghi metadata_json.ai_config) | **0 call** — DeviceManagement chưa có UI | 🟡 | |
| UC-98 | Đăng ký phương tiện | vehicle-registration.controller.ts:170,190 | anprService.js:30,65 + MyVehicles.jsx + ANPRManagement.jsx | ✅ | |
| UC-99 | Duyệt đăng ký xe | **Không có endpoint duyệt** — đăng ký tự set `status:'active'` (vehicle-registration.service.ts:79); PATCH status chỉ active/disabled self-owned | VehicleRegistrations.jsx chỉ list, không nút duyệt | ⬜ | Lệch tài liệu ("chờ duyệt"): hoặc sửa tài liệu (auto-active) hoặc bổ sung luồng duyệt |
| UC-100 | Cập nhật & hủy đăng ký | vehicle-registration.controller.ts:210,231,252 | anprService.js:38,48,56 + MyVehicles.jsx | ✅ | |
| UC-101 | Xem & tra cứu phương tiện | vehicle-registration.controller.ts:57,77,92,114,132 | MyVehicles + VehicleRegistrations + ANPRManagement | ✅ | Param `search` SA bị strip (I-12, cosmetic) |
| UC-102 | Sự kiện biển số | vehicle-webhook.controller.ts:37 → vehicle-resolve.service.ts:68-137 | N/A (system) | ✅ | Có spec test |
| UC-103 | DS kiểm soát phương tiện | vehicle-control-list.controller.ts:45-103 | VehicleControlList.jsx + anprService.js:106-140 | ✅ | |
| UC-104 | Thống kê lưu lượng xe | vehicle-traffic-stats.controller.ts:28 | sysAdminServices.js:413 + GateAccessManagement.jsx + BA dashboard | ✅ | |
| UC-105 | Ghi nhận ra/vào khuôn viên | vehicle-resolve.service.ts:89-105 (channel→zone, direction, ghi gate_access_logs) | N/A (system) | ✅ | |
| UC-106 | Thời gian trong khuôn viên | gate-log-pairing.service.ts:57 (FOR UPDATE SKIP LOCKED) + cron | N/A (system) — hiển thị qua UC-107 | ✅ | |
| UC-107 | Lịch sử ra vào cổng | gate-access-history.controller.ts:34,53,67,84 | Admin: GateAccessManagement.jsx + BA dashboard | ✅ | Thiếu màn self-history nhân viên (route :34 chưa ai gọi) |
| UC-108 | Cảnh báo xe không quyền | vehicle-control-alert.service.ts (evaluate sau INSERT) + unknown-vehicles :92 | ANPRManagement.jsx:77 + SecurityAlerts.jsx | ✅ | |
| UC-109 | Hiện diện theo khu vực | ivss-occupancy.controller.ts:30 → zone-presence-writer.service.ts | N/A (system) | ✅ | |
| UC-110 | Timeline theo khu vực | zone-presence-timeline.controller.ts:28 | **0 call** | 🟡 | Khác UC-122 (theo người) |
| UC-111 | Lưu lượng + heatmap zone | zone-traffic-heatmap.controller.ts:26 | **0 call**, không page heatmap | 🟡 | Phần render giao Nam |
| UC-112 | Cảnh báo tụ tập | crowd-alert.service.ts:42 + cron 5' (gate `SCHEDULER_CROWD_ALERT_ENABLED` **default OFF**) | N/A — ngưỡng qua AlertRules, xem qua SecurityAlerts | ✅ | Bật env khi demo |
| UC-113 | Quy tắc cảnh báo | alert-rules.controller.ts:41-97 | AlertRules.jsx (alertRuleService.js:17-51, **có cả nút xóa** :253) | ✅ | |
| UC-114 | Xem & xử lý cảnh báo | alerts.controller.ts:40-98 | SecurityAlerts.jsx + securityAlertService.js | ✅ | |
| UC-115 | Xâm nhập khu vực hạn chế | restricted-zone-intrusion.service.ts:52 + cron :294 (gate env **default OFF**) | N/A — nổi lên SecurityAlerts | ✅ | Bật env khi demo |
| UC-116 | DS kiểm soát người | person-control-list.controller.ts:44-99 | PersonControlList.jsx + personControlListService.js | ✅ | |
| UC-117 | Dashboard khuôn viên | dashboard-overview.controller.ts:28 + 3 summary controllers | 3 summary ĐÃ nối (campusService.js:20-38 → 4 dashboards); **/overview (realtime zone/GIS) 0 call** | 🟡 | Widget summary chạy; phần lõi GIS/realtime chưa có FE |
| UC-118 | Báo cáo ra vào khuôn viên | gate-access-report.controller.ts:31 | **0 call** — ExportReportModal hard-code room-utilization | 🟡 | Pattern poll job FE có sẵn, nối rẻ |
| UC-119 | Báo cáo phương tiện | vehicle-report.controller.ts:29 | **0 call** | 🟡 | |
| UC-120 | Báo cáo sự kiện an ninh | security-alert-report.controller.ts:31 | **0 call** | 🟡 | |
| UC-122 | Hành trình 1 người | user-journey.controller.ts:31 (ghép 3 nguồn) | campusService.js:11 + UserJourney.jssx (BA+manager, link từ UserManagement:725) | ✅ | |

## Thống kê tổng

| Trạng thái | Phần A (89) | Phần B (31) | **Tổng (120)** | Danh sách |
|---|---|---|---|---|
| ✅ DONE | 73 | 22 | **95 (79,2%)** | — |
| 🟡 BE-only | 2 | 7 | **9** | 34, 43 · 96, 110, 111, 117, 118, 119, 120 |
| 🟠 FE-only | 0 | 0 | **0** | — |
| 🔴 BROKEN | 13 | 0 | **13** | 11, 12, 15, 18, 19, 23, 64, 65, 66, 68, 86, 88, 89 |
| ⬜ MISSING | 1 | 2 | **3** | 81 · 95, 99 |

**% UC demo được ngay: 95/120 ≈ 79%.** Lưu ý: phần lớn 13 🔴 là *partial* (một nhánh actor/một bước chết, các bước còn lại chạy) và toàn bộ đều sửa được nhỏ (đổi tên field, thêm dòng seed, đảo thứ tự route) — sửa xong nhóm Show-stopper dưới đây thì demo-được tăng lên ~90%.

---

# PHẦN 5 — RỦI RO BẢO VỆ, XẾP HẠNG ƯU TIÊN XỬ LÝ

## 5.1 Show-stopper (demo là lộ — sửa TRƯỚC TIÊN, tổng effort ~1 ngày)

| # | Lỗi | Sửa ở đâu | Effort |
|---|---|---|---|
| 1 | **Không ai hủy được cuộc họp** (I-3) | Đổi `{reason}` → `{cancellationReason}` tại employeeServices.js:152, managerServices.js:216, businessAdminServices.js:257 (hoặc thêm alias field vào DTO) | 15' |
| 2 | **Không ai duyệt được đặt phòng** (P-1) | Thêm `MANAGER` vào roles của `meeting_request.approve/reject` trong migration backfill (BackfillRolePermissions.ts:358-375) + migration mới | 30' |
| 3 | **Agenda mất mọi lần đặt phòng** (I-4) | Bỏ `fileName/fileSize` khỏi payload BookMeeting.jsx:578-583 | 15' |
| 4 | **Xuất PDF hiện diện IVSS 400** (B-1/I-2) | Đảo thứ tự 2 method trong ivss-presence.controller.ts | 10' |
| 5 | **Trang Recordings Employee trống** (I-5) | Sửa `view:'month'` + đọc `data.items`/`meetingId` theo pattern PersonalCalendar.jsx:51-59 | 1h |
| 6 | **Employee (host) không ghi hình được** (P-3, P-4) | Seed thêm `recording.config.*`, `recording.video.*` cho EMPLOYEE (và BA nếu muốn) | 30' |
| 7 | **BA MeetingManagement thành công giả** (I-6) | Bỏ field `organizer` (+3 field update) và bỏ catch-giả-lập tại MeetingManagement.jsx:135-188 | 1h |
| 8 | **FaceRegistration bước liên kết fail** (I-7) | Bỏ bước gọi face-profile JSON (hoặc gửi multipart đúng); dùng `faceProfileId` từ response bước 1 | 1-2h |
| 9 | **Nút tải báo cáo chết** (I-8) | ExportReportModal dùng secure-download qua service như RecordingManagement.jsx:145 (hoặc `job.result.downloadUrl` như ExportMinutesModal) | 1h |

## 5.2 Lỗi logic rõ (sửa đợt 2)

- **B-2**: thêm `app.useGlobalPipes(new ValidationPipe({whitelist:true, transform:true}))` vào main.ts (rà lại 43 pipe cục bộ tránh double-transform) — hoặc tối thiểu vá 9 controller thiếu (roles, permissions, role-permissions, 5 reports, biometric-submission).
- **P-5/P-6**: quyết định ma trận quyền cho BA (department.create/update, meeting.update.own/cancel.own, participant external/import, account.role.read, schedule.read.self — P-2) và `meeting.room.update` cho MANAGER/EMPLOYEE → 1 migration seed gộp.
- **I-9**: playback Recordings dùng URL tuyệt đối + token (hoặc signed URL).
- **I-10**: nối `isRead` + mark-read API thay localStorage badge.
- **P-7/P-8**: seed `iot.device.read`, `security_alert.read` cho EMPLOYEE (hoặc bỏ 2 lời gọi khỏi UI Employee).

## 5.3 Permission/config — dễ quên khi demo

1. **Cron default OFF qua env** — bật trước demo: `SCHEDULER_NO_SHOW_CHECK_ENABLED`, auto-release, early-vacancy, `FACE_SYNC_ENABLED`, ivss-sync, `SCHEDULER_CROWD_ALERT_ENABLED` (UC-112), `SCHEDULER_RESTRICTED_ZONE_ENABLED` (UC-115); `ivss-portrait` (UC-123) OFF chủ ý — cân nhắc.
2. **Cron nhắc lịch tự động là TODO stub** (scheduler.service.ts:364-372) — đừng demo "hệ thống tự nhắc trước giờ họp"; demo gửi thủ công qua NotificationActionsPanel.
3. `src/database/seeds/*` không chạy trong migration flow và nhiều file grant role 'ADMIN' không tồn tại — dọn hoặc ghi rõ để khỏi tưởng đã seed.
4. `face-profile.controller.ts` đang dùng MockPermissionsGuard — nhớ thay guard thật trước bảo vệ (câu hỏi bảo mật dễ bị hỏi).
5. Pause/resume ghi hình chưa nghiệm thu trên camera thật (§C.6-1 tài liệu) — tránh demo live tính năng này.

## 5.4 Cosmetic / nợ nhỏ

- Cột "Người tổ chức" trống ở BA MeetingManagement (`organizer` vs `organizerName`).
- Chuông thông báo hiện "Không xác định khu vực" (I-11); ô search VehicleRegistrations không lọc (I-12).
- Dead code nên dọn: `checkInMeeting` (2 service), `components/meetings/MeetingAttendance.jsx`, `getCurrentUser` (/auth/me), comment AI sót `iot-device-events.service.ts:70`.
- 19 suite jest đỏ — sửa mock DI (ParticipantImportService, JwtService), fixture ngày tương đối thay ngày cứng, cập nhật expectation (perm ANPR, IsNull, tiêu đề mail); riêng live-meeting-warning boundary cần xác nhận hành vi trước khi sửa test.

## 5.5 Việc FE còn thiếu để đóng 9 UC 🟡 (ước lượng)

| UC | Việc | Effort |
|---|---|---|
| 118/119/120 | Mở rộng ExportReportModal nhận `endpoint` prop (3 báo cáo còn lại) — pattern poll đã có | 0,5-1 ngày |
| 117 | Nối `/campus-dashboard/overview` vào 1 màn điều hành (chưa cần GIS) | 1-2 ngày |
| 110/111 | Màn timeline zone + heatmap đơn giản (bar theo giờ) | 1-2 ngày |
| 96 | Form ai-config trong DeviceManagement | 0,5 ngày |
| 34 | Nút "Gợi ý phòng/giờ" trong BookMeeting gọi schedulingServices có sẵn | 1 ngày |
| 43 | Nút gia hạn + banner duyệt trong InMeetingRoom | 1 ngày |

3 UC ⬜ cần quyết định phạm vi: UC-81 (thêm endpoint DLQ list/retry + màn SA, ~2 ngày), UC-99 (chốt auto-active và sửa tài liệu, hoặc thêm luồng duyệt ~2 ngày), UC-95 (thêm cột tọa độ + canvas FE, ~3 ngày — cân nhắc cắt như tài liệu đã dự phòng).

---

*Nguồn kiểm chứng: mọi kết luận trong báo cáo đều đã đối chiếu trực tiếp code 2 repo ngày 31/07/2026; các con số route/call tái lập được bằng script trong phụ lục TSV. Riêng nhóm test `live-meeting-warning` (boundary Branch A/B) ghi nhận "cần xác nhận hành vi chủ đích" — chưa kết luận bug.*
