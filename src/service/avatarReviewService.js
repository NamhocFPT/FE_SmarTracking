import { get, post } from '../utils/request';

/** GET /api/v1/admin/avatar-submissions */
export const getAvatarSubmissions = async (params = {}) => {
    const cleaned = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleaned).toString();
    return get(`/admin/avatar-submissions${query ? `?${query}` : ''}`);
};

/** GET /api/v1/admin/avatar-submissions/:id */
export const getAvatarSubmissionDetail = async (id) => get(`/admin/avatar-submissions/${id}`);

/** GET /api/v1/admin/avatar-submissions/:id/download-url */
export const getAvatarDownloadUrl = async (id) => get(`/admin/avatar-submissions/${id}/download-url`);

/** POST /api/v1/admin/avatar-submissions/:id/approve */
export const approveAvatarSubmission = async (id) => post(`/admin/avatar-submissions/${id}/approve`, {});

/** POST /api/v1/admin/avatar-submissions/:id/reject  body: { reason } */
export const rejectAvatarSubmission = async (id, reason) => post(`/admin/avatar-submissions/${id}/reject`, { reason });
