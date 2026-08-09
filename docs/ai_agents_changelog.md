# AI Agents Changelog

Tài liệu này dùng để AI Agents tự động ghi lại lịch sử các thay đổi, kế hoạch đã thực thi và các file đã cập nhật trong quá trình hỗ trợ người dùng phát triển dự án.
Quy tắc bắt buộc: AI Agent phải luôn ghi log vào cuối mỗi lần thực hiện task có làm thay đổi code.

## Lịch sử thay đổi

### 2026-08-09 11:27
* **Tên Plan / Yêu cầu**: Sửa form Device Management cho ip_camera + RTSP (Ưu tiên cao).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/DeviceManagement.jsx`:
    * Sửa giá trị dropdown Loại thiết bị từ `camera` thành chuẩn BE `ip_camera`.
    * Cải tiến Modal Cấu hình RTSP: Tách trường nhập liệu `rtsp_url` đơn lẻ thành các trường riêng biệt (`Protocol`, `Host`, `Port`, `Path`, `Username`, `Password`) theo đúng DTO của Backend.
    * Đổi logic hiển thị RTSP: Đọc dữ liệu đúng từ `metadata_json.rtsp_config` thay vì top-level `stream_url`.
    * Sửa logic bộ lọc trên bảng danh sách để lọc chuẩn xác loại thiết bị `ip_camera`.
* **Trạng thái**: Hoàn thành

### 2026-08-09 11:15
* **Tên Plan / Yêu cầu**: Hoàn thiện Frontend theo báo cáo sửa lỗi hiển thị tài liệu đính kèm Agenda (Live Meeting) - Phần 2.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Tích hợp thư viện `docx-preview` để hiển thị trước tài liệu Word (.docx, .doc) trực tiếp trên trình duyệt bằng cách đọc blob từ API.
    * Sửa triệt để lỗi bị trình duyệt chặn pop-up khi tải tài liệu đính kèm. Thay thế toàn bộ `window.open` bằng kỹ thuật tạo thẻ `<a>` ẩn (`document.createElement('a')`) kèm thuộc tính `download` để kích hoạt trình tải xuống mặc định của trình duyệt.
    * Xác minh các thay đổi trước đó (Đổi tên "Tệp đa phương tiện" thành "Bản ghi cuộc họp", nạp agenda trực tiếp từ API, đồng bộ qua WebSocket `agenda:changed`) đều đã được tích hợp thành công.
* **Trạng thái**: Hoàn thành

### 2026-08-09 01:10
* **Tên Plan / Yêu cầu**: Cập nhật endpoint API Đổi ảnh đại diện (Đồng bộ với thay đổi Refactor từ Backend).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/avatarService.js`:
    * Đổi endpoint của hàm `updateSelfAvatar` từ `/me/avatar-submission` (đã bị xóa trên BE gây lỗi 404) sang `/me/avatar` chuẩn xác theo kiến trúc mới.
    * Gỡ bỏ field `consentAccepted` khỏi payload vì route đổi ảnh đại diện không yêu cầu xác nhận quy định sinh trắc học.
    * Viết lại Document/Comment mô tả rõ ràng phân biệt 2 luồng: Đổi avatar hồ sơ (`/me/avatar`) và Nộp ảnh FaceID (`/me/biometric-submission`).
* **Trạng thái**: Hoàn thành

### 2026-08-09 00:52
* **Tên Plan / Yêu cầu**: Nâng cấp UI/UX màn hình phòng họp (Layout Header & Thanh công cụ).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Tái cấu trúc lại Header: Đặt Logo nằm ở một phía bên trái, bên cạnh là Tên cuộc họp và Tên phòng họp xếp chồng gọn gàng thành 2 dòng, được căn chỉnh hoàn hảo thông qua Flexbox (có vạch ngăn cách mờ).
    * Thiết kế lại nút Quay lại (Back): Chuyển thành dạng nút tròn (circular button) hiện đại, sử dụng icon `IoArrowBack` mới với hiệu ứng trượt nhẹ (animation) khi trỏ chuột vào.
    * Nâng cấp toàn diện thanh công cụ (Bottom Control Bar): Thay thế toàn bộ Icon `lucide-react` bằng bộ Icon xịn xò, sắc nét hơn từ `react-icons/io5` (Ionicons). Các nút bấm cũng được bo góc (rounded-2xl) to hơn, đổ bóng `shadow-sm` giúp mang lại cảm giác bấm (touch-target) cực kỳ cao cấp giống giao diện ứng dụng quốc tế.
* **Trạng thái**: Hoàn thành

