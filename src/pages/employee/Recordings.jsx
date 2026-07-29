import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, FileText, Play, Search, Calendar, User,
    RefreshCw, AlertCircle, CheckCircle, FileAudio,
    FolderOpen, WifiOff
} from 'lucide-react';
import { getMySchedule, getMeetingMediaFiles } from '../../service/employeeServices';

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

    /**
     * FE-4: Lấy recordings qua 2 bước:
     * 1. getMySchedule() → danh sách cuộc họp đã qua
     * 2. getMeetingMediaFiles(meetingId) → media files cho từng meeting
     */
    const fetchRecordingsData = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // Bước 1: Lấy lịch cuộc họp đã qua
            const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const defaultTo = new Date().toISOString().split('T')[0];
            const fromStr = `${startDate || defaultFrom}T00:00:00+07:00`;
            const toStr = `${endDate || defaultTo}T23:59:59+07:00`;

            // Gửi đúng hợp đồng /me/schedule
            // - view: 'month' (bắt buộc)
            // - status: ['completed', 'completed'] (phải là array để pass IsEnum({each:true}) tránh lỗi Express parsing)
            const scheduleParams = {
                from: fromStr,
                to: toStr,
                view: 'month',
                status: ['completed', 'completed']
            };
            const scheduleRes = await getMySchedule(scheduleParams);
            
            const meetings = scheduleRes.data?.items || scheduleRes.data || [];
            if (!scheduleRes?.success || !meetings.length) {
                setRecordings([]);
                return;
            }

            // Bước 2: Lấy media-files cho từng meeting
            const mediaPromises = meetings.map(async (meeting) => {
                const actualMeetingId = meeting.meetingId || meeting.id;
                if (!actualMeetingId) return null;
                try {
                    const mediaRes = await getMeetingMediaFiles(actualMeetingId);
                    if (mediaRes?.success && mediaRes.data?.length > 0) {
                        return {
                            meetingId: actualMeetingId,
                            meetingTitle: meeting.title || meeting.subject || 'Cuộc họp không có tiêu đề',
                            roomName: meeting.room?.roomName || meeting.roomName || meeting.room?.name || '—',
                            hostName: meeting.organizerName || meeting.organizer?.fullName || '—',
                            startTime: meeting.startTime || meeting.scheduledStart,
                            durationMinutes: meeting.durationMinutes || null,
                            mediaFiles: mediaRes.data
                        };
                    }
                    return null;
                } catch {
                    return null; // Skip meetings where media fails
                }
            });

            const results = await Promise.all(mediaPromises);
            setRecordings(results.filter(Boolean));
        } catch (err) {
            setErrorMsg('Không thể tải danh sách bản ghi cuộc họp. Vui lòng thử lại.');
            setRecordings([]);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

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
            const timer = setTimeout(() => setErrorMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    /**
     * FE-4: Playback dùng /media-files/:fileId/playback (stream)
     * Gắn trực tiếp vào <video src> hoặc window.open
     */
    const handlePlayback = (fileId, fileType) => {
        if (!fileId) {
            setErrorMsg('Tệp tin này hiện không khả dụng.');
            return;
        }
        // Stream URL — gắn trực tiếp, KHÔNG parse JSON
        const playbackUrl = `/api/v1/media-files/${fileId}/playback`;
        if (fileType === 'video' || fileType === 'audio') {
            window.open(playbackUrl, '_blank');
            setSuccessMsg(`Đang mở ${fileType === 'video' ? 'video' : 'audio'}...`);
        } else {
            // Transcript / document download
            window.open(playbackUrl, '_blank');
            setSuccessMsg(`Đang tải xuống tệp...`);
        }
    };

    // Filter recordings locally
    const filteredRecordings = recordings.filter(rec => {
        const title = rec.meetingTitle || '';
        const room = rec.roomName || '';
        const matchQuery = searchQuery.trim() === '' || 
            title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            room.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchRoom = selectedRoom ? room === selectedRoom : true;

        return matchQuery && matchRoom;
    });

    const uniqueRooms = Array.from(new Set(recordings.map(r => r.roomName).filter(Boolean)));

    // Helper to categorize media files
    const getFileByType = (mediaFiles, type) => {
        return mediaFiles?.find(f => 
            f.fileType?.toLowerCase().includes(type) || 
            f.type?.toLowerCase().includes(type) ||
            f.mimeType?.toLowerCase().includes(type)
        );
    };

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
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3"
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
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3"
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
                /* Skeleton Loading State */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-platinum-tint shadow-sm p-5 animate-pulse space-y-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                                <div className="h-4 w-16 bg-slate-100 rounded" />
                            </div>
                            <div className="h-5 w-full bg-slate-200 rounded" />
                            <div className="space-y-2 pt-2 border-t border-platinum-tint/40">
                                <div className="h-3 w-32 bg-slate-100 rounded" />
                                <div className="h-3 w-28 bg-slate-100 rounded" />
                            </div>
                            <div className="h-8 w-full bg-slate-200 rounded-xl" />
                            <div className="grid grid-cols-3 gap-2">
                                <div className="h-10 bg-slate-100 rounded-xl" />
                                <div className="h-10 bg-slate-100 rounded-xl" />
                                <div className="h-10 bg-slate-100 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredRecordings.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16 bg-white rounded-2xl border border-platinum-tint shadow-sm space-y-3">
                    <FolderOpen className="w-10 h-10 mx-auto text-platinum-tint" />
                    <h3 className="text-sm font-bold text-midnight-indigo">Không tìm thấy bản ghi</h3>
                    <p className="text-xs text-slate-blue max-w-sm mx-auto">
                        {errorMsg 
                            ? 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.'
                            : 'Không tìm thấy tài liệu cuộc họp nào khớp với bộ lọc tìm kiếm hoặc bạn chưa tham gia cuộc họp nào có bản ghi.'
                        }
                    </p>
                    <button
                        onClick={fetchRecordingsData}
                        className="mt-2 px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold hover:bg-glacier-blue transition-colors inline-flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Tải lại
                    </button>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredRecordings.map(rec => {
                        const recDate = rec.startTime ? new Date(rec.startTime) : null;
                        const displayDate = recDate ? recDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
                        const displayTime = recDate ? recDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
                        
                        const videoFile = getFileByType(rec.mediaFiles, 'video');
                        const audioFile = getFileByType(rec.mediaFiles, 'audio');
                        const transcriptFile = getFileByType(rec.mediaFiles, 'text') || getFileByType(rec.mediaFiles, 'transcript') || getFileByType(rec.mediaFiles, 'document');

                        return (
                            <motion.div
                                key={rec.meetingId}
                                variants={itemVariants}
                                className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 hover:shadow-md hover:border-action-blue/20 transition-all p-5 flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-150">
                                            {rec.roomName}
                                        </span>
                                        {rec.durationMinutes && (
                                            <span className="text-[10.5px] font-mono text-slate-blue font-semibold">
                                                {rec.durationMinutes} phút
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-midnight-indigo text-sm sm:text-base leading-snug line-clamp-2">
                                        {rec.meetingTitle}
                                    </h3>

                                    <div className="space-y-1.5 pt-1.5 border-t border-platinum-tint/40 text-xs text-slate-blue font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-action-blue shrink-0" />
                                            <span>{displayDate} {displayTime ? `(${displayTime})` : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-action-blue shrink-0" />
                                            <span>Chủ trì: <strong>{rec.hostName}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-action-blue shrink-0" />
                                            <span>{rec.mediaFiles?.length || 0} tệp đính kèm</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    {/* Action button 1: view meeting details */}
                                    <button
                                        onClick={() => navigate(`/employee/meeting/${rec.meetingId}`)}
                                        className="w-full py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-white" /> Xem trực tiếp & Transcript
                                    </button>

                                    {/* Download tools split */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handlePlayback(videoFile?.id || videoFile?.fileId, 'video')}
                                            disabled={!videoFile || downloadingId !== null}
                                            className="py-1.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title={videoFile ? `Phát Video` : 'Không có video'}
                                        >
                                            <Video className="w-3.5 h-3.5 text-purple-600" />
                                            <span>Video</span>
                                        </button>

                                        <button
                                            onClick={() => handlePlayback(audioFile?.id || audioFile?.fileId, 'audio')}
                                            disabled={!audioFile || downloadingId !== null}
                                            className="py-1.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title={audioFile ? `Phát Audio` : 'Không có audio'}
                                        >
                                            <FileAudio className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Audio</span>
                                        </button>

                                        <button
                                            onClick={() => handlePlayback(transcriptFile?.id || transcriptFile?.fileId, 'transcript')}
                                            disabled={!transcriptFile || downloadingId !== null}
                                            className="py-1.5 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title={transcriptFile ? `Tải Transcript` : 'Không có transcript'}
                                        >
                                            <FileText className="w-3.5 h-3.5 text-blue-600" />
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
