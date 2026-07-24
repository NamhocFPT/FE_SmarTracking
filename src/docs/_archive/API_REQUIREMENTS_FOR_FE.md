# API Requirements — Backend cho Frontend (Smart Meeting Room Management System)

> **Mục đích**: Tài liệu này liệt kê toàn bộ API endpoint hiện có ở backend (`capstone-be`), chia theo module, kèm quyền truy cập, request/response, để FE có thể bắt tay xây dựng giao diện đúng với những gì backend đang cung cấp — không cần đoán.
>
> **Nguồn đối chiếu**: đọc trực tiếp source code `capstone-be/src/**/*.controller.ts` + `*.dto.ts` (không suy đoán từ tên file), cộng với 2 tài liệu đã verify trước đó (`meeting-booking-api-flow.md`, `stt-feature-status-cho-fe.md`) và báo cáo audit `UC158_AUDIT.md` (đối chiếu 158 use case với source, có file:line).
>
> **Ngày tạo**: 2026-07-21. Đây là ảnh chụp tại một thời điểm — nếu BE thay đổi route/DTO sau ngày này, tài liệu cần được re-verify lại với source, không coi là "chân lý vĩnh viễn".

---

## Mục lục

0. [Môi trường & Authentication](#0-môi-trường--authentication)
1. [Auth](#1-auth)
2. [Accounts — Users / Departments / Roles / Permissions / Avatar / Face Profile](#2-accounts)
3. [Meetings — CRUD, Participants, Agenda](#3-meetings)
4. [Meeting Requests — Approval Flow](#4-meeting-requests--approval-flow)
5. [Scheduling — Conflict check, gợi ý giờ/phòng](#5-scheduling)
6. [Rooms — CRUD, Search, Bookings, No-show, Early-vacancy](#6-rooms)
7. [Equipment](#7-equipment)
8. [IoT Devices & Device Callbacks & Face Access](#8-iot-devices--device-callbacks--face-access)
9. [Live Meeting — Session đang diễn ra](#9-live-meeting)
10. [Attendance & Presence](#10-attendance--presence)
11. [Recording — Config, Session, Media Files](#11-recording)
12. [Transcription (STT) — chi tiết đầy đủ](#12-transcription-stt)
13. [Minutes — Biên bản họp](#13-minutes)
14. [Minutes AI Draft (AI Summarize) — ⚠️ WIP](#14-minutes-ai-draft-ai-summarize--wip)
15. [Notifications](#15-notifications)
16. [Analytics](#16-analytics)
17. [Reports (Export)](#17-reports-export)
18. [Administration — Background Jobs, Audit Logs](#18-administration)
19. [WebSocket Realtime](#19-websocket-realtime)
20. [Ngoài phạm vi core (ANPR, IVSS)](#20-ngoài-phạm-vi-core)
21. [Bug / giới hạn đã biết — FE cần lưu ý](#21-bug--giới-hạn-đã-biết)
22. [Checklist tổng hợp cho FE](#22-checklist-tổng-hợp-cho-fe)

---

## 0. Môi trường & Authentication

### 0.1. Base URL & Prefix

- Backend chạy NestJS, cổng mặc định `3000`, base URL local: `http://localhost:3000`.
- **Toàn bộ route trong tài liệu này đều nằm dưới prefix `/api/v1`** (khai báo global ở `main.ts`). Ví dụ route viết `POST /auth/login` trong code thực tế là `POST /api/v1/auth/login`.
- **Không có Swagger/OpenAPI** — đã kiểm tra `main.ts`, không có `SwaggerModule.setup()`. Không có `/api-docs` hay `/api/docs` để FE tự xem — tài liệu này chính là "swagger thủ công".
- Health check: `GET /api/v1/health` (public, không cần token) — dùng để FE kiểm tra BE đã sẵn sàng chưa (trả `status: "ok"` khi DB/Redis/Queue/Storage đều `up`).

### 0.2. Authentication flow

```
1. POST /api/v1/auth/login          { email, password }  →  { accessToken, refreshToken, user }
2. Mọi API khác (trừ endpoint public/device-callback) cần header:
       Authorization: Bearer <accessToken>
3. Access token: 15 phút. Refresh token: 7 ngày.
4. POST /api/v1/auth/logout          → blacklist JWT (Redis), token cũ dùng lại sẽ bị 401.
5. GET  /api/v1/auth/me              → lấy thông tin user hiện tại (dùng để hydrate FE state sau khi login/F5).
```

**Đổi mật khẩu / quên mật khẩu:**

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/v1/auth/password-reset/request` | Body `{ email }`. Gửi OTP 6 số qua email, TTL Redis (không dùng bảng DB). |
| POST | `/api/v1/auth/password-reset/confirm` | Body `{ email, otp, newPassword }`. |
| PATCH | `/api/v1/auth/change-password` | Cần JWT. Body `{ oldPassword, newPassword }`. |

### 0.3. Response Convention (áp dụng cho MỌI endpoint trừ khi ghi chú khác)

**Thành công:**
```json
{
  "success": true,
  "message": "Mô tả kết quả bằng tiếng Việt",
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 125, "totalPages": 7 }
}
```
`meta` chỉ xuất hiện ở API list/pagination.

**Lỗi:**
```json
{
  "success": false,
  "message": "Room is not available in selected time range",
  "error": { "code": "ROOM_NOT_AVAILABLE", "details": {} },
  "timestamp": "2026-07-21T10:00:00.000Z",
  "path": "/api/v1/meetings"
}
```

**HTTP status:**

| Trường hợp | Status |
|---|---:|
| Tạo thành công | 201 |
| Lấy/cập nhật/xóa mềm thành công | 200 |
| Tạo job bất đồng bộ (STT, export report/minutes) | 202 |
| Input sai | 400 |
| Chưa đăng nhập / token hết hạn / bị blacklist | 401 |
| Không đủ quyền | 403 |
| Không tìm thấy | 404 |
| Conflict nghiệp vụ (VD: trùng giờ phòng) | 409 |
| Validate semantic không hợp lệ | 422 |
| Lỗi server | 500 |

### 0.4. Pagination convention

```
?page=1&limit=20&sortBy=created_at&sortOrder=desc
```
- Default `page=1`, `limit=20`. Max `limit=100` (trừ vài API cho phép ít hơn, ví dụ Minutes list max 20).
- `ValidationPipe` global bật `whitelist: true` + `forbidNonWhitelisted: true` → **gửi field lạ trong body sẽ bị BE từ chối (400)**, không bị âm thầm bỏ qua.

### 0.5. RBAC — Role & Permission

**4 role thật tồn tại trong DB** (đã xác nhận qua migration/seed, không phải suy đoán):
```
SYSTEM_ADMIN | BUSINESS_ADMIN | MANAGER | EMPLOYEE
```
> ⚠️ Có role `INTERNAL_USER` xuất hiện trong một số migration cũ nhưng **không tồn tại** trong bảng `roles` thật — nếu FE thấy tài liệu/spec cũ nhắc `INTERNAL_USER`, đó là role không hoạt động (bug lịch sử, không phải role hợp lệ để gán cho user).

**Permission code**: chủ yếu dùng dot-notation viết thường, dạng `module.action` hoặc `module.sub.action` (ví dụ `meeting.create`, `account.role.read`, `equipment.report_fault`). Có **một nhóm ngoại lệ dùng colon-notation** (`iot_devices:create`, `iot_devices:assign_room`, `iot_devices:configure_rtsp`, `iot_devices:configure_face_server`) — đây là inconsistency thật trong code, FE không cần quan tâm format, chỉ cần biết BE trả 403 nếu thiếu quyền tương ứng.

FE không tự quyết định hiển thị nút bấm dựa trên role cứng (vì permission mới là cái BE check) — nên lấy danh sách quyền của user hiện tại (qua `GET /auth/me` hoặc endpoint role/permission tương ứng) để ẩn/hiện UI, tránh gọi API rồi nhận 403.

### 0.6. WebSocket

- Path: `/ws` (Socket.io), cấu hình qua env `WS_PATH`/`WS_CORS_ORIGIN`.
- **Hiện trạng thật**: gateway mới chỉ implement **2 event**: `ivss:subscribe` / `ivss:unsubscribe` (join/leave room `ivss:meeting:<meetingId>` để nhận presence từ camera). **Chưa có** các event như `meeting.status.updated`, `room.status.updated`, `notification.created`, `recording.status.updated` dù các tài liệu định hướng ban đầu (CLAUDE.md) có nhắc tên event này — đó là kế hoạch, chưa phải hiện trạng.
- **Chưa bắt buộc JWT khi connect** (cờ `WS_AUTH_REQUIRED` chưa gate) — không dựa vào WebSocket để bảo mật dữ liệu nhạy cảm ở giai đoạn hiện tại.
- **Khuyến nghị cho FE**: không phụ thuộc WebSocket cho các luồng chính (dùng REST + polling, xem mục STT/AI Draft/Export). Chỉ dùng WS cho phần realtime presence phòng nếu cần demo.

---

## 1. Auth

File: `src/modules/auth/controllers/auth.controller.ts`

| Method | Path | Guard | Request | Response | Ghi chú |
|---|---|---|---|---|---|
| POST | `/auth/login` | Public | `LoginDto { email, password }` | `{ accessToken, refreshToken, user }` | 200 |
| POST | `/auth/logout` | JWT | — | `{ success, message }` | Blacklist JWT trong Redis theo TTL còn lại của token |
| POST | `/auth/password-reset/request` | Public | `RequestOtpDto { email }` | OTP gửi qua email | Rate-limited |
| POST | `/auth/password-reset/confirm` | Public | `ConfirmResetDto { email, otp, newPassword }` | — | Đổi mật khẩu qua OTP |
| PATCH | `/auth/change-password` | JWT | `ChangePasswordDto { oldPassword, newPassword }` | — | Verify mật khẩu cũ trước khi đổi |
| GET | `/auth/me` | JWT | — | `UserProfile` (id, fullName, email, roles, permissions...) | Dùng để hydrate session FE |

---

## 2. Accounts

### 2.1. Users

File: `src/modules/accounts/controllers/users.controller.ts`

| Method | Path | Quyền | Request | Response | Ghi chú |
|---|---|---|---|---|---|
| POST | `/users` | `accounts.user.create` | `CreateUserDto` (email, fullName, employeeCode, phone, departmentId, position...) | `UserResponseDto` | 201. Tạo mật khẩu tạm, gửi email welcome |
| GET | `/users/import/template` | `accounts.user.import` | — | file `.xlsx` | Template import Excel |
| POST | `/users/import` | `accounts.user.import` | `ImportAccountsDto` + file (multipart) | `ImportAccountReportDto` | `commit=false` → preview, `commit=true` → thực thi |
| GET | `/users` | `accounts.user.list` | `ListUsersQueryDto` (search theo tên/email) | `UserListItemDto[]` + meta | Danh sách rút gọn cho autocomplete |
| GET | `/users/manage` | `accounts.user.manage` | `ManageUsersQueryDto` (filter dept/role/status) | `ManageUserItemDto[]` + meta | View quản trị. Business Admin bị scope theo phòng ban |
| GET | `/users/:userId` | `account.user.read.detail` | — | `UserDetailResponseDto` | Chi tiết (dept-scoped) |
| GET | `/users/:userId/public-profile` | JWT (không cần quyền riêng) | — | `{ id, fullName, email, employeeCode, department, avatarUrl }` | Bất kỳ user đăng nhập nào xem được (VD: hiển thị avatar người tham gia meeting) |
| PATCH | `/users/:userId` | `accounts.user.update` | `UpdateUserDto` (fullName, phone, position, departmentId...) | `UserDetailResponseDto` | Không đổi email/roles/status |
| PUT | `/users/:userId/roles` | `accounts.user.update_roles` | `UpdateUserRolesDto { roleIds: uuid[] }` | `{ userId, roles: [] }` | Replace toàn bộ role set |
| PATCH | `/users/:userId/status` | `accounts.user.update_status` | `UpdateUserStatusDto { accountStatus }` | `{ id, accountStatus }` | ACTIVE/INACTIVE. Revoke token nếu deactivate |
| PATCH | `/users/:userId/lock` | `accounts.user.lock` | `LockUserDto { reason? }` | `{ id, accountStatus: 'LOCKED' }` | Revoke toàn bộ session |
| PATCH | `/users/:userId/unlock` | `accounts.user.unlock` | — | `{ id, accountStatus }` | Reset counter đăng nhập sai |
| DELETE | `/users/:userId` | `accounts.user.delete` | — | — | Soft-delete, chặn nếu còn ràng buộc (meeting đang host, còn booking...) |

> Route order quan trọng: `/users/manage`, `/users/import/*` khai TRƯỚC `/users/:userId` để tránh NestJS match nhầm.

### 2.2. Departments

File: `src/modules/accounts/controllers/departments.controller.ts`

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/departments` | `department.create` | `CreateDepartmentDto { departmentCode (2-50, uppercase), departmentName (2-150, unique), parentDepartmentId?, managerUserId?, description? }` | `DepartmentResponseDto` | 201 |
| GET | `/departments` | `department.read` | `ListDepartmentsQueryDto { search?, page?, limit?, parentId? }` | list + meta | 200 |

### 2.3. Roles

File: `src/modules/accounts/controllers/roles.controller.ts`

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/roles` | `account.role.read` | `page, limit, sortBy, sortOrder, isActive?, search?` | list + meta | 200 |
| GET | `/roles/:id` | `account.role.read` | — | detail | 200 |
| POST | `/roles` | `account.role.create` | `CreateRoleDto { roleCode (uppercase A-Z0-9_, bắt đầu bằng chữ, 2-50), roleName (≤100), description? }` | role | 201 |
| PATCH | `/roles/:id` | `account.role.update` | `UpdateRoleDto { roleName?, description?, isActive? }` | role | 200 — `roleCode`/`isSystemRole` bất biến, gửi lên sẽ 400 |
| DELETE | `/roles/:id` | `account.role.delete` | — | — | 200 — soft-delete (vô hiệu hóa) |

### 2.4. Permissions

File: `src/modules/accounts/controllers/permissions.controller.ts`

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/permissions` | `admin.manage_permissions` hoặc `permission.read` | `page, limit, sortBy, sortOrder, moduleCode?, search?` | list + meta | 200 |
| GET | `/permissions/:id` | như trên | — | detail | 200 |
| POST | `/permissions` | `admin.manage_permissions` | `CreatePermissionDto { permissionCode (lowercase, dạng "module.action"), permissionName (≤150), moduleCode (allowlist), actionCode, description? }` | permission | 201 |
| PATCH | `/permissions/:id` | `admin.manage_permissions` | `{ permissionName?, description? }` | permission | 200 — `permissionCode` bất biến |
| POST | `/permissions/:id/toggle-active` | `admin.manage_permissions` | — | permission (isActive đảo trạng thái) | 200 |

### 2.5. Role ↔ Permission

File: `src/modules/accounts/controllers/role-permissions.controller.ts`

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/roles/:roleId/permissions` | `admin.manage_permissions` | — | list permission của role | 200 |
| POST | `/roles/:roleId/permissions` | `admin.manage_permissions` | `AssignPermissionsDto { permissionIds: uuid[] (không trùng) }` | `{ assigned: [], skipped: [] }` | 201 (có gán mới) / 200 (toàn bộ đã tồn tại) |
| DELETE | `/roles/:roleId/permissions/:permissionId` | `admin.manage_permissions` | — | — | 200 |

### 2.6. Avatar (self-service)

File: `src/modules/accounts/controllers/avatar.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/me/avatar-status` | `profile.avatar.read_status` | — | `{ avatarReviewStatus: 'pending_review'|'active'|'rejected', avatarUrl, avatarRequired, shouldShowAvatarPopup, message }` |
| POST | `/me/avatar-submission` | `profile.avatar.submit` | multipart: `file` (ảnh, ≤5MB), `consentAccepted: true` | `{ faceProfileId, avatarReviewStatus: 'pending_review', submittedAt }` (201) |

### 2.7. Duyệt Avatar (Admin)

File: `src/modules/accounts/controllers/admin-avatar-review.controller.ts` — **chỉ `SYSTEM_ADMIN`**

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/admin/avatar-submissions` | `account.avatar.review` | filter status/dept/search/sort + pagination | list |
| GET | `/admin/avatar-submissions/:faceProfileId` | `account.avatar.review` | — | detail (kèm quality score) |
| GET | `/admin/avatar-submissions/:faceProfileId/download-url` | `account.avatar.download` | — | `{ downloadUrl, expiresAt }` (signed URL tạm thời) |
| POST | `/admin/avatar-submissions/:faceProfileId/approve` | `account.avatar.review` | — | 200 |
| POST | `/admin/avatar-submissions/:faceProfileId/reject` | `account.avatar.review` | `{ reason (1-500 ký tự, required) }` | 200 |

### 2.8. Face Profile (liên kết khuôn mặt hệ thống ↔ Face Server)

File: `src/modules/accounts/controllers/face-profile.controller.ts`

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/users/:userId/face-profile` | multipart `file` (ảnh, ≤5MB) | 201, "Face portrait enrolled" |

> ⚠️ Endpoint này đang dùng `MockPermissionsGuard` (chưa enforce permission thật) — về mặt kỹ thuật gọi được mà không cần đúng quyền `account.face.register`. Không dựa vào đây để test phân quyền.
> ⚠️ Theo audit UC-17: enroll ảnh KHÔNG tự động set `device_person_id` — liên kết với Face Server (person thật trên thiết bị) là một bước riêng qua `POST /face-access/unmapped-verifies/map` (mục 8.3), không tự động.

---

## 3. Meetings

File chính: `src/modules/meetings/controllers/meetings.controller.ts`

### 3.1. Luồng tạo & phê duyệt (tóm tắt)

```
POST /meetings (tạo yêu cầu)
    → status: draft → pending_approval
    → RoomBooking: pending
    → (nếu cần duyệt) chờ Manager duyệt tại meeting-requests (mục 4)
    → approved → meeting.status = scheduled
```

### 3.2. Tạo / xem / sửa meeting

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/meetings` | `meeting.create` | `CreateMeetingDto`: `title` (≤255, required), `description?` (≤2000), `startTime`/`endTime` (ISO8601, tương lai, end>start), `roomId` (uuid, required), `hostId?`, `meetingType?` (normal\|training\|interview\|emergency), `meetingMode?` (offline\|online\|hybrid), `expectedAttendeeCount?`, `capacityOverrideConfirmed?`, `participantUserIds?: uuid[]`, `externalParticipants?: {email,name}[]` | `{ id, meetingCode, title, status, approvalStatus, startTime, endTime, roomId, roomName, organizerId, hostId, participantCount, bookingStatus, bookingCode, createdAt }` | 201 |
| GET | `/meetings/:meetingId` | JWT | — | Meeting detail đầy đủ | 200 |
| PATCH | `/meetings/:meetingId/time` | `meeting.time.update` | `{ startTime, endTime, newRoomId?, overrideParticipantConflict?, changeReason? }` | Có thể đưa meeting về lại `pending_approval` nếu policy yêu cầu duyệt lại | 200 |
| PATCH | `/meetings/:meetingId/room` | `meeting.room.update` | `{ newRoomId, confirmCapacityOverride?, changeReason? }` | Đổi phòng, release booking cũ | 200 |
| GET | `/meetings/:meetingId/available-rooms` | JWT | Query: `capacityWarningMode?`, `includeCurrentRoom?` | `AvailableRoomDto[]` (roomCode, roomName, capacity, hasCamera/Microphone/Display, allowRecording...) | 200 |
| GET | `/rooms/available` | JWT | Query: `startTime`, `endTime` (required), `minCapacity?` | Danh sách phòng trống (global, không gắn với 1 meeting cụ thể) | 200 |
| POST | `/meetings/:meetingId/cancel` | `meeting.cancel.own` | `{ cancellationReason? }` | Giải phóng phòng, gửi notification hủy | 200 |

### 3.3. Participants

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/meetings/:meetingId/participants/internal` | `meeting.participant.add.internal` | `{ userId, overrideWarnings?, warningToken? }` | `{ participantId, meetingId, userId, role, status }` | 201 |
| POST | `/meetings/:meetingId/participants/external` | `meeting.participant.add.external` | `{ email, name }` | participant ngoài (guest, nhận email invite) | 201 |
| GET | `/meetings/:meetingId/participants/import/template` | `meeting.participant.import` | — | file `.xlsx` | 200 |
| POST | `/meetings/:meetingId/participants/import` | `meeting.participant.import` | file + `forceAddWithWarnings?` | Có thể trả 422 nếu có warning và `force=false` | 200/422 |
| DELETE | `/:meetingId/participants/:participantUserId` | JWT | body optional | `{ removed, notificationQueued, backgroundJobId }` | 200 — ⚠️ path KHÔNG có tiền tố `meetings/` (đã xác nhận từ source, không phải lỗi đánh máy tài liệu) |
| DELETE | `/meetings/:meetingId/participants/external/:externalParticipantId` | JWT | — | — | 200 |

### 3.4. Agenda

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/meetings/:meetingId/agendas` | — | List item theo `order` |
| PUT | `/meetings/:meetingId/agendas` | `ReplaceAgendaDto` (mảng item đầy đủ) | **Atomic replace**: item có `id` → update, item thiếu `id` → tạo mới, item bị bỏ khỏi payload → xóa |
| PATCH | `/meetings/:meetingId/agendas/:agendaId` | Partial update 1 item | — |
| DELETE | `/meetings/:meetingId/agendas/:agendaId` | — | Xóa 1 item |

### 3.5. Lịch cá nhân

| Method | Path | Quyền | Response |
|---|---|---|---|
| GET | `/me/schedule` | `schedule.read.self` | Query `from/to/status`. Danh sách meeting của user hiện tại |
| GET | `/me/schedule/:meetingId` | `schedule.read.self` | Chi tiết 1 meeting trong lịch cá nhân |

---

## 4. Meeting Requests — Approval Flow

File: `src/modules/meetings/controllers/meeting-requests.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/meeting-requests` | `meeting_request.read` | `page, limit, approvalStatus (pending\|approved\|rejected\|applied\|cancelled\|all), requestType, targetRoomId, requestedById, from, to, q, sortBy, sortOrder` | List (kèm `conflictCheckStatus`, `requestedBy`, `targetRoom`, `decisionBy`, `meeting`) |
| POST | `/meeting-requests/:requestId/approve` | `meeting_request.approve` | `{ decisionNote? }` | `{ requestId, approvalStatus: 'approved', meetingId, bookingId, appliedAt }` |
| POST | `/meeting-requests/:requestId/reject` | `meeting_request.reject` | `{ rejectionReason (required, ≤1000) }` | `{ requestId, approvalStatus: 'rejected', decisionAt }` |

**Điều kiện approve/reject**: request phải `PENDING` + `requestType=CREATE_MEETING` + meeting đang `PENDING_APPROVAL` + booking đang `PENDING` + **người duyệt không được là người tạo request** (chống tự duyệt) + re-check xung đột phòng tại thời điểm duyệt.

**Enum trạng thái cốt lõi:**
- `MeetingStatus`: `draft → pending_approval → scheduled → in_progress → completed` (hoặc `cancelled` bất kỳ lúc nào)
- `RoomBookingStatus`: `pending → approved → active → completed` (hoặc `cancelled`)
- `MeetingRequestType`: `create_meeting | update_time | update_room | cancel_meeting | extend_meeting | book_room`
- `ConflictCheckStatus`: `not_checked | clear | warning | blocked`

---

## 5. Scheduling

File: `src/modules/scheduling/scheduling.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/scheduling/room-suggestions` | `scheduling.suggest.rooms` | `startTime, endTime (ISO8601 required), attendeeCount (≥1 required), roomType?, siteName?, areaName?, allowRecording?, hasCamera?, hasMicrophone?, hasDisplay?` | `RoomSuggestionItemDto[]` + `meta: { resultLimit: 20, totalRoomsFound }` |
| POST | `/scheduling/participant-conflicts/check` | `scheduling.conflict.participant.check` | `{ startTime, endTime, timezone?, participantUserIds: uuid[] (≤50, required), excludeMeetingId?, externalParticipantEmails? }` | Trạng thái free/busy/unknown từng người — **cảnh báo mềm, không phải lỗi 409/422** |
| POST | `/scheduling/time-suggestions` | `scheduling.suggest.times` | `{ requiredParticipantUserIds?, optionalParticipantUserIds?, externalParticipantEmails?, searchRangeStart, searchRangeEnd, durationMinutes (15-480 required), excludeMeetingId?, maxSuggestions? (1-10) }` | `TimeSuggestionItemDto[]` — required participant là hard filter, optional chỉ ảnh hưởng ranking |

---

## 6. Rooms

### 6.1. CRUD & Search

File: `src/modules/rooms/controllers/rooms.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/rooms/search` | JWT (không cần quyền riêng — mọi user login đều xem được) | `SearchRoomsQueryDto` (capacity, area, onlyAvailable, equipment...) | list phòng + meta |
| POST | `/rooms` | `room.create` | `CreateRoomDto` | `CreateRoomResponseDto` (201) |
| PATCH | `/rooms/:roomId` | `room.update` | `UpdateRoomDto` (name/capacity/location — `roomCode`/`status` bất biến) | updated room |
| GET | `/rooms/:roomId/status` | JWT | Query `RealtimeStatusQueryDto` | Trạng thái realtime (booking/occupancy) — ⚠️ xem mục 21, trường no-show hiện hardcode `null` |
| DELETE | `/rooms/:roomId` | `room.delete` | — | Soft-delete kèm phân tích tác động (booking tương lai bị ảnh hưởng gì) |

### 6.2. Room Bookings

File: `src/modules/rooms/controllers/room-bookings.controller.ts`

| Method | Path | Quyền | Request |
|---|---|---|---|
| GET | `/room-bookings` | `room.booking.read` | `page, limit, roomId?, status? (pending\|approved\|active\|completed\|cancelled\|released), bookingType? (scheduled\|ad_hoc\|extension\|relocated), from?, to?, q?, sortBy?, sortOrder?` |

> Lưu ý: `bookingType=ad_hoc` tồn tại trong enum nhưng theo audit UC-35, **chưa có endpoint nào tạo booking loại ad-hoc thật** — trường này hiện là dead code, FE không nên build UI "đặt phòng ngay" dựa trên giá trị này.

### 6.3. No-show

File: `src/modules/rooms/controllers/no-show.controller.ts`, `no-show-config.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/no-show-cases` | `room.noshow.read` | `page, limit, status? (risk\|confirmed\|warning_sent\|released\|dismissed\|resolved), roomId?` | list |
| PATCH | `/no-show-cases/:id` | `room.noshow.update` | `{ detectionStatus?, resolutionStatus? (kept\|false_positive\|manual_override), note? (≤1000) }` | updated |
| POST | `/no-show-cases/:id/release` | `room.noshow.release` | `{ reason (required, ≤500) }` | Giải phóng phòng thủ công. Lỗi: 404 not-found / 400 đã dismissed-resolved / 409 booking đã đổi |
| GET | `/no-show-config` | `room.noshow.configure` | — | `{ thresholdMinutes, warningGraceMinutes, autoReleaseGraceMinutes }` |
| PUT | `/no-show-config` | `room.noshow.configure` | `{ thresholdMinutes? (1-1440), warningGraceMinutes? (0-1440), autoReleaseGraceMinutes? (1-1440) }` | Cấu hình ngưỡng phát hiện no-show (áp dụng toàn hệ thống) |

> `POST /internal/no-show-cases` là endpoint **system-to-system** (dùng `InternalTokenGuard`, không phải JWT user) — do cron job nội bộ gọi, FE không cần dùng.

### 6.4. Early-vacancy (phòng trống sớm)

File: `src/modules/rooms/controllers/early-vacancy-config.controller.ts`

| Method | Path | Quyền | Request |
|---|---|---|---|
| GET | `/early-vacancy-config` | `room.early_vacancy.configure` | — |
| PUT | `/early-vacancy-config` | `room.early_vacancy.configure` | `{ emptyMinutes? (1-1440), minRemainingMinutes? (0-1440), minElapsedMinutes? (0-1440) }` |

> ⚠️ Theo audit: cơ chế early-vacancy hiện **chỉ đánh dấu flag** (`usage_status='early_empty'`), **không** tự giải phóng phòng/booking — nếu FE build UI "phòng được tự giải phóng sớm", hiện tại backend chưa làm vậy, chỉ hiển thị cảnh báo.

---

## 7. Equipment

File: `src/modules/equipment/controllers/equipment.controller.ts`

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/equipments` | `equipment.create` | `CreateEquipmentDto`: `equipmentName` (1-150), `equipmentType` (camera\|microphone\|display\|speaker\|capture_agent\|sensor\|other), `equipmentCode` (3-80, uppercase, unique), `serialNumber?`, `brand?`, `model?`, `purchaseDate?` (YYYY-MM-DD), `specification?` (JSON), `healthStatus?` | `EquipmentResponseDto` | 201 (409 nếu trùng serial/code) |
| GET | `/equipments` | `equipment.read` | filter `equipmentType/assetStatus/healthStatus/currentRoomId/search` + sort + pagination | list | 200 |
| PATCH | `/equipments/:equipmentId/fault` | `equipment.report_fault` | `{ healthStatus? (warning\|faulty\|offline — không cho set về healthy qua đây), assetStatus? (maintenance), issueNote (required, 1-2000) }` | updated | 200 (422 nếu không có gì thay đổi) |
| PATCH | `/equipments/:equipmentId/assignment` | `equipment.assign` | `{ roomId (required), installedAt? (default now), assignmentNote? }` | updated | 200 |
| DELETE | `/equipments/:equipmentId` | `equipment.delete` | — | — | 200, soft-delete |

> ⚠️ Không có endpoint "check availability" riêng cho equipment (UC-66 MISSING theo audit) — muốn biết thiết bị đang được gán ở đâu, dùng `GET /equipments` filter theo `currentRoomId`.

---

## 8. IoT Devices & Device Callbacks & Face Access

> Nhóm này phục vụ camera/Face Server/thiết bị cửa — chỉ cần build UI nếu FE có màn hình quản trị thiết bị (SysAdmin). Nếu FE chưa cần UI này ở giai đoạn đầu, có thể bỏ qua mục 8 và quay lại sau.

### 8.1. IoT Devices (quản trị thiết bị)

File: `src/modules/iot/controllers/iot-devices.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/iot-devices` | `iot.device.read` | `page, limit, status?, device_type?, room_id?, search?` | list |
| GET | `/iot-devices/status-summary` | `iot.device.read` | — | Tổng hợp số lượng online/offline/disabled |
| GET | `/iot-devices/:id` | `iot.device.read` | — | detail |
| POST | `/iot-devices` | `iot_devices:create` | `{ device_name (required), device_code (required), device_type, ip_address?, mac_address?, metadata_json? }` | 201 |
| PATCH | `/iot-devices/:id` | `iot.device.update` | `{ device_name?, ip_address?, mac_address?, network_identifier? }` (whitelist field, `null` để clear) | 200 |
| POST | `/iot-devices/probe-status` | `iot.device.probe` | — | Chủ động ping kiểm tra online/offline |
| POST | `/iot-devices/:id/assign-room` | `iot_devices:assign_room` | `{ room_id (required) }` | 200 |
| PATCH | `/iot-devices/:id/rtsp-config` | `iot_devices:configure_rtsp` | `{ rtsp_enabled?, rtsp_protocol (rtsp\|rtsps), rtsp_host, rtsp_port? (1-65535), rtsp_path (bắt đầu bằng '/'), rtsp_username?, rtsp_password? (mã hoá AES-256-GCM khi lưu DB), stream_profile? }` | 200 — password không trả lại plaintext |
| POST | `/iot-devices/:id/face-server/rotate` | `iot_devices:configure_face_server` | — | `{ device, one_time_callback_token }` — token chỉ hiện **1 lần**, phải copy ngay |
| POST | `/iot-devices/:id/face-server/revoke` | `iot_devices:configure_face_server` | `{ reason? }` | 200 |
| POST | `/iot-devices/:id/disable` \| `/enable` | `iot.device.disable` \| `iot.device.enable` | — | 200 |
| POST | `/iot-devices/:id/check-availability` | `iot.device.check_availability` | — | 200 |

### 8.2. Device Callbacks (system-to-system — KHÔNG dùng cho FE)

File: `src/modules/iot/controllers/device-callbacks.controller.ts` (+ các bản rút gọn `short-device-callbacks`, `stranger-short-device-callbacks`, `verify-short-device-callbacks`)

```
POST /device-callbacks/face/heartbeat   (hoặc rút gọn: /hb/:deviceCode/:callbackToken)
POST /device-callbacks/face/verify      (hoặc rút gọn: /vf/:deviceCode/:callbackToken)
POST /device-callbacks/face/stranger    (hoặc rút gọn: /sf/:deviceCode/:callbackToken)
```
Các endpoint này **không dùng JWT** — xác thực bằng device code + callback token do chính thiết bị Face Server gửi lên. **FE không gọi các endpoint này** — chỉ ghi vào đây để FE hiểu tại sao chúng không có trong Postman collection thông thường.

### 8.3. Face Access — Cảnh báo & Ánh xạ người lạ

File: `src/modules/face-access/controllers/stranger-alert.controller.ts`, `unmapped-review.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/face-access/stranger-alerts` | `face.stranger.read` | `page, limit, windowMinutes?` | list — **không trả ảnh base64** (chỉ metadata, vì lý do bảo mật) |
| GET | `/face-access/unmapped-verifies` | `face.unmapped.read` | `page, limit, windowMinutes?` | list các lần Face Server nhận diện nhưng chưa map được user |
| POST | `/face-access/unmapped-verifies/map` | `face.unmapped.map` | `{ deviceId, personId (Face Server person id), userId, meetingId }` | 201 — Tạo `device_user_mappings`, **không** đẩy ngược lên Face Server |

---

## 9. Live Meeting

File: `src/modules/live-meeting/controllers/live-meeting.controller.ts` — quản lý session họp **đang diễn ra** (khác với CRUD meeting ở mục 3).

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/live-meetings/:meetingId/start` | `meeting.session.start` | — | `{ meetingId, status, actualStartTime, alreadyStarted, warningScheduledAt?, warningSkipped? }` |
| POST | `/live-meetings/:meetingId/end` | `meeting.session.end` | — | `{ meetingId, status, actualEndTime, duration, roomReleased }` |
| POST | `/meetings/:meetingId/extension-requests` | `meeting.extension.request.own` | `{ extensionMinutes (≥1, required), reason? (≤500) }` | Nếu không có conflict → tự động applied; nếu conflict → tạo request chờ Manager duyệt |
| POST | `/live-meetings/:meetingId/extension-requests/:requestId/decide` | Tự check `meeting.session.extension.decide`/`.override` | `{ decision: 'approved'\|'rejected', reason? (≤500) }` | Duyệt/từ chối gia hạn — auto-reject nếu re-check phát hiện conflict |
| GET | `/live-meetings/:meetingId/present-attendees` | `meeting.presence.read` | `search?, departmentId?, page?, limit?, sortBy?, sortOrder?` | Danh sách người đang có mặt (từ presence/attendance) |
| GET | `/meetings/:meetingId/attendance` | `attendance.read` | `q?, status? (checked_in\|late\|absent), page?, pageSize?, sortBy?, sortOrder?` | `{ meetingId, meetingStatus, actualStartTime, lateThresholdMinutes, participants[], meta }` |
| POST | `/meetings/:meetingId/notes` | `meeting.note.create` | `{ noteType (in_meeting\|private\|host_note\|system_note — 'system_note' bị BE tự chặn tạo qua API, trả 422), content (required, ≤10000), pinned?, visibilityLevel? (private\|participants\|department\|public_internal) }` | 201 — meeting phải đang `in_progress` |
| GET | `/meetings/:meetingId/notes` | `meeting.note.read` | Filter `noteType, visibility, pinned, from, to, includeSourceEvent`, search `q`, sort `timeline_asc/desc` | List (đã filter theo quyền xem của user — Host/Co-host/Participant thấy khác nhau) |
| GET | `/meetings/:meetingId/timeline` | `meeting.timeline.read` | pagination | Merge `meeting_events` + `attendance_events` + `notes`, sort theo thời gian |

**Recording trong live meeting** (điều khiển ghi hình camera IP, khác với upload audio thủ công ở mục 11-12):

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| POST | `/live-meetings/:meetingId/recording/start-video` | `recording.video.start` | Bắt đầu ghi hình IP Camera (FFmpeg RTSP→MP4). Storage hiện tại là **local**, chưa phải S3 dù docs cũ có nhắc |
| POST | `/live-meetings/:meetingId/recording/:sessionId/pause-video` | `recording.video.stop` | Tạo segment, cho phép resume sau |
| POST | `/live-meetings/:meetingId/recording/:sessionId/stop-video` | `recording.video.stop` | Dừng, ghép segment, tính checksum |

---

## 10. Attendance & Presence

### 10.1. Attendance thủ công (Host/Admin sửa tay)

File: `src/modules/attendance/controllers/manual-attendance.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/meetings/:meetingId/attendance` | `attendance.manual.create` | `{ userId (required), checkInTime? (mặc định = now), note? (≤1000) }` | 201 |
| PATCH | `/meetings/:meetingId/attendance/:recordId/status` | `attendance.manual.update` | `{ attendanceStatus: present\|absent\|late\|left_early\|pending_review (required), reason? }` | 200 |
| PATCH | `/meetings/:meetingId/attendance/:recordId` | `attendance.manual.update` | `{ checkInTime?, checkOutTime?, note? }` — **ít nhất 1 field** | 200 |
| POST | `/meetings/:meetingId/attendance/:recordId/invalidate` | `attendance.invalidate` | `{ reason (required, ≤1000) }` | 200 — giữ record, chỉ đánh dấu vô hiệu |

> Route `:recordId/status` khai TRƯỚC `:recordId` (route order).

### 10.2. Attendance từ camera cửa (Face Server) — tự động, đọc-only cho FE

Ghi nhận qua callback (mục 8.2) → tự tạo `attendance_records` nguồn `door_camera`. FE chỉ **đọc** qua `GET /meetings/:meetingId/attendance` (mục 9), không có API riêng để FE "trigger" check-in bằng camera.

> ⚠️ Theo audit UC-85: check-in từ Face Server **chưa** push realtime qua WebSocket — nếu FE muốn hiển thị "vừa check-in" ngay lập tức, hiện phải polling `GET /meetings/:meetingId/attendance`, không có event để subscribe.

### 10.3. Presence / Room Camera (occupancy)

File: `src/modules/presence/controllers/room-camera.controller.ts`

| Method | Path | Guard | Ghi chú |
|---|---|---|---|
| POST | `/room-camera/occupancy-snapshots` | Không JWT (device callback, auth qua token riêng) | Python Camera Service gửi occupancy event. 202 Accepted (xử lý async). **FE không gọi** endpoint này — chỉ đọc kết quả gián tiếp qua `rooms/:roomId/status` hoặc `present-attendees`. |

---

## 11. Recording

### 11.1. Recording Config

File: `src/modules/recording/controllers/recording-config.controller.ts`

| Method | Path | Quyền | Request |
|---|---|---|---|
| POST | `/meetings/:meetingId/recording-config` | `recording.config.create` | `{ enableAudio?, enableVideo?, enableTranscription?, videoSourceDeviceId? (uuid), audioSourceMode?, autoStart?, consentRequired?, retentionDays? (1-365) }` |
| GET | `/meetings/:meetingId/recording-config` | `recording.config.read` | — |
| PATCH | `/meetings/:meetingId/recording-config` | `recording.config.update` | Cùng field như create. **Khóa khi đang ghi** → 409 `RECORDING_IN_PROGRESS` |

### 11.2. Media Files

File: `src/modules/recording/controllers/media-files.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/meetings/:meetingId/media-files` | `recording.files.read` | `page, limit, fileType?` (CSV vd "video,audio") | list + meta |
| GET | `/media-files/:fileId` | `recording.files.read` | — | Metadata + `downloadUrl` (signed URL, short-lived) |
| GET | `/media-files/:fileId/playback` | `recording.files.play` | Hỗ trợ HTTP `Range` header | Stream nhị phân, 200 (full) hoặc 206 (partial content) |
| PATCH | `/media-files/:fileId/visibility` | `recording.files.manage` | `{ action: 'hide'|'soft_delete' (required), reason? (≤500) }` | Ẩn/xóa mềm — **giữ file vật lý** |
| GET | `/media-files/:fileId/secure-download` | Không JWT — token HMAC ký trong query `?token=` | — | File download trực tiếp / redirect 302 nếu storage ngoài (S3/Cloudinary). 403 nếu token sai/hết hạn |

> Dùng `GET /media-files/:fileId` để lấy `downloadUrl` trước, rồi mới gọi `secure-download` — không tự ghép URL tay.

---

## 12. Transcription (STT)

> **Phần này giữ nguyên nội dung đã verify kỹ trong `stt-feature-status-cho-fe.md` (đối chiếu trực tiếp `transcription.controller.ts`, `recording-session.controller.ts`, `transcript-segments.controller.ts`) — quan trọng nhất với FE vì luồng nhiều bước.**

### 12.1. Tóm tắt luồng

FE phải tự lấy audio (ghi âm hoặc chọn file), **upload file qua `multipart/form-data`**. BE **không** nhận streaming realtime, không nhận base64 JSON, không có WebSocket audio.

```
[FE ghi âm/chọn file audio]
        │  multipart/form-data, field "file"
        ▼
POST .../recording-sessions/audio-upload  → 201, trả recordingSessionId
        │
        ▼
POST .../transcription-jobs { recordingSessionId } → 202 ACCEPTED (không đợi kết quả)
        │  (BE queue job BullMQ, Whisper + Pyannote chạy nền — vài chục giây đến vài phút)
        ▼
FE poll GET .../transcription-jobs  hoặc  GET .../transcript
        │  status: processing → draft (xong) / failed
        ▼
[Hiển thị transcript, cho user sửa tay nếu confidence thấp]
```
**Không có endpoint chờ đồng bộ trả transcript ngay — FE bắt buộc phải polling** (khuyến nghị interval 3-5s). Cũng **chưa xác nhận có WebSocket event báo "xong"** — code chỉ thấy tạo in-app notification, không thấy emit WS riêng cho transcript.

### 12.2. Upload audio

**Chế độ 1 file (diarization — phổ biến nhất):**
```
POST /api/v1/meetings/:meetingId/recording-sessions/audio-upload
Content-Type: multipart/form-data
Quyền: transcript.create (Host/Organizer hoặc Admin)
Form field: file → 1 file audio (.wav/.mp3/.m4a...), tối đa 50MB (STORAGE_MAX_FILE_SIZE)
```
Response 201:
```json
{
  "success": true,
  "data": {
    "recordingSessionId": "uuid",
    "mediaFileId": "uuid",
    "fileName": "recording.wav",
    "fileSize": 52428800,
    "uploadedAt": "2026-07-14T10:30:00Z"
  }
}
```
BE tự chạy Whisper (speech→text) + Pyannote (diarization, tách giọng theo cụm âm — `speakerLabel: "unknown"`, chưa map ra người thật).

**Chế độ nhiều track (channel_zone — Phase 1, mỗi participant ghi riêng):**
```
1) POST /meetings/:meetingId/recording-sessions              { notes? }        → recordingSessionId (rỗng)
2) POST /meetings/:meetingId/recording-sessions/:sessionId/audio-tracks
   multipart "file", quyền recording.upload_track            → mediaFileId cho từng track
3) GET  /meetings/:meetingId/recording-sessions               quyền transcript.read
                                                              → list session + mediaFileCount
```
> ⚠️ Multi-track: Phase 1 (upload) hoạt động ổn, nhưng **Phase 2 (AI Worker xử lý riêng từng channel) vẫn đang hoàn thiện** — ưu tiên test/launch chế độ 1-file trước.

### 12.3. Tạo transcription job

```
POST /api/v1/meetings/:meetingId/transcription-jobs
Quyền: transcript.create
Body: {
  "recordingSessionId": "uuid",          // bắt buộc
  "language": "vi-VN",                   // optional, default vi-VN
  "speakerMappingMode": "diarization_only", // optional: diarization_only (1 file) | channel_zone (multi-track)
  "initialPrompt": "tên riêng/thuật ngữ cần STT nhận đúng", // optional, ≤1000
  "forceRerun": false
}
```
Response 202:
```json
{ "success": true, "data": { "jobId": "uuid", "meetingId": "uuid", "status": "queued", "transcriptStatus": "processing" } }
```
Nếu feature flag `TRANSCRIPTION_ENABLED=false` → **403** `"Tinh nang transcription dang bi tat"`. FE nên ẩn nút "Tạo transcript" hoặc báo lỗi rõ ràng khi gặp lỗi này.

### 12.4. Theo dõi & lấy kết quả

```
GET /api/v1/meetings/:meetingId/transcription-jobs           quyền transcript.read
GET /api/v1/meetings/:meetingId/transcript?includeSegments=true&page=1&limit=50   quyền transcript.read
```
- `includeSegments=false` (default): chỉ `cleanedText` — nhẹ, dùng preview.
- `includeSegments=true`: `segments[]` kèm timestamp — dùng cho view timeline/sửa tay. Phân trang tối đa 100/trang.

Response mẫu (rút gọn — xem file [response_result_transcription](response_result_transcription) trong repo để xem full):
```json
{
  "success": true,
  "data": {
    "transcriptId": "uuid", "meetingId": "uuid", "status": "draft",
    "language": "vi-VN", "versionNo": 1, "confidenceScore": 0.53,
    "cleanedText": "Toàn bộ nội dung transcript...",
    "segments": [
      { "segmentId": "seg-0000", "startMs": 1460, "endMs": 4580, "speakerLabel": "unknown",
        "userId": null, "text": "...", "confidence": 0.5582, "overlap": false,
        "lowConfidence": false, "manualReviewRequired": false }
    ],
    "generatedAt": "2026-06-29T10:39:50.065Z"
  },
  "meta": { "page": 1, "limit": 50, "total": 39 }
}
```
`status`: `processing → draft (xong) → reviewed (optional) → approved` (hoặc `failed`/`hidden`).

### 12.5. Sửa tay transcript (chỉ Host của meeting hoặc Admin)

| Method | Path | Dùng để |
|---|---|---|
| PATCH | `/transcripts/:transcriptId/segments` | Sửa từng câu (`text`, gán `speakerLabel`/`speakerUserId`), có `revisionNote` audit |
| PATCH | `/transcripts/:transcriptId/content` | Ghi đè toàn bộ `rawText`/`cleanedText` |
| PATCH | `/transcripts/:transcriptId/status` | Chuyển `draft→reviewed` hoặc `→approved` (chỉ 2 giá trị này qua API, còn lại hệ thống tự set) |

Service tự check thêm ngoài permission `transcript.update`: **chỉ Host hoặc Admin (BUSINESS_ADMIN/SYSTEM_ADMIN)** mới sửa được — FE cần ẩn nút Edit với user khác.

### 12.6. Giới hạn hiện tại (set kỳ vọng đúng cho user)

1. **Độ chính xác STT tiếng Việt còn thấp** (mẫu thật: `confidenceScore` ~0.53) — FE **nên highlight rõ** đoạn `lowConfidence`/`manualReviewRequired` (badge/màu cảnh báo), không hiển thị như kết quả chắc chắn đúng.
2. **`speakerLabel` mặc định `"unknown"`** — không tự nhận diện người nói theo danh tính thật; gán tên thật phải làm tay qua `PATCH .../segments` (`speakerUserId`).
3. **Chỉ xử lý theo lô (batch)**, không có STT trực tiếp khi đang họp (không mic streaming).
4. **Giới hạn file**: 50MB/track mặc định.
5. **Toàn bộ tính năng có thể bị tắt** qua `TRANSCRIPTION_ENABLED` env.

### 12.7. Checklist FE cho STT

- [ ] UI ghi âm/chọn file audio (≤50MB).
- [ ] Upload `multipart/form-data` → `audio-upload`.
- [ ] Có `recordingSessionId` → `POST transcription-jobs`.
- [ ] Polling `GET transcript` (hoặc `transcription-jobs`) tới khi `status !== processing`.
- [ ] Hiển thị `cleanedText` (preview) hoặc `segments[]` (timeline, có phân trang).
- [ ] Highlight `lowConfidence`/`manualReviewRequired`.
- [ ] Nếu Host/Admin: cho sửa segment/content, chuyển status `reviewed`/`approved`.
- [ ] Xử lý 403 (feature tắt) và 409 (chuyển status không hợp lệ, VD đã approved).
- [ ] Mọi request cần `Authorization: Bearer <jwt>` — không có endpoint STT public.

---

## 13. Minutes

File chính: `src/modules/minutes/controllers/minutes-list.controller.ts` (prefix `meeting-minutes`) + `src/modules/minutes/controllers/minutes.controller.ts` (tạo draft).

### 13.1. Tạo draft

| Method | Path | Quyền | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/meetings/:meetingId/minutes` | `meeting.minutes.create` | `CreateDraftMinutesDto` | `DraftMinutesResponseDto` (status `draft`) | 201 — Chỉ Host, meeting phải đang diễn ra hoặc đã kết thúc |

### 13.2. List / Detail / Update / Delete

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/meeting-minutes` | `meeting.minutes.read` | `page (≤20), limit, status? (draft\|published\|archived\|all), roomId?, meetingId?, from?, to?, q?, sortBy? (actual_start_time\|created_at), sortOrder?` | List — role-scoped (Manager thấy theo phòng ban, Admin thấy tất cả) |
| GET | `/meeting-minutes/search-by-person` | `meeting.minutes.search_by_person` | Query theo nhân sự | List liên quan đến 1 người |
| GET | `/meeting-minutes/:id` | `meeting.minutes.read` | — | Detail đầy đủ: `MinutesGeneralInfoDto`, `MinutesMainContentDto`, `MinutesAiSummaryDto`, `MinutesRelatedResourcesDto`, `attachments[]`, `permissions` (quyền hiện tại của user với minutes này) |
| PATCH | `/meeting-minutes/:id` | `meeting.minutes.update` | `{ versionNo (required — optimistic lock), title? (≤255), minutesContent? (≤20000), decisionsJson? (≤100 item), actionItemsJson? (≤100 item), aiSummary? }` | Chỉ sửa được khi còn `draft` |
| DELETE | `/meeting-minutes/:id` | `meeting.minutes.delete` | — | `{ deleted, minutesId, deletedAt, cascadedAttachmentCount }` — chỉ xóa được draft, cascade xóa attachment |
| POST | `/meeting-minutes/:id/issue` | `meeting.minutes.issue` | — | Chuyển `draft → published`, ghi `issuedBy/At`, gửi notification |

> ⚠️ **Không có field `visibilityLevel` để cấu hình quyền xem biên bản** (UC-136 MISSING) — mọi draft mới hiện chỉ set `PRIVATE` cứng, DTO update không nhận field này (gửi lên sẽ bị 400 do `forbidNonWhitelisted`). Nếu FE cần UI "chọn ai được xem biên bản", tính năng này **chưa có ở backend**.

### 13.3. Liên kết tài nguyên & Chia sẻ

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| PATCH | `/meeting-minutes/:id/link-resources` | `meeting.minutes.link_resources` | `{ recordingFileId?: uuid\|null, transcriptId?: uuid\|null }` | Gắn file ghi âm/transcript vào biên bản (validate cùng meeting + đúng loại file audio/video) |
| POST | `/meeting-minutes/:id/shares` | `meeting.minutes.share.create` | `CreateMinutesShareDto { userId }` | 201 — Cấp quyền đọc cho 1 user khác (**không** gửi email/notification khi share, xem mục 21) |
| GET | `/meeting-minutes/:id/shares` | `meeting.minutes.share.read` | — | List user đang được share |
| DELETE | `/meeting-minutes/:id/shares/:userId` | `meeting.minutes.share.delete` | — | Thu hồi quyền xem |

### 13.4. Xuất file (PDF/DOCX) — bất đồng bộ

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/meeting-minutes/:id/exports` | `meeting.minutes.export` | `{ format: 'pdf'\|'docx' (required), includeTranscript?, includeActionItems? }` | 202, `{ jobId }` — **poll qua `GET /background-jobs/:jobId`** (mục 18) để lấy `outputFileId`, rồi dùng `GET /media-files/:outputFileId` để lấy link download |

### 13.5. Tệp đính kèm

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/meeting-minutes/:minutesId/attachments` | `meeting.minutes.attachment.create` | multipart `file` | 201 |
| GET | `/meeting-minutes/:minutesId/attachments` | `meeting.minutes.attachment.read` | — | List + `meta: { total, maxCount }` |
| DELETE | `/meeting-minutes/:minutesId/attachments/:fileId` | `meeting.minutes.attachment.delete` | — | Soft-delete (chỉ Host/preparedBy) |

> Chi tiết từng file đính kèm (tên, size, `downloadUrl` signed) lấy qua `GET /media-files/:fileId` (mục 11.2) — không có route riêng `.../attachments/:fileId`, dùng chung route media-files.

---

## 14. Minutes AI Draft (AI Summarize) — ⚠️ WIP

> **Cảnh báo quan trọng cho FE**: Toàn bộ nhóm API này (AI tự động tóm tắt biên bản từ transcript) đang **trong quá trình phát triển (WIP)**, chưa production-ready, entity/DTO có thể còn thay đổi. FE có thể build UI đọc dữ liệu này nhưng **nên hiển thị rõ badge "AI — cần con người rà soát"**, và không nên coi output AI là kết quả cuối.

File: `src/modules/minutes/controllers/minutes-ai-draft.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/meetings/:meetingId/minutes/ai-draft-jobs` | `meeting.minutes.ai_draft.create` (tên hằng số, xem constants) | `{ transcriptId (required, uuid), language? (allowlist, default vi-VN), forceRerun? (default false) }` | 202, `{ jobId, meetingId, status }` — bất đồng bộ, poll qua `GET .../ai-draft-jobs` hoặc `GET /background-jobs/:jobId` |
| GET | `/meetings/:meetingId/minutes/ai-draft-jobs` | JWT (ownership Host/Admin check ở service) | — | List job (mới nhất trước) |
| GET | `/meetings/:meetingId/minutes/ai-draft-config` | JWT | — | `{ enabled: boolean, requireHumanReview: boolean }` — **chỉ trả 2 field an toàn này**, không lộ `provider/modelName/temperature/...` |

### 14.1. Cách đọc kết quả AI trong Minutes Detail

Sau khi job `completed`, kết quả nằm trong `GET /meeting-minutes/:id` (mục 13.2) ở field `aiSummary` + cờ `isAiGenerated: true`. Cấu trúc (đọc chung schema với phần sửa tay của Host — output AI cũ là tập con hợp lệ của schema mới):

```json
{
  "aiSummary": {
    "decisions": [ { "text": "...", "confidence": 0.8, "evidence": "đoạn transcript liên quan", "responsibleUserId": "uuid|null" } ],
    "actionItems": [ { "id": "uuid|optional", "task": "...", "owner": "...", "assigneeUserId": "uuid|null", "deadline": "ISO date|null", "priority": "high|medium|low", "confidence": 0.7 } ],
    "meta": { }
  },
  "isAiGenerated": true
}
```
Host có thể chỉnh tay TRỌN VẸN nội dung AI (không mất `confidence`/`evidence`) qua `PATCH /meeting-minutes/:id` field `aiSummary` — cùng schema.

### 14.2. Hiện trạng vận hành (theo `system_configs`, không đọc từ env)

- Mặc định `enabled=false`, `provider="mock"` — chạy demo được **không cần cài Ollama**, AI trả kết quả giả lập tức thời.
- Nếu bật `provider="self_hosted_llm"` (Ollama, model `qwen2.5:7b-instruct`) → cần hạ tầng riêng, xem `huong-dan-setup-be-cho-nhom.md` mục 6.
- Feature flag này **không** đổi qua API — phải sửa trực tiếp DB (`system_configs` key `ai.minutes_summary`). FE **không có** endpoint để tự bật/tắt tính năng AI cho tổ chức.

---

## 15. Notifications

File: `src/modules/notifications/notifications.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/meetings/:meetingId/invitations` | `notification.invite.send` | `{ channels: ('email'\|'in_app')[] (≥1, required), includeAgenda?, message? (≤1000) }` | 202 — **gửi lại thủ công**, không phải trigger chính (mời tự động đã chạy khi tạo meeting/thêm participant) |
| POST | `/meetings/:meetingId/reminders` | `notification.reminder.send` | `{ channels (≥1, required), reminderType: 'manual'\|'scheduled' (required), sendAt? (ISO8601, cho scheduled) }` | 202 — ⚠️ xem mục 21: `scheduled` chỉ lưu record, **chưa** có cron thật gửi đi |
| POST | `/meetings/:meetingId/cancellation-notifications` | `notification.cancellation.send` | `{ reason? (≤1000), channels (≥1, required) }` | 202 — resend thông báo hủy (thông báo hủy chính đã tự gửi khi cancel) |
| POST | `/meetings/:meetingId/minutes/distributions` | `minutes.distribute` | `{ minutesId (required), recipientScope: 'participants'\|'custom' (required), recipientUserIds? (uuid[], khi custom), channels (≥1, required), message? }` | 202 — ⚠️ xem mục 21: hiện chỉ gửi IN_APP, **chưa gửi email** dù chọn channel `email` |
| GET | `/notifications` | `notification.read.self` | `page? (default 1), limit? (default 20, max 100)` | List thông báo của user hiện tại |
| GET | `/notifications/:id` | `notification.read.self` | — | Detail |

> ⚠️ **Không có `PATCH /notifications/:id/read`** — đây là quyết định sản phẩm chủ động (Product Owner từ chối thêm bảng theo dõi đã đọc), không phải thiếu sót. FE **không nên build UI "đánh dấu đã đọc"** cho tới khi có yêu cầu mới rõ ràng — hiện tại inbox chỉ có list + detail, không có trạng thái đọc/chưa đọc.

---

## 16. Analytics

Tất cả route dưới `analytics/*`, quyền theo nhóm (`analytics.meeting.read`, `analytics.room.read`, `analytics.attendance.read`), query đều hỗ trợ khoảng thời gian (`from/to` hoặc `preset`).

| Method | Path | Quyền | Query chính | Response (tóm tắt) |
|---|---|---|---|---|
| GET | `/analytics/dashboard/overview` | `analytics.overview.read` | `from?, to?` | 8 KPI tổng hợp + trend (dashboard tổng quan hệ thống) |
| GET | `/analytics/meetings/average-duration` | `analytics.meeting.read` | `from?, to?, granularity? (day\|week\|month\|quarter), departmentIds?, roomId?` | `summary { plannedAverageMinutes, actualAverageMinutes, completedMeetingCount }` + `series[]` |
| GET | `/analytics/meetings/cancel-rate` | `analytics.meeting.read` | `preset? (month_current\|month_previous\|quarter\|custom), granularity?, departmentIds?, roomId?, organizerEmail?` | `totalMeetingCount, cancelledCount, cancelRate` + `series[]` + `topOrganizers[]` + `topDepartments[]` |
| GET | `/analytics/meetings/count-by-period` | `analytics.meeting.read` | `from?, to?, granularity? (week\|month), departmentId?, roomId?, meetingType?` | `total` + `series: { period, count }[]` |
| GET | `/analytics/meetings/status-breakdown` | `analytics.meeting.read` | `preset?, from?, to?, departmentIds?` | `total` + `items: { status, count, percentage }[]` |
| GET | `/analytics/rooms/no-show-rate` | `analytics.room.read` | `from?, to?` + pagination | `noShowCount, totalBookings, noShowRate` + `ranking` (theo phòng/dept/organizer) |
| GET | `/analytics/attendance/on-time-rate` | `analytics.attendance.read` | `from?, to?, graceMinutes?` | `onTimeCount, lateCount, absentCount, onTimeRate` + `trend[]` + `lateByDepartment[]` |
| GET | `/analytics/attendance/on-time-rate/users/:userId/late-history` | `analytics.attendance.read` | `from?, to?` | `user` + `lateMeetings[]` |
| GET | `/analytics/rooms/dashboard` | `analytics.room.read` | `from?, to?` | `summary { reservationUtilizationRate, roomOccupancyRate, totalBookedHours, actualUsedHours }` + `rooms[]` + `trend[]` |
| GET | `/analytics/rooms/:roomId/detail` | `analytics.room.read` | `from?, to?` | `room`, `bookedHours, actualHours`, `heatmap[]`, `meetings[]` |
| GET | `/analytics/rooms/usage-history` | `analytics.room.read` | `preset? (day\|week\|month\|custom), from?, to?, roomId?, siteName?, areaName?, sortBy?, sortOrder?, page?, limit?` | List session sử dụng phòng + 5 metric tổng hợp |
| GET | `/analytics/rooms/utilization-rate` | `analytics.room.read` | `preset?, comparisonMode? (previous_period\|same_period_last_year\|custom), comparisonFrom?, comparisonTo?, roomId?, granularity?` | So sánh tỷ lệ sử dụng phòng giữa 2 kỳ + `trend[]` |

---

## 17. Reports (Export)

Bất đồng bộ — tạo job, poll qua `background-jobs`, lấy file qua `media-files`.

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| POST | `/reports/meeting-activity/exports` | `report.meeting_activity.export` | `{ from (required, ISO date), to (required), format: 'pdf'\|'xlsx' (required), scope? { departmentId?, roomId?, organizerId? }, delivery? ('download', default) }` | 202, `{ jobId }` |
| POST | `/reports/room-utilization/exports` | `report.room_utilization.export` | `{ from (required), to (required), format: 'pdf'\|'xlsx'\|'csv' (required), scope? { roomId? }, delivery? }` | 202, `{ jobId }` |

**Luồng chuẩn cho mọi export (report + minutes export ở mục 13.4):**
```
POST .../exports  → 202 { jobId }
      ↓
GET /background-jobs/:jobId  → poll tới khi status = completed / failed
      ↓ (nếu completed, có outputFileId)
GET /media-files/:outputFileId  → lấy downloadUrl (signed)
```

---

## 18. Administration

File: `src/modules/administration/controllers/background-jobs.controller.ts`, `audit-logs.controller.ts`

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|
| GET | `/background-jobs/:id` | JWT (check ownership hoặc admin ở service, không cần permission riêng) | — | `{ jobId, jobType, status: queued\|scheduled\|running\|completed\|failed\|cancelled\|retrying, relatedEntityType?, relatedEntityId?, retryCount, scheduledAt?, startedAt?, completedAt?, errorMessage? (khi failed), result? (khi completed), outputFileId? }` — 403 nếu không phải chủ job/admin, 404 nếu không tồn tại |
| GET | `/audit-logs` | `audit.system.read` (thực tế: **chỉ SYSTEM_ADMIN**) | `page, limit, from?, to?, userId?, actionType? (≤80), entityType? (≤80), severity? (info\|warning\|error\|critical)` | List, sort giảm dần theo `created_at` |

---

## 19. WebSocket Realtime

Xem mục [0.6](#06-websocket) để biết hiện trạng thật (chỉ có `ivss:subscribe`/`ivss:unsubscribe`). Nếu FE cần realtime update meeting/room/notification, hiện tại **phải polling REST** — chưa có event tương ứng ở backend, kể cả khi tài liệu định hướng ban đầu (`CLAUDE.md`) có mô tả các tên event dự kiến (`meeting.status.updated`, `room.status.updated`, `notification.created`...).

---

## 20. Ngoài phạm vi core

Các module sau tồn tại trong code nhưng **không nằm trong 158 use case chính thức** của hệ thống — chỉ build UI nếu có yêu cầu riêng, không phải phần bắt buộc của "Smart Meeting Room":

- **ANPR** (nhận diện biển số xe): `GET/POST /anpr/vehicle-registrations`, `/anpr/admin/*`, webhook `POST /internal/ivss/vehicle-events`.
- **IVSS** (tích hợp camera trung tâm, optional theo `CLAUDE.md`): `GET /ivss/health`, `GET /ivss/meetings/:meetingId/presence/report`, webhook `/internal/ivss/*`.
- **Dev-only**: `POST /dev/test-mail`, `/dev/test-mail-verify` — chỉ chạy khi `NODE_ENV=development`, không tồn tại ở production.

---

## 21. Bug / giới hạn đã biết

> Danh sách này giúp FE **không mất thời gian debug phía mình** khi gặp hành vi "lạ" — đây là hành vi thật của backend hiện tại (đối chiếu `UC158_AUDIT.md` + ghi nhớ nội bộ team), không phải lỗi tích hợp của FE.

| # | Vấn đề | Ảnh hưởng tới FE |
|---|---|---|
| 1 | `GET /rooms/:roomId/status` trả `noShowStatus: null`, `noShowCase: null`, `releaseHistory: []` cứng | Không hiển thị được chiều no-show trong màn hình trạng thái phòng realtime — phải lấy riêng qua `GET /no-show-cases?roomId=` |
| 2 | Early-vacancy chỉ đánh dấu flag `early_empty`, không tự release phòng/booking | UI "phòng đã được tự giải phóng sớm" sẽ sai nếu ngầm giả định phòng đã trống — cần kiểm tra `room-bookings` riêng |
| 3 | `bookingType=ad_hoc` là dead code, không có endpoint "đặt phòng ngay" | Không build nút "Đặt ngay" dựa trên giá trị enum này |
| 4 | Reminder `scheduled` (mục 15) chỉ ghi record, cron gửi thật là no-op | Nếu FE hiển thị "đã lên lịch nhắc" — nhắc đó **sẽ không được gửi** tự động, chỉ gửi được qua `reminderType=manual` |
| 5 | Distribute minutes (`minutes.distribute`) chưa gửi email dù chọn channel `email` | Chỉ tạo thông báo IN_APP thực tế; đừng thông báo cho user "email đã được gửi" |
| 6 | `PATCH /notifications/:id/read` không tồn tại (quyết định chủ động của PO) | Không build UI đánh dấu đã đọc cho tới khi có yêu cầu mới |
| 7 | Minutes: không có field `visibilityLevel` khả chỉnh — luôn `PRIVATE` | Không build UI "chọn người được xem biên bản" |
| 8 | Face check-in (cửa) không push WebSocket | Màn hình chờ check-in phải polling `GET .../attendance`, không subscribe được event |
| 9 | Cảnh báo end-time conflict chỉ gửi tới Host, chưa gửi Room Admin | Nếu build UI cảnh báo cho Room Admin, dữ liệu sẽ không tới nơi đó qua notification — cần hỏi lại BE |
| 10 | Multi-track STT (channel_zone) — Phase 2 AI Worker riêng từng channel chưa hoàn thiện | Ưu tiên launch chế độ 1-file (diarization_only) trước |
| 11 | AI Minutes Draft toàn bộ nhóm API — WIP, entity có thể đổi | Không launch UI AI summary cho user cuối tới khi có xác nhận riêng |
| 12 | Recording video (IP camera) lưu **local**, chưa phải S3 dù một số spec cũ nhắc | Không giả định `downloadUrl` luôn là link S3/CDN — vẫn phải qua `secure-download`/`playback` như tài liệu |
| 13 | Role `INTERNAL_USER` không tồn tại thật trong DB (chỉ còn sót trong vài migration cũ) | Nếu thấy giá trị này ở đâu trong response cũ/seed — bỏ qua, không map UI theo role này |

---

## 22. Checklist tổng hợp cho FE

- [ ] Không có Swagger — dùng tài liệu này làm nguồn tham chiếu chính, xác nhận lại với BE khi cần field chưa chắc.
- [ ] Login lấy `accessToken`/`refreshToken`, gắn `Authorization: Bearer` cho mọi call trừ health-check/device-callback.
- [ ] Lấy permission của user (qua `/auth/me`) để ẩn/hiện nút bấm thay vì hard-code theo role.
- [ ] Mọi list API dùng chung convention `page/limit/sortBy/sortOrder` + `meta.totalPages`.
- [ ] Với API trả 202 (STT job, AI draft job, export report/minutes) — **bắt buộc polling**, không có callback/WebSocket thay thế.
- [ ] Đọc kỹ mục 21 trước khi báo bug cho BE — nhiều hành vi "thiếu" là đã biết, không phải lỗi mới.
- [ ] Với upload file (audio STT, avatar, minutes attachment) — luôn `multipart/form-data`, kiểm tra giới hạn size tương ứng (STT 50MB, avatar 5MB).
- [ ] Không build UI cho: đặt phòng ad-hoc, đánh dấu đã đọc notification, chọn visibility biên bản, WebSocket cho meeting/room/notification status — các phần này chưa tồn tại ở backend.
