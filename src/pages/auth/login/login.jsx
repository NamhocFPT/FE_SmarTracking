import { useId, useState } from "react";
import { setTokens } from "../../../utils/request";
import { login as authLogin } from "../../../service/authService";
import backgroundDecorativeElements from "../../../assets/images/background-decorative-elements.svg";
import backgroundDecorativeElements2 from "../../../assets/images/background-decorative-elements-2.svg";
import icon from "../../../assets/icons/icon.svg";
import icon2 from "../../../assets/icons/icon-2.svg";
import icon3 from "../../../assets/icons/icon-3.svg";
import icon4 from "../../../assets/icons/icon-4.svg";
import icon5 from "../../../assets/icons/icon-5.svg";
import image from "../../../assets/images/image.svg";

const socialButtons = [
    {
        id: "google",
        label: "Google",
        className:
            "all-[unset] box-border h-12 pt-[13.59px] pb-[14.61px] px-0 flex-1 grow border border-solid border-[#d4e0ed] flex items-center justify-center relative rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2",
        content: (
            <div className="inline-flex flex-col items-center pt-0 pb-[0.8px] px-0 relative flex-[0_0_auto]">
                <div className="relative justify-center w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-neutral-950 text-xs text-center tracking-[0] leading-[16.8px] flex items-center whitespace-nowrap">
                    Google
                </div>
            </div>
        ),
    },
    {
        id: "sso",
        label: "SSO",
        className:
            "all-[unset] box-border h-12 gap-2 flex-1 grow border border-solid border-[#d4e0ed] flex items-center justify-center relative rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2",
        content: (
            <>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                    <img
                        className="relative w-5 h-[18px]"
                        alt=""
                        aria-hidden="true"
                        src={image}
                    />
                </div>
                <div className="relative w-[24.98px] h-[16.8px]">
                    <div className="absolute -top-px left-[calc(50.00%_-_12px)] h-[17px] justify-center [font-family:'Montserrat-Medium',Helvetica] font-medium text-neutral-950 text-xs text-center tracking-[0] leading-[16.8px] flex items-center whitespace-nowrap">
                        SSO
                    </div>
                </div>
            </>
        ),
    },
];

const featureCards = [
    {
        id: "support",
        iconSrc: icon3,
        iconClassName: "relative w-5 h-4",
        wrapperClassName:
            "relative row-[1_/_2] col-[1_/_2] w-full h-[73px] flex items-center gap-3 p-4 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative w-[85.08px] h-[19.5px]",
        label: "Phản hồi 24/7",
    },
    {
        id: "accuracy",
        iconSrc: icon4,
        iconClassName: "relative w-[18px] h-[18px]",
        wrapperClassName:
            "col-[2_/_3] relative row-[1_/_2] w-full h-[73px] flex items-center gap-[11.99px] p-4 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative w-[105.42px] h-[19.5px] mr-[-11.74px]",
        label: "Dữ liệu chính xác",
    },
    {
        id: "saving",
        iconSrc: icon5,
        iconClassName: "relative w-[17px] h-[16.99px]",
        wrapperClassName:
            "col-[3_/_4] relative row-[1_/_2] w-full h-[73px] flex items-center gap-[11.99px] p-4 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative w-[118.66px] h-[39px] mr-[-23.98px]",
        label: (
            <>
                Tiết kiệm năng
                <br />
                lượng
            </>
        ),
    },
];

