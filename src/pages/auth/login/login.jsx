import { useId, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setTokens, getAccessToken } from "../../../utils/request";
import { login as authLogin } from "../../../service/authService";
import LoginSkeleton from "../../../component/Skeleton/LoginSkeleton";
import backgroundDecorativeElements from "../../../assets/images/background-decorative-elements.svg";
import backgroundDecorativeElements2 from "../../../assets/images/background-decorative-elements-2.svg";
import icon2 from "../../../assets/icons/icon-2.svg";
import icon3 from "../../../assets/icons/icon-3.svg";
import icon4 from "../../../assets/icons/icon-4.svg";
import icon5 from "../../../assets/icons/icon-5.svg";
import image from "../../../assets/images/image.svg";
import backgroundPng from "../../../assets/images/background.png";

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
        iconAlt: "Phản hồi 24/7",
        iconClassName: "relative w-5 h-4 flex-shrink-0",
        label: "Phản hồi 24/7",
        title: "Phản hồi 24/7",
        wrapperClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        cardClassName:
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
        title: "Dữ liệu chính xác",
        wrapperClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        cardClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative flex-grow min-w-0 flex items-center",
        textClassName:
            "[font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[12px] md:text-[13px] tracking-[0] leading-[1.3] text-left block break-words",
    },
    {
        id: "saving",
        iconSrc: icon5,
        iconAlt: "Tiết kiệm năng lượng",
        iconClassName: "relative w-[17px] h-[16.99px] flex-shrink-0",
        label: "Tiết kiệm năng lượng",
        title: "Tiết kiệm năng lượng",
        wrapperClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        cardClassName:
            "relative w-full h-[73px] flex items-center gap-2.5 p-3 bg-white rounded-xl border border-solid border-[#dbe4ed4c] shadow-[0px_10px_30px_#0000000d]",
        textWrapperClassName: "relative flex-grow min-w-0 flex items-center",
        textClassName:
            "[font-family:'Inter-Regular',Helvetica] font-normal text-[#414754] text-[12px] md:text-[13px] tracking-[0] leading-[1.3] text-left block break-words",
    },
];

/**
 * Determines redirect path based on user roles from API response.
 * API returns: user.roles: string[] (e.g. ["ADMIN"], ["MANAGER"], ["EMPLOYEE"])
 */
const getRedirectPathByRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
        return '/employee';
    }
    const normalizedRoles = roles.map(r => (typeof r === 'string' ? r : r.roleCode || r.role_code || '').toUpperCase());
    if (normalizedRoles.includes('SYSTEM_ADMIN') || normalizedRoles.includes('ADMIN')) {
        return '/system-admin';
    }
    if (normalizedRoles.includes('BUSINESS_ADMIN')) {
        return '/business-admin';
    }
    if (normalizedRoles.includes('MANAGER')) {
        return '/manager';
    }
    return '/employee';
};

