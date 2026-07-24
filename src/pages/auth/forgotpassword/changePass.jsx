import { useId, useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { confirmPasswordReset } from "../../../service/authService";
import AuthFormSkeleton from "../../../component/Skeleton/AuthFormSkeleton";
import backgroundDecorativeElements from "../../../assets/images/background-decorative-elements.svg";
import icon2 from "../../../assets/icons/icon-2.svg";
import icon3 from "../../../assets/icons/icon-3.svg";
import icon4 from "../../../assets/icons/icon-4.svg";
import icon5 from "../../../assets/icons/icon-5.svg";
import backgroundPng from "../../../assets/images/background.png";

const strengthSegments = 3;

const getPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 1;
    return Math.min(score, strengthSegments);
};

const featureCards = [
    {
        id: "support",
        iconSrc: icon3,
        iconAlt: "Phản hồi 24/7",
        iconClassName: "relative w-5 h-4 flex-shrink-0",
        label: "Phản hồi 24/7",
        wrapperClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative flex-grow min-w-0 flex items-center",
        textClassName:
            "[font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[12px] md:text-[13px] tracking-[0] leading-[1.3] text-left block break-words",
    },
    {
        id: "accuracy",
        iconSrc: icon4,
        iconAlt: "Dữ liệu chính xác",
        iconClassName: "relative w-[18px] h-[18px] flex-shrink-0",
        label: "Dữ liệu chính xác",
        wrapperClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative flex-grow min-w-0 flex items-center",
        textClassName:
            "[font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[12px] md:text-[13px] tracking-[0] leading-[1.3] text-left block break-words",
    },
    {
        id: "energy",
        iconSrc: icon5,
        iconAlt: "Tiết kiệm năng lượng",
        iconClassName: "relative w-[17px] h-[16.99px] flex-shrink-0",
        label: "Tiết kiệm năng lượng",
        wrapperClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative flex-grow min-w-0 flex items-center",
        textClassName:
            "[font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[12px] md:text-[13px] tracking-[0] leading-[1.3] text-left block break-words",
    },
];

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
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !, @, #, $, %...)";
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
        <main className="flex flex-col min-h-screen items-center justify-center relative bg-[linear-gradient(0deg,rgba(246,250,255,1)_0%,rgba(246,250,255,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-x-hidden py-12 lg:py-0">
            {/* Blurs and Background Accents */}
            <div className="absolute right-[-20%] bottom-[30%] w-[400px] h-[400px] blur-[20px] [background:radial-gradient(50%_50%_at_50%_50%,rgba(135,177,253,0.1)_0%,rgba(135,177,253,0)_70%)] pointer-events-none" />
            <div className="absolute h-[13.77%] top-[86.23%] left-[10%] w-[234px] bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            <div className="h-[43.15%] top-[56.85%] right-[20%] w-[374px] absolute bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            
            <img
                className="absolute top-0 left-0 w-[30%] max-w-[415px] h-[553px] pointer-events-none select-none opacity-40 lg:opacity-80 z-0"
                alt=""
                src={backgroundDecorativeElements}
                aria-hidden="true"
            />

            {/* Responsive Flex Wrapper */}
            <div className="flex flex-col lg:flex-row w-full max-w-[1080px] items-center justify-center p-6 gap-12 lg:gap-16 z-10">
                {/* Left Column: Form Card */}
                <section
                    className="w-full max-w-[480px] flex items-start"
                    aria-labelledby="reset-password-title"
                >
                    <div className="flex flex-col w-full items-start gap-5 pt-[47px] pb-[47px] px-6 sm:px-12 bg-white rounded-3xl border border-solid border-[#e6eff8] shadow-[0px_10px_30px_#0000000d]">
                        <div className="w-full pt-0 pb-[0.59px] px-0 flex flex-col items-start relative">
                            <h1
                                id="reset-password-title"
                                className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-[#141d23] text-[32px] tracking-[-0.32px] leading-[41.6px]"
                            >
                                Đặt lại mật khẩu
                            </h1>
                        </div>
                        <div className="flex flex-col items-start relative self-stretch w-full">
                            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-sm tracking-[0] leading-[21px]">
                                Vui lòng nhập mật khẩu mới để bảo mật tài khoản của bạn.
                            </p>
                        </div>

                        {/* Error Alert Box */}
                        {error && (
                            <div className="w-full p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200" role="alert">
                                <div className="font-semibold">
                                    {error.includes("Lỗi hệ thống") ? "Lỗi hệ thống" : error.includes("Lỗi mạng") ? "Lỗi kết nối" : "Lỗi yêu cầu"}
                                </div>
                                <div>{error}</div>
                                {requestId && (
                                    <div className="text-[10px] text-red-500 mt-1 font-mono">
                                        RequestId: {requestId}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMsg && (
                            <div className="w-full p-3 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200" role="alert">
                                <div>{successMsg}</div>
                            </div>
                        )}

                        <form
                            className="flex flex-col items-start gap-5 relative self-stretch w-full"
                            onSubmit={handleSubmit}
                        >
                            {/* New Password Input */}
                            <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
                                <label
                                    className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#414754] text-sm tracking-[0.28px] leading-[14px]"
                                    htmlFor={newPasswordId}
                                >
                                    Mật khẩu mới
                                </label>
                                <div className="relative w-full">
                                    <div className={`flex items-start justify-center px-4 py-3.5 relative self-stretch w-full bg-[#f6faff] rounded-xl overflow-hidden border border-solid ${passwordError ? 'border-red-500' : 'border-[#c1c6d7]'} focus-within:border-[#0059bb] focus-within:ring-1 focus-within:ring-[#0059bb]`}>
                                        <input
                                            className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] placeholder:text-gray-500 text-base tracking-[0] leading-[normal] p-0 focus:outline-none pr-8"
                                            id={newPasswordId}
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Tối thiểu 8 ký tự..."
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                if (passwordError) setPasswordError(null);
                                            }}
                                            disabled={loading}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer focus:outline-none rounded hover:bg-neutral-100/50 transition-colors"
                                        disabled={loading}
                                    >
                                        {showNewPassword ? (
                                            <svg className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordError && (
                                    <span className="text-red-500 text-xs font-semibold [font-family:'Inter-SemiBold',Helvetica]">
                                        {passwordError}
                                    </span>
                                )}
                            </div>

                            {/* Password Strength Meter */}
                            <div className="flex flex-col items-start gap-1 pt-1 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
                                <div className="flex items-start justify-center gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
                                    {strengthBars.map((bar) => (
                                        <div
                                            key={bar.id}
                                            className={`relative flex-1 grow h-1.5 rounded-sm transition-colors ${
                                                bar.active
                                                    ? strength === 3
                                                        ? "bg-green-500"
                                                        : strength === 2
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                    : "bg-neutral-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto] mt-1 text-xs">
                                    <div className="font-semibold text-neutral-500">
                                        Mức độ:{" "}
                                        <span className={strength > 0 ? (strength === 3 ? "text-green-600" : strength === 2 ? "text-yellow-600" : "text-red-500") : "text-neutral-400"}>
                                            {newPassword ? strengthLabel : "Chưa nhập"}
                                        </span>
                                    </div>
                                    <div className="font-semibold text-neutral-500">
                                        Yêu cầu tối thiểu 8 ký tự
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
                                <label
                                    className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#414754] text-sm tracking-[0.28px] leading-[14px]"
                                    htmlFor={confirmPasswordId}
                                >
                                    Xác nhận mật khẩu mới
                                </label>
                                <div className="relative w-full">
                                    <div className={`flex items-start justify-center px-4 py-3.5 relative self-stretch w-full bg-[#f6faff] rounded-xl overflow-hidden border border-solid ${confirmPasswordError ? 'border-red-500' : 'border-[#c1c6d7]'} focus-within:border-[#0059bb] focus-within:ring-1 focus-within:ring-[#0059bb]`}>
                                        <input
                                            className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] placeholder:text-gray-500 text-base tracking-[0] leading-[normal] p-0 focus:outline-none pr-8"
                                            id={confirmPasswordId}
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Nhập lại mật khẩu..."
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (confirmPasswordError) setConfirmPasswordError(null);
                                            }}
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer focus:outline-none rounded hover:bg-neutral-100/50 transition-colors"
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {confirmPasswordError && (
                                    <span className="text-red-500 text-xs font-semibold [font-family:'Inter-SemiBold',Helvetica]">
                                        {confirmPasswordError}
                                    </span>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className={`box-border flex items-center justify-center px-0 py-4 relative self-stretch w-full bg-[#0059bb] rounded-xl shadow-[0px_10px_30px_#0000000d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0059bb] ${loading || !isFormValid ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-sm text-center tracking-[0.28px] leading-[14px] whitespace-nowrap">
                                    {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                                </span>
                            </button>
                        </form>
                        
                        {/* Back to Login Link */}
                        <div className="flex flex-col items-center gap-3 pt-4 pb-0 px-0 relative self-stretch w-full border-t border-solid border-[#dbe4ed]">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 relative cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0059bb] rounded-sm py-1 px-2 hover:bg-neutral-50 transition-colors"
                            >
                                <svg className="relative w-3.5 h-3.5 text-[#0059bb] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                <span className="relative flex items-center w-fit [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#0059bb] text-sm tracking-[0.28px] leading-[14px] whitespace-nowrap">
                                    Quay lại Đăng nhập
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Right Column: Hero Showcase */}
                <section
                    className="hidden lg:flex flex-col w-[586.75px] h-[737.44px] relative"
                    aria-labelledby="hero-heading"
                >
                    <div className="flex flex-col w-[calc(100%_-_48px)] items-start gap-[22.8px] absolute top-0 left-12">
                        <div className="inline-flex items-center px-4 py-2 relative flex-[0_0_auto] bg-[#e6eff8] rounded-full">
                            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0059bb] text-xs tracking-[1.20px] leading-3 whitespace-nowrap">
                                REAL-TIME PRESENCE TRACKING
                            </div>
                        </div>
                        <div className="max-w-[500px] w-[500px] pt-[1.2px] pb-0 px-0 flex flex-col items-start relative flex-[0_0_auto]">
                            <h2
                                id="hero-heading"
                                className="[font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-[#0059bb] text-5xl tracking-[-0.96px] leading-[60px] relative w-fit mt-[-1.00px]"
                            >
                                Giám sát phòng họp
                                <br />
                                thông minh
                            </h2>
                        </div>
                        <div className="flex flex-col max-w-[480px] w-[480px] items-start relative flex-[0_0_auto]">
                            <p className="relative w-fit mt-[-1.00px] mr-[-83.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#3e6186] text-lg tracking-[0] leading-[28.8px]">
                                Kết nối thông minh, vận hành tối ưu. Trải nghiệm không gian
                                <br />
                                làm việc số hiện đại và chuyên nghiệp.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col w-[calc(100%_-_48px)] items-start absolute top-[277px] left-12">
                        <div className="absolute w-full h-full top-0 left-0 bg-[#0059bb] rounded-3xl blur-md opacity-5 pointer-events-none" />
                        <article className="flex-col items-start p-2 self-stretch flex-[0_0_auto] rounded-3xl overflow-hidden border-[#dbe4ed80] flex relative w-full bg-white border border-solid shadow-[0px_10px_30px_#0000000d]">
                            <div
                                className="relative self-stretch w-full rounded-[18px] aspect-[1.78] bg-cover bg-[50%_50%]"
                                role="img"
                                aria-label="Không gian phòng họp Apollo đang hoạt động"
                                style={{ backgroundImage: `url(${backgroundPng})` }}
                            />
                            
                            <div className="inline-flex items-center gap-[11.99px] px-5 py-3 absolute top-[25px] right-[25px] bg-[#ffffffcc] rounded-xl border border-solid border-[#ffffff80] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
                                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                <div className="inline-flex flex-col items-start p-2 relative flex-[0_0_auto] bg-[#87b1fd] rounded-lg">
                                    <img
                                        className="relative w-6 h-3"
                                        alt=""
                                        src={icon2}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                    <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                                        <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[10px] tracking-[0] leading-[15px] whitespace-nowrap">
                                            Tỷ lệ sử dụng
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start pt-0 pb-[0.59px] px-0 relative self-stretch w-full flex-[0_0_auto] -mt-px">
                                        <div className="relative flex items-center w-[52.14px] mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#141d23] text-base tracking-[0] leading-[25.6px]">
                                            84.5%
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="inline-flex items-center gap-3 px-6 py-3 absolute left-[25px] bottom-[25px] bg-[#ffffffe6] rounded-full border border-solid border-[#ffffff80] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
                                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-full shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                <div className="relative w-3 h-3 bg-[#ba1a1a] rounded-full" />
                                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                    <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#141d23] text-sm tracking-[0.28px] leading-[14px] whitespace-nowrap">
                                        Phòng Apollo đang họp
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                    
                    <div className="grid grid-cols-3 grid-rows-[73px] w-[calc(100%_-_48px)] h-[73px] gap-6 absolute top-[618px] left-12">
                        {featureCards.map((feature) => (
                            <article key={feature.id} className={feature.wrapperClassName}>
                                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                    <img
                                        className={feature.iconClassName}
                                        alt={feature.iconAlt}
                                        src={feature.iconSrc}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className={feature.textWrapperClassName}>
                                    <div className={feature.textClassName}>{feature.label}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ChangePass;
