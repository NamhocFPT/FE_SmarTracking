import { get, post } from '../utils/request';

/** GET /api/v1/me/avatar-status — AvatarController.getAvatarStatus (avatar.controller.ts:55) */
export const getBiometricStatus = async () => get('/me/avatar-status');

/**
 * POST /api/v1/me/avatar-submission (multipart/form-data) — AvatarController.submitAvatar (avatar.controller.ts:80)
 * @param {File} file
 * @param {boolean} consentAccepted
 */
export const submitBiometric = async (file, consentAccepted) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('consentAccepted', consentAccepted ? 'true' : 'false');
    return post('/me/avatar-submission', formData);
};

/**
 * Cập nhật lại avatar — BE không có route /me/avatar riêng, dùng chung
 * POST /me/avatar-submission (đây cũng là route duy nhất để nộp/nộp lại ảnh khuôn mặt).
 * @param {File} file
 */
export const updateSelfAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('consentAccepted', 'true');
    return post('/me/avatar-submission', formData);
};
