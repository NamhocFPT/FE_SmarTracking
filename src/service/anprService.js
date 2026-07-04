import { get, post, patch, dele as del } from '../utils/request';

// ============================================================
// ANPR APIs (UC-ANPR)
// ============================================================

/**
 * Lấy danh sách xe của tôi (Employee/Manager/Admin)
 * GET /anpr/vehicle-registrations
 */
export const getMyVehicles = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/anpr/vehicle-registrations${query ? `?${query}` : ''}`);
};

/**
 * Lấy chi tiết xe của tôi
 * GET /anpr/vehicle-registrations/:id
 */
export const getMyVehicleById = async (id) => {
    return await get(`/anpr/vehicle-registrations/${id}`);
};

/**
 * Đăng ký xe mới (Cá nhân)
 * POST /anpr/vehicle-registrations
 * @param {object} data - { plateNumber, vehicleType, note }
 */
export const createMyVehicle = async (data) => {
    return await post(`/anpr/vehicle-registrations`, data);
};

/**
 * Sửa thông tin xe (note/loại xe)
 * PATCH /anpr/vehicle-registrations/:id
 */
export const updateMyVehicle = async (id, data) => {
    return await patch(`/anpr/vehicle-registrations/${id}`, data);
};

/**
 * Bật/tắt trạng thái xe
 * PATCH /anpr/vehicle-registrations/:id/status
 * @param {object} data - { status: 'ACTIVE' | 'INACTIVE' }
 */
export const toggleMyVehicleStatus = async (id, data) => {
    return await patch(`/anpr/vehicle-registrations/${id}/status`, data);
};

/**
 * Xóa mềm xe
 * DELETE /anpr/vehicle-registrations/:id
 */
export const deleteMyVehicle = async (id) => {
    return await del(`/anpr/vehicle-registrations/${id}`);
};

/**
 * Admin đăng ký xe hộ nhân viên
 * POST /anpr/admin/vehicle-registrations
 * @param {object} data - { userId, plateNumber, vehicleType, note }
 */
export const adminRegisterVehicle = async (data) => {
    return await post(`/anpr/admin/vehicle-registrations`, data);
};

/**
 * Lịch sử xe của tôi
 * GET /anpr/vehicle-history
 */
export const getMyVehicleHistory = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/anpr/vehicle-history${query ? `?${query}` : ''}`);
};

/**
 * Lịch sử quét biển toàn hệ thống (Admin)
 * GET /anpr/admin/vehicle-history
 * @param {object} params - { page, limit, matchState }
 */
export const getAdminVehicleHistory = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/anpr/admin/vehicle-history${query ? `?${query}` : ''}`);
};

/**
 * Lấy danh sách biển lạ / chưa đăng ký (Admin)
 * GET /anpr/admin/unknown-vehicles
 */
export const getUnknownVehicles = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await get(`/anpr/admin/unknown-vehicles${query ? `?${query}` : ''}`);
};
