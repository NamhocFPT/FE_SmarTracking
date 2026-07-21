import { get, post, patch, dele, buildQuery } from '../utils/request';

/**
 * Lấy danh sách thiết bị
 * @param {object} params - { page, limit, equipmentType, assetStatus, healthStatus, currentRoomId, search, sortBy, sortOrder }
 * @returns {Promise<object>} response envelope
 */
export const getEquipments = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/equipments${query}`);
};

/**
 * Thêm mới thiết bị
 * @param {object} data - { equipmentName, equipmentType, equipmentCode, serialNumber, brand, model, purchaseDate, specification, healthStatus }
 * @returns {Promise<object>} response envelope
 */
export const createEquipment = async (data) => {
    return await post('/equipments', data);
};

/**
 * Báo cáo lỗi thiết bị
 * @param {string|number} equipmentId
 * @param {object} data - { healthStatus, assetStatus, issueNote }
 * @returns {Promise<object>} response envelope
 */
export const reportEquipmentFault = async (equipmentId, data) => {
    return await patch(`/equipments/${equipmentId}/fault`, data);
};

/**
 * Gán thiết bị vào phòng
 * @param {string|number} equipmentId
 * @param {object} data - { roomId, installedAt, assignmentNote }
 * @returns {Promise<object>} response envelope
 */
export const assignEquipment = async (equipmentId, data) => {
    return await patch(`/equipments/${equipmentId}/assignment`, data);
};