### 2026-08-09 00:43
* **Tên Plan / Yêu cầu**: Cập nhật Frontend theo báo cáo sửa lỗi hiển thị tài liệu đính kèm Agenda (Live Meeting).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx` & `src/pages/manager/MeetingDetail.jsx`:
    * Sửa cơ chế lưu file Agenda: Ghép file với mục Agenda trả về từ API thông qua `id` (nếu có) hoặc `title` thay vì dựa theo thứ tự mảng `index`, để tránh đính kèm nhầm file nếu BE trả về mảng bị đảo lộn.
    * Bổ sung cơ chế thông báo lỗi: Thu thập chi tiết các lỗi trong quá trình upload file (nếu có) và hiển thị cảnh báo cụ thể (file nào lỗi, lý do gì) cho người dùng, thay vì báo thành công ảo và ghi log âm thầm.
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Loại bỏ việc nạp danh sách `agenda` từ `localStorage` cache, buộc nạp trực tiếp bằng dữ liệu từ API để tránh rò rỉ dữ liệu khi đăng nhập nhiều tài khoản trên cùng trình duyệt.
    * Tính năng đồng bộ thời gian thực: Khi Host bấm chuyển Agenda, FE sẽ tự động phát sóng (`emit`) sự kiện Socket `agenda:changed` kèm vị trí Agenda mới, đồng thời các Participant cũng sẽ tự động chuyển UI theo khi nhận sự kiện này (Yêu cầu BE hỗ trợ hứng và phát sự kiện tương ứng nếu cần thiết).
    * Thay đổi hiển thị UI: Đổi tên section "Tệp đa phương tiện" thành "Bản ghi cuộc họp" để tránh sự hiểu lầm của người dùng.
* **Trạng thái**: Hoàn thành

### 2026-08-09 00:23
* **Tên Plan / Yêu cầu**: Điều chỉnh kích thước Logo và căn lề tiêu đề phòng họp theo chuẩn Design System.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Tái cấu trúc Flexbox (sử dụng `flex-col`, `gap-1` và căn chỉnh text) tại thanh Header để đảm bảo khoảng cách trên/dưới và căn giữa hoàn hảo giữa Logo - Tên cuộc họp - Tên phòng.
    * Thay đổi tỷ lệ ảnh Logo sang `h-7 w-auto` (Thay vì ép vuông tỷ lệ lớn gây mất thẩm mỹ) để Logo SmarTracking hiển thị đúng hình dạng chuẩn thiết kế hệ thống, không bị quá to.
    * Đưa Box chứa Logo ở màn hình Lobby về chuẩn tỷ lệ `w-20 h-20` cùng các hiệu ứng đổ bóng (drop-shadow) gọn gàng, tinh tế hơn.
* **Trạng thái**: Hoàn thành

### 2026-08-09 00:18
* **Tên Plan / Yêu cầu**: Cập nhật ảnh Logo đúng chuẩn (SmarTracking.png).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Đổi đường dẫn file Logo từ `logo.png` (Logo icon) sang `SmarTracking.png` để hiển thị logo chính thức (có chữ) trên thanh Header và màn hình chờ Lobby của phòng họp.
* **Trạng thái**: Hoàn thành

### 2026-08-09 00:09
* **Tên Plan / Yêu cầu**: Khắc phục lỗi thông báo (Toast) bị kẹt và tiếp tục làm lớn Logo Web.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Chỉnh sửa lại hàm render Toast Notification: Cập nhật cơ chế sinh ID ngẫu nhiên ổn định hơn để `setTimeout` xóa thông báo tự động (sau 3.5s) hoạt động chính xác tuyệt đối.
    * Bổ sung thêm nút **[x] (Đóng)** bên cạnh mỗi thông báo và bật `pointer-events-auto`, giúp bạn có thể tự tay bấm tắt ngay lập tức mà không cần phải chờ hết thời gian.
    * **Phóng to thêm Logo Web:** Tăng kích thước hộp chứa và ảnh Logo ở thanh Header (w-10, scale 1.3) và đặc biệt là ở màn hình chờ Lobby (box lớn w-28, ảnh scale 1.4) để Logo thực sự nổi bật và dễ nhìn hơn nữa.
* **Trạng thái**: Hoàn thành

### 2026-08-08 23:48
* **Tên Plan / Yêu cầu**: Sửa lỗi không hiển thị Khách ngoài (Guest) trên Grid Video sau khi được duyệt.
* **Chi tiết thay đổi**:
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/GuestPanel.jsx`: Đổi prop `onGuestCountChange` thành `onGuestsUpdate` để truyền danh sách khách đã duyệt lên Component cha.
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Thay đổi cách render `GuestPanel`: Luôn mount ngầm (ẩn bằng CSS `hidden` khi ở tab khác) thay vì unmount. Việc này giúp duy trì gọi API lấy dữ liệu liên tục ở background, khắc phục triệt để lỗi mất danh sách khách khi reload trang hoặc khi đang ở tab khác.
    * Gỡ bỏ điều kiện giới hạn tab: Đảm bảo Khách ngoài đã duyệt luôn luôn xuất hiện trên lưới Video ở bất kỳ Tab nào (Bằng cách gộp chung vào `activeGridParticipants` mà không cần ràng buộc `activeChatTab`).
* **Trạng thái**: Hoàn thành

