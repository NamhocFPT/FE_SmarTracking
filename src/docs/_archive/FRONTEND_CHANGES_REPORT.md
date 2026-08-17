# Báo cáo chi tiết thay đổi Frontend so với nhánh `main`

**Ngày lập:** 04/07/2026
**Repo:** `FE_SmarTracking` (remote: `https://github.com/NamhocFPT/FE_SmarTracking.git`)
**Phương pháp:** so sánh working tree hiện tại với `HEAD` (commit `3249f02` trên nhánh `main`, đang up-to-date với `origin/main`) bằng `git status` / `git diff HEAD`.
**Trạng thái:** toàn bộ thay đổi bên dưới **chưa được commit** (working directory có changes, chưa `git add`/`git commit`).

---

## 1. Tổng quan

| Chỉ số | Giá trị |
|---|---|
| Số file đã thay đổi (tracked) | 14 |
| Số file mới (untracked) | 1 (`src/utils/socket.js`) |
| Tổng dòng thêm | 817 |
| Tổng dòng xoá | 191 |

```
package-lock.json                       |  86 ++++++++
package.json                            |   1 +
src/pages/bussinessAdmin/dashBoard.jsx  |  18 +-
src/pages/employee/MeetingDetail.jsx    |  44 +++-
src/pages/employee/PersonalCalendar.jsx | 162 ++++++++-------
src/pages/manager/MeetingApprovals.jsx  |  18 ++
src/pages/manager/MeetingDetail.jsx     |  44 +++-
src/pages/manager/homePage.jsx          |  45 +++-
src/pages/shared/InMeetingRoom.jsx      | 350 +++++++++++++++++++++++++++-----
src/service/authService.js              |   4 +-
src/service/businessAdminServices.js    |  41 ++--
src/service/employeeServices.js         |  69 ++++++-
src/service/managerServices.js          |  88 ++++++--
src/service/sysAdminServices.js         |  27 +--
src/utils/request.js                    |  11 +-
```

### Chủ đề chính của đợt thay đổi
Đây là một đợt **"nối dây" frontend với API thật của backend** (contract alignment), thay vì thêm tính năng UI mới. Các thay đổi tập trung vào 4 nhóm:

1. **Chuẩn hoá query string** dùng chung (`buildQuery`) cho toàn bộ service layer.
2. **Sửa endpoint sai/lệch hợp đồng API** (đổi mật khẩu, thống kê điểm danh, bắt đầu/kết thúc cuộc họp...).
3. **Bổ sung tích hợp realtime (WebSocket)** cho phòng họp trực tuyến (`InMeetingRoom.jsx`) qua `socket.io-client` mới.
4. **Map lại response DTO lồng nhau của backend** sang shape phẳng mà UI đang dùng, ở các trang Lịch cá nhân, Chi tiết cuộc họp, Dashboard.

---

## 2. Dependency mới

### `package.json` / `package-lock.json`
- Thêm `"socket.io-client": "^4.8.3"` — dùng để kết nối WebSocket realtime tới NestJS Gateway ở backend.
- `package-lock.json` cập nhật cây phụ thuộc tương ứng (86 dòng, không có thay đổi bất thường khác).

---

## 3. Lớp tiện ích dùng chung

### 3.1 `src/utils/request.js`
- **Thêm hàm `buildQuery(params)`**: xây query string từ object nhưng **lọc bỏ `undefined`/`null`/chuỗi rỗng** trước khi serialize.
  - *Vấn đề trước đây:* dùng trực tiếp `new URLSearchParams(params)` sẽ serialize cả `undefined`/`null` thành chuỗi literal `"undefined"`/`"null"` trong query, gây lỗi filter phía backend.
  - Hàm này được export và từ nay được dùng lại ở **tất cả các service** (xem mục 4).
- **Bớt 2 endpoint khỏi danh sách "public" (không cần token) trong `isPublicEndpoint`:**
  - Xoá `/auth/reset-password` và `/auth/forgot-password` khỏi `publicPaths`.
  - Giữ lại `/auth/password-reset/otp` và `/auth/password-reset/confirm` (đúng tên endpoint thật của backend cho luồng quên mật khẩu).
  - *Ý nghĩa:* 2 path cũ (`/auth/reset-password`, `/auth/forgot-password`) không khớp route backend thật nên được loại bỏ khỏi whitelist.

