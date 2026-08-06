import { AlertTriangle, Calendar, Check, Clock, Download, Edit3, FileText, List, MapPin, Pause, Play, Search, Trash2, Upload, Users, UserPlus, Video, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getMeetingById, updateMeeting, updateMeetingTime, updateMeetingRoom, updateMeetingRecordingConfig, replaceAgendas, cancelMeeting, getAvailableRoomsForMeeting, getUsers, getMeetingMediaFiles, getMediaFile, uploadAgendaAttachment, deleteAgendaAttachment } from '../../service/employeeServices';
import UserAvatar from '../../component/UserAvatar';
import AudioUploader from '../../components/transcription/AudioUploader';
import TranscriptViewer from '../../components/transcription/TranscriptViewer';
import MinutesTabContent from '../../components/minutes/MinutesTabContent';
import AddExternalParticipantModal from '../../component/AddExternalParticipantModal';
import AddInternalParticipantModal from '../../component/AddInternalParticipantModal';
import { removeInternalParticipant, removeExternalParticipant } from '../../service/businessAdminServices';
import ParticipantDetailModal from '../../components/meeting/ParticipantDetailModal';

// BE MeetingStatus enum (meeting.entity.ts) có đủ 6 giá trị — trước đây thiếu draft/pending_approval
// khiến 2 trạng thái này rơi vào nhánh else và bị hiển thị nhầm thành "Đã hủy".
const STATUS_BADGE = {
    draft: { label: 'Bản nháp', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
    pending_approval: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    scheduled: { label: 'Đã xếp lịch', className: 'bg-blue-50 text-action-blue border border-blue-200' },
    in_progress: { label: 'Đang họp', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    completed: { label: 'Đã kết thúc', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
    cancelled: { label: 'Đã hủy', className: 'bg-red-50 text-red-700 border border-red-200' },
};

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
    const [activeParticipantTab, setActiveParticipantTab] = useState('internal');
    const [internalPage, setInternalPage] = useState(1);
    const [externalPage, setExternalPage] = useState(1);
    const ITEMS_PER_PAGE = 2;

    // Editing modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [showAddGuestModal, setShowAddGuestModal] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [detailModalState, setDetailModalState] = useState({ isOpen: false, participant: null, isExternal: false });

    // Edit fields
    const [editTitle, setEditTitle] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [editRoomId, setEditRoomId] = useState('');
    const [editParticipants, setEditParticipants] = useState([]);
    const [editRecordingEnabled, setEditRecordingEnabled] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const [agendaList, setAgendaList] = useState([]);
    const [newAgendaTitle, setNewAgendaTitle] = useState('');
    const [newAgendaDuration, setNewAgendaDuration] = useState('15');
    const [newAgendaFile, setNewAgendaFile] = useState(null);
    const [agendaEditIndex, setAgendaEditIndex] = useState(null);

    // Data lists for editing
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);

    // Participant conflict confirmation (409 PARTICIPANT_TIME_CONFLICT_WARNING)
    const [participantConflictModal, setParticipantConflictModal] = useState({
        isOpen: false,
        conflicts: [],
        pendingPayload: null,  // { startISO, endISO } - payload cần gửi lại
    });

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
            externalParticipants: dto.externalParticipants || dto.external_participants || [],
            external_participants: dto.externalParticipants || dto.external_participants || [],
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
                if (normalized.status === 'completed') {
                    try {
                        const mediaRes = await getMeetingMediaFiles(normalized.id);
                        if (mediaRes?.success) {
                            const rawFiles = mediaRes.data || [];
                            const processed = await Promise.all(rawFiles.map(async f => {
                                if ((f.fileType || f.type || f.file_type || '').toLowerCase() === 'audio') {
                                    try {
                                        const res = await getMediaFile(f.id);
                                        if (res?.success && res.data?.downloadUrl) {
                                            return { ...f, downloadUrl: res.data.downloadUrl };
                                        }
                                    } catch(e) {}
                                }
                                return f;
                            }));
                            setMediaFiles(processed);
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
        if (isEditModalOpen && meeting?.id) {
            const loadHelpers = async () => {
                try {
                    // Dùng endpoint chuyên trách của BE: lọc phòng theo khung giờ cuộc họ p,
                    // cộng thêm phòng hiện tại (includeCurrentRoom=true) để người dùng có thể giữ nguyên.
                    const [roomsRes, usersRes] = await Promise.all([
                        getAvailableRoomsForMeeting(meeting.id, { includeCurrentRoom: true }),
                        getUsers()
                    ]);
                    if (roomsRes?.success) setRooms(roomsRes.data || []);
                    if (usersRes?.success) setUsers(usersRes.data || []);
                } catch (e) { }
            };
            loadHelpers();
        }
    }, [isEditModalOpen, meeting?.id]);

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
        const startISO = new Date(`${editDate}T${editStart}:00`).toISOString();
        const endISO = new Date(`${editDate}T${editEnd}:00`).toISOString();
        await doSaveEdit(startISO, endISO, false);
    };

    // Hàm thực thi lưu - có thể gọi lại với overrideParticipantConflict=true
    const doSaveEdit = async (startISO, endISO, overrideParticipantConflict) => {
        setError(null);
        try {
            let successCount = 0;
            let pendingApproval = false;

            if (startISO !== meeting.startTime || endISO !== meeting.endTime) {
                let timePayload = { startTime: startISO, endTime: endISO };
                if (overrideParticipantConflict) {
                    timePayload.overrideParticipantConflict = true;
                }
                const timeRes = await updateMeetingTime(meeting.id, timePayload);
                if (timeRes?.success) {
                    successCount++;
                    if (timeRes.data?.pendingApproval) pendingApproval = true;
                }
            }
            if (editRoomId !== meeting.room?.id) {
                const roomRes = await updateMeetingRoom(meeting.id, { newRoomId: editRoomId });
                if (roomRes?.success) {
                    successCount++;
                    if (roomRes.data?.pendingApproval) pendingApproval = true;
                }
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
                if (pendingApproval) {
                    setSuccessMsg('Đã gửi yêu cầu thay đổi. Do cuộc họ p đã được xếp lịch, thay đổi giờ/phòng cần được Manager phê duyệt lại.');
                } else {
                    setSuccessMsg('Đã cập nhật thông tin cuộc họ p thành công.');
                }
                setIsEditModalOpen(false);
                fetchMeeting();
            } else {
                setError('Không thể cập nhật cuộc họ p. Vui lòng thử lại.');
            }
        } catch (err) {
            const errData = err?.response?.data || err;
            const errorCode = errData?.error?.code || '';

            if (errorCode === 'PARTICIPANT_TIME_CONFLICT_WARNING') {
                // 409 non-blocking: đặt lịch mới trung với người tham gia khác
                // Hiển modal xác nhận thay vì chặn hoàn toàn
                const conflicts = errData?.error?.details?.conflicts || [];
                setParticipantConflictModal({
                    isOpen: true,
                    conflicts,
                    pendingPayload: { startISO, endISO },
                });
                return;
            }

            if (errorCode === 'ROOM_TIME_CONFLICT') {
                const details = errData?.error?.details || {};
                const suggested = details.suggestedRooms || [];
                let msg = errData?.message || 'Phòng họ p không khả dụng trong khung giờ mới.';
                if (suggested.length > 0) {
                    const names = suggested.map(r => r.roomName).join(', ');
                    msg += ` Phòng gợi ý: ${names}.`;
                }
                setError(msg);
                return;
            }

            setError(err?.message || errData?.message || 'Lỗi cập nhật cuộc họ p. Vui lòng thử lại.');
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

        if (agendaEditIndex !== null) {
            setAgendaList(prev => {
                const newList = [...prev];
                newList[agendaEditIndex] = {
                    ...newList[agendaEditIndex],
                    title: newAgendaTitle,
                    durationMin: dur,
                    file: newAgendaFile ? newAgendaFile : newList[agendaEditIndex].file
                };
                return newList;
            });
            setAgendaEditIndex(null);
        } else {
            setAgendaList(prev => [
                ...prev,
                {
                    title: newAgendaTitle,
                    durationMin: dur,
                    orderIndex: prev.length,
                    file: newAgendaFile ? newAgendaFile : null,
                    attachments: []
                }
            ]);
        }
        setNewAgendaTitle('');
        setNewAgendaFile(null);
    };

    const handleRemoveAgendaItem = (idx) => {
        setAgendaList(prev => prev.filter((_, i) => i !== idx).map((item, idy) => ({ ...item, orderIndex: idy })));
    };

    const handleEditAgendaItem = (idx) => {
        const item = agendaList[idx];
        setNewAgendaTitle(item.title);
        setNewAgendaDuration(item.durationMin.toString());
        setNewAgendaFile(item.file);
        setAgendaEditIndex(idx);
    };

    const handleDeleteAttachment = async (agendaId, fileId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa file đính kèm này?')) return;
        try {
            const res = await deleteAgendaAttachment(meeting.id, agendaId, fileId);
            if (res?.success) {
                setAgendaList(prev => prev.map(a => {
                    if (a.id === agendaId && a.attachments) {
                        return { ...a, attachments: a.attachments.filter(att => att.id !== fileId) };
                    }
                    return a;
                }));
                fetchMeeting();
            } else {
                alert('Không thể xóa file.');
            }
        } catch (e) {
            alert('Lỗi khi xóa file.');
        }
    };

    const handleDownloadFile = async (fileId) => {
        try {
            const res = await getMediaFile(fileId);
            if (res?.success && res.data?.downloadUrl) {
                window.open(res.data.downloadUrl, '_blank');
            } else {
                alert('Không thể lấy link tải file.');
            }
        } catch (e) {
            alert('Lỗi khi lấy link tải file.');
        }
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
                if (res.data?.items) {
                    const savedItems = res.data.items;
                    for (let i = 0; i < agendaList.length; i++) {
                        const localItem = agendaList[i];
                        const savedItem = savedItems[i];
                        if (localItem.file && localItem.file instanceof File && savedItem) {
                            const formData = new FormData();
                            formData.append('file', localItem.file);
                            try {
                                await uploadAgendaAttachment(meeting.id, savedItem.id, formData);
                            } catch (e) {
                                console.error('Failed to upload attachment', e);
                            }
                        }
                    }
                }
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
                    {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && !isEnded && (
                        <>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-platinum-tint bg-white text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-bold transition-all"
                            >
                                <Edit3 className="w-4 h-4" /> Chỉnh sửa cuộc họp
                            </button>
                            {/* BE (meetings.service.ts) chỉ cho hủy meeting đang ở status 'scheduled' —
                                pending_approval/draft/in_progress sẽ luôn bị BE từ chối 409, nên ẩn nút. */}
                            {meeting.status === 'scheduled' && (
                                <button
                                    onClick={() => setIsCancelConfirmOpen(true)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Trash2 className="w-4 h-4" /> Hủy họp
                                </button>
                            )}
                        </>
                    )}
                    {meeting.status === 'completed' ? null : meeting.status === 'cancelled' ? (
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
                                <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${(STATUS_BADGE[meeting.status] || STATUS_BADGE.cancelled).className
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${meeting.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                                    {(STATUS_BADGE[meeting.status] || { label: meeting.status }).label}
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
                            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-platinum-tint pb-3 mb-4">
                                <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider flex items-center gap-2 shrink-0">
                                    <List className="w-4.5 h-4.5 text-action-blue" />
                                    Chương trình làm việc ({meeting.agenda?.length || 0})
                                </h3>
                                {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                                    <button
                                        onClick={() => setIsAgendaModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-action-blue/20 bg-blue-50 text-action-blue hover:bg-blue-100 rounded-md text-[11px] font-bold transition-all shadow-sm shrink-0"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Quản lý
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
                                                    </h4>
                                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-action-blue rounded font-bold">{item.durationMin} phút</span>
                                                </div>
                                                {item.attachments && item.attachments.length > 0 && (
                                                    <div className="mt-2 flex flex-col gap-1.5">
                                                        {item.attachments.map((file, fIdx) => (
                                                            <button
                                                                key={fIdx}
                                                                onClick={() => handleDownloadFile(file.id)}
                                                                className="flex items-center gap-1.5 text-[11px] text-action-blue hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg w-max transition-colors text-left"
                                                            >
                                                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="truncate max-w-[200px]">{file.fileName}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
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
                            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-platinum-tint pb-3 mb-4">
                                <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider flex items-center gap-2 shrink-0">
                                    <Users className="w-4.5 h-4.5 text-action-blue" />
                                    Người tham dự
                                </h3>
                                {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setIsImportModalOpen(true)}
                                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-[11px] font-bold transition-all shadow-sm"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Nội bộ
                                        </button>
                                        <button
                                            onClick={() => setShowAddGuestModal(true)}
                                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-[11px] font-bold transition-all shadow-sm"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Khách
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex bg-cloud-mist/50 p-1 rounded-xl mb-4">
                                <button
                                    onClick={() => { setActiveParticipantTab('internal'); setInternalPage(1); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeParticipantTab === 'internal' ? 'bg-white text-action-blue shadow-sm' : 'text-slate-blue hover:text-midnight-indigo'}`}
                                >
                                    Nội bộ ({meeting.participants?.length || 0})
                                </button>
                                <button
                                    onClick={() => { setActiveParticipantTab('external'); setExternalPage(1); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeParticipantTab === 'external' ? 'bg-white text-action-blue shadow-sm' : 'text-slate-blue hover:text-midnight-indigo'}`}
                                >
                                    Khách ngoài ({meeting.externalParticipants?.length || meeting.external_participants?.length || 0})
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {activeParticipantTab === 'internal' && (() => {
                                    const allInternal = [
                                        // Host first
                                        { isHost: true, ...hostUser },
                                        // Then participants
                                        ...(meeting.participants?.filter(p => p !== hostParticipant && (p.fullName || p.full_name) !== hostName) || [])
                                    ];
                                    const totalPages = Math.ceil(allInternal.length / ITEMS_PER_PAGE) || 1;
                                    const paginated = allInternal.slice((internalPage - 1) * ITEMS_PER_PAGE, internalPage * ITEMS_PER_PAGE);

                                    return (
                                        <>
                                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                                                {paginated.map((p, idx) => {
                                                    if (p.isHost) {
                                                        return (
                                                            <div key="host" className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
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
                                                        );
                                                    }
                                                    return (
                                                        <div key={p.id || idx} onClick={() => setDetailModalState({ isOpen: true, participant: p, isExternal: false })} className="p-3 bg-cloud-mist rounded-xl border border-outline-gray flex items-center justify-between gap-3 group hover:bg-white transition-colors cursor-pointer">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <UserAvatar
                                                                    user={p}
                                                                    className="w-10 h-10 rounded-full shrink-0 font-bold text-sm"
                                                                />
                                                                <div className="truncate">
                                                                    <span className="block text-xs font-bold text-slate-blue uppercase tracking-wider text-[9px]">Người tham dự</span>
                                                                    <span className="text-xs font-bold text-midnight-indigo block truncate">{p.fullName || p.full_name}</span>
                                                                </div>
                                                            </div>
                                                            {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${p.fullName || p.full_name}?`)) return;
                                                                        try {
                                                                            const res = await removeInternalParticipant(meeting.id, p.id);
                                                                            if (res?.success) {
                                                                                setMeeting({ ...meeting, participants: meeting.participants.filter(pt => pt.id !== p.id) });
                                                                                setSuccessMsg('Đã xóa người tham dự.');
                                                                                setTimeout(() => setSuccessMsg(null), 3000);
                                                                            } else {
                                                                                alert(res?.message || 'Xóa thất bại');
                                                                            }
                                                                        } catch (err) {
                                                                            alert('Lỗi hệ thống khi xóa');
                                                                        }
                                                                    }}
                                                                    className="p-1.5 text-slate-blue hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                                    title="Xóa người tham dự"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => setInternalPage(p => Math.max(1, p - 1))}
                                                        disabled={internalPage === 1}
                                                        className="px-2.5 py-1 bg-cloud-mist hover:bg-pale-gray rounded-lg text-xs font-bold disabled:opacity-50"
                                                    >
                                                        Trước
                                                    </button>
                                                    <span className="text-xs font-semibold text-slate-blue">
                                                        {internalPage} / {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setInternalPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={internalPage === totalPages}
                                                        className="px-2.5 py-1 bg-cloud-mist hover:bg-pale-gray rounded-lg text-xs font-bold disabled:opacity-50"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}

                                {activeParticipantTab === 'external' && (() => {
                                    const allExternal = meeting.externalParticipants || meeting.external_participants || [];
                                    const totalPages = Math.ceil(allExternal.length / ITEMS_PER_PAGE) || 1;
                                    const paginated = allExternal.slice((externalPage - 1) * ITEMS_PER_PAGE, externalPage * ITEMS_PER_PAGE);

                                    return (
                                        <>
                                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                                                {paginated.map(p => (
                                                    <div key={p.id} onClick={() => setDetailModalState({ isOpen: true, participant: p, isExternal: true })} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between gap-3 group hover:bg-white transition-colors cursor-pointer">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-10 h-10 rounded-full shrink-0 font-bold text-sm bg-amber-100 text-amber-700 flex items-center justify-center">
                                                                {(p.name || p.fullName || p.full_name || p.email || 'G').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="truncate">
                                                                <span className="block text-xs font-bold text-amber-600 uppercase tracking-wider text-[9px]">Khách ngoài</span>
                                                                <span className="text-xs font-bold text-midnight-indigo block truncate">{p.name || p.fullName || p.full_name}</span>
                                                                <span className="text-[10px] text-slate-blue block truncate">{p.email}</span>
                                                            </div>
                                                        </div>
                                                        {canManage && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách ${p.name || p.fullName || p.full_name}?`)) return;
                                                                    try {
                                                                        const res = await removeExternalParticipant(meeting.id, p.id);
                                                                        if (res?.success) {
                                                                            const currentExternal = meeting.externalParticipants || meeting.external_participants || [];
                                                                            setMeeting({ ...meeting, externalParticipants: currentExternal.filter(pt => pt.id !== p.id), external_participants: currentExternal.filter(pt => pt.id !== p.id) });
                                                                            setSuccessMsg('Đã xóa khách ngoài.');
                                                                            setTimeout(() => setSuccessMsg(null), 3000);
                                                                        } else {
                                                                            alert(res?.message || 'Xóa thất bại');
                                                                        }
                                                                    } catch (err) {
                                                                        alert('Lỗi hệ thống khi xóa khách');
                                                                    }
                                                                }}
                                                                className="p-1.5 text-slate-blue hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                                title="Xóa khách"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {allExternal.length === 0 && (
                                                    <p className="text-xs text-slate-blue italic text-center py-4">Chưa có khách ngoài nào.</p>
                                                )}
                                            </div>
                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => setExternalPage(p => Math.max(1, p - 1))}
                                                        disabled={externalPage === 1}
                                                        className="px-2.5 py-1 bg-cloud-mist hover:bg-pale-gray rounded-lg text-xs font-bold disabled:opacity-50"
                                                    >
                                                        Trước
                                                    </button>
                                                    <span className="text-xs font-semibold text-slate-blue">
                                                        {externalPage} / {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setExternalPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={externalPage === totalPages}
                                                        className="px-2.5 py-1 bg-cloud-mist hover:bg-pale-gray rounded-lg text-xs font-bold disabled:opacity-50"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
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
                        isCompleted ? (
                            <div className="space-y-6">
                                {/* Nút Upload Audio dành cho Host / Organizer */}
                                {canManage && (
                                    <AudioUploader
                                        meetingId={meeting.id}
                                        onUploadSuccess={() => setRefreshTranscriptKey(prev => prev + 1)}
                                    />
                                )}

                                {/* Bản ghi âm */}
                                {mediaFiles.filter(m => (m.fileType || m.type || m.file_type || '').toLowerCase() === 'audio').length > 0 && (
                                    <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm-2 mb-6">
                                        <h3 className="text-sm font-bold text-slate-blue mb-4 flex items-center gap-2">
                                            <Play className="w-4 h-4 text-action-blue" />
                                            Bản ghi âm cuộc họp
                                        </h3>
                                        <div className="space-y-4">
                                            {mediaFiles.filter(m => (m.fileType || m.type || m.file_type || '').toLowerCase() === 'audio').map((audioFile, idx) => (
                                                <div key={audioFile.id || idx} className="flex flex-col gap-2 p-3 bg-cloud-mist rounded-xl border border-outline-gray">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-midnight-indigo truncate pr-4">
                                                            {audioFile.fileName || audioFile.file_name || `Bản ghi âm ${idx + 1}`}
                                                        </span>
                                                        {audioFile.downloadUrl && (
                                                            <a href={audioFile.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-platinum-tint text-slate-blue hover:text-action-blue hover:border-action-blue rounded-lg text-xs font-bold transition-colors">
                                                                <Download className="w-3.5 h-3.5" />
                                                                Tải xuống
                                                            </a>
                                                        )}
                                                    </div>
                                                    {audioFile.downloadUrl && (
                                                        <audio controls src={audioFile.downloadUrl} className="w-full h-10 mt-1" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
                                <h4 className="text-xs font-bold text-midnight-indigo uppercase">Chưa khả dụng</h4>
                                <p className="text-[11px] mt-1 leading-relaxed text-slate-blue/80">
                                    Bản ghi âm và bản ghi chữ cuộc họp sẽ khả dụng sau khi cuộc họp kết thúc.
                                </p>
                            </div>
                        )
                    ) : (
                        <MinutesTabContent
                            meetingId={meeting.id}
                            isHost={canManage}
                            transcriptStatus={isCompleted ? 'ready' : 'empty'}
                        />
                    )}
                </div>

            </div>

            {/* MODAL: Participant Detail */}
            <ParticipantDetailModal
                isOpen={detailModalState.isOpen}
                onClose={() => setDetailModalState({ isOpen: false, participant: null, isExternal: false })}
                participant={detailModalState.participant}
                isExternal={detailModalState.isExternal}
            />

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
                                    {rooms.map((r, idx) => (
                                        <option key={r.id || idx} value={r.id}>
                                            {r.roomName} {r.siteName ? `(${r.siteName})` : ''} - Sức chứa: {r.capacity}
                                        </option>
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
                                            {agendaEditIndex !== null ? 'Lưu' : 'Thêm'}
                                        </button>
                                        {agendaEditIndex !== null && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAgendaEditIndex(null);
                                                    setNewAgendaTitle('');
                                                    setNewAgendaFile(null);
                                                }}
                                                className="px-3.5 py-2 bg-cloud-mist hover:bg-platinum-tint text-slate-blue rounded-xl text-xs font-bold shrink-0"
                                            >
                                                Hủy
                                            </button>
                                        )}
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
                                            <div className="text-left overflow-hidden">
                                                <span className="text-xs font-bold text-midnight-indigo flex items-center gap-2 mb-1 truncate">
                                                    {item.title}
                                                </span>
                                                <span className="text-[10px] text-slate-blue font-medium block">{item.durationMin} phút</span>
                                                {item.attachments && item.attachments.length > 0 && (
                                                    <div className="mt-1 flex flex-col gap-1">
                                                        {item.attachments.map(att => (
                                                            <div key={att.id} className="flex items-center justify-between text-[10px] text-action-blue bg-blue-50 px-2 py-0.5 rounded w-full max-w-xs">
                                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                                    <FileText className="w-3 h-3 shrink-0" />
                                                                    <span className="truncate max-w-[180px]">{att.fileName}</span>
                                                                </div>
                                                                <button onClick={() => handleDeleteAttachment(item.id, att.id)} className="text-red-500 hover:text-red-700 ml-2"><X className="w-3 h-3" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.file && item.file instanceof File && (
                                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-max">
                                                        <FileText className="w-3 h-3 shrink-0" />
                                                        <span className="truncate max-w-[200px]">Mới: {item.file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditAgendaItem(idx)}
                                                    className="text-blue-500 hover:text-blue-700 p-1.5"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveAgendaItem(idx)}
                                                    className="text-red-500 hover:text-red-700 p-1.5"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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

            {/* Add Internal Participant Modal */}
            {meeting && (
                <AddInternalParticipantModal
                    meetingId={meeting.id}
                    open={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    users={users}
                    onSuccess={(msg) => {
                        setSuccessMsg(msg);
                        setTimeout(() => setSuccessMsg(null), 4000);
                        fetchMeeting();
                    }}
                />
            )}

            {/* Participant Conflict Confirmation Modal */}
            {participantConflictModal.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl border border-amber-200 max-w-md w-full overflow-hidden"
                    >
                        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 text-sm">Cảnh báo trùng lịch người tham gia</h3>
                                <p className="text-xs text-amber-700 mt-0.5">Khung giờ mới trùng với lịch họp của một số người tham gia.</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
                            {participantConflictModal.conflicts.map((c, idx) => (
                                <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-sm">
                                    <span className="font-semibold text-midnight-indigo">{c.fullName}</span>
                                    {c.overlappingMeetings?.map((m, i) => (
                                        <p key={i} className="text-xs text-slate-blue mt-1">
                                            Trùng với: <span className="font-medium">"{m.title}"</span>
                                            {' '}({new Date(m.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – {new Date(m.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-platinum-tint flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setParticipantConflictModal({ isOpen: false, conflicts: [], pendingPayload: null })}
                                className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const { startISO, endISO } = participantConflictModal.pendingPayload;
                                    setParticipantConflictModal({ isOpen: false, conflicts: [], pendingPayload: null });
                                    await doSaveEdit(startISO, endISO, true);
                                }}
                                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                            >
                                Vẫn đổi lịch
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default EmployeeMeetingDetail;