### 2026-08-08 23:38
* **Tên Plan / Yêu cầu**: Đổi biểu tượng cuộc họp thành Logo Website (SmarTracking).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Thay thế biểu tượng mặc định (`Sparkles` từ `lucide-react`) thành Logo chính thức của trang web (`src/assets/images/logo.png`) tại 2 vị trí: Header thu gọn và Màn hình Lobby chờ duyệt.
    * Tăng đáng kể kích thước hiển thị của Logo và Tên cuộc họp (Header: tăng từ text-sm lên text-lg, logo to hơn; Lobby: tăng box từ w-14 lên w-20, chữ từ text-xl lên text-2xl) giúp giao diện nổi bật, dễ đọc và đẹp mắt hơn.
* **Trạng thái**: Hoàn thành

### 2026-08-08 23:32
* **Tên Plan / Yêu cầu**: Format và CSS lại input chọn giờ sang dạng cuộn xoay (scroll wheel).
* **Chi tiết thay đổi**:
  * `[Thêm mới] src/components/common/TimePicker.jsx`: Tạo Component chọn thời gian tùy chỉnh sử dụng hiệu ứng xoay 2 trục (Giờ/Phút) với `snap-y mandatory` và lớp phủ Mask-image để tạo cảm giác scroll 3D giống trên iOS.
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx`:
    * Thay thế thư viện `react-datepicker` bằng component `TimePicker` tự build giúp trải nghiệm cuộn mượt mà hơn và mang lại cảm giác native.
* **Trạng thái**: Hoàn thành

### 2026-08-08 23:26
* **Tên Plan / Yêu cầu**: Cập nhật tính năng kéo thả (Drag & Drop) cho Agenda ở màn hình Đặt lịch họp.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`: Bổ sung tính năng kéo thả (Drag & Drop) bằng HTML5 native để người dùng có thể dễ dàng thay đổi thứ tự các chương trình họp (Agenda) tương tự như bên màn hình Chi tiết cuộc họp. Các Agenda thêm mới vẫn giữ nguyên cơ chế đẩy xuống cuối danh sách (append) như cũ, nhưng giờ đây có thể tự do sắp xếp lại.
* **Trạng thái**: Hoàn thành

### 2026-08-08 23:20
* **Tên Plan / Yêu cầu**: Khắc phục triệt để lỗi hiển thị 12h (AM/PM) trên các trường chọn thời gian.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx`:
    * Thay thế hoàn toàn thẻ `<input type="time">` gốc của trình duyệt (vốn bị ảnh hưởng và ép buộc định dạng theo ngôn ngữ/vùng của Hệ điều hành, gây ra lỗi hiển thị SA/CH) bằng component `<DatePicker>` của thư viện `react-datepicker` với thuộc tính `showTimeSelectOnly`. Đảm bảo hiển thị chuẩn xác định dạng 24h (`HH:mm`) cho mọi hệ điều hành và thiết bị.
* **Trạng thái**: Hoàn thành

### 2026-08-08 16:32
* **Tên Plan / Yêu cầu**: Cải thiện UI Modal thông tin chủ xe và ẩn UserID.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/ANPRManagement.jsx`:
    * Di chuyển Inline Modal ra khỏi stacking context bằng `createPortal` (React Portal) để đảm bảo hiệu ứng `backdrop-blur` phủ mờ toàn màn hình 100%. Tăng độ mờ nền và đẩy `z-index` lên cao nhất (`z-[9999]`).
    * Gỡ bỏ hoàn toàn việc hiển thị `userId` thô trong bảng. Tất cả những lượt quét không có dữ liệu chủ xe (`owner`) đều sẽ hiển thị một Logo Ảnh Đại Diện xám mặc định (không kèm văn bản) thay vì chữ "Người lạ" để giao diện gọn gàng và tương đồng với hình ảnh cung cấp.

### 2026-08-08 16:29
* **Tên Plan / Yêu cầu**: Mở rộng sidebar và section khi click vào icon lúc sidebar đang thu gọn.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/layout/SystemAdminSidebar.jsx`: Chỉnh sửa logic `onClick` của Section Header. Nếu sidebar đang ở chế độ mini (`isMini === true`), click vào icon sẽ tự động gọi hàm mở rộng sidebar (`onToggle`) đồng thời mở luôn section đó ra để người dùng dễ dàng chọn các item con bên trong.
* **Trạng thái**: Hoàn thành

### 2026-08-08 16:22
* **Tên Plan / Yêu cầu**: Tích hợp dữ liệu Owner từ Backend vào bảng ANPR và tạo Modal nội trú (Inline Modal).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/ANPRManagement.jsx`:
    * Thay đổi logic hiển thị cột "Chủ xe": Kiểm tra nếu API trả về object `owner` thì sẽ hiển thị Avatar và Tên chủ xe, click vào sẽ mở popup Modal nội trú (không cần tách file riêng).
    * Bổ sung hiển thị Icon riêng biệt (màu cam nổi bật có icon Khách/Biển lạ) cho những lượt xe có `matchState === 'unknown'`.
    * Truyền thêm tham số `ownerName` vào API query khi user gõ vào thanh Search để hỗ trợ BE tìm kiếm theo Tên.
