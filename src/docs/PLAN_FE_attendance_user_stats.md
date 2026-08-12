# FE Plan — Phân tích Tỷ lệ Đúng giờ theo Role

**File chính:** `src/pages/shared/EmployeeOnTimeAnalytics.jsx`  
**Ngày:** 2026-08-12  
**Prerequisite:** BE phải hoàn thành `GET /api/v1/analytics/attendance/on-time-rate/users` trước khi implement FE

---

## 1. Tổng quan thay đổi

| Role | Hiện tại | Sau khi implement |
|---|---|---|
| `MANAGER` | Bảng `lateByDepartment` lọc theo 1 phòng | Bảng per-user (thành viên phòng ban), có avatar + phân trang |
| `BUSINESS_ADMIN` | Bảng `lateByDepartment` tất cả phòng | Giữ nguyên + thêm nút **(i)** → modal nhân sự phòng đó, có avatar + phân trang |
| `SYSTEM_ADMIN` | Như Business Admin | Như Business Admin (áp dụng cùng thay đổi) |

---

## 2. Service Layer

**File:** `src/service/sysAdminServices.js`

Thêm hàm mới — **không sửa** hàm `getAttendanceAnalytics` hiện có:

```js
/**
 * UC-150-ext: Danh sách nhân sự kèm thống kê đúng giờ/muộn/vắng.
 * Dùng cho Manager view (per-user trong phòng ban) và Business Admin modal.
 * BE endpoint: GET /analytics/attendance/on-time-rate/users
 * @param {object} params - { preset, from, to, departmentId, page, limit, sortBy }
 * @returns {Promise} { items[], total, page, limit, totalPages }
 */
export const getAttendanceUserStats = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/attendance/on-time-rate/users${query}`);
};
```

---

## 3. State mới trong `EmployeeOnTimeAnalytics`

### 3.1 Manager — bảng nhân sự

```js
// Danh sách thành viên phòng ban (Manager view)
const [memberStats, setMemberStats]           = useState([]);
const [memberPage, setMemberPage]             = useState(1);
const [memberTotalPages, setMemberTotalPages] = useState(1);
const [memberTotal, setMemberTotal]           = useState(0);
const [memberLoading, setMemberLoading]       = useState(false);
```

### 3.2 Business Admin — modal nhân sự phòng ban

```js
// Modal chi tiết nhân sự theo phòng ban (Business Admin view)
const [modalDept, setModalDept]               = useState(null); // object dept | null
const [modalMembers, setModalMembers]         = useState([]);
const [modalPage, setModalPage]               = useState(1);
const [modalTotalPages, setModalTotalPages]   = useState(1);
const [modalTotal, setModalTotal]             = useState(0);
const [modalLoading, setModalLoading]         = useState(false);
```

---

## 4. Logic fetch

### 4.1 Manager — fetch danh sách thành viên

```js
const fetchMemberStats = useCallback(async () => {
    if (!managerDeptId) return;
    setMemberLoading(true);
    try {
        const res = await getAttendanceUserStats({
            departmentId: managerDeptId,
            preset,
            ...(preset === 'custom' && { from, to }),
            page: memberPage,
            limit: 10,
        });
        if (res?.success) {
            setMemberStats(res.data?.items || []);
            setMemberTotalPages(res.data?.totalPages || 1);
            setMemberTotal(res.data?.total || 0);
        }
    } catch (err) {
        console.error('Failed to load member stats', err);
        setMemberStats([]);
    } finally {
        setMemberLoading(false);
    }
}, [managerDeptId, preset, from, to, memberPage]);

useEffect(() => {
    if (isManager) fetchMemberStats();
}, [isManager, fetchMemberStats]);

// Reset về trang 1 khi đổi bộ lọc thời gian
useEffect(() => {
    setMemberPage(1);
}, [preset, from, to]);
```

### 4.2 Business Admin — fetch khi mở modal

```js
const fetchModalMembers = useCallback(async () => {
    if (!modalDept) return;
    setModalLoading(true);
    try {
        const res = await getAttendanceUserStats({
            departmentId: modalDept.departmentId,
            preset,
            ...(preset === 'custom' && { from, to }),
            page: modalPage,
            limit: 10,
        });
        if (res?.success) {
            setModalMembers(res.data?.items || []);
            setModalTotalPages(res.data?.totalPages || 1);
            setModalTotal(res.data?.total || 0);
        }
    } catch (err) {
        console.error('Failed to load modal members', err);
        setModalMembers([]);
    } finally {
        setModalLoading(false);
    }
}, [modalDept, preset, from, to, modalPage]);

