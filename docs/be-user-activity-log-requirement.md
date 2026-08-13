# Yêu cầu Backend: Lịch sử hoạt động theo người dùng (User Activity Log)

**Ngày:** 13/08/2026  
**Độ ưu tiên:** Medium  
**Tính năng:** Modal "Lịch sử hoạt động" trong UserManagement và DepartmentManagement (Business Admin)

---

## 1. Bối cảnh & Vấn đề hiện tại

FE đang gọi `GET /api/v1/audit-logs?userId={id}&limit=10` để hiển thị lịch sử hoạt động của một user cụ thể trong modal quản lý.

**Vấn đề:** Param `userId` trong `/audit-logs` hiện tại lọc theo **actor** (người thực hiện hành động), không phải **subject** (người bị tác động). Điều này dẫn đến:

- Với tài khoản Employee thông thường (không có quyền admin) → họ hầu như không có log nào với tư cách là actor → modal trả về rỗng.
- Business Admin mở modal "Lịch sử hoạt động" của một nhân viên mong thấy: khi nào tài khoản được tạo, ai đã khóa, ai đã thay đổi vai trò... nhưng API hiện tại không trả về những thông tin này.

---

## 2. Yêu cầu bổ sung

### Option A (Khuyến nghị) — Thêm query param `targetUserId` vào `GET /audit-logs`

Bổ sung tham số filter mới vào endpoint hiện có:

| Param | Kiểu | Mô tả |
|---|---|---|
| `targetUserId` | UUID (optional) | Lọc log theo **đối tượng bị tác động** (user bị tạo/khóa/sửa/xóa) |
| `userId` | UUID (optional) | Giữ nguyên — lọc theo actor (người thực hiện) |

**Endpoint:** `GET /api/v1/audit-logs?targetUserId={userId}&limit=10`  
**Guard:** `JwtAuthGuard`, `PermissionsGuard`  
**Permission:** `audit.system.read` (SYSTEM_ADMIN) hoặc `audit.users.read` (BUSINESS_ADMIN)

**Logic BE:** Trong `AuditLog` entity, `targetId` (hoặc field tương đương) lưu ID của đối tượng bị tác động. Khi `targetUserId` được truyền, filter thêm điều kiện `entityType = 'users' AND targetId = targetUserId`.

### Option B (Đơn giản hơn) — Dedicated endpoint `GET /users/:userId/audit-logs`

```
GET /api/v1/users/:userId/audit-logs?page=1&limit=10
```

Trả về logs liên quan đến user đó với tư cách **đối tượng bị tác động** (entity = 'users', targetId = userId).

---

## 3. Response format kỳ vọng

Giữ nguyên cấu trúc response của `GET /audit-logs` hiện tại:

```json
{
  "success": true,
  "data": [
    {
      "id": "log-uuid",
      "timestamp": "2026-08-10T08:32:15.000Z",
      "actorName": "Nguyễn Văn Admin",
      "actorEmail": "admin@company.com",
      "action": "LOCK_USER",
      "entity": "users",
      "status": "success",
      "description": "Tạm khóa tài khoản: nguyen.van.a@company.com",
      "ipAddress": "192.168.1.15",
      "payload": {
        "reason": "Vi phạm quy định bảo mật"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Các field FE sử dụng:**

| Field | Mô tả |
|---|---|
| `id` | Key cho React list rendering |
| `timestamp` | Thời điểm xảy ra (FE dùng `new Date(log.timestamp)`) |
| `actorName` | Tên người thực hiện |
| `actorEmail` | Email người thực hiện (fallback nếu không có actorName) |
| `action` | Action code — xem bảng mapping bên dưới |
| `status` | `"success"` hoặc `"failed"` |
| `description` | Mô tả ngắn gọn hành động |

**Action codes FE đang map:**

| Code | Hiển thị |
|---|---|
| `LOGIN` | Đăng nhập |
| `LOGIN_FAILED` | Đăng nhập thất bại |
| `LOGOUT` | Đăng xuất |
| `CREATE_USER` | Thêm tài khoản |
| `UPDATE_USER` | Cập nhật tài khoản |
| `LOCK_USER` | Khóa tài khoản |
| `UNLOCK_USER` | Mở khóa tài khoản |
| `DELETE_USER` | Xóa tài khoản |
| `REGISTER_DEVICE` | Đăng ký thiết bị |
| `EXPORT_USERS` | Xuất tệp nhân viên |

---

## 4. Các action logs cần thiết cho màn hình User Management

Để modal "Lịch sử hoạt động" có ý nghĩa với Business Admin, BE cần đảm bảo ghi log cho các action sau với `targetId = userId` và `entityType = 'users'`:

| Hành động | Action code | Ghi log hiện tại? |
|---|---|---|
| Tạo tài khoản | `CREATE_USER` | Cần xác nhận |
| Cập nhật thông tin | `UPDATE_USER` | Cần xác nhận |
| Khóa tài khoản | `LOCK_USER` | Cần xác nhận |
| Mở khóa tài khoản | `UNLOCK_USER` | Cần xác nhận |
| Xóa tài khoản | `DELETE_USER` | Cần xác nhận |
| Đổi vai trò | `UPDATE_USER_ROLES` | Cần xác nhận |
| Gia hạn tài khoản đối tác | `UPDATE_USER` | Cần xác nhận |

---

## 5. FE sẽ cập nhật sau khi BE hoàn thiện

Khi BE hỗ trợ `targetUserId` (Option A) hoặc endpoint mới (Option B), FE sẽ:

- **Option A:** Đổi call trong `getUserAuditLogs(userId)` từ `?userId=X` thành `?targetUserId=X`
- **Option B:** Đổi call sang `GET /users/:userId/audit-logs`

File cần sửa: `src/service/businessAdminServices.js` và `src/service/sysAdminServices.js` hàm `getUserAuditLogs`.
