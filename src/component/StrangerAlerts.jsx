import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getStrangerAlerts, resolveStrangerAlert } from '../service/businessAdminServices';
import { getUsers } from '../service/managerServices'; // to fetch user list for mapping
import { ShieldAlert, CheckCircle, Search, UserX, UserCheck, Activity, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StrangerAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for resolving
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isResolving, setIsResolving] = useState(false);
    const [users, setUsers] = useState([]);
    const [mappedUserId, setMappedUserId] = useState('');

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getStrangerAlerts({ status: 'UNRESOLVED' });
            if (res?.success) {
                setAlerts(res.data || []);
            }
        } catch (err) {
            // Mock data fallback
            setAlerts([
                {
                    id: 'alert-1',
                    detectedAt: new Date(Date.now() - 3600000).toISOString(),
                    location: 'Phòng Apollo 101',
                    confidenceScore: 89,
                    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
                    status: 'UNRESOLVED',
                    notes: 'Khuôn mặt không có trong CSDL (Stranger)'
                },
                {
                    id: 'alert-2',
                    detectedAt: new Date(Date.now() - 7200000).toISOString(),
                    location: 'Hành lang Tầng 2',
                    confidenceScore: 75,
                    imageUrl: null,
                    status: 'UNRESOLVED',
                    notes: 'Nhận diện nhầm hoặc góc mặt không rõ'
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUsersForMapping = async () => {
        try {
            const res = await getUsers();
            if (res?.success) {
                setUsers(res.data || []);
            }
        } catch {
            setUsers([
                { id: 'u1', fullName: 'Nguyễn Văn A' },
                { id: 'u2', fullName: 'Trần Thị C' }
            ]);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    useEffect(() => {
        if (selectedAlert) {
            loadUsersForMapping();
        }
    }, [selectedAlert]);

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    const handleOpenResolve = (alert) => {
        setSelectedAlert(alert);
        setMappedUserId('');
    };

    const handleResolve = async (action) => {
        if (action === 'MAP_TO_USER' && !mappedUserId) {
            alert('Vui lòng chọn nhân viên để gán!');
            return;
        }

        setIsResolving(true);
        try {
            const payload = {
                action,
                userId: action === 'MAP_TO_USER' ? mappedUserId : undefined,
                resolutionNote: action === 'IGNORE' ? 'Đã bỏ qua (Khách hoặc False Alarm)' : 'Đã gán khuôn mặt vào hồ sơ nhân viên'
            };
            const res = await resolveStrangerAlert(selectedAlert.id, payload);
            if (res?.success) {
                setSuccessMsg('Đã xử lý cảnh báo thành công!');
                setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id));
                setSelectedAlert(null);
            } else {
                throw new Error();
            }
        } catch {
            // Mock success
            setSuccessMsg('Đã mô phỏng xử lý cảnh báo!');
            setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id));
            setSelectedAlert(null);
        } finally {
            setIsResolving(false);
        }
    };

    const filteredAlerts = alerts.filter(a => 
        a.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Activity className="w-8 h-8 text-action-blue animate-pulse mb-3" />
                <p className="text-slate-blue text-sm font-semibold">Đang tải dữ liệu cảnh báo an ninh...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-cloud-mist/50 p-4 rounded-xl border border-platinum-tint">
                <div>
                    <h2 className="text-lg font-bold text-midnight-indigo flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        Cảnh báo an ninh (Người lạ / Chưa nhận diện)
                    </h2>
                    <p className="text-xs text-slate-blue mt-1">Hệ thống IVSS ghi nhận khuôn mặt không khớp với bất kỳ hồ sơ nào trong CSDL.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Tìm theo vị trí, ghi chú..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                    />
                    <Search className="w-4 h-4 text-slate-blue absolute left-3 top-2.5" />
                </div>
            </div>

            {successMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                    <div key={alert.id} className="bg-white rounded-2xl border border-red-200 shadow-sm-1 overflow-hidden flex flex-col">
                        <div className="relative h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
                            {alert.imageUrl ? (
                                <img src={alert.imageUrl} alt="Stranger" className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-slate-700" />
                            )}
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                                Score: {alert.confidenceScore}%
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-sm font-bold text-midnight-indigo mb-1">{alert.location}</h3>
                            <p className="text-xs text-slate-blue mb-2">{new Date(alert.detectedAt).toLocaleString('vi-VN')}</p>
                            <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 mb-4">{alert.notes}</p>
                            
                            <div className="mt-auto pt-4 border-t border-platinum-tint flex gap-2">
                                <button
                                    onClick={() => handleOpenResolve(alert)}
                                    className="flex-1 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <UserCheck className="w-4 h-4" /> Xử lý
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center text-slate-blue text-sm border-2 border-dashed border-platinum-tint rounded-2xl">
                        Không có cảnh báo an ninh nào chưa xử lý.
                    </div>
                )}
            </div>

            {/* Resolve Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedAlert && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-3xl">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md border border-platinum-tint shadow-2xl overflow-hidden p-6"
                        >
                            <h2 className="text-lg font-bold text-midnight-indigo mb-4 border-b border-platinum-tint pb-3 flex items-center gap-2">
                                <UserX className="w-5 h-5 text-action-blue" />
                                Xử lý cảnh báo khuôn mặt
                            </h2>
                            
                            <div className="flex gap-4 mb-6">
                                <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-platinum-tint">
                                    {selectedAlert.imageUrl ? (
                                        <img src={selectedAlert.imageUrl} alt="Face" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>
                                    )}
                                </div>
                                <div className="text-sm space-y-2 text-slate-blue">
                                    <p><strong className="text-midnight-indigo">Thời gian:</strong> {new Date(selectedAlert.detectedAt).toLocaleString('vi-VN')}</p>
                                    <p><strong className="text-midnight-indigo">Vị trí:</strong> {selectedAlert.location}</p>
                                    <p><strong className="text-midnight-indigo">Ghi chú:</strong> {selectedAlert.notes}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                                    <p className="text-xs font-bold text-midnight-indigo">Gán vào hồ sơ nhân viên (Mapping)</p>
                                    <select
                                        value={mappedUserId}
                                        onChange={(e) => setMappedUserId(e.target.value)}
                                        className="w-full p-2 border border-platinum-tint rounded-lg text-sm bg-white focus:outline-none focus:border-action-blue"
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.fullName}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleResolve('MAP_TO_USER')}
                                        disabled={isResolving || !mappedUserId}
                                        className="w-full py-2 mt-2 bg-action-blue text-white rounded-lg text-xs font-bold hover:bg-glacier-blue disabled:opacity-50"
                                    >
                                        Gán & Lưu khuôn mặt
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 my-2">
                                    <div className="flex-1 h-px bg-platinum-tint"></div>
                                    <span className="text-xs text-slate-400 font-bold uppercase">Hoặc</span>
                                    <div className="flex-1 h-px bg-platinum-tint"></div>
                                </div>

                                <button
                                    onClick={() => handleResolve('IGNORE')}
                                    disabled={isResolving}
                                    className="w-full py-2 bg-white border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    Bỏ qua cảnh báo (Khách viếng thăm)
                                </button>
                            </div>

                            <div className="mt-6 pt-4 border-t border-platinum-tint text-right">
                                <button
                                    onClick={() => setSelectedAlert(null)}
                                    disabled={isResolving}
                                    className="px-4 py-2 text-xs font-bold text-slate-blue hover:text-midnight-indigo transition-colors"
                                >
                                    Đóng
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

export default StrangerAlerts;
