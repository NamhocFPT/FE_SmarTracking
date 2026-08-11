# Tài liệu yêu cầu Backend: Hỗ trợ tìm kiếm tài khoản theo Mã nhân viên (Employee Code)

**Ngày:** 11/08/2026
**Mục tiêu:** Mở rộng khả năng tìm kiếm của API danh sách người dùng (`/users`) để cho phép tìm kiếm theo Mã nhân viên (employeeCode) bên cạnh Họ tên và Email hiện tại. Điều này hỗ trợ tính năng chọn nhân viên nhanh chóng tại các ô tìm kiếm Autocomplete trên giao diện Frontend.

## 1. API Đặc tả thay đổi
- **Endpoint:** `GET /api/v1/users` (hoặc `GET /users` tùy thuộc vào định tuyến phân hệ)
- **Vấn đề hiện tại:** Tham số `search` trong `ListUsersQueryDto` chỉ thực hiện lọc người dùng theo Họ tên (`fullName`) hoặc Email (`email`). Chưa lọc theo Mã nhân viên (`employeeCode`).
- **Yêu cầu bổ sung:**
  1. Khi nhận được tham số query `search` (ví dụ: `?search=NV01`), câu lệnh truy vấn cơ sở dữ liệu của Backend cần khớp thêm trường `employeeCode` bằng toán tử `LIKE` hoặc `ILIKE` (hoặc so khớp tương đương trên cơ sở dữ liệu đang dùng):
     ```sql
     WHERE full_name ILIKE '%search%' 
        OR email ILIKE '%search%' 
        OR employee_code ILIKE '%search%'
     ```
  2. Đảm bảo rằng đối tượng người dùng trả về trong mảng `data` (UserListItemDto) chứa trường `employeeCode` (hoặc `employee_code`) dạng chuỗi văn bản (String) để Frontend có thể hiển thị mã nhân viên trên giao diện dropdown autocomplete.

### Ví dụ Response trả về:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-1",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "employeeCode": "NV001",
      "accountStatus": "active"
    },
    {
      "id": "user-uuid-2",
      "fullName": "Trần Thị B",
      "email": "tranthib@example.com",
      "employeeCode": "NV002",
      "accountStatus": "active"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 15,
    "totalPages": 1
  }
}
```
