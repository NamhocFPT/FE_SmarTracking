import { Activity, AlertCircle, CheckCircle, DoorOpen, Edit2, FileWarning, Home, List, Plus, RefreshCw, ShieldAlert, Trash2, UserCheck, Users } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
} from '../../service/businessAdminServices';

import RealtimeRoomMonitor from '../../components/security/RealtimeRoomMonitor';
import StrangerAlerts from '../../components/security/StrangerAlerts';
import UnmappedVerifyReview from '../../components/security/UnmappedVerifyReview';

const RoomManagement = () => {
    const [viewMode, setViewMode] = useState('list');
    const [roomsList, setRoomsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [confirm, setConfirm] = useState(null);

    // Filter and search
    const [search, setSearch] = useState('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        roomName: '',
        capacity: '',
        roomStatus: 'available',
        description: ''
    });

    const fetchRoomsList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: 1,
                limit: 10,
                search: search.trim() || undefined
            };
            const res = await getRooms(params);
            if (res?.success) {
                setRoomsList(res.data || []);
            } else {
                throw new Error();
            }
        } catch {
            // Mock rooms for local demo
            const mockRooms = [
                { id: 'r-1', roomName: 'Phòng Apollo 101', capacity: 15, roomStatus: 'available', description: 'Phòng họp lớn tầng 1, trang bị màn hình chiếu 4K.' },
                { id: 'r-2', roomName: 'Phòng Athena 102', capacity: 8, roomStatus: 'available', description: 'Phòng họp vừa tầng 1.' },
                { id: 'r-3', roomName: 'Phòng Zeus 201', capacity: 25, roomStatus: 'occupied', description: 'Phòng hội thảo lớn tầng 2.' },
                { id: 'r-4', roomName: 'Phòng Hermes 302', capacity: 6, roomStatus: 'maintenance', description: 'Đang bảo trì điều hoà.' }
            ];
            let filtered = mockRooms;
            if (search.trim()) {
                filtered = mockRooms.filter(r => r.roomName.toLowerCase().includes(search.toLowerCase()));
            }
            setRoomsList(filtered);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchRoomsList();
    }, [fetchRoomsList]);

    // Handle messages auto-hide
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleOpenModal = (mode, room = null) => {
        setModalMode(mode);
        if (mode === 'edit' && room) {
            setSelectedRoom(room);
            setFormData({
                roomName: room.roomName,
                capacity: room.capacity,
                roomStatus: room.roomStatus || 'available',
                description: room.description || ''
            });
        } else {
            setSelectedRoom(null);
            setFormData({
                roomName: '',
                capacity: '',
                roomStatus: 'available',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const payload = {
                roomName: formData.roomName,
                capacity: parseInt(formData.capacity, 10),
                roomStatus: formData.roomStatus,
                description: formData.description
            };

            let res;
            if (modalMode === 'create') {
                res = await createRoom(payload);
            } else {
                res = await updateRoom(selectedRoom.id, payload);
            }

            if (res?.success) {
                setSuccessMessage(modalMode === 'create' ? 'Thêm phòng họp thành công!' : 'Cập nhật phòng họp thành công!');
                setIsModalOpen(false);
                fetchRoomsList();
            } else {
                setError(res?.message || 'Có lỗi xảy ra.');
            }
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Có lỗi xảy ra khi lưu phòng họp. Vui lòng thử lại.');
        }
    };

    const handleDelete = (roomId) => {
        setConfirm({
            message: 'Bạn có chắc chắn muốn xoá phòng họp này? Thao tác không thể hoàn tác.',
            onConfirm: async () => {
                setError(null);
                try {
                    const res = await deleteRoom(roomId);
                    if (res?.success) {
                        setSuccessMessage('Đã xoá phòng họp thành công!');
                        fetchRoomsList();
                    } else {
                        setError(res?.message || 'Không thể xoá phòng họp.');
                    }
                } catch (err) {
                    setError(err?.message || err?.error?.message || 'Không thể xoá phòng họp. Vui lòng thử lại.');
                }
            },
        });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <ConfirmDialog
                isOpen={!!confirm}
                message={confirm?.message}
                confirmLabel="Xoá phòng họp"
                onConfirm={() => { confirm?.onConfirm(); setConfirm(null); }}
                onCancel={() => setConfirm(null)}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <DoorOpen className="w-3.5 h-3.5" />
                        Phòng họp
                    </span>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý phòng họp</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Cấu hình cơ sở vật chất, sức chứa và kiểm tra trạng thái khả dụng của các phòng họp thông minh.
                    </p>
                </div>
                <div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal('create')}
                        className="inline-flex items-center justify-center px-4 py-2 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Thêm phòng họp
                    </motion.button>
                </div>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-cloud-mist/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-action-blue' : 'text-slate-blue hover:text-midnight-indigo'}`}
                >
                    <List className="w-4 h-4" /> Danh sách phòng
                </button>
                <button
                    onClick={() => setViewMode('realtime')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'realtime' ? 'bg-white shadow-sm text-action-blue' : 'text-slate-blue hover:text-midnight-indigo'}`}
                >
                    <Activity className="w-4 h-4" /> Giám sát trực tuyến
                </button>
                <button
                    onClick={() => setViewMode('alerts')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'alerts' ? 'bg-white shadow-sm text-red-600' : 'text-slate-blue hover:text-midnight-indigo'}`}
                >
                    <ShieldAlert className="w-4 h-4" /> Cảnh báo an ninh
                </button>
                <button
                    onClick={() => setViewMode('unmapped')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'unmapped' ? 'bg-white shadow-sm text-action-blue' : 'text-slate-blue hover:text-midnight-indigo'}`}
                >
                    <UserCheck className="w-4 h-4" /> Gán danh tính
                </button>
            </div>

            {viewMode === 'list' ? (
                <>
                    {/* Filter */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col sm:flex-row gap-4 justify-between">
                <input
                    type="text"
                    placeholder="Tìm kiếm phòng họp theo tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 w-full sm:max-w-md border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                />
                <button
                    onClick={fetchRoomsList}
                    className="inline-flex items-center justify-center px-4 py-2 border border-platinum-tint rounded-xl text-sm font-semibold bg-white text-slate-blue hover:bg-cloud-mist"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Tải lại
                </button>
            </div>

            {/* Rooms List Table */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-blue text-sm">Đang tải danh sách phòng họp...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-cloud-mist/50">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Phòng họp</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Sức chứa</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Trạng thái</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Mô tả</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-blue text-sm">
                                            Không có dữ liệu phòng họp nào.
                                        </td>
                                    </tr>
                                ) : (
                                    roomsList.map((room) => (
                                        <tr key={room.id} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                            <td className="py-4 px-6 font-bold text-midnight-indigo flex items-center gap-2.5">
                                                <Home className="w-4 h-4 text-action-blue" />
                                                {room.roomName}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-blue font-semibold">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {room.capacity} người
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    room.roomStatus === 'available' ? 'bg-green-50 text-green-700' :
                                                    room.roomStatus === 'occupied' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {room.roomStatus === 'available' ? 'Đang trống' :
                                                     room.roomStatus === 'occupied' ? 'Đang họp' :
                                                     'Đang bảo trì'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-blue max-w-xs truncate">
                                                {room.description || 'Chưa có mô tả'}
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', room)}
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room.id)}
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </>) : viewMode === 'realtime' ? (
                <RealtimeRoomMonitor />
            ) : viewMode === 'unmapped' ? (
                <UnmappedVerifyReview />
            ) : (
                <StrangerAlerts />
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-lg w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">
                                {modalMode === 'create' ? 'Thêm phòng họp mới' : 'Cập nhật phòng họp'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo text-lg font-bold">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tên phòng họp</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.roomName}
                                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                                    placeholder="Ví dụ: Phòng Apollo 101"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Sức chứa (người)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        placeholder="Số người"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Trạng thái</label>
                                    <select
                                        value={formData.roomStatus}
                                        onChange={(e) => setFormData({ ...formData, roomStatus: e.target.value })}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue font-medium"
                                    >
                                        <option value="available">Sẵn dùng</option>
                                        <option value="occupied">Đang họp</option>
                                        <option value="maintenance">Bảo trì</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mô tả phòng họp</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Thông tin thêm..."
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist"
                                >
                                    Huỷ bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold hover:bg-glacier-blue"
                                >
                                    {modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default RoomManagement;
