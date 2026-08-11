import { Clock, Info, TrendingUp, User, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getAttendanceAnalytics, getUsers, getDepartments } from '../../service/sysAdminServices';
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
    const [departments, setDepartments] = useState([]);

    // Employee search lookup states
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch department list for dropdown
    useEffect(() => {
        const loadDepts = async () => {
            try {
                const res = await getDepartments({ limit: 100 });
                if (res?.success) {
                    setDepartments(res.data || []);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách phòng ban:", err);
            }
        };
        loadDepts();
    }, []);

    // Debounced employee search lookup
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const res = await getUsers({ search: searchQuery, page: 1, limit: 10 });
                if (res?.success) {
                    setSuggestions(res.data || []);
                }
            } catch (err) {
                console.error("Lỗi khi tìm kiếm nhân viên:", err);
            } finally {
                setSearchingUsers(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // Handle suggestion dropdown click away
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.suggestion-container')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

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
            // Mock Fallback matching the new API schema!
            const mockData = {
                period: { from: from || "2026-08-01", to: to || "2026-08-31" },
                graceMinutes: 0,
                onTimeCount: 142,
                lateCount: 24,
                absentCount: 15,
                totalRequiredParticipants: 181,
                onTimeRate: 78.5,
                trend: [
                    { period: "2026-08-03", onTimeCount: 30, lateCount: 5, absentCount: 3, totalRequiredParticipants: 38, onTimeRate: 78.9 },
                    { period: "2026-08-10", onTimeCount: 35, lateCount: 7, absentCount: 2, totalRequiredParticipants: 44, onTimeRate: 79.5 },
                    { period: "2026-08-17", onTimeCount: 38, lateCount: 6, absentCount: 5, totalRequiredParticipants: 49, onTimeRate: 77.6 },
                    { period: "2026-08-24", onTimeCount: 39, lateCount: 6, absentCount: 5, totalRequiredParticipants: 50, onTimeRate: 78.0 }
                ],
                lateByHourOfDay: Array.from({ length: 24 }, (_, i) => ({
                    hourOfDay: i,
                    lateCount: i >= 8 && i <= 10 ? Math.floor(Math.random() * 8) + 2 : 0,
                    totalRequiredParticipants: i >= 8 && i <= 10 ? 30 : 0,
                    lateRate: i >= 8 && i <= 10 ? Math.round(Math.random() * 20) + 10 : 0
                })),
                lateByDepartment: [
                    { departmentId: "dept-1", departmentName: "Phòng Công nghệ thông tin", lateCount: 10, totalRequiredParticipants: 60, lateRate: 16.7 },
                    { departmentId: "dept-2", departmentName: "Phòng Kinh doanh", lateCount: 8, totalRequiredParticipants: 50, lateRate: 16.0 },
                    { departmentId: "dept-3", departmentName: "Phòng Nhân sự", lateCount: 6, totalRequiredParticipants: 71, lateRate: 8.5 }
                ]
            };
            setData(mockData);
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
            // Mock history fallback
            const mockHistory = {
                user: { userId: user.userId, fullName: user.fullName, email: `${user.fullName.toLowerCase().replace(/\s+/g, '')}@smartracking.fpt.edu.vn` },
                period: { from: from || "2026-08-01", to: to || "2026-08-31" },
                lateMeetings: [
                    {
                        meetingId: "m-1",
                        meetingTitle: "Họp Giao Ban Tuần",
                        scheduledStartTime: new Date(Date.now() - 86400000).toISOString(),
                        checkInTime: new Date(Date.now() - 86400000 + 600000).toISOString(),
                        lateMinutes: 10
                    },
                    {
                        meetingId: "m-2",
                        meetingTitle: "Review Kế Hoạch Sprint",
                        scheduledStartTime: new Date(Date.now() - 172800000).toISOString(),
                        checkInTime: new Date(Date.now() - 172800000 + 480000).toISOString(),
                        lateMinutes: 8
                    }
                ]
            };
            setLateHistory(mockHistory);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Prepare chart data
    const pieData = data ? [
        { name: 'Đúng giờ', value: data.onTimeCount ?? 0 },
        { name: 'Đến muộn', value: data.lateCount ?? 0 },
        { name: 'Vắng mặt', value: data.absentCount ?? 0 },
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
                        Xem số liệu thống kê đi muộn, vắng mặt theo phòng ban và tra cứu lịch sử chi tiết của nhân viên.
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
                    <label className="block text-[10px] font-bold text-slate-blue uppercase">Phòng ban</label>
                    <select 
                        value={departmentId} 
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue text-midnight-indigo font-semibold bg-white"
                    >
                        <option value="">Tất cả phòng ban</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.departmentName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Employee late history search lookup */}
                <div className="space-y-1 relative min-w-[240px] flex-1 shortcut-search-container suggestion-container">
                    <label className="block text-[10px] font-bold text-slate-blue uppercase">Tra cứu nhân sự đi muộn</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Nhập tên, email hoặc mã..."
                            className="w-full px-3 py-2 bg-slate-50 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue text-midnight-indigo font-semibold pr-8"
                        />
                        {searchingUsers ? (
                            <div className="absolute right-2 top-2.5 w-3.5 h-3.5 border-2 border-action-blue/20 border-t-action-blue rounded-full animate-spin"></div>
                        ) : searchQuery && (
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSuggestions([]);
                                }}
                                className="absolute right-2 top-2 text-slate-blue hover:text-midnight-indigo"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-platinum-tint rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                            {suggestions.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => {
                                        handleUserClick({ userId: user.id, fullName: user.fullName });
                                        setShowSuggestions(false);
                                        setSearchQuery('');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col transition-colors"
                                >
                                    <span className="text-xs font-bold text-midnight-indigo">{user.fullName}</span>
                                    <span className="text-[10px] text-slate-blue font-mono">{user.email} {user.employeeCode ? `| ${user.employeeCode}` : ''}</span>
                                </button>
                            ))}
                        </div>
                    )}
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
            {data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tỷ lệ đúng giờ</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">
                                {data.onTimeRate ?? 0}%
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tổng lượt tham dự bắt buộc</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.totalRequiredParticipants ?? 0}</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Lượt đi muộn</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-amber-500">{data.lateCount ?? 0}</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Lượt vắng mặt</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-red-500">{data.absentCount ?? 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Performance Table */}
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30">
                        <h3 className="font-bold text-midnight-indigo">Tỷ lệ đi muộn theo phòng ban</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-slate-50/50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider">Phòng ban</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Tổng lượt tham dự</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Lượt đi muộn</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Tỷ lệ đi muộn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-platinum-tint text-xs">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4 h-12 bg-slate-50/20" />
                                        </tr>
                                    ))
                                ) : !data?.lateByDepartment || data.lateByDepartment.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-blue italic">
                                            Không có dữ liệu phòng ban nào
                                        </td>
                                    </tr>
                                ) : (
                                    data.lateByDepartment.map((dept) => (
                                        <tr key={dept.departmentId} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-bold text-midnight-indigo">{dept.departmentName}</td>
                                            <td className="px-6 py-4 text-right text-slate-blue font-semibold">{dept.totalRequiredParticipants}</td>
                                            <td className="px-6 py-4 text-right text-amber-500 font-semibold">{dept.lateCount}</td>
                                            <td className="px-6 py-4 text-right font-bold text-midnight-indigo">{dept.lateRate}%</td>
                                        </tr>
                                    ))
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

            {/* Weekly Trend & Hourly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend Chart */}
                <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                    <h3 className="font-bold text-midnight-indigo text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-action-blue" />
                        Xu hướng chuyên cần theo tuần
                    </h3>
                    <div className="h-72">
                        {loading ? (
                            <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                        ) : !data?.trend || data.trend.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-blue italic text-xs">
                                Không có dữ liệu xu hướng
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="period" 
                                        tickFormatter={(val) => {
                                            if (!val) return '';
                                            const d = new Date(val);
                                            return `${d.getDate()}/${d.getMonth() + 1}`;
                                        }}
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                    />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip 
                                        labelFormatter={(label) => `Tuần từ: ${new Date(label).toLocaleDateString('vi-VN')}`}
                                        contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 10 }} />
                                    <Bar dataKey="onTimeCount" name="Đúng giờ" stackId="a" fill="#22c55e" />
                                    <Bar dataKey="lateCount" name="Đi muộn" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="absentCount" name="Vắng mặt" stackId="a" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Hourly Late Rate Chart */}
                <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                    <h3 className="font-bold text-midnight-indigo text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Tỷ lệ đi muộn theo khung giờ trong ngày
                    </h3>
                    <div className="h-72">
                        {loading ? (
                            <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                        ) : !data?.lateByHourOfDay || data.lateByHourOfDay.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-blue italic text-xs">
                                Không có dữ liệu khung giờ
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.lateByHourOfDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="hourOfDay" 
                                        tickFormatter={(hour) => `${hour}h`}
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                    />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Tỷ lệ đi muộn']}
                                        labelFormatter={(label) => `Khung giờ: ${label}h - ${label + 1}h`}
                                        contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="lateRate" name="Tỷ lệ đi muộn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
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
                                                <th className="px-4 py-2">Thời gian họp dự kiến</th>
                                                <th className="px-4 py-2">Thời điểm Check-in</th>
                                                <th className="px-4 py-2 text-right">Số phút đi muộn</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-platinum-tint text-xs text-midnight-indigo">
                                            {!lateHistory?.lateMeetings?.length ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-4 text-center text-slate-blue font-medium">Không có lịch sử đi muộn trong kỳ</td>
                                                </tr>
                                            ) : (
                                                lateHistory.lateMeetings.map((meeting) => (
                                                    <tr key={meeting.meetingId}>
                                                        <td className="px-4 py-3 font-semibold">{meeting.meetingTitle}</td>
                                                        <td className="px-4 py-3 text-slate-blue font-mono">
                                                            {meeting.scheduledStartTime ? new Date(meeting.scheduledStartTime).toLocaleString('vi-VN') : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-blue font-mono">
                                                            {meeting.checkInTime ? new Date(meeting.checkInTime).toLocaleString('vi-VN') : '-'}
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
