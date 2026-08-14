# AI Agents Changelog

Tài liệu này dùng để AI Agents tự động ghi lại lịch sử các thay đổi, kế hoạch đã thực thi và các file đã cập nhật trong quá trình hỗ trợ người dùng phát triển dự án.
Quy tắc bắt buộc: AI Agent phải luôn ghi log vào cuối mỗi lần thực hiện task có làm thay đổi code.

## Lịch sử thay đổi

### 2026-08-15 03:05
* **Tên Plan / Yêu cầu**: Thiết kế lại thanh tab Sidebar gọn gàng, không bị chồng chéo
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Thay đổi chiến lược layout tab từ `flex-1` (co giãn đều) sang `flex-shrink-0` với `min-w-[54px]` + `overflow-x-auto` — cho phép scroll ngang khi cần.
    * Thêm `whitespace-nowrap` vào label — text không xuống dòng, không chồng chéo.
    * Icon được bọc trong div tròn mờ xanh khi active (`bg-action-blue/10`).
    * Badge điểm danh chuyển thành pill nhỏ góc trên phải thay vì xuống dòng.
    * Badge khách mời (số lượng) hiển thị chấm tròn màu amber thay vì text dài.
* **Trạng thái**: Hoàn thành

### 2026-08-15 03:00
* **Tên Plan / Yêu cầu**: Thêm tab Ghi âm riêng cho Host để quản lý recording sessions
* **Chi tiết thay đổi**:
  * `[Tạo mới] src/components/meeting/RecordingsTab.jsx`:
    * Component mới hiển thị 2 danh sách: **Tệp đã lưu** (từ `GET /meetings/{id}/media-files`) và **Phiên ghi** (từ `GET /meetings/{id}/recording-sessions`).
    * Hỗ trợ phát lại qua API `GET /media-files/{id}/playback` và nút tải xuống nếu có `downloadUrl`.
    * Hiển thị badge trạng thái (Đang ghi / Đang xử lý / Hoàn thành / Thất bại) với màu sắc phân biệt rõ ràng.
    * Có nút Làm mới thủ công và loading skeleton khi đang tải.
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Import `RecordingsTab`, `getRecordingSessions` từ cả 2 service, icon `Film`.
    * Thêm states: `recordingSessions`, `recordingsLoading`, `playbackUrls`.
    * Thêm tab **"Ghi âm"** (icon Film) vào `tabs` array — chỉ hiển thị cho Host.
    * Thêm block render tab `recordings` sau tab `guests`.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:55
* **Tên Plan / Yêu cầu**: Ẩn "Bản ghi cuộc họp" khi meeting đang diễn ra
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Thêm điều kiện `meetingState?.status === 'completed'` vào block render phần media files. Phần "Bản ghi cuộc họp" sẽ chỉ xuất hiện sau khi cuộc họp kết thúc hoàn toàn, không còn hiển thị trong lúc họp đang diễn ra nữa.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:50
* **Tên Plan / Yêu cầu**: Gỡ bỏ toàn bộ mock data và cơ chế giả lập Bot trong phòng họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Xóa bỏ hoàn toàn đối tượng `defaultMeeting` chứa thông tin cuộc họp và thành viên giả lập (Bot 1, 2, 3).
    * Thay đổi logic trong `initMeetingState`: Khởi tạo thông tin cuộc họp trực tiếp 100% từ API dữ liệu thật của Backend (`baseMeeting`). Nếu API lỗi hoặc thất bại, hiển thị thông báo lỗi bằng Toast thay vì tự động tải mock data.
    * Đặt `isBot = false` cho tất cả participant để đồng nhất dữ liệu thật từ Backend.
    * Xóa bỏ hoàn toàn hook `useEffect` giả lập Bot nói chuyện tự động.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:45
* **Tên Plan / Yêu cầu**: Thiết kế lại nhãn CHỦ TỌA và tự động gán tab mặc định cho người tham dự
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Trong danh sách người tham gia, thay thế nhãn viết tắt `CT` màu hồng thô sơ bằng nhãn in hoa nổi bật `"CHỦ TỌA"` với nền xanh dương nhẹ (`bg-blue-50`), viền nhạt (`border-blue-200/60`), chữ xanh dương (`text-blue-600`) và thêm icon `Shield` bảo mật cực kỳ chỉn chu, chuyên nghiệp.
    * Thêm `useEffect` tự động sửa lỗi sidebar trống trơn của người tham dự. Khi một thành viên (`!isHost`) tham gia, active tab sẽ tự động chuyển từ `'host'` (vốn bị ẩn đối với họ) sang tab đầu tiên khả dụng của họ là `'agenda'` (Chương trình).
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:40
* **Tên Plan / Yêu cầu**: Giới hạn Grid phòng họp chỉ hiển thị tài khoản của chính mình (Self View Only)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Thay đổi logic tính toán `activeGridParticipants` từ việc hiển thị tất cả các thành viên đang hoạt động sang chỉ hiển thị duy nhất thành viên có `id === myParticipantId` (chính tài khoản đang đăng nhập). Các thành viên khác hoặc khách mời khi tham gia/rời đi sẽ không hiển thị ô Grid trên giao diện nữa.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:35
* **Tên Plan / Yêu cầu**: Tích hợp API check-out khi rời phòng họp và Background Avatar Loader
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Trong hàm `confirmLeave`, bổ sung lệnh gọi API `updateAttendanceStatus` chuyển trạng thái điểm danh sang `'left_early'` (Rời sớm) khi một client nhấn nút **Rời khỏi**. Nhờ đó, Host và các client khác sẽ nhận biết được qua danh sách điểm danh cập nhật và xoá họ khỏi Grid.
    * Trong hook đồng bộ `attendance`, bổ sung kiểm tra để tự động đặt `isPresent = false` khi trạng thái check-in chuyển sang khác `present` (như `left_early`, `absent`).
    * Thêm hook `useEffect` thứ hai: Tự động phát hiện các participant có mặt trên Grid (`isPresent === true`) nhưng bị thiếu `avatarUrl` (do API meeting trả về thiếu), thực hiện gọi background API `getUserPublicProfile` để lấy avatar thực tế của họ và cập nhật hiển thị.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:30
* **Tên Plan / Yêu cầu**: Tối ưu hóa điều kiện đồng bộ Grid (tránh ghi đè sự kiện Rời phòng họp)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Điều chỉnh logic hook `useEffect` đồng bộ danh sách điểm danh sang trạng thái Grid. Chỉ cho phép kích hoạt `isPresent = true` khi có check-in mới (từ `false` -> `true`).
    * Loại bỏ việc tự động ép ngược về `true` từ danh sách `attendance` nếu họ đã rời phòng (trạng thái `isPresent` đã chuyển sang `false` qua sự kiện rời phòng). Nhờ đó, người dùng rời đi sẽ biến mất hoàn toàn trên Grid của Host và những người khác mà không bị kéo ngược trở lại nữa.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:25
* **Tên Plan / Yêu cầu**: Tự động đồng bộ danh sách điểm danh (attendance) lên Grid cuộc họp realtime
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Bổ sung một hook `useEffect` lắng nghe sự thay đổi của danh sách điểm danh `attendance` (được cập nhật liên tục qua API sau mỗi 15 giây hoặc qua WebSocket).
    * Ánh xạ các user check-in thành công từ `attendance` sang `meetingState.participants` và cập nhật thuộc tính `isPresent = true` (hoặc `false` khi họ rời đi). Nhờ đó, Grid hiển thị cuộc họp (`MeetingGrid`) sẽ tự động xuất hiện hoặc ẩn đi các Avatar tương ứng khi có người tham gia hoặc rời phòng họp.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:20
* **Tên Plan / Yêu cầu**: Ẩn hoàn toàn tính năng Giơ tay, Thả cảm xúc và Phát biểu (loa) cho cả Host và người tham dự
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Xóa bỏ hoàn toàn khối code Interactions (bao gồm nút Giơ tay, nút Phát biểu/Loa, nút Cảm xúc và bảng chọn Emojis) khỏi Bottom Control Bar. Như vậy, cả Host và người tham dự sẽ không còn nhìn thấy và không thể thao tác các tính năng này trên thanh công cụ dưới đáy.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:15
* **Tên Plan / Yêu cầu**: Giới hạn cảnh báo vắng mặt No-show chỉ hiển thị đối với Host
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Bổ sung điều kiện kiểm tra `isHost` vào khối render của No-show Pop-up Modal. Nhờ đó, chỉ có Host mới nhìn thấy hộp thoại cảnh báo giữ phòng này, còn người tham dự thông thường (`!isHost`) sẽ không bị làm phiền bởi thông báo hệ thống.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:10
* **Tên Plan / Yêu cầu**: Nâng cấp cảnh báo No-show giải phóng phòng thành dạng Pop-up Modal che mờ màn hình
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Chuyển đổi thiết kế từ dạng Alert banner nổi phía trên sang dạng **Pop-up Modal ở chính giữa màn hình** với z-index cao nhất (`z-[99999]`), bo góc sâu (`rounded-3xl`) và bóng đổ mượt.
    * Bổ sung lớp phủ Backdrop làm mờ toàn màn hình phía sau (`bg-slate-950/70 backdrop-blur-lg`) giúp người dùng tập trung tuyệt đối vào cảnh báo và thực hiện click xác nhận giữ phòng nhanh nhất.
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:05
* **Tên Plan / Yêu cầu**: Giới hạn quyền tương tác trong phòng họp (ẩn mic/interactions của người tham gia) và xóa hiệu ứng nhấp nhô Avatar
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingGrid.jsx`:
    * Xóa bỏ hoàn toàn hiệu ứng âm thanh nhấp nhô màu xanh lá (các thẻ div pulsing rings) bao quanh vòng tròn Avatar.
    * Sửa đổi viền của thẻ div bọc ngoài và Avatar để luôn hiển thị tĩnh (đáp ứng đúng yêu cầu người dùng không được tự tiện bật mic).
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Bọc các nút Mic, ngăn cách, và tương tác (Giơ tay, Phát biểu, Loa, Emojis, Gia hạn) trong điều kiện `isHost`. Nhờ đó, người tham dự thông thường (`!isHost`) sẽ không nhìn thấy và không thể thao tác các nút này (chỉ hiển thị duy nhất nút "Rời khỏi").
* **Trạng thái**: Hoàn thành

### 2026-08-15 02:00
* **Tên Plan / Yêu cầu**: Tự động Việt hóa các thông báo lỗi (Exceptions) từ Backend
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/utils/request.js`:
    * Tạo từ điển ánh xạ dịch lỗi `ERROR_TRANSLATIONS` dịch các lỗi tiếng Anh phổ biến từ Backend (lỗi điểm danh: `Attendance list is not open yet`, lỗi xác thực: `Unauthorized`, `Forbidden`, lỗi đặt phòng trùng: `Room is already booked`, PDPA, lỗi tài khoản) sang tiếng Việt chuyên ngành chính xác và dễ hiểu.
    * Tạo hàm `translateErrorMessage` để tự động đối chiếu, dịch nghĩa và gán thông báo lỗi tiếng Việt trước khi Toast hiển thị và trả về giao diện.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:55
