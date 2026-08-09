/**
 * slideConfig.js — Cấu hình nội dung, màu sắc và ảnh cho từng slide.
 *
 * ─── THÊM / CHỈNH SLIDE ──────────────────────────────────────────────────────
 *  Chỉnh mảng SLIDES bên dưới. Banner tự nhận số lượng slide.
 *
 * ─── LOẠI SLIDE ──────────────────────────────────────────────────────────────
 *  fullImage: true  → ảnh phủ toàn bộ banner, không hiện text
 *  fullImage: false → ảnh bên phải, text bên trái (mặc định)
 *
 * ─── THAY ẢNH ────────────────────────────────────────────────────────────────
 *  Đặt file ảnh vào: public/images/banner/
 *  Cập nhật trường `image` bên dưới.
 *  blendMode: 'multiply' → ảnh nền TRẮNG  | 'screen' → nền ĐEN | 'normal' → giữ nguyên
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { MapPin, Car, ShieldCheck } from 'lucide-react';

const SLIDES = [
    {
        id: 0,
        // ── Lưu ảnh SmarTracking brand tại: public/images/banner/brand-hero.png ──
        image: '/images/banner/brand-hero.png',
        fullImage: true,   // ← phủ toàn banner, không hiện text
        accent: '#3A8DFF',
        bgFrom: '#020b1e',
        bgTo: '#04183d',
    },
    {
        id: 1,
        // ── Lưu ảnh terrain GPS map tại: public/images/banner/tracking-map.png ──
        image: '/images/banner/tracking-map.png',
        fullImage: false,
        blendMode: 'normal',

        tag: 'GPS Real-time Tracking',
        title: 'Giám Sát & Theo Dõi Thực Địa GPS',
        description:
            'Theo dõi vị trí phương tiện và nhân sự theo thời gian thực trên bản đồ số hóa — tự động cảnh báo khi ra ngoài vùng cho phép.',
        Icon: MapPin,
        accent: '#00AAFF',
        badgeClass: 'bg-blue-500/20 text-blue-100 border-blue-400/30',
        bgFrom: '#010c1f',
        bgTo: '#03214d',
    },
    {
        id: 2,
        // ── Lưu ảnh fleet analytics tại: public/images/banner/fleet-analytics.png ──
        image: '/images/banner/fleet-analytics.png',
        fullImage: false,
        blendMode: 'screen',

        tag: 'Vehicle Access Control',
        title: 'Kiểm Soát Phương Tiện ANPR Thông Minh',
        description:
            'Camera ANPR tự động đọc biển số xe, đối chiếu danh sách kiểm soát và điều khiển barrier tức thì — không cần thao tác thủ công.',
        Icon: Car,
        accent: '#7B5FFF',
        badgeClass: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/30',
        bgFrom: '#080220',
        bgTo: '#120845',
    },
    {
        id: 3,
        // ── Lưu ảnh security shield tại: public/images/banner/security-shield.png ──
        image: '/images/banner/security-shield.png',
        fullImage: false,
        blendMode: 'screen',

        tag: 'Smart Security',
        title: 'An Ninh Thông Minh & Bảo Vệ Tài Sản',
        description:
            'Hệ thống an ninh AI giám sát 24/7, phát hiện xâm nhập và nhận diện phương tiện trái phép — phản ứng tức thì, không bỏ sót.',
        Icon: ShieldCheck,
        accent: '#CC44FF',
        badgeClass: 'bg-purple-500/20 text-purple-100 border-purple-400/30',
        bgFrom: '#0d0118',
        bgTo: '#1f0040',
    },
];

export default SLIDES;
