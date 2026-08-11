import { AlertTriangle, Calendar, Camera, CheckCircle, ChevronLeft, ChevronRight, Edit2, Eye, History, LogIn, LogOut, Map, MapPin, Monitor, Plus, RefreshCw, Search, Server, Shield, ShieldCheck, ShieldQuestion, Trash2, Video } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { createPortal } from 'react-dom';
import {
    getZones, getZoneById, createZone, updateZone,
    deleteZone, assignDeviceToZone, removeDeviceFromZone
} from '../../service/zoneServices';
import { getDevices, getZoneAccessLog } from '../../service/sysAdminServices';
import EventSnapshotModal from '../../components/security/EventSnapshotModal';
import ThumbnailImage from '../../components/common/ThumbnailImage';


// ─── helpers ────────────────────────────────────────────────────────────────

const getTodayVN = () => {
    const d = new Date();
    const vn = new Date(d.getTime() + (7 * 60 + d.getTimezoneOffset()) * 60 * 1000);
    return vn.toISOString().slice(0, 10);
};

const fmtEventTime = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch { return '—'; }
};

// ─── inline badges ───────────────────────────────────────────────────────────

const ZoneDirectionBadge = ({ direction }) => {
    if (direction === 'enter')
        return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap"><LogIn className="w-2.5 h-2.5" />Vào</span>;
    if (direction === 'leave')
        return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 whitespace-nowrap"><LogOut className="w-2.5 h-2.5" />Ra</span>;
    return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 whitespace-nowrap"><Eye className="w-2.5 h-2.5" />Thấy</span>;
};

const ZoneStatusBadge = ({ isStranger, matchState }) => {
    if (isStranger)
        return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 whitespace-nowrap"><AlertTriangle className="w-2.5 h-2.5" />Người lạ</span>;
    if (matchState && matchState !== 'matched')
        return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 whitespace-nowrap"><ShieldQuestion className="w-2.5 h-2.5" />Chưa khớp</span>;
    return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap"><ShieldCheck className="w-2.5 h-2.5" />Khớp</span>;
};

// ─── ZoneAccessLogCard ───────────────────────────────────────────────────────

const ZONE_LOG_LIMIT = 20;

