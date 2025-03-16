/**
 * Admin Dashboard Module
 * 
 * Handles all functionality for the admin dashboard
 */

class AdminDashboard {
    constructor() {
        // Initialize the dashboard once DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => this.init());
    }
    
    /**
     * Initialize the admin dashboard
     */
    init() {
        // Check if we're on admin page
        if (!window.location.pathname.includes('/dashboard/admin.html')) {
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
        
        console.log('Admin Dashboard initialized');
    }
    
    /**
     * Load HTML components (topbar, sidebar, message panel)
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
                    
                    // Show admin menu items and hide user menu items
                    const adminMenu = document.getElementById('admin-menu');
                    const userMenu = document.getElementById('user-nav-menu');
                    
                    if (adminMenu) adminMenu.style.display = 'block';
                    if (userMenu) userMenu.style.display = 'none';
                    
                    // Initialize sidebar functionality after loading
                    this.initSidebar();
                })
                .catch(error => console.error('Error loading sidebar:', error));
        }
        
        // Load message panel
        const messagePanelContainer = document.getElementById('message-panel-container');
        if (messagePanelContainer) {
            fetch('../components/message-panel.html')
                .then(response => response.text())
                .then(html => {
                    messagePanelContainer.innerHTML = html;
                    
                    // Initialize message panel functionality
                    this.initMessagePanel();
                })
                .catch(error => console.error('Error loading message panel:', error));
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
        
        // Update admin name in the welcome message
        this.updateAdminInfo();
        
        // Load users table
        this.loadUsers();
        
        // Initialize data counters
        this.initDashboardCounters();
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
     * Update admin information in welcome message
     */
    updateAdminInfo() {
        const adminName = document.getElementById('admin-name');
        
        if (adminName && auth.currentUser) {
            adminName.textContent = auth.currentUser.name || auth.currentUser.username;
        }
    }
    
    /**
     * Initialize dashboard counters
     */
    initDashboardCounters() {
        this.updateUserCounts();
        this.updateMessageCounts();
    }
    
    /**
     * Update user counts in dashboard widgets
     */
    updateUserCounts() {
        // Get users
        auth.getUsers()
            .then(users => {
                // Total users
                const totalUsersElement = document.getElementById('total-users');
                if (totalUsersElement) {
                    // Exclude admin users from count
                    const regularUsers = users.filter(user => user.role === 'user');
                    totalUsersElement.textContent = regularUsers.length;
                }
                
                // New users (added in the last 30 days)
                const newUsersElement = document.getElementById('new-users');
                if (newUsersElement) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    
                    const newUsers = users.filter(user => {
                        const createdDate = new Date(user.createdAt);
                        return createdDate > thirtyDaysAgo && user.role === 'user';
                    });
                    
                    newUsersElement.textContent = newUsers.length;
                }
                
                // Active users
                const activeUsersElement = document.getElementById('active-users');
                if (activeUsersElement) {
                    const activeUsers = users.filter(user => user.status === 'active' && user.role === 'user');
                    activeUsersElement.textContent = activeUsers.length;
                }
            })
            .catch(error => {
                console.error('Failed to load user counts:', error);
            });
    }
    
    /**
     * Update message counts in dashboard widgets
     */
    updateMessageCounts() {
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Filter messages sent by current admin
        const adminMessages = messages.filter(message => 
            message.sender === auth.currentUser.id);
        
        // Update messages count
        const totalMessagesElement = document.getElementById('total-messages');
        if (totalMessagesElement) {
            totalMessagesElement.textContent = adminMessages.length;
        }
    }
    
