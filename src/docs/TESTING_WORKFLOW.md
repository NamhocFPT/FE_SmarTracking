# Hướng Dẫn Kiểm Tra Giao Diện (Testing Workflow)

Tài liệu này tổng hợp các màn hình đã được thay đổi trong đợt cập nhật Frontend vừa qua. Bạn hãy làm theo luồng thao tác (Workflow) dưới đây để kiểm tra trực quan giao diện và xác nhận tính năng hiển thị đúng theo `DESIGN.md`.

---

## 1. Màn hình Chi tiết Cuộc họp (Tabs Điểm Danh)

**Người dùng áp dụng:** Employee (vai trò Chủ tọa - Host) hoặc Manager.
**File ảnh hưởng:** `src/pages/employee/MeetingDetail.jsx` và `src/pages/manager/MeetingDetail.jsx`

### Luồng kiểm tra:
1. Đăng nhập vào hệ thống với tài khoản **Employee** (người tạo cuộc họp) hoặc **Manager**.
2. Trên thanh menu, chọn **Lịch trình của tôi** (My Schedule) hoặc **Danh sách Cuộc họp**.
3. Nhấn vào một cuộc họp bất kỳ để vào trang **Chi tiết cuộc họp**.
4. **Kiểm tra giao diện:**
   - Ngay phía trên phần thông tin (Dưới tiêu đề cuộc họp), bạn sẽ thấy một **thanh Tabs** mới bao gồm 2 mục: 
     - `Thông tin & Lịch trình`
     - `Bảng Điểm Danh`
   - Giao diện Tabs có gạch chân màu xanh (`action-blue`) khi đang active, và màu xám nhạt khi inactive.
5. **Thao tác:**
   - Nhấn chuyển đổi qua lại giữa 2 tabs.
   - Nội dung bên dưới sẽ thay đổi mượt mà giữa "Thông tin chi tiết" (chế độ xem chia cột cũ) và bảng danh sách người tham dự.

---

## 2. Component Bảng Điểm Danh (Meeting Attendance)

**Người dùng áp dụng:** Employee (Host) / Manager.
**File ảnh hưởng:** `src/components/meetings/MeetingAttendance.jsx`

### Luồng kiểm tra:
1. Thực hiện các bước như mục 1 để mở tab **Bảng Điểm Danh** trong Chi tiết cuộc họp.
2. **Kiểm tra giao diện Bảng (Table):**
   - Hệ thống sẽ hiển thị một danh sách dạng bảng gồm các cột: Người tham dự, Thời gian check-in, Phương thức (FaceID/Manual), Vai trò, và Trạng thái điểm danh.
   - **Kiểm tra Badges (Trạng thái):**
     - Đảm bảo trạng thái **Đúng giờ (Present)** hiển thị badge nền xanh nhạt, chữ xanh lá.
     - Trạng thái **Đi muộn (Late)** hiển thị badge nền vàng nhạt, chữ vàng đậm, kèm theo số phút đi muộn (ví dụ: `Đi muộn (15p)`).
     - Trạng thái **Vắng mặt (Absent)** hiển thị badge nền đỏ nhạt, chữ đỏ.
   - **Kiểm tra Dropdown hành động (Manual Override):** Cột cuối cùng có nút ba chấm (Action), khi bấm vào (dành cho Host) sẽ sổ ra menu để cập nhật trạng thái thủ công.

---

## 3. Màn hình Quản lý Thiết bị (Camera / IoT)

**Người dùng áp dụng:** System Admin.
**File ảnh hưởng:** `src/pages/systemAdmin/DeviceManagement.jsx`

### Luồng kiểm tra:
1. Đăng nhập vào hệ thống với tài khoản **System Admin**.
2. Trên thanh menu, chọn **Quản lý thiết bị** (Device Management).
3. Tại bảng danh sách thiết bị (cột Hành động - Actions bên phải cùng).
4. **Kiểm tra giao diện:**
   - Bên cạnh các nút "Chỉnh sửa" (Edit) và "Xóa", bạn sẽ thấy xuất hiện một nút mới có **Icon Cấu hình (Settings/Sliders)** dành riêng cho thiết lập luồng Camera nâng cao.
   - Khi di chuột (hover) vào nút này, nền của nút sẽ chuyển sang màu tím nhạt (`hover:bg-purple-50`) và icon chuyển sang màu tím đậm (`royal-amethyst`) theo chuẩn `DESIGN.md`.
5. **Thao tác:**
   - Nhấp vào nút "Cấu hình mở rộng" này để đảm bảo nút có thể bắt được sự kiện click (hiện tại modal chức năng chuyên sâu sẽ được tích hợp logic ở phase sau).

---

## Các Lỗi Đã Được Khắc Phục Hoàn Toàn:
- Lỗi vỡ cấu trúc HTML/JSX (Adjacent JSX elements) tại màn hình MeetingDetail.
- Lỗi gọi Hook không hợp lệ (`react-hooks/rules-of-hooks`) trong màn hình `InMeetingRoom`.
- Lỗi import undefined (`buildQuery`) và mất API endpoint trong `employeeServices.js` & `managerServices.js`.
- Lỗi ký tự escape `\${...}` gây Parsing Error trong `MeetingAttendance.jsx`.

> **Lưu ý:** Nếu trong quá trình kiểm tra, có tab nào chưa hiển thị data thực tế, đó là do Backend chưa trả đủ trường hoặc logic đang dùng mock data, tuy nhiên *cấu trúc UI và CSS Layout* phải được hiển thị chính xác.
