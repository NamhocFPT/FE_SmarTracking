# Intelligent Meeting Lifecycle Management System - Database v3.2 Compact

**Ngày thiết kế gốc:** 2026-05-22
**Ngày cập nhật bản rút gọn:** 2026-05-27
**Database:** PostgreSQL
**Primary key:** UUID cho toàn bộ table
**Số lượng table:** 39
**Tên bản:** Database v3.2 Compact - rút gọn từ v3.1 Balanced 49 tables

## Mục tiêu thiết kế
Bản v3.2 Compact xoá các bảng mà nhóm quyết định chưa cần ở giai đoạn capstone, đồng thời chuyển dữ liệu cần thiết sang bảng lõi bằng `jsonb`, cột snapshot hoặc bảng event/job tổng quát. Mục tiêu là giảm độ phức tạp database nhưng không làm gãy các nghiệp vụ chính: account, RBAC, meeting lifecycle, booking phòng, realtime room status, IoT/camera/mic, attendance, recording, transcript, minutes, notification, reporting và audit.

## Các bảng đã xoá theo yêu cầu
- `user_sessions`
- `password_reset_requests`
- `schedule_conflicts`
- `room_seats`
- `equipment_assignments`
- `meeting_action_items`
- `documents`
- `notification_recipients`
- `report_exports`
- `system_policies`

## Điều chỉnh quan trọng sau khi xoá bảng
- Không còn `user_sessions`: quản lý token/session nên xử lý ở tầng JWT/Redis nếu cần; `audit_logs` vẫn lưu login/logout/security event.
- Không còn `password_reset_requests`: OTP reset mật khẩu nên lưu Redis/Cache TTL; `users.must_change_password`, `users.password_updated_at`, `users.account_status` và `audit_logs` giữ trạng thái cần thiết.
- Không còn `schedule_conflicts`: conflict được tính động từ `meetings`, `room_bookings`, `meeting_participants`; snapshot kết quả nằm trong `meeting_requests.conflict_summary_json`.
- Không còn `room_seats`: sơ đồ ghế/mic rút gọn vào `rooms.layout_json`; channel/segment lưu `seat_code_snapshot` và `room_zone_label` thay vì FK.
- Không còn `equipment_assignments`: trạng thái phân bổ hiện tại nằm trong `equipments.current_room_id`, `assigned_by`, `assigned_at`, `installed_at`, `assignment_note`; lịch sử chi tiết có thể tra bằng `audit_logs` nếu cần.
- Không còn `meeting_action_items`: action items nằm trong `meeting_minutes.action_items_json`; nhắc việc đơn giản dùng `notifications` hoặc `background_jobs` payload.
- Không còn `documents`: file tài liệu/attachment/export lưu trực tiếp trong `media_files`; AI Document chỉ để feature flag/cấu hình ở `system_configs` nếu sau này phát triển.
- Không còn `notification_recipients`: recipient tracking rút gọn vào các cột JSON và trạng thái tổng hợp trong `notifications`.
- Không còn `report_exports`: export report/minutes đi qua `background_jobs`; file output nằm ở `media_files` qua `output_file_id` hoặc `related_entity_type`.
- Không còn `system_policies`: policy versioned được rút gọn vào `system_configs.config_json`, `version_no`, và snapshot vào bảng nghiệp vụ như `recording_configs.policy_snapshot_json`.

## Quy ước chung
- **uuid:** Tất cả khóa chính dùng `uuid DEFAULT gen_random_uuid()`. Cần bật extension `pgcrypto` trong PostgreSQL.
- **time:** Dùng `timestamptz` cho lịch họp, booking và realtime event để tránh lỗi múi giờ.
- **jsonb:** Dùng cho payload linh hoạt như MQTT, layout phòng, conflict snapshot, transcript segments, notification recipients, report filter và metadata thiết bị.
- **soft delete:** Các bảng nghiệp vụ có dữ liệu phát sinh nên dùng `deleted_at` để xóa mềm.
- **enum:** Các cột trạng thái dùng `varchar` + enum/check ở tầng NestJS/TypeORM để dễ migration trong capstone.

## Danh sách bảng theo nhóm
### 01. Identity & Access Control
- `departments`
- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `face_profiles`
### 02. Meeting Core & Scheduling
- `meetings`
- `meeting_requests`
- `meeting_participants`
- `meeting_external_participants`
- `meeting_agendas`
- `meeting_recurrence_rules`
- `meeting_notes`
- `meeting_events`
### 03. Room & Utilization
- `rooms`
- `room_bookings`
- `room_booking_usages`
- `no_show_cases`
- `room_events`
### 04. Equipment, IoT & Capture Agent
- `equipments`
- `iot_devices`
- `device_user_mappings`
- `iot_device_events`
- `capture_sessions`
- `capture_session_channels`
### 05. Attendance & Presence
- `attendance_records`
- `attendance_events`
- `presence_snapshots`
### 06. Recording, Media & Transcription
- `recording_configs`
- `recording_sessions`
- `recording_segments`
- `media_files`
- `transcripts`
### 07. Minutes & Knowledge Management
- `meeting_minutes`
### 08. Notification, Reporting & Administration
- `notifications`
- `background_jobs`
- `system_configs`
- `audit_logs`

## Coverage theo Feature Table sau rút gọn
- **Authentication & Authorization:** users, roles, permissions, user_roles, role_permissions, audit_logs, system_configs
- **Account Management:** users, departments, face_profiles, device_user_mappings, media_files, background_jobs, audit_logs
- **Meeting Management:** meetings, meeting_requests, meeting_participants, meeting_external_participants, meeting_agendas, meeting_recurrence_rules, meeting_notes, meeting_events, room_bookings, recording_configs
- **Room Utilization Management:** rooms, room_bookings, room_booking_usages, no_show_cases, room_events, system_configs, background_jobs
- **In-Meeting Management:** meetings, meeting_requests, meeting_events, meeting_notes, attendance_records, presence_snapshots, notifications
- **Meeting Transcription Management:** recording_sessions, media_files, background_jobs, transcripts, system_configs
- **Room Management:** rooms, iot_devices, equipments, room_events
- **Equipment Management:** equipments, iot_devices, device_user_mappings, iot_device_events, audit_logs
- **Scheduling Management:** meeting_requests, room_bookings, meetings, meeting_participants
- **Attendance & Presence Management:** attendance_records, attendance_events, presence_snapshots, face_profiles, device_user_mappings, media_files, notifications
- **Recording Management:** recording_configs, recording_sessions, recording_segments, media_files, capture_sessions, capture_session_channels, iot_devices
- **Minutes & Knowledge Management:** meeting_minutes, media_files, transcripts, recording_sessions
- **Notification and Reporting:** notifications, background_jobs, media_files
- **Analytics & Administration:** source tables + audit_logs, background_jobs, system_configs; dashboard nên tính bằng SQL view/materialized view thay vì thêm bảng mới

## Chi tiết bảng
### 1. `departments`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Lưu cấu trúc phòng ban để quản lý tài khoản, lọc nhân sự, phân quyền theo tổ chức và phục vụ routing phê duyệt.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính của phòng ban. |
| `department_code` | `varchar(50) UNIQUE` | Có | Mã phòng ban ổn định dùng trong import Excel, API và báo cáo. |
| `department_name` | `varchar(150) NOT NULL` | Có | Tên phòng ban hiển thị cho người dùng. |
| `parent_department_id` | `uuid FK -> departments.id` | Không | Phòng ban cha nếu tổ chức có nhiều cấp. |
| `manager_user_id` | `uuid FK -> users.id` | Không | Người quản lý chính của phòng ban. |
| `description` | `text` | Không | Mô tả nghiệp vụ của phòng ban. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | Cho biết phòng ban còn được sử dụng hay không. |
| `created_by` | `uuid FK -> users.id` | Không | Người tạo bản ghi. |
| `updated_by` | `uuid FK -> users.id` | Không | Người cập nhật gần nhất. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm phòng ban khi không còn sử dụng. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_departments_code ON departments(department_code)`
- `INDEX ix_departments_parent ON departments(parent_department_id)`
- `INDEX ix_departments_manager ON departments(manager_user_id)`
- `INDEX ix_departments_active ON departments(is_active)`

### 2. `users`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Lưu tài khoản nhân sự nội bộ, thông tin đăng nhập, trạng thái tài khoản và hồ sơ cơ bản.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính của user. |
| `employee_code` | `varchar(50) UNIQUE nullable` | Không | Mã nhân viên dùng cho import Excel, tìm kiếm và tích hợp. |
| `username` | `varchar(100) UNIQUE` | Có | Tên đăng nhập nội bộ. |
| `email` | `varchar(255) UNIQUE` | Có | Email đăng nhập, nhận OTP, thông báo họp và lời mời. |
| `password_hash` | `varchar(255) NOT NULL` | Có | Mật khẩu đã hash bằng bcrypt/argon2, không lưu raw password. |
| `full_name` | `varchar(255) NOT NULL` | Có | Họ tên hiển thị. |
| `phone_number` | `varchar(30)` | Không | Số liên hệ. |
| `avatar_url` | `text` | Không | URL ảnh đại diện hoặc media file public path. |
| `department_id` | `uuid FK -> departments.id` | Không | Phòng ban hiện tại của nhân sự. |
| `direct_manager_id` | `uuid FK -> users.id` | Không | Quản lý trực tiếp, hỗ trợ approval/routing. |
| `position_title` | `varchar(150)` | Không | Chức danh công việc. |
| `employment_status` | `varchar(30) NOT NULL DEFAULT 'active'` | Có | Trạng thái nhân sự: active, probation, resigned, transferred. |
| `account_status` | `varchar(30) NOT NULL DEFAULT 'active'` | Có | Trạng thái tài khoản: active, inactive, locked, pending_reset. |
| `must_change_password` | `boolean NOT NULL DEFAULT false` | Có | Cờ bắt buộc đổi mật khẩu ở lần đăng nhập kế tiếp. |
| `password_updated_at` | `timestamptz` | Không | Lần cập nhật mật khẩu gần nhất; thay cho việc cần bảng reset password riêng. |
| `failed_login_count` | `integer NOT NULL DEFAULT 0` | Có | Số lần đăng nhập sai gần đây để hỗ trợ khóa tài khoản/rate limit. |
| `last_login_at` | `timestamptz` | Không | Lần đăng nhập gần nhất. |
| `locked_until` | `timestamptz` | Không | Thời điểm hết khóa tạm thời nếu bị khóa do bảo mật. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo tài khoản. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm tài khoản nếu đã phát sinh dữ liệu. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_users_email ON users(lower(email))`
- `UNIQUE INDEX ux_users_username ON users(lower(username))`
- `UNIQUE INDEX ux_users_employee_code ON users(employee_code) WHERE employee_code IS NOT NULL`
- `INDEX ix_users_department ON users(department_id)`
- `INDEX ix_users_account_status ON users(account_status)`
- `INDEX ix_users_full_name ON users(full_name)`

