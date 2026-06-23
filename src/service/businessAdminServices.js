import { request, get, post, patch, dele } from '../utils/request';

// ============================================================
// DASHBOARD & ANALYTICS APIs for Business Admin
// ============================================================

/**
 * UC-148: Xem dashboard tổng quan hệ thống
 * @param {object} params - { from, to, departmentId, roomId }
 * @returns {Promise<object>} response envelope
 */
export const getDashboardOverview = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/dashboard/overview${query ? `?${query}` : ''}`);
};

/**
 * UC-149: Xem dashboard sử dụng phòng
 * @param {object} params - { from, to, roomId, siteName, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getRoomAnalytics = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/rooms/dashboard${query ? `?${query}` : ''}`);
};

/**
 * UC-150: Xem dashboard điểm danh & hiện diện
 * @param {object} params - { from, to, departmentId, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getAttendanceAnalytics = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/attendance/dashboard${query ? `?${query}` : ''}`);
};

/**
 * UC-155: Thống kê tỷ lệ sử dụng phòng tổng hợp
 * @param {object} params - { from, to, roomId, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getRoomUtilizationRate = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/rooms/utilization-rate${query ? `?${query}` : ''}`);
};

/**
 * UC-156: Thống kê tỷ lệ no-show theo phòng
 * @param {object} params - { from, to, roomId, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getNoShowStats = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/rooms/no-show-rate${query ? `?${query}` : ''}`);
};

/**
 * UC-157: Thống kê tỷ lệ tham dự đúng giờ
 * @param {object} params - { from, to, departmentId, graceMinutes }
 * @returns {Promise<object>} response envelope
 */
export const getOnTimeRate = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/attendance/on-time-rate${query ? `?${query}` : ''}`);
};

/**
 * UC-151: Thống kê số lượng cuộc họp theo thời gian
 * @param {object} params - { from, to, granularity, departmentId }
 * @returns {Promise<object>} response envelope
 */
export const getMeetingsCountByPeriod = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/count-by-period${query ? `?${query}` : ''}`);
};

/**
 * UC-152: Thống kê cuộc họp theo trạng thái
 * @param {object} params - { from, to, departmentId }
 * @returns {Promise<object>} response envelope
 */
export const getMeetingStatusBreakdown = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/status-breakdown${query ? `?${query}` : ''}`);
};

/**
 * UC-153: Thống kê thời lượng trung bình cuộc họp
 * @param {object} params - { from, to, mode, departmentId }
 * @returns {Promise<object>} response envelope
 */
export const getAverageMeetingDuration = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/average-duration${query ? `?${query}` : ''}`);
};

/**
 * UC-154: Thống kê tỷ lệ cuộc họp bị hủy
 * @param {object} params - { from, to, departmentId }
 * @returns {Promise<object>} response envelope
 */
export const getMeetingCancelRate = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/analytics/meetings/cancel-rate${query ? `?${query}` : ''}`);
};

/**
 * UC-158: Xuất báo cáo tổng hợp hoạt động cuộc họp
 * @param {object} data - { from, to, format, scope: { departmentId, roomId, organizerId }, sections: [], delivery }
 * @returns {Promise<object>} response envelope
 */
export const exportMeetingActivity = async (data) => {
    return await post('/reports/meeting-activity/exports', data);
};

// ============================================================
// USER MANAGEMENT APIs (UC-ACC-01 ~ UC-ACC-07)
// ============================================================

/**
 * UC-ACC-06: Tìm kiếm / lọc danh sách tài khoản
 */
export const getUsers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users${query ? `?${query}` : ''}`);
};

/**
 * UC-ACC-07: Xem chi tiết hồ sơ user
 */
export const getUserById = async (userId) => {
    return await get(`/users/${userId}`);
};

/**
 * UC-ACC-01: Tạo tài khoản đơn lẻ
 */
export const createUser = async (data) => {
    return await post('/users', data);
};

/**
 * UC-ACC-03: Cập nhật thông tin tài khoản
 */