const Login = () => {
    const navigate = useNavigate();
    const emailId = useId();
    const passwordId = useId();
    const rememberId = useId();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberLogin, setRememberLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Initial skeleton loading state (check existing session)
    const [initialLoading, setInitialLoading] = useState(true);

    // API interaction states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Client-side validation states (E1)
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);

    // Check for existing session on mount — show skeleton while checking
    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            // User already has a token, try to get stored user info and redirect
            try {
                const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
                if (storedUser && storedUser.roles) {
                    const redirectPath = getRedirectPathByRoles(storedUser.roles);
                    navigate(redirectPath, { replace: true });
                    return;
                }
            } catch (e) {
                // Invalid stored user, continue to login
            }
        }

        // Load remembered email
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            setEmail(remembered);
            setRememberLogin(true);
        }

        // Small delay for skeleton to show smoothly, then reveal the form
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Client-side validation (E1)
        let hasError = false;
        setEmailError(null);
        setPasswordError(null);
        setError(null);
        setSuccessMsg(null);

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
                
                // Redirect user to the app dashboard based on role
                const redirectPath = getRedirectPathByRoles(user?.roles);
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 1500);
            }
        } catch (err) {
            // Handle error response matching backend envelope
            const message = err.error?.message || "Email hoặc mật khẩu không đúng. Vui lòng thử lại.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Show skeleton while initial session check is in progress
    if (initialLoading) {
        return <LoginSkeleton />;
    }

    return (
        <main className="bg-white w-full min-h-screen relative overflow-hidden flex items-center justify-center py-12 lg:py-0">
            <img
                className="absolute top-0 left-0 w-[405px] h-[374px] pointer-events-none opacity-50 lg:opacity-100"
                alt=""
                aria-hidden="true"
                src={backgroundDecorativeElements2}
            />
            <img
                className="absolute top-0 left-[13px] w-[445px] h-[370px] pointer-events-none opacity-50 lg:opacity-100"
                alt=""
                aria-hidden="true"
                src={backgroundDecorativeElements}
            />
            <div className="flex flex-col lg:flex-row w-full items-center justify-center p-6 gap-12 lg:gap-16 z-10">
                <div className="absolute h-[10.27%] top-[25.00%] right-0 w-24 bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
                <div className="absolute w-[32.79%] h-[53.47%] top-[21.53%] left-[42.21%] bg-[#0099ff] rounded-full blur-2xl opacity-20 pointer-events-none" />
                <section
                    className="flex w-full max-w-[480px] items-start relative"
                    aria-label="Đăng nhập hệ thống"
                >
                    <div className="flex flex-col w-full items-start gap-[31px] p-6 sm:p-10 relative bg-white rounded-2xl border border-solid border-[#d4e0ed4c] shadow-[0px_20px_25px_-5px_#4767880d,0px_10px_15px_-3px_#4767881a,0px_4px_6px_-1px_#4767881a]">
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

                        {/* Error Alert Box */}
                        {error && (
                            <div className="w-full z-10 p-4 text-sm rounded-xl border flex items-start gap-3 bg-red-50 border-red-200 text-red-700" role="alert">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <div>
                                    <div className="font-semibold">Đăng nhập thất bại</div>
                                    <div className="mt-0.5">{error}</div>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMsg && (
                            <div className="w-full z-10 p-3 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200" role="alert">
                                <div>{successMsg}</div>
                            </div>
                        )}

                        <form
                            className="flex flex-col w-full h-auto items-start gap-6 relative"
                            onSubmit={handleSubmit}
                        >
                            <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
                                <div className="flex flex-col w-full items-start pt-0 pb-[0.8px] px-0 relative flex-[0_0_auto]">
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
                                    <Link
                                        to="/forgot-password"
                                        className="relative w-[102.98px] h-[16.8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 rounded-sm"
                                    >
                                        <span className="absolute -top-px left-0 h-[17px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-[#0054cc] text-xs tracking-[0] leading-[16.8px] flex items-center whitespace-nowrap">
                                            Quên mật khẩu?
                                        </span>
                                    </Link>
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 rounded"
                                    >
                                        {showPassword ? (
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
                    aria-label="Giới thiệu tính năng"
                    className="hidden lg:flex flex-col w-[586.75px] h-[737.44px] relative"
                >
                    <div className="flex flex-col w-[calc(100%_-_48px)] items-start gap-[22.8px] absolute top-0 left-12">
                        <div className="inline-flex items-center px-4 py-2 relative flex-[0_0_auto] bg-[#e6eff8] rounded-full">
                            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0059bb] text-xs tracking-[1.20px] leading-3 whitespace-nowrap">
                                REAL-TIME PRESENCE TRACKING
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
                                Kết nối thông minh, vận hành tối ưu. Trải nghiệm không gian
                                <br />
                                làm việc số hiện đại và chuyên nghiệp.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col w-[calc(100%_-_48px)] items-start absolute top-[277px] left-12">
                        <div className="absolute w-full h-full top-0 left-0 bg-[#0059bb] rounded-3xl blur-md opacity-5 pointer-events-none" />
                        <div className="flex-col items-start p-2 self-stretch flex-[0_0_auto] rounded-3xl overflow-hidden border-[#dbe4ed80] flex relative w-full bg-white border border-solid shadow-[0px_10px_30px_#0000000d]">
                            <div 
                                className="relative self-stretch w-full rounded-[18px] aspect-[1.78] bg-cover bg-[50%_50%]" 
                                style={{ backgroundImage: `url(${backgroundPng})` }}
                            />
                            
                            <div className="inline-flex items-center gap-[11.99px] px-5 py-3 absolute top-[25px] right-[25px] bg-[#ffffffcc] rounded-xl border border-solid border-[#ffffff80] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
                                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                                <div className="inline-flex flex-col items-start p-2 relative flex-[0_0_auto] bg-[#87b1fd] rounded-lg">
                                    <img
                                        className="relative w-6 h-3"
                                        alt=""
                                        aria-hidden="true"
                                        src={icon2}
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
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 grid-rows-[73px] w-[calc(100%_-_48px)] h-[73px] gap-6 absolute top-[618px] left-12">
                        {featureCards.map((card) => (
                            <article key={card.id} className={card.cardClassName}>
                                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                                    <img
                                        className={card.iconClassName}
                                        alt={card.iconAlt}
                                        src={card.iconSrc}
                                    />
                                </div>
                                <div className={card.textWrapperClassName}>
                                    <div className={card.textClassName}>
                                        {card.title}
                                    </div>
                                </div>
                            </article>
                        ))}
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
