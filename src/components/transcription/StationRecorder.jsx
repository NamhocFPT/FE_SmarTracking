import React, { useState } from 'react';
import { Mic, Square, Loader2, UserPlus, X, Check } from 'lucide-react';
import { useStationRecording } from '../../hooks/useStationRecording';

const StationRecorder = ({ meetingId, participants, onUploadSuccess }) => {
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
    } = useStationRecording(meetingId);

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
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-platinum-tint p-4 rounded-2xl shadow-sm">
            {/* Control Button */}
            <div>
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                        Bắt đầu ghi âm
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                        </div>
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-colors"
                        >
                            <Square className="w-4 h-4" fill="currentColor" />
                            Dừng ghi
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-xs font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Speaker Marker Section */}
            {isRecording && (
                <div className="flex-1 flex items-center justify-end gap-3 border-l border-platinum-tint pl-4 ml-2">
                    {showToast && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md animate-fade-in-up">
                            <Check className="w-3.5 h-3.5" />
                            Đã gán
                        </div>
                    )}
                    
                    <div className="text-xs font-semibold text-slate-blue bg-cloud-mist px-2 py-1 rounded-md">
                        Đã đánh dấu: <span className="font-bold text-midnight-indigo">{marksCount}</span>
                    </div>

                    {!showParticipantSelect ? (
                        <button
                            onClick={() => setShowParticipantSelect(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-action-blue text-white hover:bg-glacier-blue rounded-xl font-bold transition-colors text-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            Đánh dấu người nói
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <select
                                value={selectedParticipant}
                                onChange={(e) => setSelectedParticipant(e.target.value)}
                                className="text-sm font-semibold border-platinum-tint focus:border-action-blue focus:ring-action-blue rounded-xl py-2 pl-3 pr-8 bg-cloud-mist"
                            >
                                <option value="">-- Chọn người dự họp --</option>
                                {participants?.map(p => (
                                    <option key={p.id || p.userId || p.user_id} value={p.id || p.userId || p.user_id}>
                                        {p.fullName || p.full_name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddMark}
                                disabled={!selectedParticipant}
                                className="p-2 bg-action-blue text-white rounded-xl hover:bg-glacier-blue disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowParticipantSelect(false)}
                                className="p-2 bg-white border border-platinum-tint text-slate-blue rounded-xl hover:bg-cloud-mist"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StationRecorder;
