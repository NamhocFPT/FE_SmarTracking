import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Edit2, Mic, MicOff } from 'lucide-react';
import UserAvatar from '../../component/UserAvatar';

/**
 * Custom Hook: Sắp xếp người tham gia theo thứ tự ưu tiên (Host > Đang nói)
 * Kết hợp Hysteresis (Cooldown 2s) để chống giật layout khi có tiếng ồn ngắt quãng.
 */
const usePriorityParticipants = (participants) => {
    const [speakingMap, setSpeakingMap] = useState({});

    useEffect(() => {
        const now = Date.now();
        setSpeakingMap(prev => {
            let changed = false;
            const next = { ...prev };
            
            participants.forEach(p => {
                if (p.isSpeaking) {
                    next[p.id] = now + 2000; // Cooldown 2s
                    changed = true;
                }
            });
            
            Object.keys(next).forEach(id => {
                if (next[id] < now) {
                    delete next[id];
                    changed = true;
                }
            });

            return changed ? next : prev;
        });
    }, [participants]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setSpeakingMap(prev => {
                let changed = false;
                const next = { ...prev };
                Object.keys(next).forEach(id => {
                    if (next[id] < now) {
                        delete next[id];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const sorted = useMemo(() => {
        return [...participants].sort((a, b) => {
            // 1. Host lên đầu
            const isAHost = a.role === 'Chủ tọa' || a.role === 'Host';
            const isBHost = b.role === 'Chủ tọa' || b.role === 'Host';
            if (isAHost && !isBHost) return -1;
            if (!isAHost && isBHost) return 1;
            
            // 2. Active Speaker
            const aSpeaking = !!speakingMap[a.id] || a.isSpeaking;
            const bSpeaking = !!speakingMap[b.id] || b.isSpeaking;
            if (aSpeaking && !bSpeaking) return -1;
            if (!aSpeaking && bSpeaking) return 1;
            
            return 0;
        });
    }, [participants, speakingMap]);

    return sorted;
};

/**
 * Custom Hook: Thuật toán tối đa hóa diện tích (Grid Area Math)
 * Tính toán số cột c* tối ưu nhất để lấp đầy màn hình với tỷ lệ 16:9
 */
const useGridMath = (containerRef, count) => {
    const [gridParams, setGridParams] = useState({ cols: 1, tileW: 0, tileH: 0 });

    useEffect(() => {
        if (!containerRef.current || count === 0) return;
        
        const observer = new ResizeObserver((entries) => {
            const { width: W, height: H } = entries[0].contentRect;
            const A = count <= 2 ? (4 / 3) : (16 / 9); // Tỷ lệ chuẩn (4:3 cho <= 2 người, 16:9 cho > 2)
            const gap = 12; // Khoảng cách giữa các ô (px)
            
            let maxArea = 0;
            let bestCols = 1;
            let bestW = 0;
            let bestH = 0;

            for (let c = 1; c <= count; c++) {
                const r = Math.ceil(count / c);
                const w_cell = Math.max(0, W - (c - 1) * gap) / c;
                const h_cell = Math.max(0, H - (r - 1) * gap) / r;
                
                let w_prime, h_prime;
                if (w_cell / h_cell > A) {
                    h_prime = h_cell;
                    w_prime = h_cell * A;
                } else {
                    w_prime = w_cell;
                    h_prime = w_cell / A;
                }
                
                const area = w_prime * h_prime * count;
                if (area > maxArea) {
                    maxArea = area;
                    bestCols = c;
                    bestW = w_prime;
                    bestH = h_prime;
                }
            }
            setGridParams({ cols: bestCols, tileW: Math.floor(bestW), tileH: Math.floor(bestH) });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [count]);

    return gridParams;
};

const roleBadgeClass = (role) => {
    if (role === 'Host' || role === 'Chủ tọa') return 'bg-action-blue/90 text-white';
    if (role === 'Khách mời' || role === 'Khách') return 'bg-emerald-500/90 text-white';
    return 'bg-white/80 text-midnight-indigo';
};

const MeetingTile = ({
    participant: p,
    isSelf,
    isHost,
    onMuteToggle,
    onRename,
    reactionEmoji,
    large,
}) => {
    const isActuallySpeaking = p.isSpeaking && !p.isMuted;
    const showMicBadge = p.isMuted || isActuallySpeaking;
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        let interval;
        if (isActuallySpeaking) {
            setAudioLevel(Math.floor(Math.random() * 50) + 50);
            interval = setInterval(() => {
                setAudioLevel(Math.floor(Math.random() * 80) + 20); // 20 to 100
            }, 150);
        } else {
            setAudioLevel(0);
        }
        return () => clearInterval(interval);
    }, [isActuallySpeaking]);

    const speakingOpacity = audioLevel ? 0.3 + (audioLevel / 100) * 0.7 : 0;
    const shadowSize = audioLevel ? (audioLevel / 100) * 15 : 0;

    return (
        <div
            className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${
                isActuallySpeaking
                    ? 'border-2 border-red-500'
                    : 'border border-white/10'
            }`}
            style={{
                boxShadow: isActuallySpeaking ? `0 0 ${shadowSize}px rgba(239, 68, 68, 0.5)` : 'none'
            }}
        >
            {/* Avatar / Background */}
            <div className="absolute inset-0 bg-slate-800">
                <UserAvatar
                    user={p}
                    imageClassName="object-cover"
                    className={`w-full h-full font-bold ${large ? 'text-5xl' : 'text-3xl'}`}
                />
            </div>

            {/* Speaking volume overlay */}
            {isActuallySpeaking && (
                <div 
                    className="absolute inset-0 border-[4px] border-red-500 rounded-2xl pointer-events-none transition-all duration-150 ease-out z-10" 
                    style={{
                        opacity: speakingOpacity,
                        transform: `scale(${1 + (audioLevel / 100) * 0.02})`
                    }}
                />
            )}

            {/* Mic badge */}
            {showMicBadge && (
                <div className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10 ${
                    p.isMuted ? 'bg-red-500 text-white' : 'bg-action-blue text-white'
                }`}>
                    {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </div>
            )}

            {/* Name + role */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between z-10">
                <button
                    type="button"
                    onClick={() => {
                        if (isSelf) onRename?.(p.id, p.fullName, true);
                        else if (isHost) onRename?.(p.id, p.fullName, false);
                    }}
                    className="flex items-center gap-1.5 max-w-[70%] group"
                >
                    <span className="text-white font-bold text-[11px] truncate drop-shadow">
                        {isSelf ? `${p.fullName} (Bạn)` : p.fullName}
                    </span>
                    {(isSelf || isHost) && (
                        <Edit2 className="w-2.5 h-2.5 text-white/60 group-hover:text-white shrink-0 transition-colors" />
                    )}
                </button>
                <span className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0 ${roleBadgeClass(p.role)}`}>
                    {p.role}
                </span>
            </div>

            {/* Host quick controls on hover */}
            {isHost && !isSelf && (
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-20">
                    <button
                        type="button"
                        onClick={() => onMuteToggle?.(p.id, p.isMuted)}
                        className={`p-2.5 rounded-full text-white transition-colors shadow-lg ${p.isMuted ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                        title={p.isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                    >
                        {p.isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onRename?.(p.id, p.fullName, false)}
                        className="p-2.5 rounded-full bg-white/90 hover:bg-white text-midnight-indigo shadow-lg"
                        title="Đổi tên"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Floating reaction */}
            {reactionEmoji && (
                <div className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none z-30">
                    <span className="text-3xl animate-float-up">{reactionEmoji}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Grid participants — layout thích ứng động theo:
 *   - số người (count)
 *   - sidebar có mở không (sidebarOpen)
 * Dùng CSS repeat() + minmax() để grid tự điều chỉnh khi container resize.
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
    const containerRef = useRef(null);
    const count = participants.length;
    
    const sortedParticipants = usePriorityParticipants(participants);
    const { cols, tileW, tileH } = useGridMath(containerRef, count);

    // Special case: single participant → center + large
    if (count === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                Chưa có thành viên nào trong phòng.
            </div>
        );
    }

    if (count === 1) {
        return (
            <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
                {tileW > 0 && (
                    <div style={{ width: tileW, height: tileH }}>
                        <MeetingTile
                            participant={sortedParticipants[0]}
                            isSelf={sortedParticipants[0].id === myParticipantId}
                            isHost={isHost}
                            onMuteToggle={onHostMuteToggle}
                            onRename={onRename}
                            reactionEmoji={reactionsByParticipantId[sortedParticipants[0].id]}
                            large
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden p-3 flex items-center justify-center transition-all duration-300"
        >
            {tileW > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignContent: 'center',
                        gap: '12px',
                        maxWidth: `${cols * tileW + (cols - 1) * 12}px`,
                    }}
                >
                    {sortedParticipants.map((p) => (
                        <div key={p.id} style={{ width: tileW, height: tileH, flexShrink: 0 }}>
                            <MeetingTile
                                participant={p}
                                isSelf={p.id === myParticipantId}
                                isHost={isHost}
                                isVideoOn={isVideoOn}
                                onMuteToggle={onHostMuteToggle}
                                onRename={onRename}
                                reactionEmoji={reactionsByParticipantId[p.id]}
                                large={count <= 2}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeetingGrid;
