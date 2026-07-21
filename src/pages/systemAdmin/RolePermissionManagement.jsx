import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
    getRoles, getPermissions, getRolePermissions, 
    assignRolePermissions, createRole, updateRole 
} from '../../service/permissionServices';
import { 
    Shield, Plus, Save, AlertTriangle, Key, Search, RefreshCw, CheckCircle 
} from 'lucide-react';

const RolePermissionManagement = () => {
    // Data states
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]); // IDs of permissions for the selected role
    
    // UI states
    const [loading, setLoading] = useState(true);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        roleCode: '',
        roleName: '',
        description: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                getRoles({ limit: 100 }),
                getPermissions({ limit: 500 })
            ]);
            
            if (rolesRes?.success && permsRes?.success) {
                setRoles(rolesRes.data || []);
                setPermissions(permsRes.data || []);
            } else {
                setError('Không thể tải dữ liệu vai trò hoặc quyền hệ thống.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi khi tải dữ liệu hệ thống.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle selecting a role
    const handleSelectRole = async (role) => {
        setSelectedRole(role);
        setPermissionsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await getRolePermissions(role.id);
            if (res?.success) {
                // BE might return full permission objects or just IDs. Assuming full objects.
                const assignedIds = (res.data || []).map(p => p.id);
                setRolePermissions(assignedIds);
            }
        } catch (err) {
            setError('Không thể tải danh sách quyền của vai trò này.');
        } finally {
            setPermissionsLoading(false);
        }
    };

    // Handle toggling a permission checkbox
    const handleTogglePermission = (permissionId) => {
        setRolePermissions(prev => 
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    // Save assigned permissions
    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await assignRolePermissions(selectedRole.id, rolePermissions);
            if (res?.success) {
                setSuccessMessage(`Đã cập nhật quyền cho vai trò ${selectedRole.roleName}.`);
            } else {
                setError(res?.message || 'Không thể lưu phân quyền.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi khi lưu phân quyền.');
        } finally {
            setSaving(false);
        }
    };

    // Create Role
    const handleCreateRoleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await createRole(createForm);
            if (res?.success) {
                setSuccessMessage('Tạo vai trò mới thành công!');
                setIsCreateRoleOpen(false);
                setCreateForm({ roleCode: '', roleName: '', description: '' });
                fetchData();
            } else {
                setError(res?.message || 'Tạo vai trò thất bại.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi tạo vai trò.');
        }
    };

    // Filter permissions by module
    const groupedPermissions = permissions.reduce((acc, curr) => {
        const module = curr.moduleCode || 'other';
        if (!acc[module]) acc[module] = [];
        acc[module].push(curr);
        return acc;
    }, {});

    const filteredModules = Object.keys(groupedPermissions).filter(module => {
        if (!searchTerm) return true;
        return groupedPermissions[module].some(p => 
            p.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.permissionCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="p-6 h-full flex flex-col bg-snow-white">
            <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý Phân quyền</h1>
                    <p className="text-sm text-slate-blue mt-1">Cấu hình các vai trò và gán quyền chi tiết cho từng vai trò trong hệ thống.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start animate-fade-in-up">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start animate-fade-in-up">
                    <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 animate-fade-in-up delay-100">
                {/* ROLES LIST PANE */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm-1 border border-platinum-tint overflow-hidden">
                    <div className="p-4 border-b border-platinum-tint bg-cloud-mist/30 flex justify-between items-center">
                        <h2 className="font-bold text-midnight-indigo flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-action-blue" />
                            Vai trò hệ thống
                        </h2>
                        <button
                            onClick={() => setIsCreateRoleOpen(true)}
                            className="p-1.5 bg-action-blue text-white rounded-lg hover:bg-glacier-blue transition-colors"
                            title="Tạo vai trò mới"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? (
                            Array(4).fill(0).map((_, idx) => (
                                <div key={idx} className="h-16 bg-cloud-mist rounded-xl animate-pulse"></div>
                            ))
                        ) : roles.length === 0 ? (
                            <div className="text-center py-8 text-slate-blue text-sm">Chưa có vai trò nào.</div>
                        ) : (
                            roles.map(role => (
                                <div 
                                    key={role.id}
                                    onClick={() => handleSelectRole(role)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
                                        selectedRole?.id === role.id 
                                        ? 'border-action-blue bg-blue-50/50 shadow-sm' 
                                        : 'border-platinum-tint bg-white hover:border-action-blue/50 hover:bg-cloud-mist/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-midnight-indigo">{role.roleName}</h3>
                                        {role.isSystemRole && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">SYSTEM</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-blue font-mono mb-2">{role.roleCode}</p>
                                    <p className="text-xs text-slate-blue line-clamp-2">{role.description || 'Không có mô tả'}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* PERMISSIONS MATRIX PANE */}
                <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-2xl shadow-sm-1 border border-platinum-tint overflow-hidden">
                    {selectedRole ? (
                        <>
                            <div className="p-4 border-b border-platinum-tint bg-cloud-mist/30 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-midnight-indigo flex items-center">
                                        <Key className="w-5 h-5 mr-2 text-action-blue" />
                                        Phân quyền: {selectedRole.roleName}
                                    </h2>
                                    <p className="text-xs text-slate-blue mt-1">Cấu hình các quyền thao tác cho vai trò này</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-blue" />
                                        <input 
                                            type="text" 
                                            placeholder="Tìm quyền..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-48 pl-9 pr-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSavePermissions}
                                        disabled={saving || permissionsLoading}
                                        className="inline-flex items-center px-4 py-2 bg-action-blue text-white rounded-xl text-sm font-semibold hover:bg-glacier-blue transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Lưu cấu hình
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                {permissionsLoading ? (
                                    <div className="flex flex-col items-center justify-center h-40">
                                        <RefreshCw className="w-6 h-6 text-action-blue animate-spin mb-3" />
                                        <span className="text-sm text-slate-blue">Đang tải cấu hình quyền...</span>
                                    </div>
                                ) : filteredModules.length === 0 ? (
                                    <div className="text-center py-12 text-slate-blue text-sm">Không tìm thấy quyền nào.</div>
                                ) : (
                                    <div className="space-y-6">
                                        {filteredModules.map(module => (
                                            <div key={module} className="bg-cloud-mist/20 border border-platinum-tint rounded-xl overflow-hidden">
                                                <div className="bg-cloud-mist/40 px-4 py-2 border-b border-platinum-tint">
                                                    <h3 className="font-bold text-midnight-indigo text-sm uppercase">{module}</h3>
                                                </div>
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {groupedPermissions[module]
                                                        .filter(p => !searchTerm || p.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) || p.permissionCode.toLowerCase().includes(searchTerm.toLowerCase()))
                                                        .map(p => (
                                                        <label key={p.id} className="flex items-start space-x-3 cursor-pointer group">
                                                            <div className="flex-shrink-0 pt-0.5">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 text-action-blue border-platinum-tint rounded rounded focus:ring-action-blue"
                                                                    checked={rolePermissions.includes(p.id)}
                                                                    onChange={() => handleTogglePermission(p.id)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-midnight-indigo group-hover:text-action-blue transition-colors">{p.permissionName}</p>
                                                                <p className="text-xs text-slate-blue font-mono mt-0.5">{p.permissionCode}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-blue">
                            <Shield className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium text-midnight-indigo mb-1">Chưa chọn vai trò</p>
                            <p className="text-sm">Vui lòng chọn một vai trò bên danh sách để cấu hình phân quyền.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE ROLE MODAL */}
            {isCreateRoleOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4 animate-fade-in-up">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-xl max-w-md w-full flex flex-col">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Tạo vai trò mới</h3>
                            <button onClick={() => setIsCreateRoleOpen(false)} className="text-slate-blue hover:text-midnight-indigo">✕</button>
                        </div>
                        <form onSubmit={handleCreateRoleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mã vai trò <span className="text-red-500">*</span></label>
                                <input required type="text" value={createForm.roleCode} onChange={e => setCreateForm({...createForm, roleCode: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-mono" placeholder="VD: GUEST_USER" />
                                <p className="text-[10px] text-slate-blue mt-1">Chỉ chứa chữ hoa A-Z, số 0-9 và dấu gạch dưới.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tên hiển thị <span className="text-red-500">*</span></label>
                                <input required type="text" value={createForm.roleName} onChange={e => setCreateForm({...createForm, roleName: e.target.value})} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm" placeholder="VD: Người dùng khách" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mô tả</label>
                                <textarea rows="3" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm resize-none" placeholder="Mô tả quyền hạn của vai trò này..." />
                            </div>
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-platinum-tint">
                                <button type="button" onClick={() => setIsCreateRoleOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-blue border border-platinum-tint rounded-xl hover:bg-cloud-mist">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-action-blue rounded-xl hover:bg-glacier-blue">Tạo mới</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default RolePermissionManagement;
