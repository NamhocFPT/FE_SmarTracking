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

/**
 * UC-11: Mở khóa tài khoản người dùng
 * BE đúng: PATCH /users/:userId/unlock
 * @param {number|string} userId
 * @param {object} data - { reason }
 */
export const unlockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/unlock`, {
        reason: data.reason || 'Mở khóa tài khoản'
    });
};

export const deleteUser = async (userId) => {
    return await dele(`/users/${userId}`);
};

/**
 * UC-ACC-07: Xem lịch sử hoạt động của user
 * BE đúng: GET /audit-logs?userId= (không còn /users/:userId/audit-logs)
 */
export const getUserAuditLogs = async (userId, params = {}) => {
    const query = buildQuery({ ...params, userId });
    return await get(`/audit-logs${query}`);
};

/**
 * UC-ACC-02: Import tài khoản từ Excel
 * BE đúng: POST /users/import (không còn /users/import-jobs)
 */
export const importUsers = async (formData) => {
    return await post('/users/import', formData);
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
    return await get(`/rooms/search${query}`);
};

export const getRoomRealtimeStatus = async () => {
    return await get('/rooms/realtime-status');
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

export const getAllNoShowCases = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/no-show-cases${query}`);
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

export const updateMeetingTime = async (id, data) => {
    return await patch(`/meetings/${id}/time`, data);
};

export const updateMeetingRoom = async (id, data) => {
    return await patch(`/meetings/${id}/room`, data);
};

export const updateMeetingRecordingConfig = async (id, data) => {
    return await patch(`/meetings/${id}/recording-config`, data);
};

export const cancelMeeting = async (meetingId, reason = 'Huỷ bởi quản trị viên') => {
    return await post(`/meetings/${meetingId}/cancel`, { reason });
};

// ============================================================
// RECORDING MANAGEMENT APIs — đã chuyển sang /media-files/*
// ============================================================

/**
 * Lấy danh sách file media của cuộc họp
 * BE: GET /meetings/:meetingId/media-files
 * @param {string} meetingId
 * @param {object} params
 */
export const getMeetingMediaFiles = async (meetingId, params = {}) => {
    const query = buildQuery(params);
    return await get(`/meetings/${meetingId}/media-files${query}`);
};

/**
 * Tải xuống file media (secure download)
 * BE: GET /media-files/:fileId/secure-download
 * @param {string} fileId - ID file media
 */
export const getMediaFileSecureDownload = async (fileId) => {
    return await get(`/media-files/${fileId}/secure-download`);
};

/**
 * Phát lại file media trong trình duyệt
 * BE: GET /media-files/:fileId/playback
 * @param {string} fileId
 */
export const getMediaFilePlayback = async (fileId) => {
    return await get(`/media-files/${fileId}/playback`);
};

/**
 * Cập nhật quyền xem file media
 * BE: PATCH /media-files/:fileId/visibility
 * @param {string} fileId
 * @param {object} data - { visibility }
 */
export const updateMediaVisibility = async (fileId, data) => {
    return await patch(`/media-files/${fileId}/visibility`, data);
};

// ============================================================
// NOTIFICATION APIs (UC-NOTI-01 ~ UC-NOTI-05)
// ============================================================

export const getNotifications = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/notifications${query}`);
};

/**
 * UC-NOTI-02: Đánh dấu thông báo đã đọc
 * TODO: BE chưa có route — chờ §5.3 kế hoạch đồng bộ
 */
export const markNotificationRead = async (notificationId) => {
    // TODO: BE chưa có PATCH /notifications/:id/read — chờ §5.3
    return await patch(`/notifications/${notificationId}/read`);
};

/**
 * UC-NOTI-03: Đánh dấu tất cả thông báo đã đọc
 * TODO: BE chưa có route — chờ §5.3 kế hoạch đồng bộ
 */
export const markAllNotificationsRead = async () => {
    // TODO: BE chưa có PATCH /notifications/read-all — chờ §5.3
    return await patch('/notifications/read-all');
};
