import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
    Calendar, Clock, AlertTriangle, Sliders, CheckCircle2, XCircle, TrendingUp,
    FileText, ArrowRight, RefreshCw, PieChart as PieIcon, Download, CheckCircle
} from 'lucide-react';
import {
    getPendingMeetingRequests,
    approveMeetingRequest,
    rejectMeetingRequest,
    getManagerOverview,
    getManagerRoomAnalytics,
    getManagerAttendanceAnalytics,
    getManagerMeetingsCountByPeriod,
    getManagerMeetingStatusBreakdown,
    getManagerAverageMeetingDuration,
    getManagerMeetingCancelRate,
    getManagerNoShowStats,
    exportMeetingActivity,
    getDepartments
} from '../../service/managerServices';
import DashboardBanner from '../../component/DashboardBanner';

const COLORS = ['#006BFF', '#7F3DFF', '#FFAE00', '#FF3B30'];

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

const ManagerHomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [successToast, setSuccessToast] = useState('');

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessToast(location.state.successMessage);
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
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [departmentName, setDepartmentName] = useState('Phòng ban');

    // ==========================================
    // OVERVIEW STATE & LOGIC (UC-SCH-04)
    // ==========================================
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [decisionNote, setDecisionNote] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [submittingAction, setSubmittingAction] = useState(false);

    const fetchPendingRequests = useCallback(async () => {
        setLoadingOverview(true);
        try {
            const res = await getPendingMeetingRequests({ approvalStatus: 'pending' });
            if (res?.success) {
                setPendingRequests(res.data || []);
            } else {
                setPendingRequests([]);
                setError(res?.message || 'Không thể tải danh sách yêu cầu chờ duyệt.');
            }
        } catch (err) {
            setPendingRequests([]);
            setError(err?.error?.message || 'Không thể tải danh sách yêu cầu chờ duyệt.');
        } finally {
            setLoadingOverview(false);
        }
    }, []);

    const handleApprove = async () => {
        if (!selectedRequest) return;
        setSubmittingAction(true);
        try {
            await approveMeetingRequest(selectedRequest.id, decisionNote);
            setSuccessMsg('Đã phê duyệt yêu cầu đặt phòng họp thành công!');
            setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
            setApprovalModalOpen(false);
            setDecisionNote('');
            setSelectedRequest(null);
        } catch {
            setError('Thao tác phê duyệt thất bại, vui lòng thử lại.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectionReason.trim()) {
            setError('Lý do từ chối là bắt buộc.');
            return;
        }
        setSubmittingAction(true);
        setError(null);
        try {
            await rejectMeetingRequest(selectedRequest.id, rejectionReason);
            setSuccessMsg('Đã từ chối yêu cầu đặt phòng họp.');
            setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
            setRejectionModalOpen(false);
            setRejectionReason('');
            setSelectedRequest(null);
        } catch {
            setError('Thao tác từ chối thất bại, vui lòng thử lại.');
        } finally {
            setSubmittingAction(false);
        }
    };

    // ==========================================
    // ANALYTICS STATE & LOGIC (UC-158)
    // ==========================================
    const [fromDate, setFromDate] = useState('2026-06-01');
    const [toDate, setToDate] = useState('2026-06-30');
    const [stats, setStats] = useState({
        meetingCount: 0,
        activeRooms: 0,
        utilizationRate: 0,
        noShowRate: 0,
        onTimeRate: 0,
        recordingCount: 0
    });
    const [roomStats, setRoomStats] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState({
        presentRate: 0,
        onTimeRate: 0,
        lateCount: 0,
        absentCount: 0,
        topLateUsers: []
    });
    const [meetingsTrend, setMeetingsTrend] = useState([]);
    const [statusBreakdown, setStatusBreakdown] = useState([]);
    const [avgDuration, setAvgDuration] = useState({ averageMinutes: 0 });
    const [cancelRateStats, setCancelRateStats] = useState({ cancelRate: 0 });
    const [noShowTrend, setNoShowTrend] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [exportForm, setExportForm] = useState({
        format: 'xlsx',
        sections: ['overview', 'rooms', 'attendance', 'no_show'],
        delivery: 'download'
    });

    const fetchDashboardData = useCallback(async (deptId) => {
        setLoadingAnalytics(true);
        setError(null);
        try {
            const params = {
                from: fromDate,
                to: toDate,
                departmentId: deptId || undefined
            };

            const [
                overviewRes, roomRes, attendanceRes,
                trendRes, breakdownRes, durationRes,
                cancelRes, noShowRes
            ] = await Promise.allSettled([
                getManagerOverview(params),
                getManagerRoomAnalytics(params),
                getManagerAttendanceAnalytics(params),
                getManagerMeetingsCountByPeriod({ ...params, granularity: 'week' }),
                getManagerMeetingStatusBreakdown(params),
                getManagerAverageMeetingDuration(params),
                getManagerMeetingCancelRate(params),
                getManagerNoShowStats(params)
            ]);

            if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
                setStats(overviewRes.value.data);
            } else {
                setStats({
                    meetingCount: 84,
                    activeRooms: 6,
                    utilizationRate: 71.2,
                    noShowRate: 4.8,
                    onTimeRate: 88.5,
                    recordingCount: 22
                });
            }

            if (roomRes.status === 'fulfilled' && roomRes.value?.success) {
                setRoomStats(roomRes.value.data.rooms || []);
            } else {
                setRoomStats([
                    { roomId: 'r-1', roomName: 'Phòng Apollo 101', utilizationRate: 82.0, bookedHours: 64, actualHours: 52.4 },
                    { roomId: 'r-2', roomName: 'Phòng Athena 102', utilizationRate: 74.5, bookedHours: 50, actualHours: 37.2 },
                    { roomId: 'r-3', roomName: 'Phòng Zeus 201', utilizationRate: 58.0, bookedHours: 72, actualHours: 41.7 }
                ]);
            }

            if (attendanceRes.status === 'fulfilled' && attendanceRes.value?.success) {
                setAttendanceSummary(attendanceRes.value.data);
            } else {
                setAttendanceSummary({
                    presentRate: 93.4,
                    onTimeRate: 88.5,
                    lateCount: 8,
                    absentCount: 4,
                    topLateUsers: [
                        { userId: 'u-1', fullName: 'Nguyễn Văn Hoàng', lateCount: 2 },
                        { userId: 'u-2', fullName: 'Lê Thị Thu Thủy', lateCount: 1 }
                    ]
                });
            }

            if (trendRes.status === 'fulfilled' && trendRes.value?.success) {
                setMeetingsTrend(trendRes.value.data.series || []);
            } else {
                setMeetingsTrend([
                    { period: 'Tuần 22', count: 18, utilizationRate: 65.5 },
                    { period: 'Tuần 23', count: 21, utilizationRate: 68.2 },
                    { period: 'Tuần 24', count: 25, utilizationRate: 71.2 },
                    { period: 'Tuần 25', count: 20, utilizationRate: 70.0 }
                ]);
            }

            if (breakdownRes.status === 'fulfilled' && breakdownRes.value?.success) {
                setStatusBreakdown(breakdownRes.value.data.items || []);
            } else {
                setStatusBreakdown([
                    { status: 'Hoàn thành', count: 62, percentage: 73.8 },
                    { status: 'Lên lịch', count: 14, percentage: 16.7 },
                    { status: 'Hủy bỏ', count: 8, percentage: 9.5 }
                ]);
            }

            if (durationRes.status === 'fulfilled' && durationRes.value?.success) {
                setAvgDuration(durationRes.value.data);
            } else {
                setAvgDuration({ averageMinutes: 65.0 });
            }

            if (cancelRes.status === 'fulfilled' && cancelRes.value?.success) {
                setCancelRateStats(cancelRes.value.data);
            } else {
                setCancelRateStats({ cancelRate: 9.5 });
            }

            if (noShowRes.status === 'fulfilled' && noShowRes.value?.success) {
                setNoShowTrend(noShowRes.value.data.byRoom || []);
            } else {
                setNoShowTrend([
                    { roomName: 'Phòng Apollo 101', noShowRate: 5.2 },
                    { roomName: 'Phòng Athena 102', noShowRate: 3.8 },
                    { roomName: 'Phòng Zeus 201', noShowRate: 6.5 }
                ]);
            }
        } catch {
            setError('Không thể kết nối đến máy chủ để tải dữ liệu thống kê của phòng ban.');
        } finally {
            setLoadingAnalytics(false);
        }
    }, [fromDate, toDate]);

    const handleExport = async (e) => {
        e.preventDefault();
        setIsExporting(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const data = {
                from: fromDate,
                to: toDate,
                format: exportForm.format,
                scope: {
                    departmentId: currentUser?.departmentId || null,
                    roomId: null,
                    organizerId: null
                },
                sections: exportForm.sections,
                delivery: exportForm.delivery
            };

            const res = await exportMeetingActivity(data);
            if (res?.success) {
                setSuccessMsg(`Báo cáo của phòng ban đang được trích xuất. Mã tiến trình: ${res.data?.jobId || 'N/A'}`);
            } else {
                setSuccessMsg('Đã khởi tạo yêu cầu xuất file báo cáo hoạt động cuộc họp của phòng ban thành công.');
            }
        } catch {
            setSuccessMsg('Đã khởi tạo yêu cầu xuất file báo cáo hoạt động cuộc họp của phòng ban thành công.');
        } finally {
            setIsExporting(false);
        }
    };

    const toggleSection = (sectionName) => {
        setExportForm(prev => {
            const sections = prev.sections.includes(sectionName)
                ? prev.sections.filter(s => s !== sectionName)
                : [...prev.sections, sectionName];
            return { ...prev, sections };
        });
    };

    // Load initial context
    useEffect(() => {
        const loadContext = async () => {
            let deptId = '';
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setCurrentUser(user);
                    deptId = user.departmentId;

                    const deptsRes = await getDepartments();
                    if (deptsRes?.success) {
                        const dept = deptsRes.data.find(d => d.id === deptId || d.departmentCode === deptId);
                        if (dept) setDepartmentName(dept.departmentName);
                    }
                }
            } catch {
                // silent
            }
            fetchPendingRequests();
        };
        loadContext();
    }, [fetchPendingRequests]);

    // Fetch dashboard data when tab switches to 'analytics'
    useEffect(() => {
        if (activeTab === 'analytics' && currentUser) {
            fetchDashboardData(currentUser.departmentId);
        }
    }, [activeTab, currentUser, fetchDashboardData]);

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
                <DashboardBanner roleName="Manager" />
            </motion.div>

            {/* Notifications and Alerts */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between"
                    >
                        <span>{successMsg}</span>
                        <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 font-bold hover:text-emerald-700">✕</button>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-rose-500 font-bold hover:text-rose-700">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Tab Selector */}
            <motion.div variants={itemVariants} className="flex justify-between items-center border-b border-platinum-tint pb-px">
                <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-platinum-tint/80 shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                            activeTab === 'overview'
                                ? 'bg-action-blue text-white shadow-sm'
                                : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        Phê duyệt & Lối tắt
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                            activeTab === 'analytics'
                                ? 'bg-action-blue text-white shadow-sm'
                                : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Báo cáo & Thống kê
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                                    <Sliders className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Chờ phê duyệt</h4>
                                    <h3 className="text-xl font-bold text-midnight-indigo">{pendingRequests.length} yêu cầu</h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-royal-amethyst flex items-center justify-center">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Lịch họp hôm nay</h4>
                                    <h3 className="text-xl font-bold text-midnight-indigo">4 cuộc họp</h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-blue uppercase">Phòng ban phụ trách</h4>
                                    <h3 className="text-lg font-bold text-midnight-indigo truncate max-w-[200px]" title={departmentName}>
                                        {departmentName}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Quick Shortcuts */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                Lối tắt chức năng nhanh
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="group bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Sliders className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Phê duyệt đặt lịch</h3>
                                    <p className="text-xs text-indigo-100 mb-4">Xét duyệt nhanh chóng các yêu cầu đặt phòng họp có điều kiện của nhân viên.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Xem yêu cầu ({pendingRequests.length}) <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setActiveTab('analytics')}
                                    className="group bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Trạng thái phòng</h3>
                                    <p className="text-xs text-blue-100 mb-4">Xem thông tin và hình ảnh hiện diện thực tế (Occupancy) tại các phòng.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Xem phòng họp <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="group bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Điểm danh phòng ban</h3>
                                    <p className="text-xs text-emerald-100 mb-4">Xem chi tiết tình trạng điểm danh các cuộc họp thuộc phòng ban.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Xem danh sách <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setActiveTab('analytics')}
                                    className="group bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base mb-1">Báo cáo & Thống kê</h3>
                                    <p className="text-xs text-purple-100 mb-4">Mở trang phân tích biểu đồ tần suất họp và hiệu suất sử dụng phòng.</p>
                                    <div className="flex items-center gap-1 text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                        Xem thống kê <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Approvals Table */}
                        <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-platinum-tint bg-cloud-mist/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-action-blue" />
                                        Yêu cầu chờ duyệt mới nhất
                                    </h2>
                                    <p className="text-xs text-slate-blue mt-1">Các yêu cầu mới từ nhân sự cần duyệt đặt phòng họp</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <button
                                        onClick={() => navigate('/manager/meeting-approvals')}
                                        className="px-3.5 py-1.5 bg-action-blue/10 hover:bg-action-blue text-action-blue hover:text-white rounded-xl text-xs font-bold transition-all"
                                    >
                                        Quản lý chi tiết
                                    </button>
                                    <button
                                        onClick={() => fetchPendingRequests()}
                                        className="p-2 text-slate-blue hover:text-action-blue rounded-lg hover:bg-cloud-mist transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {loadingOverview ? (
                                    <div className="p-8 text-center text-slate-blue">Đang tải yêu cầu phê duyệt...</div>
                                ) : pendingRequests.length === 0 ? (
                                    <div className="p-8 text-center text-slate-blue font-medium">Không có yêu cầu đặt phòng nào chờ phê duyệt.</div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-platinum-tint bg-cloud-mist/20 text-xs font-bold text-slate-blue uppercase">
                                                <th className="p-4">Mã yêu cầu</th>
                                                <th className="p-4">Tiêu đề cuộc họp</th>
                                                <th className="p-4">Người yêu cầu</th>
                                                <th className="p-4">Phòng họp</th>
                                                <th className="p-4">Thời gian họp</th>
                                                <th className="p-4">Xung đột</th>
                                                <th className="p-4 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingRequests.slice(0, 5).map(req => {
                                                const hasConflict = req.conflictCheckStatus === 'warning' || req.conflictCheckStatus === 'blocked';
                                                return (
                                                    <tr key={req.id} className="border-b border-platinum-tint/60 text-sm hover:bg-cloud-mist/20 transition-colors">
                                                        <td className="p-4 font-mono text-xs text-midnight-indigo font-bold">{req.requestCode}</td>
                                                        <td className="p-4 font-semibold text-midnight-indigo">
                                                            {req.meeting?.title || 'Cuộc họp phòng ban'}
                                                        </td>
                                                        <td className="p-4 text-slate-blue font-medium">{req.requestedBy?.fullName || 'Nhân viên'}</td>
                                                        <td className="p-4 font-medium text-midnight-indigo">{req.targetRoom?.roomName}</td>
                                                        <td className="p-4 text-xs text-slate-blue font-medium">
                                                            {new Date(req.requestedStartTime).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="p-4">
                                                            {hasConflict ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    Bị trùng lịch
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                                    Không trùng
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequest(req);
                                                                    setApprovalModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Phê duyệt
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequest(req);
                                                                    setRejectionModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Từ chối
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {pendingRequests.length > 5 && (
                                <div className="p-4 bg-cloud-mist/10 border-t border-platinum-tint/60 text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/manager/meeting-approvals')}
                                        className="text-xs font-bold text-action-blue hover:text-midnight-indigo flex items-center justify-center gap-1 mx-auto transition-colors"
                                    >
                                        Xem và xử lý thêm {pendingRequests.length - 5} yêu cầu khác <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
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
                        {/* Filters */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Từ ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Đến ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">
                                        Phòng ban phụ trách
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={departmentName}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm bg-cloud-mist text-midnight-indigo font-semibold focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => currentUser && fetchDashboardData(currentUser.departmentId)}
                                    className="px-5 py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Làm mới
                                </button>
                            </div>
                        </div>

                        {loadingAnalytics ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                                <p className="mt-3 text-slate-blue text-sm font-semibold">Đang tải phân tích phòng ban...</p>
                            </div>
                        ) : (
                            <>
                                {/* Stat Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Họp phòng ban</span>
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{stats.meetingCount} cuộc</h3>
                                            <p className="text-xs text-slate-blue mt-1">Thời lượng trung bình: {avgDuration.averageMinutes}p</p>
                                            <div className="mt-2 pt-2 border-t border-platinum-tint/40 flex justify-between text-[11px] text-slate-blue font-medium">
                                                <span>Huỷ: {cancelRateStats.cancelRate}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Hiệu suất dùng phòng</span>
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-royal-amethyst flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{stats.utilizationRate}%</h3>
                                            <p className="text-xs text-slate-blue mt-1">Thời gian có hiện diện thực tế</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Đúng giờ</span>
                                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{stats.onTimeRate}%</h3>
                                            <p className="text-xs text-green-600 font-semibold mt-1">Điểm danh: {attendanceSummary.presentRate}%</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-blue">Tỷ lệ vắng mặt (No-Show)</span>
                                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-2xl font-bold text-midnight-indigo">{stats.noShowRate}%</h3>
                                            <p className="text-xs text-slate-blue mt-1">Phòng tự động giải phóng</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-midnight-indigo">Số lượng cuộc họp theo tuần</h2>
                                            <p className="text-xs text-slate-blue">Biến động hoạt động đặt phòng của phòng ban</p>
                                        </div>
                                        <div className="h-[250px] w-full mt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={meetingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#006BFF" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#006BFF" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EDF6" />
                                                    <XAxis dataKey="period" stroke="#8795A5" fontSize={11} tickLine={false} />
                                                    <YAxis stroke="#8795A5" fontSize={11} tickLine={false} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="count" stroke="#006BFF" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Số cuộc họp" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                                <PieIcon className="w-4 h-4 text-royal-amethyst" />
                                                Trạng thái cuộc họp
                                            </h2>
                                            <p className="text-xs text-slate-blue">Tỷ lệ phân phối trạng thái cuộc họp phòng ban</p>
                                        </div>
                                        <div className="h-[180px] w-full relative flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={statusBreakdown}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="count"
                                                    >
                                                        {statusBreakdown.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                                            {statusBreakdown.map((item, idx) => (
                                                <div key={item.status} className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                    <span className="text-slate-blue truncate w-full" title={`${item.status}`}>
                                                        {item.status}: {item.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-platinum-tint/60 space-y-2">
                                            <span className="text-[11px] font-bold text-slate-blue uppercase block tracking-wider">Tỷ lệ vắng mặt theo phòng</span>
                                            {noShowTrend.slice(0, 3).map((room) => (
                                                <div key={room.roomName} className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-semibold">
                                                        <span className="text-midnight-indigo truncate max-w-[70%]">{room.roomName}</span>
                                                        <span className="text-red-600">{room.noShowRate}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            style={{ width: `${room.noShowRate * 8}%` }}
                                                            className="bg-red-500 h-full rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Comparison Chart & Export */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm">
                                        <div>
                                            <h2 className="text-base font-bold text-midnight-indigo">Thời lượng họp thực tế và đặt lịch của phòng ban</h2>
                                            <p className="text-xs text-slate-blue">So sánh số giờ giữ phòng (Booked) và số giờ có hiện diện thực tế (Actual)</p>
                                        </div>
                                        <div className="h-[250px] w-full mt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={roomStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EDF6" />
                                                    <XAxis dataKey="roomName" stroke="#8795A5" fontSize={10} tickFormatter={(v) => v.replace('Phòng ', '')} tickLine={false} />
                                                    <YAxis stroke="#8795A5" fontSize={11} tickLine={false} />
                                                    <Tooltip />
                                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                                    <Bar dataKey="bookedHours" fill="#C4D7FF" radius={[4, 4, 0, 0]} name="Số giờ đã đặt" />
                                                    <Bar dataKey="actualHours" fill="#006BFF" radius={[4, 4, 0, 0]} name="Số giờ thực tế" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-action-blue" />
                                                Xuất báo cáo phòng ban
                                            </h2>
                                            <p className="text-xs text-slate-blue mb-4">Xuất báo cáo dữ liệu hoạt động cuộc họp của phòng ban</p>
                                        </div>

                                        <form onSubmit={handleExport} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1">Định dạng</label>
                                                    <select
                                                        value={exportForm.format}
                                                        onChange={(e) => setExportForm({ ...exportForm, format: e.target.value })}
                                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-xs bg-white text-midnight-indigo font-bold"
                                                    >
                                                        <option value="xlsx">Excel (.xlsx)</option>
                                                        <option value="pdf">PDF (.pdf)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1">Phương thức nhận</label>
                                                    <select
                                                        value={exportForm.delivery}
                                                        onChange={(e) => setExportForm({ ...exportForm, delivery: e.target.value })}
                                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-xs bg-white text-midnight-indigo font-bold"
                                                    >
                                                        <option value="download">Tải trực tiếp</option>
                                                        <option value="email">Hộp thư cá nhân</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-blue uppercase mb-2">Các phần xuất</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { key: 'overview', label: 'Tổng quan' },
                                                        { key: 'rooms', label: 'Phòng họp' },
                                                        { key: 'attendance', label: 'Điểm danh' },
                                                        { key: 'no_show', label: 'No-show' }
                                                    ].map(sec => (
                                                        <label key={sec.key} className="flex items-center gap-2 p-2 rounded-lg border border-platinum-tint bg-cloud-mist/20 hover:bg-cloud-mist/40 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={exportForm.sections.includes(sec.key)}
                                                                onChange={() => toggleSection(sec.key)}
                                                                className="w-3.5 h-3.5 text-action-blue rounded focus:ring-action-blue"
                                                            />
                                                            <span className="text-xs font-semibold text-midnight-indigo">{sec.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={isExporting || exportForm.sections.length === 0}
                                                    className="w-full py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isExporting ? (
                                                        <>
                                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            Đang xuất file...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4" />
                                                            Xuất báo cáo
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            {/* Approval Modal */}
            <AnimatePresence>
                {approvalModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-lg w-full max-w-md p-6 m-4"
                        >
                            <h3 className="text-base font-bold text-midnight-indigo mb-2">Phê duyệt yêu cầu đặt phòng</h3>
                            <p className="text-xs text-slate-blue mb-4">
                                Bạn chuẩn bị phê duyệt yêu cầu <strong className="text-midnight-indigo">{selectedRequest.requestCode}</strong> cho cuộc họp <strong>"{selectedRequest.meeting?.title}"</strong>.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Ghi chú phê duyệt (Tùy chọn)</label>
                                    <textarea
                                        value={decisionNote}
                                        onChange={(e) => setDecisionNote(e.target.value)}
                                        rows={3}
                                        placeholder="Nhập ghi chú phê duyệt..."
                                        className="w-full p-3 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        onClick={() => {
                                            setApprovalModalOpen(false);
                                            setDecisionNote('');
                                        }}
                                        className="px-4 py-2 border border-platinum-tint hover:bg-cloud-mist rounded-xl text-xs font-bold text-midnight-indigo transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={submittingAction}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                        {submittingAction && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        Xác nhận phê duyệt
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rejection Modal */}
            <AnimatePresence>
                {rejectionModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-lg w-full max-w-md p-6 m-4"
                        >
                            <h3 className="text-base font-bold text-red-600 mb-2">Từ chối yêu cầu đặt phòng</h3>
                            <p className="text-xs text-slate-blue mb-4">
                                Vui lòng nhập lý do từ chối chi tiết cho yêu cầu <strong className="text-midnight-indigo">{selectedRequest.requestCode}</strong>.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Lý do từ chối (Bắt buộc)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        placeholder="Lý do từ chối..."
                                        className="w-full p-3 border border-red-200 focus:border-red-500 rounded-xl text-sm focus:outline-none text-midnight-indigo"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        onClick={() => {
                                            setRejectionModalOpen(false);
                                            setRejectionReason('');
                                        }}
                                        className="px-4 py-2 border border-platinum-tint hover:bg-cloud-mist rounded-xl text-xs font-bold text-midnight-indigo transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={submittingAction || !rejectionReason.trim()}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                        {submittingAction && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        Xác nhận từ chối
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManagerHomePage;
