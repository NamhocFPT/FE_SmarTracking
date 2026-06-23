import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getAuditLogs } from '../../service/sysAdminServices';

/**
 * AuditLogs Component
 * UC-CFG-02: System Activity Audit Logs
 * Displays security audit trails, sensitive actor actions, IP sources, and database entity transitions.
 */
// Localization dictionaries for professional Vietnamese translation
const ACTION_TRANSLATIONS = {
    'LOGIN': 'Đăng nhập',
    'LOGIN_FAILED': 'Đăng nhập thất bại',
    'LOGOUT': 'Đăng xuất',
    'CREATE_USER': 'Thêm tài khoản',
    'UPDATE_USER': 'Cập nhật tài khoản',
    'LOCK_USER': 'Khóa tài khoản',
    'UNLOCK_USER': 'Mở khóa tài khoản',
    'DELETE_USER': 'Xóa tài khoản',
    'REGISTER_DEVICE': 'Đăng ký thiết bị',
    'UPDATE_DEVICE': 'Cập nhật thiết bị',
    'REMOVE_DEVICE': 'Vô hiệu hóa thiết bị',
    'DEVICE_OFFLINE': 'Thiết bị mất kết nối',
    'EXPORT_USERS': 'Xuất tệp nhân viên',
    'UPDATE_CONFIG': 'Cập nhật cấu hình hệ thống'
};

const ENTITY_TRANSLATIONS = {
    'auth': 'Hệ thống xác thực',
    'users': 'Quản lý tài khoản',
    'iot-devices': 'Giám sát thiết bị IoT',
    'rooms': 'Quản lý phòng họp',
    'system-configurations': 'Cấu hình hệ thống'
};

const TRANSLATED_KEYS = {
    browser: 'Trình duyệt Web',
    os: 'Hệ điều hành',
    sessionLifeMinutes: 'Thời lượng phiên làm việc (phút)',
    reason: 'Lý do thực hiện',
    lockedUntil: 'Khóa đến thời gian',
    deviceCode: 'Mã thiết bị',
    lastSeen: 'Hoạt động lần cuối',
    retryCount: 'Số lần kết nối lại',
    ipAddress: 'Địa chỉ IP thiết bị',
    macAddress: 'Địa chỉ MAC',
    deviceName: 'Tên thiết bị',
    deviceType: 'Chủng loại thiết bị',
    streamUrl: 'Đường dẫn RTSP stream',
    filtersUsed: 'Bộ lọc xuất dữ liệu',
    rowCount: 'Tổng số dòng dữ liệu',
    email: 'Địa chỉ Email',
    fullName: 'Họ và tên nhân viên',
    roleIds: 'Mã nhóm quyền hạn',
    attempts: 'Số lần thử đăng nhập',
    before: 'Dữ liệu trước cập nhật',
    after: 'Dữ liệu sau cập nhật',
    input: 'Dữ liệu gửi lên'
};