* **Trạng thái**: Hoàn thành

### 2026-08-08 15:05
* **Tên Plan / Yêu cầu**: Ẩn các trang không dùng đến và đổi tên "Hệ thống ANPR".
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/layout/SystemAdminLayout.jsx`: Xóa/ẩn các menu item "Danh sách giám sát" (Đối tượng theo dõi) và "Kiểm soát cổng" khỏi Sidebar. Đổi tên menu "Hệ thống ANPR" thành "Kiểm Soát Ra Vào Cổng".
  * `[Cập nhật] src/pages/bussinessAdmin/ANPRManagement.jsx`: Đổi tiêu đề thẻ `<h1>` từ "Quản lý nhận diện biển số (ANPR)" thành "Kiểm soát ra vào cổng".
* **Trạng thái**: Hoàn thành

### 2026-08-08 14:44
* **Tên Plan / Yêu cầu**: Hiển thị trực tiếp Avatar, Tên chủ xe và Modal chi tiết Chủ xe (Sử dụng dữ liệu Users nội bộ thay vì đợi BE).
* **Chi tiết thay đổi**:
  * Đã rollback (hoàn tác) các thay đổi UI liên quan đến Avatar và Modal chủ xe.
  * Quyết định theo sát tài liệu `BE_REQ_ANPR_Owner_Info.md` đã gửi cho BE để đảm bảo tính đồng bộ của toàn bộ chức năng (giao diện, phân trang và tìm kiếm). Frontend sẽ hiển thị dạng "User #ID" cho đến khi BE trả về object `owner`.
* **Trạng thái**: Đã hoàn tác (Reverted)

### 2026-08-08 14:39
* **Tên Plan / Yêu cầu**: Tách riêng yêu cầu Backend về việc trả thông tin Chủ xe (Avatar, Tên) ở màn ANPR thành file markdown độc lập.
* **Chi tiết thay đổi**:
  * `[Tạo mới] docs/BE_REQ_ANPR_Owner_Info.md`: Tạo file markdown mới chứa toàn bộ nội dung yêu cầu gửi cho BE (bao gồm việc thêm object `owner` và bổ sung param `ownerName`).
  * `[Cập nhật] docs/be-action-items.md`: Xóa đoạn yêu cầu liên quan đến ANPR ra khỏi file tổng hợp để chuẩn bị gửi file rời cho team BE.
* **Trạng thái**: Hoàn thành

### 2026-08-08 14:25
* **Tên Plan / Yêu cầu**: Tách cột thời gian thành Ngày & Giờ, thêm filter khoảng ngày và thanh tìm kiếm ở màn ANPR.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/ANPRManagement.jsx`:
    * Tách cột "Thời gian" thành 2 cột "Ngày" và "Thời gian".
    * Thêm thanh tìm kiếm (truyền xuống API qua tham số `plateNumber`). **Lưu ý**: Hiện tại API GET `/anpr/admin/vehicle-history` (`ListVehicleHistoryQueryDto`) chưa hỗ trợ query theo tên chủ xe, nên thanh search tạm thời chỉ hỗ trợ tìm theo Biển số nhận diện.
    * Thêm DatePicker (chọn theo khoảng ngày) sử dụng `react-datepicker`, map vào tham số `from` và `to` gửi lên API.
    * Gộp các công cụ lọc (Search, DatePicker, Trạng thái) lên một hàng ngang linh hoạt và dễ nhìn.
* **Trạng thái**: Hoàn thành

