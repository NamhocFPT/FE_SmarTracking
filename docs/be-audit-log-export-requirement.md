# Tài liệu yêu cầu Backend: Xuất báo cáo Nhật ký hệ thống (Export Audit Logs) & Chuẩn hóa Tiếng Việt

**Ngày:** 12/08/2026
**Mục tiêu:** Cung cấp tài liệu yêu cầu Backend bổ sung/cập nhật tính năng xuất tệp Excel nhật ký kiểm toán hệ thống (`GET /api/v1/audit-logs/export`), đồng thời thực hiện chuyển đổi ngôn ngữ chuẩn chuyên ngành bằng tiếng Việt rõ ràng cho các trường dữ liệu trước khi điền vào file Excel.

## 1. Chi tiết API
- **Method:** `GET`
- **Path:** `/api/v1/audit-logs/export`
- **Guard:** `JwtAuthGuard`, `PermissionsGuard`
- **Permission bắt buộc:** `audit.system.read` (Chỉ dành cho SYSTEM_ADMIN)
- **Tham số Query:**
  - `from` (ISO 8601 string, bắt buộc): vd `2026-01-01T00:00:00Z`
  - `to` (ISO 8601 string, bắt buộc): vd `2026-12-31T23:59:59Z`
  - `userId` (UUID, tùy chọn): lọc theo người thực hiện.
  - `actionType` (string, tùy chọn): lọc theo loại hành động (vd `LOGIN`).
  - `entityType` (string, tùy chọn): lọc theo loại đối tượng (vd `users`).
  - `severity` (enum, tùy chọn): `info` | `warning` | `error` | `critical`

- **Định dạng file Excel:**
  - File Excel (.xlsx) trả trực tiếp trong Response body.
  - **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - **Content-Disposition:** `attachment; filename="nhat-ky-he-thong-YYYYMMDD-HHmmss.xlsx"`
  - **Giới hạn dòng:** Tối đa 50.000 dòng. Nếu vượt quá, hiển thị dòng cảnh báo chữ màu đỏ ở dưới cùng.

---

## 2. Chuẩn hóa Ngôn ngữ & Chuyển dịch tiếng Việt trong file Excel
Để đảm bảo từ ngữ hiển thị chuẩn chuyên ngành và dễ hiểu cho người dùng, Backend cần ánh xạ dịch các trường dữ liệu thô (raw database strings) sang tiếng Việt như mô tả bên dưới:

### A. Chuẩn hóa Hành động (Action Type)
Chuyển đổi tên hành động viết hoa dạng SNAKE_CASE sang cụm từ tiếng Việt tương ứng:

| Mã Hành động (Raw) | Từ dịch tiếng Việt (Chuẩn hóa) |
| :--- | :--- |
| `LOGIN` | Đăng nhập |
| `LOGIN_FAILED` | Đăng nhập thất bại |
| `LOGOUT` | Đăng xuất |
| `CREATE_USER` | Thêm tài khoản |
| `UPDATE_USER` | Cập nhật tài khoản |
| `LOCK_USER` | Khóa tài khoản |
| `UNLOCK_USER` | Mở khóa tài khoản |
| `DELETE_USER` | Xóa tài khoản |
| `REGISTER_DEVICE` | Đăng ký thiết bị |
| `UPDATE_DEVICE` | Cập nhật thiết bị |
| `REMOVE_DEVICE` | Vô hiệu hóa thiết bị |
| `DEVICE_OFFLINE` | Thiết bị mất kết nối |
| `EXPORT_USERS` | Xuất tệp nhân viên |
| `UPDATE_CONFIG` | Cập nhật cấu hình hệ thống |

*Đối với các hành động khác chưa nằm trong danh sách trên:* Chuyển chuỗi về chữ thường, thay thế dấu gạch dưới `_` bằng khoảng trắng, dịch các từ khóa phổ biến (`create` -> `Tạo mới`, `update` -> `Cập nhật`, `delete` -> `Xóa`, `view detail` -> `Xem chi tiết`, `read analytics` -> `Xem thống kê`) và viết hoa chữ cái đầu tiên.

### B. Chuẩn hóa Loại đối tượng (Entity Type)
Ánh xạ các phân hệ đối tượng sang từ ngữ nghiệp vụ tiếng Việt:

| Mã phân hệ (Raw) | Từ dịch tiếng Việt (Chuẩn hóa) |
| :--- | :--- |
| `auth` | Hệ thống xác thực |
| `users` | Quản lý tài khoản |
| `iot-devices` | Giám sát thiết bị IoT |
| `rooms` | Quản lý phòng họp |
| `system-configurations` | Cấu hình hệ thống |

### C. Chuẩn hóa Mức độ nghiêm trọng (Severity)
Ánh xạ mức độ kiểm toán sang tiếng Việt:

| Mã mức độ (Raw) | Từ dịch tiếng Việt (Chuẩn hóa) |
| :--- | :--- |
| `info` | Thành công |
| `warning` | Cảnh báo |
| `error` | Thất bại |
| `critical` | Nghiêm trọng |

---

## 3. Cấu trúc 7 Cột trong Excel
File Excel xuất ra phải đảm bảo chính xác thứ tự 7 cột sau đây (dữ liệu đã được dịch tiếng Việt):
1. **Thời gian** (Định dạng: `dd/MM/yyyy HH:mm:ss` theo giờ Việt Nam `Asia/Ho_Chi_Minh`)
2. **Người thực hiện** (Actor Name)
3. **Mã người thực hiện** (Actor User ID)
4. **Hành động** (Action Type đã được dịch)
5. **Loại đối tượng** (Entity Type đã được dịch)
6. **Mã đối tượng** (Entity ID)
7. **Mức độ** (Severity đã được dịch)
