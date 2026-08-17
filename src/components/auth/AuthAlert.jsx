import React from 'react';

const AuthAlert = ({ type = 'error', message, requestId = null }) => {
    if (!message) return null;

    const isError = type === 'error';
    
    return (
        <div 
            className={`w-full p-4 text-sm rounded-xl border flex items-start gap-3 ${
                isError 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-green-50 border-green-200 text-green-700'
            }`} 
            role="alert"
        >
            {isError ? (
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            
            <div className="flex flex-col">
                <div className="font-bold">
                    {isError 
                        ? (message.includes("Lỗi hệ thống") ? "Lỗi hệ thống" : message.includes("Lỗi mạng") ? "Lỗi kết nối" : "Có lỗi xảy ra") 
                        : "Thành công"}
                </div>
                <div className="mt-1 leading-relaxed text-[#414754]">
                    {message}
                </div>
                {requestId && isError && (
                    <div className="text-[10px] text-red-500/70 mt-1 font-mono">
                        RequestId: {requestId}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthAlert;
