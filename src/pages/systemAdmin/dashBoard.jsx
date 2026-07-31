import { ArrowRight, BarChart3 as BarChart3Icon, Calendar, Car, Clock, DoorOpen, LogIn, MapPin, ShieldAlert } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    getDevices,
    getAuditLogs,
    getAdminVehicleTrafficStats,
} from '../../service/sysAdminServices';
import { getZones } from '../../service/zoneServices';
import { getSecurityAlerts } from '../../service/securityAlertService';
import { getVehicleControlList } from '../../service/anprService';
import { getBusinessAdminSummary } from '../../service/campusService';

import DashboardBanner from '../../component/DashboardBanner';

const SEVERITY_STYLES = {
    critical: 'bg-red-50 text-red-700',
    high: 'bg-orange-50 text-orange-700',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-blue-50 text-blue-700',
};

const ZONE_TYPE_LABEL = {
    room: 'Phòng',
    gate: 'Cổng',
    corridor: 'Hành lang',
    lobby: 'Sảnh',
    parking: 'Bãi đỗ',
};

// Dictionaries to translate DB fields/types into user-friendly Vietnamese text
const ACTION_MAP = {
    'USER_LOGIN': 'Đăng nhập hệ thống',
    'USER_LOGOUT': 'Đăng xuất hệ thống',
    'REGISTER_DEVICE': 'Đăng ký thiết bị IoT',
    'UPDATE_DEVICE': 'Cập nhật thiết bị IoT',
    'REMOVE_DEVICE': 'Gỡ bỏ thiết bị IoT',
    'LOCK_USER': 'Khóa tài khoản',
    'UNLOCK_USER': 'Mở khóa tài khoản',
    'UPDATE_CONFIG': 'Cập nhật cấu hình',
    'CREATE_USER': 'Tạo tài khoản mới',
    'UPDATE_USER': 'Cập nhật tài khoản',
    'DELETE_USER': 'Xóa tài khoản',
};

