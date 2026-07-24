import { get, post, put, patch, dele, buildQuery } from '../utils/request';

/**
 * Lấy danh sách khu vực (Zone)
 * BE: GET /zones
 * @param {object} params - Các query params: search, limit, page, status
 */
export const getZones = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/zones${query}`);
};

/**
 * Lấy chi tiết khu vực
 * BE: GET /zones/:id
 * @param {string} id
 */
export const getZoneById = async (id) => {
    return await get(`/zones/${id}`);
};

/**
 * Tạo mới khu vực
 * BE: POST /zones
 * @param {object} data - Dữ liệu khu vực mới
 */
export const createZone = async (data) => {
    return await post(`/zones`, data);
};

/**
 * Cập nhật khu vực
 * BE: PATCH /zones/:id
 * @param {string} id
 * @param {object} data
 */
export const updateZone = async (id, data) => {
    return await patch(`/zones/${id}`, data);
};

/**
 * Xóa khu vực
 * BE: DELETE /zones/:id
 * @param {string} id
 */
export const deleteZone = async (id) => {
    return await dele(`/zones/${id}`);
};

/**
 * Gán thiết bị vào khu vực
 * BE: POST /zones/:id/devices
 * @param {string} id - ID của Zone
 * @param {object} data - { deviceId: string }
 */
export const assignDeviceToZone = async (id, data) => {
    return await post(`/zones/${id}/devices`, data);
};

/**
 * Gỡ thiết bị khỏi khu vực
 * BE: DELETE /zones/:id/devices/:deviceId
 * @param {string} zoneId - ID của Zone
 * @param {string} deviceId - ID của thiết bị
 */
export const removeDeviceFromZone = async (zoneId, deviceId) => {
    return await dele(`/zones/${zoneId}/devices/${deviceId}`);
};
