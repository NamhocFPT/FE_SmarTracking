# Tài liệu yêu cầu Backend: Cung cấp API Nhật ký ra/vào khu vực (Zone Access Log)

**Ngày:** 11/08/2026
**Mục tiêu:** Bổ sung endpoint `GET /api/v1/ivss/zones/:zoneId/access-log` trên Backend để hỗ trợ hiển thị danh sách nhật ký ra/vào của một khu vực (Zone) trên giao diện Quản lý Khu vực (Zone Management) của Frontend.

## 1. Chi tiết API
- **Method:** `GET`
- **Path:** `/api/v1/ivss/zones/:zoneId/access-log`
- **Guard:** `JwtAuthGuard`, `PermissionsGuard`
- **Permission bắt buộc:** `ivss.access_log.read` (Giống với nhật ký ra/vào phòng họp)
- **Tham số Query:**
  - `date` (chuỗi YYYY-MM-DD): Lọc theo ngày (giờ Việt Nam). Mặc định là ngày hiện tại.
  - `page` (number): Trang hiện tại. Mặc định là 1.
  - `limit` (number): Số lượng bản ghi trên một trang. Mặc định là 15.
  - `search` (string, optional): Tìm kiếm theo họ tên hoặc email người dùng.

## 2. Yêu cầu xử lý nghiệp vụ (Backend)
1. **Kiểm tra Zone:** Xác minh khu vực `zoneId` tồn tại trong cơ sở dữ liệu và không bị xóa mềm (`deleted_at IS NULL`). Nếu không tồn tại, trả về `404 Not Found`.
2. **Truy vấn dữ liệu:**
   - Truy vấn từ bảng sự kiện hiện diện khu vực (`zone_presence_events` / `ZonePresenceEventEntity`).
   - Lọc các bản ghi khớp với `zoneId` và có thời gian sự kiện (`event_time`) nằm trong ngày `date` (quy đổi theo múi giờ Việt Nam `Asia/Ho_Chi_Minh`).
   - Kết nối (Join) với bảng người dùng (`users`) để lấy thông tin chi tiết: Họ tên (`fullName`), Email (`email`), Ảnh đại diện (`avatarUrl`), Mã nhân viên (`employeeCode`), và Phòng ban (`department`).
   - Hỗ trợ phân trang và lọc `search` (khớp tương đối theo tên/email người dùng).
3. **Định dạng kết quả trả về:** Trả về cấu trúc tương thích với giao diện hiển thị nhật ký của Frontend:
   ```json
   {
     "success": true,
     "message": "Zone access log retrieved successfully",
     "data": {
       "events": [
         {
           "id": "event-uuid-1",
           "eventTime": "2026-08-11T10:15:30.000Z",
           "direction": "enter", // enter | leave | appear
           "matchState": "matched", // matched | unmatched_stranger | unmatched_verify
           "user": {
             "id": "user-uuid",
             "fullName": "Nguyễn Văn A",
             "email": "nguyenvana@example.com",
             "employeeCode": "NV001",
             "avatarUrl": "https://example.com/avatar.jpg"
           }
         }
       ],
       "pagination": {
         "total": 1,
         "page": 1,
         "limit": 15,
         "totalPages": 1
       }
     }
   }
   ```
