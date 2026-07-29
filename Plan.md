# Plan.md — Mở rộng SmarTracking Frontend thành Campus Tracking Platform

## Context

SmarTracking ban đầu chỉ quản lý vòng đời phòng họp (đặt phòng, điểm danh, biên bản). Backend đã âm thầm code sẵn một lớp "Campus extension" đầy đủ: zones (khu vực/cổng/bãi đỗ), gate access logs, ANPR (nhận diện biển số), security alerts, IoT device events, campus-dashboard tổng hợp... Nhưng Frontend hiện tại (4 role: SYSTEM_ADMIN/BUSINESS_ADMIN/MANAGER/EMPLOYEE) chưa theo kịp: dashboard/trang chủ của cả 4 role vẫn tổ chức xoay quanh "cuộc họp" là chính, các trang campus (zone, ANPR, alerts, gate access) chỉ nằm rải rác trong menu con của SYSTEM_ADMIN, không tiếp cận được với BUSINESS_ADMIN/MANAGER/EMPLOYEE dù RBAC backend đã hỗ trợ mở rộng.

Mục tiêu: định hình lại thương hiệu, thiết kế lại dashboard cho từng role, điều chỉnh trang đăng nhập/quên mật khẩu, để phản ánh đúng scope "Campus Tracking" rộng hơn — dùng làm cơ sở triển khai code ở các phiên sau.

**Quyết định đã chốt:**
- KHÔNG cần landing page công khai — hệ thống nội bộ, người dùng vào thẳng trang login.
- EMPLOYEE ĐƯỢC tự đăng ký phương tiện (biển số xe) qua giao diện, trạng thái "chờ duyệt" — BUSINESS_ADMIN/SYSTEM_ADMIN duyệt sau.

**Đã xác minh trong code BE (tránh giả định sai khi code FE):**
- "Team của manager" = danh sách user có `direct_manager_id` = manager hiện tại — không có bảng `teams` riêng.
- `zones` không có multi-tenant scoping → hệ thống single-campus, BUSINESS_ADMIN xem toàn bộ zone/security data của tổ chức, không cần logic filter theo tổ chức.

Phần API cụ thể (endpoint nào có sẵn, endpoint nào BE cần code thêm) xem trong `Plan.md` phía backend (`capstone-be/Plan.md`) — bản này chỉ tập trung phần FE, coi các API mới ở BE là hợp đồng (contract) sẽ được cung cấp đúng như liệt kê ở mục 4.

---

## 1. Định vị thương hiệu

