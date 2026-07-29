import { get, buildQuery } from '../utils/request';

/**
 * SRCH-01: Global search across zone/device/vehicle/user/meeting.
 * GET /search?q=&types=zone,device,vehicle,user,meeting
 * BE tự lọc field trả về theo permission của role gọi — FE không cần biết role hiện tại.
 * @param {string} q - từ khoá tìm kiếm, tối thiểu 2 ký tự (BE trả 400 nếu ngắn hơn)
 * @param {string[]} types - danh sách type muốn tìm, vd ['zone','device','vehicle','user','meeting']
 * @returns {Promise<object>} { success, data: { zone?: {items:[]}, device?: {items:[]}, vehicle?: {items:[]}, user?: {items:[]}, meeting?: {items:[]} } }
 */
export const globalSearch = async (q, types) => {
    const typesParam = Array.isArray(types) ? types.join(',') : types;
    const query = buildQuery({ q, types: typesParam });
    return await get(`/search${query}`);
};
