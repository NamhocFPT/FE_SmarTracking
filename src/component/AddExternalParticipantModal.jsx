import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    UserPlus, X, CheckCircle, AlertTriangle, Loader2, Mail, Phone, Building
} from 'lucide-react';
import { addExternalParticipant } from '../service/businessAdminServices';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AddExternalParticipantModal — M8.5
 * Luồng: POST /meetings/:meetingId/participants/external
 * Payload: { fullName, email, organizationName?, phoneNumber? }
 */
const AddExternalParticipantModal = ({ meetingId, open, onClose, onSuccess }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setFullName('');
            setEmail('');
            setOrganizationName('');
            setPhoneNumber('');
            setError(null);
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName.trim() || !email.trim()) {
            setError('Họ tên và email là bắt buộc.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await addExternalParticipant(meetingId, {
                fullName: fullName.trim(),
                email: email.trim(),
                organizationName: organizationName.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
            });

            if (res?.success) {
                onSuccess?.('Đã mời khách ngoài thành công!');
                onClose();
            } else {
                setError(res?.message || 'Không thể thêm khách ngoài. Vui lòng thử lại.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-platinum-tint"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                            <UserPlus className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-midnight-indigo text-sm">Mời khách ngoài tổ chức</h3>
                            <p className="text-[10px] text-slate-blue mt-0.5">Thêm thông tin khách mời bên ngoài hệ thống</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1">Họ và tên khách mời <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                placeholder="Nguyễn Văn A"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full px-3.5 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1">Địa chỉ Email <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-blue/60 absolute left-3.5 top-2.5" />
                                <input
                                    type="email"
                                    required
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue"
                                />
                            </div>
                        </div>

                        {/* Organization */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1">Tên tổ chức / Công ty</label>
                            <div className="relative">
                                <Building className="w-4 h-4 text-slate-blue/60 absolute left-3.5 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Công ty đối tác"
                                    value={organizationName}
                                    onChange={e => setOrganizationName(e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-blue uppercase mb-1">Số điện thoại</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-blue/60 absolute left-3.5 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="0901234567"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2 border border-platinum-tint rounded-xl text-xs focus:outline-none focus:border-action-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/30 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-500 bg-white border border-platinum-tint hover:bg-slate-50 rounded-xl transition-all">
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-action-blue hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Mời khách
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    );
};

export default AddExternalParticipantModal;