const Login = () => {
    const emailId = useId();
    const passwordId = useId();
    const rememberId = useId();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberLogin, setRememberLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // API interaction states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Client-side validation states (E1)
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Client-side validation (E1)
        let hasError = false;
        setEmailError(null);
        setPasswordError(null);
        setError(null);
        setSuccessMsg(null);
        setRequestId(null);

        if (!email.trim()) {
            setEmailError("Vui lòng nhập email");
            hasError = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                setEmailError("Email không đúng định dạng");
                hasError = true;
            }
        }

        if (!password) {
            setPasswordError("Vui lòng nhập mật khẩu");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setLoading(true);

        try {
            // UC-AUTH-01 Đăng nhập hệ thống (POST /api/v1/auth/login, public)
            const response = await authLogin(email.trim(), password);
            
            if (response.success && response.data) {
                const { accessToken, refreshToken, user } = response.data;
                
                // Store tokens in localStorage for request header injection and rotation
                setTokens(accessToken, refreshToken);
                
                // Store user information if needed
                localStorage.setItem("user", JSON.stringify(user));
                if (rememberLogin) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }

                setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
                
                // Redirect user to the app dashboard based on role or fallback to home
                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            }
        } catch (err) {
            console.error("Login Error:", err);
            // Handle error response matching backend envelope
            const message = err.error?.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại.";
            const reqId = err.requestId || err.error?.requestId || "N/A";
            setError(message);
            setRequestId(reqId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-white w-full min-w-[1440px] h-[1024px] relative overflow-hidden">
            <img
                className="absolute top-0 left-0 w-[405px] h-[374px]"
                alt=""
                aria-hidden="true"
                src={backgroundDecorativeElements2}
            />
            <img
                className="absolute top-0 left-[13px] w-[445px] h-[370px]"
                alt=""
                aria-hidden="true"
                src={backgroundDecorativeElements}
            />
            <div className="flex w-full items-center justify-center p-6 absolute top-[119px] left-0">
                <div className="absolute h-[10.27%] top-[25.00%] right-0 w-24 bg-[#e55cff] rounded-full blur-2xl opacity-20" />
                <div className="absolute w-[32.79%] h-[53.47%] top-[21.53%] left-[42.21%] bg-[#0099ff] rounded-full blur-2xl opacity-20" />
                <section
                    className="flex w-[588px] h-[692.83px] items-start relative"
                    aria-label="Đăng nhập hệ thống"
                >
                    <div className="flex flex-col max-w-[480px] w-[480px] items-start gap-[31px] p-10 relative self-stretch bg-white rounded-2xl border border-solid border-[#d4e0ed4c]">
                        <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-2xl shadow-[0px_20px_25px_-5px_#4767880d,0px_10px_15px_-3px_#4767881a,0px_4px_6px_-1px_#4767881a]" />
                        <header className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto] bg-transparent">
                            <div className="self-stretch w-full flex-[0_0_auto] flex flex-col items-start relative">
                                <h1 className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-neutral-950 text-[38px] tracking-[0] leading-[46.0px]">
                                    Chào mừng trở lại
                                </h1>
                            </div>
                            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                                <p className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#476788] text-base tracking-[0] leading-[25.6px]">
                                    Vui lòng đăng nhập để tiếp tục quản lý hệ thống.
                                </p>
                            </div>
                        </header>

                        {/* Error Alert Box with Audit Trace Request ID */}
                        {error && (
                            <div className="w-full z-10 p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200" role="alert">
                                <div className="font-semibold">Lỗi đăng nhập</div>
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
                            <div className="w-full z-10 p-3 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200" role="alert">
                                <div>{successMsg}</div>
                            </div>
                        )}

                        <form
                            className="flex flex-col w-[399px] h-auto items-start gap-6 relative"
                            onSubmit={handleSubmit}
                        >
                            <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
                                <div className="flex flex-col w-[394px] items-start pt-0 pb-[0.8px] px-0 relative flex-[0_0_auto]">
                                    <label
                                        className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#424655] text-xs tracking-[0] leading-[16.8px] whitespace-nowrap"
                                        htmlFor={emailId}
                                    >
                                        Email
                                    </label>
                                </div>
                                <div className={`flex h-12 items-start justify-center px-4 py-[13.5px] relative self-stretch w-full bg-[#f8f9fb80] rounded-lg overflow-hidden border border-solid ${emailError ? 'border-red-500' : 'border-[#d4e0ed]'}`}>
                                    <input
                                        className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-gray-500 text-base tracking-[0] leading-[normal] p-0 placeholder:text-gray-500"
                                        id={emailId}
                                        name="email"
                                        placeholder="name@company.com"
                                        type="text"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            if (emailError) setEmailError(null);
                                        }}
                                        disabled={loading}
                                    />
                                </div>
                                {emailError && (
                                    <span className="text-red-500 text-xs mt-1 self-start font-medium [font-family:'Montserrat-Medium',Helvetica]">
                                        {emailError}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                                <div className="flex items-center justify-between px-1 py-0 relative self-stretch w-full flex-[0_0_auto]">
                                    <label
                                        htmlFor={passwordId}
                                        className="relative w-[57.69px] h-[16.8px] cursor-pointer"
                                    >
                                        <span className="absolute -top-px left-0 h-[17px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#424655] text-xs tracking-[0] leading-[16.8px] flex items-center whitespace-nowrap">
                                            Mật khẩu
                                        </span>
                                    </label>
                                    <a
                                        href="/forgot-password"
                                        className="relative w-[102.98px] h-[16.8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 rounded-sm"
                                    >
                                        <span className="absolute -top-px left-0 h-[17px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#0054cc] text-xs tracking-[0] leading-[16.8px] flex items-center whitespace-nowrap">
                                            Quên mật khẩu?
                                        </span>
                                    </a>
                                </div>
                                <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                                    <div className={`flex h-12 items-start justify-center px-4 py-[13.5px] relative self-stretch w-full bg-[#f8f9fb80] rounded-lg overflow-hidden border border-solid ${passwordError ? 'border-red-500' : 'border-[#d4e0ed]'}`}>
                                        <input
                                            className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-gray-500 text-base tracking-[0] leading-[normal] p-0 placeholder:text-gray-500 pr-10"
                                            id={passwordId}
                                            name="password"
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(event) => {
                                                setPassword(event.target.value);
                                                if (passwordError) setPasswordError(null);
                                            }}
                                            disabled={loading}
                                        />
                                    </div>
                                    {passwordError && (
                                        <span className="text-red-500 text-xs mt-1 self-start font-medium [font-family:'Montserrat-Medium',Helvetica]">
                                            {passwordError}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        aria-pressed={showPassword}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="inline-flex flex-col items-center justify-center p-2 absolute h-[64.58%] top-[17.71%] right-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 rounded"
                                    >
                                        <div className="inline-flex items-start justify-center relative flex-[0_0_auto]">
                                            <img
                                                className="relative w-[22px] h-[15px]"
                                                alt=""
                                                aria-hidden="true"
                                                src={icon}
                                            />
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 py-0 relative self-stretch w-full flex-[0_0_auto]">
                                <input
                                    id={rememberId}
                                    name="remember"
                                    type="checkbox"
                                    checked={rememberLogin}
                                    onChange={(event) => setRememberLogin(event.target.checked)}
                                    className="relative w-4 h-4 bg-white rounded border border-solid border-[#d4e0ed] cursor-pointer checked:bg-[#006bff] checked:border-[#006bff] focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2"
                                    disabled={loading}
                                />
                                <label
                                    htmlFor={rememberId}
                                    className="relative w-[136.25px] h-[23.94px] cursor-pointer"
                                >
                                    <span className="absolute -top-px left-0 h-6 flex items-center [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#424655] text-sm tracking-[0] leading-[23.9px] whitespace-nowrap">
                                        Ghi nhớ đăng nhập
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`all-[unset] box-border h-14 pt-[14.7px] pb-[15.3px] px-0 self-stretch w-full bg-[#006bff] flex items-center justify-center relative rounded-lg focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-[25.6px] whitespace-nowrap z-[1]">
                                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                                </div>
                                <div className="absolute w-full top-0 left-0 h-14 bg-[#ffffff01] rounded-lg shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                            </button>
                        </form>
                        <div className="flex flex-col items-center gap-4 pb-[4.26e-14px] pt-6 px-0 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-[#d4e0ed]">
                            <div className="inline-flex flex-col items-start pt-0 pb-[0.8px] px-0 relative flex-[0_0_auto]">
                                <div className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#a6bbd1] text-xs tracking-[1.20px] leading-[16.8px] flex items-center whitespace-nowrap">
                                    HOẶC ĐĂNG NHẬP VỚI
                                </div>
                            </div>
                            <div className="flex items-start justify-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                                {socialButtons.map((button) => (
                                    <button
                                        key={button.id}
                                        type="button"
                                        aria-label={`Đăng nhập với ${button.label}`}
                                        className={button.className}
                                        disabled={loading}
                                    >
                                        {button.content}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    className="flex flex-col w-[587px] items-start gap-8 relative"
                    aria-label="Giới thiệu giải pháp"
                >
                    <div className="relative w-[586.75px] h-[737.44px]">
                        <div className="flex flex-col w-[calc(100%_-_48px)] items-start gap-[22.8px] absolute top-[-25px] left-0">
                            <div className="inline-flex items-center px-4 py-2 relative flex-[0_0_auto] bg-[#e6eff8] rounded-full">
                                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                    <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0059bb] text-xs tracking-[1.20px] leading-3 flex items-center whitespace-nowrap">
                                        REAL-TIME PRESENCE TRACKING
                                    </div>
                                </div>
                            </div>
                            <div className="max-w-[500px] w-[500px] h-[121px] pt-[1.2px] pb-0 px-0 flex flex-col items-start relative">
                                <h2 className="relative self-stretch h-[120px] mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-[#0059bb] text-5xl tracking-[-0.96px] leading-[60px]">
                                    Giám sát phòng họp
                                    <br />
                                    thông minh
                                </h2>
                            </div>
                            <div className="flex flex-col max-w-[480px] w-[480px] items-start relative flex-[0_0_auto]">
                                <p className="relative w-fit mt-[-1.00px] mr-[-83.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#3e6186] text-lg tracking-[0] leading-[28.8px]">
                                    Kết nối thông minh, vận hành tối ưu. Trải nghiệm không gian{" "}
                                    <br />
                                    làm việc số hiện đại và chuyên nghiệp.
                                </p>
                            </div>
                        </div>
                        <div className="absolute h-[52.89%] top-[2.67%] right-[420px] w-[342px] rounded-full [background:radial-gradient(50%_50%_at_50%_50%,rgba(0,112,234,0.08)_0%,rgba(0,112,234,0)_70%)]" />
                        <div className="flex flex-col w-[580px] h-[342px] items-start absolute top-[265px] left-0">
                            <div className="absolute w-full h-full top-2 left-2 rounded-3xl border-2 border-solid border-[#006bff]" />
                            <div className="flex flex-col w-[596px] items-start p-4 relative flex-[0_0_auto] mr-[-16.00px] bg-white rounded-3xl overflow-hidden shadow-[0px_20px_25px_-5px_#4767880d,0px_10px_15px_-3px_#4767881a,0px_4px_6px_-1px_#4767881a]">
                                <div 
                                    className="relative self-stretch w-full h-[310px] rounded-2xl bg-cover bg-[50%_50%]" 
                                    style={{ backgroundImage: "url('/high-tech-smart-meeting-room-with-push-to-talk-microphones.png')" }}
                                />
                                <div className="inline-flex flex-col items-start p-4 absolute top-8 right-8 bg-[#ffffffe6] rounded-xl border border-solid border-[#ffffff80] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
                                    <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                    <div className="inline-flex items-center gap-12 relative flex-[0_0_auto]">
                                        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                            <img
                                                className="relative w-5 h-2.5"
                                                alt=""
                                                aria-hidden="true"
                                                src={icon2}
                                            />
                                        </div>
                                        <div className="relative w-[81.13px] h-[42.39px]">
                                            <div className="flex flex-col w-full items-start pt-0 pb-[0.8px] px-0 absolute -top-px left-0">
                                                <div className="relative flex items-center w-fit mt-[-1.00px] mr-[-0.87px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#a6bbd1] text-xs tracking-[0] leading-[16.8px] whitespace-nowrap">
                                                    Tỷ lệ sử dụng
                                                </div>
                                            </div>
                                            <div className="flex flex-col w-full items-start absolute top-[17px] left-0">
                                                <div className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-neutral-950 text-base tracking-[0] leading-[25.6px] flex items-center whitespace-nowrap">
                                                    84.5%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-flex flex-col items-start p-4 absolute left-8 bottom-8 bg-[#ffffffe6] rounded-xl border border-solid border-[#ffffff80] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
                                    <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                    <div className="inline-flex items-center gap-12 relative flex-[0_0_auto]">
                                        <div className="relative w-2 h-2 bg-[#ba1a1a] rounded-full" />
                                        <div className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-neutral-950 text-sm tracking-[0] leading-[23.9px] flex items-center whitespace-nowrap">
                                            Phòng Apollo đang họp
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 grid-rows-[73px] w-[518px] h-[73px] gap-6 absolute top-[644px] left-6">
                            {featureCards.map((card) => (
                                <div key={card.id} className={card.wrapperClassName}>
                                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                        <img
                                            className={card.iconClassName}
                                            alt=""
                                            aria-hidden="true"
                                            src={card.iconSrc}
                                        />
                                    </div>
                                    <div className={card.textWrapperClassName}>
                                        <div className="absolute -top-px left-0 h-5 [font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[13px] tracking-[0] leading-[19.5px] whitespace-nowrap flex items-center">
                                            {card.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <div className="h-[15.33%] top-[84.67%] right-0 w-[227px] rounded-full absolute bg-[#e55cff] blur-2xl opacity-20" />
            <div className="h-[19.73%] top-[-2.54%] right-3.5 w-52 absolute bg-[#e55cff] blur-2xl opacity-20" />
        </main>
    );
};

export const Wireframe = Login;
export default Login;
