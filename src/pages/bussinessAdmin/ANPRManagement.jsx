import { Car } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { 
    getAdminVehicleHistory, 
    adminRegisterVehicle, 
    getUnknownVehicles, 
    getMyVehicles 
} from '../../service/anprService';
import { getUsers } from '../../service/employeeServices'; // Để lấy danh sách nhân viên

const ANPRManagement = () => {
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'register', 'unknown'
    const [loading, setLoading] = useState(false);

    // ============================================
    // TAB 1: LỊCH SỬ QUÉT BIỂN
    // ============================================
    const [historyList, setHistoryList] = useState([]);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [filterMatchState, setFilterMatchState] = useState('ALL');
    const [historyPage, setHistoryPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setHistoryPage(1);
    }, [filterMatchState]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = {
                page: historyPage,
                limit: itemsPerPage
            };
            if (filterMatchState !== 'ALL') {
                params.matchState = filterMatchState;
            }
            const res = await getAdminVehicleHistory(params);
            if (res?.success) {
                setHistoryList(res.data);
                setHistoryTotal(res.meta?.total || 0);
            } else {
                setHistoryList([]);
                setHistoryTotal(0);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
        setLoading(false);
    };

    // ============================================
    // TAB 2: ĐĂNG KÝ HỘ (ADMIN)
    // ============================================
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [regPlate, setRegPlate] = useState('');
    const [regType, setRegType] = useState('CAR');
    const [regNote, setRegNote] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await getUsers({ limit: 100 });
            if (res?.success) setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegisterVehicle = async (e) => {
        e.preventDefault();
        try {
            await adminRegisterVehicle({
                user_id: selectedUser,
                plate_raw: regPlate,
                vehicle_type: regType,
                note: regNote
            });
            alert('Đăng ký xe cho nhân viên thành công!');
            setRegPlate('');
            setRegNote('');
            setSelectedUser('');
        } catch (err) {
            alert('Lỗi đăng ký xe: ' + (err.message || 'Thất bại'));
        }
    };

    // ============================================
    // TAB 3: BIỂN LẠ
    // ============================================
    const [unknownList, setUnknownList] = useState([]);
    const [unknownTotal, setUnknownTotal] = useState(0);
    const [unknownPage, setUnknownPage] = useState(1);

    const fetchUnknown = async () => {
        setLoading(true);
        try {
            const res = await getUnknownVehicles({ page: unknownPage, limit: itemsPerPage });
            if (res?.success) {
                setUnknownList(res.data);
                setUnknownTotal(res.meta?.total || 0);
            } else {
                setUnknownList([]);
                setUnknownTotal(0);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    // ============================================
    // EFFECTS
    // ============================================
    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab, filterMatchState, historyPage]);

    useEffect(() => {
        if (activeTab === 'unknown') fetchUnknown();
    }, [activeTab, unknownPage]);

    useEffect(() => {
        if (activeTab === 'register') fetchUsers();
    }, [activeTab]);

    useEffect(() => {
        // Auto-refresh logic for Dashboard (history/unknown)
        let interval;
        if (activeTab === 'history' || activeTab === 'unknown') {
            interval = setInterval(() => {
                if (activeTab === 'history') fetchHistory();
                if (activeTab === 'unknown') fetchUnknown();
            }, 10000); // 10 seconds auto-refresh
        }
        return () => clearInterval(interval);
    }, [activeTab, filterMatchState, historyPage, unknownPage]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-10">
            <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                    <Car className="w-3.5 h-3.5" />
                    Biển số
                </span>
                <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý nhận diện biển số (ANPR)</h1>
                <p className="text-slate-blue text-sm mt-1">
                    Theo dõi lịch sử vào ra, quản lý biển lạ và đăng ký phương tiện cho nhân sự.
                </p>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex bg-white rounded-2xl border border-platinum-tint p-1 shadow-sm-2">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                        activeTab === 'history' ? 'bg-cloud-mist text-action-blue shadow-sm border border-outline-gray' : 'text-slate-blue hover:bg-cloud-mist/50 hover:text-midnight-indigo'
                    }`}
                >
                    📊 Lịch sử quét (Dashboard)
                </button>
                <button
                    onClick={() => setActiveTab('unknown')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                        activeTab === 'unknown' ? 'bg-cloud-mist text-sunset-gold shadow-sm border border-outline-gray' : 'text-slate-blue hover:bg-cloud-mist/50 hover:text-midnight-indigo'
                    }`}
                >
                    ⚠️ Biển số lạ
                </button>
                <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                        activeTab === 'register' ? 'bg-cloud-mist text-action-blue shadow-sm border border-outline-gray' : 'text-slate-blue hover:bg-cloud-mist/50 hover:text-midnight-indigo'
                    }`}
                >
                    📝 Đăng ký xe nhân viên
                </button>
            </div>

            {/* TAB CONTENT: HISTORY */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 p-6 space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-midnight-indigo">Luồng xe vào ra hệ thống</h2>
                        <select
                            value={filterMatchState}
                            onChange={(e) => setFilterMatchState(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-platinum-tint text-sm font-semibold text-midnight-indigo focus:border-action-blue focus:ring-1 focus:ring-action-blue outline-none bg-cloud-mist"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="matched">Chỉ biển đã đăng ký (Matched)</option>
                            <option value="unmatched">Chỉ biển lạ (Unmatched)</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-cloud-mist border-b border-platinum-tint">
                                    <th className="py-3 px-4 text-xs font-bold text-slate-blue uppercase">Thời gian</th>
                                    <th className="py-3 px-4 text-xs font-bold text-slate-blue uppercase">Camera / Làn</th>
                                    <th className="py-3 px-4 text-xs font-bold text-slate-blue uppercase">Biển số nhận diện</th>
                                    <th className="py-3 px-4 text-xs font-bold text-slate-blue uppercase">Trạng thái (Khớp)</th>
                                    <th className="py-3 px-4 text-xs font-bold text-slate-blue uppercase">Chủ xe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-platinum-tint">
                                {loading && historyList.length === 0 ? (
                                    <tr><td colSpan="5" className="py-8 text-center text-slate-blue">Đang tải...</td></tr>
                                ) : historyList.length === 0 ? (
                                    <tr><td colSpan="5" className="py-8 text-center text-slate-blue">Không có dữ liệu trong khoảng thời gian này.</td></tr>
                                ) : (
                                    historyList.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-cloud-mist/30">
                                            <td className="py-3 px-4 text-sm font-semibold text-midnight-indigo">
                                                {new Date(item.eventTime).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-blue">{item.channelId || 'Main Gate'}</td>
                                            <td className="py-3 px-4">
                                                <span className="font-bold text-midnight-indigo border border-steel-gray px-2 py-1 rounded bg-white shadow-sm font-mono text-sm">{item.plateNumber}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.matchState === 'matched' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">Khớp dữ liệu</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700">Biển lạ</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-action-blue">
                                                {item.userId ? `User #${item.userId}` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination History */}
                    {!loading && Math.ceil(historyTotal / itemsPerPage) > 1 && (
                        <div className="flex justify-between items-center pt-4">
                            <span className="text-[11px] text-slate-blue">
                                Hiển thị {(historyPage - 1) * itemsPerPage + 1} - {Math.min(historyPage * itemsPerPage, historyTotal)} trong tổng số {historyTotal} lượt quét
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                                    disabled={historyPage === 1}
                                    className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Trước
                                </button>
                                {[...Array(Math.ceil(historyTotal / itemsPerPage))].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setHistoryPage(i + 1)}
                                        className={`w-7 h-7 rounded-lg text-[10.5px] font-bold transition-all border ${
                                            historyPage === i + 1 
                                                ? 'bg-action-blue text-white border-action-blue' 
                                                : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setHistoryPage(prev => Math.min(Math.ceil(historyTotal / itemsPerPage), prev + 1))}
                                    disabled={historyPage === Math.ceil(historyTotal / itemsPerPage)}
                                    className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: UNKNOWN VEHICLES */}
            {activeTab === 'unknown' && (
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 p-6 space-y-6 animate-fade-in">
                    <div>
                        <h2 className="text-lg font-bold text-midnight-indigo">Danh sách biển số lạ</h2>
                        <p className="text-xs text-slate-blue mt-1">Những phương tiện đi qua camera nhưng không khớp với bất kỳ đăng ký nào trong hệ thống.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading && unknownList.length === 0 ? (
                            <div className="col-span-full py-8 text-center text-slate-blue">Đang tải...</div>
                        ) : unknownList.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-blue bg-cloud-mist rounded-xl border border-dashed border-outline-gray">
                                Không có cảnh báo biển lạ nào hiện tại.
                            </div>
                        ) : (
                            unknownList.map((item, idx) => (
                                <div key={item.id || idx} className="p-4 rounded-xl border border-orange-200 bg-orange-50 flex items-start gap-4 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-white border border-orange-200 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                                        ⚠️
                                    </div>
                                    <div>
                                        <span className="font-bold text-midnight-indigo border border-steel-gray px-2 py-0.5 rounded bg-white font-mono text-sm shadow-sm">{item.plateNumber}</span>
                                        <p className="text-xs font-semibold text-slate-blue mt-2">Phát hiện lúc:</p>
                                        <p className="text-sm font-bold text-midnight-indigo">{new Date(item.eventTime).toLocaleString('vi-VN')}</p>
                                        <p className="text-xs text-slate-blue mt-1">Camera: {item.channelId || 'Unknown'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Unknown */}
                    {!loading && Math.ceil(unknownTotal / itemsPerPage) > 1 && (
                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-platinum-tint/50">
                            <span className="text-[11px] text-slate-blue">
                                Hiển thị {(unknownPage - 1) * itemsPerPage + 1} - {Math.min(unknownPage * itemsPerPage, unknownTotal)} trong tổng số {unknownTotal} biển lạ
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setUnknownPage(prev => Math.max(1, prev - 1))}
                                    disabled={unknownPage === 1}
                                    className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Trước
                                </button>
                                {[...Array(Math.ceil(unknownTotal / itemsPerPage))].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setUnknownPage(i + 1)}
                                        className={`w-7 h-7 rounded-lg text-[10.5px] font-bold transition-all border ${
                                            unknownPage === i + 1 
                                                ? 'bg-action-blue text-white border-action-blue' 
                                                : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setUnknownPage(prev => Math.min(Math.ceil(unknownTotal / itemsPerPage), prev + 1))}
                                    disabled={unknownPage === Math.ceil(unknownTotal / itemsPerPage)}
                                    className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: REGISTER */}
            {activeTab === 'register' && (
                <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 p-8 animate-fade-in max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-midnight-indigo">Đăng ký xe cho nhân viên</h2>
                        <p className="text-xs text-slate-blue mt-1">Dùng quyền Admin để chủ động cấp phép phương tiện cho người dùng vào hệ thống.</p>
                    </div>

                    <form onSubmit={handleRegisterVehicle} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-midnight-indigo mb-1.5">Chọn nhân viên *</label>
                            <select
                                required
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-platinum-tint focus:border-action-blue focus:ring-1 focus:ring-action-blue text-sm outline-none"
                            >
                                <option value="" disabled>-- Nhấn để chọn nhân viên --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.fullName} - {u.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-midnight-indigo mb-1.5">Biển số xe *</label>
                            <input
                                type="text"
                                required
                                value={regPlate}
                                onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                                placeholder="VD: 30A-123.45"
                                className="w-full px-4 py-2.5 rounded-xl border border-platinum-tint focus:border-action-blue focus:ring-1 focus:ring-action-blue text-sm font-mono outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-midnight-indigo mb-1.5">Loại phương tiện *</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${regType === 'CAR' ? 'border-action-blue bg-blue-50 text-action-blue font-bold shadow-sm' : 'border-platinum-tint text-slate-blue hover:bg-cloud-mist'}`}>
                                    <input type="radio" value="CAR" checked={regType === 'CAR'} onChange={() => setRegType('CAR')} className="hidden" />
                                    <span>🚗 Ô tô</span>
                                </label>
                                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${regType === 'MOTORBIKE' ? 'border-action-blue bg-blue-50 text-action-blue font-bold shadow-sm' : 'border-platinum-tint text-slate-blue hover:bg-cloud-mist'}`}>
                                    <input type="radio" value="MOTORBIKE" checked={regType === 'MOTORBIKE'} onChange={() => setRegType('MOTORBIKE')} className="hidden" />
                                    <span>🏍 Xe máy</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-midnight-indigo mb-1.5">Ghi chú (Tùy chọn)</label>
                            <input
                                type="text"
                                value={regNote}
                                onChange={(e) => setRegNote(e.target.value)}
                                placeholder="Ghi chú thêm..."
                                className="w-full px-4 py-2.5 rounded-xl border border-platinum-tint focus:border-action-blue focus:ring-1 focus:ring-action-blue text-sm outline-none"
                            />
                        </div>

                        <div className="pt-4 text-right">
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-action-blue hover:bg-glacier-blue text-white font-bold shadow-sm transition-colors text-sm"
                            >
                                Xác nhận Đăng ký
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ANPRManagement;
