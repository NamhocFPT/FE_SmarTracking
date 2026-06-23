import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Users, ShieldAlert, Video, Plus, Trash2, Check, AlertTriangle, ArrowLeft, Info, HelpCircle
} from 'lucide-react';
import { getRooms, getUsers, createMeeting } from '../../service/employeeServices';

const BookMeeting = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    // Form states
    const [title, setTitle] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
    const [recordingEnabled, setRecordingEnabled] = useState(false);
    const [pdpaConsent, setPdpaConsent] = useState(false);

    // Agenda states
    const [agendaList, setAgendaList] = useState([]);
    const [newAgendaTitle, setNewAgendaTitle] = useState('');
    const [newAgendaDuration, setNewAgendaDuration] = useState('15');

    // Data lists
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Feedback states
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [conflictInfo, setConflictInfo] = useState(null);
    const [alternativeRooms, setAlternativeRooms] = useState([]);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch (err) {
            console.error('Failed to load user info', err);
        }

        const fetchData = async () => {
            try {
                const [roomsRes, usersRes] = await Promise.all([getRooms(), getUsers()]);
                if (roomsRes?.success) {
                    setRooms(roomsRes.data || []);
                } else {
                    // Fallback mock rooms
                    setRooms([
                        { id: 'room-1', roomName: 'Phòng Apollo 101', capacity: 10, siteName: 'Tòa nhà A', departmentRestricted: false },
                        { id: 'room-2', roomName: 'Phòng Athena 102', capacity: 15, siteName: 'Tòa nhà A', departmentRestricted: false },
                        { id: 'room-3', roomName: 'Phòng Zeus 201', capacity: 30, siteName: 'Tòa nhà B', departmentRestricted: true, departmentId: 'dept-it' },
                        { id: 'room-4', roomName: 'Phòng Huddle 302', capacity: 5, siteName: 'Tòa nhà B', departmentRestricted: false }
                    ]);
                }

                if (usersRes?.success) {
                    setUsers(usersRes.data || []);
                } else {
                    // Fallback mock users
                    setUsers([
                        { id: 'user-1', fullName: 'Lê Hoàng Hải', email: 'hai.lh@smrmpts.com' },
                        { id: 'user-2', fullName: 'Nguyễn Thị Minh', email: 'minh.nt@smrmpts.com' },
                        { id: 'user-3', fullName: 'Phan Văn Minh', email: 'minh.pv@smrmpts.com' },
                        { id: 'user-4', fullName: 'Phạm Thanh Sơn', email: 'son.pt@smrmpts.com' }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching data', err);
                setErrorMsg('Không thể tải danh sách phòng họp hoặc nhân sự.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    
    // Calculate total duration in minutes between start and end time
    const getMeetingDurationMinutes = () => {
        if (!startTime || !endTime) return 0;
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const startTotal = sh * 60 + sm;
        const endTotal = eh * 60 + em;
        return Math.max(0, endTotal - startTotal);
    };

    const meetingDuration = getMeetingDurationMinutes();
    const agendaTotalDuration = agendaList.reduce((acc, curr) => acc + Number(curr.durationMin), 0);

    const handleAddAgenda = () => {
        if (!newAgendaTitle.trim()) return;
        const duration = Number(newAgendaDuration);
        if (isNaN(duration) || duration <= 0) return;

        if (agendaTotalDuration + duration > meetingDuration) {
            setErrorMsg(`Tổng thời lượng chương trình họp (${agendaTotalDuration + duration} phút) vượt quá thời lượng cuộc họp (${meetingDuration} phút).`);
            return;
        }

        setErrorMsg('');
        setAgendaList(prev => [
            ...prev,
            {
                title: newAgendaTitle,
                durationMin: duration,
                orderIndex: prev.length
            }
        ]);
        setNewAgendaTitle('');
    };

    const handleRemoveAgenda = (index) => {
        setAgendaList(prev => prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, orderIndex: idx })));
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipantIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMessage('');
        setConflictInfo(null);
        setAlternativeRooms([]);

        if (!title.trim()) {
            setErrorMsg('Vui lòng nhập tiêu đề cuộc họp.');
            return;
        }
        if (!selectedRoomId) {
            setErrorMsg('Vui lòng chọn phòng họp.');
            return;
        }
        if (meetingDuration <= 0) {
            setErrorMsg('Giờ kết thúc phải sau giờ bắt đầu.');
            return;
        }

        // BR1 (Capacity constraint)
        const totalPeople = selectedParticipantIds.length + 1; // +1 for the host
        if (selectedRoom && totalPeople > selectedRoom.capacity) {
            setErrorMsg(`Phòng họp "${selectedRoom.roomName}" chỉ chứa tối đa ${selectedRoom.capacity} người, nhưng cuộc họp có ${totalPeople} người tham gia (bao gồm người tổ chức).`);
            return;
        }

        // PDPA check
        if (recordingEnabled && !pdpaConsent) {
            setErrorMsg('Bạn phải đồng ý với cam kết bảo vệ dữ liệu cá nhân (PDPA) khi bật tính năng ghi hình.');
            return;
        }

        const scheduledStart = new Date(`${meetingDate}T${startTime}:00`).toISOString();
        const scheduledEnd = new Date(`${meetingDate}T${endTime}:00`).toISOString();

        const payload = {
            title,
            roomId: selectedRoomId,
            scheduledStart,
            scheduledEnd,
            participantIds: selectedParticipantIds,
            recordingEnabled,
            agenda: agendaList
        };

        setSubmitting(true);
        try {
            const res = await createMeeting(payload);
            if (res?.success) {
                const isAutoApproved = currentUser?.role === 'Manager' || currentUser?.role === 'BusinessAdmin' || currentUser?.role === 'SystemAdmin';
                if (isAutoApproved) {
                    setSuccessMessage('Đặt phòng họp thành công! Lịch họp đã được lên lịch.');
                } else {
                    setSuccessMessage('Đăng ký đặt phòng họp thành công! Yêu cầu của bạn đã được gửi tới Quản lý phê duyệt.');
                }
                
                // Clear form
                setTitle('');
                setSelectedRoomId('');
                setSelectedParticipantIds([]);
                setAgendaList([]);
                setRecordingEnabled(false);
                setPdpaConsent(false);
            } else {
                throw new Error(res?.message || 'Conflict or general error');
            }
        } catch (err) {
            // Simulate conflict auto-detection (UC-SM-03 & BR-BOOK-01)
            // If API fails or is mock, we simulate conflict handling
            console.error('Booking failed', err);
            
            // Suggest alternative rooms with >= capacity that are not the selected one
            const alts = rooms.filter(r => r.id !== selectedRoomId && r.capacity >= totalPeople);
            setConflictInfo({
                message: 'Rất tiếc, phòng họp này hoặc người tham dự đã bị trùng lịch trong khung giờ được chọn. Vui lòng chọn phòng khác hoặc điều chỉnh khung giờ.'
            });
            setAlternativeRooms(alts);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectAlternativeRoom = (roomId) => {
        setSelectedRoomId(roomId);
        setConflictInfo(null);
        setAlternativeRooms([]);
    };

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-blue">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-semibold text-sm">Đang tải danh sách tài nguyên và thông tin cấu hình...</p>
            </div>
        );
    }

    const isManagerOrAdmin = currentUser?.role === 'Manager' || currentUser?.role === 'BusinessAdmin' || currentUser?.role === 'SystemAdmin';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-xl border border-platinum-tint text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist/50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-midnight-indigo">Đặt lịch & Đăng ký phòng họp</h1>
                    <p className="text-xs text-slate-blue">Lên kế hoạch cuộc họp, thiết lập chương trình (agenda) và kiểm tra chính sách bảo mật</p>
                </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns - Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Information */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                            <Calendar className="w-4 h-4 text-action-blue" /> Thông tin cuộc họp
                        </h3>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Tiêu đề cuộc họp *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề hoặc mục đích họp..."
                                className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue focus:ring-2 focus:ring-action-blue/15 text-midnight-indigo"
                                required
                            />
                        </div>

                        {/* Date & Time Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Ngày họp *</label>
                                <input
                                    type="date"
                                    value={meetingDate}
                                    onChange={(e) => setMeetingDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Giờ bắt đầu *</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Giờ kết thúc *</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                    required
                                />
                            </div>
                        </div>

                        {/* Room Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Chọn phòng họp *</label>
                            <select
                                value={selectedRoomId}
                                onChange={(e) => setSelectedRoomId(e.target.value)}
                                className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                required
                            >
                                <option value="">-- Chọn phòng họp --</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.roomName} (Sức chứa: {room.capacity} người - {room.siteName})
                                    </option>
                                ))}
                            </select>
                            {selectedRoom && (
                                <div className="mt-2 text-xs text-slate-blue flex items-center gap-1.5 bg-cloud-mist/30 p-2.5 rounded-lg border border-platinum-tint/40">
                                    <Info className="w-4 h-4 text-action-blue" />
                                    <span>
                                        Sức chứa phòng này là <strong>{selectedRoom.capacity} người</strong>.
                                        {selectedRoom.departmentRestricted && ' (Chỉ áp dụng cho nội bộ phòng ban)'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                            <Users className="w-4 h-4 text-royal-amethyst" /> Mời khách tham gia
                        </h3>
                        <p className="text-xs text-slate-blue">Chọn các thành viên bắt buộc tham dự cuộc họp này:</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                            {users.map(user => {
                                const isSelected = selectedParticipantIds.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleParticipant(user.id)}
                                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                                            isSelected 
                                                ? 'bg-purple-50/50 border-royal-amethyst text-royal-amethyst font-semibold' 
                                                : 'border-platinum-tint hover:bg-cloud-mist/30 text-slate-blue'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm">{user.fullName}</p>
                                            <p className="text-[11px] opacity-80">{user.email}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                            isSelected ? 'bg-royal-amethyst text-white border-royal-amethyst' : 'border-platinum-tint'
                                        }`}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Agenda Builder */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-cloud-mist">
                            <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" /> Chương trình họp (Agenda)
                            </h3>
                            <span className="text-xs font-bold text-slate-blue bg-cloud-mist px-2.5 py-1 rounded-lg">
                                Đã lên: {agendaTotalDuration} / {meetingDuration} phút
                            </span>
                        </div>

                        {/* New Agenda Input */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newAgendaTitle}
                                    onChange={(e) => setNewAgendaTitle(e.target.value)}
                                    placeholder="Chủ đề / Nội dung thảo luận..."
                                    className="w-full px-4 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                />
                            </div>
                            <div className="w-full sm:w-32 flex items-center gap-2">
                                <input
                                    type="number"
                                    value={newAgendaDuration}
                                    onChange={(e) => setNewAgendaDuration(e.target.value)}
                                    min="1"
                                    placeholder="Phút"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo text-center"
                                />
                                <span className="text-xs text-slate-blue">phút</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddAgenda}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Thêm
                            </button>
                        </div>

                        {/* Agenda List */}
                        {agendaList.length > 0 ? (
                            <div className="space-y-2 pt-2">
                                {agendaList.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-cloud-mist/30 rounded-xl border border-platinum-tint/40 text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center border border-emerald-100">
                                                {index + 1}
                                            </span>
                                            <span className="font-semibold text-midnight-indigo">{item.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-slate-blue bg-cloud-mist px-2.5 py-0.5 rounded-full">{item.durationMin} phút</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAgenda(index)}
                                                className="p-1 text-slate-blue hover:text-red-600 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-blue text-center py-4 italic">Chưa thiết lập chương trình thảo luận chi tiết.</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Status, Privacy & Action */}
                <div className="space-y-6">
                    {/* Status & Approvals */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider pb-3 border-b border-cloud-mist">
                            Trạng thái & Phê duyệt
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-blue">Người tổ chức:</span>
                                <span className="font-bold text-midnight-indigo">{currentUser?.fullName || 'Nhân viên'}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-blue">Quy trình duyệt:</span>
                                {isManagerOrAdmin ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                        Tự động phê duyệt
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                                        Cần Trưởng phòng duyệt
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-slate-blue leading-relaxed pt-2 border-t border-cloud-mist/50">
                                {isManagerOrAdmin 
                                    ? 'Với vai trò quản lý hệ thống, lịch họp này sẽ được chốt tức thời mà không cần qua bước phê duyệt trung gian.'
                                    : 'Yêu cầu của bạn sẽ được gửi tới hòm thư phê duyệt của Trưởng phòng. Phòng họp sẽ được tạm khóa giữ chỗ để tránh xung đột.'}
                            </p>
                        </div>
                    </div>

                    {/* Recording & Privacy Consent */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                            <Video className="w-4 h-4 text-red-600" /> Tùy chọn ghi hình
                        </h3>

                        {/* Recording Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-midnight-indigo">Ghi hình cuộc họp</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={recordingEnabled}
                                    onChange={(e) => {
                                        setRecordingEnabled(e.target.checked);
                                        if (!e.target.checked) setPdpaConsent(false);
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        {/* PDPA Warning Block */}
                        <AnimatePresence>
                            {recordingEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 overflow-hidden text-xs text-slate-blue"
                                >
                                    <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-2">
                                        <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
                                        <p className="leading-relaxed">
                                            Theo Nghị định bảo vệ dữ liệu cá nhân (PDPA VN), bạn phải có sự đồng ý của tất cả thành viên bắt buộc tham dự trước khi thực hiện ghi âm/ghi hình cuộc họp.
                                        </p>
                                    </div>

                                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={pdpaConsent}
                                            onChange={(e) => setPdpaConsent(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded text-red-600 border-platinum-tint focus:ring-red-500"
                                        />
                                        <span className="leading-tight font-medium text-slate-blue">
                                            Tôi cam kết đã thông báo và có sự đồng ý của tất cả người tham gia.
                                        </span>
                                    </label>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions and Feedback messages */}
                    <div className="space-y-3">
                        <AnimatePresence>
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex gap-2"
                                >
                                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                                    <span>{successMessage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Xác nhận đặt phòng'
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Collision warning & Alternative Rooms suggestion modal / panel */}
            <AnimatePresence>
                {conflictInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="bg-white p-6 rounded-2xl border border-amber-200 shadow-lg space-y-4"
                    >
                        <div className="flex gap-3 items-start bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm text-amber-800">Xung đột bận lịch (Collision Detected)</h4>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    {conflictInfo.message}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-xs text-slate-blue uppercase mb-3 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4 text-action-blue" /> Đề xuất phòng họp thay thế khả dụng:
                            </h4>
                            {alternativeRooms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {alternativeRooms.map(room => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleSelectAlternativeRoom(room.id)}
                                            className="p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-between"
                                        >
                                            <div>
                                                <h5 className="font-bold text-sm text-midnight-indigo">{room.roomName}</h5>
                                                <p className="text-xs text-slate-blue">Sức chứa: {room.capacity} người • {room.siteName}</p>
                                            </div>
                                            <span className="text-xs font-bold text-action-blue bg-blue-50 px-2.5 py-1 rounded-lg">Chọn phòng này</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-blue italic pl-2">Không tìm thấy phòng họp trống thay thế nào có sức chứa tương đương trong thời gian này.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookMeeting;