**Ghi chú:**
- Không còn bảng password_reset_requests; OTP runtime nên lưu Redis/Cache TTL, còn trạng thái account được phản ánh qua account_status, must_change_password, password_updated_at và audit_logs.

### 3. `roles`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Định nghĩa vai trò nghiệp vụ dùng cho RBAC như User, Manager, Admin, System Operator.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính role. |
| `role_code` | `varchar(50) UNIQUE` | Có | Mã vai trò dùng trong backend guard. |
| `role_name` | `varchar(100) NOT NULL` | Có | Tên vai trò hiển thị. |
| `description` | `text` | Không | Mô tả phạm vi vai trò. |
| `is_system_role` | `boolean NOT NULL DEFAULT false` | Có | Đánh dấu role hệ thống không nên xóa. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | Role còn hiệu lực hay không. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_roles_code ON roles(role_code)`
- `INDEX ix_roles_active ON roles(is_active)`

### 4. `permissions`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Lưu quyền chi tiết theo module/action để RBAC có thể mở rộng khi Feature Table thay đổi.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính permission. |
| `permission_code` | `varchar(120) UNIQUE` | Có | Mã quyền dạng module.action, ví dụ meeting.create, room.release. |
| `permission_name` | `varchar(150) NOT NULL` | Có | Tên quyền dễ hiểu. |
| `module_code` | `varchar(80) NOT NULL` | Có | Nhóm chức năng chứa quyền. |
| `action_code` | `varchar(80) NOT NULL` | Có | Hành động cụ thể: create, update, delete, approve, export. |
| `description` | `text` | Không | Giải thích ý nghĩa quyền. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | Quyền còn sử dụng hay không. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_permissions_code ON permissions(permission_code)`
- `INDEX ix_permissions_module ON permissions(module_code)`
- `INDEX ix_permissions_action ON permissions(action_code)`

### 5. `user_roles`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Bảng nối nhiều-nhiều giữa users và roles, hỗ trợ một người có nhiều vai trò.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính user role. |
| `user_id` | `uuid FK -> users.id` | Có | User được gán role. |
| `role_id` | `uuid FK -> roles.id` | Có | Role được gán. |
| `assigned_by` | `uuid FK -> users.id` | Không | Người gán role. |
| `assigned_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm gán. |
| `expired_at` | `timestamptz` | Không | Thời điểm hết hiệu lực nếu role tạm thời. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | Gán quyền còn hiệu lực hay không. |
| `metadata_json` | `jsonb` | Không | Ghi chú hoặc lý do gán role. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_user_roles_active ON user_roles(user_id, role_id) WHERE is_active = true`
- `INDEX ix_user_roles_user ON user_roles(user_id)`
- `INDEX ix_user_roles_role ON user_roles(role_id)`

### 6. `role_permissions`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Bảng nối roles và permissions để cấu hình RBAC chi tiết.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính role permission. |
| `role_id` | `uuid FK -> roles.id` | Có | Role được cấp quyền. |
| `permission_id` | `uuid FK -> permissions.id` | Có | Quyền được gán cho role. |
| `granted_by` | `uuid FK -> users.id` | Không | Người cấp quyền. |
| `granted_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cấp quyền. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_role_permissions_pair ON role_permissions(role_id, permission_id)`
- `INDEX ix_role_permissions_role ON role_permissions(role_id)`
- `INDEX ix_role_permissions_permission ON role_permissions(permission_id)`

