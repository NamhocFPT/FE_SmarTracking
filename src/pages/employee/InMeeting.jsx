import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, Users, CheckCircle, Play, FileText, Settings,
    Camera, AlertTriangle, ArrowLeft, ChevronRight, Mic, Volume2, Globe, FileVideo
} from 'lucide-react';
import { getMeetingById, checkInMeeting, startMeeting } from '../../service/employeeServices';

const EmployeeInMeeting = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // States
    const [loading, setLoading] = useState(true);
    const [meeting, setMeeting] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Flow states: 'checkin' | 'console'
    const [stage, setStage] = useState('checkin');
    
    // Check-in states
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkInSuccess, setCheckInSuccess] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);

    // Live Meeting States
    const [meetingStarted, setMeetingStarted] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [currentAgendaIndex, setCurrentAgendaIndex] = useState(0);
    const [agendaTimeLeft, setAgendaTimeLeft] = useState(0);
    const [attendanceList, setAttendanceList] = useState([]);

    // Recording config states
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [translationLang, setTranslationLang] = useState('vi');
    const [generatedFiles, setGeneratedFiles] = useState([]);

    // Load meeting details
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Current user
                const localUserStr = localStorage.getItem('user');
                if (localUserStr) {
                    setCurrentUser(JSON.parse(localUserStr));
                }

                const res = await getMeetingById(id);
                if (res?.success && res.data) {
                    setMeeting(res.data);
                    setMeetingStarted(res.data.status === 'in_progress');
                    initLiveStates(res.data);
                } else {
                    throw new Error();
                }
            } catch (err) {
                // Mock local meeting in-progress fallback
                const localUserStr = localStorage.getItem('user');
                let userObj = { id: 'emp-uuid', fullName: 'Nhân viên mẫu' };
                if (localUserStr) {
                    try { userObj = JSON.parse(localUserStr); } catch (e) {}
                }
                const mock = {
                    id: id || 'meet-101',
                    title: 'Họp kỹ thuật dự án FE SmarTracking',
                    room: { 
                        roomName: 'Phòng Apollo 101',
                        room_name: 'Phòng Apollo 101'
                    },
                    host: userObj.fullName || 'Lê Hoàng Hải',
                    hostId: userObj.id || 'emp-uuid',
                    host_id: userObj.id || 'emp-uuid',
                    status: 'in_progress',
                    recordingEnabled: true,
                    recording_enabled: true,
                    agenda: [
                        { title: 'Khởi động & Demo giao diện', durationMin: 1, orderIndex: 0 }, // 1 min for fast testing
                        { title: 'Thảo luận API tích hợp thiết bị', durationMin: 30, orderIndex: 1 },
                        { title: 'Chốt phương án & phân công nhiệm vụ', durationMin: 15, orderIndex: 2 }
                    ],
                    participants: [
                        { id: 'user-1', fullName: 'Lê Hoàng Hải', full_name: 'Lê Hoàng Hải', email: 'hai.lh@smrmpts.com' },
                        { id: 'user-2', fullName: 'Nguyễn Thị Minh', full_name: 'Nguyễn Thị Minh', email: 'minh.nt@smrmpts.com' },
                        { id: 'user-3', fullName: 'Phan Văn Minh', full_name: 'Phan Văn Minh', email: 'minh.pv@smrmpts.com' }
                    ]
                };
                setMeeting(mock);
                setMeetingStarted(true);
                initLiveStates(mock);
            } finally {
                setLoading(false);
            }
        };
 
        fetchDetails();
    }, [id]);
 
    const initLiveStates = (data) => {
        // Setup initial attendance
        const hostIdVal = data.host_id || data.hostId;
        setAttendanceList(data.participants?.map(p => ({
            ...p,
            checkedIn: p.id === hostIdVal, // host checkin default
            checkInTime: p.id === hostIdVal ? new Date().toLocaleTimeString('vi-VN') : null,
            status: p.id === hostIdVal ? 'present' : 'absent'
        })) || []);

        if (data.agenda && data.agenda.length > 0) {
            setAgendaTimeLeft(data.agenda[0].durationMin * 60);
        }
    };

    // Camera setup for check-in
    useEffect(() => {
        if (stage === 'checkin') {
            startCamera();
        }
        return () => stopCamera();
    }, [stage]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 320 } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraPermission(true);
        } catch {
            setCameraPermission(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const triggerFaceCheckIn = async () => {
        setIsCheckingIn(true);
        setCheckInSuccess(false);

        // Simulate 2-second AI vector generation match check
        setTimeout(async () => {
            try {
                const payload = {
                    photoFileId: 'mock-captured-checkin-file-uuid',
                    checkedInAt: new Date().toISOString()
                };
                
                const res = await checkInMeeting(meeting.id, payload);
                if (res?.success) {
                    handleSuccessfulCheckIn();
                } else {
                    // Local fallback behavior (success)
                    handleSuccessfulCheckIn();
                }
            } catch {
                handleSuccessfulCheckIn();
            }
        }, 2000);
    };

    const handleSuccessfulCheckIn = () => {
        setCheckInSuccess(true);
        setIsCheckingIn(false);
        stopCamera();
        
        // Update attendance status locally
        setAttendanceList(prev => 
            prev.map(p => p.id === currentUser?.id ? { ...p, checkedIn: true, checkInTime: new Date().toLocaleTimeString('vi-VN'), status: 'present' } : p)
        );

        setTimeout(() => {
            setStage('console');
        }, 1500);
    };

    // Live Meeting Timers
    useEffect(() => {
        let timer;
        if (stage === 'console' && meetingStarted) {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);

                // Agenda Countdown
                setAgendaTimeLeft(prev => {
                    if (prev <= 1) {
                        // Automatically shift to next agenda item
                        setCurrentAgendaIndex(curr => {
                            if (curr + 1 < meeting.agenda?.length) {
                                // Add mock file log on agenda complete
                                setGeneratedFiles(files => [
                                    ...files,
                                    { name: `agenda-section-${curr + 1}-transcript.json`, type: 'transcript', time: new Date().toLocaleTimeString('vi-VN') }
                                ]);
                                setAgendaTimeLeft(meeting.agenda[curr + 1].durationMin * 60);
                                return curr + 1;
                            }
                            return curr;
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [stage, meetingStarted, meeting]);

    const handleStartMeeting = async () => {
        try {
            await startMeeting(meeting.id);
            setMeetingStarted(true);
        } catch {
            setMeetingStarted(true);
        }
    };

    const handleNextAgenda = () => {
        if (currentAgendaIndex + 1 < meeting.agenda?.length) {
            setGeneratedFiles(files => [
                ...files,
                { name: `host-advance-agenda-${currentAgendaIndex + 1}.json`, type: 'transcript', time: new Date().toLocaleTimeString('vi-VN') }
            ]);
            setCurrentAgendaIndex(prev => prev + 1);
            setAgendaTimeLeft(meeting.agenda[currentAgendaIndex + 1].durationMin * 60);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-blue text-sm font-semibold">Đang tải phòng họp In-Meeting...</p>
            </div>
        );
    }

    const isHost = currentUser?.id === (meeting.host_id || meeting.hostId);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-platinum-tint pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/employee/meeting/${meeting.id}`)}
                        className="p-2 border border-platinum-tint bg-white hover:bg-cloud-mist rounded-xl text-slate-blue hover:text-midnight-indigo transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-midnight-indigo leading-tight">{meeting.title}</h1>
                        <span className="text-xs text-slate-blue font-semibold">{meeting.room?.room_name || meeting.room?.roomName}</span>
                    </div>
                </div>

                {meetingStarted && (
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-slate-blue">
                            Thời gian: {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                        </span>
                        {(meeting.recording_enabled || meeting.recordingEnabled) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 font-extrabold text-xs rounded-full border border-red-200 animate-pulse-soft">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                                LIVE RECORDING
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* STAGE 1: Face Check-in */}
            {stage === 'checkin' && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-platinum-tint shadow-sm-2 flex flex-col items-center text-center space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center flex-shrink-0">
                        <Camera className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-midnight-indigo">Điểm danh khuôn mặt nhận diện</h2>
                        <p className="text-xs text-slate-blue">Sử dụng sinh trắc học FaceID để ghi nhận attendance cuộc họp</p>
                    </div>

                    {/* Camera simulation frame */}
                    <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-action-blue/20 bg-slate-900 shadow-inner flex items-center justify-center">
                        {cameraPermission ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="text-white text-xs p-4 flex flex-col items-center gap-2">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                                <span>Không có quyền camera. Sử dụng quét mô phỏng.</span>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none rounded-full flex items-center justify-center">
                            <div className="absolute inset-1.5 border border-dashed border-action-blue/30 rounded-full animate-pulse-ring" />
                        </div>
                    </div>

                    <div className="w-full space-y-2">
                        {isCheckingIn ? (
                            <button
                                disabled
                                className="w-full py-2.5 bg-action-blue/80 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang so khớp sinh trắc học...
                            </button>
                        ) : checkInSuccess ? (
                            <div className="w-full py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                <CheckCircle className="w-4.5 h-4.5" /> Check-in thành công!
                            </div>
                        ) : (
                            <button
                                onClick={triggerFaceCheckIn}
                                className="w-full py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                Quét FaceID Điểm Danh
                            </button>
                        )}
                        
                        {!checkInSuccess && (
                            <button
                                onClick={() => setStage('console')}
                                className="w-full py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-all"
                            >
                                Bỏ qua điểm danh (Kháng nghị thủ công)
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* STAGE 2: Console */}
            {stage === 'console' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Meeting Dashboard & Config (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Start meeting controller */}
                        {isHost && !meetingStarted && (
                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-midnight-indigo text-sm sm:text-base">Bắt đầu cuộc họp của bạn</h3>
                                    <p className="text-xs text-slate-blue">Là Host, bạn cần kích hoạt cuộc họp và bắt đầu ghi âm/ghi hình tự động.</p>
                                </div>
                                <button
                                    onClick={handleStartMeeting}
                                    className="px-5 py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    <Play className="w-4 h-4 fill-white" /> Bắt đầu cuộc họp
                                </button>
                            </div>
                        )}

                        {/* Split controls for Audio/Video & Translation config */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 space-y-5">
                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 flex items-center gap-2">
                                <Settings className="w-4.5 h-4.5 text-action-blue" />
                                Cấu hình Ghi hình & In-Meeting Controls (Recording Config)
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Recording config switches */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-midnight-indigo uppercase text-[10px] tracking-wider">Tình trạng Thiết bị đầu vào</h4>
                                    
                                    <div className="flex items-center justify-between p-3 bg-cloud-mist rounded-xl border border-outline-gray">
                                        <div className="flex items-center gap-2.5">
                                            <Mic className={`w-4 h-4 ${isMicEnabled ? 'text-action-blue' : 'text-slate-blue'}`} />
                                            <span className="text-xs font-semibold text-midnight-indigo">Audio Feed (Microphone)</span>
                                        </div>
                                        <button
                                            onClick={() => setIsMicEnabled(!isMicEnabled)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isMicEnabled ? 'bg-action-blue' : 'bg-steel-gray'}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isMicEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-cloud-mist rounded-xl border border-outline-gray">
                                        <div className="flex items-center gap-2.5">
                                            <Volume2 className={`w-4 h-4 ${isVideoEnabled ? 'text-action-blue' : 'text-slate-blue'}`} />
                                            <span className="text-xs font-semibold text-midnight-indigo">Video Feed (Camera)</span>
                                        </div>
                                        <button
                                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isVideoEnabled ? 'bg-action-blue' : 'bg-steel-gray'}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isVideoEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Translation / Transcript Language */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-midnight-indigo uppercase text-[10px] tracking-wider">Cấu hình Bản dịch dịch thuật</h4>
                                    
                                    <div className="p-3.5 bg-cloud-mist rounded-xl border border-outline-gray space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-action-blue" />
                                            <span className="text-xs font-semibold text-midnight-indigo">Dịch Transcript tự động sang</span>
                                        </div>
                                        <select
                                            value={translationLang}
                                            onChange={(e) => setTranslationLang(e.target.value)}
                                            className="w-full text-xs bg-white border border-platinum-tint rounded-lg px-2.5 py-1.5 focus:outline-none"
                                        >
                                            <option value="vi">Tiếng Việt (Gốc)</option>
                                            <option value="en">Tiếng Anh (English)</option>
                                            <option value="ja">Tiếng Nhật (日本語)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media Files list */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2">
                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 mb-4 flex items-center gap-2">
                                <FileText className="w-4.5 h-4.5 text-action-blue" />
                                Tài liệu & Video ghi hình cuộc họp (Media Files)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 bg-cloud-mist/60 border border-outline-gray rounded-xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                        <FileVideo className="w-5 h-5" />
                                    </div>
                                    <div className="truncate text-left">
                                        <span className="font-bold text-midnight-indigo text-xs block truncate">meeting-live-feed.mp4</span>
                                        <span className="text-[10px] text-slate-blue font-semibold">Đang ghi hình... (Realtime)</span>
                                    </div>
                                </div>
                                
                                {generatedFiles.map((file, idx) => (
                                    <div key={idx} className="p-3.5 bg-cloud-mist border border-outline-gray rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="truncate text-left">
                                            <span className="font-bold text-midnight-indigo text-xs block truncate">{file.name}</span>
                                            <span className="text-[10px] text-slate-blue font-semibold">Tạo lúc: {file.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Agenda Tracker & Live Attendance (1/3 width) */}
                    <div className="space-y-6">
                        
                        {/* Live Agenda Timeline */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 text-left">
                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 mb-4 flex items-center gap-2">
                                <Clock className="w-4.5 h-4.5 text-action-blue" />
                                Theo dõi Agenda hiện tại
                            </h3>

                            {meeting.agenda && meeting.agenda.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Active Item Card */}
                                    <div className="p-4 bg-blue-50 border border-blue-150 rounded-xl space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[9px] font-bold text-action-blue uppercase tracking-wider">Đang diễn ra</span>
                                                <h4 className="font-bold text-midnight-indigo text-xs sm:text-sm mt-0.5">{meeting.agenda[currentAgendaIndex].title}</h4>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-action-blue bg-white border border-blue-200 px-2 py-0.5 rounded">
                                                {Math.floor(agendaTimeLeft / 60)}:{(agendaTimeLeft % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                        
                                        <div className="w-full h-1.5 bg-white border border-blue-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-action-blue transition-all duration-1000"
                                                style={{ width: `${(agendaTimeLeft / (meeting.agenda[currentAgendaIndex].durationMin * 60)) * 100}%` }}
                                            />
                                        </div>

                                        {isHost && currentAgendaIndex + 1 < meeting.agenda.length && (
                                            <button
                                                onClick={handleNextAgenda}
                                                className="w-full py-1.5 bg-action-blue hover:bg-glacier-blue text-white rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                Hoàn thành & Sang mục tiếp <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Timeline outline for next items */}
                                    <div className="space-y-2.5 pt-2">
                                        <span className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">Các mục tiếp theo</span>
                                        {meeting.agenda.slice(currentAgendaIndex + 1).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-cloud-mist rounded-xl border border-outline-gray/60 text-xs">
                                                <span className="font-semibold text-midnight-indigo truncate max-w-[150px]">{item.title}</span>
                                                <span className="text-slate-blue font-medium">{item.durationMin} phút</span>
                                            </div>
                                        ))}
                                        {currentAgendaIndex + 1 >= meeting.agenda.length && (
                                            <p className="text-[11px] text-slate-blue italic">Đây là hạng mục cuối cùng của buổi họp.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-blue italic text-center">Không có Agenda</p>
                            )}
                        </div>

                        {/* Real-time Attendance Report */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 text-left">
                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider border-b border-platinum-tint pb-3 mb-4 flex items-center gap-2">
                                <Users className="w-4.5 h-4.5 text-action-blue" />
                                Báo cáo Điểm danh (Attendance Report)
                            </h3>
                            <div className="space-y-3">
                                {attendanceList.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-2.5 bg-cloud-mist/55 rounded-xl border border-outline-gray/60">
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                {member.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="truncate">
                                                <span className="text-xs font-bold text-midnight-indigo block truncate">{member.fullName}</span>
                                                <span className="text-[9.5px] text-slate-blue block truncate">{member.email}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                                member.checkedIn 
                                                    ? 'bg-green-50 text-green-700 border border-green-150' 
                                                    : 'bg-red-50 text-red-600 border border-red-150 animate-pulse'
                                            }`}>
                                                {member.checkedIn ? 'Đã Check-in' : 'Vắng mặt'}
                                            </span>
                                            {member.checkInTime && (
                                                <span className="block text-[9px] text-slate-blue font-mono mt-0.5">{member.checkInTime}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeInMeeting;
