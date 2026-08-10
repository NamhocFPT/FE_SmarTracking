import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info, VolumeX, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { TOAST_EVENT } from '../../utils/toast';

const ICONS = {
    success: <Check className="w-4 h-4 shrink-0" />,
    error:   <VolumeX className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
    info:    <Info className="w-4 h-4 shrink-0" />,
};

const BG = {
    success: 'bg-emerald-600 border-emerald-500',
    error:   'bg-red-600 border-red-500',
    warning: 'bg-amber-500 border-amber-400',
    info:    'bg-midnight-indigo border-indigo-800',
};

const DURATION = 3500;

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const { id, message, type } = e.detail;
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => remove(id), DURATION);
        };
        window.addEventListener(TOAST_EVENT, handler);
        return () => window.removeEventListener(TOAST_EVENT, handler);
    }, [remove]);

    return (
        <div className="fixed bottom-6 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.22 }}
                        className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center justify-between gap-3 text-white max-w-[340px] ${BG[t.type] ?? BG.info}`}
                    >
                        <div className="flex items-center gap-2.5 flex-1 pr-1">
                            {ICONS[t.type]}
                            <span className="leading-snug">{t.message}</span>
                        </div>
                        <button
                            onClick={() => remove(t.id)}
                            className="p-1.5 hover:bg-white/25 rounded-md transition-colors shrink-0 opacity-80 hover:opacity-100"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
