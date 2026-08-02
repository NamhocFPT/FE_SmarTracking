import { AlertTriangle, Calendar, Check, Clock, Download, Edit3, FileText, List, MapPin, Pause, Play, Search, Trash2, Upload, Users, Video, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getMeetingById, updateMeeting, updateMeetingTime, updateMeetingRoom, updateMeetingRecordingConfig, replaceAgendas, cancelMeeting, getRooms, getUsers, getMeetingMediaFiles } from '../../service/employeeServices';
import UserAvatar from '../../component/UserAvatar';
import AudioUploader from '../../components/transcription/AudioUploader';
import TranscriptViewer from '../../components/transcription/TranscriptViewer';
import MinutesTabContent from '../../components/minutes/MinutesTabContent';
import AddExternalParticipantModal from '../../component/AddExternalParticipantModal';

const EmployeeMeetingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [timeValidationModal, setTimeValidationModal] = useState({ isOpen: false, message: '' });
    const [meeting, setMeeting] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);

    // Editing modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [showAddGuestModal, setShowAddGuestModal] = useState(false);

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
    const [newAgendaFile, setNewAgendaFile] = useState(null);

    // Data lists for editing
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);

    // Recording & Transcript player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Force re-render flag for TranscriptViewer when upload succeeds
    const [refreshTranscriptKey, setRefreshTranscriptKey] = useState(0);
    const [activeRightTab, setActiveRightTab] = useState('transcript');

    /**
     * Chuẩn hoá DTO lồng nhau từ API GET /meetings/:id
     * Map { meeting, host, organizer, room, participants, agendas, recordingConfig }
     * sang shape phẳng mà UI dùng, giữ cả camelCase và snake_case để tương thích.
     */
    const normalizeMeetingDetail = (dto) => {
        const meetingObj = dto.meeting || dto;
        const hostName = dto.host?.fullName || dto.organizer?.fullName || dto.hostName || dto.host_name || 'Chưa rõ';
        const hostId = dto.host?.id || dto.hostId || dto.host_id || dto.organizer?.id;
        const organizerId = dto.organizerId || dto.organizer_id || dto.organizer?.id;
        const room = dto.room || {};
        const participants = (dto.participants || []).map(p => ({
            id: p.userId || p.user_id || p.user?.id || p.id,
            fullName: p.fullName || p.full_name || p.user?.fullName || '',
            email: p.email || p.user?.email || '',
            participantRole: p.participantRole || p.participant_role || 'participant',
        }));
        const agenda = (dto.agendas || dto.agenda || []).map((a, idx) => ({
            ...a,
            durationMin: a.durationMinutes ?? a.durationMin ?? a.plannedDurationMinutes ?? 15,
            orderIndex: a.sortOrder ?? a.orderIndex ?? idx,
        }));
        return {
            // Meeting core fields (dual casing for compatibility)
            id: meetingObj.id || meetingObj.meetingId || dto.id || dto.meetingId,
            meetingId: meetingObj.id || meetingObj.meetingId || dto.id || dto.meetingId,
            meeting_code: meetingObj.meetingCode || meetingObj.meeting_code || dto.meetingCode || dto.meeting_code,
            title: meetingObj.title || dto.title,
            description: meetingObj.description || dto.description,
            status: meetingObj.status || dto.status,
            // Host and Organizer
            host: hostName,
            hostId,
            host_id: hostId,
            organizerId,
            organizer_id: organizerId,
            // Room
            room: {
                id: room.id,
                roomName: room.roomName || room.room_name,
                room_name: room.roomName || room.room_name,
                location: room.location,
                siteName: room.siteName || room.site_name,
                site_name: room.siteName || room.site_name,
                capacity: room.capacity,
            },
            // Time fields (dual casing)
            startTime: meetingObj.startTime || meetingObj.start_time || dto.startTime || dto.start_time,
            start_time: meetingObj.startTime || meetingObj.start_time || dto.startTime || dto.start_time,
            endTime: meetingObj.endTime || meetingObj.end_time || dto.endTime || dto.end_time,
            end_time: meetingObj.endTime || meetingObj.end_time || dto.endTime || dto.end_time,
            // Recording
            recordingEnabled: dto.recordingConfig?.allowRecording || dto.recordingEnabled || dto.recording_enabled || false,
            recording_enabled: dto.recordingConfig?.allowRecording || dto.recordingEnabled || dto.recording_enabled || false,
            // Participants & Agenda
            participants,
            agenda,
        };
    };

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
                const normalized = normalizeMeetingDetail(res.data);
                setMeeting(normalized);
                initEditStates(normalized);
                if (normalized.status === 'completed' && normalized.recordingEnabled) {
                    try {
                        const mediaRes = await getMeetingMediaFiles(normalized.id);
                        if (mediaRes?.success) {
                            setMediaFiles(mediaRes.data || []);
                        }
                    } catch (e) {
                        // ignore error for media
                    }
                }
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể tải chi tiết cuộc họp.');
            }
        } catch (err) {
            const msg = err?.error?.message || err?.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [id]);


    const handleJoinMeeting = () => {
        const startVal = meeting.start_time || meeting.startTime;
        const endVal = meeting.end_time || meeting.endTime;
        if (!startVal || !endVal) {
            navigate(`/employee/in-meeting/${meeting.id}`);
            return;
        }

        const startDate = new Date(startVal);
        const endDate = new Date(endVal);
        const now = new Date();

        const diffMs = startDate.getTime() - now.getTime();
        if (diffMs > 15 * 60 * 1000) {
            const timeStr = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = startDate.toLocaleDateString('vi-VN');
            setTimeValidationModal({
                isOpen: true,
                message: `Cuộc họp chưa đến giờ diễn ra. Vui lòng quay lại vào lúc ${timeStr} ngày ${dateStr}.`
            });
            return;
        }

        if (now > endDate) {
            setTimeValidationModal({
                isOpen: true,
                message: "Cuộc họp đã kết thúc khung giờ ban đầu."
            });
            return;
        }

        navigate(`/employee/in-meeting/${meeting.id}`);
    };

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
                } catch (e) { }
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

            // BE tách riêng từng endpoint cho time/room/recording-config/title —
            // PATCH /meetings/:id (updateMeeting) chỉ nhận title/description, các field khác
            // sẽ bị ValidationPipe loại bỏ nếu gộp chung vào 1 payload. Gọi tách từng endpoint
            // giống luồng manager để đảm bảo dữ liệu thực sự được lưu.
            let successCount = 0;
            if (startISO !== meeting.startTime || endISO !== meeting.endTime) {
                const timeRes = await updateMeetingTime(meeting.id, { startTime: startISO, endTime: endISO });
                if (timeRes?.success) successCount++;
            }
            if (editRoomId !== meeting.room?.id) {
                const roomRes = await updateMeetingRoom(meeting.id, { newRoomId: editRoomId });
                if (roomRes?.success) successCount++;
            }
            if (editRecordingEnabled !== meeting.recordingEnabled) {
                const recRes = await updateMeetingRecordingConfig(meeting.id, { enableVideo: editRecordingEnabled, enableAudio: editRecordingEnabled });
                if (recRes?.success) successCount++;
            }
            if (editTitle !== meeting.title) {
                await updateMeeting(meeting.id, { title: editTitle });
                successCount++;
            }

            if (successCount > 0 || (startISO === meeting.startTime && endISO === meeting.endTime && editRoomId === meeting.room?.id && editRecordingEnabled === meeting.recordingEnabled && editTitle === meeting.title)) {
                setSuccessMsg('Đã cập nhật thông tin cuộc họp thành công.');
                setIsEditModalOpen(false);
                fetchMeeting();
            } else {
                setError('Không thể cập nhật cuộc họp. Vui lòng thử lại.');
            }
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Lỗi cập nhật cuộc họp. Vui lòng thử lại.');
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
                setError(res?.message || 'Không thể hủy cuộc họp.');
            }
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Lỗi hủy cuộc họp. Vui lòng thử lại.');
        }
    };

    const handleAddAgendaItem = () => {
        if (!newAgendaTitle.trim()) return;
        const dur = Number(newAgendaDuration);
        if (isNaN(dur) || dur <= 0) return;

        setAgendaList(prev => [
            ...prev,
            {
                title: newAgendaTitle,
                durationMin: dur,
                orderIndex: prev.length,
                file: newAgendaFile ? { name: newAgendaFile.name, size: newAgendaFile.size } : null
            }
        ]);
        setNewAgendaTitle('');
        setNewAgendaFile(null);
    };

    const handleRemoveAgendaItem = (idx) => {
        setAgendaList(prev => prev.filter((_, i) => i !== idx).map((item, idy) => ({ ...item, orderIndex: idy })));
    };

    const handleSaveAgenda = async () => {
        try {
            // BE thay agenda qua PUT /meetings/:id/agendas (ReplaceAgendaDto: { items }),
            // KHÔNG qua PATCH /meetings/:id — field "agenda" không tồn tại trong UpdateMeetingDto
            // nên trước đây bị ValidationPipe loại bỏ, lưu không có tác dụng.
            const items = agendaList.map(item => ({
                ...(item.id ? { id: item.id } : {}),
                title: item.title,
                plannedDurationMinutes: item.durationMin ?? item.plannedDurationMinutes ?? item.durationMinutes ?? 15,
                ...(item.description ? { description: item.description } : {}),
                ...(item.ownerId ? { ownerId: item.ownerId } : {}),
            }));
            const res = await replaceAgendas(meeting.id, items);
            if (res?.success) {
                setSuccessMsg('Cập nhật chương trình Agenda thành công.');
                setIsAgendaModalOpen(false);
                fetchMeeting();
            } else {
                setError(res?.message || 'Không thể lưu Agenda.');
            }
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Không thể lưu Agenda. Vui lòng thử lại.');
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

    if (!meeting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px]">
                <p className="text-red-500 font-semibold">Không tìm thấy thông tin cuộc họp hoặc có lỗi xảy ra.</p>
            </div>
        );
    }

    const isHost = currentUser?.id === (meeting.host_id || meeting.hostId);
    const isOrganizer = currentUser?.id === (meeting.organizer_id || meeting.organizerId);
    // Transcript/duyệt biên bản: BE cho phép Host HOẶC Admin (BUSINESS_ADMIN/SYSTEM_ADMIN) — xem GET /auth/me
    // trả data.roles là mảng { roleCode }, không phải field `role` dạng string.
    const isAdmin = currentUser?.roles?.some(r => ['BUSINESS_ADMIN', 'SYSTEM_ADMIN'].includes(r.roleCode || r.role_code));
    const canManage = isHost || isOrganizer || isAdmin;
    const hostParticipant = meeting.participants?.find((participant) =>
        participant.id === (meeting.host_id || meeting.hostId)
        || participant.userId === (meeting.host_id || meeting.hostId)
        || participant.participantRole === 'host'
        || participant.participant_role === 'host'
    );
    const hostUser = hostParticipant
        || (typeof meeting.host === 'object' ? meeting.host : {
            fullName: meeting.host,
            avatarUrl: meeting.hostAvatarUrl || meeting.host_avatar_url,
        });
    const hostName = hostUser?.fullName || hostUser?.full_name || meeting.hostName || meeting.host_name || 'Host';
    const canJoin = meeting.status === 'scheduled' || meeting.status === 'in_progress';
    const isCompleted = meeting.status === 'completed';

    // removed mock filteredTranscript

    let isBefore15Min = false;
    let isEnded = false;
    if (meeting?.start_time || meeting?.startTime) {
        const startVal = meeting.start_time || meeting.startTime;
        const startDate = new Date(startVal);
        const diffMs = startDate.getTime() - new Date().getTime();
        if (diffMs > 15 * 60 * 1000) {
            isBefore15Min = true;
        }
    }
    if (meeting?.end_time || meeting?.endTime) {
        const endVal = meeting.end_time || meeting.endTime;
        const endDate = new Date(endVal);
        if (endDate.getTime() < new Date().getTime()) {
            isEnded = true;
        }
    }

    const videoMedia = mediaFiles.find(m => m.type === 'VIDEO');
    const transcriptMedia = mediaFiles.find(m => m.type === 'TRANSCRIPT');

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
                {/* Header / Actions */}
                <div className="flex justify-end gap-2 w-full">
                    {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                        <>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-platinum-tint bg-white text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-bold transition-all"
                            >
                                <Edit3 className="w-4 h-4" /> Chỉnh sửa cuộc họp
                            </button>
                            <button
                                onClick={() => setIsCancelConfirmOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> Hủy họp
                            </button>
                        </>
                    )}
                    {meeting.status === 'completed' || isEnded ? (
                        <button
                            disabled
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                        >
                            Cuộc họp đã kết thúc
                        </button>
                    ) : meeting.status === 'cancelled' ? (
                        <button
                            disabled
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all bg-red-50 text-red-400 cursor-not-allowed border border-red-200"
                        >
                            Cuộc họp đã bị hủy
                        </button>
                    ) : canJoin && (
                        <button
                            onClick={isBefore15Min ? null : handleJoinMeeting}
                            disabled={isBefore15Min}
                            title={isBefore15Min ? "Nút tham gia sẽ mở trước giờ họp 15 phút" : ""}
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all ${isBefore15Min
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse-soft'
                                }`}
                        >
                            <Video className="w-4 h-4" /> Tham gia phòng họp
                        </button>
                    )}
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
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-platinum-tint shadow-sm-2 relative overflow-hidden space-y-6">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Users className="w-48 h-48 text-midnight-indigo" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b border-platinum-tint/60 relative z-10">
                        <div className="space-y-4 w-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                                    meeting.status === 'scheduled' ? 'bg-blue-50 text-action-blue border border-blue-200' :
                                    meeting.status === 'in_progress' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    meeting.status === 'completed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                    'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${meeting.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                                    {meeting.status === 'scheduled' ? 'Đã xếp lịch' :
                                     meeting.status === 'in_progress' ? 'Đang họp' :
                                     meeting.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
                                </span>
                                {meeting.recordingEnabled && (
                                    <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5 shadow-sm">
                                        <Video className="w-3.5 h-3.5" /> Tự động ghi hình
                                    </span>
                                )}
                                {meeting.meeting_code && (
                                    <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm font-mono flex items-center gap-1.5">
                                        Mã cuộc họp: <span className="text-midnight-indigo">{meeting.meeting_code}</span>
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-midnight-indigo leading-tight tracking-tight">
                                    {meeting.title}
                                </h1>
                                <p className="text-sm text-slate-blue/80 max-w-3xl leading-relaxed">
                                    {meeting.description || 'Không có mô tả cuộc họp'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                        <div className="flex items-center gap-3 p-3 bg-cloud-mist/40 rounded-xl border border-outline-gray/40">
                            <Calendar className="w-5 h-5 text-action-blue shrink-0" />
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-blue tracking-wider">Ngày họp</span>
                                <span className="text-xs font-semibold text-midnight-indigo">{new Date(meeting.start_time || meeting.startTime).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-cloud-mist/40 rounded-xl border border-outline-gray/40">
                            <Clock className="w-5 h-5 text-action-blue shrink-0" />
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-blue tracking-wider">Thời gian</span>
                                <span className="text-xs font-semibold text-midnight-indigo">
                                    {new Date(meeting.start_time || meeting.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.end_time || meeting.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-cloud-mist/40 rounded-xl border border-outline-gray/40">
                            <MapPin className="w-5 h-5 text-action-blue shrink-0" />
                            <div className="truncate">
                                <span className="block text-[10px] uppercase font-bold text-slate-blue tracking-wider">Phòng họp / Cơ sở</span>
                                <span className="text-xs font-semibold text-midnight-indigo block truncate">
                                    {meeting.room?.room_name || meeting.room?.roomName || 'N/A'} {meeting.room?.site_name || meeting.room?.siteName ? `(${meeting.room?.site_name || meeting.room?.siteName})` : ''}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-cloud-mist/40 rounded-xl border border-outline-gray/40">
                            <Users className="w-5 h-5 text-action-blue shrink-0" />
                            <div className="truncate">
                                <span className="block text-[10px] uppercase font-bold text-slate-blue tracking-wider">Người chủ trì</span>
                                <span className="text-xs font-semibold text-midnight-indigo block truncate">{hostName}</span>
                            </div>
                        </div>

                        {meeting.room?.location && (
                            <div className="flex items-center gap-3 p-3 bg-cloud-mist/40 rounded-xl border border-outline-gray/40">
                                <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
                                <div className="truncate">
                                    <span className="block text-[10px] uppercase font-bold text-slate-blue tracking-wider">Vị trí cụ thể</span>
                                    <span className="text-xs font-semibold text-midnight-indigo block truncate">{meeting.room.location}</span>
                                </div>
                            </div>
                        )}

                        {meeting.room?.capacity && (
                            <div className="flex items-center gap-3 p-3 bg-cloud-mist/40 rounded-xl border border-outline-gray/40">
                                <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-blue tracking-wider">Sức chứa</span>
                                    <span className="text-xs font-semibold text-midnight-indigo">{meeting.room.capacity} người</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Split Content: Details & Agenda vs Recording Player */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Details & Agenda Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Agenda */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                            <div className="flex justify-between items-center border-b border-platinum-tint pb-3 mb-4">
                                <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider flex items-center gap-2">
                                    <List className="w-4.5 h-4.5 text-action-blue" />
                                    Chương trình làm việc ({meeting.agenda?.length || 0})
                                </h3>
                                {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                                    <button
                                        onClick={() => setIsAgendaModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-action-blue/20 bg-blue-50 text-action-blue hover:bg-blue-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Quản lý khung chương trình
                                    </button>
                                )}
                            </div>
                            {meeting.agenda && meeting.agenda.length > 0 ? (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                                    {meeting.agenda.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-platinum-tint last:before:hidden">
                                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-action-blue/10 border border-action-blue flex items-center justify-center text-[9px] font-bold text-action-blue">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 bg-cloud-mist/55 p-3 rounded-xl border border-outline-gray/60">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-semibold text-midnight-indigo text-xs sm:text-sm flex items-center gap-2">
                                                        {item.title}
                                                        {item.file && <FileText className="w-4 h-4 text-action-blue shrink-0" title={item.file.name} />}
                                                    </h4>
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

                    </div>

                    {/* Right: Participants & Host */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                            <div className="flex justify-between items-center border-b border-platinum-tint pb-3 mb-4">
                                <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4.5 h-4.5 text-action-blue" />
                                    Người tham dự ({meeting.participants?.length || 0})
                                </h3>
                                {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                                    <button
                                        onClick={() => setShowAddGuestModal(true)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                        + Mời khách ngoài
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                                    <UserAvatar
                                        user={hostUser}
                                        name={hostName}
                                        className="w-10 h-10 rounded-full shrink-0 font-bold text-sm ring-2 ring-white"
                                    />
                                    <div className="truncate">
                                        <span className="block text-xs font-bold text-action-blue uppercase tracking-wider text-[9px]">Người chủ trì</span>
                                        <span className="text-xs font-bold text-midnight-indigo block truncate">{hostName}</span>
                                    </div>
                                </div>

                                {meeting.participants?.filter(p => p !== hostParticipant && (p.fullName || p.full_name) !== hostName).map(p => (
                                    <div key={p.id} className="p-3 bg-cloud-mist rounded-xl border border-outline-gray flex items-center gap-3">
                                        <UserAvatar
                                            user={p}
                                            className="w-10 h-10 rounded-full shrink-0 font-bold text-sm"
                                        />
                                        <div className="truncate">
                                            <span className="block text-xs font-bold text-slate-blue uppercase tracking-wider text-[9px]">Người tham dự</span>
                                            <span className="text-xs font-bold text-midnight-indigo block truncate">{p.fullName || p.full_name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Media & Recording & Transcript */}
                <div className="w-full space-y-4 mt-6">
                    {/* Tabs cho Right Panel */}
                    <div className="flex border-b border-platinum-tint bg-white rounded-t-2xl px-2 pt-2">
                        <button
                            onClick={() => setActiveRightTab('transcript')}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${activeRightTab === 'transcript' ? 'border-action-blue text-action-blue' : 'border-transparent text-slate-blue hover:text-midnight-indigo'}`}
                        >
                            Bản ghi chữ (STT)
                        </button>
                        <button
                            onClick={() => setActiveRightTab('minutes')}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${activeRightTab === 'minutes' ? 'border-action-blue text-action-blue' : 'border-transparent text-slate-blue hover:text-midnight-indigo'}`}
                        >
                            Biên bản (AI)
                        </button>
                    </div>

                    {activeRightTab === 'transcript' ? (
                        meeting.recordingEnabled && isCompleted ? (
                            <div className="space-y-6">
                                {/* Nút Upload Audio dành cho Host / Organizer */}
                                {canManage && (
                                    <AudioUploader
                                        meetingId={meeting.id}
                                        onUploadSuccess={() => setRefreshTranscriptKey(prev => prev + 1)}
                                    />
                                )}

                                {/* Transcript Viewer */}
                                <TranscriptViewer
                                    key={refreshTranscriptKey}
                                    meetingId={meeting.id}
                                    isHost={canManage}
                                />
                            </div>
                        ) : (
                            <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-2 text-center py-8 text-slate-blue">
                                <Video className="w-8 h-8 mx-auto text-platinum-tint mb-2.5" />
                                <h4 className="text-xs font-bold text-midnight-indigo uppercase">Không có Video ghi hình</h4>
                                <p className="text-[11px] mt-1 leading-relaxed text-slate-blue/80">
                                    {meeting.recordingEnabled
                                        ? 'Bản ghi hình và bản ghi chữ cuộc họp sẽ khả dụng sau khi cuộc họp kết thúc.'
                                        : 'Cuộc họp này không đăng ký chế độ tự động ghi hình.'}
                                </p>
                            </div>
                        )
                    ) : (
                        <MinutesTabContent
                            meetingId={meeting.id}
                            isHost={canManage}
                            transcriptStatus={meeting.recordingEnabled && isCompleted ? 'ready' : 'empty'}
                        />
                    )}
                </div>

            </div>

            {/* MODAL: Time Validation Warning */}
            <AnimatePresence>
                {timeValidationModal.isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-sm-3 max-w-md w-full p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3 text-amber-500 border-b border-platinum-tint pb-3">
                                <AlertTriangle className="w-6 h-6" />
                                <h2 className="text-lg font-bold text-midnight-indigo">Thông báo thời gian</h2>
                            </div>
                            <div className="space-y-2 text-left">
                                <p className="text-sm text-slate-blue leading-relaxed">
                                    {timeValidationModal.message}
                                </p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setTimeValidationModal({ isOpen: false, message: '' })}
                                    className="px-5 py-2 bg-midnight-indigo hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                                >
                                    Đồng ý
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 1: Edit Meeting */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
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
                                    <span className="text-xs text-midnight-indigo font-semibold">Tự động ghi âm/ghi hình cuộc họp (Yêu cầu đồng ý PDPA)</span>
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
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-platinum-tint shadow-sm-3 max-w-xl w-full p-6 space-y-4"
                        >
                            <h2 className="text-lg font-bold text-midnight-indigo border-b border-platinum-tint pb-3">Quản lý chương trình Agenda</h2>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3">
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
                                            className="px-3.5 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold shrink-0"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 w-full">
                                        <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-platinum-tint hover:border-action-blue bg-cloud-mist/20 hover:bg-blue-50/20 text-slate-blue hover:text-action-blue rounded-xl text-xs font-bold cursor-pointer transition-all flex-1 justify-center select-none">
                                            <Upload className="w-4 h-4 text-action-blue" />
                                            <span>{newAgendaFile ? `Đã đính kèm: ${newAgendaFile.name}` : 'Đính kèm tài liệu thảo luận (PDF, Word, Excel, PowerPoint...)'}</span>
                                            <input type="file" onChange={(e) => { if (e.target.files && e.target.files[0]) setNewAgendaFile(e.target.files[0]); }} className="hidden" />
                                        </label>
                                        {newAgendaFile && (
                                            <button type="button" onClick={() => setNewAgendaFile(null)} className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all" title="Hủy chọn file">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {agendaList.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-cloud-mist rounded-xl border border-outline-gray">
                                            <div className="text-left">
                                                <span className="text-xs font-bold text-midnight-indigo flex items-center gap-2 mb-1">
                                                    {item.title}
                                                    {item.file && <FileText className="w-3.5 h-3.5 text-action-blue shrink-0" title={item.file.name} />}
                                                </span>
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
                                    Lưu chương trình
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: Cancel Confirm */}
            <AnimatePresence>
                {isCancelConfirmOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
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

            {/* Add External Participant Modal */}
            <AddExternalParticipantModal
                meetingId={meeting.id}
                open={showAddGuestModal}
                onClose={() => setShowAddGuestModal(false)}
                onSuccess={(msg) => {
                    setSuccessMsg(msg);
                    fetchMeeting();
                }}
            />
        </>
    );
};

export default EmployeeMeetingDetail;
