const TOAST_EVENT = 'civic-toast';

export const notify = (message, type = 'info', options = {}) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(TOAST_EVENT, {
        detail: {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            message,
            type,
            timeout: options.timeout || 3500,
        },
    }));
};

export const toastChannel = TOAST_EVENT;