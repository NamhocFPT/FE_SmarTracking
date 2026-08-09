/**
 * DashboardBanner — SmarTracking 3D Interactive Slide Banner
 *
 * ─── CẤU TRÚC FILE ────────────────────────────────────────────────────────────
 *  src/components/common/
 *  ├── DashboardBanner.jsx          ← file này (layout + điều khiển slide)
 *  └── banner/
 *      ├── slideConfig.js           ← văn bản, màu sắc mỗi slide
 *      └── scenes/
 *          ├── TrackingScene.jsx    ← Slide 0: Camera AI
 *          ├── FleetScene.jsx       ← Slide 1: ANPR
 *          └── SecurityScene.jsx   ← Slide 2: Phòng họp
 *
 * ─── THAY THẾ MÔ HÌNH 3D ─────────────────────────────────────────────────────
 *  Mở file scene tương ứng trong banner/scenes/ và làm theo hướng dẫn
 *  "SWAP TO GLB MODEL" ở đầu mỗi file.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { MathUtils, Color } from 'three';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import SLIDES from './banner/slideConfig';
import TrackingScene  from './banner/scenes/TrackingScene';
import FleetScene     from './banner/scenes/FleetScene';
import SecurityScene  from './banner/scenes/SecurityScene';

// ─── Dynamic Point Light — lerp màu accent khi đổi slide ──────────────────────
const DynamicAccentLight = ({ targetHex }) => {
    const lightRef   = useRef();
    const colorRef   = useRef(new Color(targetHex));
    const targetRef  = useRef(new Color(targetHex));

    useEffect(() => { targetRef.current.set(targetHex); }, [targetHex]);

    useFrame(() => {
        colorRef.current.r = MathUtils.lerp(colorRef.current.r, targetRef.current.r, 0.04);
        colorRef.current.g = MathUtils.lerp(colorRef.current.g, targetRef.current.g, 0.04);
        colorRef.current.b = MathUtils.lerp(colorRef.current.b, targetRef.current.b, 0.04);
        if (lightRef.current) lightRef.current.color.copy(colorRef.current);
    });

    return <pointLight ref={lightRef} position={[3, 3, 3]} intensity={60} distance={14} color={targetHex} />;
};

// ─── Parallax Group — scene xoay nhẹ theo con trỏ chuột ──────────────────────
const ParallaxGroup = ({ children }) => {
    const groupRef = useRef();
    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, state.pointer.x * 0.28, 0.06);
        groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, -state.pointer.y * 0.18, 0.06);
    });
    return <group ref={groupRef}>{children}</group>;
};

// ─── GSAP scale-in khi slide thay đổi ────────────────────────────────────────
const AnimatedSceneWrapper = ({ slideIndex, children }) => {
    const groupRef = useRef();
    useEffect(() => {
        if (!groupRef.current) return;
        groupRef.current.scale.set(0.72, 0.72, 0.72);
        gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.85, ease: 'back.out(1.6)' });
    }, [slideIndex]);
    return <group ref={groupRef}>{children}</group>;
};

// ─── R3F Scene ────────────────────────────────────────────────────────────────
const Scene3D = ({ slideIndex }) => {
    const slide = SLIDES[slideIndex];
    return (
        <>
            <PerspectiveCamera makeDefault position={[0.6, 0, 5.2]} fov={54} />
            <ambientLight intensity={0.35} color="#c8d8ff" />
            <directionalLight position={[-4, 6, 3]} intensity={1.8} color="#476788" />
            <DynamicAccentLight targetHex={slide.accent} />
            <pointLight position={[0, -4, 2]} intensity={15} color="#1a0a3a" distance={10} />

            <ParallaxGroup>
                <AnimatedSceneWrapper slideIndex={slideIndex}>
                    {slideIndex === 0 && (
                        <TrackingScene
                            accentHex={slide.accent}
                            meshHex={slide.meshColor}
                            emissiveHex={slide.emissive}
                        />
                    )}
                    {slideIndex === 1 && (
                        <FleetScene
                            accentHex={slide.accent}
                            meshHex={slide.meshColor}
                            emissiveHex={slide.emissive}
                        />
                    )}
                    {slideIndex === 2 && (
                        <SecurityScene
                            accentHex={slide.accent}
                            meshHex={slide.meshColor}
                            emissiveHex={slide.emissive}
                        />
                    )}
                </AnimatedSceneWrapper>
            </ParallaxGroup>
        </>
    );
};

// ─── Content fade-in khi đổi slide ───────────────────────────────────────────
const useContentTransition = (slideIndex) => {
    const [animating, setAnimating] = useState(false);
    const prevIndex = useRef(slideIndex);
    useEffect(() => {
        if (prevIndex.current !== slideIndex) {
            setAnimating(true);
            const t = setTimeout(() => setAnimating(false), 500);
            prevIndex.current = slideIndex;
            return () => clearTimeout(t);
        }
    }, [slideIndex]);
    return animating;
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const DashboardBanner = ({ roleName = 'bạn' }) => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [paused, setPaused]         = useState(false);
    const [userName, setUserName]     = useState('');
    const contentAnimating = useContentTransition(slideIndex);
    const bgRef = useRef();

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('user') || 'null');
            if (stored?.fullName) setUserName(stored.fullName);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        const slide = SLIDES[slideIndex];
        if (!bgRef.current) return;
        gsap.to(bgRef.current, {
            background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`,
            duration: 1.0,
            ease: 'power2.inOut',
        });
    }, [slideIndex]);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 7000);
        return () => clearInterval(id);
    }, [paused]);

    const goTo = useCallback((idx) => {
        setSlideIndex(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
    }, []);

    const slide = SLIDES[slideIndex];
    const { Icon } = slide;

    return (
        <div
            className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl select-none"
            style={{ height: 320, background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)` }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div ref={bgRef} className="absolute inset-0" style={{ borderRadius: 'inherit' }} />

            {/* R3F Canvas — full-bleed, nhận mouse event cho parallax */}
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
                <Canvas
                    dpr={[1, 2]}
                    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                    style={{ background: 'transparent' }}
                >
                    <Suspense fallback={null}>
                        <Scene3D slideIndex={slideIndex} key={slideIndex} />
                    </Suspense>
                </Canvas>
            </div>

            {/* HTML overlay — pointer-events:none để canvas nhận mouse */}
            <div className="absolute inset-0 flex items-center" style={{ zIndex: 2, pointerEvents: 'none' }}>
                <div className="w-[55%] pl-8 pr-4 py-8 flex flex-col justify-between h-full">

                    <div className={`space-y-3 transition-all duration-500 ${contentAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
                            <span className="text-white font-bold text-base truncate">
                                Xin chào, {userName || roleName}!
                            </span>
                        </div>

                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider backdrop-blur-md ${slide.badgeClass}`}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            {slide.tag}
                        </span>

                        <h2
                            className="text-white font-extrabold text-xl md:text-2xl leading-tight tracking-tight"
                            style={{ textShadow: `0 0 30px ${slide.accent}55` }}
                        >
                            {slide.title}
                        </h2>

                        <p className="text-white/75 text-sm leading-relaxed line-clamp-2 max-w-sm">
                            {slide.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2" style={{ pointerEvents: 'auto' }}>
                        <button
                            onClick={() => goTo(slideIndex - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>

                        <div className="flex items-center gap-2">
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                                        i === slideIndex
                                            ? 'w-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                                            : 'w-2 bg-white/30 hover:bg-white/55'
                                    }`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => goTo(slideIndex + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>

                        <div className="flex-1 h-0.5 bg-white/15 rounded-full overflow-hidden ml-1">
                            <div
                                key={`${slideIndex}-${paused}`}
                                className="h-full rounded-full bg-white/60"
                                style={{ animation: paused ? 'none' : 'banner-progress 7s linear forwards' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 h-full" />
            </div>

            <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ width: '62%', background: 'linear-gradient(to right, rgba(0,0,0,0.38) 0%, transparent 100%)', zIndex: 3 }} />

            <div className="absolute pointer-events-none" style={{ top: -60, left: -60, width: 240, height: 240, borderRadius: '50%', opacity: 0.12, background: slide.accent, filter: 'blur(60px)', zIndex: 0, transition: 'background 1s ease' }} />
            <div className="absolute pointer-events-none" style={{ bottom: -40, right: 200, width: 180, height: 180, borderRadius: '50%', opacity: 0.08, background: slide.accent, filter: 'blur(50px)', zIndex: 0, transition: 'background 1s ease' }} />

            <style>{`
                @keyframes banner-progress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default DashboardBanner;
