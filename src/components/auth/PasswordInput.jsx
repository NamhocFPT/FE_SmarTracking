import React, { useState } from 'react';

const PasswordInput = ({
    id,
    name = "password",
    value,
    onChange,
    error,
    disabled,
    placeholder = "••••••••",
    autoComplete = "current-password",
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col items-start w-full relative">
            <div className={`flex items-center px-5 h-12 w-full bg-cloud-mist rounded-full border border-solid transition-colors ${error ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : 'border-platinum-tint focus-within:border-action-blue focus-within:ring-action-blue'} focus-within:ring-1`}>
                <input
                    id={id}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="flex-grow w-full border-none bg-transparent font-sans text-midnight-indigo text-base p-0 focus:outline-none focus:ring-0 placeholder:text-slate-blue/60"
                />
                <button
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPassword(prev => !prev)}
                    className="ml-2 p-1 text-slate-blue hover:text-midnight-indigo focus:outline-none rounded-full transition-colors"
                >
                    {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;