### 7. `face_profiles`
**Nhóm:** 01. Identity & Access Control
**Mục đích:** Lưu hồ sơ khuôn mặt đã đăng ký của nhân sự để hỗ trợ điểm danh camera và cảnh báo khuôn mặt lạ.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính face profile. |
| `user_id` | `uuid FK -> users.id` | Có | User sở hữu hồ sơ khuôn mặt. |
| `profile_code` | `varchar(80) UNIQUE` | Có | Mã hồ sơ khuôn mặt. |
| `status` | `varchar(30) NOT NULL DEFAULT 'pending_review'` | Có | Trạng thái: active, pending_review, disabled, revoked. |
| `consent_at` | `timestamptz` | Không | Thời điểm ghi nhận consent. |
| `model_version` | `varchar(80)` | Không | Phiên bản model/SDK nhận diện nếu có. |
| `primary_image_file_id` | `uuid FK -> media_files.id` | Không | Ảnh đại diện chính lưu trong media_files. |
| `embedding_storage_key` | `text` | Không | Đường dẫn vector/embedding trong storage nếu có. |
| `quality_score` | `numeric(5,2)` | Không | Điểm chất lượng hồ sơ khuôn mặt. |
| `sample_count` | `integer NOT NULL DEFAULT 0` | Có | Số mẫu ảnh đã thu thập; ảnh mẫu lưu dạng media_files liên kết face_profile. |
| `enrolled_by` | `uuid FK -> users.id` | Không | Người đăng ký/thu thập hồ sơ. |
| `enrolled_at` | `timestamptz` | Không | Thời điểm đăng ký. |
| `last_updated_at` | `timestamptz` | Không | Lần cập nhật mẫu gần nhất. |
| `metadata_json` | `jsonb` | Không | Dữ liệu kỹ thuật: pose, lighting, camera, threshold. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm hồ sơ khuôn mặt. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_face_profiles_code ON face_profiles(profile_code)`
- `UNIQUE INDEX ux_face_profiles_user_active ON face_profiles(user_id) WHERE status = 'active' AND deleted_at IS NULL`
- `INDEX ix_face_profiles_user ON face_profiles(user_id)`
- `INDEX ix_face_profiles_status ON face_profiles(status)`
- `INDEX ix_face_profiles_primary_image ON face_profiles(primary_image_file_id)`

### 8. `meetings`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Bảng lõi của vòng đời cuộc họp: tạo, cập nhật, hủy, bắt đầu/kết thúc, ad-hoc, định kỳ và liên kết phòng.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính meeting. |
| `meeting_code` | `varchar(80) UNIQUE` | Có | Mã cuộc họp hiển thị và tra cứu. |
| `title` | `varchar(255) NOT NULL` | Có | Tiêu đề cuộc họp. |
| `description` | `text` | Không | Mô tả nội dung cuộc họp. |
| `organizer_id` | `uuid FK -> users.id` | Có | Người tạo/tổ chức cuộc họp. |
| `host_id` | `uuid FK -> users.id` | Không | Người chủ trì thực tế. |
| `room_id` | `uuid FK -> rooms.id` | Không | Phòng chính được gán sau khi booking được xác nhận. |
| `meeting_type` | `varchar(30) NOT NULL DEFAULT 'normal'` | Có | Loại cuộc họp: normal, training, interview, emergency. |
| `meeting_mode` | `varchar(30) NOT NULL DEFAULT 'offline'` | Có | Hình thức: offline, online, hybrid. |
| `priority` | `varchar(20) NOT NULL DEFAULT 'normal'` | Có | Mức ưu tiên. |
| `status` | `varchar(30) NOT NULL DEFAULT 'draft'` | Có | Trạng thái: draft, pending_approval, scheduled, in_progress, completed, cancelled. |
| `visibility_level` | `varchar(30) NOT NULL DEFAULT 'internal'` | Có | Mức hiển thị: private, internal, department, public. |
| `start_time` | `timestamptz NOT NULL` | Có | Thời gian bắt đầu theo kế hoạch. |
| `end_time` | `timestamptz NOT NULL` | Có | Thời gian kết thúc theo kế hoạch. |
| `actual_start_time` | `timestamptz` | Không | Thời gian bắt đầu thực tế. |
| `actual_end_time` | `timestamptz` | Không | Thời gian kết thúc thực tế. |
| `timezone` | `varchar(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'` | Có | Múi giờ hiển thị lịch. |
| `expected_attendee_count` | `integer` | Không | Số người dự kiến, dùng gợi ý phòng. |
| `recurrence_rule_id` | `uuid FK -> meeting_recurrence_rules.id` | Không | Rule định kỳ nếu là chuỗi họp. |
| `parent_meeting_id` | `uuid FK -> meetings.id` | Không | Meeting cha nếu đây là occurrence/ngoại lệ. |
| `cancellation_reason` | `text` | Không | Lý do hủy. |
| `created_by` | `uuid FK -> users.id` | Không | Người tạo. |
| `updated_by` | `uuid FK -> users.id` | Không | Người cập nhật. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm meeting. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_meetings_code ON meetings(meeting_code)`
- `INDEX ix_meetings_organizer ON meetings(organizer_id)`
- `INDEX ix_meetings_host ON meetings(host_id)`
- `INDEX ix_meetings_room ON meetings(room_id)`
- `INDEX ix_meetings_status ON meetings(status)`
- `INDEX ix_meetings_time ON meetings(start_time, end_time)`
- `INDEX ix_meetings_parent ON meetings(parent_meeting_id)`

**Ghi chú:**
- Do schedule_conflicts bị xoá, conflict nên kiểm tra bằng service từ meetings, room_bookings và meeting_participants; snapshot kết quả lưu trong meeting_requests.conflict_summary_json nếu cần.

### 9. `meeting_requests`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu yêu cầu cần phê duyệt hoặc áp dụng thay đổi: tạo họp, đổi giờ, đổi phòng, hủy, gia hạn, đặt phòng.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính request. |
| `request_code` | `varchar(80) UNIQUE` | Có | Mã yêu cầu để tracking. |
| `meeting_id` | `uuid FK -> meetings.id` | Không | Meeting liên quan; null nếu là yêu cầu tạo meeting mới. |
| `request_type` | `varchar(40) NOT NULL` | Có | create_meeting, update_time, update_room, cancel_meeting, extend_meeting, book_room. |
| `requested_by` | `uuid FK -> users.id` | Có | Người tạo yêu cầu. |
| `requested_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo yêu cầu. |
| `target_room_id` | `uuid FK -> rooms.id` | Không | Phòng mục tiêu nếu request liên quan đến booking/đổi phòng. |
| `requested_start_time` | `timestamptz` | Không | Thời gian bắt đầu mong muốn. |
| `requested_end_time` | `timestamptz` | Không | Thời gian kết thúc mong muốn. |
| `approval_mode` | `varchar(30) NOT NULL DEFAULT 'auto'` | Có | auto, manual, mixed. |
| `approval_status` | `varchar(30) NOT NULL DEFAULT 'pending'` | Có | pending, approved, rejected, applied, cancelled. |
| `conflict_check_status` | `varchar(30) NOT NULL DEFAULT 'not_checked'` | Có | not_checked, clear, warning, blocked; thay cho bảng schedule_conflicts. |
| `conflict_checked_at` | `timestamptz` | Không | Thời điểm backend kiểm tra conflict. |
| `conflict_summary_json` | `jsonb` | Không | Snapshot conflict phát hiện: room overlap, participant overlap, policy block. |
| `decision_by` | `uuid FK -> users.id` | Không | Người/manager quyết định. |
| `decision_at` | `timestamptz` | Không | Thời điểm quyết định. |
| `rejection_reason` | `text` | Không | Lý do từ chối. |
| `request_payload_json` | `jsonb NOT NULL DEFAULT '{}'::jsonb` | Có | Snapshot toàn bộ payload để audit khi meeting thay đổi về sau. |
| `rule_snapshot_json` | `jsonb` | Không | Snapshot rule kiểm tra phòng/lịch/approval tại thời điểm request. |
| `applied_at` | `timestamptz` | Không | Thời điểm request đã được áp dụng vào meeting/booking. |
| `notes` | `text` | Không | Ghi chú xử lý. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_meeting_requests_code ON meeting_requests(request_code)`
- `INDEX ix_meeting_requests_meeting ON meeting_requests(meeting_id)`
- `INDEX ix_meeting_requests_requested_by ON meeting_requests(requested_by)`
- `INDEX ix_meeting_requests_status ON meeting_requests(approval_status)`
- `INDEX ix_meeting_requests_type ON meeting_requests(request_type)`
- `INDEX ix_meeting_requests_time ON meeting_requests(requested_start_time, requested_end_time)`
- `INDEX ix_meeting_requests_conflict_status ON meeting_requests(conflict_check_status)`
- `INDEX ix_meeting_requests_conflict_json ON meeting_requests USING GIN(conflict_summary_json)`

### 10. `meeting_participants`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu thành viên nội bộ của cuộc họp, trạng thái lời mời và trạng thái tham dự.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính participant. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Cuộc họp liên quan. |
| `user_id` | `uuid FK -> users.id` | Có | Nhân sự nội bộ tham gia. |
| `participant_role` | `varchar(40) NOT NULL DEFAULT 'attendee'` | Có | Vai trò trong họp: host, attendee, approver, note_taker. |
| `is_required` | `boolean NOT NULL DEFAULT true` | Có | Người này bắt buộc tham gia hay không. |
| `attendance_required` | `boolean NOT NULL DEFAULT true` | Có | Có cần điểm danh hay không. |
| `invitation_status` | `varchar(30) NOT NULL DEFAULT 'pending'` | Có | pending, accepted, declined, tentative. |
| `response_at` | `timestamptz` | Không | Thời điểm phản hồi lời mời. |
| `attendance_status` | `varchar(30) NOT NULL DEFAULT 'not_checked_in'` | Có | not_checked_in, present, absent, late, left_early. |
| `joined_at` | `timestamptz` | Không | Thời điểm vào họp. |
| `left_at` | `timestamptz` | Không | Thời điểm rời họp. |
| `invited_by` | `uuid FK -> users.id` | Không | Người thêm participant. |
| `notes` | `text` | Không | Ghi chú. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm thêm. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_meeting_participants_pair ON meeting_participants(meeting_id, user_id)`
- `INDEX ix_meeting_participants_meeting ON meeting_participants(meeting_id)`
- `INDEX ix_meeting_participants_user ON meeting_participants(user_id)`
- `INDEX ix_meeting_participants_invitation ON meeting_participants(invitation_status)`
- `INDEX ix_meeting_participants_attendance ON meeting_participants(attendance_status)`

### 11. `meeting_external_participants`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu khách mời bên ngoài không có tài khoản nội bộ.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính external participant. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Cuộc họp liên quan. |
| `full_name` | `varchar(255) NOT NULL` | Có | Tên khách mời. |
| `email` | `varchar(255)` | Không | Email khách mời để gửi invitation. |
| `phone_number` | `varchar(30)` | Không | Số điện thoại khách mời. |
| `organization_name` | `varchar(255)` | Không | Công ty/tổ chức của khách mời. |
| `participant_role` | `varchar(40) NOT NULL DEFAULT 'attendee'` | Có | Vai trò trong họp. |
| `invitation_status` | `varchar(30) NOT NULL DEFAULT 'pending'` | Có | pending, accepted, declined, tentative. |
| `response_at` | `timestamptz` | Không | Thời điểm phản hồi. |
| `notes` | `text` | Không | Ghi chú. |
| `metadata_json` | `jsonb` | Không | Thông tin bổ sung như visitor code, access note. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm thêm. |

**Index/Constraint đề xuất:**
- `INDEX ix_external_participants_meeting ON meeting_external_participants(meeting_id)`
- `INDEX ix_external_participants_email ON meeting_external_participants(email)`
- `INDEX ix_external_participants_invitation ON meeting_external_participants(invitation_status)`

### 12. `meeting_agendas`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu chương trình họp có thứ tự, người phụ trách, thời lượng dự kiến và ghi chú kết quả.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính agenda. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Cuộc họp liên quan. |
| `agenda_order` | `integer NOT NULL` | Có | Thứ tự agenda trong cuộc họp. |
| `title` | `varchar(255) NOT NULL` | Có | Tiêu đề mục agenda. |
| `description` | `text` | Không | Mô tả nội dung. |
| `owner_id` | `uuid FK -> users.id` | Không | Người phụ trách mục agenda. |
| `planned_duration_minutes` | `integer` | Không | Thời lượng dự kiến. |
| `actual_duration_minutes` | `integer` | Không | Thời lượng thực tế. |
| `result_note` | `text` | Không | Ghi chú kết quả sau họp. |
| `status` | `varchar(30) NOT NULL DEFAULT 'planned'` | Có | planned, in_progress, done, skipped. |
| `created_by` | `uuid FK -> users.id` | Không | Người tạo. |
| `updated_by` | `uuid FK -> users.id` | Không | Người cập nhật. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_meeting_agendas_order ON meeting_agendas(meeting_id, agenda_order)`
- `INDEX ix_meeting_agendas_meeting ON meeting_agendas(meeting_id)`
- `INDEX ix_meeting_agendas_owner ON meeting_agendas(owner_id)`

### 13. `meeting_recurrence_rules`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu quy tắc họp định kỳ, hỗ trợ tạo chuỗi, xem/chỉnh/hủy chuỗi họp.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính recurrence rule. |
| `recurrence_type` | `varchar(30) NOT NULL` | Có | daily, weekly, monthly, custom_rrule. |
| `interval_value` | `integer NOT NULL DEFAULT 1` | Có | Chu kỳ lặp. |
| `days_of_week` | `varchar(50)` | Không | Các ngày trong tuần, ví dụ MO,WE,FR. |
| `day_of_month` | `integer` | Không | Ngày trong tháng nếu lặp tháng. |
| `start_date` | `date NOT NULL` | Có | Ngày bắt đầu chuỗi. |
| `end_date` | `date` | Không | Ngày kết thúc chuỗi. |
| `occurrence_count` | `integer` | Không | Số lần lặp nếu không dùng end_date. |
| `rrule_text` | `text` | Không | Chuỗi RRULE chuẩn để backend generate occurrence. |
| `timezone` | `varchar(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'` | Có | Múi giờ recurrence. |
| `exception_dates_json` | `jsonb` | Không | Danh sách ngày bị bỏ/ngoại lệ. |
| `created_by` | `uuid FK -> users.id` | Không | Người tạo rule. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `INDEX ix_recurrence_type ON meeting_recurrence_rules(recurrence_type)`
- `INDEX ix_recurrence_date ON meeting_recurrence_rules(start_date, end_date)`

### 14. `meeting_notes`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu ghi chú trong cuộc họp để xem, tìm kiếm và liên kết vào minutes nếu cần.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính note. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Cuộc họp liên quan. |
| `author_id` | `uuid FK -> users.id` | Có | Người tạo ghi chú. |
| `note_type` | `varchar(30) NOT NULL DEFAULT 'in_meeting'` | Có | in_meeting, private, host_note, system_note. |
| `content` | `text NOT NULL` | Có | Nội dung ghi chú. |
| `pinned` | `boolean NOT NULL DEFAULT false` | Có | Ghim ghi chú quan trọng. |
| `visibility_level` | `varchar(30) NOT NULL DEFAULT 'participants'` | Có | Ai được xem ghi chú. |
| `source_event_id` | `uuid FK -> meeting_events.id` | Không | Sự kiện timeline liên quan nếu có. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm ghi chú. |

**Index/Constraint đề xuất:**
- `INDEX ix_meeting_notes_meeting ON meeting_notes(meeting_id)`
- `INDEX ix_meeting_notes_author ON meeting_notes(author_id)`
- `INDEX ix_meeting_notes_type ON meeting_notes(note_type)`
- `INDEX ix_meeting_notes_content_fts ON meeting_notes USING GIN(to_tsvector('simple', coalesce(content,'')))`

### 15. `meeting_events`
**Nhóm:** 02. Meeting Core & Scheduling
**Mục đích:** Lưu timeline sự kiện cuộc họp: bắt đầu, kết thúc, gia hạn, cảnh báo thời gian, đổi trạng thái, note hệ thống.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính event. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Cuộc họp liên quan. |
| `event_type` | `varchar(60) NOT NULL` | Có | meeting_started, meeting_ended, extension_requested, warning_sent, status_changed. |
| `event_time` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm xảy ra sự kiện. |
| `actor_user_id` | `uuid FK -> users.id` | Không | Người gây ra sự kiện nếu có. |
| `source_type` | `varchar(30) NOT NULL DEFAULT 'system'` | Có | manual, system, websocket, mqtt, scheduler. |
| `description` | `text` | Không | Mô tả sự kiện. |
| `old_value_json` | `jsonb` | Không | Giá trị trước khi đổi. |
| `new_value_json` | `jsonb` | Không | Giá trị sau khi đổi. |
| `metadata_json` | `jsonb` | Không | Payload kỹ thuật hoặc context liên quan. |

**Index/Constraint đề xuất:**
- `INDEX ix_meeting_events_meeting_time ON meeting_events(meeting_id, event_time)`
- `INDEX ix_meeting_events_type ON meeting_events(event_type)`
- `INDEX ix_meeting_events_actor ON meeting_events(actor_user_id)`
- `INDEX ix_meeting_events_metadata ON meeting_events USING GIN(metadata_json)`

### 16. `rooms`
**Nhóm:** 03. Room & Utilization
**Mục đích:** Lưu phòng họp, sức chứa, vị trí, trạng thái hiện tại, khả năng thiết bị và layout đơn giản.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính room. |
| `room_code` | `varchar(80) UNIQUE` | Có | Mã phòng dùng trong booking và tìm kiếm. |
| `room_name` | `varchar(150) NOT NULL` | Có | Tên phòng hiển thị. |
| `site_name` | `varchar(150)` | Không | Tên cơ sở/tòa nhà dạng text để không cần bảng buildings riêng. |
| `area_name` | `varchar(150)` | Không | Khu vực/tầng/phân khu dạng text. |
| `location_description` | `text` | Không | Mô tả vị trí chi tiết. |
| `capacity` | `integer NOT NULL` | Có | Sức chứa phòng. |
| `room_type` | `varchar(50) NOT NULL DEFAULT 'meeting_room'` | Có | meeting_room, training_room, board_room, open_space. |
| `current_status` | `varchar(30) NOT NULL DEFAULT 'available'` | Có | available, occupied, reserved, maintenance, inactive. |
| `has_camera` | `boolean NOT NULL DEFAULT false` | Có | Phòng có camera hay không. |
| `has_microphone` | `boolean NOT NULL DEFAULT false` | Có | Phòng có mic/capture agent hay không. |
| `has_display` | `boolean NOT NULL DEFAULT false` | Có | Phòng có màn hình/trình chiếu hay không. |
| `allow_recording` | `boolean NOT NULL DEFAULT false` | Có | Phòng cho phép recording hay không. |
| `layout_json` | `jsonb` | Không | Sơ đồ phòng/ghế/mic dạng JSON thay cho bảng room_seats. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | Phòng đang hoạt động hay không. |
| `created_by` | `uuid FK -> users.id` | Không | Người tạo. |
| `updated_by` | `uuid FK -> users.id` | Không | Người cập nhật. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm phòng. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_rooms_code ON rooms(room_code)`
- `INDEX ix_rooms_status ON rooms(current_status)`
- `INDEX ix_rooms_capacity ON rooms(capacity)`
- `INDEX ix_rooms_type ON rooms(room_type)`
- `INDEX ix_rooms_active ON rooms(is_active)`
- `INDEX ix_rooms_layout_json ON rooms USING GIN(layout_json)`

**Ghi chú:**
- Không còn room_seats; nếu cần sơ đồ ghế/mic chi tiết ở mức capstone, lưu trong rooms.layout_json và snapshot xuống capture_session_channels.

### 17. `room_bookings`
**Nhóm:** 03. Room & Utilization
**Mục đích:** Lưu booking phòng độc lập với meetings để hỗ trợ đặt phòng, ad-hoc booking, đổi phòng, approval và giải phóng phòng.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính booking. |
| `booking_code` | `varchar(80) UNIQUE` | Có | Mã booking. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting sử dụng booking. |
| `room_id` | `uuid FK -> rooms.id` | Có | Phòng được đặt. |
| `booking_type` | `varchar(30) NOT NULL DEFAULT 'scheduled'` | Có | scheduled, ad_hoc, extension, relocated. |
| `reserved_start_time` | `timestamptz NOT NULL` | Có | Thời gian bắt đầu đặt phòng. |
| `reserved_end_time` | `timestamptz NOT NULL` | Có | Thời gian kết thúc đặt phòng. |
| `status` | `varchar(30) NOT NULL DEFAULT 'pending'` | Có | pending, approved, active, completed, cancelled, released. |
| `booked_by` | `uuid FK -> users.id` | Có | Người đặt phòng. |
| `approved_by` | `uuid FK -> users.id` | Không | Người phê duyệt nếu manual approval. |
| `approved_at` | `timestamptz` | Không | Thời điểm phê duyệt. |
| `cancellation_reason` | `text` | Không | Lý do hủy booking. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_room_bookings_code ON room_bookings(booking_code)`
- `INDEX ix_room_bookings_room_time ON room_bookings(room_id, reserved_start_time, reserved_end_time)`
- `INDEX ix_room_bookings_meeting ON room_bookings(meeting_id)`
- `INDEX ix_room_bookings_status ON room_bookings(status)`

**Ghi chú:**
- Script SQL có EXCLUDE constraint để chặn overlap phòng ở trạng thái pending/approved/active nếu dùng PostgreSQL btree_gist.

### 18. `room_booking_usages`
**Nhóm:** 03. Room & Utilization
**Mục đích:** Lưu sử dụng thực tế so với booking kế hoạch để tính utilization, phát hiện phòng trống sớm và no-show.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính usage. |
| `booking_id` | `uuid FK -> room_bookings.id` | Có | Booking liên quan. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting liên quan. |
| `room_id` | `uuid FK -> rooms.id` | Có | Phòng được sử dụng. |
| `reserved_start_time` | `timestamptz NOT NULL` | Có | Snapshot giờ bắt đầu đã đặt. |
| `reserved_end_time` | `timestamptz NOT NULL` | Có | Snapshot giờ kết thúc đã đặt. |
| `actual_start_time` | `timestamptz` | Không | Giờ bắt đầu sử dụng thực tế. |
| `actual_end_time` | `timestamptz` | Không | Giờ kết thúc sử dụng thực tế. |
| `first_presence_at` | `timestamptz` | Không | Lần đầu phát hiện có người trong phòng. |
| `last_presence_at` | `timestamptz` | Không | Lần cuối phát hiện có người trong phòng. |
| `usage_status` | `varchar(30) NOT NULL DEFAULT 'not_started'` | Có | not_started, in_use, completed, no_show, early_empty, released. |
| `occupancy_source` | `varchar(40)` | Không | camera, manual, sensor, websocket, mixed. |
| `occupancy_confidence` | `numeric(5,2)` | Không | Độ tin cậy phát hiện có người. |
| `auto_released` | `boolean NOT NULL DEFAULT false` | Có | Phòng có được giải phóng tự động không. |
| `released_by` | `uuid FK -> users.id` | Không | Người giải phóng thủ công nếu có. |
| `released_at` | `timestamptz` | Không | Thời điểm giải phóng. |
| `release_reason` | `text` | Không | Lý do giải phóng. |
| `metadata_json` | `jsonb` | Không | Dữ liệu cảm biến/snapshot liên quan. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_room_booking_usages_booking ON room_booking_usages(booking_id)`
- `INDEX ix_room_booking_usages_room ON room_booking_usages(room_id)`
- `INDEX ix_room_booking_usages_meeting ON room_booking_usages(meeting_id)`
- `INDEX ix_room_booking_usages_status ON room_booking_usages(usage_status)`
- `INDEX ix_room_booking_usages_time ON room_booking_usages(reserved_start_time, reserved_end_time)`

### 19. `no_show_cases`
**Nhóm:** 03. Room & Utilization
**Mục đích:** Lưu vòng đời phát hiện no-show: nguy cơ, cảnh báo, deadline, giải phóng phòng và xử lý thủ công.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính no-show case. |
| `booking_id` | `uuid FK -> room_bookings.id` | Có | Booking bị nghi no-show. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting liên quan. |
| `room_id` | `uuid FK -> rooms.id` | Có | Phòng liên quan. |
| `detection_status` | `varchar(30) NOT NULL DEFAULT 'risk'` | Có | risk, confirmed, warning_sent, released, dismissed, resolved. |
| `detected_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm phát hiện nguy cơ. |
| `warning_sent_at` | `timestamptz` | Không | Thời điểm gửi cảnh báo. |
| `warning_deadline_at` | `timestamptz` | Không | Hạn xác nhận trước khi giải phóng. |
| `auto_release_eligible_at` | `timestamptz` | Không | Thời điểm đủ điều kiện giải phóng tự động. |
| `released_at` | `timestamptz` | Không | Thời điểm phòng được giải phóng. |
| `resolved_by` | `uuid FK -> users.id` | Không | Người xử lý nếu thủ công. |
| `resolution_status` | `varchar(30)` | Không | released, kept, false_positive, manual_override. |
| `note` | `text` | Không | Ghi chú xử lý. |
| `evidence_json` | `jsonb` | Không | Bằng chứng như snapshot occupancy, camera confidence, threshold tại thời điểm phát hiện. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_no_show_cases_active_booking ON no_show_cases(booking_id) WHERE detection_status NOT IN ('resolved', 'dismissed')`
- `INDEX ix_no_show_cases_room ON no_show_cases(room_id)`
- `INDEX ix_no_show_cases_status ON no_show_cases(detection_status)`
- `INDEX ix_no_show_cases_detected ON no_show_cases(detected_at)`

### 20. `room_events`
**Nhóm:** 03. Room & Utilization
**Mục đích:** Lưu lịch sử trạng thái phòng, occupancy event, release event và sự kiện realtime dùng cho dashboard.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính room event. |
| `room_id` | `uuid FK -> rooms.id` | Có | Phòng liên quan. |
| `meeting_id` | `uuid FK -> meetings.id` | Không | Meeting liên quan nếu có. |
| `booking_id` | `uuid FK -> room_bookings.id` | Không | Booking liên quan nếu có. |
| `event_type` | `varchar(60) NOT NULL` | Có | status_changed, occupancy_detected, room_released, early_empty_detected. |
| `event_time` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm sự kiện. |
| `source_type` | `varchar(30) NOT NULL DEFAULT 'system'` | Có | system, manual, camera, sensor, mqtt. |
| `actor_user_id` | `uuid FK -> users.id` | Không | Người gây sự kiện nếu manual. |
| `old_status` | `varchar(30)` | Không | Trạng thái cũ. |
| `new_status` | `varchar(30)` | Không | Trạng thái mới. |
| `occupancy_count` | `integer` | Không | Số người ước tính trong phòng. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy event. |
| `description` | `text` | Không | Mô tả sự kiện. |
| `metadata_json` | `jsonb` | Không | Payload camera/sensor/MQTT. |

**Index/Constraint đề xuất:**
- `INDEX ix_room_events_room_time ON room_events(room_id, event_time)`
- `INDEX ix_room_events_type ON room_events(event_type)`
- `INDEX ix_room_events_booking ON room_events(booking_id)`
- `INDEX ix_room_events_metadata ON room_events USING GIN(metadata_json)`

### 21. `equipments`
**Nhóm:** 04. Equipment, IoT & Capture Agent
**Mục đích:** Lưu tài sản thiết bị họp ở góc độ kho/asset: camera, microphone, display, speaker, capture agent, sensor.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính equipment. |
| `equipment_code` | `varchar(80) UNIQUE` | Có | Mã tài sản thiết bị. |
| `equipment_name` | `varchar(150) NOT NULL` | Có | Tên thiết bị. |
| `equipment_type` | `varchar(50) NOT NULL` | Có | camera, microphone, display, speaker, capture_agent, sensor, other. |
| `serial_number` | `varchar(120)` | Không | Số serial phần cứng. |
| `brand` | `varchar(100)` | Không | Hãng sản xuất. |
| `model` | `varchar(100)` | Không | Model thiết bị. |
| `purchase_date` | `date` | Không | Ngày mua. |
| `asset_status` | `varchar(30) NOT NULL DEFAULT 'available'` | Có | available, assigned, retired, lost, maintenance. |
| `health_status` | `varchar(30) NOT NULL DEFAULT 'unknown'` | Có | healthy, warning, faulty, offline, unknown. |
| `current_room_id` | `uuid FK -> rooms.id` | Không | Phòng đang được phân bổ hiện tại; thay cho equipment_assignments. |
| `assigned_by` | `uuid FK -> users.id` | Không | Người phân bổ gần nhất. |
| `assigned_at` | `timestamptz` | Không | Thời điểm phân bổ hiện tại/gần nhất. |
| `installed_at` | `timestamptz` | Không | Thời điểm lắp đặt thiết bị vào phòng. |
| `assignment_note` | `text` | Không | Ghi chú phân bổ/lắp đặt hiện tại. |
| `iot_device_id` | `uuid FK -> iot_devices.id` | Không | Endpoint IoT nếu thiết bị có kết nối mạng. |
| `last_maintenance_at` | `timestamptz` | Không | Lần bảo trì gần nhất. |
| `last_issue_reported_at` | `timestamptz` | Không | Thời điểm báo lỗi gần nhất. |
| `last_issue_note` | `text` | Không | Ghi chú lỗi gần nhất. |
| `specification_json` | `jsonb` | Không | Thông số kỹ thuật linh hoạt. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm thiết bị. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_equipments_code ON equipments(equipment_code)`
- `INDEX ix_equipments_type ON equipments(equipment_type)`
- `INDEX ix_equipments_current_room ON equipments(current_room_id)`
- `INDEX ix_equipments_asset_status ON equipments(asset_status)`
- `INDEX ix_equipments_health_status ON equipments(health_status)`

**Ghi chú:**
- Không còn equipment_assignments; lịch sử phân bổ chi tiết có thể lưu bằng audit_logs hoặc room_events/equipment event trong giai đoạn capstone.

### 22. `iot_devices`
**Nhóm:** 04. Equipment, IoT & Capture Agent
**Mục đích:** Lưu endpoint thiết bị thông minh/gateway/camera/Face Server/Room Capture Agent để backend giao tiếp qua MQTT/RTSP/WebSocket/API.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính IoT device. |
| `device_code` | `varchar(80) UNIQUE` | Có | Mã endpoint thiết bị. |
| `device_name` | `varchar(150) NOT NULL` | Có | Tên thiết bị hiển thị. |
| `device_type` | `varchar(50) NOT NULL` | Có | ip_camera, door_camera, room_camera, face_server, microphone, capture_agent, occupancy_sensor, display. |
| `room_id` | `uuid FK -> rooms.id` | Không | Phòng đang gắn thiết bị. |
| `equipment_id` | `uuid FK -> equipments.id` | Không | Asset vật lý tương ứng nếu có. |
| `network_identifier` | `varchar(150)` | Không | Identifier kỹ thuật như hostname/device id. |
| `ip_address` | `varchar(100)` | Không | IP thiết bị. |
| `mac_address` | `varchar(100)` | Không | MAC nếu có. |
| `stream_url` | `text` | Không | RTSP/HTTP stream URL cho camera. |
| `mqtt_topic` | `varchar(255)` | Không | MQTT topic thiết bị publish/subscribe. |
| `agent_version` | `varchar(80)` | Không | Version Room Capture Agent hoặc client agent. |
| `firmware_version` | `varchar(80)` | Không | Firmware thiết bị. |
| `status` | `varchar(30) NOT NULL DEFAULT 'offline'` | Có | online, offline, disabled, maintenance. |
| `health_status` | `varchar(30) NOT NULL DEFAULT 'unknown'` | Có | healthy, warning, faulty, unknown. |
| `last_seen_at` | `timestamptz` | Không | Lần ping/heartbeat gần nhất. |
| `metadata_json` | `jsonb` | Không | Cấu hình stream, codec, channel mapping, capability. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_iot_devices_code ON iot_devices(device_code)`
- `INDEX ix_iot_devices_room ON iot_devices(room_id)`
- `INDEX ix_iot_devices_type ON iot_devices(device_type)`
- `INDEX ix_iot_devices_status ON iot_devices(status)`
- `INDEX ix_iot_devices_last_seen ON iot_devices(last_seen_at)`
- `INDEX ix_iot_devices_metadata ON iot_devices USING GIN(metadata_json)`

### 23. `device_user_mappings`
**Nhóm:** 04. Equipment, IoT & Capture Agent
**Mục đích:** Lưu mapping giữa user nội bộ/face profile và định danh person trên từng Face Server/camera/thiết bị điểm danh.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính device-user mapping. |
| `device_id` | `uuid FK -> iot_devices.id` | Có | Face Server/camera/thiết bị điểm danh đang lưu person record. |
| `user_id` | `uuid FK -> users.id` | Có | User nội bộ được mapping với person record trên thiết bị. |
| `face_profile_id` | `uuid FK -> face_profiles.id` | Không | Face profile nội bộ được đồng bộ lên thiết bị; có thể null khi chỉ map bằng mã nhân viên/card. |
| `device_person_id` | `varchar(100)` | Không | ID nội bộ của person trên thiết bị/Face Server nếu lấy được. |
| `device_person_code` | `varchar(100)` | Không | ID number, access card number hoặc mã nhân viên đang lưu trên camera/Face Server. |
| `device_person_name` | `varchar(255)` | Không | Tên person đang lưu trên thiết bị. |
| `face_registered` | `boolean NOT NULL DEFAULT false` | Có | Khuôn mặt của user đã được đăng ký thành công trên thiết bị hay chưa. |
| `registered_at` | `timestamptz` | Không | Thời điểm đăng ký khuôn mặt/person lên thiết bị thành công. |
| `registered_by` | `uuid FK -> users.id` | Không | Người thực hiện đăng ký hoặc kích hoạt đồng bộ. |
| `sync_status` | `varchar(30) NOT NULL DEFAULT 'pending'` | Có | pending, synced, failed, deleted. |
| `last_synced_at` | `timestamptz` | Không | Lần đồng bộ gần nhất giữa hệ thống và thiết bị. |
| `last_sync_error` | `text` | Không | Lỗi đồng bộ gần nhất. |
| `metadata_json` | `jsonb` | Không | Payload kỹ thuật như raw person data, API response, threshold. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo mapping. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật mapping. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm mapping khi gỡ user khỏi thiết bị nhưng vẫn cần trace. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_device_user_mappings_device_user ON device_user_mappings(device_id, user_id) WHERE deleted_at IS NULL`
- `UNIQUE INDEX ux_device_user_mappings_person_id ON device_user_mappings(device_id, device_person_id) WHERE device_person_id IS NOT NULL AND deleted_at IS NULL`
- `INDEX ix_device_user_mappings_person_code ON device_user_mappings(device_id, device_person_code)`
- `INDEX ix_device_user_mappings_person_name ON device_user_mappings(device_id, device_person_name)`
- `INDEX ix_device_user_mappings_face_profile ON device_user_mappings(face_profile_id)`
- `INDEX ix_device_user_mappings_sync_status ON device_user_mappings(sync_status)`

### 24. `iot_device_events`
**Nhóm:** 04. Equipment, IoT & Capture Agent
**Mục đích:** Lưu event thô/tổng hợp từ thiết bị IoT như heartbeat, lỗi thiết bị, MQTT payload, camera event.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính device event. |
| `device_id` | `uuid FK -> iot_devices.id` | Có | Thiết bị phát sinh event. |
| `room_id` | `uuid FK -> rooms.id` | Không | Phòng liên quan. |
| `meeting_id` | `uuid FK -> meetings.id` | Không | Meeting liên quan nếu event xảy ra trong cuộc họp. |
| `event_type` | `varchar(60) NOT NULL` | Có | heartbeat, device_error, stream_started, stream_stopped, mqtt_message, face_detected. |
| `event_time` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm event. |
| `source_protocol` | `varchar(30) NOT NULL DEFAULT 'mqtt'` | Có | mqtt, rtsp, http, websocket, manual. |
| `severity` | `varchar(20) NOT NULL DEFAULT 'info'` | Có | info, warning, error, critical. |
| `payload_json` | `jsonb` | Không | Payload kỹ thuật gốc hoặc đã normalize. |
| `processed_status` | `varchar(30) NOT NULL DEFAULT 'received'` | Có | received, processed, ignored, failed. |
| `error_message` | `text` | Không | Lỗi xử lý event nếu có. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm lưu. |

**Index/Constraint đề xuất:**
- `INDEX ix_iot_device_events_device_time ON iot_device_events(device_id, event_time)`
- `INDEX ix_iot_device_events_room ON iot_device_events(room_id)`
- `INDEX ix_iot_device_events_meeting ON iot_device_events(meeting_id)`
- `INDEX ix_iot_device_events_type ON iot_device_events(event_type)`
- `INDEX ix_iot_device_events_payload ON iot_device_events USING GIN(payload_json)`

### 25. `capture_sessions`
**Nhóm:** 04. Equipment, IoT & Capture Agent
**Mục đích:** Lưu phiên thu audio/video từ Room Capture Agent cho một cuộc họp/phòng, tách khỏi recording session để quản lý runtime kỹ thuật.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính capture session. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting đang được capture. |
| `room_id` | `uuid FK -> rooms.id` | Có | Phòng capture. |
| `capture_agent_device_id` | `uuid FK -> iot_devices.id` | Có | Room Capture Agent phụ trách. |
| `recording_session_id` | `uuid FK -> recording_sessions.id` | Không | Recording session nghiệp vụ liên quan. |
| `session_status` | `varchar(30) NOT NULL DEFAULT 'starting'` | Có | starting, active, paused, stopped, failed. |
| `started_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm bắt đầu capture. |
| `stopped_at` | `timestamptz` | Không | Thời điểm kết thúc capture. |
| `started_by` | `uuid FK -> users.id` | Không | Người/system bắt đầu. |
| `stopped_by` | `uuid FK -> users.id` | Không | Người/system dừng. |
| `clock_sync_offset_ms` | `integer` | Không | Độ lệch đồng bộ thời gian với server. |
| `metadata_json` | `jsonb` | Không | Thông tin codec, sample rate, device runtime, error. |

**Index/Constraint đề xuất:**
- `INDEX ix_capture_sessions_meeting ON capture_sessions(meeting_id)`
- `INDEX ix_capture_sessions_room ON capture_sessions(room_id)`
- `INDEX ix_capture_sessions_agent ON capture_sessions(capture_agent_device_id)`
- `INDEX ix_capture_sessions_status ON capture_sessions(session_status)`

### 26. `capture_session_channels`
**Nhóm:** 04. Equipment, IoT & Capture Agent
**Mục đích:** Lưu mapping từng audio channel của Room Capture Agent với mic/zone/người dự đoán và trạng thái channel.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính channel. |
| `capture_session_id` | `uuid FK -> capture_sessions.id` | Có | Phiên capture cha. |
| `channel_id` | `varchar(80) NOT NULL` | Có | ID channel từ Room Capture Agent. |
| `iot_device_id` | `uuid FK -> iot_devices.id` | Không | Mic/thiết bị nguồn của channel nếu có. |
| `channel_label` | `varchar(100)` | Không | Tên hiển thị channel. |
| `audio_source_type` | `varchar(40) NOT NULL DEFAULT 'mixed'` | Có | table_mic, ceiling_mic, lapel_mic, mixed, virtual. |
| `room_zone_label` | `varchar(100)` | Không | Vùng/vị trí trong phòng, thay cho FK room_seats. |
| `seat_code_snapshot` | `varchar(80)` | Không | Mã ghế snapshot nếu layout_json có mô tả ghế, không FK. |
| `participant_user_id` | `uuid FK -> users.id` | Không | Người được dự đoán/ngồi tại channel nếu xác định được. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy mapping speaker/channel. |
| `sample_rate` | `integer` | Không | Sample rate audio. |
| `bit_depth` | `integer` | Không | Bit depth audio. |
| `status` | `varchar(30) NOT NULL DEFAULT 'active'` | Có | active, muted, noisy, disconnected, disabled. |
| `calibration_json` | `jsonb` | Không | Thông tin calibration channel. |
| `metadata_json` | `jsonb` | Không | Thông tin noise level, gain, RMS, device channel raw data. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_capture_session_channels_pair ON capture_session_channels(capture_session_id, channel_id)`
- `INDEX ix_capture_session_channels_iot_device ON capture_session_channels(iot_device_id)`
- `INDEX ix_capture_session_channels_participant ON capture_session_channels(participant_user_id)`
- `INDEX ix_capture_session_channels_metadata ON capture_session_channels USING GIN(metadata_json)`

**Ghi chú:**
- Không còn FK room_seats; channel lưu seat_code_snapshot/room_zone_label lấy từ rooms.layout_json để schema gọn hơn.

### 27. `attendance_records`
**Nhóm:** 05. Attendance & Presence
**Mục đích:** Lưu kết quả điểm danh cuối cùng của từng người trong cuộc họp, dùng cho dashboard và báo cáo.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính attendance record. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Cuộc họp liên quan. |
| `participant_id` | `uuid FK -> meeting_participants.id` | Không | Participant nội bộ liên quan. |
| `user_id` | `uuid FK -> users.id` | Có | Người được điểm danh. |
| `check_in_method` | `varchar(40) NOT NULL DEFAULT 'system'` | Có | manual, door_camera, room_camera, qr, system. |
| `attendance_source` | `varchar(40) NOT NULL DEFAULT 'mixed'` | Có | manual, camera, presence_snapshot, mixed. |
| `check_in_time` | `timestamptz` | Không | Thời điểm check-in. |
| `check_out_time` | `timestamptz` | Không | Thời điểm check-out. |
| `first_detected_at` | `timestamptz` | Không | Lần đầu hệ thống phát hiện. |
| `last_detected_at` | `timestamptz` | Không | Lần cuối hệ thống phát hiện. |
| `is_present` | `boolean NOT NULL DEFAULT false` | Có | Có mặt hay không. |
| `is_late` | `boolean NOT NULL DEFAULT false` | Có | Đi muộn hay không. |
| `left_early` | `boolean NOT NULL DEFAULT false` | Có | Rời sớm hay không. |
| `late_minutes` | `integer` | Không | Số phút trễ. |
| `presence_duration_minutes` | `integer` | Không | Tổng thời gian hiện diện thực tế. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy nếu điểm danh tự động. |
| `attendance_status` | `varchar(30) NOT NULL DEFAULT 'pending_review'` | Có | present, absent, late, left_early, invalidated, pending_review. |
| `verified_by` | `uuid FK -> users.id` | Không | Người xác nhận/chỉnh sửa thủ công. |
| `verified_at` | `timestamptz` | Không | Thời điểm xác nhận. |
| `note` | `text` | Không | Ghi chú điểm danh. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_attendance_records_meeting_user ON attendance_records(meeting_id, user_id)`
- `INDEX ix_attendance_records_meeting ON attendance_records(meeting_id)`
- `INDEX ix_attendance_records_user ON attendance_records(user_id)`
- `INDEX ix_attendance_records_status ON attendance_records(attendance_status)`
- `INDEX ix_attendance_records_check_in ON attendance_records(check_in_time)`

### 28. `attendance_events`
**Nhóm:** 05. Attendance & Presence
**Mục đích:** Lưu timeline sự kiện điểm danh/hiện diện: check-in, check-out, vào/rời phòng, face detected, unknown face, manual update.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính attendance event. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting liên quan. |
| `attendance_record_id` | `uuid FK -> attendance_records.id` | Không | Record tổng hợp liên quan. |
| `user_id` | `uuid FK -> users.id` | Không | User được nhận diện; null nếu unknown face. |
| `room_id` | `uuid FK -> rooms.id` | Không | Phòng xảy ra event. |
| `device_id` | `uuid FK -> iot_devices.id` | Không | Camera/thiết bị phát hiện event. |
| `event_type` | `varchar(50) NOT NULL` | Có | check_in, check_out, enter_room, leave_room, face_detected, unknown_face, manual_update. |
| `event_time` | `timestamptz NOT NULL` | Có | Thời điểm event. |
| `source_type` | `varchar(40) NOT NULL DEFAULT 'system'` | Có | manual, door_camera, room_camera, system, websocket. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy nhận diện. |
| `evidence_media_file_id` | `uuid FK -> media_files.id` | Không | Ảnh/video/audio evidence nếu có. |
| `review_status` | `varchar(30)` | Không | pending_review, accepted, rejected, resolved. |
| `reviewed_by` | `uuid FK -> users.id` | Không | Người review event. |
| `reviewed_at` | `timestamptz` | Không | Thời điểm review. |
| `metadata_json` | `jsonb` | Không | Payload nhận diện: bounding box, face id, camera frame, threshold. |

**Index/Constraint đề xuất:**
- `INDEX ix_attendance_events_meeting_time ON attendance_events(meeting_id, event_time)`
- `INDEX ix_attendance_events_user ON attendance_events(user_id)`
- `INDEX ix_attendance_events_type ON attendance_events(event_type)`
- `INDEX ix_attendance_events_device ON attendance_events(device_id)`
- `INDEX ix_attendance_events_review ON attendance_events(review_status)`
- `INDEX ix_attendance_events_metadata ON attendance_events USING GIN(metadata_json)`

### 29. `presence_snapshots`
**Nhóm:** 05. Attendance & Presence
**Mục đích:** Lưu snapshot hiện diện realtime của người/phòng để WebSocket dashboard và tính thời lượng hiện diện.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính presence snapshot. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting liên quan. |
| `room_id` | `uuid FK -> rooms.id` | Có | Phòng liên quan. |
| `user_id` | `uuid FK -> users.id` | Không | User đang hiện diện nếu snapshot theo người. |
| `participant_id` | `uuid FK -> meeting_participants.id` | Không | Participant liên quan. |
| `presence_status` | `varchar(30) NOT NULL DEFAULT 'unknown'` | Có | present, absent, left, unknown, maybe_present. |
| `occupancy_count` | `integer` | Không | Số người trong phòng nếu snapshot theo phòng. |
| `snapshot_time` | `timestamptz NOT NULL` | Có | Thời điểm snapshot. |
| `source_type` | `varchar(40) NOT NULL DEFAULT 'mixed'` | Có | camera, manual, sensor, mixed. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy snapshot. |
| `metadata_json` | `jsonb` | Không | Chi tiết nguồn phát hiện và raw signal. |

**Index/Constraint đề xuất:**
- `INDEX ix_presence_snapshots_meeting_time ON presence_snapshots(meeting_id, snapshot_time)`
- `INDEX ix_presence_snapshots_room_time ON presence_snapshots(room_id, snapshot_time)`
- `INDEX ix_presence_snapshots_user_time ON presence_snapshots(user_id, snapshot_time)`
- `INDEX ix_presence_snapshots_metadata ON presence_snapshots USING GIN(metadata_json)`

### 30. `recording_configs`
**Nhóm:** 06. Recording, Media & Transcription
**Mục đích:** Lưu cấu hình ghi âm/ghi hình của cuộc họp trước khi bắt đầu recording.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính recording config. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting được cấu hình recording. |
| `policy_key` | `varchar(120)` | Không | Khóa cấu hình/policy trong system_configs, thay cho FK system_policies. |
| `policy_snapshot_json` | `jsonb` | Không | Snapshot chính sách consent/retention/privacy tại thời điểm cấu hình. |
| `enable_audio` | `boolean NOT NULL DEFAULT false` | Có | Có ghi âm hay không. |
| `enable_video` | `boolean NOT NULL DEFAULT false` | Có | Có ghi hình hay không. |
| `enable_transcription` | `boolean NOT NULL DEFAULT false` | Có | Có cho phép tạo transcript hay không. |
| `video_source_device_id` | `uuid FK -> iot_devices.id` | Không | IP camera chính cho video. |
| `audio_source_mode` | `varchar(40)` | Không | room_mix, channel_by_zone, single_microphone. |
| `auto_start` | `boolean NOT NULL DEFAULT false` | Có | Tự động bắt đầu khi meeting start hay không. |
| `consent_required` | `boolean NOT NULL DEFAULT true` | Có | Có yêu cầu đồng ý recording hay không. |
| `retention_days` | `integer` | Không | Thời gian lưu recording. |
| `configured_by` | `uuid FK -> users.id` | Không | Người cấu hình. |
| `configured_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cấu hình. |
| `config_json` | `jsonb` | Không | Cấu hình chi tiết: codec, bitrate, channel policy, zone mapping. |
| `status` | `varchar(30) NOT NULL DEFAULT 'draft'` | Có | draft, active, disabled, archived. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_recording_configs_meeting ON recording_configs(meeting_id)`
- `INDEX ix_recording_configs_policy_key ON recording_configs(policy_key)`
- `INDEX ix_recording_configs_status ON recording_configs(status)`
- `INDEX ix_recording_configs_json ON recording_configs USING GIN(config_json)`

**Ghi chú:**
- Không còn system_policies; chính sách recording/privacy/retention đặt trong system_configs và snapshot vào policy_snapshot_json.

### 31. `recording_sessions`
**Nhóm:** 06. Recording, Media & Transcription
**Mục đích:** Lưu từng phiên ghi âm/ghi hình thực tế, trạng thái runtime, thông tin lưu trữ và lỗi recording.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính recording session. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting được ghi. |
| `room_id` | `uuid FK -> rooms.id` | Không | Phòng được ghi. |
| `recording_config_id` | `uuid FK -> recording_configs.id` | Không | Cấu hình được dùng. |
| `session_type` | `varchar(30) NOT NULL` | Có | audio, video, mixed. |
| `source_type` | `varchar(40) NOT NULL` | Có | ip_camera, capture_agent, manual_upload, external. |
| `capture_session_id` | `uuid FK -> capture_sessions.id` | Không | Phiên capture kỹ thuật liên quan. |
| `device_id` | `uuid FK -> iot_devices.id` | Không | Thiết bị nguồn chính. |
| `started_at` | `timestamptz NOT NULL` | Có | Thời điểm bắt đầu ghi. |
| `stopped_at` | `timestamptz` | Không | Thời điểm dừng ghi. |
| `paused_duration_seconds` | `integer NOT NULL DEFAULT 0` | Có | Tổng thời gian tạm dừng. |
| `status` | `varchar(30) NOT NULL DEFAULT 'starting'` | Có | starting, recording, paused, stopped, failed, processing. |
| `started_by` | `uuid FK -> users.id` | Không | Người bắt đầu. |
| `stopped_by` | `uuid FK -> users.id` | Không | Người dừng. |
| `error_message` | `text` | Không | Lỗi recording nếu có. |
| `storage_provider` | `varchar(50)` | Không | S3/local/minio/provider. |
| `storage_path` | `text` | Không | Path thư mục chứa output. |
| `file_size_bytes` | `bigint` | Không | Tổng size output chính nếu có. |
| `duration_seconds` | `integer` | Không | Thời lượng recording. |
| `checksum` | `varchar(255)` | Không | Checksum file chính. |
| `metadata_json` | `jsonb` | Không | Metadata đồng bộ audio/video, codec, device stats. |

**Index/Constraint đề xuất:**
- `INDEX ix_recording_sessions_meeting ON recording_sessions(meeting_id)`
- `INDEX ix_recording_sessions_config ON recording_sessions(recording_config_id)`
- `INDEX ix_recording_sessions_capture ON recording_sessions(capture_session_id)`
- `INDEX ix_recording_sessions_status ON recording_sessions(status)`
- `INDEX ix_recording_sessions_started ON recording_sessions(started_at)`

### 32. `recording_segments`
**Nhóm:** 06. Recording, Media & Transcription
**Mục đích:** Lưu audio/video segment nhỏ theo channel/zone để phục vụ đồng bộ, playback theo đoạn và transcript theo speaker.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính segment. |
| `recording_session_id` | `uuid FK -> recording_sessions.id` | Có | Recording session cha. |
| `capture_session_channel_id` | `uuid FK -> capture_session_channels.id` | Không | Channel audio nguồn. |
| `seat_code_snapshot` | `varchar(80)` | Không | Mã ghế snapshot nếu rooms.layout_json có, không FK room_seats. |
| `room_zone_label` | `varchar(100)` | Không | Vùng/vị trí phòng liên quan tới segment. |
| `user_id` | `uuid FK -> users.id` | Không | Người nói/ngồi nếu xác định được. |
| `segment_start_time` | `timestamptz NOT NULL` | Có | Thời điểm bắt đầu đoạn. |
| `segment_end_time` | `timestamptz NOT NULL` | Có | Thời điểm kết thúc đoạn. |
| `start_offset_ms` | `integer NOT NULL` | Có | Offset bắt đầu so với recording. |
| `end_offset_ms` | `integer NOT NULL` | Có | Offset kết thúc so với recording. |
| `media_file_id` | `uuid FK -> media_files.id` | Không | File segment nếu lưu riêng. |
| `transcript_id` | `uuid FK -> transcripts.id` | Không | Transcript liên quan nếu đã xử lý. |
| `status` | `varchar(30) NOT NULL DEFAULT 'created'` | Có | created, synced, processed, failed. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy speaker/channel. |
| `metadata_json` | `jsonb` | Không | Audio level, noise, diarization hint, sync metadata. |

**Index/Constraint đề xuất:**
- `INDEX ix_recording_segments_session ON recording_segments(recording_session_id)`
- `INDEX ix_recording_segments_channel ON recording_segments(capture_session_channel_id)`
- `INDEX ix_recording_segments_user ON recording_segments(user_id)`
- `INDEX ix_recording_segments_start ON recording_segments(segment_start_time)`

### 33. `media_files`
**Nhóm:** 06. Recording, Media & Transcription
**Mục đích:** Kho metadata file dùng chung cho recording, evidence, transcript export, minutes attachment và file export.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính file. |
| `file_code` | `varchar(100) UNIQUE nullable` | Không | Mã file nội bộ nếu cần. |
| `meeting_id` | `uuid FK -> meetings.id` | Không | Meeting liên quan nếu có. |
| `related_entity_type` | `varchar(60)` | Không | Loại entity liên kết: recording_session, meeting_minutes, face_profile, report_output. |
| `related_entity_id` | `uuid` | Không | ID entity liên kết. |
| `recording_session_id` | `uuid FK -> recording_sessions.id` | Không | Recording session liên quan. |
| `uploaded_by` | `uuid FK -> users.id` | Không | Người upload hoặc hệ thống tạo. |
| `file_name` | `varchar(255) NOT NULL` | Có | Tên file hiển thị. |
| `file_type` | `varchar(50) NOT NULL` | Có | audio, video, image, document, transcript, minutes_attachment, export, evidence. |
| `mime_type` | `varchar(120) NOT NULL` | Có | MIME type. |
| `storage_provider` | `varchar(50) NOT NULL` | Có | local, s3, minio, cloud_provider. |
| `storage_bucket` | `varchar(150)` | Không | Bucket/container nếu dùng object storage. |
| `storage_key` | `text NOT NULL` | Có | Object key/path nội bộ. |
| `file_url` | `text` | Không | Signed/public URL nếu có. |
| `file_size_bytes` | `bigint` | Không | Kích thước file. |
| `checksum` | `varchar(255)` | Không | Checksum kiểm tra toàn vẹn. |
| `duration_seconds` | `integer` | Không | Thời lượng media nếu audio/video. |
| `version_no` | `integer NOT NULL DEFAULT 1` | Có | Phiên bản file. |
| `visibility_level` | `varchar(30) NOT NULL DEFAULT 'internal'` | Có | Quyền hiển thị file. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | File đang active hay bị ẩn. |
| `uploaded_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm upload/tạo. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm file. |
| `metadata_json` | `jsonb` | Không | Metadata file: codec, resolution, page count, evidence info. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_media_files_code ON media_files(file_code) WHERE file_code IS NOT NULL`
- `INDEX ix_media_files_meeting ON media_files(meeting_id)`
- `INDEX ix_media_files_related ON media_files(related_entity_type, related_entity_id)`
- `INDEX ix_media_files_recording_session ON media_files(recording_session_id)`
- `INDEX ix_media_files_type ON media_files(file_type)`
- `INDEX ix_media_files_active ON media_files(is_active)`
- `INDEX ix_media_files_metadata ON media_files USING GIN(metadata_json)`

**Ghi chú:**
- Không còn documents và report_exports; file tài liệu/export vẫn được lưu trực tiếp tại media_files, còn job sinh file nằm ở background_jobs.

### 34. `transcripts`
**Nhóm:** 06. Recording, Media & Transcription
**Mục đích:** Lưu transcript cuộc họp, bản raw/cleaned, chỉnh sửa thủ công, trạng thái bảo mật và segment speaker dạng jsonb.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính transcript. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting liên quan. |
| `source_media_file_id` | `uuid FK -> media_files.id` | Không | File audio/video nguồn. |
| `recording_session_id` | `uuid FK -> recording_sessions.id` | Không | Recording session nguồn. |
| `background_job_id` | `uuid FK -> background_jobs.id` | Không | Job STT/transcription liên quan. |
| `version_no` | `integer NOT NULL DEFAULT 1` | Có | Phiên bản transcript. |
| `language_code` | `varchar(20)` | Không | Ngôn ngữ transcript. |
| `raw_text` | `text` | Không | Transcript thô từ STT. |
| `cleaned_text` | `text` | Không | Transcript đã chỉnh sửa/làm sạch. |
| `speaker_segments_json` | `jsonb` | Không | Danh sách segment theo speaker/channel/zone. |
| `detected_speakers_json` | `jsonb` | Không | Danh sách speaker phát hiện và mapping user/channel. |
| `security_status` | `varchar(30) NOT NULL DEFAULT 'pending_scan'` | Có | pending_scan, safe, restricted, blocked. |
| `confidence_score` | `numeric(5,2)` | Không | Độ tin cậy transcript. |
| `status` | `varchar(30) NOT NULL DEFAULT 'processing'` | Có | processing, draft, reviewed, approved, failed, hidden. |
| `edited_by` | `uuid FK -> users.id` | Không | Người chỉnh sửa thủ công. |
| `edited_at` | `timestamptz` | Không | Thời điểm chỉnh sửa. |
| `approved_by` | `uuid FK -> users.id` | Không | Người duyệt transcript. |
| `approved_at` | `timestamptz` | Không | Thời điểm duyệt. |
| `search_keywords` | `text` | Không | Từ khóa tìm kiếm được generate. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |

**Index/Constraint đề xuất:**
- `INDEX ix_transcripts_meeting ON transcripts(meeting_id)`
- `INDEX ix_transcripts_recording_session ON transcripts(recording_session_id)`
- `INDEX ix_transcripts_source_media ON transcripts(source_media_file_id)`
- `INDEX ix_transcripts_status ON transcripts(status)`
- `INDEX ix_transcripts_text_fts ON transcripts USING GIN(to_tsvector('simple', coalesce(cleaned_text,'') || ' ' || coalesce(raw_text,'')))`

### 35. `meeting_minutes`
**Nhóm:** 07. Minutes & Knowledge Management
**Mục đích:** Lưu biên bản họp nháp/chính thức, nội dung, quyền hiển thị, action items dạng JSON, liên kết transcript/recording và file xuất bản.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính minutes. |
| `meeting_id` | `uuid FK -> meetings.id` | Có | Meeting liên quan. |
| `title` | `varchar(255) NOT NULL` | Có | Tiêu đề biên bản. |
| `version_no` | `integer NOT NULL DEFAULT 1` | Có | Phiên bản biên bản. |
| `status` | `varchar(30) NOT NULL DEFAULT 'draft'` | Có | draft, published, archived, deleted. |
| `visibility_level` | `varchar(30) NOT NULL DEFAULT 'participants'` | Có | private, participants, department, public_internal. |
| `minutes_content` | `text NOT NULL` | Có | Nội dung biên bản. |
| `attendees_snapshot_json` | `jsonb` | Không | Snapshot danh sách tham dự tại lúc ban hành. |
| `decisions_json` | `jsonb` | Không | Danh sách quyết định có cấu trúc. |
| `action_items_json` | `jsonb` | Không | Danh sách action item dạng snapshot, thay cho meeting_action_items. |
| `linked_transcript_id` | `uuid FK -> transcripts.id` | Không | Transcript được liên kết. |
| `linked_recording_file_id` | `uuid FK -> media_files.id` | Không | Recording/file liên kết. |
| `issued_by` | `uuid FK -> users.id` | Không | Người ban hành biên bản. |
| `issued_at` | `timestamptz` | Không | Thời điểm ban hành. |
| `prepared_by` | `uuid FK -> users.id` | Không | Người soạn. |
| `approved_by` | `uuid FK -> users.id` | Không | Người duyệt. |
| `approved_at` | `timestamptz` | Không | Thời điểm duyệt. |
| `file_id` | `uuid FK -> media_files.id` | Không | File PDF/DOCX export chính. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |
| `deleted_at` | `timestamptz` | Không | Xóa mềm biên bản nháp. |

**Index/Constraint đề xuất:**
- `INDEX ix_meeting_minutes_meeting ON meeting_minutes(meeting_id)`
- `INDEX ix_meeting_minutes_status ON meeting_minutes(status)`
- `INDEX ix_meeting_minutes_visibility ON meeting_minutes(visibility_level)`
- `INDEX ix_meeting_minutes_transcript ON meeting_minutes(linked_transcript_id)`
- `INDEX ix_meeting_minutes_file ON meeting_minutes(file_id)`
- `INDEX ix_meeting_minutes_actions_json ON meeting_minutes USING GIN(action_items_json)`

**Ghi chú:**
- Không còn meeting_action_items; action items hậu họp lưu compact trong action_items_json và notification/background_jobs có thể dùng payload để nhắc việc đơn giản.

### 36. `notifications`
**Nhóm:** 08. Notification, Reporting & Administration
**Mục đích:** Lưu thông báo trung tâm: thư mời họp, nhắc lịch, hủy họp, cảnh báo no-show, cảnh báo khuôn mặt lạ, phân phối biên bản.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính notification. |
| `notification_code` | `varchar(100) UNIQUE nullable` | Không | Mã thông báo nếu cần trace. |
| `notification_type` | `varchar(60) NOT NULL` | Có | meeting_invite, reminder, cancellation, no_show_alert, unknown_face_alert, minutes_distribution. |
| `channel` | `varchar(30) NOT NULL` | Có | email, in_app, websocket, sms. |
| `subject` | `varchar(255)` | Không | Tiêu đề thông báo. |
| `content` | `text NOT NULL` | Có | Nội dung thông báo. |
| `related_entity_type` | `varchar(60)` | Không | Entity liên quan: meeting, booking, minutes, attendance_event. |
| `related_entity_id` | `uuid` | Không | ID entity liên quan. |
| `recipient_scope` | `varchar(40) NOT NULL DEFAULT 'user_list'` | Có | user_list, department, role, external_email, broadcast. |
| `recipient_user_ids_json` | `jsonb` | Không | Danh sách user_id nhận thông báo, thay cho notification_recipients. |
| `recipient_emails_json` | `jsonb` | Không | Danh sách email ngoài hệ thống nếu có. |
| `recipient_phones_json` | `jsonb` | Không | Danh sách số điện thoại nếu dùng SMS. |
| `priority` | `varchar(20) NOT NULL DEFAULT 'normal'` | Có | low, normal, high, urgent. |
| `scheduled_send_at` | `timestamptz` | Không | Thời gian hẹn gửi. |
| `sent_at` | `timestamptz` | Không | Thời điểm gửi thực tế nếu đã gửi. |
| `delivery_status` | `varchar(30) NOT NULL DEFAULT 'draft'` | Có | draft, queued, sent, partial_failed, failed, cancelled. |
| `read_count` | `integer NOT NULL DEFAULT 0` | Có | Số người đã đọc ở mức tổng hợp, không track từng recipient. |
| `failure_reason` | `text` | Không | Lý do gửi thất bại nếu có. |
| `retry_count` | `integer NOT NULL DEFAULT 0` | Có | Số lần retry gửi thông báo. |
| `sent_by` | `uuid FK -> users.id` | Không | Người gửi nếu manual. |
| `created_by` | `uuid FK -> users.id` | Không | Người/system tạo thông báo. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm tạo. |
| `payload_json` | `jsonb` | Không | Payload template, variables, provider metadata. |
| `delivery_result_json` | `jsonb` | Không | Kết quả provider dạng tổng hợp theo kênh/recipient. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_notifications_code ON notifications(notification_code) WHERE notification_code IS NOT NULL`
- `INDEX ix_notifications_type ON notifications(notification_type)`
- `INDEX ix_notifications_delivery_status ON notifications(delivery_status)`
- `INDEX ix_notifications_related ON notifications(related_entity_type, related_entity_id)`
- `INDEX ix_notifications_scheduled ON notifications(scheduled_send_at)`
- `INDEX ix_notifications_recipients ON notifications USING GIN(recipient_user_ids_json)`

**Ghi chú:**
- Không còn notification_recipients; trạng thái theo từng người nhận được rút gọn thành JSON tổng hợp để giảm số bảng.

### 37. `background_jobs`
**Nhóm:** 08. Notification, Reporting & Administration
**Mục đích:** Lưu job bất đồng bộ cấp hệ thống: import Excel, gửi email hàng loạt, transcription, export report/minutes và các job xử lý file.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính background job. |
| `job_type` | `varchar(80) NOT NULL` | Có | import_accounts, import_participants, send_email, transcription, export_report, export_minutes, media_processing. |
| `related_entity_type` | `varchar(60)` | Không | Entity liên quan. |
| `related_entity_id` | `uuid` | Không | ID entity liên quan. |
| `requested_by` | `uuid FK -> users.id` | Không | Người yêu cầu job. |
| `queue_name` | `varchar(100)` | Không | Tên queue BullMQ/worker. |
| `status` | `varchar(30) NOT NULL DEFAULT 'queued'` | Có | queued, running, completed, failed, cancelled, retrying. |
| `priority` | `integer NOT NULL DEFAULT 0` | Có | Độ ưu tiên job. |
| `scheduled_at` | `timestamptz` | Không | Thời điểm hẹn chạy. |
| `started_at` | `timestamptz` | Không | Thời điểm bắt đầu. |
| `completed_at` | `timestamptz` | Không | Thời điểm hoàn thành. |
| `retry_count` | `integer NOT NULL DEFAULT 0` | Có | Số lần retry. |
| `input_json` | `jsonb` | Không | Input job: file import, recipients, STT config, report filter. |
| `output_json` | `jsonb` | Không | Kết quả job: created_count, failed_rows, output_file. |
| `output_file_id` | `uuid FK -> media_files.id` | Không | File export/output sinh ra trong media_files, thay cho report_exports.file_id. |
| `error_message` | `text` | Không | Lỗi nếu job failed. |
| `metadata_json` | `jsonb` | Không | Thông tin worker/runtime. |

**Index/Constraint đề xuất:**
- `INDEX ix_background_jobs_type ON background_jobs(job_type)`
- `INDEX ix_background_jobs_status ON background_jobs(status)`
- `INDEX ix_background_jobs_related ON background_jobs(related_entity_type, related_entity_id)`
- `INDEX ix_background_jobs_scheduled ON background_jobs(scheduled_at)`
- `INDEX ix_background_jobs_input ON background_jobs USING GIN(input_json)`
- `INDEX ix_background_jobs_output ON background_jobs USING GIN(output_json)`

**Ghi chú:**
- Không còn report_exports; mọi export report/minutes đi qua background_jobs và file kết quả nằm ở media_files.

### 38. `system_configs`
**Nhóm:** 08. Notification, Reporting & Administration
**Mục đích:** Lưu cấu hình hệ thống có thể thay đổi mà không sửa code: no-show, recording, notification, security, AI Document feature flag.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính config. |
| `config_key` | `varchar(120) UNIQUE` | Có | Khóa cấu hình. |
| `config_value` | `text` | Không | Giá trị cấu hình dạng text nếu đơn giản. |
| `config_json` | `jsonb` | Không | Giá trị cấu hình dạng JSON cho policy phức tạp, thay cho system_policies. |
| `value_type` | `varchar(30) NOT NULL DEFAULT 'string'` | Có | string, number, boolean, json, secret_ref. |
| `config_group` | `varchar(80) NOT NULL` | Có | no_show, recording, notification, ai_document, security, scheduling. |
| `description` | `text` | Không | Mô tả cấu hình. |
| `version_no` | `integer NOT NULL DEFAULT 1` | Có | Phiên bản cấu hình/policy để snapshot trong nghiệp vụ. |
| `is_sensitive` | `boolean NOT NULL DEFAULT false` | Có | Có phải dữ liệu nhạy cảm/secret không. |
| `is_active` | `boolean NOT NULL DEFAULT true` | Có | Cấu hình đang hiệu lực hay không. |
| `updated_by` | `uuid FK -> users.id` | Không | Người cập nhật. |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm cập nhật. |

**Index/Constraint đề xuất:**
- `UNIQUE INDEX ux_system_configs_key ON system_configs(config_key)`
- `INDEX ix_system_configs_group ON system_configs(config_group)`
- `INDEX ix_system_configs_active ON system_configs(is_active)`
- `INDEX ix_system_configs_json ON system_configs USING GIN(config_json)`

**Ghi chú:**
- Không còn system_policies; policy dạng versioned có thể biểu diễn bằng config_group + config_json + version_no.

### 39. `audit_logs`
**Nhóm:** 08. Notification, Reporting & Administration
**Mục đích:** Lưu nhật ký kiểm toán toàn hệ thống cho bảo mật, phân quyền, meeting, booking, recording, attendance, minutes và admin.

| Column | Type | Required | Meaning |
|---|---|---:|---|
| `id` | `uuid PK` | Có | Khóa chính audit log. |
| `user_id` | `uuid FK -> users.id` | Không | Người thực hiện hành động; null nếu system. |
| `action_type` | `varchar(80) NOT NULL` | Có | create, update, delete, approve, reject, login, logout, export, release_room. |
| `entity_type` | `varchar(80) NOT NULL` | Có | Loại entity bị tác động. |
| `entity_id` | `uuid` | Không | ID entity bị tác động. |
| `old_value_json` | `jsonb` | Không | Giá trị trước thay đổi. |
| `new_value_json` | `jsonb` | Không | Giá trị sau thay đổi. |
| `ip_address` | `varchar(100)` | Không | IP request. |
| `user_agent` | `text` | Không | User agent. |
| `request_id` | `varchar(120)` | Không | Request/correlation id để trace. |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Có | Thời điểm ghi log. |
| `severity` | `varchar(20) NOT NULL DEFAULT 'info'` | Có | info, warning, error, critical. |
| `metadata_json` | `jsonb` | Không | Context bổ sung. |

**Index/Constraint đề xuất:**
- `INDEX ix_audit_logs_user ON audit_logs(user_id)`
- `INDEX ix_audit_logs_entity ON audit_logs(entity_type, entity_id)`
- `INDEX ix_audit_logs_action ON audit_logs(action_type)`
- `INDEX ix_audit_logs_created ON audit_logs(created_at)`
- `INDEX ix_audit_logs_severity ON audit_logs(severity)`
- `INDEX ix_audit_logs_old_json ON audit_logs USING GIN(old_value_json)`
- `INDEX ix_audit_logs_new_json ON audit_logs USING GIN(new_value_json)`

## View/Materialized View khuyến nghị
- **v_room_current_status:** Join rooms, room_bookings, room_booking_usages, room_events để hiển thị trạng thái phòng realtime.
- **v_meeting_schedule:** Chuẩn hóa lịch cá nhân/phòng từ meetings, participants và room_bookings.
- **v_attendance_summary:** Tổng hợp attendance_records, presence_snapshots để dashboard điểm danh.
- **v_recording_file_summary:** Tổng hợp recording_sessions, media_files và transcripts để playback/xem file.
- **mv_room_usage_daily:** Materialized view theo ngày để tính utilization/no-show nhanh hơn.
- **mv_meeting_analytics_monthly:** Materialized view theo tháng cho dashboard admin/manager.

## Kiểm tra sau thiết kế
- Tổng số bảng = 39.
- Toàn bộ bảng bị xoá không còn được tạo trong SQL/DBML.
- Các FK/cột phụ thuộc vào bảng bị xoá đã được thay bằng JSON snapshot, cột text hoặc bảng tổng quát.
- `audit_logs` vẫn được giữ lại vì không nằm trong danh sách xoá ở yêu cầu hiện tại và rất hữu ích cho bảo mật/capstone demo.
- AI Document không còn bảng riêng; chỉ giữ khả năng bật/tắt/cấu hình qua `system_configs` nếu nhóm phát triển sau.