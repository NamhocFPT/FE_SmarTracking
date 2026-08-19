import { Activity, BarChart2, Download, Filter, List, LogOut, RefreshCw, Shield, User, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminGateAccessLogs, getAdminGateAccessHistory, getAdminVehicleTrafficStats, getAdminGateAccessHistoryDetail } from '../../service/sysAdminServices';
import ExportReportModal from '../../components/common/ExportReportModal';


export default function GateAccessManagement() {
    const [activeTab, setActiveTab] = useState('logs'); // 'logs', 'sessions', 'stats'
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

    // Logs State
    const [logs, setLogs] = useState([]);
    const [logsPage, setLogsPage] = useState(1);

    // Sessions State
    const [sessions, setSessions] = useState([]);
    const [sessionsPage, setSessionsPage] = useState(1);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [showSessionModal, setShowSessionModal] = useState(false);

    // Stats State
    const [stats, setStats] = useState(null);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const itemsPerPage = 10;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminGateAccessLogs({ from: fromDate + 'T00:00:00Z', to: toDate + 'T23:59:59Z', limit: 50 });
            if (res?.success) {
                setLogs(res.data || []);
                setLogsPage(1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate]);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminGateAccessHistory({ from: fromDate + 'T00:00:00Z', to: toDate + 'T23:59:59Z', limit: 50 });
            if (res?.success) {
                setSessions(res.data || []);
                setSessionsPage(1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate]);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminVehicleTrafficStats({ from: fromDate + 'T00:00:00Z', to: toDate + 'T23:59:59Z', group_by: 'day' });
            if (res?.success) setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'sessions') fetchSessions();
        if (activeTab === 'stats') fetchStats();
    }, [activeTab, fetchLogs, fetchSessions, fetchStats]);

    const handleViewSession = async (session) => {
        setShowSessionModal(true);
        setSessionDetail(null);
        try {
            const res = await getAdminGateAccessHistoryDetail(session.id);
            if (res?.success) setSessionDetail(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const formatDateTime = (iso) => {
        if (!iso) return '-';
        return new Date(iso).toLocaleString('vi-VN');
    };

    const formatDuration = (seconds) => {
        if (seconds == null) return '-';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}p ${s}s`;
    };

    // Paginate helper variables for Logs
    const logsIndexOfLast = logsPage * itemsPerPage;
    const logsIndexOfFirst = logsIndexOfLast - itemsPerPage;
    const currentLogs = logs.slice(logsIndexOfFirst, logsIndexOfLast);
    const logsTotalPages = Math.ceil(logs.length / itemsPerPage);

    // Paginate helper variables for Sessions
    const sessionsIndexOfLast = sessionsPage * itemsPerPage;
    const sessionsIndexOfFirst = sessionsIndexOfLast - itemsPerPage;
    const currentSessions = sessions.slice(sessionsIndexOfFirst, sessionsIndexOfLast);
    const sessionsTotalPages = Math.ceil(sessions.length / itemsPerPage);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <LogOut className="w-3.5 h-3.5" />
                        Cổng ra vào
                    </span>
                    <h1 className="text-2xl font-black text-midnight-indigo flex items-center gap-2">
                        <Shield className="w-7 h-7 text-action-blue" /> Kiểm Soát Ra Vào Cổng
                    </h1>
                    <p className="text-sm font-medium text-slate-blue mt-1">Quản lý phương tiện và người ra vào theo thời gian thực</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExportOpen(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                <div className="flex bg-cloud-mist/50 p-1.5 rounded-xl border border-platinum-tint shadow-sm">
                    {[
                        { id: 'logs', label: 'Nhật ký ', icon: List },
                        { id: 'sessions', label: 'Phiên ghép cặp', icon: Activity },
                        { id: 'stats', label: 'Thống kê', icon: BarChart2 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-action-blue shadow-sm ring-1 ring-platinum-tint'
                                : 'text-slate-blue hover:text-midnight-indigo hover:bg-white/50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1.5">Từ ngày</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue font-medium"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1.5">Đến ngày</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue font-medium"
                    />
                </div>
                <button
                    onClick={() => {
                        if (activeTab === 'logs') fetchLogs();
                        if (activeTab === 'sessions') fetchSessions();
                        if (activeTab === 'stats') fetchStats();
                    }}
                    className="px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold shadow-sm hover:bg-action-blue/90 flex items-center gap-1.5"
                >
                    <Filter className="w-3.5 h-3.5" /> Lọc
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'logs' && (
                        <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden p-5 space-y-4">
                            <div className="overflow-x-auto border border-outline-gray rounded-xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-cloud-mist border-b border-outline-gray text-slate-blue font-bold">
                                            <th className="px-4 py-3 border-b border-platinum-tint">Ngày</th>
                                            <th className="px-4 py-3 border-b border-platinum-tint">Giờ</th>
                                            <th className="px-4 py-3 border-b border-platinum-tint">Khu vực</th>
                                            <th className="px-4 py-3 border-b border-platinum-tint">Hướng</th>
                                            <th className="px-4 py-3 border-b border-platinum-tint">Biển số</th>
                                            <th className="px-4 py-3 border-b border-platinum-tint">Thời lượng (s)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {currentLogs.length > 0 ? currentLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-cloud-mist/30 border-b border-platinum-tint/50 last:border-0">
                                                <td className="px-4 py-3 font-medium text-midnight-indigo">{formatDateTime(log.access_time).split(' ')[1]}</td>
                                                <td className="px-4 py-3 font-medium text-midnight-indigo">{formatDateTime(log.access_time).split(' ')[0]}</td>
                                                <td className="px-4 py-3">{log.zone_name || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.direction === 'enter' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {log.direction === 'enter' ? 'VÀO' : 'RA'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono font-bold">{log.plate_number || '-'}</td>
                                                <td className="px-4 py-3">{log.duration_seconds || '-'}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-blue">Không có dữ liệu nhật ký thô</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination logs */}
                            {!loading && logsTotalPages > 1 && (
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-[11px] text-slate-blue">
                                        Hiển thị {logsIndexOfFirst + 1} - {Math.min(logsIndexOfLast, logs.length)} trong tổng số {logs.length} lượt nhật ký
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                                            disabled={logsPage === 1}
                                            className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                        >
                                            Trước
                                        </button>
                                        {[...Array(logsTotalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setLogsPage(i + 1)}
                                                className={`w-7 h-7 rounded-lg text-[10.5px] font-bold transition-all border ${
                                                    logsPage === i + 1 
                                                        ? 'bg-action-blue text-white border-action-blue' 
                                                        : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setLogsPage(prev => Math.min(logsTotalPages, prev + 1))}
                                            disabled={logsPage === logsTotalPages}
                                            className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentSessions.length > 0 ? currentSessions.map(session => (
                                    <div key={session.id} className="bg-white rounded-2xl border border-platinum-tint shadow-sm p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-midnight-indigo font-mono text-sm">{session.plate_number || 'Chưa nhận diện'}</h3>
                                                <p className="text-[10px] font-medium text-slate-blue mt-0.5">{session.zone_name}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${session.session_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {session.session_status === 'completed' ? 'Đã hoàn thành' : 'Đang trong bãi'}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-xs mb-4">
                                            <div className="flex justify-between border-b border-platinum-tint/30 pb-1">
                                                <span className="text-slate-blue">Vào:</span>
                                                <span className="font-medium">{formatDateTime(session.check_in_time)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-platinum-tint/30 pb-1">
                                                <span className="text-slate-blue">Ra:</span>
                                                <span className="font-medium">{formatDateTime(session.check_out_time)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-blue">Lưu bãi:</span>
                                                <span className="font-bold text-action-blue">{formatDuration(session.duration_seconds)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewSession(session)}
                                            className="w-full py-2 bg-cloud-mist hover:bg-platinum-tint text-midnight-indigo rounded-xl text-xs font-bold transition-colors"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-slate-blue bg-white rounded-2xl border border-platinum-tint">Không có phiên ghép cặp nào</div>
                                )}
                            </div>

                            {/* Pagination sessions */}
                            {!loading && sessionsTotalPages > 1 && (
                                <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm flex justify-between items-center">
                                    <span className="text-[11px] text-slate-blue">
                                        Hiển thị {sessionsIndexOfFirst + 1} - {Math.min(sessionsIndexOfLast, sessions.length)} trong tổng số {sessions.length} phiên ghép cặp
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setSessionsPage(prev => Math.max(1, prev - 1))}
                                            disabled={sessionsPage === 1}
                                            className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                        >
                                            Trước
                                        </button>
                                        {[...Array(sessionsTotalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSessionsPage(i + 1)}
                                                className={`w-7 h-7 rounded-lg text-[10.5px] font-bold transition-all border ${
                                                    sessionsPage === i + 1 
                                                        ? 'bg-action-blue text-white border-action-blue' 
                                                        : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setSessionsPage(prev => Math.min(sessionsTotalPages, prev + 1))}
                                            disabled={sessionsPage === sessionsTotalPages}
                                            className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm p-6">
                            {stats ? (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-midnight-indigo uppercase tracking-wider">Tổng quan lưu lượng</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase">Tổng lượt VÀO</div>
                                            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.summary.total_enter}</div>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                            <div className="text-[10px] font-bold text-orange-600 uppercase">Tổng lượt RA</div>
                                            <div className="text-2xl font-black text-orange-700 mt-1">{stats.summary.total_leave}</div>
                                        </div>
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                            <div className="text-[10px] font-bold text-amber-600 uppercase">Số lượng xe độc nhất</div>
                                            <div className="text-2xl font-black text-amber-700 mt-1">{stats.summary.unique_vehicles}</div>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                            <div className="text-[10px] font-bold text-indigo-600 uppercase">Tổng sự kiện</div>
                                            <div className="text-2xl font-black text-indigo-700 mt-1">{stats.summary.total_events}</div>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-midnight-indigo uppercase tracking-wider mb-4">Chi tiết theo ngày</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-cloud-mist/50 text-[10px] font-bold text-slate-blue uppercase tracking-wider">
                                                        <th className="px-4 py-3 border-b border-platinum-tint">Ngày</th>
                                                        <th className="px-4 py-3 border-b border-platinum-tint">Lượt VÀO</th>
                                                        <th className="px-4 py-3 border-b border-platinum-tint">Lượt RA</th>
                                                        <th className="px-4 py-3 border-b border-platinum-tint">Lượt NHÌN THẤY (Seen)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs">
                                                    {stats.series && stats.series.map((s, idx) => (
                                                        <tr key={idx} className="hover:bg-cloud-mist/30 border-b border-platinum-tint/50 last:border-0">
                                                            <td className="px-4 py-3 font-medium text-midnight-indigo">{s.bucket}</td>
                                                            <td className="px-4 py-3 font-bold text-emerald-600">{s.enter}</td>
                                                            <td className="px-4 py-3 font-bold text-orange-600">{s.leave}</td>
                                                            <td className="px-4 py-3 font-medium text-slate-blue">{s.seen}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-blue">Không có dữ liệu thống kê</div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Session Detail Modal */}
            <AnimatePresence>
                {showSessionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-midnight-indigo/40 backdrop-blur-sm"
                            onClick={() => setShowSessionModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-platinum-tint bg-cloud-mist/30">
                                <h3 className="font-bold text-midnight-indigo">Chi tiết phiên ra vào</h3>
                                <button onClick={() => setShowSessionModal(false)} className="p-1.5 hover:bg-platinum-tint rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-blue" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {sessionDetail ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-blue uppercase mb-1">Biển số nhận diện</div>
                                                <div className="text-xl font-black font-mono text-midnight-indigo">{sessionDetail.plate_number || 'Không xác định'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-slate-blue uppercase mb-1">Trạng thái</div>
                                                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${sessionDetail.session_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {sessionDetail.session_status === 'completed' ? 'Đã hoàn thành' : 'Đang trong bãi'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border border-platinum-tint rounded-xl p-4">
                                                <div className="text-[10px] font-bold text-slate-blue uppercase mb-3 flex items-center gap-1"><ArrowRight className="w-3 h-3 text-emerald-500" /> Giờ vào</div>
                                                <div className="font-bold text-sm text-midnight-indigo">{formatDateTime(sessionDetail.check_in_time)}</div>
                                            </div>
                                            <div className="border border-platinum-tint rounded-xl p-4">
                                                <div className="text-[10px] font-bold text-slate-blue uppercase mb-3 flex items-center gap-1"><ArrowLeft className="w-3 h-3 text-orange-500" /> Giờ ra</div>
                                                <div className="font-bold text-sm text-midnight-indigo">{formatDateTime(sessionDetail.check_out_time)}</div>
                                            </div>
                                        </div>

                                        {sessionDetail.image_url && (
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-blue uppercase mb-2">Ảnh nhận diện (Gần nhất)</div>
                                                <img src={sessionDetail.image_url} alt="Vehicle Snapshot" className="w-full rounded-xl border border-platinum-tint shadow-sm object-cover max-h-64" />
                                            </div>
                                        )}

                                        {sessionDetail.user_id && (
                                            <div className="flex items-center gap-3 p-3 bg-cloud-mist/30 rounded-xl border border-platinum-tint">
                                                <div className="w-10 h-10 rounded-full bg-action-blue/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-action-blue" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-midnight-indigo">Đã định danh chủ xe</div>
                                                    <div className="text-[10px] text-slate-blue font-mono">{sessionDetail.user_id}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 flex justify-center"><RefreshCw className="w-6 h-6 text-action-blue animate-spin" /></div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ExportReportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                endpoint="/reports/gate-access/exports"
                title="Xuất báo cáo ra vào khuôn viên"
            />
        </div>
    );
}

// Icon helper components
const ArrowRight = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
const ArrowLeft = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
