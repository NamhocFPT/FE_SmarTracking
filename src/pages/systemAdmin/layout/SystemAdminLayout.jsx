import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../../service/authService';
import logo from '../../../assets/images/logo.png';
import BiometricReminderModal from '../../../component/BiometricReminder/BiometricReminderModal';
import UserAvatar from '../../../component/UserAvatar';
import ChangePasswordModal from '../../../component/ChangePasswordModal';
import NotificationBell from '../../../component/NotificationBell';

/**
 * Navigation items cho SystemAdmin role
 * Mapping theo UC catalog:
 * - Tổng quan → Dashboard (UC-RPT-01)
 * - Người dùng → User Management (UC-ACC-01~07)
 * - Thiết bị IoT → IoT Device (UC-IOT-01~06)
 * - Nhật ký hệ thống → Audit Logs (UC-CFG-02)
 * - Cài đặt → System Config (UC-CFG-01, UC-NS-06)
 */
const navigationItems = [
    {
        label: 'Bảng điều khiển',
        to: '/system-admin',
        end: true,
    },

    {
        label: 'Hệ thống',
        isDropdown: true,
        children: [
            {
                label: 'Vai trò & Phân quyền',
                to: '/system-admin/roles-permissions',
            },
            {
                label: 'Nhật ký kiểm toán',
                to: '/system-admin/audit-logs',
            },
            {
                label: 'Cấu hình hệ thống',
                to: '/system-admin/settings',
            },
        ],
    },

    {
        label: 'Hạ tầng & AI',
        isDropdown: true,
        children: [
            {
                label: 'Thiết bị IoT',
                to: '/system-admin/devices',
            },
            {
                label: 'Thiết bị',
                to: '/system-admin/equipments',
            },
            {
                label: 'Khu vực giám sát',
                to: '/system-admin/zones',
            },
            {
                label: 'Danh sách giám sát',
                to: '/system-admin/person-control-list',
            },
            {
                label: 'Phòng họp',
                to: '/system-admin/rooms',
            },
            {
                label: 'Nhật ký ra/vào phòng',
                to: '/system-admin/room-access-logs',
            },
            {
                label: 'Hệ thống ANPR',
                to: '/system-admin/anpr-management',
            },
            {
                label: 'Danh sách biển số giám sát',
                to: '/system-admin/vehicle-control-list',
            },
            {
                label: 'Đăng ký phương tiện',
                to: '/system-admin/vehicle-registrations',
            },
            {
                label: 'Kiểm soát cổng',
                to: '/system-admin/gate-access',
            },
            {
                label: 'Hành trình khuôn viên',
                to: '/system-admin/user-journey',
            },
            {
                label: 'Cảnh báo an ninh',
                to: '/system-admin/security-alerts',
            },
            {
                label: 'Quy tắc cảnh báo',
                to: '/system-admin/alert-rules',
            },
        ],
    },

    {
        label: 'Cuộc họp',
        isDropdown: true,
        children: [
            {
                label: 'Lịch của tôi',
                to: '/system-admin/schedule',
            },
            {
                label: 'Đăng ký cuộc họp',
                to: '/system-admin/book',
            },
            {
                label: 'Vận hành phòng họp',
                to: '/system-admin/room-operations',
            },
        ],
    },

    {
        label: 'Báo cáo',
        isDropdown: true,
        children: [
            {
                label: 'Hiệu suất phòng họp',
                to: '/system-admin/room-analytics',
            },
            {
                label: 'Tỷ lệ đúng giờ',
                to: '/system-admin/attendance-analytics',
            },
        ],
    },
];

const footerLinks = [
    { label: 'Hỗ trợ', to: '#' },
    { label: 'Tài liệu', to: '#' },
    { label: 'Quyền riêng tư', to: '#' },
];

