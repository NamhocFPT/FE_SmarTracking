# Plan triển khai lại thay đổi Front-end (FE_SmarTracking) — đồng bộ 2 nhánh làm việc song song, không merge git

**Ngày soạn**: 2026-06-24

**Mục đích**: Plan này mô tả đầy đủ, chi tiết các thay đổi Front-end mình đã thực hiện trên checkout của mình (chưa commit, đang nằm ở working tree branch `fe-local-dev`). Gửi nguyên file này cho agent code của thành viên khác để họ áp dụng **đúng y như vậy** trên checkout riêng của họ — không cần git merge, không cần pull code.

*(File này thay thế file báo cáo trước đó `CHANGES_REPORT_FE_2026-06-24.md` — nội dung đã được gộp và viết lại dưới dạng plan hành động.)*

---

## 0. Nguyên tắc áp dụng (đọc trước khi làm)

1. Cả 2 checkout cùng xuất phát từ **commit gốc giống nhau** (`ba89d49` trên `main`/`origin/main` của repo `FE_SmarTracking`). Vì 2 bên không merge git, cách an toàn nhất để đảm bảo 2 codebase **tương thích** là: với file bị **ghi đè toàn bộ**, copy đúng 100% nội dung dán trong plan — không tự gõ lại, không "hiểu ý rồi viết khác". Với file chỉ **patch một phần** (đánh dấu rõ dưới mỗi mục), tìm đúng đoạn code cũ và thay bằng đoạn mới, giữ nguyên phần còn lại.
2. Áp dụng **đúng theo thứ tự số mục** — có phụ thuộc giữa các bước (ví dụ mục 2 dùng hàm `put()` mới thêm ở mục 1; mục 4-7 dùng các service ở mục 2).
3. Mỗi mục ghi rõ: **File** (đường dẫn đầy đủ từ root `FE_SmarTracking/`), **Hành động** (Tạo file mới / Ghi đè toàn bộ file / Patch một phần), **Vì sao** (bối cảnh nghiệp vụ), rồi nội dung cần áp dụng.
4. Mục 8 liệt kê các điểm mình **biết đang còn thiếu/lệch** ở bản của mình — KHÔNG nằm trong phạm vi cần áp dụng ngay, chỉ để 2 bên cùng biết và quyết định sau.
5. Mục 9 là API/contract của các hàm & component mới hoặc bị đổi signature — đảm bảo code khác (kể cả code ngoài phạm vi plan này) của 2 bên gọi vào vẫn chạy đúng bình thường sau khi áp dụng.
6. Mục 10 là checklist kiểm thử sau khi áp dụng xong toàn bộ.

---

## 1. Hạ tầng dùng chung (làm trước tiên — mọi mục sau đều phụ thuộc vào đây)

### 1.1 `src/utils/request.js` — Patch một phần

**Vì sao**: (a) đổi base URL từ mock json-server sang backend thật; (b) hỗ trợ `FormData` (multipart upload) — cần cho tính năng nộp ảnh đại diện ở mục 5-7; (c) thêm hàm `put()` — cần cho `replaceAgendas()` ở mục 2.1; (d) khi lỗi, ưu tiên lấy `message` ở root response trước `errorDetail.message`.

Tìm và thay 4 đoạn sau, giữ nguyên toàn bộ phần còn lại của file:

```diff
-const API_BASE_URL = 'http://localhost:5000'; // Using json-server mock DB port
+const API_BASE_URL = 'http://localhost:3000/api/v1'; // Connect to local backend API
```

```diff
 export const request = async (path, options = {}) => {
     const { method = 'GET', body, headers = {}, isPublic: customIsPublic } = options;
     const isPublic = customIsPublic !== undefined ? customIsPublic : isPublicEndpoint(path);
+    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
 
     const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
 
     const defaultHeaders = {
         'Accept': 'application/json',
-        'Content-Type': 'application/json',
+        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
         ...headers,
     };
```

```diff
     if (body) {
-        config.body = JSON.stringify(body);
+        config.body = isFormData ? body : JSON.stringify(body);
     }
```

```diff
         throw {
             success: false,
             error: {
-                message: errorDetail.message || 'Đã xảy ra lỗi hệ thống.',
+                message: result.message || errorDetail.message || 'Đã xảy ra lỗi hệ thống.',
                 code: errorDetail.code || 'UNKNOWN_ERROR',
                 requestId: requestId
             },
```

Và thêm hàm mới ngay trước `dele`:

```diff
+export const put = (path, body, options = {}) => request(path, { ...options, method: 'PUT', body });
+
 export const dele = (path, options = {}) => {
```

⚠️ **Lưu ý cho agent bên kia**: tuyệt đối **không** tự set `headers['Content-Type'] = 'multipart/form-data'` ở nơi gọi API với `FormData` — nếu set tay sẽ thiếu `boundary`, backend (Multer) sẽ parse lỗi. Cứ để `post(path, formData)` forward thẳng xuống `request()`, browser tự set header đúng.

---

## 2. Service layer

### 2.1 `src/service/employeeServices.js` — Ghi đè toàn bộ file

**Vì sao**: thêm `getAvailableRooms()` (tìm phòng trống có check trùng giờ ở backend, thay cho việc FE tự tính), `addRecordingConfig()`, `replaceAgendas()`, `addInternalParticipant()` — phục vụ luồng đặt phòng mới ở mục 7.2 (`BookMeeting.jsx`). `getRooms()` cũ được giữ lại nhưng đánh dấu `@deprecated`, chỉ còn dùng ở trang xem chi tiết phòng, **không còn dùng trong `BookMeeting.jsx`**.

Nội dung cuối cùng:

```js
import { get, post, patch, put } from '../utils/request';

// ============================================================
// EMPLOYEE APIs (UC-SM-01 ~ UC-SM-03)
// ============================================================

/**
 * Get rooms available in a given time range (server-side conflict check)
 * @param {object} params - { startTime, endTime, minCapacity } (startTime/endTime: ISO8601)
 */
export const getAvailableRooms = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/rooms/available${query ? `?${query}` : ''}`);
};

/**
 * @deprecated Backend chưa có endpoint list phòng (GET /rooms). Dùng cho các trang ngoài
 * phạm vi luồng booking (MeetingDetail.jsx); KHÔNG dùng trong BookMeeting.jsx (xem getAvailableRooms).
 * @param {object} params - { page, limit }
 */
export const getRooms = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/rooms${query ? `?${query}` : ''}`);
};

/**
 * Tìm kiếm/lấy danh sách rút gọn nhân viên nội bộ (dùng cho autocomplete chọn participants)
 * @param {object} params - { page, limit, search }
 */
export const getUsers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users${query ? `?${query}` : ''}`);
};

/**
 * Create a new meeting / Book a meeting room
 * @param {object} data - Meeting booking payload (CreateMeetingDto)
 */
export const createMeeting = async (data) => {
    return await post('/meetings', data);
};

/**
 * Tạo cấu hình ghi âm/ghi hình cho cuộc họp (gọi sau khi tạo họp thành công)
 * @param {string} meetingId
 * @param {object} data - { enableVideo, enableAudio, consentRequired, ... }
 */
export const addRecordingConfig = async (meetingId, data) => {
    return await post(`/meetings/${meetingId}/recording-config`, data);
};

/**
 * Ghi đè toàn bộ chương trình họp (agenda) - atomic replace
 * @param {string} meetingId
 * @param {Array<{title: string, plannedDurationMinutes: number, description?: string, ownerId?: string}>} items
 */
export const replaceAgendas = async (meetingId, items) => {
    return await put(`/meetings/${meetingId}/agendas`, { items });
};

/**
 * Thêm thành viên nội bộ vào cuộc họp (sau khi tạo họp)
 * @param {string} meetingId
 * @param {object} data - { userId, overrideWarnings?, warningToken? }
 */
export const addInternalParticipant = async (meetingId, data) => {
    return await post(`/meetings/${meetingId}/participants/internal`, data);
};

/**
 * UC-22: Tra cứu lịch trình cá nhân
 * @param {object} params - { from, to, view, status }
 */
export const getMySchedule = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/me/schedule${query ? `?${query}` : ''}`);
};

/**
 * UC-ACC-07: Xem chi tiết hồ sơ user (self)
 * @param {number|string} userId
 */
export const getUserById = async (userId) => {
    return await get(`/users/${userId}`);
};

/**
 * UC-AM-12: Cập nhật thông tin cá nhân (self)
 * @param {object} data - { fullName, phoneNumber, avatarFileId }
 */
export const updateSelfProfile = async (data) => {
    return await patch('/me/profile', data);
};

/**
 * UC-AM-13: Đăng ký dữ liệu khuôn mặt và liên kết vào tài khoản người dùng
 * @param {number|string} userId
 * @param {object} data - Payload matching backend schema
 */
export const registerFaceProfile = async (userId, data) => {
    return await post(`/users/${userId}/face-profile`, data);
};

/**
 * UC-SM-04: Xem chi tiết cuộc họp
 */
export const getMeetingById = async (id) => {
    return await get(`/meetings/${id}`);
};

/**
 * UC-SM-02: Chỉnh sửa cuộc họp
 */
export const updateMeeting = async (id, data) => {
    return await patch(`/meetings/${id}`, data);
};

/**
 * UC-SM-03: Hủy cuộc họp
 */
export const cancelMeeting = async (id, reason = '') => {
    return await post(`/meetings/${id}/cancel`, { reason });
};

/**
 * UC-SM-08: Check-in bằng khuôn mặt vào phòng họp
 */
export const checkInMeeting = async (id, data) => {
    return await post(`/meetings/${id}/check-in`, data);
};

/**
 * Bắt đầu cuộc họp (Host action)
 */
export const startMeeting = async (id) => {
    return await post(`/meetings/${id}/start`);
};

/**
 * UC-REC-01: Lấy danh sách các bản ghi (recording sessions) của cuộc họp employee tham gia
 */
export const getMyRecordings = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/me/recordings${query ? `?${query}` : ''}`);
};

/**
 * Tải xuống bản ghi/tài liệu cuộc họp
 */
export const getRecordingDownloadUrl = async (sessionId) => {
    return await get(`/recordings/${sessionId}/download`);
};
```

### 2.2 `src/service/managerServices.js` — Ghi đè toàn bộ file

**Vì sao**: bỏ toàn bộ logic fallback gọi mock-server (`/meeting_requests`, tự map quan hệ phòng/người dùng qua các lời gọi `/rooms`, `/users` riêng) — giờ gọi thẳng endpoint thật `/meeting-requests` với whitelist query camelCase; `approve`/`reject` chỉ gọi endpoint thật `POST /meeting-requests/{id}/approve|reject`, không còn fallback PATCH mock khi lỗi.

⚠️ **Breaking signature**: `getPendingMeetingRequests` không còn nhận `departmentId` đơn lẻ mà nhận object params camelCase (`approvalStatus`, `page`, `limit`, ...) — xem mục 9.

Nội dung cuối cùng:

```js
import { get, post, patch } from '../utils/request';

// ============================================================
// DASHBOARD & ANALYTICS APIs for Department Manager
// ============================================================

/**
 * Fetch overview stats for manager's department
 * @param {object} params - { from, to, departmentId }
 */
export const getManagerOverview = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/dashboard/overview${query ? `?${query}` : ''}`);
};

/**
 * Fetch room analytics for manager's department
 */
export const getManagerRoomAnalytics = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/rooms/dashboard${query ? `?${query}` : ''}`);
};

/**
 * Fetch attendance analytics for manager's department
 */
export const getManagerAttendanceAnalytics = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/attendance/dashboard${query ? `?${query}` : ''}`);
};

/**
 * Fetch meetings trend count
 */
export const getManagerMeetingsCountByPeriod = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/count-by-period${query ? `?${query}` : ''}`);
};

/**
 * Fetch status breakdown for department meetings
 */
export const getManagerMeetingStatusBreakdown = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/status-breakdown${query ? `?${query}` : ''}`);
};

/**
 * Fetch average meeting duration for department
 */
export const getManagerAverageMeetingDuration = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/average-duration${query ? `?${query}` : ''}`);
};

/**
 * Fetch cancel rate for department meetings
 */
export const getManagerMeetingCancelRate = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/cancel-rate${query ? `?${query}` : ''}`);
};

/**
 * Fetch no-show stats for department
 */
export const getManagerNoShowStats = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/rooms/no-show-rate${query ? `?${query}` : ''}`);
};

// ============================================================
// MEETING APPROVAL REQUESTS (UC-SM-05 & UC-SM-06)
// ============================================================

