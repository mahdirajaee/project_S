/**
 * Utilities Module
 * 
 * Provides common utility functions for the application
 */

class Utils {
    /**
     * Format a date to a readable string
     */
    static formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    /**
     * Format a relative time (e.g. "2 hours ago")
     */
    static formatRelativeTime(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else {
            return Utils.formatDate(date);
        }
    }
    
    /**
     * Generate a random ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Truncate text to a specified length
     */
    static truncateText(text, length = 100, ellipsis = '...') {
        if (!text || text.length <= length) {
            return text;
        }
        
        return text.substring(0, length) + ellipsis;
    }
    
    /**
     * Sanitize HTML to prevent XSS attacks
     */
    static sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }
    
    /**
     * Debounce function to limit the rate at which a function is executed
     */
    static debounce(func, delay = 300) {
        let timeout;
        
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * Validate email format
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Validate password strength
     * Returns an object with valid flag and message
     */
    static validatePassword(password) {
        if (!password || password.length < 8) {
            return {
                valid: false,
                message: 'Password must be at least 8 characters long'
            };
        }
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return {
                valid: false,
                message: 'Password must include uppercase, lowercase, number, and special character'
            };
        }
        
        return {
            valid: true,
            message: 'Password is strong'
        };
    }
    
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }
    
    /**
     * Format file size to human-readable format
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Parse query parameters from URL
     */
    static getQueryParams() {
        const params = {};
        const query = window.location.search.substring(1);
        const vars = query.split('&');
        
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        
        return params;
    }
    
    /**
     * Set cookie
     */
    static setCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Strict; Secure';
    }
    
    /**
     * Get cookie
     */
    static getCookie(name) {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        
        if (parts.length === 2) {
            return decodeURIComponent(parts.pop().split(';').shift());
        }
        
        return null;
    }
    
    /**
     * Delete cookie
     */
    static deleteCookie(name) {
        Utils.setCookie(name, '', -1);
    }
    
    /**
     * Encrypt data with a simple algorithm (for demo purposes only)
     * For production, use a proper encryption library
     */
    static encryptData(data, key) {
        // This is a very basic encryption for demo purposes only
        // In a real application, use a proper encryption library
        return btoa(encodeURIComponent(JSON.stringify(data)));
    }
    
    /**
     * Decrypt data (for demo purposes only)
     */
    static decryptData(encryptedData, key) {
        // This is a very basic decryption for demo purposes only
        try {
            return JSON.parse(decodeURIComponent(atob(encryptedData)));
        } catch (e) {
            console.error('Decryption failed:', e);
            return null;
        }
    }
}

// Make Utils available globally
window.Utils = Utils;