### 3.2 `src/utils/socket.js` — **File mới**
Module quản lý kết nối Socket.IO dùng chung cho toàn app:
- `getSocket()`: khởi tạo (lazy, singleton) kết nối tới `ws://localhost:3000` với path `/ws` (Gateway NestJS nằm ngoài prefix `/api/v1`), transport `websocket`, tự động connect.
- `subscribeToMeeting(meetingId)`: emit sự kiện `meeting:subscribe` để tham gia room realtime của một cuộc họp, trả về hàm cleanup để `emit('meeting:unsubscribe', ...)`.

> ⚠️ **Lưu ý:** `WS_BASE_URL` đang **hard-code `http://localhost:3000`**, chưa đọc từ biến môi trường (`.env`). Cần rà soát trước khi build production.

---

## 4. Service layer (gọi API)

Áp dụng đồng loạt cho `employeeServices.js`, `managerServices.js`, `businessAdminServices.js`, `sysAdminServices.js`:

### 4.1 Thay `new URLSearchParams(params).toString()` → `buildQuery(params)`
Áp dụng cho toàn bộ hàm `get*`/`export*` có query param (khoảng 25+ hàm trên 4 file), ví dụ: `getRooms`, `getUsers`, `getMySchedule`, `getDepartments`, `getAuditLogs`, `exportUsers`, `getManagerOverview`, v.v. Không đổi logic nghiệp vụ, chỉ đổi cách serialize để tránh gửi `"undefined"`/`"null"` lên backend.

### 4.2 Sửa endpoint sai hợp đồng API

| File | Hàm | Trước | Sau | Ghi chú |
|---|---|---|---|---|
| `authService.js` | `changePassword` | `POST /auth/me/password` | `PATCH /auth/change-password` | Đổi cả method (POST→PATCH) lẫn path |
| `businessAdminServices.js` | `getAttendanceAnalytics` | `GET /analytics/attendance/dashboard` | `GET /analytics/attendance/on-time-rate` | Backend không có route `/dashboard` cho attendance |
| `sysAdminServices.js` | `getAttendanceAnalytics` | `GET /analytics/attendance/dashboard` | `GET /analytics/attendance/on-time-rate` | Tương tự |
| `managerServices.js` | `getManagerAttendanceAnalytics` | `GET /analytics/attendance/dashboard` | `GET /analytics/attendance/on-time-rate` | Tương tự |
| `employeeServices.js` / `managerServices.js` | `startMeeting` | `POST /meetings/:id/start` | `POST /live-meetings/:id/start` | Đổi sang namespace `live-meetings` |

### 4.3 API mới cho phiên họp trực tiếp (Live Meeting) — thêm vào cả `employeeServices.js` và `managerServices.js`

| Hàm mới | Method & Path | Use-case |
|---|---|---|
| `endMeeting(id)` | `POST /live-meetings/:id/end` | UC-IMM-05: Kết thúc phiên họp (Host) |
| `requestExtension(id, data)` | `POST /meetings/:id/extension-requests` | UC-IMM-02: Yêu cầu gia hạn |
| `decideExtension(meetingId, requestId, data)` | `POST /live-meetings/:meetingId/extension-requests/:requestId/decide` | UC-IMM-03: Duyệt/từ chối gia hạn |
| `getPresentAttendees(meetingId, params)` | `GET /live-meetings/:meetingId/present-attendees` | UC-IMM-07: DS người đang có mặt |
| `getMeetingAttendance(meetingId, params)` | `GET /meetings/:meetingId/attendance` | UC-IMM-08: Trạng thái điểm danh |
| `createMeetingNote(meetingId, data)` | `POST /meetings/:meetingId/notes` | UC-IMM-09: Tạo ghi chú |
| `listMeetingNotes(meetingId, params)` | `GET /meetings/:meetingId/notes` | UC-IMM-09/10: DS ghi chú |

> Các hàm này được định nghĩa **trùng lặp** ở cả `employeeServices.js` và `managerServices.js` (copy-paste giống hệt nhau) — phù hợp với pattern fallback theo vai trò (employee-scope thử trước, manager-scope dự phòng) đã có sẵn trong `InMeetingRoom.jsx`, nhưng là nợ kỹ thuật nếu cần sửa sau này (phải sửa 2 nơi).

---

## 5. Các trang (pages) — thay đổi UI & logic