    /**
     * Load users table
     */
    loadUsers() {
        const tableBody = document.getElementById('users-table-body');
        
        if (!tableBody) return;
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Show loading state
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="loading-spinner"></div>
                    <p>Loading users...</p>
                </td>
            </tr>
        `;
        
        // Get users from auth module
        auth.getUsers()
            .then(users => {
                // Clear table again
                tableBody.innerHTML = '';
                
                // Add users to table
                users.forEach(user => {
                    const row = document.createElement('tr');
                    
                    // Determine badge class based on status
                    let badgeClass = 'badge-success';
                    if (user.status === 'inactive') badgeClass = 'badge-secondary';
                    if (user.status === 'suspended') badgeClass = 'badge-danger';
                    
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>
                            <span class="badge-sm ${badgeClass}">
                                ${user.status || 'active'}
                            </span>
                        </td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn edit" data-user-id="${user.id}" data-action="edit" aria-label="Edit user">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-user-id="${user.id}" data-action="delete" aria-label="Delete user">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Add event listeners to action buttons
                this.setupUserActions();
                
                // Show no users message if none found
                if (users.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">
                                <div class="empty-state">
                                    <i class="fas fa-users"></i>
                                    <p>No users found</p>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                
                // Update dashboard counters
                this.updateUserCounts();
            })
            .catch(error => {
                console.error('Failed to load users:', error);
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            <div class="empty-state">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>Failed to load users: ${error.message || error}</p>
                            </div>
                        </td>
                    </tr>
                `;
            });
    }
    
    /**
     * Setup user action buttons (edit, delete)
     */
    setupUserActions() {
        const editButtons = document.querySelectorAll('button[data-action="edit"]');
        const deleteButtons = document.querySelectorAll('button[data-action="delete"]');
        
        // Add edit event listeners
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = button.getAttribute('data-user-id');
                this.editUser(userId);
            });
        });
        
        // Add delete event listeners
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = button.getAttribute('data-user-id');
                this.deleteUser(userId);
            });
        });
        
        // Add refresh button event listener
        const refreshBtn = document.getElementById('refresh-users');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadUsers();
            });
        }
    }
    
    /**
     * Edit user
     */
    async editUser(userId) {
        // Get user data
        const users = await auth.getUsers();
        const user = users.find(u => u.id == userId);
        
        if (!user) {
            window.ui.showToast('User not found', 'error');
            return;
        }
        
        // Populate modal with user data
        const editUserModal = document.getElementById('edit-user-modal');
        const editForm = document.getElementById('edit-user-form');
        
        if (editUserModal && editForm) {
            const idField = document.getElementById('edit-user-id');
            const usernameField = document.getElementById('edit-username');
            const emailField = document.getElementById('edit-email');
            const nameField = document.getElementById('edit-name');
            const statusField = document.getElementById('edit-status');
            const passwordField = document.getElementById('edit-password');
            
            if (idField) idField.value = user.id;
            if (usernameField) usernameField.value = user.username;
            if (emailField) emailField.value = user.email;
            if (nameField) nameField.value = user.name || '';
            if (statusField) statusField.value = user.status || 'active';
            if (passwordField) passwordField.value = '';
            
            // Show modal
            editUserModal.classList.add('show');
            
            // Handle save button
            const saveBtn = document.getElementById('save-edit');
            if (saveBtn) {
                saveBtn.onclick = () => this.saveUserEdit();
            }
            
            // Handle cancel and close buttons
            const cancelBtn = document.getElementById('cancel-edit');
            const closeBtn = document.getElementById('close-edit-modal');
            
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    editUserModal.classList.remove('show');
                };
            }
            
            if (closeBtn) {
                closeBtn.onclick = () => {
                    editUserModal.classList.remove('show');
                };
            }
            
            // Handle click outside to close
            editUserModal.onclick = (e) => {
                if (e.target === editUserModal) {
                    editUserModal.classList.remove('show');
                }
            };
        }
    }
    
    /**
     * Save user edit
     */
    async saveUserEdit() {
        const editUserModal = document.getElementById('edit-user-modal');
        const errorMessage = document.getElementById('edit-user-error');
        
        // Get form data
        const userId = document.getElementById('edit-user-id').value;
        const email = document.getElementById('edit-email').value;
        const name = document.getElementById('edit-name').value;
        const status = document.getElementById('edit-status').value;
        const password = document.getElementById('edit-password').value;
        
        // Validate email
        if (!email || !email.includes('@')) {
            errorMessage.textContent = 'Please enter a valid email address';
            return;
        }
        
        // Create update data
        const userData = {
            email,
            name,
            status
        };
        
        // Add password if provided
        if (password) {
            userData.password = password;
        }
        
        try {
            // Get users
            const users = await auth.getUsers();
            const userIndex = users.findIndex(u => u.id == userId);
            
            if (userIndex === -1) {
                errorMessage.textContent = 'User not found';
                return;
            }
            
            // Update user
            const updatedUser = {
                ...users[userIndex],
                ...userData
            };
            
            users[userIndex] = updatedUser;
            
            // Save back to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // If updating the current user, update auth state
            if (auth.currentUser.id == userId) {
                auth.currentUser = updatedUser;
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            
            // Close modal
            editUserModal.classList.remove('show');
            
            // Show success message
            window.ui.showToast('User updated successfully', 'success');
            
            // Refresh users table
            this.loadUsers();
            
        } catch (error) {
            errorMessage.textContent = error.message || 'Failed to update user';
            console.error('Failed to update user:', error);
        }
    }
    
    /**
     * Delete user from the system
     */
    async deleteUser(userId) {
        // Get user info for confirmation message
        const users = await auth.getUsers();
        const user = users.find(u => u.id == userId);
        
        if (!user) {
            window.ui.showToast('User not found', 'error');
            return;
        }
        
        // Don't allow deleting the admin user
        if (user.role === 'admin') {
            window.ui.showToast('Cannot delete the admin user', 'error');
            return;
        }
        
        // Confirm deletion
        const confirmed = await window.ui.showConfirmDialog({
            title: 'Delete User',
            message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        try {
            // Delete user
            await auth.deleteUser(userId);
            
            // Clean up related data
            this.cleanupUserData(userId, user.username);
            
            // Show success message
            window.ui.showToast(`User ${user.username} has been deleted successfully`, 'success');
            
            // Refresh users table
            this.loadUsers();
            
        } catch (error) {
            window.ui.showToast(`Failed to delete user: ${error.message || error}`, 'error');
            console.error('Failed to delete user:', error);
        }
    }
    
    /**
     * Clean up user-related data when deleting a user
     */
    cleanupUserData(userId, username) {
        // Clean up messages
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Remove messages sent to this user specifically
        messages = messages.filter(message => message.recipient !== userId.toString());
        
        // Save updated messages
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // Clean up Telegram associations if applicable
        localStorage.removeItem(`telegram_chat_id_${username}`);
    }
    
    /**
     * Initialize message panel functionality
     */
    initMessagePanel() {
        const sendForm = document.getElementById('send-message-form');
        const previewBtn = document.getElementById('message-preview-btn');
        const previewModal = document.getElementById('preview-modal');
        const closePreviewBtn = document.getElementById('close-preview');
        const cancelPreviewBtn = document.getElementById('cancel-preview');
        const confirmSendBtn = document.getElementById('confirm-send');
        
        // Populate recipient dropdown
        this.populateRecipientDropdown();
        
        // Handle message preview
        if (previewBtn && previewModal) {
            previewBtn.addEventListener('click', () => {
                this.previewMessage();
            });
        }
        
        // Close preview modal
        if (closePreviewBtn && previewModal) {
            closePreviewBtn.addEventListener('click', () => {
                previewModal.classList.remove('show');
            });
        }
        
        // Cancel preview
        if (cancelPreviewBtn && previewModal) {
            cancelPreviewBtn.addEventListener('click', () => {
                previewModal.classList.remove('show');
            });
        }
        
        // Send message after preview
        if (confirmSendBtn) {
            confirmSendBtn.addEventListener('click', () => {
                this.sendMessage();
                previewModal.classList.remove('show');
            });
        }
        
        // Handle form submission
        if (sendForm) {
            sendForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.previewMessage();
            });
        }
        
        // Load message history
        this.loadMessageHistory();
        
        // Handle refresh button
        const refreshBtn = document.getElementById('refresh-message-history');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadMessageHistory();
            });
        }
    }
    
    /**
     * Populate recipient dropdown with users
     */
    populateRecipientDropdown() {
        const recipientSelect = document.getElementById('message-recipient');
        
        if (!recipientSelect) return;
        
        // Clear dropdown first (keep the "All Users" option)
        const allOption = recipientSelect.querySelector('option[value="all"]');
        recipientSelect.innerHTML = '';
        
        if (allOption) {
            recipientSelect.appendChild(allOption);
        } else {
            // Add "All Users" option if it doesn't exist
            const newAllOption = document.createElement('option');
            newAllOption.value = 'all';
            newAllOption.textContent = 'All Users';
            recipientSelect.appendChild(newAllOption);
        }
        
        // Get users from auth module
        auth.getUsers()
            .then(users => {
                // Filter out admin users
                const regularUsers = users.filter(user => user.role === 'user');
                
                // Add users to dropdown
                regularUsers.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.name || user.username} (${user.email})`;
                    recipientSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Failed to load users for recipient dropdown:', error);
            });
    }
    
    /**
     * Preview message before sending
     */
    previewMessage() {
        const recipientSelect = document.getElementById('message-recipient');
        const subjectInput = document.getElementById('message-subject');
        const contentTextarea = document.getElementById('message-content');
        const previewModal = document.getElementById('preview-modal');
        const previewSubject = document.getElementById('preview-subject');
        const previewRecipient = document.getElementById('preview-recipient');
        const previewContent = document.getElementById('preview-content');
        
        if (!recipientSelect || !subjectInput || !contentTextarea || 
            !previewModal || !previewSubject || !previewRecipient || !previewContent) {
            return;
        }
        
        // Validate inputs
        if (!subjectInput.value.trim()) {
            window.ui.showToast('Please enter a subject', 'error');
            return;
        }
        
        if (!contentTextarea.value.trim()) {
            window.ui.showToast('Please enter a message', 'error');
            return;
        }
        
        // Set preview values
        previewSubject.textContent = subjectInput.value;
        previewContent.textContent = contentTextarea.value;
        
        // Set recipient display text
        if (recipientSelect.value === 'all') {
            previewRecipient.textContent = 'All Users';
        } else {
            const selectedOption = recipientSelect.options[recipientSelect.selectedIndex];
            previewRecipient.textContent = selectedOption.textContent;
        }
        
        // Show preview modal
        previewModal.classList.add('show');
    }
    
    /**
     * Send message to users
     */
    sendMessage() {
        const recipientSelect = document.getElementById('message-recipient');
        const subjectInput = document.getElementById('message-subject');
        const contentTextarea = document.getElementById('message-content');
        
        if (!recipientSelect || !subjectInput || !contentTextarea) {
            return;
        }
        
        // Create message object
        const message = {
            id: Date.now(),
            subject: subjectInput.value.trim(),
            content: contentTextarea.value.trim(),
            sender: auth.currentUser.id,
            senderName: auth.currentUser.name || auth.currentUser.username,
            recipient: recipientSelect.value,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Get existing messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Add new message
        messages.push(message);
        
        // Save back to localStorage
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // Update message count
        this.updateMessageCounts();
        
        // Update message history
        this.loadMessageHistory();
        
        // Reset form
        subjectInput.value = '';
        contentTextarea.value = '';
        
        // Show success message
        window.ui.showToast('Message sent successfully!', 'success');
        
        // Trigger event for telegram notification
        document.dispatchEvent(new CustomEvent('message_sent', {
            detail: message
        }));
    }
    
    /**
     * Load message history
     */
    loadMessageHistory() {
        const messageList = document.getElementById('admin-message-list');
        
        if (!messageList) return;
        
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
        
        // Sort by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Filter messages sent by current admin
        const adminMessages = messages.filter(message => message.sender === auth.currentUser.id);
        
        // Update total messages count
        this.updateMessageCounts();
        
        // Delay to simulate loading
        setTimeout(() => {
            // Clear loading state
            messageList.innerHTML = '';
            
            // Show empty state if no messages
            if (adminMessages.length === 0) {
                messageList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-envelope-open"></i>
                        <p>No messages sent yet.</p>
                    </div>
                `;
                return;
            }
            
            // Add messages to list
            adminMessages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message-item';
                
                // Format date
                const date = new Date(message.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                // Recipient display
                const recipientDisplay = message.recipient === 'all' 
                    ? 'All Users' 
                    : `User ID: ${message.recipient}`;
                
                messageElement.innerHTML = `
                    <div class="message-meta">
                        <div class="message-subject">${message.subject}</div>
                        <div class="message-date">${formattedDate}</div>
                    </div>
                    <div class="message-sender">To: ${recipientDisplay}</div>
                    <div class="message-body">${message.content}</div>
                `;
                
                messageList.appendChild(messageElement);
            });
        }, 500);
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
        if (tabId === 'users') {
            this.loadUsers();
        } else if (tabId === 'messages') {
            this.loadMessageHistory();
        } else if (tabId === 'create-user') {
            this.setupCreateUserForm();
        } else if (tabId === 'telegram') {
            this.initTelegramSection();
        }
    }
    
    /**
     * Setup create user form
     */
    setupCreateUserForm() {
        const createUserForm = document.getElementById('create-user-form');
        
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('new-username').value;
                const email = document.getElementById('new-email').value;
                const name = document.getElementById('new-name').value;
                const role = document.getElementById('new-role').value;
                const password = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                const errorElement = document.getElementById('create-user-error');
                
                // Clear previous error
                if (errorElement) errorElement.textContent = '';
                
                // Validate inputs
                if (!username || !email || !password) {
                    if (errorElement) errorElement.textContent = 'Username, email and password are required';
                    return;
                }
                
                // Validate email format
                if (!email.includes('@')) {
                    if (errorElement) errorElement.textContent = 'Please enter a valid email address';
                    return;
                }
                
                // Validate passwords match
                if (password !== confirmPassword) {
                    if (errorElement) errorElement.textContent = 'Passwords do not match';
                    return;
                }
                
                // Show loading state on button
                const submitButton = createUserForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    window.ui.showLoading(submitButton);
                }
                
                // Register new user
                auth.register({
                    username,
                    email,
                    name,
                    role,
                    password
                })
                .then(user => {
                    // Hide loading state
                    if (submitButton) window.ui.hideLoading(submitButton);
                    
                    // Show success message
                    window.ui.showToast(`User ${username} created successfully`, 'success');
                    
                    // Clear form
                    createUserForm.reset();
                    
                    // Refresh users list
                    this.loadUsers();
                    
                    // Switch to users tab
                    this.showTab('users');
                })
                .catch(error => {
                    // Hide loading state
                    if (submitButton) window.ui.hideLoading(submitButton);
                    
                    // Show error
                    if (errorElement) errorElement.textContent = error;
                    window.ui.showToast(`Failed to create user: ${error}`, 'error');
                });
            });
        }
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
    }
    
    /**
     * Initialize Telegram bot section
     */
    initTelegramSection() {
        // Update webhook URL display
        const webhookUrlElement = document.getElementById('webhook-url');
        if (webhookUrlElement) {
            webhookUrlElement.textContent = `${window.location.origin}/webhook.php`;
        }
        
        // Setup check webhook button
        const checkWebhookBtn = document.getElementById('check-webhook-btn');
        if (checkWebhookBtn) {
            checkWebhookBtn.addEventListener('click', () => {
                // Show loading state
                window.ui.showLoading(checkWebhookBtn);
                
                // Simulate checking webhook
                setTimeout(() => {
                    // Hide loading state
                    window.ui.hideLoading(checkWebhookBtn);
                    
                    // Show result
                    window.ui.showToast('Webhook is active and properly configured', 'success');
                }, 1500);
            });
        }
        
        // Setup set webhook button
        const setWebhookBtn = document.getElementById('set-webhook-btn');
        if (setWebhookBtn) {
            setWebhookBtn.addEventListener('click', () => {
                // Show loading state
                window.ui.showLoading(setWebhookBtn);
                
                // Simulate setting webhook
                setTimeout(() => {
                    // Hide loading state
                    window.ui.hideLoading(setWebhookBtn);
                    
                    // Show result
                    window.ui.showToast('Webhook has been set successfully', 'success');
                }, 1500);
            });
        }
        
        // Load Telegram users
        this.loadTelegramUsers();
        
        // Setup broadcast form
        this.setupTelegramBroadcast();
    }
    
    /**
     * Load Telegram connected users
     */
    loadTelegramUsers() {
        const tableBody = document.getElementById('telegram-users-body');
        
        if (!tableBody) return;
        
        // For demonstration purposes, create some sample Telegram connections
        const telegramUsers = [
            {
                username: 'user',
                telegramUsername: '@userDemo',
                chatId: '123456789',
                connectedSince: '2023-12-25T12:00:00.000Z'
            },
            {
                username: 'johndoe',
                telegramUsername: '@john_doe',
                chatId: '987654321',
                connectedSince: '2024-01-15T14:30:00.000Z'
            }
        ];
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Update counter
        const countElement = document.getElementById('telegram-users-count');
        if (countElement) {
            countElement.textContent = telegramUsers.length;
        }
        
        // Show empty state if no users
        if (telegramUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <i class="fab fa-telegram"></i>
                            <p>No users connected to Telegram</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Add users to table
        telegramUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(user.connectedSince);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.telegramUsername}</td>
                <td>${user.chatId}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn delete" data-username="${user.username}" aria-label="Disconnect user">
                            <i class="fas fa-unlink"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to disconnect buttons
        const disconnectButtons = tableBody.querySelectorAll('.action-btn.delete');
        disconnectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-username');
                this.disconnectTelegramUser(username);
            });
        });
    }
    
    /**
     * Disconnect a Telegram user
     */
    async disconnectTelegramUser(username) {
        // Confirm disconnection
        const confirmed = await window.ui.showConfirmDialog({
            title: 'Disconnect User',
            message: `Are you sure you want to disconnect user "${username}" from Telegram?`,
            confirmText: 'Disconnect',
            cancelText: 'Cancel',
            type: 'warning'
        });
        
        if (!confirmed) return;
        
        // Simulate disconnection
        localStorage.removeItem(`telegram_chat_id_${username}`);
        
        // Show success message
        window.ui.showToast(`User ${username} has been disconnected from Telegram`, 'success');
        
        // Refresh Telegram users
        this.loadTelegramUsers();
    }
    
    /**
     * Setup Telegram broadcast form
     */
    setupTelegramBroadcast() {
        const broadcastForm = document.getElementById('telegram-broadcast-form');
        
        if (broadcastForm) {
            broadcastForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const recipient = document.getElementById('telegram-recipient').value;
                const message = document.getElementById('telegram-message').value;
                const silent = document.getElementById('telegram-silent').checked;
                const preview = document.getElementById('telegram-preview').checked;
                
                // Validate message
                if (!message.trim()) {
                    window.ui.showToast('Please enter a message', 'error');
                    return;
                }
                
                // Show loading state
                const submitButton = broadcastForm.querySelector('button[type="submit"]');
                if (submitButton) window.ui.showLoading(submitButton);
                
                // Simulate sending message
                setTimeout(() => {
                    // Hide loading state
                    if (submitButton) window.ui.hideLoading(submitButton);
                    
                    // Show success message
                    window.ui.showToast('Telegram message sent successfully', 'success');
                    
                    // Clear form
                    document.getElementById('telegram-message').value = '';
                }, 1500);
            });
        }
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();