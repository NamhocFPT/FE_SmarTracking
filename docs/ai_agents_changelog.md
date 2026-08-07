# AI Agents Changelog

Tài liệu này dùng để AI Agents tự động ghi lại lịch sử các thay đổi, kế hoạch đã thực thi và các file đã cập nhật trong quá trình hỗ trợ người dùng phát triển dự án.
Quy tắc bắt buộc: AI Agent phải luôn ghi log vào cuối mỗi lần thực hiện task có làm thay đổi code.

## Lịch sử thay đổi

### 2026-08-07 16:44
* **Tên Plan / Yêu cầu**: Sửa lỗi báo trùng phòng ("Phòng hiện tại không còn trống") sai lệch khi chỉnh sửa thông tin cuộc họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx` và `src/pages/employee/MeetingDetail.jsx`:
    * Sửa lỗi so sánh kiểu dữ liệu bất đồng bộ giữa ID phòng trả về từ API (number) và ID từ `<select>` (string) bằng cách ép kiểu `String()`.
    * Chuẩn hóa thời gian lưu trong CSDL về định dạng ISO (`.toISOString()`) trước khi so sánh với thời gian người dùng đang chọn trên form, tránh tình trạng báo sai thời gian bị thay đổi do khác định dạng múi giờ / mili-giây.
    * Đảm bảo nếu người dùng không thay đổi khung giờ, phòng hiện tại luôn được tính là hợp lệ (bỏ qua warning).
* **Trạng thái**: Hoàn thành

### 2026-08-07 16:37
* **Tên Plan / Yêu cầu**: Thêm tính năng kéo thả (Drag & Drop) để sắp xếp thứ tự Agenda trong cuộc họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx` và `src/pages/employee/MeetingDetail.jsx`:
    * Áp dụng tính năng kéo thả gốc của HTML5 (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) vào danh sách hiển thị Agenda.
    * Bổ sung biểu tượng `GripVertical` vào đầu mỗi mục Agenda để biểu thị có thể kéo thả.
    * Thêm state `draggedAgendaIndex` để quản lý giao diện trạng thái khi đang kéo (thêm hiệu ứng làm mờ và đổi màu nền).
    * Khi thả chuột, logic tự động thực hiện hoán đổi vị trí trong mảng `agendaList` và cập nhật lại `orderIndex`.
* **Trạng thái**: Hoàn thành

### 2026-08-07 16:32
* **Tên Plan / Yêu cầu**: Loại bỏ Đặt cuộc họp và xem lịch họp đối với Business Admin và Sysadmin
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/routers/index.js`: Xóa các route liên quan đến `book` (Đăng ký họp) và `schedule` (Lịch cá nhân) của khối SystemAdmin và BusinessAdmin.
  * `[Cập nhật] src/pages/systemAdmin/layout/SystemAdminLayout.jsx`: Xóa menu `Lịch của tôi` và `Đăng ký cuộc họp`.
  * `[Cập nhật] src/pages/bussinessAdmin/layout/BusinessAdminLayout.jsx`: Xóa menu `Lịch cá nhân` và `Đăng ký họp`.
* **Trạng thái**: Hoàn thành

### 2026-08-07 16:24
* **Tên Plan / Yêu cầu**: Sửa lỗi sắp xếp nhật ký ra/vào phòng họp (Room Access Logs) bị lệch giữa các trang
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/RoomAccessLogs.jsx`: 
    * Chuyển đổi từ phân trang Server-side sang Client-side (tải toàn bộ sự kiện thay vì tải từng trang).
    * Do Backend áp đặt `limit` tối đa là 100 bản ghi mỗi lần gọi, tôi đã cấu hình Frontend tự động gọi API `Promise.all` để fetch liên tục các trang còn lại (nếu có) gom về một mảng chung duy nhất trước khi sắp xếp.
    * Sắp xếp cục bộ trên toàn bộ mảng dữ liệu (mới nhất lên trước) sau đó mới tiến hành phân trang (`slice()`) ra từng trang nhỏ (10 dòng/trang). Điều này giải quyết triệt để lỗi trang 2 có thời gian mới hơn trang 1 do API Backend không hỗ trợ sắp xếp.
* **Trạng thái**: Hoàn thành

### 2026-08-07 16:13
* **Tên Plan / Yêu cầu**: Sắp xếp Nhật ký Hành trình chi tiết (mới nhất lên trước) và thêm phân trang
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/UserJourney.jsx`: 
    * Thêm logic tính toán `sortedEvents` để sắp xếp danh sách `journeyData.events` theo chiều giảm dần của trường `time` (mới nhất hiển thị đầu tiên).
    * Thêm State `page` và hằng số `eventsPerPage = 10` để chia danh sách thành nhiều trang.
    * Thêm giao diện điều hướng phân trang (Pagination) ở cuối danh sách nhật ký hành trình.
* **Trạng thái**: Hoàn thành

### 2026-08-07 15:56
* **Tên Plan / Yêu cầu**: Hiển thị thời gian gần nhất và số lần tái phạm cho Security Alerts
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/SecurityAlerts.jsx`: 
    * Chỉnh sửa hiển thị cột **Thời gian**: bổ sung `updated_at` làm thời gian ưu tiên (thể hiện thời điểm tái phạm gần nhất). Vẫn giữ `created_at` (thời điểm xảy ra lần đầu) hiển thị phụ nhỏ hơn phía dưới.
    * Chỉnh sửa hiển thị cột **Loại & Mức độ**: Thêm một Badge nổi bật (Đã xảy ra: N lần) khi có `occurrence_count > 1` (cho biết cảnh báo này đã bị tái diễn, trùng lặp nhiều lần thay vì là sự kiện duy nhất).
