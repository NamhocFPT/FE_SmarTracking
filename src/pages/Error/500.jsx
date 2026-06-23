import React from "react";
import { Link } from "react-router-dom";

export const Error500 = () => {
    return (
        <main className="flex flex-col min-h-screen items-center justify-center relative bg-[#f6faff] overflow-hidden py-12 px-6">
            {/* Ambient background glows */}
            <div className="absolute right-[-10%] top-[-10%] w-[350px] h-[350px] blur-[80px] rounded-full bg-[#8247f5] opacity-10 pointer-events-none" />
            <div className="absolute left-[-10%] bottom-[-10%] w-[450px] h-[450px] blur-[100px] rounded-full bg-[#0099ff] opacity-10 pointer-events-none" />

            <div className="flex flex-col items-center text-center max-w-md w-full bg-white px-8 py-12 rounded-3xl border border-solid border-[#e6eff8] shadow-[0px_10px_30px_#0000000d] z-10">
                {/* SVG Illustration with spinning gears */}
                <div className="relative mb-8 w-44 h-44 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-2 border-dashed border-[#e6eff8] animate-[spin_55s_linear_infinite]" />
                    <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#0099ff]/10 animate-[spin_35s_linear_infinite_reverse]" />
                    
                    {/* Server/Database SVG icon & 500 Text */}
                    <div className="flex flex-col items-center justify-center z-10">
                        <svg className="w-12 h-12 text-[#8247f5] mb-2 animate-[pulse_2.5s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <span className="text-5xl font-bold [font-family:'Montserrat-Bold',Helvetica] tracking-tighter bg-gradient-to-r from-[#8247f5] via-[#0099ff] to-[#e55cff] bg-clip-text text-transparent select-none">
                            500
                        </span>
                    </div>
                </div>

                <h1 className="[font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-[#0B3558] text-2xl md:text-3xl tracking-tight mb-3">
                    Lỗi kết nối hệ thống
                </h1>
                
                <p className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#476788] text-sm md:text-base leading-relaxed mb-8">
                    Máy chủ gặp sự cố kỹ thuật hoặc đang được bảo trì định kỳ. Vui lòng quay lại sau ít phút hoặc thử tải lại trang.
                </p>

                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 w-full bg-[#006BFF] hover:bg-[#0054cc] active:scale-[0.98] text-white rounded-lg [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-sm transition-all shadow-[0px_4px_12px_rgba(0,107,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#006BFF] focus:ring-offset-2"
                >
                    <svg className="w-4 h-4 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Quay lại trang chủ
                </Link>
            </div>
        </main>
    );
};

export default Error500;