### 5.1 `src/pages/employee/PersonalCalendar.jsx` (162 dòng, thay đổi lớn nhất về logic)
- **Xoá toàn bộ mock data fallback** (4 cuộc họp giả lập khi API lỗi) — giờ khi lỗi sẽ hiển thị **banner lỗi thật** kèm nút "Thử lại", thay vì âm thầm hiển thị dữ liệu giả.
- **Thêm state `error`** và UI banner lỗi (icon `AlertTriangle`, nút retry gọi lại `fetchSchedule`).
- **Thêm hàm `mapEventToMeeting`**: chuyển đổi `ScheduleEventDto` của backend (`meetingId`, `meetingCode`, `userRole`, `room`, `isCurrent`, `isPast`...) sang shape mà component đang render (`id`, `myRole`, `room.roomName`...).
- **Sửa cách build tham số truy vấn lịch:**
  - Trước: chỉ gửi `from`/`to` dạng `YYYY-MM-DD` theo tháng.
  - Sau: gửi ISO datetime có timezone offset `+07:00` (`YYYY-MM-DDTHH:mm:ss+07:00`), và bắt buộc thêm tham số `view` (`day`/`week`/`month`) vì backend yêu cầu.
- **Response parsing:** đọc đúng shape `{ success, data: { items: [...], range, empty } }` thay vì coi `res.data` là mảng trực tiếp.
- **UI card cuộc họp:**
  - Bỏ hiển thị "Chủ trì: {host}" (dữ liệu này không còn trong response list) → đổi thành hiển thị **vai trò của người dùng hiện tại** trong cuộc họp ("Người tổ chức" / "Chủ trì" / "Người tham dự").
  - Bỏ badge "Có ghi hình" (trường `recordingEnabled` không có trong API list).
  - Thay phần mô tả cuộc họp (`description`, cũng không có trong list API) bằng **địa điểm phòng** (`room.location`).
  - Bỏ icon `Video` không dùng nữa khỏi import `lucide-react`, thêm `AlertTriangle`.

### 5.2 `src/pages/employee/MeetingDetail.jsx` & `src/pages/manager/MeetingDetail.jsx` (thay đổi giống hệt nhau ở 2 file)
- Trước đây set thẳng `res.data` vào state `meeting` (giả định response đã phẳng).
- Nay **map lại DTO lồng nhau** `{ meeting, host, organizer, room, participants, agendas, recordingConfig }` thành object phẳng cho UI, đồng thời giữ **cả 2 kiểu tên field** (camelCase và snake_case, ví dụ `startTime`/`start_time`, `hostId`/`host_id`) để tương thích ngược với các chỗ khác trong code đang dùng snake_case.
- Field `agenda`: map `durationMinutes` → `durationMin`, `sortOrder` → `orderIndex`.
- Field `host`: ưu tiên `dto.host?.fullName`, fallback `dto.organizer?.fullName`, fallback cuối `'Chưa rõ'`.

> Đây là 2 khối code **trùng lặp gần như 100%** giữa employee và manager — nên cân nhắc trích xuất thành 1 hàm `normalizeMeetingDetail` dùng chung (tương tự cách `InMeetingRoom.jsx` đã làm ở mục 5.5), tránh phải sửa 2 nơi khi hợp đồng API đổi.

### 5.3 `src/pages/manager/homePage.jsx`
- **Xử lý lỗi chi tiết hơn:** khi duyệt/từ chối yêu cầu họp thất bại, hiển thị `err?.error?.message` từ backend thay vì thông báo lỗi chung chung cố định.
- **Reset lỗi (`setError(null)`)** khi bắt đầu thao tác mới hoặc khi đóng modal — tránh lỗi cũ còn sót lại hiển thị nhầm.
- **Hiển thị banner lỗi ngay trong modal duyệt/từ chối** (trước đó lỗi có thể bị modal che khuất do modal đè lên toast ở cấp trang).
- **Map lại dữ liệu attendance summary** giống `dashBoard.jsx` (xem 5.4): tính `presentRate` từ `onTimeCount + lateCount` / `totalRequiredParticipants`, đổi `lateByDepartment` → `topLateUsers`.

### 5.4 `src/pages/bussinessAdmin/dashBoard.jsx`
- **Map lại response của `GET /analytics/attendance/on-time-rate`** (đã đổi endpoint — mục 4.2) sang shape UI cần:
  - `presentRate` = `(onTimeCount + lateCount) / totalRequiredParticipants * 100`, làm tròn 1 chữ số thập phân.
  - `onTimeRate`, `lateCount`, `absentCount` lấy trực tiếp.
  - `topLateUsers` được suy ra từ `lateByDepartment` (map theo **phòng ban**, không phải theo **người dùng** — cần lưu ý tên field `topLateUsers` hiện đang chứa dữ liệu phòng ban, có thể gây nhầm lẫn khi đọc code).

