import { get, post } from '../utils/request';

/** GET /api/v1/me/avatar-status */
export const getAvatarStatus = async () => get('/me/avatar-status');

/**
 * POST /api/v1/me/avatar-submission (multipart/form-data)
 * @param {File} file
 * @param {boolean} consentAccepted
 */
export const submitAvatar = async (file, consentAccepted) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('consentAccepted', consentAccepted ? 'true' : 'false');
    return post('/me/avatar-submission', formData);
};
