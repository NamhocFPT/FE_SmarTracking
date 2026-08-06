import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Upload, X, FileText, AlertTriangle, CheckCircle,
    Download, TriangleAlert, Info, Search, UserPlus
} from 'lucide-react';
import {
    downloadParticipantImportTemplate,
    importMeetingParticipants
} from '../service/businessAdminServices';
import { addInternalParticipant } from '../service/employeeServices';
import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';

const AddInternalParticipantModal = ({ meetingId, open, onClose, onSuccess, users = [] }) => {
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'import'

    // --- MANUAL TAB STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [manualLoading, setManualLoading] = useState(false);
    const [manualError, setManualError] = useState(null);

    // --- IMPORT TAB STATE ---
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [forceConfirmed, setForceConfirmed] = useState(false);

    const inputRef = useRef(null);


    const reset = () => {
        setActiveTab('manual');
        setSearchQuery('');
        setSelectedUserId('');
        setManualLoading(false);
        setManualError(null);
        setFile(null);
        setError(null);
        setPreview(null);
        setForceConfirmed(false);
    };

    const handleClose = () => { reset(); onClose(); };

    // --- MANUAL TAB LOGIC ---
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users.slice(0, 10);
        const lowerQ = searchQuery.toLowerCase();
        return users.filter(u => 
            (u.fullName || u.full_name || '').toLowerCase().includes(lowerQ) ||
            (u.email || '').toLowerCase().includes(lowerQ) ||
            (u.employeeCode || u.employee_code || '').toLowerCase().includes(lowerQ)
        ).slice(0, 20);
    }, [users, searchQuery]);

    const handleManualAdd = async () => {
        if (!selectedUserId) {
            setManualError('Vui lòng chọn một người dùng.');
            return;
        }
        setManualLoading(true);
        setManualError(null);
        try {
            const res = await addInternalParticipant(meetingId, { participantUserId: selectedUserId });
            if (res?.success) {
                onSuccess?.('Đã thêm người tham dự nội bộ.');
                reset();
                onClose();
            } else {
                setManualError(res?.message || 'Thêm thất bại.');
            }
        } catch (err) {
            setManualError(err?.message || 'Lỗi hệ thống khi thêm người tham dự.');
        } finally {
            setManualLoading(false);
        }
    };

    // --- IMPORT TAB LOGIC ---
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.name.endsWith('.xlsx')) {
            setFile(dropped);
            setError(null);
            setPreview(null);
        } else {
            setError('Chỉ chấp nhận file Excel (.xlsx).');
        }
    };

    const handleDownloadTemplate = async () => {
        setDownloadingTemplate(true);
        try {
            const res = await downloadParticipantImportTemplate(meetingId);
            const blob = res instanceof Blob ? res : new Blob([res]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `template_import_participants.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setError('Không thể tải template. Vui lòng thử lại.');
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleUpload = async () => {
        if (!file) { setError('Vui lòng chọn file Excel trước khi import.'); return; }
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (forceConfirmed) {
                formData.append('forceAddWithWarnings', 'true');
            }
            const res = await importMeetingParticipants(meetingId, formData);
            if (res?.success) {
                onSuccess?.(`Import thành công: ${res.data?.successCount ?? 0} người tham gia đã được thêm.`);
                reset();
                onClose();
            } else if (res?.status === 422 || (res?.data && res.data.warningCount > 0)) {
                setPreview(res.data);
            } else {
                setError(res?.message || 'Import thất bại. Vui lòng kiểm tra lại file.');
            }
        } catch (e) {
            const data = e?.response?.data?.data || e?.data?.data;
            if (data && (data.warningCount > 0 || data.failedCount > 0)) {
                setPreview(data);
            } else {
                setError(e?.message || 'Lỗi khi import. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const rowStatusConfig = {
        success: { color: 'text-green-700 bg-green-50', label: 'Thành công' },
        warning: { color: 'text-orange-700 bg-orange-50', label: 'Cảnh báo' },
        error: { color: 'text-red-700 bg-red-50', label: 'Lỗi' },
        skipped: { color: 'text-slate-500 bg-slate-50', label: 'Bỏ qua' },
        unknown: { color: 'text-slate-500 bg-slate-50', label: 'Không xác định' },
    };

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in-up">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-platinum-tint flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-platinum-tint bg-cloud-mist/30 flex flex-col shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-bold text-midnight-indigo text-lg">Thêm người tham dự nội bộ</h3>
                            <p className="text-xs text-slate-blue mt-0.5">Tìm kiếm và thêm người dùng trong hệ thống hoặc import danh sách.</p>
                        </div>
                        <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg inline-flex self-start">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'manual' ? 'bg-white text-action-blue shadow-sm' : 'text-slate-500 hover:text-midnight-indigo'}`}
                        >
                            Thêm thủ công
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'import' ? 'bg-white text-action-blue shadow-sm' : 'text-slate-500 hover:text-midnight-indigo'}`}
                        >
                            Import từ Excel
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'manual' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-blue uppercase tracking-wider mb-2">Tìm kiếm người dùng</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên, email hoặc mã nhân viên..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/30 focus:border-action-blue"
                                    />
                                </div>
                            </div>

                            <div className="border border-platinum-tint rounded-xl overflow-hidden max-h-[300px] overflow-y-auto scrollbar-thin">
                                {filteredUsers.length > 0 ? (
                                    <div className="divide-y divide-platinum-tint">
                                        {filteredUsers.map(u => (
                                            <div 
                                                key={u.id} 
                                                onClick={() => setSelectedUserId(u.id)}
                                                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedUserId === u.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={u} className="w-8 h-8 rounded-full text-xs font-bold" />
                                                    <div>
                                                        <p className="text-sm font-bold text-midnight-indigo">{u.fullName || u.full_name}</p>
                                                        <p className="text-[10px] text-slate-500">{u.email} • {u.employeeCode || u.employee_code || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedUserId === u.id ? 'border-action-blue bg-action-blue' : 'border-slate-300'}`}>
                                                    {selectedUserId === u.id && <CheckCircle className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-sm italic">
                                        Không tìm thấy người dùng phù hợp.
                                    </div>
                                )}
                            </div>

                            {manualError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{manualError}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Step 1: Tải template */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-800">Bước 1: Tải file mẫu</p>
                                        <p className="text-xs text-blue-600 mt-0.5">File mẫu có các cột: STT, Loại, Email, Mã nhân viên, Họ và tên, Tổ chức, Số điện thoại.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadTemplate}
                                    disabled={downloadingTemplate}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {downloadingTemplate
                                        ? <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-600 rounded-full animate-spin" />
                                        : <Download className="w-3.5 h-3.5" />
                                    }
                                    Tải mẫu
                                </button>
                            </div>

                            {/* Step 2: Upload */}
                            {!preview && (
                                <div>
                                    <p className="text-xs font-bold text-slate-blue uppercase tracking-wider mb-2">Bước 2: Upload file đã điền</p>
                                    <div
                                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={handleDrop}
                                        onClick={() => inputRef.current?.click()}
                                        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                                            dragging ? 'border-action-blue bg-blue-50' : 'border-platinum-tint hover:border-action-blue hover:bg-blue-50/30 bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            accept=".xlsx"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) { setFile(f); setError(null); setPreview(null); }
                                            }}
                                        />
                                        <Upload className="w-8 h-8 text-slate-400 mb-3" />
                                        {file ? (
                                            <div className="flex items-center gap-2 text-action-blue font-bold text-sm">
                                                <FileText className="w-4 h-4" />
                                                {file.name}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-midnight-indigo">Kéo thả file vào đây hoặc nhấn để chọn</p>
                                                <p className="text-xs text-slate-blue mt-1">Chỉ chấp nhận file <strong>.xlsx</strong></p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* Preview */}
                            {preview && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { label: 'Tổng dòng', val: preview.totalRows, color: 'text-midnight-indigo' },
                                            { label: 'Thành công', val: preview.successCount, color: 'text-green-700' },
                                            { label: 'Cảnh báo', val: preview.warningCount, color: 'text-orange-600' },
                                            { label: 'Lỗi', val: preview.failedCount, color: 'text-red-600' },
                                        ].map(({ label, val, color }) => (
                                            <div key={label} className="bg-slate-50 rounded-xl p-3 text-center border border-platinum-tint">
                                                <p className={`text-2xl font-extrabold ${color}`}>{val ?? 0}</p>
                                                <p className="text-[10px] text-slate-blue mt-0.5 font-semibold uppercase">{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {preview.warningCount > 0 && (
                                        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                            <TriangleAlert className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-orange-800">Có {preview.warningCount} cảnh báo cần xem xét</p>
                                                <p className="text-xs text-orange-700 mt-0.5">Tích chọn bên dưới để xác nhận thêm dù có cảnh báo, hoặc sửa lại file rồi upload lại.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border border-platinum-tint rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto max-h-52">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-cloud-mist/50 border-b border-platinum-tint">
                                                    <tr>
                                                        <th className="px-4 py-2.5 font-bold text-slate-blue uppercase">Dòng</th>
                                                        <th className="px-4 py-2.5 font-bold text-slate-blue uppercase">Định danh</th>
                                                        <th className="px-4 py-2.5 font-bold text-slate-blue uppercase">Trạng thái</th>
                                                        <th className="px-4 py-2.5 font-bold text-slate-blue uppercase">Ghi chú</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-platinum-tint">
                                                    {(preview.results || []).map((r, i) => {
                                                        const cfg = rowStatusConfig[r.status] || rowStatusConfig.unknown;
                                                        return (
                                                            <tr key={i} className="hover:bg-slate-50">
                                                                <td className="px-4 py-2 font-mono">{r.row}</td>
                                                                <td className="px-4 py-2 max-w-[140px] truncate" title={r.identifier}>{r.identifier || '—'}</td>
                                                                <td className="px-4 py-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                                                                </td>
                                                                <td className="px-4 py-2 text-slate-blue max-w-[200px] truncate" title={r.reason}>{r.reason || '—'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {preview.warningCount > 0 && (
                                        <label className="flex items-start gap-3 p-4 bg-slate-50 border border-platinum-tint rounded-xl cursor-pointer hover:bg-cloud-mist transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={forceConfirmed}
                                                onChange={e => setForceConfirmed(e.target.checked)}
                                                className="mt-0.5 accent-action-blue"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-midnight-indigo">Xác nhận thêm dù có cảnh báo</p>
                                                <p className="text-xs text-slate-blue mt-0.5">Những dòng có cảnh báo vẫn sẽ được thêm vào danh sách người tham dự.</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/30 flex justify-between items-center shrink-0">
                    {activeTab === 'import' && preview ? (
                        <button onClick={reset} className="text-xs font-bold text-slate-blue hover:text-midnight-indigo transition-colors">
                            ← Upload file khác
                        </button>
                    ) : <div />}
                    <div className="flex gap-3">
                        <button onClick={handleClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-midnight-indigo bg-white border border-platinum-tint hover:bg-slate-50 rounded-xl transition-all">
                            Hủy bỏ
                        </button>
                        {activeTab === 'manual' ? (
                            <button
                                onClick={handleManualAdd}
                                disabled={manualLoading || !selectedUserId}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-action-blue hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center"
                            >
                                {manualLoading
                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><UserPlus className="w-4 h-4" /> Thêm nội bộ</>
                                }
                            </button>
                        ) : (
                            <button
                                onClick={handleUpload}
                                disabled={loading || !file || (preview?.warningCount > 0 && !forceConfirmed && preview?.failedCount === 0)}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-action-blue hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center"
                            >
                                {loading
                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : preview
                                        ? <><CheckCircle className="w-4 h-4" /> Xác nhận Import</>
                                        : <><Upload className="w-4 h-4" /> Import ngay</>
                                }
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default AddInternalParticipantModal;
