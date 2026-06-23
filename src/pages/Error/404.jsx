import React from "react";
import { Link } from "react-router-dom";

export const Error404 = () => {
    return (
        <main className="flex flex-col min-h-screen items-center justify-center relative bg-[#f6faff] overflow-hidden py-12 px-6">
            {/* Ambient background glows */}
            <div className="absolute right-[-10%] top-[-10%] w-[350px] h-[350px] blur-[80px] rounded-full bg-[#e55cff] opacity-10 pointer-events-none" />
            <div className="absolute left-[-10%] bottom-[-10%] w-[450px] h-[450px] blur-[100px] rounded-full bg-[#0099ff] opacity-10 pointer-events-none" />

            <div className="flex flex-col items-center text-center max-w-md w-full bg-white px-8 py-12 rounded-3xl border border-solid border-[#e6eff8] shadow-[0px_10px_30px_#0000000d] z-10">
                {/* SVG Illustration with spinning rings */}
                <div className="relative mb-8 w-44 h-44 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-2 border-dashed border-[#e6eff8] animate-[spin_45s_linear_infinite]" />
                    <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#006BFF]/10 animate-[spin_25s_linear_infinite_reverse]" />
                    
                    {/* Searching glass SVG icon & 404 Text */}
                    <div className="flex flex-col items-center justify-center z-10">
                        <svg className="w-12 h-12 text-[#006BFF] mb-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-5xl font-bold [font-family:'Montserrat-Bold',Helvetica] tracking-tighter bg-gradient-to-r from-[#006BFF] via-[#8247f5] to-[#e55cff] bg-clip-text text-transparent select-none">
                            404
                        </span>
                    </div>
                </div>

                <h1 className="[font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-[#0B3558] text-2xl md:text-3xl tracking-tight mb-3">
                    Không tìm thấy trang
                </h1>
                
                <p className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#476788] text-sm md:text-base leading-relaxed mb-8">
                    Đường dẫn bạn truy cập không tồn tại hoặc đã được chuyển sang địa chỉ khác. Vui lòng kiểm tra lại liên kết.
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

export default Error404;