* **Tên Plan / Yêu cầu**: Thiết kế lại giao diện Toast Notification tối giản kèm thanh đếm ngược (Progress Bar Timer)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/common/ToastContainer.jsx`:
    * Chuyển nền Toast về dạng thẻ trắng tinh tế (`bg-white`), viền xám mỏng (`border border-slate-200/80`) và đổ bóng mịn màng (`shadow-lg shadow-slate-100/50`) đúng theo hình ảnh mẫu tham khảo.
    * Tái thiết kế các biểu tượng ở góc trái: Sử dụng các icon dạng hình tròn đặc có màu nổi bật (Success: tick trắng trên tròn xanh lá, Error: x trắng trên tròn đỏ, Info: chữ i trắng trên tròn xanh dương, Warning: tam giác vàng viền đậm).
    * Tích hợp dải màu chạy đếm ngược (Progress Bar Timer) dưới đáy thẻ Toast sử dụng CSS animation `@keyframes shrinkWidth` chạy mượt mà trong vòng 4 giây, giúp người dùng dễ dàng theo dõi thời gian tự động đóng của thông báo.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:50
* **Tên Plan / Yêu cầu**: Tối ưu hóa màu sắc Toast Notification để rõ nét và tương phản cao hơn
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/common/ToastContainer.jsx`:
    * Chuyển đổi nền Toast từ màu trắng đục (`bg-white/95`) sang nền màu đặc trưng dịu của từng loại thông báo (success: `bg-emerald-50`, error: `bg-rose-50`, warning: `bg-amber-50`, info: `bg-indigo-50`) để tăng tính nhận diện thị giác.
    * Tăng độ đậm của viền (`border-X-500/40`) và đổi màu chữ sang màu siêu tối có tông màu tương ứng (`text-emerald-950`, `text-rose-950`, v.v.) giúp văn bản sắc nét và dễ đọc hơn ở cỡ chữ nhỏ.
    * Tăng kích thước cỡ chữ lên `text-[13px]` và đặt độ dày chữ thành `font-bold`.
    * Cải thiện độ rõ nét của các icon đóng (nút `X`) và các icon biểu tượng.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:40
* **Tên Plan / Yêu cầu**: Sửa logic kiểm tra Job bận của TranscriptViewer để tránh kẹt UI do job rác cũ
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/transcription/TranscriptViewer.jsx`:
    * Thay đổi cách kiểm tra trạng thái đang xử lý (`hasProcessing`) trong hàm `fetchJobs`: Thay vì sử dụng `.some()` quét toàn bộ các job trong mảng (khiến UI bị khóa vĩnh viễn nếu có 1 job cũ bị kẹt ở trạng thái `queued`), nay chỉ kiểm tra job mới nhất (`currentJobs[0]`) do Backend đã trả dữ liệu sắp xếp mới nhất lên đầu.
    * Bổ sung đầy đủ các trạng thái của Background Job (`running`, `scheduled`, `retrying`) vào điều kiện kiểm tra bên cạnh `queued` và `processing` để tránh bỏ sót.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:35
* **Tên Plan / Yêu cầu**: Khắc phục triệt để lỗi phân nhóm "Chưa phân bổ" khi thêm 1 người và hiển thị tên phòng ban tiếng Việt
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`:
    * Sửa đổi hàm `getUserDeptCode`: Ưu tiên trả về `dept.departmentName` (tên tiếng Việt đầy đủ) thay vì `dept.departmentCode` (mã viết hoa tiếng Anh `"PARTNER"`), giúp hiển thị tên phòng ban thuần Việt.
    * Nâng cấp hàm `toggleParticipant`: Khi tích chọn thêm 1 người đơn lẻ từ ô tìm kiếm, nếu tài khoản của họ chưa có thông tin phòng ban trong cache (do API search của Backend không trả về `departmentId`), Frontend sẽ tự động gọi API `getUserPublicProfile` ở background để lấy chi tiết phòng ban của họ và cập nhật vào cache. Nhờ đó, họ sẽ được đưa vào đúng nhóm phòng ban tương ứng (ví dụ: nhóm "Đối tác") thay vì bị quy sai vào nhóm "Thành viên tự do".
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:30
* **Tên Plan / Yêu cầu**: Cải tiến hệ thống Toast Notification toàn cục và tự động hóa thông báo
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/common/ToastContainer.jsx`:
    * Di chuyển vị trí hiển thị Toast từ góc dưới bên phải (`bottom-6 right-5`) lên **góc trên bên phải** (`top-6 right-5`) để người dùng thấy ngay lập tức, không bị che khuất.
    * Nâng cấp thiết kế Toast sang phong cách **Glassmorphism** cao cấp (nền bán trong suốt `bg-white/95`, viền mờ theo loại thông báo, chữ tối `text-slate-800` có tương phản cao, bóng mờ mịn).
  * `[Cập nhật] src/utils/request.js`:
    * Tích hợp tự động bắn Toast đỏ báo lỗi (`toast.error`) khi có lỗi mạng (Connection Error) hoặc lỗi phản hồi từ API (HTTP status errors / success false), giúp hiển thị thông báo lỗi tự động cho toàn bộ các màn hình mà không cần sửa code UI riêng lẻ. Hỗ trợ option `skipToast` để bỏ qua Toast tự động trên các request đặc thù.
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`, `src/pages/employee/MeetingDetail.jsx`, `src/pages/manager/MeetingDetail.jsx`:
    * Thêm `useEffect` tự động lắng nghe các state lỗi validate cục bộ (`errorMsg`/`error`) và thông báo thành công (`successMessage`/`successMsg`), kích hoạt gọi `toast.error`/`toast.success` và reset state ngay lập tức để ẩn hoàn toàn các hộp thông báo tĩnh màu hồng nhạt cũ.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:25
* **Tên Plan / Yêu cầu**: Sửa lỗi nhận diện phòng ban đối tác và Việt hóa ngôn ngữ chuyên ngành người tham gia
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`:
    * Khắc phục hàm `mergeUsers`: bổ sung ưu tiên lấy `u.departmentId` hoặc `u.department_id` trực tiếp từ đối tượng user Backend trả về (`u.departmentId || u.department_id || u._departmentId`), sửa lỗi ghi đè cứng trường phòng ban thành `null` khiến các user đã có phòng ban (như "Đối tác") bị quy sai nhóm.
    * Việt hóa nhãn hiển thị danh sách phân loại người tham gia chưa gán phòng ban: Thay thế chữ `"Chưa phân bổ"` thành cụm từ chuyên ngành phù hợp `"Thành viên tự do"`.
    * Việt hóa nhãn hiển thị tại popup chi tiết thông tin user: Thay thế `"Chưa phân bổ"` thành `"Chưa gán phòng ban"`.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:20
* **Tên Plan / Yêu cầu**: Nâng cấp check trùng lịch & Thiết kế lại Modal thông báo xung đột phòng họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/employeeServices.js`, `src/service/managerServices.js`:
    * Chỉnh sửa hàm `getAvailableRooms` để giữ nguyên các tham số thời gian `startTime` và `endTime` trong query params, đồng thời chuyển đổi đích gọi từ `/rooms/search` sang `/rooms/available` nhằm phục vụ check trùng lịch phía Backend.
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`:
    * Thiết kế lại giao diện Cảnh báo bận lịch/trùng phòng (Collision Warning). Chuyển từ panel tĩnh hiển thị phía dưới form thành một **Floating Portal Modal** cao cấp (backdrop-blur, z-[9999]).
    * Tăng tính minh bạch trong thông báo lỗi (báo rõ nguyên nhân có người khác đặt trước trong khi soạn thảo thông tin) và hiển thị lưới các phòng họp thay thế (alternativeRooms) với đầy đủ thông số (tên, sức chứa, địa điểm, các thiết bị hỗ trợ) giúp người dùng bấm đổi phòng nhanh tức thì.
  * `[Tạo mới] docs/backend_api_requirements_available_rooms.md`:
    * Soạn thảo tài liệu đặc tả yêu cầu Backend cung cấp/hoàn thiện API `/rooms/available` chi tiết (mô tả mục đích, query params, logic SQL overlap đề xuất, cấu trúc JSON trả về) để chuyển giao cho đội phát triển Backend.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:07
* **Tên Plan / Yêu cầu**: Khắc phục lỗi TypeError 'Cannot read properties of undefined (reading replace)' khi chọn ngày
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`, `src/pages/employee/MeetingDetail.jsx`, `src/pages/manager/MeetingDetail.jsx`:
    * Sửa đổi hàm `handleDateChangeRaw(e)` xử lý lọc thô của DatePicker: bổ sung kiểm tra null/undefined cho đối tượng sự kiện `e` và `e.target` (`if (!e || !e.target) return;`), đồng thời kiểm tra kiểu dữ liệu chuỗi (`typeof rawVal === 'string'`) trước khi thực hiện gọi hàm `.replace()`.
    * Khắc phục triệt để lỗi crash giao diện khi người dùng click chọn ngày trực tiếp bằng chuột trên lịch.
* **Trạng thái**: Hoàn thành

