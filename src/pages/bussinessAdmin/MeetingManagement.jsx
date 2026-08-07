import { AlertCircle, Calendar, CheckCircle, Clock, Home, Plus, RefreshCw, Search, Users, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    getMeetings,
    createMeeting,
    updateMeeting,
    cancelMeeting,
    getRooms
} from '../../service/businessAdminServices';

// BE MeetingStatus enum (meeting.entity.ts) có đủ 6 giá trị — trước đây thiếu draft/pending_approval/
// in_progress khiến các trạng thái này rơi vào nhánh else và bị hiển thị nhầm thành "Đã huỷ".
const STATUS_BADGE = {
    draft: { label: 'Bản nháp', className: 'bg-slate-100 text-slate-600' },
    pending_approval: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700' },
    scheduled: { label: 'Đã lên lịch', className: 'bg-blue-50 text-blue-700' },
    in_progress: { label: 'Đang họp', className: 'bg-emerald-50 text-emerald-700' },
    completed: { label: 'Hoàn thành', className: 'bg-green-50 text-green-700' },
    cancelled: { label: 'Đã huỷ', className: 'bg-red-50 text-red-700' },
};


const MeetingManagement = () => {
    const [meetingsList, setMeetingsList] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filters & Search
    const [search, setSearch] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    // Form inputs
    const [formData, setFormData] = useState({
        title: '',
        roomId: '',
        startTime: '',
        endTime: '',
        description: '',
        organizer: ''
    });

    const loadRooms = useCallback(async () => {
        try {
            const res = await getRooms({ limit: 100 });
            if (res?.success) setRooms(res.data || []);
        } catch (err) {
            console.error('Failed to load rooms', err);
            setRooms([]);
        }
    }, []);

    const fetchMeetingsList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: 1,
                limit: 10,
                search: search.trim() || undefined,
                roomId: selectedRoom || undefined
            };
            const res = await getMeetings(params);
            if (res?.success) {
                setMeetingsList(res.data || []);
            } else {
                setMeetingsList([]);
                setError(res?.message || 'Không thể tải danh sách cuộc họp.');
            }
        } catch (err) {
            setMeetingsList([]);
            setError(err?.message || err?.error?.message || 'Lỗi kết nối khi tải danh sách cuộc họp. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [search, selectedRoom]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    useEffect(() => {
        fetchMeetingsList();
    }, [fetchMeetingsList]);

    // Handle messages auto-hide
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleOpenModal = (mode, meeting = null) => {
        setModalMode(mode);
        if (mode === 'edit' && meeting) {
            setSelectedMeeting(meeting);
            setFormData({
                title: meeting.title,
                roomId: meeting.roomId,
                startTime: meeting.startTime.substring(0, 16),
                endTime: meeting.endTime.substring(0, 16),
                description: meeting.description || '',
                organizer: meeting.organizer || ''
            });
        } else {
            setSelectedMeeting(null);
            setFormData({
                title: '',
                roomId: '',
                startTime: '',
                endTime: '',
                description: '',
                organizer: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            let res;
            if (modalMode === 'create') {
                // CreateMeetingDto (BE) không nhận field `organizer` — không gửi.
                const payload = {
                    title: formData.title,
                    roomId: formData.roomId,
                    startTime: new Date(formData.startTime).toISOString(),
                    endTime: new Date(formData.endTime).toISOString(),
                    description: formData.description
                };
                res = await createMeeting(payload);
            } else {
                // UpdateMeetingDto (PATCH /meetings/:id) chỉ nhận title/description —
                // roomId/startTime/endTime đổi qua route riêng (/room, /time), không gộp ở đây.
                const payload = {
                    title: formData.title,
                    description: formData.description
                };
                res = await updateMeeting(selectedMeeting.id, payload);
            }

            if (res?.success) {
                setSuccessMessage(modalMode === 'create' ? 'Tạo cuộc họp thành công!' : 'Cập nhật cuộc họp thành công!');
                setIsModalOpen(false);
                fetchMeetingsList();
            } else {
                setError(res?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Có lỗi xảy ra khi lưu cuộc họp. Vui lòng thử lại.');
        }
    };

    const handleCancel = async (meetingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn huỷ cuộc họp này?')) return;
        setError(null);
        try {
            const res = await cancelMeeting(meetingId);
            if (res?.success) {
                setSuccessMessage('Huỷ cuộc họp thành công!');
                fetchMeetingsList();
            } else {
                setError(res?.message || 'Không thể huỷ cuộc họp.');
            }
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Có lỗi xảy ra khi huỷ cuộc họp. Vui lòng thử lại.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <Users className="w-3.5 h-3.5" />
                        Cuộc họp
                    </span>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý cuộc họp</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Theo dõi lịch đặt họp của doanh nghiệp, thực hiện các thao tập đặt lịch họp mới và quản trị thông tin cuộc họp.
                    </p>
                </div>
                <div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal('create')}
                        className="inline-flex items-center justify-center px-4 py-2 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Đặt lịch họp
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

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-blue" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chủ đề cuộc họp..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                        />
                    </div>
                    <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue"
                    >
                        <option value="">Tất cả phòng họp</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.roomName}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={fetchMeetingsList}
                    className="inline-flex items-center justify-center px-4 py-2 border border-platinum-tint rounded-xl text-sm font-semibold bg-white text-slate-blue hover:bg-cloud-mist"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Tải lại
                </button>
            </div>

            {/* Meetings Table */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-blue text-sm">Đang tải danh sách cuộc họp...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-cloud-mist/50">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Chủ đề cuộc họp</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Phòng họp</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Thời gian</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Người tổ chức</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Trạng thái</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meetingsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-blue text-sm">
                                            Không có cuộc họp nào được tìm thấy.
                                        </td>
                                    </tr>
                                ) : (
                                    meetingsList.map((m) => (
                                        <tr key={m.id} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-midnight-indigo">{m.title}</div>
                                                <div className="text-xs text-slate-blue truncate max-w-xs">{m.description || 'Không có mô tả'}</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-blue font-semibold">
                                                <span className="flex items-center gap-1.5">
                                                    <Home className="w-3.5 h-3.5 text-action-blue" />
                                                    {m.roomName}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-slate-blue space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-blue" />
                                                    {new Date(m.startTime).toLocaleDateString('vi-VN')}
                                                    {new Date(m.startTime).toLocaleDateString('vi-VN') !== new Date(m.endTime).toLocaleDateString('vi-VN') 
                                                        ? ` - ${new Date(m.endTime).toLocaleDateString('vi-VN')}` 
                                                        : ''}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-blue" />
                                                    {new Date(m.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(m.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-midnight-indigo font-medium">
                                                {m.organizerName || m.organizer || '—'}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    (STATUS_BADGE[m.status] || STATUS_BADGE.cancelled).className
                                                }`}>
                                                    {(STATUS_BADGE[m.status] || { label: m.status }).label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                {m.status === 'scheduled' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenModal('edit', m)}
                                                            className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                            title="Chỉnh sửa cuộc họp"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(m.id)}
                                                            className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Huỷ cuộc họp"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-lg w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">
                                {modalMode === 'create' ? 'Đặt lịch họp mới' : 'Chỉnh sửa cuộc họp'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo text-lg font-bold">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Chủ đề cuộc họp</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ví dụ: Họp Sprint Review"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Phòng họp</label>
                                    <select
                                        required
                                        value={formData.roomId}
                                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue font-medium"
                                    >
                                        <option value="">Chọn phòng</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.roomName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Người tổ chức</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.organizer}
                                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                                        placeholder="Tên người tổ chức"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Bắt đầu</label>
                                    <input
                                        type="datetime-local" lang="en-GB"
                                        required
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Kết thúc</label>
                                    <input
                                        type="datetime-local" lang="en-GB"
                                        required
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Nội dung / Mô tả cuộc họp</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Nội dung thảo luận..."
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
                                    {modalMode === 'create' ? 'Đặt lịch' : 'Cập nhật'}
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

export default MeetingManagement;
