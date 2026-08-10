import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getStrangerAlerts } from '../../service/businessAdminServices';
import { acknowledgeSecurityAlert, resolveSecurityAlert } from '../../service/securityAlertService';
import { 
    ShieldAlert, CheckCircle, Search, UserX, Activity, 
    AlertCircle, RefreshCw, FileX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '../../utils/toast';

/**
 * FE-2: StrangerAlerts — CHỈ hiển thị cảnh báo khuôn mặt lạ (stranger alerts)
 * - KHÔNG có mapping user (đã tách sang UnmappedVerifyReview)
 * - KHÔNG có ảnh base64 (BE chỉ trả metadata: id, deviceCode, roomName, capturedAt)
 * - sync BE: Resolve stranger alerts via Security Alerts endpoints. Must acknowledge first.
 */
const StrangerAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Detail modal & Resolution note state
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAcknowledge = async () => {
        if (!selectedAlert) return;
        setIsSubmitting(true);
        try {
            const res = await acknowledgeSecurityAlert(selectedAlert.id);
            if (res?.success) {
                toast.success('Đã xác nhận cảnh báo an ninh.');
                setSelectedAlert(prev => ({ ...prev, status: 'acknowledged' }));
                fetchAlerts();
            } else {
                throw new Error(res?.message || 'Không thể xác nhận cảnh báo.');
            }
        } catch (err) {
            toast.error(err.message || 'Lỗi khi xác nhận cảnh báo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedAlert) return;
        if (!resolutionNote.trim()) {
            toast.warning('Vui lòng nhập ghi chú xử lý.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await resolveSecurityAlert(selectedAlert.id, { resolution_note: resolutionNote });
            if (res?.success) {
                toast.success('Cảnh báo đã được giải quyết thành công.');
                setSelectedAlert(null);
                setResolutionNote('');
                fetchAlerts();
            } else {
                throw new Error(res?.message || 'Không thể giải quyết cảnh báo.');
            }
        } catch (err) {
            toast.error(err.message || 'Lỗi khi giải quyết cảnh báo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getStrangerAlerts({});
            if (res?.success) {
                setAlerts(res.data || []);
            } else {
                throw new Error(res?.message || 'Không thể tải dữ liệu cảnh báo.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi kết nối khi tải danh sách cảnh báo khuôn mặt lạ. Vui lòng thử lại.');
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);


    // Filter — dùng đúng field từ BE: deviceCode, roomName
    const filteredAlerts = alerts.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
            (a.deviceCode || '').toLowerCase().includes(q) ||
            (a.roomName || '').toLowerCase().includes(q)
        );
    });

    // ──────────────── LOADING STATE (Skeleton) ────────────────
    if (loading && alerts.length === 0) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-cloud-mist/50 p-4 rounded-xl border border-platinum-tint animate-pulse">
                    <div className="space-y-2 flex-1">
                        <div className="h-5 w-64 bg-slate-200 rounded" />
                        <div className="h-3 w-44 bg-slate-100 rounded" />
                    </div>
                    <div className="h-9 w-48 bg-slate-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-platinum-tint shadow-sm p-5 animate-pulse space-y-3">
                            <div className="flex justify-between">
                                <div className="h-4 w-24 bg-slate-200 rounded" />
                                <div className="h-4 w-16 bg-red-100 rounded-full" />
                            </div>
                            <div className="h-3 w-36 bg-slate-100 rounded" />
                            <div className="h-3 w-28 bg-slate-100 rounded" />
                            <div className="h-8 w-full bg-slate-200 rounded-xl mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-cloud-mist/50 p-4 rounded-xl border border-platinum-tint">
                <div>
                    <h2 className="text-lg font-bold text-midnight-indigo flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        Cảnh báo khuôn mặt lạ (Stranger Alerts)
                    </h2>
                    <p className="text-xs text-slate-blue mt-1">Danh sách sự kiện khuôn mặt lạ ghi nhận từ camera AI. Chỉ metadata — không có ảnh.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                        <input
                            type="text"
                            placeholder="Tìm theo thiết bị, phòng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                        />
                        <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                    </div>
                    <button
                        onClick={fetchAlerts}
                        className="p-2 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo transition-all"
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                    <button
                        onClick={fetchAlerts}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                    </button>
                </div>
            )}

            {/* Alerts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlerts.length > 0 ? filteredAlerts.map(a => (
                    <motion.div 
                        key={a.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-red-100 shadow-sm-1 p-5 flex flex-col hover:border-red-200 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                    <UserX className="w-4 h-4" />
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-100">
                                        Stranger
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                        a.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                        a.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700 animate-pulse'
                                    }`}>
                                        {a.status === 'resolved' ? 'Đã xử lý' :
                                         a.status === 'acknowledged' ? 'Đã xác nhận' :
                                         'Mới'}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-blue bg-cloud-mist px-2 py-0.5 rounded">
                                {a.id?.substring(0, 8)}...
                            </span>
                        </div>

                        <div className="space-y-2 flex-1 text-xs text-slate-blue">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Thiết bị:</span>
                                <span className="font-mono">{a.deviceCode || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Phòng:</span>
                                <span>{a.roomName || 'Không xác định'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Thời gian:</span>
                                <span>{a.capturedAt ? new Date(a.capturedAt).toLocaleString('vi-VN') : '—'}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-platinum-tint/50">
                            <button
                                onClick={() => setSelectedAlert(a)}
                                className="w-full py-2 bg-white border border-platinum-tint text-slate-blue hover:bg-cloud-mist hover:text-midnight-indigo rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                                <UserX className="w-3.5 h-3.5" /> Xem chi tiết
                            </button>
                        </div>
                    </motion.div>
                )) : !error && (
                    /* Empty State */
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-platinum-tint rounded-2xl bg-white">
                        <FileX className="w-10 h-10 text-platinum-tint mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-midnight-indigo">Không có cảnh báo khuôn mặt lạ</h3>
                        <p className="text-xs text-slate-blue mt-1 max-w-sm mx-auto">
                            Hệ thống chưa ghi nhận sự kiện khuôn mặt lạ nào từ camera AI. Dữ liệu sẽ cập nhật tự động.
                        </p>
                        <button
                            onClick={fetchAlerts}
                            className="mt-4 px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold hover:bg-glacier-blue transition-colors inline-flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Tải lại
                        </button>
                    </div>
                )}
            </div>

            {/* ─────────── Detail Modal ─────────── */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedAlert && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/50 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl w-full max-w-md border border-platinum-tint shadow-2xl overflow-hidden"
                            >
                                <div className="bg-red-50 p-6 text-center border-b border-red-100">
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UserX className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-lg font-bold text-red-900">Chi tiết cảnh báo khuôn mặt lạ</h2>
                                </div>

                                <div className="p-6 space-y-3">
                                    <div className="bg-cloud-mist/30 p-4 rounded-xl border border-platinum-tint/50 space-y-2 text-sm text-slate-blue">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-midnight-indigo">Mã cảnh báo:</span>
                                            <span className="font-mono text-xs">{selectedAlert.id?.substring(0, 12)}...</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-midnight-indigo">Thiết bị:</span>
                                            <span className="font-mono">{selectedAlert.deviceCode || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-midnight-indigo">Phòng:</span>
                                            <span>{selectedAlert.roomName || 'Không xác định'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-midnight-indigo">Phát hiện lúc:</span>
                                            <span>{selectedAlert.capturedAt ? new Date(selectedAlert.capturedAt).toLocaleString('vi-VN') : '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-midnight-indigo">Trạng thái:</span>
                                            <span className={`px-2 py-0.5 font-bold rounded text-xs uppercase ${
                                                selectedAlert.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                selectedAlert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {selectedAlert.status === 'resolved' ? 'Đã xử lý' :
                                                 selectedAlert.status === 'acknowledged' ? 'Đã xác nhận' :
                                                 'Mới'}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedAlert.status === 'acknowledged' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-blue uppercase">Ghi chú xử lý</label>
                                            <textarea
                                                value={resolutionNote}
                                                onChange={(e) => setResolutionNote(e.target.value)}
                                                placeholder="Nhập chi tiết ghi chú xử lý..."
                                                className="w-full p-2.5 bg-cloud-mist border border-platinum-tint rounded-xl text-xs text-midnight-indigo focus:outline-none focus:border-action-blue"
                                                rows="3"
                                            />
                                        </div>
                                    )}

                                    {selectedAlert.status === 'resolved' && (
                                        <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 text-center font-semibold">
                                            Cảnh báo này đã được giải quyết hoàn tất.
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-platinum-tint bg-cloud-mist/20 flex gap-3">
                                    <button
                                        onClick={() => { setSelectedAlert(null); setResolutionNote(''); }}
                                        className="flex-1 px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist"
                                    >
                                        Đóng
                                    </button>
                                    {(!selectedAlert.status || selectedAlert.status === 'new') && (
                                        <button
                                            onClick={handleAcknowledge}
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                        >
                                            Xác nhận
                                        </button>
                                    )}
                                    {selectedAlert.status === 'acknowledged' && (
                                        <button
                                            onClick={handleResolve}
                                            disabled={isSubmitting || !resolutionNote.trim()}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                        >
                                            Giải quyết
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default StrangerAlerts;
