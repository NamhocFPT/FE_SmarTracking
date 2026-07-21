import { request, get, post, patch, dele, buildQuery } from '../utils/request';

// ============================================================
// DASHBOARD & ANALYTICS APIs for Business Admin
// ============================================================

export const getDashboardOverview = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/dashboard/overview${query}`);
};

export const getRoomAnalytics = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/rooms/dashboard${query}`);
};

export const getAttendanceAnalytics = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/attendance/on-time-rate${query}`);
};

export const getRoomUtilizationRate = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/rooms/utilization-rate${query}`);
};

export const getNoShowStats = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/rooms/no-show-rate${query}`);
};

export const getOnTimeRate = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/attendance/on-time-rate${query}`);
};

export const getMeetingsCountByPeriod = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/meetings/count-by-period${query}`);
};

export const getMeetingStatusBreakdown = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/meetings/status-breakdown${query}`);
};

export const getAverageMeetingDuration = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/meetings/average-duration${query}`);
};

export const getMeetingCancelRate = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/meetings/cancel-rate${query}`);
};

export const exportMeetingActivity = async (data) => {
    return await post('/reports/meeting-activity/exports', data);
};

// ============================================================
// USER MANAGEMENT APIs (UC-ACC-01 ~ UC-ACC-07)
// ============================================================

export const getUsers = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/users${query}`);
};

export const getUserById = async (userId) => {
    return await get(`/users/${userId}`);
};

export const createUser = async (data) => {
    return await post('/users', data);
};

export const updateUser = async (userId, data) => {
    return await patch(`/users/${userId}`, data);
};

export const updateUserRoles = async (userId, data) => {
    return await request(`/users/${userId}/roles`, { method: 'PUT', body: data });
};

export const lockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/lock`, {
        reason: data.reason || 'Vi phạm quy định bảo mật',
        lockedUntil: data.lockedUntil || null
    });
};

export const unlockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/status`, {
        accountStatus: 'active',
        reason: data.reason || 'Mở khóa tài khoản',
        lockedUntil: null
    });
};

export const deleteUser = async (userId) => {
    return await dele(`/users/${userId}`);
};

export const getUserAuditLogs = async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users/${userId}/audit-logs${query ? `?${query}` : ''}`);
};

export const importUsers = async (formData) => {
    return await post('/users/import-jobs', formData);
};

export const getImportTemplate = async () => {
    return await get('/users/import/template');
};

export const exportUsers = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/users/export${query}`, { responseType: 'blob' });
};

// ============================================================
// REFERENCE APIs (Phòng ban, Vai trò, Background Job)
// ============================================================

export const getDepartments = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/departments${query}`);
};

export const createDepartment = async (data) => {
    return await post('/departments', data);
};

export const updateDepartment = async (id, data) => {
    return await patch(`/departments/${id}`, data);
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
    const query = buildQuery(params);
    return await get(`/rooms/available${query}`);
};

export const getRoomRealtimeStatus = async () => {
    return await get('/rooms/search');
};

/**
 * FE-3: Lấy no-show case theo phòng (thay cho getNoShowStatus gọi endpoint không tồn tại)
 * @param {string} roomId
 */
export const getNoShowByRoom = async (roomId) => {
    return await get(`/no-show-cases?roomId=${roomId}&status=DETECTED`);
};

export const handleNoShowCase = async (caseId, data) => {
    return await patch(`/no-show-cases/${caseId}`, data);
};

export const releaseNoShowRoom = async (caseId) => {
    return await post(`/no-show-cases/${caseId}/release`);
};

// ============================================================
// SECURITY & STRANGER ALERTS APIs
// ============================================================

export const getStrangerAlerts = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/face-access/stranger-alerts${query}`);
};

// NOTE: BE chưa có endpoint PATCH /face-access/stranger-alerts/:id/resolve
// Tạm giữ function nhưng UI sẽ disable nút resolve
export const resolveStrangerAlert = async (alertId, data) => {
    return await patch(`/face-access/stranger-alerts/${alertId}/resolve`, data);
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
    const query = buildQuery(params);
    return await get(`/meetings${query}`);
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
    const query = buildQuery(params);
    return await get(`/recordings${query}`);
};



export const getRecordingDownloadUrl = async (sessionId) => {
    return await get(`/recordings/${sessionId}/download`);
};

export const updateRecordingVisibility = async (sessionId, data) => {
    return await patch(`/recordings/${sessionId}/visibility`, data);
};

// ============================================================
// NOTIFICATION APIs (UC-NOTI-01 ~ UC-NOTI-05)
// ============================================================

export const getNotifications = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/notifications${query}`);
};

export const markNotificationRead = async (notificationId) => {
    return await patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
    return await patch('/notifications/read-all');
};