### 2026-08-15 01:05
* **Tên Plan / Yêu cầu**: Sửa lỗi ẩn thanh search và tối ưu hóa tìm kiếm tức thì ở ô Mời khách tham gia
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`:
    * Sửa đổi logic `onMouseDown` của phần gợi ý nhân viên (User suggestions) trong dropdown: loại bỏ `setSearchEmail('')` và `setSearchFocused(false)` để ngăn chặn việc đóng dropdown và làm trống ô search đột ngột khi người dùng chọn một thành viên. Giờ đây người dùng có thể tích chọn liên tục nhiều người có cùng từ khóa mà không mất dropdown hay focus.
    * Tối ưu hóa biến `visibleSuggestions` (sử dụng `useMemo` kết hợp): thực hiện lọc tức thì (Client-side filtering) trên cache danh sách nhân viên đã biết ở client, kết hợp gộp kết quả tìm kiếm bất đồng bộ (Server-side API search). Điều này giúp giao diện hiển thị ngay lập tức khi gõ chữ hoặc xóa chữ mà không bị trễ bởi debounce của API.
    * Cải thiện sự kiện click nút xóa chữ `X` của ô search bằng `onMouseDown` kèm `e.preventDefault()`, giúp xóa sạch chữ nhưng vẫn giữ nguyên focus của ô input và mở dropdown suggestions.
* **Trạng thái**: Hoàn thành

### 2026-08-15 00:58
* **Tên Plan / Yêu cầu**: Giới hạn dropdown Loại thiết bị trong modal Đăng ký thiết bị mới
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/DeviceManagement.jsx`:
    * Sửa đổi select dropdown "Loại thiết bị" trong modal Đăng ký thiết bị mới (Register Modal), loại bỏ toàn bộ các loại thiết bị không được sử dụng thực tế (như Camera vào/ra, Camera phòng họp, Micro ghi âm, Capture Agent, Cảm biến, Màn hình), chỉ giữ lại 2 tùy chọn thực tế: `ip_camera` (Camera AI) và `face_server` (Máy chủ Face Server).
    * Đồng bộ sửa đổi select dropdown "Loại thiết bị" trong thanh bộ lọc (Filter Bar) để chỉ hiển thị 2 loại thiết bị trên cùng tùy chọn "Tất cả loại".
* **Trạng thái**: Hoàn thành

### 2026-08-15 00:44
* **Tên Plan / Yêu cầu**: Kiểm tra và tối ưu cấu hình responsive trên toàn bộ các màn hình
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/manager/layout/ManagerLayout.jsx`:
    * Bổ sung state `isMobileMenuOpen` và nút Hamburger (sử dụng icon `Menu` và `X` của `lucide-react`) vào Header Navbar chỉ hiển thị trên mobile.
    * Xây dựng Mobile Menu Drawer hiển thị danh sách điều hướng dọc cho các thiết bị di động (< 768px), giúp Trưởng phòng (Manager) có thể thao tác điều hướng toàn diện trên điện thoại.
  * `[Cập nhật] src/pages/manager/homePage.jsx`:
    * Sửa đổi class của grid "Quick Status Bar" từ `grid-cols-3` thành `grid-cols-1 md:grid-cols-3` để ngăn chặn lỗi tràn viền và vỡ layout trên mobile.
  * `[Kiểm tra] src/pages/employee/layout/EmployeeLayout.jsx`, `src/pages/employee/BookMeeting.jsx`, `src/pages/shared/InMeetingRoom.jsx` và `src/components/meeting/MeetingGrid.jsx`:
    * Rà soát cấu hình responsive (bao gồm bảng biểu, form, video grids thích ứng động) và xác nhận hoạt động tương thích tốt trên mobile.
* **Trạng thái**: Hoàn thành

### 2026-08-15 00:39
* **Tên Plan / Yêu cầu**: Tắt cảnh báo thiếu source map của thư viện bên thứ ba
* **Chi tiết thay đổi**:
  * `[Cập nhật] .env`:
    * Thêm biến cấu hình `GENERATE_SOURCEMAP=false` để tắt trình phân tích source map đối với các thư viện trong `node_modules` (như `@mediapipe/tasks-vision`), giúp tắt hoàn toàn các cảnh báo `Failed to parse source map` và tối ưu hóa tốc độ build/dev.
* **Trạng thái**: Hoàn thành

### 2026-08-14 18:00
* **Tên Plan / Yêu cầu**: Cải thiện UX xử lý lỗi 409 (Meeting Not Active) khi tải điểm danh
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingAttendanceBoard.jsx`:
    * Thêm state `errorCode` để lưu trữ mã lỗi cụ thể từ response.
    * Tinh chỉnh catch error trong `fetchAttendance` để đọc đúng `err.error?.code` và `err.error?.message` thay vì chỉ `err.message` (vốn bị undefined khi object lỗi do `request.js` ném ra).
    * Thay thế khung thông báo lỗi màu đỏ (Error Banner) bằng một màn hình rỗng thân thiện (Empty Info State) "Điểm danh chưa khả dụng" khi gặp mã lỗi `MEETING_NOT_ACTIVE`.
* **Trạng thái**: Hoàn thành

### 2026-08-14 15:08
* **Tên Plan / Yêu cầu**: Ngăn chặn nhập chữ và validate ô chọn ngày/giờ họp
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/BookMeeting.jsx`:
    * Thêm các hàm helper `isValidDate`, `handleDateKeyDown`, và `handleDateChangeRaw` để chặn nhập và dán văn bản chứa chữ vào DatePicker của "Khung ngày họp".
    * Cập nhật `handleSearchRooms` và `handleSubmit` để kiểm tra ngày/giờ họp hợp lệ trước khi gọi API hoặc submit form.
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`:
    * Thêm chặn nhập/dán chữ cho DatePicker của "Khung ngày họp" trong modal chỉnh sửa.
    * Thêm validation ngày/giờ họp hợp lệ trong `handleCheckAvailability` và `handleSaveEdit`.
  * `[Cập nhật] src/pages/manager/MeetingDetail.jsx`:
    * Đồng bộ chặn nhập/dán chữ cho DatePicker của "Khung ngày họp" trong modal chỉnh sửa.
    * Đồng bộ validation ngày/giờ họp hợp lệ trong `handleCheckAvailability` và `handleSaveEdit`.
* **Trạng thái**: Hoàn thành

### 2026-08-14 02:23
* **Tên Plan / Yêu cầu**: Tách commit các chức năng đã hoàn thiện
* **Chi tiết thay đổi**:
  * Phân tích 21 file thay đổi, chia thành 9 commit riêng biệt theo chức năng:
    * `feat(layout)` — Refactor navbar, tích hợp user-journey & meeting-approvals routes (6 files)
    * `feat(business-admin)` — Thêm trang Kho tài liệu, sidebar navigation (4 files)
    * `feat(employee)` — Redesign trang Bản ghi & phân trang (Recordings.jsx, bỏ phần Biên bản chờ BE)
    * `feat(meeting)` — Hỗ trợ deep-link tab qua URL params `?tab=` (3 files)
    * `feat(employee)` — Ẩn cấu hình ghi âm/hình khi phòng không có thiết bị (BookMeeting.jsx)
    * `feat(in-meeting)` — Thêm đếm ngược & cảnh báo hết giờ họp (InMeetingRoom.jsx)
    * `refactor(anpr)` — Redesign bộ lọc ANPR dạng 3-cột grid (ANPRManagement.jsx)
    * `refactor(system-admin)` — UI tweaks RoomAccessLogs & ZoneManagement
    * `docs` — Cập nhật archive docs & changelog
  * Xử lý đặc biệt `Recordings.jsx`: tạo version commit-safe (bỏ nút Biên bản), commit, rồi restore file đầy đủ — giữ lại phần tích hợp `getMeetingMinutesByMeetingId` (nút Biên bản) chưa commit vì phụ thuộc BE endpoint `/meeting-minutes`.
* **Trạng thái**: Hoàn thành — 9 commits mới, Recordings.jsx vẫn còn unstaged với phần Biên bản chờ BE

### 2026-08-14 02:00
* **Tên Plan / Yêu cầu**: Tích hợp màn hình Hành trình khuôn viên, Tái cấu trúc Navbar và Tối ưu hóa Trang chủ Nhân viên & Trưởng phòng
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/UserJourney.jsx`:
    * Bổ sung thuộc tính `isSelfOnly` kiểm tra vai trò của người dùng hiện tại (Nhân viên và Trưởng phòng).
    * Khi `isSelfOnly` là true, tự động tải hành trình của chính tài khoản đó bằng cách lấy thông tin từ local storage, đồng thời ẩn giao diện tìm kiếm và dropdown chọn nhân viên để đảm bảo bảo mật và cá nhân hóa.
    * Việt hóa và tinh chỉnh nội dung mô tả tiêu đề cho trường hợp xem hành trình cá nhân.
  * `[Cập nhật] src/routers/index.js`:
    * Thêm đường dẫn `user-journey` và `meeting-approvals` liên kết với các component tương ứng dưới nhóm route bảo vệ của Nhân viên (Employee).
  * `[Cập nhật] src/pages/employee/layout/EmployeeLayout.jsx`:
    * Import các icon `MapPin` và `FileCheck` từ `lucide-react`.
    * Tái cấu trúc menu: Tích hợp mục "Phê duyệt cuộc họp" vào trong dropdown "Cuộc họp" với thuộc tính `requiredPermission: 'meeting_request.read'` để đảm bảo hiển thị đúng quyền hạn.
    * Bổ sung mục "Hành trình" vào danh sách điều hướng.
  * `[Cập nhật] src/pages/manager/layout/ManagerLayout.jsx`:
    * Tích hợp mục "Phê duyệt cuộc họp" vào trong dropdown "Cuộc họp", đồng thời loại bỏ nhóm dropdown "Phê duyệt" cũ.
    * Loại bỏ menu dropdown "Giám sát" và đưa liên kết "Hành trình" ra trực tiếp ở cấp cao nhất của thanh điều hướng (top-level navigation).
    * Dọn dẹp các icon import không sử dụng (`CheckSquare`, `Shield`).
  * `[Cập nhật] src/pages/employee/homePage.jsx`:
    * Loại bỏ hoàn toàn card "Ghi hình chờ duyệt" (do thông tin này không tồn tại / không áp dụng với vai trò Nhân viên bình thường).
    * Tái thiết kế lại grid layout hiển thị các thẻ overview dashboard thành 3 cột cân đối (`md:grid-cols-3`).
    * Dọn dẹp biến state `pendingConsents`.
  * `[Cập nhật] src/pages/employee/Recordings.jsx`:
    * Thay đổi giá trị bộ lọc `status` khi gọi `getMySchedule` từ mảng trùng lặp `['completed', 'completed']` thành `'completed'` dạng chuỗi đơn, ngăn chặn tạo tham số trùng lặp trên URL dẫn đến lỗi 400 Bad Request ở Backend.
* **Trạng thái**: Hoàn thành

### 2026-08-13 23:30
* **Tên Plan / Yêu cầu**: Cập nhật nút tài liệu dạng Text thành Biên bản cuộc họp đã ban hành
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/employeeServices.js`:
    * Thêm API `getMeetingMinutesByMeetingId` để lấy biên bản cuộc họp theo `meetingId`.
  * `[Cập nhật] src/pages/employee/Recordings.jsx`:
    * Tích hợp `getMeetingMinutesByMeetingId` để kiểm tra trạng thái ban hành của biên bản cuộc họp (`status === 'published'`).
    * Thay đổi nút "Text" thành "Biên bản" với hành vi chỉ hoạt động (không bị vô hiệu hóa) khi biên bản cuộc họp đã được ban hành chính thức.
    * Khi click nút "Biên bản", thực hiện điều hướng đến trang chi tiết cuộc họp kèm tham số `tab=minutes` để tự động mở tab Biên bản.
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx` & `src/pages/manager/MeetingDetail.jsx`:
    * Sử dụng `useSearchParams` để đọc tham số `tab` từ URL và kích hoạt tab tương ứng (mặc định là `transcript`).
* **Trạng thái**: Hoàn thành

### 2026-08-13 22:25
* **Tên Plan / Yêu cầu**: Hoàn thiện chức năng Thống kê chuyên cần cá nhân của Nhân viên và nâng cấp giao diện Quản lý thiết bị
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/employeeServices.js`:
    * Thêm API `getMyAttendanceStats` gọi endpoint `GET /analytics/attendance/on-time-rate/me` để lấy thống kê chuyên cần cá nhân.
  * `[Cập nhật] src/pages/employee/homePage.jsx`:
    * Tích hợp tab "Thống kê" sử dụng API thống kê chuyên cần cá nhân.
    * Thêm hiển thị 4 thẻ KPI (Lượt tham dự, Đúng giờ, Đi muộn, Vắng mặt), biểu đồ tròn (phân bố trạng thái chuyên cần), danh sách 5 lần đi muộn gần nhất và biểu đồ cột (xu hướng chuyên cần).
  * `[Cập nhật] src/pages/systemAdmin/DeviceManagement.jsx`:
    * Nâng cấp toàn diện danh sách thiết bị từ dạng bảng (table) sang dạng lưới thẻ (card grid) 3 cột hiển thị sinh động theo tông màu thương hiệu của từng loại thiết bị.
    * Cải thiện bộ lọc thu gọn, hiển thị số lượng thiết bị, xử lý trạng thái rỗng (empty state) và phân trang theo dạng lưới thẻ.
