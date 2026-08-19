import { useState, useEffect, useRef, useCallback } from 'react';
import { uploadAudio, uploadStationSpeakerMarks } from '../service/transcriptionServices';

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
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const dbRef = useRef(null);
    const streamRef = useRef(null);
    const marksRef = useRef([]); // Lưu các mốc gán tên: { offsetSeconds, speakerUserId/externalParticipantId, displayName }
    const timerRef = useRef(null);

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
            const now = Date.now();
            setStartTime(now);
            marksRef.current = [];
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - now) / 1000));
            }, 1000);

        } catch (err) {
            setError('Lỗi khởi tạo micro (Vui lòng cấp quyền micro): ' + err.message);
        }
    }, []);

    const stopAndUpload = useCallback(async () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return null;

        setIsProcessing(true);
        setError('');

        return new Promise((resolve) => {
            // Stop recording
            mediaRecorderRef.current.onstop = async () => {
                clearInterval(timerRef.current);
                setIsRecording(false);
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
                    
                    // Upload marks nếu có
                    if (marksRef.current.length > 0 && sessionId) {
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
        const offsetSeconds = Math.max(0, (Date.now() - startTime) / 1000);
        
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
        isProcessing,
        error,
        recordingTime,
        marksCount: marksRef.current.length,
        startRecording,
        stopAndUpload,
        addSpeakerMark
    };
};
