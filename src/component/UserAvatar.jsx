import { useEffect, useState } from 'react';

export const resolveAvatarUrl = (user) => {
    if (!user || typeof user !== 'object') return '';

    return user.avatarUrl
        || user.avatar_url
        || user.user?.avatarUrl
        || user.user?.avatar_url
        || user.profile?.avatarUrl
        || user.profile?.avatar_url
        || '';
};

const resolveDisplayName = (user, name) => name
    || user?.fullName
    || user?.full_name
    || user?.user?.fullName
    || user?.user?.full_name
    || '?';

const UserAvatar = ({
    user,
    src,
    name,
    alt,
    className = '',
    imageClassName = '',
}) => {
    const avatarUrl = src || resolveAvatarUrl(user);
    const displayName = resolveDisplayName(user, name);
    const [failedUrl, setFailedUrl] = useState('');

    useEffect(() => {
        setFailedUrl('');
    }, [avatarUrl]);

    const shouldShowImage = Boolean(avatarUrl) && failedUrl !== avatarUrl;

    return (
        <div
            className={`overflow-hidden bg-gradient-to-tr from-action-blue to-glacier-blue text-white flex items-center justify-center select-none ${className}`}
            aria-label={alt || `Ảnh đại diện của ${displayName}`}
        >
            {shouldShowImage ? (
                <img
                    src={avatarUrl}
                    alt={alt || `Ảnh đại diện của ${displayName}`}
                    className={`w-full h-full object-cover ${imageClassName}`}
                    onError={() => setFailedUrl(avatarUrl)}
                />
            ) : (
                <span aria-hidden="true">{displayName.trim().charAt(0).toUpperCase() || '?'}</span>
            )}
        </div>
    );
};

export default UserAvatar;
