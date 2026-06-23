import Skeleton from './Skeleton';

/**
 * Skeleton loading for auth form pages
 * Used by: Forgot Password, Verify OTP, Change Password
 * 
 * @param {string} variant - 'forgot' | 'otp' | 'changepass' to match specific layouts
 */
const AuthFormSkeleton = ({ variant = 'forgot' }) => {
    const renderFormContent = () => {
        switch (variant) {
            case 'otp':
                return (
                    <>
                        {/* OTP label + timer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Skeleton variant="text" width={60} height={14} />
                            <Skeleton variant="text" width={100} height={14} />
                        </div>
                        {/* OTP input boxes */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="rect"
                                    width={60}
                                    height={60}
                                    style={{ borderRadius: '12px', flex: '1' }}
                                />
                            ))}
                        </div>
                        {/* Resend link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Skeleton variant="text" width={130} height={14} />
                            <Skeleton variant="text" width={110} height={14} />
                        </div>
                    </>
                );
            case 'changepass':
                return (
                    <>
                        {/* New password field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <Skeleton variant="text" width={100} height={14} />
                            <Skeleton variant="input" width="100%" />
                        </div>
                        {/* Strength meter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                                <Skeleton variant="rect" height={6} style={{ flex: 1, borderRadius: '3px' }} />
                                <Skeleton variant="rect" height={6} style={{ flex: 1, borderRadius: '3px' }} />
                                <Skeleton variant="rect" height={6} style={{ flex: 1, borderRadius: '3px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Skeleton variant="text" width={80} height={12} />
                                <Skeleton variant="text" width={140} height={12} />
                            </div>
                        </div>
                        {/* Confirm password field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <Skeleton variant="text" width={160} height={14} />
                            <Skeleton variant="input" width="100%" />
                        </div>
                    </>
                );
            case 'forgot':
            default:
                return (
                    <>
                        {/* Email field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <Skeleton variant="text" width={40} height={14} />
                            <Skeleton variant="input" width="100%" height={50} style={{ borderRadius: '12px' }} />
                        </div>
                    </>
                );
        }
    };

    return (
        <main className="flex flex-col min-h-screen items-center justify-center relative bg-[linear-gradient(0deg,rgba(246,250,255,1)_0%,rgba(246,250,255,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-x-hidden py-12 lg:py-0">
            {/* Background blurs */}
            <div className="absolute h-[38.09%] top-[33.98%] left-0 w-[342px] rounded-full [background:radial-gradient(50%_50%_at_50%_50%,rgba(0,112,234,0.08)_0%,rgba(0,112,234,0)_70%)] pointer-events-none" />
            <div className="absolute h-[9.63%] top-[33.59%] right-0 w-24 bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            <div className="h-[19.73%] top-[84.67%] right-[80%] w-52 absolute bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            <div className="h-[40.72%] top-[46.78%] right-[20%] w-[434px] absolute bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />

            {/* Responsive Flex Wrapper */}
            <div className="flex flex-col lg:flex-row w-full max-w-[1080px] items-center justify-center p-6 gap-12 lg:gap-16 z-10">
                {/* Left Column: Form Card Skeleton */}
                <section className="w-full max-w-[480px] flex items-start">
                    <div className="flex flex-col w-full items-start gap-5 pt-[47px] pb-[47px] px-6 sm:px-12 bg-white rounded-3xl border border-solid border-[#e6eff8] shadow-[0px_10px_30px_#0000000d]">
                        {/* Header */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                            <Skeleton variant="heading" width="65%" height={42} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <Skeleton variant="text" width="95%" height={16} />
                                {variant === 'otp' && <Skeleton variant="text" width="80%" height={16} />}
                            </div>
                        </div>

                        {/* Form content by variant */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                            {renderFormContent()}
                        </div>

                        {/* Submit button */}
                        <Skeleton variant="button" width="100%" height={52} style={{ borderRadius: '12px' }} />

                        {/* Back to login link */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', paddingTop: '16px', borderTop: '1px solid #dbe4ed' }}>
                            {variant === 'otp' && <Skeleton variant="text" width={110} height={14} />}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Skeleton variant="rect" width={14} height={14} style={{ borderRadius: '3px' }} />
                                <Skeleton variant="text" width={140} height={14} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Column: Hero Skeleton (desktop only) */}
                <section className="hidden lg:flex flex-col w-[586.75px] h-[737.44px] relative">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22.8px', width: 'calc(100% - 48px)', position: 'absolute', top: 0, left: '48px' }}>
                        <Skeleton variant="badge" width={220} height={32} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Skeleton variant="heading" width="85%" height={50} />
                            <Skeleton variant="heading" width="60%" height={50} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Skeleton variant="text" width="95%" height={20} />
                            <Skeleton variant="text" width="75%" height={20} />
                        </div>
                    </div>

                    {/* Image card skeleton */}
                    <div style={{
                        position: 'absolute', top: '277px', left: '48px',
                        width: 'calc(100% - 48px)',
                        background: 'white', borderRadius: '24px', padding: '8px',
                        border: '1px solid rgba(219, 228, 237, 0.5)',
                        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)'
                    }}>
                        <Skeleton variant="rect" width="100%" height={0} style={{ paddingBottom: '56.25%', borderRadius: '18px' }} />
                    </div>

                    {/* Feature cards skeleton */}
                    <div style={{
                        position: 'absolute', top: '618px', left: '48px',
                        width: 'calc(100% - 48px)',
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px'
                    }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                height: '73px', background: 'white', borderRadius: '12px',
                                border: '1px solid rgba(219, 228, 237, 0.3)',
                                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px'
                            }}>
                                <Skeleton variant="circle" width={20} height={18} style={{ borderRadius: '4px' }} />
                                <Skeleton variant="text" width="70%" height={14} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AuthFormSkeleton;
