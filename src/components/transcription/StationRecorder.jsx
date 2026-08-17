import React, { useState } from 'react';
import { Mic, Square, Loader2, UserPlus, X, Check } from 'lucide-react';
import { useStationRecording } from '../../hooks/useStationRecording';

const StationRecorder = ({ meetingId, meetingTitle, participants, onUploadSuccess }) => {
    const [showParticipantSelect, setShowParticipantSelect] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState('');
    const [showToast, setShowToast] = useState(false);

    const {
        isRecording,
        isProcessing,
        error,
        recordingTime,
        marksCount,
        startRecording,
        stopAndUpload,
        addSpeakerMark
    } = useStationRecording(meetingId, meetingTitle);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStop = async () => {
        const res = await stopAndUpload();
        if (res?.success && onUploadSuccess) {
            onUploadSuccess(res.sessionId);
        }
    };

    const handleAddMark = () => {
        if (!selectedParticipant) return;
        const p = participants.find(part => (part.id || part.userId || part.user_id) === selectedParticipant);
        if (p) {
            addSpeakerMark(p);
            setSelectedParticipant('');
            setShowParticipantSelect(false);
            
            // Show temp toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Control Button */}
            <div>
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                        Bắt đầu ghi âm
                    </button>
                ) : (
                    <div className="flex items-center gap-2 w-full p-2 bg-red-50/60 border border-red-100 rounded-lg">
                        <div className="flex-1 flex items-center justify-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="font-mono text-red-600 font-bold text-sm tracking-wide">{formatTime(recordingTime)}</span>
                        </div>
                        <button
                            onClick={handleStop}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-bold transition-colors shadow-sm"
                        >
                            <Square className="w-3 h-3" fill="currentColor" />
                            Dừng
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-[10px] font-semibold bg-red-50 px-2.5 py-1.5 rounded border border-red-100">
                    {error}
                </div>
            )}

            {/* Speaker Marker Section */}
            {isRecording && (
                <div className="flex flex-col gap-2 border-t border-platinum-tint/60 pt-3">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-blue uppercase tracking-wider">
                            Đã đánh dấu: <span className="text-midnight-indigo font-extrabold ml-1">{marksCount}</span>
                        </div>
                        {showToast && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 animate-fade-in-up">
                                <Check className="w-3 h-3" /> Đã gán
                            </div>
                        )}
                    </div>

                    {!showParticipantSelect ? (
                        <button
                            onClick={() => setShowParticipantSelect(true)}
                            className="flex items-center justify-center w-full gap-1.5 px-3 py-2 bg-cloud-mist border border-platinum-tint hover:bg-pale-gray text-midnight-indigo rounded-lg text-[11px] font-bold transition-colors"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Gắn thẻ người nói
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2 animate-fade-in bg-cloud-mist p-2 rounded-lg border border-platinum-tint">
                            <select
                                value={selectedParticipant}
                                onChange={(e) => setSelectedParticipant(e.target.value)}
                                className="w-full text-xs font-semibold border-platinum-tint focus:border-action-blue focus:ring-1 focus:ring-action-blue rounded py-1.5 pl-2 pr-6 bg-white"
                            >
                                <option value="">-- Chọn người đang nói --</option>
                                {participants?.map(p => (
                                    <option key={p.id || p.userId || p.user_id} value={p.id || p.userId || p.user_id}>
                                        {p.fullName || p.full_name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-1.5 w-full">
                                <button
                                    onClick={handleAddMark}
                                    disabled={!selectedParticipant}
                                    className="flex-1 flex items-center justify-center py-1.5 bg-action-blue text-white rounded text-xs font-bold hover:bg-glacier-blue disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5 mr-1" /> Gắn
                                </button>
                                <button
                                    onClick={() => setShowParticipantSelect(false)}
                                    className="flex-1 flex items-center justify-center py-1.5 bg-white border border-platinum-tint text-slate-blue rounded text-xs font-bold hover:bg-pale-gray"
                                >
                                    <X className="w-3.5 h-3.5 mr-1" /> Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StationRecorder;
