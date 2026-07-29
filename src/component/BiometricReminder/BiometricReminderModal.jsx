import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBiometricStatus } from '../../service/avatarService';
import BiometricUploadForm from './BiometricUploadForm';

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

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) { setLoading(false); return; }
                const user = JSON.parse(userStr);
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
                // Silent fail — don't break UX on network error
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        check();
        return () => { cancelled = true; };
    }, []);

    const handleDismiss = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                sessionStorage.setItem('biometricPopupDismissed_' + (user.id || 'anon'), 'true');
            }
        } catch {}
        setOpen(false);
    };

    const handleUploadSuccess = (data) => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.biometricReviewStatus = 'pending_review';
                user.shouldShowBiometricPopup = false;
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('storage'));
            }
        } catch {}
        setOpen(false);
    };

    if (!open || loading) return null;

    const status = biometricData?.biometricReviewStatus || 'not_uploaded';
    const statusInfo = STATUS_LABEL[status] || STATUS_LABEL.not_uploaded;

    const title = status === 'rejected'
        ? 'Ảnh sinh trắc học FaceID của bạn đã bị từ chối'
        : 'Bạn chưa nộp ảnh sinh trắc học FaceID';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
            <div className="bg-white rounded-2xl shadow-sm-2 w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="px-6 pt-5 pb-2 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-midnight-indigo">{title}</h3>
                        <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusInfo.badge}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1.5 text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-lg transition-colors"
                        aria-label="Đóng"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Message from backend */}
                {biometricData?.message && (
                    <div className="px-6 pb-1">
                        <p className="text-xs text-slate-blue leading-relaxed">{biometricData.message}</p>
                    </div>
                )}

                {/* Body: BiometricUploadForm */}
                <div className="px-6 pb-5 pt-3">
                    <BiometricUploadForm
                        compact
                        onSuccess={handleUploadSuccess}
                        onCancel={handleDismiss}
                    />
                </div>

                {/* Bottom dismiss link (không chặn) */}
                <div className="px-6 pb-5 flex justify-center">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-xs text-slate-blue hover:text-midnight-indigo underline underline-offset-2 transition-colors"
                    >
                        Để sau
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BiometricReminderModal;
