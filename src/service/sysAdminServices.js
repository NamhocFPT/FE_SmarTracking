import { request, get, post, patch, dele, buildQuery } from '../utils/request';

// ============================================================
// DASHBOARD / ANALYTICS APIs (UC-RPT-01, UC-RPT-02, UC-RPT-03, UC-RPT-04)
// ============================================================

/**
 * UC-148: Lấy thống kê tổng quan hệ thống cho Dashboard
 * @returns {Promise<object>} response envelope
 */
export const getDashboardOverview = async () => {
    return await get('/analytics/dashboard/overview');
};

/**
 * UC-149: Thống kê sử dụng phòng họp
 * @param {object} params - { from, to, roomId, siteName, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getRoomAnalytics = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/rooms/dashboard${query}`);
};

/**
 * UC-150: Thống kê điểm danh & hiện diện
 * @param {object} params - { from, to, departmentId, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getAttendanceAnalytics = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/attendance/on-time-rate${query}`);
};

/**
 * UC-156: Thống kê tỷ lệ no-show theo phòng
 * @param {object} params - { from, to, roomId, groupBy }
 * @returns {Promise<object>} response envelope
 */
export const getNoShowStats = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/rooms/no-show-rate${query}`);
};

// ============================================================
// USER MANAGEMENT APIs (UC-ACC-01 ~ UC-ACC-07)
// ============================================================

/**
 * UC-ACC-06: Tìm kiếm / lọc danh sách tài khoản
 * @param {object} params - { page, limit, search, status, roleId, departmentId }
 * @returns {Promise<object>} { success, data: [...users], meta: { page, limit, total, totalPages } }
 */
export const getUsers = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/users${query}`);
};

/**
 * UC-ACC-07: Xem chi tiết hồ sơ user
 * @param {number|string} userId
 * @returns {Promise<object>} { success, data: { id, email, fullName, status, roles, departments, ... } }
 */
export const getUserById = async (userId) => {
    return await get(`/users/${userId}`);
};

/**
 * UC-ACC-01: Tạo tài khoản đơn lẻ
 * @param {object} data - { email, fullName, phone, departmentId, roleId }
 * @returns {Promise<object>} response envelope
 */
export const createUser = async (data) => {
    return await post('/users', data);
};

/**
 * UC-ACC-03: Cập nhật thông tin tài khoản
 * @param {number|string} userId
 * @param {object} data - { fullName, phone, departmentId, ... }
 * @returns {Promise<object>} response envelope
 */
export const updateUser = async (userId, data) => {
    return await patch(`/users/${userId}`, data);
};

/**
 * UC-08: Cập nhật vai trò và quyền tài khoản
 * @param {number|string} userId
 * @param {object} data - { roleIds, reason }
 * @returns {Promise<object>} response envelope
 */
export const updateUserRoles = async (userId, data) => {
    return await request(`/users/${userId}/roles`, { method: 'PUT', body: data });
};

/**
 * UC-12: Khóa tài khoản người dùng
 * @param {number|string} userId
 * @param {object} data - { reason, lockedUntil }
 * @returns {Promise<object>} response envelope
 */
export const lockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/lock`, {
        reason: data.reason || 'Vi phạm quy định bảo mật',
        lockedUntil: data.lockedUntil || null
    });
};

/**
 * UC-11: Mở khóa tài khoản người dùng (cập nhật trạng thái sang active)
 * @param {number|string} userId
 * @param {object} data - { reason }
 * @returns {Promise<object>} response envelope
 */
export const unlockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/status`, {
        accountStatus: 'active',
        reason: data.reason || 'Mở khóa tài khoản',
        lockedUntil: null
    });
};

/**
 * UC-11: Cập nhật trạng thái tài khoản
 * @param {number|string} userId
 * @param {object} data - { accountStatus, reason, lockedUntil }
 * @returns {Promise<object>} response envelope
 */
export const updateUserStatus = async (userId, data) => {
    return await patch(`/users/${userId}/status`, data);
};

