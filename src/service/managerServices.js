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
 * Fetch pending meeting requests that need manager approval
 * Supports both real backend and json-server db.json queries
 */
export const getPendingMeetingRequests = async (params = {}) => {
    const queryParams = { ...params };
    // JSON-Server format queries
    queryParams['approval_status'] = 'pending';
    
    const query = new URLSearchParams(queryParams).toString();
    
    // We try to call /meeting_requests first, and if it fails or doesn't match, the app is prepared.
    // In JSON server, it is /meeting_requests. In API Contract, it is /meeting-requests
    try {
        let res = await get(`/meeting_requests${query ? `?${query}` : ''}`);
        
        // Mock DB Adapter: Map room_name and requested_by_name if missing
        if (res?.success && res.data && Array.isArray(res.data)) {
            try {
                const [roomsRes, usersRes] = await Promise.all([
                    get('/rooms'),
                    get('/users')
                ]);
                const rooms = roomsRes?.data || [];
                const users = usersRes?.data || [];
                
                res.data = res.data.map(req => {
                    if (!req.room_name && req.target_room_id) {
                        const room = rooms.find(r => r.id === req.target_room_id);
                        if (room) req.room_name = room.room_name || room.roomName;
                    }
                    if (!req.requested_by_name && req.requested_by) {
                        const user = users.find(u => u.id === req.requested_by);
                        if (user) req.requested_by_name = user.full_name || user.fullName;
                    }
                    return req;
                });
            } catch (e) {
                // Ignore errors from relation mapping
            }
        }
        return res;
    } catch {
        return await get(`/meeting-requests${query ? `?${query}` : ''}`);
    }
};

/**
 * UC-SM-05: Approve meeting room request
 */
export const approveMeetingRequest = async (requestId, decisionNote = '') => {
    try {
        // Contract API endpoint: POST /meeting-requests/{id}/approve
        return await post(`/meeting-requests/${requestId}/approve`, {
            decisionNote
        });
    } catch (err) {
        // Fallback to mock json-server PATCH
        return await patch(`/meeting_requests/${requestId}`, {
            approval_status: 'approved',
            notes: decisionNote || 'Đã phê duyệt',
            decision_at: new Date().toISOString()
        });
    }
};

/**
 * UC-SM-06: Reject meeting room request
 */
export const rejectMeetingRequest = async (requestId, rejectionReason = '') => {
    try {
        // Contract API endpoint: POST /meeting-requests/{id}/reject
        return await post(`/meeting-requests/${requestId}/reject`, {
            rejectionReason
        });
    } catch (err) {
        // Fallback to mock json-server PATCH
        return await patch(`/meeting_requests/${requestId}`, {
            approval_status: 'rejected',
            rejection_reason: rejectionReason,
            notes: rejectionReason,
            decision_at: new Date().toISOString()
        });
    }
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
