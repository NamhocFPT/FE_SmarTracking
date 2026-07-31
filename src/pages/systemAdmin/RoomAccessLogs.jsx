import { AlertTriangle, ArrowUpDown, Building, Calendar, CheckCircle2, Clock, DoorOpen, Filter, RotateCw, Search, ShieldAlert, Users } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { 
    getRooms, 
    getRoomAccessLog 
} from '../../service/sysAdminServices';


const formatVietnameseDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        }) + ' ' + date.toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch (e) {
        return '—';
    }
};

const getTodayVNString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset(); // in minutes
    // VN is UTC+7
    const vnTime = new Date(d.getTime() + (7 * 60 + offset) * 60 * 1000);
    const year = vnTime.getFullYear();
    const month = String(vnTime.getMonth() + 1).padStart(2, '0');
    const day = String(vnTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const RoomAccessLogs = () => {
    // Rooms and logs data
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedDate, setSelectedDate] = useState(getTodayVNString());
    
    // Page state
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logsData, setLogsData] = useState(null);
    
    // UI filters
    const [searchTerm, setSearchTerm] = useState('');
    const [directionFilter, setDirectionFilter] = useState('');
    const [matchFilter, setMatchFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // default to newest first for security view

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Load available rooms
    const fetchRoomsList = useCallback(async () => {
        setRoomsLoading(true);
        setError(null);
        try {
            const res = await getRooms({ page: 1, limit: 100 });
            if (res?.success && res.data) {
                const roomList = res.data.rooms || res.data || [];
                setRooms(roomList);
                if (roomList.length > 0) {
                    // Look for room A102 in the list, or default to the first one
                    const defaultRoom = roomList.find(r => r.roomName?.includes('A102') || r.id === '097cf988-8976-42d9-a83d-e5a0013022d9') || roomList[0];
                    setSelectedRoomId(defaultRoom.id);
                }
            } else {
                throw new Error(res?.message || 'Không thể tải danh sách phòng họp.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống khi tải danh sách phòng họp.');
        } finally {
            setRoomsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoomsList();
    }, [fetchRoomsList]);

    // Fetch access logs
    const fetchLogs = useCallback(async () => {
        if (!selectedRoomId) return;
        setLogsLoading(true);
        setError(null);
        try {
            const res = await getRoomAccessLog(selectedRoomId, selectedDate);
            if (res?.success && res.data) {
                setLogsData(res.data);
                setCurrentPage(1); // Reset page on query reload
            } else {
                throw new Error(res?.message || 'Không thể tải dữ liệu nhật ký ra/vào.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi khi tải nhật ký ra/vào phòng họp.');
        } finally {
            setLogsLoading(false);
        }
    }, [selectedRoomId, selectedDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (roomsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <RotateCw className="w-8 h-8 text-action-blue animate-spin" />
                <p className="text-slate-blue text-sm font-semibold">Đang tải danh sách phòng họp...</p>
            </div>
        );
    }

    const events = logsData?.events || [];
    const matchedCount = logsData?.matchedCount ?? 0;
    const unmatchedCount = logsData?.unmatchedCount ?? 0;
    const totalEvents = logsData?.totalEvents ?? events.length;

    // Filter events
    const filteredEvents = events.filter(ev => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            (ev.fullName?.toLowerCase().includes(term) || '') ||
            (ev.userId?.toLowerCase().includes(term) || '') ||
            (ev.meetingId?.toLowerCase().includes(term) || '');
            
        const matchesDirection = !directionFilter || ev.direction === directionFilter;
        const matchesMatchState = !matchFilter || ev.matchState === matchFilter;

        return matchesSearch && matchesDirection && matchesMatchState;
    });

    // Sort events (by time)
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        const timeA = new Date(a.eventTime).getTime();
        const timeB = new Date(b.eventTime).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // Paginate
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedEvents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

    return (
        <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Header Title */}
            <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                    <DoorOpen className="w-3.5 h-3.5" />
                    Phòng họp
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-midnight-indigo flex items-center gap-2">
                    <ShieldAlert className="w-6.5 h-6.5 text-action-blue" />
                    Nhật ký ra/vào phòng họp
                </h1>
                <p className="text-slate-blue text-xs mt-1">
                    Hệ thống đối soát an ninh ra/vào dựa trên dữ liệu camera AI nhận diện khuôn mặt (IVSS)
                </p>
            </div>

            {/* Filters panel */}
            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex flex-col md:flex-row items-end gap-4">
                <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-[10px] font-bold text-slate-blue uppercase tracking-wider block">Chọn phòng họp</label>
                    <div className="relative">
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue bg-cloud-mist/10 text-midnight-indigo font-semibold appearance-none"
                        >
                            <option value="">-- Chọn phòng họp --</option>
                            {rooms.map((room, idx) => (
                                <option key={room.id || idx} value={room.id}>
                                    {room.roomName || room.room_name} {(room.siteName || room.site_name) ? `(${room.siteName || room.site_name})` : ''}
                                </option>
                            ))}
                        </select>
                        <Building className="w-4 h-4 text-slate-blue absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full md:w-1/4 space-y-2">
                    <label className="text-[10px] font-bold text-slate-blue uppercase tracking-wider block">Chọn ngày giám sát</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue bg-cloud-mist/10 text-midnight-indigo font-semibold"
                        />
                        <Calendar className="w-4 h-4 text-slate-blue absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <button 
                        onClick={fetchLogs}
                        disabled={logsLoading}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-action-blue hover:bg-action-blue/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {/* Error block */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button 
                        onClick={fetchLogs}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Khối A - Cards tổng quan an ninh */}
            {!logsLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tổng sự kiện */}
                    <div className="bg-white rounded-2xl border border-platinum-tint p-5 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tổng số lượt ra/vào</span>
                            <div className="text-2xl font-bold text-midnight-indigo flex items-baseline gap-1.5">
                                {totalEvents}
                                <span className="text-xs font-medium text-slate-blue">lần</span>
                            </div>
                            <p className="text-[10.5px] text-slate-500 font-medium">Ghi nhận qua camera AI hôm nay</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-action-blue flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Hợp lệ */}
                    <div className="bg-white rounded-2xl border border-platinum-tint p-5 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Lượt ra/vào hợp lệ</span>
                            <div className="text-2xl font-bold text-midnight-indigo flex items-baseline gap-1.5">
                                {matchedCount}
                                <span className="text-xs font-medium text-slate-blue">lần</span>
                            </div>
                            <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Nhân sự trong lịch họp
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Chưa khớp/Người lạ (Highlight đỏ nếu unmatchedCount > 0) */}
                    <div className={`bg-white rounded-2xl border p-5 flex items-center justify-between transition-all shadow-sm ${
                        unmatchedCount > 0 ? 'border-red-300 bg-red-50/10' : 'border-platinum-tint'
                    }`}>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Chưa khớp hoặc Người lạ</span>
                            <div className={`text-2xl font-bold flex items-baseline gap-1.5 ${
                                unmatchedCount > 0 ? 'text-red-600' : 'text-midnight-indigo'
                            }`}>
                                {unmatchedCount}
                                <span className="text-xs font-medium text-slate-blue">lần</span>
                            </div>
                            <p className={`text-[10.5px] font-semibold flex items-center gap-0.5 ${
                                unmatchedCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-500'
                            }`}>
                                <AlertTriangle className="w-3 h-3" /> 
                                {unmatchedCount > 0 ? 'Cảnh báo: Có người lạ/vào ngoài lịch!' : 'Không có bất thường an ninh'}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            unmatchedCount > 0 ? 'bg-red-100 text-red-600' : 'bg-cloud-mist text-slate-400'
                        }`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            )}

            {/* Khối B - Bảng nhật ký chi tiết */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 overflow-hidden">
                {/* Search & filters bar */}
                <div className="p-5 border-b border-platinum-tint flex flex-col md:flex-row items-center justify-between gap-4 bg-cloud-mist/10">
                    <div className="w-full md:w-80 relative">
                        <input
                            type="text"
                            placeholder="Tìm theo tên người, ID, mã cuộc họp..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue bg-white"
                        />
                        <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Direction Filter */}
                        <div className="flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-blue" />
                            <select
                                value={directionFilter}
                                onChange={(e) => {
                                    setDirectionFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border border-platinum-tint rounded-lg py-1 px-2.5 text-xs text-slate-blue bg-white focus:outline-none"
                            >
                                <option value="">Tất cả hướng</option>
                                <option value="enter">Vào cửa</option>
                                <option value="leave">Ra cửa</option>
                                <option value="seen">Thấy</option>
                            </select>
                        </div>

                        {/* Match State Filter */}
                        <select
                            value={matchFilter}
                            onChange={(e) => {
                                setMatchFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-platinum-tint rounded-lg py-1 px-2.5 text-xs text-slate-blue bg-white focus:outline-none"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="matched">Khớp ✓</option>
                            <option value="unmatched_identity">Sai danh tính ⚠</option>
                            <option value="unmatched_location">Sai vị trí ⚠</option>
                        </select>

                        {/* Date sorting toggle */}
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="inline-flex items-center gap-1 border border-platinum-tint hover:bg-cloud-mist rounded-lg py-1 px-2.5 text-xs text-slate-blue bg-white"
                            title="Đổi chiều sắp xếp thời gian"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            Sắp xếp: {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                        </button>
                    </div>
                </div>

                {/* Table wrapper */}
                <div className="p-5">
                    {logsLoading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-pale-gray rounded-xl w-full"></div>
                            ))}
                        </div>
                    ) : sortedEvents.length === 0 ? (
                        <div className="p-12 text-center text-slate-blue">
                            <div className="flex flex-col items-center gap-3">
                                <Users className="w-12 h-12 text-steel-gray" />
                                <h3 className="font-bold text-midnight-indigo">Không có dữ liệu nhật ký</h3>
                                <p className="text-xs text-slate-blue/80 max-w-sm">
                                    Không ghi nhận sự kiện ra/vào nào trong ngày đã chọn hoặc bộ lọc quá hẹp.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-outline-gray rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-cloud-mist border-b border-outline-gray text-slate-blue font-bold">
                                        <th className="p-3.5">Thời điểm (Giờ VN)</th>
                                        <th className="p-3.5">Người</th>
                                        <th className="p-3.5">Hướng</th>
                                        <th className="p-3.5">Trạng thái đối soát</th>
                                        <th className="p-3.5">Độ tin cậy</th>
                                        <th className="p-3.5">Gắn cuộc họp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((ev) => {
                                        const isStranger = ev.isStranger === true;
                                        const isEnter = ev.direction === 'enter';
                                        const isLeave = ev.direction === 'leave';
                                        
                                        const formattedName = ev.fullName || 'Không nhận diện được';

                                        return (
                                            <tr 
                                                key={ev.id}
                                                className={`border-b border-outline-gray hover:bg-cloud-mist/30 transition-colors ${
                                                    isStranger 
                                                        ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500' 
                                                        : ''
                                                }`}
                                            >
                                                {/* Event Time */}
                                                <td className="p-3.5 font-semibold text-midnight-indigo">
                                                    {formatVietnameseDateTime(ev.eventTime)}
                                                </td>

                                                {/* Person info */}
                                                <td className="p-3.5">
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${
                                                            isStranger ? 'text-red-700' : 'text-midnight-indigo'
                                                        }`}>
                                                            {formattedName}
                                                        </span>
                                                        {ev.userId && (
                                                            <span className="text-[10px] text-slate-blue font-mono">
                                                                ID: {ev.userId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Direction */}
                                                <td className="p-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        isEnter 
                                                            ? 'bg-emerald-50 text-emerald-700' 
                                                            : isLeave 
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {isEnter ? 'Vào' : isLeave ? 'Ra' : 'Thấy'}
                                                    </span>
                                                </td>

                                                {/* Match state status */}
                                                <td className="p-3.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        ev.matchState === 'matched'
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {ev.matchState === 'matched' ? '✓ Khớp' : '⚠ Chưa khớp'}
                                                    </span>
                                                </td>

                                                {/* Similarity confidence */}
                                                <td className="p-3.5 font-mono font-bold text-slate-500">
                                                    {ev.similarity !== null && ev.similarity !== undefined
                                                        ? `${(ev.similarity * 100).toFixed(0)}%`
                                                        : '—'}
                                                </td>

                                                {/* Meeting Code */}
                                                <td className="p-3.5 font-mono text-slate-600 font-semibold">
                                                    {ev.meetingId ? (
                                                        <span className="text-action-blue cursor-pointer hover:underline" title="ID cuộc họp">
                                                            {ev.meetingId.substring(0, 8)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!logsLoading && totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4">
                            <span className="text-[11px] text-slate-blue">
                                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedEvents.length)} trong tổng số {sortedEvents.length} lượt nhật ký
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
        </div>
    );
};

export default RoomAccessLogs;
