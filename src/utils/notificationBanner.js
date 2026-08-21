// Kênh riêng cho banner thông báo realtime (khác app:toast — toast.js dùng cho
// xác nhận hành động dạng modal chặn màn hình, không hợp để bắn liên tục mỗi
// khi có notification.created từ WS). Banner ở đây là non-blocking, xếp chồng
// góc màn hình — xem NotificationBanner.jsx.
const NOTIFICATION_BANNER_EVENT = 'app:notification-banner';

export const emitNotificationBanner = ({ id, title, body, basePath, notificationType }) => {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_BANNER_EVENT, {
        detail: {
            id: id ?? `ntf-banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            body,
            basePath,
            notificationType,
        },
    }));
};

export { NOTIFICATION_BANNER_EVENT };