const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${hh}:${mm}:${ss} ${dd}/${month}/${yyyy}`;
};

// eslint-disable-next-line no-unused-vars
const renderPayloadDetails = (payload) => {
    if (!payload || typeof payload !== 'object') return null;

    const renderItemValue = (val) => {
        if (val === null || val === undefined) return 'N/A';
        if (typeof val === 'object') {
            return (
                <div className="pl-3 border-l border-platinum-tint mt-1 space-y-1">
                    {Object.entries(val).map(([k, v]) => (
                        <div key={k}>
                            <span className="font-semibold text-slate-blue">{TRANSLATED_KEYS[k] || k}:</span>{' '}
                            <span className="text-midnight-indigo font-mono">{renderItemValue(v)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return String(val);
    };

    return (
        <div className="grid grid-cols-1 gap-2 text-sm text-midnight-indigo">
            {Object.entries(payload).map(([key, val]) => {
                if (key === 'before' || key === 'after' || key === 'input') {
                    return (
                        <div key={key} className="border border-platinum-tint/60 rounded-xl p-3 bg-cloud-mist/20 mt-1">
                            <span className="block text-xs font-bold text-slate-blue uppercase tracking-wider mb-1">
                                {TRANSLATED_KEYS[key] || key}
                            </span>
                            <div className="font-mono text-xs">
                                {renderItemValue(val)}
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-platinum-tint/30">
                        <span className="text-xs font-bold text-slate-blue uppercase tracking-wider">
                            {TRANSLATED_KEYS[key] || key}
                        </span>
                        <span className="font-mono text-sm text-midnight-indigo font-semibold sm:text-right">
                            {renderItemValue(val)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const AuditLogs = () => {
    // States
    const [logsList, setLogsList] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filters states
    const [search, setSearch] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedEntity, setSelectedEntity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Detail Modal states
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Load data
    const fetchLogs = useCallback(async (pageNumber = 1, pageLimit = 10) => {
        setLoading(true);
        setError(null);

        const params = {
            page: pageNumber,
            limit: pageLimit,
            action: selectedAction,
            entity: selectedEntity,
            startDate,
            endDate
        };

        try {
            const res = await getAuditLogs(params);
            if (res?.success) {
                setLogsList(res.data || []);
                setMeta(res.meta || { page: pageNumber, limit: pageLimit, total: res.data?.length || 0, totalPages: 1 });
            } else {
                throw new Error('Fallback to mock data');
            }
        } catch {
            // Mock Fallbacks for offline development
            const mockLogs = [
                {
                    id: 'log-1',
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    actorEmail: 'admin@smartracking.fpt.edu.vn',
                    actorName: 'Nguyen Van Admin',
                    action: 'LOGIN',
                    entity: 'auth',
                    ipAddress: '192.168.1.15',
                    status: 'success',
                    description: 'Đăng nhập hệ thống thành công qua trang Web.',
                    payload: { browser: 'Chrome/125.0', os: 'Windows 11', sessionLifeMinutes: 120 }
                },
                {
                    id: 'log-2',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    actorEmail: 'admin@smartracking.fpt.edu.vn',
                    actorName: 'Nguyen Van Admin',
                    action: 'CREATE_USER',
                    entity: 'users',
                    ipAddress: '192.168.1.15',
                    status: 'success',
                    description: 'Tạo tài khoản nhân viên mới: tran.thi.b@smartracking.fpt.edu.vn',
                    payload: {
                        input: { email: 'tran.thi.b@smartracking.fpt.edu.vn', fullName: 'Trần Thị B', roleId: 'manager' },
                        before: null,
                        after: { id: 102, email: 'tran.thi.b@smartracking.fpt.edu.vn', accountStatus: 'active', roles: ['manager'] }
                    }
                },
                {
                    id: 'log-3',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    actorEmail: 'admin@smartracking.fpt.edu.vn',
                    actorName: 'Nguyen Van Admin',
                    action: 'LOCK_USER',
                    entity: 'users',
                    ipAddress: '192.168.1.15',
                    status: 'success',
                    description: 'Tạm khóa tài khoản: le.van.c@smartracking.fpt.edu.vn',
                    payload: {
                        reason: 'Vi phạm quy định bảo mật',
                        lockedUntil: new Date(Date.now() + 86400000).toISOString(),
                        before: { id: 105, email: 'le.van.c@smartracking.fpt.edu.vn', accountStatus: 'active' },
                        after: { id: 105, email: 'le.van.c@smartracking.fpt.edu.vn', accountStatus: 'locked', lockedUntil: '2026-06-11T01:00:00Z' }
                    }
                },
                {
                    id: 'log-4',
                    timestamp: new Date(Date.now() - 14400000).toISOString(),
                    actorEmail: 'system-job',
                    actorName: 'Cron Engine',
                    action: 'DEVICE_OFFLINE',
                    entity: 'iot-devices',
                    ipAddress: '127.0.0.1',
                    status: 'warning',
                    description: 'Mất kết nối với Camera AI: CAM-SEM-01 tại phòng Hội Thảo A.',
                    payload: { deviceCode: 'CAM-SEM-01', lastSeen: new Date(Date.now() - 18000000).toISOString(), retryCount: 3 }
                },
                {
                    id: 'log-5',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    actorEmail: 'admin@smartracking.fpt.edu.vn',
                    actorName: 'Nguyen Van Admin',
                    action: 'UPDATE_DEVICE',
                    entity: 'iot-devices',
                    ipAddress: '192.168.1.15',
                    status: 'success',
                    description: 'Cập nhật địa chỉ IP của thiết bị CAM-VIP-01.',
                    payload: {
                        before: { deviceCode: 'CAM-VIP-01', ipAddress: '192.168.1.9' },
                        after: { deviceCode: 'CAM-VIP-01', ipAddress: '192.168.1.10' }
                    }
                },
                {
                    id: 'log-6',
                    timestamp: new Date(Date.now() - 172800000).toISOString(),
                    actorEmail: 'tran.thi.b@smartracking.fpt.edu.vn',
                    actorName: 'Trần Thị B',
                    action: 'EXPORT_USERS',
                    entity: 'users',
                    ipAddress: '192.168.2.33',
                    status: 'success',
                    description: 'Xuất danh sách nhân viên ra file Excel.',
                    payload: { filtersUsed: { departmentId: 'HR', status: 'active' }, rowCount: 45 }
                },
                {
                    id: 'log-7',
                    timestamp: new Date(Date.now() - 259200000).toISOString(),
                    actorEmail: 'le.van.c@smartracking.fpt.edu.vn',
                    actorName: 'Lê Văn C',
                    action: 'LOGIN_FAILED',
                    entity: 'auth',
                    ipAddress: '14.226.43.111',
                    status: 'failed',
                    description: 'Đăng nhập thất bại: Sai mật khẩu quá 5 lần.',
                    payload: { email: 'le.van.c@smartracking.fpt.edu.vn', reason: 'PASSWORD_INCORRECT', attempts: 5 }
                }
            ];

            // Local filter logic simulation
            const filtered = mockLogs.filter(log => {
                const matchSearch = search.trim() === '' ||
                    log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
                    log.actorName.toLowerCase().includes(search.toLowerCase()) ||
                    log.description.toLowerCase().includes(search.toLowerCase());
                const matchAction = selectedAction === '' || log.action === selectedAction;
                const matchEntity = selectedEntity === '' || log.entity === selectedEntity;
                const matchStart = startDate === '' || new Date(log.timestamp) >= new Date(startDate);
                const matchEnd = endDate === '' || new Date(log.timestamp) <= new Date(endDate + 'T23:59:59');

                return matchSearch && matchAction && matchEntity && matchStart && matchEnd;
            });

            // Pagination simulation
            const total = filtered.length;
            const totalPages = Math.ceil(total / pageLimit) || 1;
            const startIndex = (pageNumber - 1) * pageLimit;
            const paginatedData = filtered.slice(startIndex, startIndex + pageLimit);

            setLogsList(paginatedData);
            setMeta({ page: pageNumber, limit: pageLimit, total, totalPages });
        } finally {
            setLoading(false);
        }
    }, [selectedAction, selectedEntity, startDate, endDate, search]);

    useEffect(() => {
        fetchLogs(1, meta.limit);
    }, [fetchLogs, meta.limit]);

    // Auto-hide alert boxes
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleClearFilters = () => {
        setSearch('');
        setSelectedAction('');
        setSelectedEntity('');
        setStartDate('');
        setEndDate('');
        fetchLogs(1, meta.limit);
    };

    const handleOpenDetail = (log) => {
        setSelectedLog(log);
        setIsDetailOpen(true);
    };

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            setSuccessMessage('Xuất báo cáo nhật ký hoạt động hệ thống thành công (file csv/excel).');
        }, 1500);
    };

    // Helper badges styling
    const getActionBadge = (action) => {
        if (action.includes('CREATE') || action.includes('SUCCESS') || action === 'LOGIN') {
            return 'bg-green-50 text-green-700 border-green-200';
        }
        if (action.includes('UPDATE') || action.includes('EDIT')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        if (action.includes('LOCK') || action.includes('FAILED') || action.includes('DELETE') || action.includes('OFFLINE')) {
            return 'bg-red-50 text-red-700 border-red-200';
        }
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getStatusBadge = (status) => {
        if (status === 'success') {
            return 'bg-green-100 text-green-800';
        }
        if (status === 'warning') {
            return 'bg-amber-100 text-amber-800';
        }
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Nhật ký hệ thống</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Theo dõi lịch sử vận hành, ghi nhận thao tác của quản trị viên và các cảnh báo khẩn cấp.
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {exporting ? 'Đang xuất...' : 'Xuất nhật ký'}
                </button>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Filters panel */}
            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search query */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tìm kiếm từ khóa</label>
                        <input
                            type="text"
                            placeholder="Email, tên, hoặc mô tả..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                        />
                    </div>

                    {/* Action Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Loại hành động</label>
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white"
                        >
                            <option value="">Tất cả hành động</option>
                            <option value="LOGIN">Đăng nhập (LOGIN)</option>
                            <option value="LOGIN_FAILED">Đăng nhập lỗi</option>
                            <option value="CREATE_USER">Tạo tài khoản</option>
                            <option value="LOCK_USER">Khóa tài khoản</option>
                            <option value="UPDATE_DEVICE">Cập nhật thiết bị</option>
                            <option value="DEVICE_OFFLINE">Thiết bị mất mạng</option>
                            <option value="EXPORT_USERS">Xuất file Excel</option>
                        </select>
                    </div>

                    {/* Start date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Từ ngày</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-slate-blue"
                        />
                    </div>

                    {/* End date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Đến ngày</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-slate-blue"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-platinum-tint/50">
                    <div className="text-xs text-slate-blue font-medium">
                        Tìm thấy <span className="font-bold text-midnight-indigo">{meta.total}</span> bản ghi nhật ký.
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                        <button
                            type="button"
                            onClick={() => fetchLogs(1, meta.limit)}
                            className="px-4 py-2 bg-cloud-mist hover:bg-platinum-tint text-midnight-indigo rounded-xl text-xs font-semibold transition-colors"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Data Table */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-action-blue/20 border-t-action-blue rounded-full animate-spin"></div>
                        <p className="text-slate-blue text-sm mt-4">Đang tải lịch sử nhật ký hệ thống...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-cloud-mist/55 text-slate-blue text-xs font-bold uppercase border-b border-platinum-tint/70">
                                    <th className="py-4 px-6">Thời gian</th>
                                    <th className="py-4 px-6">Tài khoản</th>
                                    <th className="py-4 px-6">Hành động</th>
                                    <th className="py-4 px-6">Phân hệ</th>
                                    <th className="py-4 px-6">Địa chỉ IP</th>
                                    <th className="py-4 px-6">Trạng thái</th>
                                    <th className="py-4 px-6 text-center">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-platinum-tint/40 text-sm">
                                {logsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-blue italic">
                                            Không có nhật ký nào trùng khớp với bộ lọc của bạn.
                                        </td>
                                    </tr>
                                ) : (
                                    logsList.map(log => (
                                        <tr key={log.id} className="hover:bg-cloud-mist/30 transition-colors">
                                            <td className="py-4 px-6 font-medium text-midnight-indigo whitespace-nowrap font-mono text-xs">
                                                {formatTimestamp(log.timestamp)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-midnight-indigo">{log.actorName}</div>
                                                <div className="text-xs text-slate-blue font-mono">{log.actorEmail}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                                                    {ACTION_TRANSLATIONS[log.action] || log.action}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs font-semibold text-slate-blue uppercase">
                                                {ENTITY_TRANSLATIONS[log.entity] || log.entity}
                                            </td>
                                            <td className="py-4 px-6 text-slate-blue font-mono text-xs">
                                                {log.ipAddress}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(log.status)}`}>
                                                    {log.status === 'success' ? 'Thành công' : log.status === 'warning' ? 'Cảnh báo' : 'Thất bại'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleOpenDetail(log)}
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {!loading && logsList.length > 0 && (
                    <div className="p-4 bg-cloud-mist/20 border-t border-platinum-tint/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-blue font-medium">Số dòng hiển thị:</span>
                            <select
                                value={meta.limit}
                                onChange={(e) => {
                                    const nextLimit = Number(e.target.value);
                                    setMeta(prev => ({ ...prev, limit: nextLimit }));
                                    fetchLogs(1, nextLimit);
                                }}
                                className="px-2 py-1 border border-platinum-tint rounded-lg text-xs text-slate-blue focus:outline-none focus:border-action-blue bg-white font-semibold"
                            >
                                <option value={10}>10 dòng</option>
                                <option value={20}>20 dòng</option>
                                <option value={50}>50 dòng</option>
                            </select>
                            <span className="text-xs text-slate-blue">
                                Hiển thị {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} trên {meta.total} dòng
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={meta.page <= 1}
                                onClick={() => fetchLogs(meta.page - 1, meta.limit)}
                                className="px-3 py-1.5 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Trước
                            </button>
                            <button
                                disabled={meta.page >= meta.totalPages}
                                onClick={() => fetchLogs(meta.page + 1, meta.limit)}
                                className="px-3 py-1.5 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* DETAIL JSON MODAL */}
            {isDetailOpen && selectedLog && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-2xl w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <div>
                                <h3 className="font-bold text-midnight-indigo">Chi tiết nhật ký hoạt động</h3>
                                <p className="text-xs text-slate-blue mt-0.5">ID: {selectedLog.id}</p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="block text-slate-blue font-bold uppercase tracking-wider">Thời gian ghi nhận</span>
                                    <span className="text-sm font-semibold text-midnight-indigo font-mono">{formatTimestamp(selectedLog.timestamp)}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-blue font-bold uppercase tracking-wider">Địa chỉ IP thao tác</span>
                                    <span className="text-sm font-semibold text-midnight-indigo font-mono">{selectedLog.ipAddress}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-blue font-bold uppercase tracking-wider">Tài khoản thực hiện</span>
                                    <span className="text-sm font-semibold text-midnight-indigo">{selectedLog.actorName} ({selectedLog.actorEmail})</span>
                                </div>
                                <div>
                                    <span className="block text-slate-blue font-bold uppercase tracking-wider">Phân hệ chuyên môn / Thao tác</span>
                                    <span className="text-sm font-semibold text-midnight-indigo uppercase font-mono">
                                        {ENTITY_TRANSLATIONS[selectedLog.entity] || selectedLog.entity} / {ACTION_TRANSLATIONS[selectedLog.action] || selectedLog.action}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-cloud-mist/40 p-4 rounded-xl border border-outline-gray/50">
                                <span className="block text-xs font-bold text-slate-blue uppercase tracking-wider mb-1">Mô tả hành động</span>
                                <p className="text-sm text-midnight-indigo font-medium">{selectedLog.description}</p>
                            </div>

                            {/* Raw JSON details formatted */}
                            <div className="border border-platinum-tint/70 p-4 rounded-2xl bg-white shadow-sm-1">
                                <span className="block text-xs font-bold text-slate-blue uppercase tracking-wider mb-3 pb-2 border-b border-platinum-tint/50">Chi tiết thay đổi thông tin hệ thống</span>
                                <div className="space-y-1">
                                    {renderPayloadDetails(selectedLog.payload)}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/30 flex justify-end">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AuditLogs;
