import { get, post } from '../utils/request';

/**
 * Lấy danh sách phòng họp (Manager authorized)
 * @returns {Promise<object>} response envelope
 */
export const getMeetingRooms = async () => {
    return await get('/manager/rooms');
};

/**
 * Lấy lịch sử theo dõi hiện diện (Manager authorized)
 * @returns {Promise<object>} response envelope
 */
export const getPresenceLogs = async () => {
    return await get('/manager/presence-logs');
};
