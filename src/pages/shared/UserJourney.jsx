import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Calendar, User, Car, Eye, MapPin, 
    AlertCircle, RefreshCw, CalendarCheck, Search,
    ArrowUpRight, ArrowDownLeft, Check,
    Clock, Sparkles
} from 'lucide-react';
import { getUsers } from '../../service/businessAdminServices';
import { getUserJourney } from '../../service/campusService';

const UserJourney = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // States
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    
    // Date: Default to today in VN time (GMT+7)
    const getVNTodayString = () => {
        const now = new Date();
        // Convert to VN timezone offset
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        return vnTime.toISOString().split('T')[0];
    };
    const [date, setDate] = useState(searchParams.get('date') || getVNTodayString());
    
    // Journey Data
    const [journeyData, setJourneyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const dropdownRef = useRef(null);

    // Initial user ID from URL
    const urlUserId = searchParams.get('userId');

    // Fetch user list (searchable)
    const fetchUsers = useCallback(async (query = '') => {
        setUsersLoading(true);
        try {
            const res = await getUsers({ search: query || undefined, limit: 15 });
            if (res?.success) {
                setUsers(res.data || []);
                
                // If there's an initial userId from URL and we haven't selected a user yet
                if (urlUserId && !selectedUser) {
                    const match = (res.data || []).find(u => u.id === urlUserId || u.uuid === urlUserId);
                    if (match) {
                        setSelectedUser(match);
                        setSearchQuery(match.fullName);
                    } else if (urlUserId) {
                        // Fallback: fetch specific user if not in list
                        try {
                            const singleUserRes = await getUsers({ id: urlUserId });
                            if (singleUserRes?.success && singleUserRes.data?.length > 0) {
                                setSelectedUser(singleUserRes.data[0]);
                                setSearchQuery(singleUserRes.data[0].fullName);
                            }
                        } catch (err) {
                            console.error('Lỗi tải thông tin user từ URL:', err);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Không thể tải danh sách người dùng:', err);
        } finally {
            setUsersLoading(false);
        }
    }, [urlUserId, selectedUser]);

    // Handle search input change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchUsers]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load Journey Data
    const fetchJourney = useCallback(async () => {
        if (!selectedUser) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getUserJourney({ 
                userId: selectedUser.id || selectedUser.uuid, 
                date 
            });
            if (res?.success) {
                setJourneyData(res.data);
                // Sync to URL
                setSearchParams({ 
                    userId: selectedUser.id || selectedUser.uuid, 
                    date 
                });
            } else {
                setError(res?.message || 'Không thể tải hành trình di chuyển.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi kết nối khi tải hành trình.');
        } finally {
            setLoading(false);
        }
    }, [selectedUser, date, setSearchParams]);

    // Trigger load journey on date or selected user change
    useEffect(() => {
        if (selectedUser) {
            fetchJourney();
        } else {
            setJourneyData(null);
        }
    }, [selectedUser, date, fetchJourney]);

    // Helper: Convert UTC timestamp to VN Local Time string (HH:MM)
    const formatToVNTime = (utcString) => {
        if (!utcString) return '';
        const utcDate = new Date(utcString);
        // Vietnam is UTC+7
        const vnDate = new Date(utcDate.getTime());
        const hh = String(vnDate.getHours()).padStart(2, '0');
        const mm = String(vnDate.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    // Helper: format full VN Datetime for tooltip
    const formatVNFullDateTime = (utcString) => {
        if (!utcString) return '';
        const d = new Date(utcString);
        return d.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    // Render Event details / styling
    const renderEventIcon = (event) => {
        const type = (event.type || '').toLowerCase();
        const dir = (event.direction || '').toLowerCase();
        
        switch (type) {
            case 'gate':
                if (dir === 'enter') {
                    return (
                        <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center shadow-sm">
                            <ArrowDownLeft className="w-5 h-5 absolute -top-1 -left-1 bg-green-600 text-white rounded-full p-0.5 border border-white" />
                            <Car className="w-5 h-5" />
                        </div>
                    );
                } else {
                    return (
                        <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shadow-sm">
                            <ArrowUpRight className="w-5 h-5 absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-0.5 border border-white" />
                            <Car className="w-5 h-5" />
                        </div>
                    );
                }
            case 'meeting':
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-action-blue flex items-center justify-center shadow-sm">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                );
            case 'zone':
                return (
                    <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 text-royal-amethyst flex items-center justify-center shadow-sm">
                        <Eye className="w-5 h-5" />
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-slate-blue flex items-center justify-center shadow-sm">
                        <MapPin className="w-5 h-5" />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in-up">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-action-blue/10 text-action-blue rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Hành trình khuôn viên</h1>
                        <p className="text-slate-blue text-sm mt-0.5">Theo dõi lịch trình hoạt động tổng hợp của một nhân viên trong ngày.</p>
                    </div>
                </div>
                
                {selectedUser && (
                    <button
                        onClick={fetchJourney}
                        disabled={loading}
                        className="self-start md:self-auto p-2.5 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist disabled:opacity-50 rounded-xl transition-all shadow-sm"
                        title="Tải lại dữ liệu hành trình"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {/* Filter controls */}
            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* User Selection */}
                    <div className="space-y-1.5 relative" ref={dropdownRef}>
                        <label className="text-xs font-bold text-slate-blue uppercase tracking-wider block">Chọn Nhân viên *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-blue">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc email nhân viên..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                    if (selectedUser && selectedUser.fullName !== e.target.value) {
                                        setSelectedUser(null);
                                    }
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full pl-9 pr-9 py-2.5 bg-cloud-mist border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedUser(null);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-blue hover:text-midnight-indigo text-xs font-medium"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>

                        {/* Dropdown Options */}
                        {isDropdownOpen && (
                            <div className="absolute z-20 w-full mt-1.5 bg-white border border-platinum-tint rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-platinum-tint/40">
                                {usersLoading && users.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-blue flex items-center justify-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-action-blue" />
                                        Đang tìm kiếm...
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-blue">
                                        Không tìm thấy nhân viên nào
                                    </div>
                                ) : (
                                    users.map((u) => {
                                        const isSelected = selectedUser && (selectedUser.id === u.id || selectedUser.uuid === u.uuid);
                                        return (
                                            <div
                                                key={u.id || u.uuid}
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setSearchQuery(u.fullName);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`px-4 py-2.5 hover:bg-cloud-mist cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <div>
                                                    <div className="text-sm font-bold text-midnight-indigo">{u.fullName}</div>
                                                    <div className="text-xs text-slate-blue">{u.email}</div>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4 text-action-blue font-bold" />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-blue uppercase tracking-wider block">Chọn Ngày *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-blue">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-cloud-mist border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            {loading ? (
                /* Premium Skeleton loading state */
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 space-y-6">
                    <div className="grid grid-cols-3 gap-4 animate-pulse">
                        <div className="h-20 bg-gray-100 rounded-xl"></div>
                        <div className="h-20 bg-gray-100 rounded-xl"></div>
                        <div className="h-20 bg-gray-100 rounded-xl"></div>
                    </div>
                    <div className="border-t border-platinum-tint pt-6 space-y-6 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-100 rounded w-1/5"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : error ? (
                /* Error state with retry option */
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                    <AlertCircle className="w-10 h-10 text-red-600 animate-pulse-soft" />
                    <div>
                        <h4 className="font-bold text-base">Đã xảy ra lỗi</h4>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button
                        onClick={fetchJourney}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Thử lại
                    </button>
                </div>
            ) : !selectedUser ? (
                /* Instruction / Initial Empty state */
                <div className="bg-white p-12 text-center rounded-2xl border border-platinum-tint shadow-sm-2">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                        <div className="w-16 h-16 bg-action-blue/10 rounded-full flex items-center justify-center text-action-blue">
                            <Search className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-midnight-indigo">Chưa chọn nhân viên</h3>
                            <p className="text-slate-blue text-sm mt-1">Vui lòng tìm kiếm và chọn một nhân viên để tra cứu lịch trình di chuyển và hiện diện trong khuôn viên.</p>
                        </div>
                    </div>
                </div>
            ) : !journeyData || !journeyData.events || journeyData.events.length === 0 ? (
                /* Actual Empty State for no activity on selected date */
                <div className="bg-white p-12 text-center rounded-2xl border border-platinum-tint shadow-sm-2">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                        <div className="w-16 h-16 bg-cloud-mist rounded-full flex items-center justify-center text-slate-blue border border-platinum-tint">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-midnight-indigo">Không có dữ liệu hành trình</h3>
                            <p className="text-slate-blue text-sm mt-1">
                                Không tìm thấy bất kỳ hoạt động ra vào hoặc check-in phòng họp nào của <strong>{selectedUser.fullName}</strong> trong ngày {new Date(date).toLocaleDateString('vi-VN')}.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Journey Timeline display */
                <div className="space-y-6">
                    {/* KPI Cards / Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-1 flex items-center justify-between hover-lift">
                            <div>
                                <p className="text-xs font-bold text-slate-blue uppercase tracking-wider">Cổng ANPR (Xe)</p>
                                <p className="text-2xl font-black text-midnight-indigo mt-1">{journeyData.gateCount || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                <Car className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-1 flex items-center justify-between hover-lift">
                            <div>
                                <p className="text-xs font-bold text-slate-blue uppercase tracking-wider">Cuộc họp (FaceID)</p>
                                <p className="text-2xl font-black text-midnight-indigo mt-1">{journeyData.meetingCount || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-1 flex items-center justify-between hover-lift">
                            <div>
                                <p className="text-xs font-bold text-slate-blue uppercase tracking-wider">Khu vực Giám sát</p>
                                <p className="text-2xl font-black text-midnight-indigo mt-1">{journeyData.zoneCount || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-royal-amethyst flex items-center justify-center">
                                <Eye className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline box */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl border border-platinum-tint shadow-sm-2">
                        <div className="flex items-center justify-between pb-6 border-b border-platinum-tint/60 mb-8">
                            <h3 className="font-bold text-base text-midnight-indigo flex items-center gap-2">
                                <Clock className="w-4 h-4 text-action-blue" />
                                Nhật ký Hành trình chi tiết
                            </h3>
                            <span className="text-xs font-bold px-3 py-1 bg-cloud-mist border border-platinum-tint text-slate-blue rounded-full">
                                {selectedUser.fullName} &bull; {new Date(date).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        {/* Vertical Timeline container */}
                        <div className="relative pl-6 sm:pl-8 border-l border-platinum-tint/80 ml-5 sm:ml-6 space-y-10 pb-4">
                            {journeyData.events.map((event, idx) => {
                                const timeStr = formatToVNTime(event.time);
                                const fullTimeTooltip = formatVNFullDateTime(event.time);
                                const eventType = (event.type || '').toLowerCase();
                                
                                return (
                                    <div key={idx} className="relative group animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                                        
                                        {/* Circle node on timeline */}
                                        <div className="absolute -left-[45px] sm:-left-[53px] top-0 transition-transform duration-300 group-hover:scale-110">
                                            {renderEventIcon(event)}
                                        </div>

                                        {/* Event Card */}
                                        <div className="bg-cloud-mist/40 group-hover:bg-cloud-mist/80 p-5 rounded-2xl border border-platinum-tint/60 hover:border-platinum-tint transition-all duration-300 relative">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                                
                                                {/* Left Column: Time & Event Detail */}
                                                <div className="space-y-1.5">
                                                    
                                                    {/* VN Time Label */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-midnight-indigo font-mono bg-white border border-platinum-tint px-2 py-0.5 rounded shadow-sm" title={fullTimeTooltip}>
                                                            {timeStr}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            eventType === 'gate' ? 'bg-green-100 text-green-700' :
                                                            eventType === 'meeting' ? 'bg-blue-100 text-action-blue' :
                                                            'bg-purple-100 text-royal-amethyst'
                                                        }`}>
                                                            {eventType === 'gate' ? 'Xe ra vào cổng' :
                                                             eventType === 'meeting' ? 'Phòng họp' :
                                                             'Xuất hiện zone'}
                                                        </span>
                                                    </div>

                                                    {/* Vietnamese ready-made details from API */}
                                                    <p className="text-sm font-bold text-midnight-indigo leading-relaxed">
                                                        {event.detail || 'Ghi nhận sự kiện'}
                                                    </p>

                                                    {/* Additional Context/Transparency metadata */}
                                                    {event.eventCount > 0 && (
                                                        <p className="text-[11px] text-slate-blue flex items-center gap-1">
                                                            <Eye className="w-3.5 h-3.5 text-steel-gray" />
                                                            Camera AI ghi nhận {event.eventCount} lần trong phiên này.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Right Column: Context specific UI widgets */}
                                                <div className="flex items-center shrink-0">
                                                    {/* LICENSE PLATE DESIGN */}
                                                    {eventType === 'gate' && event.plateNumber && (
                                                        <div className="inline-block border-2 border-midnight-indigo rounded bg-white shadow-sm overflow-hidden px-3.5 py-1.5 text-center min-w-[120px] font-mono select-all">
                                                            {/* Top line of VN plate (e.g. 30G) */}
                                                            <div className="text-[9px] text-slate-blue leading-none uppercase font-sans font-bold border-b border-platinum-tint pb-0.5 mb-0.5">VIỆT NAM</div>
                                                            {/* Actual license plate number (e.g. 699.46) */}
                                                            <div className="text-base font-black text-midnight-indigo tracking-wider leading-none">{event.plateNumber}</div>
                                                        </div>
                                                    )}

                                                    {/* MEETING ROOM DESIGN */}
                                                    {eventType === 'meeting' && event.roomName && (
                                                        <div className="text-xs bg-white border border-platinum-tint rounded-xl px-3 py-1.5 font-bold text-midnight-indigo flex items-center gap-1.5 shadow-sm">
                                                            <span className="w-2 h-2 rounded-full bg-action-blue"></span>
                                                            {event.roomName}
                                                        </div>
                                                    )}

                                                    {/* ZONE LOCATION DESIGN */}
                                                    {eventType === 'zone' && event.zoneName && (
                                                        <div className="text-xs bg-white border border-platinum-tint rounded-xl px-3 py-1.5 font-bold text-royal-amethyst flex items-center gap-1.5 shadow-sm">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {event.zoneName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserJourney;
