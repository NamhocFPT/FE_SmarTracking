import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../utils/request';

const ThumbnailImage = ({ eventId, onClick, alt = "Snapshot", className = "w-20 h-20" }) => {
    const [error, setError] = useState(false);

    // We get the token directly here so the parent doesn't need to pass it
    const token = localStorage.getItem('accessToken');

    if (!eventId) return null;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
            className={`inline-flex items-center justify-center rounded-lg overflow-hidden border border-slate-200 hover:border-action-blue transition-colors bg-slate-100 flex-shrink-0 ${className}`}
            title="Xem ảnh hiện trường (phóng to)"
        >
            {!error ? (
                <img
                    src={`${API_BASE_URL}/ivss/device-events/${eventId}/snapshot?token=${token}`}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <ImageIcon className="w-4 h-4 text-slate-400" />
            )}
        </button>
    );
};

export default ThumbnailImage;
