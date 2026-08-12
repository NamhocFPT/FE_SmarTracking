import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getUnmappedVerifies, mapUnmappedVerify } from '../../service/sysAdminServices';
import { getUsers } from '../../service/businessAdminServices';
import {
    CheckCircle, Search, Activity, AlertCircle, RefreshCw, UserCheck, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '../../utils/toast';

const LIMIT = 20;

/**
 * BE response fields (per /face-access/unmapped-verifies):
 * { deviceId, personId, personName, roomId, lastSeen, hitCount }
 * Paginated: { data: [...], meta: { page, limit } }  — NO total/totalPages
 *
 * Map payload (POST /face-access/unmapped-verifies/map):
 * { deviceId: UUID, personId: string, userId: UUID, meetingId: UUID }  — all required
 */
const UnmappedVerifyReview = () => {
    const [verifies, setVerifies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination (BE meta has no total/totalPages, use hasMore heuristic)
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Mapping modal state
    const [selectedVerify, setSelectedVerify] = useState(null);
    const [mappedUserId, setMappedUserId] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [isMapping, setIsMapping] = useState(false);

    const fetchVerifies = useCallback(async (targetPage = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUnmappedVerifies({ page: targetPage, limit: LIMIT });
            if (res?.success) {
                // BE wraps array in { data: [...], meta: {...} }
                const items = Array.isArray(res.data)
                    ? res.data
                    : (res.data?.data ?? []);
                setVerifies(items);
                setHasMore(items.length >= LIMIT);
            } else {
                throw new Error(res?.message || 'Không thể tải dữ liệu verify chưa khớp.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi kết nối. Vui lòng thử lại.');
            setVerifies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await getUsers({ limit: 200 });
            if (res?.success) {
                const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.items ?? []);
                setUsers(items);
            }
        } catch (err) {
            console.error('Failed to fetch users for mapping:', err);
        }
    }, []);

    useEffect(() => {
        fetchVerifies(1);
        fetchUsers();
    }, [fetchVerifies, fetchUsers]);

    const changePage = (newPage) => {
        setPage(newPage);
        fetchVerifies(newPage);
    };

    const handleOpenMap = (verify) => {
        setSelectedVerify(verify);
        setMappedUserId('');
        setMeetingId('');
    };

    const handleMap = async () => {
        if (!mappedUserId) {
            toast.warning('Vui lòng chọn nhân viên để gán!');
            return;
        }
        if (!meetingId.trim()) {
            toast.warning('Vui lòng nhập mã cuộc họp (Meeting ID)!');
            return;
        }

        setIsMapping(true);
        try {
            // BE MapUnmappedDto requires all four fields (UUID types validated by BE)
            const payload = {
                deviceId: selectedVerify.deviceId,
                personId: selectedVerify.personId,
                userId: mappedUserId,
                meetingId: meetingId.trim(),
            };
            const res = await mapUnmappedVerify(payload);
            if (res?.success) {
                toast.success('Đã gán danh tính thành công!');
                // Remove mapped item using composite key
                setVerifies(prev => prev.filter(v =>
                    !(v.deviceId === selectedVerify.deviceId && v.personId === selectedVerify.personId)
                ));
                setSelectedVerify(null);
            } else {
                throw new Error(res?.message || 'Gán danh tính thất bại.');
            }
        } catch (err) {
            toast.error(err.message || 'Lỗi hệ thống khi gán danh tính.');
        } finally {
            setIsMapping(false);
        }
    };

    const filteredVerifies = verifies.filter(v => {
        const q = searchQuery.toLowerCase();
        return (
            (v.deviceId || '').toLowerCase().includes(q) ||
            (v.roomId || '').toLowerCase().includes(q) ||
            (v.personId || '').toLowerCase().includes(q) ||
            (v.personName || '').toLowerCase().includes(q)
        );
    });

    if (loading && verifies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Activity className="w-8 h-8 text-action-blue animate-pulse mb-3" />
                <p className="text-slate-blue text-sm font-semibold">Đang tải danh sách verify...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-cloud-mist/50 p-4 rounded-xl border border-platinum-tint">
                <div>
                    <h2 className="text-lg font-bold text-midnight-indigo flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-action-blue" />
                        Gán danh tính khuôn mặt (Unmapped Verifies)
                    </h2>
                    <p className="text-xs text-slate-blue mt-1">Các khuôn mặt được hệ thống chụp nhưng chưa liên kết với tài khoản nhân viên.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                        <input
                            type="text"
                            placeholder="Tìm theo thiết bị, phòng, người..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                        />
                        <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                    </div>
                    <button
                        onClick={() => { setPage(1); fetchVerifies(1); }}
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
                        onClick={() => { setPage(1); fetchVerifies(1); }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVerifies.length > 0 ? filteredVerifies.map(v => (
                    <motion.div
                        key={`${v.deviceId}-${v.personId}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 p-5 flex flex-col hover:border-action-blue/50 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-50 text-action-blue rounded-lg flex items-center justify-center">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-action-blue font-bold border border-blue-100">
                                    Unmapped
                                </span>
                            </div>
                            {v.hitCount != null && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> ×{v.hitCount}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5 flex-1 text-xs text-slate-blue">
                            {v.personName && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-midnight-indigo w-16 shrink-0">Nhận dạng:</span>
                                    <span className="font-semibold text-action-blue">{v.personName}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Person ID:</span>
                                <span className="font-mono break-all">{v.personId || '—'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Thiết bị:</span>
                                <span className="font-mono break-all">{v.deviceId || '—'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Phòng:</span>
                                <span className="font-mono break-all">{v.roomId || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Lần cuối:</span>
                                <span>{v.lastSeen ? new Date(v.lastSeen).toLocaleString('vi-VN') : '—'}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-platinum-tint/50">
                            <button
                                onClick={() => handleOpenMap(v)}
                                className="w-full py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                                <UserCheck className="w-3.5 h-3.5" /> Gán danh tính
                            </button>
                        </div>
                    </motion.div>
                )) : !error && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-platinum-tint rounded-2xl bg-white">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-midnight-indigo">Hoàn tất gán danh tính</h3>
                        <p className="text-xs text-slate-blue mt-1 max-w-sm mx-auto">
                            Không có khuôn mặt nào chưa được nhận diện.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {(page > 1 || hasMore) && (
                <div className="flex items-center justify-center gap-3 text-xs text-slate-blue">
                    <button
                        onClick={() => changePage(page - 1)}
                        disabled={page <= 1 || loading}
                        className="px-3 py-1.5 border border-platinum-tint rounded-lg font-semibold hover:bg-cloud-mist disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Trước
                    </button>
                    <span>Trang <span className="font-bold text-midnight-indigo">{page}</span></span>
                    <button
                        onClick={() => changePage(page + 1)}
                        disabled={!hasMore || loading}
                        className="px-3 py-1.5 border border-platinum-tint rounded-lg font-semibold hover:bg-cloud-mist disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Sau →
                    </button>
                </div>
            )}

            {/* Mapping Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedVerify && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/50 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl w-full max-w-md border border-platinum-tint shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-platinum-tint flex items-center gap-3 bg-cloud-mist/50">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-action-blue">
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-midnight-indigo">Gán danh tính (Map User)</h2>
                                        <p className="text-[10px] text-slate-blue">Liên kết khuôn mặt với nhân viên và cuộc họp</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Verify info */}
                                    <div className="bg-slate-50 p-3 rounded-xl border border-platinum-tint text-xs space-y-1.5">
                                        {selectedVerify.personName && (
                                            <p><span className="font-semibold text-slate-700">Nhận dạng:</span> <span className="text-action-blue font-semibold">{selectedVerify.personName}</span></p>
                                        )}
                                        <p><span className="font-semibold text-slate-700">Person ID:</span> <span className="font-mono">{selectedVerify.personId}</span></p>
                                        <p><span className="font-semibold text-slate-700">Thiết bị:</span> <span className="font-mono break-all">{selectedVerify.deviceId}</span></p>
                                        <p><span className="font-semibold text-slate-700">Lần cuối:</span> {selectedVerify.lastSeen ? new Date(selectedVerify.lastSeen).toLocaleString('vi-VN') : '—'}</p>
                                    </div>

                                    {/* Select employee */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-2">
                                            Chọn nhân viên <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={mappedUserId}
                                            onChange={(e) => setMappedUserId(e.target.value)}
                                            className="w-full p-2.5 border border-platinum-tint rounded-xl text-sm bg-white focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue"
                                        >
                                            <option value="">-- Chọn nhân viên --</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.fullName || u.email || u.username}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Meeting ID input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-2">
                                            Mã cuộc họp (Meeting ID) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={meetingId}
                                            onChange={(e) => setMeetingId(e.target.value)}
                                            placeholder="Nhập UUID cuộc họp..."
                                            className="w-full p-2.5 border border-platinum-tint rounded-xl text-sm font-mono bg-white focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue"
                                        />
                                        <p className="text-[10px] text-slate-blue mt-1">UUID của cuộc họp mà người này cần được xác nhận tham dự.</p>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-platinum-tint bg-cloud-mist/20 flex gap-3">
                                    <button
                                        onClick={() => setSelectedVerify(null)}
                                        disabled={isMapping}
                                        className="flex-1 px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleMap}
                                        disabled={isMapping || !mappedUserId || !meetingId.trim()}
                                        className="flex-1 px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold hover:bg-glacier-blue disabled:opacity-50"
                                    >
                                        {isMapping ? 'Đang gán...' : 'Gán danh tính'}
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

export default UnmappedVerifyReview;
