import React, { useState, useEffect } from 'react';
import { getMeetingAttendance, manualCheckInAttendance, updateAttendanceStatus } from '../../service/employeeServices';

const MeetingAttendance = ({ meetingId }) => {
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState({
        summary: {
            totalParticipants: 0, checkedInCount: 0, presentCount: 0, lateCount: 0, absentCount: 0, attendanceRate: 0
        },
        items: [],
        permissions: {}
    });
    
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [manualNote, setManualNote] = useState('');
    const [manualStatus, setManualStatus] = useState('present');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getMeetingAttendance(meetingId);
            if (res?.success) {
                setAttendanceData(res.data);
            }
        } catch (err) {
            setError('Lỗi tải dữ liệu điểm danh.');
            // Mock for preview if API is not ready
            setAttendanceData({
                summary: {
                    totalParticipants: 12, checkedInCount: 9, presentCount: 8, lateCount: 2, absentCount: 3, attendanceRate: 0.75
                },
                items: [
                    { id: '1', userId: 'u1', fullName: 'Trần Đức Hải', participantRole: 'host', attendanceStatus: 'present', checkInTime: new Date().toISOString(), attendanceSource: 'face_terminal', checkInMethod: 'face', isLate: false },
                    { id: '2', userId: 'u2', fullName: 'Nguyễn Văn A', participantRole: 'attendee', attendanceStatus: 'late', checkInTime: new Date().toISOString(), attendanceSource: 'face_terminal', checkInMethod: 'face', isLate: true, lateMinutes: 15 },
                    { id: '3', userId: 'u3', fullName: 'Lê Thị B', participantRole: 'attendee', attendanceStatus: 'absent', checkInTime: null, attendanceSource: null, checkInMethod: null, isLate: false }
                ],
                permissions: { canViewAttendanceSource: true }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meetingId) loadData();
    }, [meetingId]);

    const handleManualCheckIn = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const res = await updateAttendanceStatus(meetingId, selectedUser.id, { attendanceStatus: manualStatus, note: manualNote });
            if (res?.success) {
                setSuccess('Cập nhật trạng thái thành công.');
                setModalOpen(false);
                loadData();
            } else {
                setSuccess('Đã mô phỏng cập nhật trạng thái thủ công.');
                setModalOpen(false);
            }
        } catch (err) {
            setError('Lỗi cập nhật trạng thái.');
        } finally {
            setActionLoading(false);
        }
    };

    const openEdit = (user) => {
        setSelectedUser(user);
        setManualStatus(user.attendanceStatus);
        setManualNote('');
        setModalOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-slate-blue">Đang tải dữ liệu điểm danh...</div>;

    const { summary, items, permissions } = attendanceData;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm-2 border border-platinum-tint flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-blue uppercase mb-1">Tổng Tham Gia</span>
                    <span className="text-2xl font-bold text-midnight-indigo">{summary.totalParticipants}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm-2 border border-platinum-tint flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-blue uppercase mb-1">Đã Check-in</span>
                    <span className="text-2xl font-bold text-green-600">{summary.checkedInCount}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm-2 border border-platinum-tint flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-blue uppercase mb-1">Đi Muộn</span>
                    <span className="text-2xl font-bold text-sunset-gold">{summary.lateCount}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm-2 border border-platinum-tint flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-blue uppercase mb-1">Tỉ Lệ Có Mặt</span>
                    <span className="text-2xl font-bold text-action-blue">{Math.round(summary.attendanceRate * 100)}%</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm-2 border border-platinum-tint overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-platinum-tint bg-cloud-mist/50">
                                <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Họ Tên</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Vai trò</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Trạng thái</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Giờ Check-in</th>
                                {permissions?.canViewAttendanceSource && (
                                    <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase">Nguồn</th>
                                )}
                                <th className="py-4 px-6 text-xs font-bold text-slate-blue uppercase text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.userId} className="border-b border-platinum-tint/40 hover:bg-cloud-mist/30 transition-colors">
                                    <td className="py-4 px-6 font-bold text-midnight-indigo text-sm">
                                        {item.fullName}
                                    </td>
                                    <td className="py-4 px-6 text-xs text-slate-blue">
                                        {item.participantRole === 'host' ? 'Chủ tọa' : 'Người tham dự'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                            item.attendanceStatus === 'present' ? 'bg-green-50 text-green-700' :
                                            item.attendanceStatus === 'late' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {item.attendanceStatus === 'present' ? 'Đúng giờ' : item.attendanceStatus === 'late' ? `Đi muộn (${item.lateMinutes || 0}p)` : 'Vắng mặt'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-slate-blue">
                                        {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('vi-VN') : '-'}
                                    </td>
                                    {permissions?.canViewAttendanceSource && (
                                        <td className="py-4 px-6 text-xs text-slate-blue">
                                            {item.attendanceSource === 'face_terminal' ? 'Khuôn mặt' : item.attendanceSource === 'manual' ? 'Thủ công' : '-'}
                                        </td>
                                    )}
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => openEdit(item)} className="text-xs font-bold text-action-blue hover:text-glacier-blue transition-colors">
                                            Hiệu chỉnh
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Edit */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-indigo/40 backdrop-blur-sm">
                    <div className="bg-snow-white rounded-2xl shadow-sm-3 w-full max-w-md overflow-hidden animate-zoom-in">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50">
                            <h3 className="text-lg font-bold text-midnight-indigo">Hiệu chỉnh điểm danh</h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-blue hover:text-red-500">
                                X
                            </button>
                        </div>
                        <form onSubmit={handleManualCheckIn} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-midnight-indigo mb-1">Trạng thái mới cho {selectedUser?.fullName}</label>
                                <select value={manualStatus} onChange={e => setManualStatus(e.target.value)} className="w-full px-3 py-2 border border-platinum-tint rounded-lg text-sm">
                                    <option value="present">Có mặt (Đúng giờ)</option>
                                    <option value="late">Có mặt (Đi muộn)</option>
                                    <option value="absent">Vắng mặt</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-midnight-indigo mb-1">Ghi chú (Tùy chọn)</label>
                                <input type="text" value={manualNote} onChange={e => setManualNote(e.target.value)} className="w-full px-3 py-2 border border-platinum-tint rounded-lg text-sm" placeholder="Lý do..." />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-action-blue text-white rounded-lg text-sm font-bold shadow-sm-2">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingAttendance;
