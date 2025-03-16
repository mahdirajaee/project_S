/**
 * UI Module
 * 
 * Handles UI animations, transitions, and common interactions
 */

class UI {
    constructor() {
        // Initialize UI components once DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => this.init());
        
        // Theme preference (light/dark)
        this.currentTheme = localStorage.getItem('theme') || 'light';
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
        
        // Setup theme toggle if exists
        this.setupThemeToggle();
        
        // Apply stored theme
        this.applyTheme(this.currentTheme);
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
        
        // Animate cards with staggered delay
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
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
                if (!card.classList.contains('no-hover')) {
                    card.style.transform = 'translateY(-5px)';
                    card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('no-hover')) {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
                }
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
                const parent = input.closest('.input-group');
                if (parent) parent.classList.add('input-focused');
            });
            
            // Remove animation class on blur
            input.addEventListener('blur', () => {
                const parent = input.closest('.input-group');
                if (parent) parent.classList.remove('input-focused');
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
        
        // Initialize tooltips
        this.initTooltips();
        
        // Initialize dropdowns
        this.initDropdowns();
    }
    
    /**
     * Initialize tooltips
     */
    initTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        
        tooltips.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            
            element.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = tooltipText;
                
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                
                setTimeout(() => {
                    tooltip.classList.add('show');
                }, 10);
                
                element.tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', () => {
                if (element.tooltip) {
                    element.tooltip.classList.remove('show');
                    
                    setTimeout(() => {
                        if (element.tooltip && element.tooltip.parentNode) {
                            element.tooltip.parentNode.removeChild(element.tooltip);
                        }
                        element.tooltip = null;
                    }, 300);
                }
            });
        });
    }
    
    /**
     * Initialize dropdowns
     */
    initDropdowns() {
        const dropdownTriggers = document.querySelectorAll('[data-dropdown]');
        
        dropdownTriggers.forEach(trigger => {
            const dropdownId = trigger.getAttribute('data-dropdown');
            const dropdown = document.getElementById(dropdownId);
            
            if (!dropdown) return;
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(dropdown);
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('.dropdown.show');
            dropdowns.forEach(dropdown => {
                // Check if click was inside dropdown or trigger
                const triggers = document.querySelectorAll(`[data-dropdown="${dropdown.id}"]`);
                let shouldClose = true;
                
                triggers.forEach(trigger => {
                    if (trigger.contains(e.target)) {
                        shouldClose = false;
                    }
                });
                
                if (dropdown.contains(e.target)) {
                    shouldClose = false;
                }
                
                if (shouldClose) {
                    this.closeDropdown(dropdown);
                }
            });
        });
    }
    
    /**
     * Toggle dropdown visibility
     */
    toggleDropdown(dropdown) {
        if (dropdown.classList.contains('show')) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }
    
    /**
     * Open dropdown
     */
    openDropdown(dropdown) {
        // Close other open dropdowns first
        const openDropdowns = document.querySelectorAll('.dropdown.show');
        openDropdowns.forEach(openDropdown => {
            if (openDropdown !== dropdown) {
                this.closeDropdown(openDropdown);
            }
        });
        
        dropdown.classList.add('show');
    }
    
    /**
     * Close dropdown
     */
    closeDropdown(dropdown) {
        dropdown.classList.remove('show');
    }
    
    /**
     * Handle search functionality
     */
    handleSearch(query) {
        const tableRows = document.querySelectorAll('#users-table-body tr');
        
        if (!tableRows.length) return;
        
        query = query.toLowerCase().trim();
        
        let hasResults = false;
        
        tableRows.forEach(row => {
            // Get user data from row cells
            const username = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();
            
            // Show/hide row based on search query
            if (!query || username.includes(query) || email.includes(query)) {
                row.style.display = '';
                hasResults = true;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show no results message if needed
        const noResultsRow = document.getElementById('no-search-results');
        if (!hasResults) {
            if (!noResultsRow) {
                const tableBody = document.getElementById('users-table-body');
                const newRow = document.createElement('tr');
                newRow.id = 'no-search-results';
                newRow.innerHTML = `
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>No users found matching "${query}"</p>
                        </div>
                    </td>
                `;
                tableBody.appendChild(newRow);
            } else {
                noResultsRow.style.display = '';
                const messageEl = noResultsRow.querySelector('.empty-state p');
                if (messageEl) {
                    messageEl.textContent = `No users found matching "${query}"`;
                }
            }
        } else if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }
    
    /**
     * Setup theme toggle
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                this.applyTheme(newTheme);
                localStorage.setItem('theme', newTheme);
                this.currentTheme = newTheme;
            });
        }
    }
    
    /**
     * Apply theme
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            
            // Update toggle icon if exists
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }
        } else {
            document.body.classList.remove('dark-mode');
            
            // Update toggle icon if exists
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        }
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
        element.disabled = true;
    }
    
    /**
     * Hide loading spinner
     */
    hideLoading(element) {
        if (!element || !element.classList.contains('loading')) return;
        
        // Restore original content
        element.innerHTML = element.dataset.originalContent;
        element.classList.remove('loading');
        element.disabled = false;
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
        
        // Get appropriate icon based on type
        let icon = 'info-circle';
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
        }
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icon} toast-icon"></i>
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
    showConfirmDialog(options) {
        return new Promise((resolve) => {
            const defaults = {
                title: 'Confirmation',
                message: 'Are you sure you want to continue?',
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                type: 'info' // 'info', 'warning', 'danger'
            };
            
            const settings = { ...defaults, ...options };
            
            // Create modal element
            const modal = document.createElement('div');
            modal.className = 'modal';
            
            // Get appropriate icon based on type
            let iconClass = 'info-circle';
            let iconColor = 'var(--primary-color)';
            
            switch (settings.type) {
                case 'warning':
                    iconClass = 'exclamation-triangle';
                    iconColor = 'var(--warning-color)';
                    break;
                case 'danger':
                    iconClass = 'exclamation-circle';
                    iconColor = 'var(--danger-color)';
                    break;
            }
            
            modal.innerHTML = `
                <div class="modal-content modal-confirm animate-slide-in-up">
                    <div class="modal-header">
                        <h3>${settings.title}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="confirm-icon">
                            <i class="fas fa-${iconClass}" style="color: ${iconColor}"></i>
                        </div>
                        <p>${settings.message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancel-btn">${settings.cancelText}</button>
                        <button class="btn btn-primary ${settings.type === 'danger' ? 'btn-danger' : ''}" id="confirm-btn">${settings.confirmText}</button>
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
                    resolve(false);
                }, 300);
            });
            
            // Cancel button
            const cancelBtn = modal.querySelector('#cancel-btn');
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    modal.remove();
                    resolve(false);
                }, 300);
            });
            
            // Confirm button
            const confirmBtn = modal.querySelector('#confirm-btn');
            confirmBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                
                // Execute callback after animation
                setTimeout(() => {
                    modal.remove();
                    resolve(true);
                }, 300);
            });
            
            // Handle click outside modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    
                    // Remove from DOM after animation
                    setTimeout(() => {
                        modal.remove();
                        resolve(false);
                    }, 300);
                }
            });
        });
    }
    
    /**
     * Initialize a data table with common features
     * @param {string} tableId - The ID of the table element
     * @param {Object} options - Table options
     */
    initDataTable(tableId, options = {}) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const defaults = {
            sortable: true,
            pagination: true,
            rowsPerPage: 10,
            searchable: true
        };
        
        const settings = { ...defaults, ...options };
        
        // Add table wrapper if needed
        if (settings.pagination || settings.searchable) {
            const wrapper = document.createElement('div');
            wrapper.className = 'data-table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
            
            // Add table top section if needed
            if (settings.searchable) {
                const tableTop = document.createElement('div');
                tableTop.className = 'data-table-top';
                
                const searchContainer = document.createElement('div');
                searchContainer.className = 'data-table-search';
                searchContainer.innerHTML = `
                    <input type="text" placeholder="Search..." class="data-table-search-input">
                    <i class="fas fa-search"></i>
                `;
                
                tableTop.appendChild(searchContainer);
                wrapper.insertBefore(tableTop, table);
                
                // Handle search
                const searchInput = searchContainer.querySelector('input');
                searchInput.addEventListener('input', () => {
                    const value = searchInput.value.toLowerCase().trim();
                    const rows = table.querySelectorAll('tbody tr');
                    
                    rows.forEach(row => {
                        let found = false;
                        Array.from(row.cells).forEach(cell => {
                            if (cell.textContent.toLowerCase().includes(value)) {
                                found = true;
                            }
                        });
                        
                        row.style.display = found ? '' : 'none';
                    });
                });
            }
            
            // Add table bottom section if needed
            if (settings.pagination) {
                const tableBottom = document.createElement('div');
                tableBottom.className = 'data-table-bottom';
                
                const pagination = document.createElement('div');
                pagination.className = 'data-table-pagination';
                tableBottom.appendChild(pagination);
                
                wrapper.appendChild(tableBottom);
                
                // Initialize pagination
                this.initTablePagination(table, settings.rowsPerPage, pagination);
            }
        }
        
        // Initialize sortable columns
        if (settings.sortable) {
            const headers = table.querySelectorAll('thead th');
            
            headers.forEach((header, index) => {
                if (header.getAttribute('data-sortable') !== 'false') {
                    header.classList.add('sortable');
                    header.innerHTML = `<div class="th-content">${header.innerHTML} <i class="fas fa-sort"></i></div>`;
                    
                    header.addEventListener('click', () => {
                        this.sortTable(table, index, header);
                    });
                }
            });
        }
    }
    
    /**
     * Initialize pagination for a table
     */
    initTablePagination(table, rowsPerPage, paginationContainer) {
        const rows = table.querySelectorAll('tbody tr');
        const totalRows = rows.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        
        // Store current page
        table.currentPage = 1;
        
        // Function to show appropriate rows
        const showPage = (page) => {
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            
            rows.forEach((row, index) => {
                row.style.display = (index >= start && index < end) ? '' : 'none';
            });
            
            // Update pagination UI
            updatePaginationUI(page);
        };
        
        // Function to update pagination UI
        const updatePaginationUI = (currentPage) => {
            // Clear pagination container
            paginationContainer.innerHTML = '';
            
            if (totalPages <= 1) return;
            
            // Add prev button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'pagination-btn';
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevBtn.disabled = currentPage === 1;
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    table.currentPage = currentPage - 1;
                    showPage(table.currentPage);
                }
            });
            paginationContainer.appendChild(prevBtn);
            
            // Determine which page numbers to show
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            
            // Adjust if we're near the end
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }
            
            // Add first page if needed
            if (startPage > 1) {
                const firstBtn = document.createElement('button');
                firstBtn.className = 'pagination-btn';
                firstBtn.textContent = '1';
                firstBtn.addEventListener('click', () => {
                    table.currentPage = 1;
                    showPage(table.currentPage);
                });
                paginationContainer.appendChild(firstBtn);
                
                // Add ellipsis if needed
                if (startPage > 2) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    paginationContainer.appendChild(ellipsis);
                }
            }
            
            // Add page buttons
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = 'pagination-btn';
                if (i === currentPage) pageBtn.classList.add('active');
                pageBtn.textContent = i;
                
                pageBtn.addEventListener('click', () => {
                    table.currentPage = i;
                    showPage(table.currentPage);
                });
                
                paginationContainer.appendChild(pageBtn);
            }
            
            // Add ellipsis and last page if needed
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    paginationContainer.appendChild(ellipsis);
                }
                
                const lastBtn = document.createElement('button');
                lastBtn.className = 'pagination-btn';
                lastBtn.textContent = totalPages;
                lastBtn.addEventListener('click', () => {
                    table.currentPage = totalPages;
                    showPage(table.currentPage);
                });
                paginationContainer.appendChild(lastBtn);
            }
            
            // Add next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'pagination-btn';
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    table.currentPage = currentPage + 1;
                    showPage(table.currentPage);
                }
            });
            paginationContainer.appendChild(nextBtn);
        };
        
        // Show first page initially
        showPage(1);
    }
    
    /**
     * Sort a table by column
     */
    sortTable(table, columnIndex, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Determine sort direction
        let sortDirection = 'asc';
        if (header.classList.contains('sort-asc')) {
            sortDirection = 'desc';
            header.classList.remove('sort-asc');
            header.classList.add('sort-desc');
        } else if (header.classList.contains('sort-desc')) {
            sortDirection = 'asc';
            header.classList.remove('sort-desc');
            header.classList.add('sort-asc');
        } else {
            // Reset all other headers
            table.querySelectorAll('th').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            header.classList.add('sort-asc');
        }
        
        // Get sort type
        const sortType = header.getAttribute('data-sort-type') || 'string';
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            let comparison = 0;
            
            if (sortType === 'number') {
                comparison = parseFloat(aValue) - parseFloat(bValue);
            } else if (sortType === 'date') {
                comparison = new Date(aValue) - new Date(bValue);
            } else {
                comparison = aValue.localeCompare(bValue);
            }
            
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        
        // Re-append rows in new order
        rows.forEach(row => tbody.appendChild(row));
        
        // If table has pagination, make sure we're still showing the right page
        if (table.currentPage !== undefined) {
            const event = new CustomEvent('table-sorted');
            table.dispatchEvent(event);
        }
    }
}

// Initialize UI
const ui = new UI();

// Make UI available globally
window.ui = ui;