import { Settings, Camera, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { getSystemConfigs, updateSystemConfig, getChannelMaps, updateChannelMap, getRooms } from '../../service/sysAdminServices';

/**
 * SystemSettings Component
 * UC-RUM-14: Cập nhật cấu hình ngưỡng thời gian chờ no-show
 * UC-RUM-15: Cập nhật cấu hình ngưỡng phát hiện phòng trống sớm
 * BR-NS-03: Cấu hình ngưỡng no-show và grace period
 * BR-PRIV-04: Cấu hình thời gian lưu trữ media (retention)
 * BR-MTG-OVERRUN-01: Cấu hình thời gian ân hạn kết thúc muộn
 */
const SystemSettings = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState('workspace'); // workspace | recording | system | camera

    // API & UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Soft warning modal / state for aggressive thresholds (UC-RUM-15 E1)
    const [showSoftWarning, setShowSoftWarning] = useState(false);
    const [pendingConfigChange, setPendingConfigChange] = useState(null);

    // Config Values State
    const [configs, setConfigs] = useState({
        is_auto_release_enabled: true,
        no_show_threshold_minutes: 10,
        grace_minutes: 5,
        is_early_release_enabled: true,
        early_departure_threshold_minutes: 10,
        is_host_warning_enabled: true,
        recording_retention_days: 90,
        is_recording_consent_required: true,
        overrun_grace_minutes: 10
    });

    // Channel Maps State
    const [channelMaps, setChannelMaps] = useState({
        'ivss.channel_room_map': {},
        'ivss.channel_direction_map': {},
        'ivss.channel_presence_zone_map': {},
        'ivss.channel_zone_map': {},
        'ivss.presence.gap_threshold_seconds': 30,
        'campus.journey.gap_threshold_seconds': 60,
        'attendance.late_grace_minutes': 15
    });
    const [dbChannelMaps, setDbChannelMaps] = useState({});
    const [localChannels, setLocalChannels] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Tracking which keys were modified compared to database
    const [dbConfigs, setDbConfigs] = useState({});

    // Fetch Configurations from API
    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [res, channelRes, roomRes] = await Promise.all([
                getSystemConfigs(),
                getChannelMaps().catch(() => ({ success: true, data: [] })),
                getRooms({ limit: 100 }).catch(() => ({ success: true, data: [] }))
            ]);

            if (res?.success && Array.isArray(res.data)) {
                // Map array of { id, key, value, ... } to state object
                const mappedConfigs = {};
                res.data.forEach(item => {
                    let parsedValue = item.value;
                    // Parse values correctly
                    if (parsedValue === 'true') parsedValue = true;
                    else if (parsedValue === 'false') parsedValue = false;
                    else if (!isNaN(parsedValue) && parsedValue !== '') parsedValue = Number(parsedValue);

                    mappedConfigs[item.key] = parsedValue;
                });

                // Merge with default values in case some keys are missing
                const merged = { ...configs, ...mappedConfigs };
                setConfigs(merged);
                setDbConfigs(merged);
            } else {
                throw new Error('Không thể tải cấu hình từ hệ thống.');
            }

            // Handle channel maps
            if (channelRes?.success && Array.isArray(channelRes.data)) {
                const mappedChannels = {};
                channelRes.data.forEach(item => {
                    let parsedValue = item.value;
                    try {
                        if (typeof parsedValue === 'string' && parsedValue.trim().startsWith('{')) {
                            parsedValue = JSON.parse(parsedValue);
                        }
                    } catch(e) {}
                    // Ensure numbers are numbers for thresholds
                    if (['ivss.presence.gap_threshold_seconds', 'campus.journey.gap_threshold_seconds', 'attendance.late_grace_minutes'].includes(item.key)) {
                        parsedValue = Number(parsedValue) || 0;
                    }
                    mappedChannels[item.key] = parsedValue;
                });
                
                const mergedChannels = {
                    'ivss.channel_room_map': {},
                    'ivss.channel_direction_map': {},
                    'ivss.channel_presence_zone_map': {},
                    'ivss.channel_zone_map': {},
                    'ivss.presence.gap_threshold_seconds': 30,
                    'campus.journey.gap_threshold_seconds': 60,
                    'attendance.late_grace_minutes': 15,
                    ...mappedChannels 
                };
                setChannelMaps(mergedChannels);
                setDbChannelMaps(mergedChannels);

                // Build localChannels
                const roomMap = mergedChannels['ivss.channel_room_map'] || {};
                const dirMap = mergedChannels['ivss.channel_direction_map'] || {};
                const pZoneMap = mergedChannels['ivss.channel_presence_zone_map'] || {};
                const zMap = mergedChannels['ivss.channel_zone_map'] || {};

                const allKeys = new Set([...Object.keys(roomMap), ...Object.keys(dirMap), ...Object.keys(pZoneMap), ...Object.keys(zMap)]);
                const rows = Array.from(allKeys).map(id => ({
                    id,
                    roomId: roomMap[id] || '',
                    direction: dirMap[id] || '',
                    presenceZone: pZoneMap[id] || '',
                    zone: zMap[id] || ''
                }));
                setLocalChannels(rows);
            }

            if (roomRes?.success) {
                const roomData = Array.isArray(roomRes.data?.data) ? roomRes.data.data : (Array.isArray(roomRes.data) ? roomRes.data : []);
                setRooms(roomData);
            }
        } catch (err) {
            // Mock default config database simulation for local development / fallback
            const mockDb = {
                is_auto_release_enabled: true,
                no_show_threshold_minutes: 10,
                grace_minutes: 5,
                is_early_release_enabled: true,
                early_departure_threshold_minutes: 10,
                is_host_warning_enabled: true,
                recording_retention_days: 90,
                is_recording_consent_required: true,
                overrun_grace_minutes: 10
            };
            setConfigs(mockDb);
            setDbConfigs(mockDb);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    // Auto-hide alert messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle single input changes
    const handleChange = (key, value) => {
        setConfigs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Form validation check
    const validateConfigs = (data) => {
        // Validation: Thresholds must be positive numbers
        if (Number(data.no_show_threshold_minutes) <= 0 || Number(data.grace_minutes) <= 0) {
            setError('Thời gian chờ No-show và thời gian đếm ngược phải là số nguyên dương.');
            return false;
        }
        if (Number(data.early_departure_threshold_minutes) <= 0) {
            setError('Ngưỡng phát hiện phòng trống phải là số nguyên dương.');
            return false;
        }
        if (Number(data.recording_retention_days) <= 0) {
            setError('Thời gian lưu trữ ghi hình phải là số nguyên dương.');
            return false;
        }
        if (Number(data.overrun_grace_minutes) <= 0) {
            setError('Thời gian ân hạn quá hạn họp phải là số nguyên dương.');
            return false;
        }

        // Logical validation: No-show grace_minutes should normally be smaller or equal to threshold
        if (Number(data.grace_minutes) > Number(data.no_show_threshold_minutes)) {
            setError('Thời gian đếm ngược sau cảnh báo không nên lớn hơn thời gian ân hạn ban đầu.');
            return false;
        }

        return true;
    };

    // Save changes submit handler
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Build new maps from localChannels
        const newRoomMap = {};
        const newDirMap = {};
        const newPZoneMap = {};
        const newZoneMap = {};

        for (const row of localChannels) {
            const id = String(row.id).trim();
            if (!id) {
                setError('ID Kênh Camera không được để trống.');
                return;
            }
            if (newRoomMap[id]) {
                setError(`ID Kênh Camera bị trùng lặp: ${id}`);
                return;
            }
            if (row.roomId) newRoomMap[id] = row.roomId;
            if (row.direction) newDirMap[id] = row.direction;
            if (row.presenceZone) newPZoneMap[id] = row.presenceZone;
            if (row.zone) newZoneMap[id] = row.zone;
        }

        const currentChannelMaps = {
            ...channelMaps,
            'ivss.channel_room_map': newRoomMap,
            'ivss.channel_direction_map': newDirMap,
            'ivss.channel_presence_zone_map': newPZoneMap,
            'ivss.channel_zone_map': newZoneMap
        };

        if (!validateConfigs(configs)) return;

        // Check for aggressive threshold warning (UC-RUM-15 E1)
        if (configs.is_early_release_enabled && Number(configs.early_departure_threshold_minutes) < 3) {
            if (!showSoftWarning) {
                setShowSoftWarning(true);
                return;
            }
        }

        setSaving(true);
        setShowSoftWarning(false);

        // Find keys that changed compared to initial database values
        const changedKeys = Object.keys(configs).filter(key => configs[key] !== dbConfigs[key]);
        const changedChannelKeys = Object.keys(currentChannelMaps).filter(key => 
            JSON.stringify(currentChannelMaps[key]) !== JSON.stringify(dbChannelMaps[key])
        );

        if (changedKeys.length === 0 && changedChannelKeys.length === 0) {
            setSuccessMessage('Không có thay đổi nào cần lưu.');
            setSaving(false);
            return;
        }

        try {
            // Update each changed config sequentially
            const updatePromises = changedKeys.map(key => {
                const valueString = String(configs[key]);
                return updateSystemConfig({ key, value: valueString });
            });
            const updateChannelPromises = changedChannelKeys.map(key => {
                let value = currentChannelMaps[key];
                if (typeof value === 'object') value = JSON.stringify(value);
                else value = String(value);
                return updateChannelMap({ key, value });
            });

            await Promise.all([...updatePromises, ...updateChannelPromises]);
            
            // Re-fetch or sync state
            setSuccessMessage('Cập nhật chính sách và tham số cấu hình hệ thống thành công.');
            setDbConfigs({ ...configs });
            setChannelMaps(currentChannelMaps);
            setDbChannelMaps(currentChannelMaps);
        } catch (err) {
            setError(err?.message || err?.error?.message || 'Không thể cập nhật cấu hình hệ thống. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Confirm saving even with aggressive settings warning
    const handleConfirmAggressiveSave = () => {
        setShowSoftWarning(false);
        // Execute save flow bypassing the threshold check since we are confirming
        setTimeout(() => {
            setSaving(true);
            const changedKeys = Object.keys(configs).filter(key => configs[key] !== dbConfigs[key]);
            
            const performSave = async () => {
                try {
                    const updatePromises = changedKeys.map(key => 
                        updateSystemConfig({ key, value: String(configs[key]) })
                    );
                    await Promise.all(updatePromises);
                    setSuccessMessage('Đã cập nhật cấu hình hệ thống thành công (Đã bỏ qua cảnh báo ngưỡng thấp).');
                    setDbConfigs({ ...configs });
                } catch (err) {
                    setError(err?.message || err?.error?.message || 'Không thể cập nhật cấu hình hệ thống. Vui lòng thử lại.');
                } finally {
                    setSaving(false);
                }
            };
            performSave();
        }, 100);
    };

    // Reset current tab inputs to DB state
    const handleReset = () => {
        setError(null);
        setConfigs({ ...dbConfigs });
        setChannelMaps({ ...dbChannelMaps });
        
        // Build localChannels
        const roomMap = dbChannelMaps['ivss.channel_room_map'] || {};
        const dirMap = dbChannelMaps['ivss.channel_direction_map'] || {};
        const pZoneMap = dbChannelMaps['ivss.channel_presence_zone_map'] || {};
        const zMap = dbChannelMaps['ivss.channel_zone_map'] || {};

        const allKeys = new Set([...Object.keys(roomMap), ...Object.keys(dirMap), ...Object.keys(pZoneMap), ...Object.keys(zMap)]);
        const rows = Array.from(allKeys).map(id => ({
            id,
            roomId: roomMap[id] || '',
            direction: dirMap[id] || '',
            presenceZone: pZoneMap[id] || '',
            zone: zMap[id] || ''
        }));
        setLocalChannels(rows);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-blue text-sm font-medium">Đang tải cấu hình hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <Settings className="w-3.5 h-3.5" />
                        Hệ thống
                    </span>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Cài đặt hệ thống</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Cấu hình các tham số toàn cục, chính sách No-show, tự động giải phóng phòng và các quy tắc nghiệp vụ.
                    </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={saving}
                        className="px-4 py-2 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                    >
                        Khôi phục
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={saving}
                        className="px-4 py-2 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 flex items-center justify-center min-w-[120px]"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </button>
                </div>
            </div>

            {/* Notification Alerts */}
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

            {/* Navigation Tabs */}
            <div className="border-b border-platinum-tint flex gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('workspace')}
                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'workspace'
                            ? 'border-action-blue text-action-blue'
                            : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                    }`}
                >
                    Quy tắc không gian
                </button>
                <button
                    onClick={() => setActiveTab('recording')}
                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'recording'
                            ? 'border-action-blue text-action-blue'
                            : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                    }`}
                >
                    Ghi hình & Riêng tư
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'system'
                            ? 'border-action-blue text-action-blue'
                            : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                    }`}
                >
                    Tham số hệ thống
                </button>
                <button
                    onClick={() => setActiveTab('camera')}
                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'camera'
                            ? 'border-action-blue text-action-blue'
                            : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                    }`}
                >
                    Cấu hình Camera & Cảm biến
                </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm-2 overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* TAB 1: WORKSPACE RULES */}
                    {activeTab === 'workspace' && (
                        <div className="space-y-8">
                            
                            {/* SECTION A: No-Show Policy */}
                            <div className="space-y-4">
                                <div className="border-b border-platinum-tint/60 pb-3">
                                    <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                        <svg className="w-5 h-5 text-action-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Chính sách No-show (Vắng mặt)
                                    </h2>
                                    <p className="text-xs text-slate-blue mt-1">Cấu hình thời gian giải phóng phòng họp khi không có người check-in.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                    {/* Enable toggle */}
                                    <div className="p-4 bg-cloud-mist/50 border border-platinum-tint/70 rounded-xl space-y-2 flex flex-col justify-between h-full">
                                        <div>
                                            <span className="block text-xs font-bold text-slate-blue uppercase">Xử lý No-show tự động</span>
                                            <span className="text-xs text-steel-gray mt-1 block">Tự động thu hồi phòng nếu bỏ trống phòng khi đến giờ họp.</span>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={configs.is_auto_release_enabled}
                                                    onChange={(e) => handleChange('is_auto_release_enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-platinum-tint peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                                                <span className="ml-3 text-sm font-semibold text-midnight-indigo">
                                                    {configs.is_auto_release_enabled ? 'Bật' : 'Tắt'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Grace threshold minutes */}
                                    <div className={`p-4 bg-white border rounded-xl space-y-2 transition-all ${
                                        configs.is_auto_release_enabled ? 'border-platinum-tint' : 'border-platinum-tint/40 opacity-50 pointer-events-none'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-blue uppercase">Thời gian ân hạn (Grace Period)</label>
                                        <span className="text-xs text-steel-gray mt-0.5 block">Khoảng thời gian chờ trước khi gửi cảnh báo (phút).</span>
                                        <div className="mt-3 relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="60"
                                                value={configs.no_show_threshold_minutes}
                                                onChange={(e) => handleChange('no_show_threshold_minutes', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">phút</span>
                                        </div>
                                    </div>

                                    {/* Warning countdown minutes */}
                                    <div className={`p-4 bg-white border rounded-xl space-y-2 transition-all ${
                                        configs.is_auto_release_enabled ? 'border-platinum-tint' : 'border-platinum-tint/40 opacity-50 pointer-events-none'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-blue uppercase">Thời gian chờ phản hồi</label>
                                        <span className="text-xs text-steel-gray mt-0.5 block">Thời gian cho phép Host xác nhận trước khi nhả phòng (phút).</span>
                                        <div className="mt-3 relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="60"
                                                value={configs.grace_minutes}
                                                onChange={(e) => handleChange('grace_minutes', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">phút</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: Early Departure Release Policy */}
                            <div className="space-y-4 pt-4 border-t border-platinum-tint/60">
                                <div className="pb-3">
                                    <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                        <svg className="w-5 h-5 text-action-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Chính sách kết thúc và trả phòng sớm (Early Departure)
                                    </h2>
                                    <p className="text-xs text-slate-blue mt-1">Sử dụng cảm biến IoT đếm hiện diện để tự động giải phóng phòng khi cuộc họp trống người sớm.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                    {/* Early release toggle */}
                                    <div className="p-4 bg-cloud-mist/50 border border-platinum-tint/70 rounded-xl space-y-2 flex flex-col justify-between h-full">
                                        <div>
                                            <span className="block text-xs font-bold text-slate-blue uppercase">Giải phóng phòng trống sớm</span>
                                            <span className="text-xs text-steel-gray mt-1 block">Tự động trả phòng về trạng thái trống nếu cảm biến báo không có chuyển động.</span>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={configs.is_early_release_enabled}
                                                    onChange={(e) => handleChange('is_early_release_enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-platinum-tint peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                                                <span className="ml-3 text-sm font-semibold text-midnight-indigo">
                                                    {configs.is_early_release_enabled ? 'Bật' : 'Tắt'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Inactivity detection minutes */}
                                    <div className={`p-4 bg-white border rounded-xl space-y-2 transition-all ${
                                        configs.is_early_release_enabled ? 'border-platinum-tint' : 'border-platinum-tint/40 opacity-50 pointer-events-none'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-blue uppercase">Ngưỡng chờ xác nhận trống</label>
                                        <span className="text-xs text-steel-gray mt-0.5 block">Thời gian không phát hiện chuyển động trước khi giải phóng (phút).</span>
                                        <div className="mt-3 relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="60"
                                                value={configs.early_departure_threshold_minutes}
                                                onChange={(e) => handleChange('early_departure_threshold_minutes', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">phút</span>
                                        </div>
                                    </div>

                                    {/* Prompt Host confirmation checkbox toggle */}
                                    <div className={`p-4 bg-white border rounded-xl space-y-2 transition-all ${
                                        configs.is_early_release_enabled ? 'border-platinum-tint' : 'border-platinum-tint/40 opacity-50 pointer-events-none'
                                    }`}>
                                        <span className="block text-xs font-bold text-slate-blue uppercase">Gửi cảnh báo trước giải phóng</span>
                                        <span className="text-xs text-steel-gray mt-0.5 block">Gửi tin nhắn hỏi Host "Vẫn sử dụng phòng?" trước khi tự động kết thúc.</span>
                                        <div className="flex items-center mt-3 pt-1">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={configs.is_host_warning_enabled}
                                                    onChange={(e) => handleChange('is_host_warning_enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-platinum-tint peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                                                <span className="ml-3 text-sm font-semibold text-midnight-indigo">
                                                    {configs.is_host_warning_enabled ? 'Bật' : 'Tắt'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* TAB 2: RECORDING & PRIVACY */}
                    {activeTab === 'recording' && (
                        <div className="space-y-6">
                            <div className="border-b border-platinum-tint/60 pb-3">
                                <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                    <svg className="w-5 h-5 text-action-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Cấu hình Ghi hình & Quyền riêng tư
                                </h2>
                                <p className="text-xs text-slate-blue mt-1">Cấu hình bảo vệ dữ liệu sinh trắc học và quản lý thời hạn lưu trữ các file đa phương tiện cuộc họp.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recording Retention Days */}
                                <div className="p-5 bg-white border border-platinum-tint rounded-2xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center font-bold text-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-midnight-indigo">Thời hạn lưu trữ Video cuộc họp</label>
                                            <span className="text-xs text-slate-blue">Hệ thống sẽ tự động dọn dẹp các tệp media cũ vượt quá ngưỡng.</span>
                                        </div>
                                    </div>
                                    <div className="relative mt-2 max-w-[200px]">
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={configs.recording_retention_days}
                                            onChange={(e) => handleChange('recording_retention_days', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">ngày</span>
                                    </div>
                                </div>

                                {/* Recording Consent Option */}
                                <div className="p-5 bg-white border border-platinum-tint rounded-2xl space-y-3 flex flex-col justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center font-bold text-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-midnight-indigo">Quyền đồng ý của người tham gia (Consent required)</label>
                                            <span className="text-xs text-slate-blue">Yêu cầu tất cả nhân sự bắt buộc phải nhấn đồng ý qua email trước khi ghi hình.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={configs.is_recording_consent_required}
                                                onChange={(e) => handleChange('is_recording_consent_required', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-platinum-tint peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                                            <span className="ml-3 text-sm font-semibold text-midnight-indigo">
                                                {configs.is_recording_consent_required ? 'Bắt buộc' : 'Không bắt buộc'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: SYSTEM PARAMETERS */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="border-b border-platinum-tint/60 pb-3">
                                <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                    <svg className="w-5 h-5 text-action-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Tham số vận hành hệ thống
                                </h2>
                                <p className="text-xs text-slate-blue mt-1">Thiết lập các giới hạn vận hành chung cho phòng họp và dịch vụ.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Meeting Overrun Policy */}
                                <div className="p-5 bg-white border border-platinum-tint rounded-2xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center font-bold text-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-midnight-indigo">Thời gian ân hạn kết thúc muộn (Overrun limit)</label>
                                            <span className="text-xs text-slate-blue">Thời gian tối đa cuộc họp có thể tiếp tục sau khi hết giờ dự kiến trước khi tự động đóng lại.</span>
                                        </div>
                                    </div>
                                    <div className="relative mt-2 max-w-[200px]">
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={configs.overrun_grace_minutes}
                                            onChange={(e) => handleChange('overrun_grace_minutes', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">phút</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: CAMERA & SENSORS */}
                    {activeTab === 'camera' && (
                        <div className="space-y-8">
                            <div className="border-b border-platinum-tint/60 pb-3">
                                <h2 className="text-base font-bold text-midnight-indigo flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-action-blue" />
                                    Cấu hình Camera & Cảm biến (IVSS)
                                </h2>
                                <p className="text-xs text-slate-blue mt-1">Ánh xạ kênh camera vào phòng họp và thiết lập ngưỡng thời gian vắng mặt.</p>
                            </div>

                            {/* Thresholds */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-white border border-platinum-tint rounded-xl space-y-2">
                                    <label className="block text-xs font-bold text-slate-blue uppercase">Ngưỡng Hiện Diện (s)</label>
                                    <span className="text-xs text-steel-gray mt-0.5 block">Thời gian tối đa ngắt quãng để vẫn tính là đang hiện diện (giây).</span>
                                    <input
                                        type="number" min="0"
                                        value={channelMaps['ivss.presence.gap_threshold_seconds']}
                                        onChange={(e) => setChannelMaps({...channelMaps, 'ivss.presence.gap_threshold_seconds': Number(e.target.value)})}
                                        className="mt-3 w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium focus:border-action-blue"
                                    />
                                </div>
                                <div className="p-4 bg-white border border-platinum-tint rounded-xl space-y-2">
                                    <label className="block text-xs font-bold text-slate-blue uppercase">Ngưỡng Hành Trình (s)</label>
                                    <span className="text-xs text-steel-gray mt-0.5 block">Thời gian tối đa giữa các lần xuất hiện để nối hành trình (giây).</span>
                                    <input
                                        type="number" min="0"
                                        value={channelMaps['campus.journey.gap_threshold_seconds']}
                                        onChange={(e) => setChannelMaps({...channelMaps, 'campus.journey.gap_threshold_seconds': Number(e.target.value)})}
                                        className="mt-3 w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium focus:border-action-blue"
                                    />
                                </div>
                                <div className="p-4 bg-white border border-platinum-tint rounded-xl space-y-2">
                                    <label className="block text-xs font-bold text-slate-blue uppercase">Ân hạn Đi Muộn (phút)</label>
                                    <span className="text-xs text-steel-gray mt-0.5 block">Thời gian cho phép đi muộn không bị đánh dấu vi phạm (phút).</span>
                                    <input
                                        type="number" min="0"
                                        value={channelMaps['attendance.late_grace_minutes']}
                                        onChange={(e) => setChannelMaps({...channelMaps, 'attendance.late_grace_minutes': Number(e.target.value)})}
                                        className="mt-3 w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium focus:border-action-blue"
                                    />
                                </div>
                            </div>

                            {/* Map Table */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-midnight-indigo">Ánh xạ Kênh Camera</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => setLocalChannels([...localChannels, { id: '', roomId: '', direction: '', presenceZone: '', zone: '' }])}
                                        className="px-3 py-1.5 bg-action-blue text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-glacier-blue transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm kênh
                                    </button>
                                </div>
                                
                                <div className="overflow-x-auto border border-platinum-tint rounded-xl">
                                    <table className="w-full text-left text-sm text-midnight-indigo">
                                        <thead className="bg-cloud-mist/50 border-b border-platinum-tint text-xs uppercase text-slate-blue font-bold">
                                            <tr>
                                                <th className="px-4 py-3 min-w-[100px]">ID Kênh</th>
                                                <th className="px-4 py-3 min-w-[150px]">Phòng</th>
                                                <th className="px-4 py-3 min-w-[150px]">Hướng di chuyển</th>
                                                <th className="px-4 py-3 min-w-[150px]">Phân vùng Hiện diện</th>
                                                <th className="px-4 py-3 min-w-[150px]">Phân vùng chung</th>
                                                <th className="px-4 py-3 w-[80px] text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {localChannels.map((row, index) => (
                                                <tr key={index} className="border-b border-platinum-tint last:border-0 hover:bg-slate-50">
                                                    <td className="px-4 py-2">
                                                        <input 
                                                            type="text" 
                                                            value={row.id} 
                                                            onChange={(e) => {
                                                                const newChannels = [...localChannels];
                                                                newChannels[index].id = e.target.value;
                                                                setLocalChannels(newChannels);
                                                            }}
                                                            placeholder="VD: 1, 2"
                                                            className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg focus:border-action-blue text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <select 
                                                            value={row.roomId} 
                                                            onChange={(e) => {
                                                                const newChannels = [...localChannels];
                                                                newChannels[index].roomId = e.target.value;
                                                                setLocalChannels(newChannels);
                                                            }}
                                                            className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg focus:border-action-blue text-sm"
                                                        >
                                                            <option value="">-- Chọn phòng --</option>
                                                            {rooms.map(room => (
                                                                <option key={room.id} value={room.id}>{room.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <select 
                                                            value={row.direction} 
                                                            onChange={(e) => {
                                                                const newChannels = [...localChannels];
                                                                newChannels[index].direction = e.target.value;
                                                                setLocalChannels(newChannels);
                                                            }}
                                                            className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg focus:border-action-blue text-sm"
                                                        >
                                                            <option value="">-- Chọn hướng --</option>
                                                            <option value="enter">Vào (Enter)</option>
                                                            <option value="leave">Ra (Leave)</option>
                                                            <option value="seen">Hiện diện (Seen)</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input 
                                                            type="text" 
                                                            value={row.presenceZone} 
                                                            onChange={(e) => {
                                                                const newChannels = [...localChannels];
                                                                newChannels[index].presenceZone = e.target.value;
                                                                setLocalChannels(newChannels);
                                                            }}
                                                            placeholder="UUID phân vùng"
                                                            className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg focus:border-action-blue text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input 
                                                            type="text" 
                                                            value={row.zone} 
                                                            onChange={(e) => {
                                                                const newChannels = [...localChannels];
                                                                newChannels[index].zone = e.target.value;
                                                                setLocalChannels(newChannels);
                                                            }}
                                                            placeholder="UUID phân vùng"
                                                            className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg focus:border-action-blue text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const newChannels = [...localChannels];
                                                                newChannels.splice(index, 1);
                                                                setLocalChannels(newChannels);
                                                            }}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {localChannels.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-slate-blue text-sm">
                                                        Chưa có cấu hình ánh xạ kênh nào. Bấm "Thêm kênh" để bắt đầu.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* SOFT WARNING MODAL (UC-RUM-15 E1) */}
            {showSoftWarning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm-2 max-w-md w-full overflow-hidden animate-fade-in-up">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between bg-red-50/50">
                            <h3 className="font-bold text-red-700 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Cảnh báo thiết lập ngưỡng nhạy cảm
                            </h3>
                            <button onClick={() => setShowSoftWarning(false)} className="text-slate-blue hover:text-midnight-indigo">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-midnight-indigo leading-relaxed">
                                Ngưỡng phát hiện phòng trống sớm được thiết lập là <strong className="text-red-600">{configs.early_departure_threshold_minutes} phút</strong>.
                            </p>
                            <p className="text-xs text-slate-blue leading-normal">
                                Thiết lập ngưỡng thời gian chờ quá ngắn (dưới 3 phút) có thể khiến hệ thống nhầm lẫn và tự động nhả phòng quá sớm khi mọi người chỉ tạm rời phòng trong giây lát.
                            </p>
                            <p className="text-xs font-semibold text-red-700">
                                Bạn có chắc chắn muốn áp dụng mức cấu hình này không?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-platinum-tint/50 bg-cloud-mist/30 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSoftWarning(false)}
                                className="px-4 py-2 border border-platinum-tint bg-white text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-semibold transition-all"
                            >
                                Quay lại chỉnh sửa
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAggressiveSave}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                            >
                                Tiếp tục áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
