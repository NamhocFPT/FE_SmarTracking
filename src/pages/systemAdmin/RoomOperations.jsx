import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings, RefreshCw, Save, AlertTriangle, CheckCircle,
    Clock, Building2, Zap, Info
} from 'lucide-react';
import {
    getNoShowConfig, updateNoShowConfig,
    getEarlyVacancyConfig, updateEarlyVacancyConfig,
    getRoomsRealtimeStatus
} from '../../service/sysAdminServices';
import { motion, AnimatePresence } from 'framer-motion';

// ──────────────────────────────────────────
// CONFIG FORM CARD
// ──────────────────────────────────────────
const ConfigCard = ({ title, description, icon: Icon, iconColor, fields, values, errors, onChange, onSave, saving }) => (
    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-midnight-indigo">{title}</h3>
                    <p className="text-xs text-slate-blue mt-0.5">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {fields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-xs font-bold text-slate-blue uppercase tracking-wider mb-1.5">
                            {field.label}
                            {field.unit && <span className="ml-1 font-normal normal-case text-slate-blue/60">({field.unit})</span>}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="number"
                            min={field.min ?? 0}
                            max={field.max ?? 1440}
                            value={values[field.key] ?? ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                            placeholder={`Mặc định: ${field.default}`}
                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:bg-white transition-colors ${
                                errors[field.key] ? 'border-red-400 focus:border-red-500' : 'border-platinum-tint focus:border-action-blue'
                            }`}
                        />
                        {errors[field.key] && <p className="text-xs text-red-500 font-medium mt-1">{errors[field.key]}</p>}
                        <p className="text-[10px] text-slate-blue/70 mt-1">{field.hint}</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-action-blue hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu cấu hình
                </button>
            </div>
        </div>
    </div>
);

// ──────────────────────────────────────────
// ROOM STATUS GRID
// ──────────────────────────────────────────
const roomStatusConfig = {
    available: { label: 'Trống', color: 'bg-green-100 text-green-700 border-green-200' },
    occupied: { label: 'Đang sử dụng', color: 'bg-red-100 text-red-700 border-red-200' },
    reserved: { label: 'Đã đặt', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    maintenance: { label: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    inactive: { label: 'Ngừng hoạt động', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const RoomStatusGrid = ({ rooms, loading }) => {
    if (loading) return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-28" />
            ))}
        </div>
    );

    if (!rooms.length) return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-blue">
            <Building2 className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-bold text-midnight-indigo">Không có dữ liệu phòng họp</p>
            <p className="text-xs mt-1">Chưa có phòng nào được cấu hình trong hệ thống.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => {
                const status = roomStatusConfig[room.currentStatus] || roomStatusConfig.inactive;
                return (
                    <div key={room.roomId} className="bg-white rounded-2xl border border-platinum-tint p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
                        </div>
                        <p className="font-bold text-midnight-indigo text-sm leading-tight">{room.roomName || room.roomCode}</p>
                        <p className="text-[11px] text-slate-blue mt-0.5">{room.roomCode}</p>
                        {room.currentBooking?.meetingTitle && (
                            <p className="text-[10px] text-slate-blue/70 mt-1.5 truncate" title={room.currentBooking.meetingTitle}>
                                📅 {room.currentBooking.meetingTitle}
                            </p>
                        )}
                        {room.occupancyCount !== null && room.occupancyCount !== undefined && (
                            <p className="text-[10px] text-slate-blue/70 mt-0.5">👥 {room.occupancyCount} người</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ──────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────
const RoomOperations = () => {
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    // No-Show Config state
    const [noShowValues, setNoShowValues] = useState({ thresholdMinutes: '', warningGraceMinutes: '', autoReleaseGraceMinutes: '' });
    const [noShowErrors, setNoShowErrors] = useState({});
    const [noShowSource, setNoShowSource] = useState({});
    const [savingNoShow, setSavingNoShow] = useState(false);

    // Early Vacancy Config state
    const [evValues, setEvValues] = useState({ emptyMinutes: '', minRemainingMinutes: '', minElapsedMinutes: '' });
    const [evErrors, setEvErrors] = useState({});
    const [evSource, setEvSource] = useState({});
    const [savingEv, setSavingEv] = useState(false);

    // Room Status state
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(true);

    const showToast = (msg, isError = false) => {
        if (isError) setError(msg);
        else setSuccessMessage(msg);
        setTimeout(() => { setSuccessMessage(null); setError(null); }, 3500);
    };

    // Load all configs
    const loadConfigs = useCallback(async () => {
        try {
            const [nsRes, evRes, roomsRes] = await Promise.all([
                getNoShowConfig(),
                getEarlyVacancyConfig(),
                getRoomsRealtimeStatus()
            ]);

            if (nsRes?.success && nsRes.data) {
                const d = nsRes.data;
                setNoShowValues({
                    thresholdMinutes: d.thresholdMinutes?.value ?? '',
                    warningGraceMinutes: d.warningGraceMinutes?.value ?? '',
                    autoReleaseGraceMinutes: d.autoReleaseGraceMinutes?.value ?? '',
                });
                setNoShowSource({
                    thresholdMinutes: d.thresholdMinutes?.source,
                    warningGraceMinutes: d.warningGraceMinutes?.source,
                    autoReleaseGraceMinutes: d.autoReleaseGraceMinutes?.source,
                });
            }

            if (evRes?.success && evRes.data) {
                const d = evRes.data;
                setEvValues({
                    emptyMinutes: d.emptyMinutes?.value ?? '',
                    minRemainingMinutes: d.minRemainingMinutes?.value ?? '',
                    minElapsedMinutes: d.minElapsedMinutes?.value ?? '',
                });
                setEvSource({
                    emptyMinutes: d.emptyMinutes?.source,
                    minRemainingMinutes: d.minRemainingMinutes?.source,
                    minElapsedMinutes: d.minElapsedMinutes?.source,
                });
            }

            if (roomsRes?.success) {
                setRooms(roomsRes.data || []);
            }
        } catch (err) {
            showToast('Không thể tải cấu hình hệ thống. Vui lòng thử lại.', true);
        } finally {
            setRoomsLoading(false);
        }
    }, []);

    useEffect(() => { loadConfigs(); }, [loadConfigs]);

    // ── NoShow handlers
    const validateNoShow = () => {
        const errs = {};
        const { thresholdMinutes, warningGraceMinutes, autoReleaseGraceMinutes } = noShowValues;
        if (thresholdMinutes !== '' && (isNaN(thresholdMinutes) || +thresholdMinutes < 1 || +thresholdMinutes > 1440))
            errs.thresholdMinutes = 'Phải từ 1 đến 1440 phút';
        if (warningGraceMinutes !== '' && (isNaN(warningGraceMinutes) || +warningGraceMinutes < 0 || +warningGraceMinutes > 1440))
            errs.warningGraceMinutes = 'Phải từ 0 đến 1440 phút';
        if (autoReleaseGraceMinutes !== '' && (isNaN(autoReleaseGraceMinutes) || +autoReleaseGraceMinutes < 1 || +autoReleaseGraceMinutes > 1440))
            errs.autoReleaseGraceMinutes = 'Phải từ 1 đến 1440 phút';
        setNoShowErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveNoShow = async () => {
        if (!validateNoShow()) return;
        setSavingNoShow(true);
        try {
            const payload = {};
            if (noShowValues.thresholdMinutes !== '') payload.thresholdMinutes = +noShowValues.thresholdMinutes;
            if (noShowValues.warningGraceMinutes !== '') payload.warningGraceMinutes = +noShowValues.warningGraceMinutes;
            if (noShowValues.autoReleaseGraceMinutes !== '') payload.autoReleaseGraceMinutes = +noShowValues.autoReleaseGraceMinutes;

            if (Object.keys(payload).length === 0) { showToast('Vui lòng nhập ít nhất một trường để cập nhật.', true); return; }

            const res = await updateNoShowConfig(payload);
            if (res?.success) showToast('Đã lưu cấu hình No-Show thành công!');
            else showToast(res?.message || 'Không thể lưu cấu hình No-Show.', true);
        } catch (e) { showToast('Lỗi kết nối khi lưu cấu hình.', true); }
        finally { setSavingNoShow(false); }
    };

    // ── Early Vacancy handlers
    const validateEv = () => {
        const errs = {};
        const { emptyMinutes, minRemainingMinutes, minElapsedMinutes } = evValues;
        if (emptyMinutes !== '' && (isNaN(emptyMinutes) || +emptyMinutes < 1))
            errs.emptyMinutes = 'Phải là số nguyên ≥ 1';
        if (minRemainingMinutes !== '' && (isNaN(minRemainingMinutes) || +minRemainingMinutes < 0))
            errs.minRemainingMinutes = 'Phải là số nguyên ≥ 0';
        if (minElapsedMinutes !== '' && (isNaN(minElapsedMinutes) || +minElapsedMinutes < 0))
            errs.minElapsedMinutes = 'Phải là số nguyên ≥ 0';
        setEvErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveEv = async () => {
        if (!validateEv()) return;
        setSavingEv(true);
        try {
            const payload = {};
            if (evValues.emptyMinutes !== '') payload.emptyMinutes = +evValues.emptyMinutes;
            if (evValues.minRemainingMinutes !== '') payload.minRemainingMinutes = +evValues.minRemainingMinutes;
            if (evValues.minElapsedMinutes !== '') payload.minElapsedMinutes = +evValues.minElapsedMinutes;

            if (Object.keys(payload).length === 0) { showToast('Vui lòng nhập ít nhất một trường để cập nhật.', true); return; }

            const res = await updateEarlyVacancyConfig(payload);
            if (res?.success) showToast('Đã lưu cấu hình phòng trống sớm thành công!');
            else showToast(res?.message || 'Không thể lưu cấu hình.', true);
        } catch (e) { showToast('Lỗi kết nối khi lưu cấu hình.', true); }
        finally { setSavingEv(false); }
    };

    const sourceLabel = (key, srcMap) => {
        const s = srcMap[key];
        if (!s) return null;
        const map = { system_configs: 'Cấu hình DB', env: 'Biến môi trường', default: 'Mặc định hệ thống' };
        return <span className="text-[10px] text-slate-blue/60">Nguồn: {map[s] || s}</span>;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-midnight-indigo tracking-tight">Vận hành Phòng họp</h1>
                    <p className="text-slate-blue text-sm mt-1">Cấu hình các ngưỡng No-Show, tự động giải phóng và trạng thái phòng theo thời gian thực.</p>
                </div>
                <button
                    onClick={() => { setRoomsLoading(true); loadConfigs(); }}
                    className="p-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo rounded-xl hover:bg-cloud-mist transition-colors"
                    title="Tải lại"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Toast messages */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{successMessage}</span>
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                    Để trống các ô cấu hình sẽ giữ nguyên giá trị hiện tại. Hệ thống ưu tiên theo thứ tự: <strong>Cấu hình DB</strong> → Biến môi trường → Mặc định hệ thống.
                </p>
            </div>

            {/* No-Show Config */}
            <ConfigCard
                title="Cấu hình No-Show (Vắng mặt)"
                description="Thiết lập ngưỡng thời gian để xác định trường hợp vắng mặt và tự động giải phóng phòng."
                icon={Clock}
                iconColor="bg-orange-100 text-orange-600"
                fields={[
                    { key: 'thresholdMinutes', label: 'Ngưỡng No-Show', unit: 'phút', min: 1, max: 1440, default: 15, hint: 'Sau bao nhiêu phút không có mặt thì tính là No-Show' },
                    { key: 'warningGraceMinutes', label: 'Thời gian cảnh báo', unit: 'phút', min: 0, max: 1440, default: 0, hint: 'Cảnh báo trước khi tính No-Show (0 = không cảnh báo)' },
                    { key: 'autoReleaseGraceMinutes', label: 'Tự giải phóng sau', unit: 'phút', min: 1, max: 1440, default: 5, hint: 'Thời gian thêm trước khi phòng được tự động giải phóng' },
                ]}
                values={noShowValues}
                errors={noShowErrors}
                onChange={(key, val) => setNoShowValues(prev => ({ ...prev, [key]: val }))}
                onSave={handleSaveNoShow}
                saving={savingNoShow}
            />

            {/* Early Vacancy Config */}
            <ConfigCard
                title="Cấu hình Phòng Trống Sớm (Early Vacancy)"
                description="Xác định khi nào một phòng được coi là trống sớm so với lịch đặt."
                icon={Zap}
                iconColor="bg-purple-100 text-purple-600"
                fields={[
                    { key: 'emptyMinutes', label: 'Phòng trống tối thiểu', unit: 'phút', min: 1, max: 1440, default: 10, hint: 'Phòng phải trống ít nhất bao lâu để tính là trống sớm' },
                    { key: 'minRemainingMinutes', label: 'Thời gian đặt còn lại', unit: 'phút', min: 0, max: 1440, default: 15, hint: 'Thời gian đặt phòng còn lại tối thiểu để kích hoạt' },
                    { key: 'minElapsedMinutes', label: 'Thời gian đã trôi qua', unit: 'phút', min: 0, max: 1440, default: 10, hint: 'Thời gian đã qua kể từ khi đặt phòng bắt đầu' },
                ]}
                values={evValues}
                errors={evErrors}
                onChange={(key, val) => setEvValues(prev => ({ ...prev, [key]: val }))}
                onSave={handleSaveEv}
                saving={savingEv}
            />

            {/* Room Status Grid */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-action-blue rounded-xl">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-midnight-indigo">Trạng thái Phòng theo Thời gian Thực</h3>
                            <p className="text-xs text-slate-blue mt-0.5">Tổng quan toàn bộ trạng thái phòng họp trong hệ thống.</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold">
                        {Object.entries(roomStatusConfig).map(([k, v]) => (
                            <span key={k} className={`px-2 py-0.5 rounded-full border ${v.color}`}>{v.label}</span>
                        ))}
                    </div>
                </div>
                <div className="p-6">
                    <RoomStatusGrid rooms={rooms} loading={roomsLoading} />
                </div>
            </div>
        </div>
    );
};

export default RoomOperations;