/**
 * Fetch meeting requests pending manager approval
 * Contract: GET /meeting-requests (MeetingRequestQueryDto - camelCase, whitelist-only params)
 * @param {object} params - { approvalStatus, page, limit, requestType, targetRoomId, requestedById, from, to, q, sortBy, sortOrder }
 */
export const getPendingMeetingRequests = async (params = {}) => {
    const query = new URLSearchParams({
        approvalStatus: params.approvalStatus || 'pending',
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.requestType && { requestType: params.requestType }),
        ...(params.targetRoomId && { targetRoomId: params.targetRoomId }),
        ...(params.requestedById && { requestedById: params.requestedById }),
        ...(params.from && { from: params.from }),
        ...(params.to && { to: params.to }),
        ...(params.q && { q: params.q }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
    }).toString();

    return await get(`/meeting-requests?${query}`);
};

/**
 * UC-SM-05: Approve meeting room request
 * Contract: POST /meeting-requests/{id}/approve { decisionNote }
 */
export const approveMeetingRequest = async (requestId, decisionNote = '') => {
    return await post(`/meeting-requests/${requestId}/approve`, { decisionNote });
};

/**
 * UC-SM-06: Reject meeting room request
 * Contract: POST /meeting-requests/{id}/reject { rejectionReason }
 */
export const rejectMeetingRequest = async (requestId, rejectionReason = '') => {
    return await post(`/meeting-requests/${requestId}/reject`, { rejectionReason });
};

/**
 * UC-158: Export meeting activities report
 */
export const exportMeetingActivity = async (data) => {
    return await post('/reports/meeting-activity/exports', data);
};

/**
 * Get departments list
 */
export const getDepartments = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/departments${query ? `?${query}` : ''}`);
};

/**
 * UC-22: Tra cứu lịch trình cá nhân
 * @param {object} params - { from, to, view, status }
 */
export const getMySchedule = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/me/schedule${query ? `?${query}` : ''}`);
};

/**
 * UC-ACC-07: Xem chi tiết hồ sơ user (self)
 * @param {number|string} userId
 */
export const getUserById = async (userId) => {
    return await get(`/users/${userId}`);
};

/**
 * UC-AM-12: Cập nhật thông tin cá nhân (self)
 * @param {object} data - { fullName, phoneNumber, avatarFileId }
 */
export const updateSelfProfile = async (data) => {
    return await patch('/me/profile', data);
};

/**
 * UC-AM-13: Đăng ký dữ liệu khuôn mặt và liên kết vào tài khoản người dùng
 * @param {number|string} userId
 * @param {object} data - Payload matching backend schema
 */
export const registerFaceProfile = async (userId, data) => {
    return await post(`/users/${userId}/face-profile`, data);
};

/**
 * UC-SM-04: Xem chi tiết cuộc họp
 */
export const getMeetingById = async (id) => {
    return await get(`/meetings/${id}`);
};

/**
 * UC-SM-02: Chỉnh sửa cuộc họp
 */
export const updateMeeting = async (id, data) => {
    return await patch(`/meetings/${id}`, data);
};

/**
 * UC-SM-03: Hủy cuộc họp
 */
export const cancelMeeting = async (id, reason = '') => {
    return await post(`/meetings/${id}/cancel`, { reason });
};

/**
 * UC-SM-08: Check-in bằng khuôn mặt vào phòng họp
 */
export const checkInMeeting = async (id, data) => {
    return await post(`/meetings/${id}/check-in`, data);
};

/**
 * Bắt đầu cuộc họp (Host action)
 */
export const startMeeting = async (id) => {
    return await post(`/meetings/${id}/start`);
};

/**
 * Get available meeting rooms
 */
export const getRooms = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/rooms${query ? `?${query}` : ''}`);
};

/**
 * Get users (for inviting participants)
 */
export const getUsers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users${query ? `?${query}` : ''}`);
};
```

### 2.3 `src/service/avatarService.js` — Tạo file mới

**Vì sao**: service dùng chung cho cả 4 role để tự xem trạng thái & tự nộp/nộp lại ảnh đại diện.

Nội dung:

```js
import { get, post } from '../utils/request';

/** GET /api/v1/me/avatar-status */
export const getAvatarStatus = async () => get('/me/avatar-status');

/**
 * POST /api/v1/me/avatar-submission (multipart/form-data)
 * @param {File} file
 * @param {boolean} consentAccepted
 */
export const submitAvatar = async (file, consentAccepted) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('consentAccepted', consentAccepted ? 'true' : 'false');
    return post('/me/avatar-submission', formData);
};
```

### 2.4 `src/service/avatarReviewService.js` — Tạo file mới

**Vì sao**: service riêng cho System Admin để xem danh sách & duyệt/từ chối ảnh đại diện.

Nội dung:

```js
import { get, post } from '../utils/request';

/** GET /api/v1/admin/avatar-submissions */
export const getAvatarSubmissions = async (params = {}) => {
    const cleaned = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleaned).toString();
    return get(`/admin/avatar-submissions${query ? `?${query}` : ''}`);
};

/** GET /api/v1/admin/avatar-submissions/:id */
export const getAvatarSubmissionDetail = async (id) => get(`/admin/avatar-submissions/${id}`);

/** GET /api/v1/admin/avatar-submissions/:id/download-url */
export const getAvatarDownloadUrl = async (id) => get(`/admin/avatar-submissions/${id}/download-url`);

/** POST /api/v1/admin/avatar-submissions/:id/approve */
export const approveAvatarSubmission = async (id) => post(`/admin/avatar-submissions/${id}/approve`, {});

/** POST /api/v1/admin/avatar-submissions/:id/reject  body: { reason } */
export const rejectAvatarSubmission = async (id, reason) => post(`/admin/avatar-submissions/${id}/reject`, { reason });
```

---

## 3. Routing

### 3.1 `src/routers/index.js` — Patch một phần

**Vì sao**: thêm import + route con `avatar-submissions` dưới `/system-admin`.

```diff
 import Notifications from '../pages/systemAdmin/Notifications';
+import AvatarSubmissionsReview from '../pages/systemAdmin/AvatarSubmissionsReview';
```

```diff
             {
                 path: 'notifications',
                 element: <Notifications />
             },
+            {
+                path: 'avatar-submissions',
+                element: <AvatarSubmissionsReview />
+            },
         ]
     },
```

(đoạn này nằm trong nhánh route con của `/system-admin`, đặt sau item `notifications`)

---

## 4. Component dùng chung cho tính năng Avatar (mới)

### 4.1 `src/component/AvatarReminder/AvatarUploadForm.jsx` — Tạo file mới

**Vì sao**: form upload tái dùng giữa popup nhắc nộp ảnh (mục 5) và trang Profile (mục 7.1) — validate type/size client-side, checkbox đồng ý bắt buộc trước khi enable nút gửi, map mã lỗi backend sang tiếng Việt.

Nội dung:

```jsx
import { useState } from 'react';
import { submitAvatar } from '../../service/avatarService';

const ERROR_MAP = {
    AVATAR_FILE_REQUIRED: 'Vui lòng chọn một ảnh để tải lên.',
    AVATAR_FILE_TOO_LARGE: 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB).',
    AVATAR_FILE_TYPE_INVALID: 'Định dạng ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG, WEBP.',
    AVATAR_CONSENT_REQUIRED: 'Bạn cần đồng ý cho phép sử dụng ảnh trước khi tiếp tục.',
    ACCOUNT_NOT_ACTIVE: 'Tài khoản của bạn hiện không ở trạng thái hoạt động.',
    AVATAR_ALREADY_PENDING_REVIEW: 'Ảnh đại diện của bạn đang chờ duyệt, vui lòng đợi kết quả trước khi nộp ảnh khác.',
    AVATAR_STORAGE_FAILED: 'Không thể lưu ảnh vào hệ thống lưu trữ. Vui lòng thử lại.',
    AVATAR_UPLOAD_FAILED: 'Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại sau.',
};

const mapError = (code) => ERROR_MAP[code] || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

const AvatarUploadForm = ({ onSuccess, onCancel, compact }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [consentAgreed, setConsentAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!ALLOWED_TYPES.includes(f.type)) {
            setError('Định dạng ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG, WEBP.');
            return;
        }
        if (f.size > MAX_SIZE) {
            setError('Ảnh vượt quá dung lượng cho phép (tối đa 5MB).');
            return;
        }

        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Vui lòng chọn một ảnh để tải lên.');
            return;
        }
        if (!consentAgreed) {
            setError('Bạn cần đồng ý cho phép sử dụng ảnh trước khi tiếp tục.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await submitAvatar(file, true);
            if (res?.success) {
                onSuccess?.(res.data);
            } else {
                setError(res?.error?.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
            }
        } catch (err) {
            const code = err?.error?.code;
            setError(code ? mapError(code) : (err?.error?.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={compact ? 'space-y-4' : 'space-y-5'}>
            {!compact && (
                <h3 className="text-base font-bold text-midnight-indigo">Tải lên ảnh đại diện</h3>
            )}

            {/* File picker area */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-action-blue/10 bg-gradient-to-tr from-action-blue to-glacier-blue flex items-center justify-center text-white text-3xl font-extrabold select-none">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Chọn ảnh
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
                </label>
                <span className="text-[10px] text-steel-gray">Chấp nhận JPG, PNG, WEBP — tối đa 5MB</span>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Consent checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-steel-gray text-action-blue focus:ring-action-blue/30"
                />
                <span className="text-xs text-slate-blue leading-relaxed">
                    Tôi đồng ý cho phép SmarTracking sử dụng ảnh này cho mục đích nhận diện và hiển thị hồ sơ.
                </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !file || !consentAgreed}
                    className="flex-1 py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Đang gửi...' : 'Gửi ảnh'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="py-2.5 px-5 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-all"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </div>
    );
};

export default AvatarUploadForm;
```

### 4.2 `src/component/AvatarReminder/AvatarReminderModal.jsx` — Tạo file mới

**Vì sao**: popup tự động nhắc user nộp/nộp lại ảnh khi `shouldShowAvatarPopup === true` (gọi `getAvatarStatus()` khi mount), không bao giờ chặn người dùng — luôn có nút đóng (X) và "Để sau", dismiss lưu theo `sessionStorage` (không lưu lên backend, không có cơ chế đó ở BE).

Nội dung:

```jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAvatarStatus } from '../../service/avatarService';
import AvatarUploadForm from './AvatarUploadForm';

const STATUS_LABEL = {
    not_uploaded: { label: 'Chưa nộp ảnh', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
    pending_review: { label: 'Đang chờ duyệt', badge: 'bg-blue-50 text-action-blue border border-blue-200' },
    rejected: { label: 'Bị từ chối', badge: 'bg-red-50 text-red-700 border border-red-200' },
    approved: { label: 'Đã duyệt', badge: 'bg-green-50 text-green-700 border border-green-200' },
};

const AvatarReminderModal = () => {
    const [open, setOpen] = useState(false);
    const [avatarData, setAvatarData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) { setLoading(false); return; }
                const user = JSON.parse(userStr);
                const userId = user.id || 'anon';

                const dismissed = sessionStorage.getItem('avatarPopupDismissed_' + userId);
                if (dismissed === 'true') { setLoading(false); return; }

                const res = await getAvatarStatus();
                if (cancelled) return;
                if (res?.success && res.data) {
                    const data = res.data;
                    setAvatarData(data);
                    if (data.shouldShowAvatarPopup === true) {
                        setOpen(true);
                    }
                }
            } catch {
                // Silent fail — don't break UX on network error
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        check();
        return () => { cancelled = true; };
    }, []);

    const handleDismiss = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                sessionStorage.setItem('avatarPopupDismissed_' + (user.id || 'anon'), 'true');
            }
        } catch {}
        setOpen(false);
    };

    const handleUploadSuccess = (data) => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.avatarReviewStatus = 'pending_review';
                user.shouldShowAvatarPopup = false;
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('storage'));
            }
        } catch {}
        setOpen(false);
    };

    if (!open || loading) return null;

    const status = avatarData?.avatarReviewStatus || 'not_uploaded';
    const statusInfo = STATUS_LABEL[status] || STATUS_LABEL.not_uploaded;

    const title = status === 'rejected'
        ? 'Ảnh đại diện của bạn đã bị từ chối'
        : 'Bạn chưa nộp ảnh đại diện';

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-sm-2 w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="px-6 pt-5 pb-2 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-midnight-indigo">{title}</h3>
                        <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusInfo.badge}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1.5 text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-lg transition-colors"
                        aria-label="Đóng"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Message from backend */}
                {avatarData?.message && (
                    <div className="px-6 pb-1">
                        <p className="text-xs text-slate-blue leading-relaxed">{avatarData.message}</p>
                    </div>
                )}

                {/* Body: AvatarUploadForm */}
                <div className="px-6 pb-5 pt-3">
                    <AvatarUploadForm
                        compact
                        onSuccess={handleUploadSuccess}
                        onCancel={handleDismiss}
                    />
                </div>

                {/* Bottom dismiss link (không chặn) */}
                <div className="px-6 pb-5 flex justify-center">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-xs text-slate-blue hover:text-midnight-indigo underline underline-offset-2 transition-colors"
                    >
                        Để sau
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AvatarReminderModal;
```

---

## 5. Mount popup nhắc nộp ảnh ở layout

### 5.1 `src/pages/employee/layout/EmployeeLayout.jsx` — Patch một phần

```diff
 import { logout } from '../../../service/authService';
 import logo from '../../../assets/images/logo.png';
