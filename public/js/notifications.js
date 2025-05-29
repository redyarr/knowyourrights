// Modern notification system to replace window alerts
class NotificationSystem {
    constructor() {
        this.createContainer();
    }

    createContainer() {
        if (document.getElementById('notification-container')) return;
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        const id = 'notification-' + Date.now();
        notification.id = id;
        
        const typeClasses = {
            success: 'bg-green-500 border-green-600',
            error: 'bg-red-500 border-red-600',
            warning: 'bg-yellow-500 border-yellow-600',
            info: 'bg-blue-500 border-blue-600',
            danger: 'bg-red-500 border-red-600'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            danger: '✕'
        };

        notification.className = `${typeClasses[type] || typeClasses.info} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 max-w-sm transform transition-all duration-300 ease-in-out translate-x-full opacity-0`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-lg font-bold">${icons[type] || icons.info}</span>
                    <span class="font-medium">${message}</span>
                </div>
                <button onclick="notifications.hide('${id}')" class="ml-4 text-white hover:text-gray-200 font-bold text-lg leading-none">
                    ×
                </button>
            </div>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    hide(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    // Confirmation dialog replacement
    confirm(message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.style.zIndex = '10000';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0">
                <div class="flex items-center space-x-3 mb-4">
                    <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span class="text-yellow-600 text-lg">⚠</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">Confirm Action</h3>
                </div>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex space-x-3 justify-end">
                    <button id="cancel-btn" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Trigger animation
        setTimeout(() => {
            const dialog = modal.querySelector('div');
            dialog.classList.remove('scale-95', 'opacity-0');
            dialog.classList.add('scale-100', 'opacity-100');
        }, 10);

        // Event handlers
        modal.querySelector('#confirm-btn').onclick = () => {
            modal.remove();
            if (onConfirm) onConfirm();
        };

        modal.querySelector('#cancel-btn').onclick = () => {
            modal.remove();
            if (onCancel) onCancel();
        };

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) onCancel();
            }
        };
    }
}

// Global instance
const notifications = new NotificationSystem();

// Legacy support - replace window.alert
window.showAlert = function(message, type = 'info') {
    notifications.show(message, type);
};

// Replace window.alert globally
window.alert = function(message) {
    notifications.info(message);
};

// Replace window.confirm globally
window.confirm = function(message) {
    return new Promise((resolve) => {
        notifications.confirm(message, 
            () => resolve(true),
            () => resolve(false)
        );
    });
};