### 2026-08-08 14:15
* **Tên Plan / Yêu cầu**: 
  1. Cải thiện UI hiển thị ảnh xem trước (ThumbnailImage) đúng tỉ lệ 16:9 thay vì hình vuông bị cắt xén.
  2. PLAN FE-Z — Hiện trạng thái "Trong danh sách đen" trên màn ANPR.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/common/ThumbnailImage.jsx`: Đổi class container từ hình vuông sang hình chữ nhật tỉ lệ video (`w-28 aspect-video`) và đổi `object-cover` thành `object-contain` để không bị cắt mép ảnh.
  * `[Cập nhật] src/pages/bussinessAdmin/ANPRManagement.jsx`: Bổ sung badge cảnh báo "⚠ Danh sách đen" dưới biển số ở 2 tab Lịch sử và Biển lạ dựa trên field `isBlacklisted=true`.
* **Trạng thái**: Hoàn thành

### 2026-08-08 04:20
* **Tên Plan / Yêu cầu**: Nhóm D + E (kế hoạch tổng `KE_HOACH_XU_LY_XUNG_DOT_PHONG_GIO_HOP_2026-08-08.md` ở root repo) — Nhóm D: cảnh báo mềm khi có request PENDING khác đang xin cùng phòng/giờ (không chặn). Nhóm E: hiển thị chi tiết xung đột phòng thật (tên phòng/cuộc họp/host) cho Manager khi duyệt, và đính kèm chi tiết xung đột + gợi ý phòng thay thế vào notification khi reject.
* **Chi tiết thay đổi**:
  * `[Tạo mới] src/docs/FE_PLAN_Conflict_Details_And_Pending_Warning.md`: tài liệu kế hoạch chi tiết trước khi code (theo quy ước FE_PLAN_*.md).
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`: thêm dòng cảnh báo hổ phách trên room card khi `room.pendingConflicts?.length > 0` ("N yêu cầu khác đang chờ duyệt cùng giờ"), không loại phòng khỏi danh sách.
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`, `src/pages/manager/MeetingDetail.jsx`: thêm `selectedRoomPendingConflicts` (tra theo phòng đang chọn sau khi bấm "Kiểm tra trùng lịch & phòng" của Nhóm C) + dòng cảnh báo hổ phách độc lập với banner ok/conflict hiện có.
  * `[Cập nhật] src/pages/manager/MeetingApprovals.jsx`: thay text tĩnh bằng banner chi tiết thật (`conflictDetails`: tên cuộc họp/phòng/giờ/host đang giữ chỗ) trong modal "Xem chi tiết". **Bug tự phát hiện khi verify E2E và đã sửa trong cùng phiên**: bản đầu lồng `conflictDetails` bên trong điều kiện `conflictCheckStatus === 'warning'/'blocked'`, khiến banner/badge không bao giờ hiện cho xung đột phòng (field `conflictCheckStatus` luôn `'clear'` với xung đột phòng — xem lý do BE ở spec `feat-review-meeting-request/spec.md`). Đã sửa thành `hasRoomConflict = conflictDetails?.length > 0` là điều kiện chính (OR với `conflictCheckStatus` để giữ tương thích xung đột participant), áp dụng đồng bộ ở cả banner chi tiết và 2 vị trí badge "Bị trùng lịch" (Grid view + Danh sách/bảng view).
  * `[Cập nhật] src/components/common/NotificationBell.jsx`: thêm `payloadJson` vào mapping (trước đó bị lọc bỏ), render thêm ` — trùng với "<meetingTitle>"` khi có `payloadJson.conflictDetails[0]`.
  * `[Cập nhật] src/pages/systemAdmin/Notifications.jsx`: thêm khối hiển thị `payloadJson.conflictDetails` (danh sách) + `payloadJson.suggestedAlternatives` (tên phòng gợi ý) dưới nội dung notification.
  * Phát hiện phụ quan trọng (môi trường, không phải bug code): `.env.development`/`.env.production`/fallback mặc định trong `src/utils/request.js` đều trỏ `REACT_APP_API_BASE_URL` về server REMOTE `https://api.smartracking.io.vn/api/v1`, không phải `localhost:3000` — `npm start` dev mặc định KHÔNG gọi backend local dù đang chạy song song. Đã tạo tạm `.env.local` (không commit, CRA ưu tiên cao nhất) để verify với BE local, xoá ngay sau khi xong. Ghi chú chi tiết tại mục 3 của FE_PLAN mới.
* **Kiểm thử đã thực hiện**: Verify E2E thật qua `.env.local` tạm trỏ BE local (port 3000) + FE dev (port 3001), tài khoản demo `emp.it1@meetingsys.vn`/`manager.it@meetingsys.vn`. Tạo 2 cặp cuộc họp trùng phòng/giờ qua API thật, approve 1 cái → xác nhận badge "Bị trùng lịch" + banner chi tiết đúng tên cuộc họp/phòng/host trên `MeetingApprovals.jsx`; reject cái còn lại → xác nhận notification trong `NotificationBell` có dòng " — trùng với ..." đúng tên cuộc họp đang giữ chỗ. Đã dọn toàn bộ dữ liệu test (cancel/reject) và xoá `.env.local` sau khi verify xong, khôi phục cấu hình mặc định của repo.
* **Trạng thái**: Hoàn thành

