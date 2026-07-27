import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getNotifications, 
    markNotificationRead, 
    markAllNotificationsRead 
} from '../../service/sysAdminServices';
import { 
    Bell, CheckCircle, Info, Calendar, Clock, AlertTriangle, 
    CheckSquare, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const Notifications = () => {
    const [notificationsList, setNotificationsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filters & Pagination
    const [filterType, setFilterType] = useState(''); // '', 'unread', 'read'
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchNotificationsList = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit
            };
            const res = await getNotifications(params);
            if (res?.success) {
                // Map BE data to FE expected properties
                const mappedData = (res.data || []).map(item => ({
                    ...item,
                    title: item.subject,
                    body: item.content,
                    type: item.notificationType,
                    read: false // BE chưa hỗ trợ tracking trạng thái đã đọc
                }));
                setNotificationsList(mappedData);
                setTotalPages(res.meta?.totalPages || 1);
                setTotalItems(res.meta?.total || (mappedData.length || 0));
            } else {
                throw new Error();
            }
        } catch {
            // Local Mock Fallback
            const mockNotifications = [
                {
                    id: 'noti-1',
                    title: 'Yêu cầu phê duyệt đặt phòng mới',
                    body: 'Nguyễn Văn A đã gửi yêu cầu đặt phòng Apollo 101 cho cuộc họp "Kick-off Dự án" vào 12/06/2026 09:00.',
                    type: 'APPROVAL_REQUEST',
                    read: false,
                    createdAt: '2026-06-10T19:30:00Z'
                },
                {
                    id: 'noti-2',
                    title: 'Cảnh báo No-show tự động',
                    body: 'Phòng Zeus 201 không phát hiện hiện diện sau 10 phút. Phòng đã tự động được giải phóng.',
                    type: 'NO_SHOW_ALERT',
                    read: false,
                    createdAt: '2026-06-10T18:45:00Z'
                },
                {
                    id: 'noti-3',
                    title: 'Thiết bị mất kết nối (Offline)',
                    body: 'Camera AI (CAM-SEM-01) tại Phòng Hội Thảo A đã mất kết nối tín hiệu heartbeat quá 5 phút.',
                    type: 'DEVICE_FAULT',
                    read: true,
                    createdAt: '2026-06-10T14:20:00Z'
                },
                {
                    id: 'noti-4',
                    title: 'Mật khẩu đã được thay đổi',
                    body: 'Tài khoản của bạn vừa được thay đổi mật khẩu đăng nhập thành công.',
                    type: 'SECURITY_ALERT',
                    read: true,
                    createdAt: '2026-06-09T08:00:00Z'
                },
                {
                    id: 'noti-5',
                    title: 'Đăng ký tài khoản thành công',
                    body: 'Chào mừng bạn đến với SmarTracking. Vui lòng cập nhật ảnh chân dung sinh trắc học.',
                    type: 'SYSTEM_INFO',
                    read: true,
                    createdAt: '2026-06-01T08:00:00Z'
                }
            ];

            let filtered = mockNotifications;
            if (filterType === 'unread') {
                filtered = filtered.filter(n => !n.read);
            } else if (filterType === 'read') {
                filtered = filtered.filter(n => n.read);
            }

            const startIndex = (page - 1) * limit;
            const paginated = filtered.slice(startIndex, startIndex + limit);

            setNotificationsList(paginated);
            setTotalPages(Math.ceil(filtered.length / limit) || 1);
            setTotalItems(filtered.length);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filterType]);

    useEffect(() => {
        fetchNotificationsList();
    }, [fetchNotificationsList]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Mark single notification as read
    // TODO: BE chưa có PATCH /notifications/:id/read — chờ §5.3
    const handleMarkAsRead = async (noti) => {
        // Tạm xử lý local vì BE chưa có route
        setNotificationsList(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n));
        setSuccessMessage(`Đã đánh dấu đọc thông báo: ${noti.title} (chờ cập nhật hệ thống)`);
    };

    // Mark all notifications as read
    // TODO: BE chưa có PATCH /notifications/read-all — chờ §5.3
    const handleMarkAllAsRead = async () => {
        // Tạm xử lý local vì BE chưa có route
        setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
        setSuccessMessage('Đã đánh dấu đọc toàn bộ thông báo (chờ cập nhật hệ thống).');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'APPROVAL_REQUEST':
                return <Clock className="w-5 h-5 text-action-blue" />;
            case 'NO_SHOW_ALERT':
            case 'DEVICE_FAULT':
                return <AlertTriangle className="w-5 h-5 text-sunset-gold" />;
            case 'SECURITY_ALERT':
                return <Info className="w-5 h-5 text-red-600" />;
            default:
                return <Bell className="w-5 h-5 text-slate-blue" />;
        }
    };

    const getBgColor = (type, read) => {
        if (read) return 'bg-white border-platinum-tint';
        switch (type) {
            case 'APPROVAL_REQUEST':
                return 'bg-blue-50/40 border-blue-150';
            case 'NO_SHOW_ALERT':
            case 'DEVICE_FAULT':
                return 'bg-yellow-50/40 border-yellow-150';
            case 'SECURITY_ALERT':
                return 'bg-red-50/40 border-red-150';
            default:
                return 'bg-cloud-mist/40 border-outline-gray';
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <Bell className="w-3.5 h-3.5" />
                        Trung tâm thông báo
                    </span>
                    <h1 className="text-2xl font-extrabold text-midnight-indigo tracking-tight">Thông báo hệ thống</h1>
                    <p className="text-slate-blue text-sm">Xem lịch sử thông báo, cập nhật trạng thái lịch họp, cảnh báo phòng họp và tình trạng thiết bị.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center justify-center px-4 py-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                    >
                        <CheckSquare className="w-4 h-4 mr-2 text-green-600" />
                        Đọc tất cả
                    </button>
                    <button
                        onClick={fetchNotificationsList}
                        className="p-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo rounded-xl hover:bg-cloud-mist transition-colors duration-200"
                        title="Tải lại thông báo"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Alert Message */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">{successMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter buttons */}
            <div className="flex gap-2 border-b border-platinum-tint pb-2">
                {[
                    { key: '', label: 'Tất cả thông báo' },
                    { key: 'unread', label: 'Chưa đọc' },
                    { key: 'read', label: 'Đã đọc' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setFilterType(tab.key); setPage(1); }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            filterType === tab.key 
                                ? 'bg-action-blue text-white shadow-sm' 
                                : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-platinum-tint min-h-[200px]">
                        <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-blue text-xs font-semibold mt-3">Đang tải danh sách thông báo...</p>
                    </div>
                ) : notificationsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-platinum-tint text-center min-h-[200px]">
                        <Bell className="w-10 h-10 text-platinum-tint mb-2" />
                        <h3 className="text-sm font-bold text-midnight-indigo">Hộp thư thông báo trống</h3>
                        <p className="text-slate-blue text-xs mt-0.5">Không tìm thấy thông báo nào khớp với trạng thái chọn.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notificationsList.map(noti => (
                            <motion.div
                                layout
                                key={noti.id}
                                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all duration-200 ${getBgColor(noti.type, noti.read)}`}
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm border border-platinum-tint/50">
                                        {getIcon(noti.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm font-bold text-midnight-indigo ${!noti.read ? 'font-extrabold' : ''}`}>{noti.title}</h4>
                                            {!noti.read && (
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-blue leading-relaxed">{noti.body}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-steel-gray pt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formatDate(noti.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0">
                                    {!noti.read ? (
                                        <button
                                            onClick={() => handleMarkAsRead(noti)}
                                            className="p-1.5 hover:bg-white border border-transparent hover:border-platinum-tint rounded-lg text-slate-blue hover:text-green-700 transition-colors"
                                            title="Đánh dấu đã đọc"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <span className="p-1.5 text-steel-gray/60 block" title="Đã đọc">
                                            <EyeOff className="w-4 h-4" />
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Pagination footer */}
                        <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1 flex items-center justify-between">
                            <span className="text-xs text-slate-blue">
                                Hiển thị {notificationsList.length} trên tổng số {totalItems} thông báo
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 border border-platinum-tint rounded-lg text-xs font-semibold bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                                >
                                    Trước
                                </button>
                                <span className="px-3 py-1.5 text-xs font-bold text-midnight-indigo">
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 border border-platinum-tint rounded-lg text-xs font-semibold bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
