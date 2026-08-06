import { AlertTriangle, Calendar, Check, ChevronRight, Hand, ListTodo, Mic, MicOff, MonitorUp, PhoneOff, Play, Shield, Smile, Sparkles, StickyNote, Users, Video as VideoIcon, VideoOff, Volume2, VolumeX, FileText, ExternalLink } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getSocket, subscribeToMeeting } from '../../utils/socket';
import { request } from '../../utils/request';
import { getMeetingById as getMeetingEmployee, startMeeting as startEmployee, endMeeting as endEmployee, getPresentAttendees as getEmployeeAttendees, getMeetingAttendance as getEmployeeAttendance, createMeetingNote as createEmployeeNote, listMeetingNotes as listEmployeeNotes, startVideoRecording as startEmployeeVideoRecording, pauseVideoRecording as pauseEmployeeVideoRecording, resumeVideoRecording as resumeEmployeeVideoRecording, stopVideoRecording as stopEmployeeVideoRecording, getRecordingStatus as getEmployeeRecordingStatus, getMeetingMediaFiles as getEmployeeMediaFiles } from '../../service/employeeServices';
import { getMeetingById as getMeetingManager, startMeeting as startManager, endMeeting as endManager, getPresentAttendees as getManagerAttendees, getMeetingAttendance as getManagerAttendance, createMeetingNote as createManagerNote, listMeetingNotes as listManagerNotes, startVideoRecording as startManagerVideoRecording, pauseVideoRecording as pauseManagerVideoRecording, resumeVideoRecording as resumeManagerVideoRecording, stopVideoRecording as stopManagerVideoRecording, getRecordingStatus as getManagerRecordingStatus, getMeetingMediaFiles as getManagerMediaFiles } from '../../service/managerServices';
import UserAvatar, { resolveAvatarUrl } from '../../component/UserAvatar';
import MeetingGrid from '../../components/meeting/MeetingGrid';
import StationRecorder from '../../components/transcription/StationRecorder';

// CSS styles injected for custom floating reactions and voice sound wave animations
const customStyles = `
@keyframes floatUp {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
}
.animate-float-up {
  animation: floatUp 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes voiceWave {
  0%, 100% { height: 4px; }
  50% { height: 18px; }
}
.voice-bar {
  animation: voiceWave 0.6s ease-in-out infinite;
}
`;

const defaultMeeting = {
    title: 'Họp kỹ thuật dự án FE SmarTracking',
    roomName: 'Phòng Apollo 101 (Tòa nhà A)',
    host: 'Nguyễn Văn A',
    hostId: 'mgr-uuid',
    host_id: 'mgr-uuid',
    status: 'scheduled',
    currentAgendaIndex: 0,
    agendaTimeLeft: 600, 
    participants: [
        { id: 'mgr-uuid', fullName: 'Nguyễn Văn A', role: 'Chủ tọa', isMuted: false, isCameraOff: false, isSpeaking: false, isBot: false },
        { id: 'bot-1', fullName: 'Lê Hoàng Hải', role: 'Thành viên', isMuted: false, isCameraOff: false, isSpeaking: false, isBot: true },
        { id: 'bot-2', fullName: 'Nguyễn Thị Minh', role: 'Thành viên', isMuted: false, isCameraOff: false, isSpeaking: false, isBot: true },
        { id: 'bot-3', fullName: 'Phan Văn Minh', role: 'Thành viên', isMuted: false, isCameraOff: false, isSpeaking: false, isBot: true }
    ],
    agenda: [
        { title: 'Khởi động & Demo giao diện', durationMin: 10, orderIndex: 0 },
        { title: 'Thảo luận API tích hợp thiết bị', durationMin: 15, orderIndex: 1 },
        { title: 'Chốt phương án & phân công nhiệm vụ', durationMin: 10, orderIndex: 2 }
    ],
    reactionsLocked: false,
    lastReaction: null
};

// Universal fallback caller for host actions
// Thử gọi bằng quyền employee trước; nếu BE từ chối (403/permission), chuyển sang quyền manager.
// Luôn log lại lần fallback để không che giấu lỗi phân quyền thật khi debug.
const callWithFallback = async (employeeFn, managerFn, ...args) => {
    try {
        const res = await employeeFn(...args);
        if (res?.success) return res;
        throw new Error('Employee scope failed');
    } catch (e) {
        console.warn(
            `[InMeetingRoom] ${employeeFn.name || 'employeeFn'} thất bại (${e?.error?.message || e?.message || 'unknown error'}), fallback sang ${managerFn.name || 'managerFn'}.`
        );
        return await managerFn(...args);
    }
};

