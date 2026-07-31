import { AlertTriangle, Calendar, CheckCircle, Clock, Download, EyeOff, Film, HardDrive, Info, Play, RefreshCw, Search, Trash2, Video, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getMeetingMediaFiles, 
    getMediaFileSecureDownload,
    getRooms,
    updateMediaVisibility,
    getMeetings
} from '../../service/businessAdminServices';


const RecordingManagement = () => {
    const [recordingsList, setRecordingsList] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filter & Search states
    const [search, setSearch] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination states
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modals
    const [previewVideo, setPreviewVideo] = useState(null); // stores recording session object
    const [deleteTarget, setDeleteTarget] = useState(null); // stores recording session object to delete
    const [isDeleting, setIsDeleting] = useState(false);

    const loadRooms = useCallback(async () => {
        try {
            const res = await getRooms({ limit: 100 });
            if (res?.success) setRooms(res.data || []);
        } catch (err) {
            setError('Lỗi tải danh sách phòng.');
        }
    }, []);

    /**
     * Lấy recordings qua 2 bước:
     * 1. getMeetings() → danh sách cuộc họp
     * 2. getMeetingMediaFiles(meetingId) → media files cho từng meeting
     */
    const fetchRecordingsList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const meetingParams = {
                page,
                limit,
                search: search.trim() || undefined,
                roomId: selectedRoom || undefined,
                status: 'completed'
            };
            const meetingsRes = await getMeetings(meetingParams);
            if (!meetingsRes?.success || !meetingsRes.data?.length) {
                setRecordingsList([]);
                setTotalPages(meetingsRes?.meta?.totalPages || 1);
                setTotalItems(meetingsRes?.meta?.total || 0);
                return;
            }

            const meetings = meetingsRes.data;
            setTotalPages(meetingsRes.meta?.totalPages || 1);
            setTotalItems(meetingsRes.meta?.total || meetings.length);

            // Lấy media files cho từng meeting
            const mediaPromises = meetings.map(async (meeting) => {
                try {
                    const mediaRes = await getMeetingMediaFiles(meeting.id);
                    if (mediaRes?.success && mediaRes.data?.length) {
                        return mediaRes.data.map(file => ({
                            ...file,
                            meetingId: meeting.id,
                            meetingTitle: meeting.title || 'Cuộc họp',
                            roomName: meeting.room?.name || meeting.roomName || '',
                            meetingDate: meeting.startTime || meeting.scheduledStart
                        }));
                    }
                    return [];
                } catch {
                    return [];
                }
            });

            const allMedia = (await Promise.all(mediaPromises)).flat();
            // Lọc theo status hoặc ẩn nếu có
            const filtered = statusFilter
                ? allMedia.filter(f => {
                    if (statusFilter === 'hidden') return f.isActive === false;
                    return f.status === statusFilter;
                  })
                : allMedia;
            setRecordingsList(filtered);
        } catch (err) {
            setError('Lỗi tải danh sách ghi hình từ máy chủ.');
            setRecordingsList([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, selectedRoom, statusFilter]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    useEffect(() => {
        fetchRecordingsList();
    }, [fetchRecordingsList]);

    // Auto-hide success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Visibility Handler — dùng media-files API (Chỉ ẩn 1 chiều)
    const hideRecording = async (rec) => {
        try {
            const res = await updateMediaVisibility(rec.id, { action: 'hide' });
            if (res?.success) {
                setSuccessMessage('Đã ẩn video thành công.');
                fetchRecordingsList();
            } else {
                setError('Lỗi ẩn video.');
            }
        } catch (err) {
            setError('Lỗi kết nối khi ẩn video.');
        }
    };

    // Download Handler — dùng media-files API
    const handleDownload = async (rec) => {
        try {
            const res = await getMediaFileSecureDownload(rec.id);
            if (res?.success && res.data?.downloadUrl) {
                window.open(res.data.downloadUrl, '_blank');
                setSuccessMessage(`Đã tạo liên kết tải xuống cho video: ${rec.meetingTitle}`);
            } else {
                setError('Lỗi không thể tải xuống video này.');
            }
        } catch {
            setError('Lỗi kết nối khi tải xuống video.');
        }
    };

    // Delete Handler
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setError(null);
        try {
            // BE doesn't support hard delete for recordings yet, just simulate or show error
            throw new Error('Tính năng xóa bản ghi hiện không được hỗ trợ bởi hệ thống.');
        } catch (err) {
            setError(err.message || 'Lỗi khi xoá ghi hình.');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    // Helper functions for displaying format
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [
            h > 0 ? h + 'h' : null,
            m > 0 ? m + 'm' : null,
            s > 0 ? s + 's' : null
        ].filter(Boolean).join(' ') || '0s';
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <Film className="w-3.5 h-3.5" />
                        Media Storage
                    </span>
                    <h1 className="text-2xl font-extrabold text-midnight-indigo tracking-tight">Quản lý Ghi hình cuộc họp</h1>
                    <p className="text-slate-blue text-sm">Xem danh sách video ghi hình cuộc họp, phát lại, tải xuống hoặc giải phóng bộ lưu trữ.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchRecordingsList}
                        className="p-2.5 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo rounded-xl hover:bg-cloud-mist transition-colors duration-200"
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Notification messages */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{successMessage}</span>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters panel */}
            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col md:flex-row gap-4 justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-blue" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chủ đề, người tổ chức..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue placeholder:text-slate-blue text-midnight-indigo font-medium"
                        />
                    </div>

                    {/* Room select */}
                    <select
                        value={selectedRoom}
                        onChange={(e) => { setSelectedRoom(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo font-medium"
                    >
                        <option value="">Tất cả phòng họp</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.roomName}</option>
                        ))}
                    </select>

                    {/* Status select */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo font-medium"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="stopped">Hoàn thành (Đầy đủ)</option>
                        <option value="failed">Lỗi ghi hình</option>
                        <option value="hidden">Đã ẩn</option>
                    </select>
                </div>
            </div>

            {/* Main Table view */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                        <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-blue text-xs font-semibold mt-3">Đang tải danh sách ghi hình cuộc họp...</p>
                    </div>
                ) : recordingsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Video className="w-12 h-12 text-platinum-tint mb-3" />
                        <h3 className="text-base font-bold text-midnight-indigo">Không tìm thấy video ghi hình nào</h3>
                        <p className="text-slate-blue text-xs mt-1">Vui lòng thử lại với các tiêu chí tìm kiếm hoặc bộ lọc khác.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-cloud-mist/30 text-xs font-bold text-slate-blue uppercase">
                                    <th className="px-6 py-4">Cuộc họp</th>
                                    <th className="px-6 py-4">Phòng họp</th>
                                    <th className="px-6 py-4">Thời gian ghi</th>
                                    <th className="px-6 py-4">Thời lượng</th>
                                    <th className="px-6 py-4">Kích thước</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-platinum-tint text-sm">
                                {recordingsList.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-cloud-mist/20 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-midnight-indigo">{rec.meetingTitle}</div>
                                            <div className="text-xs text-slate-blue mt-0.5">Người tổ chức: {rec.organizer}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-700">{rec.roomName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-blue">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-blue/70" />
                                                {formatDate(rec.startedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-blue/70" />
                                                {rec.status !== 'failed' && rec.status !== 'FAILED' ? formatDuration(rec.durationSec) : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <HardDrive className="w-3.5 h-3.5 text-slate-blue/70" />
                                                {rec.status !== 'failed' && rec.status !== 'FAILED' ? formatBytes(rec.fileSizeBytes) : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.isActive === false ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                                    Đã ẩn
                                                </span>
                                            ) : (
                                                <>
                                                    {(rec.status === 'stopped' || rec.status === 'COMPLETED') && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                                                            Hoàn thành
                                                        </span>
                                                    )}
                                                    {rec.status === 'recording' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 animate-pulse">
                                                            Đang ghi
                                                        </span>
                                                    )}
                                                    {rec.status === 'paused' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700">
                                                            Tạm dừng
                                                        </span>
                                                    )}
                                                    {(rec.status === 'starting' || rec.status === 'processing') && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700">
                                                            Đang xử lý
                                                        </span>
                                                    )}
                                                    {(rec.status === 'failed' || rec.status === 'FAILED') && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700" title={rec.errorMessage}>
                                                            Thất bại
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {rec.status !== 'failed' && rec.status !== 'FAILED' && (
                                                    <>
                                                        <button
                                                            onClick={() => setPreviewVideo(rec)}
                                                            className="p-1.5 hover:text-action-blue hover:bg-blue-50 text-slate-blue rounded-lg transition-colors"
                                                            title="Phát lại video"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(rec)}
                                                            className="p-1.5 hover:text-green-700 hover:bg-green-50 text-slate-blue rounded-lg transition-colors"
                                                            title="Tải video xuống"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {(rec.status === 'failed' || rec.status === 'FAILED') && rec.errorMessage && (
                                                    <button
                                                        onClick={() => alert(`Lỗi: ${rec.errorMessage}`)}
                                                        className="p-1.5 hover:text-red-700 hover:bg-red-50 text-slate-blue rounded-lg transition-colors"
                                                        title="Xem chi tiết lỗi"
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {rec.isActive !== false && (
                                                    <button
                                                        onClick={() => hideRecording(rec)}
                                                        className="p-1.5 hover:text-amber-600 hover:bg-amber-50 text-slate-blue rounded-lg transition-colors"
                                                        title="Ẩn video"
                                                    >
                                                        <EyeOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteTarget(rec)}
                                                    className="p-1.5 hover:text-red-600 hover:bg-red-50 text-slate-blue rounded-lg transition-colors"
                                                    title="Xoá vĩnh viễn"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {!loading && recordingsList.length > 0 && (
                    <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/20 flex items-center justify-between">
                        <span className="text-xs text-slate-blue">
                            Hiển thị {recordingsList.length} trên tổng số {totalItems} video ghi hình
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-platinum-tint rounded-lg text-xs font-semibold bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1.5 text-xs font-bold text-midnight-indigo">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-platinum-tint rounded-lg text-xs font-semibold bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Video Player Modal (via Portal) */}
            {previewVideo && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl border border-platinum-tint flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-platinum-tint bg-cloud-mist/30">
                            <div>
                                <h3 className="font-extrabold text-midnight-indigo text-base">{previewVideo.meetingTitle}</h3>
                                <p className="text-xs text-slate-blue mt-0.5">Phát ghi hình phòng: {previewVideo.roomName} — {formatDate(previewVideo.startedAt)}</p>
                            </div>
                            <button 
                                onClick={() => setPreviewVideo(null)}
                                className="p-1.5 hover:bg-cloud-mist text-slate-blue hover:text-midnight-indigo rounded-lg transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Video Element */}
                        <div className="bg-black aspect-video flex items-center justify-center relative">
                            {previewVideo.videoUrl ? (
                                <video 
                                    src={previewVideo.videoUrl} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-white text-sm flex flex-col items-center gap-2 p-6">
                                    <AlertTriangle className="w-10 h-10 text-sunset-gold" />
                                    <span>Đường dẫn phát video không tồn tại hoặc đã hết hạn</span>
                                </div>
                            )}
                        </div>
                        {/* Modal Footer actions */}
                        <div className="flex items-center justify-between p-4 border-t border-platinum-tint bg-cloud-mist/10">
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-blue">
                                <span>Kích thước: {formatBytes(previewVideo.fileSizeBytes)}</span>
                                <span>Thời lượng: {formatDuration(previewVideo.durationSec)}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDownload(previewVideo)}
                                    className="px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold hover:bg-glacier-blue flex items-center gap-1.5 shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Tải video
                                </button>
                                <button
                                    onClick={() => setPreviewVideo(null)}
                                    className="px-4 py-2 border border-platinum-tint bg-white text-slate-blue rounded-xl text-xs font-bold hover:bg-cloud-mist"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal (via Portal) */}
            {deleteTarget && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md border border-platinum-tint p-6 space-y-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-midnight-indigo">Xoá vĩnh viễn ghi hình?</h3>
                            <p className="text-xs text-slate-blue leading-relaxed">
                                Bạn có chắc chắn muốn xoá video cuộc họp <span className="font-semibold text-midnight-indigo">"{deleteTarget.meetingTitle}"</span>? 
                                Hành động này không thể hoàn tác và tập tin tương ứng trên lưu trữ đám mây S3 sẽ bị xoá bỏ hoàn toàn.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                disabled={isDeleting}
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist disabled:opacity-50"
                            >
                                Huỷ bỏ
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isDeleting ? 'Đang xoá...' : 'Đồng ý xoá'}
                            </button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default RecordingManagement;
