import {ref} from 'vue';

export interface Toast {
    id: number;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showClose?: boolean;
    entering?: boolean;
}

export const toasts = ref<Toast[]>([]);
export const position = ref<
    'top-left' | 'top-center' | 'top-right' |
    'bottom-left' | 'bottom-center' | 'bottom-right'
>('top-right');

let idCounter = 0;

export function addToast(message: string, type: Toast['type'] = 'info', duration = 4200, showClose = true) {
    const id = ++idCounter;
    const toast: Toast = {id, message, type, showClose, entering: true};
    toasts.value.push(toast);

    if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
    }


    setTimeout(() => {
        const t = toasts.value.find(t => t.id === id);
        if (t) t.entering = false;
    }, 1200);
}

export function removeToast(id: number) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) toasts.value.splice(index, 1);
}

export const getIcon = (type: string) => {
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
    };
    return icons[type as keyof typeof icons] || icons.info;
};
