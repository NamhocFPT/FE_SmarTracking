import { get, post, patch, put, buildQuery } from '../utils/request';

// ============================================================
// EMPLOYEE APIs (UC-SM-01 ~ UC-SM-03)
// ============================================================

/**
 * Get rooms available in a given time range (server-side conflict check)
 * @param {object} params - { startTime, endTime, minCapacity } (startTime/endTime: ISO8601)
 */
export const getAvailableRooms = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/rooms/available${query}`);
};

/**
 * @deprecated Backend chưa có endpoint list phòng (GET /rooms). Dùng cho các trang ngoài
 * phạm vi luồng booking (MeetingDetail.jsx); KHÔNG dùng trong BookMeeting.jsx (xem getAvailableRooms).
 * @param {object} params - { page, limit }
 */
export const getRooms = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/rooms/available${query}`);
};

/**
 * Tìm kiếm/lấy danh sách rút gọn nhân viên nội bộ (dùng cho autocomplete chọn participants)
 * @param {object} params - { page, limit, search }
 */
export const getUsers = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/users${query}`);
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
    const query = buildQuery(params);
    return await get(`/me/schedule${query}`);
};

/**
 * UC-ACC-07: Xem chi tiết hồ sơ user (self)
 * @param {number|string} userId
 */
export const getUserById = async (userId) => {
    return await get(`/users/${userId}`);
};

/**
 * Lấy hồ sơ công khai của user
 * @param {number|string} userId
 */
export const getUserPublicProfile = async (userId) => {
    return await get(`/users/${userId}/public-profile`);
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
export const registerFaceProfile = async (formData) => {
    // Note: Do not pass Content-Type header so the browser can automatically
    // set the multipart/form-data boundary
    return await post('/users/face-profile', formData, {
        headers: {} 
    });
};

/**
 * UC-SM-04: Xem chi tiết cuộc họp
 */
export const getMeetingById = async (id) => {
    return await get(`/meetings/${id}`);
};

export const getMeetingMediaFiles = async (meetingId) => {
    return await get(`/meetings/${meetingId}/media-files`);
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
 * UC-94: Bắt đầu phiên họp
 * Endpoint: POST /live-meetings/{meetingId}/start
 */
export const startMeeting = async (id) => {
    return await post(`/live-meetings/${id}/start`);
};

/**
 * UC-REC-01: Lấy danh sách các bản ghi (recording sessions) của cuộc họp employee tham gia
 */
export const getMyRecordings = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/me/recordings${query}`);
};

/**
 * Tải xuống bản ghi/tài liệu cuộc họp
 */
export const getRecordingDownloadUrl = async (sessionId) => {
    return await get(`/recordings/${sessionId}/download`);
};

// ============================================================
// MEETING NOTES & ACTIONS ENDPOINTS (RESTORED)
// ============================================================

export const getMeetingAttendance = async (meetingId, params = {}) => {
    const query = buildQuery(params);
    return await get(`/meetings/${meetingId}/attendance${query}`);
};

export const updateAttendanceStatus = async (meetingId, data) => {
    return await patch(`/meetings/${meetingId}/attendance/status`, data);
};

export const listMeetingNotes = async (meetingId, params = {}) => {
    const query = buildQuery(params);
    return await get(`/meetings/${meetingId}/notes${query}`);
};

export const createMeetingNote = async (meetingId, data) => {
    return await post(`/meetings/${meetingId}/notes`, data);
};

/**
 * UC-98: Kết thúc phiên họp
 * Endpoint: POST /live-meetings/{meetingId}/end
 */
export const endMeeting = async (meetingId) => {
    return await post(`/live-meetings/${meetingId}/end`);
};

/**
 * UC-100: Xem danh sách người đang có mặt
 * Endpoint: GET /live-meetings/{meetingId}/present-attendees
 */
export const getPresentAttendees = async (meetingId, params = {}) => {
    const query = buildQuery(params);
    return await get(`/live-meetings/${meetingId}/present-attendees${query}`);
};

/**
 * UC-95: Yêu cầu gia hạn phiên họp
 * Endpoint: POST /live-meetings/{meetingId}/extension-requests
 */
export const requestExtension = async (meetingId, data) => {
    return await post(`/live-meetings/${meetingId}/extension-requests`, data);
};

/**
 * UC-96: Phê duyệt/từ chối yêu cầu gia hạn
 * Endpoint: POST /live-meetings/{meetingId}/extension-requests/{requestId}/decide
 */
export const decideExtension = async (meetingId, requestId, data) => {
    return await post(`/live-meetings/${meetingId}/extension-requests/${requestId}/decide`, data);
};
