import { get, post, buildQuery } from '../utils/request';

/**
 * Gợi ý phòng họp
 * @param {object} params - { startTime, endTime, attendeeCount, roomType, siteName, areaName, allowRecording, hasCamera, hasMicrophone, hasDisplay }
 * @returns {Promise<object>} response envelope
 */
export const getRoomSuggestions = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/scheduling/room-suggestions${query}`);
};

/**
 * Kiểm tra xung đột lịch người tham gia
 * @param {object} data - { startTime, endTime, timezone, participantUserIds, excludeMeetingId, externalParticipantEmails }
 * @returns {Promise<object>} response envelope
 */
export const checkParticipantConflicts = async (data) => {
    return await post('/scheduling/participant-conflicts/check', data);
};

/**
 * Gợi ý thời gian họp
 * @param {object} data - { requiredParticipantUserIds, optionalParticipantUserIds, externalParticipantEmails, searchRangeStart, searchRangeEnd, durationMinutes, excludeMeetingId, maxSuggestions }
 * @returns {Promise<object>} response envelope
 */
export const getTimeSuggestions = async (data) => {
    return await post('/scheduling/time-suggestions', data);
};
