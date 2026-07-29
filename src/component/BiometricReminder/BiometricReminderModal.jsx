import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getBiometricStatus, submitBiometric, updateSelfAvatar } from '../../service/avatarService';
import { Shield, Camera, Image, ArrowLeft, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABEL = {
    not_uploaded: { label: 'Chưa nộp ảnh', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
    pending_review: { label: 'Đang chờ duyệt', badge: 'bg-blue-50 text-action-blue border border-blue-200' },
    rejected: { label: 'Bị từ chối', badge: 'bg-red-50 text-red-700 border border-red-200' },
    approved: { label: 'Đã duyệt', badge: 'bg-green-50 text-green-700 border border-green-200' },
};

const BiometricReminderModal = () => {
    const [open, setOpen] = useState(false);
    const [biometricData, setBiometricData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal state machine: 'options', 'confirm_avatar', 'webcam', 'confirm_avatar_sync', 'success'
    const [view, setView] = useState('options');
    const [consentAgreed, setConsentAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Current logged-in user profile info
    const [userProfile, setUserProfile] = useState(null);

    // Webcam capture states
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [webcamStep, setWebcamStep] = useState('aligning'); // 'aligning', 'too_far', 'too_close', 'perfect', 'countdown', 'captured'
    const [countdownVal, setCountdownVal] = useState(3);
    const [capturedBlob, setCapturedBlob] = useState(null);
    const [capturedFile, setCapturedFile] = useState(null);
    const [capturedPreview, setCapturedPreview] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    // Load user and check biometric requirement
    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) { setLoading(false); return; }
                const user = JSON.parse(userStr);
                setUserProfile(user);
                const userId = user.id || 'anon';

                const dismissed = sessionStorage.getItem('biometricPopupDismissed_' + userId);
                if (dismissed === 'true') { setLoading(false); return; }

                const res = await getBiometricStatus();
                if (cancelled) return;
                if (res?.success && res.data) {
                    const data = res.data;
                    setBiometricData(data);
                    if (data.shouldShowBiometricPopup === true) {
                        setOpen(true);
                    }
                }
            } catch {
                // Silent fail
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        check();
        return () => { cancelled = true; };
    }, []);

    // Stop webcam helper
    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraStream(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };



    const handleDismiss = () => {
        try {
            if (userProfile) {
                sessionStorage.setItem('biometricPopupDismissed_' + (userProfile.id || 'anon'), 'true');
            }
        } catch {}
        stopWebcam();
        setOpen(false);
    };

    const handleUploadSuccess = () => {
        try {
            if (userProfile) {
                userProfile.biometricReviewStatus = 'pending_review';
                userProfile.shouldShowBiometricPopup = false;
                localStorage.setItem('user', JSON.stringify(userProfile));
                window.dispatchEvent(new Event('storage'));
            }
        } catch {}
        stopWebcam();
        setOpen(false);
    };

    // Option 1: Existing avatar submission
    const handleUseExistingAvatar = async () => {
        if (!userProfile?.avatarUrl) return;
        setSubmitting(true);
        setError(null);
        try {
            const response = await fetch(userProfile.avatarUrl);
            const blob = await response.blob();
            const file = new File([blob], 'avatar_biometric.jpg', { type: blob.type || 'image/jpeg' });

            const res = await submitBiometric(file, true);
            if (res?.success) {
                handleUploadSuccess();
            } else {
                setError(res?.error?.message || 'Gửi ảnh sinh trắc học thất bại.');
            }
        } catch (err) {
            setError('Không thể tải ảnh đại diện hiện tại. Vui lòng sử dụng tính năng Chụp ảnh bằng Webcam.');
        } finally {
            setSubmitting(false);
        }
    };

    // Option 2: Live webcam capture screen flow
    const startWebcam = async () => {
        setCameraError(null);
        setCapturedBlob(null);
        setCapturedPreview(null);
        setCapturedFile(null);
        setWebcamStep('aligning');
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            streamRef.current = stream;
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Run interactive simulated biometric scanner sequence
            runWebcamGuideSequence();
        } catch (err) {
            setCameraError('Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera cho trình duyệt.');
        }
    };

    // Clean up and initialize webcam on view change or modal close
    useEffect(() => {
        if (view === 'webcam' && open) {
            startWebcam();
        } else {
            stopWebcam();
        }
        return () => {
            stopWebcam();
        };
    }, [view, open]);

    // Bind stream to video element when stream is ready
    useEffect(() => {
        if (cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    const runWebcamGuideSequence = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setWebcamStep('aligning');

        let duration = 0;
        timerRef.current = setInterval(() => {
            duration += 1;
            if (duration === 3) {
                setWebcamStep('too_far');
            } else if (duration === 6) {
                setWebcamStep('too_close');
            } else if (duration === 9) {
                setWebcamStep('perfect');
            } else if (duration === 11) {
                setWebcamStep('countdown');
                startCaptureCountdown();
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }, 1000);
    };

    const startCaptureCountdown = () => {
        let count = 3;
        setCountdownVal(3);
        const interval = setInterval(() => {
            count -= 1;
            setCountdownVal(count);
            if (count === 0) {
                clearInterval(interval);
                capturePhoto();
            }
        }, 1000);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        // Mirror the canvas image to match webcam preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'biometric_webcam.jpg', { type: 'image/jpeg' });
                setCapturedBlob(blob);
                setCapturedFile(file);
                setCapturedPreview(URL.createObjectURL(blob));
                setWebcamStep('captured');
                stopWebcam();
            }
        }, 'image/jpeg', 0.95);
    };

    const handleWebcamSubmit = async () => {
        if (!capturedFile) return;
        if (!consentAgreed) {
            setError('Bạn cần đồng ý cho phép sử dụng ảnh cho mục đích sinh trắc học.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await submitBiometric(capturedFile, true);
            if (res?.success) {
                // If user doesn't have an avatar, show synchronization option
                if (!userProfile?.avatarUrl) {
                    setView('confirm_avatar_sync');
                } else {
                    handleUploadSuccess();
                }
            } else {
                setError(res?.error?.message || 'Gửi ảnh sinh trắc học thất bại.');
            }
        } catch (err) {
            setError(err?.error?.message || 'Gửi ảnh sinh trắc học thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Synchronize captured biometric photo to display avatar
    const handleSyncAvatar = async (sync) => {
        if (sync && capturedFile) {
            setSubmitting(true);
            try {
                const res = await updateSelfAvatar(capturedFile);
                if (res?.success && res.data?.avatarUrl) {
                    const newUrl = res.data.avatarUrl;
                    if (userProfile) {
                        userProfile.avatarUrl = newUrl;
                        localStorage.setItem('user', JSON.stringify(userProfile));
                        window.dispatchEvent(new Event('storage'));
                    }
                }
            } catch (err) {
                console.error('Failed to sync avatar:', err);
            } finally {
                setSubmitting(false);
            }
        }
        handleUploadSuccess();
    };

    if (!open || loading) return null;

    const status = biometricData?.biometricReviewStatus || 'not_uploaded';
    const statusInfo = STATUS_LABEL[status] || STATUS_LABEL.not_uploaded;

    const hasAvatar = !!userProfile?.avatarUrl;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-platinum-tint flex flex-col max-h-[95vh] animate-fade-in-up">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/30">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-action-blue/10 flex items-center justify-center text-action-blue">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-midnight-indigo text-base">Cấu hình Sinh trắc học FaceID</h3>
                            <span className={`inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusInfo.badge}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>
                    {view !== 'confirm_avatar_sync' && (
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="p-2 text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Content body */}
                <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between">
                    
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-shake">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* PHASE 1: Choice Selection */}
                    {view === 'options' && (
                        <div className="space-y-5 py-2">
                            <p className="text-sm text-slate-blue leading-relaxed">
                                Để tham gia chấm công tự động bằng hệ thống Camera AI, bạn cần cung cấp một ảnh sinh trắc học rõ nét khuôn mặt và được ban quản trị phê duyệt.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                {/* Option A: Use Avatar */}
                                <div 
                                    onClick={() => hasAvatar && setView('confirm_avatar')}
                                    className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center select-none group h-48 ${
                                        hasAvatar 
                                            ? 'border-platinum-tint hover:border-action-blue hover:bg-action-blue/5 cursor-pointer' 
                                            : 'border-platinum-tint/40 opacity-50 cursor-not-allowed bg-cloud-mist/10'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-cloud-mist border border-platinum-tint flex items-center justify-center">
                                            {hasAvatar ? (
                                                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Image className="w-6 h-6 text-slate-blue/60" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-midnight-indigo text-sm">Sử dụng Ảnh đại diện</h4>
                                            <p className="text-[10px] text-slate-blue mt-1 leading-normal">Lấy trực tiếp ảnh đại diện hiện tại để gửi phê duyệt FaceID</p>
                                        </div>
                                    </div>
                                    {!hasAvatar && (
                                        <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Chưa có avatar</span>
                                    )}
                                </div>

                                {/* Option B: Take Camera */}
                                <div 
                                    onClick={() => setView('webcam')}
                                    className="p-5 rounded-2xl border-2 border-platinum-tint hover:border-action-blue hover:bg-action-blue/5 transition-all flex flex-col items-center justify-between text-center cursor-pointer select-none group h-48"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-action-blue/10 flex items-center justify-center text-action-blue group-hover:scale-105 transition-transform duration-300">
                                            <Camera className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-midnight-indigo text-sm">Chụp ảnh bằng Webcam</h4>
                                            <p className="text-[10px] text-slate-blue mt-1 leading-normal">Chụp ảnh trực tiếp có hướng dẫn AI giúp tối ưu độ nét nhận diện</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-action-blue font-bold bg-action-blue/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Hỗ trợ hướng dẫn</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PHASE 2: Confirm Existing Avatar */}
                    {view === 'confirm_avatar' && (
                        <div className="space-y-5 py-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setView('options')} className="p-1.5 hover:bg-cloud-mist rounded-lg text-slate-blue">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-bold text-slate-blue uppercase tracking-wider">Sử dụng ảnh đại diện hiện tại</span>
                            </div>

                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-action-blue/20 shadow-md">
                                    <img src={userProfile?.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                </div>
                                <p className="text-center text-xs text-slate-blue max-w-sm">
                                    Hệ thống sẽ tải xuống ảnh đại diện hiện tại của bạn và gửi cho quản lý duyệt làm ảnh sinh trắc học FaceID.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={consentAgreed}
                                        onChange={(e) => setConsentAgreed(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-steel-gray text-action-blue focus:ring-action-blue/30"
                                    />
                                    <span className="text-xs text-slate-blue leading-relaxed">
                                        Tôi đồng ý cho phép sử dụng hình ảnh này làm ảnh sinh trắc học FaceID phục vụ nhận diện khuôn mặt chấm công.
                                    </span>
                                </label>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleUseExistingAvatar}
                                        disabled={submitting || !consentAgreed}
                                        className="flex-1 py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40"
                                    >
                                        {submitting ? 'Đang gửi...' : 'Xác nhận nộp ảnh'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setView('options')}
                                        className="px-5 py-2.5 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold"
                                    >
                                        Quay lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PHASE 3: Live Webcam Capture Screen */}
                    {view === 'webcam' && (
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {webcamStep !== 'captured' && (
                                        <button 
                                            type="button" 
                                            onClick={() => { stopWebcam(); setView('options'); }} 
                                            className="p-1.5 hover:bg-cloud-mist rounded-lg text-slate-blue"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                    <span className="text-xs font-bold text-slate-blue uppercase tracking-wider">
                                        {webcamStep === 'captured' ? 'Xác nhận ảnh chụp' : 'Giao diện chụp ảnh FaceID'}
                                    </span>
                                </div>
                                {webcamStep !== 'captured' && cameraStream && (
                                    <button 
                                        type="button" 
                                        onClick={startWebcam} 
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-action-blue bg-action-blue/10 px-2.5 py-1 rounded-full hover:bg-action-blue/20 transition-all"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Thiết lập lại
                                    </button>
                                )}
                            </div>

                            {/* Camera Area */}
                            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-platinum-tint flex items-center justify-center">
                                {cameraError ? (
                                    <div className="p-6 text-center text-rose-400 text-xs flex flex-col items-center gap-2">
                                        <AlertCircle className="w-8 h-8" />
                                        <p>{cameraError}</p>
                                        <button type="button" onClick={startWebcam} className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-bold">Thử lại</button>
                                    </div>
                                ) : webcamStep === 'captured' && capturedPreview ? (
                                    <img src={capturedPreview} alt="Captured Snapshot" className="w-full h-full object-cover" />
                                ) : cameraStream ? (
                                    <>
                                        <video 
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
                                                webcamStep === 'aligning' ? 'blur-md brightness-50' : ''
                                            }`}
                                        />

                                        {/* Biometric Scan Overlay Target Guides */}
                                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                                            {/* Oval Frame Mask */}
                                            <div className={`w-48 h-64 sm:w-56 sm:h-72 rounded-[50%] border-4 transition-all duration-500 relative flex items-center justify-center ${
                                                webcamStep === 'aligning' ? 'border-dashed border-red-500 scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                                                webcamStep === 'too_far' ? 'border-dashed border-yellow-500 scale-[0.8] shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                                                webcamStep === 'too_close' ? 'border-dashed border-yellow-500 scale-[1.25] shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                                                'border-solid border-emerald-500 scale-100 shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-pulse-soft'
                                            }`}>
                                                
                                                {/* High-tech Horizontal Scanning line */}
                                                {(webcamStep === 'perfect' || webcamStep === 'countdown') && (
                                                    <div className="absolute inset-x-0 h-0.5 bg-emerald-400/80 shadow-[0_0_10px_#34d399] animate-scanner" />
                                                )}

                                                {/* Oval target dots */}
                                                <div className="absolute top-0 w-2.5 h-2.5 bg-emerald-500 rounded-full -translate-y-1.5" />
                                                <div className="absolute bottom-0 w-2.5 h-2.5 bg-emerald-500 rounded-full translate-y-1.5" />
                                                <div className="absolute left-0 w-2.5 h-2.5 bg-emerald-500 rounded-full -translate-x-1.5" />
                                                <div className="absolute right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full translate-x-1.5" />
                                            </div>

                                            {/* Guided HUD Text overlay on top of video */}
                                            <div className="absolute bottom-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-center max-w-[85%] border border-white/10">
                                                <p className="text-[11px] font-bold text-white tracking-wide uppercase">
                                                    {webcamStep === 'aligning' && '⚠️ VUI LÒNG ĐƯA MẶT VÀO VÒNG TRÒN (MỜ BẢN CHỤP)'}
                                                    {webcamStep === 'too_far' && '⚠️ CHƯA ĐỦ GẦN - HÃY DI CHUYỂN LẠI GẦN HƠN'}
                                                    {webcamStep === 'too_close' && '⚠️ QUÁ GẦN - HÃY LÙI XA HƠN MỘT CHÚT'}
                                                    {webcamStep === 'perfect' && '✅ CỰ LY ĐẠT CHUẨN! GIỮ YÊN KHUÔN MẶT...'}
                                                    {webcamStep === 'countdown' && `📸 CHUẨN BỊ CHỤP TRONG ${countdownVal}s`}
                                                </p>
                                            </div>

                                            {/* Countdown overlay indicator */}
                                            {webcamStep === 'countdown' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                                    <motion.span 
                                                        key={countdownVal}
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1.2, opacity: 1 }}
                                                        className="text-6xl font-black text-emerald-400 drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]"
                                                    >
                                                        {countdownVal}
                                                    </motion.span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-12 text-center text-slate-blue flex flex-col items-center gap-2">
                                        <RefreshCw className="w-8 h-8 text-action-blue animate-spin" />
                                        <span className="text-xs font-semibold mt-2">Đang kết nối webcam...</span>
                                    </div>
                                )}
                            </div>

                            <canvas ref={canvasRef} className="hidden" />

                            {/* Controls and Submission */}
                            {webcamStep === 'captured' ? (
                                <div className="space-y-4 pt-1">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consentAgreed}
                                            onChange={(e) => setConsentAgreed(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded border-steel-gray text-action-blue focus:ring-action-blue/30"
                                        />
                                        <span className="text-xs text-slate-blue leading-relaxed">
                                            Tôi đồng ý cho phép sử dụng hình ảnh vừa chụp này làm ảnh sinh trắc học FaceID.
                                        </span>
                                    </label>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleWebcamSubmit}
                                            disabled={submitting || !consentAgreed}
                                            className="flex-1 py-2.5 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40"
                                        >
                                            {submitting ? 'Đang gửi...' : 'Nộp ảnh sinh trắc học'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={startWebcam}
                                            className="px-5 py-2.5 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold"
                                        >
                                            Chụp lại
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-[10.5px] text-slate-blue border border-platinum-tint p-3 rounded-xl bg-cloud-mist/20">
                                    <span>⚠️ Đảm bảo ánh sáng rõ mặt, không đeo khẩu trang/kính râm.</span>
                                    <button 
                                        type="button" 
                                        onClick={capturePhoto} 
                                        disabled={!cameraStream}
                                        className="px-3.5 py-1.5 bg-white border border-platinum-tint rounded-lg text-[10px] font-bold text-midnight-indigo hover:bg-cloud-mist disabled:opacity-40"
                                    >
                                        Chụp thủ công
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PHASE 4: Confirm Avatar Sync (displayed if user had NO avatar previously) */}
                    {view === 'confirm_avatar_sync' && (
                        <div className="space-y-5 py-4 text-center">
                            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center mb-2">
                                <Check className="w-8 h-8" />
                            </div>
                            <h4 className="text-base font-bold text-midnight-indigo">Gửi ảnh sinh trắc học thành công!</h4>
                            
                            <p className="text-sm text-slate-blue leading-relaxed max-w-sm mx-auto">
                                Hiện tại bạn chưa thiết lập ảnh đại diện hiển thị trên hệ thống. Bạn có muốn dùng chính ảnh sinh trắc học vừa chụp để làm ảnh đại diện của mình không?
                            </p>

                            <div className="pt-4 flex gap-3 max-w-xs mx-auto">
                                <button
                                    type="button"
                                    onClick={() => handleSyncAvatar(true)}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all"
                                >
                                    Đồng ý sử dụng
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSyncAvatar(false)}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-all"
                                >
                                    Không, để sau
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer disclaimer */}
                {view === 'options' && (
                    <div className="px-6 pb-6 pt-2 border-t border-platinum-tint flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="text-xs font-bold text-slate-blue hover:text-midnight-indigo underline underline-offset-2 transition-all"
                        >
                            Để tôi thực hiện sau
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default BiometricReminderModal;