* **Trạng thái**: Hoàn thành

### 2026-08-07 15:48
* **Tên Plan / Yêu cầu**: Bật lại tính năng bắt buộc nộp sinh trắc học khi đăng nhập, loại trừ SysAdmin & BusinessAdmin
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/component/BiometricReminder/BiometricReminderModal.jsx`: 
    * Kiểm tra mảng `roles` của người dùng. Nếu là `SYSTEM_ADMIN` hoặc `BUSINESS_ADMIN`, module lập tức return (bỏ qua hoàn toàn cơ chế kiểm tra và popup nộp ảnh).
    * Đối với người dùng khác, đổi biến `isForced = needsUpload` để bắt buộc hiển thị popup và tự động nhảy vào luồng camera (webcam phase) nếu trạng thái ảnh là `not_uploaded` hoặc `rejected` mà không cho phép tắt.
* **Trạng thái**: Hoàn thành

### 2026-08-07 15:33
* **Tên Plan / Yêu cầu**: Chuyển màn hình Duyệt ảnh đại diện sang Business Admin
* **Chi tiết thay đổi**:
  * `[Di chuyển] src/pages/manager/BiometricSubmissionsReview.jsx` -> `src/pages/bussinessAdmin/BiometricSubmissionsReview.jsx`: Di chuyển file vật lý của giao diện Duyệt ảnh.
  * `[Cập nhật] src/routers/index.js`: Thay đổi đường dẫn import và dời route `biometric-submissions` từ block `ManagerLayout` sang `BusinessAdminLayout`.
  * `[Cập nhật] src/pages/manager/layout/ManagerLayout.jsx`: Xóa menu "Sinh trắc học FaceID" khỏi điều hướng của Manager.
  * `[Cập nhật] src/pages/bussinessAdmin/layout/BusinessAdminLayout.jsx`: Thêm menu "Duyệt ảnh sinh trắc học" vào nhóm Quản lý của Business Admin.
* **Trạng thái**: Hoàn thành

### 2026-08-07 15:10
* **Tên Plan / Yêu cầu**: Cải thiện thông báo lỗi 403 Forbidden cho chức năng Resync
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/UserManagement.jsx`: Thêm khối điều kiện bắt lỗi 403 trong `handleResyncPortrait` để hiển thị cảnh báo thiếu quyền rõ ràng trên giao diện thay vì lỗi chung chung.
* **Trạng thái**: Hoàn thành

### 2026-08-07 14:53
* **Tên Plan / Yêu cầu**: Thêm nút "Đồng bộ lại" nhận diện khuôn mặt (Portrait Resync)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/businessAdminServices.js`: Thêm API `resyncUserPortrait`.
  * `[Cập nhật] src/pages/bussinessAdmin/UserManagement.jsx`: Thêm nút "Đồng bộ lại" vào modal chi tiết người dùng, cạnh trạng thái FaceID (chỉ hiển thị khi `hasFaceProfile === true`). Bắt lỗi 404 để hiện thông báo chính xác và hiển thị toast sau khi request thành công.
* **Trạng thái**: Hoàn thành

### 2026-08-07 14:42
* **Tên Plan / Yêu cầu**: Fix lỗi compile từ webpack (unused vars & missing export)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/RolePermissionManagement.jsx`: Xóa import `updateRole` không sử dụng để sửa lỗi `no-unused-vars`.
  * `[Cập nhật] src/service/managerServices.js`: Thêm hàm `getAvailableRoomsForMeeting` đã bị thiếu export.
* **Trạng thái**: Hoàn thành

### 2026-08-07 14:39
* **Tên Plan / Yêu cầu**: Cập nhật hàm lấy phòng trống trong real-time debounce effect
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx`: Thay thế `getAvailableRooms` bằng `getAvailableRoomsForMeeting(meeting.id, ...)` để giữ lại phòng hiện tại khi đổi giờ.
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`: Tương tự bên manager, thay thế `getAvailableRooms` bằng `getAvailableRoomsForMeeting(meeting.id, ...)` trong hiệu ứng debounce.
* **Trạng thái**: Hoàn thành

### 2026-08-07 14:38
* **Tên Plan / Yêu cầu**: Cấu hình tự động đọc rule và ghi log cho AI Agents
* **Chi tiết thay đổi**:
  * `[Tạo mới] docs/ai_agents_changelog.md`: Khởi tạo file để lưu lại nhật ký chỉnh sửa của AI.
  * `[Cập nhật] .agents/AGENTS.md`: Thêm rule bắt buộc ghi log vào cuối file.
  * `[Cập nhật] src/docs/AGENTS.md`: Thêm chi tiết cấu trúc bắt buộc và định dạng của việc ghi log (phần AI ACTION LOGGING RULES).
* **Trạng thái**: Hoàn thành
