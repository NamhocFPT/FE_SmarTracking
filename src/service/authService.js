import { post, get, clearTokens } from '../utils/request';

/**
 * UC-AUTH-01 Đăng nhập hệ thống
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} response envelope (success, data, meta)
 */
export const login = async (email, password) => {
    return await post('/auth/login', { email, password }, { isPublic: true });
};

/**
 * UC-AUTH-02 Đăng xuất hệ thống
 * @returns {Promise<object>} response envelope
 */
export const logout = async () => {
    try {
        return await post('/auth/logout');
    } finally {
        // Clear local storage tokens regardless of API success/failure
        clearTokens();
        localStorage.removeItem('user');
    }
};


/**
 * Đặt lại mật khẩu mới (Reset Password)
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<object>} response envelope
 */
export const resetPassword = async (token, newPassword) => {
    return await post('/auth/password-reset/otp', { token, newPassword }, { isPublic: true });
};

/**
 * Đổi mật khẩu mới (Change Password)
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<object>} response envelope
 */
export const changePassword = async (oldPassword, newPassword) => {
    return await post('/auth/change-password', { oldPassword, newPassword });
};

/**
 * Lấy thông tin tài khoản hiện tại (Get Profile / Me)
 * @returns {Promise<object>} response envelope
 */
export const getCurrentUser = async () => {
    return await get('/auth/me');
};

/**
 * Xác thực token reset mật khẩu có hợp lệ không
 * @param {string} token
 * @returns {Promise<object>} response envelope
 */
export const verifyResetToken = async (token) => {
    return await post('/auth/verify-reset-token', { token }, { isPublic: true });
};

