# Yêu cầu Backend: Bổ sung thông tin Chủ xe tại màn ANPR & Hỗ trợ tìm kiếm

**Module:** ANPR (Quản lý nhận diện biển số)
**API Endpoint bị ảnh hưởng:** `GET /anpr/admin/vehicle-history` và `GET /anpr/vehicle-history`

## 1. Thực trạng hiện tại
Tại màn Quản lý ANPR (Lịch sử xe vào ra), API `GET /anpr/admin/vehicle-history` hiện tại chỉ trả về `userId` (từ `payload_json`). FE đang phải hiển thị thô dạng "User #ID" và không có đủ dữ liệu (Tên, Avatar, Phòng ban...) để hiển thị Avatar trực tiếp trên bảng, hay làm Modal chi tiết chủ xe khi click vào theo yêu cầu UI/UX. Hơn nữa, việc tìm kiếm theo "Tên chủ xe" trên giao diện cũng chưa thực hiện được do DTO không hỗ trợ tham số này.

## 2. Hành động cần thiết (BE)

### 2.1. Bổ sung thông tin trả về
Cập nhật logic (JOIN hoặc lookup bảng `users`) để API trả về thêm object `owner` (hoặc `user`) bên cạnh field `userId` hiện tại cho mỗi bản ghi `items`:

```json
"owner": {
  "id": "uuid",
  "fullName": "Nguyễn Văn A",
  "avatarUrl": "https://example.com/avatar.jpg",
  "email": "a.nguyen@email.com",
  "department": "Phòng IT"
}
```
*(Lợi ích: Giúp FE render trực tiếp Avatar và Tên ra bảng hiển thị, đồng thời hiện Modal popup chứa thông tin chi tiết ngay khi click mà không bị N+1 query để lấy thông tin user).*

### 2.2. Hỗ trợ filter (tìm kiếm) theo Tên Chủ xe
Bổ sung tham số truy vấn `ownerName` (hoặc mở rộng ý nghĩa của biến `search` nếu có) vào class `ListVehicleHistoryQueryDto`. Khi FE truyền từ khóa vào tham số này, BE sẽ thực hiện filter matching theo trường `users.fullName`.