+import AvatarReminderModal from '../../../component/AvatarReminder/AvatarReminderModal';
```

```diff
             <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
                 <Outlet />
+                <AvatarReminderModal />
             </main>
```

### 5.2 `src/pages/manager/layout/ManagerLayout.jsx` — Patch một phần

Y hệt mẫu ở mục 5.1 (cùng 2 đoạn import + mount, chỉ khác đường dẫn file):

```diff
 import { logout } from '../../../service/authService';
 import logo from '../../../assets/images/logo.png';
+import AvatarReminderModal from '../../../component/AvatarReminder/AvatarReminderModal';
```

```diff
             <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
                 <Outlet />
+                <AvatarReminderModal />
             </main>
```

### 5.3 `src/pages/systemAdmin/layout/SystemAdminLayout.jsx` — Patch một phần

Cùng mẫu import + mount như trên:

```diff
 import { logout } from '../../../service/authService';
 import logo from '../../../assets/images/logo.png';
+import AvatarReminderModal from '../../../component/AvatarReminder/AvatarReminderModal';
```

```diff
             <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
                 <Outlet />
+                <AvatarReminderModal />
             </main>
```

⚠️ `src/pages/bussinessAdmin/layout/BusinessAdminLayout.jsx` **CHƯA** được mount popup này ở bản của mình — xem mục 8.2. KHÔNG nằm trong phạm vi áp dụng của plan này (để 2 bên thống nhất trước).

---

## 6. Trang mới: System Admin duyệt ảnh đại diện

### 6.1 `src/pages/systemAdmin/AvatarSubmissionsReview.jsx` — Tạo file mới

**Vì sao**: trang list + filter (trạng thái/tìm kiếm debounce 400ms/phòng ban) + pagination + modal xem chi tiết + duyệt/từ chối submission ảnh đại diện (chỉ System Admin, theo route mục 3.1). Cố tình **không** fetch ảnh thật cho từng dòng trong danh sách (chỉ hiện avatar chữ cái đầu) vì `GET /download-url` ghi audit log mỗi lần gọi — chỉ tải ảnh thật khi admin mở modal chi tiết.

Nội dung:

```jsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    getAvatarSubmissions,
    getAvatarSubmissionDetail,
    getAvatarDownloadUrl,
    approveAvatarSubmission,
    rejectAvatarSubmission,
} from "../../service/avatarReviewService";
import { getDepartments } from "../../service/sysAdminServices";