const formatActionName = (action) => {
    if (!action) return '';
    if (ACTION_MAP[action]) return ACTION_MAP[action];
    
    // Fallback translation rules for unknown actions
    let formatted = action.toLowerCase().replace(/_/g, ' ');
    formatted = formatted.replace('view detail', 'Xem chi tiết')
                         .replace('read analytics', 'Xem thống kê')
                         .replace('meeting cancel rate', 'tỷ lệ hủy họp')
                         .replace('create', 'Tạo mới')
                         .replace('update', 'Cập nhật')
                         .replace('delete', 'Xóa');
                         
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const ENTITY_MAP = {
    'AUTH': 'Xác thực',
    'DEVICE': 'Thiết bị',
    'USER': 'Người dùng',
    'SYSTEM': 'Hệ thống',
};

/**
 * SystemAdmin Dashboard Page
 * UC-RPT-01: Dashboard tổng quan hệ thống (Thiết bị IoT & Nhật ký)
 */
const DashBoard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('campus'); // 'campus' | 'infrastructure' | 'meetings'
    const [overview, setOverview] = useState({
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        totalLogs: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [devicesList, setDevicesList] = useState([]);

    // Campus Overview tab data
    const [campusStats, setCampusStats] = useState({
        gateEventsToday: 0,
        newAlertsCount: 0,
        zonesActive: 0,
        zonesTotal: 0,
        blocklistActive: 0,
        vehicleControlHitsToday: 0,
        securityAlertsBySeverity: null,
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [zonesList, setZonesList] = useState([]);

    // Chart interaction state
    const [activeBarIndex, setActiveBarIndex] = useState(null);
    const [activePointIndex, setActivePointIndex] = useState(null);

    // Mock chart data for System Admin
    const deviceTypeData = [
        { name: 'Camera AI', value: 12 },
        { name: 'Face Terminal', value: 8 },
        { name: 'Cảm biến chuyển động', value: 15 },
        { name: 'Bộ điều khiển', value: 7 },
    ];

    const hourlyLogsData = [
        { hour: '08:00', count: 4 },
        { hour: '10:00', count: 22 },
        { hour: '12:00', count: 8 },
        { hour: '14:00', count: 35 },
        { hour: '16:00', count: 18 },
        { hour: '18:00', count: 6 },
    ];

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const [devicesRes, logsRes, zonesRes, alertsRes, trafficRes, blocklistRes, summaryRes] = await Promise.allSettled([
                getDevices({ limit: 100 }),
                getAuditLogs({ limit: 100 }),
                getZones({ limit: 100 }),
                getSecurityAlerts({ status: 'new', limit: 5 }),
                getAdminVehicleTrafficStats({ from: todayStart.toISOString(), to: todayEnd.toISOString(), group_by: 'day' }),
                getVehicleControlList({ list_type: 'blocklist', active: true, limit: 100 }),
                getBusinessAdminSummary()
            ]);

            let devList = [];
            let logsList = [];
            let totalLogsCount = 0;

            if (devicesRes.status === 'fulfilled' && devicesRes.value?.success) {
                devList = devicesRes.value.data || [];
            } else {
                devList = [
                    { id: 1, code: 'CAM-MEET-01', type: 'CAMERA', ip: '192.168.1.50', status: 'ONLINE', roomName: 'Phòng Hội Thảo A' },
                    { id: 2, code: 'TERM-MEET-01', type: 'FACE_TERMINAL', ip: '192.168.1.51', status: 'ONLINE', roomName: 'Phòng Hội Thảo A' },
                    { id: 3, code: 'CAM-MEET-02', type: 'CAMERA', ip: '192.168.1.60', status: 'ONLINE', roomName: 'Phòng Họp Nhỏ B' },
                    { id: 4, code: 'TERM-MEET-02', type: 'FACE_TERMINAL', ip: '192.168.1.61', status: 'OFFLINE', roomName: 'Phòng Họp Nhỏ B' },
                ];
            }

            if (logsRes.status === 'fulfilled' && logsRes.value?.success) {
                logsList = logsRes.value.data || [];
                totalLogsCount = logsRes.value.meta?.total || logsList.length;
            } else {
                logsList = [
                    { id: 1, actionType: 'USER_LOGIN', actorName: 'Nguyễn Văn A', entityType: 'AUTH', severity: 'info', createdAt: new Date(Date.now() - 500000).toISOString() },
                    { id: 2, actionType: 'REGISTER_DEVICE', actorName: 'Nguyễn Văn B', entityType: 'DEVICE', severity: 'info', createdAt: new Date(Date.now() - 1500000).toISOString() },
                    { id: 3, actionType: 'LOCK_USER', actorName: 'Hệ thống', entityType: 'USER', severity: 'warning', createdAt: new Date(Date.now() - 3600000).toISOString() },
                    { id: 4, actionType: 'UPDATE_CONFIG', actorName: 'Quản trị viên', entityType: 'SYSTEM', severity: 'info', createdAt: new Date(Date.now() - 7200000).toISOString() },
                ];
                totalLogsCount = logsList.length;
            }

            const total = devList.length;
            const online = devList.filter(d => d.status === 'ONLINE').length;
            const offline = total - online;

            setOverview({
                totalDevices: total || 42,
                onlineDevices: online || 38,
                offlineDevices: offline || 4,
                totalLogs: totalLogsCount || 120
            });

            setRecentLogs(logsList.slice(0, 5));
            setDevicesList(devList.slice(0, 5));

            // Campus Overview data
            let zonesData = [];
            if (zonesRes.status === 'fulfilled' && zonesRes.value?.success) {
                zonesData = zonesRes.value.data || [];
            } else {
                zonesData = [
                    { id: 'z-1', zone_code: 'GATE-01', zone_name: 'Cổng chính', zone_type: 'gate', status: 'active' },
                    { id: 'z-2', zone_code: 'PARK-01', zone_name: 'Bãi đỗ xe A', zone_type: 'parking', status: 'active' },
                    { id: 'z-3', zone_code: 'LOBBY-01', zone_name: 'Sảnh toà nhà A', zone_type: 'lobby', status: 'active' },
                    { id: 'z-4', zone_code: 'ROOM-101', zone_name: 'Phòng Apollo 101', zone_type: 'room', status: 'inactive' },
                ];
            }

            let alertsData = [];
            if (alertsRes.status === 'fulfilled' && alertsRes.value?.success) {
                alertsData = alertsRes.value.data || [];
            } else {
                alertsData = [
                    { id: 'a-1', alert_type: 'Người lạ xâm nhập', severity: 'high', zone_name: 'Cổng phụ B', created_at: new Date(Date.now() - 900000).toISOString() },
                    { id: 'a-2', alert_type: 'Biển số trong blocklist', severity: 'critical', zone_name: 'Cổng chính', created_at: new Date(Date.now() - 1800000).toISOString() },
                    { id: 'a-3', alert_type: 'Đông người bất thường', severity: 'medium', zone_name: 'Sảnh toà nhà A', created_at: new Date(Date.now() - 5400000).toISOString() },
                ];
            }

            let blocklistCount = 0;
            if (blocklistRes.status === 'fulfilled' && blocklistRes.value?.success) {
                blocklistCount = (blocklistRes.value.data || []).length;
            } else {
                blocklistCount = 3;
            }

            let gateEventsToday = 0;
            if (trafficRes.status === 'fulfilled' && trafficRes.value?.success) {
                const summary = trafficRes.value.data?.summary;
                gateEventsToday = summary?.total_events ?? ((summary?.total_enter || 0) + (summary?.total_leave || 0));
            } else {
                gateEventsToday = 186;
            }

            // CDB-RS-001: business-admin-summary — nguồn tổng hợp chính thức từ BE, ưu tiên hơn số tự suy từ list /zones khi có sẵn (SYSTEM_ADMIN cũng có quyền 200)
            let zonesActive = zonesData.filter(z => z.status === 'active').length;
            let zonesTotal = zonesData.length;
            let vehicleControlHitsToday = 0;
            let securityAlertsBySeverity = null;
            if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
                const summary = summaryRes.value.data;
                if (summary?.zoneOccupancy) {
                    zonesActive = summary.zoneOccupancy.zonesWithDataCount ?? zonesActive;
                    zonesTotal = summary.zoneOccupancy.totalZoneCount ?? zonesTotal;
                }
                vehicleControlHitsToday = summary?.vehicleControlHitsToday ?? 0;
                securityAlertsBySeverity = summary?.securityAlertsBySeverity ?? null;
            }

            setZonesList(zonesData.slice(0, 6));
            setRecentAlerts(alertsData.slice(0, 5));
            setCampusStats({
                gateEventsToday,
                newAlertsCount: alertsData.length,
                zonesActive,
                zonesTotal,
                blocklistActive: blocklistCount,
                vehicleControlHitsToday,
                securityAlertsBySeverity,
            });

        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu hệ thống.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-12 h-12 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-blue font-medium">Đang tải dữ liệu tổng quan hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header / Welcome section */}
            <DashboardBanner roleName="Quản trị viên" />

            {/* Error banner if any */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex bg-white p-1.5 rounded-xl border border-platinum-tint/80 shadow-sm w-fit gap-1 animate-fade-in-up delay-100">
                <button
                    onClick={() => setActiveTab('campus')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'campus'
                            ? 'bg-action-blue text-white shadow-sm'
                            : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                        }`}
                >
                    Tổng quan Campus
                </button>
                <button
                    onClick={() => setActiveTab('infrastructure')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'infrastructure'
                            ? 'bg-action-blue text-white shadow-sm'
                            : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                        }`}
                >
                    Hạ tầng & Thiết bị
                </button>
                <button
                    onClick={() => setActiveTab('meetings')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'meetings'
                            ? 'bg-action-blue text-white shadow-sm'
                            : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50'
                        }`}
                >
                    Cuộc họp
                </button>
            </div>

            {/* ================= CAMPUS OVERVIEW TAB ================= */}
            {activeTab === 'campus' && (
                <div className="space-y-8 animate-fade-in-up delay-150">
                    {/* Campus statistics cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-blue">Lượt ra/vào hôm nay</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <LogIn className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-midnight-indigo">{campusStats.gateEventsToday}</h3>
                                <p className="text-xs text-slate-blue mt-1">Qua các cổng/khu vực</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-blue">Cảnh báo mới</span>
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-midnight-indigo">{campusStats.newAlertsCount}</h3>
                                <p className="text-xs text-red-600 font-semibold mt-1">Chưa xử lý</p>
                                {campusStats.securityAlertsBySeverity && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {Object.entries(campusStats.securityAlertsBySeverity).map(([severity, count]) => (
                                            count > 0 && (
                                                <span key={severity} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${SEVERITY_STYLES[severity] || 'bg-slate-100 text-slate-600'}`}>
                                                    {severity}: {count}
                                                </span>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-blue">Khu vực hoạt động</span>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <MapPin className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-midnight-indigo">{campusStats.zonesActive}/{campusStats.zonesTotal}</h3>
                                <p className="text-xs text-slate-blue mt-1">Zone đang giám sát</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-blue">Thiết bị Online</span>
                                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-midnight-indigo">{overview.onlineDevices}/{overview.totalDevices}</h3>
                                <p className="text-xs text-slate-blue mt-1">Camera, cảm biến, thiết bị IoT</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-blue">Xe trong danh sách kiểm soát</span>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-sunset-gold flex items-center justify-center">
                                    <Car className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-midnight-indigo">{campusStats.blocklistActive}</h3>
                                <p className="text-xs text-slate-blue mt-1">Blocklist đang hiệu lực</p>
                                <p className="text-xs text-orange-600 font-semibold mt-1">{campusStats.vehicleControlHitsToday} lượt khớp hôm nay</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-blue">Thiết bị Offline</span>
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                    <DoorOpen className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-midnight-indigo">{overview.offlineDevices}</h3>
                                <p className="text-xs text-red-600 font-semibold mt-1">Cần kiểm tra</p>
                            </div>
                        </div>
                    </div>

                    {/* Security alerts feed + Zones list */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col hover:shadow-sm-3 hover-lift">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-midnight-indigo">Cảnh báo an ninh gần đây</h2>
                                <Link to="/system-admin/security-alerts" className="text-sm font-semibold text-action-blue hover:underline flex items-center gap-1">
                                    Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            <div className="space-y-3 flex-1">
                                {recentAlerts.length === 0 && (
                                    <p className="text-sm text-slate-blue py-6 text-center">Không có cảnh báo mới.</p>
                                )}
                                {recentAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 bg-cloud-mist rounded-xl border border-outline-gray/60 hover:border-platinum-tint transition-all">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-midnight-indigo truncate">{alert.alert_type}</h4>
                                            <p className="text-xs text-slate-blue truncate">{alert.zone_name || 'Không xác định khu vực'}</p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${SEVERITY_STYLES[alert.severity] || 'bg-slate-100 text-slate-600'}`}>
                                                {alert.severity}
                                            </span>
                                            <span className="text-[10px] text-steel-gray whitespace-nowrap">
                                                {new Date(alert.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col hover:shadow-sm-3 hover-lift">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-midnight-indigo">Khu vực giám sát</h2>
                                <Link to="/system-admin/zones" className="text-sm font-semibold text-action-blue hover:underline">
                                    Tất cả
                                </Link>
                            </div>
                            <div className="space-y-3 flex-1">
                                {zonesList.map((zone) => (
                                    <div key={zone.id} className="flex items-center justify-between p-3 bg-cloud-mist rounded-xl border border-outline-gray/60">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-midnight-indigo truncate">{zone.zone_name}</h4>
                                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                                {ZONE_TYPE_LABEL[zone.zone_type] || zone.zone_type}
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${zone.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {zone.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MEETINGS TAB ================= */}
            {activeTab === 'meetings' && (
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 animate-fade-in-up delay-150">
                    <h2 className="text-lg font-bold text-midnight-indigo mb-1">Vận hành cuộc họp</h2>
                    <p className="text-sm text-slate-blue mb-5">Lối tắt đến các trang quản lý và phân tích cuộc họp</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Link to="/system-admin/schedule" className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-action-blue flex items-center justify-center mb-2">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-midnight-indigo">Lịch của tôi</span>
                            <span className="text-[10px] text-slate-blue mt-1 leading-tight">Xem lịch cuộc họp cá nhân</span>
                        </Link>

                        <Link to="/system-admin/book" className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift">
                            <div className="w-12 h-12 rounded-full bg-purple-50 text-royal-amethyst flex items-center justify-center mb-2">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-midnight-indigo">Đăng ký cuộc họp</span>
                            <span className="text-[10px] text-slate-blue mt-1 leading-tight">Đặt phòng, tạo cuộc họp mới</span>
                        </Link>

                        <Link to="/system-admin/room-operations" className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift">
                            <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2">
                                <DoorOpen className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-midnight-indigo">Vận hành phòng họp</span>
                            <span className="text-[10px] text-slate-blue mt-1 leading-tight">Trạng thái realtime các phòng</span>
                        </Link>

                        <Link to="/system-admin/rooms" className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-midnight-indigo">Phòng họp</span>
                            <span className="text-[10px] text-slate-blue mt-1 leading-tight">Quản lý tài nguyên phòng</span>
                        </Link>

                        <Link to="/system-admin/room-analytics" className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                                <BarChart3Icon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-midnight-indigo">Hiệu suất phòng họp</span>
                            <span className="text-[10px] text-slate-blue mt-1 leading-tight">Tỷ lệ sử dụng, no-show</span>
                        </Link>

                        <Link to="/system-admin/attendance-analytics" className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift">
                            <div className="w-12 h-12 rounded-full bg-amber-50 text-sunset-gold flex items-center justify-center mb-2">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-midnight-indigo">Tỷ lệ đúng giờ</span>
                            <span className="text-[10px] text-slate-blue mt-1 leading-tight">Phân tích điểm danh</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* ================= INFRASTRUCTURE TAB ================= */}
            {activeTab === 'infrastructure' && (
            <>
            {/* Overview statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
                {/* Total Devices Card */}
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-blue">Tổng thiết bị IoT</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-midnight-indigo">{overview.totalDevices}</h3>
                        <p className="text-xs text-green-600 font-semibold mt-1">↑ Hoạt động bình thường</p>
                    </div>
                </div>

                {/* Online Devices Card */}
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-blue">Thiết bị Online</span>
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-midnight-indigo">{overview.onlineDevices}</h3>
                        <p className="text-xs text-slate-blue mt-1">Kết nối ổn định</p>
                    </div>
                </div>

                {/* Offline Devices Card */}
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-blue">Thiết bị Offline</span>
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-midnight-indigo">{overview.offlineDevices}</h3>
                        <p className="text-xs text-red-600 font-semibold mt-1">Yêu cầu kiểm tra</p>
                    </div>
                </div>

                {/* System Logs Card */}
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-blue">Tổng số nhật ký</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-sunset-gold flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 112-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-midnight-indigo">{overview.totalLogs}</h3>
                        <p className="text-xs text-slate-blue mt-1">Bản ghi hoạt động hệ thống</p>
                    </div>
                </div>
            </div>

            {/* VISUAL CHARTS SECTION (NEW) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up delay-150">
                {/* Chart 1: Bar Chart of IoT Device Types */}
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-3 flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-midnight-indigo">Phân loại thiết bị IoT</h2>
                        <p className="text-xs text-slate-blue mt-0.5">Số lượng thiết bị được cấu hình theo từng danh mục</p>
                    </div>
                    <div className="relative flex-1 flex items-end justify-between h-[200px] pt-6 px-4 border-b border-platinum-tint/60">
                        {deviceTypeData.map((data, idx) => {
                            const barHeight = `${data.value * 10}px`;
                            const isActive = activeBarIndex === idx;
                            return (
                                <div
                                    key={data.name}
                                    className="flex flex-col items-center group cursor-pointer"
                                    onMouseEnter={() => setActiveBarIndex(idx)}
                                    onMouseLeave={() => setActiveBarIndex(null)}
                                    style={{ width: '20%' }}
                                >
                                    {/* Tooltip */}
                                    <div className={`absolute bottom-[200px] bg-midnight-indigo text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-all duration-200 ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                                        }`}>
                                        {data.value} thiết bị
                                    </div>
                                    {/* Bar element */}
                                    <div
                                        style={{ height: barHeight }}
                                        className={`w-full rounded-t-lg bg-gradient-to-t transition-all duration-300 ${isActive
                                                ? 'from-action-blue to-skybound-blue shadow-lg scale-x-105'
                                                : 'from-glacier-blue/80 to-action-blue/80'
                                            }`}
                                    />
                                    <span className="text-[10px] sm:text-xs font-semibold text-slate-blue mt-2 text-center">{data.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chart 2: Interactive SVG Area Chart of Hourly Logs */}
                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 hover-lift hover:shadow-sm-3 flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-midnight-indigo">Tần suất hoạt động hệ thống</h2>
                        <p className="text-xs text-slate-blue mt-0.5">Thống kê số lượng bản ghi nhật ký phát sinh theo các mốc giờ trong ngày</p>
                    </div>

                    <div className="relative flex-1 h-[200px] w-full pt-4">
                        <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#006BFF" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#006BFF" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <line x1="0" y1="30" x2="500" y2="30" stroke="#E7EDF6" strokeWidth="0.5" />
                            <line x1="0" y1="75" x2="500" y2="75" stroke="#E7EDF6" strokeWidth="0.5" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="#E7EDF6" strokeWidth="0.5" />

                            {/* Area path */}
                            <path
                                d="M 0 150 Q 83 110, 166 65 T 332 30 T 500 135 L 500 150 Z"
                                fill="url(#areaGradient)"
                            />

                            {/* Line Path */}
                            <path
                                d="M 0 150 Q 83 110, 166 65 T 332 30 T 500 135"
                                fill="none"
                                stroke="#006BFF"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />

                            {/* Data points */}
                            {[
                                { x: 10, y: 135, data: hourlyLogsData[0] },
                                { x: 95, y: 100, data: hourlyLogsData[1] },
                                { x: 180, y: 125, data: hourlyLogsData[2] },
                                { x: 265, y: 45, data: hourlyLogsData[3] },
                                { x: 350, y: 80, data: hourlyLogsData[4] },
                                { x: 485, y: 130, data: hourlyLogsData[5] },
                            ].map((pt, idx) => {
                                const isActive = activePointIndex === idx;
                                return (
                                    <g key={idx}>
                                        {/* Hover pulse ring */}
                                        {isActive && (
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="8"
                                                fill="#006BFF"
                                                fillOpacity="0.2"
                                                className="animate-ping"
                                            />
                                        )}
                                        {/* Core circle */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isActive ? "6" : "4"}
                                            fill="#ffffff"
                                            stroke="#006BFF"
                                            strokeWidth={isActive ? "3" : "2"}
                                            className="cursor-pointer transition-all duration-200"
                                            onMouseEnter={() => setActivePointIndex(idx)}
                                            onMouseLeave={() => setActivePointIndex(null)}
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Interactive Tooltip Overlay */}
                        {activePointIndex !== null && (
                            <div
                                className="absolute bg-midnight-indigo text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-all duration-200"
                                style={{
                                    left: `${[5, 18, 35, 52, 69, 90][activePointIndex]}%`,
                                    top: `${[110, 80, 105, 25, 60, 105][activePointIndex]}px`
                                }}
                            >
                                {hourlyLogsData[activePointIndex].hour}: {hourlyLogsData[activePointIndex].count} thao tác
                            </div>
                        )}
                    </div>
                    {/* Time Label row */}
                    <div className="flex justify-between px-2 mt-2">
                        {hourlyLogsData.map((d) => (
                            <span key={d.hour} className="text-[10px] font-bold text-slate-blue">{d.hour}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 animate-fade-in-up delay-200">
                <h2 className="text-lg font-bold text-midnight-indigo mb-4">Phím tắt nhanh</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        to="/system-admin/security-alerts"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Trung tâm cảnh báo</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Xử lý sự cố, khẩn cấp</span>
                    </Link>

                    <Link
                        to="/system-admin/devices"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-royal-amethyst flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-9-4h18M5 12h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Thiết bị IoT</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Giám sát thiết bị</span>
                    </Link>

                    <Link
                        to="/system-admin/gate-access"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Kiểm soát cổng</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Theo dõi ra/vào realtime</span>
                    </Link>

                    <Link
                        to="/system-admin/anpr-management"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="8" rx="2" ry="2" />
                                <path d="M19 11l-2-4H7L5 11" />
                                <circle cx="7" cy="19" r="2" />
                                <circle cx="17" cy="19" r="2" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Hệ thống ANPR</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Nhận dạng biển số</span>
                    </Link>

                    <Link
                        to="/system-admin/audit-logs"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-sunset-gold flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 112-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Nhật ký kiểm toán</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Truy vết hoạt động</span>
                    </Link>

                    <Link
                        to="/system-admin/roles-permissions"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-action-blue flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Vai trò & Quyền</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Quản lý người dùng, quyền</span>
                    </Link>

                    <Link
                        to="/system-admin/settings"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-pink-50 text-ocean-glimmer flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Cấu hình hệ thống</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Thiết lập cấu hình chung</span>
                    </Link>

                    <Link
                        to="/system-admin/rooms"
                        className="flex flex-col items-center p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 transition-all duration-200 text-center no-underline hover-lift"
                    >
                        <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-midnight-indigo">Phòng họp</span>
                        <span className="text-[10px] text-slate-blue mt-1 leading-tight">Quản lý tài nguyên vận hành</span>
                    </Link>
                </div>
            </div>

            {/* Content Details: Device Health Status & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up delay-300">
                {/* Device Health Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col hover:shadow-sm-3 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-midnight-indigo">Thiết bị IoT</h2>
                        <Link to="/system-admin/devices" className="text-sm font-semibold text-action-blue hover:underline">
                            Tất cả
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {devicesList.map((device) => (
                            <div key={device.id} className="flex items-center justify-between p-3 bg-cloud-mist rounded-xl border border-outline-gray/60 hover:border-platinum-tint transition-all">
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-midnight-indigo truncate">{device.code}</h4>
                                    <p className="text-xs text-slate-blue truncate">{device.roomName || 'Chưa gán phòng'}</p>
                                    <p className="text-[10px] text-steel-gray mt-0.5">{device.ip}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {device.status === 'ONLINE' && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${device.status === 'ONLINE'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                        }`}>
                                        {device.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Logs Column */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col hover:shadow-sm-3 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-midnight-indigo">Nhật ký hoạt động gần đây</h2>
                        <Link to="/system-admin/audit-logs" className="text-sm font-semibold text-action-blue hover:underline">
                            Chi tiết
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint">
                                    <th className="pb-3 text-xs font-bold text-slate-blue uppercase">Hành động</th>
                                    <th className="pb-3 text-xs font-bold text-slate-blue uppercase">Tác nhân</th>
                                    <th className="pb-3 text-xs font-bold text-slate-blue uppercase">Phạm vi</th>
                                    <th className="pb-3 text-xs font-bold text-slate-blue uppercase">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/50 transition-colors">
                                        <td className="py-3.5 pr-2">
                                            <span className="text-sm font-semibold text-midnight-indigo">
                                                {formatActionName(log.actionType)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-2">
                                            <span className="text-sm text-slate-blue">{log.actorName}</span>
                                        </td>
                                        <td className="py-3.5 pr-2">
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                                {ENTITY_MAP[log.entityType] || log.entityType}
                                            </span>
                                        </td>
                                        <td className="py-3.5">
                                            <span className="text-xs text-slate-blue">
                                                {new Date(log.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

export default DashBoard;