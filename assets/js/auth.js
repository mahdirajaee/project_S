/**
 * Authentication Module
 * 
 * Handles user authentication, session management, and security
 * Using a clean localStorage implementation for simplified management
 */

class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = null;
        this.role = null;
        
        // Check if user is already logged in
        this.checkAuth();
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    /**
     * Initialize authentication state from localStorage
     */
    checkAuth() {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                this.token = token;
                this.currentUser = JSON.parse(user);
                this.role = this.currentUser.role;
                this.isAuthenticated = true;
                
                // Redirect if on login page but already authenticated
                if (window.location.pathname.includes('login.html') && this.isAuthenticated) {
                    this.redirectBasedOnRole();
                }
                
                // Redirect if trying to access wrong dashboard
                this.checkRoleAccess();
                
            } catch (error) {
                console.error('Failed to parse user data:', error);
                this.logout();
            }
        } else if (!window.location.pathname.includes('login.html')) {
            // Redirect to login if not authenticated and not on login page
            window.location.href = '/login.html';
        }
    }
    
    /**
     * Attach event listeners for login, logout, etc.
     */
    attachEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                this.login(username, password);
            });
        }
        
        // Use document-level event delegation for logout buttons
        document.addEventListener('click', (e) => {
            // Match logout buttons by ID or parent element
            if (e.target.id === 'logout-btn' || 
                (e.target.parentElement && e.target.parentElement.id === 'logout-btn') ||
                e.target.id === 'sidebar-logout' || 
                (e.target.parentElement && e.target.parentElement.id === 'sidebar-logout')) {
                
                e.preventDefault();
                this.logout();
            }
        });
    }
    
    /**
     * Login user with username/email and password
     */
    login(usernameOrEmail, password) {
        if (!usernameOrEmail || !password) {
            this.showError('Please enter both username/email and password');
            return;
        }
        
        // Show loading state
        const loginBtn = document.getElementById('login-btn');
        const loginSpinner = document.getElementById('login-spinner');
        
        if (loginBtn) {
            loginBtn.disabled = true;
            if (loginSpinner) loginSpinner.style.display = 'inline-block';
            loginBtn.querySelector('.btn-text').textContent = 'Logging in...';
        }
        
        // Simulate network request with a short delay
        setTimeout(() => {
            // Get users from localStorage
            const usersStr = localStorage.getItem('users') || '[]';
            const users = JSON.parse(usersStr);
            
            // Check if input is email or username
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
            
            // Find user by username or email
            const user = users.find(u => 
                (isEmail && u.email === usernameOrEmail) || 
                (!isEmail && u.username === usernameOrEmail)
            );
            
            if (!user) {
                this.showError('User not found');
                if (loginBtn) {
                    loginBtn.disabled = false;
                    if (loginSpinner) loginSpinner.style.display = 'none';
                    loginBtn.querySelector('.btn-text').textContent = 'Login';
                }
                return;
            }
            
            // Check if password matches
            if (user.password !== password) {
                this.showError('Incorrect password');
                if (loginBtn) {
                    loginBtn.disabled = false;
                    if (loginSpinner) loginSpinner.style.display = 'none';
                    loginBtn.querySelector('.btn-text').textContent = 'Login';
                }
                return;
            }
            
            // Create a session token (in a real app, this would be a JWT)
            const token = this.generateToken();
            
            // Set authentication state
            this.setAuth(user, token);
            
            // Redirect based on role
            this.redirectBasedOnRole();
            
        }, 800); // Simulate network delay
    }
    
    /**
     * Generate a simple token
     * In a real app, this would be a proper JWT from a server
     */
    generateToken() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Set authentication state after successful login
     */
    setAuth(user, token) {
        this.currentUser = user;
        this.token = token;
        this.role = user.role;
        this.isAuthenticated = true;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store last login time for user
        localStorage.setItem(`last_login_${user.id}`, new Date().toISOString());
    }
    
    /**
     * Logout user
     */
    logout() {
        // Clear local state
        this.clearLocalAuth();
        
        // Redirect to login
        window.location.href = '/login.html';
    }
    
    /**
     * Clear local authentication state
     */
    clearLocalAuth() {
        this.currentUser = null;
        this.token = null;
        this.role = null;
        this.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }
    
    /**
     * Redirect user based on role
     */
    redirectBasedOnRole() {
        if (this.role === 'admin') {
            window.location.href = '/dashboard/admin.html';
        } else if (this.role === 'user') {
            window.location.href = '/dashboard/user.html';
        } else {
            // Default to login if role not recognized
            this.logout();
        }
    }
    
    /**
     * Check if user is trying to access the correct dashboard for their role
     */
    checkRoleAccess() {
        const path = window.location.pathname;
        
        if (this.role === 'admin' && path.includes('/dashboard/user.html')) {
            window.location.href = '/dashboard/admin.html';
        } else if (this.role === 'user' && path.includes('/dashboard/admin.html')) {
            window.location.href = '/dashboard/user.html';
        }
    }
    
    /**
     * Check if user has a specific role
     */
    hasRole(role) {
        return this.role === role;
    }
    
    /**
     * Show error message in login form
     */
    showError(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('animate-shake');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                errorElement.classList.remove('animate-shake');
            }, 500);
        }
    }
    
    /**
     * Get all users (admin only)
     */
    async getUsers() {
        if (!this.isAuthenticated || this.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        
        // Simulate API call to get users
        return new Promise((resolve) => {
            setTimeout(() => {
                // Get users from localStorage or use default if none exist
                const usersStr = localStorage.getItem('users');
                let users = [];
                
                if (usersStr) {
                    users = JSON.parse(usersStr);
                } else {
                    // Create default users if none exist
                    users = [
                        {
                            id: 1,
                            username: 'admin',
                            name: 'Admin User',
                            email: 'admin@example.com',
                            role: 'admin',
                            password: 'admin123', // In real app, would be hashed
                            createdAt: '2024-03-01T00:00:00.000Z',
                            status: 'active'
                        },
                        {
                            id: 2,
                            username: 'user',
                            name: 'Demo User',
                            email: 'user@example.com',
                            role: 'user',
                            password: 'user123', // In real app, would be hashed
                            createdAt: '2024-03-01T00:00:00.000Z',
                            status: 'active'
                        }
                    ];
                    
                    // Save to localStorage
                    localStorage.setItem('users', JSON.stringify(users));
                }
                
                resolve(users);
            }, 300);
        });
    }
    
    /**
     * Register a new user
     */
    register(userData) {
        return new Promise((resolve, reject) => {
            // Validate user data
            if (!userData.username || !userData.email || !userData.password) {
                reject('All fields are required');
                return;
            }
            
            // Get existing users from localStorage
            const usersStr = localStorage.getItem('users') || '[]';
            let users = JSON.parse(usersStr);
            
            // Check if username already exists
            const existingUser = users.find(u => u.username === userData.username);
            if (existingUser) {
                reject('Username already exists');
                return;
            }
            
            // Check if email already exists
            const existingEmail = users.find(u => u.email === userData.email);
            if (existingEmail) {
                reject('Email already exists');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(), // Simple way to generate unique ID
                username: userData.username,
                email: userData.email,
                name: userData.name || userData.username,
                role: userData.role || 'user',
                password: userData.password, // In a real app, would be hashed
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            // Add to users array
            users.push(newUser);
            
            // Save back to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Simulate delay
            setTimeout(() => {
                resolve(newUser);
                
                // Dispatch event for user creation
                document.dispatchEvent(new CustomEvent('user_created', {
                    detail: newUser
                }));
            }, 500);
        });
    }
    
    /**
     * Reset password
     */
    resetPassword(email) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject('Email is required');
                return;
            }
            
            // Get users from localStorage
            const usersStr = localStorage.getItem('users') || '[]';
            let users = JSON.parse(usersStr);
            
            // Find user by email
            const user = users.find(u => u.email === email);
            
            if (!user) {
                reject('User not found');
                return;
            }
            
            // In a real app, would send an email with a reset link
            // For this demo, we'll just simulate the process
            
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Password reset email sent'
                });
            }, 1000);
        });
    }
    
    /**
     * Delete a user (admin only)
     */
    deleteUser(userId) {
        if (!this.isAuthenticated || this.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        
        // Simulate API call to delete user
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Get users from localStorage
                const usersStr = localStorage.getItem('users') || '[]';
                let users = JSON.parse(usersStr);
                
                // Find user
                const userIndex = users.findIndex(user => user.id == userId);
                
                if (userIndex === -1) {
                    reject('User not found');
                    return;
                }
                
                // Don't allow deleting the admin user
                if (users[userIndex].role === 'admin') {
                    reject('Cannot delete admin user');
                    return;
                }
                
                // Store user data for return
                const deletedUser = {
                    id: users[userIndex].id,
                    username: users[userIndex].username
                };
                
                // Remove user
                users.splice(userIndex, 1);
                
                // Save back to localStorage
                localStorage.setItem('users', JSON.stringify(users));
                
                resolve(deletedUser);
            }, 500);
        });
    }
    
    /**
     * Update user profile
     */
    updateProfile(userData) {
        return new Promise((resolve, reject) => {
            if (!this.isAuthenticated) {
                reject('Not authenticated');
                return;
            }
            
            // Get users from localStorage
            const usersStr = localStorage.getItem('users') || '[]';
            let users = JSON.parse(usersStr);
            
            // Find user index
            const userIndex = users.findIndex(user => user.id === this.currentUser.id);
            
            if (userIndex === -1) {
                reject('User not found');
                return;
            }
            
            // Update user data
            const updatedUser = {
                ...users[userIndex],
                ...userData
            };
            
            // Update in array
            users[userIndex] = updatedUser;
            
            // Save back to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update current user
            this.currentUser = updatedUser;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Simulate delay
            setTimeout(() => {
                resolve(updatedUser);
            }, 500);
        });
    }
}

// Initialize authentication
const auth = new Auth();

// Make auth available globally
window.auth = auth;

// Export for module usage
export default auth;