useEffect(() => {
    if (modalDept) fetchModalMembers();
}, [fetchModalMembers]);

// Reset về trang 1 khi mở modal phòng ban khác
const handleOpenDeptModal = (dept) => {
    setModalDept(dept);
    setModalPage(1);
};

const handleCloseModal = () => {
    setModalDept(null);
    setModalMembers([]);
    setModalPage(1);
};
```

---

## 5. Avatar Component (inline helper)

Dùng chung cho cả Manager view và Business Admin modal:

```jsx
const UserAvatar = ({ avatarUrl, fullName, size = 32 }) => {
    const initials = (fullName || '?')
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map(w => w[0].toUpperCase())
        .join('');

    // Màu nền từ hash tên — cố định, không random mỗi render
    const colors = ['#4361EE','#7C3AED','#DB2777','#D97706','#15803D','#0284C7'];
    const colorIndex = fullName
        ? fullName.charCodeAt(0) % colors.length
        : 0;

    return avatarUrl ? (
        <img
            src={avatarUrl}
            alt={fullName}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { e.target.style.display = 'none'; }}
        />
    ) : (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: colors[colorIndex],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: size * 0.35, fontWeight: 800, flexShrink: 0,
        }}>
            {initials}
        </div>
    );
};
```

---

## 6. Pagination Component (inline helper)

Dùng chung cho bảng Manager và modal Business Admin:

```jsx
const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        if (totalPages <= 5) return i + 1;
        if (page <= 3) return i + 1;
        if (page >= totalPages - 2) return totalPages - 4 + i;
        return page - 2 + i;
    });

    return (
        <div className="flex items-center justify-end gap-1 pt-3 border-t border-platinum-tint">
            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="px-2 py-1 text-xs border border-platinum-tint rounded-lg disabled:opacity-40 hover:bg-cloud-mist text-slate-blue"
            >‹</button>
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        p === page
                            ? 'bg-action-blue text-white border-action-blue'
                            : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                    }`}
                >{p}</button>
            ))}
            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-2 py-1 text-xs border border-platinum-tint rounded-lg disabled:opacity-40 hover:bg-cloud-mist text-slate-blue"
            >›</button>
        </div>
    );
};
```

---

## 7. UI — Bảng Manager (thay thế bảng lateByDepartment)

**Tiêu đề bảng:** `"Tỷ lệ đi muộn theo thành viên"`

**Cột:**

| Cột | Nguồn | Ghi chú |
|---|---|---|
| Thành viên | `avatarUrl` + `fullName` + `employeeCode` | Avatar circle + tên in đậm + mã nhỏ muted. Click tên → `handleUserClick` |
| Email | `email` | font-mono, muted, ẩn trên mobile |
| Tổng lượt | `totalRequired` | tabular-nums, căn phải |
| Lượt đi muộn | `lateCount` | Amber nếu > 0, green nếu = 0 |
| Tỷ lệ đi muộn | `lateRate`% | Red > 15%, amber > 0%, green = 0% |

**Dưới bảng:** `Pagination` component, `memberTotal` nhân sự · Trang `memberPage`/`memberTotalPages`

---

## 8. UI — Bảng Business Admin (giữ nguyên + thêm cột (i))

Thêm cột cuối vào bảng `lateByDepartment` hiện có:

```jsx
// Trong thead, thêm:
<th className="px-4 py-3 text-[10px] font-bold text-slate-blue uppercase tracking-wider text-center w-10">
    Chi tiết
</th>

// Trong tbody row, thêm:
<td className="px-4 py-3 text-center">
    <button
        onClick={() => handleOpenDeptModal(dept)}
        title={`Xem nhân sự đi muộn — ${dept.departmentName}`}
        className="w-6 h-6 rounded-full border border-platinum-tint text-action-blue text-[11px] font-bold hover:bg-action-blue hover:text-white transition-colors inline-flex items-center justify-center"
    >
        i
    </button>
</td>
```

