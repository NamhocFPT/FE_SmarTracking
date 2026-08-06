import { AlertCircle, ArrowRight, Award, BarChart2, BookOpen, Calendar, Car, CheckCircle, Clock, LogIn, PlusCircle, ShieldAlert, TrendingUp, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import DashboardBanner from '../../component/DashboardBanner';
import { getEmployeeSummary } from '../../service/campusService';
import { getMySchedule } from '../../service/employeeServices';

const COLORS = ['#006BFF', '#FFAE00', '#FF3B30'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const EmployeeHomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [successToast, setSuccessToast] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessToast(location.state.successMessage);
            // Clear the state so it doesn't show again on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => {
                setSuccessToast('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successToast]);

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analytics'

    // Overview states
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [quickStats, setQuickStats] = useState({
        pendingConsents: 0,
        meetingsToday: 0
    });

    // Campus summary (CDB-RS-001: GET /campus-dashboard/employee-summary)
    const [campusSummary, setCampusSummary] = useState(null);
    const [campusSummaryLoading, setCampusSummaryLoading] = useState(true);

    // Analytics states (from former dashboard)
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [personalStats, setPersonalStats] = useState({
        totalMeetings: 0,
        attendanceRate: 0,
        avgDuration: 0,
        recordingSessions: 0
    });
    const [attendanceBreakdown, setAttendanceBreakdown] = useState([]);
    const [meetingsTrend, setMeetingsTrend] = useState([]);

    // Load campus dashboard summary (gate access, vehicle status, meetings today)
    useEffect(() => {
        let isMounted = true;
        setCampusSummaryLoading(true);
        getEmployeeSummary()
            .then((res) => {
                if (isMounted && res?.success) {
                    setCampusSummary(res.data);
                }
            })
            .catch(() => {
                // Giữ campusSummary = null, UI tự hiện fallback/empty-state bên dưới
            })
            .finally(() => {
                if (isMounted) setCampusSummaryLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    // Load Overview Data
    useEffect(() => {
        setQuickStats({
            pendingConsents: 1,
            meetingsToday: 2
        });

        let isMounted = true;
        const now = new Date();

        // Tính ngày 7 ngày sau (dùng setDate chuẩn hơn cộng ms)
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        // Hàm format thành ISO 8601 Full Timestamp (Local Timezone)
        const formatFullTimestamp = (d, setEndOfDay = false) => {
            const targetDate = new Date(d);

            if (setEndOfDay) {
                targetDate.setHours(23, 59, 59, 0);
            } else {
                targetDate.setHours(0, 0, 0, 0);
            }

            const pad = (n) => String(n).padStart(2, '0');

            const year = targetDate.getFullYear();
            const month = pad(targetDate.getMonth() + 1);
            const day = pad(targetDate.getDate());
            const hours = pad(targetDate.getHours());
            const minutes = pad(targetDate.getMinutes());
            const seconds = pad(targetDate.getSeconds());

            // Lấy offset múi giờ thiết bị (ví dụ: UTC+7 sẽ ra '+07:00')
            const tzo = -targetDate.getTimezoneOffset();
            const diffSign = tzo >= 0 ? '+' : '-';
            const tzHours = pad(Math.floor(Math.abs(tzo) / 60));
            const tzMinutes = pad(Math.abs(tzo) % 60);
            const timezone = `${diffSign}${tzHours}:${tzMinutes}`;

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`;
        };

        // Gọi hàm getMySchedule
        getMySchedule({
            from: formatFullTimestamp(now, false),      // "2026-08-03T00:00:00+07:00"
            to: formatFullTimestamp(nextWeek, true),     // "2026-08-10T23:59:59+07:00"
            view: 'month',
            status: statusFilter ? [statusFilter, statusFilter] : ['scheduled', 'scheduled']
        })
            .then(res => {
                if (isMounted && res?.success && res.data) {
                    const dataList = Array.isArray(res.data) ? res.data : (res.data.items || []);
                    const mapped = dataList.map(m => {
                        const hostName = m.host?.fullName || m.host?.full_name || m.hostName || m.host_name || 'Người tổ chức';
                        return {
                            id: m.meetingId || m.id || m._id,
                            title: m.title || m.meetingTitle || 'Không có tiêu đề',
                            room: m.room?.roomName || m.room?.name || 'Phòng trực tuyến',
                            host: hostName,
                            startTime: m.startTime || m.start_time,
                            endTime: m.endTime || m.end_time,
                            recordingEnabled: m.recordingEnabled || m.is_recording_enabled || false,
                            consentStatus: m.myConsentStatus || m.consentStatus || null,
                            status: m.status?.toLowerCase() || 'scheduled'
                        };
                    });

                    const now = new Date();
                    const upcoming = mapped
                        .filter(m => new Date(m.startTime) >= now)
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                        .slice(0, 5);

                    setUpcomingMeetings(upcoming);
                }
            })
            .catch(err => {
                console.error("Failed to fetch upcoming meetings", err);
            });

        return () => { isMounted = false; };
    }, []);

    // Load Analytics Data when tab switches to 'analytics'
    useEffect(() => {
        if (activeTab === 'analytics') {
            setAnalyticsLoading(true);
            const timer = setTimeout(() => {
                setPersonalStats({
                    totalMeetings: 18,
                    attendanceRate: 94.4,
                    avgDuration: 55,
                    recordingSessions: 5
                });

                setAttendanceBreakdown([
                    { name: 'Đúng giờ', count: 16 },
                    { name: 'Đi muộn', count: 1 },
                    { name: 'Vắng mặt', count: 1 }
                ]);

                setMeetingsTrend([
                    { period: 'Tuần 22', count: 3, hours: 2.5 },
                    { period: 'Tuần 23', count: 4, hours: 3.5 },
                    { period: 'Tuần 24', count: 6, hours: 5.5 },
                    { period: 'Tuần 25', count: 5, hours: 4.8 }
                ]);

                setAnalyticsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    const handleConsent = (meetingId, granted) => {
        setUpcomingMeetings(prev =>
            prev.map(m => m.id === meetingId ? { ...m, consentStatus: granted ? 'GRANTED' : 'REJECTED' } : m)
        );
        if (granted) {
            setQuickStats(prev => ({ ...prev, pendingConsents: Math.max(0, prev.pendingConsents - 1) }));
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Success Toast */}
            <AnimatePresence>
                {successToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
                        animate={{ opacity: 1, y: 16, scale: 1, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
                        className="fixed top-4 left-1/2 z-50 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold"
                    >
                        <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                        <span>{successToast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Banner Greeting */}
            <motion.div variants={itemVariants}>
                <DashboardBanner roleName="Employee" />
            </motion.div>

            {/* Custom Tab Selector */}
            <motion.div variants={itemVariants} className="flex justify-between items-center border-b border-platinum-tint pb-px">
                <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-platinum-tint/80 shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'overview'
                            ? 'bg-action-blue text-white shadow-sm'
                            : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Lịch họp & Lối tắt
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'analytics'
                            ? 'bg-action-blue text-white shadow-sm'
                            : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                            }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                        Thống kê cá nhân
                    </button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Quick Status Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Họp trong ngày</h4>
                                    <h3 className="text-xl font-bold text-midnight-indigo">
                                        {campusSummaryLoading ? '...' : (campusSummary?.meetingsToday ?? quickStats.meetingsToday)} cuộc họp
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Yêu cầu ghi hình</h4>
                                    <h3 className="text-xl font-bold text-midnight-indigo">{quickStats.pendingConsents} yêu cầu chờ duyệt</h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <LogIn className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Lượt vào cổng hôm nay</h4>
                                    <h3 className="text-xl font-bold text-midnight-indigo">
                                        {campusSummaryLoading ? '...' : (campusSummary?.gateAccessToday ?? 0)} lượt
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Car className="w-6 h-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Trạng thái phương tiện của tôi</h4>
                                    {campusSummaryLoading ? (
                                        <h3 className="text-xl font-bold text-midnight-indigo">...</h3>
                                    ) : campusSummary?.vehicleStatus ? (
                                        <h3 className="text-base font-bold text-midnight-indigo truncate">
                                            {campusSummary.vehicleStatus.plateNumber}
                                            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${campusSummary.vehicleStatus.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {campusSummary.vehicleStatus.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </h3>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/employee/my-vehicles')}
                                            className="text-sm font-bold text-action-blue hover:underline"
                                        >
                                            Chưa đăng ký xe — Đăng ký ngay
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Shortcuts */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                Lối tắt chức năng nhanh
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div
                                    onClick={() => navigate('/employee/book')}
                                    className="group bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <PlusCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Đăng ký họp</h3>
                                    <p className="text-xs text-blue-100 mb-4">Lên lịch cuộc họp mới và đặt phòng họp theo kế hoạch.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Tạo lịch họp ngay <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div
                                    onClick={() => navigate('/employee/book?quick=true')}
                                    className="group bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Đặt phòng họp nhanh</h3>
                                    <p className="text-xs text-emerald-100 mb-4">Đặt phòng họp đột xuất ngay lập tức cho các cuộc thảo luận khẩn.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Đặt nhanh <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div
                                    onClick={() => navigate('/employee/schedule')}
                                    className="group bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Lịch cá nhân</h3>
                                    <p className="text-xs text-purple-100 mb-4">Kiểm tra lịch trình cuộc họp chi tiết của bản thân.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Xem lịch trình <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setActiveTab('analytics')}
                                    className="group bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Lịch sử điểm danh</h3>
                                    <p className="text-xs text-amber-100 mb-4">Tra cứu lịch sử vào/ra phòng họp và thời gian họp thực tế.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Xem báo cáo <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Meetings & Consents */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-base font-bold text-midnight-indigo">Cuộc họp sắp tới</h2>
                                        <p className="text-xs text-slate-blue">Các lịch họp được lên lịch sắp tới của bạn</p>
                                    </div>
                                    <span 
                                        onClick={() => navigate('/employee/schedule')}
                                        className="text-xs font-bold text-action-blue hover:underline cursor-pointer"
                                    >
                                        Xem tất cả
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {upcomingMeetings.length > 0 ? (
                                        upcomingMeetings.map(meet => (
                                            <div
                                                key={meet.id}
                                                onClick={() => navigate(`/employee/meeting/${meet.id}`)}
                                                className="p-4 rounded-xl border border-platinum-tint/60 hover:bg-cloud-mist/10 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:border-action-blue/30"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-action-blue">
                                                            {meet.room}
                                                        </span>
                                                        {meet.status === 'pending_approval' && (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                                                                Chờ duyệt
                                                            </span>
                                                        )}
                                                        {meet.status === 'draft' && (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                                                                Bản nháp
                                                            </span>
                                                        )}
                                                        {meet.status === 'in_progress' && (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Đang diễn ra
                                                            </span>
                                                        )}
                                                        {meet.recordingEnabled && (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 flex items-center gap-1">
                                                                <Video className="w-3 h-3" /> Ghi hình
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-midnight-indigo text-sm sm:text-base">
                                                        {meet.title}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-xs text-slate-blue font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(meet.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(meet.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({new Date(meet.startTime).toLocaleDateString('vi-VN')})
                                                        </span>
                                                        <span>Chủ trì: <strong>{meet.host}</strong></span>
                                                    </div>
                                                </div>

                                                {meet.recordingEnabled && (
                                                    <div className="flex items-center gap-2 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-0 border-platinum-tint/40">
                                                        {meet.consentStatus === 'PENDING' ? (
                                                            <div className="flex items-center gap-2 w-full justify-between">
                                                                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                                                                    <AlertCircle className="w-3 h-3" /> Cần Consent
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleConsent(meet.id, true)}
                                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors"
                                                                    >
                                                                        Đồng ý
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleConsent(meet.id, false)}
                                                                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded transition-colors"
                                                                    >
                                                                        Từ chối
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : meet.consentStatus === 'GRANTED' ? (
                                                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                                                                <CheckCircle className="w-3.5 h-3.5" /> Đã đồng ý ghi hình
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                                                                <AlertCircle className="w-3.5 h-3.5" /> Từ chối ghi hình
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center bg-cloud-mist/30 rounded-xl border border-dashed border-outline-gray/60">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                <Calendar className="w-8 h-8 text-action-blue/50" />
                                            </div>
                                            <h4 className="text-sm font-extrabold text-midnight-indigo mb-1">Không có cuộc họp nào</h4>
                                            <p className="text-xs text-slate-blue max-w-xs leading-relaxed">
                                                Tuyệt vời! Bạn không có lịch họp nào sắp tới. Hãy dành thời gian này để tập trung hoàn thành các công việc quan trọng nhé.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-900 to-purple-950 p-6 rounded-2xl text-white shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-amber-400" />
                                        Chính sách quyền riêng tư (PDPA)
                                    </h3>
                                    <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                                        Hệ thống SmarTracking cam kết bảo mật thông tin cá nhân của người dùng. Mọi video cuộc họp (Recording) sẽ chỉ được kích hoạt ghi hình khi có sự đồng ý (Consent) của tất cả thành viên bắt buộc tham dự.
                                    </p>
                                    <ul className="text-xs text-indigo-200 space-y-2 list-disc list-inside">
                                        <li>Face data gốc KHÔNG được lưu trên hệ thống backend SmarTracking.</li>
                                        <li>Lịch sử điểm danh được mã hóa và lưu trữ vì mục đích thống kê.</li>
                                        <li>Bản ghi hình cuộc họp được tự động xóa sau 90 ngày.</li>
                                    </ul>
                                </div>
                                <div className="pt-4 border-t border-white/10 mt-6 text-[10px] text-indigo-300 font-mono">
                                    Quy định bảo vệ dữ liệu cá nhân VN áp dụng
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="analytics-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {analyticsLoading ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                                <p className="mt-3 text-slate-blue text-sm font-semibold">Đang tải phân tích cá nhân...</p>
                            </div>
                        ) : (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Tổng cuộc họp</span>
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{personalStats.totalMeetings} cuộc</h3>
                                            <p className="text-xs text-slate-blue mt-1">Trong 30 ngày qua</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Tỉ lệ tham gia</span>
                                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                                                <Award className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-green-700">{personalStats.attendanceRate}%</h3>
                                            <p className="text-xs text-slate-blue mt-1">Mục tiêu chuyên cần: &gt;90%</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Thời gian họp trung bình</span>
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{personalStats.avgDuration} phút</h3>
                                            <p className="text-xs text-slate-blue mt-1">Mỗi phiên thảo luận</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Video lưu trữ</span>
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                                <Video className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{personalStats.recordingSessions} bản ghi</h3>
                                            <p className="text-xs text-slate-blue mt-1">Tải về hoặc phát lại</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Meetings trend over weeks */}
                                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                        <div>
                                            <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-action-blue" />
                                                Xu hướng tham gia họp theo tuần
                                            </h2>
                                            <p className="text-xs text-slate-blue">Theo dõi tần suất họp và tổng số giờ họp cá nhân</p>
                                        </div>
                                        <div className="h-[250px] w-full mt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={meetingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#006BFF" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#006BFF" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E7EDF6" vertical={false} />
                                                    <XAxis dataKey="period" stroke="#8795A5" fontSize={11} tickLine={false} />
                                                    <YAxis stroke="#8795A5" fontSize={11} tickLine={false} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="hours" stroke="#006BFF" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" name="Số giờ họp (h)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Attendance rate donut chart */}
                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                                <BarChart2 className="w-4 h-4 text-royal-amethyst" />
                                                Tình trạng chuyên cần
                                            </h2>
                                            <p className="text-xs text-slate-blue">Phân tích tình trạng điểm danh các cuộc họp</p>
                                        </div>
                                        <div className="h-[180px] w-full relative flex items-center justify-center my-2">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={attendanceBreakdown}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="count"
                                                    >
                                                        {attendanceBreakdown.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-[11px] pt-2 border-t border-platinum-tint/60">
                                            {attendanceBreakdown.map((item, idx) => (
                                                <div key={item.name} className="flex flex-col items-center">
                                                    <span className="flex items-center gap-1.5 font-semibold text-slate-blue">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                        {item.name}
                                                    </span>
                                                    <span className="text-sm font-bold text-midnight-indigo mt-0.5">{item.count} lần</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default EmployeeHomePage;