const SystemAdminLayout = () => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const profileMenuRef = useRef(null);
    const navRef = useRef(null);
    const navigate = useNavigate();

    // Load user info from localStorage
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch {
            // silent - user data may not exist
        }
    }, []);

    // Close profile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (navRef.current && !navRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await logout();
        } catch {
            // logout clears tokens in finally block
        } finally {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Handle profile click
    const handleProfile = useCallback(() => {
        setIsProfileMenuOpen(false);
        // Navigate to profile page
        navigate('/system-admin/profile');
    }, [navigate]);

    const handleMyVehicles = useCallback(() => {
        setIsProfileMenuOpen(false);
        navigate('/system-admin/my-vehicles');
    }, [navigate]);

    const handleChangePassword = useCallback(() => {
        setIsProfileMenuOpen(false);
        setIsChangePasswordOpen(true);
    }, []);

    const displayName = currentUser?.fullName || 'Quản trị viên';
    const displayRole = 'Quản trị hệ thống';

    return (
        <div className="min-h-screen flex flex-col bg-cloud-mist">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-platinum-tint">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 px-6 lg:px-12">
                    {/* Left: Logo + Nav */}
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <NavLink
                            to="/system-admin"
                            className="flex items-center gap-2 no-underline"
                            aria-label="SmarTracking home"
                        >
                            <img src={logo} alt="SmarTracking Logo" className="w-12 h-12 object-contain" />
                            <span className="text-midnight-indigo font-bold text-xl tracking-tight hidden sm:block">
                                SmarTracking
                            </span>
                        </NavLink>

                        {/* Navigation */}
                        <nav
                            ref={navRef}
                            aria-label="Primary navigation"
                            className="hidden md:flex items-center gap-1"
                        >
                            {navigationItems.map((item) => (
                                item.isDropdown ? (
                                    <div
                                        key={item.label}
                                        className="relative"
                                        onMouseEnter={() => setOpenDropdown(item.label)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist flex items-center gap-1"
                                        >
                                            {item.label}
                                            <svg className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {openDropdown === item.label && (
                                            <div className="absolute top-full left-0 pt-1 w-48 z-50">
                                                <div className="bg-white border border-platinum-tint rounded-xl shadow-lg overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                                    {item.children.map(child => (
                                                        <NavLink
                                                            key={child.label}
                                                            to={child.to}
                                                            end={child.end || false}
                                                            onClick={() => setOpenDropdown(null)}
                                                            className={({ isActive }) =>
                                                                `block px-4 py-2.5 text-sm transition-colors ${isActive
                                                                    ? 'text-action-blue bg-blue-50 font-bold'
                                                                    : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist'
                                                                }`
                                                            }
                                                        >
                                                            {child.label}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        key={item.label}
                                        to={item.to}
                                        end={item.end || false}
                                        className={({ isActive }) =>
                                            `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline whitespace-nowrap ${isActive
                                                ? 'text-action-blue bg-blue-50'
                                                : 'text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist'
                                            }`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                )
                            ))}
                        </nav>
                    </div>

                    {/* Right: Notification + Profile */}
                    <div className="flex items-center gap-4">
                        {/* Notification bell */}
                        <NotificationBell basePath="/system-admin" />

                        {/* Divider */}
                        <div className="w-px h-6 bg-platinum-tint" aria-hidden="true" />

                        {/* Profile dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                type="button"
                                aria-haspopup="menu"
                                aria-expanded={isProfileMenuOpen}
                                aria-label="Open user menu"
                                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-cloud-mist transition-colors duration-200"
                            >
                                {/* User info */}
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-semibold text-midnight-indigo leading-tight">
                                        {displayName}
                                    </span>
                                    <span className="text-xs text-slate-blue leading-tight">
                                        {displayRole}
                                    </span>
                                </div>

                                {/* Avatar */}
                                <UserAvatar
                                    user={currentUser}
                                    name={displayName}
                                    className="w-9 h-9 rounded-full font-bold text-sm ring-2 ring-action-blue/20"
                                />

                                {/* Chevron */}
                                <svg
                                    className={`w-4 h-4 text-slate-blue transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown menu */}
                            {isProfileMenuOpen && (
                                <div
                                    role="menu"
                                    aria-label="User menu"
                                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-outline-gray bg-white shadow-sm-2 overflow-hidden animate-fade-in"
                                >
                                    {/* User info header */}
                                    <div className="px-4 py-3 border-b border-outline-gray bg-cloud-mist">
                                        <p className="text-sm font-semibold text-midnight-indigo truncate">{displayName}</p>
                                        <p className="text-xs text-slate-blue truncate">{currentUser?.email || 'admin@smrmpts.com'}</p>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleProfile}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-midnight-indigo hover:bg-cloud-mist transition-colors duration-150"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Hồ sơ cá nhân
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleMyVehicles}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-midnight-indigo hover:bg-cloud-mist transition-colors duration-150"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="8" rx="2" ry="2"></rect>
                                                <path d="M19 11l-2-4H7L5 11"></path>
                                                <circle cx="7" cy="19" r="2"></circle>
                                                <circle cx="17" cy="19" r="2"></circle>
                                            </svg>
                                            Xe của tôi
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleChangePassword}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-midnight-indigo hover:bg-cloud-mist transition-colors duration-150"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            Đổi mật khẩu
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16,17 21,12 16,7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== MAIN CONTENT ========== */}
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
                <Outlet />
                <BiometricReminderModal />
                <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="w-full bg-white border-t border-platinum-tint">
                <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-12 py-5">
                    {/* Left: Brand + Copyright */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-midnight-indigo">
                            SmarTracking
                        </span>
                        <span className="text-xs text-slate-blue">
                            © 2026 Trung tâm Điều hành Thông minh SmarTracking. Trạng thái: Hoạt động.
                        </span>
                    </div>

                    {/* Right: Version + Links */}
                    <div className="flex items-center gap-6">
                        <span className="text-xs font-semibold text-action-blue">
                            v2.0.0-beta
                        </span>
                        <nav aria-label="Footer links" className="flex items-center gap-4">
                            {footerLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.to}
                                    className="text-xs font-medium text-slate-blue hover:text-action-blue transition-colors duration-200 no-underline"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SystemAdminLayout;
