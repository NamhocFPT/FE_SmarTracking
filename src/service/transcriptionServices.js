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
 * REC-006: Gửi các mốc gán tên đã thu thập tại trạm
 * @param {string} meetingId 
 * @param {string} sessionId 
 * @param {Array} marks 
 */
export const uploadStationSpeakerMarks = async (meetingId, sessionId, marks) => {
    return await post(`/meetings/${meetingId}/recording-sessions/${sessionId}/speaker-marks`, { marks });
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

/**
 * B1: Đóng dấu mốc bắt đầu ghi âm
 * @param {string} meetingId
 * @param {string} note (tuỳ chọn)
 */
export const startRecordingMarker = async (meetingId, note) => {
    return await post(`/meetings/${meetingId}/recording/start-marker`, { note });
};

/**
 * B4: Lấy danh sách nhóm giọng (Speaker Clusters)
 * @param {string} transcriptId
 */
export const getTranscriptSpeakers = async (transcriptId) => {
    return await get(`/transcripts/${transcriptId}/speaker-clusters`);
};

/**
 * B5: Gán tên hàng loạt cho các nhóm giọng
 * @param {string} transcriptId
 * @param {Array<{speakerLabel: string, speakerUserId?: string, externalParticipantId?: string, displayName: string}>} mappings
 */
export const updateSpeakerMappings = async (transcriptId, mappings) => {
    return await post(`/transcripts/${transcriptId}/speaker-mappings`, { mappings });
};
