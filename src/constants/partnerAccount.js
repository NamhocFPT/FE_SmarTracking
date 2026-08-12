// ID cố định của department "Đối tác" — không đổi, dùng để nhận diện tài khoản đối tác
export const PARTNER_DEPARTMENT_ID = '7c3e2f1a-4b6a-4f2e-9d8c-1a2b3c4d5e6f';

export const isPartnerAccount = (user) =>
    user?.departmentId === PARTNER_DEPARTMENT_ID;

// Trả 'active' | 'expiring_soon' | 'expired' | null
export const getExpiryStatus = (accountExpiresAt) => {
    if (!accountExpiresAt) return null;
    const diffMs = new Date(accountExpiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'expired';
    if (diffMs <= 24 * 60 * 60 * 1000) return 'expiring_soon';
    return 'active';
};

export const getExpiryLabel = (accountExpiresAt) => {
    if (!accountExpiresAt) return null;
    const diffMs = new Date(accountExpiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Hết hạn';
    const diffH = diffMs / (1000 * 60 * 60);
    if (diffH < 24) return `Còn ${Math.ceil(diffH)}h`;
    const diffD = Math.ceil(diffH / 24);
    return `Còn ${diffD} ngày`;
};

// Tạo FormData cho POST /users với accountType='partner'
// roleIds phải append từng phần tử — multer/NestJS xử lý dạng repeated field
export const buildPartnerFormData = ({ fullName, email, roleIds, avatarFile, accountExpiresAt }) => {
    const fd = new FormData();
    fd.append('fullName', fullName);
    fd.append('email', email);
    fd.append('accountType', 'partner');
    fd.append('accountExpiresAt', accountExpiresAt);
    fd.append('avatarFile', avatarFile);
    roleIds.forEach((id) => fd.append('roleIds', id));
    return fd;
};
