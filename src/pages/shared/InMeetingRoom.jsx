import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, Shield, 
    Smile, Play, Clock, ChevronRight, Edit2, Check,
    AlertTriangle, Volume2, VolumeX, ArrowLeft, Sparkles, Users,
    StopCircle, PauseCircle, PlayCircle
} from 'lucide-react';
import { getSocket, subscribeToMeeting } from '../../utils/socket';
import { getMeetingById as getMeetingEmployee, startMeeting as startEmployee, endMeeting as endEmployee, getPresentAttendees as getEmployeeAttendees, getMeetingAttendance as getEmployeeAttendance, createMeetingNote as createEmployeeNote, listMeetingNotes as listEmployeeNotes, startVideoRecording as startEmployeeVideoRecording, pauseVideoRecording as pauseEmployeeVideoRecording, resumeVideoRecording as resumeEmployeeVideoRecording, stopVideoRecording as stopEmployeeVideoRecording, getRecordingStatus as getEmployeeRecordingStatus, getMeetingMediaFiles as getEmployeeMediaFiles } from '../../service/employeeServices';
import { getMeetingById as getMeetingManager, startMeeting as startManager, endMeeting as endManager, getPresentAttendees as getManagerAttendees, getMeetingAttendance as getManagerAttendance, createMeetingNote as createManagerNote, listMeetingNotes as listManagerNotes, startVideoRecording as startManagerVideoRecording, pauseVideoRecording as pauseManagerVideoRecording, resumeVideoRecording as resumeManagerVideoRecording, stopVideoRecording as stopManagerVideoRecording, getRecordingStatus as getManagerRecordingStatus, getMeetingMediaFiles as getManagerMediaFiles } from '../../service/managerServices';
import UserAvatar, { resolveAvatarUrl } from '../../component/UserAvatar';

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
        { id: 'mgr-uuid', fullName: 'Nguyễn Văn A', role: 'Host', isMuted: false, isCameraOff: false, isSpeaking: false, isBot: false },
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

// Seat placement offsets around the central oval table (percentages)
const seats = [
    { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },      // Seat 0: Top Center (Host)
    { top: '30%', left: '16%', transform: 'translate(-50%, -50%)' },     // Seat 1: Top Left
    { top: '70%', left: '16%', transform: 'translate(-50%, -50%)' },     // Seat 2: Bottom Left
    { top: '92%', left: '50%', transform: 'translate(-50%, -50%)' },     // Seat 3: Bottom Center (You / Current User)
    { top: '70%', right: '16%', transform: 'translate(50%, -50%)' },     // Seat 4: Bottom Right
    { top: '30%', right: '16%', transform: 'translate(50%, -50%)' }      // Seat 5: Top Right
];


