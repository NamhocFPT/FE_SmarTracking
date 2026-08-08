import './Skeleton.css';

/**
 * Reusable Skeleton Loading Component
 * 
 * @param {string} variant - 'text' | 'heading' | 'circle' | 'button' | 'input' | 'rect' | 'badge'
 * @param {string|number} width - CSS width value (e.g. '100%', '200px', 120)
 * @param {string|number} height - CSS height value (overrides variant default)
 * @param {string} className - Additional CSS classes
 * @param {boolean} pulse - Use pulse animation instead of shimmer wave
 * @param {number} count - Render multiple skeleton elements
 * @param {number} gap - Gap between multiple elements (px)
 * @param {object} style - Additional inline styles
 */
const Skeleton = ({
    variant = 'text',
    width,
    height,
    className = '',
    pulse = false,
    count = 1,
    gap = 12,
    style = {},
    ...rest
}) => {
    const baseClass = [
        'skeleton',
        `skeleton--${variant}`,
        pulse ? 'skeleton--pulse' : '',
        className
    ].filter(Boolean).join(' ');

    const computedStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
    };

    if (count > 1) {
        return (
            <div className="skeleton-group" style={{ gap: `${gap}px` }}>
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={baseClass}
                        style={{
                            ...computedStyle,
                            // Stagger widths slightly for text lines to look natural
                            ...(variant === 'text' && !width ? {
                                width: `${100 - (index % 3) * 15}%`
                            } : {})
                        }}
                        aria-hidden="true"
                        {...rest}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={baseClass}
            style={computedStyle}
            aria-hidden="true"
            {...rest}
        />
    );
};

/**
 * Skeleton wrapper with fade-out transition
 * Wraps skeleton content and fades out when `loading` becomes false
 */
export const SkeletonWrapper = ({ loading, children, fallback }) => {
    if (loading) {
        return (
            <div className="skeleton-fade-enter" role="status" aria-label="Đang tải nội dung...">
                <span className="sr-only">Đang tải...</span>
                {children}
            </div>
        );
    }

    return fallback || null;
};

export default Skeleton;
