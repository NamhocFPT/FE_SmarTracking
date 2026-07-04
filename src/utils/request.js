const API_BASE_URL = 'http://localhost:3000/api/v1'; // Connect to local backend API

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

// Check if an endpoint is public
const isPublicEndpoint = (path) => {
    const publicPaths = [
        '/auth/login',
        '/auth/password-reset/otp',
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

        // Handle 401 Unauthorized for non-public endpoints (Token Rotation)
        if (response.status === 401 && !isPublic) {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refreshToken }),
                        });
                        const refreshResult = await refreshResponse.json();
                        
                        if (refreshResponse.ok && refreshResult.success) {
                            const { accessToken: newAccess, refreshToken: newRefresh } = refreshResult.data;
                            setTokens(newAccess, newRefresh);
                            isRefreshing = false;
                            onRefreshed(newAccess);
                        } else {
                            isRefreshing = false;
                            clearTokens();
                            // Optional: Dispatch event or redirect to login
                            window.dispatchEvent(new Event('auth-expired'));
                            throw {
                                success: false,
                                error: {
                                    message: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.',
                                    code: 'AUTH_EXPIRED',
                                    requestId: refreshResult.requestId || 'unknown'
                                },
                                requestId: refreshResult.requestId || 'unknown'
                            };
                        }
                    } catch (refreshErr) {
                        isRefreshing = false;
                        clearTokens();
                        window.dispatchEvent(new Event('auth-expired'));
                        throw refreshErr;
                    }
                }

                // Queue original request until refresh is done
                const retryOriginalRequest = new Promise((resolve) => {
                    subscribeTokenRefresh((newToken) => {
                        config.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(fetch(url, config));
                    });
                });
                const retriedResponse = await retryOriginalRequest;
                return handleResponse(retriedResponse);
            }
        }

        return handleResponse(response);
    } catch (error) {
        if (error.success === false && error.error) {
            throw error;
        }
        throw {
            success: false,
            error: {
                message: error.message || 'Lỗi kết nối máy chủ.',
                code: 'CONNECTION_ERROR',
                requestId: 'local-err-' + Math.random().toString(36).substr(2, 9)
            },
            requestId: 'local-err-' + Math.random().toString(36).substr(2, 9)
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
                message: `Phản hồi không hợp lệ từ máy chủ (${response.status})`,
                code: 'INVALID_RESPONSE',
                requestId: 'unknown'
            },
            requestId: 'unknown'
        };
    }

    if (!response.ok || result.success === false) {
        const errorDetail = result.error || {};
        const requestId = result.requestId || errorDetail.requestId || 'unknown';
        throw {
            success: false,
            error: {
                message: result.message || errorDetail.message || 'Đã xảy ra lỗi hệ thống.',
                code: errorDetail.code || 'UNKNOWN_ERROR',
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