/**
 * UC-10: Xóa tài khoản người dùng
 * @param {number|string} userId
 * @returns {Promise<object>} response envelope
 */
export const deleteUser = async (userId) => {
    return await dele(`/users/${userId}?confirm=true`);
};

/**
 * UC-ACC-07: Xem lịch sử hoạt động của user
 * @param {number|string} userId
 * @param {object} params - { page, limit }
 * @returns {Promise<object>} response envelope
 */
export const getUserAuditLogs = async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users/${userId}/audit-logs${query ? `?${query}` : ''}`);
};

/**
 * UC-ACC-02: Import tài khoản từ Excel
 * @param {FormData} formData - file upload
 * @returns {Promise<object>} response envelope with jobId
 */
export const importUsers = async (formData) => {
    return await post('/users/import-jobs', formData);
};

/**
 * Tải template import Excel
 * @returns {Promise<Blob>} Excel file
 */
export const getImportTemplate = async () => {
    return await get('/users/import-template');
};

// ============================================================
// IOT DEVICE APIs (UC-IOT-01 ~ UC-IOT-06)
// ============================================================

/**
 * UC-67/etc: Xem danh sách thiết bị + sức khỏe
 * @param {object} params - { page, limit, status, type, roomId }
 * @returns {Promise<object>} { success, data: [...devices], meta }
 */
export const getDevices = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/iot-devices${query}`);
};

/**
 * Xem chi tiết thiết bị
 * @param {number|string} deviceId
 * @returns {Promise<object>} response envelope
 */
export const getDeviceById = async (deviceId) => {
    return await get(`/iot-devices/${deviceId}`);
};

/**
 * UC-67: Đăng ký thiết bị camera/IoT
 * @param {object} data - { deviceCode, deviceName, deviceType, roomId, ipAddress, macAddress, ... }
 * @returns {Promise<object>} response envelope
 */
export const registerDevice = async (data) => {
    return await post('/iot-devices', data);
};

/**
 * Cập nhật thông tin thiết bị
 * @param {number|string} deviceId
 * @param {object} data
 * @returns {Promise<object>} response envelope
 */
export const updateDevice = async (deviceId, data) => {
    return await patch(`/iot-devices/${deviceId}`, data);
};

/**
 * Xóa / ngừng kích hoạt thiết bị
 * @param {number|string} deviceId
 * @returns {Promise<object>} response envelope
 */
export const removeDevice = async (deviceId) => {
    return await dele(`/iot-devices/${deviceId}`);
};

// ============================================================
// AUDIT LOG APIs (UC-CFG-02)
// ============================================================

/**
 * UC-CFG-02: Xem audit log hoạt động hệ thống
 * @param {object} params - { page, limit, action, actorId, entity, startDate, endDate }
 * @returns {Promise<object>} { success, data: [...logs], meta }
 */
export const getAuditLogs = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/audit-logs${query}`);
};

// ============================================================
// SYSTEM CONFIGURATION APIs (UC-CFG-01)
// ============================================================

/**
 * UC-CFG-01: Lấy danh sách cấu hình hệ thống
 * @returns {Promise<object>} { success, data: [...configs] }
 */
export const getSystemConfigs = async () => {
    return await get('/system-configurations');
};

/**
 * UC-CFG-01: Cập nhật cấu hình hệ thống
 * @param {object} data - { key, value }
 * @returns {Promise<object>} response envelope
 */
export const updateSystemConfig = async (data) => {
    return await patch('/system-configurations', data);
};

// ============================================================
// DEPARTMENT APIs (UC-ACC-08 - hỗ trợ cho User Management)
// ============================================================

/**
 * UC-ACC-08: Lấy danh sách phòng ban
 * @param {object} params - { page, limit }
 * @returns {Promise<object>} response envelope
 */
export const getDepartments = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/departments${query}`);
};

/**
 * UC-ACC-08: Tạo phòng ban mới
 * @param {object} data - { code, name, managerId, parentId }
 * @returns {Promise<object>} response envelope
 */