* **Trạng thái**: Hoàn thành

### 2026-08-13 22:15
* **Tên Plan / Yêu cầu**: Tách commit và push code cho các tính năng đã hoàn thành
* **Chi tiết thay đổi**:
  * `[Tạo mới] src/docs/PLAN_BE_personal_attendance_stats.md`:
    * Tạo tài liệu kế hoạch Backend về tính năng Thống kê chuyên cần cá nhân (Employee Personal Stats) và API `GET /analytics/attendance/on-time-rate/me`.
  * `[Cập nhật] src/pages/employee/homePage.jsx` & `src/pages/manager/homePage.jsx`:
    * Nâng cấp giao diện Lối tắt / Trạng thái nhanh (Quick Status Bar) thành dạng lưới 3 cột có kích thước nhỏ gọn, layout hiện đại, typography rõ ràng và icon trực quan.
  * `[Cập nhật] src/pages/shared/EmployeeOnTimeAnalytics.jsx`:
    * Thay đổi hiển thị bảng Thống kê thành viên: thay cột tỷ lệ đi muộn và số lượt đi muộn thô bằng các cột chi tiết "Đúng giờ", "Đến muộn", "Vắng mặt" (có badge màu sắc) và "Tổng bắt buộc".
  * `[Cập nhật] src/pages/systemAdmin/DeviceManagement.jsx`:
    * Di chuyển nút "Gán phòng" lên đầu danh sách hành động.
    * Đổi tên hiển thị và cấu hình từ "Face Terminal" sang "Face Server".
    * Xóa bỏ dropdown chọn phòng trực tiếp trong modal tạo mới (bắt buộc gán sau khi tạo qua nút Gán phòng).
    * Khóa dropdown "Loại thiết bị" khi chỉnh sửa (chỉ hiển thị nhãn đọc) và loại bỏ nút Xóa thiết bị khỏi danh sách.
  * `[Cập nhật] src/pages/systemAdmin/RoomAccessLogs.jsx` & `src/pages/systemAdmin/ZoneManagement.jsx`:
    * Đồng bộ nhãn trạng thái "Chưa khớp (unmatched)" hiển thị thành "Người lạ" màu đỏ kèm icon cảnh báo tương ứng.
    * Thiết kế lại danh sách sự kiện truy cập khu vực (ZoneAccessLogCard) từ dạng danh sách dọc thành dạng lưới thẻ (3 cột) hiển thị ThumbnailImage 16:9 toàn chiều rộng kèm overlay thời gian.
    * Loại bỏ các phần liên quan đến Occupancy / Đếm người (cột, chỉ số KPI đỉnh Occupancy) trong ZoneTimelineCard để đơn giản hóa giao diện.
* **Trạng thái**: Hoàn thành

### 2026-08-13 19:55
* **Tên Plan / Yêu cầu**: Loại bỏ "Toàn hệ thống" và bắt buộc chọn khu vực trong Quy tắc cảnh báo
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/AlertRules.jsx`:
    * Loại bỏ tùy chọn "Toàn hệ thống (Mọi khu vực)" khỏi dropdown select "Khu vực áp dụng" trong modal tạo/sửa quy tắc.
    * Thay thế bằng placeholder mặc định bị vô hiệu hóa "-- Chọn khu vực áp dụng --" và đánh dấu trường này là bắt buộc (`required`).
    * Thêm kiểm tra validation ở `handleSubmit` và hiển thị thông báo lỗi nếu chưa chọn khu vực.
* **Trạng thái**: Hoàn thành

### 2026-08-13 19:25
* **Tên Plan / Yêu cầu**: Thay đổi thiết kế Lối tắt chức năng nhanh cho Nhân viên (Employee)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/homePage.jsx`:
    * Thêm import icon `User` từ `lucide-react`.
    * Loại bỏ lối tắt trùng lặp "Đặt phòng họp nhanh" và lối tắt không chính xác "Lịch sử điểm danh".
    * Thiết kế lại 4 lối tắt chức năng nhanh gồm: Đăng ký họp (`/employee/book`), Lịch họp cá nhân (`/employee/schedule`), Đăng ký khuôn mặt (`/employee/face-register`), và Bản ghi & Tài liệu (`/employee/recordings`) với các gradient màu sắc, mô tả và liên kết điều hướng chuẩn xác.
* **Trạng thái**: Hoàn thành

### 2026-08-13 17:52
* **Tên Plan / Yêu cầu**: Phân trang và nâng cấp giao diện cho bảng "Chi tiết các mốc quét camera".
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingPresenceIVSS.jsx` & `src/pages/employee/MeetingDetail.jsx`:
    * Thêm state `logPage` (client-side pagination) để phân trang 5 dòng mỗi trang.
    * Nâng cấp giao diện bảng với các badge Vào/Ra có chấm tròn màu sắc sinh động, hiển thị phần trăm độ tin cậy với màu sắc tương ứng theo ngưỡng chất lượng (Xanh lá >=80%, Hổ phách >=50%, Đỏ <50%).
    * Thêm bộ điều hướng trang: Hiển thị phạm vi dòng (Ví dụ: 1-5 trong 12 mốc quét) và nút "Trước" / "Sau" để chuyển trang trực quan.
* **Trạng thái**: Hoàn thành

### 2026-08-13 17:50
* **Tên Plan / Yêu cầu**: Tích hợp ảnh camera sự kiện vào tab thời lượng tham gia trên màn hình Chi tiết cuộc họp của Nhân viên.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/employee/MeetingDetail.jsx`:
    * Import `ThumbnailImage` và `EventSnapshotModal`.
    * Thêm cột "Ảnh camera" vào bảng "Chi tiết các mốc quét camera" trong tab "Thời lượng tham dự" (hiển thị thời lượng của chính Employee).
    * Tích hợp sự kiện click vào ảnh để phóng to toàn màn hình và xem tất cả các ảnh quét sự kiện bằng carousel chuyển ảnh.
* **Trạng thái**: Hoàn thành

### 2026-08-13 17:47
* **Tên Plan / Yêu cầu**: Tích hợp ảnh camera sự kiện vào chi tiết mốc quét và hiển thị modal thông tin nhân sự khi click vào tên.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/meeting/MeetingPresenceIVSS.jsx`:
    * Import và tích hợp `ThumbnailImage` và `EventSnapshotModal`.
    * Thêm cột "Ảnh camera" vào bảng "Chi tiết các mốc quét camera" trong `UserDetailModal` (dùng `ThumbnailImage` với `ev.id`). Khi click vào ảnh camera này, sẽ hiển thị trình xem ảnh phóng to toàn màn hình hỗ trợ carousel lướt qua toàn bộ ảnh sự kiện trong mốc quét.
    * Tạo component `UserProfileModal` hiển thị thông tin hồ sơ của nhân sự (Avatar lớn, họ tên, mã nhân viên, phòng ban, email, ID hệ thống).
    * Cập nhật danh sách bảng điểm danh để khi click vào khu vực Avatar + Tên nhân viên sẽ hiển thị `UserProfileModal`.
* **Trạng thái**: Hoàn thành

### 2026-08-13 16:39
* **Tên Plan / Yêu cầu**: Hiển thị dạng chồng ảnh và thêm carousel chuyển ảnh trong viewer tại Trung tâm Cảnh báo An ninh.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/security/EventSnapshotModal.jsx`: Nâng cấp modal EventSnapshotModal để hỗ trợ nhận danh sách `eventIds`, thêm nút điều hướng Left/Right, hiển thị chỉ số ảnh `currentIndex / total` và hỗ trợ phím mũi tên bàn phím.
  * `[Cập nhật] src/pages/systemAdmin/SecurityAlerts.jsx`: Thêm helper `getAlertImages` và subcomponent `AlertImagesStack`. Đổi cột "Hình ảnh" trong bảng danh sách cảnh báo từ hiển thị 1 ảnh thành dạng chồng ảnh (nhiều ảnh xếp đè lệch nhau kèm số lượng ảnh). Khi click vào chồng ảnh này hoặc thumbnail trong modal "Chi tiết lượt vi phạm", sẽ mở carousel với đầy đủ các ảnh của sự kiện.
* **Trạng thái**: Hoàn thành

