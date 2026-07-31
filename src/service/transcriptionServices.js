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
 * Sửa 1 hoặc nhiều segment cùng lúc — PATCH /transcripts/:transcriptId/segments
 * Contract chuẩn theo BE (update-transcript-segments.dto.ts): body dạng mảng `segments[]`.
 * @param {string} transcriptId
 * @param {Array<{segmentId: string, text?: string, speakerLabel?: string, speakerUserId?: string, reason?: string}>} segments
 * @param {string} [revisionNote] - ghi chú chung cho cả lần sửa này (audit)
 */
export const updateTranscriptSegments = async (transcriptId, segments, revisionNote) => {
    const body = { segments };
    if (revisionNote) body.revisionNote = revisionNote;
    return await patch(`/transcripts/${transcriptId}/segments`, body);
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
 * @param {string} [note] - ghi chú khi chuyển trạng thái (audit, optional)
 */
export const updateTranscriptStatus = async (transcriptId, status, note) => {
    const body = { status };
    if (note) body.note = note;
    return await patch(`/transcripts/${transcriptId}/status`, body);
};
