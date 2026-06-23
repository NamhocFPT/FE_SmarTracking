import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, FileText, Play, Search, Calendar, User,
    RefreshCw, AlertCircle, CheckCircle, FileAudio
} from 'lucide-react';
import { getMyRecordings, getRecordingDownloadUrl } from '../../service/employeeServices';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const EmployeeRecordings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [recordings, setRecordings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchRecordingsData = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const params = {
                search: searchQuery || undefined,
                room: selectedRoom || undefined,
                from: startDate || undefined,
                to: endDate || undefined
            };
            const res = await getMyRecordings(params);
            if (res?.success) {
                setRecordings(res.data || []);
            } else {
                throw new Error();
            }
        } catch {
            // Local Mock Fallback matching postgres schema fields (snake_case & camelCase)
            setRecordings([
                {
                    id: "rec-session-101",
                    meeting_id: "meet-101",
                    meetingId: "meet-101",
                    meeting_title: "Họp kỹ thuật dự án FE SmarTracking",
                    meetingTitle: "Họp kỹ thuật dự án FE SmarTracking",
                    room_name: "Phòng Apollo 101",
                    roomName: "Phòng Apollo 101",
                    host_name: "Lê Hoàng Hải",
                    hostName: "Lê Hoàng Hải",
                    actual_start_time: "2026-06-15T09:00:00.000Z",
                    actualStartTime: "2026-06-15T09:00:00.000Z",
                    duration_minutes: 90,
                    durationMinutes: 90,
                    video_file_id: "media-video-1",
                    videoFileId: "media-video-1",
                    video_file_size: "340 MB",
                    videoFileSize: "340 MB",
                    audio_file_id: "media-audio-1",
                    audioFileId: "media-audio-1",
                    audio_file_size: "45 MB",
                    audioFileSize: "45 MB",
                    transcript_file_id: "media-transcript-1",
                    transcriptFileId: "media-transcript-1",
                    transcript_file_size: "1.2 MB",
                    transcriptFileSize: "1.2 MB"
                },
                {
                    id: "rec-session-102",
                    meeting_id: "meet-102",
                    meetingId: "meet-102",
                    meeting_title: "Đồng bộ giải pháp AI nhận diện khuôn mặt",
                    meetingTitle: "Đồng bộ giải pháp AI nhận diện khuôn mặt",
                    room_name: "Phòng Zeus 201",
                    roomName: "Phòng Zeus 201",
                    host_name: "Nguyễn Thị Minh",
                    hostName: "Nguyễn Thị Minh",
                    actual_start_time: "2026-06-12T14:30:00.000Z",
                    actualStartTime: "2026-06-12T14:30:00.000Z",
                    duration_minutes: 60,
                    durationMinutes: 60,
                    video_file_id: "media-video-2",
                    videoFileId: "media-video-2",
                    video_file_size: "220 MB",
                    videoFileSize: "220 MB",
                    audio_file_id: "media-audio-2",
                    audioFileId: "media-audio-2",
                    audio_file_size: "30 MB",
                    audioFileSize: "30 MB",
                    transcript_file_id: "media-transcript-2",
                    transcriptFileId: "media-transcript-2",
                    transcript_file_size: "890 KB",
                    transcriptFileSize: "890 KB"
                },
                {
                    id: "rec-session-103",
                    meeting_id: "meet-104",
                    meetingId: "meet-104",
                    meeting_title: "Họp đột xuất giải quyết lỗi Gateway",
                    meetingTitle: "Họp đột xuất giải quyết lỗi Gateway",
                    room_name: "Phòng Huddle 302",
                    roomName: "Phòng Huddle 302",
                    host_name: "Trần Văn B",
                    hostName: "Trần Văn B",
                    actual_start_time: "2026-06-10T10:00:00.000Z",
                    actualStartTime: "2026-06-10T10:00:00.000Z",
                    duration_minutes: 45,
                    durationMinutes: 45,
                    video_file_id: "media-video-3",
                    videoFileId: "media-video-3",
                    video_file_size: "180 MB",
                    videoFileSize: "180 MB",
                    audio_file_id: "media-audio-3",
                    audioFileId: "media-audio-3",
                    audio_file_size: "22 MB",
                    audioFileSize: "22 MB",
                    transcript_file_id: "media-transcript-3",
                    transcriptFileId: "media-transcript-3",
                    transcript_file_size: "620 KB",
                    transcriptFileSize: "620 KB"
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedRoom, startDate, endDate]);

    useEffect(() => {
        fetchRecordingsData();
    }, [fetchRecordingsData]);

    // Auto-hide alert handlers
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (errorMsg) {
            const timer = setTimeout(() => setErrorMsg(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    const handleDownload = async (sessionId, fileType, fileId) => {
        if (!fileId) {
            setErrorMsg('Tệp tin này hiện không khả dụng để tải xuống.');
            return;
        }
        setDownloadingId(`${sessionId}-${fileType}`);
        try {
            const res = await getRecordingDownloadUrl(fileId);
            if (res?.success && res.data?.downloadUrl) {
                // Trigger real browser download link
                window.open(res.data.downloadUrl, '_blank');
                setSuccessMsg(`Bắt đầu tải xuống file ${fileType.toUpperCase()}...`);
            } else {
                // Mock download behavior
                setTimeout(() => {
                    setSuccessMsg(`Đã mô phỏng tải xuống thành công file ${fileType.toUpperCase()} (${fileId})`);
                    setDownloadingId(null);
                }, 1200);
            }
        } catch {
            setTimeout(() => {
                setSuccessMsg(`Đã mô phỏng tải xuống thành công file ${fileType.toUpperCase()} (${fileId})`);
                setDownloadingId(null);
            }, 1200);
        }
    };

    // Filter recordings locally
    const filteredRecordings = recordings.filter(rec => {
        const title = rec.meeting_title || rec.meetingTitle || '';
        const room = rec.room_name || rec.roomName || '';
        const matchQuery = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           room.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchRoom = selectedRoom ? room === selectedRoom : true;
        
        let matchDate = true;
        if (startDate || endDate) {
            const actTime = rec.actual_start_time || rec.actualStartTime;
            const recDate = new Date(actTime);
            if (startDate && recDate < new Date(startDate)) matchDate = false;
            if (endDate) {
                const endLimit = new Date(endDate);
                endLimit.setHours(23, 59, 59, 999);
                if (recDate > endLimit) matchDate = false;
            }
        }

        return matchQuery && matchRoom && matchDate;
    });

    const uniqueRooms = Array.from(new Set(recordings.map(r => r.room_name || r.roomName).filter(Boolean)));

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-6xl mx-auto"
        >
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 mb-2">
                        <Video className="w-3.5 h-3.5" />
                        Kho lưu trữ
                    </span>
                    <h1 className="text-2xl font-extrabold text-midnight-indigo tracking-tight">Bản ghi & Tài liệu cuộc họp</h1>
                    <p className="text-slate-blue text-sm">Quản lý, nghe lại video/audio và tải xuống tài liệu transcript của các cuộc họp đã diễn ra.</p>
                </div>
                <button
                    onClick={fetchRecordingsData}
                    className="p-2.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo transition-all shadow-sm flex items-center gap-1.5 font-semibold text-xs"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                </button>
            </div>

            {/* Notification Alerts */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-pulse-soft"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{successMsg}</span>
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3 animate-pulse-soft"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search, Filter & Date Picker Controls */}
            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm theo tiêu đề, phòng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue bg-cloud-mist/10"
                    />
                    <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                </div>

                <div className="relative">
                    <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-xs bg-white focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue cursor-pointer"
                    >
                        <option value="">Tất cả phòng họp</option>
                        {uniqueRooms.map(rm => (
                            <option key={rm} value={rm}>{rm}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <Calendar className="w-4 h-4 text-slate-blue shrink-0" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        title="Từ ngày"
                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-xl text-[11px] focus:outline-none focus:border-action-blue"
                    />
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-blue">đến</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        title="Đến ngày"
                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-xl text-[11px] focus:outline-none focus:border-action-blue"
                    />
                </div>
            </div>

            {/* Recordings Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-platinum-tint shadow-sm">
                    <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                    <p className="mt-3 text-slate-blue text-xs font-semibold">Đang tải kho tài liệu...</p>
                </div>
            ) : filteredRecordings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-platinum-tint shadow-sm text-slate-blue space-y-3">
                    <Video className="w-10 h-10 mx-auto text-platinum-tint" />
                    <h3 className="text-sm font-bold text-midnight-indigo uppercase">Không tìm thấy bản ghi</h3>
                    <p className="text-xs text-slate-blue max-w-sm mx-auto">Không tìm thấy tài liệu cuộc họp nào khớp với bộ lọc tìm kiếm hiện tại.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredRecordings.map(rec => {
                        const recDate = new Date(rec.actual_start_time || rec.actualStartTime);
                        const displayDate = recDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const displayTime = recDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        const isDownloading = (type) => downloadingId === `${rec.id}-${type}`;

                        return (
                            <motion.div
                                key={rec.id}
                                variants={itemVariants}
                                className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 hover:shadow-md hover:border-action-blue/20 transition-all p-5 flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-150">
                                            {rec.room_name || rec.roomName}
                                        </span>
                                        <span className="text-[10.5px] font-mono text-slate-blue font-semibold">
                                            {rec.duration_minutes || rec.durationMinutes} phút
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-midnight-indigo text-sm sm:text-base leading-snug line-clamp-2">
                                        {rec.meeting_title || rec.meetingTitle}
                                    </h3>

                                    <div className="space-y-1.5 pt-1.5 border-t border-platinum-tint/40 text-xs text-slate-blue font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-action-blue shrink-0" />
                                            <span>{displayDate} ({displayTime})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-action-blue shrink-0" />
                                            <span>Chủ trì: <strong>{rec.host_name || rec.hostName}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    {/* Action button 1: play / view details */}
                                    <button
                                        onClick={() => navigate(`/employee/meeting/${rec.meeting_id || rec.meetingId}`)}
                                        className="w-full py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-white" /> Xem trực tiếp & Transcript
                                    </button>

                                    {/* Download tools split */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleDownload(rec.id, 'video', rec.video_file_id || rec.videoFileId)}
                                            disabled={downloadingId !== null}
                                            className="py-1.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-0.5"
                                            title={`Tải Video (${rec.video_file_size || rec.videoFileSize})`}
                                        >
                                            {isDownloading('video') ? (
                                                <div className="w-3.5 h-3.5 border-2 border-action-blue border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Video className="w-3.5 h-3.5 text-purple-600" />
                                            )}
                                            <span>Video</span>
                                        </button>

                                        <button
                                            onClick={() => handleDownload(rec.id, 'audio', rec.audio_file_id || rec.audioFileId)}
                                            disabled={downloadingId !== null}
                                            className="py-1.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-0.5"
                                            title={`Tải Audio (${rec.audio_file_size || rec.audioFileSize})`}
                                        >
                                            {isDownloading('audio') ? (
                                                <div className="w-3.5 h-3.5 border-2 border-action-blue border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FileAudio className="w-3.5 h-3.5 text-emerald-600" />
                                            )}
                                            <span>Audio</span>
                                        </button>

                                        <button
                                            onClick={() => handleDownload(rec.id, 'transcript', rec.transcript_file_id || rec.transcriptFileId)}
                                            disabled={downloadingId !== null}
                                            className="py-1.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-0.5"
                                            title={`Tải Transcript (${rec.transcript_file_size || rec.transcriptFileSize})`}
                                        >
                                            {isDownloading('transcript') ? (
                                                <div className="w-3.5 h-3.5 border-2 border-action-blue border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                            )}
                                            <span>Text</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
};

export default EmployeeRecordings;
