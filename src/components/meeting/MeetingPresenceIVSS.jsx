import { useState, useEffect, useCallback } from 'react';
import { 
    getMeetingPresence, 
    getUserPresence, 
    getMeetingPresenceReport 
} from '../../service/managerServices';
import { 
    Users, 
    Clock, 
    AlertTriangle, 
    Search, 
    FileText, 
    Download, 
    Activity, 
    CheckCircle2, 
    XCircle,
    ArrowUpDown,
    ChevronRight,
    RefreshCw
} from 'lucide-react';

const formatDuration = (ms) => {
    if (!ms || ms <= 0) return '0 giây';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min > 0) {
        return `${min} phút ${sec} giây`;
    }
    return `${sec} giây`;
};

const formatVietnameseTime = (isoString) => {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch (e) {
        return '—';
    }
};

const MeetingPresenceIVSS = ({ meetingId, meetingStartTime, meetingEndTime }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [presenceSummary, setPresenceSummary] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('fullName');
    const [sortOrder, setSortOrder] = useState('asc');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Selected user timeline state
    const [selectedUser, setSelectedUser] = useState(null);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [timelineError, setTimelineError] = useState(null);
    const [userTimeline, setUserTimeline] = useState(null);

    // PDF generation/download state
    const [pdfLoading, setPdfLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Show toast message utility
    const triggerToast = (msg, isSuccess = true) => {
        setToastMessage({ text: msg, isSuccess });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSelectedUser(null);
        setUserTimeline(null);
        try {
            const res = await getMeetingPresence(meetingId);
            if (res?.success && res.data) {
                setPresenceSummary(res.data);
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không có dữ liệu hiện diện từ IVSS.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống khi tải dữ liệu hiện diện camera.');
        } finally {
            setLoading(false);
        }
    }, [meetingId]);

    useEffect(() => {
        if (meetingId) {
            fetchSummary();
        }
    }, [meetingId, fetchSummary]);

    // Handle select participant and fetch user timeline
    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setTimelineLoading(true);
        setTimelineError(null);
        setUserTimeline(null);
        try {
            const res = await getUserPresence(meetingId, user.userId);
            if (res?.success && res.data) {
                setUserTimeline(res.data);
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể tải tiến trình chi tiết.');
            }
        } catch (err) {
            setTimelineError(err.message || 'Lỗi khi tải tiến trình của nhân viên.');
        } finally {
            setTimelineLoading(false);
        }
    };

    // PDF Download
    const handleDownloadPDF = async () => {
        setPdfLoading(true);
        try {
            const res = await getMeetingPresenceReport(meetingId);
            // Handle binary response returned from request.js
            const blobData = res?.data || res;
            const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' });
            
            if (blob.size === 0) {
                throw new Error('File PDF trống.');
            }
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bao-cao-hien-dien-${meetingId.substring(0, 8)}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            triggerToast('Đã tải xuống báo cáo hiện diện PDF thành công!');
        } catch (err) {
            triggerToast(err.message || 'Không thể xuất báo cáo PDF. Vui lòng thử lại.', false);
        } finally {
            setPdfLoading(false);
        }
    };

    // Sorting & filtering logic
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-white rounded-2xl border border-platinum-tint p-5 flex flex-col justify-between shadow-sm">
                            <div className="h-4 bg-pale-gray rounded w-1/2"></div>
                            <div className="h-8 bg-pale-gray rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
                {/* Table skeleton */}
                <div className="bg-white rounded-2xl border border-platinum-tint p-6 space-y-4 shadow-sm">
                    <div className="h-8 bg-pale-gray rounded w-1/3"></div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 bg-pale-gray rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex flex-col items-center justify-center text-center gap-3 max-w-xl mx-auto shadow-sm">
                <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Lỗi Tải Dữ Liệu Hiện Diện IVSS</h4>
                <p className="text-xs text-slate-blue max-w-md">{error}</p>
                <button 
                    onClick={fetchSummary}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
            </div>
        );
    }

    const participants = presenceSummary?.participants || [];
    const unmatchedCount = presenceSummary?.meetingUnmatchedIdentityCount ?? 0;

    // Local statistics calculation for Khối A
    const countPresent = participants.filter(p => p.durationMs > 0).length;
    const countAbsent = participants.filter(p => p.durationMs === 0).length;

    // Filter and Sort participants
    const filteredParticipants = participants.filter(p => {
        const term = searchTerm.toLowerCase();
        return (
            p.fullName?.toLowerCase().includes(term) ||
            p.userId?.toLowerCase().includes(term)
        );
    });

    // Detect duplicate fullNames to resolve with short ID
    const nameCounts = {};
    participants.forEach(p => {
        const name = p.fullName || 'Chưa rõ';
        nameCounts[name] = (nameCounts[name] || 0) + 1;
    });

    const sortedParticipants = [...filteredParticipants].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Custom string conversion if necessary
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Paginate items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedParticipants.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedParticipants.length / itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Toast Alerts */}
            {toastMessage && (
                <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                    toastMessage.isSuccess 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {toastMessage.isSuccess ? <CheckCircle2 className="w-4.5 h-4.5" /> : <XCircle className="w-4.5 h-4.5" />}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Khối A - Cards tổng quan đối soát */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dự thật */}
                <div className="bg-white rounded-2xl border border-platinum-tint p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Có mặt thực tế</span>
                        <div className="text-2xl font-bold text-midnight-indigo flex items-baseline gap-1.5">
                            {countPresent}
                            <span className="text-xs font-medium text-slate-blue">người</span>
                        </div>
                        <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Camera nhận diện được
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                {/* Vắng */}
                <div className="bg-white rounded-2xl border border-platinum-tint p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Đăng ký nhưng vắng</span>
                        <div className="text-2xl font-bold text-midnight-indigo flex items-baseline gap-1.5">
                            {countAbsent}
                            <span className="text-xs font-medium text-slate-blue">người</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-medium">Không xuất hiện trước camera</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 text-slate-500 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                {/* Chưa khớp */}
                <div className={`bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all ${
                    unmatchedCount > 0 ? 'border-amber-300 bg-amber-50/10' : 'border-platinum-tint'
                }`}>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Sự kiện chưa khớp</span>
                        <div className="text-2xl font-bold text-midnight-indigo flex items-baseline gap-1.5">
                            {unmatchedCount}
                            <span className="text-xs font-medium text-slate-blue">lần</span>
                        </div>
                        <p className={`text-[10.5px] font-semibold flex items-center gap-0.5 ${
                            unmatchedCount > 0 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                            <AlertTriangle className="w-3 h-3" /> Người lạ hoặc ngoài lịch
                        </p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        unmatchedCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-cloud-mist text-slate-400'
                    }`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Khối B - Danh sách đối soát và Khối D */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 overflow-hidden">
                <div className="p-5 border-b border-platinum-tint flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-cloud-mist/10">
                    <div>
                        <h3 className="text-sm font-bold text-midnight-indigo flex items-center gap-2 uppercase tracking-wide">
                            <Activity className="w-4.5 h-4.5 text-action-blue" />
                            Danh sách đối soát hiện diện phòng họp
                        </h3>
                        <p className="text-[11px] text-slate-blue mt-0.5">
                            So sánh giữa đăng ký tham gia họp và thực tế camera ghi nhận
                        </p>
                    </div>

                    {/* Khối D - PDF Export Button */}
                    <button
                        onClick={handleDownloadPDF}
                        disabled={pdfLoading || participants.length === 0}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-action-blue hover:bg-action-blue/95 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        {pdfLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <FileText className="w-3.5 h-3.5" />
                        )}
                        Tải báo cáo PDF
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Search bar */}
                    <div className="relative max-w-sm">
                        <input
                            type="text"
                            placeholder="Tìm nhân viên theo tên hoặc ID..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset page on filter
                            }}
                            className="w-full pl-9 pr-4 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue bg-cloud-mist/20"
                        />
                        <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                    </div>

                    {/* Table */}
                    <div className="border border-outline-gray rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-cloud-mist border-b border-outline-gray text-slate-blue font-bold">
                                    <th className="p-3.5 cursor-pointer select-none hover:text-midnight-indigo" onClick={() => handleSort('fullName')}>
                                        <span className="flex items-center gap-1">
                                            Nhân viên <ArrowUpDown className="w-3 h-3 text-steel-gray" />
                                        </span>
                                    </th>
                                    <th className="p-3.5 cursor-pointer select-none hover:text-midnight-indigo" onClick={() => handleSort('durationMs')}>
                                        <span className="flex items-center gap-1">
                                            Trạng thái <ArrowUpDown className="w-3 h-3 text-steel-gray" />
                                        </span>
                                    </th>
                                    <th className="p-3.5 cursor-pointer select-none hover:text-midnight-indigo" onClick={() => handleSort('durationMs')}>
                                        <span className="flex items-center gap-1">
                                            Thời lượng có mặt <ArrowUpDown className="w-3 h-3 text-steel-gray" />
                                        </span>
                                    </th>
                                    <th className="p-3.5 cursor-pointer select-none hover:text-midnight-indigo" onClick={() => handleSort('presentRatio')}>
                                        <span className="flex items-center gap-1">
                                            Tỉ lệ hiện diện <ArrowUpDown className="w-3 h-3 text-steel-gray" />
                                        </span>
                                    </th>
                                    <th className="p-3.5 text-center">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((user) => {
                                    const hasDuplicateName = nameCounts[user.fullName || 'Chưa rõ'] > 1;
                                    const displayName = hasDuplicateName 
                                        ? `${user.fullName} (${user.userId?.substring(0, 8)})` 
                                        : (user.fullName || 'Không tên');
                                    
                                    const isPresent = user.durationMs > 0;
                                    const isSelected = selectedUser?.userId === user.userId;

                                    return (
                                        <tr 
                                            key={user.userId} 
                                            onClick={() => handleSelectUser(user)}
                                            className={`border-b border-outline-gray hover:bg-cloud-mist/50 transition-colors cursor-pointer ${
                                                isSelected ? 'bg-blue-50/40 border-l-4 border-l-action-blue' : ''
                                            }`}
                                        >
                                            <td className="p-3.5 font-semibold text-midnight-indigo">
                                                <div className="flex flex-col">
                                                    <span>{displayName}</span>
                                                    <span className="text-[10px] text-slate-blue font-mono">ID: {user.userId}</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    isPresent 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {isPresent ? 'Dự thật ✓' : 'Vắng ✗'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-medium text-midnight-indigo">
                                                {formatDuration(user.durationMs)}
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-blue">
                                                {((user.presentRatio ?? 0) * 100).toFixed(1)}%
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <ChevronRight className={`w-4.5 h-4.5 text-slate-400 mx-auto transition-transform ${
                                                    isSelected ? 'rotate-90 text-action-blue' : ''
                                                }`} />
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredParticipants.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-blue">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-8 h-8 text-steel-gray" />
                                                <p className="font-semibold">Không tìm thấy người dùng phù hợp</p>
                                                <p className="text-[11px] text-slate-blue/80">Vui lòng thay đổi từ khoá tìm kiếm</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[11px] text-slate-blue">
                                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedParticipants.length)} trong tổng số {sortedParticipants.length} nhân viên
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Trước
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-7 h-7 rounded-lg text-[10.5px] font-bold transition-all border ${
                                            currentPage === i + 1 
                                                ? 'bg-action-blue text-white border-action-blue' 
                                                : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Khối C - Timeline chi tiết 1 người (chỉ hiện khi được chọn) */}
            {selectedUser && (
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 overflow-hidden animate-fade-in-up">
                    <div className="p-5 border-b border-platinum-tint bg-cloud-mist/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-midnight-indigo uppercase tracking-wide">
                                Tiến trình ra/vào chi tiết: {selectedUser.fullName}
                            </h3>
                            <p className="text-[11px] text-slate-blue mt-0.5">
                                Bản đồ chi tiết các khoảng thời gian camera nhận diện đối soát
                            </p>
                        </div>
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="text-xs text-slate-blue hover:text-red-500 font-bold border border-platinum-tint px-2.5 py-1 rounded-lg"
                        >
                            Đóng timeline
                        </button>
                    </div>

                    <div className="p-5">
                        {timelineLoading ? (
                            <div className="flex flex-col items-center justify-center p-8 space-y-2">
                                <RefreshCw className="w-6 h-6 text-action-blue animate-spin" />
                                <span className="text-xs text-slate-blue font-semibold">Đang tải dữ liệu tiến trình từ IVSS...</span>
                            </div>
                        ) : timelineError ? (
                            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-150">
                                Lỗi: {timelineError}
                            </div>
                        ) : userTimeline ? (
                            <div className="space-y-6">
                                {/* Duration details sub-header */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-cloud-mist/40 border border-outline-gray rounded-xl">
                                    <div>
                                        <span className="block text-[9.5px] uppercase font-bold text-slate-blue tracking-wider">Tổng thời gian</span>
                                        <span className="text-xs font-bold text-midnight-indigo">{formatDuration(userTimeline.duration?.durationMs)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9.5px] uppercase font-bold text-slate-blue tracking-wider">Số lần thấy mặt</span>
                                        <span className="text-xs font-bold text-midnight-indigo">{userTimeline.duration?.segmentCount || 0} đoạn</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9.5px] uppercase font-bold text-slate-blue tracking-wider">Tỉ lệ tham dự</span>
                                        <span className="text-xs font-bold text-midnight-indigo">{((userTimeline.duration?.presentRatio || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9.5px] uppercase font-bold text-slate-blue tracking-wider">Sự kiện ngoài lịch</span>
                                        <span className={`text-xs font-bold ${userTimeline.unmatchedCount > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                                            {userTimeline.unmatchedCount || 0} lần
                                        </span>
                                    </div>
                                </div>

                                {/* Graphical Timeline */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-blue">BIỂU ĐỒ TRỤC THỜI GIAN HỌP</h4>
                                    
                                    <div className="relative">
                                        {/* Start and end labels */}
                                        <div className="flex justify-between items-center text-[10px] text-slate-blue font-bold pb-2 border-b border-platinum-tint">
                                            <span>Bắt đầu họp: {new Date(meetingStartTime).toLocaleTimeString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit'})}</span>
                                            <span>Kết thúc họp: {new Date(meetingEndTime).toLocaleTimeString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit'})}</span>
                                        </div>

                                        {/* Timeline Bar */}
                                        <div className="mt-4 relative h-8 bg-slate-100 rounded-lg border border-platinum-tint overflow-hidden">
                                            {/* Absent / Gap background is default gray-100 */}
                                            {/* Render Present segments */}
                                            {userTimeline.timeline?.segments?.map((seg, idx) => {
                                                const startMs = new Date(meetingStartTime).getTime();
                                                const endMs = new Date(meetingEndTime).getTime();
                                                const segStartMs = new Date(seg.start).getTime();
                                                const segEndMs = new Date(seg.end).getTime();
                                                const meetingLength = endMs - startMs;

                                                if (meetingLength <= 0) return null;

                                                const left = Math.max(0, Math.min(100, ((segStartMs - startMs) / meetingLength) * 100));
                                                const width = Math.max(0.5, Math.min(100 - left, ((segEndMs - segStartMs) / meetingLength) * 100));

                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{ left: `${left}%`, width: `${width}%` }}
                                                        className="absolute top-0 bottom-0 bg-emerald-500/80 border-x border-emerald-600/30 group cursor-pointer"
                                                        title={`Có mặt: ${formatVietnameseTime(seg.start)} - ${formatVietnameseTime(seg.end)}`}
                                                    >
                                                        {/* Tooltip on hover */}
                                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-slate-900 text-white text-[9.5px] rounded-lg shadow-md whitespace-nowrap z-25">
                                                            Có mặt: {formatVietnameseTime(seg.start)} - {formatVietnameseTime(seg.end)}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Render Event markers */}
                                            {userTimeline.timeline?.events?.map((ev, idx) => {
                                                const startMs = new Date(meetingStartTime).getTime();
                                                const endMs = new Date(meetingEndTime).getTime();
                                                const evMs = new Date(ev.at).getTime();
                                                const meetingLength = endMs - startMs;

                                                if (meetingLength <= 0) return null;

                                                const left = Math.max(0, Math.min(100, ((evMs - startMs) / meetingLength) * 100));
                                                const isEnter = ev.direction === 'enter';

                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{ left: `${left}%` }}
                                                        className="absolute top-0 bottom-0 w-0.5 z-20 group cursor-pointer flex flex-col justify-between"
                                                    >
                                                        {/* Visual Marker line */}
                                                        <div className={`w-px h-full ${isEnter ? 'bg-emerald-600' : 'bg-amber-600'}`}></div>
                                                        
                                                        {/* Arrow icon */}
                                                        <span className={`absolute -top-1.5 -translate-x-1/2 text-[9px] font-bold ${
                                                            isEnter ? 'text-emerald-700' : 'text-amber-700'
                                                        }`}>
                                                            {isEnter ? '▲' : '▼'}
                                                        </span>

                                                        {/* Tooltip */}
                                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 p-1.5 bg-slate-900 text-white text-[9.5px] rounded-lg shadow-md whitespace-nowrap z-30">
                                                            {isEnter ? 'VÀO CỬA' : 'RA CỬA'}: {formatVietnameseTime(ev.at)}
                                                            {ev.similarity ? ` (Độ khớp: ${(ev.similarity * 100).toFixed(0)}%)` : ''}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Legend indicator explaining the chart */}
                                        <div className="flex flex-wrap gap-4 mt-3 text-[10.5px] text-slate-blue font-semibold">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3.5 h-3.5 bg-emerald-500/80 border border-emerald-600/20 rounded-md"></span>
                                                Thời gian có mặt trong phòng
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3.5 h-3.5 bg-slate-100 border border-platinum-tint rounded-md"></span>
                                                Thời gian vắng mặt (Gaps)
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="text-emerald-700 font-bold">▲</span>
                                                Điểm mốc đi VÀO cửa
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="text-amber-700 font-bold">▼</span>
                                                Điểm mốc đi RA cửa
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Event logs list */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Chi tiết các mốc quét camera</h4>
                                    <div className="border border-outline-gray rounded-xl overflow-hidden">
                                        <div className="max-h-40 overflow-y-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-cloud-mist border-b border-outline-gray text-slate-blue font-bold sticky top-0">
                                                        <th className="p-2.5">Thời điểm (Giờ VN)</th>
                                                        <th className="p-2.5">Hướng</th>
                                                        <th className="p-2.5">Độ tin cậy nhận diện</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userTimeline.timeline?.events?.map((ev, idx) => (
                                                        <tr key={idx} className="border-b border-outline-gray hover:bg-cloud-mist/30">
                                                            <td className="p-2.5 font-medium text-midnight-indigo">
                                                                {formatVietnameseTime(ev.at)}
                                                            </td>
                                                            <td className="p-2.5">
                                                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    ev.direction === 'enter' 
                                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                                        : 'bg-amber-50 text-amber-700'
                                                                }`}>
                                                                    {ev.direction === 'enter' ? '▲ Vào phòng' : '▼ Ra khỏi phòng'}
                                                                </span>
                                                            </td>
                                                            <td className="p-2.5 font-mono text-slate-600 font-medium">
                                                                {ev.similarity !== null && ev.similarity !== undefined 
                                                                    ? `${(ev.similarity * 100).toFixed(0)}%` 
                                                                    : '—'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!userTimeline.timeline?.events || userTimeline.timeline.events.length === 0) && (
                                                        <tr>
                                                            <td colSpan="3" className="p-6 text-center text-slate-blue italic">
                                                                Không ghi nhận sự kiện quẹt camera nào.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-blue italic">
                                Chọn nhân viên trong danh sách để hiển thị tiến trình ra vào chi tiết.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingPresenceIVSS;
