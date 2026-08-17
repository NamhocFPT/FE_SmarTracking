import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

const WheelColumn = ({ items, value, onChange, label }) => {
    const scrollRef = useRef(null);
    const itemHeight = 40; // 40px per item
    const isScrolling = useRef(false);
    const scrollTimeout = useRef(null);

    // Initial scroll position
    useEffect(() => {
        if (scrollRef.current) {
            const index = items.findIndex(i => i.value === value);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, []); // Only on mount

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        
        scrollTimeout.current = setTimeout(() => {
            if (items[index] && items[index].value !== value) {
                onChange(items[index].value);
            }
        }, 50); // Debounce
    };

    return (
        <div className="flex flex-col items-center flex-1">
            <div className="text-[10px] font-bold text-slate-blue mb-1 uppercase tracking-wider">{label}</div>
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-[120px] overflow-y-auto snap-y snap-mandatory relative w-full select-none"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)'
                }}
            >
                {/* Style block to hide scrollbar for webkit */}
                <style dangerouslySetInnerHTML={{__html: `
                    div::-webkit-scrollbar { display: none; }
                `}} />
                
                <div style={{ height: `${itemHeight}px` }}></div>
                {items.map((item, idx) => {
                    const isSelected = item.value === value;
                    return (
                        <div 
                            key={idx} 
                            className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 cursor-pointer ${
                                isSelected 
                                    ? 'text-action-blue font-bold text-xl' 
                                    : 'text-slate-400 font-medium text-base hover:text-slate-600'
                            }`}
                            onClick={() => {
                                if (scrollRef.current) {
                                    scrollRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
                                }
                            }}
                        >
                            {item.label}
                        </div>
                    );
                })}
                <div style={{ height: `${itemHeight}px` }}></div>
            </div>
        </div>
    );
};

const TimePicker = ({ value, onChange, placeholder = "00:00" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const [hours, minutes] = (value || '00:00').split(':');

    const hourItems = Array.from({ length: 24 }).map((_, i) => ({
        value: String(i).padStart(2, '0'),
        label: String(i).padStart(2, '0')
    }));

    const minuteItems = Array.from({ length: 60 }).map((_, i) => ({
        value: String(i).padStart(2, '0'),
        label: String(i).padStart(2, '0')
    }));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleHourChange = (newHour) => {
        onChange(`${newHour}:${minutes}`);
    };

    const handleMinuteChange = (newMinute) => {
        onChange(`${hours}:${newMinute}`);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white text-midnight-indigo flex justify-between items-center cursor-pointer transition-all ${
                    isOpen ? 'border-action-blue ring-2 ring-blue-50' : 'border-platinum-tint hover:border-action-blue'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? 'font-semibold' : 'text-slate-400'}>{value || placeholder}</span>
                <Clock className={`w-4 h-4 transition-colors ${isOpen ? 'text-action-blue' : 'text-slate-blue'}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-[100] w-[220px] flex flex-col transform animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2 bg-cloud-mist/30 p-2 rounded-xl">
                        <WheelColumn 
                            items={hourItems} 
                            value={hours} 
                            onChange={handleHourChange} 
                            label="Giờ" 
                        />
                        <div className="flex items-center justify-center font-bold text-slate-300 text-xl mt-4">:</div>
                        <WheelColumn 
                            items={minuteItems} 
                            value={minutes} 
                            onChange={handleMinuteChange} 
                            label="Phút" 
                        />
                    </div>
                    <div className="mt-3">
                        <button 
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2.5 bg-action-blue text-white font-bold text-xs rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