---

## 9. UI — Modal Business Admin (portal)

Render qua `ReactDOM.createPortal(modalContent, document.body)`.

**Cấu trúc:**

```
Overlay (fixed inset-0, bg-slate-950/60, backdrop-blur-sm, z-[9998])
└── Modal container (max-w-2xl, max-h-[85vh], flex-col)
    ├── Header: icon Building + tên phòng ban + tổng nhân sự + nút ✕
    ├── Body (overflow-y-auto)
    │   └── Danh sách rows (mỗi row: UserAvatar + info + stats)
    └── Footer: Pagination + "X / Y nhân sự"
```

**Mỗi row trong modal:**

```jsx
<div
    key={member.userId}
    onClick={() => { handleCloseModal(); handleUserClick({ userId: member.userId, fullName: member.fullName }); }}
    className="flex items-center gap-3 p-3 hover:bg-cloud-mist/50 cursor-pointer rounded-xl transition-colors"
>
    <UserAvatar avatarUrl={member.avatarUrl} fullName={member.fullName} size={36} />
    <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-midnight-indigo truncate">{member.fullName}</p>
        <p className="text-[10px] text-slate-blue font-mono truncate">
            {member.email} {member.employeeCode ? `· ${member.employeeCode}` : ''}
        </p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            member.lateCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
            {member.lateCount} lần muộn
        </span>
        <span className={`text-[11px] font-black ${
            member.lateRate > 15 ? 'text-red-500' : member.lateRate > 0 ? 'text-amber-500' : 'text-emerald-600'
        }`}>
            {member.lateRate}%
        </span>
    </div>
</div>
```

**Lock scroll body khi modal mở:**

```js
useEffect(() => {
    if (modalDept) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
}, [modalDept]);
```

---

## 10. Checklist FE

> **Chú ý:** Chỉ implement sau khi BE confirm endpoint đã hoạt động và response trả đúng schema trong `PLAN_BE_attendance_user_stats.md`

### Service
- [ ] Thêm `getAttendanceUserStats` vào `src/service/sysAdminServices.js`

### Component helpers
- [ ] Viết `UserAvatar` component (inline trong file, hoặc tách `src/components/common/UserAvatar.jsx`)
- [ ] Viết `Pagination` component (inline trong file, hoặc tách `src/components/common/Pagination.jsx`)

### Manager view
- [ ] Thêm state: `memberStats`, `memberPage`, `memberTotalPages`, `memberTotal`, `memberLoading`
- [ ] Viết `fetchMemberStats` + `useEffect` trigger
- [ ] Reset `memberPage = 1` khi đổi `preset` / `from` / `to`
- [ ] Thay bảng `lateByDepartment` bằng bảng per-user khi `isManager === true`
- [ ] Cột avatar: hiển thị ảnh hoặc initials circle
- [ ] Cột email: ẩn trên `sm` breakpoint
- [ ] Click tên → `handleUserClick` (modal late history hiện có)
- [ ] Pagination dưới bảng

### Business Admin view
- [ ] Thêm state: `modalDept`, `modalMembers`, `modalPage`, `modalTotalPages`, `modalTotal`, `modalLoading`
- [ ] Thêm cột nút (i) vào bảng `lateByDepartment` hiện có
- [ ] Viết `handleOpenDeptModal` và `handleCloseModal`
- [ ] Viết `fetchModalMembers` + `useEffect` trigger
- [ ] Reset `modalPage = 1` khi mở modal phòng ban khác
- [ ] Render modal qua `ReactDOM.createPortal`
- [ ] Modal header: tên phòng ban + tổng nhân sự + nút ✕
- [ ] Modal body: danh sách rows với `UserAvatar` + info + stats
- [ ] Click row → `handleCloseModal()` rồi `handleUserClick()`
- [ ] Modal footer: `Pagination` + label "X / Y nhân sự"
- [ ] Lock `document.body.style.overflow` khi modal mở
- [ ] Close khi click overlay
