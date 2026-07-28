import React, { useState, useEffect, useCallback } from 'react';
import { 
    Clock, Calendar, FileText, UserCheck, AlertCircle, 
    TrendingUp, Info, ChevronRight, X, User, Users
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { getAttendanceAnalytics } from '../../service/sysAdminServices';
import { get } from '../../utils/request';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#64748b'];

const EmployeeOnTimeAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [lateHistory, setLateHistory] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Filters
    const [preset, setPreset] = useState('month');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const fetchAttendanceDashboard = useCallback(async () => {
        if (preset === 'custom' && (!from || !to)) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = {
                preset,
                ...(preset === 'custom' && { from, to }),
                ...(departmentId && { departmentId })
            };
            const res = await getAttendanceAnalytics(params);
            if (res?.success) {
                setData(res.data);
            } else {
                throw new Error(res?.message || 'Không thể tải dữ liệu phân tích chuyên cần.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống khi tải báo cáo.');
        } finally {
            setLoading(false);
        }
    }, [preset, from, to, departmentId]);

    useEffect(() => {
        fetchAttendanceDashboard();
    }, [fetchAttendanceDashboard]);

    const handleUserClick = async (user) => {
        setSelectedUserId(user.userId);
        setSelectedUserName(user.fullName);
        setLoadingHistory(true);
        try {
            const queryParams = `?preset=${preset}${preset === 'custom' ? `&from=${from}&to=${to}` : ''}`;
            const res = await get(`/analytics/attendance/on-time-rate/users/${user.userId}/late-history${queryParams}`);
            if (res?.success) {
                setLateHistory(res.data);
            } else {
                throw new Error(res?.message || 'Không thể tải lịch sử đi muộn.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi khi tải chi tiết đi muộn.');
        } finally {
            setLoadingHistory(false);
        }
    };

    // Prepare chart data
    const pieData = data?.summary ? [
        { name: 'Đúng giờ', value: data.summary.checkedInCount - data.summary.lateCount },
        { name: 'Đến muộn', value: data.summary.lateCount },
        { name: 'Vắng mặt', value: data.summary.absentCount },
    ] : [];

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-platinum-tint pb-5">
                <div>
                    <h2 className="text-xl font-bold text-midnight-indigo flex items-center gap-2.5">
                        <Clock className="w-6 h-6 text-action-blue" />
                        Phân tích Tỷ lệ Đúng giờ
                    </h2>
                    <p className="text-xs text-slate-blue mt-1">
                        Xem số liệu thống kê đi muộn, vắng mặt của toàn bộ nhân viên và lịch sử chi tiết theo cá nhân.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-blue uppercase">Bộ lọc nhanh</label>
                    <select 
                        value={preset} 
                        onChange={(e) => setPreset(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue text-midnight-indigo font-semibold"
                    >
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="custom">Tùy chọn khoảng</option>
                    </select>
                </div>

                {preset === 'custom' && (
                    <>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-blue uppercase">Từ ngày</label>
                            <input 
                                type="date" 
                                value={from} 
                                onChange={(e) => setFrom(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue text-midnight-indigo"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-blue uppercase">Đến ngày</label>
                            <input 
                                type="date" 
                                value={to} 
                                onChange={(e) => setTo(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue text-midnight-indigo"
                            />
                        </div>
                    </>
                )}

                <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-blue uppercase">Mã phòng ban (ID)</label>
                    <input 
                        type="text" 
                        value={departmentId} 
                        onChange={(e) => setDepartmentId(e.target.value)}
                        placeholder="Nhập ID phòng ban..."
                        className="px-3 py-2 bg-slate-50 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue text-midnight-indigo"
                    />
                </div>
            </div>

            {/* Error view */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start text-sm">
                    <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            {data?.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tỷ lệ đúng giờ</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">
                                {data.summary.totalCheckIns > 0 
                                    ? Math.round(((data.summary.totalCheckIns - data.summary.lateCount) / data.summary.totalCheckIns) * 100)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tổng số cuộc họp tham dự</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.summary.totalCheckIns || 0}</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Số lượt đi muộn</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-red-500">{data.summary.lateCount || 0}</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Thời gian muộn trung bình</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.summary.averageLateMinutes || 0} phút</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users List Table */}
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30">
                        <h3 className="font-bold text-midnight-indigo">Hiệu suất chuyên cần theo nhân viên</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-slate-50/50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider">Họ và tên</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Tổng lượt tham dự</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Lượt đi muộn</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Tỷ lệ đúng giờ</th>
                                    <th className="px-6 py-3 text-right" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-platinum-tint">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4 h-12 bg-slate-50/20" />
                                        </tr>
                                    ))
                                ) : (
                                    data?.users?.map((user) => {
                                        const onTimeRate = user.totalCheckIns > 0 
                                            ? Math.round(((user.totalCheckIns - user.lateCount) / user.totalCheckIns) * 100)
                                            : 100;
                                        return (
                                            <tr 
                                                key={user.userId} 
                                                onClick={() => handleUserClick(user)}
                                                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-slate-blue" />
                                                        <span className="font-bold text-midnight-indigo text-xs">{user.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs font-semibold text-slate-blue">{user.totalCheckIns}</td>
                                                <td className="px-6 py-4 text-right text-xs font-semibold text-red-500">{user.lateCount}</td>
                                                <td className="px-6 py-4 text-right text-xs font-bold text-midnight-indigo">{onTimeRate}%</td>
                                                <td className="px-6 py-4 text-right text-slate-blue">
                                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status breakdown chart */}
                <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                    <h3 className="font-bold text-midnight-indigo text-sm">Phân bố trạng thái chuyên cần</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend style={{ fontSize: 10 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Late History Modal (Drilldown) */}
            {selectedUserId && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo flex items-center gap-2">
                                <User className="w-5 h-5 text-action-blue" />
                                Chi tiết đi muộn: {selectedUserName}
                            </h3>
                            <button onClick={() => setSelectedUserId(null)} className="text-slate-blue hover:text-midnight-indigo">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            {loadingHistory ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-10 bg-slate-100 rounded-lg" />
                                    <div className="h-10 bg-slate-100 rounded-lg" />
                                </div>
                            ) : (
                                <div className="border border-platinum-tint rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-platinum-tint text-[10px] font-bold text-slate-blue uppercase">
                                                <th className="px-4 py-2">Tiêu đề cuộc họp</th>
                                                <th className="px-4 py-2">Thời gian họp</th>
                                                <th className="px-4 py-2 text-right">Số phút đi muộn</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-platinum-tint text-xs text-midnight-indigo">
                                            {!lateHistory?.meetings?.length ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-4 text-center text-slate-blue font-medium">Không có lịch sử đi muộn trong kỳ</td>
                                                </tr>
                                            ) : (
                                                lateHistory.meetings.map((meeting) => (
                                                    <tr key={meeting.meetingId}>
                                                        <td className="px-4 py-3 font-semibold">{meeting.title}</td>
                                                        <td className="px-4 py-3 text-slate-blue">
                                                            {new Date(meeting.startTime).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-red-500 font-bold">
                                                            {meeting.lateMinutes} phút
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeOnTimeAnalytics;
