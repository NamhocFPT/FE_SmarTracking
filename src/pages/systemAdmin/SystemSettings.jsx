import { Settings, Camera, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { getSystemConfigs, updateSystemConfig, getChannelMaps, updateChannelMap, getRooms, getNoShowConfig, updateNoShowConfig } from '../../service/sysAdminServices';

/**
 * SystemSettings Component
 * UC-RUM-14: Cập nhật cấu hình ngưỡng thời gian chờ no-show
 * BR-NS-03: Cấu hình ngưỡng no-show và tự động giải phóng phòng
 * BR-PRIV-04: Cấu hình thời gian lưu trữ media (retention) — tab hiện đang ẩn, xem PLAN FE 2026-08-06
 * BR-MTG-OVERRUN-01: Cấu hình thời gian ân hạn kết thúc muộn — tab hiện đang ẩn, xem PLAN FE 2026-08-06
 *
 * Pipeline No-show (theo PLAN FE gửi Nam 2026-08-06): Phát hiện vắng mặt (thresholdMinutes)
 * → Cảnh báo (luôn tự động, không tắt được) → đợi (autoReleaseGraceMinutes) →
 * [nếu autoReleaseEnabled] đổi trạng thái phòng. Tab "Ghi hình & Riêng tư" và "Tham số hệ thống"
 * đang ẩn khỏi thanh chuyển tab theo yêu cầu, code giữ nguyên để dùng lại sau.
 */
const SystemSettings = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState('workspace'); // workspace | camera (recording/system tạm ẩn)

    // API & UI States
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null); // Lỗi tải dữ liệu ban đầu — chặn form, có nút Thử lại
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Cấu hình No-show (nguồn riêng: GET/PUT /no-show-config — KHÔNG dùng chung
    // với /system-configurations, đúng theo PLAN FE gửi Nam 2026-08-06)
    const [noShowConfig, setNoShowConfig] = useState({
        thresholdMinutes: 15,
        autoReleaseGraceMinutes: 5,
        autoReleaseEnabled: true
    });
    const [dbNoShowConfig, setDbNoShowConfig] = useState({
        thresholdMinutes: 15,
        autoReleaseGraceMinutes: 5,
        autoReleaseEnabled: true
    });

    // Config Values State — chỉ còn phục vụ 2 tab đang ẩn (Ghi hình & Riêng tư / Tham số hệ thống)
    const [configs, setConfigs] = useState({
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
    const [channelPage, setChannelPage] = useState(1); // phân trang danh sách ánh xạ kênh camera (client-side)

    // Tracking which keys were modified compared to database
    const [dbConfigs, setDbConfigs] = useState({});

    // Fetch Configurations from API
    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            // No-show config là nguồn dữ liệu bắt buộc cho tab duy nhất đang hiển thị —
            // nếu lỗi thì chặn form + hiện nút Thử lại, không dùng dữ liệu giả (AGENTS.md API RULES).
            const noShowRes = await getNoShowConfig();
            if (!noShowRes?.success || !noShowRes.data) {
                throw new Error(noShowRes?.error?.message || 'Không thể tải cấu hình chính sách No-show.');
            }
            const nsData = noShowRes.data;
            const mergedNoShow = {
                thresholdMinutes: nsData.thresholdMinutes?.value ?? noShowConfig.thresholdMinutes,
                autoReleaseGraceMinutes: nsData.autoReleaseGraceMinutes?.value ?? noShowConfig.autoReleaseGraceMinutes,
                autoReleaseEnabled: nsData.autoReleaseEnabled?.value ?? noShowConfig.autoReleaseEnabled
            };
            setNoShowConfig(mergedNoShow);
            setDbNoShowConfig(mergedNoShow);

            // Cấu hình chung — chỉ phục vụ 2 tab đang ẩn, lỗi ở đây không chặn tab No-show/Camera
            try {
                const res = await getSystemConfigs();
                if (res?.success && Array.isArray(res.data)) {
                    const mappedConfigs = {};
                    res.data.forEach(item => {
                        let parsedValue = item.value;
                        if (parsedValue === 'true') parsedValue = true;
                        else if (parsedValue === 'false') parsedValue = false;
                        else if (!isNaN(parsedValue) && parsedValue !== '') parsedValue = Number(parsedValue);
                        mappedConfigs[item.key] = parsedValue;
                    });
                    const merged = { ...configs, ...mappedConfigs };
                    setConfigs(merged);
                    setDbConfigs(merged);
                }
            } catch (genErr) {
                console.error('Không thể tải cấu hình hệ thống chung (tab đang ẩn):', genErr);
            }

            // Channel maps + rooms (tab Camera & Cảm biến)
            const [channelRes, roomRes] = await Promise.all([
                getChannelMaps().catch(() => ({ success: true, data: [] })),
                getRooms({ page: 1, limit: 100 }).catch(() => ({ success: true, data: [] }))
            ]);

            if (channelRes?.success && Array.isArray(channelRes.data)) {
                const mappedChannels = {};
                channelRes.data.forEach(item => {
                    let parsedValue = item.value;
                    try {
                        if (typeof parsedValue === 'string' && parsedValue.trim().startsWith('{')) {
                            parsedValue = JSON.parse(parsedValue);
                        }
                    } catch (e) {}
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
                let roomData = [];
                if (Array.isArray(roomRes.data?.items)) roomData = roomRes.data.items;
                else if (Array.isArray(roomRes.data?.rooms)) roomData = roomRes.data.rooms;
                else if (Array.isArray(roomRes.data?.data)) roomData = roomRes.data.data;
                else if (Array.isArray(roomRes.data)) roomData = roomRes.data;
                setRooms(roomData);
            }
        } catch (err) {
            setLoadError(err?.message || err?.error?.message || 'Không thể tải cấu hình hệ thống. Vui lòng thử lại.');
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

    // Handle single input changes (tab đang ẩn — Ghi hình & Riêng tư / Tham số hệ thống)
    const handleChange = (key, value) => {
        setConfigs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle thay đổi cấu hình No-show
    const handleNoShowChange = (key, value) => {
        setNoShowConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Form validation check
    const validateConfigs = (noShow, data) => {
        if (Number(noShow.thresholdMinutes) <= 0) {
            setError('Ngưỡng phát hiện vắng mặt phải là số nguyên dương.');
            return false;
        }
        if (Number(noShow.autoReleaseGraceMinutes) <= 0) {
            setError('Thời gian chờ phản hồi phải là số nguyên dương.');
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
            if (newRoomMap[id] !== undefined) {
                setError(`ID Kênh Camera bị trùng lặp: ${id}`);
                return;
            }
            // Only add keys with non-empty values.
            // Missing keys will be implicitly deleted since the BE fully replaces the JSON object.
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

        if (!validateConfigs(noShowConfig, configs)) return;

        setSaving(true);

        // Cấu hình chung (tab đang ẩn) — key nào đổi so với DB
        const changedKeys = Object.keys(configs).filter(key => configs[key] !== dbConfigs[key]);
        const changedChannelKeys = Object.keys(currentChannelMaps).filter(key => {
            const currentVal = currentChannelMaps[key];
            const dbVal = dbChannelMaps[key];

            // Check if value actually changed
            if (JSON.stringify(currentVal) === JSON.stringify(dbVal)) return false;

            // Allow sending changed objects even if they appear "empty"
            // (e.g. they only contain nulls to delete keys)
            if (typeof currentVal === 'object' && currentVal !== null) {
                return true;
            } else {
                return currentVal !== '' && currentVal !== null && currentVal !== undefined;
            }
        });

        // No-show config — đổi field nào so với DB (toggle hoặc 2 ô số)
        const noShowChanged = Object.keys(noShowConfig).some(key => noShowConfig[key] !== dbNoShowConfig[key]);

        if (changedKeys.length === 0 && changedChannelKeys.length === 0 && !noShowChanged) {
            setSuccessMessage('Không có thay đổi nào cần lưu.');
            setSaving(false);
            return;
        }

        try {
            const updatePromises = changedKeys.map(key => {
                const valueString = String(configs[key]);
                return updateSystemConfig({ key, value: valueString });
            });

            // PUT /no-show-config — luôn gửi đủ 4 field theo đúng payload PLAN FE gửi Nam
            // 2026-08-06 (warningGraceMinutes ẩn khỏi UI nhưng vẫn gửi ngầm = 0).
            if (noShowChanged) {
                updatePromises.push(updateNoShowConfig({
                    thresholdMinutes: Number(noShowConfig.thresholdMinutes),
                    warningGraceMinutes: 0,
                    autoReleaseGraceMinutes: Number(noShowConfig.autoReleaseGraceMinutes),
                    autoReleaseEnabled: Boolean(noShowConfig.autoReleaseEnabled)
                }));
            }

            // Endpoint /system-configurations/channel-maps lưu thẳng vào cột config_json (JSONB) —
            // BE cần nhận value đúng kiểu gốc (object cho 4 map, number cho 3 ngưỡng), KHÔNG stringify.
            // Stringify object ở đây sẽ khiến BE báo "Value ... phải là object dạng {...}".
            const updateChannelPromises = changedChannelKeys.map(key => {
                return updateChannelMap({ key, value: currentChannelMaps[key] });
            });

            await Promise.all([...updatePromises, ...updateChannelPromises]);

            // Re-fetch or sync state to ensure we have the absolute latest from DB
            await fetchConfigs();
            setSuccessMessage('Cập nhật chính sách và tham số cấu hình hệ thống thành công.');

        } catch (err) {
            setError(err?.message || err?.error?.message || 'Không thể cập nhật cấu hình hệ thống. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Reset current tab inputs to DB state
    const handleReset = () => {
        setError(null);
        setNoShowConfig({ ...dbNoShowConfig });
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
        setChannelPage(1);
    };

    // Phân trang danh sách kênh camera (client-side — dữ liệu đã có sẵn từ channel maps, không gọi lại API)
    const CHANNELS_PER_PAGE = 8;
    const totalChannelPages = Math.max(1, Math.ceil(localChannels.length / CHANNELS_PER_PAGE));
    const safeChannelPage = Math.min(channelPage, totalChannelPages);
    const paginatedChannels = localChannels.slice(
        (safeChannelPage - 1) * CHANNELS_PER_PAGE,
        safeChannelPage * CHANNELS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-blue text-sm font-medium">Đang tải cấu hình hệ thống...</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <p className="font-bold text-midnight-indigo">Không thể tải cấu hình hệ thống</p>
                    <p className="text-sm text-slate-blue mt-1 max-w-md">{loadError}</p>
                </div>
                <button
                    type="button"
                    onClick={fetchConfigs}
                    className="px-4 py-2 bg-action-blue text-white hover:bg-glacier-blue rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                >
                    Thử lại
                </button>
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
                        Cấu hình chính sách No-show, tự động giải phóng phòng và ánh xạ camera.
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

            {/* Navigation Tabs — "Ghi hình & Riêng tư" và "Tham số hệ thống" tạm ẩn theo PLAN FE
                gửi Nam 2026-08-06 (không xóa code, chỉ bỏ nút chuyển tab). */}
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
                                    <p className="text-xs text-slate-blue mt-1">Phát hiện vắng mặt → gửi cảnh báo (luôn tự động) → chờ phản hồi → nếu bật, tự động đổi trạng thái phòng.</p>
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
                                                    checked={noShowConfig.autoReleaseEnabled}
                                                    onChange={(e) => handleNoShowChange('autoReleaseEnabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-platinum-tint peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                                                <span className="ml-3 text-sm font-semibold text-midnight-indigo">
                                                    {noShowConfig.autoReleaseEnabled ? 'Bật' : 'Tắt'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Detection threshold minutes */}
                                    <div className="p-4 bg-white border border-platinum-tint rounded-xl space-y-2">
                                        <label className="block text-xs font-bold text-slate-blue uppercase">Ngưỡng phát hiện vắng mặt</label>
                                        <span className="text-xs text-steel-gray mt-0.5 block">Thời gian không check-in kể từ giờ họp trước khi bị đánh dấu no-show (phút).</span>
                                        <div className="mt-3 relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="1440"
                                                value={noShowConfig.thresholdMinutes}
                                                onChange={(e) => handleNoShowChange('thresholdMinutes', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">phút</span>
                                        </div>
                                    </div>

                                    {/* Warning countdown minutes */}
                                    <div className="p-4 bg-white border border-platinum-tint rounded-xl space-y-2">
                                        <label className="block text-xs font-bold text-slate-blue uppercase">Thời gian chờ phản hồi</label>
                                        <span className="text-xs text-steel-gray mt-0.5 block">Thời gian cho phép Host xác nhận trước khi nhả phòng (phút).</span>
                                        <div className="mt-3 relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="1440"
                                                value={noShowConfig.autoReleaseGraceMinutes}
                                                onChange={(e) => handleNoShowChange('autoReleaseGraceMinutes', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm font-medium text-midnight-indigo focus:outline-none focus:border-action-blue"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-slate-blue font-semibold">phút</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* TAB 2: RECORDING & PRIVACY — tạm ẩn khỏi thanh chuyển tab (PLAN FE gửi Nam
                        2026-08-06), giữ nguyên code để dùng lại sau. */}
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

                    {/* TAB 3: SYSTEM PARAMETERS — tạm ẩn khỏi thanh chuyển tab (PLAN FE gửi Nam
                        2026-08-06), giữ nguyên code để dùng lại sau. */}
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

                            {/* Map List (Compact Table + Phân trang — tránh giao diện kéo dài, không dùng scroll dọc) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-midnight-indigo">Ánh xạ Kênh Camera</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newChannels = [...localChannels, { id: '', roomId: '', direction: '', presenceZone: '', zone: '' }];
                                            setLocalChannels(newChannels);
                                            setChannelPage(Math.ceil(newChannels.length / CHANNELS_PER_PAGE)); // nhảy tới trang chứa kênh vừa thêm
                                        }}
                                        className="px-3 py-1.5 bg-action-blue text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-glacier-blue transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm kênh
                                    </button>
                                </div>

                                {localChannels.length === 0 ? (
                                    <div className="p-8 text-center border border-platinum-tint border-dashed rounded-xl text-slate-blue text-sm">
                                        Chưa có cấu hình ánh xạ kênh nào. Bấm "Thêm kênh" để bắt đầu.
                                    </div>
                                ) : (
                                    <div className="bg-white border border-platinum-tint rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm min-w-[760px]">
                                                <thead className="bg-cloud-mist/50 border-b border-platinum-tint">
                                                    <tr>
                                                        <th className="px-3 py-2.5 font-bold text-[11px] text-slate-blue uppercase tracking-wider w-24">ID Kênh</th>
                                                        <th className="px-3 py-2.5 font-bold text-[11px] text-slate-blue uppercase tracking-wider">Phòng</th>
                                                        <th className="px-3 py-2.5 font-bold text-[11px] text-slate-blue uppercase tracking-wider w-44">Hướng di chuyển</th>
                                                        <th className="px-3 py-2.5 font-bold text-[11px] text-slate-blue uppercase tracking-wider">Phân vùng hiện diện</th>
                                                        <th className="px-3 py-2.5 font-bold text-[11px] text-slate-blue uppercase tracking-wider">Phân vùng chung</th>
                                                        <th className="px-3 py-2.5 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-platinum-tint">
                                                    {paginatedChannels.map((row, pageIdx) => {
                                                        const index = (safeChannelPage - 1) * CHANNELS_PER_PAGE + pageIdx;
                                                        return (
                                                            <tr key={index} className="hover:bg-cloud-mist/30 transition-colors">
                                                                <td className="px-3 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={row.id}
                                                                        onChange={(e) => {
                                                                            const newChannels = [...localChannels];
                                                                            newChannels[index].id = e.target.value;
                                                                            setLocalChannels(newChannels);
                                                                        }}
                                                                        placeholder="VD: 1"
                                                                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg text-xs focus:border-action-blue"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <select
                                                                        value={row.roomId}
                                                                        onChange={(e) => {
                                                                            const newChannels = [...localChannels];
                                                                            newChannels[index].roomId = e.target.value;
                                                                            setLocalChannels(newChannels);
                                                                        }}
                                                                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg text-xs focus:border-action-blue"
                                                                    >
                                                                        <option value="">-- Chọn phòng --</option>
                                                                        {rooms.map((room, idx) => (
                                                                            <option key={room.id || room.roomId || idx} value={room.id || room.roomId}>{room.roomName || room.room_name}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <select
                                                                        value={row.direction}
                                                                        onChange={(e) => {
                                                                            const newChannels = [...localChannels];
                                                                            newChannels[index].direction = e.target.value;
                                                                            setLocalChannels(newChannels);
                                                                        }}
                                                                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg text-xs focus:border-action-blue"
                                                                    >
                                                                        <option value="">-- Chọn hướng --</option>
                                                                        <option value="enter">Vào (Enter)</option>
                                                                        <option value="leave">Ra (Leave)</option>
                                                                        <option value="seen">Hiện diện (Seen)</option>
                                                                    </select>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={row.presenceZone}
                                                                        onChange={(e) => {
                                                                            const newChannels = [...localChannels];
                                                                            newChannels[index].presenceZone = e.target.value;
                                                                            setLocalChannels(newChannels);
                                                                        }}
                                                                        placeholder="UUID phân vùng"
                                                                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg text-xs font-mono focus:border-action-blue"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={row.zone}
                                                                        onChange={(e) => {
                                                                            const newChannels = [...localChannels];
                                                                            newChannels[index].zone = e.target.value;
                                                                            setLocalChannels(newChannels);
                                                                        }}
                                                                        placeholder="UUID phân vùng"
                                                                        className="w-full px-2 py-1.5 border border-platinum-tint rounded-lg text-xs font-mono focus:border-action-blue"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newChannels = [...localChannels];
                                                                            newChannels.splice(index, 1);
                                                                            setLocalChannels(newChannels);
                                                                            const newTotalPages = Math.max(1, Math.ceil(newChannels.length / CHANNELS_PER_PAGE));
                                                                            if (safeChannelPage > newTotalPages) setChannelPage(newTotalPages);
                                                                        }}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Xóa kênh"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {totalChannelPages > 1 && (
                                            <div className="px-4 py-3 bg-cloud-mist/30 border-t border-platinum-tint flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-blue">
                                                    Trang {safeChannelPage} / {totalChannelPages} (Tổng {localChannels.length} kênh)
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setChannelPage(Math.max(1, safeChannelPage - 1))}
                                                        disabled={safeChannelPage === 1}
                                                        className="px-3 py-1.5 text-xs font-bold bg-white border border-platinum-tint rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                                                    >
                                                        Trước
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setChannelPage(Math.min(totalChannelPages, safeChannelPage + 1))}
                                                        disabled={safeChannelPage === totalChannelPages}
                                                        className="px-3 py-1.5 text-xs font-bold bg-white border border-platinum-tint rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SystemSettings;
