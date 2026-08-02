import { AlertTriangle, ArrowLeft, Calendar, CalendarPlus, Check, CheckCircle2, ChevronRight, Clock, Download, FileSpreadsheet, HelpCircle, Info, Mic, Paperclip, Plus, Search, ShieldAlert, Trash2, Upload, Users, Video, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getAvailableRooms, createMeeting, addRecordingConfig, replaceAgendas, getUsers, getUserById, getUserPublicProfile } from '../../service/employeeServices';
import { getDepartments } from '../../service/businessAdminServices';
import * as XLSX from 'xlsx';

const getInitialTimes = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 5 * 60 * 1000);

    const sh = String(startDate.getHours()).padStart(2, '0');
    const sm = String(startDate.getMinutes()).padStart(2, '0');
    const start = `${sh}:${sm}`;

    // End time = start time + 1 giờ
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    let eh = String(endDate.getHours()).padStart(2, '0');
    let em = String(endDate.getMinutes()).padStart(2, '0');

    if (endDate.getDate() !== startDate.getDate()) {
        eh = '23';
        em = '59';
    }

    const end = `${eh}:${em}`;

    return { start, end };
};

const BookMeeting = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    // Step state
    const [currentStep, setCurrentStep] = useState(1);

    // Form states
    const initialTimes = getInitialTimes();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [meetingType, setMeetingType] = useState('normal');
    const [meetingMode, setMeetingMode] = useState('offline');
    const [hostId, setHostId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [startTime, setStartTime] = useState(initialTimes.start);
    const [endTime, setEndTime] = useState(initialTimes.end);
    const [expectedAttendeeCount, setExpectedAttendeeCount] = useState('');
    const [capacityOverrideConfirmed, setCapacityOverrideConfirmed] = useState(false);
    const [recordingEnabled, setRecordingEnabled] = useState(false);
    const [audioRecordingEnabled, setAudioRecordingEnabled] = useState(false);
    const [pdpaConsent, setPdpaConsent] = useState(false);

    // Participants states (Internal and External)
    const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
    const [externalParticipants, setExternalParticipants] = useState([]);

    // Agenda states
    const [agendaList, setAgendaList] = useState([]);
    const [newAgendaTitle, setNewAgendaTitle] = useState('');
    const [newAgendaDuration, setNewAgendaDuration] = useState('15');
    const [newAgendaFile, setNewAgendaFile] = useState(null);
    const [agendaInputError, setAgendaInputError] = useState('');

    // Data lists
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Search and availability states
    const [availableRooms, setAvailableRooms] = useState([]);
    const [searchingRooms, setSearchingRooms] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Feedback states
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [conflictInfo, setConflictInfo] = useState(null);
    const [alternativeRooms, setAlternativeRooms] = useState([]);

    // Import modal states
    const [searchEmail, setSearchEmail] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importMethod, setImportMethod] = useState('manual'); // 'manual' or 'excel'
    const [manualEmails, setManualEmails] = useState('');
    const [manualType, setManualType] = useState('auto'); // 'auto', 'internal', 'external'
    const [importPreview, setImportPreview] = useState([]);

    // User detail modal states
    const [selectedDetailUserId, setSelectedDetailUserId] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState(null);

    const handleOpenUserDetail = async (userId) => {
        setSelectedDetailUserId(userId);
        setUserDetail(null);
        setLoadingDetail(true);
        setDetailError(null);
        try {
            const res = await getUserPublicProfile(userId);
            if (res?.success && res.data) {
                setUserDetail(res.data);
            } else {
                setDetailError(res?.message || 'Không thể tải thông tin nhân viên.');
            }
        } catch (err) {
            console.error('Error fetching user details', err);
            setDetailError(err?.error?.message || 'Không thể kết nối đến máy chủ.');
        } finally {
            setLoadingDetail(false);
        }
    };

    // Lock body scroll when import modal is open
    useEffect(() => {
        if (showImportModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showImportModal]);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch (err) {
            console.error('Failed to load user info', err);
        }

        const fetchData = async () => {
            try {
                const [usersRes, deptsRes] = await Promise.all([
                    getUsers({ limit: 1000 }),
                    getDepartments().catch(err => {
                        console.error('Failed to load departments', err);
                        return { success: false };
                    })
                ]);

                if (usersRes?.success) {
                    setUsers(usersRes.data || []);
                } else {
                    // Fallback mock users for local mapping if needed
                    setUsers([
                        { id: 'user-1', fullName: 'Lê Hoàng Hải', email: 'hai.lh@smrmpts.com' },
                        { id: 'user-2', fullName: 'Nguyễn Thị Minh', email: 'minh.nt@smrmpts.com' },
                        { id: 'user-3', fullName: 'Phan Văn Minh', email: 'minh.pv@smrmpts.com' },
                        { id: 'user-4', fullName: 'Phạm Thanh Sơn', email: 'son.pt@smrmpts.com' }
                    ]);
                }

                if (deptsRes?.success) {
                    setDepartments(deptsRes.data || []);
                } else {
                    setDepartments([
                        { id: 'dept-1', department_code: 'IT', department_name: 'Phòng Công nghệ thông tin' },
                        { id: 'dept-2', department_code: 'HR', department_name: 'Phòng Nhân sự' },
                        { id: 'dept-3', department_code: 'SALES', department_name: 'Phòng Kinh doanh' },
                        { id: 'dept-4', department_code: 'RND', department_name: 'Phòng Nghiên cứu & Phát triển' }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching initial data', err);
                setErrorMsg('Không thể tải danh sách phòng ban hoặc nhân sự.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);

    const getMeetingDurationMinutes = () => {
        if (!startTime || !endTime) return 0;
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const startTotal = sh * 60 + sm;
        const endTotal = eh * 60 + em;
        return Math.max(0, endTotal - startTotal);
    };

    const meetingDuration = getMeetingDurationMinutes();
    const agendaTotalDuration = agendaList.reduce((acc, curr) => acc + Number(curr.durationMin), 0);

    const actualAttendeeCount = selectedParticipantIds.length + externalParticipants.length + 1; // +1 cho host
    const capacityExceeded = !!selectedRoom && (
        (!!expectedAttendeeCount && Number(expectedAttendeeCount) > selectedRoom.capacity)
        || actualAttendeeCount > selectedRoom.capacity
    );

    const buildIsoRange = () => ({
        isoStart: new Date(`${meetingDate}T${startTime}:00`).toISOString(),
        isoEnd: new Date(`${meetingDate}T${endTime}:00`).toISOString(),
    });

    const handleSearchRooms = async () => {
        setSearchingRooms(true);
        setErrorMsg('');

        const now = new Date();
        const selectedStart = new Date(`${meetingDate}T${startTime}:00`);
        if (selectedStart < now) {
            setErrorMsg('Thời gian bắt đầu không được trong quá khứ.');
            setSearchingRooms(false);
            return;
        }

        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        if (sh * 60 + sm >= eh * 60 + em) {
            setErrorMsg('Giờ bắt đầu phải trước giờ kết thúc.');
            setSearchingRooms(false);
            return;
        }

        try {
            const { isoStart, isoEnd } = buildIsoRange();
            const params = { startTime: isoStart, endTime: isoEnd };
            if (expectedAttendeeCount) params.minCapacity = expectedAttendeeCount;

            const res = await getAvailableRooms(params);
            if (res?.success) {
                setAvailableRooms(res.data || []);
            } else {
                setAvailableRooms([]);
                setErrorMsg(res?.message || 'Không thể tải danh sách phòng trống.');
            }
        } catch (err) {
            console.error('Error fetching available rooms', err);
            setAvailableRooms([]);
            setErrorMsg(err?.error?.message || 'Không thể tải danh sách phòng trống hiện tại.');
        } finally {
            setSearchPerformed(true);
            setSearchingRooms(false);
        }
    };

    const handleSelectRoom = (room) => {
        setSelectedRoomId(room.id);
        setCapacityOverrideConfirmed(false);
    };

    const handleAddAgenda = () => {
        if (!newAgendaTitle.trim()) {
            setAgendaInputError('Vui lòng nhập tên chương trình họp.');
            return;
        }
        const duration = Number(newAgendaDuration);
        if (isNaN(duration) || duration <= 0) {
            setAgendaInputError('Vui lòng nhập thời lượng chương trình hợp lệ (lớn hơn 0).');
            return;
        }

        if (agendaTotalDuration + duration > meetingDuration) {
            setAgendaInputError(`Tổng thời lượng chương trình họp (${agendaTotalDuration + duration} phút) vượt quá thời lượng cuộc họp (${meetingDuration} phút).`);
            return;
        }

        setAgendaInputError('');
        setErrorMsg('');
        setAgendaList(prev => [
            ...prev,
            {
                title: newAgendaTitle,
                durationMin: duration,
                file: newAgendaFile ? { name: newAgendaFile.name, size: newAgendaFile.size } : null
            }
        ]);
        setNewAgendaTitle('');
        setNewAgendaFile(null);
    };

    const handleRemoveAgenda = (index) => {
        setAgendaList(prev => prev.filter((_, i) => i !== index));
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipantIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const getUserDeptCode = (user) => {
        const uDept = departments.find(d => d.id === user.departmentId || d.id === user.department_id);
        return uDept ? uDept.department_code || uDept.department_name : '';
    };

    const getFilteredUsers = () => {
        const deptId = currentUser?.departmentId || currentUser?.department_id;
        if (!searchEmail.trim()) {
            if (!deptId) return users.filter(u => u.id !== currentUser?.id);
            return users.filter(u => (u.departmentId === deptId || u.department_id === deptId) && u.id !== currentUser?.id);
        }
        return users.filter(u =>
            u.email && u.email.toLowerCase().includes(searchEmail.toLowerCase().trim()) && u.id !== currentUser?.id
        );
    };

    // --- Import guest actions ---
    const downloadSampleExcel = () => {
        const data = [
            { "Email": "hai.lh@smrmpts.com", "Trong công ty": "✓", "Ngoài công ty": "✗" },
            { "Email": "guest_external@gmail.com", "Trong công ty": "✗", "Ngoài công ty": "✓" },
            { "Email": "minh.pv@smrmpts.com", "Trong công ty": "✓", "Ngoài công ty": "✗" }
        ];
        const ws = XLSX.utils.json_to_sheet(data);

        ws['!cols'] = [
            { wch: 32 },
            { wch: 16 },
            { wch: 16 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách khách mời");
        XLSX.writeFile(wb, "SmarTracking_Template_Import.xlsx");
    };

    const handleExcelImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isCheckMark = (val) => {
                    const v = String(val).trim().toLowerCase();
                    return v === '✓' || v === '✔' || v === 'x' || v === 'yes' || v === '1' || v === 'true' || v === '☑';
                };

                const parsed = rows.map((row, index) => {
                    const rowNumber = index + 2;
                    const keys = Object.keys(row);
                    const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('thư điện tử'));
                    const internalKey = keys.find(k => k.toLowerCase().includes('trong') && k.toLowerCase().includes('công ty'));
                    const externalKey = keys.find(k => k.toLowerCase().includes('ngoài') && k.toLowerCase().includes('công ty'));
                    const legacyTypeKey = keys.find(k => k.toLowerCase().includes('type') || k.toLowerCase().includes('loại') || k.toLowerCase().includes('loai'));

                    const email = emailKey ? String(row[emailKey]).trim() : '';

                    let error = '';
                    if (!email) {
                        error = `Dòng ${rowNumber}: Cột Email bị trống`;
                    } else if (!email.includes('@')) {
                        error = `Dòng ${rowNumber}: Email "${email}" thiếu ký tự '@'`;
                    } else if (!emailRegex.test(email)) {
                        error = `Dòng ${rowNumber}: Email "${email}" sai định dạng`;
                    }

                    let type = 'external';
                    if (internalKey !== undefined || externalKey !== undefined) {
                        const internalVal = internalKey ? row[internalKey] : '';
                        const externalVal = externalKey ? row[externalKey] : '';
                        const isInternalChecked = isCheckMark(internalVal);
                        const isExternalChecked = isCheckMark(externalVal);

                        if (isInternalChecked && isExternalChecked) {
                            error = error || `Dòng ${rowNumber}: Không thể đánh dấu cả "Trong công ty" và "Ngoài công ty" cùng lúc`;
                        } else if (!isInternalChecked && !isExternalChecked) {
                            type = email.toLowerCase().endsWith('@smrmpts.com') ? 'internal' : 'external';
                        } else {
                            type = isInternalChecked ? 'internal' : 'external';
                        }
                    } else if (legacyTypeKey) {
                        const typeVal = String(row[legacyTypeKey]).toLowerCase().trim();
                        if (typeVal.includes('trong') || typeVal.includes('internal') || typeVal.includes('nội bộ') || typeVal === 'in') {
                            type = 'internal';
                        } else if (!typeVal) {
                            type = email.toLowerCase().endsWith('@smrmpts.com') ? 'internal' : 'external';
                        }
                    } else {
                        type = email.toLowerCase().endsWith('@smrmpts.com') ? 'internal' : 'external';
                    }

                    return { email, type, error, rowNumber };
                });

                setImportPreview(parsed);
            } catch (err) {
                console.error('Failed to parse excel file', err);
                alert('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleManualImport = () => {
        if (!manualEmails.trim()) return;
        const emailList = manualEmails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e !== '');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const parsed = emailList.map((email, index) => {
            const rowNumber = index + 1;
            let error = '';

            if (!email.includes('@')) {
                error = `Dòng ${rowNumber}: Email "${email}" thiếu ký tự '@'`;
            } else if (!emailRegex.test(email)) {
                error = `Dòng ${rowNumber}: Email "${email}" sai định dạng`;
            }

            let type = manualType;
            if (type === 'auto') {
                type = email.toLowerCase().endsWith('@smrmpts.com') ? 'internal' : 'external';
            }

            return { email, type, error, rowNumber };
        });

        setImportPreview(parsed);
    };

    const handleConfirmImport = () => {
        const hasErrors = importPreview.some(item => item.error !== '');
        if (hasErrors) {
            alert('Vui lòng loại bỏ hoặc sửa các dòng bị lỗi trước khi xác nhận.');
            return;
        }

        let internalMatchedCount = 0;
        let externalAddedCount = 0;

        const newSelectedIds = [...selectedParticipantIds];
        const newExternal = [...externalParticipants];

        importPreview.forEach(item => {
            if (item.type === 'internal') {
                const foundUser = users.find(u => u.email && u.email.toLowerCase() === item.email.toLowerCase());
                if (foundUser) {
                    if (!newSelectedIds.includes(foundUser.id)) {
                        newSelectedIds.push(foundUser.id);
                    }
                    internalMatchedCount++;
                } else {
                    if (!newExternal.some(e => e.email.toLowerCase() === item.email.toLowerCase())) {
                        newExternal.push({
                            id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            email: item.email,
                            fullName: item.email.split('@')[0],
                            isExternal: true,
                            isCompanyUnmatched: true
                        });
                    }
                    externalAddedCount++;
                }
            } else {
                if (!newExternal.some(e => e.email.toLowerCase() === item.email.toLowerCase())) {
                    newExternal.push({
                        id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        email: item.email,
                        fullName: item.email.split('@')[0],
                        isExternal: true
                    });
                }
                externalAddedCount++;
            }
        });

        setSelectedParticipantIds(newSelectedIds);
        setExternalParticipants(newExternal);
        setShowImportModal(false);
        setImportPreview([]);
        setManualEmails("");

        setSuccessMessage(`Đã import thành công: chọn ${internalMatchedCount} nhân viên công ty và thêm ${externalAddedCount} khách ngoài.`);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMessage('');
        setConflictInfo(null);
        setAlternativeRooms([]);

        const now = new Date();
        const selectedStart = new Date(`${meetingDate}T${startTime}:00`);
        if (selectedStart < now) {
            setErrorMsg('Thời gian bắt đầu không được trong quá khứ.');
            return;
        }

        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        if (sh * 60 + sm >= eh * 60 + em) {
            setErrorMsg('Giờ bắt đầu phải trước giờ kết thúc.');
            return;
        }

        if (!title.trim()) {
            setErrorMsg('Vui lòng nhập tiêu đề cuộc họp.');
            return;
        }
        if (!selectedRoomId) {
            setErrorMsg('Vui lòng chọn phòng họp.');
            return;
        }

        if (capacityExceeded && !capacityOverrideConfirmed) {
            const countLabel = expectedAttendeeCount && Number(expectedAttendeeCount) > actualAttendeeCount
                ? expectedAttendeeCount
                : actualAttendeeCount;
            setErrorMsg(`Số người dự kiến (${countLabel}) vượt quá sức chứa phòng "${selectedRoom?.roomName || selectedRoom?.room_name}" (${selectedRoom?.capacity} người). Vui lòng tick xác nhận vượt sức chứa hoặc chọn phòng khác.`);
            return;
        }

        // PDPA check
        if ((recordingEnabled || audioRecordingEnabled) && !pdpaConsent) {
            setErrorMsg('Bạn phải đồng ý với cam kết bảo vệ dữ liệu cá nhân (PDPA) khi bật tính năng ghi âm hoặc ghi hình.');
            return;
        }

        const { isoStart, isoEnd } = buildIsoRange();

        const payload = {
            title,
            startTime: isoStart,
            endTime: isoEnd,
            roomId: selectedRoomId,
            meetingType,
            meetingMode,
        };
        if (hostId) payload.hostId = hostId;
        if (description.trim()) payload.description = description.trim();
        if (expectedAttendeeCount) payload.expectedAttendeeCount = Number(expectedAttendeeCount);
        if (capacityExceeded && capacityOverrideConfirmed) payload.capacityOverrideConfirmed = true;
        if (selectedParticipantIds.length > 0) payload.participantUserIds = selectedParticipantIds;

        if (externalParticipants.length > 0) {
            payload.externalParticipants = externalParticipants.map(p => ({
                fullName: p.fullName || p.email.split('@')[0],
                email: p.email,
                ...(p.organization ? { organization: p.organization } : {})
            }));
        }

        setSubmitting(true);
        try {
            const res = await createMeeting(payload);
            if (!res?.success) {
                const failure = new Error(res?.message || 'Tạo cuộc họp thất bại.');
                failure.error = { message: res?.message || 'Tạo cuộc họp thất bại.' };
                throw failure;
            }

            const meetingId = res.data?.id;
            const subWarnings = [];

            if (meetingId && (recordingEnabled || audioRecordingEnabled)) {
                try {
                    await addRecordingConfig(meetingId, {
                        enableVideo: recordingEnabled,
                        enableAudio: audioRecordingEnabled,
                        consentRequired: pdpaConsent,
                    });
                } catch (subErr) {
                    console.error('Failed to save recording config', subErr);
                    subWarnings.push('cấu hình ghi âm/ghi hình');
                }
            }

            if (meetingId && agendaList.length > 0) {
                try {
                    await replaceAgendas(meetingId, agendaList.map(item => ({
                        title: item.title,
                        plannedDurationMinutes: Number(item.durationMin)
                    })));
                } catch (subErr) {
                    console.error('Failed to save agenda', subErr);
                    subWarnings.push('chương trình họp (agenda)');
                }
            }

            const isScheduled = res.data?.status === 'scheduled';
            let msg = isScheduled
                ? 'Đặt phòng họp thành công! Lịch họp đã được lên lịch.'
                : 'Đăng ký đặt phòng họp thành công! Yêu cầu của bạn đã được gửi tới Quản lý phê duyệt.';
            if (subWarnings.length > 0) {
                msg += ` (Lưu ý: lưu ${subWarnings.join(', ')} thất bại, vui lòng cập nhật lại ở trang chi tiết cuộc họp.)`;
            }

            let homePath = '/employee';
            if (currentUser?.roles) {
                const roles = currentUser.roles.map(r => (typeof r === 'string' ? r : r.roleCode || '').toUpperCase());
                if (roles.includes('SYSTEM_ADMIN') || roles.includes('ADMIN')) homePath = '/system-admin';
                else if (roles.includes('BUSINESS_ADMIN')) homePath = '/business-admin';
                else if (roles.includes('MANAGER')) homePath = '/manager';
            }

            // Clear form and reset
            setTitle('');
            setDescription('');
            setSelectedRoomId('');
            setExpectedAttendeeCount('');
            setCapacityOverrideConfirmed(false);
            setSelectedParticipantIds([]);
            setExternalParticipants([]);
            setSearchEmail('');
            setAgendaList([]);
            setRecordingEnabled(false);
            setAudioRecordingEnabled(false);
            setPdpaConsent(false);
            setCurrentStep(1);
            setSearchPerformed(false);
            setAvailableRooms([]);

            // Redirect to homepage with successMessage state
            navigate(homePath, { state: { successMessage: msg } });
        } catch (err) {
            console.error('Booking failed', err);
            const message = err?.error?.message
                || 'Rất tiếc, phòng họp này hoặc người tham dự đã bị trùng lịch trong khung giờ được chọn. Vui lòng chọn phòng khác hoặc điều chỉnh khung giờ.';
            setConflictInfo({ message });

            try {
                const { isoStart, isoEnd } = buildIsoRange();
                const params = { startTime: isoStart, endTime: isoEnd };
                if (expectedAttendeeCount) params.minCapacity = expectedAttendeeCount;
                const altRes = await getAvailableRooms(params);
                const alts = (altRes?.data || []).filter(r => r.id !== selectedRoomId);
                setAlternativeRooms(alts);
            } catch (altErr) {
                console.error('Failed to fetch alternative rooms', altErr);
                setAlternativeRooms([]);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectAlternativeRoom = (roomId) => {
        setSelectedRoomId(roomId);
        setCapacityOverrideConfirmed(false);
        setConflictInfo(null);
        setAlternativeRooms([]);
    };

    // BE trả roleCode dạng UPPER_SNAKE trong currentUser.roles[] (mảng object), không phải field `role` string PascalCase.
    const isManagerOrAdmin = currentUser?.roles?.some(r => ['MANAGER', 'BUSINESS_ADMIN', 'SYSTEM_ADMIN'].includes(r.roleCode || r.role_code));

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-blue">
                <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-semibold text-sm">Đang tải danh sách tài nguyên và thông tin cấu hình...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-action-blue mb-2">
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Đặt lịch
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-midnight-indigo">Đặt lịch & Đăng ký phòng họp</h1>
                <p className="text-xs text-slate-blue">Lên kế hoạch cuộc họp, thiết lập chương trình (agenda) và kiểm tra chính sách bảo mật</p>
            </div>

            {/* Visual Step Progress Indicator */}
            <div className="flex items-center justify-center gap-4 py-2 border-b border-platinum-tint/30 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === 1
                        ? 'bg-action-blue text-white ring-4 ring-action-blue/15'
                        : 'bg-emerald-500 text-white'
                        }`}>
                        {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                    </span>
                    <span className={`text-sm font-bold ${currentStep === 1 ? 'text-midnight-indigo' : 'text-slate-blue'}`}>
                        Chọn phòng & Thời gian
                    </span>
                </div>
                <div className="w-16 h-0.5 bg-platinum-tint rounded" />
                <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === 2
                        ? 'bg-action-blue text-white ring-4 ring-action-blue/15'
                        : 'bg-cloud-mist border border-platinum-tint text-slate-blue'
                        }`}>
                        2
                    </span>
                    <span className={`text-sm font-bold ${currentStep === 2 ? 'text-midnight-indigo' : 'text-slate-blue'}`}>
                        Thông tin cuộc họp
                    </span>
                </div>
            </div>

            {/* Success and Error messages outside forms */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex gap-2"
                    >
                        <Check className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
                        <span className="font-semibold">{successMessage}</span>
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span className="font-semibold">{errorMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step-by-Step Forms */}
            <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Time Picker Card */}
                        <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                <Clock className="w-4 h-4 text-action-blue" /> Khung thời gian họp
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Ngày họp *</label>
                                    <input
                                        type="date"
                                        value={meetingDate}
                                        min={new Date().toLocaleDateString('en-CA')}
                                        onChange={(e) => {
                                            setMeetingDate(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Giờ bắt đầu *</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => {
                                            setStartTime(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Giờ kết thúc *</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => {
                                            setEndTime(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Số người dự kiến</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={expectedAttendeeCount}
                                        onChange={(e) => {
                                            setExpectedAttendeeCount(e.target.value);
                                            setSelectedRoomId('');
                                        }}
                                        placeholder="Tuỳ chọn"
                                        className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={handleSearchRooms}
                                    disabled={searchingRooms}
                                    className="px-6 py-2.5 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                >
                                    {searchingRooms ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" /> Tìm phòng họp
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchPerformed && (
                            <div>
                                <h4 className="font-bold text-xs text-slate-blue uppercase mb-3 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Phòng họp trống ({availableRooms.length})
                                </h4>
                                {availableRooms.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {availableRooms.map(room => {
                                            const isSelected = selectedRoomId === room.id;
                                            return (
                                                <div
                                                    key={room.id}
                                                    onClick={() => handleSelectRoom(room)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-36 ${isSelected
                                                        ? 'bg-blue-50/20 border-action-blue shadow-md ring-2 ring-action-blue/15'
                                                        : 'bg-white border-platinum-tint hover:border-action-blue/50 hover:bg-cloud-mist/50'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h5 className="font-bold text-sm text-midnight-indigo">{room.roomName || room.room_name}</h5>
                                                            <span className="text-[11px] font-bold text-slate-blue bg-cloud-mist px-2 py-0.5 rounded">
                                                                Sức chứa: {room.capacity} người
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-blue mt-1 line-clamp-1">
                                                            {room.siteName || room.site_name} • {room.areaName || room.area_name || 'Khu vực chính'}
                                                        </p>
                                                    </div>

                                                    {/* Facilities Icons */}
                                                    <div className="flex items-center justify-between border-t border-platinum-tint/40 pt-2.5 mt-2">
                                                        <div className="flex items-center gap-2.5 text-slate-blue/70">
                                                            {(room.hasCamera || room.has_camera) && <Video className="w-3.5 h-3.5" title="Có Camera" />}
                                                            {(room.hasMicrophone || room.has_microphone) && <Mic className="w-3.5 h-3.5" title="Có Mic" />}
                                                            {(room.hasDisplay || room.has_display) && <Calendar className="w-3.5 h-3.5" title="Có Màn hình" />}
                                                        </div>
                                                        <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-action-blue' : 'text-slate-blue/60'}`}>
                                                            {isSelected ? 'Đã chọn' : 'Chọn phòng'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-blue italic pl-2 py-2">Không tìm thấy phòng họp trống trong khung giờ này. Vui lòng đổi giờ hoặc số người dự kiến.</p>
                                )}
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex justify-end pt-4 border-t border-platinum-tint/30">
                            <button
                                type="button"
                                disabled={!selectedRoomId}
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
                            >
                                Tiếp tục <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Side: Inputs */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Selected Room Summary Banner */}
                                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-5 rounded-2xl border border-platinum-tint flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-action-blue uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                            Phòng họp đã chọn
                                        </span>
                                        <h3 className="font-bold text-lg text-midnight-indigo mt-2">
                                            {selectedRoom?.roomName || selectedRoom?.room_name}
                                        </h3>
                                        <p className="text-xs text-slate-blue mt-0.5">
                                            {selectedRoom?.siteName || selectedRoom?.site_name} • Sức chứa: {selectedRoom?.capacity} người
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-platinum-tint/80 shadow-sm shrink-0">
                                        <Calendar className="w-5 h-5 text-action-blue shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-blue font-bold uppercase">Khung giờ họp</p>
                                            <p className="text-sm font-bold text-midnight-indigo">
                                                {startTime} - {endTime}
                                            </p>
                                            <p className="text-[11px] text-slate-blue font-semibold">
                                                Ngày {meetingDate.split('-').reverse().join('/')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity override warning */}
                                {capacityExceeded && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                                        <div className="flex gap-2 text-rose-700 text-xs">
                                            <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                                            <span className="font-semibold">
                                                Số người dự kiến ({expectedAttendeeCount && Number(expectedAttendeeCount) > actualAttendeeCount ? expectedAttendeeCount : actualAttendeeCount}) vượt sức chứa phòng "{selectedRoom?.roomName || selectedRoom?.room_name}" ({selectedRoom?.capacity} người).
                                            </span>
                                        </div>
                                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-rose-700 font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={capacityOverrideConfirmed}
                                                onChange={(e) => setCapacityOverrideConfirmed(e.target.checked)}
                                                className="w-4 h-4 rounded text-rose-600 border-rose-300 focus:ring-rose-500"
                                            />
                                            Tôi xác nhận vượt sức chứa phòng và vẫn muốn tiếp tục đặt phòng này.
                                        </label>
                                    </div>
                                )}

                                {/* General Information */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                        <Info className="w-4 h-4 text-action-blue" /> Chi tiết cuộc họp
                                    </h3>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Tiêu đề cuộc họp *</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Nhập tiêu đề hoặc mục đích họp..."
                                            className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue focus:ring-2 focus:ring-action-blue/15 text-midnight-indigo"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Loại cuộc họp</label>
                                            <select
                                                value={meetingType}
                                                onChange={(e) => setMeetingType(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo bg-white"
                                            >
                                                <option value="normal">Thông thường</option>
                                                <option value="training">Đào tạo</option>
                                                <option value="interview">Phỏng vấn</option>
                                                <option value="emergency">Khẩn cấp</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Hình thức họp</label>
                                            <select
                                                value={meetingMode}
                                                onChange={(e) => setMeetingMode(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo bg-white"
                                            >
                                                <option value="offline">Trực tiếp (Offline)</option>
                                                <option value="online">Trực tuyến (Online)</option>
                                                <option value="hybrid">Kết hợp (Hybrid)</option>
                                            </select>
                                        </div>
                                    </div>



                                    <div>
                                        <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">Mô tả (tuỳ chọn)</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Mục tiêu, nội dung chính của cuộc họp..."
                                            rows={3}
                                            maxLength={2000}
                                            className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue focus:ring-2 focus:ring-action-blue/15 text-midnight-indigo resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Invite Participants */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-cloud-mist">
                                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4 text-royal-amethyst" /> Mời khách tham gia
                                        </h3>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${(selectedParticipantIds.length + externalParticipants.length + 1) > (selectedRoom?.capacity || 0)
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                                            : 'bg-cloud-mist text-slate-blue'
                                            }`}>
                                            Đã mời: {selectedParticipantIds.length + externalParticipants.length + 1} / {selectedRoom?.capacity || 0} người
                                        </span>
                                    </div>

                                    {(selectedParticipantIds.length + externalParticipants.length + 1) > (selectedRoom?.capacity || 0) && !capacityOverrideConfirmed && (
                                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2">
                                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" />
                                            <span>
                                                Số người tham gia ({selectedParticipantIds.length + externalParticipants.length + 1} người bao gồm cả bạn) đã vượt quá sức chứa của phòng ({selectedRoom?.capacity} người). Vui lòng bỏ chọn bớt hoặc quay lại bước 1 chọn phòng rộng hơn hoặc tick xác nhận vượt sức chứa.
                                            </span>
                                        </div>
                                    )}

                                    {/* Search & Import Section */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-blue/60" />
                                            <input
                                                type="text"
                                                value={searchEmail}
                                                onChange={(e) => setSearchEmail(e.target.value)}
                                                onFocus={() => setSearchFocused(true)}
                                                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                                placeholder="Tìm kiếm nhân viên theo email..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo bg-white"
                                            />
                                            {searchEmail && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchEmail('')}
                                                    className="absolute right-3 top-3.5 text-slate-blue/50 hover:text-slate-blue"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Floating Autocomplete Dropdown suggestions list */}
                                            {searchFocused && (
                                                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-platinum-tint rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-cloud-mist">
                                                    {getFilteredUsers().filter(u => !selectedParticipantIds.includes(u.id)).length > 0 ? (
                                                        getFilteredUsers()
                                                            .filter(u => !selectedParticipantIds.includes(u.id))
                                                            .map(user => {
                                                                const deptCode = getUserDeptCode(user);
                                                                return (
                                                                    <div
                                                                        key={user.id}
                                                                        onMouseDown={() => {
                                                                            toggleParticipant(user.id);
                                                                            setSearchEmail('');
                                                                        }}
                                                                        className="p-2.5 hover:bg-action-blue/[0.03] cursor-pointer flex items-center justify-between text-slate-blue transition-colors gap-3 min-w-0"
                                                                    >
                                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                            {/* Mini Avatar in dropdown */}
                                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-platinum-tint flex-shrink-0 bg-gradient-to-tr from-action-blue to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                                                {user.avatarUrl ? (
                                                                                    <img src={user.avatarUrl} alt={user.fullName || user.full_name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    (user.fullName || user.full_name || 'U').charAt(0).toUpperCase()
                                                                                )}
                                                                            </div>
                                                                            <div className="space-y-0.5 min-w-0 flex-1">
                                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                                    <p className="text-sm font-semibold text-midnight-indigo truncate" title={user.fullName || user.full_name}>
                                                                                        {user.fullName || user.full_name}
                                                                                    </p>
                                                                                    {deptCode && (
                                                                                        <span
                                                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-action-blue/10 text-action-blue shrink-0 max-w-[85px] truncate"
                                                                                            title={deptCode}
                                                                                        >
                                                                                            {deptCode}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-[11px] opacity-75 truncate" title={user.email}>{user.email}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Plus className="w-4 h-4 text-action-blue opacity-60 hover:opacity-100 shrink-0" />
                                                                    </div>
                                                                );
                                                            })
                                                    ) : (
                                                        <div className="p-4 text-center text-xs text-slate-blue italic">
                                                            {searchEmail ? 'Không tìm thấy nhân viên phù hợp.' : 'Không còn gợi ý nhân viên nào.'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowImportModal(true)}
                                            className="px-4 py-2.5 bg-cloud-mist hover:bg-platinum-tint/50 text-slate-blue hover:text-midnight-indigo border border-platinum-tint rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            Import danh sách
                                        </button>
                                    </div>

                                    {/* Internal Selected Participants List (Card format with Checkmark) */}
                                    {selectedParticipantIds.length > 0 && (
                                        <div className="pt-4 border-t border-platinum-tint/50 space-y-3">
                                            <p className="text-xs font-bold text-midnight-indigo uppercase tracking-wider">
                                                Nhân viên trong hệ thống đã chọn ({selectedParticipantIds.length}):
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                                                {users
                                                    .filter(u => selectedParticipantIds.includes(u.id))
                                                    .map(user => {
                                                        const deptCode = getUserDeptCode(user);
                                                        return (
                                                            <div
                                                                key={user.id}
                                                                onClick={() => toggleParticipant(user.id)}
                                                                className="p-3 rounded-2xl border border-action-blue/20 bg-action-blue/[0.02] text-midnight-indigo shadow-sm flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:bg-rose-50/40 hover:border-rose-200 hover:shadow group gap-3 min-w-0"
                                                                title="Nhấp để xóa người tham gia này"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    {/* Avatar */}
                                                                    <div
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenUserDetail(user.id);
                                                                        }}
                                                                        className="relative w-10 h-10 rounded-full overflow-hidden border border-action-blue/10 flex-shrink-0 bg-gradient-to-tr from-action-blue to-cyan-500 text-white flex items-center justify-center font-extrabold text-sm hover:scale-105 hover:shadow transition-all group/avatar cursor-pointer"
                                                                        title="Xem thông tin chi tiết"
                                                                    >
                                                                        {user.avatarUrl ? (
                                                                            <img src={user.avatarUrl} alt={user.fullName || user.full_name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            (user.fullName || user.full_name || 'U').charAt(0).toUpperCase()
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-200">
                                                                            <Info className="w-3.5 h-3.5 text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-0.5 min-w-0 flex-1">
                                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                                            <span
                                                                                className="text-sm font-semibold text-midnight-indigo group-hover:text-rose-950 transition-colors truncate"
                                                                                title={user.fullName || user.full_name}
                                                                            >
                                                                                {user.fullName || user.full_name}
                                                                            </span>
                                                                            {deptCode && (
                                                                                <span
                                                                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-action-blue/10 text-action-blue group-hover:bg-rose-100 group-hover:text-rose-700 transition-colors shrink-0 max-w-[85px] truncate"
                                                                                    title={deptCode}
                                                                                >
                                                                                    {deptCode}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p
                                                                            className="text-[11px] font-normal text-slate-blue/80 group-hover:text-rose-700/60 transition-colors truncate"
                                                                            title={user.email}
                                                                        >
                                                                            {user.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-5 h-5 rounded-full bg-action-blue text-white border border-action-blue flex items-center justify-center transition-all duration-200 shrink-0 group-hover:bg-rose-600 group-hover:border-rose-600 shadow-sm">
                                                                    <Check className="w-3 h-3 block group-hover:hidden" />
                                                                    <X className="w-3 h-3 hidden group-hover:block" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    {/* External Participants List */}
                                    {externalParticipants.length > 0 && (
                                        <div className="pt-2 border-t border-platinum-tint/50 space-y-2">
                                            <p className="text-xs font-semibold text-slate-blue">
                                                Khách mời ngoài hệ thống ({externalParticipants.length}):
                                            </p>
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                                {externalParticipants.map((ext) => (
                                                    <div
                                                        key={ext.id}
                                                        className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border text-xs font-medium transition-colors max-w-full min-w-0 ${ext.isCompanyUnmatched
                                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            }`}
                                                    >
                                                        <span className="truncate max-w-[150px] sm:max-w-[200px]" title={ext.email}>
                                                            {ext.email}
                                                        </span>
                                                        <span className="text-[10px] px-1 py-0.2 bg-white/70 rounded-full font-bold shrink-0">
                                                            {ext.isCompanyUnmatched ? 'Chưa khớp NV' : 'Khách ngoài'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExternalParticipants(prev => prev.filter(p => p.id !== ext.id))}
                                                            className="p-0.5 rounded-full hover:bg-black/10 transition-colors shrink-0"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Agenda Builder */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-cloud-mist">
                                        <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-600" /> Chương trình họp (Agenda)
                                        </h3>
                                        <span className="text-xs font-bold text-slate-blue bg-cloud-mist px-2.5 py-1 rounded-lg">
                                            Đã lên: {agendaTotalDuration} / {meetingDuration} phút
                                        </span>
                                    </div>

                                    {/* New Agenda Input */}
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={newAgendaTitle}
                                                    onChange={(e) => {
                                                        setNewAgendaTitle(e.target.value);
                                                        setAgendaInputError('');
                                                    }}
                                                    placeholder="Chủ đề / Nội dung thảo luận..."
                                                    className="w-full px-4 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                                />
                                            </div>
                                            <div className="w-full sm:w-32 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={newAgendaDuration}
                                                    onChange={(e) => {
                                                        setNewAgendaDuration(e.target.value);
                                                        setAgendaInputError('');
                                                    }}
                                                    min="1"
                                                    placeholder="Phút"
                                                    className="w-full px-3 py-2 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo text-center"
                                                />
                                                <span className="text-xs text-slate-blue">phút</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddAgenda}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                                            >
                                                <Plus className="w-4 h-4" /> Thêm
                                            </button>
                                        </div>

                                        {/* Agenda Item Document Upload */}
                                        <div className="flex items-center gap-3 w-full">
                                            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-platinum-tint hover:border-action-blue bg-cloud-mist/20 hover:bg-blue-50/20 text-slate-blue hover:text-action-blue rounded-xl text-xs font-bold cursor-pointer transition-all flex-1 justify-center select-none min-w-0">
                                                <Upload className="w-4 h-4 text-action-blue shrink-0" />
                                                <span className="truncate">{newAgendaFile ? `Đã đính kèm: ${newAgendaFile.name}` : 'Đính kèm tài liệu thảo luận (PDF, Word, Excel, PowerPoint...)'}</span>
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setNewAgendaFile(e.target.files[0]);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            {newAgendaFile && (
                                                <button
                                                    type="button"
                                                    onClick={() => setNewAgendaFile(null)}
                                                    className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all"
                                                    title="Hủy chọn file"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {agendaInputError && (
                                            <div className="flex items-center gap-1.5 mt-2 text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 animate-fade-in-up">
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                <p className="text-xs font-medium">{agendaInputError}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Agenda List */}
                                    {agendaList.length > 0 ? (
                                        <div className="space-y-2 pt-2">
                                            {agendaList.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-cloud-mist/30 rounded-xl border border-platinum-tint/40 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center border border-emerald-100 shrink-0">
                                                            {index + 1}
                                                        </span>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-midnight-indigo break-words break-all">{item.title}</div>
                                                            {item.file && (
                                                                <div className="flex items-center gap-1.5 text-[10px] text-action-blue font-semibold bg-action-blue/5 px-2 py-0.5 rounded-lg border border-action-blue/10 w-max select-none">
                                                                    <Paperclip className="w-3 h-3 text-action-blue" />
                                                                    <span className="max-w-[200px] truncate">{item.file.name}</span>
                                                                    <span className="text-[9px] opacity-60">({(item.file.size / 1024).toFixed(1)} KB)</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-medium text-slate-blue bg-cloud-mist px-2.5 py-0.5 rounded-full">{item.durationMin} phút</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAgenda(index)}
                                                            className="p-1 text-slate-blue hover:text-red-600 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-blue text-center py-4 italic">Chưa thiết lập chương trình thảo luận chi tiết.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Policies, Config, Submit */}
                            <div className="space-y-6">
                                {/* Approvals */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider pb-3 border-b border-cloud-mist">
                                        Trạng thái & Phê duyệt
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-blue">Người tổ chức:</span>
                                            <span className="font-bold text-midnight-indigo">{currentUser?.fullName || 'Nhân viên'}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-blue">Quy trình duyệt:</span>
                                            {isManagerOrAdmin ? (
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                                    Tự động phê duyệt
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                                                    Cần Trưởng phòng duyệt
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-blue leading-relaxed pt-2 border-t border-cloud-mist/50">
                                            {isManagerOrAdmin
                                                ? 'Với vai trò quản lý hệ thống, lịch họp này sẽ được chốt tức thời mà không cần qua bước phê duyệt trung gian.'
                                                : 'Yêu cầu của bạn sẽ được gửi tới hòm thư phê duyệt của Trưởng phòng. Phòng họp sẽ được tạm khóa giữ chỗ để tránh xung đột.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Security & Recording Config */}
                                <div className="bg-white p-6 rounded-2xl border border-platinum-tint shadow-sm space-y-4">
                                    <h3 className="font-bold text-sm text-midnight-indigo uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-cloud-mist">
                                        <Video className="w-4 h-4 text-red-600" /> Cấu hình ghi âm & hình
                                    </h3>

                                    {/* Video Recording */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4 text-slate-blue" />
                                            <span className="text-sm font-semibold text-midnight-indigo">Ghi hình cuộc họp</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={recordingEnabled}
                                                onChange={(e) => {
                                                    setRecordingEnabled(e.target.checked);
                                                    if (!e.target.checked && !audioRecordingEnabled) setPdpaConsent(false);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* Audio Recording */}
                                    <div className="flex items-center justify-between pt-2 border-t border-platinum-tint/40">
                                        <div className="flex items-center gap-2">
                                            <Mic className="w-4 h-4 text-slate-blue" />
                                            <span className="text-sm font-semibold text-midnight-indigo">Ghi âm cuộc họp</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={audioRecordingEnabled}
                                                onChange={(e) => {
                                                    setAudioRecordingEnabled(e.target.checked);
                                                    if (!e.target.checked && !recordingEnabled) setPdpaConsent(false);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* PDPA Consent */}
                                    <AnimatePresence>
                                        {(recordingEnabled || audioRecordingEnabled) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3 overflow-hidden text-xs text-slate-blue"
                                            >
                                                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-2">
                                                    <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
                                                    <p className="leading-relaxed font-semibold">
                                                        Theo Nghị định bảo vệ dữ liệu cá nhân (PDPA VN), bạn phải có sự đồng ý của tất cả thành viên bắt buộc tham dự trước khi thực hiện ghi âm/ghi hình cuộc họp.
                                                    </p>
                                                </div>

                                                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={pdpaConsent}
                                                        onChange={(e) => setPdpaConsent(e.target.checked)}
                                                        className="mt-1 w-4 h-4 rounded text-red-600 border-platinum-tint focus:ring-red-500"
                                                    />
                                                    <span className="leading-tight font-semibold text-slate-blue">
                                                        Tôi cam kết đã thông báo và có sự đồng ý của tất cả người tham gia.
                                                    </span>
                                                </label>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Step 2 Actions */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="w-1/2 py-3 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Quay lại
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-1/2 py-3 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
                                        >
                                            {submitting ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                'Xác nhận đặt'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collision modal / panel (keeps fallback alternative rooms logic) */}
            <AnimatePresence>
                {conflictInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="bg-white p-6 rounded-2xl border border-amber-200 shadow-lg space-y-4"
                    >
                        <div className="flex gap-3 items-start bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm text-amber-800">Xung đột bận lịch (Collision Detected)</h4>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    {conflictInfo.message}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-xs text-slate-blue uppercase mb-3 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4 text-action-blue" /> Đề xuất phòng họp thay thế khả dụng:
                            </h4>
                            {alternativeRooms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {alternativeRooms.map(room => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleSelectAlternativeRoom(room.id)}
                                            className="p-4 rounded-xl border border-platinum-tint hover:border-action-blue hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-between"
                                        >
                                            <div>
                                                <h5 className="font-bold text-sm text-midnight-indigo">{room.roomName || room.room_name}</h5>
                                                <p className="text-xs text-slate-blue">Sức chứa: {room.capacity} người • {room.siteName || room.site_name}</p>
                                            </div>
                                            <span className="text-xs font-bold text-action-blue bg-blue-50 px-2.5 py-1 rounded-lg">Chọn phòng này</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-blue italic pl-2">Không tìm thấy phòng họp trống thay thế nào có sức chứa tương đương trong thời gian này.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Import Participants Modal (combined feature with backdrop blur) */}
            {showImportModal && ReactDOM.createPortal(
                <AnimatePresence>
                    {showImportModal && (
                        <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl border border-platinum-tint shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-5 border-b border-cloud-mist bg-cloud-mist/20">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-5 h-5 text-action-blue" />
                                        <h3 className="font-bold text-base text-midnight-indigo">Import danh sách khách mời</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportPreview([]);
                                            setManualEmails('');
                                        }}
                                        className="p-1.5 hover:bg-cloud-mist rounded-lg text-slate-blue hover:text-midnight-indigo transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                    {/* Tab selection */}
                                    <div className="flex border-b border-platinum-tint">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImportMethod('manual');
                                                setImportPreview([]);
                                            }}
                                            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${importMethod === 'manual'
                                                ? 'border-action-blue text-action-blue'
                                                : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                                                }`}
                                        >
                                            Nhập thủ công
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImportMethod('excel');
                                                setImportPreview([]);
                                            }}
                                            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${importMethod === 'excel'
                                                ? 'border-action-blue text-action-blue'
                                                : 'border-transparent text-slate-blue hover:text-midnight-indigo'
                                                }`}
                                        >
                                            Nhập từ file Excel
                                        </button>
                                    </div>

                                    {importMethod === 'manual' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-blue uppercase mb-1.5">
                                                    Nhập danh sách Email *
                                                </label>
                                                <textarea
                                                    value={manualEmails}
                                                    onChange={(e) => setManualEmails(e.target.value)}
                                                    rows="4"
                                                    placeholder="Ví dụ: email1@company.com, email2@gmail.com, email3@company.com&#10;(Hỗ trợ ngăn cách bằng dấu phẩy, chấm phẩy hoặc xuống dòng)"
                                                    className="w-full px-4 py-2.5 border border-platinum-tint rounded-xl text-sm focus:outline-none focus:border-action-blue text-midnight-indigo"
                                                />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="text-xs font-semibold text-slate-blue">Phân loại email nhập vào:</span>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-blue cursor-pointer select-none">
                                                        <input
                                                            type="radio"
                                                            name="manualType"
                                                            value="auto"
                                                            checked={manualType === 'auto'}
                                                            onChange={() => setManualType('auto')}
                                                            className="text-action-blue focus:ring-action-blue"
                                                        />
                                                        Tự động nhận diện
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-blue cursor-pointer select-none">
                                                        <input
                                                            type="radio"
                                                            name="manualType"
                                                            value="internal"
                                                            checked={manualType === 'internal'}
                                                            onChange={() => setManualType('internal')}
                                                            className="text-action-blue focus:ring-action-blue"
                                                        />
                                                        Trong công ty (Nội bộ)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-blue cursor-pointer select-none">
                                                        <input
                                                            type="radio"
                                                            name="manualType"
                                                            value="external"
                                                            checked={manualType === 'external'}
                                                            onChange={() => setManualType('external')}
                                                            className="text-action-blue focus:ring-action-blue"
                                                        />
                                                        Ngoài công ty (Khách ngoài)
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleManualImport}
                                                    disabled={!manualEmails.trim()}
                                                    className="px-4 py-2 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
                                                >
                                                    Xem trước danh sách
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Download template banner */}
                                            <div className="flex justify-between items-center bg-blue-50/40 border border-blue-100 p-3.5 rounded-xl">
                                                <div className="space-y-0.5">
                                                    <h4 className="text-xs font-bold text-midnight-indigo flex items-center gap-1.5">
                                                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Tải file Excel mẫu:
                                                    </h4>
                                                    <p className="text-[10.5px] text-slate-blue">Sử dụng file mẫu có cấu trúc định dạng chuẩn phục vụ import khách mời.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={downloadSampleExcel}
                                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Tải file mẫu
                                                </button>
                                            </div>

                                            <div className="p-5 border-2 border-dashed border-platinum-tint hover:border-action-blue/50 rounded-2xl flex flex-col items-center justify-center bg-cloud-mist/10 relative transition-all group">
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    onChange={handleExcelImport}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                <Upload className="w-8 h-8 text-slate-blue/60 group-hover:text-action-blue transition-colors mb-2" />
                                                <p className="text-xs font-bold text-midnight-indigo">Click để chọn hoặc kéo thả file Excel vào đây</p>
                                                <p className="text-[10px] text-slate-blue mt-1">Hỗ trợ file định dạng .xlsx, .xls</p>
                                            </div>

                                            <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1.5">
                                                <h4 className="text-xs font-bold text-midnight-indigo flex items-center gap-1.5">
                                                    <Info className="w-3.5 h-3.5 text-action-blue" /> Hướng dẫn định dạng cột Excel:
                                                </h4>
                                                <p className="text-[11px] text-slate-blue leading-relaxed">
                                                    Hệ thống sẽ quét file Excel và đọc các cột:
                                                </p>
                                                <ul className="list-disc pl-4 text-[11px] text-slate-blue space-y-0.5">
                                                    <li>Cột <strong>Email</strong>: Chứa địa chỉ email của người tham gia.</li>
                                                    <li>Cột <strong>Trong công ty</strong>: Đánh dấu <code className="px-1 py-0.2 bg-white border rounded font-semibold text-emerald-600">✓</code> nếu là nhân viên nội bộ, <code className="px-1 py-0.2 bg-white border rounded font-semibold text-rose-500">✗</code> nếu không.</li>
                                                    <li>Cột <strong>Ngoài công ty</strong>: Đánh dấu <code className="px-1 py-0.2 bg-white border rounded font-semibold text-emerald-600">✓</code> nếu là khách ngoài, <code className="px-1 py-0.2 bg-white border rounded font-semibold text-rose-500">✗</code> nếu không.</li>
                                                    <li className="text-[10px] italic text-slate-blue/70">Nếu cả 2 cột đều bỏ trống, hệ thống sẽ tự nhận diện theo đuôi email.</li>
                                                </ul>

                                                {/* Mini preview table */}
                                                <div className="mt-2 border border-blue-100 rounded-lg overflow-hidden">
                                                    <table className="w-full text-[10.5px] text-center">
                                                        <thead>
                                                            <tr className="bg-blue-50/60 text-slate-blue font-bold">
                                                                <th className="py-1.5 px-2 text-left">Email</th>
                                                                <th className="py-1.5 px-2">Trong công ty</th>
                                                                <th className="py-1.5 px-2">Ngoài công ty</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-slate-blue/80">
                                                            <tr className="border-t border-blue-50">
                                                                <td className="py-1 px-2 text-left">nhanvien@smrmpts.com</td>
                                                                <td className="py-1 px-2 text-emerald-600 font-bold">✓</td>
                                                                <td className="py-1 px-2 text-rose-400">✗</td>
                                                            </tr>
                                                            <tr className="border-t border-blue-50">
                                                                <td className="py-1 px-2 text-left">khachngoai@gmail.com</td>
                                                                <td className="py-1 px-2 text-rose-400">✗</td>
                                                                <td className="py-1 px-2 text-emerald-600 font-bold">✓</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Section */}
                                    {importPreview.length > 0 && (
                                        <div className="space-y-2 border-t border-platinum-tint/50 pt-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold text-midnight-indigo">
                                                    Xem trước dữ liệu import ({importPreview.length} dòng):
                                                </h4>
                                                {importPreview.some(p => p.error) && (
                                                    <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded-lg font-bold animate-pulse">
                                                        Phát hiện dòng dữ liệu bị lỗi! Vui lòng kiểm tra lại.
                                                    </span>
                                                )}
                                            </div>
                                            <div className="border border-platinum-tint rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="bg-cloud-mist/50 border-b border-platinum-tint font-bold text-slate-blue">
                                                            <th className="p-3">Email</th>
                                                            <th className="p-3 text-center">Trong công ty</th>
                                                            <th className="p-3 text-center">Ngoài công ty</th>
                                                            <th className="p-3 text-right">Trạng thái đối khớp / Lỗi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {importPreview.map((item, idx) => {
                                                            const isInternal = item.type === 'internal';
                                                            const foundUser = users.find(u => u.email && u.email.toLowerCase() === item.email.toLowerCase());

                                                            let matchStatus = 'Khách ngoài công ty';
                                                            let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';

                                                            if (isInternal) {
                                                                if (foundUser) {
                                                                    matchStatus = `Nhân viên: ${foundUser.fullName || foundUser.full_name}`;
                                                                    badgeClass = 'bg-blue-50 text-blue-700 border-blue-100';
                                                                } else {
                                                                    matchStatus = 'Không thấy NV (Coi là khách)';
                                                                    badgeClass = 'bg-amber-50 text-amber-700 border-amber-100';
                                                                }
                                                            }

                                                            if (item.error) {
                                                                matchStatus = 'Lỗi định dạng';
                                                                badgeClass = 'bg-red-50 text-red-700 border-red-100';
                                                            }

                                                            return (
                                                                <tr key={idx} className={`border-b border-platinum-tint/50 hover:bg-cloud-mist/20 transition-colors ${item.error ? 'bg-rose-50/20' : ''}`}>
                                                                    <td className="p-3 font-medium text-midnight-indigo">
                                                                        <span className={item.error ? 'text-rose-600 font-semibold' : ''}>{item.email || '(Để trống)'}</span>
                                                                        {item.error && (
                                                                            <span className="block text-[10px] text-rose-500 font-bold mt-0.5">{item.error}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        <span className={`text-sm font-bold ${isInternal ? 'text-emerald-600' : 'text-rose-400'}`}>
                                                                            {isInternal ? '✓' : '✗'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        <span className={`text-sm font-bold ${!isInternal ? 'text-emerald-600' : 'text-rose-400'}`}>
                                                                            {!isInternal ? '✓' : '✗'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                                                                            {matchStatus}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-5 border-t border-cloud-mist bg-cloud-mist/10 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportPreview([]);
                                            setManualEmails('');
                                        }}
                                        className="px-4 py-2 border border-platinum-tint text-slate-blue hover:bg-cloud-mist rounded-xl text-xs font-bold transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmImport}
                                        disabled={importPreview.length === 0 || importPreview.some(p => p.error !== '')}
                                        className="px-4 py-2 bg-action-blue hover:bg-action-blue/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                        Xác nhận thêm ({importPreview.length})
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                , document.body)}

            {selectedDetailUserId && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-2xl border border-platinum-tint shadow-sm-2 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-platinum-tint flex items-center justify-between bg-cloud-mist/50 sticky top-0 z-10">
                            <h3 className="font-bold text-midnight-indigo">Chi tiết thông tin nhân viên</h3>
                            <button
                                onClick={() => {
                                    setSelectedDetailUserId(null);
                                    setUserDetail(null);
                                }}
                                className="text-slate-blue hover:text-midnight-indigo"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {detailError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{detailError}</div>
                            )}

                            {loadingDetail ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-xs text-slate-blue font-medium">Đang tải thông tin chi tiết...</p>
                                </div>
                            ) : userDetail ? (
                                <>
                                    {/* Image area / Avatar */}
                                    <div className="flex justify-center">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border border-platinum-tint bg-gradient-to-tr from-action-blue to-glacier-blue text-white flex items-center justify-center font-extrabold text-4xl shadow-md">
                                            {userDetail.avatarUrl ? (
                                                <img src={userDetail.avatarUrl} alt={userDetail.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                (userDetail.fullName || userDetail.full_name || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="bg-cloud-mist/20 p-3 rounded-xl border border-platinum-tint/30">
                                            <span className="text-xs text-slate-blue block mb-0.5">Họ tên</span>
                                            <span className="font-semibold text-midnight-indigo">{userDetail.fullName || "Chưa thiết lập"}</span>
                                        </div>
                                        <div className="bg-cloud-mist/20 p-3 rounded-xl border border-platinum-tint/30">
                                            <span className="text-xs text-slate-blue block mb-0.5">Email</span>
                                            <span className="font-semibold text-midnight-indigo">{userDetail.email || "Chưa thiết lập"}</span>
                                        </div>
                                        <div className="bg-cloud-mist/20 p-3 rounded-xl border border-platinum-tint/30">
                                            <span className="text-xs text-slate-blue block mb-0.5">Mã nhân viên</span>
                                            <span className="font-semibold text-midnight-indigo">{userDetail.employeeCode || "Chưa thiết lập"}</span>
                                        </div>
                                        <div className="bg-cloud-mist/20 p-3 rounded-xl border border-platinum-tint/30">
                                            <span className="text-xs text-slate-blue block mb-0.5">Phòng ban</span>
                                            <span className="font-semibold text-midnight-indigo">
                                                {userDetail.department?.departmentName || "Chưa phân bổ"}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-xs text-slate-blue italic py-6">Không tìm thấy thông tin nhân viên này.</div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-platinum-tint bg-cloud-mist/30 flex justify-end sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDetailUserId(null);
                                    setUserDetail(null);
                                }}
                                className="px-4 py-2 bg-slate-blue/10 hover:bg-slate-blue/20 text-midnight-indigo rounded-xl text-xs font-bold transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BookMeeting;
