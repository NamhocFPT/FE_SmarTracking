import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { requestPasswordResetOtp } from "../../../service/authService";
import backgroundDecorativeElements from "../../../assets/images/background-decorative-elements.svg";
import icon2 from "../../../assets/icons/icon-2.svg";
import icon3 from "../../../assets/icons/icon-3.svg";
import icon4 from "../../../assets/icons/icon-4.svg";
import icon5 from "../../../assets/icons/icon-5.svg";
import image from "../../../assets/images/image.svg";
import backgroundPng from "../../../assets/images/background.png";

const OTP_LENGTH = 6;

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
        return () => clearInterval(timer);
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
            const reqId = err.requestId || errDetail.requestId || "N/A";

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
            navigate("/change-password", { state: { email: trimmedEmail, otp: otpCode } });
        } catch (err) {
            setError("Đã xảy ra lỗi khi xác thực OTP.");
        } finally {
            setLoading(false);
        }
    };

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
            <img
                className="absolute top-[104px] right-0 w-[25%] max-w-[360px] h-[449px] pointer-events-none select-none opacity-30 lg:opacity-80 z-0"
                alt=""
                src={image}
                aria-hidden="true"
            />

            {/* Responsive Flex Wrapper */}
            <div className="flex flex-col lg:flex-row w-full max-w-[1080px] items-center justify-center p-6 gap-12 lg:gap-16 z-10">
                {/* Left Column: Form Card */}
                <section
                    className="w-full max-w-[480px] flex items-start"
                    aria-labelledby="otp-heading"
                >
                    <div className="flex flex-col w-full items-start gap-5 pt-[47px] pb-[47px] px-6 sm:px-12 bg-white rounded-3xl border border-solid border-[#e6eff8] shadow-[0px_10px_30px_#0000000d]">
                        <div className="w-full pt-0 pb-[0.59px] px-0 flex flex-col items-start relative">
                            <h1
                                id="otp-heading"
                                className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-[#141d23] text-[32px] tracking-[-0.32px] leading-[41.6px]"
                            >
                                Xác thực OTP
                            </h1>
                        </div>
                        <div className="flex flex-col items-start relative self-stretch w-full">
                            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-sm tracking-[0] leading-[21px]">
                                Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến
                                <br />
                                email: <span className="font-semibold text-neutral-800">{email || "của bạn"}</span>. Vui lòng nhập mã và thiết lập mật khẩu mới.
                            </p>
                        </div>

                        {/* Error Alert Box */}
                        {error && (
                            <div className="w-full p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200" role="alert">
                                <div className="font-semibold">Lỗi xác thực</div>
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

                            {/* OTP Inputs Group */}
                            <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
                                <div className="flex justify-between items-center w-full">
                                    <label htmlFor="otp-0" className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#414754] text-sm tracking-[0.28px] leading-[14px]">
                                        Mã OTP
                                    </label>
                                    <span className={`text-xs font-bold [font-family:'Inter-Bold',Helvetica] ${expiryTime < 60 ? 'text-red-500 animate-pulse' : 'text-neutral-500'}`}>
                                        Hiệu lực: {formatTime(expiryTime)}
                                    </span>
                                </div>
                                <div
                                    className="flex items-start justify-between relative self-stretch w-full gap-1 sm:gap-2"
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
                                            className={`relative w-10 h-12 sm:w-11 sm:h-14 md:w-[60px] md:h-[60px] bg-[#f6faff] rounded-xl border border-solid text-center [font-family:'Inter-Bold',Helvetica] font-bold text-[#141d23] text-xl md:text-2xl leading-6 focus:border-[#0059bb] focus:ring-2 focus:ring-[#0059bb1a] focus:outline-none transition-colors ${otpError ? 'border-red-500 bg-red-50/50' : 'border-[#c1c6d7]'}`}
                                        />
                                    ))}
                                </div>
                                {otpError && (
                                    <span className="text-red-500 text-xs font-semibold [font-family:'Inter-SemiBold',Helvetica] mt-1">
                                        {otpError}
                                    </span>
                                )}
                            </div>

                            {/* Resend Actions */}
                            <div className="flex items-center justify-between self-stretch w-full text-sm [font-family:'Inter-Regular',Helvetica]">
                                <span className="text-[#414754]">Không nhận được mã? </span>
                                {countdown > 0 ? (
                                    <span className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#0059bb]">
                                        Gửi lại sau {countdown}s
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#0059bb] hover:text-[#004eab] cursor-pointer focus:outline-none focus:underline"
                                    >
                                        Gửi lại mã
                                    </button>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !isOtpComplete}
                                className={`box-border flex items-center justify-center px-0 py-4 relative self-stretch w-full bg-[#0059bb] rounded-xl shadow-[0px_10px_30px_#0000000d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0059bb] ${loading || !isOtpComplete ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-sm text-center tracking-[0.28px] leading-[14px] whitespace-nowrap">
                                    {loading ? "Đang xác thực..." : "Xác thực OTP"}
                                </span>
                            </button>
                        </form>

                        {/* Back to Login and Change Email Links */}
                        <div className="flex flex-col items-center gap-3 pt-4 pb-0 px-0 relative self-stretch w-full border-t border-solid border-[#dbe4ed]">
                            <button
                                type="button"
                                onClick={handleChangeEmail}
                                disabled={loading}
                                className="flex items-center [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#0059bb] hover:text-[#004eab] text-sm tracking-[0.28px] leading-[14px] whitespace-nowrap cursor-pointer focus:outline-none focus:underline"
                            >
                                Thay đổi email
                            </button>
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

export default VerifyOTP;
