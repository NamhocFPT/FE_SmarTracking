import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Video, ShieldAlert, Cpu } from 'lucide-react';

const DashboardBanner = ({ roleName = 'Admin' }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const slides = [
        {
            tag: 'Real-time Presence Tracking',
            title: 'Hệ thống Ghi Nhận Hiện Diện Thông Minh',
            description: 'Giám sát không gian phòng họp bằng Camera AI & Cảm biến chuyển động. Tự động nhận diện khuôn mặt và đếm số người tham gia để điểm danh chính xác mà không cần thẻ hay vân tay.',
            badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
            gradient: 'from-midnight-indigo via-[#152a55] to-emerald-950',
            icon: <Video className="w-5 h-5 text-emerald-400" />,
            interactiveElement: (
                <div className="relative w-48 h-36 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden flex items-center justify-center group cursor-pointer">
                    {/* Simulated Room Grid */}
                    <div className="grid grid-cols-4 gap-3 p-4 w-full h-full relative">
                        {Array.from({ length: 8 }).map((_, i) => {
                            const active = [1, 3, 4, 6].includes(i);
                            return (
                                <motion.div
                                    key={i}
                                    className={`relative rounded-lg flex items-center justify-center border transition-all ${
                                        active 
                                            ? 'bg-emerald-500/20 border-emerald-500/40' 
                                            : 'bg-white/5 border-white/5'
                                    }`}
                                    whileHover={{ scale: 1.15, backgroundColor: 'rgba(16, 185, 129, 0.4)' }}
                                >
                                    {active ? (
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                    {/* Overlay Scanning Animation */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce pointer-events-none" />
                </div>
            )
        },
        {
            tag: 'Automated Optimization',
            title: 'Giải Phóng Phòng Trực Quan (No-Show)',
            description: 'Tối ưu hóa tài nguyên phòng họp. Nếu không phát hiện hiện diện sau 10 phút so với lịch trình, hệ thống sẽ tự động hủy lịch giữ phòng và gửi thông báo giải phóng không gian.',
            badgeColor: 'bg-sunset-gold/25 text-amber-300 border-sunset-gold/40',
            gradient: 'from-[#1a1c3d] via-[#232042] to-amber-950',
            icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
            interactiveElement: (
                <div className="relative w-48 h-36 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-3 cursor-pointer select-none">
                    <motion.div 
                        className="text-center space-y-1.5"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80 block">Trạng thái giải phóng</span>
                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-mono text-sm text-white font-bold">09:59s</span>
                        </div>
                        <span className="text-[9px] text-white/50 block">Nhấp/Di chuột để xem cảnh báo</span>
                    </motion.div>
                    {/* Progress Bar Animation */}
                    <div className="absolute bottom-0 left-0 w-full bg-white/10 h-1.5">
                        <motion.div 
                            className="bg-amber-500 h-full" 
                            animate={{ width: ['0%', '100%'] }} 
                            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                        />
                    </div>
                </div>
            )
        },
        {
            tag: 'Data-driven Analytics',
            title: 'Báo Cáo & Phân Tích Thông Minh',
            description: 'Theo dõi chi tiết tỷ lệ lấp đầy phòng, thời gian họp trung bình và kỷ luật đúng giờ của toàn thể nhân sự. Xuất file báo cáo dễ dàng hỗ trợ nhà quản lý đưa ra quyết định tối ưu.',
            badgeColor: 'bg-sky-500/25 text-sky-300 border-sky-500/40',
            gradient: 'from-[#0b172a] via-[#10203a] to-blue-950',
            icon: <Cpu className="w-5 h-5 text-sky-400" />,
            interactiveElement: (
                <div className="relative w-48 h-36 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden flex items-center justify-center p-3 cursor-pointer">
                    {/* Mini Dynamic Graph */}
                    <div className="w-full h-full flex items-end justify-between gap-1 pt-6">
                        {[40, 70, 55, 90, 65, 80].map((h, i) => (
                            <motion.div
                                key={i}
                                className="w-full bg-gradient-to-t from-action-blue/70 to-sky-400 rounded-t-sm"
                                style={{ height: `${h}%` }}
                                whileHover={{ height: '98%', backgroundColor: '#00D1FF' }}
                                transition={{ type: 'spring', stiffness: 150 }}
                            />
                        ))}
                    </div>
                    {/* Floating target metric */}
                    <div className="absolute top-2 right-2 bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 rounded text-[9px] font-bold text-sky-300">
                        +18.5%
                    </div>
                </div>
            )
        }
    ];

    // Auto-advance slides unless hovered
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 6500);
        return () => clearInterval(interval);
    }, [isHovered, slides.length]);

    const activeSlide = slides[currentSlide];

    return (
        <div 
            className="relative overflow-hidden rounded-2xl shadow-lg border border-white/5 transition-all duration-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Dynamic Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${activeSlide.gradient} transition-all duration-700 ease-in-out`} />
            
            {/* Ambient glowing circles */}
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-action-blue/15 blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-royal-amethyst/15 blur-3xl" />

            <div className="relative z-10 p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 min-h-[220px]">
                {/* Left Side: Copy/Content */}
                <div className="flex-1 space-y-4 max-w-xl text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-sm text-sky-200 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                            Xin chào, {roleName}!
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${activeSlide.badgeColor} uppercase tracking-wider`}>
                            {activeSlide.icon}
                            {activeSlide.tag}
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                        >
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                                {activeSlide.title}
                            </h2>
                            <p className="text-white/80 text-sm leading-relaxed font-medium">
                                {activeSlide.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Interactive Hover Demo Element */}
                <div className="flex-shrink-0 relative group select-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeSlide.interactiveElement}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls / Indicators */}
            <div className="absolute bottom-4 left-6 md:left-8 z-20 flex items-center gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            currentSlide === index 
                                ? 'w-6 bg-white' 
                                : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardBanner;
