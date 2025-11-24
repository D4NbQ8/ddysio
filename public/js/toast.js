class Toast {
    constructor() {
        this.container = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) {
            return;
        }

        if (!document.body) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
                return;
            }
        }

        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-50 space-y-3';
            this.container.style.maxWidth = '400px';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
        
        this.initialized = true;
    }

    show(message, type = 'info', duration = 3000) {
        if (!this.initialized) {
            this.init();
        }
        const toast = document.createElement('div');
        toast.className = 'toast-item bg-white border border-gray-200 shadow-lg p-4 transform transition-all duration-300 ease-in-out';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';

        const icons = {
            success: `<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>`,
            error: `<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>`,
            warning: `<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>`,
            info: `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        };

        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-0.5">
                    ${icons[type] || icons.info}
                </div>
                <div class="flex-1 text-sm text-gray-900 font-light">
                    ${this.escapeHtml(message)}
                </div>
                <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        if (duration > 0) {
            setTimeout(() => {
                this.close(toast);
            }, duration);
        }

        return toast;
    }

    close(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    confirm(message, onConfirm, onCancel) {
        if (!this.initialized) {
            this.init();
        }
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.style.opacity = '0';

        modal.innerHTML = `
            <div class="bg-white border border-gray-200 shadow-lg max-w-md w-full p-8 transform transition-all duration-300" style="opacity: 0; transform: scale(0.95);">
                <div class="text-center">
                    <div class="mb-6">
                        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-base text-gray-900 font-light mb-8 leading-relaxed whitespace-pre-line">
                        ${this.escapeHtml(message)}
                    </p>
                    <div class="flex gap-3">
                        <button class="flex-1 px-6 py-3 border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors font-light text-sm uppercase tracking-wider" data-action="cancel">
                            取消
                        </button>
                        <button class="flex-1 px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-sm uppercase tracking-wider" data-action="confirm">
                            确认
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.style.opacity = '1';
            const inner = modal.querySelector('div > div');
            inner.style.opacity = '1';
            inner.style.transform = 'scale(1)';
        }, 10);

        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            this.closeModal(modal);
            if (onConfirm) onConfirm();
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            this.closeModal(modal);
            if (onCancel) onCancel();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
                if (onCancel) onCancel();
            }
        });

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                if (onCancel) onCancel();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    closeModal(modal) {
        modal.style.opacity = '0';
        const inner = modal.querySelector('div > div');
        if (inner) {
            inner.style.opacity = '0';
            inner.style.transform = 'scale(0.95)';
        }
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.toast = new Toast();

if (document.readyState !== 'loading') {
    window.toast.init();
} else {
    document.addEventListener('DOMContentLoaded', function() {
        window.toast.init();
    });
}