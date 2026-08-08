import { CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";

import { createPortal } from "react-dom";
import {
    getAvatarSubmissions,
    getAvatarSubmissionDetail,
    getAvatarDownloadUrl,
    approveAvatarSubmission,
    rejectAvatarSubmission,
} from "../../service/avatarReviewService";
import { getDepartments } from "../../service/sysAdminServices";
import UserAvatar from "../../components/common/UserAvatar";

const STATUS_MAP = {
    pending_review: { label: "Đang chờ duyệt", badge: "bg-blue-50 text-action-blue border border-blue-200" },
    rejected: { label: "Bị từ chối", badge: "bg-red-50 text-red-700 border border-red-200" },
    approved: { label: "Đã duyệt", badge: "bg-green-50 text-green-700 border border-green-200" },
    active: { label: "Đã duyệt", badge: "bg-green-50 text-green-700 border border-green-200" },
    not_uploaded: { label: "Chưa nộp ảnh", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
};

const ERROR_MAP = {
    BIOMETRIC_SUBMISSION_NOT_FOUND: "Không tìm thấy yêu cầu duyệt ảnh sinh trắc học này.",
    BIOMETRIC_SUBMISSION_NOT_PENDING: "Yêu cầu này đã được xử lý trước đó.",
    BIOMETRIC_REJECTION_REASON_REQUIRED: "Vui lòng nhập lý do từ chối.",
    BIOMETRIC_REJECTION_REASON_TOO_LONG: "Lý do từ chối không được vượt quá 500 ký tự.",
    BIOMETRIC_MEDIA_NOT_FOUND: "Không tìm thấy ảnh gốc của yêu cầu này.",
    BIOMETRIC_DOWNLOAD_URL_FAILED: "Không thể tải ảnh lúc này. Vui lòng thử lại.",
    BIOMETRIC_APPROVE_FAILED: "Không thể duyệt ảnh này. Vui lòng thử lại.",
    BIOMETRIC_REJECT_FAILED: "Không thể từ chối ảnh này. Vui lòng thử lại.",
    FORBIDDEN: "Bạn không có quyền thực hiện hành động này.",
};

const BiometricSubmissionDetailModal = ({ faceProfileId, onClose, onActionComplete }) => {
    const [detail, setDetail] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [loadingImage, setLoadingImage] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);

    // Rejection UI state
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadingDetail(true);
            try {
                const res = await getAvatarSubmissionDetail(faceProfileId);
                if (cancelled) return;
                if (res?.success && res.data) {
                    setDetail(res.data);
                    setLoadingDetail(false);
                    if (res.data.hasPreview) {
                        setLoadingImage(true);
                        try {
                            const imgRes = await getAvatarDownloadUrl(faceProfileId);
                            if (!cancelled && imgRes?.success && imgRes.data?.downloadUrl) {
                                setDownloadUrl(imgRes.data.downloadUrl);
                            }
                        } catch {
                            // downloadUrl stays null; rendered as "Không thể tải ảnh" below
                        } finally {
                            if (!cancelled) setLoadingImage(false);
                        }
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setActionError(err?.error?.message || ERROR_MAP[err?.error?.code] || "Đã xảy ra lỗi hệ thống.");
                    setLoadingDetail(false);
                }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [faceProfileId]);

    const handleApprove = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn duyệt ảnh sinh trắc học này?")) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await approveAvatarSubmission(faceProfileId);
            if (res?.success) {
                setTimeout(() => {
                    onActionComplete?.();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            const code = err?.error?.code;
            if (code === "BIOMETRIC_SUBMISSION_NOT_PENDING") {
                setActionError("Yêu cầu này đã được xử lý bởi quản trị viên khác.");
                setTimeout(() => { onActionComplete?.(); onClose(); }, 1500);
            } else {
                setActionError(ERROR_MAP[code] || err?.error?.message || "Không thể duyệt ảnh này.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await rejectAvatarSubmission(faceProfileId, rejectReason.trim());
            if (res?.success) {
                setTimeout(() => {
                    onActionComplete?.();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            const code = err?.error?.code;
            if (code === "BIOMETRIC_SUBMISSION_NOT_PENDING") {
                setActionError("Yêu cầu này đã được xử lý bởi quản trị viên khác.");
                setTimeout(() => { onActionComplete?.(); onClose(); }, 1500);
            } else {
                setActionError(ERROR_MAP[code] || err?.error?.message || "Không thể từ chối ảnh này.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50 sticky top-0 z-10">
                    <h3 className="font-bold text-midnight-indigo">Chi tiết yêu cầu duyệt ảnh sinh trắc học</h3>
                    <button onClick={onClose} className="text-slate-blue hover:text-midnight-indigo">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {actionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{actionError}</div>
                    )}

                    {loadingDetail ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : detail ? (
                        <>
                            {/* Image area */}
                            <div className="flex justify-center">
                                {loadingImage ? (
                                    <div className="w-48 h-48 bg-cloud-mist rounded-xl flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : downloadUrl ? (
                                    <img src={downloadUrl} alt="Biometric submission" className="w-48 h-48 object-cover rounded-xl border border-platinum-tint" />
                                ) : (
                                    <div className="w-48 h-48 bg-cloud-mist rounded-xl flex items-center justify-center text-xs text-slate-blue">
                                        {detail.hasPreview ? "Không thể tải ảnh" : "Ảnh không khả dụng"}
                                    </div>
                                )}
                            </div>
                            {downloadUrl && (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard?.writeText(downloadUrl);
                                            setLinkCopied(true);
                                            setTimeout(() => setLinkCopied(false), 2000);
                                        }}
                                        className="text-xs text-action-blue hover:underline font-semibold"
                                    >
                                        {linkCopied ? "Đã sao chép!" : "Sao chép link ảnh"}
                                    </button>
                                </div>
                            )}

                            {/* Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-slate-blue block">Họ tên</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.fullName || detail.user?.fullName || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Email</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.email || detail.user?.email || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Mã nhân viên</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.employeeCode || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Phòng ban</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.department?.departmentName || detail.department?.name || ""}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Trạng thái</span>
                                    <span className={"inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold " + ((STATUS_MAP[detail.status] || STATUS_MAP.pending_review).badge)}>
                                        {(STATUS_MAP[detail.status] || STATUS_MAP.pending_review).label}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-blue block">Ngày nộp</span>
                                    <span className="font-semibold text-midnight-indigo">{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString("vi-VN") : ""}</span>
                                </div>
                            </div>

                            {detail.consentAt && (
                                <div className="text-xs text-slate-blue">
                                    Đồng ý sử dụng ảnh: {new Date(detail.consentAt).toLocaleString("vi-VN")}
                                </div>
                            )}

                            {detail.imageFile && (
                                <div className="text-xs text-slate-blue space-y-0.5">
                                    <div>Tên tệp: {detail.imageFile.fileName || ""}</div>
                                    <div>Định dạng: {detail.imageFile.mimeType || ""}</div>
                                    <div>Kích thước: {formatBytes(detail.imageFile.fileSizeBytes)}</div>
                                </div>
                            )}

                            {detail.status === "rejected" && detail.reviewMetadata?.rejectionReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <span className="text-xs font-bold text-red-700 block">Lý do từ chối</span>
                                    <span className="text-xs text-red-600 mt-1 block">{detail.reviewMetadata.rejectionReason}</span>
                                </div>
                            )}

                            {/* Actions */}
                            {detail.status === "pending_review" && (
                                <div className="border-t border-platinum-tint pt-4 space-y-3">
                                    {showRejectInput ? (
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-blue uppercase">Lý do từ chối</label>
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                maxLength={500}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue resize-none"
                                                placeholder="Nhập lý do từ chối (bắt buộc)"
                                            />
                                            <div className="flex justify-between text-xs text-steel-gray">
                                                <span>{(Array.from(rejectReason).length) + "/500"}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                                                    className="px-4 py-2 border border-platinum-tint bg-white text-slate-blue rounded-xl text-xs font-semibold"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={actionLoading || !rejectReason.trim() || Array.from(rejectReason).length > 500}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold disabled:opacity-40"
                                                >
                                                    {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                                            >
                                                {actionLoading ? "Đang xử lý..." : "Duyệt"}
                                            </button>
                                            <button
                                                onClick={() => setShowRejectInput(true)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-sm text-slate-blue py-8">Không tìm thấy thông tin.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const BiometricSubmissionsReview = () => {
    const [submissions, setSubmissions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filter
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending_review");
    const [deptFilter, setDeptFilter] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Detail modal
    const [selectedId, setSelectedId] = useState(null);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Load departments
    useEffect(() => {
        (async () => {
            try {
                const res = await getDepartments({ limit: 100 });
                if (res?.success) setDepartments(res.data || []);
            } catch {}
        })();
    }, []);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit,
                status: statusFilter || undefined,
                q: debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
                departmentId: deptFilter || undefined,
            };
            const res = await getAvatarSubmissions(params);
            if (res?.success) {
                setSubmissions(res.data || []);
                setTotalPages(res.meta?.totalPages || 1);
                setTotal(res.meta?.total || (res.data?.length || 0));
            }
        } catch (err) {
            setError(err?.error?.message || "Không thể tải danh sách.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, debouncedSearch, deptFilter]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);
    useEffect(() => {
        if (error) {
            const t = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(t);
        }
    }, [error]);

    const handleRefresh = () => {
        setPage(1);
        fetchSubmissions();
    };

    const handleActionComplete = () => {
        setSuccessMessage("Thao tác thành công.");
        fetchSubmissions();
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Phê duyệt
                </span>
                <h1 className="text-2xl font-bold text-midnight-indigo tracking-tight">Duyệt ảnh sinh trắc học FaceID</h1>
                <p className="text-slate-blue text-sm mt-1">Xem xét và duyệt/từ chối ảnh sinh trắc học do người dùng gửi lên.</p>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3">
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

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-platinum-tint shadow-sm-2 flex flex-wrap items-center gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:outline-none focus:border-action-blue bg-white"
                >
                    <option value="pending_review">Đang chờ duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                    <option value="active">Đã duyệt</option>
                    <option value="">Tất cả trạng thái</option>
                </select>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm (tối thiểu 2 ký tự)..."
                    className="flex-1 min-w-[200px] px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue"
                />

                <select
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-platinum-tint rounded-xl text-sm text-midnight-indigo focus:outline-none focus:border-action-blue bg-white"
                >
                    <option value="">Tất cả phòng ban</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.departmentName || d.name}</option>
                    ))}
                </select>

                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-action-blue hover:bg-glacier-blue text-white rounded-xl text-xs font-semibold transition-all"
                >
                    Làm mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-cloud-mist border-b border-platinum-tint">
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Gương mặt</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Họ tên</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Email</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Mã NV</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Phòng ban</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Ngày nộp</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-blue uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-blue">Không có yêu cầu nào.</td>
                                </tr>
                            ) : (
                                submissions.map((sub) => (
                                    <tr key={sub.id || sub.faceProfileId} className="border-b border-platinum-tint/50 hover:bg-cloud-mist/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <UserAvatar
                                                user={sub.user || sub}
                                                name={sub.fullName || sub.user?.fullName}
                                                className="w-9 h-9 rounded-full shrink-0 font-bold text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-midnight-indigo">{sub.fullName || sub.user?.fullName || ""}</td>
                                        <td className="px-4 py-3 text-slate-blue">{sub.email || sub.user?.email || ""}</td>
                                        <td className="px-4 py-3 text-slate-blue">{sub.employeeCode || ""}</td>
                                        <td className="px-4 py-3 text-slate-blue">{sub.department?.departmentName || sub.department?.name || sub.user?.department?.name || ""}</td>
                                        <td className="px-4 py-3">
                                            <span className={"inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold " + ((STATUS_MAP[sub.status] || STATUS_MAP.pending_review).badge)}>
                                                {(STATUS_MAP[sub.status] || STATUS_MAP.pending_review).label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-blue">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("vi-VN") : ""}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedId(sub.id || sub.faceProfileId)}
                                                className="px-3 py-1.5 border border-platinum-tint bg-white text-action-blue hover:bg-cloud-mist rounded-lg text-xs font-semibold transition-all"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                        <span className="text-xs text-slate-blue">Tổng: {total} yêu cầu</span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 border border-platinum-tint bg-white text-slate-blue rounded-lg text-xs font-semibold disabled:opacity-40"
                            >
                                Trước
                            </button>
                            <span className="text-xs text-slate-blue">Trang {page} / {totalPages}</span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 border border-platinum-tint bg-white text-slate-blue rounded-lg text-xs font-semibold disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selectedId && (
                <BiometricSubmissionDetailModal
                    faceProfileId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onActionComplete={handleActionComplete}
                />
            )}
        </div>
    );
};

export default BiometricSubmissionsReview;