export const updateUser = async (userId, data) => {
    return await patch(`/users/${userId}`, data);
};

/**
 * UC-08: Cập nhật vai trò và quyền tài khoản
 */
export const updateUserRoles = async (userId, data) => {
    return await request(`/users/${userId}/roles`, { method: 'PUT', body: data });
};

/**
 * UC-12: Khóa tài khoản người dùng
 */
export const lockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/lock`, {
        reason: data.reason || 'Vi phạm quy định bảo mật',
        lockedUntil: data.lockedUntil || null
    });
};

/**
 * UC-11: Mở khóa tài khoản người dùng (cập nhật trạng thái sang active)
 */
export const unlockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/status`, {
        accountStatus: 'active',
        reason: data.reason || 'Mở khóa tài khoản',
        lockedUntil: null
    });
};

/**
 * UC-10: Xóa tài khoản người dùng
 */
export const deleteUser = async (userId) => {
    return await dele(`/users/${userId}?confirm=true`);
};

/**
 * UC-ACC-07: Xem lịch sử hoạt động của user
 */
export const getUserAuditLogs = async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users/${userId}/audit-logs${query ? `?${query}` : ''}`);
};

/**
 * UC-ACC-02: Import tài khoản từ Excel
 */
export const importUsers = async (formData) => {
    return await post('/users/import-jobs', formData);
};

/**
 * Tải template import Excel
 */
export const getImportTemplate = async () => {
    return await get('/users/import-template');
};

/**
 * Xuất danh sách tài khoản người dùng ra file Excel
 */
export const exportUsers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users/export${query ? `?${query}` : ''}`, { responseType: 'blob' });
};

// ============================================================
// REFERENCE APIs (Phòng ban, Vai trò, Background Job)
// ============================================================

export const getDepartments = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/departments${query ? `?${query}` : ''}`);
};

export const createDepartment = async (data) => {
    return await post('/departments', data);
};

export const updateDepartment = async (id, data) => {
    return await patch(`/departments/${id}`, data);
};

export const deleteDepartment = async (id) => {
    return await dele(`/departments/${id}`);
};

export const getRoles = async () => {
    return await get('/roles');
};

export const getBackgroundJobStatus = async (jobId) => {
    return await get(`/background-jobs/${jobId}`);
};

// ============================================================
// ROOM MANAGEMENT APIs (UC-57 ~ UC-60)
// ============================================================

export const getRooms = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/rooms${query ? `?${query}` : ''}`);
};

export const createRoom = async (data) => {
    return await post('/rooms', data);
};

export const updateRoom = async (roomId, data) => {
    return await patch(`/rooms/${roomId}`, data);
};

export const deleteRoom = async (roomId) => {
    return await dele(`/rooms/${roomId}`);
};

// ============================================================
// MEETING MANAGEMENT APIs (UC-18 ~ UC-34)
// ============================================================

export const getMeetings = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/meetings${query ? `?${query}` : ''}`);
};

export const createMeeting = async (data) => {
    return await post('/meetings', data);
};

export const updateMeeting = async (meetingId, data) => {
    return await patch(`/meetings/${meetingId}`, data);
};

export const cancelMeeting = async (meetingId, reason = 'Huỷ bởi quản trị viên') => {
    return await post(`/meetings/${meetingId}/cancel`, { reason });
};

// ============================================================
// RECORDING MANAGEMENT APIs (UC-REC-01 ~ UC-REC-09)
// ============================================================

export const getRecordings = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/recordings${query ? `?${query}` : ''}`);
};

export const deleteRecording = async (sessionId) => {
    return await dele(`/recordings/${sessionId}`);
};

export const getRecordingDownloadUrl = async (sessionId) => {
    return await get(`/recordings/${sessionId}/download`);
};

// ============================================================
// NOTIFICATION APIs (UC-NOTI-01 ~ UC-NOTI-05)
// ============================================================

export const getNotifications = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/notifications${query ? `?${query}` : ''}`);
};

export const markNotificationRead = async (notificationId) => {
    return await patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
    return await patch('/notifications/read-all');
};



