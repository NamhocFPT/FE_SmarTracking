# Tài liệu yêu cầu Backend: Bổ sung trường avatarUrl cho API duyệt ảnh sinh trắc học

**Ngày:** 11/08/2026
**Mục tiêu:** Bổ sung trường `avatarUrl` (ảnh đại diện hiện tại) của người dùng trong kết quả trả về của API duyệt ảnh sinh trắc học để Frontend hiển thị avatar của người dùng trực tiếp trên bảng danh sách.

## 1. API Danh sách yêu cầu duyệt sinh trắc học
- **Endpoint:** `GET /api/v1/admin/biometric-submissions`
- **Vấn đề hiện tại:** Đối tượng người dùng trả về trong danh sách (`user`) chưa có trường `avatarUrl`, dẫn đến Frontend chỉ hiển thị được ký tự đầu tên của người dùng dưới dạng fallback.
- **Yêu cầu bổ sung:** Bổ sung trường `avatarUrl` (hoặc `avatar_url` - kiểu String chứa URL của ảnh đại diện) vào bên trong đối tượng `user`.

### Cấu trúc Response đề xuất:
```json
{
  "success": true,
  "data": [
    {
      "id": "fp-123",
      "status": "pending_review",
      "submittedAt": "2026-08-11T09:00:00Z",
      "user": {
        "id": "u-456",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "avatarUrl": "https://api.smartracking.io.vn/uploads/avatars/u-456.jpg",
        "employeeCode": "EMP001",
        "department": {
          "id": "d-1",
          "name": "Phòng Công nghệ Thông tin"
        }
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 2. API Chi tiết yêu cầu duyệt sinh trắc học
- **Endpoint:** `GET /api/v1/admin/biometric-submissions/:id`
- **Yêu cầu bổ sung:** Tương tự như API danh sách, đối tượng `user` lồng trong kết quả chi tiết cũng cần có trường `avatarUrl` (hoặc `avatar_url`) để hiển thị đồng bộ trong Modal xem chi tiết thông tin người dùng.
