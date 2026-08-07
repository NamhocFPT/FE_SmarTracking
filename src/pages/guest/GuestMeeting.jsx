import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Users, FileText, StickyNote, Mic,
    AlertTriangle, Loader2, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { getGuestMeeting, clearGuestSession, getGuestToken } from '../../service/guestService';

const AGENDA_STATUS = {
    planned:     { text: 'Chờ thực hiện', cls: 'bg-cloud-mist text-slate-blue' },
    in_progress: { text: 'Đang thực hiện', cls: 'bg-blue-50 text-action-blue' },
    done:        { text: 'Hoàn thành', cls: 'bg-emerald-50 text-emerald-700' },
    skipped:     { text: 'Bỏ qua', cls: 'bg-pale-gray text-slate-blue line-through' },
};

const MEETING_STATUS = {
    scheduled:   { text: 'Sắp diễn ra', icon: Clock, cls: 'text-slate-blue' },
    in_progress: { text: 'Đang diễn ra', icon: Mic, cls: 'text-red-500' },
    completed:   { text: 'Đã kết thúc', icon: CheckCircle, cls: 'text-emerald-600' },
    cancelled:   { text: 'Đã hủy', icon: XCircle, cls: 'text-red-600' },
};

const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const POLL_INTERVAL = 8000; // 8 giây

