# AGENTS.md

## Project Overview

Project Name: SmarTracking

SmarTracking là hệ thống quản lý Camera AI, kiểm soát phương tiện, giám sát thiết bị IoT, quản lý người dùng và phân quyền theo vai trò.

Ngôn ngữ hiển thị UI:

* 100% Tiếng Việt
* Không sử dụng tiếng Anh trong giao diện người dùng trừ các thuật ngữ kỹ thuật bắt buộc.

---

# HIGHEST PRIORITY RULES

Các quy tắc sau là bắt buộc.

AI Agent phải tuân thủ theo thứ tự ưu tiên:

1. BE Swagger tại endpoint `/api/v1/docs` (Không dùng tài liệu cũ)
2. DESIGN.md
3. Business Requirements
4. Taste Skill
5. AI Best Practices

Không được phép để quy tắc ưu tiên thấp hơn ghi đè quy tắc ưu tiên cao hơn.

---

# API RULES

BẮT BUỘC:

* Không tự tạo API.
* Không giả lập API.
* Không hardcode dữ liệu nếu API đã tồn tại.
* Không suy diễn business logic.
* Chỉ sử dụng API được định nghĩa trong API_REQUIREMENTS_FOR_FE.md.
* Nếu API chưa tồn tại phải ghi rõ:

"API chưa được định nghĩa trong API_REQUIREMENTS_FOR_FE.md"

thay vì tự tạo endpoint mới.

---

# ROLE RULES

Hệ thống có các vai trò:

* System Admin
* Admin
* Manager
* Employee

AI chỉ được hiển thị chức năng đúng với role hiện tại.

Không được:

* hiển thị menu ngoài phạm vi role
* hiển thị action ngoài phạm vi role
* hiển thị dữ liệu không thuộc quyền truy cập

---

# DESIGN RULES

Bắt buộc tuân thủ DESIGN.md.

Không thay đổi:

* Navbar
* Sidebar
* Footer
* Typography
* Color System
* Layout System
* Component Standards

Nếu DESIGN.md và Taste Skill xung đột:

DESIGN.md thắng.

---

# UI QUALITY RULES

Mỗi màn hình phải có:

## Loading State

* Skeleton loading
* Shimmer effect nếu phù hợp

Không sử dụng:

* Spinner mặc định đơn điệu

---

## Empty State

Mỗi danh sách phải có:

* Icon
* Tiêu đề
* Mô tả
* CTA phù hợp

---

## Error State

Hiển thị:

* Nguyên nhân
* Hành động khắc phục
* Nút thử lại

---

## Success Feedback

Hiển thị:

* Toast
* Snackbar
* Confirmation phù hợp

---

# RESPONSIVE RULES

Bắt buộc hỗ trợ:

* Desktop
* Laptop
* Tablet
* Mobile

Không được:

* overflow layout
* vỡ bảng dữ liệu
* che mất action

---

# TABLE RULES

Tất cả bảng dữ liệu phải có:

* Search
* Filter
* Sort
* Pagination
* Empty State
* Loading State

Nếu dữ liệu lớn:

* Server Pagination

---

# FORM RULES

Mọi form phải có:

* Validation
* Error Message
* Required Indicator
* Submit State
* Loading State

Không submit dữ liệu không hợp lệ.

---

# ACCESSIBILITY RULES

Bắt buộc:

* Label cho input
* Keyboard Navigation
* Focus State
* ARIA khi cần thiết

---

# CAMERA AI RULES

Các màn hình Camera AI phải hỗ trợ:

* Realtime Update
* Connection Status
* Device Health Status
* Stream State
* Alert State

Không được giả lập trạng thái camera.

---

# VEHICLE MANAGEMENT RULES

Các màn hình phương tiện phải hỗ trợ:

* Plate Number
* Vehicle Type
* Owner
* Entry Time
* Exit Time
* Recognition Confidence

Không tự suy diễn dữ liệu biển số.

---

# DASHBOARD RULES

Dashboard phải có:

* Welcome Banner
* KPI Cards
* Charts
* Recent Activities
* Notifications
* Quick Actions

Không được tạo dashboard dạng template đơn điệu.

---

# CODE QUALITY RULES

Ưu tiên:

* Reusable Components
* Feature Based Structure
* Type Safety
* Clean Architecture

Không:

* Duplicate Code
* Dead Code
* Magic Number
* Hardcoded Role

---

# BEFORE COMPLETING ANY TASK

AI Agent phải tự kiểm tra:

□ Có đúng API_CONTRACT.md không?

□ Có đúng ROLE_RULES.md không?

□ Có đúng DESIGN.md không?

□ Có responsive không?

□ Có loading state không?

□ Có empty state không?

□ Có error state không?

□ Có phân quyền đúng không?

□ Có sử dụng component tái sử dụng không?

□ Có phát sinh API ngoài hợp đồng không?

Chỉ được đánh dấu hoàn thành khi toàn bộ checklist đạt yêu cầu.

---

# TASTE SKILL INTEGRATION

Taste Skill chỉ được sử dụng để:

* cải thiện spacing
* cải thiện hierarchy
* cải thiện animation
* cải thiện visual balance
* cải thiện UX

Taste Skill không được:

* thay đổi business logic
* thay đổi API
* thay đổi role
* thay đổi luồng nghiệp vụ
* thay đổi kiến trúc hệ thống

Taste Skill là công cụ hỗ trợ UI, không phải nguồn sự thật của dự án.

---

# FRONTEND - BACKEND COLLABORATION RULES

BẮT BUỘC:

* Những yêu cầu chỉnh sửa bên Frontend KHÔNG ĐƯỢC tự ý thay đổi code Backend (BE) để phù hợp.
* Nếu yêu cầu từ Frontend cần có sự chỉnh sửa hoặc thêm mới API từ Backend, AI Agent phải chỉ ra rõ ràng yêu cầu thay đổi đó để đội ngũ Backend thực hiện, tuyệt đối không tự ý chỉnh sửa code Backend.
