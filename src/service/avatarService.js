import { get, post } from '../utils/request';

/** GET /api/v1/me/avatar-status (đối chiếu avatar.controller.ts:55 — path thật, không phải biometric-status) */
export const getBiometricStatus = async () => get('/me/biometric-status');

/**
 * POST /api/v1/me/avatar-submission (multipart/form-data)
 * (đối chiếu avatar.controller.ts:80 — path thật, không phải biometric-submission)
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
 * POST /api/v1/me/avatar (multipart/form-data)
 * @param {File} file
 */
export const updateSelfAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return post('/me/avatar', formData);
};
