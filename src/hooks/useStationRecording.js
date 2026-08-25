import { useState, useEffect, useRef, useCallback } from 'react';
import { uploadAudio, uploadStationSpeakerMarks } from '../service/transcriptionServices';
import { LIVE_SPEAKER_TAGGING_ENABLED } from '../config/featureFlags';

// Helpers cho IndexedDB để chống mất dữ liệu khi browser crash
const DB_NAME = 'SmarTrackingRecordingDB';
const STORE_NAME = 'chunks';
const DB_VERSION = 1;

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveChunkToDB = async (db, blob) => {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).add(blob);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

const getAllChunksFromDB = async (db) => {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

const clearDB = async (db) => {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

// Chuẩn hoá tên cuộc họp thành slug an toàn cho tên file (bỏ dấu tiếng Việt, khoảng trắng → _)
const slugifyMeetingTitle = (title) => {
    if (!title) return 'meeting';
    return title
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // bỏ dấu tiếng Việt
        .replace(/đ/gi, 'd')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60) || 'meeting';
};

export const useStationRecording = (meetingId, meetingTitle) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const dbRef = useRef(null);
    const streamRef = useRef(null);
    const marksRef = useRef([]); // Lưu các mốc gán tên: { offsetSeconds, speakerUserId/externalParticipantId, displayName }
    const timerRef = useRef(null);
    // Thời lượng ĐÃ GHI THẬT (ms), KHÔNG tính các quãng đang tạm dừng — đây mới là
    // trục thời gian của file audio cuối cùng, vì MediaRecorder.pause() không ghi gì
    // trong lúc tạm dừng nên file không chứa khoảng trống tương ứng.
    const recordedMsRef = useRef(0);
    // Mốc bắt đầu của đoạn đang ghi; null khi đang tạm dừng hoặc đã dừng hẳn.
    const segmentStartedAtRef = useRef(null);

    const getRecordedMs = () =>
        recordedMsRef.current +
        (segmentStartedAtRef.current ? Date.now() - segmentStartedAtRef.current : 0);

    const initDB = async () => {
        if (!dbRef.current) {
            dbRef.current = await openDB();
            await clearDB(dbRef.current);
        }
    };

    const startRecording = useCallback(async () => {
        try {
            setError('');
            await initDB();
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = async (e) => {
                if (e.data.size > 0 && dbRef.current) {
                    await saveChunkToDB(dbRef.current, e.data);
                }
            };

            // Cắt chunk mỗi 30s
            mediaRecorder.start(30000);
            setIsRecording(true);
            setIsPaused(false);
            const now = Date.now();
            setStartTime(now);
            marksRef.current = [];
            setRecordingTime(0);
            recordedMsRef.current = 0;
            segmentStartedAtRef.current = now;

            // Đồng hồ bám theo thời lượng đã ghi thật → đứng yên trong lúc tạm dừng.
            timerRef.current = setInterval(() => {
                setRecordingTime(Math.floor(getRecordedMs() / 1000));
            }, 1000);

        } catch (err) {
            setError('Lỗi khởi tạo micro (Vui lòng cấp quyền micro): ' + err.message);
        }
    }, []);

    /**
     * Tạm dừng ghi âm bằng MediaRecorder.pause() của trình duyệt: vẫn chỉ MỘT file
     * audio duy nhất khi dừng hẳn (không bị cắt thành nhiều file rời), phần tạm dừng
     * đơn giản là không có mặt trong file. Mic được giữ nguyên (không stop track) để
     * bấm "Tiếp tục" là ghi lại ngay, không phải xin quyền lại.
     */
    const pauseRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state !== 'recording') return;
        recorder.pause();
        if (segmentStartedAtRef.current) {
            recordedMsRef.current += Date.now() - segmentStartedAtRef.current;
            segmentStartedAtRef.current = null;
        }
        setRecordingTime(Math.floor(recordedMsRef.current / 1000));
        setIsPaused(true);
    }, []);

    /** Ghi tiếp vào đúng file đang ghi dở (xem chú thích ở pauseRecording). */
    const resumeRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state !== 'paused') return;
        recorder.resume();
        segmentStartedAtRef.current = Date.now();
        setIsPaused(false);
    }, []);

    const stopAndUpload = useCallback(async () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return null;

        setIsProcessing(true);
        setError('');

        return new Promise((resolve) => {
            // Stop recording
            mediaRecorderRef.current.onstop = async () => {
                clearInterval(timerRef.current);
                if (segmentStartedAtRef.current) {
                    recordedMsRef.current += Date.now() - segmentStartedAtRef.current;
                    segmentStartedAtRef.current = null;
                }
                setIsRecording(false);
                setIsPaused(false);
                setStartTime(null);

                // Dừng các track của stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                try {
                    // Gom chunk từ IndexedDB
                    const chunks = await getAllChunksFromDB(dbRef.current);
                    const finalBlob = new Blob(chunks, { type: 'audio/webm' });
                    const fileName = `audio_${slugifyMeetingTitle(meetingTitle)}.webm`;
                    const file = new File([finalBlob], fileName, { type: 'audio/webm' });

                    // Upload file
                    const uploadRes = await uploadAudio(meetingId, file);
                    if (!uploadRes?.success) throw new Error(uploadRes?.error?.message || 'Upload file thất bại');
                    
                    const sessionId = uploadRes.data?.recordingSessionId || uploadRes.data?.id;
                    
                    // Upload marks nếu có — bỏ qua khi tính năng gán người nói trong
                    // lúc họp đang tắt (LIVE_SPEAKER_TAGGING_ENABLED=false).
                    if (LIVE_SPEAKER_TAGGING_ENABLED && marksRef.current.length > 0 && sessionId) {
                        try {
                            await uploadStationSpeakerMarks(meetingId, sessionId, marksRef.current);
                        } catch (markErr) {
                            console.error('Lỗi khi gửi mốc gán tên:', markErr);
                            // Dù lỗi mốc thì audio vẫn upload thành công
                        }
                    }

                    // STT không tự chạy ở đây nữa — người dùng chủ động bấm "Chạy Speech to Text"
                    // sau khi meeting kết thúc (xem audioFile card trong MeetingDetail.jsx).

                    // Dọn dẹp DB
                    await clearDB(dbRef.current);
                    resolve({ success: true, sessionId, marksCount: marksRef.current.length });
                } catch (err) {
                    setError('Lỗi khi xử lý bản ghi âm: ' + err.message);
                    resolve({ success: false, error: err.message });
                } finally {
                    setIsProcessing(false);
                }
            };

            // Bắt buộc đẩy chunk cuối cùng trước khi stop
            mediaRecorderRef.current.stop();
        });
    }, [meetingId, meetingTitle]);

    const stopAndUploadRef = useRef(stopAndUpload);
    useEffect(() => { stopAndUploadRef.current = stopAndUpload; }, [stopAndUpload]);

    const isRecordingRef = useRef(isRecording);
    useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

    // Stop mic and interval if the consumer component unmounts mid-recording
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            
            if (isRecordingRef.current) {
                // Tự động upload nếu component unmount (ví dụ: kết thúc cuộc họp)
                stopAndUploadRef.current().catch(console.error);
            } else {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                }
            }
        };
    }, []);

    const addSpeakerMark = useCallback((participant) => {
        if (!isRecording || !startTime) return;
        // Offset phải tính theo thời lượng ĐÃ GHI (trừ các quãng tạm dừng) vì đó mới
        // là trục thời gian của file audio mà BE dùng để khớp mốc vào transcript.
        const offsetSeconds = Math.max(0, getRecordedMs() / 1000);
        
        // Chỉ dựa vào cờ tường minh isExternal — không suy đoán qua role (role hiện là chuỗi
        // tiếng Việt 'Chủ tọa'/'Thành viên'/'Khách mời', không phải mã định danh ổn định).
        const isExternal = participant.isExternal === true || participant.is_external === true;
        const pId = participant.userId || participant.user_id || participant.id;
        
        marksRef.current.push({
            offsetSeconds,
            ...(isExternal ? { externalParticipantId: pId } : { speakerUserId: pId }),
            displayName: participant.fullName || participant.full_name
        });
    }, [isRecording, startTime]);

    return {
        isRecording,
        isPaused,
        isProcessing,
        error,
        recordingTime,
        marksCount: marksRef.current.length,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopAndUpload,
        addSpeakerMark
    };
};