### 5.5 `src/pages/manager/MeetingApprovals.jsx`
- Thêm banner lỗi (`error`) bên trong modal duyệt và modal từ chối (giống `homePage.jsx`, cùng lý do: modal che khuất toast cấp trang).
- Reset `error` khi đóng modal.

### 5.6 `src/pages/shared/InMeetingRoom.jsx` (thay đổi lớn nhất, +350/-~70 dòng)
Đây là trang được nâng cấp sâu nhất trong đợt này — từ **mô phỏng hoàn toàn phía client (mock/localStorage)** sang **tích hợp thật với backend + realtime**:

1. **Chuẩn hoá dữ liệu cuộc họp:** thêm hàm `normalizeMeetingDetail(raw, currentUserId, currentUserEmail)` xử lý response lồng nhau `MyScheduleDetailDto` (tương tự mục 5.2), và có thêm logic đặc thù: vì `DetailParticipantDto` chỉ trả **id của dòng participant**, không phải **id user**, nên xác định "đây có phải là tôi không" bằng cách **so khớp email** thay vì id.
2. **Bắt đầu/Kết thúc cuộc họp gọi API thật:**
   - `handleStartMeeting`: gọi `startMeeting` qua `callWithFallback` (thử API scope employee trước, lỗi thì thử scope manager) thay vì chỉ đổi state cục bộ.
   - **Thêm mới `handleEndMeeting`**: gọi `endMeeting`, chuyển trạng thái sang `completed`.
   - Thêm state `actionLoading` để disable nút trong lúc gọi API, và hiển thị lỗi qua toast nếu API thất bại.
3. **Đồng bộ realtime qua WebSocket:**
   - `useEffect` mới subscribe vào room của meeting (`subscribeToMeeting`), lắng nghe sự kiện `meeting.session.started` / `meeting.session.ended` từ server để **tự động cập nhật trạng thái cho mọi client đang xem**, không chỉ riêng người bấm nút (ví dụ: host bấm "Bắt đầu" thì tất cả participant khác cũng thấy trạng thái đổi ngay).
4. **Ghi chú cuộc họp (Notes) — tính năng mới, có UI:**
   - State `notes`, `noteInput`; hàm `loadNotes()` (gọi `listMeetingNotes`), `handleAddNote()` (gọi `createMeetingNote`).
   - UI mới: khung nhập ghi chú + danh sách ghi chú hiển thị tên tác giả, nằm trong sidebar phòng họp (chỉ hiện logic tải khi `status === 'in_progress'`).
5. **Điểm danh hệ thống (Attendance) — tính năng mới, có UI:**
   - State `attendance`; hàm `loadAttendance()` (gọi `getMeetingAttendance`).
   - UI mới: danh sách người tham dự kèm trạng thái điểm danh (`attendanceStatus`), hiển thị "Chưa có dữ liệu điểm danh từ thiết bị" khi rỗng.
6. **Màn hình mới "Cuộc họp đã kết thúc" (View D):** khi `status === 'completed'`, hiển thị màn hình kết thúc với nút "Quay lại" (điều hướng về `/` nếu public hoặc `/employee`).
7. **Nút "Kết thúc cuộc họp cho tất cả"** thêm vào panel điều khiển của host.

> ⚠️ Điểm cần lưu ý khi review/test:
> - `loadNotes`/`loadAttendance` nuốt lỗi im lặng (comment giải thích: đây là tính năng phụ trợ, không chặn luồng chính) — có thể khiến lỗi backend khó phát hiện khi debug.
> - Cơ chế fallback `callWithFallback` (thử employee API trước, lỗi mới thử manager API) sẽ **luôn gọi 2 lần** nếu user là manager (lần 1 luôn lỗi 403/404 rồi mới thử lần 2) — có thể chấp nhận được nhưng tăng độ trễ và số lượng request lỗi trong log.
> - Kết nối WebSocket tới `localhost:3000` chưa cấu hình qua biến môi trường (xem mục 3.2).

---

## 6. Tổng hợp rủi ro / điểm cần theo dõi khi test

