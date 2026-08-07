import { get, post, dele } from '../utils/request';

// ─── Helpers token ─────────────────────────────────────────────────────────
export const getGuestToken = () => sessionStorage.getItem('guestToken');
export const getGuestMeetingId = () => sessionStorage.getItem('guestMeetingId');
export const saveGuestSession = (guestToken, meetingId) => {
    sessionStorage.setItem('guestToken', guestToken);
    sessionStorage.setItem('guestMeetingId', meetingId);
};
export const clearGuestSession = () => {
    sessionStorage.removeItem('guestToken');
    sessionStorage.removeItem('guestMeetingId');
};

const guestAuth = () => ({ isPublic: true, token: getGuestToken() });

// ─── Luồng xác thực khách (không cần token) ────────────────────────────────

/** Lấy thông tin lời mời (email che, tên họp, host...) */
export const getGuestInvite = (token) =>
    get(`/guest/invites/${token}`, { isPublic: true });

/** Gửi OTP về email đã lưu trong lời mời */
export const sendGuestOtp = (token) =>
    post(`/guest/invites/${token}/otp`, undefined, { isPublic: true });

/**
 * Xác minh OTP → nhận guestToken + lobbyRequired + meetingId
 * Sau khi verify thành công, tự lưu session vào sessionStorage
 */
export const verifyGuestOtp = async (token, otp) => {
    const res = await post(`/guest/invites/${token}/verify`, { otp }, { isPublic: true });
    if (res?.success && res.data?.guestToken) {
        saveGuestSession(res.data.guestToken, res.data.meetingId);
    }
    return res;
};

// ─── Trang xem cuộc họp phía khách (cần guestToken) ───────────────────────

/** Nội dung cuộc họp rút gọn — dùng để poll định kỳ */
export const getGuestMeeting = (meetingId) =>
    get(`/guest/meetings/${meetingId}`, guestAuth());

// ─── Phía host — quản lý khách (dùng accessToken nhân viên) ───────────────

/** Danh sách tất cả khách của cuộc họp */
export const listMeetingGuests = (meetingId) =>
    get(`/live-meetings/${meetingId}/guests`);

/** Duyệt khách vào họp */
export const admitGuest = (meetingId, externalParticipantId) =>
    post(`/live-meetings/${meetingId}/guests/${externalParticipantId}/admit`);

/** Từ chối khách */
export const rejectGuest = (meetingId, externalParticipantId) =>
    post(`/live-meetings/${meetingId}/guests/${externalParticipantId}/reject`);

/** Gửi lại link mời */
export const resendGuestInvite = (meetingId, externalParticipantId) =>
    post(`/live-meetings/${meetingId}/guests/${externalParticipantId}/resend-invite`);

/** Thu hồi quyền truy cập ngay */
export const revokeGuestAccess = (meetingId, externalParticipantId) =>
    dele(`/live-meetings/${meetingId}/guests/${externalParticipantId}/access`);
