import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Sparkles, Video, ShieldAlert, Cpu, Car, CheckCircle, Wifi } from 'lucide-react';

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        rotateY: direction > 0 ? 45 : -45,
        scale: 0.8,
        z: -200
    }),
    center: {
        x: 0,
        opacity: 1,
        rotateY: 0,
        scale: 1,
        z: 0,
        transition: {
            type: 'spring',
            stiffness: 250,
            damping: 25,
            mass: 0.5
        }
    },
    exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        rotateY: direction < 0 ? 45 : -45,
        scale: 0.8,
        z: -200,
        transition: {
            type: 'spring',
            stiffness: 250,
            damping: 25,
            mass: 0.5
        }
    })
};

const TiltCard = ({ children, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative ${className}`}
        >
            <div style={{ transform: "translateZ(30px)" }} className="w-full h-full">
                {children}
            </div>
        </motion.div>
    );
};

const DashboardBanner = ({ roleName = 'Admin' }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isHovered, setIsHovered] = useState(false);

    const slides = [
        {
            tag: 'AI Security Monitoring',
            title: 'Giám Sát An Ninh Camera AI 24/7',
            description: 'Camera AI giám sát toàn bộ khuôn viên theo thời gian thực, tự động nhận diện khuôn mặt và phát hiện xâm nhập bất thường để cảnh báo tức thời cho đội an ninh.',
            badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
            gradient: 'from-midnight-indigo via-[#152a55] to-emerald-950',
            icon: <Video className="w-5 h-5 text-emerald-400 drop-shadow-md" />,
            interactiveElement: (
                <TiltCard className="w-56 h-40 border border-white/20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl flex items-center justify-center cursor-pointer">
                    <div className="grid grid-cols-4 gap-2.5 p-4 w-full h-full relative">
                        {Array.from({ length: 8 }).map((_, i) => {
                            const active = [1, 3, 4, 6].includes(i);
                            return (
                                <motion.div
                                    key={i}
                                    className={`relative rounded-xl flex items-center justify-center border transition-all ${
                                        active 
                                            ? 'bg-emerald-500/30 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                            : 'bg-white/5 border-white/10'
                                    }`}
                                    whileHover={{ scale: 1.15, z: 20 }}
                                    style={{ transform: "translateZ(10px)" }}
                                >
                                    {active ? (
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                        </span>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                    {/* Overlay Scanning Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_10px_#34d399] blur-[1px]" style={{ transform: "translateZ(20px)" }} />
                </TiltCard>
            )
        },
        {
            tag: 'Vehicle Access Control',
            title: 'Kiểm Soát Ra Vào Bằng Nhận Diện Biển Số (ANPR)',
            description: 'Camera ANPR tự động đọc biển số xe ra/vào cổng, đối chiếu danh sách kiểm soát và tự động mở barrier — không cần bảo vệ kiểm tra thủ công từng lượt xe.',
            badgeColor: 'bg-royal-amethyst/25 text-purple-200 border-royal-amethyst/40',
            gradient: 'from-[#1c1440] via-[#2a1a52] to-purple-950',
            icon: <Car className="w-5 h-5 text-purple-300 drop-shadow-md" />,
            interactiveElement: (
                <TiltCard className="w-56 h-40 border border-white/20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center gap-4 p-4 cursor-pointer select-none">
                    {/* Gate barrier */}
                    <div className="relative w-full h-8 flex items-center justify-start" style={{ transform: "translateZ(15px)" }}>
                        <div className="absolute left-1 w-2 h-9 bg-white/20 rounded-sm" />
                        <motion.div
                            className="absolute left-2 w-24 h-1.5 rounded-full origin-left bg-gradient-to-r from-red-400 via-white to-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                            animate={{ rotate: [0, 0, -65, -65, 0] }}
                            transition={{ duration: 5, repeat: Infinity, times: [0, 0.15, 0.35, 0.75, 1], ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute left-16 w-5 h-3 rounded-sm bg-white/70"
                            animate={{ x: [0, 90, 90, 0], opacity: [1, 1, 0, 0] }}
                            transition={{ duration: 5, repeat: Infinity, times: [0, 0.3, 0.5, 1], ease: 'easeInOut' }}
                        />
                    </div>
                    {/* Plate recognition reveal */}
                    <motion.div
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-lg"
                        style={{ transform: "translateZ(25px)" }}
                        animate={{ opacity: [0, 0, 1, 1, 0], y: [8, 8, 0, 0, 8] }}
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.35, 0.5, 0.85, 1] }}
                    >
                        <span className="text-sm font-black text-blue-950 tracking-wider font-mono">30A-123.45</span>
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    </motion.div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200/80">Đã nhận diện — Cho phép qua</span>
                </TiltCard>
            )
        },
        {
            tag: 'Automated Optimization',
            title: 'Giải Phóng Phòng Trực Quan (No-Show)',
            description: 'Tối ưu hóa tài nguyên phòng họp. Nếu không phát hiện hiện diện sau 10 phút so với lịch trình, hệ thống sẽ tự động hủy lịch giữ phòng và gửi thông báo giải phóng không gian.',
            badgeColor: 'bg-sunset-gold/25 text-amber-300 border-sunset-gold/40',
            gradient: 'from-[#1a1c3d] via-[#232042] to-amber-950',
            icon: <ShieldAlert className="w-5 h-5 text-amber-400 drop-shadow-md" />,
            interactiveElement: (
                <TiltCard className="w-56 h-40 border border-white/20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center p-4 cursor-pointer select-none">
                    <motion.div 
                        className="text-center space-y-2 w-full"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300/90 block">Trạng thái giải phóng</span>
                        <div className="flex items-center justify-center gap-2 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 shadow-inner">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                            <span className="font-mono text-base text-white font-bold tracking-wider">09:59s</span>
                        </div>
                    </motion.div>
                    {/* Progress Bar Animation */}
                    <div className="absolute bottom-0 left-0 w-full bg-white/10 h-1.5" style={{ transform: "translateZ(5px)" }}>
                        <motion.div 
                            className="bg-amber-500 h-full shadow-[0_0_10px_#f59e0b]" 
                            animate={{ width: ['0%', '100%'] }} 
                            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                        />
                    </div>
                </TiltCard>
            )
        },
        {
            tag: 'IoT Device Health',
            title: 'Giám Sát Thiết Bị IoT Toàn Khuôn Viên',
            description: 'Theo dõi tình trạng hoạt động của toàn bộ camera, cảm biến và thiết bị IoT theo thời gian thực trên một sơ đồ mạng lưới duy nhất — phát hiện mất kết nối ngay lập tức.',
            badgeColor: 'bg-sky-500/25 text-sky-300 border-sky-500/40',
            gradient: 'from-[#0b172a] via-[#10203a] to-blue-950',
            icon: <Cpu className="w-5 h-5 text-sky-400 drop-shadow-md" />,
            interactiveElement: (
                <TiltCard className="w-56 h-40 border border-white/20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl flex items-center justify-center cursor-pointer">
                    <div className="relative w-full h-full" style={{ transform: "translateZ(20px)" }}>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 224 160">
                            <line x1="112" y1="80" x2="40" y2="24" stroke="rgba(125,211,252,0.35)" strokeWidth="1.5" />
                            <line x1="112" y1="80" x2="184" y2="24" stroke="rgba(125,211,252,0.35)" strokeWidth="1.5" />
                            <line x1="112" y1="80" x2="34" y2="132" stroke="rgba(125,211,252,0.35)" strokeWidth="1.5" />
                            <line x1="112" y1="80" x2="188" y2="128" stroke="rgba(125,211,252,0.35)" strokeWidth="1.5" />
                        </svg>

                        {/* Center hub */}
                        <div
                            className="absolute w-11 h-11 rounded-full bg-sky-500/30 border border-sky-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)]"
                            style={{ top: 80, left: 112, transform: 'translate(-50%, -50%)' }}
                        >
                            <Wifi className="w-5 h-5 text-sky-200" />
                        </div>

                        {/* Orbiting devices */}
                        {[
                            { top: 24, left: 40, status: 'online' },
                            { top: 24, left: 184, status: 'online' },
                            { top: 132, left: 34, status: 'offline' },
                            { top: 128, left: 188, status: 'online' },
                        ].map((d, i) => (
                            <div
                                key={i}
                                className="absolute w-6 h-6 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center"
                                style={{ top: d.top, left: d.left, transform: 'translate(-50%, -50%)' }}
                            >
                                {d.status === 'online' ? (
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                    </span>
                                ) : (
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                                )}
                            </div>
                        ))}
                    </div>
                </TiltCard>
            )
        }
    ];

    const currentSlide = Math.abs(page % slides.length);
    const activeSlide = slides[currentSlide];

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    // Auto-advance
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            paginate(1);
        }, 7000);
        return () => clearInterval(interval);
    }, [isHovered, page]);

    return (
        <div 
            className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 transition-all duration-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ perspective: 1200 }}
        >
            {/* Dynamic Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${activeSlide.gradient} transition-all duration-1000 ease-in-out`} />
            
            {/* Ambient glowing circles with 3D feel */}
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-action-blue/20 blur-3xl mix-blend-screen" style={{ transform: "translateZ(-100px)" }} />
            <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-royal-amethyst/20 blur-3xl mix-blend-screen" style={{ transform: "translateZ(-50px)" }} />

            <div className="relative z-10 p-6 md:p-10 text-white min-h-[260px] flex items-center">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full flex flex-col md:flex-row items-center justify-between gap-10"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* Left Side: Copy/Content */}
                        <div className="flex-1 space-y-5 max-w-2xl text-center md:text-left" style={{ transform: "translateZ(30px)" }}>
                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-sky-100 border border-white/20 shadow-lg">
                                    <Sparkles className="w-4 h-4 animate-pulse text-amber-300 drop-shadow-md" />
                                    Xin chào, {roleName}!
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold border ${activeSlide.badgeColor} uppercase tracking-wider shadow-lg backdrop-blur-md`}>
                                    {activeSlide.icon}
                                    {activeSlide.tag}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-50 to-white/70 drop-shadow-sm">
                                    {activeSlide.title}
                                </h2>
                                <p className="text-white/85 text-sm md:text-base leading-relaxed font-medium max-w-xl">
                                    {activeSlide.description}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Interactive Hover Demo Element */}
                        <div className="flex-shrink-0 relative group select-none hidden md:block">
                            {activeSlide.interactiveElement}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Controls / Indicators */}
            <div className="absolute bottom-5 left-6 md:left-10 z-20 flex items-center gap-2.5">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            const newDirection = index > currentSlide ? 1 : -1;
                            setPage([page + (index - currentSlide), newDirection]);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm ${
                            currentSlide === index 
                                ? 'w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                                : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardBanner;
