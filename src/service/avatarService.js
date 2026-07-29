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
 * POST /api/v1/me/avatar (multipart/form-data)
 * @param {File} file
 */
export const updateSelfAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return post('/me/avatar', formData);
};