const GuestMeeting = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [meeting, setMeeting] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | ok | error | expelled
    const [errorMsg, setErrorMsg] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const pollRef = useRef(null);

    const fetchMeeting = useCallback(async () => {
        const guestToken = getGuestToken();
        if (!guestToken) {
            setStatus('error');
            setErrorMsg('Phiên khách không tồn tại. Vui lòng truy cập lại từ đường link trong email.');
            return;
        }
        try {
            const res = await getGuestMeeting(meetingId);
            if (res?.success) {
                setMeeting(res.data);
                setStatus('ok');
                setLastUpdated(new Date());
            }
        } catch (err) {
            const code = err?.error?.code;
            if (code === 'GUEST_SESSION_INVALID') {
                clearInterval(pollRef.current);
                clearGuestSession();
                setStatus('expelled');
                setErrorMsg('Quyền truy cập của bạn đã bị thu hồi hoặc phiên đã hết hạn.');
            } else if (code === 'GUEST_LOBBY_PENDING') {
                // host chưa duyệt — hiện trạng thái chờ
                setStatus('lobby');
            } else if (code === 'GUEST_MEETING_CANCELLED') {
                clearInterval(pollRef.current);
                setStatus('cancelled');
                setErrorMsg('Cuộc họp này đã bị hủy.');
            } else if (status !== 'ok') {
                setStatus('error');
                setErrorMsg(err?.error?.message || 'Không thể tải nội dung cuộc họp.');
            }
            // Nếu đang ok + lỗi mạng thoáng qua → giữ data cũ, không báo lỗi
        }
    }, [meetingId, status]);

    useEffect(() => {
        fetchMeeting();
        pollRef.current = setInterval(fetchMeeting, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [fetchMeeting]);

    const handleReturnToJoin = () => {
        clearGuestSession();
        navigate('/');
    };

    // ── Loading ──
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-cloud-mist flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-action-blue animate-spin" />
                    <p className="text-sm text-slate-blue font-medium">Đang tải nội dung cuộc họp...</p>
                </div>
            </div>
        );
    }

    // ── Error / Expelled / Cancelled ──
    if (['error', 'expelled', 'cancelled'].includes(status)) {
        return (
            <div className="min-h-screen bg-cloud-mist flex items-center justify-center p-4">
                <div className="bg-white border border-red-200 rounded-3xl p-10 max-w-sm w-full text-center shadow-sm-2 space-y-5">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-midnight-indigo">Không thể truy cập</h2>
                        <p className="text-sm text-slate-blue mt-2">{errorMsg}</p>
                    </div>
                    <button
                        onClick={handleReturnToJoin}
                        className="w-full py-3 bg-cloud-mist hover:bg-pale-gray text-midnight-indigo border border-platinum-tint rounded-xl text-sm font-bold"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // ── Lobby (host chưa duyệt sau khi đã vào trang này) ──
    if (status === 'lobby') {
        return (
            <div className="min-h-screen bg-cloud-mist flex items-center justify-center p-4">
                <div className="bg-white border border-amber-200 rounded-3xl p-10 max-w-sm w-full text-center shadow-sm-2 space-y-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-midnight-indigo">Đang chờ host duyệt</h2>
                        <p className="text-sm text-slate-blue mt-2">Trang sẽ tự động cập nhật khi được chấp thuận.</p>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-blue">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang chờ phản hồi...
                    </div>
                </div>
            </div>
        );
    }

    // ── OK: Hiển thị nội dung ──
    const statusMeta = MEETING_STATUS[meeting?.status] || MEETING_STATUS.scheduled;
    const StatusIcon = statusMeta.icon;

    return (
        <div className="min-h-screen bg-cloud-mist text-midnight-indigo">
            {/* Header */}
            <header className="bg-white border-b border-platinum-tint px-6 py-4 shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-extrabold text-midnight-indigo leading-tight">{meeting?.meetingTitle}</h1>
                        <p className="text-[11px] text-slate-blue mt-0.5">Chủ tọa: {meeting?.hostName}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${statusMeta.cls}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusMeta.text}
                        {meeting?.status === 'in_progress' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-0.5" />
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

                {/* Thông tin cơ bản */}
                <div className="bg-white border border-platinum-tint rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-blue uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" /> Thông tin cuộc họp
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-[10px] text-slate-blue font-medium">Bắt đầu</p>
                            <p className="font-bold text-midnight-indigo">{fmt(meeting?.startTime)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-blue font-medium">Kết thúc</p>
                            <p className="font-bold text-midnight-indigo">{fmt(meeting?.endTime)}</p>
                        </div>
                    </div>
                    {meeting?.recordingActive && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Cuộc họp đang được ghi hình
                        </div>
                    )}
                </div>

                {/* Chương trình */}
                {meeting?.agenda?.length > 0 && (
                    <div className="bg-white border border-platinum-tint rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-platinum-tint bg-cloud-mist flex items-center gap-2 text-[10px] font-extrabold text-slate-blue uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5" /> Chương trình ({meeting.agenda.length} mục)
                        </div>
                        <div className="divide-y divide-platinum-tint">
                            {meeting.agenda.map((item, i) => {
                                const ag = AGENDA_STATUS[item.status] || AGENDA_STATUS.planned;
                                return (
                                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                                        <span className="text-[10px] font-bold text-slate-blue w-5 shrink-0">{item.order}.</span>
                                        <span className={`flex-1 text-sm font-semibold ${item.status === 'skipped' ? 'line-through text-slate-blue' : 'text-midnight-indigo'}`}>
                                            {item.title}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${ag.cls}`}>
                                            {ag.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Người tham dự */}
                {meeting?.participants?.length > 0 && (
                    <div className="bg-white border border-platinum-tint rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-platinum-tint bg-cloud-mist flex items-center gap-2 text-[10px] font-extrabold text-slate-blue uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" /> Người tham dự ({meeting.participants.length})
                        </div>
                        <div className="divide-y divide-platinum-tint max-h-48 overflow-y-auto">
                            {meeting.participants.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-action-blue flex items-center justify-center text-[10px] font-extrabold shrink-0">
                                        {(p.fullName || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-midnight-indigo">{p.fullName}</p>
                                        {p.organizationName && (
                                            <p className="text-[10px] text-slate-blue">{p.organizationName}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ghi chú được chia sẻ */}
                {meeting?.sharedNotes?.length > 0 && (
                    <div className="bg-white border border-platinum-tint rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-platinum-tint bg-cloud-mist flex items-center gap-2 text-[10px] font-extrabold text-slate-blue uppercase tracking-wider">
                            <StickyNote className="w-3.5 h-3.5" /> Ghi chú được chia sẻ
                        </div>
                        <div className="divide-y divide-platinum-tint">
                            {meeting.sharedNotes.map((note, i) => (
                                <div key={i} className="px-5 py-3 space-y-1">
                                    <p className="text-sm text-midnight-indigo">{note.content}</p>
                                    <p className="text-[10px] text-slate-blue">{fmt(note.createdAt)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer poll indicator */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-blue/60 pb-4">
                    <RefreshCw className="w-3 h-3" />
                    {lastUpdated ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN')} · tự làm mới mỗi ${POLL_INTERVAL / 1000}s` : 'Đang tải...'}
                </div>
            </main>
        </div>
    );
};

export default GuestMeeting;
