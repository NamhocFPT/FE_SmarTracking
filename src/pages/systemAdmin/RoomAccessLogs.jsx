import { AlertTriangle, ArrowUpDown, Building, Calendar, CheckCircle2, Clock, DoorOpen, Filter, RotateCw, Search, ShieldAlert, ShieldQuestion, Users, Image as ImageIcon, Eye } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import EventSnapshotModal from '../../component/EventSnapshotModal';
import ThumbnailImage from '../../component/ThumbnailImage';
import UserAvatar from '../../component/UserAvatar';

import {
    getRooms,
    getRoomAccessLog,
    getRoomBookings
} from '../../service/sysAdminServices';
import { getUsers } from '../../service/employeeServices';

const LOGS_PER_PAGE = 10;

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

/**
 * Suy ra trạng thái nhận diện từ 2 field mới của BE (thay cho matchState/isStranger cũ):
 * - isStranger = true  -> hoàn toàn không có userId (người lạ thật sự)
 * - isUnmatched = true -> đã nhận diện được người quen nhưng sai bối cảnh (vd vào nhầm phòng/giờ)
 * - còn lại            -> khớp hợp lệ
 */
const getIdentityStatus = (ev) => {
    if (ev.isStranger) return 'stranger';
    if (ev.isUnmatched) return 'unmatched';
    return 'matched';
};

// Sinh danh sách số trang có rút gọn (vd: 1 ... 4 5 6 ... 42) để không tràn giao diện khi có nhiều trang
const getPageNumbers = (current, total) => {
    const delta = 1;
    const pages = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            pages.push(i);
        }
    }
    const withDots = [];
    let last = null;
    pages.forEach((p) => {
        if (last !== null) {
            if (p - last === 2) withDots.push(last + 1);
            else if (p - last > 1) withDots.push('…');
        }
        withDots.push(p);
        last = p;
    });
    return withDots;
};