### 2026-08-13 16:27
* **Tên Plan / Yêu cầu**: Sửa lỗi 500 khi gọi API lấy thống kê tỷ lệ đi muộn trên Dashboard của Business Admin và System Admin.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/dashBoard.jsx` & `src/pages/systemAdmin/dashBoard.jsx`: Thay đổi cách truyền ngày tháng `from`/`to` cho API `getAttendanceAnalytics` từ chuỗi ISO đầy đủ (`.toISOString()`) sang định dạng chỉ ngày (`YYYY-MM-DD`) để khớp với DTO của Backend, tránh gây lỗi crash 500 do định dạng ngày không hợp lệ.
* **Trạng thái**: Hoàn thành

### 2026-08-13 16:18
* **Tên Plan / Yêu cầu**: Khắc phục lỗi 404 console khi gọi API lấy transcript của cuộc họp chưa có dữ liệu.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/transcription/TranscriptViewer.jsx`: Thay đổi cơ chế thăm dò (polling) trong `fetchJobs` và `checkStatus`. Sử dụng cơ chế trả về các trạng thái hành động `'poll'`, `'fetch'`, `'empty'`. Ngăn chặn việc tự động gọi API `getTranscript` khi danh sách job trống (`jobs.length === 0`), tránh tạo request lỗi 404 trên browser console.
* **Trạng thái**: Hoàn thành

### 2026-08-13 15:07
* **Tên Plan / Yêu cầu**: Tách commit các chức năng đã hoàn thiện và push code.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/DepartmentManagement.jsx`: Thêm trường Mã phòng ban (`departmentCode`) vào form tạo và bảng danh sách. Cập nhật `ACTION_MAP`.
  * `[Cập nhật] src/pages/bussinessAdmin/UserManagement.jsx`: Cập nhật `ACTION_MAP` và hiển thị `log.description` trong lịch sử hoạt động.
  * `[Cập nhật] src/pages/shared/EmployeeOnTimeAnalytics.jsx`: Cập nhật cấu trúc phân trang từ `res.meta` và đổi tên trường thống kê.
  * `[Cập nhật] src/pages/systemAdmin/AuditLogs.jsx`: Cải thiện hiển thị chi tiết nhật ký hệ thống và cập nhật `ACTION_MAP`.
  * `[Cập nhật] src/service/businessAdminServices.js` & `src/service/sysAdminServices.js`: Thay đổi endpoint lấy log hoạt động thành `/users/:userId/audit-logs`, thêm API import tài khoản đối tác.
  * `[Tạo mới] src/components/user/ImportAccountsModal.jsx`: Thêm modal hỗ trợ tải lên tệp Excel import tài khoản đối tác/nhân viên.
  * `[Tạo mới] src/pages/manager/MeetingAttendance.jsx` & `src/pages/shared/MeetingAttendanceAdmin.jsx`: Thêm trang "Chuyên cần phòng ban" xem thời lượng tham dự cuộc họp.
  * `[Cập nhật] src/components/meeting/MeetingPresenceIVSS.jsx` & `src/pages/employee/MeetingDetail.jsx`: Tích hợp biểu đồ timeline thời lượng tham dự cuộc họp.
  * `[Cập nhật] src/pages/manager/layout/ManagerLayout.jsx`, `src/pages/bussinessAdmin/layout/BusinessAdminLayout.jsx`, `src/pages/systemAdmin/layout/SystemAdminLayout.jsx`: Thêm menu Chuyên cần phòng ban vào Sidebar.
  * `[Cập nhật] src/routers/index.js`: Cấu hình routing cho trang Chuyên cần phòng ban.
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`: Sửa định dạng `caseId` cảnh báo No-Show thành `noShowCaseId` và thêm thông báo lỗi khi xác nhận thất bại.
  * `[Xóa] UC_COMPLETION_PLAN.md`: Xóa tài liệu kế hoạch cũ đã lỗi thời.
* **Trạng thái**: Hoàn thành

### 2026-08-13 03:36
* **Tên Plan / Yêu cầu**: Tái cấu trúc và sửa đổi phong cách hiển thị Modal Chi tiết lượt vi phạm (Security Alerts).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/SecurityAlerts.jsx`:
    * Sửa đổi cấu trúc layout từng lượt vi phạm từ `items-center` thành `items-start` để căn lề trên đẹp mắt khi có nội dung dài.
    * Sửa kích thước ThumbnailImage trong modal bằng cách thêm `className="w-full h-full object-cover rounded-lg aspect-square border-0"` giúp ảnh nằm gọn gàng bên trong khung `w-20 h-20` (khắc phục hoàn toàn lỗi ảnh overflow đè lên cột thông tin văn bản bên cạnh).
    * Bổ sung các icon và hiển thị thông tin động trực quan cho các loại vi phạm: Thời gian (Clock icon), Họ tên (User icon), UID (Monospace), Biển số xe & Loại xe (Car icon & Plate badge), Watchlist (Pin icon), Độ tin cậy (Progress bar), Chi tiết lý do/lỗi (Alert icon).
* **Trạng thái**: Hoàn thành

### 2026-08-13 03:34
* **Tên Plan / Yêu cầu**: Tạm thời ẩn màn hình Quản lý cuộc họp phía Business Admin.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/layout/BusinessAdminLayout.jsx`:
    * Comment out mục "Cuộc họp" trong danh sách `STATIC_NAVIGATION_ITEMS` để ẩn khỏi menu Sidebar của Business Admin.
  * `[Cập nhật] src/routers/index.js`:
    * Comment out router `meetings` của Business Admin để vô hiệu hóa việc truy cập trực tiếp bằng URL.
* **Trạng thái**: Hoàn thành

### 2026-08-13 03:06
* **Tên Plan / Yêu cầu**: Sửa lỗi cập nhật trạng thái tài khoản người dùng (UC-08).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/UserManagement.jsx`:
    * Đổi tên trường trong payload gửi lên API `updateUserStatus` từ `accountStatus` thành `status` để khớp với DTO validator của Backend (sửa lỗi `property accountStatus should not exist`, `Trạng thái chỉ được là active hoặc inactive`, `Trạng thái phải là chuỗi ký tự`, và `Trạng thái không được để trống`).
* **Trạng thái**: Hoàn thành

### 2026-08-12 14:05
* **Tên Plan / Yêu cầu**: Ẩn và tự động gán vai trò Employee khi tạo tài khoản đối tác.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/bussinessAdmin/UserManagement.jsx`:
    * Ẩn hoàn toàn mục "Gán vai trò (Role)" trong modal Tạo mới tài khoản khi chọn loại tài khoản là "Đối tác" (accountType === 'partner').
    * Cập nhật logic validate trong `handleCreateSubmit`: bỏ qua ràng buộc yêu cầu bắt buộc gán vai trò khi tạo tài khoản đối tác.
    * Tự động tìm kiếm vai trò có mã `'EMPLOYEE'` trong danh sách `roles` (so khớp linh hoạt theo cả hai thuộc tính `roleCode` và `role_code` để tránh trả về mảng rỗng do lệch casing/naming trong API response thực tế của server, khắc phục hoàn toàn lỗi `400 Bad Request` khi gửi payload thiếu `roleIds`).
    * Gán tự động ID vai trò Employee vào `roleIds` trước khi đóng gói payload gửi lên API tạo tài khoản đối tác.
    * Cập nhật hàm `openEditModal` để phân tích vai trò linh hoạt theo cả `roleCode` và `role_code` tương ứng.
* **Trạng thái**: Hoàn thành

### 2026-08-12 12:40
* **Tên Plan / Yêu cầu**: Tích hợp API và hoàn thiện giao diện Quản lý phòng ban theo API Contract mới.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/service/businessAdminServices.js`:
    * Thêm các hàm API: `deactivateDepartment` gọi `POST /departments/:id/deactivate` và `reactivateDepartment` gọi `POST /departments/:id/reactivate` để bật/tắt phòng ban thay cho việc truyền `isActive` qua body của `PATCH` đã bị Backend gỡ bỏ.
  * `[Cập nhật] src/pages/bussinessAdmin/DepartmentManagement.jsx`:
    * Thêm cột **Trạng thái** trong bảng danh sách phòng ban hiển thị nhãn "Hoạt động" (nền xanh) hoặc "Vô hiệu hóa" (nền xám).
    * Bổ sung nút hành động **Vô hiệu hóa** (Power icon) và **Kích hoạt lại** (Refresh icon) cho từng phòng ban.
    * Tích hợp xử lý chi tiết các lỗi nghiệp vụ `409` trả về từ Backend khi deactive/reactive phòng ban để hiển thị thông báo thân thiện với người dùng (ví dụ: phòng ban con còn hoạt động, còn nhân viên, hoặc phòng ban cha đang bị vô hiệu hóa).
    * Thay thế ô nhập text "Phòng ban" (đang bị disabled mặc định) thành select dropdown trong **Edit User Modal** cho phép chuyển đổi phòng ban của nhân sự (gọi API `updateUser`).
    * Dropdown select chỉ hiển thị với actor có quyền `accounts.user.update` (thông qua helper `hasPermission`), còn đối với actor không có quyền này (như role `MANAGER`) sẽ hiển thị ô text input disabled để ngăn chặn chuyển đổi phòng ban.
* **Trạng thái**: Hoàn thành

### 2026-08-12 12:15
* **Tên Plan / Yêu cầu**: Sửa lỗi trắng màn hình quản lý khu vực và hoàn thiện Edit Modal cùng Validation.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/ZoneManagement.jsx`:
    * Sửa lỗi cú pháp lồng hàm do thiếu dấu đóng ngoặc `};` tại cuối hàm `handleEditSubmit` và xóa dấu đóng ngoặc dư `};` ở cuối file, giúp sửa triệt để lỗi crash làm trắng trang.
    * Tích hợp Edit Modal hoàn chỉnh thông qua React Portal (`createPortal`) để chỉnh sửa thông tin khu vực bao gồm: Mã khu vực, Tên khu vực, Loại khu vực, Trạng thái (active/inactive), Tòa nhà, Tầng, Mô tả, và Metadata JSON.
    * Bổ sung logic kiểm tra dữ liệu phía Client-side cho cả Create Form và Edit Form, chặn dữ liệu không hợp lệ vượt quá giới hạn độ dài ký tự của API (Mã khu vực tối đa 80, Tên khu vực tối đa 150, Tòa nhà tối đa 100, Tầng tối đa 30, Mô tả tối đa 255 ký tự).
    * Bổ sung validation kiểm tra định dạng JSON hợp lệ đối với trường Metadata trong Edit Modal trước khi submit.
* **Trạng thái**: Hoàn thành