export const createDepartment = async (data) => {
    return await post('/departments', data);
};

/**
 * UC-ACC-08: Cập nhật phòng ban
 * @param {number|string} departmentId
 * @param {object} data
 * @returns {Promise<object>} response envelope
 */
export const updateDepartment = async (departmentId, data) => {
    return await patch(`/departments/${departmentId}`, data);
};

// ============================================================
// ROLES APIs (hỗ trợ cho phân quyền UC-ACC-05)
// ============================================================

/**
 * Lấy danh sách roles
 * @returns {Promise<object>} { success, data: [...roles] }
 */
export const getRoles = async () => {
    return await get('/roles');
};

/**
 * Lấy danh sách permissions
 * @returns {Promise<object>} { success, data: [...permissions] }
 */
export const getPermissions = async () => {
    return await get('/permissions');
};

// ============================================================
// BACKGROUND JOBS (hỗ trợ cho UC-ACC-02 Import tracking)
// ============================================================

/**
 * Kiểm tra trạng thái background job
 * @param {number|string} jobId
 * @returns {Promise<object>} { success, data: { id, status, progress, result, error } }
 */
export const getBackgroundJobStatus = async (jobId) => {
    return await get(`/background-jobs/${jobId}`);
};

/**
 * Xuất danh sách tài khoản người dùng ra file Excel
 * @param {object} params - filter criteria
 * @returns {Promise<Blob>} file binary data
 */
export const exportUsers = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/users/export${query}`, { responseType: 'blob' });
};

/**
 * UC-AM-12: Cập nhật thông tin cá nhân (self)
 * @param {object} data - { fullName, phoneNumber, avatarFileId }
 * @returns {Promise<object>} response envelope
 */
export const updateSelfProfile = async (data) => {
    return await patch('/me/profile', data);
};

/**
 * Lấy danh sách phòng họp
 * @param {object} params - { page, limit }
 * @returns {Promise<object>} response envelope
 */
export const getRooms = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/rooms${query}`);
};

/**
 * UC-NOTI-01: Get notifications list
 */
export const getNotifications = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/notifications${query}`);
};

/**
 * UC-NOTI-02: Mark a notification as read
 */
export const markNotificationRead = async (notificationId) => {
    return await patch(`/notifications/${notificationId}/read`);
};

/**
 * UC-NOTI-03: Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
    return await patch('/notifications/read-all');
};


// ============================================================
// CAMERA & IOT MANAGEMENT ENDPOINTS (ADDED)
// ============================================================

export const assignDeviceRoom = async (deviceId, data) => {
    return await post(`/iot-devices/${deviceId}/assign-room`, data);
};

export const configDeviceRtsp = async (deviceId, data) => {
    return await patch(`/iot-devices/${deviceId}/rtsp-config`, data);
};

export const rotateFaceServerToken = async (deviceId) => {
    return await post(`/iot-devices/${deviceId}/face-server/rotate`);
};

export const revokeFaceServerToken = async (deviceId) => {
    return await post(`/iot-devices/${deviceId}/face-server/revoke`);
};

export const disableDevice = async (deviceId) => {
    return await post(`/iot-devices/${deviceId}/disable`);
};

export const enableDevice = async (deviceId) => {
    return await post(`/iot-devices/${deviceId}/enable`);
};

export const checkDeviceAvailability = async (deviceId) => {
    return await post(`/iot-devices/${deviceId}/check-availability`);
};

// ============================================================
// FACE ACCESS — Unmapped Verifies (FE-2)
// ============================================================

/**
 * Lấy danh sách verify chưa khớp mapping (chưa gán person↔user)
 * @param {object} params - { page, pageSize, deviceId, from, to }
 */
export const getUnmappedVerifies = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/face-access/unmapped-verifies${query}`);
};

/**
 * Gán person↔user cho verify chưa khớp
 * @param {object} data - { personId, userId } hoặc { verifyId, userId }
 */
export const mapUnmappedVerify = async (data) => {
    return await post(`/face-access/unmapped-verifies/map`, data);
};
