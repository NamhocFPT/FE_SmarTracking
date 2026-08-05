import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getEventSnapshot } from '../service/sysAdminServices';

const EventSnapshotModal = ({ isOpen, onClose, eventId }) => {
    const [loading, setLoading] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!isOpen || !eventId) {
            // reset state when closed
            if (imgSrc) {
                URL.revokeObjectURL(imgSrc);
                setImgSrc(null);
            }
            setNotFound(false);
            setErrorMsg('');
            return;
        }

        let isMounted = true;
        const fetchImage = async () => {
            setLoading(true);
            setNotFound(false);
            setErrorMsg('');
            try {
                const res = await getEventSnapshot(eventId);
                if (!isMounted) return;

                if (res.notFound) {
                    setNotFound(true);
                } else if (res.success && res.isBlob) {
                    const objectUrl = URL.createObjectURL(res.data);
                    setImgSrc(objectUrl);
                } else {
                    setErrorMsg(res.message || 'Không thể tải ảnh. Vui lòng thử lại sau.');
                }
            } catch (err) {
                if (isMounted) setErrorMsg('Lỗi mạng hoặc lỗi kết nối máy chủ.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
        };
    }, [isOpen, eventId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-platinum-tint bg-cloud-mist">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-action-blue" />
                        <h2 className="text-lg font-bold text-midnight-indigo">Ảnh hiện trường sự kiện</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                        title="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-slate-50 min-h-[300px] flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center text-slate-400 gap-3">
                            <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-semibold">Đang tải ảnh...</span>
                        </div>
                    ) : notFound ? (
                        <div className="flex flex-col items-center text-slate-400 gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl">
                            <ImageIcon className="w-12 h-12 text-slate-300" />
                            <span className="text-sm font-medium text-slate-500">Không có ảnh cho sự kiện này</span>
                        </div>
                    ) : errorMsg ? (
                        <div className="flex flex-col items-center text-red-500 gap-3 p-8 bg-red-50 rounded-xl">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                            <span className="text-sm font-semibold text-red-600 text-center max-w-sm">{errorMsg}</span>
                        </div>
                    ) : imgSrc ? (
                        <div className="w-full h-full max-h-[60vh] flex items-center justify-center">
                            <img
                                src={imgSrc}
                                alt="Event Snapshot"
                                className="max-w-full max-h-[60vh] object-contain rounded border border-slate-200 shadow-sm"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default EventSnapshotModal;
