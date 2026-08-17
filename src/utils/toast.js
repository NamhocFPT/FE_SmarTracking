const TOAST_EVENT = 'app:toast';

const emit = (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { id, message, type } }));
};

const toast = {
    success: (msg) => emit(msg, 'success'),
    error:   (msg) => emit(msg, 'error'),
    warning: (msg) => emit(msg, 'warning'),
    info:    (msg) => emit(msg, 'info'),
};

export { TOAST_EVENT };
export default toast;