### 2026-08-09 12:55
* **Tên Plan / Yêu cầu**: Tối ưu UI/UX - Xử lý lỗi spam API trong phòng họp (InMeetingRoom).
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Sửa logic hàm `callWithFallback`: Ngăn chặn việc tự động gọi API dự phòng (manager scope) nếu API chính (employee scope) đã trả về các lỗi phần quyền cứng (HTTP 403, 404, 409) nhằm tránh request bị gọi 2 lần vô ích.
    * Thêm cờ `attendanceErrorRef` và `devicesErrorRef` vào các hàm `loadAttendance` và `loadRoomDevices`. Nếu API gặp lỗi 403 hoặc 409 (do user không có quyền quản lý thiết bị, hoặc endpoint điểm danh bị conflict), hệ thống sẽ ngưng polling gọi lại định kỳ mỗi 15s để tránh spam console.
    * Tích hợp thêm trình xem trước (Preview) cho định dạng file PowerPoint (`.ppt`, `.pptx`) bằng cách sử dụng Iframe nhúng qua dịch vụ Microsoft Office Viewer (`view.officeapps.live.com`). Giờ đây khi bấm vào file slide, người dùng có thể xem trực tiếp nội dung thay vì chỉ có nút Tải xuống.
    * Thiết kế lại UI hiển thị Tài liệu đính kèm ở mục Chương trình (Agenda):
      * Xóa bỏ dải hiển thị file đính kèm bị trùng lặp bên ngoài nhằm làm gọn giao diện thẻ chương trình.
      * Tích hợp toàn bộ nút Xem tài liệu, Tải xuống, và Chiếu/Dừng chiếu (Host) vào thẳng từng dòng tài liệu trong mục `Tài liệu đính kèm` ở trạng thái mở rộng (Expanded Detail) để người dùng dễ thao tác.
      * Thêm class `whitespace-nowrap` và tinh chỉnh padding, size của nút "Chuyển mục tiếp theo" để tránh tình trạng tràn/xuống dòng chữ trên các màn hình hẹp.
    * Tinh chỉnh giao diện thẻ trạng thái (badge): Đổi màu trạng thái `Đang diễn ra` (`in_progress`) từ xanh ngọc (`emerald`) sang màu tím (`purple`) trên bảng Lịch và Dashboard để dễ dàng phân biệt rõ ràng với trạng thái `Đã kết thúc` (`completed` - giữ màu xanh ngọc).
    * Tối ưu hiển thị danh sách **Thiết bị phòng** trong Giao diện cuộc họp (`InMeetingRoom.jsx`):
      * Chuyển từ dạng danh sách trải dài sang dạng **Accordion (Thu gọn/Mở rộng)**.
      * Mặc định danh sách sẽ được thu gọn để tiết kiệm không gian màn hình, đặc biệt hữu ích khi phòng có quá nhiều thiết bị (ví dụ 16 thiết bị).
      * Khi mở rộng, danh sách sẽ có thanh cuộn dọc (scroll) giới hạn chiều cao (`max-h-[200px]`), giúp giao diện tổng thể không bị đẩy xuống quá sâu.
    * Cải tiến giao diện hiển thị người tham gia (MeetingGrid):
      * Sửa hình đại diện (Avatar) từ dạng hình vuông chiếm toàn bộ ô thành hình tròn (Circular) nằm ở giữa, giúp giao diện thanh lịch và chuyên nghiệp hơn.
      * Thiết kế lại hiệu ứng khi phát biểu (Speaking Animation): Loại bỏ viền vuông cứng ngắc và thay bằng hiệu ứng sóng âm (Ripple effect) - gồm các vòng tròn đồng tâm khuếch đại theo tần số âm thanh mô phỏng ngay xung quanh Avatar.
    * Sửa lỗi Lịch cá nhân (`PersonalCalendar.jsx`) và Trang chủ (`homePage.jsx`) không hiển thị cuộc họp đang diễn ra: Bổ sung thêm trạng thái `'in_progress'` vào bộ lọc mặc định khi gọi API `getMySchedule`. Điều này giúp người dùng (kể cả host hay khách) khi lỡ đóng tab phòng họp (InMeetingRoom) vẫn thấy thẻ cuộc họp trên giao diện để bấm nút vào lại. Việc đóng tab ở FE sẽ không tự động stop cuộc họp trên BE.
    * Sửa lỗi **API điểm danh thủ công** (Manual Check-In) trên giao diện `InMeetingRoom`: Đã thay đổi payload gọi API từ `participant.id` (ID bản ghi thành viên) sang `userId` (ID thực sự của User) để đồng bộ với spec mới nhất của Backend `POST /meetings/:meetingId/attendance`. Đồng thời sửa lại logic helper `isCheckedIn` và `getAttendanceRecord` để ánh xạ chính xác trạng thái điểm danh của thành viên trên danh sách tham gia.
* **Trạng thái**: Hoàn thành

### 2026-08-09 11:41
* **Tên Plan / Yêu cầu**: Cải thiện trải nghiệm nhìn - Tăng kích thước hình ảnh từ Camera.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/components/common/ThumbnailImage.jsx`:
    * Tăng kích thước hiển thị mặc định của `ThumbnailImage` từ `w-28` lên `w-32 md:w-40` để người dùng dễ nhìn hơn trong các bảng dữ liệu.
  * `[Cập nhật] src/pages/systemAdmin/SecurityAlerts.jsx`:
    * Cập nhật kích thước box placeholder "Không ảnh" đồng bộ với kích thước mới của `ThumbnailImage`.
* **Trạng thái**: Hoàn thành

### 2026-08-09 11:35
* **Tên Plan / Yêu cầu**: Tái cấu trúc (Refactor) giao diện bảng Cảnh báo An ninh.
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/systemAdmin/SecurityAlerts.jsx`:
    * Tách riêng cột **Ngày** và **Giờ** để tăng cường tính trực quan, dễ dàng theo dõi thời gian xảy ra vi phạm.
    * Tách riêng cột **Hình ảnh** (ảnh chụp từ camera) và cột **Thao tác** thành 2 cột riêng biệt, tránh tình trạng dồn ứ thông tin trong cùng một cột gây khó nhìn.
    * Tối ưu hiển thị placeholder "Không ảnh" bằng layout box chuyên biệt.
* **Trạng thái**: Hoàn thành

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

 # #   [ 2 0 2 6 - 0 8 - 0 9 ]   -   R e s p o n s i v e   U I   O p t i m i z a t i o n s 
 
 * * P l a n : * *   R e s p o n s i v e   U I   F i x e s 
 
 # # #   C h a n g e s   M a d e : 
 -   * * E m p l o y e e   L a y o u t : * *   A d d e d   M o b i l e   H a m b u r g e r   M e n u   a n d   D r a w e r   f o r   n a v i g a t i o n   o n   <   m d   s c r e e n s . 
 -   * * S y s t e m A d m i n   L a y o u t : * *   A d d e d   M o b i l e   T o p B a r   w i t h   H a m b u r g e r   M e n u   a n d   s l i d i n g   D r a w e r   f o r   s i d e b a r   o n   <   l g   s c r e e n s . 
 -   * * I n M e e t i n g R o o m : * *   O p t i m i z e d   r i g h t   p a n e l   f o r   m o b i l e   b y   e n f o r c i n g   a   m a x - h - [ 5 0 v h ]   r e s t r i c t i o n   a n d   e n a b l i n g   h o r i z o n t a l   s c r o l l i n g   f o r   c h a t / a t t e n d a n c e   t a b s . 
 -   * * R e s p o n s i v e   G r i d s   i n   M o d a l s : * *   U p d a t e d   E x p o r t R e p o r t M o d a l   a n d   E x p o r t M i n u t e s M o d a l   t o   t r a n s i t i o n   f r o m   g r i d - c o l s - 1   t o   g r i d - c o l s - 2   b a s e d   o n   s c r e e n   s i z e . 
  
 
 -   * * S y s t e m A d m i n   D a s h b o a r d : * *   E n l a r g e d   R e c h a r t s   P i e C h a r t   r a d i i   ( i n n e r   5 8 - > 7 0 ,   o u t e r   8 8 - > 9 5 )   a n d   s h i f t e d   c x   t o   4 0 %   t o   p r e v e n t   c e n t e r   t e x t   f r o m   b e i n g   c r o p p e d   b y   t h e   a c t i v e   s l i c e   s t r o k e .   I n c r e a s e d   f o n t   s i z e   o f   c e n t e r   t e x t   f o r   b e t t e r   c l a r i t y . 
  
 
 -   * * I n M e e t i n g : * *   T h a y   t h �  t h �  v i �n   \ d o c x - p r e v i e w \   b �n g   M i c r o s o f t   O f f i c e   V i e w e r   i f r a m e   ( \ i s M s O f f i c e \ )   �  h i �n   t h �  c � c   f i l e   W o r d   ( \ . d o c \ ,   \ . d o c x \ )   v �   P o w e r P o i n t   n h �m   g i �i   q u y �t   l �i   v �  g i a o   d i �n / h i �n   t h �  s a i   n �i   d u n g ,   m a n g   l �i   t r �i   n g h i �m   x e m   t � i   l i �u   n h �t   q u � n   v �   �n   �n h   h �n . 
  
 
## [2026-08-09] T�ch c?t Ng�y v� Gi?

- **Thay d?i**: T�ch c?t 'Th?i di?m' (ho?c 'Th?i gian') th�nh 2 c?t 'Ng�y' v� 'Gi?' trong c�c danh s�ch.
- **T?p tin ?nh hu?ng**: src/pages/systemAdmin/RoomAccessLogs.jsx, src/pages/systemAdmin/GateAccessManagement.jsx, src/pages/systemAdmin/AuditLogs.jsx.
- **Tr?ng th�i**: �� commit v� push (35c4f8d).

## [2026-08-09] C?p nh?t Nh?t k� ra/v�o ph�ng h?p (Room Access Logs)

- **Thay d?i**: 
  - C?p nh?t d?nh d?ng hi?n th? �? tin c?y (ki?m tra similarity, eliability, confidence). Nh�n v?i 100 n?u gi� tr? <= 1 d? lu�n hi?n th? d�ng % (v� d?:  .85 -> 85%).
  - �?i t�n c?t 'G?n cu?c h?p' th�nh 'Cu?c h?p'.
  - Hi?n th? T�n cu?c h?p thay v� ID cu?c h?p n?u c� th? l?y du?c d? li?u.