// Universal fallback caller for host actions
const callWithFallback = async (employeeFn, managerFn, ...args) => {
    try {
        const res = await employeeFn(...args);
        if (res?.success) return res;
        throw new Error('Employee scope failed');
    } catch (e) {
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
            <div className={`px-3 py-2 rounded-xl border flex flex-col gap-1 text-xs font-bold ${localStatus === 'recording' ? 'bg-red-950/50 text-red-400 border-red-900' : localStatus === 'paused' ? 'bg-amber-950/50 text-amber-400 border-amber-900' : 'bg-blue-950/50 text-blue-400 border-blue-900'}`}>
                <div className="flex items-center">
                    {localStatus === 'recording' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />}
                    {localStatus === 'recording' ? `REC ${formatDuration(duration)}${formatSize(fileSize)}` : 
                     localStatus === 'paused' ? `PAUSED ${formatDuration(duration)}${formatSize(fileSize)}` : 
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
            role: p.participantRole || p.participant_role === 'host' ? 'Host' : 'Thành viên',
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
    const [activeChatTab, setActiveChatTab] = useState('discussion');

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
                if (baseMeeting.agenda && baseMeeting.agenda.length > 0) {
                    savedState.agenda = baseMeeting.agenda;
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
                if (baseMeeting.agenda && baseMeeting.agenda.length > 0) {
                    initial.agenda = baseMeeting.agenda;
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
                        role: 'Host',
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
                showToast('Bạn đã bị Host tắt tiếng (Muted)!', 'error');
                setIsMicOn(false);
            }
            prevMutedRef.current = me.isMuted;
        }

        if (meetingState.reactionsLocked && !prevReactionsLockedRef.current) {
            showToast('Host đã khóa tính năng thả cảm xúc!', 'warning');
        } else if (!meetingState.reactionsLocked && prevReactionsLockedRef.current) {
            showToast('Host đã mở khóa tính năng thả cảm xúc.', 'success');
        }
        prevReactionsLockedRef.current = meetingState.reactionsLocked;
    }, [meetingState, myParticipantId]);

    // Monitor reactions triggers
    useEffect(() => {
        if (!meetingState?.lastReaction) return;
        const { senderId, emoji, timestamp } = meetingState.lastReaction;
        if (Date.now() - timestamp < 1500) {
            const seatIndex = meetingState.participants?.findIndex(p => p.id === senderId);
            if (seatIndex !== -1 && seatIndex !== undefined) {
                const reactionId = `reaction-${Date.now()}-${Math.random()}`;
                setFloatingReactions(prev => [...prev, { id: reactionId, emoji, seatIndex }]);
                setTimeout(() => {
                    setFloatingReactions(prev => prev.filter(r => r.id !== reactionId));
                }, 2200);
            }
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
            const userRole = isPublic ? 'Khách' : (isHost ? 'Host' : 'Thành viên');
            
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
            showToast('Không thể bật tiếng. Bạn đã bị Host tắt tiếng!', 'error');
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

    const sendReaction = (emoji) => {
        if (meetingState.reactionsLocked && !isHost) {
            showToast('Tính năng thả cảm xúc đang bị Host khóa!', 'error');
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
            showToast(renameModal.isSelf ? 'Đổi tên thành công!' : 'Host đã thay đổi tên của thành viên!', 'success');
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
            showToast('Đã chuyển phần tiếp theo trong Agenda.', 'success');
        } else {
            showToast('Chương trình Agenda đã kết thúc.', 'warning');
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* HEADER BAR */}
            <header className="h-16 border-b border-indigo-900/40 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleLeaveRoom}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            Phòng Họp 3D/2D Simulation — SmarTracking
                        </h1>
                        <span className="text-[11px] text-slate-400 font-semibold">{meetingState.title} ({meetingState.roomName})</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {meetingState.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 text-red-400 font-bold text-xs rounded-full border border-red-900/40 animate-pulse-soft">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            CUỘC HỌP ĐANG DIỄN RA
                        </span>
                    )}
                </div>
            </header>

            {/* VIEW A: LOBBY SCREEN */}
            {!isLobbyReady && meetingState.status === 'scheduled' && (
                <div className="flex-1 flex items-center justify-center p-6 z-10">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/60 p-8 rounded-3xl border border-indigo-900/30 backdrop-blur-lg shadow-2xl">
                        
                        {/* Preview Screen */}
                        <div className="flex flex-col justify-between space-y-4">
                            <h2 className="text-base font-bold text-slate-300 uppercase tracking-wider">Khung Preview Thiết Bị</h2>
                            <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-indigo-900/40 flex items-center justify-center group shadow-inner">
                                {isVideoOn ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-indigo-950/80 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse-soft shadow-lg">
                                        <Volume2 className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-indigo-500/20 backdrop-blur-md">
                                    <button 
                                        onClick={() => setIsMicOn(!isMicOn)}
                                        className={`p-2.5 rounded-lg transition-all ${isMicOn ? 'bg-indigo-600 text-white' : 'bg-red-600/90 text-white'}`}
                                    >
                                        {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => setIsVideoOn(!isVideoOn)}
                                        className={`p-2.5 rounded-lg transition-all ${isVideoOn ? 'bg-indigo-600 text-white' : 'bg-red-600/90 text-white'}`}
                                    >
                                        {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 text-center leading-relaxed">Vui lòng kiểm tra Microphone và Camera trước khi tham gia cuộc họp.</p>
                        </div>

                        {/* Setup Name and Ready Button */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-extrabold text-white">Sẵn sàng tham gia?</h3>
                                <p className="text-xs text-slate-400">Bạn chuẩn bị bước vào cuộc họp cùng với các thành viên khác.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên hiển thị của bạn</label>
                                    <input 
                                        type="text" 
                                        value={localName}
                                        onChange={(e) => setLocalName(e.target.value)}
                                        placeholder={getDefaultGuestName()}
                                        className="w-full px-4 py-3 bg-slate-950 border border-indigo-900/50 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white font-semibold"
                                    />
                                    {isPublic && (
                                        <p className="text-[10px] text-emerald-400/90 mt-1.5 font-medium">Bạn đang tham gia với tư cách Khách ngoài hệ thống.</p>
                                    )}
                                </div>

                                <button 
                                    onClick={handleJoinLobby}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20"
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
                    <div className="max-w-md w-full bg-slate-900/70 p-8 rounded-3xl border border-indigo-900/30 backdrop-blur-lg shadow-2xl space-y-6">
                        
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto shadow-inner" />
                        
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Chờ chủ tọa bắt đầu...</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Bạn đã sẵn sàng trong phòng chờ. Cuộc họp sẽ tự động bắt đầu khi Host (<strong>{meetingState.host}</strong>) nhấn nút bắt đầu cuộc họp.
                            </p>
                        </div>

                        {/* List current lobby members */}
                        <div className="bg-slate-950/80 rounded-2xl p-4 border border-indigo-950/60 text-left space-y-3">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Đã tham gia phòng chờ ({meetingState.participants?.length || 0})</span>
                            <div className="max-h-36 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                                {meetingState.participants?.map(p => (
                                    <div key={p.id} className="flex items-center justify-between text-xs p-2 bg-slate-900/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <UserAvatar
                                                user={p}
                                                className="w-6 h-6 rounded-full shrink-0 bg-indigo-950 text-indigo-300 font-bold text-[10px]"
                                            />
                                            <span className="font-semibold text-slate-200">{p.fullName}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase ${
                                            p.role === 'Host' ? 'bg-red-500/20 text-red-400' :
                                            p.role === 'Khách' ? 'bg-emerald-500/20 text-emerald-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>{p.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isHost && (
                            <button 
                                onClick={handleStartMeeting}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 animate-pulse-soft"
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
                    <div className="max-w-md w-full bg-slate-900/70 p-8 rounded-3xl border border-indigo-900/30 backdrop-blur-lg shadow-2xl space-y-6">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                            <Check className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Cuộc họp đã kết thúc</h2>
                        <button onClick={handleLeaveRoom} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-extrabold uppercase transition-all">Quay lại trang chủ</button>
                    </div>
                </div>
            )}
            {/* VIEW C: ACTIVE MEETING ROOM (in_progress) */}
            {meetingState.status === 'in_progress' && (
                <div className="flex-1 flex flex-col lg:flex-row relative z-10">
                    
                    {/* Visual conference board (2/3 width) */}
                    <div className="flex-1 flex flex-col bg-slate-950 p-6 relative select-none">
                        
                        {/* Conference Board Container */}
                        <div className="flex-1 flex items-center justify-center relative min-h-[420px]">
                            
                            {/* OVAL CONFERENCE TABLE */}
                            <div className="w-[62%] h-[48%] bg-gradient-to-br from-indigo-950/90 to-slate-900/90 rounded-[120px] border-2 border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.15)] flex flex-col items-center justify-center relative">
                                <div className="text-center space-y-1 opacity-70">
                                    <div className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase">Smart Conference Table</div>
                                    <div className="text-xs text-white/40 font-bold italic">SmarTracking Live Engine</div>
                                </div>
                            </div>

                            {/* SEAT PLACEMENTS */}
                            {meetingState.participants?.slice(0, 6).map((p, idx) => {
                                const seatStyle = seats[idx % seats.length];
                                const isUserSelf = p.id === myParticipantId;
                                
                                return (
                                    <div 
                                        key={p.id}
                                        className="absolute flex flex-col items-center transition-all duration-500"
                                        style={{
                                            top: seatStyle.top,
                                            left: seatStyle.left,
                                            right: seatStyle.right,
                                            transform: seatStyle.transform
                                        }}
                                    >
                                        {/* Seat circle with visual camera stream or avatar */}
                                        <div className={`w-20 h-20 rounded-full bg-slate-900 border-2 relative flex items-center justify-center transition-all ${
                                            p.isSpeaking 
                                                ? 'border-indigo-400 ring-4 ring-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
                                                : 'border-indigo-950/80 shadow-md'
                                        }`}>
                                            {isUserSelf && isVideoOn ? (
                                                <video 
                                                    id={`video-${p.id}`}
                                                    autoPlay 
                                                    playsInline 
                                                    muted 
                                                    className="w-full h-full rounded-full object-cover transform scale-x-[-1]" 
                                                />
                                            ) : (
                                                <UserAvatar user={p} className={`w-full h-full rounded-full bg-gradient-to-br font-bold text-lg ${
                                                    p.role === 'Host' ? 'from-red-950 to-indigo-950 text-indigo-300' :
                                                    p.role === 'Khách' ? 'from-emerald-950 to-slate-950 text-emerald-300' :
                                                    'from-blue-950 to-slate-950 text-blue-300'
                                                }`} />
                                            )}

                                            {/* Micro-animations: Speak waves */}
                                            {p.isSpeaking && (
                                                <div className="absolute -top-1 -right-1 flex items-end gap-0.5 h-4 px-1 bg-indigo-500 rounded shadow-md z-20">
                                                    <div className="w-0.5 bg-white voice-bar" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-0.5 bg-white voice-bar" style={{ animationDelay: '0.3s' }} />
                                                    <div className="w-0.5 bg-white voice-bar" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                            )}

                                            {/* Micro-animations: Muted overlay bubble */}
                                            {p.isMuted && (
                                                <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full border border-slate-950 shadow-md text-white z-20">
                                                    <MicOff className="w-3.5 h-3.5" />
                                                </div>
                                            )}

                                            {/* Host quick controls overlay */}
                                            {isHost && !isUserSelf && (
                                                <div className="absolute inset-0 bg-slate-950/80 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-30">
                                                    <button 
                                                        onClick={() => handleHostMuteToggle(p.id, p.isMuted)}
                                                        className={`p-1.5 rounded-full text-white transition-colors ${p.isMuted ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                                                        title={p.isMuted ? "Unmute" : "Mute"}
                                                    >
                                                        {p.isMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleHostRename(p.id, p.fullName)}
                                                        className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
                                                        title="Đổi tên"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Name badge */}
                                        <div 
                                            onClick={() => {
                                                if (isUserSelf) handleRenameSelf();
                                                else if (isHost) handleHostRename(p.id, p.fullName);
                                            }}
                                            className={`bg-slate-900/90 text-white text-[10.5px] px-2 py-0.5 rounded-full border border-indigo-900/60 text-center font-bold mt-2 shadow flex items-center gap-1 cursor-pointer select-none max-w-[110px] truncate ${
                                                isUserSelf ? 'hover:border-indigo-400' : ''
                                            }`}
                                        >
                                            <span className="truncate">{isUserSelf ? `${p.fullName} (Bạn)` : p.fullName}</span>
                                            {isUserSelf && <Edit2 className="w-3 h-3 text-slate-400 shrink-0" />}
                                        </div>

                                        {/* Role badge */}
                                        <span className={`text-[8.5px] font-extrabold uppercase tracking-wide px-1.5 mt-0.5 rounded ${
                                            p.role === 'Host' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                                            p.role === 'Khách' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                                            'bg-indigo-950 text-indigo-400 border border-indigo-900/30'
                                        }`}>
                                            {p.role}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* Floating Reactions Rendering */}
                            {floatingReactions.map(fr => {
                                const seatStyle = seats[fr.seatIndex % seats.length];
                                return (
                                    <div
                                        key={fr.id}
                                        className="absolute z-40 text-3xl pointer-events-none animate-float-up"
                                        style={{
                                            top: `calc(${seatStyle.top} - 35px)`,
                                            left: seatStyle.left,
                                            right: seatStyle.right,
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        {fr.emoji}
                                    </div>
                                );
                            })}

                        </div>

                        {/* BOTTOM TOOLBAR CONTROLS */}
                        <div className="h-20 bg-slate-900/80 border border-indigo-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-lg">
                            
                            {/* Device buttons */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleMicToggle}
                                    className={`p-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 text-xs text-white ${
                                        isMicOn ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'
                                    }`}
                                >
                                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{isMicOn ? 'Tắt tiếng' : 'Bật tiếng'}</span>
                                </button>
                                <button 
                                    onClick={handleVideoToggle}
                                    className={`p-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 text-xs text-white ${
                                        isVideoOn ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'
                                    }`}
                                >
                                    {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{isVideoOn ? 'Tắt Camera' : 'Bật Camera'}</span>
                                </button>
                                <button 
                                    onClick={handleSelfSpeak}
                                    className="p-2.5 bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5"
                                >
                                    <Volume2 className="w-4 h-4" /> Phát biểu
                                </button>
                            </div>

                            {/* Reactions panel */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Reactions:</span>
                                <div className="flex gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-indigo-950/80">
                                    {['👏', '❤️', '👍', '🎉', '😂'].map(emoji => (
                                        <button 
                                            key={emoji}
                                            disabled={meetingState.reactionsLocked && !isHost}
                                            onClick={() => sendReaction(emoji)}
                                            className="text-base hover:scale-125 transition-transform px-1 disabled:opacity-40 disabled:hover:scale-100"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quit button */}
                            <button 
                                onClick={handleLeaveRoom}
                                className="px-5 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                                Rời cuộc họp
                            </button>
                        </div>

                    </div>

                    {/* SIDEBAR FOR HOST CONTROLS & AGENDA PROGRESS (1/3 width) */}
                    <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-indigo-900/40 bg-slate-900/60 backdrop-blur-md p-6 flex flex-col gap-6 overflow-y-auto">
                        
                        {/* Host panel */}
                        {isHost && (
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-indigo-900/40 space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-indigo-400" />
                                    Bảng Điều Khiển Host
                                </h3>

                                <div className="flex flex-col gap-2.5">
                                    <button 
                                        onClick={handleHostMuteAll}
                                        className="w-full py-2 bg-slate-900 hover:bg-indigo-950 text-slate-200 border border-slate-800 hover:border-indigo-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        <VolumeX className="w-4 h-4" /> Mute tất cả mọi người
                                    </button>

                                    <button 
                                        onClick={handleHostToggleLockReactions}
                                        className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                                            meetingState.reactionsLocked 
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border-emerald-900/40' 
                                                : 'bg-red-950/80 hover:bg-red-900 text-red-400 border-red-900/40'
                                        }`}
                                    >
                                        <Smile className="w-4 h-4" />
                                        {meetingState.reactionsLocked ? 'Mở khóa thả Reactions' : 'Khóa thả Reactions'}
                                    </button>
                                </div>

                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mt-4 pt-4 border-t border-indigo-900/40">
                                    <VideoIcon className="w-4 h-4 text-indigo-400" />
                                    Ghi Hình Phòng Họp
                                </h3>
                                <div className="flex flex-col gap-2.5">
                                    {['recording', 'starting', 'stopping', 'paused'].includes(recordingStatus) && (
                                        <RecordingTimer 
                                            meetingId={id} 
                                            sessionId={recordingSessionId} 
                                            initialStatus={recordingStatus} 
                                            onStatusChange={setRecordingStatus} 
                                        />
                                    )}
                                    
                                    {recordingStatus === 'inactive' ? (
                                        <button onClick={handleStartRecording} disabled={actionLoading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                                            <PlayCircle className="w-4 h-4" /> Bắt đầu ghi hình
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            {recordingStatus === 'recording' ? (
                                                <button onClick={handlePauseRecording} className="flex-1 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold">Tạm dừng</button>
                                            ) : recordingStatus === 'paused' ? (
                                                <button onClick={handleResumeRecording} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">Tiếp tục</button>
                                            ) : null}
                                            <button onClick={handleStopRecording} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold">Kết thúc</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Live Agenda Timeline countdown */}
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-indigo-950/40 flex-1 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-indigo-950 pb-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                Chương trình Agenda
                            </h3>

                            {meetingState.agenda && meetingState.agenda.length > 0 ? (
                                <div className="flex-1 flex flex-col justify-between gap-4">
                                    
                                    {/* Active Item Card */}
                                    <div className="p-4 bg-indigo-950/60 border border-indigo-900/40 rounded-xl space-y-3 shadow-inner">
                                        <div>
                                            <span className="text-[8.5px] font-extrabold text-indigo-400 uppercase tracking-wider block">Đang thảo luận</span>
                                            <h4 className="font-extrabold text-white text-xs sm:text-sm mt-0.5 leading-snug">
                                                {meetingState.agenda[meetingState.currentAgendaIndex]?.title}
                                            </h4>
                                        </div>

                                        <div className="flex justify-between items-center bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-indigo-950/60">
                                            <span className="text-[10px] text-slate-400 font-bold">Thời gian còn lại:</span>
                                            <span className="text-xs font-mono font-extrabold text-indigo-400">
                                                {Math.floor(meetingState.agendaTimeLeft / 60)}:{(meetingState.agendaTimeLeft % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        {isHost && meetingState.currentAgendaIndex + 1 < meetingState.agenda.length && (
                                            <button 
                                                onClick={handleNextAgenda}
                                                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-0.5 shadow-md shadow-indigo-900/20"
                                            >
                                                Mục tiếp theo <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Remaining items */}
                                    <div className="space-y-4 pr-2">
                                        {mediaFiles.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Video ghi hình ({mediaFiles.length})</h4>
                                                <div className="space-y-2">
                                                    {mediaFiles.map((file, idx) => (
                                                        <div key={file.id || idx} className="p-3 bg-slate-950/50 border border-indigo-950 rounded-xl flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <VideoIcon className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
                                                                <div className="text-left">
                                                                    <p className="text-xs font-semibold text-slate-200">{file.title || `Video_${idx + 1}`}</p>
                                                                    <p className="text-[9px] text-slate-500">{file.duration ? formatDuration(file.duration) : 'Recording'}</p>
                                                                </div>
                                                            </div>
                                                            <a href={file.downloadUrl || '#'} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-900 border border-indigo-900 rounded-lg text-indigo-300 hover:text-white">
                                                                <Play className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block">Nội dung kế tiếp</span>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {meetingState.agenda.slice(meetingState.currentAgendaIndex + 1).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-lg border border-indigo-950/40 text-[11px] font-semibold text-slate-300">
                                                    <span className="truncate max-w-[120px]">{item.title}</span>
                                                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950 px-2 py-0.5 rounded">{item.durationMin} phút</span>
                                                </div>
                                            ))}
                                            {meetingState.currentAgendaIndex + 1 >= meetingState.agenda.length && (
                                                <p className="text-[10px] text-slate-500 italic text-center py-2">Không còn hạng mục nào tiếp theo.</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic text-center py-4">Chưa cài đặt Agenda cho cuộc họp.</p>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-indigo-950/40 flex-1 flex flex-col gap-4 max-h-[300px]">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-indigo-950 pb-2">
                                <Edit2 className="w-4 h-4 text-indigo-400" />
                                Ghi chú cuộc họp
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {notes.map((note, idx) => {
                                    const authorName = note.author?.fullName || note.authorName || 'Chưa rõ';
                                    return (
                                        <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-indigo-900/30">
                                            <div className="text-[10px] text-indigo-400 font-bold mb-1">{authorName}</div>
                                            <div className="text-xs text-slate-300">{note.content}</div>
                                        </div>
                                    );
                                })}
                                {notes.length === 0 && <p className="text-xs text-slate-500 italic">Chưa có ghi chú nào.</p>}
                            </div>
                            <form onSubmit={handleAddNote} className="flex gap-2">
                                <input
                                    type="text"
                                    value={noteInput}
                                    onChange={e => setNoteInput(e.target.value)}
                                    placeholder="Thêm ghi chú..."
                                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-indigo-900/50 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                                <button type="submit" disabled={actionLoading} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">Gửi</button>
                            </form>
                        </div>

                        {/* Attendance Section */}
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-indigo-950/40 flex-1 flex flex-col gap-4 max-h-[250px]">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-indigo-950 pb-2">
                                <Users className="w-4 h-4 text-indigo-400" />
                                Điểm danh thiết bị
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {attendance.map((att, idx) => {
                                    const name = att.fullName || att.userFullName || 'Chưa rõ';
                                    const status = att.presenceStatus || att.attendanceStatus || 'unknown';
                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-indigo-900/30">
                                            <div className="text-xs text-slate-300 font-semibold">{name}</div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                                status === 'present' ? 'bg-emerald-950 text-emerald-400' :
                                                status === 'maybe_present' || status === 'late' ? 'bg-amber-950 text-amber-400' :
                                                'bg-red-950 text-red-400'
                                            }`}>
                                                {status}
                                            </span>
                                        </div>
                                    );
                                })}
                                {attendance.length === 0 && <p className="text-xs text-slate-500 italic">Chưa có dữ liệu điểm danh từ thiết bị.</p>}
                            </div>
                        </div>

                    </div>


                </div>
            )}

            {/* RENAME MODAL */}
            {renameModal.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl transition-all">
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">
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
                            className="w-full px-4 py-3 bg-slate-950 border border-indigo-900/50 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white font-semibold mb-6"
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setRenameModal({ isOpen: false, targetId: null, currentName: '', isSelf: true })}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={() => submitRename(document.getElementById('renameInput').value)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-600/20"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM LEAVE MODAL */}
            {confirmLeaveModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl transition-all">
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Xác nhận rời phòng</h3>
                        <p className="text-sm text-slate-300 mb-6">Bạn có chắc chắn muốn rời phòng họp?</p>
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
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={confirmLeave}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                        isHost 
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50' 
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
