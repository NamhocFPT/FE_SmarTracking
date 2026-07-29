import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldAlert, BellRing } from 'lucide-react';
import { getNotifications } from '../service/sysAdminServices';
import { getSecurityAlerts } from '../service/securityAlertService';

const SEVERITY_DOT = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
};

/**
 * Gộp GET /notifications + GET /security-alerts (status=new) ở phía client — BE dứt khoát
 * không xây "unified notification feed" (xem Plan.md mục 2.B), nên FE tự gộp 2 API sẵn có.
 * Badge số đếm CHỈ tính security alerts mới, vì /notifications chưa có field is-read thật từ BE
 * (xem src/pages/systemAdmin/Notifications.jsx — read luôn hardcode false phía client).
 */
const NotificationBell = ({ basePath }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [feedItems, setFeedItems] = useState([]);
    const containerRef = useRef(null);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        try {
            const [notiRes, alertsRes] = await Promise.allSettled([
                getNotifications({ page: 1, limit: 5 }),
                getSecurityAlerts({ status: 'new', limit: 5 }),
            ]);

            const notiItems = (notiRes.status === 'fulfilled' && notiRes.value?.success)
                ? (notiRes.value.data || []).map((item) => ({
                    id: `noti-${item.id}`,
                    source: 'notification',
                    title: item.subject,
                    body: item.content,
                    timestamp: item.createdAt,
                }))
                : [];

            const alertItems = (alertsRes.status === 'fulfilled' && alertsRes.value?.success)
                ? (alertsRes.value.data || []).map((item) => ({
                    id: `alert-${item.id}`,
                    source: 'alert',
                    title: item.alert_type,
                    body: item.zone_name || 'Không xác định khu vực',
                    timestamp: item.created_at,
                    severity: item.severity,
                }))
                : [];

            const alertsTotal = (alertsRes.status === 'fulfilled' && alertsRes.value?.success)
                ? (alertsRes.value.meta?.total ?? alertItems.length)
                : 0;

            const merged = [...notiItems, ...alertItems].sort(
                (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
            );

            // Filter unread notifications using localStorage
            const readIds = (() => {
                try {
                    return JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
                } catch {
                    return [];
                }
            })();
            const unreadNotisCount = notiItems.filter(item => !readIds.includes(item.id)).length;

            setFeedItems(merged);
            setUnreadCount(alertsTotal + unreadNotisCount);
        } catch {
            setFeedItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen((prev) => {
            const nextOpen = !prev;
            if (nextOpen) {
                // Mark all currently loaded notifications as read in localStorage
                try {
                    const readIds = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
                    const notiIdsToMark = feedItems
                        .filter(item => item.source === 'notification' && !readIds.includes(item.id))
                        .map(item => item.id);
                    if (notiIdsToMark.length > 0) {
                        const updatedIds = [...readIds, ...notiIdsToMark];
                        localStorage.setItem('readNotificationIds', JSON.stringify(updatedIds));
                        // Update badge count
                        setUnreadCount(prev => Math.max(0, prev - notiIdsToMark.length));
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            return nextOpen;
        });
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate(`${basePath}/notifications`);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-label="Thông báo & cảnh báo"
                onClick={handleToggle}
                className="relative p-2 rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist transition-colors duration-200"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-outline-gray rounded-xl shadow-sm-2 z-50">
                    <div className="px-4 py-3 border-b border-outline-gray bg-cloud-mist flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-slate-blue" />
                        <p className="text-sm font-bold text-midnight-indigo">Thông báo & Cảnh báo an ninh</p>
                    </div>

                    <div className="py-1">
                        {loading ? (
                            <p className="px-4 py-6 text-sm text-slate-blue text-center">Đang tải...</p>
                        ) : feedItems.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-slate-blue text-center">Không có thông báo nào.</p>
                        ) : (
                            feedItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-cloud-mist/60 border-b border-outline-gray/50 last:border-0">
                                    {item.source === 'alert' ? (
                                        <ShieldAlert className={`w-4 h-4 mt-0.5 flex-shrink-0 ${SEVERITY_DOT[item.severity]?.replace('bg-', 'text-') || 'text-slate-400'}`} />
                                    ) : (
                                        <Bell className="w-4 h-4 mt-0.5 text-action-blue flex-shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-midnight-indigo truncate">{item.title}</p>
                                        <p className="text-xs text-slate-blue truncate">{item.body}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleViewAll}
                        className="w-full px-4 py-2.5 text-center text-sm font-bold text-action-blue hover:bg-cloud-mist border-t border-outline-gray"
                    >
                        Xem tất cả
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
