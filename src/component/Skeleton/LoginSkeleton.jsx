import Skeleton from './Skeleton';

/**
 * Skeleton loading for Login page
 * Mirrors the Login form layout: title, subtitle, email input, password input,
 * remember checkbox, submit button, social login buttons
 */
const LoginSkeleton = () => {
    return (
        <main className="bg-white w-full min-h-screen relative overflow-hidden flex items-center justify-center py-12 lg:py-0">
            {/* Background blurs - same as login */}
            <div className="absolute h-[10.27%] top-[25.00%] right-0 w-24 bg-[#e55cff] rounded-full blur-2xl opacity-20 pointer-events-none" />
            <div className="absolute w-[32.79%] h-[53.47%] top-[21.53%] left-[42.21%] bg-[#0099ff] rounded-full blur-2xl opacity-20 pointer-events-none" />

            <div className="flex flex-col lg:flex-row w-full items-center justify-center p-6 gap-12 lg:gap-16 z-10">
                {/* Left Column: Form Skeleton */}
                <section className="flex w-full max-w-[480px] items-start relative">
                    <div className="flex flex-col w-full items-start gap-[31px] p-6 sm:p-10 relative bg-white rounded-2xl border border-solid border-[#d4e0ed4c] shadow-[0px_20px_25px_-5px_#4767880d,0px_10px_15px_-3px_#4767881a,0px_4px_6px_-1px_#4767881a]">
                        {/* Header skeleton */}
                        <div className="skeleton-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                            <Skeleton variant="heading" width="75%" height={46} />
                            <Skeleton variant="text" width="90%" height={20} />
                        </div>

                        {/* Form skeleton */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                            {/* Email field */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                <Skeleton variant="text" width={40} height={14} />
                                <Skeleton variant="input" width="100%" />
                            </div>

                            {/* Password field */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Skeleton variant="text" width={60} height={14} />
                                    <Skeleton variant="text" width={100} height={14} />
                                </div>
                                <Skeleton variant="input" width="100%" />
                            </div>

                            {/* Remember checkbox */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Skeleton variant="rect" width={16} height={16} style={{ borderRadius: '4px' }} />
                                <Skeleton variant="text" width={130} height={14} />
                            </div>

                            {/* Submit button */}
                            <Skeleton variant="button" width="100%" height={56} style={{ borderRadius: '8px' }} />
                        </div>

                        {/* Social login divider and buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', paddingTop: '24px', borderTop: '1px solid #d4e0ed' }}>
                            <Skeleton variant="text" width={180} height={14} />
                            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                                <Skeleton variant="button" width="100%" height={48} style={{ borderRadius: '8px' }} />
                                <Skeleton variant="button" width="100%" height={48} style={{ borderRadius: '8px' }} />
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

            {/* Background blurs */}
            <div className="h-[15.33%] top-[84.67%] right-0 w-[227px] rounded-full absolute bg-[#e55cff] blur-2xl opacity-20" />
            <div className="h-[19.73%] top-[-2.54%] right-3.5 w-52 absolute bg-[#e55cff] blur-2xl opacity-20" />
        </main>
    );
};

export default LoginSkeleton;