### 2026-08-08 03:10
* **Tên Plan / Yêu cầu**: Nhóm C (kế hoạch tổng `KE_HOACH_XU_LY_XUNG_DOT_PHONG_GIO_HOP_2026-08-08.md` ở root repo) — Thay auto-check trùng phòng/giờ (chạy ngầm mỗi khi đổi giờ, tự động khoá dropdown) bằng nút thủ công "Kiểm tra trùng lịch & phòng" khi sửa cuộc họp, không còn tự động xoá/khoá lựa chọn phòng của người dùng, không chặn nút Lưu.
* **Chi tiết thay đổi**:
  * `[Tạo mới] src/docs/FE_PLAN_Meeting_Room_Conflict_Manual_Check.md`: tài liệu kế hoạch chi tiết trước khi code (theo quy ước FE_PLAN_*.md).
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`, `src/pages/manager/MeetingDetail.jsx`: bỏ `useEffect` debounce tự-check theo `editStart`/`editEnd`; thêm effect fetch danh sách phòng 1 lần khi mở modal (dùng giờ gốc); thêm state `checkStatus`/`selectedRoomInfo`; thêm hàm `handleCheckAvailability` gọi thủ công API `getAvailableRoomsForMeeting` có sẵn (không tạo API mới); thêm nút "Kiểm tra trùng lịch & phòng" + banner xanh/vàng + chip gợi ý phòng thay thế; đảm bảo phòng đang chọn luôn còn trong dropdown (không disabled/hidden) kể cả khi bị báo trùng; bỏ `roomWarning` khỏi điều kiện `isSubmitDisabled` (chỉ còn `!isFormChanged()`); dọn state `roomWarning` không còn dùng (dead code).
  * Phát hiện phụ: `react-datepicker` được khai báo trong `package.json` nhưng KHÔNG có trong `node_modules` (dev server lỗi `MODULE_NOT_FOUND` khi mở app) — đã chạy `npm install react-datepicker` để môi trường dev chạy được, phục vụ verify trực tiếp trên browser.
* **Kiểm thử đã thực hiện**: chạy `npx eslint` trên cả 2 file (0 error, chỉ còn warning có sẵn từ trước). Verify E2E thật trên `npm run start` (port 3001) + backend thật (port 3000): tạo 2 cuộc họp test qua API (dùng tài khoản demo `emp.it1@meetingsys.vn`/`manager.it@meetingsys.vn`, mật khẩu demo `Abcd1234@` đã ghi trong migration `20260720000003-SeedDemoUsers.ts`), approve 1 cuộc để tạo booking `approved` thật, sau đó mở modal sửa cuộc họp thứ 2, đổi giờ/phòng trùng — xác nhận đúng: banner "còn trống"/"không còn trống", chip gợi ý phòng hiện đúng, phòng đang chọn (trùng) vẫn còn trong dropdown, nút Lưu không bị khoá (`disabled:false` xác nhận qua DOM). Đã dọn 2 cuộc họp test (cancel/reject) sau khi verify xong.
* **Trạng thái**: Hoàn thành

### 2026-08-08 02:24
* **Tên Plan / Yêu cầu**: Cho phép đổi tên trực tiếp Tệp đa phương tiện (Bản ghi âm/Ghi hình)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Bổ sung tính năng đổi tên (rename) inline cho các file media hiển thị ở Sidebar.
    * Khi di chuột (hover) vào tên bản ghi (dành cho Host), hệ thống sẽ hiện biểu tượng cây bút (`Edit2`).
    * Người dùng có thể click vào để nhập tên mới, nhấn Enter hoặc nút Dấu tích để lưu.
    * Tích hợp gọi API cập nhật tên file bằng phương thức `PATCH /media-files/:fileId`. Sử dụng cơ chế Optimistic Update: tạm thời đổi tên trực quan ngay lập tức trên UI để người dùng thấy mượt mà, đồng thời nếu BE chưa hỗ trợ API, hệ thống sẽ trả lại tên cũ và hiện Toast thông báo chờ BE hỗ trợ.
* **Trạng thái**: Hoàn thành

### 2026-08-08 02:46
* **Tên Plan / Yêu cầu**: Phân trang danh sách Bản ghi âm tại màn hình Chi tiết cuộc họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`: Bổ sung tính năng phân trang (Client-side Pagination) cho danh sách "Bản ghi âm cuộc họp" (giới hạn 5 bản ghi mỗi trang).
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx`: Áp dụng logic phân trang tương tự để giúp giao diện không bị kéo dài khi một cuộc họp có quá nhiều file ghi âm nhỏ lẻ.
* **Trạng thái**: Hoàn thành

### 2026-08-08 02:22
* **Tên Plan / Yêu cầu**: Cải thiện trải nghiệm Ghi âm & Tệp đa phương tiện
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Sửa đổi tiêu đề hiển thị từ "Video ghi hình" thành "Tệp đa phương tiện" và thay đổi icon `VideoIcon` thành `FileText` để mang tính bao quát và phản ánh chính xác cả file ghi âm (bản ghi audio) do BE trả về.
    * Sửa lỗi giao diện không tự cập nhật (hot reload) sau khi upload ghi âm: Bổ sung gọi hàm `fetchMediaFiles()` trực tiếp trong callback `onUploadSuccess` của Component `StationRecorder`. Nhờ vậy, ngay sau khi tải ghi âm lên, danh sách "Tệp đa phương tiện" sẽ được làm mới và hiển thị bản ghi mới tức thì.
* **Trạng thái**: Hoàn thành

### 2026-08-08 02:02
* **Tên Plan / Yêu cầu**: Cải thiện tính năng Ghi âm phiên họp & Cập nhật chức năng Điểm danh
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/hooks/useStationRecording.js`: Bổ sung cơ chế tự động gọi hàm `stopAndUpload` để lưu lại và gửi API file ghi âm nếu Component bị unmount (khi cuộc họp kết thúc hoặc người dùng rời phòng), giúp không bao giờ bị mất file ghi âm.
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`: 
    * Thay đổi logic render các Tab ở Sidebar (từ việc xóa bỏ Component sang dùng CSS `display: hidden`). Việc này giúp Component `StationRecorder` luôn sống ở chế độ nền khi người dùng chuyển qua lại các Tab khác (Chat, Điểm danh...), đảm bảo tiến trình ghi âm liên tục và ổn định.
    * Thêm nút chức năng (Mũi tên lên/xuống) ở mục **Điểm danh thủ công**, cho phép người dùng chủ động thu gọn hoặc mở rộng danh sách những người chưa điểm danh để tiết kiệm không gian sidebar.
  * `[Cập nhật] src/components/transcription/StationRecorder.jsx`: Tối ưu hóa UI, giảm padding, thu nhỏ các nút bấm và dropdown chọn người nói. Giao diện trở nên gọn gàng, không bị kéo dài chiếm diện tích, phù hợp hơn với không gian hẹp của Sidebar.
* **Trạng thái**: Hoàn thành

### 2026-08-08 01:39
* **Tên Plan / Yêu cầu**: Cập nhật hiệu ứng UI khi có người phát biểu trong phòng họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingGrid.jsx`: Bổ sung cơ chế mô phỏng cường độ âm lượng (`audioLevel`) thay đổi liên tục mỗi 150ms khi một người tham gia đang nói. Thay đổi viền xanh nhạt thành viền đỏ `border-red-500` và bổ sung hiệu ứng `box-shadow` cùng hiệu ứng phóng to (scale) viền nháy theo thời gian thực tương ứng với cường độ âm lượng mô phỏng, mang lại cảm giác sống động như âm thanh thật. Đã fix lỗi viền đỏ vẫn hiện khi người dùng bị tắt mic (bổ sung điều kiện `isActuallySpeaking = p.isSpeaking && !p.isMuted`).
* **Trạng thái**: Hoàn thành

