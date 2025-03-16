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
        
        // Update admin name in the welcome message
        this.updateAdminInfo();
        
        // Load users table
        this.loadUsers();
        
        // Initialize message panel
        this.initMessagePanel();
        
        // Setup tab navigation
        this.setupTabs();
        
        // Setup create user form
        this.setupCreateUserForm();
        
        // Initialize Telegram bot section
        this.initTelegramSection();
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
                    
                    // Hide user menu items and show admin menu items
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
            userInitial.textContent = auth.currentUser.name.charAt(0);
            displayName.textContent = auth.currentUser.name;
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
    }
    
    /**
     * Update admin information in welcome message
     */
    updateAdminInfo() {
        const adminName = document.getElementById('admin-name');
        
        if (adminName && auth.currentUser) {
            adminName.textContent = auth.currentUser.name;
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
                    <div class="spinner"></div>
                </td>
            </tr>
        `;
        
        // Get users from auth module
        auth.getUsers()
            .then(users => {
                // Update total users count
                const totalUsersElement = document.getElementById('total-users');
                if (totalUsersElement) {
                    totalUsersElement.textContent = users.length;
                }
                
                // Clear table again
                tableBody.innerHTML = '';
                
                // Add users to table
                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>
                            <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                ${user.status || 'active'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline" data-user-id="${user.id}" data-action="edit">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger" data-user-id="${user.id}" data-action="delete">
                                Delete
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Add event listeners to action buttons
                this.setupUserActions();
            })
            .catch(error => {
                console.error('Failed to load users:', error);
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">
                            Failed to load users: ${error}
                        </td>
                    </tr>
                `;
            });
    }
    
    /**
     * Setup user action buttons (edit, delete)
     */
    setupUserActions() {
        const actionButtons = document.querySelectorAll('button[data-action]');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-user-id');
                const action = button.getAttribute('data-action');
                
                if (action === 'edit') {
                    this.editUser(userId);
                } else if (action === 'delete') {
                    this.deleteUser(userId);
                }
            });
        });
    }
    
    /**
     * Edit user (placeholder)
     */
    editUser(userId) {
        alert(`Edit user ${userId} functionality would go here`);
        // In a real app, this would open a modal or redirect to an edit form
    }
    
    /**
     * Delete user from the system
     */
    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            // Get users from localStorage
            const usersStr = localStorage.getItem('users') || '[]';
            let users = JSON.parse(usersStr);
            
            // Find user index
            const userIndex = users.findIndex(user => user.id == userId);
            
            if (userIndex === -1) {
                alert('User not found.');
                return;
            }
            
            // Don't allow deleting the admin user
            if (users[userIndex].role === 'admin') {
                alert('Cannot delete the admin user.');
                return;
            }
            
            // Get username for reference
            const username = users[userIndex].username;
            
            // Remove user from array
            users.splice(userIndex, 1);
            
            // Save updated users list back to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Also clean up related data (messages, Telegram associations)
            this.cleanupUserData(userId, username);
            
            // Show success message
            ui.showToast(`User ${username} has been deleted successfully.`, 'success');
            
            // Refresh users table
            this.loadUsers();
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
    }
    
    /**
     * Populate recipient dropdown with users
     */
    populateRecipientDropdown() {
        const recipientSelect = document.getElementById('message-recipient');
        
        if (!recipientSelect) return;
        
        // Add "All Users" option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Users';
        recipientSelect.appendChild(allOption);
        
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
            alert('Please enter a subject');
            return;
        }
        
        if (!contentTextarea.value.trim()) {
            alert('Please enter a message');
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
        const totalMessagesElement = document.getElementById('total-messages');
        if (totalMessagesElement) {
            totalMessagesElement.textContent = messages.length;
        }
        
        // Update message history
        this.loadMessageHistory();
        
        // Reset form
        subjectInput.value = '';
        contentTextarea.value = '';
        
        // Show success message
        alert('Message sent successfully!');
    }
    
    /**
     * Load message history
     */
    loadMessageHistory() {
        const messageList = document.getElementById('admin-message-list');
        
        if (!messageList) return;
        
        // Clear list
        messageList.innerHTML = '';
        
        // Get messages from localStorage
        const messagesStr = localStorage.getItem('messages') || '[]';
        let messages = JSON.parse(messagesStr);
        
        // Sort by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Filter messages sent by current admin
        const adminMessages = messages.filter(message => message.sender === auth.currentUser.id);
        
        // Update total messages count
        const totalMessagesElement = document.getElementById('total-messages');
        if (totalMessagesElement) {
            totalMessagesElement.textContent = adminMessages.length;
        }
        
        // Show empty state if no messages
        if (adminMessages.length === 0) {
            messageList.innerHTML = `
                <div class="empty-state">
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
                <div class="message-recipient">To: ${recipientDisplay}</div>
                <div class="message-body">${message.content}</div>
            `;
            
            messageList.appendChild(messageElement);
        });
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
        if (tabId === 'users') {
            this.loadUsers();
        } else if (tabId === 'messages') {
            this.loadMessageHistory();
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
                const password = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                const errorElement = document.getElementById('create-user-error');
                
                // Validate passwords match
                if (password !== confirmPassword) {
                    errorElement.textContent = 'Passwords do not match';
                    return;
                }
                
                // Register new user
                auth.register({
                    username,
                    email,
                    password
                })
                .then(user => {
                    // Show success message
                    alert(`User ${username} created successfully`);
                    
                    // Clear form
                    createUserForm.reset();
                    errorElement.textContent = '';
                    
                    // Refresh users list
                    this.loadUsers();
                    
                    // Switch to users tab
                    this.showTab('users');
                })
                .catch(error => {
                    errorElement.textContent = error;
                });
            });
        }
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();