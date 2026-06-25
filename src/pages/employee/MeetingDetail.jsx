import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Users, Video, Edit3, Trash2, ArrowLeft,
    Check, Play, Pause, Search, List, AlertTriangle
} from 'lucide-react';
import { getMeetingById, updateMeeting, cancelMeeting, getRooms, getUsers } from '../../service/employeeServices';

const mockTranscript = [
    { time: 10, speaker: 'Lê Hoàng Hải', text: 'Chào mọi người, chúng ta bắt đầu họp bàn về thiết kế giao diện FE SmarTracking nhé.' },
    { time: 25, speaker: 'Nguyễn Thị Minh', text: 'Tôi nghĩ chúng ta nên dùng HSL Tailored Colors để tăng tính thẩm mỹ cao cấp.' },
    { time: 45, speaker: 'Phan Văn Minh', text: 'Đồng ý, đồng thời cũng cần lưu ý nguyên lý PDPA khi thu thập dữ liệu camera.' },
    { time: 70, speaker: 'Lê Hoàng Hải', text: 'Chính xác. Mọi bản ghi hình cuộc họp phải được sự đồng ý của tất cả thành viên.' },
    { time: 95, speaker: 'Phạm Thanh Sơn', text: 'Tôi sẽ cấu hình luồng quay video tự động từ thiết bị IP Camera trong phòng.' }
];

const EmployeeMeetingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [meeting, setMeeting] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Editing modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

    // Edit fields
    const [editTitle, setEditTitle] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [editRoomId, setEditRoomId] = useState('');
    const [editParticipants, setEditParticipants] = useState([]);
    const [editRecordingEnabled, setEditRecordingEnabled] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Agenda edit state
    const [agendaList, setAgendaList] = useState([]);
    const [newAgendaTitle, setNewAgendaTitle] = useState('');
    const [newAgendaDuration, setNewAgendaDuration] = useState('15');

    // Data lists for editing
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);

    // Recording & Transcript player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [transcriptQuery, setTranscriptQuery] = useState('');
    const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

    const fetchMeeting = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Load user context
            const localUserStr = localStorage.getItem('user');
            if (localUserStr) {
                setCurrentUser(JSON.parse(localUserStr));
            }

            const res = await getMeetingById(id);
            if (res?.success && res.data) {
                const data = res.data;
                setMeeting(data);
                initEditStates(data);
            } else {
                throw new Error();
            }
        } catch {
            // Mock fallbacks for employee meeting detail
            const localUserStr = localStorage.getItem('user');
            let userObj = { id: 'emp-uuid', fullName: 'Nhân viên nội bộ' };
            if (localUserStr) {
                try { userObj = JSON.parse(localUserStr); } catch (e) {}
            }

            const mockData = {
                id: id || 'meet-101',
                meeting_code: 'MEET-260615-001',
                title: 'Họp kỹ thuật dự án FE SmarTracking',
                room: { 
                    id: 'room-1', 
                    roomName: 'Phòng Apollo 101', 
                    room_name: 'Phòng Apollo 101', 
                    capacity: 10, 
                    siteName: 'Tòa nhà A',
                    site_name: 'Tòa nhà A'
                },
                startTime: new Date(new Date().setHours(9, 0, 0)).toISOString(),
                start_time: new Date(new Date().setHours(9, 0, 0)).toISOString(),
                endTime: new Date(new Date().setHours(10, 30, 0)).toISOString(),
                end_time: new Date(new Date().setHours(10, 30, 0)).toISOString(),
                host: userObj.fullName || 'Lê Hoàng Hải',
                hostId: userObj.id || 'emp-uuid',
                host_id: userObj.id || 'emp-uuid',
                status: 'scheduled', // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                recordingEnabled: true,
                recording_enabled: true,
                description: 'Rà soát giao diện và các API của các chức năng đặt phòng họp.',
                participants: [
                    { id: 'user-1', fullName: 'Lê Hoàng Hải', full_name: 'Lê Hoàng Hải', email: 'hai.lh@smrmpts.com' },
                    { id: 'user-2', fullName: 'Nguyễn Thị Minh', full_name: 'Nguyễn Thị Minh', email: 'minh.nt@smrmpts.com' },
                    { id: 'user-3', fullName: 'Phan Văn Minh', full_name: 'Phan Văn Minh', email: 'minh.pv@smrmpts.com' }
                ],
                agenda: [
                    { title: 'Khởi động & Demo giao diện', durationMin: 15, orderIndex: 0 },
                    { title: 'Thảo luận API tích hợp thiết bị', durationMin: 30, orderIndex: 1 },
                    { title: 'Chốt phương án & phân công nhiệm vụ', durationMin: 15, orderIndex: 2 }
                ]
            };
            setMeeting(mockData);
            initEditStates(mockData);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const initEditStates = (data) => {
        setEditTitle(data.title || '');
        const startVal = data.start_time || data.startTime;
        const startDate = new Date(startVal);
        setEditDate(startDate.toISOString().split('T')[0]);
        setEditStart(startDate.toTimeString().substring(0, 5));
        setEditEnd(new Date(data.end_time || data.endTime).toTimeString().substring(0, 5));
        setEditRoomId(data.room?.id || '');
        setEditParticipants(data.participants?.map(p => p.id) || []);
        setEditRecordingEnabled(data.recording_enabled || data.recordingEnabled || false);
        setAgendaList(data.agenda || []);
    };

    useEffect(() => {
        fetchMeeting();
    }, [fetchMeeting]);

    // Load helper data for edit forms
    useEffect(() => {
        if (isEditModalOpen) {
            const loadHelpers = async () => {
                try {
                    const [roomsRes, usersRes] = await Promise.all([getRooms(), getUsers()]);
                    if (roomsRes?.success) setRooms(roomsRes.data || []);
                    if (usersRes?.success) setUsers(usersRes.data || []);
                } catch (e) {}
            };
            loadHelpers();
        }
    }, [isEditModalOpen]);

    // Simulated playback updates for transcript
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const nextTime = prev + 1;
                    if (nextTime > 120) {
                        setIsPlaying(false);
                        return 0;
                    }
                    // Find active transcript index
                    const segmentIndex = mockTranscript.findIndex((t, i) => {
                        const next = mockTranscript[i + 1];
                        return nextTime >= t.time && (!next || nextTime < next.time);
                    });
                    if (segmentIndex !== -1) {
                        setActiveSegmentIndex(segmentIndex);
                    }
                    return nextTime;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Auto-hide success/error alerts
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const startISO = new Date(`${editDate}T${editStart}:00`).toISOString();
            const endISO = new Date(`${editDate}T${editEnd}:00`).toISOString();
            
            const payload = {
                title: editTitle,
                roomId: editRoomId,
                scheduledStart: startISO,
                scheduledEnd: endISO,
                participantIds: editParticipants,
                recordingEnabled: editRecordingEnabled,
                agenda: agendaList
            };

            const res = await updateMeeting(meeting.id, payload);
            if (res?.success) {
                setSuccessMsg('Đã cập nhật thông tin cuộc họp thành công.');
                setIsEditModalOpen(false);
                fetchMeeting();
            } else {
                // Mock local success
                setMeeting(prev => ({
                    ...prev,
                    title: editTitle,
                    room: rooms.find(r => r.id === editRoomId) || prev.room,
                    startTime: startISO,
                    endTime: endISO,
                    recordingEnabled: editRecordingEnabled,
                    participants: users.filter(u => editParticipants.includes(u.id))
                }));
                setSuccessMsg('Đã mô phỏng cập nhật thông tin cuộc họp.');
                setIsEditModalOpen(false);
            }
        } catch (err) {
            setError(err.message || 'Lỗi cập nhật cuộc họp.');
        }
    };

    const handleCancelMeeting = async () => {
        setError(null);
        try {
            const res = await cancelMeeting(meeting.id, cancelReason);
            if (res?.success) {
                setSuccessMsg('Đã hủy cuộc họp thành công.');
                setIsCancelConfirmOpen(false);
                fetchMeeting();
            } else {
                // Mock local cancel
                setMeeting(prev => ({ ...prev, status: 'cancelled' }));
                setSuccessMsg('Đã mô phỏng hủy cuộc họp.');
                setIsCancelConfirmOpen(false);
            }
        } catch (err) {
            setError(err.message || 'Lỗi hủy cuộc họp.');
        }
    };

    const handleAddAgendaItem = () => {
        if (!newAgendaTitle.trim()) return;
        const dur = Number(newAgendaDuration);
        if (isNaN(dur) || dur <= 0) return;

        setAgendaList(prev => [
            ...prev,
            { title: newAgendaTitle, durationMin: dur, orderIndex: prev.length }
        ]);
        setNewAgendaTitle('');
    };

    const handleRemoveAgendaItem = (idx) => {
        setAgendaList(prev => prev.filter((_, i) => i !== idx).map((item, idy) => ({ ...item, orderIndex: idy })));
    };

    const handleSaveAgenda = async () => {
        try {
            const payload = { agenda: agendaList };
            const res = await updateMeeting(meeting.id, payload);
            if (res?.success) {
                setSuccessMsg('Cập nhật chương trình Agenda thành công.');
                setIsAgendaModalOpen(false);
                fetchMeeting();
            } else {
                setMeeting(prev => ({ ...prev, agenda: agendaList }));
                setSuccessMsg('Đã mô phỏng cập nhật Agenda.');
                setIsAgendaModalOpen(false);
            }
        } catch (err) {
            setError('Không thể lưu Agenda.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-blue text-sm font-semibold">Đang tải chi tiết cuộc họp...</p>
            </div>
        );
    }

    const isHost = currentUser?.id === (meeting.host_id || meeting.hostId);
    const canJoin = meeting.status === 'scheduled' || meeting.status === 'in_progress';
    const isCompleted = meeting.status === 'completed';

    const filteredTranscript = mockTranscript.filter(item => 
        item.text.toLowerCase().includes(transcriptQuery.toLowerCase()) || 
        item.speaker.toLowerCase().includes(transcriptQuery.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-slate-blue hover:text-midnight-indigo font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                    {isHost && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                        <>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-platinum-tint bg-white text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-bold transition-all"
                            >
                                <Edit3 className="w-4 h-4" /> Chỉnh sửa cuộc họp
                            </button>
                            <button
                                onClick={() => setIsAgendaModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-platinum-tint bg-white text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-bold transition-all"
                            >
                                <List className="w-4 h-4" /> Quản lý Agenda
                            </button>
                            <button
                                onClick={() => setIsCancelConfirmOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> Hủy họp
                            </button>
                        </>
                    )}
                    {canJoin && (
                        <button
                            onClick={() => navigate(`/employee/in-meeting/${meeting.id}`)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all animate-pulse-soft"
                        >
                            <Video className="w-4 h-4" /> Tham gia phòng họp
                        </button>
                    )}
                </div>
            </div>

            {successMsg && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Title & Banner Info */}
            <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            meeting.status === 'scheduled' ? 'bg-blue-50 text-action-blue border border-blue-150' :
                            meeting.status === 'in_progress' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            meeting.status === 'completed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {meeting.status === 'scheduled' ? 'Đã xếp lịch' :
                             meeting.status === 'in_progress' ? 'Đang họp' :
                             meeting.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
                        </span>
                        {meeting.recordingEnabled && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" /> Tự động ghi hình
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-midnight-indigo leading-snug">{meeting.title}</h1>
                    <p className="text-slate-blue text-xs max-w-2xl">{meeting.description || 'Không có mô tả cuộc họp'}</p>
                </div>

                <div className="flex flex-wrap md:flex-col gap-4 text-xs font-semibold text-slate-blue border-t md:border-t-0 md:border-l border-platinum-tint/60 pt-4 md:pt-0 md:pl-6 shrink-0 justify-between md:justify-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-action-blue" />
                        <span>{new Date(meeting.start_time || meeting.startTime).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-action-blue" />
                        <span>
                            {new Date(meeting.start_time || meeting.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.end_time || meeting.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-action-blue" />
                        <span className="text-midnight-indigo font-bold">{meeting.room?.room_name || meeting.room?.roomName} ({meeting.room?.site_name || meeting.room?.siteName})</span>
                    </div>
                </div>
            </div>

            {/* Split Content: Details & Agenda vs Recording Player */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Details & Agenda Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Agenda */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                        <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 mb-4 flex items-center gap-2">
                            <List className="w-4.5 h-4.5 text-action-blue" />
                            Chương trình nghị sự ({meeting.agenda?.length || 0})
                        </h3>
                        {meeting.agenda && meeting.agenda.length > 0 ? (
                            <div className="space-y-4">
                                {meeting.agenda.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-platinum-tint last:before:hidden">
                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-action-blue/10 border border-action-blue flex items-center justify-center text-[9px] font-bold text-action-blue">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 bg-cloud-mist/55 p-3 rounded-xl border border-outline-gray/60">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-midnight-indigo text-xs sm:text-sm">{item.title}</h4>
                                                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-action-blue rounded font-bold">{item.durationMin} phút</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-blue italic text-center py-4">Chưa có Agenda nào được cấu hình cho cuộc họp này.</p>
                        )}
                    </div>

                    {/* Participants & Host */}
                    <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                        <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 mb-4 flex items-center gap-2">
                            <Users className="w-4.5 h-4.5 text-action-blue" />
                            Người tham dự ({meeting.participants?.length || 0})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-action-blue text-white font-bold flex items-center justify-center text-sm ring-2 ring-white">
                                    {meeting.host?.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <span className="block text-xs font-bold text-action-blue uppercase tracking-wider text-[9px]">Chủ trì / Host</span>
                                    <span className="text-xs font-bold text-midnight-indigo block truncate">{meeting.host}</span>
                                </div>
                            </div>
                            
                            {meeting.participants?.filter(p => (p.fullName || p.full_name) !== meeting.host).map(p => (
                                <div key={p.id} className="p-3 bg-cloud-mist rounded-xl border border-outline-gray flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
                                        {(p.fullName || p.full_name)?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <span className="block text-xs font-bold text-slate-blue uppercase tracking-wider text-[9px]">Attendee</span>
                                        <span className="text-xs font-bold text-midnight-indigo block truncate">{p.fullName || p.full_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Media & Recording & Transcript */}
                <div className="lg:col-span-1 space-y-6">
                    {meeting.recordingEnabled && isCompleted ? (
                        <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-2 space-y-5">
                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 flex items-center gap-2">
                                <Video className="w-4.5 h-4.5 text-red-600" />
                                Video ghi hình & Transcript
                            </h3>
                            
                            {/* Player Simulation */}
                            <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center text-white border border-slate-950 shadow-inner group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 to-transparent flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-[10px] font-semibold bg-red-600/90 text-white px-2 py-0.5 rounded self-start uppercase">Recording Playback</span>
                                    <span className="text-[10.5px] font-mono text-slate-300 self-end">
                                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 2:00
                                    </span>
                                </div>

                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-md transform active:scale-95 z-10"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                                </button>
                            </div>

                            {/* Transcript Area */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-midnight-indigo">Transcript cuộc họp</span>
                                    <div className="relative w-36">
                                        <input
                                            type="text"
                                            placeholder="Tìm từ khóa..."
                                            value={transcriptQuery}
                                            onChange={(e) => setTranscriptQuery(e.target.value)}
                                            className="w-full pl-7 pr-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] focus:outline-none focus:border-action-blue"
                                        />
                                        <Search className="w-3.5 h-3.5 text-slate-blue absolute left-2 top-2" />
                                    </div>
                                </div>

                                <div className="h-48 overflow-y-auto border border-outline-gray rounded-xl p-3 bg-cloud-mist/30 space-y-3 text-[11px] pr-1.5 scrollbar-thin">
                                    {filteredTranscript.map((segment, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setCurrentTime(segment.time)}
                                            className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                                                idx === activeSegmentIndex && isPlaying
                                                    ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                                                    : 'bg-white border-outline-gray/60 hover:bg-cloud-mist'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1 text-[9.5px]">
                                                <span className="font-bold text-midnight-indigo">{segment.speaker}</span>
                                                <span className="text-slate-blue font-mono font-bold">
                                                    {Math.floor(segment.time / 60)}:{(segment.time % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            <p className="text-slate-blue leading-relaxed">{segment.text}</p>
                                        </div>
                                    ))}
                                    {filteredTranscript.length === 0 && (
                                        <p className="text-center italic text-slate-blue py-6">Không tìm thấy nội dung phù hợp.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-2 text-center py-8 text-slate-blue">
                            <Video className="w-8 h-8 mx-auto text-platinum-tint mb-2.5" />
                            <h4 className="text-xs font-bold text-midnight-indigo uppercase">Không có Video ghi hình</h4>
                            <p className="text-[11px] mt-1 leading-relaxed text-slate-blue/80">
                                {meeting.recordingEnabled 
                                    ? 'Bản ghi hình và Transcript cuộc họp sẽ khả dụng sau khi cuộc họp kết thúc.' 
                                    : 'Cuộc họp này không đăng ký chế độ tự động ghi hình (Recording).'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL 1: Edit Meeting */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/50 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-sm-3 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-lg font-bold text-midnight-indigo border-b border-platinum-tint pb-3">Chỉnh sửa thông tin cuộc họp</h2>
                            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tiêu đề cuộc họp</label>
                                    <input
                                        type="text"
                                        required
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Ngày họp</label>
                                        <input
                                            type="date"
                                            required
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Bắt đầu</label>
                                        <input
                                            type="time"
                                            required
                                            value={editStart}
                                            onChange={(e) => setEditStart(e.target.value)}
                                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Kết thúc</label>
                                        <input
                                            type="time"
                                            required
                                            value={editEnd}
                                            onChange={(e) => setEditEnd(e.target.value)}
                                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Chọn phòng họp</label>
                                    <select
                                        value={editRoomId}
                                        onChange={(e) => setEditRoomId(e.target.value)}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm bg-white focus:outline-none focus:border-action-blue"
                                    >
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.roomName} ({r.siteName}) - Sức chứa: {r.capacity}</option>
                                        ))}
                                    </select>
                                </div>

                                <label className="flex items-center gap-2.5 p-3 bg-cloud-mist rounded-xl border border-outline-gray cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editRecordingEnabled}
                                        onChange={(e) => setEditRecordingEnabled(e.target.checked)}
                                        className="w-4 h-4 rounded text-action-blue border-platinum-tint focus:ring-action-blue"
                                    />
                                    <span className="text-xs text-midnight-indigo font-semibold">Tự động ghi âm/ghi hình cuộc họp (Yêu cầu PDPA Consent)</span>
                                </label>

                                <div className="flex justify-end gap-3 pt-4 border-t border-platinum-tint">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold"
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: Manage Agenda */}
            <AnimatePresence>
                {isAgendaModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/50 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-sm-3 max-w-xl w-full p-6 space-y-4"
                        >
                            <h2 className="text-lg font-bold text-midnight-indigo border-b border-platinum-tint pb-3">Quản lý chương trình Agenda</h2>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Tên mục nghị sự mới..."
                                        value={newAgendaTitle}
                                        onChange={(e) => setNewAgendaTitle(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue"
                                    />
                                    <select
                                        value={newAgendaDuration}
                                        onChange={(e) => setNewAgendaDuration(e.target.value)}
                                        className="w-24 px-2.5 py-2 border border-platinum-tint rounded-xl text-xs bg-white focus:outline-none"
                                    >
                                        <option value="5">5 phút</option>
                                        <option value="10">10 phút</option>
                                        <option value="15">15 phút</option>
                                        <option value="30">30 phút</option>
                                        <option value="45">45 phút</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddAgendaItem}
                                        className="px-3.5 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold"
                                    >
                                        Thêm
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {agendaList.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-cloud-mist rounded-xl border border-outline-gray">
                                            <div className="text-left">
                                                <span className="text-xs font-bold text-midnight-indigo block">{item.title}</span>
                                                <span className="text-[10px] text-slate-blue font-medium">{item.durationMin} phút</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveAgendaItem(idx)}
                                                className="text-red-500 hover:text-red-700 p-1.5"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-platinum-tint">
                                <button
                                    type="button"
                                    onClick={() => setIsAgendaModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleSaveAgenda}
                                    className="px-5 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold"
                                >
                                    Lưu Agenda
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: Cancel Confirm */}
            <AnimatePresence>
                {isCancelConfirmOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/50 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-sm-3 max-w-md w-full p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3 text-red-600 border-b border-platinum-tint pb-3">
                                <AlertTriangle className="w-6 h-6" />
                                <h2 className="text-lg font-bold text-midnight-indigo">Xác nhận hủy cuộc họp</h2>
                            </div>
                            <div className="space-y-3 text-left">
                                <p className="text-xs text-slate-blue leading-relaxed">
                                    Hành động này sẽ gửi email thông báo hủy phòng họp tới toàn bộ người tham gia. Bạn không thể hoàn tác hành động này.
                                </p>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Lý do hủy họp (Không bắt buộc)</label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Nhập lý do hủy..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-platinum-tint">
                                <button
                                    type="button"
                                    onClick={() => setIsCancelConfirmOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleCancelMeeting}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold"
                                >
                                    Hủy cuộc họp
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeMeetingDetail;
