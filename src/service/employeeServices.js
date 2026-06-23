import { get, post, patch } from '../utils/request';

// ============================================================
// EMPLOYEE APIs (UC-SM-01 ~ UC-SM-03)
// ============================================================

/**
 * Get available meeting rooms
 * @param {object} params - { page, limit }
 */
export const getRooms = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/rooms${query ? `?${query}` : ''}`);
};

/**
 * Get users (for inviting participants)
 * @param {object} params - { page, limit }
 */
export const getUsers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/users${query ? `?${query}` : ''}`);
};

/**
 * Create a new meeting / Book a meeting room
 * @param {object} data - Meeting booking payload
 */
export const createMeeting = async (data) => {
    return await post('/meetings', data);
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
