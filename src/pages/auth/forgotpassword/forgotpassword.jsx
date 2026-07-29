import { useId, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordResetOtp } from "../../../service/authService";
import AuthFormSkeleton from "../../../component/Skeleton/AuthFormSkeleton";
import backgroundDecorativeElements from "../../../assets/images/background-decorative-elements.svg";
import icon2 from "../../../assets/icons/icon-2.svg";
import icon3 from "../../../assets/icons/icon-3.svg";
import icon4 from "../../../assets/icons/icon-4.svg";
import icon5 from "../../../assets/icons/icon-5.svg";
import backgroundPng from "../../../assets/images/background.png";

const IconGate = (
    <svg className="w-[18px] h-[18px] text-[#0059bb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3" />
    </svg>
);

const featureCards = [
    {
        id: "security",
        icon: <img className="relative w-5 h-4 flex-shrink-0" alt="Giám sát Camera AI" src={icon3} />,
        title: "Giám sát Camera AI",
    },
    {
        id: "access-control",
        icon: IconGate,
        title: "Kiểm soát xe ANPR",
    },
    {
        id: "alerts",
        icon: <img className="relative w-[17px] h-[16.99px] flex-shrink-0" alt="Cảnh báo thời gian thực" src={icon5} />,
        title: "Cảnh báo thời gian thực",
    },
];

const featureCardIconWrapClassName =
    "relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#e6eff8] flex-shrink-0";

