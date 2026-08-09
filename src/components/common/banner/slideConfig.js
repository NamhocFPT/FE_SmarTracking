/**
 * slideConfig.js — Cấu hình nội dung và màu sắc cho từng slide của DashboardBanner.
 *
 * ─── HƯỚNG DẪN THAY THẾ MÔ HÌNH 3D ────────────────────────────────────────
 * 1. Đặt file .glb vào thư mục:  public/models/
 * 2. Mở file scene tương ứng trong  src/components/common/banner/scenes/
 *    - Slide 0 (Camera AI)   →  TrackingScene.jsx
 *    - Slide 1 (ANPR)        →  FleetScene.jsx
 *    - Slide 2 (Phòng họp)   →  SecurityScene.jsx
 * 3. Làm theo hướng dẫn "SWAP TO GLB" trong file scene đó.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Video, Car, ShieldAlert } from 'lucide-react';

const SLIDES = [
    {
        id: 0,
        // ── Nội dung văn bản ──────────────────────────────────────────────
        tag: 'AI Security Monitoring',
        title: 'Giám Sát An Ninh Camera AI 24/7',
        description:
            'Camera AI giám sát toàn bộ khuôn viên theo thời gian thực, tự động nhận diện khuôn mặt và phát hiện xâm nhập bất thường để cảnh báo tức thời.',
        Icon: Video,

        // ── Màu sắc ───────────────────────────────────────────────────────
        accent: '#006BFF',       // màu highlight chính (rings, dots, pointLight)
        emissive: '#003380',     // màu phát sáng nội tại của mesh
        meshColor: '#0B2A50',    // màu bề mặt mesh

        // ── Style badge & background ──────────────────────────────────────
        badgeClass: 'bg-blue-500/20 text-blue-100 border-blue-400/30',
        bgFrom: '#02091c',
        bgTo: '#061535',
    },
    {
        id: 1,
        tag: 'Vehicle Access Control',
        title: 'Kiểm Soát Phương Tiện ANPR Thông Minh',
        description:
            'Camera ANPR tự động đọc biển số xe, đối chiếu danh sách kiểm soát và điều khiển barrier tức thì — không cần thao tác thủ công.',
        Icon: Car,

        accent: '#00D8FF',
        emissive: '#006688',
        meshColor: '#003A72',

        badgeClass: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/30',
        bgFrom: '#02111e',
        bgTo: '#03303d',
    },
    {
        id: 2,
        tag: 'Smart Meeting Room',
        title: 'Phòng Họp Thông Minh & Điểm Danh Tự Động',
        description:
            'Điểm danh qua nhận diện khuôn mặt, phát hiện no-show, tự động giải phóng phòng và gửi thông báo tức thì khi cuộc họp kết thúc.',
        Icon: ShieldAlert,

        accent: '#E55CFF',
        emissive: '#5a0099',
        meshColor: '#6218c4',

        badgeClass: 'bg-purple-500/20 text-purple-100 border-purple-400/30',
        bgFrom: '#0e0420',
        bgTo: '#220850',
    },
];

export default SLIDES;
