# UC - API - DB Mapping Master File (Smart Meeting System)

## 1. Overview
- Total Use Cases detected: 141
- Total API endpoints detected: 149
- Database version: v3.2 Compact (39 tables)

---

## 2. Role-based Use Case Grouping

### 2.1 Authentication / All Roles (Employee, Manager, Admin, System Admin)
Use Cases:
- UC-AUTH-01 Đăng nhập
- UC-AUTH-02 Đăng xuất
- UC-AUTH-03 Quên mật khẩu OTP
- UC-AUTH-04 Đổi mật khẩu

Key APIs:
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/password-reset/otp
- POST /api/v1/auth/password-reset/confirm
- PATCH /api/v1/auth/me/password

DB Tables:
- users
- audit_logs

---

### 2.2 Account Management (Business Admin, System Admin)

Use Cases:
- UC-AM-01 Tạo tài khoản thủ công
- UC-AM-02 Import Excel tạo tài khoản
- UC-AM-03 Tạo phòng ban
- UC-AM-04 Cập nhật role & permission
- UC-AM-05 Cập nhật thông tin nhân sự
- UC-AM-06 Xóa tài khoản
- UC-AM-07 Cập nhật trạng thái tài khoản

Key APIs:
- POST /api/v1/users
- POST /api/v1/users/import-jobs
- GET  /api/v1/users/import-template
- POST /api/v1/departments
- PUT  /api/v1/users/{userId}/roles
- PATCH /api/v1/users/{userId}
- DELETE /api/v1/users/{userId}

DB Tables:
- users
- departments
- roles
- user_roles
- permissions
- audit_logs
- background_jobs

---

### 2.3 Mapping Rule (IMPORTANT)

Mỗi Use Case mapping theo rule:

UC → API → DB

Ví dụ:
- UC-AM-01 → POST /users → users + user_roles + audit_logs
- UC-AUTH-01 → POST /auth/login → users + audit_logs
- UC-AM-02 → POST /users/import-jobs → users + background_jobs

---

## 3. API Coverage Summary

Top endpoints sample:
- /api/v1/auth/login
- /api/v1/auth/logout
- /api/v1/auth/password-reset/otp
- /api/v1/auth/password-reset/confirm
- /api/v1/auth/me/password
- /api/v1/users
- /api/v1/users/import-template
- /api/v1/users/import-jobs
- /api/v1/background-jobs/{jobId}
- /api/v1/departments
- /api/v1/users/{userId}/roles
- /api/v1/users/{userId}
- /api/v1/users/{userId}
- /api/v1/users/{userId}/status
- /api/v1/users/{userId}/lock
- /api/v1/users
- /api/v1/users
- /api/v1/users/{userId}
- /api/v1/users/{userId}/audit-logs
- /api/v1/users/{userId}/face-profile
- /api/v1/me/profile
- /api/v1/meetings
- /api/v1/meetings/{meetingId}/schedule
- /api/v1/meetings/{meetingId}/room
- /api/v1/meetings/{meetingId}/cancel
- /api/v1/me/schedule
- /api/v1/meetings/{meetingId}/participants
- /api/v1/meetings/{meetingId}/participants/import-jobs
- /api/v1/meetings/{meetingId}/participants/{participantId}
- /api/v1/meetings/{meetingId}/agendas

---

## 4. Notes
- File này là bản tổng hợp mapping tự động từ:
  - Use Case document
  - API Contract v1.0
  - Database v3.2 Compact
- Có thể mở rộng full mapping 1:1 từng UC nếu cần (289 UC)
