import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileAudio, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { uploadAudio, createTranscriptionJob } from '../../service/transcriptionServices';

const AudioUploader = ({ meetingId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;
        
        // Cảnh báo nếu > 50MB (50 * 1024 * 1024 bytes)
        if (selectedFile.size > 52428800) {
            setErrorMsg('Dung lượng file vượt quá giới hạn 50MB.');
            setStatus('error');
            return;
        }

        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/aac'];
        // Tạm thời nới lỏng validate mime types vì m4a có thể trả type rỗng
        
        setFile(selectedFile);
        setStatus('idle');
        setErrorMsg('');
    };

    const handleUpload = async () => {
        if (!file || !meetingId) return;

        setStatus('uploading');
        setErrorMsg('');

        try {
            // Bước 1: Upload audio
            const uploadRes = await uploadAudio(meetingId, file);
            if (!uploadRes?.success) {
                throw new Error(uploadRes?.error?.message || uploadRes?.message || 'Lỗi khi tải lên tệp âm thanh.');
            }
            
            const recordingSessionId = uploadRes.data?.recordingSessionId;
            if (!recordingSessionId) throw new Error('Không nhận được phiên ghi âm từ máy chủ.');

            setStatus('processing');

            // Bước 2: Tạo Job Transcription
            const jobRes = await createTranscriptionJob(meetingId, {
                recordingSessionId,
                language: 'vi-VN',
                speakerMappingMode: 'diarization_only'
            });

            if (!jobRes?.success) {
                // Xử lý case bị tắt feature flag 403
                throw new Error(jobRes?.error?.message || jobRes?.message || 'Lỗi khi khởi tạo quá trình xử lý giọng nói.');
            }

            setStatus('success');
            setTimeout(() => {
                onUploadSuccess?.(); // Trigger parent to reload/polling
                setStatus('idle');
                setFile(null);
            }, 2000);

        } catch (err) {
            setStatus('error');
            setErrorMsg(err.message || 'Có lỗi xảy ra trong quá trình xử lý.');
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm-2 rounded-3xl p-6 relative overflow-hidden">
            {/* Nền trang trí */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-action-blue/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            
            <h3 className="text-sm font-bold text-midnight-indigo uppercase tracking-wider flex items-center gap-2 mb-4 relative z-10">
                <UploadCloud className="w-5 h-5 text-action-blue" />
                Cập nhật bản ghi âm
            </h3>

            {/* Vùng kéo thả */}
            <div
                className={`relative z-10 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${
                    isDragging
                        ? 'border-action-blue bg-blue-50/50 scale-[1.02]'
                        : 'border-platinum-tint/80 bg-cloud-mist/40 hover:bg-cloud-mist'
                } ${file ? 'border-none bg-transparent' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                            <UploadCloud className="w-6 h-6 text-slate-blue" />
                        </div>
                        <p className="text-sm font-bold text-midnight-indigo mb-1">
                            Kéo thả file âm thanh vào đây
                        </p>
                        <p className="text-xs text-slate-blue mb-4">
                            Hỗ trợ .mp3, .wav, .m4a (Tối đa 50MB)
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-white border border-platinum-tint shadow-sm rounded-xl text-xs font-bold text-midnight-indigo hover:text-action-blue hover:border-action-blue/30 transition-all"
                        >
                            Chọn File từ máy tính
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="audio/*"
                            className="hidden"
                        />
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-white border border-platinum-tint rounded-2xl p-4 shadow-sm flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                            <FileAudio className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-midnight-indigo truncate">{file.name}</p>
                            <p className="text-xs text-slate-blue">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {status === 'idle' && (
                            <button
                                onClick={() => setFile(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-blue hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Trạng thái Upload & Processing */}
            <AnimatePresence>
                {status !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 relative z-10"
                    >
                        {status === 'uploading' && (
                            <div className="flex flex-col gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center text-xs font-bold text-action-blue">
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải file lên...
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-action-blue rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2, ease: "easeInOut" }} // Fake progress
                                    />
                                </div>
                            </div>
                        )}
                        
                        {status === 'processing' && (
                            <div className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-purple-700">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-xs font-bold">Đang khởi tạo AI xử lý (Speech-to-Text)...</span>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-xl border border-green-100 text-green-700">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-xs font-bold">Khởi tạo thành công! Hệ thống đang tiến hành chuyển đổi.</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex items-start gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100 text-red-700">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-xs font-medium leading-relaxed">{errorMsg}</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nút Thực Hiện */}
            {file && status === 'idle' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex justify-end relative z-10"
                >
                    <button
                        onClick={handleUpload}
                        className="px-6 py-2.5 bg-midnight-indigo hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm transform active:scale-95 flex items-center gap-2"
                    >
                        <UploadCloud className="w-4 h-4" />
                        Tiến hành Upload
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default AudioUploader;
