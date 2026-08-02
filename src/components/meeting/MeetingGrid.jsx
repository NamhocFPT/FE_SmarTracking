import { Mic, MicOff, Edit2, VideoOff } from 'lucide-react';
import UserAvatar from '../../component/UserAvatar';

/**
 * Số cột lưới tính theo số người tham gia thực tế — không còn giới hạn cứng 6 "ghế"
 * như bản mô phỏng bàn họp cũ. Xem docs/inmeeting-room-redesign-context.md.
 */
const getGridColsClass = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
};

const roleBadgeClass = (role) => {
    if (role === 'Host') return 'bg-action-blue/90 text-white';
    if (role === 'Khách') return 'bg-emerald-500/90 text-white';
    return 'bg-white/90 text-midnight-indigo';
};

const MeetingTile = ({
    participant: p,
    isSelf,
    isVideoOn,
    isHost,
    onMuteToggle,
    onRename,
    reactionEmoji,
}) => {
    const showMicBadge = p.isMuted || p.isSpeaking;

    return (
        <div
            className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-cloud-mist border transition-all ${
                p.isSpeaking
                    ? 'border-action-blue ring-2 ring-action-blue/70 shadow-[0_0_0_4px_rgba(0,107,255,0.08)]'
                    : 'border-platinum-tint'
            }`}
        >
            {/* Nội dung tile: video thật cho chính mình, ảnh/avatar cho người khác */}
            {isSelf && isVideoOn && !p.isCameraOff ? (
                <video
                    id={`video-${p.id}`}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />
            ) : p.isCameraOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-pale-gray">
                    <UserAvatar
                        user={p}
                        className="w-14 h-14 rounded-full font-bold text-lg shadow-sm"
                    />
                    <span className="text-[11px] font-semibold text-slate-blue flex items-center gap-1">
                        <VideoOff className="w-3.5 h-3.5" /> Camera đã tắt
                    </span>
                </div>
            ) : (
                <UserAvatar
                    user={p}
                    imageClassName="object-cover"
                    className="w-full h-full font-bold text-3xl"
                />
            )}

            {/* Badge mic: chỉ hiện khi đang tắt tiếng hoặc đang phát biểu, tránh rối mắt */}
            {showMicBadge && (
                <div
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                        p.isMuted ? 'bg-red-500 text-white' : 'bg-action-blue text-white'
                    }`}
                >
                    {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </div>
            )}

            {/* Tên + vai trò */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 max-w-[calc(100%-20px)]">
                <button
                    type="button"
                    onClick={() => {
                        if (isSelf) onRename?.(p.id, p.fullName, true);
                        else if (isHost) onRename?.(p.id, p.fullName, false);
                    }}
                    className="bg-midnight-indigo/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full truncate flex items-center gap-1 max-w-[140px]"
                >
                    <span className="truncate">{isSelf ? `${p.fullName} (Bạn)` : p.fullName}</span>
                    {(isSelf || isHost) && <Edit2 className="w-3 h-3 shrink-0 opacity-70" />}
                </button>
                <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${roleBadgeClass(p.role)}`}>
                    {p.role}
                </span>
            </div>

            {/* Điều khiển nhanh của Host khi hover (không hiện trên tile của chính Host) */}
            {isHost && !isSelf && (
                <div className="absolute inset-0 bg-midnight-indigo/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => onMuteToggle?.(p.id, p.isMuted)}
                        className={`p-2 rounded-full text-white transition-colors ${p.isMuted ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                        title={p.isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                    >
                        {p.isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onRename?.(p.id, p.fullName, false)}
                        className="p-2 rounded-full bg-white/90 hover:bg-white text-midnight-indigo"
                        title="Đổi tên"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Cảm xúc thả nổi neo theo đúng tile của người gửi */}
            {reactionEmoji && (
                <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-20">
                    <span className="text-3xl animate-float-up">{reactionEmoji}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Lưới hiển thị người tham gia — số cột tự tính theo participants.length,
 * thay cho cơ chế "6 ghế cố định quanh bàn ảo" trước đây.
 */
const MeetingGrid = ({
    participants = [],
    myParticipantId,
    isHost,
    isVideoOn,
    onHostMuteToggle,
    onRename,
    reactionsByParticipantId = {},
}) => {
    const colsClass = getGridColsClass(participants.length);

    return (
        <div className={`grid ${colsClass} gap-4 w-full content-start auto-rows-max overflow-y-auto pr-1`}>
            {participants.map((p) => (
                <MeetingTile
                    key={p.id}
                    participant={p}
                    isSelf={p.id === myParticipantId}
                    isVideoOn={isVideoOn}
                    isHost={isHost}
                    onMuteToggle={onHostMuteToggle}
                    onRename={onRename}
                    reactionEmoji={reactionsByParticipantId[p.id]}
                />
            ))}
        </div>
    );
};

export default MeetingGrid;