const STATUS_MAP = {
    pending_review: { label: "Đang chờ duyệt", badge: "bg-blue-50 text-action-blue border border-blue-200" },
    rejected: { label: "Bị từ chối", badge: "bg-red-50 text-red-700 border border-red-200" },
    approved: { label: "Đã duyệt", badge: "bg-green-50 text-green-700 border border-green-200" },
    active: { label: "Đã duyệt", badge: "bg-green-50 text-green-700 border border-green-200" },
    not_uploaded: { label: "Chưa nộp ảnh", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
};

const ERROR_MAP = {
    AVATAR_SUBMISSION_NOT_FOUND: "Không tìm thấy yêu cầu duyệt ảnh này.",
    AVATAR_SUBMISSION_NOT_PENDING: "Yêu cầu này đã được xử lý trước đó.",
    AVATAR_REJECTION_REASON_REQUIRED: "Vui lòng nhập lý do từ chối.",
    AVATAR_REJECTION_REASON_TOO_LONG: "Lý do từ chối không được vượt quá 500 ký tự.",
    AVATAR_MEDIA_NOT_FOUND: "Không tìm thấy ảnh gốc của yêu cầu này.",
    AVATAR_DOWNLOAD_URL_FAILED: "Không thể tải ảnh lúc này. Vui lòng thử lại.",
    AVATAR_APPROVE_FAILED: "Không thể duyệt ảnh này. Vui lòng thử lại.",
    AVATAR_REJECT_FAILED: "Không thể từ chối ảnh này. Vui lòng thử lại.",
    FORBIDDEN: "Bạn không có quyền thực hiện hành động này.",
};

const AvatarSubmissionDetailModal = ({ faceProfileId, onClose, onActionComplete }) => {
    const [detail, setDetail] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [loadingImage, setLoadingImage] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);

    // Rejection UI state
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadingDetail(true);
            try {
                const res = await getAvatarSubmissionDetail(faceProfileId);
                if (cancelled) return;
                if (res?.success && res.data) {
                    setDetail(res.data);
                    setLoadingDetail(false);
                    if (res.data.hasPreview) {
                        setLoadingImage(true);
                        try {
                            const imgRes = await getAvatarDownloadUrl(faceProfileId);
                            if (!cancelled && imgRes?.success && imgRes.data?.downloadUrl) {
                                setDownloadUrl(imgRes.data.downloadUrl);
                            }
                        } catch {
                            // downloadUrl stays null; rendered as "Không thể tải ảnh" below
                        } finally {
                            if (!cancelled) setLoadingImage(false);
                        }
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setActionError(err?.error?.message || ERROR_MAP[err?.error?.code] || "Đã xảy ra lỗi hệ thống.");
                    setLoadingDetail(false);
                }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [faceProfileId]);

    const handleApprove = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn duyệt ảnh đại diện này?")) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await approveAvatarSubmission(faceProfileId);
            if (res?.success) {
                setTimeout(() => {
                    onActionComplete?.();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            const code = err?.error?.code;
            if (code === "AVATAR_SUBMISSION_NOT_PENDING") {
                setActionError("Yêu cầu này đã được xử lý bởi quản trị viên khác.");
                setTimeout(() => { onActionComplete?.(); onClose(); }, 1500);
            } else {
                setActionError(ERROR_MAP[code] || err?.error?.message || "Không thể duyệt ảnh này.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await rejectAvatarSubmission(faceProfileId, rejectReason.trim());
            if (res?.success) {
                setTimeout(() => {
                    onActionComplete?.();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            const code = err?.error?.code;
            if (code === "AVATAR_SUBMISSION_NOT_PENDING") {
                setActionError("Yêu cầu này đã được xử lý bởi quản trị viên khác.");
                setTimeout(() => { onActionComplete?.(); onClose(); }, 1500);
            } else {
                setActionError(ERROR_MAP[code] || err?.error?.message || "Không thể từ chối ảnh này.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50 sticky top-0 z-10">
                    <h3 className="font-bold text-midnight-indigo">Chi tiết yêu cầu duyệt ảnh</h3>
                    <button onClick={onClose} className="text-slate-blue hover:text-midnight-indigo">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {actionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{actionError}</div>
                    )}

                    {loadingDetail ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : detail ? (
                        <>
                            {/* Image area */}
                            <div className="flex justify-center">
                                {loadingImage ? (
                                    <div className="w-48 h-48 bg-cloud-mist rounded-xl flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : downloadUrl ? (
                                    <img src={downloadUrl} alt="Avatar submission" className="w-48 h-48 object-cover rounded-xl border border-platinum-tint" />
                                ) : (
                                    <div className="w-48 h-48 bg-cloud-mist rounded-xl flex items-center justify-center text-xs text-slate-blue">
                                        {detail.hasPreview ? "Không thể tải ảnh" : "Ảnh không khả dụng"}
                                    </div>
                                )}
                            </div>
                            {downloadUrl && (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard?.writeText(downloadUrl);
                                            setLinkCopied(true);
                                            setTimeout(() => setLinkCopied(false), 2000);
                                        }}
                                        className="text-xs text-action-blue hover:underline font-semibold"
                                    >
                                        {linkCopied ? "Đã sao chép!" : "Sao chép link ảnh"}
                                    </button>
                                </div>
                            )}

                            {/* Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-slate-blue block">Họ tên</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.fullName || detail.user?.fullName || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Email</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.email || detail.user?.email || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Mã nhân viên</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.employeeCode || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Phòng ban</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.department?.departmentName || detail.department?.name || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Trạng thái</span>
                                    <span className={"inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold " + ((STATUS_MAP[detail.status] || STATUS_MAP.pending_review).badge)}>
                                        {(STATUS_MAP[detail.status] || STATUS_MAP.pending_review).label}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Ngày nộp</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString("vi-VN") : ""}</span>
                                </div>
                            </div>

                            {detail.consentAt && (
                                <div className="text-xs text-slate-blue">
                                    Đồng ý sử dụng ảnh: {new Date(detail.consentAt).toLocaleString("vi-VN")}
                                </div>
                            )}

                            {detail.imageFile && (
                                <div className="text-xs text-slate-blue space-y-0.5">
                                    <div>Tên tệp: {detail.imageFile.fileName || ""}</div>
                                    <div>Định dạng: {detail.imageFile.mimeType || ""}</div>
                                    <div>Kích thước: {formatBytes(detail.imageFile.fileSizeBytes)}</div>
                                </div>
                            )}

                            {detail.status === "rejected" && detail.reviewMetadata?.rejectionReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <span className="text-xs font-bold text-red-700 block">Lý do từ chối</span>
                                    <span className="text-xs text-red-600 mt-1 block">{detail.reviewMetadata.rejectionReason}</span>
                                </div>
                            )}

                            {/* Actions */}
                            {detail.status === "pending_review" && (
                                <div className="border-t border-platinum-tint pt-4 space-y-3">
                                    {showRejectInput ? (
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-blue uppercase">Lý do từ chối</label>
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                maxLength={500}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue resize-none"
                                                placeholder="Nhập lý do từ chối (bắt buộc)"
                                            />
                                            <div className="flex justify-between text-xs text-steel-gray">
                                                <span>{(Array.from(rejectReason).length) + "/500"}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                                                    className="px-4 py-2 border border-platinum-tint bg-white text-slate-blue rounded-xl text-xs font-semibold"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={actionLoading || !rejectReason.trim() || Array.from(rejectReason).length > 500}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold disabled:opacity-40"
                                                >
                                                    {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                                            >
                                                {actionLoading ? "Đang xử lý..." : "Duyệt"}
                                            </button>
                                            <button
                                                onClick={() => setShowRejectInput(true)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-sm text-slate-blue py-8">Không tìm thấy thông tin.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const AvatarSubmissionsReview = () => {
    const [submissions, setSubmissions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filter
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending_review");
    const [deptFilter, setDeptFilter] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Detail modal
    const [selectedId, setSelectedId] = useState(null);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Load departments
    useEffect(() => {
        (async () => {
            try {
                const res = await getDepartments({ limit: 100 });
                if (res?.success) setDepartments(res.data || []);
            } catch {}
        })();
    }, []);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit,
                status: statusFilter || undefined,
                q: debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
                departmentId: deptFilter || undefined,
            };
            const res = await getAvatarSubmissions(params);
            if (res?.success) {
                setSubmissions(res.data || []);
                setTotalPages(res.meta?.totalPages || 1);
                setTotal(res.meta?.total || (res.data?.length || 0));
            }
        } catch (err) {
            setError(err?.error?.message || "Không thể tải danh sách.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, debouncedSearch, deptFilter]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);
    useEffect(() => {
        if (error) {
            const t = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(t);
        }
    }, [error]);

    const handleRefresh = () => {
        setPage(1);
        fetchSubmissions();
    };

    const handleActionComplete = () => {
        setSuccessMessage("Thao tác thành công.");
        fetchSubmissions();
    };

    const getInitial = (name) => (name || "?").charAt(0).toUpperCase();

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Duyệt ảnh đại diện</h1>
                <p className="text-slate-blue text-sm mt-1">Xem xét và duyệt/từ chối ảnh đại diện do người dùng gửi lên.</p>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-2 flex flex-wrap items-center gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:outline-none focus:border-action-blue bg-white"
                >
                    <option value="pending_review">Đang chờ duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                    <option value="active">Đã duyệt</option>
                    <option value="">Tất cả trạng thái</option>
                </select>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm (tối thiểu 2 ký tự)..."
                    className="flex-1 min-w-[200px] px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                />

                <select
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:outline-none focus:border-action-blue bg-white"
                >
                    <option value="">Tất cả phòng ban</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.departmentName || d.name}</option>
                    ))}
                </select>

                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-semibold transition-all"
                >
                    Làm mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-cloud-mist border-b border-platinum-tint">
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Avatar</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Họ tên</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Email</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Mã NV</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Phòng ban</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Ngày nộp</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-blue">Không có yêu cầu nào.</td>
                                </tr>
                            ) : (
                                submissions.map((sub) => (
                                    <tr key={sub.id || sub.faceProfileId} className="border-b border-platinum-tint/50 hover:bg-cloud-mist/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-action-blue to-glacier-blue flex items-center justify-center text-white font-bold text-sm">
                                                {getInitial(sub.fullName || sub.user?.fullName)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-midnight-indigo">{sub.fullName || sub.user?.fullName || ""}</td>
                                        <td className="px-4 py-3 text-slate-blue">{sub.email || sub.user?.email || ""}</td>
                                        <td className="px-4 py-3 text-slate-blue">{sub.employeeCode || ""}</td>
                                        <td className="px-4 py-3 text-slate-blue">{sub.department?.departmentName || sub.department?.name || sub.user?.department?.name || ""}</td>
                                        <td className="px-4 py-3">
                                            <span className={"inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold " + ((STATUS_MAP[sub.status] || STATUS_MAP.pending_review).badge)}>
                                                {(STATUS_MAP[sub.status] || STATUS_MAP.pending_review).label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-blue">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("vi-VN") : ""}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedId(sub.id || sub.faceProfileId)}
                                                className="px-3 py-1.5 border border-platinum-tint bg-white text-action-blue hover:bg-cloud-mist rounded-lg text-xs font-semibold transition-all"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                        <span className="text-xs text-slate-blue">Tổng: {total} yêu cầu</span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 border border-platinum-tint bg-white text-slate-blue rounded-lg text-xs font-semibold disabled:opacity-40"
                            >
                                Trước
                            </button>
                            <span className="text-xs text-slate-blue">Trang {page} / {totalPages}</span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 border border-platinum-tint bg-white text-slate-blue rounded-lg text-xs font-semibold disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selectedId && (
                <AvatarSubmissionDetailModal
                    faceProfileId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onActionComplete={handleActionComplete}
                />
            )}
        </div>
    );
};

export default AvatarSubmissionsReview;
```


---

## 7. Trang chỉnh sửa

### 7.1 `src/pages/shared/Profile.jsx` — Ghi đè toàn bộ file

**Vì sao**: bỏ luồng đổi avatar mock cũ (`URL.createObjectURL()`, gửi `avatarFileId: mock-uploaded-file-id` qua `PATCH /me/profile`); thêm state `avatarStatus` lấy độc lập từ `getAvatarStatus()` (song song với fetch profile, không phụ thuộc nhau), hiển thị badge trạng thái ngay dưới vòng tròn avatar; khi bấm "Chỉnh sửa" (cùng nút sửa fullName/phone) thì nhúng AvatarUploadForm để nộp/nộp lại ảnh thật; PATCH /me/profile không còn gửi field avatarFileId. Khối "Hồ sơ khuôn mặt" (FaceID/UC-17) giữ nguyên 100%, không đụng tới.

Lưu ý kiến trúc (xem mục 8.4): nút nộp ảnh đang dùng chung trigger "Chỉnh sửa" với form fullName/phone, không có modal/card riêng như bản plan gốc dự kiến ban đầu — đây là quyết định triển khai thực tế, không phải lỗi, nhưng nên thống nhất giữa 2 bên.

Nội dung cuối cùng:

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { get, patch } from '../../utils/request';
import { getAvatarStatus } from '../../service/avatarService';
import AvatarUploadForm from '../../component/AvatarReminder/AvatarUploadForm';

const STATUS_LABEL = {
    not_uploaded: { label: "Chưa nộp ảnh", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
    pending_review: { label: "Đang chờ duyệt", badge: "bg-blue-50 text-action-blue border border-blue-200" },
    rejected: { label: "Bị từ chối", badge: "bg-red-50 text-red-700 border border-red-200" },
    approved: { label: "Đã duyệt", badge: "bg-green-50 text-green-700 border border-green-200" },
};

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const path = location.pathname;
    let rolePath = "/employee";
    let roleLabel = "Nhân viên";
    let showFaceRegisterBtn = false;
    let defaultMockCode = "NV003";
    let defaultMockEmail = "employee@smartracking.com";
    let defaultMockTitle = "Chuyên viên kỹ thuật";

    if (path.startsWith("/system-admin")) {
        rolePath = "/system-admin";
        roleLabel = "Quản trị hệ thống";
        defaultMockCode = "NV001";
        defaultMockEmail = "admin@smrmpts.com";
        defaultMockTitle = "Trưởng bộ phận Vận hành";
    } else if (path.startsWith("/business-admin")) {
        rolePath = "/business-admin";
        roleLabel = "Quản trị doanh nghiệp";
        defaultMockCode = "NV004";
        defaultMockEmail = "business@smartracking.com";
        defaultMockTitle = "Quản trị viên Doanh nghiệp";
    } else if (path.startsWith("/manager")) {
        rolePath = "/manager";
        roleLabel = "Quản lý";
        showFaceRegisterBtn = true;
        defaultMockCode = "NV002";
        defaultMockEmail = "manager@smartracking.com";
        defaultMockTitle = "Trưởng phòng Phát triển";
    } else if (path.startsWith("/employee")) {
        rolePath = "/employee";
        roleLabel = "Nhân viên";
        showFaceRegisterBtn = true;
        defaultMockCode = "NV003";
        defaultMockEmail = "employee@smartracking.com";
        defaultMockTitle = "Chuyên viên kỹ thuật";
    }

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [avatarStatus, setAvatarStatus] = useState(null);
    const [avatarStatusLoading, setAvatarStatusLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        avatarFile: null,
        avatarPreview: ""
    });

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const localUserStr = localStorage.getItem("user");
            if (!localUserStr) throw new Error("Không tìm thấy thông tin phiên làm việc.");
            const localUser = JSON.parse(localUserStr);
            const res = await get("/users/" + localUser.id);
            if (res?.success && res.data) {
                const data = res.data;
                setProfile(data);
                setFormData({
                    fullName: data.fullName || "",
                    phone: data.phoneNumber || data.phone || "",
                    avatarFile: null,
                    avatarPreview: data.avatarUrl || ""
                });
            } else {
                throw new Error("Không thể tải thông tin hồ sơ.");
            }
        } catch (err) {
            const localUserStr = localStorage.getItem("user");
            let localUser = { id: "mock-uuid", fullName: "Người dùng mẫu", email: defaultMockEmail };
            if (localUserStr) { try { localUser = JSON.parse(localUserStr); } catch (e) {} }
            const mockProfile = {
                id: localUser.id || "mock-uuid",
                employeeCode: defaultMockCode,
                email: localUser.email || defaultMockEmail,
                fullName: localUser.fullName || (roleLabel + " Mẫu"),
                phoneNumber: "0987654321",
                avatarUrl: localUser.avatarUrl || "",
                positionTitle: defaultMockTitle,
                department: { id: "dept-2", departmentName: "Phòng Phát triển Phần mềm" },
                directManager: { id: "dir-1", fullName: "Giám đốc Điều hành" },
                accountStatus: "active",
                employmentStatus: "active",
                lastLoginAt: new Date().toISOString(),
                hasFaceProfile: false,
                createdAt: "2026-01-10T09:00:00+07:00"
            };
            setProfile(mockProfile);
            setFormData({
                fullName: mockProfile.fullName,
                phone: mockProfile.phoneNumber,
                avatarFile: null,
                avatarPreview: mockProfile.avatarUrl
            });
        } finally {
            setLoading(false);
        }
    }, [defaultMockEmail, defaultMockCode, defaultMockTitle, roleLabel]);

    const fetchAvatarStatus = useCallback(async () => {
        setAvatarStatusLoading(true);
        try {
            const res = await getAvatarStatus();
            if (res?.success && res.data) setAvatarStatus(res.data);
        } catch {} finally {
            setAvatarStatusLoading(false);
        }
    }, []);

    useEffect(() => { fetchProfileData(); }, [fetchProfileData]);
    useEffect(() => { fetchAvatarStatus(); }, [fetchAvatarStatus]);

    useEffect(() => {
        if (successMessage) { const t = setTimeout(() => setSuccessMessage(null), 3000); return () => clearTimeout(t); }
    }, [successMessage]);
    useEffect(() => {
        if (error) { const t = setTimeout(() => setError(null), 3000); return () => clearTimeout(t); }
    }, [error]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh (.png, .jpg, .jpeg).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Dung lượng ảnh vượt quá giới hạn 5MB. Vui lòng chọn ảnh khác.");
            return;
        }
        setFormData(prev => ({ ...prev, avatarFile: file, avatarPreview: URL.createObjectURL(file) }));
    };

    const handleAvatarUploadSuccess = () => {
        fetchAvatarStatus();
        setFormData(prev => ({ ...prev, avatarFile: null }));
        setError(null);
        setSuccessMessage("Ảnh đại diện đã được gửi đi và đang chờ duyệt.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setUpdating(true);
        const phoneRegex = /^[0-9]+$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            setError("Số điện thoại không hợp lệ. Vui lòng chỉ nhập các chữ số.");
            setUpdating(false);
            return;
        }
        try {
            const payload = { fullName: formData.fullName, phoneNumber: formData.phone };
            const res = await patch("/me/profile", payload);
            if (res?.success) {
                setSuccessMessage("Cập nhật thông tin cá nhân thành công.");
                setEditMode(false);
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.fullName = payload.fullName;
                    localStorage.setItem("user", JSON.stringify(user));
                    window.dispatchEvent(new Event("storage"));
                }
                fetchProfileData();
            } else {
                setSuccessMessage("Đã mô phỏng cập nhật thông tin cá nhân thành công.");
                setEditMode(false);
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.fullName = payload.fullName;
                    localStorage.setItem("user", JSON.stringify(user));
                    window.dispatchEvent(new Event("storage"));
                }
                setProfile(prev => ({ ...prev, fullName: payload.fullName, phoneNumber: payload.phoneNumber }));
            }
        } catch (err) {
            setError(err.message || "Thao tác thất bại. Không thể kết nối tới server.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        if (profile) {
            setFormData({
                fullName: profile.fullName || "",
                phone: profile.phoneNumber || profile.phone || "",
                avatarFile: null,
                avatarPreview: profile.avatarUrl || ""
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-blue text-sm font-medium">Đang tải hồ sơ cá nhân...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Hồ sơ cá nhân</h1>
                <p className="text-slate-blue text-sm mt-1">Xem chi tiết thông tin hồ sơ của bạn và cấu hình sinh trắc học FaceID.</p>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 flex flex-col items-center text-center">
                    {editMode ? (
                        <div className="w-full mb-4">
                            <AvatarUploadForm compact onSuccess={handleAvatarUploadSuccess} onCancel={() => setEditMode(false)} />
                        </div>
                    ) : (
                        <div className="relative group w-32 h-32 rounded-full overflow-hidden ring-4 ring-action-blue/10 bg-gradient-to-tr from-action-blue to-glacier-blue flex items-center justify-center text-white text-4xl font-extrabold select-none mb-4">
                            {formData.avatarPreview ? (
                                <img src={formData.avatarPreview} alt="Profile Avatar" className="w-full h-full object-cover" />
                            ) : (
                                (profile?.fullName?.charAt(0)?.toUpperCase() || "?")
                            )}
                            {editMode && (
                                <label className="absolute inset-0 bg-midnight-indigo/70 text-white flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-[10px] font-bold mt-1 uppercase">Đổi ảnh</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-midnight-indigo leading-tight">{profile?.fullName || ""}</h3>
                    <p className="text-xs text-slate-blue mt-1">{profile?.email || ""}</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                        <span className="inline-flex text-[10px] px-2.5 py-0.5 bg-blue-50 text-action-blue rounded-full font-bold">{roleLabel}</span>
                    </div>

                    {!avatarStatusLoading && avatarStatus && (
                        <div className="w-full mt-3">
                            <div className="w-full flex flex-col p-3 bg-cloud-mist rounded-xl border border-outline-gray/60">
                                <span className="block text-[10px] font-bold text-slate-blue uppercase">Trạng thái duyệt ảnh đại diện</span>
                                <span className={"inline-flex self-start mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold " + ((STATUS_LABEL[avatarStatus.avatarReviewStatus] || STATUS_LABEL.not_uploaded).badge)}>
                                    {(STATUS_LABEL[avatarStatus.avatarReviewStatus] || STATUS_LABEL.not_uploaded).label}
                                </span>
                                {avatarStatus.avatarReviewStatus === "rejected" && avatarStatus.message && (
                                    <p className="text-[10px] text-red-600 mt-1.5 text-left leading-relaxed">{avatarStatus.message}</p>
                                )}
                                {avatarStatus.avatarReviewStatus === "approved" && (
                                    <p className="text-[10px] text-green-600 mt-1.5 text-left">Ảnh hiện tại đã được duyệt.</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="w-full border-t border-platinum-tint/60 my-5" />
                    <div className="w-full flex flex-col gap-3.5 p-3.5 bg-cloud-mist rounded-xl border border-outline-gray/60">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-left">
                                <span className="block text-xs font-bold text-slate-blue uppercase">Hồ sơ khuôn mặt</span>
                                <span className="text-xs text-steel-gray mt-0.5 block">Dữ liệu FaceID</span>
                            </div>
                            <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold " + (profile?.hasFaceProfile ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                                {profile?.hasFaceProfile ? "Đã hợp lệ" : "Chưa đăng ký"}
                            </span>
                        </div>
                        {showFaceRegisterBtn && (
                            <button type="button" onClick={() => navigate(rolePath + "/face-register")} className="w-full py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-16v.01M4 12H2m2 0h2v-4m0 16v.01M8 12v.01M16 12v.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {profile?.hasFaceProfile ? "Cập nhật khuôn mặt" : "Đăng ký khuôn mặt ngay"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                        <div className="flex items-center justify-between border-b border-platinum-tint/60 pb-4 mb-4">
                            <h2 className="text-base font-bold text-midnight-indigo">Thông tin cá nhân</h2>
                            {!editMode ? (
                                <button onClick={() => setEditMode(true)} className="inline-flex items-center justify-center px-3 py-1.5 border border-platinum-tint bg-white text-action-blue hover:bg-cloud-mist rounded-lg text-xs font-semibold transition-all">
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleCancel} className="px-3 py-1.5 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-lg text-xs font-semibold transition-all">Hủy</button>
                                    <button onClick={handleSubmit} disabled={updating} className="px-3 py-1.5 bg-action-blue hover:bg-glacier-blue text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center">{updating ? "Đang lưu..." : "Lưu thay đổi"}</button>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mã nhân viên</label>
                                <input type="text" disabled value={profile?.employeeCode || ""} className="w-full px-3 py-2 border border-platinum-tint bg-cloud-mist rounded-xl text-sm text-steel-gray focus:outline-none cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Địa chỉ Email</label>
                                <input type="email" disabled value={profile?.email || ""} className="w-full px-3 py-2 border border-platinum-tint bg-cloud-mist rounded-xl text-sm text-steel-gray focus:outline-none cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Họ và Tên</label>
                                <input type="text" required disabled={!editMode} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={"w-full px-3 py-2 border rounded-xl text-sm transition-all focus:outline-none " + (editMode ? "border-platinum-tint focus:border-action-blue bg-white text-midnight-indigo" : "border-platinum-tint/60 bg-cloud-mist/55 text-slate-blue cursor-not-allowed")} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Số điện thoại</label>
                                <input type="text" disabled={!editMode} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Chưa cập nhật số điện thoại" className={"w-full px-3 py-2 border rounded-xl text-sm transition-all focus:outline-none " + (editMode ? "border-platinum-tint focus:border-action-blue bg-white text-midnight-indigo" : "border-platinum-tint/60 bg-cloud-mist/55 text-slate-blue cursor-not-allowed")} />
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                        <div className="border-b border-platinum-tint/60 pb-4 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-action-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h2 className="text-base font-bold text-midnight-indigo">Cấu trúc tổ chức</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/70 flex items-start gap-3.5 transition-all hover:shadow-sm">
                                <div className="p-2 bg-blue-100/80 rounded-lg text-action-blue flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-blue/85 uppercase tracking-wider">Phòng ban</span>
                                    <span className="text-sm font-bold text-midnight-indigo mt-1 block">{profile?.department?.departmentName || profile?.department?.name || profile?.departments?.[0]?.name || profile?.departments?.[0]?.departmentName || "Chưa phân bổ phòng ban"}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-50/45 border border-amber-100/70 flex items-start gap-3.5 transition-all hover:shadow-sm">
                                <div className="p-2 bg-amber-100/70 rounded-lg text-amber-600 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 004 0M7 10h10M7 14h10" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-blue/85 uppercase tracking-wider">Chức danh / Vị trí</span>
                                    <span className="text-sm font-bold text-midnight-indigo mt-1 block">{profile?.positionTitle || "Chưa thiết lập chức danh"}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/70 flex items-start gap-3.5 transition-all hover:shadow-sm">
                                <div className="p-2 bg-purple-100/80 rounded-lg text-purple-600 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-blue/85 uppercase tracking-wider">Quản lý trực tiếp</span>
                                    <span className="text-sm font-bold text-midnight-indigo mt-1 block">{profile?.directManager?.fullName || "Không có quản lý"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                        <div className="border-b border-platinum-tint/60 pb-4 mb-4">
                            <h2 className="text-base font-bold text-midnight-indigo">Thông tin hệ thống</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                            <div>
                                <span className="block text-xs font-bold text-slate-blue uppercase">Trạng thái tài khoản</span>
                                <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1.5 " + (profile?.accountStatus === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{profile?.accountStatus === "active" ? "Hoạt động" : "Bị khóa"}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-slate-blue uppercase">Đăng nhập cuối cùng</span>
                                <span className="text-xs font-semibold text-midnight-indigo mt-2.5 block">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString("vi-VN") : "Chưa có thông tin"}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-slate-blue uppercase">Ngày tạo tài khoản</span>
                                <span className="text-xs font-semibold text-midnight-indigo mt-2.5 block">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
```

### 7.2 `src/pages/employee/BookMeeting.jsx` — Ghi đè toàn bộ file

**Vì sao**: chuyển từ luồng đặt phòng mock (FE tự load toàn bộ phòng/người dùng, tự tính trùng giờ + gợi ý buffer 10 phút) sang luồng thật:
- Gọi getAvailableRooms({startTime, endTime, minCapacity}) để backend tự check trùng giờ, bỏ khoảng 150 dòng logic tính overlap/gợi ý phòng ở FE.
- Tách người tham dự thành internalParticipants (autocomplete debounce qua getUsers) và externalParticipants (khách ngoài nhập tay tên/email/tổ chức).
- Thêm expectedAttendeeCount và checkbox xác nhận capacityOverrideConfirmed khi vượt sức chứa phòng (thay cho việc chặn cứng như trước).
- Payload handleSubmit đổi theo CreateMeetingDto thật; sau khi tạo cuộc họp gọi thêm addRecordingConfig() và replaceAgendas() — mỗi lời gọi có try/catch riêng, lỗi phụ chỉ hiện cảnh báo, không chặn việc đặt phòng đã thành công.
- Field đổi từ snake_case mock sang camelCase thật.

Nội dung cuối cùng:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Users, ShieldAlert, Video, Mic, Plus, Trash2, Check, AlertTriangle, ArrowLeft, Info, HelpCircle, Search, ChevronRight, CheckCircle2, Mail
} from 'lucide-react';
import { getAvailableRooms, createMeeting, addRecordingConfig, replaceAgendas, getUsers } from '../../service/employeeServices';

const BookMeeting = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    // Step state
    const [currentStep, setCurrentStep] = useState(1);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [expectedAttendeeCount, setExpectedAttendeeCount] = useState('');
    const [capacityOverrideConfirmed, setCapacityOverrideConfirmed] = useState(false);
    const [recordingEnabled, setRecordingEnabled] = useState(false);
    const [audioRecordingEnabled, setAudioRecordingEnabled] = useState(false);
    const [pdpaConsent, setPdpaConsent] = useState(false);

    // Internal participants (nhân viên nội bộ, chọn qua autocomplete)
    const [internalParticipants, setInternalParticipants] = useState([]);
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [internalSearchResults, setInternalSearchResults] = useState([]);
    const [isSearchingInternal, setIsSearchingInternal] = useState(false);

    // External participants (khách ngoài công ty, nhập tay)
    const [externalParticipants, setExternalParticipants] = useState([]);
    const [newExternalName, setNewExternalName] = useState('');
    const [newExternalEmail, setNewExternalEmail] = useState('');
    const [newExternalOrg, setNewExternalOrg] = useState('');

    // Agenda states
    const [agendaList, setAgendaList] = useState([]);
    const [newAgendaTitle, setNewAgendaTitle] = useState('');
    const [newAgendaDuration, setNewAgendaDuration] = useState('15');

    // Room search states (server-side availability check)
    const [availableRooms, setAvailableRooms] = useState([]);
    const [searchingRooms, setSearchingRooms] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Feedback states
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [conflictInfo, setConflictInfo] = useState(null);
    const [alternativeRooms, setAlternativeRooms] = useState([]);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch (err) {
            console.error('Failed to load user info', err);
        }
    }, []);

    // Debounced search nhân viên nội bộ (autocomplete)
    useEffect(() => {
        const term = internalSearchTerm.trim();
        if (term.length < 2) {
            setInternalSearchResults([]);
            return;
        }

        setIsSearchingInternal(true);
        const timer = setTimeout(async () => {
            try {
                const res = await getUsers({ search: term, limit: 8 });
                const selectedIds = new Set(internalParticipants.map(p => p.id));
                const selfId = currentUser?.id;
                const results = (res?.data || []).filter(u => !selectedIds.has(u.id) && u.id !== selfId);
                setInternalSearchResults(results);
            } catch (err) {
                console.error('Failed to search users', err);
                setInternalSearchResults([]);
            } finally {
                setIsSearchingInternal(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [internalSearchTerm, internalParticipants, currentUser]);

    const handleAddInternalParticipant = (user) => {
        setInternalParticipants(prev => [...prev, { id: user.id, fullName: user.fullName, email: user.email }]);
        setInternalSearchTerm('');
        setInternalSearchResults([]);
    };

    const handleRemoveInternalParticipant = (userId) => {
        setInternalParticipants(prev => prev.filter(p => p.id !== userId));
    };

    const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);

    const getMeetingDurationMinutes = () => {
        if (!startTime || !endTime) return 0;
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const startTotal = sh * 60 + sm;
        const endTotal = eh * 60 + em;
        return Math.max(0, endTotal - startTotal);
    };

    const meetingDuration = getMeetingDurationMinutes();
    const agendaTotalDuration = agendaList.reduce((acc, curr) => acc + Number(curr.durationMin), 0);

    const actualAttendeeCount = internalParticipants.length + externalParticipants.length + 1; // +1 cho host
    const capacityExceeded = !!selectedRoom && (
        (!!expectedAttendeeCount && Number(expectedAttendeeCount) > selectedRoom.capacity)
        || actualAttendeeCount > selectedRoom.capacity
    );

    const buildIsoRange = () => ({
        isoStart: new Date(`${meetingDate}T${startTime}:00`).toISOString(),
        isoEnd: new Date(`${meetingDate}T${endTime}:00`).toISOString(),
    });

    const handleSearchRooms = async () => {
        setSearchingRooms(true);
        setErrorMsg('');

        const todayStr = new Date().toLocaleDateString('en-CA');
        if (meetingDate < todayStr) {
            setErrorMsg('Ngày họp không được trong quá khứ.');
            setSearchingRooms(false);
            return;
        }

        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        if (sh * 60 + sm >= eh * 60 + em) {
            setErrorMsg('Giờ bắt đầu phải trước giờ kết thúc.');
            setSearchingRooms(false);
            return;
        }

        try {
            const { isoStart, isoEnd } = buildIsoRange();
            const params = { startTime: isoStart, endTime: isoEnd };
            if (expectedAttendeeCount) params.minCapacity = expectedAttendeeCount;

            const res = await getAvailableRooms(params);
            if (res?.success) {
                setAvailableRooms(res.data || []);
            } else {
                setAvailableRooms([]);
                setErrorMsg(res?.message || 'Không thể tải danh sách phòng trống.');
            }
        } catch (err) {
            console.error('Error fetching available rooms', err);
            setAvailableRooms([]);
            setErrorMsg(err?.error?.message || 'Không thể tải danh sách phòng trống hiện tại.');
        } finally {
            setSearchPerformed(true);
            setSearchingRooms(false);
        }
    };

    const handleSelectRoom = (room) => {
        setSelectedRoomId(room.id);
        setCapacityOverrideConfirmed(false);
    };

    const handleAddAgenda = () => {
        if (!newAgendaTitle.trim()) return;
        const duration = Number(newAgendaDuration);
        if (isNaN(duration) || duration <= 0) return;

        if (agendaTotalDuration + duration > meetingDuration) {
            setErrorMsg(`Tổng thời lượng chương trình họp (${agendaTotalDuration + duration} phút) vượt quá thời lượng cuộc họp (${meetingDuration} phút).`);
            return;
        }

        setErrorMsg('');
        setAgendaList(prev => [
            ...prev,
            { title: newAgendaTitle, durationMin: duration }
        ]);
        setNewAgendaTitle('');
    };

    const handleRemoveAgenda = (index) => {
        setAgendaList(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddExternalParticipant = () => {
        if (!newExternalName.trim() || !newExternalEmail.trim()) return;
        setExternalParticipants(prev => [
            ...prev,
            {
                fullName: newExternalName.trim(),
                email: newExternalEmail.trim(),
                ...(newExternalOrg.trim() ? { organization: newExternalOrg.trim() } : {}),
            }
        ]);
        setNewExternalName('');
        setNewExternalEmail('');
        setNewExternalOrg('');
    };

    const handleRemoveExternalParticipant = (index) => {
        setExternalParticipants(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMessage('');
        setConflictInfo(null);
        setAlternativeRooms([]);

        const todayStr = new Date().toLocaleDateString('en-CA');
        if (meetingDate < todayStr) {
            setErrorMsg('Ngày họp không được trong quá khứ.');
            return;
        }

        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        if (sh * 60 + sm >= eh * 60 + em) {
            setErrorMsg('Giờ bắt đầu phải trước giờ kết thúc.');
            return;
        }

        if (!title.trim()) {
            setErrorMsg('Vui lòng nhập tiêu đề cuộc họp.');
            return;
        }
        if (!selectedRoomId) {
            setErrorMsg('Vui lòng chọn phòng họp.');
            return;
        }

        if (capacityExceeded && !capacityOverrideConfirmed) {
            const countLabel = expectedAttendeeCount && Number(expectedAttendeeCount) > actualAttendeeCount
                ? expectedAttendeeCount
                : actualAttendeeCount;
            setErrorMsg(`Số người dự kiến (${countLabel}) vượt quá sức chứa phòng "${selectedRoom.roomName}" (${selectedRoom.capacity} người). Vui lòng tick xác nhận vượt sức chứa hoặc chọn phòng khác.`);
            return;
        }

        // PDPA check
        if ((recordingEnabled || audioRecordingEnabled) && !pdpaConsent) {
            setErrorMsg('Bạn phải đồng ý với cam kết bảo vệ dữ liệu cá nhân (PDPA) khi bật tính năng ghi âm hoặc ghi hình.');
            return;
        }

        const { isoStart, isoEnd } = buildIsoRange();

        const payload = {
            title,
            startTime: isoStart,
            endTime: isoEnd,
            roomId: selectedRoomId,
        };
        if (description.trim()) payload.description = description.trim();
        if (expectedAttendeeCount) payload.expectedAttendeeCount = Number(expectedAttendeeCount);
        if (capacityExceeded && capacityOverrideConfirmed) payload.capacityOverrideConfirmed = true;
        if (internalParticipants.length > 0) payload.participantUserIds = internalParticipants.map(p => p.id);
        if (externalParticipants.length > 0) payload.externalParticipants = externalParticipants;

        setSubmitting(true);
        try {
            const res = await createMeeting(payload);
            if (!res?.success) {
                const failure = new Error(res?.message || 'Tạo cuộc họp thất bại.');
                failure.error = { message: res?.message || 'Tạo cuộc họp thất bại.' };
                throw failure;
            }

            const meetingId = res.data?.id;
            const subWarnings = [];

            if (meetingId && (recordingEnabled || audioRecordingEnabled)) {
                try {
                    await addRecordingConfig(meetingId, {
                        enableVideo: recordingEnabled,
                        enableAudio: audioRecordingEnabled,
                        consentRequired: pdpaConsent,
                    });
                } catch (subErr) {
                    console.error('Failed to save recording config', subErr);
                    subWarnings.push('cấu hình ghi âm/ghi hình');
                }
            }

            if (meetingId && agendaList.length > 0) {
                try {
                    await replaceAgendas(meetingId, agendaList.map(item => ({
                        title: item.title,
                        plannedDurationMinutes: Number(item.durationMin),
                    })));
                } catch (subErr) {
                    console.error('Failed to save agenda', subErr);
                    subWarnings.push('chương trình họp (agenda)');
                }
            }

            const isScheduled = res.data?.status === 'scheduled';
            let msg = isScheduled
                ? 'Đặt phòng họp thành công! Lịch họp đã được lên lịch.'
                : 'Đăng ký đặt phòng họp thành công! Yêu cầu của bạn đã được gửi tới Quản lý phê duyệt.';
            if (subWarnings.length > 0) {
                msg += ` (Lưu ý: lưu ${subWarnings.join(', ')} thất bại, vui lòng cập nhật lại ở trang chi tiết cuộc họp.)`;
            }
            setSuccessMessage(msg);

            // Reset form
            setTitle('');
            setDescription('');
            setSelectedRoomId('');
            setExpectedAttendeeCount('');
            setCapacityOverrideConfirmed(false);
            setExternalParticipants([]);
            setAgendaList([]);
            setRecordingEnabled(false);
            setAudioRecordingEnabled(false);
            setPdpaConsent(false);
            setCurrentStep(1);
            setSearchPerformed(false);
            setAvailableRooms([]);
        } catch (err) {
            console.error('Booking failed', err);
            const message = err?.error?.message
                || 'Rất tiếc, phòng họp này hoặc người tham dự đã bị trùng lịch trong khung giờ được chọn. Vui lòng chọn phòng khác hoặc điều chỉnh khung giờ.';
            setConflictInfo({ message });

            try {
                const { isoStart, isoEnd } = buildIsoRange();
                const params = { startTime: isoStart, endTime: isoEnd };
                if (expectedAttendeeCount) params.minCapacity = expectedAttendeeCount;
                const altRes = await getAvailableRooms(params);
                const alts = (altRes?.data || []).filter(r => r.id !== selectedRoomId);
                setAlternativeRooms(alts);
            } catch (altErr) {
                console.error('Failed to fetch alternative rooms', altErr);
                setAlternativeRooms([]);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectAlternativeRoom = (roomId) => {
        setSelectedRoomId(roomId);
        setCapacityOverrideConfirmed(false);
        setConflictInfo(null);
        setAlternativeRooms([]);
    };

    const isManagerOrAdmin = currentUser?.role === 'Manager' || currentUser?.role === 'BusinessAdmin' || currentUser?.role === 'SystemAdmin';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-xl border border-platinum-tint text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-midnight-indigo">Đặt lịch & Đăng ký phòng họp</h1>
                    <p className="text-xs text-slate-blue">Lên kế hoạch cuộc họp, thiết lập chương trình (agenda) và kiểm tra chính sách bảo mật</p>
                </div>
            </div>

            {/* Visual Step Progress Indicator */}
            <div className="flex items-center justify-center gap-4 py-2 border-b border-platinum-tint/30 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        currentStep === 1
                            ? 'bg-action-blue text-white ring-4 ring-action-blue/15'
                            : 'bg-emerald-500 text-white'
                    }`}>
                        {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                    </span>
                    <span className={`text-sm font-bold ${currentStep === 1 ? 'text-midnight-indigo' : 'text-slate-blue'}`}>
                        Chọn phòng & Thời gian
                    </span>
                </div>
                <div className="w-16 h-0.5 bg-platinum-tint rounded" />
                <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        currentStep === 2
                            ? 'bg-action-blue text-white ring-4 ring-action-blue/15'
                            : 'bg-cloud-mist border border-platinum-tint text-slate-blue'
                    }`}>
                        2
                    </span>
                    <span className={`text-sm font-bold ${currentStep === 2 ? 'text-midnight-indigo' : 'text-slate-blue'}`}>
                        Thông tin cuộc họp
                    </span>
                </div>
            </div>

            {/* Success and Error messages outside forms */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex gap-2"
                    >
                        <Check className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
                        <span className="font-semibold">{successMessage}</span>
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span className="font-semibold">{errorMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step-by-Step Forms */}
            <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Time Picker Card */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                <Clock className="w-4 h-4 text-action-blue" /> Khung thời gian họp
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Ngày họp *</label>
                                    <input
                                        type="date"
                                        value={meetingDate}
                                        min={new Date().toLocaleDateString('en-CA')}
                                        onChange={(e) => {
                                            setMeetingDate(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Giờ bắt đầu *</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => {
                                            setStartTime(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Giờ kết thúc *</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => {
                                            setEndTime(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Số người dự kiến</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={expectedAttendeeCount}
                                        onChange={(e) => {
                                            setExpectedAttendeeCount(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        placeholder="Tuỳ chọn"
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={handleSearchRooms}
                                    disabled={searchingRooms}
                                    className="px-6 py-2.5 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                >
                                    {searchingRooms ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" /> Tìm phòng họp
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchPerformed && (
                            <div>
                                <h4 className="font-bold text-xs text-slate-blue uppercase mb-3 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Phòng họp trống ({availableRooms.length})
                                </h4>
                                {availableRooms.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {availableRooms.map(room => {
                                            const isSelected = selectedRoomId === room.id;
                                            return (
                                                <div
                                                    key={room.id}
                                                    onClick={() => handleSelectRoom(room)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-36 ${
                                                        isSelected
                                                            ? 'bg-blue-50/20 border-action-blue shadow-md ring-2 ring-action-blue/15'
                                                            : 'bg-white border-platinum-tint hover:border-action-blue/50 hover:bg-cloud-mist/50'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h5 className="font-bold text-sm text-midnight-indigo">{room.roomName}</h5>
                                                            <span className="text-[11px] font-bold text-slate-blue bg-cloud-mist px-2 py-0.5 rounded">
                                                                Sức chứa: {room.capacity} người
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-blue mt-1 line-clamp-1">
                                                            {room.siteName} • {room.areaName || 'Khu vực chính'}
                                                        </p>
                                                    </div>

                                                    {/* Facilities Icons */}
                                                    <div className="flex items-center justify-between border-t border-platinum-tint/40 pt-2.5 mt-2">
                                                        <div className="flex items-center gap-2.5 text-slate-blue/70">
                                                            {room.hasCamera && <Video className="w-3.5 h-3.5" title="Có Camera" />}
                                                            {room.hasMicrophone && <Mic className="w-3.5 h-3.5" title="Có Mic" />}
                                                            {room.hasDisplay && <Calendar className="w-3.5 h-3.5" title="Có Màn hình" />}
                                                        </div>
                                                        <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-action-blue' : 'text-slate-blue/60'}`}>
                                                            {isSelected ? 'Đã chọn' : 'Chọn phòng'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-blue italic pl-2 py-2">Không tìm thấy phòng họp trống trong khung giờ này. Vui lòng đổi giờ hoặc số người dự kiến.</p>
                                )}
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex justify-end pt-4 border-t border-platinum-tint/30">
                            <button
                                type="button"
                                disabled={!selectedRoomId}
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
                            >
                                Tiếp tục <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Side: Inputs */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Selected Room Summary Banner */}
                                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-5 rounded-2xl border border-platinum-tint flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-action-blue uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                            Phòng họp đã chọn
                                        </span>
                                        <h3 className="font-bold text-lg text-midnight-indigo mt-2">
                                            {selectedRoom?.roomName}
                                        </h3>
                                        <p className="text-xs text-slate-blue mt-0.5">
                                            {selectedRoom?.siteName} • Sức chứa: {selectedRoom?.capacity} người
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-platinum-tint/80 shadow-sm shrink-0">
                                        <Calendar className="w-5 h-5 text-action-blue shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-blue font-bold uppercase">Khung giờ họp</p>
                                            <p className="text-sm font-bold text-midnight-indigo">
                                                {startTime} - {endTime}
                                            </p>
                                            <p className="text-[11px] text-slate-blue font-semibold">
                                                Ngày {meetingDate.split('-').reverse().join('/')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity override warning */}
                                {capacityExceeded && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                                        <div className="flex gap-2 text-rose-700 text-xs">
                                            <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                                            <span className="font-semibold">
                                                Số người dự kiến ({expectedAttendeeCount && Number(expectedAttendeeCount) > actualAttendeeCount ? expectedAttendeeCount : actualAttendeeCount}) vượt sức chứa phòng "{selectedRoom?.roomName}" ({selectedRoom?.capacity} người).
                                            </span>
                                        </div>
                                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-rose-700 font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={capacityOverrideConfirmed}
                                                onChange={(e) => setCapacityOverrideConfirmed(e.target.checked)}
                                                className="w-4 h-4 rounded text-rose-600 border-rose-300 focus:ring-rose-500"
                                            />
                                            Tôi xác nhận vượt sức chứa phòng và vẫn muốn tiếp tục đặt phòng này.
                                        </label>
                                    </div>
                                )}

                                {/* General Information */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                        <Info className="w-4 h-4 text-action-blue" /> Chi tiết cuộc họp
                                    </h3>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Tiêu đề cuộc họp *</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Nhập tiêu đề hoặc mục đích họp..."
                                            className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue focus:ring-2 focus:ring-action-blue/15 text-midnight-indigo"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Mô tả (tuỳ chọn)</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Mục tiêu, nội dung chính của cuộc họp..."
                                            rows={3}
                                            maxLength={2000}
                                            className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue focus:ring-2 focus:ring-action-blue/15 text-midnight-indigo resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Participants */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                        <Users className="w-4 h-4 text-royal-amethyst" /> Khách tham gia
                                    </h3>

                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs flex gap-2">
                                        <Info className="w-4 h-4 shrink-0 text-amber-600" />
                                        <span>Bạn có thể chọn nhân viên nội bộ ngay tại đây, hoặc mời thêm sau tại trang chi tiết cuộc họp.</span>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-blue">Tìm và thêm nhân viên nội bộ:</p>
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="w-4 h-4 text-slate-blue absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={internalSearchTerm}
                                                    onChange={(e) => setInternalSearchTerm(e.target.value)}
                                                    placeholder="Tìm theo tên hoặc email..."
                                                    className="w-full pl-9 pr-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                                />
                                            </div>
                                            {internalSearchTerm.trim().length >= 2 && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-platinum-tint rounded-xl shadow-lg max-h-56 overflow-y-auto">
                                                    {isSearchingInternal ? (
                                                        <p className="px-3 py-2.5 text-xs text-slate-blue">Đang tìm...</p>
                                                    ) : internalSearchResults.length > 0 ? (
                                                        internalSearchResults.map((u) => (
                                                            <button
                                                                key={u.id}
                                                                type="button"
                                                                onClick={() => handleAddInternalParticipant(u)}
                                                                className="w-full text-left px-3 py-2.5 hover:bg-cloud-mist/60 transition-colors flex flex-col"
                                                            >
                                                                <span className="text-sm font-semibold text-midnight-indigo">{u.fullName}</span>
                                                                <span className="text-xs text-slate-blue">{u.email}</span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="px-3 py-2.5 text-xs text-slate-blue">Không tìm thấy nhân viên phù hợp.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {internalParticipants.length > 0 && (
                                            <div className="space-y-2 pt-1">
                                                {internalParticipants.map((p) => (
                                                    <div key={p.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-sm">
                                                        <div className="flex items-center gap-2.5">
                                                            <Users className="w-4 h-4 text-action-blue shrink-0" />
                                                            <div>
                                                                <span className="font-semibold text-midnight-indigo">{p.fullName}</span>
                                                                <span className="text-xs text-slate-blue ml-2">{p.email}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveInternalParticipant(p.id)}
                                                            className="p-1 text-slate-blue hover:text-red-600 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-blue">Thêm khách bên ngoài tổ chức (nếu có):</p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={newExternalName}
                                            onChange={(e) => setNewExternalName(e.target.value)}
                                            placeholder="Họ tên"
                                            className="flex-1 px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        />
                                        <input
                                            type="email"
                                            value={newExternalEmail}
                                            onChange={(e) => setNewExternalEmail(e.target.value)}
                                            placeholder="Email"
                                            className="flex-1 px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        />
                                        <input
                                            type="text"
                                            value={newExternalOrg}
                                            onChange={(e) => setNewExternalOrg(e.target.value)}
                                            placeholder="Tổ chức (tuỳ chọn)"
                                            className="flex-1 px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddExternalParticipant}
                                            className="px-4 py-2 bg-royal-amethyst hover:bg-royal-amethyst/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                                        >
                                            <Plus className="w-4 h-4" /> Thêm
                                        </button>
                                    </div>

                                    {externalParticipants.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            {externalParticipants.map((p, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-purple-50/40 rounded-xl border border-purple-100 text-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <Mail className="w-4 h-4 text-royal-amethyst shrink-0" />
                                                        <div>
                                                            <span className="font-semibold text-midnight-indigo">{p.fullName}</span>
                                                            <span className="text-xs text-slate-blue ml-2">{p.email}{p.organization ? ` • ${p.organization}` : ''}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExternalParticipant(index)}
                                                        className="p-1 text-slate-blue hover:text-red-600 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Agenda Builder */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-cloud-mist">
                                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-600" /> Chương trình họp (Agenda)
                                        </h3>
                                        <span className="text-xs font-bold text-slate-blue bg-cloud-mist px-2.5 py-1 rounded-lg">
                                            Đã lên: {agendaTotalDuration} / {meetingDuration} phút
                                        </span>
                                    </div>

                                    {/* New Agenda Input */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={newAgendaTitle}
                                                onChange={(e) => setNewAgendaTitle(e.target.value)}
                                                placeholder="Chủ đề / Nội dung thảo luận..."
                                                className="w-full px-4 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                            />
                                        </div>
                                        <div className="w-full sm:w-32 flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={newAgendaDuration}
                                                onChange={(e) => setNewAgendaDuration(e.target.value)}
                                                min="1"
                                                placeholder="Phút"
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo text-center"
                                            />
                                            <span className="text-xs text-slate-blue">phút</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddAgenda}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Thêm
                                        </button>
                                    </div>

                                    {/* Agenda List */}
                                    {agendaList.length > 0 ? (
                                        <div className="space-y-2 pt-2">
                                            {agendaList.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-cloud-mist/30 rounded-xl border border-platinum-tint/40 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center border border-emerald-100">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-semibold text-midnight-indigo">{item.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-medium text-slate-blue bg-cloud-mist px-2.5 py-0.5 rounded-full">{item.durationMin} phút</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAgenda(index)}
                                                            className="p-1 text-slate-blue hover:text-red-600 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-blue text-center py-4 italic">Chưa thiết lập chương trình thảo luận chi tiết.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Policies, Config, Submit */}
                            <div className="space-y-6">
                                {/* Approvals */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider pb-3 border-b border-cloud-mist">
                                        Trạng thái & Phê duyệt
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-blue">Người tổ chức:</span>
                                            <span className="font-bold text-midnight-indigo">{currentUser?.fullName || 'Nhân viên'}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-blue">Quy trình duyệt:</span>
                                            {isManagerOrAdmin ? (
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                                    Tự động phê duyệt
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                                                    Cần Trưởng phòng duyệt
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-blue leading-relaxed pt-2 border-t border-cloud-mist/50">
                                            Kết quả phê duyệt thực tế sẽ do hệ thống quyết định theo chính sách hiện hành và được hiển thị ngay sau khi gửi yêu cầu.
                                        </p>
                                    </div>
                                </div>

                                {/* Security & Recording Config */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                        <Video className="w-4 h-4 text-red-600" /> Cấu hình ghi âm & hình
                                    </h3>

                                    {/* Video Recording */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4 text-slate-blue" />
                                            <span className="text-sm font-semibold text-midnight-indigo">Ghi hình cuộc họp</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={recordingEnabled}
                                                onChange={(e) => {
                                                    setRecordingEnabled(e.target.checked);
                                                    if (!e.target.checked && !audioRecordingEnabled) setPdpaConsent(false);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* Audio Recording */}
                                    <div className="flex items-center justify-between pt-2 border-t border-platinum-tint/40">
                                        <div className="flex items-center gap-2">
                                            <Mic className="w-4 h-4 text-slate-blue" />
                                            <span className="text-sm font-semibold text-midnight-indigo">Ghi âm cuộc họp</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={audioRecordingEnabled}
                                                onChange={(e) => {
                                                    setAudioRecordingEnabled(e.target.checked);
                                                    if (!e.target.checked && !recordingEnabled) setPdpaConsent(false);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* PDPA Consent */}
                                    <AnimatePresence>
                                        {(recordingEnabled || audioRecordingEnabled) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3 overflow-hidden text-xs text-slate-blue"
                                            >
                                                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-2">
                                                    <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
                                                    <p className="leading-relaxed font-semibold">
                                                        Theo Nghị định bảo vệ dữ liệu cá nhân (PDPA VN), bạn phải có sự đồng ý của tất cả thành viên bắt buộc tham dự trước khi thực hiện ghi âm/ghi hình cuộc họp.
                                                    </p>
                                                </div>

                                                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={pdpaConsent}
                                                        onChange={(e) => setPdpaConsent(e.target.checked)}
                                                        className="mt-1 w-4 h-4 rounded text-red-600 border-platinum-tint focus:ring-red-500"
                                                    />
                                                    <span className="leading-tight font-semibold text-slate-blue">
                                                        Tôi cam kết đã thông báo và có sự đồng ý của tất cả người tham gia.
                                                    </span>
                                                </label>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Step 2 Actions */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="w-1/2 py-3 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Quay lại
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-1/2 py-3 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
                                        >
                                            {submitting ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                'Xác nhận đặt'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collision modal / panel (keeps fallback alternative rooms logic) */}
            <AnimatePresence>
                {conflictInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="bg-white p-6 rounded-2xl border border-amber-200 shadow-lg space-y-4"
                    >
                        <div className="flex gap-3 items-start bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm text-amber-800">Xung đột bận lịch (Collision Detected)</h4>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    {conflictInfo.message}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-xs text-slate-blue uppercase mb-3 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4 text-action-blue" /> Đề xuất phòng họp thay thế khả dụng:
                            </h4>
                            {alternativeRooms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {alternativeRooms.map(room => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleSelectAlternativeRoom(room.id)}
                                            className="p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-between"
                                        >
                                            <div>
                                                <h5 className="font-bold text-sm text-midnight-indigo">{room.roomName}</h5>
                                                <p className="text-xs text-slate-blue">Sức chứa: {room.capacity} người • {room.siteName}</p>
                                            </div>
                                            <span className="text-xs font-bold text-action-blue bg-blue-50 px-2.5 py-1 rounded-lg">Chọn phòng này</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-blue italic pl-2">Không tìm thấy phòng họp trống thay thế nào có sức chứa tương đương trong thời gian này.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookMeeting;
```

### 7.3 `src/pages/manager/homePage.jsx` — Patch một phần

File này 1029 dòng, chỉ khoảng 5% thay đổi (5 đoạn nhỏ) — patch thay vì ghi đè toàn file để tránh rủi ro thao tác trên file lớn.

**Vì sao**: bỏ data mock fallback khi API lỗi (trước hiện 2 dòng data giả, giờ hiện lỗi thật qua setError); đổi field response sang camelCase đúng API thật; query đổi từ truyền departmentId thủ công sang approvalStatus: 'pending' (backend tự scope theo phòng ban của manager đang đăng nhập).

**Hunk 1 — hàm `fetchPendingRequests`** (trong component ManagerHomePage, gần khai báo state rejectionModalOpen/submittingAction):

```diff
-    const fetchPendingRequests = useCallback(async (deptId) => {
+    const fetchPendingRequests = useCallback(async () => {
         setLoadingOverview(true);
         try {
-            const res = await getPendingMeetingRequests({ departmentId: deptId || undefined });
+            const res = await getPendingMeetingRequests({ approvalStatus: 'pending' });
             if (res?.success) {
                 setPendingRequests(res.data || []);
             } else {
-                // Fallback mock pending requests
-                setPendingRequests([
-                    {
-                        id: 'req-mock-1',
-                        request_code: 'REQ-260610-002',
-                        meeting_id: 'meet-mock-1',
-                        requested_by_name: 'Nguyễn Thị Minh',
-                        requested_at: '2026-06-10T08:30:00.000Z',
-                        room_name: 'Phòng Athena 102',
-                        requested_start_time: '2026-06-12T10:00:00.000+07:00',
-                        requested_end_time: '2026-06-12T11:30:00.000+07:00',
-                        conflict_summary_json: { overlapping_meetings_count: 0, room_available: true },
-                        request_payload_json: { title: "Họp Định Hướng Kế Hoạch Sprint 3" }
-                    },
-                    {
-                        id: 'req-mock-2',
-                        request_code: 'REQ-260610-003',
-                        meeting_id: 'meet-mock-2',
-                        requested_by_name: 'Phạm Thanh Sơn',
-                        requested_at: '2026-06-10T10:15:00.000Z',
-                        room_name: 'Phòng Zeus 201',
-                        requested_start_time: '2026-06-13T14:00:00.000+07:00',
-                        requested_end_time: '2026-06-13T15:30:00.000+07:00',
-                        conflict_summary_json: { overlapping_meetings_count: 1, room_available: false },
-                        request_payload_json: { title: "Review Giao Diện Bản Thử Nghiệm" }
-                    }
-                ]);
+                setPendingRequests([]);
+                setError(res?.message || 'Không thể tải danh sách yêu cầu chờ duyệt.');
             }
-        } catch {
+        } catch (err) {
             setPendingRequests([]);
+            setError(err?.error?.message || 'Không thể tải danh sách yêu cầu chờ duyệt.');
         } finally {
             setLoadingOverview(false);
         }
     }, []);
```

**Hunk 2 — gọi fetchPendingRequests trong loadContext (useEffect khi mount trang)**:

```diff
-            fetchPendingRequests(deptId);
+            fetchPendingRequests();
```

**Hunk 3 — nút refresh cạnh tiêu đề "Yêu cầu chờ duyệt"**:

```diff
-                                    onClick={() => currentUser && fetchPendingRequests(currentUser.departmentId)}
+                                    onClick={() => fetchPendingRequests()}
```

**Hunk 4 — render bảng danh sách pending requests (mapping field)**:

```diff
-                                                const hasConflict = req.conflict_summary_json?.overlapping_meetings_count > 0;
+                                                const hasConflict = req.conflictCheckStatus === 'warning' || req.conflictCheckStatus === 'blocked';
                                                 return (
                                                     <tr key={req.id} className="border-b border-platinum-tint/60 text-sm hover:bg-cloud-mist/20 transition-colors">
-                                                        <td className="p-4 font-mono text-xs text-midnight-indigo font-bold">{req.request_code}</td>
+                                                        <td className="p-4 font-mono text-xs text-midnight-indigo font-bold">{req.requestCode}</td>
                                                         <td className="p-4 font-semibold text-midnight-indigo">
-                                                            {req.request_payload_json?.title || 'Cuộc họp phòng ban'}
+                                                            {req.meeting?.title || 'Cuộc họp phòng ban'}
                                                         </td>
-                                                        <td className="p-4 text-slate-blue font-medium">{req.requested_by_name || 'Nhân viên'}</td>
-                                                        <td className="p-4 font-medium text-midnight-indigo">{req.room_name}</td>
+                                                        <td className="p-4 text-slate-blue font-medium">{req.requestedBy?.fullName || 'Nhân viên'}</td>
+                                                        <td className="p-4 font-medium text-midnight-indigo">{req.targetRoom?.roomName}</td>
                                                         <td className="p-4 text-xs text-slate-blue font-medium">
-                                                            {new Date(req.requested_start_time).toLocaleString('vi-VN')}
+                                                            {new Date(req.requestedStartTime).toLocaleString('vi-VN')}
                                                         </td>
```

**Hunk 5 — 2 modal xác nhận "Phê duyệt" và "Từ chối" yêu cầu (text hiển thị mã yêu cầu/tên cuộc họp)**:

```diff
-                                Bạn chuẩn bị phê duyệt yêu cầu <strong className="text-midnight-indigo">{selectedRequest.request_code}</strong> cho cuộc họp <strong>"{selectedRequest.request_payload_json?.title}"</strong>.
+                                Bạn chuẩn bị phê duyệt yêu cầu <strong className="text-midnight-indigo">{selectedRequest.requestCode}</strong> cho cuộc họp <strong>"{selectedRequest.meeting?.title}"</strong>.
```

```diff
-                                Vui lòng nhập lý do từ chối chi tiết cho yêu cầu <strong className="text-midnight-indigo">{selectedRequest.request_code}</strong>.
+                                Vui lòng nhập lý do từ chối chi tiết cho yêu cầu <strong className="text-midnight-indigo">{selectedRequest.requestCode}</strong>.
```

---

## 8. Các điểm còn thiếu/lệch ở bản của mình — CHƯA áp dụng, chỉ để 2 bên cùng biết

8.1. `src/utils/avatarStatusBadge.js` (helper label/màu badge dùng chung) — chưa tạo. Hiện `Profile.jsx`, `AvatarReminderModal.jsx`, `AvatarSubmissionsReview.jsx` mỗi file tự định nghĩa map riêng (`STATUS_LABEL`/`STATUS_MAP`) — nội dung giống nhau nhưng code độc lập, không gây lỗi, chỉ là trùng lặp.

8.2. `src/pages/bussinessAdmin/layout/BusinessAdminLayout.jsx` — chưa mount `<AvatarReminderModal />`. Về lý thuyết Business Admin cũng có permission `profile.avatar.submit` nên nhẽ ra cũng cần popup này, nhưng mình chưa làm. Nếu cần thêm, áp dụng đúng mẫu patch ở mục 5.1-5.3 (cùng 2 đoạn import + mount).

8.3. `SystemAdminLayout.jsx` — chưa thêm nav item "Duyệt ảnh đại diện" vào mảng `navigationItems`. Route ở mục 3.1 vẫn hoạt động bình thường nếu vào thẳng URL `/system-admin/avatar-submissions`, chỉ là chưa có link điều hướng trên menu ngang.

8.4. `src/pages/shared/Profile.jsx` — kiến trúc khác với bản plan gốc (`PLAN_AVATAR_WORKFLOWS_FE.md` mục 3.7): nút nộp ảnh được gộp dùng chung trigger "Chỉnh sửa" (sửa fullName/phone) thay vì có modal/nút riêng độc lập như dự kiến ban đầu. Đây là quyết định triển khai thực tế, 2 bên nên thống nhất giữ vậy hay tách riêng sau.

8.5. Chưa `npm run build` / chưa test tay bất kỳ luồng nào trong số các thay đổi trên — xem checklist mục 10, đây là rủi ro lớn nhất hiện tại vì toàn bộ chưa được xác minh chạy được.

---

## 9. API/contract cần giữ ổn định (để code khác của 2 bên vẫn gọi được bình thường)

| File | Export | Signature | Ghi chú |
|---|---|---|---|
| `request.js` | `get/post/patch/put/dele` | `(path, body?, options?)` | `put` là hàm mới thêm |
| `request.js` | `getAccessToken/setTokens/clearTokens/...` | không đổi | giữ nguyên hành vi cũ |
| `employeeServices.js` | `getAvailableRooms(params)` | `params: { startTime, endTime, minCapacity? }` | mới, gọi `GET /rooms/available` |
| `employeeServices.js` | `getRooms()` | signature không đổi | đánh dấu `@deprecated`, chỉ dùng ở trang xem chi tiết phòng, không dùng trong `BookMeeting.jsx` nữa |
| `employeeServices.js` | `addRecordingConfig(meetingId, data)` | mới | `POST /meetings/:id/recording-config` |
| `employeeServices.js` | `replaceAgendas(meetingId, items)` | mới | `PUT /meetings/:id/agendas` |
| `employeeServices.js` | `addInternalParticipant(meetingId, data)` | mới | `POST /meetings/:id/participants/internal` |
| `managerServices.js` | `getPendingMeetingRequests(params)` | ⚠️ **breaking**: đổi từ `(deptId)` sang object params camelCase (`approvalStatus`, `page`, `limit`, `requestType`, `targetRoomId`, `requestedById`, `from`, `to`, `q`, `sortBy`, `sortOrder`) | code khác đang gọi theo signature cũ (`departmentId` đơn lẻ) sẽ phải sửa lại |
| `managerServices.js` | `approveMeetingRequest(id, ...)` / `rejectMeetingRequest(id, reason)` | signature không đổi | chỉ bỏ fallback nội bộ khi lỗi |
| `avatarService.js` | `getAvatarStatus()` | `() => Promise` | mới |
| `avatarService.js` | `submitAvatar(file, consentAccepted)` | `(File, boolean) => Promise` | mới, tự build `FormData` |
| `avatarReviewService.js` | `getAvatarSubmissions(params)` | mới | |
| `avatarReviewService.js` | `getAvatarSubmissionDetail(id)` | mới | |
| `avatarReviewService.js` | `getAvatarDownloadUrl(id)` | mới | |
| `avatarReviewService.js` | `approveAvatarSubmission(id)` / `rejectAvatarSubmission(id, reason)` | mới | |
| `AvatarUploadForm.jsx` | `<AvatarUploadForm onSuccess onCancel? compact? />` | component mới | props: `onSuccess(data)`, `onCancel?()`, `compact?: boolean` |
| `AvatarReminderModal.jsx` | `<AvatarReminderModal />` | component mới | không nhận props, tự quản lý toàn bộ state |
| `AvatarSubmissionsReview.jsx` | default export trang | dùng trong route mục 3.1 | không export gì khác để tái dùng |

⚠️ **Chú ý quan trọng nhất**: `managerServices.getPendingMeetingRequests` đổi tham số đầu vào — nếu bên kia có code khác (ngoài phạm vi plan này) đang gọi hàm này theo signature cũ, sẽ cần sửa lại lời gọi theo signature mới.

---

## 10. Checklist kiểm thử sau khi áp dụng xong toàn bộ

- [ ] `npm run build` (hoặc `npm start`) — không lỗi compile.
- [ ] Login role thường (chưa từng nộp avatar) → popup hiện → nộp ảnh hợp lệ → popup đóng, badge chuyển "Đang chờ duyệt".
- [ ] Cố tình nộp ảnh lần 2 khi đang `pending_review` → backend trả `AVATAR_ALREADY_PENDING_REVIEW` → message tiếng Việt đúng hiển thị.
- [ ] Login `SYSTEM_ADMIN` → vào `/system-admin/avatar-submissions` → thấy submission vừa nộp ở trạng thái `pending_review` → mở chi tiết → ảnh hiển thị đúng → bấm Duyệt.
- [ ] Đăng nhập lại user vừa được duyệt → avatar hiển thị đúng ảnh mới, badge "Đã duyệt".
- [ ] Lặp lại với 1 submission khác nhưng chọn Từ chối + nhập lý do → đăng nhập lại user đó → popup hiện lại với lý do bị từ chối → nộp lại ảnh khác thành công.
- [ ] Vào trang Profile (bất kỳ role nào) → bấm "Chỉnh sửa" → thấy form nộp ảnh nhúng trong đó → nộp ảnh thành công → badge cập nhật ngay không cần reload trang.
- [ ] Thử vào `/business-admin` bằng Business Admin — xác nhận không có nav "Duyệt ảnh đại diện" (đúng phạm vi, chỉ System Admin).
- [ ] Đặt phòng (BookMeeting): tạo cuộc họp mới, danh sách phòng trống tải đúng từ BE theo khung giờ chọn; thêm khách ngoài + khách nội bộ qua autocomplete; thử vượt sức chứa phòng → checkbox cảnh báo `capacityOverrideConfirmed` hoạt động đúng.
- [ ] Sau khi tạo cuộc họp, kiểm tra `recording-config`/`agenda` được lưu đúng (hoặc cảnh báo hiển thị nếu lời gọi phụ lỗi, nhưng việc đặt phòng chính vẫn thành công).
- [ ] Dashboard Manager (`homePage.jsx`): danh sách yêu cầu chờ duyệt tải đúng theo `approvalStatus=pending`; tắt mạng / giả lập lỗi API → phải thấy thông báo lỗi thật (không còn data mock); duyệt/từ chối yêu cầu hoạt động đúng với field mới (`requestCode`, `requestedBy.fullName`, `targetRoom.roomName`).
