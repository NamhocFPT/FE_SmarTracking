import { get, post, patch, buildQuery } from '../utils/request';

/**
 * Upload audio file cho meeting
 * @param {string} meetingId 
 * @param {File} file 
 */
export const uploadAudio = async (meetingId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await post(`/meetings/${meetingId}/recording-sessions/audio-upload`, formData);
};

/**
 * Tạo job transcription
 * @param {string} meetingId 
 * @param {object} payload { recordingSessionId, language, speakerMappingMode, initialPrompt, forceRerun }
 */
export const createTranscriptionJob = async (meetingId, payload) => {
    return await post(`/meetings/${meetingId}/transcription-jobs`, payload);
};

/**
 * Lấy danh sách jobs để polling
 * @param {string} meetingId 
 */
export const getTranscriptionJobs = async (meetingId) => {
    return await get(`/meetings/${meetingId}/transcription-jobs`);
};

/**
 * Lấy transcript (bao gồm segments nếu cần)
 * @param {string} meetingId 
 * @param {object} params { includeSegments: boolean, page: number, limit: number }
 */
export const getTranscript = async (meetingId, params = {}) => {
    const query = buildQuery(params);
    return await get(`/meetings/${meetingId}/transcript${query}`);
};

/**
 * Cập nhật nội dung một segment
 * @param {string} transcriptId 
 * @param {string} segmentId
 * @param {object} payload { text, speakerLabel, speakerUserId, revisionNote }
 */
export const updateTranscriptSegment = async (transcriptId, segmentId, payload) => {
    // API theo stt-feature-status-cho-fe.md: PATCH /api/v1/transcripts/:transcriptId/segments
    // Nhưng nó cần segmentId ở dạng param hoặc payload body.
    // Giả sử backend nhận segmentId trong body: { segmentId, text, ... }
    return await patch(`/transcripts/${transcriptId}/segments`, { segmentId, ...payload });
};

/**
 * Ghi đè toàn bộ nội dung text
 * @param {string} transcriptId 
 * @param {object} payload { rawText, cleanedText }
 */
export const updateTranscriptContent = async (transcriptId, payload) => {
    return await patch(`/transcripts/${transcriptId}/content`, payload);
};

/**
 * Chuyển trạng thái duyệt (draft -> reviewed -> approved)
 * @param {string} transcriptId 
 * @param {string} status 'reviewed' | 'approved'
 */
export const updateTranscriptStatus = async (transcriptId, status) => {
    return await patch(`/transcripts/${transcriptId}/status`, { status });
};