- **T?p tin ?nh hu?ng**: src/pages/systemAdmin/RoomAccessLogs.jsx, src/components/meeting/MeetingPresenceIVSS.jsx.
- **Tr?ng th�i**: �� commit v� push (d41a0fe).

---

## [2026-08-11] Fix: JSX fragment wrapping in UserJourney.jsx

- **Y�u c?u**: S?a l?i build Adjacent JSX elements must be wrapped in an enclosing tag t?i UserJourney.jsx:589.
- **Thay d?i**: B?c hai ph?n t? JSX ngang h�ng (<div> ch�nh v� <EventSnapshotModal>) trong React fragment <>...</> trong h�m eturn c?a component UserJourney.
- **T?p tin ?nh hu?ng**: src/pages/shared/UserJourney.jsx.
- **Tr?ng th�i**: �� ho�n th�nh.

---

## [2026-08-11] Fix: Avatar ngu?i tham d? hi?n th? sai trong tab Ngu?i tham d? (MeetingDetail)

- **Nguy�n nh�n**: H�m 
ormalizeMeetingDetail trong c? manager/MeetingDetail.jsx v� employee/MeetingDetail.jsx map danh s�ch participants nhung b? s�t tru?ng vatarUrl/vatar_url. K?t qu? l� m?i object participant sau normalize kh�ng c� tru?ng avatar, khi?n component UserAvatar lu�n hi?n th? ch? c�i d?u t�n thay v� ?nh th?t. Modal chi ti?t hi?n th? d�ng v� n� g?i th?ng getUserById() v� nh?n d?y d? d? li?u t? API.
- **Thay d?i**: Th�m d�ng vatarUrl: p.avatarUrl || p.avatar_url || p.user?.avatarUrl || p.user?.avatar_url || '' v�o ph?n map participants trong 
ormalizeMeetingDetail.
- **T?p tin ?nh hu?ng**: src/pages/manager/MeetingDetail.jsx, src/pages/employee/MeetingDetail.jsx.
- **Tr?ng th�i**: �� ho�n th�nh.

---

## [2026-08-11] Feature: Avatar + Modal chi ti?t ch? xe trong L?ch s? �ang k� Xe

- **Y�u c?u**: M�n h�nh L?ch s? �ang k� Xe c?n hi?n th? avatar th?c trong table v� m? modal chi ti?t th�ng tin ngu?i d�ng khi click v�o ch? xe, tuong t? m�n h�nh ANPR Management.
- **Ph�n t�ch API**: API /anpr/admin/vehicle-registrations tr? v? eg.owner ch?a th�ng tin ch? xe (fullName/full_name, email, phoneNumber, avatarUrl, department). Kh�ng c?n g?i th�m API ph? khi m? modal.
- **Thay d?i**:
  - Thay icon User tinh b?ng UserAvatar component (resolve d�ng avatar t? eg.owner).
  - T�n ch? xe th�nh link m�u xanh, click m? modal chi ti?t.
  - Th�m 
ormaliseOwner() d? map snake_case/camelCase v? c�ng shape.
  - Th�m modal chi ti?t (pattern createPortal gi?ng ANPRManagement.jsx) hi?n th? avatar l?n + ph�ng ban + email + S�T.
  - Import th�m UserAvatar, createPortal, icon Briefcase/Mail/Phone/X.
- **T?p tin ?nh hu?ng**: src/pages/systemAdmin/VehicleRegistrations.jsx.
- **Tr?ng th�i**: �� ho�n th�nh.

---

## [2026-08-11] Fix: Avatar ch? xe trong VehicleRegistrations � g?i getUserById d? l?y d? li?u d?y d?

- **Ph�n t�ch**: Theo t�i li?u YEU_CAU_BE_BOSUNG_THONG_TIN_USER_2026-08-09.md, API /anpr/admin/vehicle-registrations chua tr? v? vatarUrl trong object owner (BE chua implement). Do d� c?n g?i th�m getUserById d? l?y full user data c� avatar.
- **Thay d?i**:
  - Import th�m getUserById t? sysAdminServices.
  - Th�m state ownerDetail v� ownerDetailLoading.
  - handleOwnerClick m? modal ngay (v?i base info), r?i async fetch getUserById(userId) d? l?y avatar.
  - Modal uu ti�n ownerDetail (full, c� avatar) khi c�, fallback v? selectedOwner (base info t? API danh s�ch).
  - Hi?n spinner loading trong avatar slot khi dang fetch.
- **T?p tin ?nh hu?ng**: src/pages/systemAdmin/VehicleRegistrations.jsx.
- **Tr?ng th�i**: �� ho�n th�nh.


---

## [2026-08-11] Fix: Sửa lỗi cảnh báo React key trong RoomManagement

- **Phân tích**: Cảnh báo React "Each child in a list should have a unique 'key' prop" xuất hiện khi hiển thị danh sách phòng họp tại RoomManagement do trường `room.id` có thể không tồn tại hoặc bị undefined khi API trả về cấu trúc `roomId`.
- **Thay đổi**:
  - Cập nhật thuộc tính `key` của thẻ `tr` trong bảng danh sách phòng họp thành `room.id || room.roomId || idx` để đảm bảo luôn luôn có một key duy nhất.
  - Cập nhật các lệnh gọi API `updateRoom` và `deleteRoom` để hỗ trợ cả `room.roomId` bằng cách sử dụng fallback `room.id || room.roomId`.
- **Tập tin ảnh hưởng**: src/pages/bussinessAdmin/RoomManagement.jsx.
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Fix: Tích hợp Avatar và Modal Chi tiết Người dùng trong BiometricSubmissionsReview

- **Phân tích**: Người dùng muốn khi nhấp vào một người dùng trên danh sách duyệt ảnh sinh trắc học thì hiển thị Modal thông tin chi tiết của người dùng đó (ảnh đại diện, họ tên, phòng ban, email, số điện thoại, mã nhân viên). Đồng thời, danh sách duyệt cần hiển thị ảnh đại diện của người dùng.
- **Thay đổi**:
  - Tạo mới tài liệu yêu cầu Backend: [be-biometric-submission-avatar-requirement.md](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/docs/be-biometric-submission-avatar-requirement.md) mô tả chi tiết yêu cầu bổ sung trường `avatarUrl` trong API danh sách và chi tiết duyệt.
  - Cập nhật trang [BiometricSubmissionsReview.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/bussinessAdmin/BiometricSubmissionsReview.jsx):
    - Thêm các imports cho `Briefcase`, `Mail`, `Phone`, `X`, `motion`, `AnimatePresence`, và API `getUserById`.
    - Triển khai các state mới và hàm `handleOpenUserDetail` / `closeUserModal` để tải thông tin người dùng từ endpoint `/users/:id` thông qua service `getUserById`.
    - Gán sự kiện `onClick` lên `UserAvatar` và Họ tên của người dùng trong bảng danh sách để mở Modal chi tiết.
    - Render Modal chi tiết thông tin người dùng responsive và sử dụng hiệu ứng động từ `framer-motion`.
- **Tập tin ảnh hưởng**:
  - src/pages/bussinessAdmin/BiometricSubmissionsReview.jsx
  - docs/be-biometric-submission-avatar-requirement.md
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Fix: Tìm kiếm Nhân viên theo Mã nhân viên (Employee Code) trong UserJourney

- **Phân tích**: Người dùng muốn thanh tìm kiếm nhân viên trong màn hình Hành trình khuôn viên (User Journey) phải hỗ trợ tìm kiếm trên toàn hệ thống và cho phép tìm kiếm theo cả họ tên, email hoặc mã nhân viên. Dựa vào tài liệu API, tham số `search` của API `GET /users` hiện mới chỉ hỗ trợ tìm kiếm theo tên hoặc email. Do đó cần gửi yêu cầu cho Backend và cập nhật giao diện Frontend để tương thích và hiển thị mã nhân viên.
- **Thay đổi**:
  - Tạo mới tài liệu yêu cầu Backend: [be-users-search-by-employeecode-requirement.md](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/docs/be-users-search-by-employeecode-requirement.md) mô tả chi tiết yêu cầu Backend mở rộng bộ lọc so khớp trường `employeeCode` trong API `/users`.
  - Cập nhật trang [UserJourney.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/shared/UserJourney.jsx):
    - Sửa placeholder của ô tìm kiếm thành `"Nhập tên, email hoặc mã nhân viên..."`.
    - Cập nhật giao diện dropdown Autocomplete để hiển thị thêm mã nhân viên (`employeeCode` hoặc `employee_code`) dạng huy hiệu (badge) nhỏ bên cạnh họ tên.
- **Tập tin ảnh hưởng**:
  - src/pages/shared/UserJourney.jsx
  - docs/be-users-search-by-employeecode-requirement.md
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Document: Tài liệu yêu cầu Backend cho API Nhật ký ra/vào khu vực (Zone Access Log)

- **Phân tích**: Giao diện Quản lý Khu vực (Zone Management) gọi API `GET /ivss/zones/:zoneId/access-log` để lấy nhật ký ra vào. Endpoint này hiện chưa được định nghĩa trên Backend, và việc truy cập vào tiền tố `/ivss/*` bị chặn bởi quyền `ivss.access_log.read` (chỉ cấp mặc định cho SYSTEM_ADMIN).
- **Thay đổi**:
  - Tạo mới tài liệu yêu cầu Backend: [be-zone-access-log-requirement.md](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/docs/be-zone-access-log-requirement.md) đặc tả chi tiết yêu cầu Backend bổ sung endpoint `GET /ivss/zones/:zoneId/access-log` và xử lý nghiệp vụ truy vấn từ bảng sự kiện hiện diện khu vực (`zone_presence_events`).
- **Tập tin ảnh hưởng**:
  - docs/be-zone-access-log-requirement.md
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Fix: Sửa lỗi backdrop blur không phủ toàn bộ màn hình khi hiện Modal Xác nhận ban hành biên bản

- **Phân tích**: Lớp phủ nền (backdrop) của Modal "Xác nhận ban hành biên bản" trong `MinutesViewerEditor.jsx` bị giới hạn phạm vi hiển thị do bị ảnh hưởng bởi ngữ cảnh xếp chồng (stacking context) tạo ra bởi các component cha (ví dụ: transform chuyển trang).
- **Thay đổi**:
  - Nhập và tích hợp `createPortal` từ thư viện `react-dom`.
  - Bọc phần render Modal vào `createPortal` để đưa nó ra gốc `document.body`, giúp lớp phủ `fixed inset-0` giãn ra toàn bộ viewport và hiển thị hiệu ứng blur chuẩn xác.
