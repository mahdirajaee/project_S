/**
 * User Dashboard Module
 * 
 * Handles all functionality for the user dashboard
 */

class UserDashboard {
    constructor() {
        // Initialize the dashboard once DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => this.init());
    }
    
    /**
     * Initialize the user dashboard
     */
    init() {
        // Check if we're on user page
        if (!window.location.pathname.includes('/dashboard/user.html')) {
            return;
        }
        
        // Load components
        this.loadComponents();
        
        // Set up responsive sidebar
        this.setupSidebar();
        
        // Setup tab navigation
        this.setupTabs();
        
        // Initialize toggle password buttons
        this.initTogglePassword();
        
        console.log('User Dashboard initialized');
    }
    
    /**
     * Load HTML components (topbar, sidebar)
     */
    loadComponents() {
        // Load topbar
        const topbarContainer = document.getElementById('topbar-container');
        if (topbarContainer) {
            fetch('../components/topbar.html')
                .then(response => response.text())
                .then(html => {
                    topbarContainer.innerHTML = html;
                    
                    // Initialize topbar functionality after loading
                    this.initTopbar();
                })
                .catch(error => console.error('Error loading topbar:', error));
        }
        
        // Load sidebar
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            fetch('../components/sidebar.html')
                .then(response => response.text())
                .then(html => {
                    sidebarContainer.innerHTML = html;
                    
                    // Hide admin menu items and show user menu items
                    const adminMenu = document.getElementById('admin-menu');
                    const userMenu = document.getElementById('user-nav-menu');
                    
                    if (adminMenu) adminMenu.style.display = 'none';
                    if (userMenu) userMenu.style.display = 'block';
                    
                    // Initialize sidebar functionality after loading
                    this.initSidebar();
                })
                .catch(error => console.error('Error loading sidebar:', error));
        }
    }
    
    /**
     * Initialize topbar functionality
     */
    initTopbar() {
        // Set user initial and info
        const userInitial = document.getElementById('user-initial');
        const displayName = document.getElementById('display-name');
        const displayRole = document.getElementById('display-role');
        
        if (auth.currentUser) {
            if (userInitial) {
                userInitial.textContent = auth.currentUser.name 
                    ? auth.currentUser.name.charAt(0).toUpperCase() 
                    : auth.currentUser.username.charAt(0).toUpperCase();
            }
            
            if (displayName) {
                displayName.textContent = auth.currentUser.name || auth.currentUser.username;
            }
            
            if (displayRole) {
                displayRole.textContent = auth.currentUser.role.charAt(0).toUpperCase() + auth.currentUser.role.slice(1);
            }
        }
        
        // Toggle sidebar on mobile
        const toggleBtn = document.getElementById('toggle-sidebar');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                document.body.classList.toggle('sidebar-open');
            });
        }
        
        // Handle user dropdown
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });
        }
        
        // Handle profile link
        const profileLink = document.getElementById('profile-link');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = profileLink.getAttribute('data-tab');
                if (tabId) {
                    this.showTab(tabId);
                    // Close dropdown
                    if (userDropdown) userDropdown.classList.remove('show');
                }
            });
        }
        
        // Update user name in the welcome message and profile
        this.updateUserInfo();
        
        // Handle notifications
        this.updateNotifications();
        
        // Update last login information
        this.updateLastLogin();
    }
    
    /**
     * Initialize sidebar functionality
     */
    initSidebar() {
        // Handle sidebar navigation
        const navLinks = document.querySelectorAll('.nav-link[data-tab]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.showTab(tabId);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 992) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) sidebar.classList.remove('show');
                }
            });
        });
        
        // Handle sidebar collapse
        const collapseSidebarBtn = document.getElementById('collapse-sidebar');
        const sidebar = document.querySelector('.sidebar');
        
        if (collapseSidebarBtn && sidebar) {
            collapseSidebarBtn.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-collapsed');
                
                // Update button icon
                const icon = collapseSidebarBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-chevron-left');
                    icon.classList.toggle('fa-chevron-right');
                }
                
                // Adjust main content margin
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.style.marginLeft = sidebar.classList.contains('sidebar-collapsed') 
                        ? '70px' 
                        : '';
                }
            });
        }
        
        // Update sidebar message count
        this.updateSidebarMessageCount();
    }
    
    /**
     * Setup responsive sidebar
     */
    setupSidebar() {
        // Add responsive classes to body when sidebar is open on mobile
        document.addEventListener('click', (e) => {
            // Close when clicking outside sidebar
            if (window.innerWidth < 992) {
                const sidebar = document.querySelector('.sidebar');
                const toggleBtn = document.getElementById('toggle-sidebar');
                
                if (sidebar && sidebar.classList.contains('show') && 
                    !sidebar.contains(e.target) && 
                    !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('show');
                    document.body.classList.remove('sidebar-open');
                }
            }
        });
    }
    
    /**
     * Update user information
     */
    updateUserInfo() {
        // Update welcome message
        const userName = document.getElementById('user-name');
        if (userName && auth.currentUser) {
            userName.textContent = auth.currentUser.name || auth.currentUser.username;
        }
        
        // Update profile info
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileRole = document.getElementById('profile-role');
        
        if (auth.currentUser) {
            if (profileName) profileName.textContent = auth.currentUser.name || auth.currentUser.username;
            if (profileEmail) profileEmail.textContent = auth.currentUser.email;
            if (profileRole) profileRole.textContent = auth.currentUser.role.charAt(0).toUpperCase() + auth.currentUser.role.slice(1);
        }
        
        // Update account status
        const accountStatus = document.getElementById('account-status');
        if (accountStatus && auth.currentUser) {
            accountStatus.textContent = auth.currentUser.status 
                ? auth.currentUser.status.charAt(0).toUpperCase() + auth.currentUser.status.slice(1)
                : 'Active';
        }
    }
    
    /**
     * Update last login information
     */
    updateLastLogin() {
        const lastLoginElement = document.getElementById('last-login-date');
        
        if (!lastLoginElement || !auth.currentUser) return;
        
        // Get last login from localStorage
        const lastLoginStr = localStorage.getItem(`last_login_${auth.currentUser.id}`);
        
        if (lastLoginStr) {
            const lastLogin = new Date(lastLoginStr);
            lastLoginElement.textContent = lastLogin.toLocaleDateString() + ' ' + lastLogin.toLocaleTimeString();
        } else {
            lastLoginElement.textContent = 'First Login';
        }
        
        // Update last login time
        localStorage.setItem(`last_login_${auth.currentUser.id}`, new Date().toISOString());
    }
    
    /**
     * Load user messages
     */
    loadMessages() {
        const messageList = document.getElementById('message-list');
        
        if (!messageList || !auth.currentUser) return;
        
        // Clear list
        messageList.innerHTML = '';
        
        // Show loading state
        messageList.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading messages...</p>
            </div>
        `;
        
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Filter messages for current user
        // Include messages sent to this user specifically or to all users
        const userMessages = messages.filter(message => 
            message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()
        );
        
        // Sort by timestamp (newest first)
        userMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Count unread messages
        const unreadCount = userMessages.filter(message => !message.read).length;
        
        // Update unread count display
        const unreadCountElement = document.getElementById('unread-count');
        if (unreadCountElement) {
            unreadCountElement.textContent = unreadCount;
        }
        
        // Delay to simulate loading
        setTimeout(() => {
            // Clear loading state
            messageList.innerHTML = '';
            
            // Show empty state if no messages
            if (userMessages.length === 0) {
                messageList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-envelope-open"></i>
                        <p>No messages yet. Check back later!</p>
                    </div>
                `;
                return;
            }
            
            // Add messages to list
            userMessages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message-item';
                if (!message.read) {
                    messageElement.classList.add('unread');
                }
                messageElement.dataset.messageId = message.id;
                
                // Format date
                const date = new Date(message.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                messageElement.innerHTML = `
                    <div class="message-meta">
                        <div class="message-subject">${message.subject}</div>
                        <div class="message-date">${formattedDate}</div>
                    </div>
                    <div class="message-sender">From: ${message.senderName || 'Admin'}</div>
                    <div class="message-body">${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}</div>
                    ${!message.read ? '<div class="unread-badge">New</div>' : ''}
                `;
                
                // Open message in modal when clicked
                messageElement.addEventListener('click', () => {
                    this.openMessage(message);
                });
                
                messageList.appendChild(messageElement);
            });
        }, 600);
    }
    
    /**
     * Open message in modal
     */
    openMessage(message) {
        const modal = document.getElementById('message-view-modal');
        const subjectElement = document.getElementById('modal-message-subject');
        const senderElement = document.getElementById('modal-message-sender');
        const dateElement = document.getElementById('modal-message-date');
        const contentElement = document.getElementById('modal-message-content');
        
        if (!modal || !subjectElement || !senderElement || !dateElement || !contentElement) return;
        
        // Format date
        const date = new Date(message.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        // Set modal content
        subjectElement.textContent = message.subject;
        senderElement.textContent = message.senderName || 'Admin';
        dateElement.textContent = formattedDate;
        contentElement.textContent = message.content;
        
        // Mark message as read if it's not already
        if (!message.read) {
            this.markMessageAsRead(message.id);
        }
        
        // Show modal
        modal.classList.add('show');
        
        // Handle close buttons
        const closeBtn = document.getElementById('close-message-modal');
        const closeButton = document.getElementById('close-message-btn');
        const replyButton = document.getElementById('reply-message-btn');
        
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove('show');
            };
        }
        
        if (closeButton) {
            closeButton.onclick = () => {
                modal.classList.remove('show');
            };
        }
        
        if (replyButton) {
            replyButton.onclick = () => {
                modal.classList.remove('show');
                // In a real app, this would open a reply form
                window.ui.showToast('Reply functionality coming soon!', 'info');
            };
        }
        
        // Handle click outside modal
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        };
    }
    
    /**
     * Mark a message as read
     */
    markMessageAsRead(messageId) {
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Find and update the message
        const messageIndex = messages.findIndex(message => message.id === messageId);
        if (messageIndex !== -1) {
            messages[messageIndex].read = true;
            
            // Save back to localStorage
            localStorage.setItem('messages', JSON.stringify(messages));
            
            // Update UI
            const messageElement = document.querySelector(`.message-item[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.classList.remove('unread');
                const unreadBadge = messageElement.querySelector('.unread-badge');
                if (unreadBadge) unreadBadge.remove();
            }
            
            // Update unread count
            this.updateUnreadCount();
            
            // Update sidebar message count
            this.updateSidebarMessageCount();
            
            // Update notifications
            this.updateNotifications();
        }
    }
    
    /**
     * Mark all messages as read
     */
    markAllMessagesAsRead() {
        if (!auth.currentUser) return;
        
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Filter messages for current user
        const userMessages = messages.filter(message => 
            (message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()) &&
            !message.read
        );
        
        if (userMessages.length === 0) {
            window.ui.showToast('No unread messages', 'info');
            return;
        }
        
        // Update all unread messages
        let updated = false;
        messages = messages.map(message => {
            if ((message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()) &&
                !message.read) {
                updated = true;
                return { ...message, read: true };
            }
            return message;
        });
        
        if (updated) {
            // Save back to localStorage
            localStorage.setItem('messages', JSON.stringify(messages));
            
            // Refresh messages
            this.loadMessages();
            
            // Update unread count
            this.updateUnreadCount();
            
            // Update sidebar message count
            this.updateSidebarMessageCount();
            
            // Update notifications
            this.updateNotifications();
            
            window.ui.showToast('All messages marked as read', 'success');
        }
    }
    
    /**
     * Update unread message count
     */
    updateUnreadCount() {
        if (!auth.currentUser) return;
        
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Filter messages for current user
        const userMessages = messages.filter(message => 
            message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()
        );
        
        // Count unread messages
        const unreadCount = userMessages.filter(message => !message.read).length;
        
        // Update unread count display
        const unreadCountElement = document.getElementById('unread-count');
        if (unreadCountElement) {
            unreadCountElement.textContent = unreadCount;
        }
    }
    
    /**
     * Update sidebar message count
     */
    updateSidebarMessageCount() {
        if (!auth.currentUser) return;
        
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Filter messages for current user
        const userMessages = messages.filter(message => 
            message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()
        );
        
        // Count unread messages
        const unreadCount = userMessages.filter(message => !message.read).length;
        
        // Update sidebar badge
        const sidebarBadge = document.getElementById('sidebar-messages-count');
        if (sidebarBadge) {
            sidebarBadge.textContent = unreadCount;
            sidebarBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }
    
    /**
     * Update notifications
     */
    updateNotifications() {
        if (!auth.currentUser) return;
        
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Filter messages for current user
        const userMessages = messages.filter(message => 
            message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()
        );
        
        // Count unread messages
        const unreadMessages = userMessages.filter(message => !message.read);
        
        // Update notification badge
        const notificationBadge = document.getElementById('notification-count');
        if (notificationBadge) {
            notificationBadge.textContent = unreadMessages.length;
            notificationBadge.style.display = unreadMessages.length > 0 ? 'flex' : 'none';
        }
        
        // Update notification dropdown
        const notificationsList = document.getElementById('notifications-list');
        if (notificationsList) {
            // Clear list
            notificationsList.innerHTML = '';
            
            // Show empty state if no unread messages
            if (unreadMessages.length === 0) {
                notificationsList.innerHTML = `
                    <div class="empty-notification">No new notifications</div>
                `;
                return;
            }
            
            // Add notifications to list (max 5)
            unreadMessages.slice(0, 5).forEach(message => {
                const notificationElement = document.createElement('div');
                notificationElement.className = 'notification-item';
                
                // Format date
                const date = new Date(message.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                notificationElement.innerHTML = `
                    <div class="notification-title">${message.subject}</div>
                    <div class="notification-meta">
                        <span class="notification-sender">From: ${message.senderName || 'Admin'}</span>
                        <span class="notification-date">${formattedDate}</span>
                    </div>
                `;
                
                // Open message when clicked
                notificationElement.addEventListener('click', () => {
                    // Mark message as read
                    this.markMessageAsRead(message.id);
                    
                    // Open message in modal
                    this.openMessage(message);
                    
                    // Close dropdown
                    const dropdown = document.getElementById('notifications-dropdown');
                    if (dropdown) dropdown.classList.remove('show');
                });
                
                notificationsList.appendChild(notificationElement);
            });
            
            // Add "View All" link if there are more than 5 notifications
            if (unreadMessages.length > 5) {
                const viewAllElement = document.createElement('div');
                viewAllElement.className = 'view-all';
                viewAllElement.innerHTML = `
                    <a href="#" class="view-all-link">View all ${unreadMessages.length} notifications</a>
                `;
                
                // Open messages tab when clicked
                viewAllElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showTab('messages');
                    
                    // Close dropdown
                    const dropdown = document.getElementById('notifications-dropdown');
                    if (dropdown) dropdown.classList.remove('show');
                });
                
                notificationsList.appendChild(viewAllElement);
            }
        }
    }
    
    /**
     * Setup tab navigation
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.showTab(tabId);
            });
        });
        
        // Handle hash in URL for direct tab access
        const hash = window.location.hash.substring(1);
        if (hash) {
            const tabId = hash;
            this.showTab(tabId);
        }
        
        // Set up mark all read button
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllMessagesAsRead();
            });
        }
        
        // Set up refresh messages button
        const refreshMessagesBtn = document.getElementById('refresh-messages');
        if (refreshMessagesBtn) {
            refreshMessagesBtn.addEventListener('click', () => {
                this.loadMessages();
            });
        }
        
        // Set up mark all read in dropdown
        const markAllReadDropdownBtn = document.getElementById('mark-all-read');
        if (markAllReadDropdownBtn) {
            markAllReadDropdownBtn.addEventListener('click', () => {
                this.markAllMessagesAsRead();
                
                // Close dropdown
                const dropdown = document.getElementById('notifications-dropdown');
                if (dropdown) dropdown.classList.remove('show');
            });
        }
    }
    
    /**
     * Show a specific tab
     */
    showTab(tabId) {
        // Update URL hash
        window.location.hash = tabId;
        
        // Hide all tabs and deactivate buttons
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabContents.forEach(tab => tab.classList.remove('active'));
        tabButtons.forEach(button => button.classList.remove('active'));
        
        // Show selected tab and activate button
        const selectedTab = document.getElementById(`${tabId}-tab`);
        const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedButton) selectedButton.classList.add('active');
        
        // Refresh tab content if needed
        if (tabId === 'messages') {
            this.loadMessages();
        } else if (tabId === 'profile') {
            this.loadProfileData();
        }
    }
    
    /**
     * Load profile data into form
     */
    loadProfileData() {
        if (!auth.currentUser) return;
        
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        
        if (usernameInput) usernameInput.value = auth.currentUser.username;
        if (emailInput) emailInput.value = auth.currentUser.email;
        if (nameInput) nameInput.value = auth.currentUser.name || '';
        
        // Check Telegram connection status
        const isTelegramConnected = localStorage.getItem(`telegram_chat_id_${auth.currentUser.username}`);
        const telegramStatusElement = document.getElementById('telegram-status');
        const telegramStatusDot = document.getElementById('telegram-status-dot');
        
        if (telegramStatusElement) {
            telegramStatusElement.textContent = isTelegramConnected ? 'Connected' : 'Not Connected';
        }
        
        if (telegramStatusDot) {
            telegramStatusDot.className = isTelegramConnected ? 'status-dot online' : 'status-dot offline';
        }
        
        // Toggle disconnect button
        const disconnectBtn = document.getElementById('disconnect-telegram');
        if (disconnectBtn) {
            disconnectBtn.style.display = isTelegramConnected ? 'block' : 'none';
            disconnectBtn.addEventListener('click', this.disconnectTelegram.bind(this));
        }
    }
    
    /**
     * Disconnect from Telegram
     */
    async disconnectTelegram() {
        if (!auth.currentUser) return;
        
        // Confirm disconnection
        const confirmed = await window.ui.showConfirmDialog({
            title: 'Disconnect Telegram',
            message: 'Are you sure you want to disconnect your Telegram account? You will no longer receive notifications.',
            confirmText: 'Disconnect',
            cancelText: 'Cancel',
            type: 'warning'
        });
        
        if (!confirmed) return;
        
        // Remove Telegram connection
        localStorage.removeItem(`telegram_chat_id_${auth.currentUser.username}`);
        
        // Update UI
        const telegramStatusElement = document.getElementById('telegram-status');
        const telegramStatusDot = document.getElementById('telegram-status-dot');
        
        if (telegramStatusElement) {
            telegramStatusElement.textContent = 'Not Connected';
        }
        
        if (telegramStatusDot) {
            telegramStatusDot.className = 'status-dot offline';
        }
        
        // Hide disconnect button
        const disconnectBtn = document.getElementById('disconnect-telegram');
        if (disconnectBtn) {
            disconnectBtn.style.display = 'none';
        }
        
        window.ui.showToast('Telegram disconnected successfully', 'success');
    }
    
    /**
     * Initialize toggle password functionality
     */
    initTogglePassword() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const passwordInput = this.closest('.input-with-icon').querySelector('input');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            });
        });
        
        // Setup profile update form
        this.setupProfileForm();
    }
    
    /**
     * Setup profile update form
     */
    setupProfileForm() {
        const updateProfileForm = document.getElementById('update-profile-form');
        
        if (updateProfileForm) {
            updateProfileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const name = document.getElementById('name').value;
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const errorElement = document.getElementById('update-profile-error');
                
                // Clear previous error
                if (errorElement) errorElement.textContent = '';
                
                // Validate current password
                if (!currentPassword) {
                    if (errorElement) errorElement.textContent = 'Current password is required';
                    return;
                }
                
                // Check if current password is correct
                if (currentPassword !== auth.currentUser.password) {
                    if (errorElement) errorElement.textContent = 'Current password is incorrect';
                    return;
                }
                
                // Show loading on button
                const submitButton = updateProfileForm.querySelector('button[type="submit"]');
                if (submitButton) window.ui.showLoading(submitButton);
                
                try {
                    // Create update data
                    const updateData = {
                        email,
                        name
                    };
                    
                    // Add new password if provided
                    if (newPassword) {
                        updateData.password = newPassword;
                    }
                    
                    // Update profile
                    await auth.updateProfile(updateData);
                    
                    // Show success message
                    window.ui.showToast('Profile updated successfully', 'success');
                    
                    // Update profile data
                    this.updateUserInfo();
                    
                    // Clear password fields
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                } catch (error) {
                    // Show error
                    if (errorElement) errorElement.textContent = error.message || error;
                } finally {
                    // Hide loading
                    if (submitButton) window.ui.hideLoading(submitButton);
                }
            });
        }
    }
}

// Initialize user dashboard
const userDashboard = new UserDashboard();