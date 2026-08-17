import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            }
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            pages.push(1);
            if (start > 2) {
                pages.push('...');
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
            >
                Trước
            </button>
            {getPages().map((p, idx) => (
                <React.Fragment key={idx}>
                    {p === '...' ? (
                        <span className="px-1 text-slate-blue font-bold tracking-widest text-[10.5px]">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10.5px] font-bold transition-all border ${currentPage === p
                                    ? 'bg-action-blue text-white border-action-blue shadow-sm'
                                    : 'border-platinum-tint hover:bg-cloud-mist text-slate-blue'
                                }`}
                        >
                            {p}
                        </button>
                    )}
                </React.Fragment>
            ))}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 border border-platinum-tint rounded-lg text-[10.5px] font-bold hover:bg-cloud-mist disabled:opacity-50 disabled:hover:bg-transparent"
            >
                Sau
            </button>
        </div>
    );
};

export default Pagination;
