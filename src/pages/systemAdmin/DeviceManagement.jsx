import { Cpu } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { createPortal } from 'react-dom';
import {
    getDevices,
    registerDevice,
    updateDevice,
    getRooms,
    enableDevice,
    disableDevice,
    assignDeviceRoom,
    configDeviceRtsp,
    rotateFaceServerToken,
    revokeFaceServerToken,
    checkDeviceAvailability
} from '../../service/sysAdminServices';

/**
 * DeviceManagement Component
 * UC-IOT-01 ~ UC-IOT-06: IoT Device Management for SystemAdmin
 * Includes:
 * 1. List View with full filters & actions (Edit, Unregister)
 * 2. Visual Map View detailing rooms and their active device health status
 * 3. Validation for IP and MAC address inputs
 */
const DeviceManagement = () => {
    // States
    const [devicesList, setDevicesList] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form / Alerts / Modal states
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // FE-5: Assign Room Modal
    const [isAssignRoomModalOpen, setIsAssignRoomModalOpen] = useState(false);
    const [assignRoomDeviceId, setAssignRoomDeviceId] = useState(null);
    const [assignRoomValue, setAssignRoomValue] = useState('');

    // FE-5: RTSP Config Modal
    const [isRtspModalOpen, setIsRtspModalOpen] = useState(false);
    const [rtspDeviceId, setRtspDeviceId] = useState(null);
    const [rtspUrl, setRtspUrl] = useState('');

    // FE-5: Token Display Modal (chỉ hiện 1 lần)
    const [tokenModalData, setTokenModalData] = useState(null); // { token, deviceName }
    const [tokenCopied, setTokenCopied] = useState(false);

    // FE-5: Confirmation Modal (replaces window.confirm)
    const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, type }

    // Filters states
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Form input states
    const [formData, setFormData] = useState({
        deviceCode: '',
        deviceName: '',
        deviceType: 'camera',
        roomId: '',
        ipAddress: '',
        macAddress: '',
        streamUrl: '',
        agentVersion: 'v1.0.0'
    });

    // Load rooms and devices
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [roomsRes, devicesRes] = await Promise.all([
                getRooms({ limit: 100 }),
                getDevices({ limit: 100 })
            ]);

            if (roomsRes?.success) setRooms(roomsRes.data || []);
            if (devicesRes?.success) setDevicesList(devicesRes.data || []);
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Không thể tải dữ liệu thiết bị và phòng họp.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-hide alert boxes
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Format IP / MAC Address Validation Checkers
    const validateIP = (ip) => {
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipPattern.test(ip);
    };

    const validateMAC = (mac) => {
        const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macPattern.test(mac);
    };

    // Form handlers
    const openRegisterModal = () => {
        setFormData({
            deviceCode: '',
            deviceName: '',
            deviceType: 'camera',
            roomId: '',
            ipAddress: '',
            macAddress: '',
            streamUrl: '',
            agentVersion: 'v1.0.0'
        });
        setIsRegisterModalOpen(true);
    };

    const openEditModal = (device) => {
        setSelectedDevice(device);
        setFormData({
            deviceCode: device.device_code || '',
            deviceName: device.device_name || '',
            deviceType: device.device_type || 'camera',
            roomId: device.room_id || '',
            ipAddress: device.ip_address || '',
            macAddress: device.mac_address || '',
            streamUrl: device.stream_url || '',
            agentVersion: device.agent_version || 'v1.0.0'
        });
        setIsEditModalOpen(true);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Validation checks
        if (!validateIP(formData.ipAddress)) {
            setError('Địa chỉ IP không đúng định dạng. Ví dụ: 192.168.1.10');
            return;
        }
        if (!validateMAC(formData.macAddress)) {
            setError('Địa chỉ MAC không đúng định dạng. Ví dụ: AA:BB:CC:DD:EE:FF');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                device_code: formData.deviceCode,
                device_name: formData.deviceName,
                device_type: formData.deviceType,
                ip_address: formData.ipAddress || undefined,
                mac_address: formData.macAddress || undefined,
                metadata_json: {
                    stream_url: formData.streamUrl || '',
                    agent_version: formData.agentVersion || 'v1.0.0'
                }
            };
            const res = await registerDevice(payload);
            if (res?.success) {
                setSuccessMessage('Đăng ký thiết bị IoT thành công.');
                setIsRegisterModalOpen(false);
                fetchData();
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể đăng ký thiết bị.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Không thể đăng ký thiết bị.');
        } finally {
            setSubmitting(false);
        }
    };

    // Edit IoT Device (UC-IOT-02)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!validateIP(formData.ipAddress)) {
            setError('Địa chỉ IP không đúng định dạng. Ví dụ: 192.168.1.10');
            return;
        }
        if (!validateMAC(formData.macAddress)) {
            setError('Địa chỉ MAC không đúng định dạng. Ví dụ: AA:BB:CC:DD:EE:FF');
            return;
        }

        setSubmitting(true);
        try {
            const updatePayload = {
                device_name: formData.deviceName,
                ip_address: formData.ipAddress || undefined,
                mac_address: formData.macAddress || undefined
            };
            const res = await updateDevice(selectedDevice.id, updatePayload);
            if (res?.success) {
                setSuccessMessage('Cập nhật thông tin cấu hình thành công.');
                setIsEditModalOpen(false);
                fetchData();
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể cập nhật thiết bị.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Không thể cập nhật thiết bị.');
        } finally {
            setSubmitting(false);
        }
    };

    // Unregister / Delete Device (UC-IOT-03) — uses custom confirm modal
    const handleDeleteDevice = (device) => {
        setConfirmModal({
            title: 'Xác nhận gỡ đăng ký thiết bị',
            message: `Bạn có chắc chắn muốn gỡ bỏ hoàn toàn thiết bị ${device.device_code}? Hành động này không thể hoàn tác.`,
            type: 'danger',
            onConfirm: async () => {
                setError(null);
                setSuccessMessage(null);
                try {
                    // BE doesn't support delete IoT device
                    throw new Error('Hệ thống không hỗ trợ xóa thiết bị. Vui lòng vô hiệu hóa thay vì xóa.');
                } catch (err) {
                    setError(err?.error?.message || err?.message || 'Không thể gỡ bỏ thiết bị.');
                }
                setConfirmModal(null);
            }
        });
    };

    const toggleDeviceStatus = (device) => {
        const isOnline = device.status === 'online';
        setConfirmModal({
            title: isOnline ? 'Ngừng kích hoạt thiết bị' : 'Kích hoạt lại thiết bị',
            message: `Bạn có muốn ${isOnline ? 'ngừng kích hoạt (disable)' : 'kích hoạt lại (enable)'} thiết bị ${device.device_code}?`,
            type: isOnline ? 'warning' : 'info',
            onConfirm: async () => {
                setError(null);
                setSuccessMessage(null);
                try {
                    let res;
                    if (isOnline) {
                        res = await disableDevice(device.id);
                    } else {
                        res = await enableDevice(device.id);
                    }
                    if (res?.success) {
                        setSuccessMessage(`Đã ${isOnline ? 'ngừng kích hoạt' : 'kích hoạt lại'} thiết bị thành công.`);
                        fetchData();
                    } else {
                        throw new Error(res?.error?.message || res?.message || 'Không thể chuyển trạng thái thiết bị.');
                    }
                } catch (err) {
                    setError(err?.error?.message || err?.message || 'Không thể chuyển trạng thái thiết bị.');
                }
                setConfirmModal(null);
            }
        });
    };

    const handleCheckAvailability = async (device) => {
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await checkDeviceAvailability(device.id);
            if (res?.success && res.data) {
                setSuccessMessage(`Thiết bị ${device.device_name} phản hồi: ${res.data.isReachable ? 'Có thể kết nối (Reachable)' : 'Không thể kết nối (Unreachable)'}.`);
                fetchData(); // refresh status
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể kiểm tra kết nối thiết bị.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Lỗi khi kiểm tra kết nối thiết bị.');
        }
    };

    const handleRotateToken = (device) => {
        setConfirmModal({
            title: 'Rotate Token Face Server',
            message: `Bạn có chắc chắn muốn Rotate Token cho Face Server ${device.device_name}? Các thiết bị cũ sẽ mất kết nối nếu không cập nhật token mới.`,
            type: 'warning',
            onConfirm: async () => {
                setError(null);
                setSuccessMessage(null);
                try {
                    const res = await rotateFaceServerToken(device.id);
                    if (res?.success) {
                        // FE-5: Hiển thị token trong modal "chỉ hiện 1 lần"
                        setTokenModalData({
                            token: res.data?.token || res.data?.accessToken || 'Token đã được tạo',
                            deviceName: device.device_name
                        });
                        setTokenCopied(false);
                    } else {
                        throw new Error(res?.error?.message || res?.message || 'Không thể rotate token.');
                    }
                } catch (err) {
                    setError(err?.error?.message || err?.message || 'Không thể rotate token.');
                }
                setConfirmModal(null);
            }
        });
    };

    // FE-5: Revoke Token handler
    const handleRevokeToken = (device) => {
        setConfirmModal({
            title: 'Thu hồi Token Face Server',
            message: `Bạn có chắc chắn muốn thu hồi (revoke) token hiện tại của ${device.device_name}? Thiết bị sẽ mất kết nối ngay lập tức.`,
            type: 'danger',
            onConfirm: async () => {
                setError(null);
                setSuccessMessage(null);
                try {
                    const res = await revokeFaceServerToken(device.id);
                    if (res?.success) {
                        setSuccessMessage(`Đã thu hồi token của ${device.device_name} thành công.`);
                        fetchData();
                    } else {
                        throw new Error(res?.error?.message || res?.message || 'Không thể thu hồi token.');
                    }
                } catch (err) {
                    setError(err?.error?.message || err?.message || 'Không thể thu hồi token.');
                }
                setConfirmModal(null);
            }
        });
    };

    // FE-5: Assign Room handler
    const handleAssignRoom = async (e) => {
        e.preventDefault();
        if (!assignRoomDeviceId || !assignRoomValue) return;
        setSubmitting(true);
        try {
            const res = await assignDeviceRoom(assignRoomDeviceId, { room_id: assignRoomValue });
            if (res?.success) {
                setSuccessMessage('Đã gán phòng cho thiết bị thành công.');
                setIsAssignRoomModalOpen(false);
                fetchData();
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể gán phòng cho thiết bị.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Không thể gán phòng cho thiết bị.');
        } finally {
            setSubmitting(false);
        }
    };

    // FE-5: RTSP Config handler
    const handleRtspConfig = async (e) => {
        e.preventDefault();
        if (!rtspDeviceId || !rtspUrl.trim()) return;
        setSubmitting(true);
        try {
            const res = await configDeviceRtsp(rtspDeviceId, { rtsp_url: rtspUrl });
            if (res?.success) {
                setSuccessMessage('Đã cập nhật cấu hình RTSP thành công.');
                setIsRtspModalOpen(false);
                fetchData();
            } else {
                throw new Error(res?.error?.message || res?.message || 'Không thể cập nhật cấu hình RTSP.');
            }
        } catch (err) {
            setError(err?.error?.message || err?.message || 'Không thể cập nhật cấu hình RTSP.');
        } finally {
            setSubmitting(false);
        }
    };

    // FE-5: Copy token to clipboard
    const handleCopyToken = async () => {
        if (tokenModalData?.token) {
            try {
                await navigator.clipboard.writeText(tokenModalData.token);
                setTokenCopied(true);
                setTimeout(() => setTokenCopied(false), 2000);
            } catch {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = tokenModalData.token;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setTokenCopied(true);
                setTimeout(() => setTokenCopied(false), 2000);
            }
        }
    };

    // Helper translation dicts
    const TYPE_MAP = {
        'camera': 'Camera AI',
        'face_terminal': 'Face Terminal',
        'face_server': 'Face Server'
    };

    // Filtered list
    const filteredDevices = devicesList.filter(device => {
        const matchSearch = search.trim() === '' || 
            device.device_code.toLowerCase().includes(search.toLowerCase()) ||
            device.device_name.toLowerCase().includes(search.toLowerCase()) ||
            device.ip_address.includes(search);
        const matchType = selectedType === '' || device.device_type === selectedType;
        const matchStatus = selectedStatus === '' || device.status === selectedStatus;
        const matchRoom = selectedRoomId === '' || device.room_id === selectedRoomId;
        return matchSearch && matchType && matchStatus && matchRoom;
    });

    const totalPages = Math.ceil(filteredDevices.length / limit) || 1;
    const paginatedDevices = filteredDevices.slice((page - 1) * limit, page * limit);

    return (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <Cpu className="w-3.5 h-3.5" />
                        IoT
                    </span>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý thiết bị IoT</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Khai báo, giám sát tình trạng sức khỏe kết nối và điều phối RTSP stream cho camera/face terminal.
                    </p>
                </div>
                <button
                    onClick={openRegisterModal}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Đăng ký thiết bị
                </button>
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


            {/* Render Tab Contents */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-platinum-tint shadow-sm-1">
                    <div className="w-10 h-10 border-4 border-action-blue/20 border-t-action-blue rounded-full animate-spin"></div>
                    <p className="text-slate-blue text-sm mt-4">Đang tải dữ liệu thiết bị và phòng họp...</p>
                </div>
            ) : (
                <>
                    {/* Filters controls */}
                    <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-blue">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo Tên, Mã hoặc IP..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-10 pr-4 py-2 w-full border border-platinum-tint rounded-xl text-sm text-midnight-indigo placeholder:text-steel-gray focus:outline-none focus:border-action-blue"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {/* Room Filter */}
                            <select
                                value={selectedRoomId}
                                onChange={(e) => { setSelectedRoomId(e.target.value); setPage(1); }}
                                className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue bg-white"
                            >
                                <option value="">Tất cả phòng họp</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.roomName}</option>
                                ))}
                            </select>

                            {/* Type Filter */}
                            <select
                                value={selectedType}
                                onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                                className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue bg-white"
                            >
                                <option value="">Tất cả loại thiết bị</option>
                                <option value="camera">Camera AI</option>
                                <option value="face_terminal">Face Terminal</option>
                                <option value="face_server">Face Server</option>
                            </select>

                            {/* Status Filter */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                                className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-slate-blue focus:outline-none focus:border-action-blue bg-white"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                    </div>

                    {/* Table List Card */}
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-platinum-tint bg-cloud-mist/50">
                                        <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Mã / Tên thiết bị</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Chủng loại</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Thông số kết nối</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Phòng gán</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Sức khỏe</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDevices.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-blue text-sm">
                                                Không tìm thấy thiết bị nào phù hợp bộ lọc.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDevices.map(device => {
                                            const assignedRoom = rooms.find(r => r.roomId === device.room_id);
                                            return (
                                                <tr key={device.id} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <h4 className="text-sm font-bold text-midnight-indigo leading-tight">{device.device_name}</h4>
                                                        <p className="text-[10px] text-steel-gray mt-1 font-mono">{device.device_code}</p>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-slate-blue font-medium">
                                                        {TYPE_MAP[device.device_type] || device.device_type}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="text-xs text-midnight-indigo font-mono">IP: {device.ip_address}</div>
                                                        <div className="text-[10px] text-slate-blue mt-0.5 font-mono">MAC: {device.mac_address}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {assignedRoom ? (
                                                            <span className="inline-flex text-[10px] px-2 py-0.5 bg-blue-50 text-glacier-blue rounded-full font-bold">
                                                                {assignedRoom.roomName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-steel-gray">Chưa gán phòng</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="relative flex h-2 w-2">
                                                                {device.status === 'online' && (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                    </>
                                                                )}
                                                                {device.status === 'offline' && (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                                    </>
                                                                )}
                                                                {device.status === 'disabled' && (
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                                                                )}
                                                                {device.status === 'maintenance' && (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                                    </>
                                                                )}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                device.status === 'online' ? 'bg-green-50 text-green-700' :
                                                                device.status === 'disabled' ? 'bg-gray-100 text-gray-700' :
                                                                device.status === 'maintenance' ? 'bg-amber-50 text-amber-700' :
                                                                'bg-red-50 text-red-700'
                                                            }`}>
                                                                {device.status === 'online' ? 'ONLINE' :
                                                                 device.status === 'disabled' ? 'VÔ HIỆU' :
                                                                 device.status === 'maintenance' ? 'BẢO TRÌ' :
                                                                 'OFFLINE'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleCheckAvailability(device)}
                                                            title="Kiểm tra kết nối (Ping)"
                                                            className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-green-600 hover:bg-green-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        </button>
                                                        {device.device_type === 'face_server' && (
                                                            <>
                                                            <button
                                                                onClick={() => handleRotateToken(device)}
                                                                title="Tạo lại Token (Rotate)"
                                                                className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleRevokeToken(device)}
                                                                title="Thu hồi Token (Revoke)"
                                                                className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            </button>
                                                            </>
                                                        )}
                                                        {device.device_type === 'camera' && (
                                                            <button
                                                                onClick={() => { setRtspDeviceId(device.id); setRtspUrl(device.stream_url || ''); setIsRtspModalOpen(true); }}
                                                                title="Cấu hình RTSP"
                                                                className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { setAssignRoomDeviceId(device.id); setAssignRoomValue(device.room_id || ''); setIsAssignRoomModalOpen(true); }}
                                                            title="Gán phòng"
                                                            className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => toggleDeviceStatus(device)}
                                                            title={device.status === 'online' ? "Ngừng kích hoạt" : "Kích hoạt lại"}
                                                            className={`inline-flex p-1.5 rounded-lg transition-colors ${device.status === 'online' ? 'text-slate-blue hover:text-orange-600 hover:bg-orange-50' : 'text-slate-blue hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(device)}
                                                            title="Cấu hình thiết bị"
                                                            className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-action-blue hover:bg-blue-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDevice(device)}
                                                            title="Gỡ đăng ký thiết bị"
                                                            className="inline-flex p-1.5 rounded-lg text-slate-blue hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {filteredDevices.length > 0 && (
                            <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-blue font-medium">Số dòng hiển thị:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="px-2 py-1 border border-platinum-tint rounded-lg text-xs text-slate-blue focus:outline-none focus:border-action-blue bg-white font-semibold"
                                    >
                                        <option value={10}>10 dòng</option>
                                        <option value={20}>20 dòng</option>
                                        <option value={50}>50 dòng</option>
                                    </select>
                                    <span className="text-xs text-slate-blue">
                                        Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, filteredDevices.length)} trên {filteredDevices.length} thiết bị
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                        className="px-3 py-1.5 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Trước
                                    </button>
                                    <span className="px-3 py-1.5 text-xs font-bold text-midnight-indigo">
                                        Trang {page} / {totalPages}
                                    </span>
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="px-3 py-1.5 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* REGISTER MODAL */}
            {isRegisterModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-md w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Đăng ký thiết bị mới</h3>
                            <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mã thiết bị</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.deviceCode}
                                    onChange={(e) => setFormData({...formData, deviceCode: e.target.value})}
                                    placeholder="Ví dụ: CAM-ROOM-101"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tên thiết bị</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.deviceName}
                                    onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                                    placeholder="Ví dụ: Camera chính Phòng 101"
                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Loại thiết bị</label>
                                    <select
                                        value={formData.deviceType}
                                        onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white"
                                    >
                                        <option value="camera">Camera AI</option>
                                        <option value="face_terminal">Face Terminal</option>
                                        <option value="face_server">Face Server</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Phòng họp gán</label>
                                    <select
                                        value={formData.roomId}
                                        onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white"
                                    >
                                        <option value="">Chọn phòng họp...</option>
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id}>{room.roomName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Địa chỉ IP</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.ipAddress}
                                        onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                                        placeholder="192.168.1.50"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Địa chỉ MAC</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.macAddress}
                                        onChange={(e) => setFormData({...formData, macAddress: e.target.value})}
                                        placeholder="AA:BB:CC:DD:EE:FF"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                            </div>
                            {formData.deviceType === 'camera' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Đường dẫn luồng video (RTSP URL)</label>
                                    <input
                                        type="text"
                                        value={formData.streamUrl}
                                        onChange={(e) => setFormData({...formData, streamUrl: e.target.value})}
                                        placeholder="rtsp://192.168.1.50/live/main"
                                        className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3 border-t border-platinum-tint mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                                >
                                    {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-md w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Cấu hình thông tin thiết bị</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mã thiết bị (Read-only)</label>
                                <input type="text" disabled value={formData.deviceCode} className="w-full px-3 py-2 border border-platinum-tint bg-cloud-mist rounded-xl text-sm text-steel-gray focus:outline-none cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tên thiết bị</label>
                                <input type="text" required value={formData.deviceName} onChange={(e) => setFormData({...formData, deviceName: e.target.value})} placeholder="Ví dụ: Camera chính Phòng 101" className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Loại thiết bị</label>
                                    <select value={formData.deviceType} onChange={(e) => setFormData({...formData, deviceType: e.target.value})} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white">
                                        <option value="camera">Camera AI</option>
                                        <option value="face_terminal">Face Terminal</option>
                                        <option value="face_server">Face Server</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Phòng họp gán</label>
                                    <select value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: e.target.value})} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white">
                                        <option value="">Chọn phòng họp...</option>
                                        {rooms.map(room => (<option key={room.id} value={room.id}>{room.roomName}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Địa chỉ IP</label>
                                    <input type="text" required value={formData.ipAddress} onChange={(e) => setFormData({...formData, ipAddress: e.target.value})} placeholder="192.168.1.50" className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Địa chỉ MAC</label>
                                    <input type="text" required value={formData.macAddress} onChange={(e) => setFormData({...formData, macAddress: e.target.value})} placeholder="AA:BB:CC:DD:EE:FF" className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" />
                                </div>
                            </div>
                            {formData.deviceType === 'camera' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Đường dẫn luồng video (RTSP URL)</label>
                                    <input type="text" value={formData.streamUrl} onChange={(e) => setFormData({...formData, streamUrl: e.target.value})} placeholder="rtsp://192.168.1.50/live/main" className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue" />
                                </div>
                            )}
                            <div className="pt-4 flex justify-end gap-3 border-t border-platinum-tint mt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-colors">Hủy</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* FE-5: ASSIGN ROOM MODAL */}
            {isAssignRoomModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo text-sm">Gán phòng cho thiết bị</h3>
                            <button onClick={() => setIsAssignRoomModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAssignRoom} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="assign-room-select" className="block text-xs font-bold text-slate-blue uppercase mb-1">Chọn phòng họp</label>
                                <select id="assign-room-select" value={assignRoomValue} onChange={(e) => setAssignRoomValue(e.target.value)} required className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white">
                                    <option value="">-- Chọn phòng --</option>
                                    {rooms.map(room => (<option key={room.roomId} value={room.roomId}>{room.roomName}</option>))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-platinum-tint">
                                <button type="button" onClick={() => setIsAssignRoomModalOpen(false)} className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-bold">Hủy</button>
                                <button type="submit" disabled={submitting || !assignRoomValue} className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold disabled:opacity-50">{submitting ? 'Đang gán...' : 'Gán phòng'}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* FE-5: RTSP CONFIG MODAL */}
            {isRtspModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo text-sm">Cấu hình RTSP Stream</h3>
                            <button onClick={() => setIsRtspModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleRtspConfig} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="rtsp-url-input" className="block text-xs font-bold text-slate-blue uppercase mb-1">RTSP URL</label>
                                <input id="rtsp-url-input" type="text" required value={rtspUrl} onChange={(e) => setRtspUrl(e.target.value)} placeholder="rtsp://192.168.1.50/live/main" className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-mono focus:outline-none focus:border-action-blue" />
                                <p className="text-[10px] text-slate-blue mt-1">Nhập đường dẫn RTSP stream. Mật khẩu sẽ được BE tự mask.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-platinum-tint">
                                <button type="button" onClick={() => setIsRtspModalOpen(false)} className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-bold">Hủy</button>
                                <button type="submit" disabled={submitting || !rtspUrl.trim()} className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-bold disabled:opacity-50">{submitting ? 'Đang lưu...' : 'Lưu cấu hình'}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* FE-5: TOKEN DISPLAY MODAL (chỉ hiện 1 lần) */}
            {tokenModalData && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
                        <div className="bg-amber-50 p-6 text-center border-b border-amber-100">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            </div>
                            <h2 className="text-lg font-bold text-amber-900">Token mới đã được tạo</h2>
                            <p className="text-xs text-amber-700 mt-1">Thiết bị: {tokenModalData.deviceName}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold text-center">
                                ⚠ Token này chỉ hiển thị MỘT LẦN. Vui lòng sao chép và lưu trữ an toàn.
                            </div>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 break-all select-all">
                                {tokenModalData.token}
                            </div>
                            <button onClick={handleCopyToken} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${tokenCopied ? 'bg-green-600 text-white' : 'bg-action-blue hover:bg-glacier-blue text-white'}`}>
                                {tokenCopied ? (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Đã sao chép!</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Sao chép Token</>
                                )}
                            </button>
                        </div>
                        <div className="p-4 border-t border-platinum-tint bg-cloud-mist/20 text-right">
                            <button onClick={() => setTokenModalData(null)} className="px-4 py-2 text-xs font-bold text-slate-blue hover:text-midnight-indigo">Đã lưu, đóng lại</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* FE-5: CONFIRMATION MODAL (replaces window.confirm) */}
            {confirmModal && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-midnight-indigo/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up p-6 text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' :
                            confirmModal.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-action-blue'
                        }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="font-bold text-midnight-indigo text-base mb-2">{confirmModal.title}</h3>
                        <p className="text-xs text-slate-blue mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2 border border-platinum-tint rounded-xl text-xs font-bold text-slate-blue bg-white hover:bg-cloud-mist">Hủy</button>
                            <button onClick={confirmModal.onConfirm} className={`flex-1 px-4 py-2 text-white rounded-xl text-xs font-bold ${
                                confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                                confirmModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                                'bg-action-blue hover:bg-glacier-blue'
                            }`}>Xác nhận</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DeviceManagement;