Giữ tên "SmarTracking", đổi framing từ "quản lý phòng họp" → "nền tảng giám sát & quản lý khuôn viên toàn diện", xoay quanh 4 trụ cột: Campus Awareness (zone/gate/occupancy), AI Security (ANPR/camera/alert), Smart Meeting Management (giữ nguyên tính năng cũ), IoT Device Health. Giữ nguyên toàn bộ design tokens trong `DESIGN.md` (Midnight Indigo #0B3558, Action Blue #006BFF, Gilroy/Montserrat, radius/shadow 3 cấp) — không tạo hệ thống thiết kế mới.

## 2. Trang đăng nhập & quên mật khẩu

- `src/pages/auth/login/login.jsx`: giữ nguyên layout 2 cột và toàn bộ luồng JWT kỹ thuật. Chỉ đổi nội dung 3 feature card ở panel trái:
  - "Hỗ trợ 24/7" → "Giám sát 24/7" (camera AI + cảnh báo an ninh)
  - "Dữ liệu chính xác" → "Nhận diện thông minh" (ANPR + face recognition)
  - "Tiết kiệm năng lượng" → "Quản lý toàn diện" (từ phòng họp đến cổng vào, IoT, báo cáo)
  - Cập nhật brand text ở logo nếu đang ghi cứng theo hướng "meeting".
- `forgotpassword.jsx` → `vertifyOTP.jsx` → `changePass.jsx`: giữ nguyên 100% luồng kỹ thuật — chỉ đồng bộ lại header/logo/copy cho khớp brand mới, đảm bảo progress indicator 3 bước nhất quán trên cả 3 trang.

## 3. Dashboard theo role

Nguyên tắc phân quyền: EMPLOYEE chỉ thấy dữ liệu cá nhân; MANAGER thấy dữ liệu team (qua `direct_manager_id`) + zone liên quan; BUSINESS_ADMIN thấy toàn tổ chức; SYSTEM_ADMIN thấy toàn bộ hạ tầng + campus.

### 3.1 EMPLOYEE — `src/pages/employee/homePage.jsx`
- Row 1 stat card: giữ "Cuộc họp hôm nay", "Tỷ lệ đúng giờ"; đổi "Security alerts" (chỉ đếm số) → "Trạng thái phương tiện của tôi"; đổi "Recordings" → "Lịch sử vào cổng hôm nay".
- Thêm widget "Lịch sử ra vào của tôi" — gọi `GET /gate-access/history?user_id=me` (API đã có, BE mở RBAC self-scope).
- Thêm widget "Thông báo liên quan đến tôi" — gọi unified notification feed (API mới bên BE, xem mục 4).
- Route/trang mới:
  - `src/pages/employee/MyGateAccess.jsx` — bảng lịch sử ra vào cá nhân
  - `src/pages/employee/MyVehicle.jsx` — form tự đăng ký biển số xe + hiển thị trạng thái pending/approved/rejected
  - `src/pages/employee/MyAlerts.jsx` — security alerts trong zone hiện diện của bản thân
- Navbar (`EmployeeLayout`): thêm dropdown "Cá nhân" → My Gate Access, My Vehicle, My Alerts.

### 3.2 MANAGER — `src/pages/manager/homePage.jsx`
- Giữ 2 tab Overview/Analytics. Overview mở rộng stat card (4 → 6): thêm "Thành viên đã vào cơ quan hôm nay", "Security alerts trong khu vực team", "Thiết bị offline trong khu vực".
- Thêm widget "Team Presence Today" (present/absent/unknown) và "Zone Occupancy" nhỏ cho zone team hay dùng.
- Route/trang mới:
  - `src/pages/manager/TeamPresence.jsx` — bảng thành viên + trạng thái có mặt hôm nay
  - `src/pages/manager/ManagerZoneOverview.jsx` — zone team hay dùng, occupancy, alerts
  - `src/pages/manager/ManagerSecurityAlerts.jsx` — có thể tái dùng component từ systemAdmin
- Navbar (`ManagerLayout`): thêm mục "Campus" → Team Presence, Zone Overview, Security Alerts.

### 3.3 BUSINESS_ADMIN — `src/pages/bussinessAdmin/dashBoard.jsx`
- Restructure thành 3 tab:
  - **Overview**: 6 stat card (tổng lượt ra vào, security alerts chưa xử lý, zone hoạt động/tổng, thiết bị online/tổng, phòng đang dùng/tổng, no-show rate) + widget Zone Traffic Heatmap + Security Alerts Feed
  - **Meetings & Rooms**: nội dung dashboard cũ giữ nguyên
  - **Security & Access** (mới): ANPR detections hôm nay, gate access timeline, danh sách vehicle watchlist
- Route/trang mới (tái dùng UI pattern từ systemAdmin, chỉ đổi guard/scope):
  - `src/pages/bussinessAdmin/ZoneManagement.jsx`
  - `src/pages/bussinessAdmin/BAGateAccess.jsx`
  - `src/pages/bussinessAdmin/BASecurityAlerts.jsx`
  - `src/pages/bussinessAdmin/PersonControlList.jsx`
  - `src/pages/bussinessAdmin/VehicleApprovals.jsx` — duyệt/từ chối xe do EMPLOYEE tự đăng ký (gọi API duyệt bên BE, mục 4)
- Navbar (`BusinessAdminLayout`): thêm dropdown "An Ninh & Khuôn Viên" → Zones, Gate Access, Security Alerts, Person Control, Vehicle Approvals.

### 3.4 SYSTEM_ADMIN — `src/pages/systemAdmin/dashBoard.jsx`
- Restructure thành 3 tab, đổi tab mặc định thành **Campus Overview** (mới): 6 stat card (tổng lượt ra vào, alerts mới, người hiện diện ước tính, xe trong bãi đỗ, zones hoạt động, ANPR bất thường hôm nay) + Zone Presence Timeline + Security Alerts Feed + ANPR Recent Events + Gate Traffic Chart.
- Tab **Infrastructure**: giữ nguyên nội dung dashboard hiện tại (device stats, chart theo loại thiết bị, IoT event log, audit log).
- Tab **Meetings**: di chuyển toàn bộ meeting/room-utilization/no-show stats từ dashboard hiện tại vào đây.

## 4. Hợp đồng API cần từ Backend (tham chiếu, chi tiết nằm ở `capstone-be/Plan.md`)

FE cần các endpoint sau — endpoint nào chưa có, BE sẽ code theo `capstone-be/Plan.md` mục 3:

| Endpoint | Trạng thái | Dùng ở màn hình |
|---|---|---|
| `GET /zones`, `GET /security-alerts`, `GET /gate-access/history`, `GET /gate-access/vehicle-traffic-stats`, `GET /anpr/vehicle-registrations`, `GET /anpr/vehicle-control-list`, `GET /iot/devices`, `GET /campus-dashboard/overview|zone-presence-timeline|zone-traffic-heatmap`, `GET /person-control-list` | Đã có, chỉ cần BE mở RBAC | Dashboard BA/SYSTEM_ADMIN, các trang Zone/Security/Gate Access |
| `GET /campus-dashboard/manager-summary` | Mới | MANAGER homePage |
| `GET /campus-dashboard/employee-summary` | Mới | EMPLOYEE homePage |
| `GET /campus-dashboard/business-admin-summary` | Mới | BUSINESS_ADMIN dashboard Overview tab |
| `GET /notifications/unified-feed`, `POST .../:id/read`, `POST .../read-all` | Mới | Widget thông báo mọi role |
| `GET /gate-access/team-presence?date=` | Mới | MANAGER TeamPresence.jsx |
| `POST /anpr/vehicle-registrations/self` | Mới | EMPLOYEE MyVehicle.jsx |
| `PATCH /anpr/vehicle-registrations/:id/approve|reject` | Mới | BUSINESS_ADMIN VehicleApprovals.jsx |

## 5. Tổng hợp file cần sửa/tạo

**Sửa:** `login.jsx`, `employee/homePage.jsx`, `manager/homePage.jsx`, `bussinessAdmin/dashBoard.jsx`, `systemAdmin/dashBoard.jsx`, các Layout (`EmployeeLayout`, `ManagerLayout`, `BusinessAdminLayout` trong `src/pages/<role>/layout/`), `forgotpassword.jsx`/`vertifyOTP.jsx`/`changePass.jsx` (chỉ đổi copy/brand).

**Tạo mới:**
- `src/pages/employee/{MyGateAccess,MyVehicle,MyAlerts}.jsx`
- `src/pages/manager/{TeamPresence,ManagerZoneOverview,ManagerSecurityAlerts}.jsx`
- `src/pages/bussinessAdmin/{ZoneManagement,BAGateAccess,BASecurityAlerts,PersonControlList,VehicleApprovals}.jsx`
- `src/service/campusDashboardService.js` (gọi các summary endpoint mới)
- `src/service/notificationFeedService.js` (gọi unified feed)
- `src/component/campus/{ZoneOccupancyCard,SecurityAlertsFeed,GateAccessTimeline}.jsx` (widget tái dùng nhiều nơi)

## 6. Lộ trình triển khai

**Phase 1 (impact cao nhất, không cần chờ API mới):** login page copy, SYSTEM_ADMIN dashboard 3-tab restructure, BUSINESS_ADMIN dashboard thêm tab Security & Access (dùng API đã có sau khi BE mở RBAC), thêm menu "An Ninh & Khuôn Viên" (tái dùng trang từ systemAdmin).

**Phase 2 (MANAGER & EMPLOYEE campus features, cần API mới từ BE mục 4):** TeamPresence/ManagerZoneOverview/ManagerSecurityAlerts, MyGateAccess/MyVehicle (form self-register + trạng thái pending)/MyAlerts; cập nhật navbar MANAGER/EMPLOYEE.

**Phase 3 (polish & nâng cao):** tích hợp unified notification bell/dropdown mọi navbar, VehicleApprovals cho BUSINESS_ADMIN, đồng bộ brand forgot-password, global search nếu còn thời gian, rà soát responsive theo DESIGN.md.

## Verification

Khi triển khai từng phase: chạy `npm start`, đăng nhập từng role, kiểm tra dashboard mới hiển thị đúng dữ liệu qua tab Network (đối chiếu response với hợp đồng API ở mục 4), kiểm tra điều hướng menu mới cho từng role, và test responsive (mobile/tablet/desktop) theo token trong `DESIGN.md`.