- **Tập tin ảnh hưởng**:
  - src/components/minutes/MinutesViewerEditor.jsx
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Fix: Tích hợp API Xuất Nhật ký hệ thống (Export Audit Logs) và Bổ dung bộ lọc Mức độ

- **Phân tích**: Tích hợp tính năng xuất tệp Excel lịch sử kiểm toán hệ thống thông qua API `GET /api/v1/audit-logs/export`. Khắc phục lỗi lệch tên tham số lọc giữa giao diện và Backend (`action` -> `actionType`, `entity` -> `entityType`, `startDate` -> `from`, `endDate` -> `to`). Bổ sung cấu hình chuẩn hóa tiếng Việt cho Backend.
- **Thay đổi**:
  - Tạo mới tài liệu yêu cầu Backend: [be-audit-log-export-requirement.md](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/docs/be-audit-log-export-requirement.md) mô tả chi tiết yêu cầu chuẩn hóa từ ngữ chuyên ngành tiếng Việt cho file Excel.
  - Cập nhật [sysAdminServices.js](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/service/sysAdminServices.js): Ánh xạ tham số đúng định dạng Backend, thêm endpoint `exportAuditLogs`.
  - Cập nhật [AuditLogs.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/systemAdmin/AuditLogs.jsx): Bổ sung bộ lọc Mức độ (Severity) trên UI, kiểm tra tính hợp lệ của khoảng thời gian bắt buộc, gọi API thực tế và tải tệp Excel xuống.
- **Tập tin ảnh hưởng**:
  - src/service/sysAdminServices.js
  - src/pages/systemAdmin/AuditLogs.jsx
  - docs/be-audit-log-export-requirement.md
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Refactor: Cập nhật trang Phân tích Đúng giờ Chuyên cần theo đúng API contract

- **Phân tích**: Trang `EmployeeOnTimeAnalytics.jsx` trước đây đọc sai cấu trúc trường dữ liệu (`data.summary`, `data.users`) không tồn tại trong API thật. Đã tiến hành tái cấu trúc trang, sửa đổi các trường hiển thị Summary, thêm các biểu đồ phân tích xu hướng tuần, khung giờ và phòng ban, đồng thời thêm tính năng tìm kiếm nhân sự phục vụ drilldown lịch sử đi muộn.
- **Thay đổi**:
  - Cập nhật [EmployeeOnTimeAnalytics.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/shared/EmployeeOnTimeAnalytics.jsx):
    - Ánh xạ lại Summary, PieChart, TrendChart và HourlyChart theo đúng DTO của Backend.
    - Chuyển đổi input ID phòng ban thành Dropdown tải dữ liệu động thông qua API `/departments`.
    - Bổ sung thanh tìm kiếm nhân sự có debounce gọi `/users` để tra cứu nhanh.
    - Sửa đổi mảng duyệt Modal chi tiết thành `lateHistory.lateMeetings` và các trường `meetingTitle`, `scheduledStartTime`, `checkInTime`.
- **Tập tin ảnh hưởng**:
  - src/pages/shared/EmployeeOnTimeAnalytics.jsx
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Refactor: Di chuyển Room Detail thành Modal và đồng bộ API Schema

- **Phân tích**: Thay đổi cách hiển thị chi tiết phòng từ dạng trang inline sang Modal có hiệu ứng làm mờ nền toàn màn hình (`backdrop-blur-xl`). Đồng bộ hóa việc sử dụng các trường thông tin realtime từ API mới (`occupancyStatus`, `upcomingBookings`).
- **Thay đổi**:
  - Cập nhật [RoomManagement.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/bussinessAdmin/RoomManagement.jsx):
    - Tách logic hiển thị chi tiết phòng thành Modal sử dụng `createPortal` và `backdrop-blur-xl`.
    - Gọi API `getRoomDetail(roomId)` thực tế để lấy dữ liệu tĩnh đầy đủ cùng với realtime `occupancyStatus` và danh sách 5 cuộc họp tiếp theo `upcomingBookings`.
    - Định nghĩa các hằng số nhãn hiển thị trạng thái phòng `ADMIN_STATUS_LABELS` và No-show `getNoShowBadge`.
  - Cập nhật [businessAdminServices.js](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/service/businessAdminServices.js):
    - Thêm hàm `getRoomDetail` gọi tới `GET /rooms/:roomId`.
- **Tập tin ảnh hưởng**:
  - src/pages/bussinessAdmin/RoomManagement.jsx
  - src/service/businessAdminServices.js
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Style: Thêm whitespace-nowrap ngăn chặn xuống dòng dữ liệu bảng Phòng họp

- **Phân tích**: Dữ liệu trong bảng phòng họp bị xuống dòng ngoài ý muốn khi chiều rộng màn hình thu hẹp. Thêm thuộc tính CSS `whitespace-nowrap` cho toàn bộ tiêu đề cột (`th`) và các ô dữ liệu (`td`), đồng thời thay thế `flex-wrap` bằng `flex items-center` đối với cột Trang thiết bị để giữ cho dữ liệu hiển thị thẳng trên cùng một hàng và kích hoạt thanh cuộn ngang khi cần.
- **Thay đổi**:
  - Cập nhật [RoomManagement.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/bussinessAdmin/RoomManagement.jsx):
    - Thêm `whitespace-nowrap` vào 6 thẻ `th` trong `thead`.
    - Thêm `whitespace-nowrap` và `shrink-0` cho các ô `td` trong danh sách.
    - Sửa CSS Trang thiết bị của phòng từ `flex-wrap` thành `flex items-center`.
- **Tập tin ảnh hưởng**:
  - src/pages/bussinessAdmin/RoomManagement.jsx
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Refactor: Thiết kế bảng Phòng họp siêu gọn để tránh cuộn ngang (Scroll X)

- **Phân tích**: Yêu cầu hiển thị ngang đầy đủ trên cùng một dòng nhưng không được xuất hiện thanh cuộn ngang (Scroll X) trên màn hình tiêu chuẩn. Thực hiện tối ưu hóa diện tích các cột và giảm padding.
- **Thay đổi**:
  - Cập nhật [RoomManagement.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/pages/bussinessAdmin/RoomManagement.jsx):
    - Đổi lớp bọc từ `overflow-x-auto` thành `w-full` để triệt tiêu thanh cuộn ngang.
    - Giảm padding của tất cả các ô tiêu đề (`th`) và dữ liệu (`td`) từ `py-3.5 px-5` thành `py-3 px-3` cực kỳ gọn.
    - Thay thế cột Trang thiết bị dạng chữ dài bằng **biểu tượng icon tối giản** (Video, Mic, Monitor) có kèm thuộc tính `title` để hiển thị tooltip.
    - Định dạng cột Vị trí hiển thị inline gọn gàng dạng `Tòa nhà A (Khu vực B)` trên cùng một hàng.
    - Đảm bảo giữ nguyên bộ phân trang đầy đủ (`totalPages > 1`).
- **Tập tin ảnh hưởng**:
  - src/pages/bussinessAdmin/RoomManagement.jsx
- **Trạng thái**: Đã hoàn thành.


---

## [2026-08-11] Feat: Hỗ trợ xóa biên bản họp nháp (Draft) và sửa backdrop blur

- **Phân tích**: Tích hợp API xoá biên bản họp nháp `DELETE /api/v1/meeting-minutes/:id` (UC-MKM-05) của Backend. Chỉ cho phép các vai trò được phân quyền (người tạo, host cuộc họp, admin) thực hiện xóa, và chỉ áp dụng khi trạng thái là `draft`. Sửa lỗi làm mờ nền (backdrop blur) của Modal xác nhận ban hành và Modal xóa.
- **Thay đổi**:
  - Cập nhật [MinutesViewerEditor.jsx](file:///c:/Users/ASUS/Documents/ĐỒ%20ÁN%20SUMMER%202026/fe_smartracking/src/components/minutes/MinutesViewerEditor.jsx):
    - Nhập API `deleteMeetingMinutes` và icon `Trash2`.
    - Tính toán quyền xóa `canDelete` dựa trên vai trò hiện tại của user lấy từ `localStorage` và `isHost` prop.
    - Thêm nút **Xóa** ở thanh công cụ header, nút này sẽ bị disable nếu trạng thái biên bản không phải là `draft` (ví dụ đã published).
    - Triển khai Modal xác nhận xóa nháp sử dụng `createPortal` có nền làm mờ đầy đủ.
    - Sửa lớp phủ nền của Modal xác nhận ban hành từ `absolute` thành `fixed` để làm mờ toàn bộ màn hình một cách hoàn chỉnh.
- **Tập tin ảnh hưởng**:
  - src/components/minutes/MinutesViewerEditor.jsx
- **Trạng thái**: Đã hoàn thành.
- **[2026-08-13]** [Implementation Plan: Fix Manager Homepage Shortcuts & API Verification] Fix Manager Homepage shortcuts (Trạng thái phòng, Điểm danh phòng ban) & add departmentId to analytics API calls to prevent 403 Forbidden/Mock Data fallback.

### 2026-08-15 02:45
* **Tên Plan / Yêu cầu**: Cải thiện UI/UX màn hình trong phòng họp (InMeetingRoom) và thông báo hệ thống (ToastContainer)
* **Chi tiết thay đổi**:
  * `[Cập nhật] src/pages/shared/InMeetingRoom.jsx`:
    * Ẩn các nút tương tác (Giơ tay, Phát biểu, Cảm xúc) đối với Chủ tọa (Host) trên thanh điều khiển dưới cùng.
    * Đặt tab mặc định là "Chương trình" cho người tham dự khi tham gia phòng họp (trước đây bị hiển thị trắng do mặc định trỏ vào tab 'host').
    * Chặn quyền truy cập các tab quản lý (Q.Lý, Khách, Ghi âm) đối với người tham dự thông thường và hiển thị thông báo lỗi "Hệ thống chỉ dành cho host!".
    * Làm lại thanh điều hướng Tab: hiển thị nhãn ngắn gọn (Q.Lý, T.Gia, C.Trình), phân bố đều `flex-1`, loại bỏ cuộn ngang.
  * `[Cập nhật] src/components/common/ToastContainer.jsx`:
    * Thay đổi giao diện hiển thị thông báo hệ thống từ góc phải phía trên thành dạng pop-up ở giữa màn hình.
    * Thêm hiệu ứng làm mờ nền (blur backdrop) khi thông báo hiển thị để tập trung sự chú ý.
* **Trạng thái**: Hoàn thành