const featureCardClassName =
    "relative w-full min-h-[72px] flex items-center gap-3 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]";

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
        <main className="flex flex-col min-h-screen items-center justify-center relative bg-[linear-gradient(0deg,rgba(246,250,255,1)_0%,rgba(246,250,255,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-x-hidden py-12 lg:py-0">
            {/* Blurs and Background Accents */}
            <div className="absolute h-[38.09%] top-[33.98%] left-0 w-[342px] rounded-full [background:radial-gradient(50%_50%_at_50%_50%,rgba(0,112,234,0.08)_0%,rgba(0,112,234,0)_70%)] pointer-events-none" />
            <div className="absolute h-[9.63%] top-[33.59%] right-0 w-24 bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            <div className="h-[19.73%] top-[84.67%] right-[80%] w-52 absolute bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            <div className="h-[40.72%] top-[46.78%] right-[20%] w-[434px] absolute bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />

            <img
                className="absolute top-0 right-0 w-[50%] max-w-[974px] h-[598px] pointer-events-none select-none opacity-40 lg:opacity-100 z-0"
                alt=""
                aria-hidden="true"
                src={backgroundDecorativeElements}
            />

            {/* Responsive Flex Wrapper */}
            <div className="flex flex-col lg:flex-row w-full max-w-[1080px] items-center justify-center p-6 gap-12 lg:gap-16 z-10">
                {/* Left Column: Form Card */}
                <section
                    aria-label="Quên mật khẩu"
                    className="w-full max-w-[480px] flex items-start"
                >
                    <div className="flex flex-col w-full items-start gap-8 pt-[47px] pb-[47.99px] px-6 sm:px-12 bg-white rounded-3xl shadow-[0px_10px_30px_#0000000d] border border-solid border-[#dbe4ed80]">
                        <div className="flex flex-col items-start gap-[12.01px] relative self-stretch w-full flex-[0_0_auto]">
                            <h1 className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-[#141d23] text-[32px] tracking-[-0.32px] leading-[41.6px]">
                                Quên mật khẩu?
                            </h1>
                            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-sm tracking-[0] leading-[21px]">
                                Đừng lo lắng, hãy nhập email của bạn để nhận mã xác thực OTP.
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
                            className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]"
                            onSubmit={handleSubmit}
                        >
                            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                                <label
                                    className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#414754] text-sm tracking-[0.28px] leading-[14px]"
                                    htmlFor={emailId}
                                >
                                    Email
                                </label>
                                <div className={`flex items-start justify-center px-4 py-3.5 relative self-stretch w-full bg-[#f6faff] rounded-xl overflow-hidden border border-solid ${emailError ? 'border-red-500' : 'border-[#c1c6d7]'} focus-within:border-[#0059bb] focus-within:ring-1 focus-within:ring-[#0059bb]`}>
                                    <input
                                        autoComplete="email"
                                        className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] placeholder:text-gray-500 text-base tracking-[0] leading-[normal] p-0 focus:outline-none"
                                        id={emailId}
                                        name="email"
                                        placeholder="name@company.com"
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            if (emailError) setEmailError(null);
                                        }}
                                        disabled={loading}
                                    />
                                </div>
                                {emailError && (
                                    <span className="text-red-500 text-xs font-semibold [font-family:'Inter-SemiBold',Helvetica]">
                                        {emailError}
                                    </span>
                                )}
                            </div>
                            <button
                                className={`box-border flex items-center justify-center gap-2 px-6 py-4 relative self-stretch w-full bg-[#0059bb] rounded-xl shadow-[0px_10px_30px_#0000000d] cursor-pointer transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0059bb] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                type="submit"
                                disabled={loading}
                            >
                                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-sm text-center tracking-[0.28px] leading-[14px] whitespace-nowrap">
                                    {loading ? "Đang gửi..." : "Gửi mã xác thực"}
                                </span>
                            </button>
                        </form>
                        <div className="flex flex-col items-center pt-8 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] mb-[-12.00px] border-t border-solid border-[#dbe4ed]">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 relative cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0059bb] rounded-sm py-1 px-2 hover:bg-neutral-50 transition-colors"
                            >
                                {/* Inline Left Arrow SVG */}
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

                {/* Right Column: Introduce Features */}
                <section
                    aria-label="Giới thiệu tính năng"
                    className="hidden lg:flex flex-col w-[586.75px] max-w-full gap-9"
                >
                    <div className="flex flex-col w-full items-start gap-6">
                        <div className="inline-flex items-center px-4 py-2 relative flex-[0_0_auto] bg-[#e6eff8] rounded-full">
                            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0059bb] text-xs tracking-[1.20px] leading-3 whitespace-nowrap">
                                CAMPUS OPERATIONS PLATFORM
                            </div>
                        </div>
                        <div className="max-w-[500px] w-full flex flex-col items-start">
                            <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-[#0059bb] text-5xl tracking-[-0.96px] leading-[60px]">
                                Số hóa khuôn viên
                                <br />
                                Nâng tầm vận hành
                            </h2>
                        </div>
                        <div className="flex flex-col max-w-[500px] w-full items-start">
                            <p className="relative w-full mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#3e6186] text-lg tracking-[0] leading-[28.8px]">
                                An ninh, ra vào, phòng họp và bãi xe — tự động hóa và đồng bộ
                                theo thời gian thực, chỉ trên một nền tảng duy nhất.
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full">
                        <div className="absolute w-full h-full top-0 left-0 bg-[#0059bb] rounded-3xl blur-md opacity-5 pointer-events-none" />
                        <div className="flex-col items-start p-2 self-stretch flex-[0_0_auto] rounded-3xl overflow-hidden border-[#dbe4ed80] flex relative w-full bg-white border border-solid shadow-[0px_10px_30px_#0000000d]">
                            <div
                                className="relative self-stretch w-full rounded-[18px] aspect-[1.35] bg-cover bg-[50%_50%]"
                                style={{ backgroundImage: `url(${backgroundPng})` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full">
                        {featureCards.map((card) => (
                            <article key={card.id} className={featureCardClassName}>
                                <div className={featureCardIconWrapClassName}>
                                    {card.icon}
                                </div>
                                <div className="relative flex-grow min-w-0 flex items-center">
                                    <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[12px] md:text-[13px] tracking-[0] leading-[1.3] text-left block break-words">
                                        {card.title}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ForgotPassword;
