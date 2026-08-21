import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NOTIFICATION_BANNER_EVENT } from '../../utils/notificationBanner';

const DURATION = 3000;
const MAX_VISIBLE = 4;

/**
 * Banner realtime cho thông báo mới (notification.created qua WS) — góc trên
 * phải, KHÔNG chặn màn hình (khác ToastContainer dùng cho xác nhận hành
 * động). Mount 1 lần ở App.js nên hiện được ở mọi route, không phụ thuộc
 * NotificationBell nào đang mount.
 */
const NotificationBanner = () => {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    const remove = useCallback((id) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const item = e.detail;
            setItems((prev) => [item, ...prev].slice(0, MAX_VISIBLE));
            setTimeout(() => remove(item.id), DURATION);
        };
        window.addEventListener(NOTIFICATION_BANNER_EVENT, handler);
        return () => window.removeEventListener(NOTIFICATION_BANNER_EVENT, handler);
    }, [remove]);

    const handleClick = (item) => {
        remove(item.id);
        if (item.basePath) {
            navigate(`${item.basePath}/notifications`);
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[99998] flex flex-col gap-2.5 w-[92%] max-w-[380px] pointer-events-none">
            <AnimatePresence>
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.15 } }}
                        layout
                        onClick={() => handleClick(item)}
                        className="pointer-events-auto relative overflow-hidden rounded-xl border border-outline-gray bg-white shadow-sm-2 px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-cloud-mist/60 transition-colors"
                    >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-action-blue/10 flex items-center justify-center mt-0.5">
                            <BellRing className="w-4 h-4 text-action-blue" />
                        </div>
                        <div className="min-w-0 flex-1">
                            {item.title && (
                                <p className="text-sm font-bold text-midnight-indigo truncate">{item.title}</p>
                            )}
                            {item.body && (
                                <p className="text-xs text-slate-blue line-clamp-2 mt-0.5">{item.body}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                            className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <div
                            className="absolute bottom-0 left-0 h-[3px] bg-action-blue/60"
                            style={{ animation: `notifBannerShrink ${DURATION}ms linear forwards` }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
            <style>{`
                @keyframes notifBannerShrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default NotificationBanner;
