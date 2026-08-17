import React from 'react';

/**
 * Ô nhập text/email dạng pill dùng chung cho các form auth — thay cho việc
 * copy-paste markup input (từng lặp lại y hệt giữa login.jsx và forgotpassword.jsx
 * với màu hex viết tay, xem docs/auth-payoneer-style-redesign-plan.md mục 4).
 */
const AuthTextInput = ({
    id,
    name,
    type = 'text',
    value,
    onChange,
    error,
    disabled,
    placeholder,
    autoComplete,
    required,
}) => {
    return (
        <input
            id={id}
            name={name}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`flex items-center w-full h-12 px-5 bg-cloud-mist rounded-full border border-solid transition-colors font-sans text-midnight-indigo text-base placeholder:text-slate-blue/60 focus:outline-none focus:ring-1 ${
                error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-platinum-tint focus:border-action-blue focus:ring-action-blue'
            }`}
        />
    );
};

export default AuthTextInput;
