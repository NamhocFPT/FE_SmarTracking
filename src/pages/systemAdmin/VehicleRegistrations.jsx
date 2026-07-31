import { AlertTriangle, Car, FileText, Filter, RefreshCw, User } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';


import {
    getAdminVehicleRegistrations
} from '../../service/sysAdminServices';
import { motion, AnimatePresence } from 'framer-motion';

const VehicleRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '' // Backend can filter by plate_number or user info
    });
    const [meta, setMeta] = useState(null);

    const fetchRegistrations = useCallback(async (currentFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminVehicleRegistrations(currentFilters);
            if (res?.success) {
                setRegistrations(res.data || []);
                setMeta(res.meta);
            } else {
                setError(res?.message || 'Không thể tải lịch sử đăng ký xe.');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi kết nối khi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchRegistrations(filters);
    }, [filters, fetchRegistrations]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const getVehicleTypeDisplay = (type) => {
        switch (type) {
            case 'CAR': return 'Ô tô';
            case 'MOTORBIKE': return 'Xe máy';
            case 'BICYCLE': return 'Xe đạp';
            default: return type;
        }
    };

    const getStatusDisplay = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'active':
                return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200">Hoạt động</span>;
            case 'disabled':
                return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">Vô hiệu</span>;
            default:
                return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 mb-2">
                        <FileText className="w-3.5 h-3.5" />
                        Kiểm soát Phương tiện
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                        <Car className="w-3.5 h-3.5" />
                        Phương tiện
                    </span>
                    <h1 className="text-2xl font-extrabold text-midnight-indigo tracking-tight">Lịch sử Đăng ký Xe</h1>
                    <p className="text-slate-blue text-sm mt-1">Tra cứu danh sách các phương tiện đã được đăng ký bởi nhân viên.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchRegistrations()}
                        className="p-2 border border-platinum-tint bg-white text-slate-blue hover:text-midnight-indigo rounded-xl hover:bg-cloud-mist transition-colors duration-200"
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="font-semibold">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-1">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-midnight-indigo">
                    <Filter className="w-4 h-4 text-slate-blue" />
                    Bộ lọc tìm kiếm
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-blue uppercase tracking-wider">Từ khóa (Tên / Email / Biển số)</label>
                        <input
                            type="text"
                            placeholder="Nhập thông tin tìm kiếm..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full p-2.5 bg-cloud-mist border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-1 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-cloud-mist/50 border-b border-platinum-tint">
                            <tr>
                                <th className="px-6 py-4 font-extrabold text-xs text-slate-blue uppercase tracking-wider">Chủ xe</th>
                                <th className="px-6 py-4 font-extrabold text-xs text-slate-blue uppercase tracking-wider">Biển số</th>
                                <th className="px-6 py-4 font-extrabold text-xs text-slate-blue uppercase tracking-wider">Loại xe</th>
                                <th className="px-6 py-4 font-extrabold text-xs text-slate-blue uppercase tracking-wider">Ghi chú</th>
                                <th className="px-6 py-4 font-extrabold text-xs text-slate-blue uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 font-extrabold text-xs text-slate-blue uppercase tracking-wider">Thời gian ĐK</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-platinum-tint">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-cloud-mist rounded-full flex items-center justify-center mb-3">
                                                <Car className="w-6 h-6 text-slate-blue" />
                                            </div>
                                            <p className="text-sm font-bold text-midnight-indigo">Không có dữ liệu</p>
                                            <p className="text-xs text-slate-blue mt-1">Chưa có lịch sử đăng ký xe nào hoặc không tìm thấy kết quả phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-cloud-mist/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-midnight-indigo">{reg.owner?.full_name || 'Không rõ'}</div>
                                                    <div className="text-[11px] text-slate-blue">{reg.owner?.email || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-extrabold font-mono tracking-wider text-midnight-indigo text-base">{reg.plate_number}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-blue">
                                            {getVehicleTypeDisplay(reg.vehicle_type)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-blue max-w-xs truncate" title={reg.note}>
                                            {reg.note || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusDisplay(reg.status)}
                                        </td>
                                        <td className="px-6 py-4 text-[11px] text-slate-blue whitespace-nowrap">
                                            {formatDate(reg.created_at)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="px-6 py-4 bg-cloud-mist/30 border-t border-platinum-tint flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-blue">
                            Hiển thị trang {meta.page} / {meta.totalPages} (Tổng {meta.total} bản ghi)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                                className="px-3 py-1.5 text-xs font-bold bg-white border border-platinum-tint rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => handleFilterChange('page', Math.min(meta.totalPages, filters.page + 1))}
                                disabled={filters.page === meta.totalPages}
                                className="px-3 py-1.5 text-xs font-bold bg-white border border-platinum-tint rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist disabled:opacity-50 transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleRegistrations;
