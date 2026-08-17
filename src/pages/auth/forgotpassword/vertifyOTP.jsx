import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { requestPasswordResetOtp } from "../../../service/authService";
import AuthFormSkeleton from "../../../components/common/Skeleton/AuthFormSkeleton";
import AuthLayout from "../../../components/auth/AuthLayout";
import AuthAlert from "../../../components/auth/AuthAlert";

const OTP_LENGTH = 6;

export const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve email from state, default to empty
    const email = location.state?.email || "";

    const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));

    // Timers
    const [countdown, setCountdown] = useState(60); // 60s resend cooldown
    const [expiryTime, setExpiryTime] = useState(600); // 10 minutes OTP validity (BR1)

    const inputRefs = useRef([]);

    // API interaction states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Initial skeleton loading state
    const [initialLoading, setInitialLoading] = useState(true);

    // Client-side validations
    const [otpError, setOtpError] = useState(null);

    // Timers effect
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
            return;
        }
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            setExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Show skeleton briefly on mount
        const skeletonTimer = setTimeout(() => {
            setInitialLoading(false);
        }, 500);

        return () => {
            clearInterval(timer);
            clearTimeout(skeletonTimer);
        };
    }, [email, navigate]);

    const otpCode = useMemo(() => otpValues.join(""), [otpValues]);
    const isOtpComplete = otpValues.every((value) => value !== "");

    const focusInput = (index) => {
        const target = inputRefs.current[index];
        if (target) {
            target.focus();
            target.select();
        }
    };

    const updateOtpAtIndex = (index, nextValue) => {
        setOtpValues((currentValues) => {
            const nextValues = [...currentValues];
            nextValues[index] = nextValue;
            return nextValues;
        });
    };

    const handleInputChange = (index, event) => {
        const rawValue = event.target.value.replace(/\D/g, "");
        if (otpError) setOtpError(null);

        if (!rawValue) {
            updateOtpAtIndex(index, "");
            return;
        }

        const digits = rawValue.slice(0, OTP_LENGTH).split("");

        setOtpValues((currentValues) => {
            const nextValues = [...currentValues];
            let nextFocusIndex = index;

            digits.forEach((digit, offset) => {
                const targetIndex = index + offset;
                if (targetIndex < OTP_LENGTH) {
                    nextValues[targetIndex] = digit;
                    nextFocusIndex = targetIndex;
                }
            });

            window.requestAnimationFrame(() => {
                if (nextFocusIndex < OTP_LENGTH - 1) {
                    focusInput(nextFocusIndex + 1);
                } else {
                    focusInput(nextFocusIndex);
                }
            });

            return nextValues;
        });
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            event.preventDefault();
            if (otpError) setOtpError(null);

            if (otpValues[index]) {
                updateOtpAtIndex(index, "");
                return;
            }

            if (index > 0) {
                updateOtpAtIndex(index - 1, "");
                focusInput(index - 1);
            }
            return;
        }

        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            focusInput(index - 1);
        }

        if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            event.preventDefault();
            focusInput(index + 1);
        }
    };

    const handlePaste = (index, event) => {
        event.preventDefault();
        const pastedText = event.clipboardData.getData("text").replace(/\D/g, "");
        if (otpError) setOtpError(null);

        if (!pastedText) {
            return;
        }

        const digits = pastedText.slice(0, OTP_LENGTH - index).split("");

        setOtpValues((currentValues) => {
            const nextValues = [...currentValues];
            digits.forEach((digit, offset) => {
                nextValues[index + offset] = digit;
            });

            const lastIndex = Math.min(index + digits.length - 1, OTP_LENGTH - 1);
            window.requestAnimationFrame(() => {
                if (lastIndex < OTP_LENGTH - 1) {
                    focusInput(lastIndex + 1);
                } else {
                    focusInput(lastIndex);
                }
            });

            return nextValues;
        });
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleChangeEmail = () => {
        navigate("/forgot-password", { state: { email } });
    };

    // Resend OTP (A1)
    const handleResend = async () => {
        if (countdown !== 0 || loading) return;

        setError(null);
        setSuccessMsg(null);
        setRequestId(null);

        setLoading(true);

        try {
            const response = await requestPasswordResetOtp(email.trim());
            if (response.success) {
                setSuccessMsg("Mã OTP mới đã được gửi thành công!");
                setExpiryTime(600); // Reset OTP validity (BR1)
                setCountdown(60); // Reset resend cooldown
                setOtpValues(Array(OTP_LENGTH).fill(""));
                focusInput(0);
            }
        } catch (err) {
            console.error("Resend OTP Error:", err);
            const errDetail = err.error || {};
            let message = errDetail.message || "Không thể gửi lại mã. Vui lòng thử lại.";
            const reqId = err.requestId || errDetail.requestId || null;

            if (errDetail.code === "TOO_MANY_REQUESTS" || errDetail.code === "RATE_LIMIT" || message.includes("spam") || message.includes("nhiều lần") || err.status === 429) {
                message = "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 60 phút";
            }
            setError(message);
            setRequestId(reqId);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Reset states
        setOtpError(null);
        setError(null);
        setSuccessMsg(null);
        setRequestId(null);

        let hasError = false;

        // Check OTP (6 digits)
        if (otpCode.length !== 6 || isNaN(otpCode)) {
            setOtpError("Vui lòng nhập đủ 6 chữ số mã OTP");
            hasError = true;
        }

        // Check OTP expiration
        if (expiryTime === 0) {
            setOtpError("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);

        try {
            setSuccessMsg("Xác thực OTP thành công! Đang chuyển hướng thiết lập mật khẩu mới...");
            const trimmedEmail = email.trim();
            setTimeout(() => {
                navigate("/change-password", { state: { email: trimmedEmail, otp: otpCode } });
            }, 1000);
        } catch (err) {
            setError("Đã xảy ra lỗi khi xác thực OTP.");
            setLoading(false);
        }
    };

    // Show skeleton while loading
    if (initialLoading) {
        return <AuthFormSkeleton variant="otp" />;
    }

    return (
        <AuthLayout variant="otp">
            <div className="flex flex-col w-full items-start gap-8">
                <header className="flex flex-col items-start gap-3 w-full">
                    <h1 className="font-gilroy font-bold text-midnight-indigo text-4xl tracking-tight">
                        Xác thực OTP
                    </h1>
                    <p className="font-sans font-normal text-slate-blue text-base">
                        Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến <span className="font-semibold text-midnight-indigo">{email || "của bạn"}</span>. Vui lòng nhập mã và thiết lập mật khẩu mới.
                    </p>
                </header>

                <AuthAlert type="error" message={error} requestId={requestId} />
                <AuthAlert type="success" message={successMsg} />

                <form
                    className="flex flex-col w-full items-start gap-6"
                    onSubmit={handleSubmit}
                >
                    {/* OTP Inputs Group */}
                    <div className="flex flex-col items-start gap-3 w-full">
                        <div className="flex justify-between items-center w-full">
                            <label htmlFor="otp-0" className="font-sans font-semibold text-midnight-indigo text-sm uppercase tracking-wider">
                                Mã OTP
                            </label>
                            <span className={`text-xs font-bold font-sans ${expiryTime < 60 ? 'text-red-500 animate-pulse' : 'text-slate-blue'}`}>
                                Hiệu lực: {formatTime(expiryTime)}
                            </span>
                        </div>
                        <div
                            className="flex items-start justify-between w-full gap-2 sm:gap-3"
                            role="group"
                            aria-label="Mã OTP gồm 6 chữ số"
                        >
                            {otpValues.map((value, index) => (
                                <input
                                    key={`otp-${index}`}
                                    id={`otp-${index}`}
                                    ref={(element) => {
                                        inputRefs.current[index] = element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={index === 0 ? "one-time-code" : "off"}
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={value}
                                    onChange={(event) => handleInputChange(index, event)}
                                    onKeyDown={(event) => handleKeyDown(index, event)}
                                    onPaste={(event) => handlePaste(index, event)}
                                    disabled={loading}
                                    aria-label={`Chữ số OTP thứ ${index + 1}`}
                                    className={`w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 bg-cloud-mist rounded-2xl border border-solid text-center font-sans font-bold text-midnight-indigo text-xl md:text-2xl leading-none focus:border-action-blue focus:ring-1 focus:ring-action-blue focus:outline-none transition-colors ${otpError ? 'border-red-500 bg-red-50/50' : 'border-platinum-tint'}`}
                                />
                            ))}
                        </div>
                        {otpError && (
                            <span className="text-red-500 text-xs font-semibold font-sans mt-1">
                                {otpError}
                            </span>
                        )}
                    </div>

                    {/* Resend Actions */}
                    <div className="flex items-center justify-between w-full text-sm font-sans mt-2">
                        <span className="text-slate-blue">Không nhận được mã? </span>
                        {countdown > 0 ? (
                            <span className="font-bold text-midnight-indigo">
                                Gửi lại sau {countdown}s
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                className="font-bold text-action-blue hover:text-[#0054cc] cursor-pointer focus:outline-none hover:underline"
                            >
                                Gửi lại mã
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !isOtpComplete}
                        className={`mt-2 w-full h-14 bg-gradient-to-r from-action-blue to-glacier-blue text-white rounded-full font-sans font-semibold text-base shadow-md shadow-action-blue/20 hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-action-blue focus-visible:ring-offset-2 flex items-center justify-center gap-2 ${loading || !isOtpComplete ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >

                        {loading ? "Đang xác thực..." : "Xác thực OTP"}
                    </button>
                </form>

                <hr className="w-full border-t border-solid border-platinum-tint" />

                <div className="flex flex-col items-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={handleChangeEmail}
                        disabled={loading}
                        className="font-sans font-semibold text-action-blue hover:text-[#0054cc] text-sm cursor-pointer focus:outline-none hover:underline"
                    >
                        Thay đổi email
                    </button>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-blue rounded-md py-1 px-2 hover:bg-slate-50 transition-colors group"
                    >
                        <span className="font-sans text-slate-blue transition-colors text-sm whitespace-nowrap">
                            Quay lại
                        </span>
                        <span className="font-sans font-bold text-midnight-indigo group-hover:text-action-blue transition-colors text-sm whitespace-nowrap">
                            Đăng nhập
                        </span>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyOTP;