const ZoneAccessLogCard = ({ zoneId }) => {
    const [date, setDate] = useState(getTodayVN);
    const [page, setPage] = useState(1);
    const [events, setEvents] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [matchedCount, setMatchedCount] = useState(0);
    const [unmatchedCount, setUnmatchedCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snapshotEventId, setSnapshotEventId] = useState(null);
    const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

    // reset page when zone or date changes
    const prevZoneRef = useRef(zoneId);
    useEffect(() => {
        if (prevZoneRef.current !== zoneId) {
            prevZoneRef.current = zoneId;
            setPage(1);
        }
    }, [zoneId]);

    useEffect(() => { setPage(1); }, [date]);

    const fetchLog = useCallback(async () => {
        if (!zoneId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getZoneAccessLog(zoneId, date, { page, limit: ZONE_LOG_LIMIT });
            if (res?.success && res.data) {
                const evList = res.data.events || res.data.items || [];
                setEvents(evList);
                const pag = res.data.pagination || {};
                const tp = pag.totalPages ?? Math.max(1, Math.ceil((pag.total ?? evList.length) / ZONE_LOG_LIMIT));
                setTotalPages(tp);
                setTotal(res.data.totalEvents ?? pag.total ?? pag.totalItems ?? evList.length);
                setMatchedCount(res.data.matchedCount ?? 0);
                setUnmatchedCount(res.data.unmatchedCount ?? 0);
            } else {
                throw new Error(res?.message || 'Không thể tải nhật ký.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi khi tải nhật ký ra vào.');
        } finally {
            setLoading(false);
        }
    }, [zoneId, date, page]);

    useEffect(() => { fetchLog(); }, [fetchLog]);

    const openSnapshot = (eventId) => {
        setSnapshotEventId(eventId);
        setIsSnapshotOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-platinum-tint bg-cloud-mist/30 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4 text-action-blue" />
                        Nhật ký ra vào khu vực
                    </h3>
                    {!loading && total > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">{total} sự kiện</span>
                            {matchedCount > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">{matchedCount} khớp</span>}
                            {unmatchedCount > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">{unmatchedCount} chưa khớp</span>}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-action-blue pointer-events-none" />
                        <input
                            type="date"
                            value={date}
                            max={getTodayVN()}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-8 pr-3 py-1.5 border border-platinum-tint rounded-xl text-xs font-semibold text-midnight-indigo bg-white hover:border-action-blue/50 focus:outline-none focus:border-action-blue focus:ring-2 focus:ring-action-blue/10 transition-all cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={fetchLog}
                        className="p-1.5 text-slate-blue hover:text-action-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Event list */}
            <div className="divide-y divide-platinum-tint">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                            <div className="w-16 h-9 bg-slate-100 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-slate-100 rounded w-32" />
                                <div className="h-2.5 bg-slate-100 rounded w-20" />
                            </div>
                            <div className="h-5 w-12 bg-slate-100 rounded-full" />
                        </div>
                    ))
                ) : events.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">Không có sự kiện nào trong ngày này</p>
                    </div>
                ) : (
                    events.map((ev) => {
                        const time = fmtEventTime(ev.eventTime || ev.timestamp);
                        const name = ev.fullName || (ev.isStranger ? 'Người lạ' : 'Không nhận diện được');
                        const isUnmatched = !ev.isStranger && ev.matchState && ev.matchState !== 'matched';
                        const rowBg = ev.isStranger
                            ? 'bg-red-50/60 border-l-2 border-l-red-400'
                            : isUnmatched
                                ? 'bg-amber-50/40 border-l-2 border-l-amber-300'
                                : '';
                        return (
                            <div key={ev.id} className={`flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60 transition-colors ${rowBg}`}>
                                {/* Thumbnail */}
                                <ThumbnailImage
                                    eventId={ev.id}
                                    onClick={() => openSnapshot(ev.id)}
                                    className="w-16 aspect-video rounded-lg flex-shrink-0"
                                />
                                {/* Identity */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold truncate ${ev.isStranger ? 'text-red-700' : 'text-midnight-indigo'}`}>{name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{time}</p>
                                </div>
                                {/* Badges */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <ZoneDirectionBadge direction={ev.direction} />
                                    <ZoneStatusBadge isStranger={ev.isStranger} matchState={ev.matchState} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-platinum-tint flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Trang {page}/{totalPages}</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="p-1.5 rounded-lg text-slate-blue hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="p-1.5 rounded-lg text-slate-blue hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Snapshot modal */}
            <EventSnapshotModal
                isOpen={isSnapshotOpen}
                onClose={() => { setIsSnapshotOpen(false); setSnapshotEventId(null); }}
                eventId={snapshotEventId}
            />
        </div>
    );
};

// ─── main component ───────────────────────────────────────────────────────────

const ZoneManagement = () => {
    // Data states
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [createForm, setCreateForm] = useState({
        zone_code: '',
        zone_name: '',
        zone_type: 'room',
        building: '',
        floor: '',
        description: ''
    });


    const fetchZones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getZones({ limit: 100 });
            if (res?.success) {
                setZones(res.data || []);
            } else {
                setError('Không thể tải danh sách khu vực.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi khi tải dữ liệu hệ thống.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAvailableDevices = useCallback(async () => {
        try {
            const res = await getDevices({ limit: 100 });
            if (res?.success) {
                const data = res.data || [];
                const cameras = data.filter(d => ['ip_camera', 'door_camera', 'room_camera', 'occupancy_sensor', 'face_server'].includes(d.device_type));
                setAvailableDevices(cameras);
            }
        } catch (err) {
            console.error('Lỗi tải thiết bị:', err);
        }
    }, []);

    useEffect(() => {
        fetchZones();
        fetchAvailableDevices();
    }, [fetchZones, fetchAvailableDevices]);

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);

    const handleSelectZone = async (zone) => {
        setDetailLoading(true);
        setError(null);
        try {
            const res = await getZoneById(zone.id);
            if (res?.success) {
                setSelectedZone(res.data);
            } else {
                setSelectedZone(zone); // Fallback
            }
        } catch (err) {
            setSelectedZone(zone);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await createZone(createForm);
            if (res?.success) {
                setSuccessMessage('Tạo khu vực mới thành công!');
                setIsCreateModalOpen(false);
                setCreateForm({ zone_code: '', zone_name: '', zone_type: 'room', building: '', floor: '', description: '' });
                fetchZones();
            } else {
                setError(res?.message || 'Tạo khu vực thất bại.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi kết nối khi tạo.');
        }
    };

    const handleDeleteClick = (zone, e) => {
        e.stopPropagation();
        setZoneToDelete(zone);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!zoneToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteZone(zoneToDelete.id);
            if (res?.success) {
                setSuccessMessage(`Đã xoá khu vực ${zoneToDelete.zone_name} thành công.`);
                setIsDeleteModalOpen(false);
                if (selectedZone?.id === zoneToDelete.id) {
                    setSelectedZone(null);
                }
                fetchZones();
            } else {
                setError(res?.message || 'Không thể xoá khu vực.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi kết nối khi xoá.');
        } finally {
            setIsDeleting(false);
            setZoneToDelete(null);
        }
    };



    const handleRemoveDevice = async (deviceId) => {
        if (!selectedZone) return;
        try {
            const res = await removeDeviceFromZone(selectedZone.id, deviceId);
            if (res?.success) {
                setSuccessMessage('Đã gỡ thiết bị khỏi khu vực.');

                // Update state ở client thay vì fetch lại API do API ko trả về devices
                setSelectedZone(prev => ({
                    ...prev,
                    devices: (prev.devices || []).filter(d => d.id !== deviceId)
                }));

                fetchAvailableDevices();
            } else {
                setError(res?.message || 'Lỗi khi gỡ thiết bị.');
            }
        } catch (err) {
            setError('Lỗi kết nối khi gỡ thiết bị.');
        }
    };

    const filteredZones = zones.filter(z => {
        const searchLower = searchTerm.toLowerCase();
        const loc = [z.building, z.floor].filter(Boolean).join(' - ').toLowerCase();
        return z.zone_name?.toLowerCase().includes(searchLower) || loc.includes(searchLower);
    });

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm-1 border border-platinum-tint">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        Khu vực
                    </span>
                    <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Quản lý khu vực (Zones)</h1>
                    <p className="text-slate-blue text-sm mt-1">
                        Thiết lập các khu vực giám sát và gán camera AI để quản lý hiện diện.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-action-blue text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-glacier-blue transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo khu vực
                </button>
            </div>

            {/* MESSAGES */}
            {(error || successMessage) && (
                <div className={`p-4 rounded-xl border flex items-center ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {error ? <AlertTriangle className="w-5 h-5 mr-3 shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 shrink-0" />}
                    <p className="text-sm font-medium">{error || successMessage}</p>
                </div>
            )}

            {/* MAIN CONTENT PANES */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* ZONES LIST PANE */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm-1 border border-platinum-tint overflow-hidden">
                    <div className="p-4 border-b border-platinum-tint bg-cloud-mist/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-blue" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm khu vực..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-blue">
                                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                                <p className="text-sm">Đang tải danh sách...</p>
                            </div>
                        ) : filteredZones.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-blue opacity-70">
                                <Map className="w-8 h-8 mb-3" />
                                <p className="text-sm">Không tìm thấy khu vực nào</p>
                            </div>
                        ) : (
                            filteredZones.map((zone) => (
                                <div
                                    key={zone.id}
                                    onClick={() => handleSelectZone(zone)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${selectedZone?.id === zone.id
                                            ? 'border-action-blue bg-blue-50/50 shadow-sm'
                                            : 'border-platinum-tint bg-white hover:border-action-blue/50 hover:bg-cloud-mist/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-midnight-indigo">{zone.zone_name}</h3>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => handleDeleteClick(zone, e)}
                                                className="p-1 text-slate-blue hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Xoá khu vực"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-blue flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {[zone.building, zone.floor].filter(Boolean).join(' - ') || 'Chưa cập nhật vị trí'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ZONE DETAIL PANE */}
                <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-2xl shadow-sm-1 border border-platinum-tint overflow-hidden">
                    {selectedZone ? (
                        <>
                            <div className="p-4 border-b border-platinum-tint bg-cloud-mist/30 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-midnight-indigo flex items-center">
                                        <Map className="w-5 h-5 mr-2 text-action-blue" />
                                        Chi tiết khu vực: {selectedZone.zone_name}
                                    </h2>
                                    <p className="text-xs text-slate-blue mt-1">Quản lý các camera được gán vào khu vực này</p>
                                </div>
                                <div className="flex gap-3">
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                {detailLoading ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-blue">
                                        <RefreshCw className="w-6 h-6 animate-spin mb-3" />
                                        <p className="text-sm">Đang tải chi tiết...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-2xl border border-platinum-tint shadow-sm">
                                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider mb-4">Thông tin chung</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-blue mb-1">Mô tả</p>
                                                    <p className="text-sm font-medium text-midnight-indigo">{selectedZone.description || 'Không có mô tả'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-blue mb-1">Vị trí</p>
                                                    <p className="text-sm font-medium text-midnight-indigo flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1 text-slate-blue" />
                                                        {[selectedZone.building, selectedZone.floor].filter(Boolean).join(' - ') || 'Chưa rõ'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-blue uppercase tracking-wider mb-3">Thiết bị giám sát ({selectedZone.devices?.length || 0})</h3>

                                            {(!selectedZone.devices || selectedZone.devices.length === 0) ? (
                                                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-blue">
                                                    <Video className="w-10 h-10 mb-3 text-slate-300" />
                                                    <p className="text-sm font-medium">Khu vực này chưa có camera nào</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedZone.devices.map(device => (
                                                        <div key={device.id} className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm flex items-start justify-between">
                                                            <div className="flex items-start">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center mr-3 shrink-0">
                                                                    <Camera className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-midnight-indigo">{device.device_name}</p>
                                                                    <p className="text-xs text-slate-blue font-mono mt-0.5">{device.device_code}</p>
                                                                    <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" /> Đang hoạt động
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveDevice(device.id)}
                                                                className="text-slate-blue hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Gỡ thiết bị"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card 3: Nhật ký ra vào */}
                                        <ZoneAccessLogCard zoneId={selectedZone.id} />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-blue">
                            <Map className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium text-midnight-indigo mb-1">Chưa chọn khu vực</p>
                            <p className="text-sm">Vui lòng chọn một khu vực bên danh sách để xem và cấu hình.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE MODAL */}
            {isCreateModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4 animate-fade-in-up">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-xl max-w-md w-full flex flex-col">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="font-bold text-midnight-indigo">Tạo khu vực mới</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-blue hover:text-midnight-indigo">✕</button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mã khu vực <span className="text-red-500">*</span></label>
                                <input required type="text" value={createForm.zone_code} onChange={e => setCreateForm({ ...createForm, zone_code: e.target.value })} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm" placeholder="VD: ROOM-101" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tên khu vực <span className="text-red-500">*</span></label>
                                <input required type="text" value={createForm.zone_name} onChange={e => setCreateForm({ ...createForm, zone_name: e.target.value })} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm" placeholder="VD: Phòng họp 1" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Loại khu vực <span className="text-red-500">*</span></label>
                                <select required value={createForm.zone_type} onChange={e => setCreateForm({ ...createForm, zone_type: e.target.value })} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm">
                                    <option value="room">Phòng họp (room)</option>
                                    <option value="gate">Cổng ra vào (gate)</option>
                                    <option value="corridor">Hành lang (corridor)</option>
                                    <option value="lobby">Sảnh lễ tân (lobby)</option>
                                    <option value="parking">Bãi đỗ xe (parking)</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tòa nhà</label>
                                    <input type="text" value={createForm.building} onChange={e => setCreateForm({ ...createForm, building: e.target.value })} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm" placeholder="VD: Toà nhà A" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Tầng</label>
                                    <input type="text" value={createForm.floor} onChange={e => setCreateForm({ ...createForm, floor: e.target.value })} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm" placeholder="VD: Tầng 1" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1">Mô tả</label>
                                <textarea rows="3" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm resize-none" placeholder="Mô tả chức năng khu vực..." />
                            </div>
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-platinum-tint">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-blue border border-platinum-tint rounded-xl hover:bg-cloud-mist">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-action-blue rounded-xl hover:bg-glacier-blue">Tạo mới</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && zoneToDelete && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4 animate-fade-in-up">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-xl max-w-sm w-full flex flex-col overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-midnight-indigo mb-2">Xác nhận xoá khu vực</h3>
                            <p className="text-sm text-slate-blue mb-1">
                                Bạn có chắc chắn muốn xoá khu vực <span className="font-bold text-midnight-indigo">{zoneToDelete.zone_name}</span>?
                            </p>
                        </div>
                        <div className="p-4 bg-cloud-mist/30 border-t border-platinum-tint flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="px-4 py-2 bg-white border border-platinum-tint text-slate-blue font-semibold rounded-xl text-sm hover:bg-cloud-mist">Hủy</button>
                            <button onClick={handleConfirmDelete} disabled={isDeleting} className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700">
                                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Xoá vĩnh viễn'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ZoneManagement;
