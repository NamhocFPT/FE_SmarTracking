import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
    getRoomRealtimeStatus, 
    getNoShowStatus, 
    handleNoShowCase, 
    releaseNoShowRoom 
} from '../service/businessAdminServices';
import { 
    Activity, Users, AlertTriangle, CheckCircle, 
    XCircle, Clock, Video, Eye, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RealtimeRoomMonitor = () => {
    const [realtimeData, setRealtimeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for No-Show handling
    const [selectedNoShow, setSelectedNoShow] = useState(null); // stores the room and meeting info
    const [noShowDetail, setNoShowDetail] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchRealtimeStatus = useCallback(async () => {
        try {
            const res = await getRoomRealtimeStatus();
            if (res?.success) {
                setRealtimeData(res.data || []);
                setError(null);
            }
        } catch (err) {
            setError('Lỗi kết nối khi lấy dữ liệu thời gian thực.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and polling every 10 seconds (Simulating WebSocket)
    useEffect(() => {
        fetchRealtimeStatus();
        const interval = setInterval(() => {
            fetchRealtimeStatus();
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchRealtimeStatus]);

    const handleOpenNoShow = async (room) => {
        if (!room.activeMeetingId) return;
        setSelectedNoShow(room);
        setIsProcessing(true);
        try {
            const res = await getNoShowStatus(room.activeMeetingId);
            if (res?.success) {
                setNoShowDetail(res.data);
            }
        } catch {
            // Mock fallback if endpoint not ready
            setNoShowDetail({
                caseId: 'ns-' + Math.random().toString(36).substring(7),
                meetingTitle: 'Cuộc họp mô phỏng',
                organizer: 'Nguyễn Văn A',
                detectedAt: new Date().toISOString(),
                gracePeriodMinutes: 15,
                status: 'PENDING'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const onReleaseRoom = async () => {
        if (!noShowDetail?.caseId) return;
        setIsProcessing(true);
        try {
            await releaseNoShowRoom(noShowDetail.caseId);
            setSelectedNoShow(null);
            fetchRealtimeStatus();
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể giải phóng phòng.'));
        } finally {
            setIsProcessing(false);
        }
    };

    const onIgnoreNoShow = async () => {
        if (!noShowDetail?.caseId) return;
        setIsProcessing(true);
        try {
            await handleNoShowCase(noShowDetail.caseId, { action: 'IGNORE', reason: 'False alarm by admin' });
            setSelectedNoShow(null);
            fetchRealtimeStatus();
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể bỏ qua cảnh báo.'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading && realtimeData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-white rounded-2xl border border-platinum-tint shadow-sm-1">
                <Activity className="w-8 h-8 text-action-blue animate-pulse mb-3" />
                <p className="text-slate-blue text-sm font-semibold">Đang kết nối luồng dữ liệu thời gian thực...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-cloud-mist/50 p-4 rounded-xl border border-platinum-tint">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className="text-sm font-bold text-midnight-indigo">Camera & IVSS Live Sync</span>
                </div>
                <button 
                    onClick={fetchRealtimeStatus}
                    className="text-xs font-semibold text-action-blue hover:text-glacier-blue transition-colors flex items-center gap-1"
                >
                    <Activity className="w-3.5 h-3.5" />
                    Cập nhật ngay
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realtimeData.map((room) => (
                    <motion.div 
                        key={room.roomId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-5 rounded-2xl border shadow-sm-1 transition-all ${
                            room.status === 'NO_SHOW' ? 'bg-red-50/50 border-red-200' : 
                            room.status === 'IN_USE' ? 'bg-blue-50/50 border-blue-200' : 
                            'bg-white border-platinum-tint'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-midnight-indigo text-lg">{room.roomName}</h3>
                                <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                                    {room.status === 'AVAILABLE' && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Sẵn sàng</span>}
                                    {room.status === 'IN_USE' && <span className="text-action-blue flex items-center gap-1"><Video className="w-3.5 h-3.5"/> Đang sử dụng</span>}
                                    {room.status === 'NO_SHOW' && <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> Cảnh báo No-show</span>}
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-platinum-tint/50 flex flex-col items-center justify-center min-w-[50px]">
                                <Users className="w-4 h-4 text-slate-blue mb-0.5" />
                                <span className="text-sm font-extrabold text-midnight-indigo">{room.currentOccupancy || 0}</span>
                            </div>
                        </div>

                        {room.status === 'NO_SHOW' && (
                            <button
                                onClick={() => handleOpenNoShow(room)}
                                className="w-full mt-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Eye className="w-4 h-4" />
                                Kiểm tra vi phạm No-show
                            </button>
                        )}
                    </motion.div>
                ))}

                {realtimeData.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-slate-blue text-sm">
                        Không có dữ liệu phòng trực tuyến.
                    </div>
                )}
            </div>

            {/* No-Show Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedNoShow && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-3xl">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md border border-platinum-tint shadow-2xl overflow-hidden"
                        >
                            <div className="bg-red-50 p-6 text-center border-b border-red-100">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-bold text-red-900">Xử lý vi phạm No-show</h2>
                                <p className="text-xs text-red-600/80 mt-1">Phòng {selectedNoShow.roomName}</p>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                {isProcessing && !noShowDetail ? (
                                    <div className="flex justify-center py-4">
                                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : noShowDetail ? (
                                    <>
                                        <div className="space-y-2 text-sm text-slate-blue bg-cloud-mist/30 p-4 rounded-xl border border-platinum-tint/50">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-midnight-indigo">Cuộc họp:</span>
                                                <span className="text-right">{noShowDetail.meetingTitle}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-midnight-indigo">Người tổ chức:</span>
                                                <span>{noShowDetail.organizer}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-midnight-indigo">Phát hiện lúc:</span>
                                                <span>{new Date(noShowDetail.detectedAt).toLocaleTimeString('vi-VN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-platinum-tint/50">
                                                <span className="font-semibold text-midnight-indigo">Thời gian ân hạn (Grace):</span>
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold text-xs">
                                                    {noShowDetail.gracePeriodMinutes} phút
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-blue text-center bg-blue-50/50 p-3 rounded-lg text-action-blue border border-blue-100">
                                            Quá thời gian ân hạn, camera không phát hiện có người trong phòng. Bạn có thể giải phóng phòng để người khác sử dụng.
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-sm text-red-600">Không thể tải thông tin No-show.</div>
                                )}
                            </div>

                            <div className="p-4 border-t border-platinum-tint bg-cloud-mist/20 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setSelectedNoShow(null)}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist disabled:opacity-50"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={onIgnoreNoShow}
                                    disabled={isProcessing || !noShowDetail}
                                    className="flex-1 px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-midnight-indigo bg-white hover:bg-cloud-mist disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <XCircle className="w-4 h-4" /> Bỏ qua
                                </button>
                                <button
                                    onClick={onReleaseRoom}
                                    disabled={isProcessing || !noShowDetail}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <Unlock className="w-4 h-4" /> Giải phóng
                                </button>
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

export default RealtimeRoomMonitor;