// Format duration helper
const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Recording Timer Component (handles interval and polling without re-rendering parent)
const RecordingTimer = ({ meetingId, sessionId, initialStatus, onStatusChange }) => {
    const [duration, setDuration] = useState(0);
    const [localStatus, setLocalStatus] = useState(initialStatus);
    const [fileSize, setFileSize] = useState(null);

    useEffect(() => {
        setLocalStatus(initialStatus);
    }, [initialStatus]);

    // Local 1-second tick for duration
    useEffect(() => {
        if (localStatus !== 'recording') return;
        const interval = setInterval(() => setDuration(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [localStatus]);

    // 5-second polling for real status
    useEffect(() => {
        if (!sessionId || ['inactive', 'completed', 'failed'].includes(localStatus)) return;
        const interval = setInterval(async () => {
            try {
                const res = await callWithFallback(getEmployeeRecordingStatus, getManagerRecordingStatus, meetingId, sessionId);
                if (res?.success) {
                    const data = res.data;
                    if (data.status && data.status !== localStatus) {
                        setLocalStatus(data.status);
                        if (onStatusChange) onStatusChange(data.status);
                    }
                    if (data.durationSeconds != null) setDuration(data.durationSeconds);
                    if (data.fileSizeBytes != null) setFileSize(data.fileSizeBytes);
                }
            } catch (e) {}
        }, 5000);
        return () => clearInterval(interval);
    }, [sessionId, localStatus, meetingId, onStatusChange]);

    const formatSize = (bytes) => {
        if (!bytes) return '';
        const mb = (parseInt(bytes) / (1024 * 1024)).toFixed(1);
        return ` - ${mb}MB`;
    };

    if (['recording', 'starting', 'stopping', 'paused'].includes(localStatus)) {
        return (
            <div className={`px-3 py-2 rounded-xl border flex flex-col gap-1 text-xs font-bold ${localStatus === 'recording' ? 'bg-red-50 text-red-600 border-red-200' : localStatus === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-action-blue border-blue-100'}`}>
                <div className="flex items-center">
                    {localStatus === 'recording' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />}
                    {localStatus === 'recording' ? `GHI HÌNH ${formatDuration(duration)}${formatSize(fileSize)}` : 
                     localStatus === 'paused' ? `TẠM DỪNG ${formatDuration(duration)}${formatSize(fileSize)}` : 
                     'Đang xử lý...'}
                </div>
                {localStatus === 'paused' && (
                    <div className="text-[10px] font-normal opacity-80 italic">Đoạn tạm dừng sẽ không có trong file ghi</div>
                )}
            </div>
        );
    }
    return null;
};

const normalizeMeetingDetail = (raw, currentUserId) => {
    // Basic mapping, keeping it flat for UI
    return {
        ...raw,
        participants: raw.participants?.map(p => ({
            id: p.userId || p.user_id || p.id,
            fullName: p.fullName || p.full_name,
            avatarUrl: resolveAvatarUrl(p),
            role: p.participantRole || p.participant_role === 'host' ? 'Chủ tọa' : 'Thành viên',
            isMuted: false,
            isCameraOff: false,
            isSpeaking: false,
            isBot: p.userId !== currentUserId
        })) || []
    };
};

const InMeetingRoom = ({ isPublic = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Core States
    const [loading, setLoading] = useState(true);
    const [meetingState, setMeetingState] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [floatingReactions, setFloatingReactions] = useState([]);
    const [renameModal, setRenameModal] = useState({ isOpen: false, targetId: null, currentName: '', isSelf: true });
    const [confirmLeaveModal, setConfirmLeaveModal] = useState(false);
    const [notes, setNotes] = useState([]);
    const [noteInput, setNoteInput] = useState('');
    const [presentedFile, setPresentedFile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Recording state
    const [recordingStatus, setRecordingStatus] = useState('inactive'); // 'inactive', 'starting', 'recording', 'paused', 'stopping', 'completed', 'failed', 'no_data'
    const [recordingSessionId, setRecordingSessionId] = useState(null);
    const [recordingStartedAt, setRecordingStartedAt] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(0); // in seconds
    const [mediaFiles, setMediaFiles] = useState([]);

    // User local settings
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [localName, setLocalName] = useState('');
    const [isLobbyReady, setIsLobbyReady] = useState(false);
    // Tab đang mở trong Room Panel bên phải: 'host' | 'agenda' | 'notes' | 'attendance'
    const [activeChatTab, setActiveChatTab] = useState('host');
    // Giơ tay — chỉ là trạng thái cục bộ hiển thị cho người trong phòng qua reaction,
    // BE chưa có API riêng cho tính năng này (đã kiểm tra live-meeting/notifications modules).
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Reference variables
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const speakingOverrideRef = useRef(null);
    const prevMutedRef = useRef(false);
    const prevReactionsLockedRef = useRef(false);

    // Load user information
    const localUserStr = localStorage.getItem('user');
    let currentUser = null;
    if (localUserStr) {
        try {
            currentUser = JSON.parse(localUserStr);
        } catch (e) {}
    }

    // Determine current user participant ID
    const myParticipantIdRef = useRef(null);
    if (!myParticipantIdRef.current) {
        if (currentUser) {
            myParticipantIdRef.current = currentUser.id;
        } else {
            let guestId = sessionStorage.getItem(`meeting_guest_id_${id}`);
            if (!guestId) {
                guestId = `guest-${Math.floor(Math.random() * 10000)}`;
                sessionStorage.setItem(`meeting_guest_id_${id}`, guestId);
            }
            myParticipantIdRef.current = guestId;
        }
    }
    const myParticipantId = myParticipantIdRef.current;

    // Toast helpers
    const showToast = (message, type = 'info') => {
        const toastId = Date.now() + Math.random();
        setToasts(prev => [...prev, { id: toastId, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 3500);
    };

    // Format duration helper has been moved outside the component

    // Load meeting details & synchronize
    const initMeetingState = async () => {
        setLoading(true);
        let baseMeeting = null;
        try {
            const res = await getMeetingEmployee(id);
            if (res?.success && res.data) {
                const dto = res.data;
                const meetingObj = dto.meeting || dto;
                baseMeeting = {
                    ...dto,
                    title: meetingObj.title || dto.title,
                    status: meetingObj.status || dto.status,
                    startTime: meetingObj.startTime || dto.startTime || meetingObj.start_time || dto.start_time,
                    endTime: meetingObj.endTime || dto.endTime || meetingObj.end_time || dto.end_time,
                    hostId: dto.host?.id || dto.hostId || dto.host_id || dto.organizer?.id,
                    host_id: dto.host?.id || dto.hostId || dto.host_id || dto.organizer?.id,
                };
            }
        } catch (e) {
            try {
                const res = await getMeetingManager(id);
                if (res?.success && res.data) {
                    const dto = res.data;
                    const meetingObj = dto.meeting || dto;
                    baseMeeting = {
                        ...dto,
                        title: meetingObj.title || dto.title,
                        status: meetingObj.status || dto.status,
                        startTime: meetingObj.startTime || dto.startTime || meetingObj.start_time || dto.start_time,
                        endTime: meetingObj.endTime || dto.endTime || meetingObj.end_time || dto.end_time,
                        hostId: dto.host?.id || dto.hostId || dto.host_id || dto.organizer?.id,
                        host_id: dto.host?.id || dto.hostId || dto.host_id || dto.organizer?.id,
                    };
                }
            } catch (err) {}
        }

        const savedStateStr = localStorage.getItem(`meeting_state_${id}`);

        if (savedStateStr) {
            const savedState = JSON.parse(savedStateStr);
            if (baseMeeting) {
                savedState.title = baseMeeting.title || savedState.title;
                savedState.roomName = baseMeeting.room?.room_name || baseMeeting.room?.roomName || savedState.roomName;
                savedState.room = baseMeeting.room || savedState.room || null;
                if (baseMeeting.agendas && baseMeeting.agendas.length > 0) {
                    savedState.agenda = baseMeeting.agendas.map((a, idx) => ({
                        id: a.id,
                        title: a.title,
                        durationMin: a.plannedDurationMinutes,
                        orderIndex: a.agendaOrder ?? idx,
                        attachments: a.attachments || [],
                    }));
                }
                savedState.participants = savedState.participants?.map((savedParticipant) => {
                    const apiParticipant = baseMeeting.participants?.find((participant) => {
                        const participantId = participant.userId || participant.user_id || participant.user?.id || participant.id;
                        return participantId === savedParticipant.id;
                    });
                    return apiParticipant
                        ? { ...savedParticipant, avatarUrl: resolveAvatarUrl(apiParticipant) || savedParticipant.avatarUrl }
                        : savedParticipant;
                });
            }
            setMeetingState(savedState);
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(savedState));
        } else {
            const initial = { ...defaultMeeting, id };
            if (baseMeeting) {
                initial.title = baseMeeting.title || initial.title;
                initial.roomName = baseMeeting.room?.room_name || baseMeeting.room?.roomName || initial.roomName;
                initial.room = baseMeeting.room || null;
                if (baseMeeting.agendas && baseMeeting.agendas.length > 0) {
                    initial.agenda = baseMeeting.agendas.map((a, idx) => ({
                        id: a.id,
                        title: a.title,
                        durationMin: a.plannedDurationMinutes,
                        orderIndex: a.agendaOrder ?? idx,
                        attachments: a.attachments || [],
                    }));
                }
                initial.hostId = baseMeeting.host_id || baseMeeting.hostId || initial.hostId;
                initial.status = baseMeeting.status || initial.status;
                const apiHost = baseMeeting.participants?.find((participant) => {
                    const participantId = participant.userId || participant.user_id || participant.user?.id || participant.id;
                    return participantId === initial.hostId
                        || participant.participantRole === 'host'
                        || participant.participant_role === 'host';
                }) || (typeof baseMeeting.host === 'object' ? baseMeeting.host : null);
                initial.host = apiHost?.fullName || apiHost?.full_name || baseMeeting.hostName || baseMeeting.host_name
                    || (typeof baseMeeting.host === 'string' ? baseMeeting.host : initial.host);

                const parts = [
                    {
                        id: initial.hostId,
                        fullName: initial.host,
                        avatarUrl: resolveAvatarUrl(apiHost) || baseMeeting.hostAvatarUrl || baseMeeting.host_avatar_url || '',
                        role: 'Chủ tọa',
                        isMuted: false,
                        isCameraOff: false,
                        isSpeaking: false,
                        isBot: false,
                    }
                ];
                baseMeeting.participants?.forEach(p => {
                    const participantId = p.userId || p.user_id || p.user?.id || p.id;
                    if (participantId !== initial.hostId) {
                        parts.push({
                            id: participantId,
                            fullName: p.fullName || p.full_name,
                            avatarUrl: resolveAvatarUrl(p),
                            role: 'Thành viên',
                            isMuted: false,
                            isCameraOff: false,
                            isSpeaking: false,
                            isBot: true
                        });
                    }
                });
                (baseMeeting.externalParticipants || baseMeeting.external_participants || []).forEach(ep => {
                    parts.push({
                        id: ep.id,
                        fullName: ep.name || ep.fullName || ep.full_name || ep.email,
                        avatarUrl: '',
                        role: 'Khách mời',
                        isExternal: true, // explicit flag — do not infer external/internal from `role` text
                        isMuted: false,
                        isCameraOff: false,
                        isSpeaking: false,
                        isBot: false
                    });
                });
                initial.participants = parts;
            }
            setMeetingState(initial);
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(initial));
        }
        setLoading(false);
    };

    // Recording Polling & Duration Timer
    useEffect(() => {
        let interval;
        if (['recording', 'starting', 'stopping'].includes(recordingStatus)) {
            interval = setInterval(async () => {
                if (recordingSessionId) {
                    try {
                        const res = await callWithFallback(getEmployeeRecordingStatus, getManagerRecordingStatus, id, recordingSessionId);
                        if (res?.success) {
                            const newStatus = res.data?.status?.toLowerCase() || 'inactive';
                            if (newStatus !== recordingStatus) {
                                setRecordingStatus(newStatus);
                                if (newStatus === 'completed') {
                                    showToast('Ghi hình đã hoàn tất, đang xử lý video.', 'success');
                                    fetchMediaFiles(); // Refresh media list
                                }
                            }
                            if (res.data?.startedAt && !recordingStartedAt) {
                                setRecordingStartedAt(new Date(res.data.startedAt));
                            }
                        }
                    } catch (e) {
                        // Silent fail for polling
                    }
                }
            }, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [recordingStatus, recordingSessionId, id, recordingStartedAt]);

    useEffect(() => {
        let timer;
        if (recordingStatus === 'recording' && recordingStartedAt) {
            timer = setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now - recordingStartedAt) / 1000);
                setRecordingDuration(diff > 0 ? diff : 0);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [recordingStatus, recordingStartedAt]);

    const fetchMediaFiles = async () => {
        try {
            const res = await callWithFallback(getEmployeeMediaFiles, getManagerMediaFiles, id);
            if (res?.success) {
                setMediaFiles(res.data || []);
            }
        } catch (e) {
            // Error loading media files silently ignored
        }
    };

    // Realtime sync via WebSocket
        useEffect(() => {
            if (meetingState?.status === 'in_progress') {
                const cleanup = subscribeToMeeting(id);
                const s = getSocket();
                s.on('meeting.session.started', () => {
                    setMeetingState(prev => ({ ...prev, status: 'in_progress' }));
                });
                s.on('meeting.session.ended', () => {
                    setMeetingState(prev => ({ ...prev, status: 'completed' }));
                });
                s.on('agenda:presented', (payload) => {
                    setPresentedFile(payload);
                });
                s.on('agenda:present_stopped', () => {
                    setPresentedFile(null);
                });
                return cleanup;
            }
        }, [meetingState?.status, id]);

        const loadNotes = async () => {
            try {
                const res = await callWithFallback(listEmployeeNotes, listManagerNotes, id, { limit: 100 });
                if (res?.success) {
                    setNotes(Array.isArray(res.data) ? res.data : (res.data?.items || []));
                }
            } catch (err) {}
        };

        const loadAttendance = async () => {
            try {
                const res = await callWithFallback(getEmployeeAttendees, getManagerAttendees, id);
                if (res?.success) {
                    const dataItems = res.data?.presentUsers || res.data?.items || (Array.isArray(res.data) ? res.data : []);
                    setAttendance(dataItems);
                }
            } catch (err) {}
        };

        useEffect(() => {
            let attendanceInterval;
            if (meetingState?.status === 'in_progress') {
                loadNotes();
                loadAttendance();
                attendanceInterval = setInterval(() => {
                    loadAttendance();
                }, 10000);
            }
            return () => {
                if (attendanceInterval) clearInterval(attendanceInterval);
            };
        }, [meetingState?.status, id]);

    useEffect(() => {
        initMeetingState();
    }, [id]);

    // Listen for tab synchronization via storage event
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === `meeting_state_${id}`) {
                try {
                    const newState = JSON.parse(e.newValue);
                    if (newState) {
                        setMeetingState(newState);
                    }
                } catch (err) {}
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [id]);

    // Webcam Preview Logic
    useEffect(() => {
        if (isVideoOn && !isLobbyReady && !loading) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(s => {
                    setStream(s);
                    if (videoRef.current) {
                        videoRef.current.srcObject = s;
                    }
                })
                .catch(err => {
                    console.warn("Lobby Webcam blocked or not found:", err);
                    setStream(null);
                });
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoOn, isLobbyReady, loading]);

    // Active Meeting webcam support (inside meeting room)
    useEffect(() => {
        if (meetingState?.status === 'in_progress' && isVideoOn) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(s => {
                    setStream(s);
                    const userVid = document.getElementById(`video-${myParticipantId}`);
                    if (userVid) {
                        userVid.srcObject = s;
                    }
                })
                .catch(() => {
                    setStream(null);
                });
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
    }, [meetingState?.status, isVideoOn]);

    // Monitor muting and locked reactions
    useEffect(() => {
        if (!meetingState) return;
        const me = meetingState.participants?.find(p => p.id === myParticipantId);
        if (me) {
            if (me.isMuted && !prevMutedRef.current) {
                showToast('Bạn đã bị Chủ tọa tắt tiếng!', 'error');
                setIsMicOn(false);
            }
            prevMutedRef.current = me.isMuted;
        }

        if (meetingState.reactionsLocked && !prevReactionsLockedRef.current) {
            showToast('Chủ tọa đã khóa tính năng thả cảm xúc!', 'warning');
        } else if (!meetingState.reactionsLocked && prevReactionsLockedRef.current) {
            showToast('Chủ tọa đã mở khóa tính năng thả cảm xúc.', 'success');
        }
        prevReactionsLockedRef.current = meetingState.reactionsLocked;
    }, [meetingState, myParticipantId]);

    // Monitor reactions triggers
    useEffect(() => {
        if (!meetingState?.lastReaction) return;
        const { senderId, emoji, timestamp } = meetingState.lastReaction;
        if (Date.now() - timestamp < 1500) {
            const reactionId = `reaction-${Date.now()}-${Math.random()}`;
            setFloatingReactions(prev => [...prev, { id: reactionId, emoji, participantId: senderId }]);
            setTimeout(() => {
                setFloatingReactions(prev => prev.filter(r => r.id !== reactionId));
            }, 2200);
        }
    }, [meetingState?.lastReaction]);

    // Automatic speaker rotation (bots only) every 12 seconds
    useEffect(() => {
        if (!meetingState || meetingState.status !== 'in_progress') return;

        const interval = setInterval(() => {
            if (speakingOverrideRef.current && Date.now() - speakingOverrideRef.current < 15000) {
                return; 
            }

            const unmutedBots = meetingState.participants?.filter(p => p.isBot && !p.isMuted) || [];
            if (unmutedBots.length === 0) return;

            const randomBot = unmutedBots[Math.floor(Math.random() * unmutedBots.length)];

            setMeetingState(prev => {
                const next = {
                    ...prev,
                    participants: prev.participants.map(p => ({
                        ...p,
                        isSpeaking: p.id === randomBot.id
                    }))
                };
                localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
                return next;
            });
        }, 12000);

        return () => clearInterval(interval);
    }, [meetingState?.status, meetingState?.participants]);

    // Countdown clock ticking logic
    const isHost = meetingState?.hostId === myParticipantId;

    useEffect(() => {
        if (!meetingState || meetingState.status !== 'in_progress') return;

        const countdown = setInterval(() => {
            if (isHost) {
                setMeetingState(prev => {
                    const nextTime = Math.max(0, prev.agendaTimeLeft - 1);
                    const next = {
                        ...prev,
                        agendaTimeLeft: nextTime
                    };
                    localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
                    return next;
                });
            } else {
                setMeetingState(prev => ({
                    ...prev,
                    agendaTimeLeft: Math.max(0, prev.agendaTimeLeft - 1)
                }));
            }
        }, 1000);

        return () => clearInterval(countdown);
    }, [meetingState?.status, isHost, id]);

    if (loading || !meetingState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-blue text-sm font-semibold">Đang nạp dữ liệu phòng họp...</p>
            </div>
        );
    }

    // Default Guest name helper
    const getDefaultGuestName = () => {
        return sessionStorage.getItem(`guest_name_${id}`) || `Khách ${myParticipantId.split('-')[1] || myParticipantId.substring(0, 4)}`;
    };

    // Actions
    const handleJoinLobby = () => {
        const selectedName = localName.trim() || getDefaultGuestName();
        sessionStorage.setItem(`guest_name_${id}`, selectedName);
        
        // Push user as active participant
        setMeetingState(prev => {
            const list = [...prev.participants];
            const exists = list.find(p => p.id === myParticipantId);
            const userRole = isPublic ? 'Khách' : (isHost ? 'Chủ tọa' : 'Thành viên');
            
            if (exists) {
                exists.fullName = selectedName;
                exists.avatarUrl = resolveAvatarUrl(currentUser) || exists.avatarUrl;
                exists.role = userRole;
                exists.isCameraOff = !isVideoOn;
                exists.isMuted = !isMicOn;
            } else {
                list.push({
                    id: myParticipantId,
                    fullName: selectedName,
                    avatarUrl: resolveAvatarUrl(currentUser),
                    role: userRole,
                    isMuted: !isMicOn,
                    isCameraOff: !isVideoOn,
                    isSpeaking: false,
                    isBot: false
                });
            }
            const next = { ...prev, participants: list };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });

        setIsLobbyReady(true);
        showToast('Đã tham gia phòng chờ cuộc họp!', 'success');
    };

    const handleStartMeeting = async () => {
        if (!isHost) return;
        setActionLoading(true);
        try {
            const res = await callWithFallback(startEmployee, startManager, id);
            if (res?.success) {
                setMeetingState(prev => {
                    const next = { ...prev, status: 'in_progress', agendaTimeLeft: (prev.agenda?.[0]?.durationMin || 10) * 60 };
                    localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
                    return next;
                });
                showToast('Bắt đầu cuộc họp!', 'success');
            } else {
                showToast(res?.message || res?.error?.message || 'Lỗi khi bắt đầu', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndMeeting = async () => {
        if (!isHost) return;
        setActionLoading(true);
        try {
            const res = await callWithFallback(endEmployee, endManager, id);
            if (res?.success) {
                setMeetingState(prev => {
                    const next = { ...prev, status: 'completed' };
                    localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
                    return next;
                });
                showToast('Cuộc họp đã kết thúc', 'info');
                setTimeout(() => {
                    navigate(isPublic ? '/' : '/employee');
                }, 1000);
            } else {
                showToast(res?.message || res?.error?.message || 'Lỗi khi kết thúc', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối', 'error');
        } finally {
            setActionLoading(false);
            setConfirmLeaveModal(false);
        }
    };

    const handleStartRecording = async () => {
        if (!isHost) return;
        setActionLoading(true);
        try {
            const res = await callWithFallback(startEmployeeVideoRecording, startManagerVideoRecording, id, { deviceId: 'default' });
            if (res?.success) {
                setRecordingStatus('starting');
                setRecordingSessionId(res.data?.sessionId || res.data?.id || `rec-${Date.now()}`);
                setRecordingStartedAt(new Date());
                setRecordingDuration(0);
                showToast('Đang khởi tạo camera và kết nối luồng stream...', 'info');
            } else {
                showToast('Lỗi khi bắt đầu ghi hình', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối server camera', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePauseRecording = async () => {
        if (!isHost || !recordingSessionId) return;
        setActionLoading(true);
        try {
            const res = await callWithFallback(pauseEmployeeVideoRecording, pauseManagerVideoRecording, id, recordingSessionId);
            if (res?.success) {
                setRecordingStatus('paused');
                showToast('Đã tạm dừng ghi hình', 'info');
            } else {
                showToast('Lỗi khi tạm dừng ghi hình', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResumeRecording = async () => {
        if (!isHost || !recordingSessionId) return;
        setActionLoading(true);
        try {
            const res = await callWithFallback(resumeEmployeeVideoRecording, resumeManagerVideoRecording, id, recordingSessionId);
            if (res?.success) {
                setRecordingStatus('recording');
                showToast('Đã tiếp tục ghi hình', 'success');
            } else {
                showToast('Lỗi khi tiếp tục', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStopRecording = async () => {
        if (!isHost || !recordingSessionId) return;
        setActionLoading(true);
        try {
            const res = await callWithFallback(stopEmployeeVideoRecording, stopManagerVideoRecording, id, recordingSessionId);
            if (res?.success) {
                setRecordingStatus('stopping');
                showToast('Đang dừng ghi hình và lưu video...', 'info');
            } else {
                showToast('Lỗi khi dừng ghi hình', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteInput.trim()) return;
        try {
            const res = await callWithFallback(createEmployeeNote, createManagerNote, id, {
                content: noteInput,
                noteType: 'in_meeting'
            });
            if (res?.success) {
                setNoteInput('');
                loadNotes();
                showToast('Đã thêm ghi chú', 'success');
            }
        } catch (err) {
            showToast('Lỗi khi thêm ghi chú', 'error');
        }
    };



    const handleMicToggle = () => {
        const me = meetingState.participants?.find(p => p.id === myParticipantId);
        if (me?.isMuted && isMicOn) {
            showToast('Không thể bật tiếng. Bạn đã bị Chủ tọa tắt tiếng!', 'error');
            return;
        }

        const nextVal = !isMicOn;
        setIsMicOn(nextVal);

        setMeetingState(prev => {
            const next = {
                ...prev,
                participants: prev.participants.map(p => p.id === myParticipantId ? { ...p, isMuted: !nextVal } : p)
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
    };

    const handleVideoToggle = () => {
        const nextVal = !isVideoOn;
        setIsVideoOn(nextVal);

        setMeetingState(prev => {
            const next = {
                ...prev,
                participants: prev.participants.map(p => p.id === myParticipantId ? { ...p, isCameraOff: !nextVal } : p)
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
    };

    const handleSelfSpeak = () => {
        speakingOverrideRef.current = Date.now();
        setMeetingState(prev => {
            const next = {
                ...prev,
                participants: prev.participants.map(p => ({
                    ...p,
                    isSpeaking: p.id === myParticipantId
                }))
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
        showToast('Bạn đang phát biểu!', 'success');
    };

    // Giơ tay — thuần local, chưa có BE lưu trạng thái này cho người khác trong phòng thấy.
    const handleToggleRaiseHand = () => {
        const next = !isHandRaised;
        setIsHandRaised(next);
        showToast(next ? 'Bạn đã giơ tay.' : 'Bạn đã hạ tay.', 'info');
    };

    const sendReaction = (emoji) => {
        if (meetingState.reactionsLocked && !isHost) {
            showToast('Tính năng thả cảm xúc đang bị Chủ tọa khóa!', 'error');
            return;
        }

        setMeetingState(prev => {
            const next = {
                ...prev,
                lastReaction: {
                    senderId: myParticipantId,
                    emoji,
                    timestamp: Date.now()
                }
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
        setShowReactionPicker(false);
    };

    const handleRenameSelf = () => {
        const currentName = meetingState.participants?.find(p => p.id === myParticipantId)?.fullName || '';
        setRenameModal({ isOpen: true, targetId: myParticipantId, currentName, isSelf: true });
    };

    const handleHostRename = (pId, currentName) => {
        if (!isHost) return;
        setRenameModal({ isOpen: true, targetId: pId, currentName, isSelf: false });
    };

    const submitRename = (name) => {
        if (name && name.trim()) {
            setMeetingState(prev => {
                const next = {
                    ...prev,
                    participants: prev.participants.map(p => p.id === renameModal.targetId ? { ...p, fullName: name.trim() } : p)
                };
                localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
                return next;
            });
            showToast(renameModal.isSelf ? 'Đổi tên thành công!' : 'Chủ tọa đã thay đổi tên của thành viên!', 'success');
        }
        setRenameModal({ isOpen: false, targetId: null, currentName: '', isSelf: true });
    };

    const handleHostMuteToggle = (pId, currentMuteState) => {
        if (!isHost) return;
        setMeetingState(prev => {
            const next = {
                ...prev,
                participants: prev.participants.map(p => p.id === pId ? { ...p, isMuted: !currentMuteState } : p)
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
        showToast(currentMuteState ? 'Đã bật tiếng cho thành viên.' : 'Đã tắt tiếng thành viên.', 'info');
    };

    const handleHostMuteAll = () => {
        if (!isHost) return;
        setMeetingState(prev => {
            const next = {
                ...prev,
                participants: prev.participants.map(p => p.id !== myParticipantId ? { ...p, isMuted: true } : p)
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
        showToast('Đã tắt tiếng tất cả mọi người!', 'warning');
    };

    const handleHostToggleLockReactions = () => {
        if (!isHost) return;
        const nextLocked = !meetingState.reactionsLocked;
        setMeetingState(prev => {
            const next = {
                ...prev,
                reactionsLocked: nextLocked
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
    };

    const handleNextAgenda = () => {
        if (!isHost) return;
        if (meetingState.currentAgendaIndex + 1 < (meetingState.agenda?.length || 0)) {
            setMeetingState(prev => {
                const nextIdx = prev.currentAgendaIndex + 1;
                const next = {
                    ...prev,
                    currentAgendaIndex: nextIdx,
                    agendaTimeLeft: (prev.agenda[nextIdx].durationMin || 10) * 60
                };
                localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
                return next;
            });
            showToast('Đã chuyển phần tiếp theo trong chương trình.', 'success');
        } else {
            showToast('Chương trình đã kết thúc.', 'warning');
        }
    };

    const handleLeaveRoom = () => {
        setConfirmLeaveModal(true);
    };

    const confirmLeave = () => {
        setMeetingState(prev => {
            const next = {
                ...prev,
                participants: prev.participants.filter(p => p.id !== myParticipantId)
            };
            localStorage.setItem(`meeting_state_${id}`, JSON.stringify(next));
            return next;
        });
        navigate(isPublic ? '/' : '/employee');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-cloud-mist text-midnight-indigo flex flex-col overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* HEADER BAR */}
            <header className="h-16 border-b border-platinum-tint bg-white px-6 flex items-center justify-between z-10 shadow-sm-1">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLeaveRoom}
                        className="p-2 bg-cloud-mist hover:bg-pale-gray text-slate-blue hover:text-midnight-indigo rounded-xl transition-all"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-sm font-extrabold text-midnight-indigo tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-action-blue" />
                            {meetingState.title}
                        </h1>
                        <span className="text-[11px] text-slate-blue font-semibold">{meetingState.roomName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {meetingState.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 font-bold text-xs rounded-full border border-red-100">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Đang diễn ra
                        </span>
                    )}
                </div>
            </header>

            {/* VIEW A: LOBBY SCREEN */}
            {!isLobbyReady && meetingState.status === 'scheduled' && (
                <div className="flex-1 flex items-center justify-center p-6 z-10">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border border-platinum-tint shadow-sm-2">

                        {/* Preview Screen */}
                        <div className="flex flex-col justify-between space-y-4">
                            <h2 className="text-base font-bold text-midnight-indigo uppercase tracking-wider">Khung xem trước thiết bị</h2>
                            <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-platinum-tint flex items-center justify-center group shadow-inner">
                                {isVideoOn ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-action-blue/30 flex items-center justify-center text-action-blue shadow-lg">
                                        <Volume2 className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                                    <button
                                        onClick={() => setIsMicOn(!isMicOn)}
                                        className={`p-2.5 rounded-lg transition-all ${isMicOn ? 'bg-action-blue text-white' : 'bg-red-600/90 text-white'}`}
                                    >
                                        {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setIsVideoOn(!isVideoOn)}
                                        className={`p-2.5 rounded-lg transition-all ${isVideoOn ? 'bg-action-blue text-white' : 'bg-red-600/90 text-white'}`}
                                    >
                                        {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-blue text-center leading-relaxed">Vui lòng kiểm tra Micrô và Máy ảnh trước khi tham gia cuộc họp.</p>
                        </div>

                        {/* Setup Name and Ready Button */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-extrabold text-midnight-indigo">Sẵn sàng tham gia?</h3>
                                <p className="text-xs text-slate-blue">Bạn chuẩn bị bước vào cuộc họp cùng với các thành viên khác.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase tracking-wider mb-2">Tên hiển thị của bạn</label>
                                    <input
                                        type="text"
                                        value={localName}
                                        onChange={(e) => setLocalName(e.target.value)}
                                        placeholder={getDefaultGuestName()}
                                        className="w-full px-4 py-3 bg-cloud-mist border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue transition-colors text-midnight-indigo font-semibold"
                                    />
                                    {isPublic && (
                                        <p className="text-[10px] text-emerald-600 mt-1.5 font-medium">Bạn đang tham gia với tư cách Khách ngoài hệ thống.</p>
                                    )}
                                </div>

                                <button
                                    onClick={handleJoinLobby}
                                    className="w-full py-3 bg-action-blue hover:bg-glacier-blue active:scale-[0.98] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-action-blue/20"
                                >
                                    Tham gia phòng chờ
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* VIEW B: WAITING LOBBY (WAITING FOR HOST TO START) */}
            {isLobbyReady && meetingState.status === 'scheduled' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
                    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-platinum-tint shadow-sm-2 space-y-6">

                        <div className="w-16 h-16 border-4 border-action-blue border-t-transparent rounded-full animate-spin mx-auto shadow-inner" />

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-midnight-indigo uppercase tracking-wider">Chờ chủ tọa bắt đầu...</h2>
                            <p className="text-xs text-slate-blue leading-relaxed">
                                Bạn đã sẵn sàng trong phòng chờ. Cuộc họp sẽ tự động bắt đầu khi Chủ tọa (<strong>{meetingState.host}</strong>) nhấn nút bắt đầu cuộc họp.
                            </p>
                        </div>

                        {/* List current lobby members */}
                        <div className="bg-cloud-mist rounded-2xl p-4 border border-platinum-tint text-left space-y-3">
                            <span className="text-[10px] font-bold text-action-blue uppercase tracking-wider">Đã tham gia phòng chờ ({meetingState.participants?.length || 0})</span>
                            <div className="max-h-36 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                                {meetingState.participants?.map(p => (
                                    <div key={p.id} className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-platinum-tint/60">
                                        <div className="flex items-center gap-2">
                                            <UserAvatar
                                                user={p}
                                                className="w-6 h-6 rounded-full shrink-0 font-bold text-[10px]"
                                            />
                                            <span className="font-semibold text-midnight-indigo">{p.fullName}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase ${
                                            p.role === 'Chủ tọa' ? 'bg-red-50 text-red-600' :
                                            p.role === 'Khách' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-blue-50 text-action-blue'
                                        }`}>{p.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isHost && (
                            <button
                                onClick={handleStartMeeting}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
                            >
                                <Play className="w-4 h-4 fill-white inline-block mr-1.5 -mt-0.5" /> Bắt đầu cuộc họp ngay
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW D: END MEETING */}
            {meetingState.status === 'completed' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
                    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-platinum-tint shadow-sm-2 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-action-blue flex items-center justify-center mx-auto shadow-inner">
                            <Check className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-midnight-indigo uppercase tracking-wider">Cuộc họp đã kết thúc</h2>
                        <button onClick={handleLeaveRoom} className="w-full py-3 bg-cloud-mist hover:bg-pale-gray text-midnight-indigo border border-platinum-tint rounded-xl text-xs font-extrabold uppercase transition-all">Quay lại trang chủ</button>
                    </div>
                </div>
            )}
            {/* VIEW C: ACTIVE MEETING ROOM (in_progress) */}
            {meetingState.status === 'in_progress' && (
                <div className="flex-1 flex flex-col lg:flex-row relative z-10">

                    {/* Lưới video (2/3 width) */}
                    <div className="flex-1 flex flex-col bg-white p-6 relative select-none">

                        {/* Banner Trình chiếu tài liệu */}
                        {presentedFile && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 bg-blue-50 border border-action-blue/30 p-3 rounded-xl flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-action-blue flex items-center justify-center text-white shadow-inner shrink-0">
                                        <MonitorUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-action-blue uppercase tracking-wider">Đang trình chiếu</div>
                                        <div className="text-sm font-extrabold text-midnight-indigo truncate max-w-[300px]">{presentedFile.fileName || 'Tài liệu'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isHost && (
                                        <button 
                                            onClick={() => getSocket().emit('agenda:present_stop', { meetingId: id })}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-extrabold uppercase transition-colors"
                                        >
                                            Dừng chiếu
                                        </button>
                                    )}
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const res = await request(`/media-files/${presentedFile.fileId}`, { method: 'GET' });
                                                const url = res.data?.data?.downloadUrl || res.data?.downloadUrl || (res.data?.success && res.data?.data?.url);
                                                if (url) window.open(url, '_blank');
                                                else showToast('Không tìm thấy link tải tài liệu', 'error');
                                            } catch (e) {
                                                showToast('Lỗi khi mở tài liệu', 'error');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-action-blue text-white hover:bg-glacier-blue rounded-lg text-xs font-bold transition-colors shadow flex items-center gap-1.5"
                                    >
                                        Mở tài liệu <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Lưới người tham gia — số cột tự tính theo số người, không còn "ghế" cố định */}
                        <div className="flex-1 min-h-[420px] flex items-start">
                            {(() => {
                                const presentUserIds = new Set(
                                    attendance
                                        .filter(a => ['present', 'maybe_present', 'late', 'checked_in'].includes(a.presenceStatus || a.attendanceStatus || ''))
                                        .map(a => a.userId || a.user_id || a.id)
                                );
                                const activeParticipants = (meetingState.participants || []).filter(
                                    p => presentUserIds.has(p.id) || p.id === myParticipantId || p.role === 'Chủ tọa' || p.isBot
                                );

                                return (
                                    <MeetingGrid
                                        participants={activeParticipants}
                                        myParticipantId={myParticipantId}
                                        isHost={isHost}
                                        isVideoOn={isVideoOn}
                                        onHostMuteToggle={handleHostMuteToggle}
                                        onRename={(pId, currentName, isSelf) => {
                                            if (isSelf) handleRenameSelf();
                                            else handleHostRename(pId, currentName);
                                        }}
                                        reactionsByParticipantId={floatingReactions.reduce((acc, fr) => {
                                            acc[fr.participantId] = fr.emoji;
                                            return acc;
                                        }, {})}
                                    />
                                );
                            })()}
                        </div>

                        {/* THANH ĐIỀU KHIỂN DƯỚI CÙNG */}
                        <div className="h-20 mt-4 bg-white border border-platinum-tint rounded-2xl px-5 flex items-center justify-between gap-4 shadow-sm-1">

                            {/* Mic / Camera */}
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={handleMicToggle}
                                    className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                                        isMicOn ? 'bg-action-blue text-white shadow-md shadow-action-blue/25' : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}
                                    title={isMicOn ? 'Tắt mic' : 'Bật mic'}
                                >
                                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Mic</span>
                                </button>
                                <button
                                    onClick={handleVideoToggle}
                                    className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                                        isVideoOn ? 'bg-action-blue text-white shadow-md shadow-action-blue/25' : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}
                                    title={isVideoOn ? 'Tắt camera' : 'Bật camera'}
                                >
                                    {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Camera</span>
                                </button>
                            </div>

                            <div className="w-px h-8 bg-platinum-tint hidden sm:block" />

                            {/* Giơ tay / Phát biểu / Reaction — thuần local, chưa có BE lưu trạng thái chia sẻ cho người khác */}
                            <div className="flex items-center gap-1.5 relative">
                                <button
                                    onClick={handleToggleRaiseHand}
                                    title="Giơ tay"
                                    className={`p-2.5 rounded-xl transition-all ${isHandRaised ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-blue hover:bg-cloud-mist'}`}
                                >
                                    <Hand className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={handleSelfSpeak}
                                    title="Phát biểu"
                                    className="p-2.5 rounded-xl text-slate-blue hover:bg-cloud-mist transition-all"
                                >
                                    <Volume2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={() => setShowReactionPicker(v => !v)}
                                    title="Thả cảm xúc"
                                    disabled={meetingState.reactionsLocked && !isHost}
                                    className="p-2.5 rounded-xl text-slate-blue hover:bg-cloud-mist transition-all disabled:opacity-40"
                                >
                                    <Smile className="w-4.5 h-4.5" />
                                </button>
                                {showReactionPicker && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white p-2 rounded-xl border border-platinum-tint shadow-sm-2 z-20">
                                        {['👏', '❤️', '👍', '🎉', '😂'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => sendReaction(emoji)}
                                                className="text-lg hover:scale-125 transition-transform px-1"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rời phòng */}
                            <button
                                onClick={handleLeaveRoom}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-red-600/20"
                            >
                                <PhoneOff className="w-4 h-4" /> Rời khỏi
                            </button>
                        </div>

                    </div>

                    {/* ROOM PANEL — sidebar phải, dạng tab */}
                    <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-platinum-tint bg-white flex flex-col overflow-y-auto">
                        <div className="px-6 pt-6 pb-4 border-b border-platinum-tint">
                            <h2 className="text-sm font-extrabold text-midnight-indigo">Bảng điều khiển</h2>
                            <p className="text-[11px] text-slate-blue">Quản lý phiên họp</p>
                        </div>

                        {/* Tab điều hướng */}
                        <nav className="flex flex-col px-2 py-2 border-b border-platinum-tint">
                            {[
                                ...(isHost ? [{ id: 'host', label: 'Quản lý phòng', icon: Shield }] : []),
                                { id: 'agenda', label: 'Lịch trình', icon: Calendar },
                                { id: 'notes', label: 'Ghi chú', icon: StickyNote },
                                { id: 'attendance', label: 'Người tham gia', icon: Users },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveChatTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                                        activeChatTab === tab.id
                                            ? 'bg-blue-50 text-action-blue'
                                            : 'text-slate-blue hover:bg-cloud-mist'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">

                        {/* TAB: Host Controls */}
                        {activeChatTab === 'host' && isHost && (
                            <>
                                {/* TODO: BE chưa trả room.hasMicrophone ở GET /meetings/:meetingId (BUG-02, phía BE) —
                                    tạm gate theo status cuộc họp; đổi lại thành `meetingState?.room?.hasMicrophone`
                                    khi BE bổ sung field, để không hiện nút ghi âm ở phòng không có mic. */}
                                {meetingState.status === 'in_progress' && (
                                    <div className="mb-4">
                                        <h3 className="text-xs font-bold text-midnight-indigo uppercase tracking-widest mb-3">Ghi âm & Gán người nói (Trạm cố định)</h3>
                                        <StationRecorder 
                                            meetingId={id} 
                                            participants={meetingState.participants || []} 
                                            onUploadSuccess={(sessionId) => {
                                                showToast('Đã tải lên tệp ghi âm thành công', 'success');
                                                setRecordingSessionId(sessionId);
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="bg-white border border-platinum-tint rounded-2xl p-4 space-y-3.5 shadow-sm-1">
                                    <h3 className="text-xs font-bold text-midnight-indigo uppercase tracking-widest">Quyền tương tác</h3>

                                    {/* Screen Share — BE hiện chưa có endpoint hỗ trợ, để disabled thay vì giả lập chạy được */}
                                    <div className="flex items-center justify-between opacity-60" title="BE chưa hỗ trợ chia sẻ màn hình">
                                        <span className="text-xs font-semibold text-midnight-indigo flex items-center gap-1.5">
                                            <MonitorUp className="w-4 h-4" /> Chia sẻ màn hình
                                        </span>
                                        <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-pale-gray cursor-not-allowed">
                                            <span className="inline-block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow" />
                                        </span>
                                    </div>

                                    {/* Record Session — gắn thật vào recording-config / recording-session BE */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-midnight-indigo flex items-center gap-1.5">
                                            <VideoIcon className="w-4 h-4" /> Ghi hình cuộc họp
                                        </span>
                                        <button
                                            type="button"
                                            disabled={actionLoading || recordingStatus === 'starting' || recordingStatus === 'stopping'}
                                            onClick={() => {
                                                if (recordingStatus === 'inactive') handleStartRecording();
                                                else if (recordingStatus === 'recording' || recordingStatus === 'paused') handleStopRecording();
                                            }}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                                                recordingStatus !== 'inactive' ? 'bg-action-blue' : 'bg-pale-gray'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${recordingStatus !== 'inactive' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>

                                    {['recording', 'starting', 'stopping', 'paused'].includes(recordingStatus) && (
                                        <>
                                            <RecordingTimer
                                                meetingId={id}
                                                sessionId={recordingSessionId}
                                                initialStatus={recordingStatus}
                                                onStatusChange={setRecordingStatus}
                                            />
                                            <div className="flex gap-2">
                                                {recordingStatus === 'recording' && (
                                                    <button onClick={handlePauseRecording} className="flex-1 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold">Tạm dừng</button>
                                                )}
                                                {recordingStatus === 'paused' && (
                                                    <button onClick={handleResumeRecording} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">Tiếp tục</button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleHostMuteAll}
                                        className="w-full py-2 bg-cloud-mist hover:bg-pale-gray text-midnight-indigo border border-platinum-tint rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        <VolumeX className="w-4 h-4" /> Mute tất cả mọi người
                                    </button>
                                    <button
                                        onClick={handleHostToggleLockReactions}
                                        className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                                            meetingState.reactionsLocked
                                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                        }`}
                                    >
                                        <Smile className="w-4 h-4" />
                                        {meetingState.reactionsLocked ? 'Mở khóa thả Reactions' : 'Khóa thả Reactions'}
                                    </button>
                                </div>

                                {/* Next agenda item */}
                                {meetingState.agenda?.[meetingState.currentAgendaIndex + 1] && (
                                    <div className="bg-action-blue rounded-2xl p-4 text-white space-y-1 shadow-md shadow-action-blue/20">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Mục lịch trình tiếp theo</span>
                                        <h4 className="text-sm font-extrabold leading-snug">
                                            {meetingState.agenda[meetingState.currentAgendaIndex + 1].title}
                                        </h4>
                                        <p className="text-[11px] opacity-90">
                                            Bắt đầu trong {Math.max(1, Math.ceil(meetingState.agendaTimeLeft / 60))} phút
                                        </p>
                                        {meetingState.currentAgendaIndex + 1 < meetingState.agenda.length && (
                                            <button
                                                onClick={handleNextAgenda}
                                                className="w-full mt-2 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                Chuyển ngay <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* TAB: Agenda */}
                        {activeChatTab === 'agenda' && (
                            <div className="flex flex-col gap-4">
                                {meetingState.agenda && meetingState.agenda.length > 0 ? (
                                    <>
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                                            <div>
                                                <span className="text-[10px] font-extrabold text-action-blue uppercase tracking-wider block">Đang thảo luận</span>
                                                <h4 className="font-extrabold text-midnight-indigo text-sm mt-0.5 leading-snug">
                                                    {meetingState.agenda[meetingState.currentAgendaIndex]?.title}
                                                </h4>
                                                {meetingState.agenda[meetingState.currentAgendaIndex]?.attachments?.length > 0 && (
                                                    <div className="mt-2 space-y-1.5">
                                                        {meetingState.agenda[meetingState.currentAgendaIndex].attachments.map(att => (
                                                            <div key={att.id} className="flex items-center justify-between bg-white border border-blue-100 p-2 rounded-lg">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    <FileText className="w-3.5 h-3.5 text-slate-blue shrink-0" />
                                                                    <span className="text-[11px] font-semibold text-midnight-indigo truncate">{att.fileName}</span>
                                                                </div>
                                                                {isHost && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (presentedFile?.fileId === att.id) {
                                                                                getSocket().emit('agenda:present_stop', { meetingId: id });
                                                                            } else {
                                                                                getSocket().emit('agenda:present', {
                                                                                    meetingId: id,
                                                                                    agendaId: meetingState.agenda[meetingState.currentAgendaIndex].id,
                                                                                    fileId: att.id,
                                                                                    fileName: att.fileName,
                                                                                    presentedBy: myParticipantId
                                                                                });
                                                                            }
                                                                        }}
                                                                        className={`shrink-0 ml-2 px-2 py-1 rounded text-[9px] font-extrabold uppercase transition-colors ${
                                                                            presentedFile?.fileId === att.id 
                                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                            : 'bg-action-blue text-white hover:bg-glacier-blue'
                                                                        }`}
                                                                    >
                                                                        {presentedFile?.fileId === att.id ? 'Dừng chiếu' : 'Chiếu'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-blue-100">
                                                <span className="text-[10px] text-slate-blue font-bold">Thời gian còn lại:</span>
                                                <span className="text-xs font-mono font-extrabold text-action-blue">
                                                    {Math.floor(meetingState.agendaTimeLeft / 60)}:{(meetingState.agendaTimeLeft % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            {isHost && meetingState.currentAgendaIndex + 1 < meetingState.agenda.length && (
                                                <button
                                                    onClick={handleNextAgenda}
                                                    className="w-full py-1.5 bg-action-blue hover:bg-glacier-blue text-white rounded-lg text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-0.5"
                                                >
                                                    Mục tiếp theo <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {mediaFiles.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-midnight-indigo uppercase mb-2 flex items-center gap-1.5">
                                                    <ListTodo className="w-3.5 h-3.5" /> Video ghi hình ({mediaFiles.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {mediaFiles.map((file, idx) => (
                                                        <div key={file.id || idx} className="p-3 bg-cloud-mist border border-platinum-tint rounded-xl flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <VideoIcon className="w-4 h-4 text-action-blue mr-2 shrink-0" />
                                                                <div className="text-left">
                                                                    <p className="text-xs font-semibold text-midnight-indigo">{file.title || `Video_${idx + 1}`}</p>
                                                                    <p className="text-[9px] text-slate-blue">{file.duration ? formatDuration(file.duration) : 'Recording'}</p>
                                                                </div>
                                                            </div>
                                                            <a href={file.downloadUrl || '#'} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-platinum-tint rounded-lg text-action-blue hover:text-glacier-blue">
                                                                <Play className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-widest block">Nội dung kế tiếp</span>
                                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                            {meetingState.agenda.slice(meetingState.currentAgendaIndex + 1).map((item, idx) => (
                                                <div key={idx} className="flex flex-col gap-1 p-2.5 bg-cloud-mist rounded-lg border border-platinum-tint">
                                                    <div className="flex justify-between items-center text-[11px] font-semibold text-midnight-indigo">
                                                        <span className="truncate max-w-[140px]">{item.title}</span>
                                                        <span className="text-[10px] text-action-blue font-bold bg-blue-50 px-2 py-0.5 rounded shrink-0">{item.durationMin || item.plannedDurationMinutes} phút</span>
                                                    </div>
                                                    {item.attachments?.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-0.5 opacity-70">
                                                            <FileText className="w-3 h-3 text-slate-blue" />
                                                            <span className="text-[9px] text-slate-blue font-medium">{item.attachments.length} tài liệu</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {meetingState.currentAgendaIndex + 1 >= meetingState.agenda.length && (
                                                <p className="text-[10px] text-slate-blue italic text-center py-2">Không còn hạng mục nào tiếp theo.</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-slate-blue italic text-center py-4">Chưa cài đặt Agenda cho cuộc họp.</p>
                                )}
                            </div>
                        )}

                        {/* TAB: Notes */}
                        {activeChatTab === 'notes' && (
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[420px]">
                                    {notes.map((note, idx) => {
                                        const authorName = note.author?.fullName || note.authorName || 'Chưa rõ';
                                        return (
                                            <div key={idx} className="bg-cloud-mist p-2.5 rounded-lg border border-platinum-tint">
                                                <div className="text-[10px] text-action-blue font-bold mb-1">{authorName}</div>
                                                <div className="text-xs text-midnight-indigo">{note.content}</div>
                                            </div>
                                        );
                                    })}
                                    {notes.length === 0 && <p className="text-xs text-slate-blue italic">Chưa có ghi chú nào.</p>}
                                </div>
                                <form onSubmit={handleAddNote} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                        placeholder="Thêm ghi chú..."
                                        className="flex-1 px-3 py-1.5 bg-cloud-mist border border-platinum-tint rounded-lg text-xs text-midnight-indigo focus:outline-none focus:border-action-blue"
                                    />
                                    <button type="submit" disabled={actionLoading} className="px-3 py-1.5 bg-action-blue hover:bg-glacier-blue text-white rounded-lg text-xs font-bold">Gửi</button>
                                </form>
                            </div>
                        )}

                        {/* TAB: Attendance */}
                        {activeChatTab === 'attendance' && (
                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[460px]">
                                {attendance.map((att, idx) => {
                                    const name = att.fullName || att.userFullName || 'Chưa rõ';
                                    const status = att.presenceStatus || att.attendanceStatus || 'unknown';
                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-cloud-mist p-2.5 rounded-lg border border-platinum-tint">
                                            <div className="text-xs text-midnight-indigo font-semibold">{name}</div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                                status === 'present' ? 'bg-emerald-50 text-emerald-700' :
                                                status === 'maybe_present' || status === 'late' ? 'bg-amber-50 text-amber-700' :
                                                'bg-red-50 text-red-600'
                                            }`}>
                                                {status}
                                            </span>
                                        </div>
                                    );
                                })}
                                {attendance.length === 0 && <p className="text-xs text-slate-blue italic">Chưa có dữ liệu điểm danh từ thiết bị.</p>}
                            </div>
                        )}

                    </div>
                    </div>
                </div>
            )}

            {/* RENAME MODAL */}
            {renameModal.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/40 backdrop-blur-sm transition-all">
                    <div className="bg-white border border-platinum-tint rounded-2xl p-6 w-full max-w-sm shadow-sm-3">
                        <h3 className="text-lg font-bold text-midnight-indigo mb-2">
                            {renameModal.isSelf ? 'Nhập tên hiển thị mới của bạn:' : `Thay đổi tên cho thành viên "${renameModal.currentName}":`}
                        </h3>
                        <input
                            type="text"
                            autoFocus
                            defaultValue={renameModal.currentName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') submitRename(e.target.value);
                            }}
                            id="renameInput"
                            className="w-full px-4 py-3 bg-cloud-mist border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue transition-colors text-midnight-indigo font-semibold mb-6"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRenameModal({ isOpen: false, targetId: null, currentName: '', isSelf: true })}
                                className="px-4 py-2 bg-cloud-mist hover:bg-pale-gray text-midnight-indigo rounded-xl text-xs font-bold transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => submitRename(document.getElementById('renameInput').value)}
                                className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-action-blue/20"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM LEAVE MODAL */}
            {confirmLeaveModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight-indigo/40 backdrop-blur-sm transition-all">
                    <div className="bg-white border border-platinum-tint rounded-2xl p-6 w-full max-w-sm shadow-sm-3">
                        <h3 className="text-lg font-bold text-midnight-indigo mb-2">Xác nhận rời phòng</h3>
                        <p className="text-sm text-slate-blue mb-6">Bạn có chắc chắn muốn rời phòng họp?</p>
                        <div className="flex flex-col gap-2">
                            {isHost && (
                                <button
                                    onClick={handleEndMeeting}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-red-600/20"
                                >
                                    {actionLoading ? 'Đang kết thúc...' : 'Kết thúc cuộc họp cho tất cả'}
                                </button>
                            )}
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => setConfirmLeaveModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-cloud-mist hover:bg-pale-gray text-midnight-indigo rounded-xl text-xs font-bold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmLeave}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                        isHost
                                            ? 'bg-cloud-mist hover:bg-pale-gray text-midnight-indigo border border-platinum-tint'
                                            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                                    }`}
                                >
                                    Rời đi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST ALERTS OVERLAY */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 text-white ${
                                t.type === 'error' ? 'bg-red-600 border-red-500 shadow-red-950/40' :
                                t.type === 'warning' ? 'bg-amber-500 border-amber-400 shadow-amber-950/40' :
                                t.type === 'success' ? 'bg-emerald-600 border-emerald-500 shadow-emerald-950/40' :
                                'bg-indigo-950 border-indigo-800 shadow-indigo-950/40'
                            }`}
                        >
                            {t.type === 'error' && <VolumeX className="w-4 h-4 shrink-0" />}
                            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                            {t.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
                            <span>{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InMeetingRoom;
