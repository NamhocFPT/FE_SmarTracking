import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../../service/authService';
import logo from '../../../assets/images/logo.png';
import AvatarReminderModal from '../../../component/AvatarReminder/AvatarReminderModal';
import UserAvatar from '../../../component/UserAvatar';
import ChangePasswordModal from '../../../component/ChangePasswordModal';

const navigationItems = [
    { label: 'Trang chủ', to: '/employee', end: true },
    {
        label: 'Cuộc họp',
        isDropdown: true,
        children: [
            { label: 'Lịch cá nhân', to: '/employee/schedule' },
            { label: 'Đăng ký họp', to: '/employee/book' },
        ]
    },
    { label: 'Tài liệu họp', to: '/employee/recordings' }
];

const footerLinks = [
    { label: 'Hỗ trợ', to: '#' },
    { label: 'Tài liệu', to: '#' },
    { label: 'Quyền riêng tư', to: '#' },
];

const EmployeeLayout = () => {
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
            // silent
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

    const handleLogout = useCallback(async () => {
        try {
            await logout();
        } catch {
            // silent
        } finally {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const handleProfile = useCallback(() => {
        setIsProfileMenuOpen(false);
        navigate('/employee/profile');
    }, [navigate]);

    const handleMyVehicles = useCallback(() => {
        setIsProfileMenuOpen(false);
        navigate('/employee/my-vehicles');
    }, [navigate]);

    const handleChangePassword = useCallback(() => {
        setIsProfileMenuOpen(false);
        setIsChangePasswordOpen(true);
    }, []);

    const displayName = currentUser?.fullName || 'Nhân viên';
    const displayRole = 'Nhân viên';

    return (
        <div className="min-h-screen flex flex-col bg-cloud-mist">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-platinum-tint">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 px-6 lg:px-12">
                    {/* Left: Logo + Nav */}
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <NavLink
                            to="/employee"
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
                                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist flex items-center gap-1 bg-transparent border-0"
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
                                                                `block px-4 py-2.5 text-sm transition-colors no-underline ${isActive
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
                        <button
                            type="button"
                            aria-label="Notifications"
                            onClick={() => navigate('/employee/notifications')}
                            className="relative p-2 rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist transition-colors duration-200"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                        </button>

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
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-semibold text-midnight-indigo leading-tight">
                                        {displayName}
                                    </span>
                                    <span className="text-xs text-slate-blue leading-tight">
                                        {displayRole}
                                    </span>
                                </div>

                                <UserAvatar
                                    user={currentUser}
                                    name={displayName}
                                    className="w-9 h-9 rounded-full font-bold text-sm ring-2 ring-action-blue/20"
                                />

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

                            {isProfileMenuOpen && (
                                <div
                                    role="menu"
                                    aria-label="User menu"
                                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-outline-gray bg-white shadow-sm-2 overflow-hidden animate-fade-in"
                                >
                                    <div className="px-4 py-3 border-b border-outline-gray bg-cloud-mist">
                                        <p className="text-sm font-semibold text-midnight-indigo truncate">{displayName}</p>
                                        <p className="text-xs text-slate-blue truncate">{currentUser?.email || 'employee@smrmpts.com'}</p>
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
                <AvatarReminderModal />
                <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="w-full bg-white border-t border-platinum-tint">
                <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-12 py-5">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-midnight-indigo">
                            SmarTracking
                        </span>
                        <span className="text-xs text-slate-blue">
                            © 2026 Trung tâm Điều hành Thông minh SmarTracking. Trạng thái: Hoạt động.
                        </span>
                    </div>

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

export default EmployeeLayout;
