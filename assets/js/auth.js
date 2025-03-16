/**
 * Simplified Authentication Module
 */

class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = null;
        this.role = null;
        
        // Check if user is already logged in
        this.checkAuth();
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
                
                // Redirect to login if not authenticated and not on login page
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
     * Login user with username and password
     */
    login(username, password) {
        // Get users from localStorage
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Set authentication state
            this.setAuth(user, Date.now().toString());
            
            // Redirect based on role
            this.redirectBasedOnRole();
            return true;
        }
        
        return false;
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
        
        // Store last login time
        localStorage.setItem(`last_login_${user.id}`, new Date().toISOString());
    }
    
    /**
     * Logout user
     */
    logout() {
        // Clear local state
        this.currentUser = null;
        this.token = null;
        this.role = null;
        this.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login.html';
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
        
        if (path.includes('/dashboard/')) {
            if (this.role === 'admin' && path.includes('/dashboard/user.html')) {
                window.location.href = '/dashboard/admin.html';
            } else if (this.role === 'user' && path.includes('/dashboard/admin.html')) {
                window.location.href = '/dashboard/user.html';
            }
        }
    }
    
    /**
     * Get all users (admin only)
     */
    async getUsers() {
        if (!this.isAuthenticated || this.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        
        return new Promise((resolve) => {
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
                        password: 'admin123',
                        createdAt: '2024-03-01T00:00:00.000Z',
                        status: 'active'
                    },
                    {
                        id: 2,
                        username: 'user',
                        name: 'Demo User',
                        email: 'user@example.com',
                        role: 'user',
                        password: 'user123',
                        createdAt: '2024-03-01T00:00:00.000Z',
                        status: 'active'
                    }
                ];
                
                // Save to localStorage
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            resolve(users);
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
            
            // Create new user
            const newUser = {
                id: Date.now(),
                username: userData.username,
                email: userData.email,
                name: userData.name || userData.username,
                role: userData.role || 'user',
                password: userData.password,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            // Add to users array
            users.push(newUser);
            
            // Save back to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            resolve(newUser);
            
            // Dispatch event for user creation
            document.dispatchEvent(new CustomEvent('user_created', {
                detail: newUser
            }));
        });
    }
    
    /**
     * Delete a user (admin only)
     */
    deleteUser(userId) {
        if (!this.isAuthenticated || this.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        
        return new Promise((resolve, reject) => {
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
        });
    }
}

// Initialize authentication
const auth = new Auth();

// Make auth available globally
window.auth = auth;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
}