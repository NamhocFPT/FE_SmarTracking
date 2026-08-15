import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { TOAST_EVENT } from '../../utils/toast';

const ICONS = {
    success: (
        <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white mt-0.5">
            <Check className="w-3 h-3 stroke-[3.5]" />
        </div>
    ),
    error: (
        <div className="shrink-0 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white mt-0.5">
            <X className="w-3 h-3 stroke-[3.5]" />
        </div>
    ),
    warning: (
        <AlertTriangle className="shrink-0 w-5.5 h-5.5 text-amber-500 fill-amber-500/10 stroke-[2.5] mt-0.5" />
    ),
    info: (
        <div className="shrink-0 w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white mt-0.5">
            <Info className="w-3 h-3 stroke-[3.5]" />
        </div>
    ),
};

const BAR_COLOR = {
    success: '#10b981', // emerald-500
    error:   '#f43f5e', // rose-500
    warning: '#f59e0b', // amber-500
    info:    '#0ea5e9', // sky-500
};

const DURATION = 4000;

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
        <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-3 w-full h-full transition-all duration-300 ${toasts.length > 0 ? 'bg-midnight-indigo/40 backdrop-blur-sm pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Inject keyframes animation style */}
            <style>{`
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>

            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
                        layout
                        className="relative pointer-events-auto px-5 py-5 rounded-2xl border border-slate-200/80 bg-white text-[14px] font-semibold flex items-center justify-between gap-4 shadow-2xl shadow-midnight-indigo/20 max-w-[400px] w-[90%] overflow-hidden transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 flex-1 pr-2 text-slate-800">
                            {ICONS[t.type]}
                            <span className="leading-snug break-words">{t.message}</span>
                        </div>
                        <button
                            onClick={() => remove(t.id)}
                            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Progress Bar Timer */}
                        <div 
                            className="absolute bottom-0 left-0 h-[4px] rounded-b-2xl"
                            style={{
                                backgroundColor: BAR_COLOR[t.type] ?? BAR_COLOR.info,
                                animation: `shrinkWidth ${DURATION}ms linear forwards`
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
