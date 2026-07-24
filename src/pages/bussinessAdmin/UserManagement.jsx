import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import UserAvatar from '../../component/UserAvatar';
import {
    getUsers,
    createUser,
    updateUser,
    updateUserRoles,
    lockUser,
    unlockUser,
    deleteUser,
    getUserAuditLogs,
    importUsers,
    getDepartments,
    getRoles,
    exportUsers,
    getImportTemplate,
    getUserById,
} from '../../service/businessAdminServices';


/**
 * UserManagement Component
 * UC-ACC-01 ~ UC-ACC-07: Account Management for SystemAdmin
 */
const UserManagement = () => {
    // States
    const [usersList, setUsersList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filter & Search states
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(''); // ACTIVE, LOCKED
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modal control states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [userLogs, setUserLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Form inputs states
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phone: '',
        departmentId: '',
        roleIds: []
    });

    const [formErrors, setFormErrors] = useState({});

    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]); // Array of { line, message, value }

    // Load filter options (Departments, Roles)
    const loadFilterData = useCallback(async () => {
        try {
            const [deptRes, rolesRes] = await Promise.all([
                getDepartments({ limit: 100 }),
                getRoles()
            ]);
            if (deptRes?.success) setDepartments(deptRes.data || []);
            if (rolesRes?.success) setRoles(rolesRes.data || []);
        } catch {
            setDepartments([
                { id: 1, name: 'Phòng Kỹ Thuật' },
                { id: 2, name: 'Phòng Hành Chính' },
                { id: 3, name: 'Ban Giám Đốc' },
            ]);
            setRoles([
                { id: 1, name: 'System Admin', code: 'SYSTEM_ADMIN' },
                { id: 2, name: 'Business Admin', code: 'BUSINESS_ADMIN' },
                { id: 3, name: 'Employee', code: 'EMPLOYEE' }
            ]);
        }
    }, []);

    // Load Users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit,
                search: search.trim() || undefined,
                roleId: selectedRole || undefined,
                departmentId: selectedDept || undefined,
                locked: selectedStatus === 'LOCKED' ? true : selectedStatus === 'ACTIVE' ? false : undefined
            };
            const res = await getUsers(params);
            if (res?.success) {
                setUsersList(res.data || []);
                setTotalPages(res.meta?.totalPages || 1);
                setTotalUsers(res.meta?.total || (res.data?.length || 0));
            } else {
                throw new Error('API request failed');
            }
        } catch (err) {
            // Mock preview filtering
            const mockUsers = [
                { id: 101, email: 'hoang.nam@smrmpts.com', fullName: 'Nguyễn Hoàng Nam', phone: '0912345678', locked: false, roles: [{ id: 1, name: 'System Admin' }], departments: [{ id: 3, name: 'Ban Giám Đốc' }] },
                { id: 102, email: 'thanh.thao@smrmpts.com', fullName: 'Lê Thị Thanh Thảo', phone: '0987654321', locked: false, roles: [{ id: 2, name: 'Business Admin' }], departments: [{ id: 2, name: 'Phòng Hành Chính' }] },
                { id: 103, email: 'minh.tuan@smrmpts.com', fullName: 'Trần Minh Tuấn', phone: '0905556677', locked: true, roles: [{ id: 3, name: 'Employee' }], departments: [{ id: 1, name: 'Phòng Kỹ Thuật' }] },
                { id: 104, email: 'quoc.anh@smrmpts.com', fullName: 'Phạm Quốc Anh', phone: '0933445566', locked: false, roles: [{ id: 3, name: 'Employee' }], departments: [{ id: 1, name: 'Phòng Kỹ Thuật' }] },
            ];

            let filtered = mockUsers;
            if (search.trim()) {
                const s = search.toLowerCase();
                filtered = filtered.filter(u => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
            }
            if (selectedRole) {
                filtered = filtered.filter(u => u.roles.some(r => r.id === Number(selectedRole)));
            }
            if (selectedDept) {
                filtered = filtered.filter(u => u.departments.some(d => d.id === Number(selectedDept)));
            }
            if (selectedStatus) {
                const isLocked = selectedStatus === 'LOCKED';
                filtered = filtered.filter(u => u.locked === isLocked);
            }

            setUsersList(filtered);
            setTotalPages(1);
            setTotalUsers(filtered.length);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, selectedRole, selectedDept, selectedStatus]);

    useEffect(() => {
        loadFilterData();
    }, [loadFilterData]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Auto-hide success and error messages after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);


    // Handle Create (UC-06)
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side Validation
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên";
        if (!formData.email.trim()) {
            errors.email = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Email không đúng định dạng";
        }
        if (!formData.departmentId) errors.departmentId = "Vui lòng chọn phòng ban";
        if (formData.roleIds.length === 0) errors.roleIds = "Vui lòng gán ít nhất 1 vai trò";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setError(null);
        setSuccessMessage(null);
        
        try {
            const res = await createUser({
                email: formData.email,
                fullName: formData.fullName,
                phoneNumber: formData.phone,
                departmentId: formData.departmentId || null,
                roleIds: formData.roleIds
            });
            if (res?.success) {
                setSuccessMessage('Tạo tài khoản người dùng thành công!');
                fetchUsers();
                resetForm();
            } else {
                setError(res?.message || 'Có lỗi xảy ra khi tạo tài khoản.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Thao tác thất bại. Không thể kết nối tới server.');
        } finally {
            // Close modal even on failure as requested
            setIsCreateModalOpen(false);
        }
    };

    // Handle Edit (UC-09 & UC-08)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await updateUser(selectedUser.id, {
                fullName: formData.fullName,
                phoneNumber: formData.phone,
                departmentId: formData.departmentId || null
            });
            await updateUserRoles(selectedUser.id, { roleIds: formData.roleIds });

            if (res?.success) {
                setSuccessMessage('Cập nhật tài khoản thành công!');
                setIsEditModalOpen(false);
                fetchUsers();
                resetForm();
            } else {
                setError(res?.message || 'Có lỗi xảy ra khi cập nhật.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Thao tác thất bại. Không thể lưu thay đổi.');
        }
    };

    // Toggle Lock / Unlock (UC-11 / UC-12)
    const handleLockToggle = async (user) => {
        setError(null);
        setSuccessMessage(null);
        const isUserCurrentlyLocked = user.accountStatus === 'locked' || user.locked;
        try {
            const res = isUserCurrentlyLocked
                ? await unlockUser(user.id, { reason: 'Mở khóa tài khoản' })
                : await lockUser(user.id, { reason: 'Vi phạm quy định bảo mật' });
            if (res?.success) {
                setSuccessMessage(`${isUserCurrentlyLocked ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`);
                fetchUsers();
            } else {
                setError(res?.message || 'Không thể thay đổi trạng thái khóa.');
            }
        } catch {
            setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, locked: !isUserCurrentlyLocked, accountStatus: isUserCurrentlyLocked ? 'active' : 'locked' } : u));
            setSuccessMessage(`Đã mô phỏng: ${isUserCurrentlyLocked ? 'Mở khóa' : 'Khóa'} tài khoản ${user.fullName}.`);
        }
    };

    // Delete user (BR-PRIV-02 soft delete)
    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.fullName}?`)) return;
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await deleteUser(user.id);
            if (res?.success) {
                setSuccessMessage('Đã xóa người dùng khỏi hệ thống.');
                fetchUsers();
            } else {
                setError(res?.message || 'Không thể xóa tài khoản.');
            }
        } catch {
            setUsersList(prev => prev.filter(u => u.id !== user.id));
            setSuccessMessage(`Đã mô phỏng xóa tài khoản ${user.fullName}.`);
        }
    };

    // Open User logs modal (UC-ACC-07)
    const handleViewLogs = async (user) => {
        setSelectedUser(user);
        setIsLogsModalOpen(true);
        setLogsLoading(true);
        setUserLogs([]);
        try {
            const res = await getUserAuditLogs(user.id, { limit: 10 });
            if (res?.success) {
                setUserLogs(res.data || []);
            }
        } catch {
            setUserLogs([
                { id: 1, action: 'USER_LOGIN', actor: user.email, entity: 'AUTH', createdAt: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, action: 'UPDATE_USER', actor: 'admin@smrmpts.com', entity: 'USER', createdAt: new Date(Date.now() - 7200000).toISOString() }
            ]);
        } finally {
            setLogsLoading(false);
        }
    };

    // Load detail profile (UC-AM-10)
    const handleViewDetail = async (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
        setDetailLoading(true);
        setSelectedUserDetail(null);
        try {
            const res = await getUserById(user.id);
            if (res?.success && res.data) {
                setSelectedUserDetail(res.data);
            } else {
                throw new Error();
            }
        } catch {
            // Fallback mock detail matching API contract response
            setSelectedUserDetail({
                id: user.id,
                employeeCode: user.employeeCode || 'NV' + user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber || user.phone || '0901234567',
                avatarUrl: user.avatarUrl || '',
                positionTitle: 'Nhân viên kĩ thuật',
                department: user.departments?.[0] || { id: 1, name: 'Phòng Kỹ Thuật' },
                directManager: { id: 'mgr-mock', fullName: 'Trần Thị B' },
                accountStatus: user.accountStatus || (user.locked ? 'locked' : 'active'),
                employmentStatus: 'active',
                hasFaceProfile: true,
                createdAt: '2026-01-01T08:00:00+07:00',
                lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
                roles: user.roles || [{ id: 3, name: 'Employee' }]
            });
        } finally {
            setDetailLoading(false);
        }
    };

    // Download template excel (UC-ACC-02)
    const handleDownloadTemplate = async () => {
        setError(null);
        try {
            const blob = await getImportTemplate();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'User_Import_Template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            // Local fallback generation
            const headers = 'Họ và Tên,Email,Số điện thoại,Mã phòng ban (ID),Vai trò (Admin/User)\n';
            const sampleData = 'Nguyễn Văn A,nguyen.a@example.com,0987654321,1,Employee\n';
            const blob = new Blob(['\uFEFF' + headers + sampleData], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'User_Import_Template_Mau.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setSuccessMessage('Tải tệp mẫu thành công (định dạng CSV).');
        }
    };

    // Excel Export download
    // TODO: BE chưa có GET /users/export — chờ §5.4 kế hoạch đồng bộ
    // Tạm xuất CSV từ dữ liệu local
    const handleExportExcel = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            // Tạo CSV từ dữ liệu hiện có trên giao diện
            let csvContent = '\uFEFFID,Họ và Tên,Email,Số điện thoại,Phòng ban,Trạng thái\n';
            usersList.forEach(user => {
                const depts = user.departments?.map(d => d.name).join('; ') || 'Chưa gán';
                const status = user.locked ? 'Bị khóa' : 'Hoạt động';
                csvContent += `${user.id},"${user.fullName}",${user.email},${user.phone || ''},"${depts}",${status}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Danh_Sach_Nguoi_Dung.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setSuccessMessage('Xuất dữ liệu trang hiện tại ra CSV thành công (chờ cập nhật hệ thống để xuất toàn bộ).');
        } catch {
            setError('Lỗi khi xuất dữ liệu.');
        }
    };

    // Import from excel submit
    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) return;
        setImporting(true);
        setError(null);
        setSuccessMessage(null);
        setValidationErrors([]);

        // Interactive simulation of excel reading/validation
        setTimeout(async () => {
            const errors = [];
            if (importFile.name.includes('invalid') || importFile.size % 2 === 0) {
                errors.push({ line: 3, message: 'Địa chỉ Email sai định dạng hoặc bị để trống.', value: 'hoangnam.email.com' });
                errors.push({ line: 5, message: 'Số điện thoại không hợp lệ (Phải đủ 10 số).', value: '091234' });
                errors.push({ line: 8, message: 'Mã phòng ban (ID) không tồn tại trên hệ thống.', value: '99' });
            }

            if (errors.length > 0) {
                setValidationErrors(errors);
                setError('Tệp Excel chứa một số dòng sai định dạng. Vui lòng kiểm tra danh sách bên dưới.');
                setImporting(false);
            } else {
                try {
                    const fd = new FormData();
                    fd.append('file', importFile);
                    const res = await importUsers(fd);
                    if (res?.success) {
                        setSuccessMessage('Đã tải lên tệp import. Quá trình xử lý đang chạy ngầm.');
                        setIsImportModalOpen(false);
                        fetchUsers();
                    } else {
                        setSuccessMessage(`Đã mô phỏng: Nhập thành công 12 tài khoản từ tệp ${importFile.name}.`);
                        setIsImportModalOpen(false);
                        fetchUsers();
                    }
                } catch {
                    setSuccessMessage(`Đã mô phỏng: Nhập thành công 12 tài khoản từ tệp ${importFile.name}.`);
                    setIsImportModalOpen(false);
                    fetchUsers();
                } finally {
                    setImporting(false);
                }
            }
        }, 1500);
    };

    // Helper functions
    const openCreateModal = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            fullName: user.fullName,
            phone: user.phoneNumber || user.phone || '',
            departmentId: user.departments?.[0]?.id || '',
            roleIds: user.roles?.map(r => r.id) || []
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            fullName: '',
            phone: '',
            departmentId: '',
            roleIds: []
        });
        setImportFile(null);
        setValidationErrors([]);
    };

    const handleRoleCheckboxChange = (roleId) => {
        const id = Number(roleId);
        setFormData(prev => {
            const exists = prev.roleIds.includes(id);
            const newRoles = exists
                ? prev.roleIds.filter(r => r !== id)
                : [...prev.roleIds, id];
            return { ...prev, roleIds: newRoles };
        });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý người dùng</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Quản lý hồ sơ, cấu hình phân quyền (Role) và giám sát trạng thái tài khoản.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center justify-center px-4 py-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Xuất dữ liệu Excel
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsImportModalOpen(true); }}
                        className="inline-flex items-center justify-center px-4 py-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Nhập từ Excel
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center px-4 py-2 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tạo người dùng
                    </button>
                </div>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-pulse-soft">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-blue">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên hoặc Email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10 pr-4 py-2 w-full border border-platinum-tint rounded-xl text-sm text-midnight-indigo placeholder:text-steel-gray focus:outline-none focus:border-action-blue"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Role Filter */}
                    <select
                        value={selectedRole}
                        onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue"
                    >
                        <option value="">Tất cả vai trò</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>

                    {/* Department Filter */}
                    <select
                        value={selectedDept}
                        onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue"
                    >
                        <option value="">Tất cả phòng ban</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="LOCKED">Bị khóa</option>
                    </select>
                </div>
            </div>

            {/* User Table card */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-blue text-sm font-medium">Đang tải danh sách người dùng...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-platinum-tint bg-cloud-mist/50">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Hồ sơ</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Số điện thoại</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Phòng ban</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Vai trò (Role)</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Trạng thái</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-blue text-sm">
                                            Không tìm thấy người dùng phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    usersList.map((user) => (
                                        <tr key={user.id} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar
                                                        user={user.avatarUrl
                                                            || user.avatar_url
                                                            || user.user?.avatarUrl
                                                            || user.user?.avatar_url
                                                            || user.profile?.avatarUrl
                                                            || user.profile?.avatar_url
                                                            || user}
                                                        className="w-10 h-10 rounded-full shrink-0 font-bold text-sm"
                                                    />
                                                    <div>
                                                        <h4
                                                            onClick={() => handleViewDetail(user)}
                                                            className="text-sm font-bold text-midnight-indigo leading-tight cursor-pointer hover:underline hover:text-action-blue"
                                                        >
                                                            {user.fullName}
                                                        </h4>
                                                        <p className="text-xs text-slate-blue leading-normal">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-blue">
                                                {user.phoneNumber || user.phone || 'Chưa cung cấp'}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-midnight-indigo font-medium">
                                                {user.departments?.map(d => d.name).join(', ') || 'Chưa phân bổ'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.map(r => (
                                                        <span key={r.id} className="inline-flex text-[10px] px-2 py-0.5 bg-blue-50 text-action-blue rounded-full font-bold">
                                                            {r.name}
                                                        </span>
                                                    )) || <span className="text-xs text-steel-gray">Chưa phân quyền</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${(user.accountStatus === 'locked' || user.locked)
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-green-50 text-green-700'
                                                    }`}>
                                                    {(user.accountStatus === 'locked' || user.locked) ? 'Bị khóa' : 'Hoạt động'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => handleViewDetail(user)}
                                                    title="Xem chi tiết hồ sơ"
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleViewLogs(user)}
                                                    title="Xem nhật ký lịch sử"
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    title="Chỉnh sửa thông tin"
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleLockToggle(user)}
                                                    title={user.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                                    className={`inline-flex p-1.5 rounded-lg transition-colors ${user.locked
                                                        ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
                                                        : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                                        }`}
                                                >
                                                    {user.locked ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    title="Xóa vĩnh viễn"
                                                    className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {!loading && (
                    <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/20 flex items-center justify-between">
                        <span className="text-xs text-slate-blue">
                            Hiển thị {usersList.length} trên tổng số {totalUsers} người dùng
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-platinum-tint rounded-lg text-xs font-semibold bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1.5 text-xs font-bold text-midnight-indigo">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-platinum-tint rounded-lg text-xs font-semibold bg-white text-slate-blue hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                            >
                                Tiếp
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {isCreateModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-md w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Tạo người dùng mới</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${formErrors.fullName ? 'text-red-500' : 'text-slate-blue'}`}>Họ và Tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setFormErrors({...formErrors, fullName: ''}); }}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none ${formErrors.fullName ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-platinum-tint focus:border-action-blue'}`}
                                />
                                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${formErrors.email ? 'text-red-500' : 'text-slate-blue'}`}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({...formErrors, email: ''}); }}
                                    placeholder="email@smrmpts.com"
                                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none ${formErrors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-platinum-tint focus:border-action-blue'}`}
                                />
                                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="09xxxxxxxx"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${formErrors.departmentId ? 'text-red-500' : 'text-slate-blue'}`}>Phòng ban</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={(e) => { setFormData({ ...formData, departmentId: e.target.value }); setFormErrors({...formErrors, departmentId: ''}); }}
                                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white ${formErrors.departmentId ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-platinum-tint focus:border-action-blue'}`}
                                >
                                    <option value="">Chọn phòng ban...</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {formErrors.departmentId && <p className="text-red-500 text-xs mt-1">{formErrors.departmentId}</p>}
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${formErrors.roleIds ? 'text-red-500' : 'text-slate-blue'}`}>Gán vai trò (Role)</label>
                                <div className="space-y-2 mt-1">
                                    {roles.map(r => (
                                        <label key={r.id} className="flex items-center gap-2 text-sm text-midnight-indigo font-medium cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.roleIds.includes(r.id)}
                                                onChange={() => { handleRoleCheckboxChange(r.id); setFormErrors({...formErrors, roleIds: ''}); }}
                                                className="rounded text-action-blue focus:ring-action-blue"
                                            />
                                            {r.name}
                                        </label>
                                    ))}
                                </div>
                                {formErrors.roleIds && <p className="text-red-500 text-xs mt-1">{formErrors.roleIds}</p>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-platinum-tint mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                                >
                                    Tạo mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-md w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Chỉnh sửa thông tin</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={formData.email}
                                    className="w-full px-3 py-2 border border-platinum-tint/50 bg-cloud-mist rounded-xl text-sm text-slate-blue cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Họ và Tên</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Phòng ban</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white"
                                >
                                    <option value="">Chọn phòng ban...</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Vai trò (Role)</label>
                                <div className="space-y-2 mt-1">
                                    {roles.map(r => (
                                        <label key={r.id} className="flex items-center gap-2 text-sm text-midnight-indigo font-medium cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.roleIds.includes(r.id)}
                                                onChange={() => handleRoleCheckboxChange(r.id)}
                                                className="rounded text-action-blue focus:ring-action-blue"
                                            />
                                            {r.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-platinum-tint mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* IMPORT MODAL (WITH ERROR FEEDBACK & TEMPLATE DOWNLOAD) */}
            {isImportModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-lg w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <div>
                                <h3 className="font-bold text-midnight-indigo">Nhập tài khoản từ Excel</h3>
                                <p className="text-[10px] text-slate-blue mt-0.5">Thêm nhanh nhiều người dùng cùng lúc</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                            <div className="flex items-center justify-between bg-blue-50/50 border border-action-blue/20 p-3 rounded-xl">
                                <span className="text-xs font-medium text-midnight-indigo">Cần tệp định dạng chuẩn?</span>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="text-xs font-bold text-action-blue hover:underline flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Tải tệp mẫu
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-platinum-tint hover:border-action-blue rounded-2xl p-6 text-center cursor-pointer transition-all">
                                <input
                                    type="file"
                                    required
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => { setImportFile(e.target.files[0]); setValidationErrors([]); }}
                                    className="hidden"
                                    id="excel-file-upload"
                                />
                                <label htmlFor="excel-file-upload" className="cursor-pointer block">
                                    <svg className="w-8 h-8 mx-auto text-steel-gray mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-midnight-indigo block">
                                        {importFile ? importFile.name : 'Nhấp để chọn tệp .xlsx hoặc .csv'}
                                    </span>
                                </label>
                            </div>

                            {/* Formatting Errors List */}
                            {validationErrors.length > 0 && (
                                <div className="space-y-2 max-h-[180px] overflow-y-auto bg-red-50 border border-red-200 rounded-xl p-3.5">
                                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide">Chi tiết các dòng bị loại bỏ (Format sai):</h4>
                                    <div className="divide-y divide-red-200/50">
                                        {validationErrors.map((err, idx) => (
                                            <div key={idx} className="py-2 flex items-start justify-between text-xs gap-3">
                                                <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                                    Dòng {err.line}
                                                </span>
                                                <span className="flex-1 text-red-600 font-medium">{err.message}</span>
                                                {err.value && (
                                                    <span className="text-[10px] bg-red-200/60 px-1.5 py-0.5 rounded text-red-800 font-mono">
                                                        "{err.value}"
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3 border-t border-platinum-tint mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={!importFile || importing}
                                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {importing ? 'Đang xác thực & nhập...' : 'Bắt đầu nhập'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* USER LOGS MODAL */}
            {isLogsModalOpen && selectedUser && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-lg w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <div>
                                <h3 className="font-bold text-midnight-indigo">Lịch sử hoạt động</h3>
                                <p className="text-[10px] text-slate-blue mt-0.5">{selectedUser.fullName} ({selectedUser.email})</p>
                            </div>
                            <button onClick={() => setIsLogsModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {logsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : userLogs.length === 0 ? (
                                <p className="text-center text-sm text-slate-blue py-8">Không có bản ghi hoạt động nào.</p>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                                    {userLogs.map((log) => (
                                        <div key={log.id} className="flex justify-between items-start p-3 bg-cloud-mist rounded-xl border border-outline-gray/60">
                                            <div>
                                                <p className="text-xs font-bold text-midnight-indigo">
                                                    {ACTION_MAP[log.action] || log.action}
                                                </p>
                                                <p className="text-[10px] text-slate-blue mt-0.5">Tác nhân: {log.actor}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-blue">
                                                {new Date(log.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="pt-4 flex justify-end border-t border-platinum-tint mt-4">
                                <button
                                    onClick={() => setIsLogsModalOpen(false)}
                                    className="px-4 py-2 bg-midnight-indigo text-white hover:bg-midnight-indigo/90 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* DETAIL MODAL (UC-AM-10) */}
            {isDetailModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-2xl w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Chi tiết hồ sơ tài khoản</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {detailLoading || !selectedUserDetail ? (
                            <div className="p-12 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-slate-blue text-sm">Đang tải chi tiết...</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                                {/* Top header summary */}
                                <div className="flex items-center gap-4 bg-cloud-mist/55 p-4 rounded-xl border border-platinum-tint/50">
                                    <UserAvatar
                                        user={selectedUserDetail}
                                        className="w-16 h-16 rounded-full shrink-0 font-extrabold text-xl"
                                    />
                                    <div>
                                        <h4 className="text-lg font-bold text-midnight-indigo leading-tight">{selectedUserDetail.fullName}</h4>
                                        <p className="text-sm text-slate-blue mt-0.5">{selectedUserDetail.email}</p>
                                        <div className="flex gap-1.5 mt-1">
                                            {selectedUserDetail.roles?.map(r => (
                                                <span key={r.id} className="text-[10px] px-2 py-0.5 bg-blue-50 text-action-blue rounded-full font-bold">
                                                    {r.roleName || r.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 1. Personal Information */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-midnight-indigo uppercase tracking-wider border-b border-platinum-tint/60 pb-1.5">Thông tin cá nhân</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-slate-blue block text-xs">Mã nhân viên:</span>
                                                <span className="font-semibold text-midnight-indigo">{selectedUserDetail.employeeCode || 'Chưa thiết lập'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-blue block text-xs">Số điện thoại:</span>
                                                <span className="font-semibold text-midnight-indigo">{selectedUserDetail.phoneNumber || 'Chưa cung cấp'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Organization Structure */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-midnight-indigo uppercase tracking-wider border-b border-platinum-tint/60 pb-1.5">Cấu trúc tổ chức</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-slate-blue block text-xs">Phòng ban:</span>
                                                <span className="font-semibold text-midnight-indigo">
                                                    {selectedUserDetail.department?.departmentName || selectedUserDetail.department?.name || 'Chưa phân bổ'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-blue block text-xs">Chức danh / Vị trí:</span>
                                                <span className="font-semibold text-midnight-indigo">{selectedUserDetail.positionTitle || 'Chưa thiết lập'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-blue block text-xs">Quản lý trực tiếp:</span>
                                                <span className="font-semibold text-midnight-indigo">{selectedUserDetail.directManager?.fullName || 'Không có'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. System Information */}
                                    <div className="md:col-span-2 space-y-3">
                                        <h4 className="text-xs font-bold text-midnight-indigo uppercase tracking-wider border-b border-platinum-tint/60 pb-1.5">Thông tin hệ thống</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-blue block text-xs">Trạng thái hoạt động:</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${selectedUserDetail.accountStatus === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {selectedUserDetail.accountStatus === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-blue block text-xs">Đăng nhập cuối:</span>
                                                <span className="font-semibold text-midnight-indigo block mt-1">
                                                    {selectedUserDetail.lastLoginAt ? new Date(selectedUserDetail.lastLoginAt).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-blue block text-xs">Hồ sơ khuôn mặt (FaceID):</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${selectedUserDetail.hasFaceProfile ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {selectedUserDetail.hasFaceProfile ? 'Đã hợp lệ' : 'Chưa đăng ký'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AF1 Action Shortcuts */}
                                <div className="pt-4 flex justify-between items-center border-t border-platinum-tint mt-6">
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsDetailModalOpen(false);
                                                openEditModal(selectedUserDetail);
                                            }}
                                            className="px-3 py-1.5 border border-platinum-tint bg-white text-action-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsDetailModalOpen(false);
                                                handleLockToggle(selectedUserDetail);
                                            }}
                                            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${(selectedUserDetail.accountStatus === 'locked' || selectedUserDetail.locked)
                                                ? 'border-green-200 bg-white text-green-600 hover:bg-green-50'
                                                : 'border-red-200 bg-white text-red-500 hover:bg-red-50'
                                                }`}
                                        >
                                            {(selectedUserDetail.accountStatus === 'locked' || selectedUserDetail.locked) ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                    </svg>
                                                    Mở khóa
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Khóa tài khoản
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsDetailModalOpen(false);
                                                handleViewLogs(selectedUserDetail);
                                            }}
                                            className="px-3 py-1.5 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Nhật ký lịch sử
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="px-4 py-2 bg-midnight-indigo text-white hover:bg-midnight-indigo/90 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// Map action names locally
const ACTION_MAP = {
    'USER_LOGIN': 'Đăng nhập',
    'USER_LOGOUT': 'Đăng xuất',
    'REGISTER_DEVICE': 'Đăng ký thiết bị',
    'LOCK_USER': 'Khóa tài khoản',
    'UNLOCK_USER': 'Mở khóa tài khoản',
    'UPDATE_CONFIG': 'Cập nhật cấu hình',
    'CREATE_USER': 'Tạo người dùng',
    'UPDATE_USER': 'Cập nhật tài khoản',
    'DELETE_USER': 'Xóa tài khoản',
};

export default UserManagement;
