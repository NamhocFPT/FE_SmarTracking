const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

// Token storage helpers
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
};

/**
 * Xây dựng query string từ object, lọc bỏ các giá trị undefined, null, chuỗi rỗng
 * @param {Object} params - Tham số truy vấn
 * @returns {string} Chuỗi truy vấn đã serialize
 */
export const buildQuery = (params) => {
    if (!params) return '';
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(item => query.append(key, item));
            } else {
                query.append(key, value);
            }
        }
    }
    const qStr = query.toString();
    return qStr ? `?${qStr}` : '';
};

const isPublicEndpoint = (path) => {
    const publicPaths = [
        '/auth/login',
        '/auth/password-reset/request',
        '/auth/password-reset/confirm'
    ];
    // Normalize path (remove leading/trailing slashes for check)
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return publicPaths.some(p => normalizedPath.startsWith(p));
};

export const request = async (path, options = {}) => {
    const { method = 'GET', body, headers = {}, isPublic: customIsPublic } = options;
    const isPublic = customIsPublic !== undefined ? customIsPublic : isPublicEndpoint(path);
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;

    const defaultHeaders = {
        'Accept': 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
    };

    // Attach JWT Bearer Access Token if not public
    const token = getAccessToken();
    if (!isPublic && token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers: defaultHeaders,
    };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized for non-public endpoints
        if (response.status === 401 && !isPublic) {
            clearTokens();
            window.dispatchEvent(new Event('auth-expired'));
            throw {
                success: false,
                error: {
                    message: 'Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
                    code: 'AUTH_EXPIRED',
                    requestId: null
                },
                requestId: null
            };
        }

        return handleResponse(response);
    } catch (error) {
        if (error.success === false && error.error) {
            throw error;
        }
        throw {
            success: false,
            error: {
                message: 'Lỗi mạng: Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.',
                code: 'CONNECTION_ERROR',
                requestId: null
            },
            requestId: null
        };
    }
};

const handleResponse = async (response) => {
    let result;
    try {
        result = await response.json();
    } catch (e) {
        throw {
            success: false,
            error: {
                message: `Lỗi hệ thống: Phản hồi không hợp lệ từ máy chủ (${response.status})`,
                code: 'INVALID_RESPONSE',
                requestId: null
            },
            requestId: null
        };
    }

    if (!response.ok || result.success === false) {
        const errorDetail = result.error || {};
        let message = result.message || errorDetail.message || 'Đã xảy ra lỗi hệ thống.';
        const code = errorDetail.code || 'UNKNOWN_ERROR';
        let requestId = result.requestId || errorDetail.requestId || 'unknown';

        if (typeof message === 'string') {
            if (message.startsWith('Cannot ') && (message.includes('POST') || message.includes('GET') || message.includes('PUT') || message.includes('DELETE') || message.includes('PATCH'))) {
                message = 'Lỗi hệ thống: Đường dẫn không tồn tại hoặc chưa được hỗ trợ.';
            } else if (message === 'Internal Server Error' || response.status >= 500) {
                message = 'Lỗi hệ thống: Máy chủ đang gặp sự cố.';
            } else if (response.status === 404 && message.includes('Not Found')) {
                message = 'Lỗi hệ thống: Không tìm thấy dữ liệu yêu cầu.';
            }
        }

        if (requestId === 'unknown' || requestId === 'N/A') {
            requestId = null;
        }

        throw {
            success: false,
            error: {
                message: message,
                code: code,
                requestId: requestId
            },
            requestId: requestId
        };
    }

    // Mock API Adapter: json-server returns direct objects/arrays. Wrap them.
    if (result && typeof result.success === 'undefined') {
        return {
            success: true,
            data: result
        };
    }

    return result;
};

export const get = (path, options = {}) => request(path, { ...options, method: 'GET' });
export const post = (path, body, options = {}) => request(path, { ...options, method: 'POST', body });

export const patch = (path, body, options = {}) => {
    let actualPath = path;
    let actualOptions = options;
    if (typeof options === 'string' || typeof options === 'number') {
        actualPath = `${path}/${options}`;
        actualOptions = {};
    }
    return request(actualPath, { ...actualOptions, method: 'PATCH', body });
};

export const put = (path, body, options = {}) => request(path, { ...options, method: 'PUT', body });

export const dele = (path, options = {}) => {
    let actualPath = path;
    let actualOptions = options;
    if (typeof options === 'string' || typeof options === 'number') {
        actualPath = `${path}/${options}`;
        actualOptions = {};
    }
    return request(actualPath, { ...actualOptions, method: 'DELETE' });
};