### 2026-08-08 01:29
* **Tên Plan / Yêu cầu**: Cập nhật hiển thị text Ngày họp đối với các cuộc họp kéo dài nhiều ngày
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`, `src/pages/manager/MeetingDetail.jsx`: Sửa thẻ hiển thị thông tin "Ngày họp" dạng read-only trên giao diện. Bổ sung logic kiểm tra xem nếu ngày bắt đầu khác ngày kết thúc thì tự động hiển thị dưới dạng khoảng ngày (Ví dụ: `08/08/2026 - 10/08/2026`) thay vì chỉ in ra mỗi ngày bắt đầu như trước đây.
  * `[Cập nhật] src/pages/manager/MeetingApprovals.jsx`, `src/pages/manager/homePage.jsx`, `src/pages/bussinessAdmin/MeetingManagement.jsx`: Sửa lỗi hiển thị tương tự ở toàn bộ các thẻ thông tin và danh sách bên trang Phê duyệt (Approval) của Quản lý và Business Admin.
* **Trạng thái**: Hoàn thành

### 2026-08-08 01:19
* **Tên Plan / Yêu cầu**: Chuyển đổi Date Range Picker sang giao diện 1 lịch duy nhất
* **Chi tiết thay đổi**:
  * Gỡ bỏ thư viện `react-tailwindcss-datepicker` do lỗi CSS và không hỗ trợ giao diện 1 tháng cho dải ngày (range).
  * `[Cập nhật] tailwind.config.js`: Xóa bỏ cấu hình purge CSS cũ.
  * Cài đặt thư viện `react-datepicker` và `date-fns`.
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`, `src/pages/manager/MeetingDetail.jsx`, `src/pages/employee/MeetingDetail.jsx`: Thay thế hoàn toàn sang component `<DatePicker selectsRange />` của `react-datepicker` kèm file CSS chuẩn. Chuyển đổi trạng thái quản lý ngày sang Object `Date[]` thay vì String. 
* **Trạng thái**: Hoàn thành

### 2026-08-08 00:57
* **Tên Plan / Yêu cầu**: Nâng cấp trường chọn Ngày họp sang dạng Date Range (Nhiều ngày)
* **Chi tiết thay đổi**:
  * `[Cập nhật] tailwind.config.js`: Khai báo quét css cho thư viện mới `react-tailwindcss-datepicker`.
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`: Nâng cấp `<input type="date">` thành component `<Datepicker>` cho phép kéo thả nhiều ngày.
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx` & `src/pages/employee/MeetingDetail.jsx`: Áp dụng Date Range Picker trên modal Đổi Giờ/Đổi Phòng.
  * Sửa đổi logic tính khoảng cách giờ (`getMeetingDurationMinutes`) và format `startTime`/`endTime` để chấp nhận lịch nhiều ngày.
* **Trạng thái**: Hoàn thành