| # | Hạng mục | Rủi ro | Đề xuất kiểm thử |
|---|---|---|---|
| 1 | `socket.js` hard-code `localhost:3000` | Sẽ lỗi kết nối khi deploy môi trường khác | Thêm biến môi trường `REACT_APP_WS_URL`, test ở môi trường staging |
| 2 | `PersonalCalendar.jsx` bỏ mock fallback | Nếu API lỗi, user thấy trang trống + banner lỗi thay vì dữ liệu giả — cần xác nhận đây là hành vi mong muốn | Test khi backend down/timeout, kiểm tra banner + nút "Thử lại" |
| 3 | Đổi endpoint `changePassword` (POST→PATCH, path mới) | Nếu backend chưa deploy route mới sẽ lỗi 404 | Test luồng đổi mật khẩu end-to-end với backend thật |
| 4 | Đổi endpoint attendance analytics ở 3 file (`business admin`, `sys admin`, `manager`) | Cần backend đã có `/analytics/attendance/on-time-rate` | Test dashboard của cả 3 role |
| 5 | `startMeeting`/`endMeeting` đổi sang `/live-meetings/*` | Cần backend đã triển khai namespace mới | Test luồng bắt đầu/kết thúc họp bằng tài khoản host thật |
| 6 | Trùng lặp code map DTO giữa employee/manager (`MeetingDetail.jsx`, services) | Bảo trì khó, dễ quên sửa đồng bộ | Cân nhắc refactor chung 1 hàm/service dùng share |
| 7 | `topLateUsers` thực chất là dữ liệu theo phòng ban (`lateByDepartment`) | Đặt tên gây hiểu nhầm, dễ code sai sau này khi ai đó tưởng đây là danh sách user | Đổi tên biến hoặc field khi có dịp refactor |
| 8 | `callWithFallback` trong `InMeetingRoom.jsx` luôn thử 2 lần cho 1 trong 2 role | Tăng số request lỗi (403/404) trong log, tăng độ trễ nhẹ | Không chặn nhưng nên theo dõi log lỗi khi test |

---

## 7. Danh sách file thay đổi (tham chiếu nhanh)

- [package.json](package.json) — thêm dependency `socket.io-client`
- [package-lock.json](package-lock.json) — cập nhật lockfile
- [src/utils/request.js](src/utils/request.js) — thêm `buildQuery`, sửa danh sách public endpoint
- [src/utils/socket.js](src/utils/socket.js) — **mới**, quản lý kết nối WebSocket
- [src/service/authService.js](src/service/authService.js) — sửa endpoint đổi mật khẩu
- [src/service/employeeServices.js](src/service/employeeServices.js) — `buildQuery` + API live-meeting mới
- [src/service/managerServices.js](src/service/managerServices.js) — `buildQuery` + API live-meeting mới + sửa endpoint attendance
- [src/service/businessAdminServices.js](src/service/businessAdminServices.js) — `buildQuery` + sửa endpoint attendance
- [src/service/sysAdminServices.js](src/service/sysAdminServices.js) — `buildQuery` + sửa endpoint attendance
- [src/pages/employee/PersonalCalendar.jsx](src/pages/employee/PersonalCalendar.jsx) — tích hợp API thật, bỏ mock
- [src/pages/employee/MeetingDetail.jsx](src/pages/employee/MeetingDetail.jsx) — map DTO chi tiết cuộc họp
- [src/pages/manager/MeetingDetail.jsx](src/pages/manager/MeetingDetail.jsx) — map DTO chi tiết cuộc họp (giống employee)
- [src/pages/manager/homePage.jsx](src/pages/manager/homePage.jsx) — xử lý lỗi + map attendance summary
- [src/pages/manager/MeetingApprovals.jsx](src/pages/manager/MeetingApprovals.jsx) — banner lỗi trong modal
- [src/pages/bussinessAdmin/dashBoard.jsx](src/pages/bussinessAdmin/dashBoard.jsx) — map attendance summary
- [src/pages/shared/InMeetingRoom.jsx](src/pages/shared/InMeetingRoom.jsx) — realtime, start/end thật, notes, attendance, màn hình kết thúc họp

---

## 8. Gợi ý bước tiếp theo

1. Chạy `npm run build` / `npm start` và test thủ công các luồng bị ảnh hưởng (đăng nhập → đổi mật khẩu, lịch cá nhân, chi tiết cuộc họp, dashboard 3 role, phòng họp trực tuyến bắt đầu/kết thúc).
2. Xác nhận với team backend rằng các endpoint mới/đổi (`/auth/change-password`, `/analytics/attendance/on-time-rate`, `/live-meetings/:id/start|end`, `/meetings/:id/notes`, `/meetings/:id/attendance`, `/live-meetings/:id/present-attendees`, `/meetings/:id/extension-requests`) đã được deploy đúng trên môi trường test.
3. Sau khi test xong, `git add` + `git commit` theo từng nhóm thay đổi (nên tách commit theo chủ đề: dependency, utils, services, từng page) để dễ review và rollback nếu cần, thay vì commit gộp toàn bộ 15 file.
