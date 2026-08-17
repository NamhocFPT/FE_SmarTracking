export const getCurrentPermissions = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return Array.isArray(user?.permissions) ? user.permissions : [];
    } catch {
        return [];
    }
};

// required: permission code, or array of codes (ANY-of by default).
// No required permission means the item/route is always visible.
export const hasPermission = (required) => {
    if (!required) return true;
    const requiredList = Array.isArray(required) ? required : [required];
    const owned = getCurrentPermissions();
    return requiredList.some(code => owned.includes(code));
};

// True when a caught API error is specifically a permission-denial (BE PermissionsGuard
// always throws `error.code: 'FORBIDDEN'` for this — see permissions.guard.ts). request.js
// doesn't attach the HTTP status to thrown errors, so `error.code` is the only reliable signal.
export const isForbiddenError = (err) => err?.error?.code === 'FORBIDDEN';
