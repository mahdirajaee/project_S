/**
 * UI Module
 * 
 * Handles UI animations, transitions, and common interactions
 */

class UI {
    constructor() {
        // Initialize UI components once DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => this.init());
    }
    
    /**
     * Initialize UI elements
     */
    init() {
        // Add page entrance animation
        this.animatePageEntrance();
        
        // Set up response animations
        this.setupResponseAnimations();
        
        // Initialize interactive elements
        this.initInteractiveElements();
    }
    
    /**
     * Animate page entrance
     */
    animatePageEntrance() {
        // Add entrance animation class to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('page-enter');
            
            // Trigger entrance animation after a small delay
            setTimeout(() => {
                mainContent.classList.add('page-enter-active');
            }, 50);
        }
        
        // Animate dashboard widgets with staggered delay
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach((widget, index) => {
            widget.style.opacity = '0';
            widget.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                widget.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                widget.style.opacity = '1';
                widget.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
    }
    
    /**
     * Set up response animations for elements
     */
    setupResponseAnimations() {
        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
            
            // Add ripple effect on click
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                
                button.appendChild(ripple);
                
                // Remove ripple after animation completes
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Card hover effects
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
            });
        });
    }
    
    /**
     * Initialize interactive UI elements
     */
    initInteractiveElements() {
        // Input focus effects
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Add animation class on focus
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('input-focused');
            });
            
            // Remove animation class on blur
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('input-focused');
            });
            
            // Add class if input has value
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
            
            // Check initial value
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            }
        });
        
        // Handle search functionality
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.handleSearch(searchInput.value);
            });
        }
    }
    
    /**
     * Handle search functionality
     */
    handleSearch(query) {
        const tableRows = document.querySelectorAll('#users-table-body tr');
        
        if (!tableRows.length) return;
        
        query = query.toLowerCase().trim();
        
        tableRows.forEach(row => {
            // Get user data from row cells
            const username = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();
            
            // Show/hide row based on search query
            if (username.includes(query) || email.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * Show a loading spinner
     */
    showLoading(element) {
        if (!element) return;
        
        // Store original content
        element.dataset.originalContent = element.innerHTML;
        
        // Replace with spinner
        element.innerHTML = '<div class="spinner"></div>';
        element.classList.add('loading');
    }
    
    /**
     * Hide loading spinner
     */
    hideLoading(element) {
        if (!element || !element.classList.contains('loading')) return;
        
        // Restore original content
        element.innerHTML = element.dataset.originalContent;
        element.classList.remove('loading');
    }
    
    /**
     * Show a notification toast message
     */
    showToast(message, type = 'info', duration = 3000) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Animate out after duration
        setTimeout(() => {
            toast.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
    }
    
    /**
     * Display a confirmation dialog
     */
    showConfirmDialog(message, callback) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmation</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancel-btn">Cancel</button>
                    <button class="btn btn-primary" id="confirm-btn">Confirm</button>
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Close button
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Cancel button
        const cancelBtn = modal.querySelector('#cancel-btn');
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Confirm button
        const confirmBtn = modal.querySelector('#confirm-btn');
        confirmBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            
            // Execute callback after animation
            setTimeout(() => {
                modal.remove();
                if (typeof callback === 'function') {
                    callback(true);
                }
            }, 300);
        });
    }
}

// Initialize UI
const ui = new UI();