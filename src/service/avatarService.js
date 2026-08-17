import { get, post } from '../utils/request';

/** GET /api/v1/me/biometric-status */
export const getBiometricStatus = async () => get('/me/biometric-status');

/**
 * POST /api/v1/me/biometric-submission (multipart/form-data)
 * @param {File} file
 * @param {boolean} consentAccepted
 */
export const submitBiometric = async (file, consentAccepted) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('consentAccepted', consentAccepted ? 'true' : 'false');
    return post('/me/biometric-submission', formData);
};

/**
 * Cập nhật avatar hiển thị (đổi ảnh hồ sơ) - không qua duyệt.
 * BE có 2 route tách biệt:
 * 1. POST /me/avatar: Đổi ảnh đại diện, tự do.
 * 2. POST /me/biometric-submission: Nộp ảnh sinh trắc học FaceID (bắt buộc admin duyệt).
 * 
 * @param {File} file
 */
export const updateSelfAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return post('/me/avatar', formData);
};
