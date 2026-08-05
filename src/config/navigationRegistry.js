// Nguồn khai báo DUY NHẤT cho các mục navbar gắn với 1 permission.
// Khi ship 1 màn hình mới gắn permission, chỉ cần thêm 1 entry ở đây (+ requiredPermission
// tương ứng ở routers/index.js) — mọi role được cấp permission đó sẽ tự thấy mục nav
// và vào được route, không cần sửa layout.
//
// area: khớp với 1 trong 4 layout — 'system-admin' | 'manager' | 'bussiness-admin' | 'employee'
// permission: permissionCode hoặc mảng permissionCode (ANY-of)
// group: nếu có -> gộp vào dropdown "label lớn" cùng tên (nhiều entry cùng group => 1 dropdown).
//        nếu không có group -> hiện như mục nav phẳng.
//
// Ví dụ (không kích hoạt, chỉ minh hoạ):
// import { FileDown } from 'lucide-react';
// {
//     area: 'system-admin',
//     permission: 'ivss.export.read',
//     label: 'Xuất báo cáo camera',
//     to: '/system-admin/ivss-export',
//     icon: FileDown,
//     group: 'Hạ tầng & AI',
// },
export const NAVIGATION_REGISTRY = [];

// Metadata (icon) cho từng "label lớn" mới — chỉ cần khai khi group đó chưa tồn tại
// sẵn trong menu tĩnh của layout tương ứng.
export const GROUP_META = {};
