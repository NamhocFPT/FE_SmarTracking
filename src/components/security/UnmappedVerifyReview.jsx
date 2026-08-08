import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getUnmappedVerifies, mapUnmappedVerify } from '../../service/sysAdminServices';
import { getUsers } from '../../service/managerServices'; // assuming this exists and returns users
import { 
    UserX, CheckCircle, Search, Activity, AlertCircle, RefreshCw, FileX, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UnmappedVerifyReview = () => {
    const [verifies, setVerifies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Mapping modal state
    const [selectedVerify, setSelectedVerify] = useState(null);
    const [mappedUserId, setMappedUserId] = useState('');
    const [isMapping, setIsMapping] = useState(false);

    const fetchVerifies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUnmappedVerifies({});
            if (res?.success) {
                setVerifies(res.data || []);
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
            const res = await getUsers();
            if (res?.success) {
                setUsers(res.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch users for mapping:', err);
        }
    }, []);

    useEffect(() => {
        fetchVerifies();
        fetchUsers();
    }, [fetchVerifies, fetchUsers]);

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    const handleOpenMap = (verify) => {
        setSelectedVerify(verify);
        setMappedUserId('');
    };

    const handleMap = async () => {
        if (!mappedUserId) {
            alert('Vui lòng chọn nhân viên để gán!');
            return;
        }

        setIsMapping(true);
        try {
            // Send payload according to BE definition: { personId, userId } or { verifyId, userId }
            // Assuming verify object has id (verifyId) or personId
            const payload = {
                verifyId: selectedVerify.id,
                personId: selectedVerify.personId, // Include if BE requires it
                userId: mappedUserId
            };
            const res = await mapUnmappedVerify(payload);
            if (res?.success) {
                setSuccessMsg('Đã gán danh tính thành công!');
                setVerifies(prev => prev.filter(v => v.id !== selectedVerify.id));
                setSelectedVerify(null);
            } else {
                throw new Error(res?.message || 'Gán danh tính thất bại.');
            }
        } catch (err) {
            alert(err.message || 'Lỗi hệ thống khi gán danh tính.');
        } finally {
            setIsMapping(false);
        }
    };

    const filteredVerifies = verifies.filter(v => {
        const q = searchQuery.toLowerCase();
        return (
            (v.deviceCode || '').toLowerCase().includes(q) ||
            (v.roomName || '').toLowerCase().includes(q)
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
                            placeholder="Tìm theo thiết bị, phòng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                        />
                        <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                    </div>
                    <button
                        onClick={fetchVerifies}
                        className="p-2 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo transition-all"
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Success message */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" /> {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error state */}
            {error && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                    <button
                        onClick={fetchVerifies}
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
                        key={v.id} 
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
                                <div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-action-blue font-bold border border-blue-100">
                                        Unmapped
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-blue bg-cloud-mist px-2 py-0.5 rounded">
                                {v.id?.substring(0, 8)}...
                            </span>
                        </div>

                        <div className="space-y-2 flex-1 text-xs text-slate-blue">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Thiết bị:</span>
                                <span className="font-mono">{v.deviceCode || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Phòng:</span>
                                <span>{v.roomName || 'Không xác định'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-midnight-indigo w-16 shrink-0">Chụp lúc:</span>
                                <span>{v.capturedAt ? new Date(v.capturedAt).toLocaleString('vi-VN') : '—'}</span>
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
                                        <p className="text-[10px] text-slate-blue">Liên kết khuôn mặt với nhân viên</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-platinum-tint text-xs space-y-1.5">
                                        <p><span className="font-semibold text-slate-700">Mã Verify:</span> {selectedVerify.id}</p>
                                        <p><span className="font-semibold text-slate-700">Thiết bị:</span> {selectedVerify.deviceCode}</p>
                                        <p><span className="font-semibold text-slate-700">Thời gian:</span> {selectedVerify.capturedAt ? new Date(selectedVerify.capturedAt).toLocaleString('vi-VN') : '—'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-2">Chọn nhân viên</label>
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
                                </div>

                                <div className="p-4 border-t border-platinum-tint bg-cloud-mist/20 flex gap-3">
                                    <button
                                        onClick={() => setSelectedVerify(null)}
                                        disabled={isMapping}
                                        className="flex-1 px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleMap}
                                        disabled={isMapping || !mappedUserId}
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
