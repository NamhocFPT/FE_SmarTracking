import { Award, BarChart3, Building2, Calendar, ChevronRight, Clock, FileText, Grid, Info, TrendingUp, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { getRoomAnalytics } from '../../service/sysAdminServices';
import { get } from '../../utils/request';
import ExportReportModal from '../../component/ExportReportModal';

const RoomUsageAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetail, setRoomDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Filters
    const [preset, setPreset] = useState('month');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [siteName, setSiteName] = useState('');

    const fetchDashboard = useCallback(async () => {
        if (preset === 'custom' && (!from || !to)) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = {
                preset,
                ...(preset === 'custom' && { from, to }),
                ...(siteName && { siteName })
            };
            const res = await getRoomAnalytics(params);
            if (res?.success) {
                setData(res.data);
            } else {
                throw new Error(res?.message || 'Không thể tải dữ liệu phân tích.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống khi tải báo cáo.');
        } finally {
            setLoading(false);
        }
    }, [preset, from, to, siteName]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleRoomClick = async (roomId) => {
        setSelectedRoomId(roomId);
        setLoadingDetail(true);
        try {
            const queryParams = `?preset=${preset}${preset === 'custom' ? `&from=${from}&to=${to}` : ''}`;
            const res = await get(`/analytics/rooms/${roomId}/detail${queryParams}`);
            if (res?.success) {
                setRoomDetail(res.data);
            } else {
                throw new Error(res?.message || 'Không thể tải chi tiết phòng.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi khi tải chi tiết phòng.');
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-platinum-tint pb-5">
                <div>
                    <h2 className="text-xl font-bold text-midnight-indigo flex items-center gap-2.5">
                        <BarChart3 className="w-6 h-6 text-action-blue" />
                        Phân tích Hiệu suất Sử dụng Phòng họp
                    </h2>
                    <p className="text-xs text-slate-blue mt-1">
                        Theo dõi tần suất đặt phòng, tỷ lệ lấp đầy thực tế và phân tích chi tiết hiệu năng phòng họp.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsExportOpen(true)}
                        className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
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
                    <label className="block text-[10px] font-bold text-slate-blue uppercase">Tòa nhà (Site)</label>
                    <input 
                        type="text" 
                        value={siteName} 
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="Nhập tên tòa nhà..."
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
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tỷ lệ đặt phòng</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.summary.reservationUtilizationRate}%</span>
                            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> Hiệu suất
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tỷ lệ sử dụng thực tế</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.summary.roomOccupancyRate}%</span>
                            <span className="text-xs text-slate-blue font-medium">Từ cảm biến phòng</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tổng giờ đặt trước</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.summary.totalBookedHours} giờ</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-2">
                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Số giờ dùng thực tế</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-midnight-indigo">{data.summary.actualUsedHours} giờ</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rooms List Table */}
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30">
                        <h3 className="font-bold text-midnight-indigo">So sánh hiệu suất giữa các phòng</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-slate-50/50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider">Tên phòng</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Giờ đặt</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Giờ dùng thực tế</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-right">Tỷ lệ sử dụng</th>
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
                                    data?.rooms?.map((room) => (
                                        <tr 
                                            key={room.roomId} 
                                            onClick={() => handleRoomClick(room.roomId)}
                                            className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-blue" />
                                                    <span className="font-bold text-midnight-indigo text-xs">{room.roomName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-semibold text-slate-blue">{room.bookedHours}h</td>
                                            <td className="px-6 py-4 text-right text-xs font-semibold text-slate-blue">
                                                {room.actualHours !== null ? `${room.actualHours}h` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-bold text-midnight-indigo">
                                                        {room.reservationUtilizationRate}%
                                                    </span>
                                                    {room.roomOccupancyRate !== null && (
                                                        <span className="text-[10px] text-green-500 font-semibold bg-green-50 px-1.5 py-0.5 rounded-md">
                                                            Thực tế: {room.roomOccupancyRate}%
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-blue">
                                                <ChevronRight className="w-4 h-4 ml-auto" />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Trend Graph */}
                <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                    <h3 className="font-bold text-midnight-indigo text-sm">Xu hướng đặt phòng</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={data?.trend || []}>
                                    <defs>
                                        <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#1e90ff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="meetingCount" stroke="#1e90ff" strokeWidth={2} fillOpacity={1} fill="url(#colorMeetings)" name="Số cuộc họp" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Room Detail Modal (Drilldown) */}
            {selectedRoomId && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-action-blue" />
                                Chi tiết phòng: {roomDetail?.room?.roomName || 'Đang tải...'}
                            </h3>
                            <button onClick={() => setSelectedRoomId(null)} className="text-slate-blue hover:text-midnight-indigo">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {loadingDetail ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-20 bg-slate-100 rounded-xl" />
                                    <div className="h-40 bg-slate-100 rounded-xl" />
                                    <div className="h-40 bg-slate-100 rounded-xl" />
                                </div>
                            ) : (
                                <>
                                    {/* Room Spec Summary */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-blue uppercase">Vị trí</span>
                                            <p className="text-xs font-bold text-midnight-indigo mt-0.5">{roomDetail?.room?.areaName || 'Tầng 1'}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-blue uppercase">Sức chứa</span>
                                            <p className="text-xs font-bold text-midnight-indigo mt-0.5">{roomDetail?.room?.capacity || 10} người</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-blue uppercase">Hiệu suất đặt</span>
                                            <p className="text-xs font-bold text-midnight-indigo mt-0.5">{roomDetail?.reservationUtilizationRate}%</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-blue uppercase">Tỷ lệ lấp đầy thực tế</span>
                                            <p className="text-xs font-bold text-midnight-indigo mt-0.5">{roomDetail?.roomOccupancyRate !== null ? `${roomDetail?.roomOccupancyRate}%` : 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Heatmap Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-midnight-indigo uppercase">Mật độ sử dụng thực tế theo giờ trong ngày</h4>
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart data={roomDetail?.heatmap || []}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="hourOfDay" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#64748b' }} unit=":00" />
                                                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#64748b' }} name="Phút" />
                                                    <Tooltip formatter={(value) => [`${value} phút`, 'Thời lượng']} />
                                                    <Bar dataKey="actualMinutes" radius={[4, 4, 0, 0]}>
                                                        {(roomDetail?.heatmap || []).map((entry, index) => {
                                                            let barColor = '#3b82f6'; // default blue
                                                            if (entry.actualMinutes > 400) barColor = '#ef4444'; // red for busy
                                                            else if (entry.actualMinutes > 200) barColor = '#f59e0b'; // amber
                                                            return <Cell key={`cell-${index}`} fill={barColor} />;
                                                        })}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Past Meetings List */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-midnight-indigo uppercase">Lịch sử các cuộc họp gần đây</h4>
                                        <div className="border border-platinum-tint rounded-xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-platinum-tint text-[10px] font-bold text-slate-blue uppercase">
                                                        <th className="px-4 py-2">Tiêu đề cuộc họp</th>
                                                        <th className="px-4 py-2">Người tổ chức</th>
                                                        <th className="px-4 py-2">Thời gian đặt trước</th>
                                                        <th className="px-4 py-2">Thời gian sử dụng thực tế</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-platinum-tint text-xs text-midnight-indigo">
                                                    {roomDetail?.meetings?.map((meeting) => (
                                                        <tr key={meeting.meetingId}>
                                                            <td className="px-4 py-3 font-semibold">{meeting.title}</td>
                                                            <td className="px-4 py-3">{meeting.organizerName}</td>
                                                            <td className="px-4 py-3 text-slate-blue">
                                                                {new Date(meeting.reservedStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.reservedEndTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-blue">
                                                                {meeting.actualStartTime ? (
                                                                    <span>
                                                                        {new Date(meeting.actualStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {meeting.actualEndTime ? new Date(meeting.actualEndTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa kết thúc'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded">Không diễn ra</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            <ExportReportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
        </div>
    );
};

export default RoomUsageAnalytics;
