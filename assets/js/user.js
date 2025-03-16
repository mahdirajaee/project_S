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
        
        // Update user name in the welcome message
        this.updateUserInfo();
        
        // Load user messages
        this.loadMessages();
        
        // Setup tab navigation
        this.setupTabs();
        
        // Setup profile update form
        this.setupProfileForm();
        
        // Update last login information
        this.updateLastLogin();
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
        // Toggle sidebar on mobile
        const toggleBtn = document.getElementById('toggle-sidebar');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                document.body.classList.toggle('sidebar-open');
            });
        }
        
        // Set user initial and name
        const userInitial = document.getElementById('user-initial');
        const displayName = document.getElementById('display-name');
        
        if (userInitial && displayName && auth.currentUser) {
            userInitial.textContent = auth.currentUser.name ? auth.currentUser.name.charAt(0) : auth.currentUser.username.charAt(0);
            displayName.textContent = auth.currentUser.name || auth.currentUser.username;
        }
        
        // Toggle user dropdown
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });
            
            // Close the dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }
        
        // Handle notifications
        this.updateNotifications();
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
        
        // Update sidebar message count
        this.updateSidebarMessageCount();
    }
    
    /**
     * Update user information in welcome message
     */
    updateUserInfo() {
        const userName = document.getElementById('user-name');
        
        if (userName && auth.currentUser) {
            userName.textContent = auth.currentUser.name || auth.currentUser.username;
        }
    }
    
    /**
     * Load user messages
     */
    loadMessages() {
        const messageList = document.getElementById('message-list');
        
        if (!messageList) return;
        
        // Clear list
        messageList.innerHTML = '';
        
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
        
        // Show empty state if no messages
        if (userMessages.length === 0) {
            messageList.innerHTML = `
                <div class="empty-state">
                    <img src="../assets/images/icons/empty-inbox.svg" alt="Empty Inbox">
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
                <div class="message-body">${message.content}</div>
                ${!message.read ? '<div class="unread-badge">New</div>' : ''}
            `;
            
            // Mark message as read when clicked
            messageElement.addEventListener('click', () => {
                this.markMessageAsRead(message.id);
                messageElement.classList.remove('unread');
                const unreadBadge = messageElement.querySelector('.unread-badge');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
            });
            
            messageList.appendChild(messageElement);
        });
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
            
            // Update unread count
            this.updateUnreadCount();
            
            // Update sidebar message count
            this.updateSidebarMessageCount();
            
            // Update notifications
            this.updateNotifications();
        }
    }
    
    /**
     * Update unread message count
     */
    updateUnreadCount() {
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
                
                // Open messages tab when clicked
                notificationElement.addEventListener('click', () => {
                    this.showTab('messages');
                    this.markMessageAsRead(message.id);
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
                });
                
                notificationsList.appendChild(viewAllElement);
            }
        }
        
        // Toggle notification dropdown
        const notificationsBtn = document.getElementById('notifications-btn');
        const notificationsDropdown = document.getElementById('notifications-dropdown');
        
        if (notificationsBtn && notificationsDropdown) {
            notificationsBtn.addEventListener('click', () => {
                notificationsDropdown.classList.toggle('show');
            });
            
            // Close the dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
                    notificationsDropdown.classList.remove('show');
                }
            });
        }
        
        // Mark all as read button
        const markAllReadBtn = document.getElementById('mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllMessagesAsRead();
            });
        }
    }
    
    /**
     * Mark all messages as read
     */
    markAllMessagesAsRead() {
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Update all messages for this user
        messages = messages.map(message => {
            if (message.recipient === 'all' || message.recipient === auth.currentUser.id.toString()) {
                message.read = true;
            }
            return message;
        });
        
        // Save back to localStorage
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // Refresh UI
        this.loadMessages();
        this.updateSidebarMessageCount();
        this.updateNotifications();
    }
    
    /**
     * Update last login information
     */
    updateLastLogin() {
        const lastLoginElement = document.getElementById('last-login-date');
        
        if (!lastLoginElement) return;
        
        // Get last login from localStorage
        const lastLoginStr = localStorage.getItem('last_login_' + auth.currentUser.id);
        
        if (lastLoginStr) {
            const lastLogin = new Date(lastLoginStr);
            lastLoginElement.textContent = lastLogin.toLocaleDateString() + ' ' + lastLogin.toLocaleTimeString();
        } else {
            lastLoginElement.textContent = 'First Login';
        }
        
        // Update last login time
        localStorage.setItem('last_login_' + auth.currentUser.id, new Date().toISOString());
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
    }
    
    /**
     * Show a specific tab
     */
    showTab(tabId) {
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
     * Setup profile update form
     */
    setupProfileForm() {
        const updateProfileForm = document.getElementById('update-profile-form');
        
        if (updateProfileForm) {
            // Load profile data into form
            this.loadProfileData();
            
            // Handle form submission
            updateProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const errorElement = document.getElementById('update-profile-error');
                
                // Validate current password
                if (currentPassword !== 'user123') {
                    errorElement.textContent = 'Current password is incorrect';
                    return;
                }
                
                // In a real app, you would make an API call to update the profile
                alert('Profile updated successfully');
                
                // Update user email in localStorage
                const user = auth.currentUser;
                user.email = email;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Clear error and password fields
                errorElement.textContent = '';
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
            });
        }
    }
    
    /**
     * Load profile data into form
     */
    loadProfileData() {
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        
        if (usernameInput && emailInput && auth.currentUser) {
            usernameInput.value = auth.currentUser.username;
            emailInput.value = auth.currentUser.email;
        }
    }
}

// Initialize user dashboard
const userDashboard = new UserDashboard();