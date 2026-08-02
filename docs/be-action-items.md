# Danh sách công việc Backend (BE) cần xử lý hoặc xác nhận

Dựa trên quá trình đối chiếu API giữa Frontend (FE) và Backend (BE) (tài liệu `fe-be-api-audit.md`), dưới đây là danh sách các hạng mục cần sự tham gia hoặc xác nhận từ team Backend. 

*Lưu ý: Hầu hết các lỗi lệch field/path hiện tại nằm ở phía FE và FE sẽ tự khắc phục. Các hạng mục dưới đây là các gap hoặc điểm mù thực sự cần BE hỗ trợ.*

## 1. Tính năng cần BE phát triển bổ sung (Missing endpoints)

*   **API Check-in cuộc họp (Ticket BE-11)**
    *   **Thực trạng:** FE đang gọi endpoint `POST /meetings/:id/check-in` để thực hiện chức năng điểm danh/check-in vào phòng họp. Tuy nhiên, endpoint này hiện không tồn tại trên BE.
    *   **Hành động cần thiết (BE):**
        *   Hoàn thiện phát triển ticket BE-11.
        *   Sau khi hoàn thành, cung cấp lại thông tin chính xác về Path và Request Body payload cho FE để tiến hành gọi lại.

## 2. Các điểm BE cần rà soát và xác nhận

*   **Các API ghi nhận điểm danh (Attendance)**
    *   **Thực trạng:** FE đang có các lời gọi API `POST /attendance` và `PATCH /attendance` (nhằm mục đích create, update, invalidate điểm danh). Việc khảo sát Controller BE chưa tìm thấy các route này.
    *   **Hành động cần thiết (BE):** Xác nhận xem BE đã có các route để FE ghi nhận điểm danh thủ công hay chưa. Nếu có, vui lòng cung cấp path chính xác.
*   **Endpoint lấy thông tin Attendance cho Live Meeting**
    *   **Thực trạng:** Hiện tại FE đang sử dụng cả 2 endpoint: `GET /meetings/:id/attendance` và `GET /live-meetings/:id/attendance`, dẫn đến sự chồng chéo.
    *   **Hành động cần thiết (BE):** Xác nhận rõ: Để lấy dữ liệu điểm danh khi đang diễn ra cuộc họp (live) và sau cuộc họp (non-live) thì dùng chung 1 route hay 2 route riêng biệt?
*   **Payload của `UpdateZoneDto` (Module Zones)**
    *   **Thực trạng:** FE đang gửi payload chứa field `device_ids` dạng `snake_case`. Ở các module an ninh khác (Alert, PersonControl), BE có sử dụng `@Expose({ name: 'snake_case' })` nên FE gửi như vậy là hợp lệ.
    *   **Hành động cần thiết (BE):** Kiểm tra class `UpdateZoneDto` xem đã cấu hình decorator `@Expose` để nhận được `device_ids` chưa. Tránh việc NestJS `ValidationPipe` loại bỏ mất field này khi FE gọi lên.

## 3. Đề xuất cải thiện kiến trúc / hệ thống

*   **Cấu hình Swagger (OpenAPI) toàn diện cho BE**
    *   **Nguyên nhân:** Đa số các bug ngầm của FE hiện tại (đoán sai tên field trả về, tạo chuỗi fallback 3-5 tầng) xuất phát từ việc FE và BE không có chung một Data Contract (hợp đồng dữ liệu). Mỗi lần BE thay đổi DTO, FE không hề hay biết và phải sửa chữa bằng cách thêm các câu lệnh điều kiện.
    *   **Đề xuất hành động (BE):** 
        *   BE hiện đang dùng NestJS và đã có dùng rải rác Swagger. Đề xuất team BE cấu hình `@nestjs/swagger` đầy đủ cho các Controller và DTO để tự động sinh ra OpenAPI Specification (`swagger.json`).
        *   Khi BE hoàn thành, FE sẽ sử dụng schema này để tự động generate TypeScript types.
        *   **Lợi ích:** Giải quyết triệt để lỗi gọi sai field name, loại bỏ code dư thừa (fallback conditions), cảnh báo ngay lúc code (intellisense) và lúc biên dịch nếu BE có thay đổi cấu trúc dữ liệu.
