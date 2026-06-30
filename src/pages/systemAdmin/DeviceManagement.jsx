import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    getDevices,
    registerDevice,
    updateDevice,
    removeDevice,
    getRooms
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
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'map'
    const [selectedRoomForSimulate, setSelectedRoomForSimulate] = useState(null);

    // Form / Alerts / Modal states
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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
        } catch {
            // Mock Fallbacks for offline development
            setRooms([
                { id: 'room-vip', roomName: 'Phòng Họp VIP', siteName: 'Tòa A - Tầng 3' },
                { id: 'room-seminar', roomName: 'Phòng Hội Thảo A', siteName: 'Tòa A - Tầng 1' },
                { id: 'room-small', roomName: 'Phòng Họp Nhỏ B', siteName: 'Tòa B - Tầng 2' },
                { id: 'room-creative', roomName: 'Phòng Sáng Tạo', siteName: 'Tòa B - Tầng 4' }
            ]);

            setDevicesList([
                { id: 'dev-1', deviceCode: 'CAM-VIP-01', deviceName: 'Camera Toàn Cảnh VIP', deviceType: 'camera', roomId: 'room-vip', ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:5E', status: 'online', streamUrl: 'rtsp://192.168.1.10/live/main', agentVersion: 'v2.3.1', lastSeenAt: new Date().toISOString() },
                { id: 'dev-2', deviceCode: 'TERM-VIP-01', deviceName: 'Face Terminal Cửa VIP', deviceType: 'face_terminal', roomId: 'room-vip', ipAddress: '192.168.1.11', macAddress: '00:1A:2B:3C:4D:5F', status: 'online', agentVersion: 'v2.0.1', lastSeenAt: new Date().toISOString() },
                { id: 'dev-3', deviceCode: 'CAM-SEM-01', deviceName: 'Camera Hội Thảo A', deviceType: 'camera', roomId: 'room-seminar', ipAddress: '192.168.1.20', macAddress: '00:1A:2B:3C:4D:6E', status: 'offline', streamUrl: 'rtsp://192.168.1.20/live/main', agentVersion: 'v2.3.1', lastSeenAt: new Date(Date.now() - 3600000).toISOString() },
                { id: 'dev-4', deviceCode: 'TERM-SEM-01', deviceName: 'Face Terminal Hội Thảo', deviceType: 'face_terminal', roomId: 'room-seminar', ipAddress: '192.168.1.21', macAddress: '00:1A:2B:3C:4D:6F', status: 'online', agentVersion: 'v2.0.1', lastSeenAt: new Date().toISOString() },
                { id: 'dev-5', deviceCode: 'CAM-SM-01', deviceName: 'Camera Họp Nhỏ B', deviceType: 'camera', roomId: 'room-small', ipAddress: '192.168.1.30', macAddress: '00:1A:2B:3C:4D:7E', status: 'online', streamUrl: 'rtsp://192.168.1.30/live/main', agentVersion: 'v2.3.1', lastSeenAt: new Date().toISOString() },
                { id: 'dev-6', deviceCode: 'FS-MAIN-01', deviceName: 'Face Server Trung Tâm', deviceType: 'face_server', roomId: 'room-creative', ipAddress: '192.168.1.5', macAddress: '00:1A:2B:3C:4D:1A', status: 'online', agentVersion: 'v3.0.0', lastSeenAt: new Date().toISOString() }
            ]);
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
            deviceCode: device.deviceCode || '',
            deviceName: device.deviceName || '',
            deviceType: device.deviceType || 'camera',
            roomId: device.roomId || '',
            ipAddress: device.ipAddress || '',
            macAddress: device.macAddress || '',
            streamUrl: device.streamUrl || '',
            agentVersion: device.agentVersion || 'v1.0.0'
        });
        setIsEditModalOpen(true);
    };

    // Register IoT Device (UC-IOT-01 / UC-67)
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
            const res = await registerDevice(formData);
            if (res?.success) {
                setSuccessMessage('Đăng ký thiết bị IoT thành công.');
                setIsRegisterModalOpen(false);
                fetchData();
            } else {
                // Mock simulation
                setSuccessMessage(`Đã mô phỏng: Đăng ký thành công thiết bị ${formData.deviceName}.`);
                setIsRegisterModalOpen(false);
                setDevicesList(prev => [
                    ...prev,
                    {
                        id: 'dev-' + Math.random(),
                        ...formData,
                        status: 'online',
                        lastSeenAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (err) {
            setError(err.message || 'Không thể đăng ký thiết bị.');
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
            const res = await updateDevice(selectedDevice.id, formData);
            if (res?.success) {
                setSuccessMessage('Cập nhật thông tin cấu hình thành công.');
                setIsEditModalOpen(false);
                fetchData();
            } else {
                setSuccessMessage(`Đã mô phỏng: Cập nhật thành công thiết bị ${formData.deviceName}.`);
                setIsEditModalOpen(false);
                setDevicesList(prev => prev.map(d => d.id === selectedDevice.id ? { ...d, ...formData } : d));
            }
        } catch (err) {
            setError(err.message || 'Không thể cập nhật thiết bị.');
        } finally {
            setSubmitting(false);
        }
    };

    // Unregister / Delete Device (UC-IOT-03)
    const handleDeleteDevice = async (device) => {
        if (!window.confirm(`Bạn có chắc chắn muốn gỡ bỏ hoàn toàn thiết bị ${device.deviceCode}?`)) return;
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await removeDevice(device.id);
            if (res?.success) {
                setSuccessMessage('Đã gỡ bỏ thiết bị khỏi hệ thống.');
                fetchData();
            } else {
                setSuccessMessage(`Đã mô phỏng: Xóa thành công thiết bị ${device.deviceCode}.`);
                setDevicesList(prev => prev.filter(d => d.id !== device.id));
            }
        } catch (err) {
            setError(err.message || 'Không thể gỡ bỏ thiết bị.');
        }
    };

    const toggleDeviceSimulatedStatus = (deviceId) => {
        setDevicesList(prev => prev.map(d => {
            if (d.id === deviceId) {
                const nextStatus = d.status === 'online' ? 'offline' : 'online';
                setSuccessMessage(`Đã mô phỏng chuyển đổi ${d.deviceName} sang ${nextStatus === 'online' ? 'Hoạt động' : 'Mất kết nối'}`);
                return { ...d, status: nextStatus, lastSeenAt: new Date().toISOString() };
            }
            return d;
        }));
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
            device.deviceCode.toLowerCase().includes(search.toLowerCase()) ||
            device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
            device.ipAddress.includes(search);
        const matchType = selectedType === '' || device.deviceType === selectedType;
        const matchStatus = selectedStatus === '' || device.status === selectedStatus;
        const matchRoom = selectedRoomId === '' || device.roomId === selectedRoomId;
        return matchSearch && matchType && matchStatus && matchRoom;
    });

    const totalPages = Math.ceil(filteredDevices.length / limit) || 1;
    const paginatedDevices = filteredDevices.slice((page - 1) * limit, page * limit);

    return (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
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

            {/* Tab view selector (List View vs Room Health Map) */}
            <div className="flex border-b border-platinum-tint">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                        activeTab === 'list'
                            ? 'border-action-blue text-action-blue font-bold'
                            : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                    }`}
                >
                    Danh sách thiết bị ({filteredDevices.length})
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
                        activeTab === 'map'
                            ? 'border-action-blue text-action-blue font-bold'
                            : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Sơ đồ trực quan phòng họp
                </button>
            </div>

            {/* Render Tab Contents */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-platinum-tint shadow-sm-1">
                    <div className="w-10 h-10 border-4 border-action-blue/20 border-t-action-blue rounded-full animate-spin"></div>
                    <p className="text-slate-blue text-sm mt-4">Đang tải dữ liệu thiết bị và phòng họp...</p>
                </div>
            ) : activeTab === 'list' ? (
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
                                            const assignedRoom = rooms.find(r => r.id === device.roomId);
                                            return (
                                                <tr key={device.id} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <h4 className="text-sm font-bold text-midnight-indigo leading-tight">{device.deviceName}</h4>
                                                        <p className="text-[10px] text-steel-gray mt-1 font-mono">{device.deviceCode}</p>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-slate-blue font-medium">
                                                        {TYPE_MAP[device.deviceType] || device.deviceType}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="text-xs text-midnight-indigo font-mono">IP: {device.ipAddress}</div>
                                                        <div className="text-[10px] text-slate-blue mt-0.5 font-mono">MAC: {device.macAddress}</div>
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
                                                            <span className={`relative flex h-2 w-2`}>
                                                                {device.status === 'online' ? (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                                    </>
                                                                )}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                device.status === 'online' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                            }`}>
                                                                {device.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right space-x-2">
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
            ) : (
                /* Map View Mode (NEW Interactive Blueprint Floor Layout Simulator) */
                <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
                    {/* Map Visual Blueprint Panel */}
                    <div className="flex-1 bg-white rounded-2xl border border-platinum-tint p-6 shadow-sm-1 flex flex-col justify-between">
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-platinum-tint/55 pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-midnight-indigo">Sơ đồ mặt bằng Tầng 3 - Tòa SmarTracking</h3>
                                <p className="text-xs text-slate-blue mt-0.5">Nhấp chọn phòng để xem chi tiết thiết bị & kích hoạt bảng mô phỏng lỗi kết nối.</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-blue">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse-soft" />
                                    <span>Online</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping-soft" />
                                    <span>Offline (Sự cố)</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Blueprint Canvas/Grid Layout */}
                        <div className="relative min-h-[460px] bg-slate-900/5 p-6 rounded-2xl border border-dashed border-outline-gray/80 overflow-auto bg-[linear-gradient(rgba(0,107,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,107,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px]">
                            {/* Blueprint grid layout */}
                            <div className="grid grid-cols-12 grid-rows-6 gap-4 w-full min-w-[700px] h-[380px]">
                                {rooms.map(room => {
                                    const roomDevices = devicesList.filter(d => d.roomId === room.id);
                                    const hasFault = roomDevices.some(d => d.status === 'offline');
                                    const isSelected = selectedRoomForSimulate?.id === room.id;
                                    
                                    // Determine layout columns and rows on simulated grid based on room ID
                                    let gridStyle = "col-span-4 row-span-3";
                                    if (room.id === 'room-vip' || room.id.includes('vip')) {
                                        gridStyle = "col-span-5 row-span-3 col-start-1 row-start-1";
                                    } else if (room.id === 'room-seminar' || room.id.includes('seminar')) {
                                        gridStyle = "col-span-6 row-span-3 col-start-7 row-start-1";
                                    } else if (room.id === 'room-small' || room.id.includes('small')) {
                                        gridStyle = "col-span-5 row-span-3 col-start-1 row-start-4";
                                    } else if (room.id === 'room-creative' || room.id.includes('creative')) {
                                        gridStyle = "col-span-6 row-span-3 col-start-7 row-start-4";
                                    }

                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => setSelectedRoomForSimulate(room)}
                                            className={`relative group cursor-pointer p-4 rounded-xl border-2 flex flex-col justify-between transition-all duration-200 select-none ${gridStyle} ${
                                                isSelected
                                                    ? 'border-action-blue bg-action-blue/10 shadow-sm-3 ring-2 ring-action-blue/20'
                                                    : hasFault
                                                    ? 'border-red-400 bg-red-50/70 hover:border-red-500 hover:bg-red-100/60'
                                                    : 'border-platinum-tint bg-white hover:border-action-blue/50 hover:shadow-sm-2'
                                            }`}
                                        >
                                            {/* Room Header Info */}
                                            <div className="flex items-start justify-between gap-1.5">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-blue/80 tracking-wider block">
                                                        {room.siteName}
                                                    </span>
                                                    <h4 className="font-bold text-sm text-midnight-indigo group-hover:text-action-blue transition-colors mt-0.5">
                                                        {room.roomName}
                                                    </h4>
                                                </div>
                                                
                                                {/* Alerts or details */}
                                                {hasFault ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse-soft">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping-soft" />
                                                        Lỗi kết nối
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-150">
                                                        Hoạt động
                                                    </span>
                                                )}
                                            </div>

                                            {/* Device nodes layout inside room */}
                                            <div className="flex flex-wrap gap-2.5 mt-auto pt-4 border-t border-platinum-tint/40">
                                                {roomDevices.length === 0 ? (
                                                    <span className="text-[10px] text-steel-gray italic">Không có thiết bị</span>
                                                ) : (
                                                    roomDevices.map(d => (
                                                        <div
                                                            key={d.id}
                                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all relative group/node ${
                                                                d.status === 'online'
                                                                    ? 'bg-green-50/80 border-green-200 text-green-800'
                                                                    : 'bg-red-50/80 border-red-200 text-red-800'
                                                            }`}
                                                        >
                                                            {/* Device Icon */}
                                                            {d.deviceType === 'camera' ? (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            ) : d.deviceType === 'face_terminal' ? (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                                </svg>
                                                            )}
                                                            <span className="max-w-[70px] truncate">{d.deviceName}</span>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />

                                                            {/* Hover node details Tooltip */}
                                                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-30 w-48 p-2.5 bg-midnight-indigo text-white text-[10px] rounded-xl shadow-sm-2 opacity-0 scale-95 pointer-events-none group-hover/node:opacity-100 group-hover/node:scale-100 transition-all duration-250">
                                                                <div className="font-bold border-b border-white/20 pb-0.5 mb-1 truncate">{d.deviceName}</div>
                                                                <div>IP: {d.ipAddress}</div>
                                                                <div>MAC: {d.macAddress}</div>
                                                                <div className="mt-1 font-bold">Trạng thái: <span className={d.status === 'online' ? 'text-green-300' : 'text-red-300'}>{d.status.toUpperCase()}</span></div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Floor plan layout aesthetics: doorways */}
                                            <div className="absolute -bottom-1.5 left-6 w-8 h-1 bg-slate-900/20 group-hover:bg-action-blue/30 rounded-full" />
                                        </div>
                                    );
                                })}

                                {/* Simulated Central Hallway Corridor */}
                                <div className="col-span-1 row-span-6 col-start-6 row-start-1 bg-cloud-mist/40 border-l border-r border-dashed border-outline-gray/60 flex flex-col justify-center items-center select-none p-2 rounded-lg text-center">
                                    <span className="text-[10px] font-bold text-slate-blue/80 tracking-wider uppercase [writing-mode:vertical-lr] rotate-180">
                                        HÀNH LANG TRUNG TÂM
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room Detail Sidebar & Connection Simulator */}
                    <div className="w-full lg:w-96 bg-white rounded-2xl border border-platinum-tint p-6 shadow-sm-1 flex flex-col">
                        {selectedRoomForSimulate ? (
                            <div className="space-y-6">
                                <div className="border-b border-platinum-tint pb-4 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-base text-midnight-indigo">{selectedRoomForSimulate.roomName}</h3>
                                        <p className="text-xs text-slate-blue">{selectedRoomForSimulate.siteName}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRoomForSimulate(null)}
                                        className="text-slate-blue hover:text-midnight-indigo"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Simulated Camera Stream Live Feed */}
                                {devicesList.filter(d => d.roomId === selectedRoomForSimulate.id && d.deviceType === 'camera').length > 0 && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-blue uppercase tracking-wider">Luồng live camera mô phỏng</label>
                                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-outline-gray/80 flex items-center justify-center group">
                                            {/* Grid overlay */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                                            {/* Check if the main camera is online */}
                                            {devicesList.filter(d => d.roomId === selectedRoomForSimulate.id && d.deviceType === 'camera')[0].status === 'online' ? (
                                                <>
                                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] text-green-400 font-bold border border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        LIVE FEED (SIMULATED)
                                                    </div>
                                                    <div className="absolute top-2 right-2 text-[10px] text-white/75 bg-black/60 px-1.5 py-0.5 rounded font-mono">
                                                        {selectedRoomForSimulate.id.toUpperCase()}
                                                    </div>
                                                    
                                                    {/* Simulated visual layout (using simple CSS shapes/SVG) */}
                                                    <svg className="w-full h-full opacity-60 p-4" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect x="10" y="10" width="80" height="40" rx="4" stroke="green" strokeWidth="1" strokeDasharray="2 2" />
                                                        <circle cx="50" cy="30" r="10" stroke="green" strokeWidth="1" />
                                                        <line x1="10" y1="10" x2="90" y2="50" stroke="green" strokeWidth="0.5" />
                                                        <line x1="90" y1="10" x2="10" y2="50" stroke="green" strokeWidth="0.5" />
                                                    </svg>
                                                    <div className="absolute bottom-2 left-2 text-[10px] text-white/70 font-mono">
                                                        FPS: 25 | BPS: 2.1 Mbps
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <svg className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    <p className="text-xs font-bold text-red-500">MẤT KẾT NỐI CAMERA (NO SIGNAL)</p>
                                                    <p className="text-[10px] text-white/60 mt-1">Vui lòng kiểm tra nguồn thiết bị hoặc cấu hình IP.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Connection Simulator List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-platinum-tint/50 pb-2">
                                        <h4 className="text-xs font-bold text-slate-blue uppercase tracking-wider">Bộ mô phỏng kết nối thiết bị</h4>
                                        <span className="text-[10px] text-slate-blue font-medium bg-cloud-mist px-2 py-0.5 rounded-full">SIMULATOR</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {devicesList.filter(d => d.roomId === selectedRoomForSimulate.id).length === 0 ? (
                                            <p className="text-xs text-steel-gray italic">Không có thiết bị nào trong phòng này để mô phỏng.</p>
                                        ) : (
                                            devicesList.filter(d => d.roomId === selectedRoomForSimulate.id).map(d => (
                                                <div 
                                                    key={d.id}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-platinum-tint bg-cloud-mist/30 hover:bg-cloud-mist/60 transition-colors"
                                                >
                                                    <div className="min-w-0 pr-2">
                                                        <div className="text-xs font-bold text-midnight-indigo truncate">{d.deviceName}</div>
                                                        <div className="text-[10px] text-slate-blue mt-0.5">{d.deviceCode} • {TYPE_MAP[d.deviceType]}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className={`text-[10px] font-bold ${d.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {d.status === 'online' ? 'Online' : 'Offline'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleDeviceSimulatedStatus(d.id)}
                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                                                d.status === 'online' ? 'bg-green-500' : 'bg-slate-300'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                                                    d.status === 'online' ? 'translate-x-4.5' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Actions to Edit or config inside room detail */}
                                <div className="pt-4 border-t border-platinum-tint flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const dev = devicesList.find(d => d.roomId === selectedRoomForSimulate.id);
                                            if (dev) {
                                                openEditModal(dev);
                                            } else {
                                                setError("Chưa gán thiết bị nào trong phòng này để cấu hình nhanh.");
                                            }
                                        }}
                                        className="w-full text-center px-4 py-2 border border-platinum-tint hover:bg-cloud-mist text-slate-blue rounded-xl text-xs font-bold transition-all"
                                    >
                                        Cấu hình thiết bị nhanh
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-blue">
                                <svg className="w-12 h-12 text-outline-gray/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                <h4 className="font-bold text-sm text-midnight-indigo">Bảng mô phỏng kết nối</h4>
                                <p className="text-xs text-slate-blue mt-1 max-w-[240px]">
                                    Chọn một phòng họp bất kỳ trên sơ đồ để kích hoạt bộ mô phỏng lỗi phần cứng và xem phản hồi thời gian thực.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
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
                                <input
                                    type="text"
                                    disabled
                                    value={formData.deviceCode}
                                    className="w-full px-3 py-2 border border-platinum-tint bg-cloud-mist rounded-xl text-sm text-steel-gray focus:outline-none cursor-not-allowed"
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
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DeviceManagement;
