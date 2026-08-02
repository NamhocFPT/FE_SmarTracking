import { useId, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordResetOtp } from "../../../service/authService";
import AuthFormSkeleton from "../../../component/Skeleton/AuthFormSkeleton";
import AuthLayout from "../../../component/Auth/AuthLayout";
import AuthAlert from "../../../component/Auth/AuthAlert";

import AuthTextInput from "../../../component/Auth/AuthTextInput";

const ForgotPassword = () => {
    const emailId = useId();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    // Initial skeleton loading state
    const [initialLoading, setInitialLoading] = useState(true);

    // API interaction states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Client-side validation state
    const [emailError, setEmailError] = useState(null);

    // Show skeleton briefly on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Reset states
        setEmailError(null);
        setError(null);
        setSuccessMsg(null);
        setRequestId(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setEmailError("Vui lòng nhập email");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setEmailError("Email không đúng định dạng");
            return;
        }

        setLoading(true);

        try {
            // UC-AUTH-03 request reset OTP
            const response = await requestPasswordResetOtp(trimmedEmail);

            if (response.success) {
                setSuccessMsg("Mã xác nhận OTP đã được gửi đến email của bạn.");
                setTimeout(() => {
                    navigate("/verify-otp", { state: { email: trimmedEmail } });
                }, 1500);
            }
        } catch (err) {
            console.error("Forgot Password OTP Error:", err);
            const errDetail = err.error || {};
            let message = errDetail.message || "Không thể gửi mã xác nhận. Vui lòng kiểm tra lại.";
            const reqId = err.requestId || errDetail.requestId || null;

            // E1 exception
            if (errDetail.code === "EMAIL_NOT_FOUND" || errDetail.code === "ACCOUNT_LOCKED" || message.includes("không tồn tại") || message.includes("khóa")) {
                message = "Email không tồn tại hoặc tài khoản đã bị khóa. Vui lòng kiểm tra lại";
            }
            // E4 exception
            else if (errDetail.code === "TOO_MANY_REQUESTS" || errDetail.code === "RATE_LIMIT" || message.includes("spam") || message.includes("nhiều lần") || err.status === 429) {
                message = "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 60 phút";
            }

            setError(message);
            setRequestId(reqId);
        } finally {
            setLoading(false);
        }
    };

    // Show skeleton while loading
    if (initialLoading) {
        return <AuthFormSkeleton variant="forgot" />;
    }

    return (
        <AuthLayout variant="forgot">
            <div className="flex flex-col w-full items-start gap-8">
                <header className="flex flex-col items-start gap-3 w-full">
                    <h1 className="font-gilroy font-bold text-midnight-indigo text-4xl tracking-tight">
                        Quên mật khẩu?
                    </h1>
                    <p className="font-sans font-normal text-slate-blue text-base">
                        Nhập email của bạn để nhận mã xác thực OTP
                    </p>
                </header>

                <AuthAlert type="error" message={error} requestId={requestId} />
                <AuthAlert type="success" message={successMsg} />

                <form
                    className="flex flex-col w-full items-start gap-6"
                    onSubmit={handleSubmit}
                >
                    <div className="flex flex-col items-start gap-2 w-full">
                        <label
                            className="sr-only"
                            htmlFor={emailId}
                        >
                            Địa chỉ email
                        </label>
                        <AuthTextInput
                            id={emailId}
                            name="email"
                            placeholder="name@company.com"
                            autoComplete="email"
                            required
                            value={email}
                            error={emailError}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                if (emailError) setEmailError(null);
                            }}
                            disabled={loading}
                        />
                        {emailError && (
                            <span className="text-red-500 text-xs font-semibold font-sans">
                                {emailError}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-2 w-full h-14 bg-gradient-to-r from-action-blue to-glacier-blue text-white rounded-full font-sans font-semibold text-base shadow-md shadow-action-blue/20 hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-action-blue focus-visible:ring-offset-2 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >

                        <span>{loading ? "Đang gửi..." : "Gửi mã xác thực"}</span>
                    </button>
                </form>
                
                <hr className="w-full border-t border-solid border-platinum-tint" />
                
                <div className="w-full flex justify-center">
                    <span className="font-sans text-slate-blue text-sm">Bạn cần hỗ trợ thêm? <a href="#" className="font-sans font-semibold text-action-blue hover:underline">Liên hệ kỹ thuật</a></span>
                </div>

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

export default ForgotPassword;
