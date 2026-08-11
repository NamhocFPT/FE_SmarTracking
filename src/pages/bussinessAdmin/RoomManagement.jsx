import {
    Activity, AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
    DoorOpen, Edit2, Home, List, MapPin, Mic, Monitor, Plus,
    RefreshCw, ShieldAlert, Trash2, UserCheck, Users, Video
} from 'lucide-react';
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

const ROOM_TYPE_LABELS = {
    meeting_room: 'Phòng họp',
    board_room: 'Phòng họp ban',
    conference_room: 'Hội trường',
    training_room: 'Phòng đào tạo',
    other: 'Khác'
};

const STATUS_CONFIG = {
    available: { label: 'Đang trống', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    occupied:  { label: 'Đang họp',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    maintenance: { label: 'Bảo trì',  cls: 'bg-amber-50 text-amber-700 border-amber-200' }
};

const getStatus = (room) => room.currentStatus || room.roomStatus || 'available';

const AmenityBadge = ({ active, icon: Icon, label }) => (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
        active ? 'bg-blue-50 text-action-blue border-blue-200' : 'bg-gray-50 text-steel-gray border-gray-200 opacity-40'
    }`}>
        <Icon className="w-2.5 h-2.5" />
        {label}
    </span>
);

const EMPTY_FORM = {
    roomName: '',
    capacity: '',
    roomType: 'meeting_room',
    siteName: '',
    areaName: '',
    description: '',
    hasCamera: false,
    hasMicrophone: false,
    hasDisplay: false,
    allowRecording: false
};

const RoomManagement = () => {
    const [viewMode, setViewMode] = useState('list');
    const [roomsList, setRoomsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const LIMIT = 12;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchRoomsList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: LIMIT,
                ...(search.trim() && { q: search.trim() }),
                ...(statusFilter && { status: statusFilter })
            };
            const res = await getRooms(params);
            if (res?.success) {
                setRoomsList(res.data || []);
                setTotalPages(res.meta?.totalPages || 1);
                setTotalItems(res.meta?.total || (res.data?.length || 0));
            } else {
                throw new Error(res?.error?.message || 'Không thể tải danh sách phòng.');
            }
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách phòng họp.');
            setRoomsList([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchRoomsList(); }, [fetchRoomsList]);

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [search, statusFilter]);

    const handleOpenModal = (mode, room = null) => {
        setModalMode(mode);
        setError(null);
        if (mode === 'edit' && room) {
            setSelectedRoom(room);
            setFormData({
                roomName: room.roomName || '',
                capacity: room.capacity ?? '',
                roomType: room.roomType || 'meeting_room',
                siteName: room.siteName || '',
                areaName: room.areaName || '',
                description: room.description || '',
                hasCamera: room.hasCamera ?? false,
                hasMicrophone: room.hasMicrophone ?? false,
                hasDisplay: room.hasDisplay ?? false,
                allowRecording: room.allowRecording ?? false
            });
        } else {
            setSelectedRoom(null);
            setFormData(EMPTY_FORM);
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                roomName: formData.roomName.trim(),
                capacity: parseInt(formData.capacity, 10),
                roomType: formData.roomType,
                ...(formData.siteName.trim() && { siteName: formData.siteName.trim() }),
                ...(formData.areaName.trim() && { areaName: formData.areaName.trim() }),
                ...(formData.description.trim() && { description: formData.description.trim() }),
                hasCamera: formData.hasCamera,
                hasMicrophone: formData.hasMicrophone,
                hasDisplay: formData.hasDisplay,
                allowRecording: formData.allowRecording
            };
            const res = modalMode === 'create'
                ? await createRoom(payload)
                : await updateRoom(selectedRoom.id || selectedRoom.roomId, payload);

            if (res?.success) {
                setSuccessMessage(modalMode === 'create' ? 'Thêm phòng họp thành công!' : 'Cập nhật phòng họp thành công!');
                setIsModalOpen(false);
                fetchRoomsList();
            } else {
                setError(res?.error?.message || res?.message || 'Có lỗi xảy ra.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Có lỗi xảy ra khi lưu phòng họp.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (room) => {
        setConfirm({
            message: `Bạn có chắc chắn muốn xoá phòng "${room.roomName}"? Thao tác không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    const res = await deleteRoom(room.id || room.roomId);
                    if (res?.success) {
                        setSuccessMessage('Đã xoá phòng họp thành công!');
                        fetchRoomsList();
                    } else {
                        setError(res?.error?.message || 'Không thể xoá phòng họp.');
                    }
                } catch (err) {
                    setError(err?.error?.message || err?.message || 'Không thể xoá phòng họp.');
                }
            }
        });
    };

    const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-6 animate-fade-in-up">
            <ConfirmDialog
                isOpen={!!confirm}
                message={confirm?.message}
                confirmLabel="Xoá phòng họp"
                onConfirm={() => { confirm?.onConfirm(); setConfirm(null); }}
                onCancel={() => setConfirm(null)}
            />

            {/* Header */}
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
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenModal('create')}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" /> Thêm phòng họp
                </motion.button>
            </div>

            {/* Alerts */}
            {successMessage && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /><span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap bg-cloud-mist/50 p-1 rounded-xl w-fit gap-0.5">
                {[
                    { key: 'list',     label: 'Danh sách phòng',   Icon: List,       active: 'text-action-blue' },
                    { key: 'realtime', label: 'Giám sát trực tuyến', Icon: Activity,   active: 'text-action-blue' },
                    { key: 'alerts',   label: 'Cảnh báo an ninh',   Icon: ShieldAlert, active: 'text-red-600' },
                    { key: 'unmapped', label: 'Gán danh tính',      Icon: UserCheck,  active: 'text-action-blue' }
                ].map(({ key, label, Icon, active }) => (
                    <button
                        key={key}
                        onClick={() => setViewMode(key)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${
                            viewMode === key ? `bg-white shadow-sm ${active}` : 'text-slate-blue hover:text-midnight-indigo'
                        }`}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {viewMode === 'list' ? (
                <>
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên phòng, mã phòng, toà nhà..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="px-4 py-2 flex-1 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-slate-blue font-medium min-w-[160px]"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="available">Đang trống</option>
                            <option value="occupied">Đang họp</option>
                            <option value="maintenance">Bảo trì</option>
                        </select>
                        <button
                            onClick={() => fetchRoomsList()}
                            className="inline-flex items-center justify-center px-4 py-2 border border-platinum-tint rounded-xl text-sm font-semibold bg-white text-slate-blue hover:bg-cloud-mist"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Tải lại
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12 min-h-[240px]">
                                <div className="w-9 h-9 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                                <p className="mt-4 text-slate-blue text-sm">Đang tải danh sách phòng họp...</p>
                            </div>
                        ) : roomsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 min-h-[240px] text-center">
                                <Home className="w-10 h-10 text-platinum-tint mb-2" />
                                <p className="text-sm font-bold text-midnight-indigo">Không tìm thấy phòng họp nào</p>
                                <p className="text-xs text-slate-blue mt-1">Thử thay đổi bộ lọc hoặc thêm phòng mới.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-platinum-tint bg-cloud-mist/50">
                                            <th className="py-3.5 px-5 text-[11px] font-bold text-slate-blue uppercase tracking-wide">Phòng họp</th>
                                            <th className="py-3.5 px-5 text-[11px] font-bold text-slate-blue uppercase tracking-wide">Vị trí</th>
                                            <th className="py-3.5 px-5 text-[11px] font-bold text-slate-blue uppercase tracking-wide">Sức chứa</th>
                                            <th className="py-3.5 px-5 text-[11px] font-bold text-slate-blue uppercase tracking-wide">Trang thiết bị</th>
                                            <th className="py-3.5 px-5 text-[11px] font-bold text-slate-blue uppercase tracking-wide">Trạng thái</th>
                                            <th className="py-3.5 px-5 text-[11px] font-bold text-slate-blue uppercase tracking-wide text-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roomsList.map((room, idx) => {
                                            const status = getStatus(room);
                                            const sc = STATUS_CONFIG[status] || STATUS_CONFIG.available;
                                            return (
                                                <tr key={room.id || room.roomId || idx} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                                    {/* Phòng họp */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                                                <Home className="w-3.5 h-3.5 text-action-blue" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-midnight-indigo leading-tight">{room.roomName}</p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    {room.roomCode && (
                                                                        <span className="text-[10px] font-mono font-bold text-slate-blue bg-cloud-mist px-1.5 py-0.5 rounded border border-platinum-tint">
                                                                            {room.roomCode}
                                                                        </span>
                                                                    )}
                                                                    {room.roomType && (
                                                                        <span className="text-[10px] text-steel-gray">
                                                                            {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Vị trí */}
                                                    <td className="py-3.5 px-5">
                                                        {(room.siteName || room.areaName) ? (
                                                            <div className="flex items-start gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5 text-steel-gray mt-0.5 shrink-0" />
                                                                <div>
                                                                    {room.siteName && <p className="text-xs font-semibold text-midnight-indigo">{room.siteName}</p>}
                                                                    {room.areaName && <p className="text-[11px] text-steel-gray">{room.areaName}</p>}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-steel-gray/50">—</span>
                                                        )}
                                                    </td>
                                                    {/* Sức chứa */}
                                                    <td className="py-3.5 px-5">
                                                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-blue">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {room.capacity} người
                                                        </span>
                                                    </td>
                                                    {/* Trang thiết bị */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex flex-wrap gap-1">
                                                            <AmenityBadge active={room.hasCamera} icon={Video} label="Camera" />
                                                            <AmenityBadge active={room.hasMicrophone} icon={Mic} label="Mic" />
                                                            <AmenityBadge active={room.hasDisplay} icon={Monitor} label="Màn hình" />
                                                        </div>
                                                    </td>
                                                    {/* Trạng thái */}
                                                    <td className="py-3.5 px-5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${sc.cls}`}>
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    {/* Hành động */}
                                                    <td className="py-3.5 px-5 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleOpenModal('edit', room)}
                                                                className="p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(room)}
                                                                className="p-1.5 rounded-lg text-slate-blue hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Xoá phòng"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="px-5 py-3.5 border-t border-platinum-tint flex items-center justify-between bg-cloud-mist/30">
                                <span className="text-xs text-slate-blue">
                                    Hiển thị {roomsList.length} / {totalItems} phòng
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                                        disabled={page === 1}
                                        className="p-1.5 border border-platinum-tint rounded-lg bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 py-1 text-xs font-bold text-midnight-indigo">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="p-1.5 border border-platinum-tint rounded-lg bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : viewMode === 'realtime' ? (
                <RealtimeRoomMonitor />
            ) : viewMode === 'unmapped' ? (
                <UnmappedVerifyReview />
            ) : (
                <StrangerAlerts />
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-lg w-full overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50 shrink-0">
                            <h3 className="font-bold text-midnight-indigo">
                                {modalMode === 'create' ? 'Thêm phòng họp mới' : `Cập nhật: ${selectedRoom?.roomName}`}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo text-xl font-bold leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                                </div>
                            )}

                            {/* Tên & loại phòng */}
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tên phòng họp <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required
                                    value={formData.roomName}
                                    onChange={e => setField('roomName', e.target.value)}
                                    placeholder="Ví dụ: Phòng Apollo 101"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Sức chứa <span className="text-red-500">*</span></label>
                                    <input
                                        type="number" required min="1"
                                        value={formData.capacity}
                                        onChange={e => setField('capacity', e.target.value)}
                                        placeholder="Số người"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Loại phòng</label>
                                    <select
                                        value={formData.roomType}
                                        onChange={e => setField('roomType', e.target.value)}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue font-medium"
                                    >
                                        <option value="meeting_room">Phòng họp</option>
                                        <option value="board_room">Phòng họp ban</option>
                                        <option value="conference_room">Hội trường</option>
                                        <option value="training_room">Phòng đào tạo</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>
                            </div>

                            {/* Vị trí */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Toà nhà / Cơ sở</label>
                                    <input
                                        type="text"
                                        value={formData.siteName}
                                        onChange={e => setField('siteName', e.target.value)}
                                        placeholder="Ví dụ: Toà A"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Khu vực / Tầng</label>
                                    <input
                                        type="text"
                                        value={formData.areaName}
                                        onChange={e => setField('areaName', e.target.value)}
                                        placeholder="Ví dụ: Tầng 3"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                            </div>

                            {/* Trang thiết bị */}
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-2">Trang thiết bị</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'hasCamera', Icon: Video, label: 'Camera ghi hình' },
                                        { key: 'hasMicrophone', Icon: Mic, label: 'Microphone' },
                                        { key: 'hasDisplay', Icon: Monitor, label: 'Màn hình chiếu' },
                                        { key: 'allowRecording', Icon: Video, label: 'Cho phép ghi hình' }
                                    ].map(({ key, Icon, label }) => (
                                        <label
                                            key={key}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                                                formData[key] ? 'border-action-blue bg-blue-50' : 'border-platinum-tint bg-white hover:bg-cloud-mist'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData[key]}
                                                onChange={e => setField(key, e.target.checked)}
                                                className="w-3.5 h-3.5 accent-action-blue"
                                            />
                                            <Icon className={`w-3.5 h-3.5 ${formData[key] ? 'text-action-blue' : 'text-steel-gray'}`} />
                                            <span className={`text-xs font-semibold ${formData[key] ? 'text-action-blue' : 'text-slate-blue'}`}>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setField('description', e.target.value)}
                                    rows="2"
                                    placeholder="Thông tin thêm về phòng họp..."
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist"
                                >
                                    Huỷ bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-action-blue text-white rounded-xl text-xs font-bold hover:bg-glacier-blue disabled:opacity-60 transition-colors"
                                >
                                    {saving ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
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
