import { useId, useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { confirmPasswordReset } from "../../../service/authService";
import AuthFormSkeleton from "../../../component/Skeleton/AuthFormSkeleton";
import AuthLayout from "../../../component/Auth/AuthLayout";
import AuthAlert from "../../../component/Auth/AuthAlert";
import PasswordInput from "../../../component/Auth/PasswordInput";


const strengthSegments = 3;

const getPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 1;
    return Math.min(score, strengthSegments);
};

export const ChangePass = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve email and otp from navigation state
    const email = location.state?.email || "";
    const otp = location.state?.otp || "";

    const newPasswordId = useId();
    const confirmPasswordId = useId();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Initial skeleton loading state
    const [initialLoading, setInitialLoading] = useState(true);

    // API interaction states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Client-side validations
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);

    const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

    // Show skeleton briefly on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const isMinLengthMet = newPassword.length >= 8;
    const isFormValid = isMinLengthMet && passwordsMatch;

    const strengthLabel = strength === 3 ? "Mạnh" : strength === 2 ? "Trung bình" : "Yếu";

    const strengthBars = Array.from({ length: strengthSegments }, (_, index) => ({
        id: index,
        active: index < strength,
    }));

    const validatePasswordStrength = (password) => {
        if (password.length < 8) {
            return "Mật khẩu phải chứa tối thiểu 8 ký tự";
        }
        if (!/[A-Z]/.test(password)) {
            return "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)";
        }
        if (!/[a-z]/.test(password)) {
            return "Mật khẩu phải chứa ít nhất 1 chữ cái thường (a-z)";
        }
        if (!/\d/.test(password)) {
            return "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
        }
        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        setPasswordError(null);
        setConfirmPasswordError(null);
        setError(null);
        setSuccessMsg(null);
        setRequestId(null);

        if (!email || !otp) {
            setError("Thiếu thông tin xác thực. Vui lòng thực hiện lại từ bước gửi mã OTP.");
            return;
        }

        let hasError = false;

        const passwordStrengthErr = validatePasswordStrength(newPassword);
        if (passwordStrengthErr) {
            setPasswordError(passwordStrengthErr);
            hasError = true;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Mật khẩu xác nhận không trùng khớp");
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);

        try {
            // UC-AUTH-03 / UC-AUTH-04 confirm reset password
            const response = await confirmPasswordReset(email, otp, newPassword, confirmPassword);
            
            if (response.success) {
                setSuccessMsg("Đặt lại mật khẩu thành công! Đang quay lại trang đăng nhập...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            console.error("Confirm Reset Password Error:", err);
            const errDetail = err.error || {};
            let message = errDetail.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.";
            const reqId = err.requestId || errDetail.requestId || null;
            
            if (errDetail.code === "WEAK_PASSWORD" || message.includes("mật khẩu") || message.includes("password")) {
                message = "Mật khẩu mới không đạt chuẩn bảo mật";
                setPasswordError("Mật khẩu không đáp ứng quy tắc bảo mật");
            } else if (errDetail.code === "INVALID_OTP" || errDetail.code === "OTP_EXPIRED" || message.includes("OTP")) {
                message = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại.";
            }
            
            setError(message);
            setRequestId(reqId);
        } finally {
            setLoading(false);
        }
    };

    // Show skeleton while loading
    if (initialLoading) {
        return <AuthFormSkeleton variant="changepass" />;
    }

    return (
        <AuthLayout variant="changepass">
            <div className="flex flex-col w-full items-start gap-8">
                <header className="flex flex-col items-start gap-3 w-full">
                    <h1 className="font-gilroy font-bold text-midnight-indigo text-4xl tracking-tight">
                        Đặt lại mật khẩu
                    </h1>
                    <p className="font-sans font-normal text-slate-blue text-base">
                        Vui lòng nhập mật khẩu mới để bảo mật tài khoản của bạn.
                    </p>
                </header>

                <AuthAlert type="error" message={error} requestId={requestId} />
                <AuthAlert type="success" message={successMsg} />

                <form
                    className="flex flex-col w-full items-start gap-6"
                    onSubmit={handleSubmit}
                >
                    {/* New Password Input */}
                    <div className="flex flex-col items-start gap-2 w-full">
                        <label
                            className="sr-only"
                            htmlFor={newPasswordId}
                        >
                            Mật khẩu mới
                        </label>

                        <PasswordInput
                            id={newPasswordId}
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (passwordError) setPasswordError(null);
                            }}
                            error={passwordError}
                            disabled={loading}
                            placeholder="Tối thiểu 8 ký tự..."
                        />
                        
                        {passwordError && (
                            <span className="text-red-500 text-xs font-semibold font-sans mt-1">
                                {passwordError}
                            </span>
                        )}
                    </div>

                    {/* Password Strength Meter */}
                    <div className="flex flex-col items-start gap-1.5 w-full">
                        <div className="flex items-start justify-center gap-1.5 w-full">
                            {strengthBars.map((bar) => (
                                <div
                                    key={bar.id}
                                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                                        bar.active
                                            ? strength === 3
                                                ? "bg-green-500"
                                                : strength === 2
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                            : "bg-platinum-tint"
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-between w-full mt-1 text-xs font-sans">
                            <div className="font-semibold text-slate-blue">
                                Mức độ:{" "}
                                <span className={strength > 0 ? (strength === 3 ? "text-green-600" : strength === 2 ? "text-yellow-600" : "text-red-500") : "text-slate-blue/60"}>
                                    {newPassword ? strengthLabel : "Chưa nhập"}
                                </span>
                            </div>
                            <div className="font-medium text-slate-blue/80">
                                Yêu cầu tối thiểu 8 ký tự
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="flex flex-col items-start gap-2 w-full">
                        <label
                            className="sr-only"
                            htmlFor={confirmPasswordId}
                        >
                            Xác nhận mật khẩu mới
                        </label>

                        <PasswordInput
                            id={confirmPasswordId}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (confirmPasswordError) setConfirmPasswordError(null);
                            }}
                            error={confirmPasswordError}
                            disabled={loading}
                            placeholder="Nhập lại mật khẩu..."
                        />

                        {confirmPasswordError && (
                            <span className="text-red-500 text-xs font-semibold font-sans mt-1">
                                {confirmPasswordError}
                            </span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className={`mt-2 w-full h-14 bg-gradient-to-r from-action-blue to-glacier-blue text-white rounded-full font-sans font-semibold text-base shadow-md shadow-action-blue/20 hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-action-blue focus-visible:ring-offset-2 flex items-center justify-center gap-2 ${loading || !isFormValid ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >

                        {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                </form>
                
                <hr className="w-full border-t border-solid border-platinum-tint" />
                
                <div className="flex flex-col items-center pt-8 pb-0 px-0 relative w-full">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 relative cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-blue rounded-md py-2 px-3 hover:bg-slate-50 transition-colors group"
                    >
                        <span className="relative font-sans text-slate-blue transition-colors text-sm whitespace-nowrap">
                            Quay lại
                        </span>
                        <span className="relative font-sans font-bold text-midnight-indigo group-hover:text-action-blue transition-colors text-sm whitespace-nowrap">
                            Đăng nhập
                        </span>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ChangePass;
