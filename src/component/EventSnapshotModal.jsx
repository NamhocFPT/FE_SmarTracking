import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/request';

const EventSnapshotModal = ({ isOpen, onClose, eventId }) => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!isOpen || !eventId) {
            setNotFound(false);
            setErrorMsg('');
            setLoading(false);
            return;
        }

        setLoading(true);
        setNotFound(false);
        setErrorMsg('');
    }, [isOpen, eventId]);

    const token = localStorage.getItem('accessToken');
    const snapshotUrl = eventId ? `${API_BASE_URL}/ivss/device-events/${eventId}/snapshot?token=${token}` : null;

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Nút Đóng trôi */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Đóng"
            >
                <X className="w-6 h-6" />
            </button>

            {loading && (
                <div className="flex flex-col items-center text-white/70 gap-3">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold tracking-wide">Đang tải ảnh...</span>
                </div>
            )}

            {!loading && notFound && (
                <div 
                    className="flex flex-col items-center text-white/70 gap-4 p-8 bg-slate-900/50 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ImageIcon className="w-16 h-16 text-white/30" />
                    <span className="text-base font-medium">Không có ảnh cho sự kiện này</span>
                </div>
            )}

            {!loading && errorMsg && (
                <div 
                    className="flex flex-col items-center text-red-400 gap-4 p-8 bg-slate-900/50 rounded-2xl backdrop-blur-md border border-red-500/20 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AlertCircle className="w-16 h-16 text-red-400/50" />
                    <span className="text-base font-medium text-center max-w-sm">{errorMsg}</span>
                </div>
            )}

            {snapshotUrl && !notFound && !errorMsg && (
                <div 
                    className={`relative w-full max-w-7xl h-full max-h-[90vh] items-center justify-center ${loading ? 'hidden' : 'flex'} animate-in zoom-in duration-300`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={snapshotUrl}
                        alt="Event Snapshot"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setNotFound(true);
                        }}
                    />
                </div>
            )}
        </div>,
        document.body
    );
};

export default EventSnapshotModal;