const RoomAccessLogs = () => {
    // Rooms and logs data
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedDate, setSelectedDate] = useState(getTodayVNString());
    const [meetings, setMeetings] = useState([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState('');
    const [isMeetingDropdownOpen, setIsMeetingDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMeetingDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Page state
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logsData, setLogsData] = useState(null);

    // UI filters — search giờ gửi lên BE (server-side), direction/trạng thái lọc trong trang hiện tại
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [directionFilter, setDirectionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '' | 'matched' | 'unmatched' | 'stranger'
    const [sortOrder, setSortOrder] = useState('desc'); // default to newest first for security view

    // Pagination — server-side (BE trả data.events theo đúng 1 trang + data.pagination)
    const [currentPage, setCurrentPage] = useState(1);

    // Snapshot Modal State
    const [snapshotEventId, setSnapshotEventId] = useState(null);
    const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

    // Users lookup state for avatars
    const [usersMap, setUsersMap] = useState({});

    // Debounce ô tìm kiếm 400ms trước khi gửi lên BE
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Reset về trang 1 mỗi khi đổi phòng/ngày/từ khóa tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedRoomId, selectedDate, selectedMeetingId, debouncedSearch]);

    // Load available rooms
    const fetchRoomsList = useCallback(async () => {
        setRoomsLoading(true);
        setError(null);
        try {
            const res = await getRooms({ page: 1, limit: 100 });
            if (res?.success && res.data) {
                const roomList = res.data.rooms || res.data || [];
                setRooms(roomList);
                // BE chưa có route tổng hợp "Tất cả phòng họp" (/ivss/access-log luôn 404) — tự chọn
                // sẵn phòng đầu tiên để trang không gọi nhầm vào route chưa tồn tại ngay khi vừa vào trang.
                if (roomList.length > 0) {
                    const firstRoomId = roomList[0].id || roomList[0].roomId;
                    setSelectedRoomId(prev => prev || firstRoomId);
                }
            } else {
                throw new Error(res?.message || 'Không thể tải danh sách phòng họp.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Lỗi hệ thống khi tải danh sách phòng họp.');
        } finally {
            setRoomsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoomsList();
        
        // Fetch all users to create a lookup map for avatars
        const fetchUsersMap = async () => {
            try {
                const res = await getUsers({ limit: 1000 });
                if (res?.success && res.data) {
                    const map = {};
                    res.data.forEach(u => {
                        map[u.id] = u;
                    });
                    setUsersMap(map);
                }
            } catch (err) {
                console.error("Failed to fetch users map:", err);
            }
        };
        fetchUsersMap();
    }, [fetchRoomsList]);

    // Fetch meetings for the selected room and date
    const fetchMeetings = useCallback(async () => {
        if (!selectedRoomId || !selectedDate) {
            setMeetings([]);
            setSelectedMeetingId('');
            return;
        }
        try {
            // Using from and to based on selectedDate
            const from = new Date(`${selectedDate}T00:00:00`).toISOString();
            const to = new Date(`${selectedDate}T23:59:59`).toISOString();
            const res = await getRoomBookings({
                roomId: selectedRoomId,
                from,
                to,
                limit: 100,
                sortOrder: 'asc'
            });
            if (res?.success && res.data) {
                setMeetings(res.data);
            } else {
                setMeetings([]);
            }
        } catch (err) {
            setMeetings([]);
        }
        // Always reset selected meeting when room or date changes
        setSelectedMeetingId('');
    }, [selectedRoomId, selectedDate]);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    // Fetch access logs — server-side pagination + search
    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        setError(null);
        try {
            const res = await getRoomAccessLog(selectedRoomId, selectedDate, {
                page: currentPage,
                limit: LOGS_PER_PAGE,
                search: debouncedSearch || undefined,
                meetingId: selectedMeetingId || undefined
            });
            if (res?.success && res.data) {
                setLogsData(res.data);
            } else {
                throw new Error(res?.message || 'Không thể tải dữ liệu nhật ký ra/vào.');
            }
        } catch (err) {
            // BE hiện chỉ có route theo từng phòng (/ivss/rooms/:roomId/access-log) — route tổng hợp
            // /ivss/access-log ("Tất cả phòng họp") CHƯA được triển khai, sẽ luôn 404 nếu chưa chọn phòng.
            if (!selectedRoomId && (err?.error?.code === 'UNKNOWN_ERROR' || /không tồn tại|not found/i.test(err?.error?.message || ''))) {
                setError('API tổng hợp "Tất cả phòng họp" chưa được Backend triển khai — vui lòng chọn 1 phòng họp cụ thể để xem nhật ký.');
            } else {
                setError(err?.error?.message || err?.message || 'Lỗi khi tải nhật ký ra/vào phòng họp.');
            }
        } finally {
            setLogsLoading(false);
        }
    }, [selectedRoomId, selectedDate, currentPage, debouncedSearch, selectedMeetingId]);

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
    const pagination = logsData?.pagination || {};
    // BE có thể đặt tên field tổng số bản ghi khác nhau tuỳ phiên bản — phòng thủ nhiều tên
    const totalItems = pagination.total ?? pagination.totalItems ?? pagination.totalEvents ?? logsData?.totalEvents ?? events.length;
    const totalPages = pagination.totalPages ?? Math.max(1, Math.ceil(totalItems / LOGS_PER_PAGE));
    const matchedCount = logsData?.matchedCount ?? events.filter(ev => getIdentityStatus(ev) === 'matched').length;
    const unmatchedCount = logsData?.unmatchedCount ?? events.filter(ev => getIdentityStatus(ev) === 'unmatched').length;
    const strangerCount = logsData?.strangerCount ?? events.filter(ev => getIdentityStatus(ev) === 'stranger').length;

    // Direction/trạng thái chỉ lọc trong phạm vi trang hiện tại (BE chưa hỗ trợ 2 filter này ở query param)
    const filteredEvents = events.filter(ev => {
        const matchesDirection = !directionFilter || ev.direction === directionFilter;
        const matchesStatus = !statusFilter || getIdentityStatus(ev) === statusFilter;
        return matchesDirection && matchesStatus;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        const timeA = new Date(a.eventTime || a.timestamp).getTime();
        const timeB = new Date(b.eventTime || b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    const showRoomColumn = !selectedRoomId;
    const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * LOGS_PER_PAGE + 1;
    const rangeEnd = Math.min(currentPage * LOGS_PER_PAGE, totalItems);

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
                            {rooms.map((room, idx) => (
                                <option key={room.id || room.roomId || idx} value={room.id || room.roomId}>
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

                <div className="w-full md:w-1/4 space-y-2">
                    <label className="text-[10px] font-bold text-slate-blue uppercase tracking-wider block">Chọn ca họp</label>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsMeetingDropdownOpen(!isMeetingDropdownOpen)}
                            disabled={!selectedRoomId || meetings.length === 0}
                            className={`w-full pl-9 pr-8 py-2 border rounded-xl text-xs text-left focus:outline-none transition-all flex items-center justify-between ${!selectedRoomId || meetings.length === 0
                                    ? 'bg-slate-50 border-platinum-tint text-slate-400 cursor-not-allowed'
                                    : isMeetingDropdownOpen
                                        ? 'bg-white border-action-blue ring-2 ring-action-blue/20 text-midnight-indigo shadow-sm'
                                        : 'bg-white hover:bg-cloud-mist/30 border-platinum-tint text-midnight-indigo'
                                }`}
                        >
                            <span className="font-semibold truncate">
                                {selectedMeetingId === '' ? 'Toàn bộ ngày' : (() => {
                                    const m = meetings.find(x => (x.meetingId || x.meeting_id || x.id) === selectedMeetingId);
                                    if (!m) return 'Toàn bộ ngày';
                                    const s = formatVietnameseDateTime(m.reservedStartTime || m.reserved_start_time).split(' ')[0].slice(0, 5);
                                    const e = formatVietnameseDateTime(m.reservedEndTime || m.reserved_end_time).split(' ')[0].slice(0, 5);
                                    const title = m.meeting?.title || m.title || 'Ca họp không tên';
                                    return `${s} - ${e} | ${title}`;
                                })()}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-blue absolute right-3 top-2.5 transition-transform duration-200 ${isMeetingDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <Clock className={`w-4 h-4 absolute left-3 top-2.5 pointer-events-none transition-colors ${!selectedRoomId || meetings.length === 0 ? 'text-slate-400' : 'text-action-blue'
                            }`} />

                        {/* Dropdown Menu */}
                        {isMeetingDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1.5 bg-white border border-platinum-tint rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-64 overflow-y-auto py-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedMeetingId('');
                                            setIsMeetingDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-blue-50/50 transition-colors flex items-center gap-2 ${selectedMeetingId === '' ? 'bg-blue-50 text-action-blue' : 'text-midnight-indigo'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedMeetingId === '' ? 'bg-action-blue' : 'bg-transparent'}`}></div>
                                        Toàn bộ ngày
                                    </button>

                                    {meetings.map((meeting) => {
                                        const startTime = formatVietnameseDateTime(meeting.reservedStartTime || meeting.reserved_start_time).split(' ')[0].slice(0, 5);
                                        const endTime = formatVietnameseDateTime(meeting.reservedEndTime || meeting.reserved_end_time).split(' ')[0].slice(0, 5);
                                        const title = meeting.meeting?.title || meeting.title || 'Ca họp không tên';
                                        
                                        // Sử dụng meetingId thay vì id của booking
                                        const targetMeetingId = meeting.meetingId || meeting.meeting_id || meeting.id;
                                        const isSelected = selectedMeetingId === targetMeetingId;

                                        return (
                                            <button
                                                key={meeting.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMeetingId(targetMeetingId);
                                                    setIsMeetingDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2.5 hover:bg-blue-50/50 transition-colors flex items-start gap-2 border-t border-slate-50 first:border-0 ${isSelected ? 'bg-blue-50/80' : ''
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isSelected ? 'bg-action-blue' : 'bg-slate-300'}`}></div>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className={`text-[11px] font-bold ${isSelected ? 'text-action-blue' : 'text-slate-700'}`}>
                                                        {startTime} - {endTime}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium truncate">
                                                        {title}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <button
                        onClick={fetchLogs}
                        disabled={logsLoading}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-action-blue hover:bg-action-blue/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tổng sự kiện */}
                    <div className="bg-white rounded-2xl border border-platinum-tint p-5 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tổng số lượt ra/vào</span>
                            <div className="text-2xl font-bold text-midnight-indigo flex items-baseline gap-1.5">
                                {totalItems}
                                <span className="text-xs font-medium text-slate-blue">lần</span>
                            </div>
                            <p className="text-[10.5px] text-slate-500 font-medium">Ghi nhận qua camera AI trong ngày đã chọn</p>
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
                                <CheckCircle2 className="w-3 h-3" /> Nhận diện đúng người, đúng bối cảnh
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Chưa khớp — người quen nhưng sai bối cảnh (vd vào nhầm phòng/giờ) */}
                    <div className={`bg-white rounded-2xl border p-5 flex items-center justify-between transition-all shadow-sm ${unmatchedCount > 0 ? 'border-amber-300 bg-amber-50/10' : 'border-platinum-tint'
                        }`}>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Chưa khớp bối cảnh</span>
                            <div className={`text-2xl font-bold flex items-baseline gap-1.5 ${unmatchedCount > 0 ? 'text-amber-600' : 'text-midnight-indigo'
                                }`}>
                                {unmatchedCount}
                                <span className="text-xs font-medium text-slate-blue">lần</span>
                            </div>
                            <p className={`text-[10.5px] font-semibold flex items-center gap-0.5 ${unmatchedCount > 0 ? 'text-amber-600' : 'text-slate-500'
                                }`}>
                                <ShieldQuestion className="w-3 h-3" />
                                Người quen nhưng sai phòng/giờ
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${unmatchedCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-cloud-mist text-slate-400'
                            }`}>
                            <ShieldQuestion className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Người lạ thật sự — không có userId */}
                    <div className={`bg-white rounded-2xl border p-5 flex items-center justify-between transition-all shadow-sm ${strangerCount > 0 ? 'border-red-300 bg-red-50/10' : 'border-platinum-tint'
                        }`}>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Người lạ</span>
                            <div className={`text-2xl font-bold flex items-baseline gap-1.5 ${strangerCount > 0 ? 'text-red-600' : 'text-midnight-indigo'
                                }`}>
                                {strangerCount}
                                <span className="text-xs font-medium text-slate-blue">lần</span>
                            </div>
                            <p className={`text-[10.5px] font-semibold flex items-center gap-0.5 ${strangerCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-500'
                                }`}>
                                <AlertTriangle className="w-3 h-3" />
                                {strangerCount > 0 ? 'Cảnh báo: không xác định được danh tính!' : 'Không có bất thường an ninh'}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${strangerCount > 0 ? 'bg-red-100 text-red-600' : 'bg-cloud-mist text-slate-400'
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
                            placeholder="Tìm theo tên người dùng..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
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
                                onChange={(e) => setDirectionFilter(e.target.value)}
                                className="border border-platinum-tint rounded-lg py-1 px-2.5 text-xs text-slate-blue bg-white focus:outline-none"
                            >
                                <option value="">Tất cả hướng</option>
                                <option value="enter">Vào cửa</option>
                                <option value="leave">Ra cửa</option>
                                <option value="seen">Thấy</option>
                            </select>
                        </div>

                        {/* Identity status filter (dựa trên isStranger/isUnmatched) */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-platinum-tint rounded-lg py-1 px-2.5 text-xs text-slate-blue bg-white focus:outline-none"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="matched">Khớp ✓</option>
                            <option value="unmatched">Chưa khớp bối cảnh ⚠</option>
                            <option value="stranger">Người lạ 🚨</option>
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
                <p className="px-5 pt-3 text-[10.5px] text-slate-400 italic">
                    * Bộ lọc "Hướng" và "Trạng thái" chỉ áp dụng trong trang hiện tại (dữ liệu đã phân trang phía máy chủ). Ô tìm kiếm áp dụng trên toàn bộ dữ liệu.
                </p>

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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-cloud-mist border-b border-outline-gray text-slate-blue font-bold">
                                            <th className="p-3.5">Thời điểm (Giờ VN)</th>
                                            <th className="p-3.5">Người</th>
                                            {showRoomColumn && <th className="p-3.5">Phòng họp</th>}
                                            <th className="p-3.5">Hướng</th>
                                            <th className="p-3.5">Trạng thái đối soát</th>
                                            <th className="p-3.5 text-center">Xem ảnh</th>
                                            <th className="p-3.5">Độ tin cậy</th>
                                            <th className="p-3.5">Gắn cuộc họp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedEvents.map((ev) => {
                                            const identityStatus = getIdentityStatus(ev);
                                            const isStranger = identityStatus === 'stranger';
                                            const isUnmatched = identityStatus === 'unmatched';
                                            const isEnter = ev.direction === 'enter';
                                            const isLeave = ev.direction === 'leave';

                                            const formattedName = ev.fullName || 'Không nhận diện được';

                                            return (
                                                <tr
                                                    key={ev.id}
                                                    className={`border-b border-outline-gray hover:bg-cloud-mist/30 transition-colors ${isStranger
                                                            ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500'
                                                            : isUnmatched
                                                                ? 'bg-amber-50/60 hover:bg-amber-100/60 border-l-4 border-l-amber-400'
                                                                : ''
                                                        }`}
                                                >
                                                    {/* Event Time */}
                                                    <td className="p-3.5 font-semibold text-midnight-indigo whitespace-nowrap">
                                                        {formatVietnameseDateTime(ev.eventTime || ev.timestamp)}
                                                    </td>

                                                    {/* Person info */}
                                                    <td className="p-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <UserAvatar 
                                                                user={ev.userId ? usersMap[ev.userId] : null}
                                                                name={formattedName}
                                                                className="w-8 h-8 rounded-full shadow-sm border border-slate-200 flex-shrink-0 text-[10px] font-bold"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold ${isStranger ? 'text-red-700' : isUnmatched ? 'text-amber-700' : 'text-midnight-indigo'
                                                                    }`}>
                                                                    {formattedName}
                                                                </span>
                                                                {ev.userId && (
                                                                    <span className="text-[10px] text-slate-blue font-mono">
                                                                        ID: {ev.userId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Room (chỉ hiện khi đang xem "Tất cả phòng họp") */}
                                                    {showRoomColumn && (
                                                        <td className="p-3.5 font-semibold text-slate-700">
                                                            {ev.roomName || '—'}
                                                        </td>
                                                    )}

                                                    {/* Direction */}
                                                    <td className="p-3.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isEnter
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : isLeave
                                                                    ? 'bg-amber-50 text-amber-700'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {isEnter ? 'Vào' : isLeave ? 'Ra' : 'Thấy'}
                                                        </span>
                                                    </td>

                                                    {/* Identity status (isStranger/isUnmatched) */}
                                                    <td className="p-3.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${isStranger
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : isUnmatched
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                    : 'bg-green-50 text-green-700 border-green-200'
                                                            }`}>
                                                            {isStranger ? '🚨 Người lạ' : isUnmatched ? '⚠ Chưa khớp' : '✓ Khớp'}
                                                        </span>
                                                    </td>

                                                    {/* View Snapshot button */}
                                                    <td className="p-3.5 text-center">
                                                        <ThumbnailImage 
                                                            eventId={ev.id}
                                                            onClick={() => {
                                                                setSnapshotEventId(ev.id);
                                                                setIsSnapshotOpen(true);
                                                            }}
                                                        />
                                                    </td>

                                                    {/* Similarity confidence */}
                                                    <td className="p-3.5 font-mono font-bold text-slate-500">
                                                        {ev.similarity !== null && ev.similarity !== undefined
                                                            ? `${(ev.similarity * 100).toFixed(0)}%`
                                                            : ev.reliability !== null && ev.reliability !== undefined
                                                                ? `${(ev.reliability * 100).toFixed(0)}%`
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
                        </div>
                    )}

                    {/* Pagination — server-side, dùng pagination.totalPages từ BE */}
                    {!logsLoading && totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
                            <span className="text-[11px] text-slate-blue">
                                Hiển thị {rangeStart} - {rangeEnd} trong tổng số {totalItems} lượt nhật ký
                            </span>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                    >
                                        Trước
                                    </button>
                                    {getPageNumbers(currentPage, totalPages).map((p, idx) => (
                                        p === '…' ? (
                                            <span key={`dots-${idx}`} className="px-1 text-[10.5px] text-slate-400 select-none">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                className={`w-7 h-7 rounded-lg text-[10.5px] font-bold transition-all border ${currentPage === p
                                                        ? 'bg-action-blue text-white border-action-blue'
                                                        : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <EventSnapshotModal 
                isOpen={isSnapshotOpen}
                onClose={() => setIsSnapshotOpen(false)}
                eventId={snapshotEventId}
            />
        </div>
    );
};

export default RoomAccessLogs;
