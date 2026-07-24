import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { changePassword } from '../service/authService';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Validation
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ các trường.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            setError('Mật khẩu mới không được giống mật khẩu hiện tại.');
            return;
        }

        setLoading(true);
        try {
            const res = await changePassword(formData.oldPassword, formData.newPassword);
            if (res?.success) {
                setSuccessMessage('Đổi mật khẩu thành công!');
                // Clear form
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                // Tự đóng sau 2 giây
                setTimeout(() => {
                    onClose();
                    setSuccessMessage(null);
                }, 2000);
            } else {
                setError(res?.error?.message || res?.message || 'Đổi mật khẩu thất bại.');
            }
        } catch (err) {
            setError(err?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-xl max-w-md w-full flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                    <h3 className="font-bold text-midnight-indigo flex items-center gap-2">
                        <Lock className="w-5 h-5 text-action-blue" />
                        Đổi mật khẩu
                    </h3>
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="text-slate-blue hover:text-midnight-indigo transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start text-sm animate-fade-in-up">
                            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start text-sm font-medium animate-fade-in-up">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <p>{successMessage}</p>
                        </div>
                    )}

                    {/* Old Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                required 
                                type={showOldPassword ? "text" : "password"} 
                                value={formData.oldPassword} 
                                onChange={e => setFormData({...formData, oldPassword: e.target.value})} 
                                className="w-full pl-3 pr-10 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" 
                                placeholder="Nhập mật khẩu hiện tại" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-blue hover:text-midnight-indigo"
                            >
                                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                required 
                                type={showNewPassword ? "text" : "password"} 
                                value={formData.newPassword} 
                                onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                                className="w-full pl-3 pr-10 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" 
                                placeholder="Nhập mật khẩu mới" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-blue hover:text-midnight-indigo"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-blue mt-1">Tối thiểu 8 ký tự.</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                required 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={formData.confirmPassword} 
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                className="w-full pl-3 pr-10 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" 
                                placeholder="Nhập lại mật khẩu mới" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-blue hover:text-midnight-indigo"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-platinum-tint">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold text-slate-blue border border-platinum-tint rounded-xl hover:bg-cloud-mist disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold text-white bg-action-blue rounded-xl hover:bg-glacier-blue disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ChangePasswordModal;
