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
 * UC-11: Mở khóa tài khoản người dùng
 * BE đúng: PATCH /users/:userId/unlock
 * @param {number|string} userId
 * @param {object} data - { reason }
 * @returns {Promise<object>} response envelope
 */
export const unlockUser = async (userId, data = {}) => {
    return await patch(`/users/${userId}/unlock`, {
        reason: data.reason || 'Mở khóa tài khoản'
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
    return await dele(`/users/${userId}`);
};

/**
 * UC-ACC-07: Xem lịch sử hoạt động của user
 * BE đúng: GET /audit-logs?userId= (không còn /users/:userId/audit-logs)
 * @param {number|string} userId
 * @param {object} params - { page, limit }
 * @returns {Promise<object>} response envelope
 */
export const getUserAuditLogs = async (userId, params = {}) => {
    const query = buildQuery({ ...params, userId });
    return await get(`/audit-logs${query}`);
};

/**
 * UC-ACC-02: Import tài khoản từ Excel
 * BE đúng: POST /users/import (không còn /users/import-jobs)
 * @param {FormData} formData - file upload
 * @returns {Promise<object>} response envelope with jobId
 */
export const importUsers = async (formData) => {
    return await post('/users/import', formData);
};

/**
 * Tải template import Excel
 * @returns {Promise<Blob>} Excel file
 */
export const getImportTemplate = async () => {
    return await get('/users/import/template');
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
 * TODO: Chờ BE mở route (xem §5.2 kế hoạch đồng bộ)
 * @returns {Promise<object>} { success, data: [...configs] }
 */
export const getSystemConfigs = async () => {
    // TODO: BE chưa có controller cho system_configs — chờ §5.2
    return await get('/system-configurations');
};

/**
 * UC-CFG-01: Cập nhật cấu hình hệ thống
 * TODO: Chờ BE mở route (xem §5.2 kế hoạch đồng bộ)
 * @param {object} data - { key, value }
 * @returns {Promise<object>} response envelope
 */
export const updateSystemConfig = async (data) => {
    // TODO: BE chưa có controller cho system_configs — chờ §5.2
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
 * BE đúng: PATCH /users/:userId (không còn /me/profile)
 * @param {string|number} userId - Lấy từ localStorage hoặc auth context
 * @param {object} data - { fullName, phoneNumber }
 * @returns {Promise<object>} response envelope
 */
export const updateSelfProfile = async (userId, data) => {
    return await patch(`/users/${userId}`, data);
};

/**
 * Lấy danh sách phòng họp
 * @param {object} params - { page, limit }
 * @returns {Promise<object>} response envelope
 */
export const getRooms = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/rooms/search${query}`);
};

/**
 * UC-NOTI-01: Get notifications list
 */
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


// sync BE: Removed dead /vehicles api helper methods. Use anprService instead.

// ============================================================
// GATE ACCESS & TRAFFIC STATS (UC-107)
// ============================================================

/**
 * Lấy lịch sử ra vào thô (Raw logs)
 */
export const getAdminGateAccessLogs = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/admin/gate-access-logs${query}`);
};

/**
 * Lấy danh sách phiên ghép cặp (Paired sessions)
 */
export const getAdminGateAccessHistory = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/gate-access/admin/history${query}`);
};

/**
 * Xem chi tiết phiên ghép cặp
 */
export const getAdminGateAccessHistoryDetail = async (id) => {
    return await get(`/gate-access/admin/history/${id}`);
};

/**
 * Thống kê lưu lượng phương tiện
 */
export const getAdminVehicleTrafficStats = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/gate-access/admin/vehicle-traffic-stats${query}`);
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

// ============================================================
// B-M3: PERSON CONTROL LIST (Watchlist/Blocklist)
// ============================================================

export const getPersonControlList = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/person-control-list${query}`);
};

export const getPersonControlDetail = async (id) => {
    return await get(`/person-control-list/${id}`);
};

export const createPersonControl = async (data) => {
    return await post(`/person-control-list`, data);
};

export const updatePersonControl = async (id, data) => {
    return await patch(`/person-control-list/${id}`, data);
};

export const deletePersonControl = async (id) => {
    return await dele(`/person-control-list/${id}`);
};

// ============================================================
// B-M4: VEHICLE CONTROL LIST & REGISTRATIONS (ANPR)
// ============================================================

export const getVehicleControlList = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/anpr/admin/control-list${query}`);
};

export const getVehicleControlDetail = async (id) => {
    return await get(`/anpr/admin/control-list/${id}`);
};

export const createVehicleControl = async (data) => {
    return await post(`/anpr/admin/control-list`, data);
};

export const updateVehicleControl = async (id, data) => {
    return await patch(`/anpr/admin/control-list/${id}`, data);
};

export const deleteVehicleControl = async (id) => {
    return await dele(`/anpr/admin/control-list/${id}`);
};

export const getAdminVehicleRegistrations = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/anpr/admin/vehicle-registrations${query}`);
};

// ============================================================
// B-M9: VẬN HÀNH PHÒNG HỌP (No-Show, Early Vacancy, Room Status, Room Bookings)
// ============================================================

// B-M9.1 — Kiểm tra tác động xóa phòng
export const getRoomDeletionImpact = async (roomId) => {
    return await get(`/rooms/${roomId}/deletion-impact`);
};

// B-M9.2 — Trạng thái realtime tất cả phòng
export const getRoomsRealtimeStatus = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/rooms/realtime-status${query}`);
};

// B-M9.3 — Trạng thái chi tiết 1 phòng
export const getRoomStatus = async (roomId) => {
    return await get(`/rooms/${roomId}/status`);
};

// B-M9.4 — Danh sách đặt phòng
export const getRoomBookings = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/room-bookings${query}`);
};

// B-M9.5 — Lấy cấu hình No-Show
export const getNoShowConfig = async () => {
    return await get('/no-show-config');
};

// B-M9.6 — Cập nhật cấu hình No-Show (PUT, ≥1 field, forbidNonWhitelisted)
export const updateNoShowConfig = async (data) => {
    return await request('/no-show-config', { method: 'PUT', body: data });
};

// B-M9.7 — Lấy cấu hình Early Vacancy
export const getEarlyVacancyConfig = async () => {
    return await get('/early-vacancy-config');
};

// B-M9.8 — Cập nhật cấu hình Early Vacancy (PUT, ≥1 field, forbidNonWhitelisted)
export const updateEarlyVacancyConfig = async (data) => {
    return await request('/early-vacancy-config', { method: 'PUT', body: data });
};

// UC-IVSS-02 — Nhật ký ra/vào phòng họp
export const getRoomAccessLog = async (roomId, date) => {
    return await get(`/ivss/rooms/${roomId}/access-log${date ? `?date=${date}` : ''}`);
};
