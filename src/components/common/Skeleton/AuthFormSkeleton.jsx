import Skeleton from './Skeleton';
import AuthLayout from '../../auth/AuthLayout';

/**
 * Skeleton loading for auth form pages
 * Used by: Login, Forgot Password, Verify OTP, Change Password
 * 
 * @param {string} variant - 'login' | 'forgot' | 'otp' | 'changepass' to match specific layouts
 */
const AuthFormSkeleton = ({ variant = 'forgot' }) => {
    const renderFormContent = () => {
        switch (variant) {
            case 'login':
                return (
                    <div className="flex flex-col gap-6 w-full mt-4">
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton variant="text" width={40} height={14} />
                            <Skeleton variant="input" width="100%" height={48} style={{ borderRadius: '12px' }} />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton variant="text" width={60} height={14} />
                            <Skeleton variant="input" width="100%" height={48} style={{ borderRadius: '12px' }} />
                        </div>
                        <div className="flex justify-between items-center w-full mt-2">
                            <Skeleton variant="text" width={120} height={14} />
                            <Skeleton variant="text" width={100} height={14} />
                        </div>
                        <Skeleton variant="button" width="100%" height={56} style={{ borderRadius: '12px', marginTop: '16px' }} />
                    </div>
                );
            case 'otp':
                return (
                    <div className="flex flex-col gap-6 w-full mt-4">
                        <div className="flex justify-between items-center w-full">
                            <Skeleton variant="text" width={60} height={14} />
                            <Skeleton variant="text" width={100} height={14} />
                        </div>
                        <div className="flex justify-between gap-2 sm:gap-3 w-full">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="rect"
                                    width="100%"
                                    height={56}
                                    style={{ borderRadius: '12px', flex: '1' }}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center w-full">
                            <Skeleton variant="text" width={130} height={14} />
                            <Skeleton variant="text" width={110} height={14} />
                        </div>
                        <Skeleton variant="button" width="100%" height={56} style={{ borderRadius: '12px' }} />
                    </div>
                );
            case 'changepass':
                return (
                    <div className="flex flex-col gap-6 w-full mt-4">
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton variant="text" width={100} height={14} />
                            <Skeleton variant="input" width="100%" height={48} style={{ borderRadius: '12px' }} />
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex gap-1.5 w-full">
                                <Skeleton variant="rect" height={6} style={{ flex: 1, borderRadius: '9999px' }} />
                                <Skeleton variant="rect" height={6} style={{ flex: 1, borderRadius: '9999px' }} />
                                <Skeleton variant="rect" height={6} style={{ flex: 1, borderRadius: '9999px' }} />
                            </div>
                            <div className="flex justify-between w-full mt-1">
                                <Skeleton variant="text" width={80} height={12} />
                                <Skeleton variant="text" width={140} height={12} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton variant="text" width={160} height={14} />
                            <Skeleton variant="input" width="100%" height={48} style={{ borderRadius: '12px' }} />
                        </div>
                        <Skeleton variant="button" width="100%" height={56} style={{ borderRadius: '12px' }} />
                    </div>
                );
            case 'forgot':
            default:
                return (
                    <div className="flex flex-col gap-6 w-full mt-4">
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton variant="text" width={100} height={14} />
                            <Skeleton variant="input" width="100%" height={48} style={{ borderRadius: '12px' }} />
                        </div>
                        <Skeleton variant="button" width="100%" height={56} style={{ borderRadius: '12px' }} />
                    </div>
                );
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col w-full items-start gap-8">
                {/* Header */}
                <div className="flex flex-col gap-3 w-full">
                    <Skeleton variant="heading" width="65%" height={40} />
                    <Skeleton variant="text" width="95%" height={16} />
                    {variant === 'otp' && <Skeleton variant="text" width="80%" height={16} />}
                </div>

                {/* Form content by variant */}
                {renderFormContent()}

                {/* Footer Link */}
                {(variant !== 'login') && (
                    <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-solid border-platinum-tint">
                        {variant === 'otp' && <Skeleton variant="text" width={110} height={14} />}
                        <div className="flex items-center gap-2">
                            <Skeleton variant="rect" width={14} height={14} style={{ borderRadius: '3px' }} />
                            <Skeleton variant="text" width={140} height={14} />
                        </div>
                    </div>
                )}
                {variant === 'login' && (
                    <div className="flex justify-center w-full mt-2">
                        <Skeleton variant="text" width={200} height={14} />
                    </div>
                )}
            </div>
        </AuthLayout>
    );
};

export default AuthFormSkeleton;