### 2026-08-08 00:27
* **Tên Plan / Yêu cầu**: Cập nhật khung giờ 24h cho tất cả các input thời gian
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/AlertRules.jsx`: Thêm `lang="en-GB"` cho các input `type="time"`.
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx`: Thêm `lang="en-GB"` cho các input `type="time"`.
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`: Thêm `lang="en-GB"` cho các input `type="time"`.
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`: Thêm `lang="en-GB"` cho các input `type="time"`.
  * `[Cập nhật] src/pages/bussinessAdmin/MeetingManagement.jsx`: Thêm `lang="en-GB"` cho input `type="datetime-local"`.
  * `[Cập nhật] src/component/NotificationActionsPanel.jsx`: Thêm `lang="en-GB"` cho input `type="datetime-local"`.
  * *Lý do*: Thuộc tính `lang="en-GB"` buộc trình duyệt hiển thị thời gian theo chuẩn 24 giờ (thay vì AM/PM 12 giờ) trên các trường nhập liệu gốc.
* **Trạng thái**: Hoàn thành

### 2026-08-08 00:09
* **Tên Plan / Yêu cầu**: Sửa lỗi 404 khi bật tính năng ghi âm/ghi hình cho cuộc họp chưa từng được cấu hình.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/managerServices.js`: Xuất hàm `addRecordingConfig` để hỗ trợ gọi API tạo mới cấu hình.
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx` và `src/pages/employee/MeetingDetail.jsx`: Bổ sung logic fallback trong hàm lưu cập nhật. Nếu gọi PATCH (`updateMeetingRecordingConfig`) báo lỗi `RECORDING_CONFIG_NOT_FOUND`, FE sẽ tự động gọi POST (`addRecordingConfig`) để tạo mới cấu hình thay vì báo lỗi cho người dùng.
* **Trạng thái**: Hoàn thành

### 2026-08-07 21:34
* **Tên Plan / Yêu cầu**: Sửa lỗi 403 Forbidden khi tải thiết bị phòng họp đối với người dùng không phải Host.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`: Bổ sung thêm điều kiện kiểm tra `meetingState?.hostId === myParticipantId` trước khi gọi hàm `loadRoomDevices(roomId)` trong `useEffect`. Điều này đảm bảo chỉ Chủ tọa (Host) mới gọi API danh sách thiết bị IoT (`/api/v1/iot-devices`), tránh làm tràn console báo lỗi 403 đối với Thành viên / Khách tham dự thông thường (những người vốn dĩ không có tab "Quản lý" nên cũng không cần fetch dữ liệu này).
* **Trạng thái**: Hoàn thành

### 2026-08-07 21:19
* **Tên Plan / Yêu cầu**: Căn giữa hàng dưới cùng của lưới màn hình họp khi số người tham dự lẻ.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingGrid.jsx`: Thay thế CSS Grid bằng Flexbox (`flex-wrap: wrap`, `justify-content: center`) cho container chứa video. Bọc `MeetingTile` bằng div với `flexShrink: 0` và kích thước tính toán được từ hook `useGridMath`, đảm bảo hàng cuối cùng luôn được tự động căn giữa khi số lượng ô video không lấp đầy hàng (đặc biệt khi số người tham dự lẻ).
* **Trạng thái**: Hoàn thành

### 2026-08-07 17:42
* **Tên Plan / Yêu cầu**: Nâng cấp cơ chế lưới (Grid Layout) trong phòng họp (InMeetingRoom)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingGrid.jsx`:
    * Triển khai Custom Hook `useGridMath` kết hợp `ResizeObserver` để tự động tính toán số cột $c$ nhằm tối đa hóa diện tích từng ô video mà không vỡ tỷ lệ 16:9, thay thế cho logic chia bậc (`calcCols`) cứng nhắc trước đây.
    * Triển khai Custom Hook `usePriorityParticipants` tạo Hàng đợi ưu tiên (Priority Queue): Đưa Chủ tọa (Host) và Người đang nói (Active Speaker) lên đầu danh sách hiển thị.
    * Bổ sung cơ chế chống giật layout (Hysteresis/Cooldown 2 giây) giúp duy trì vị trí của người đang nói ngay cả khi họ tạm ngừng, tránh việc các ô video bị đảo vị trí liên tục khi có nhiễu âm thanh ngắn.
* **Trạng thái**: Hoàn thành

### 2026-08-07 17:28
* **Tên Plan / Yêu cầu**: Khắc phục lỗi báo thiếu "key" prop và lỗi 400 khi điểm danh thủ công trong màn hình InMeetingRoom
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Sửa lỗi gán giá trị `undefined` cho ID của người chủ trì (host) vào danh sách `participants` khi Backend không trả về `host_id` mặc định. Điều này khắc phục tình trạng React báo thiếu thuộc tính `key` (do key = undefined).
    * Sửa logic lấy ID của host và khách mời: Bổ sung các điều kiện truy xuất từ `organizerId` và tự động rà soát qua danh sách thành viên API trả về để lấy được `userId` chính xác, ngăn ngừa lỗi 400 Bad Request khi gửi request `POST /attendance` với giá trị `userId` rỗng (undefined).
* **Trạng thái**: Hoàn thành

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
