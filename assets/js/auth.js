/**
 * Authentication Module
 * 
 * Handles user authentication, session management, and security
 * Using Firebase SDK v9 (modular)
 */

// Import Firebase auth functions
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut, 
    onAuthStateChanged
} from "firebase/auth";

// Import Firestore functions
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    query, 
    where, 
    serverTimestamp 
} from "firebase/firestore";

// Import Firebase instances from config
import { auth, db } from './firebase-config.js';

class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = null;
        this.role = null;
        this.useFirebase = true; // Set to true to use Firebase Authentication
        
        // Check if user is already logged in
        this.checkAuth();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Set up Firebase Authentication state change listener
        if (this.useFirebase) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in
                    console.log('Firebase user signed in:', user.email);
                    
                    // Get user data from Firestore
                    this.getUserFromFirestore(user.uid)
                        .then((userData) => {
                            if (userData) {
                                this.setAuth(userData, user.uid);
                            } else {
                                console.error('User data not found in Firestore');
                                this.logout();
                            }
                        })
                        .catch((error) => {
                            console.error('Error fetching user data:', error);
                            this.logout();
                        });
                } else {
                    // User is signed out
                    // Already handled by checkAuth
                }
            });
        }
    }
    
    /**
     * Initialize authentication state from localStorage or Firebase
     */
    checkAuth() {
        if (this.useFirebase) {
            // For Firebase, the onAuthStateChanged listener will handle auth state
            const currentUser = auth.currentUser;
            
            if (currentUser) {
                // Already authenticated with Firebase, but we still need to load user data
                // This is handled by the onAuthStateChanged listener
                console.log('User already authenticated with Firebase');
            } else if (!window.location.pathname.includes('login.html')) {
                // Not authenticated and not on login page, redirect to login
                console.log('Not authenticated, redirecting to login');
                window.location.href = '/login.html';
            }
        } else {
            // Traditional localStorage auth
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
    }
    
    /**
     * Attach event listeners for login, logout, etc.
     */
    attachEventListeners() {
        // Login form submission
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                this.login(username, password);
            });
            
            // Add enter key support for login
            document.getElementById('password').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    this.login(username, password);
                }
            });
        }
        
        // Use document-level event delegation for logout buttons
        // This ensures the event works even if elements are loaded dynamically
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
        
        if (this.useFirebase) {
            // Show loading state
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn && window.ui) {
                window.ui.showLoading(loginBtn);
            } else if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Logging in...';
            }
            
            // First, check if the input is an email or username
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
            
            if (isEmail) {
                // If it's an email, directly sign in with Firebase
                this.loginWithFirebase(usernameOrEmail, password);
            } else {
                // If it's a username, we need to query Firestore to get the email
                this.getUserEmailByUsername(usernameOrEmail)
                    .then(email => {
                        if (email) {
                            this.loginWithFirebase(email, password);
                        } else {
                            this.showError('User not found');
                            
                            // Hide loading state
                            if (loginBtn && window.ui) {
                                window.ui.hideLoading(loginBtn);
                            } else if (loginBtn) {
                                loginBtn.disabled = false;
                                loginBtn.textContent = 'Login';
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error finding user email:', error);
                        this.showError('Failed to login. Please try again.');
                        
                        // Hide loading state
                        if (loginBtn && window.ui) {
                            window.ui.hideLoading(loginBtn);
                        } else if (loginBtn) {
                            loginBtn.disabled = false;
                            loginBtn.textContent = 'Login';
                        }
                    });
            }
        } else {
            // Fallback to local storage auth for development
            setTimeout(() => {
                // For demo purposes, we'll use hardcoded credentials
                if (usernameOrEmail === 'admin' && password === 'admin123') {
                    const user = {
                        id: 1,
                        username: 'admin',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'admin'
                    };
                    
                    this.setAuth(user, 'fake_admin_token');
                    this.redirectBasedOnRole();
                } else if (usernameOrEmail === 'user' && password === 'user123') {
                    const user = {
                        id: 2,
                        username: 'user',
                        name: 'Demo User',
                        email: 'user@example.com',
                        role: 'user'
                    };
                    
                    this.setAuth(user, 'fake_user_token');
                    this.redirectBasedOnRole();
                } else {
                    this.showError('Invalid username or password');
                }
            }, 500);
        }
    }
    
    /**
     * Login with Firebase Authentication
     */
    loginWithFirebase(email, password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in successfully
                const user = userCredential.user;
                console.log('Firebase login successful:', user.email);
                
                // The onAuthStateChanged listener will handle setting auth state
            })
            .catch((error) => {
                console.error('Firebase login error:', error);
                
                // Handle specific Firebase auth errors
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    this.showError('Invalid email or password');
                } else if (error.code === 'auth/too-many-requests') {
                    this.showError('Too many failed login attempts. Please try again later or reset your password.');
                } else {
                    this.showError('Login failed: ' + error.message);
                }
                
                // Hide loading state
                const loginBtn = document.getElementById('login-btn');
                if (loginBtn && window.ui) {
                    window.ui.hideLoading(loginBtn);
                } else if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            });
    }
    
    /**
     * Get user email by username from Firestore
     */
    async getUserEmailByUsername(username) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().email;
        }
        return null;
    }
    
    /**
     * Get user data from Firestore
     */
    async getUserFromFirestore(uid) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        return null;
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
            
            if (this.useFirebase) {
                // Check if username already exists in Firestore
                const usersRef = collection(db, 'users');
                const usernameQuery = query(usersRef, where('username', '==', userData.username));
                
                getDocs(usernameQuery)
                    .then(snapshot => {
                        if (!snapshot.empty) {
                            reject('Username already exists');
                            return;
                        }
                        
                        // Check if email already exists in Firestore
                        const emailQuery = query(usersRef, where('email', '==', userData.email));
                        
                        getDocs(emailQuery)
                            .then(snapshot => {
                                if (!snapshot.empty) {
                                    reject('Email already exists');
                                    return;
                                }
                                
                                // Create user in Firebase Authentication
                                createUserWithEmailAndPassword(auth, userData.email, userData.password)
                                    .then(userCredential => {
                                        const user = userCredential.user;
                                        
                                        // Create user document in Firestore
                                        const userDoc = {
                                            username: userData.username,
                                            email: userData.email,
                                            name: userData.name || userData.username,
                                            role: userData.role || 'user',
                                            status: 'active',
                                            createdAt: serverTimestamp()
                                        };
                                        
                                        // Save user to Firestore
                                        setDoc(doc(db, 'users', user.uid), userDoc)
                                            .then(() => {
                                                // Also save to localStorage for compatibility
                                                const localUser = {
                                                    id: user.uid,
                                                    ...userDoc
                                                };
                                                
                                                // Get existing users from localStorage
                                                const usersStr = localStorage.getItem('users') || '[]';
                                                let users = JSON.parse(usersStr);
                                                users.push(localUser);
                                                localStorage.setItem('users', JSON.stringify(users));
                                                
                                                resolve(localUser);
                                                
                                                // Dispatch event for user creation
                                                document.dispatchEvent(new CustomEvent('user_created', {
                                                    detail: localUser
                                                }));
                                            })
                                            .catch(error => {
                                                console.error('Error saving user to Firestore:', error);
                                                
                                                // If Firestore save fails, delete the auth user
                                                user.delete().then(() => {
                                                    reject('Failed to create user profile. Please try again.');
                                                });
                                            });
                                    })
                                    .catch(error => {
                                        console.error('Error creating user in Firebase:', error);
                                        
                                        if (error.code === 'auth/email-already-in-use') {
                                            reject('Email already in use');
                                        } else if (error.code === 'auth/weak-password') {
                                            reject('Password is too weak. Please use at least 6 characters.');
                                        } else {
                                            reject('Failed to create user: ' + error.message);
                                        }
                                    });
                            })
                            .catch(error => {
                                console.error('Error checking email existence:', error);
                                reject('Failed to validate email. Please try again.');
                            });
                    })
                    .catch(error => {
                        console.error('Error checking username existence:', error);
                        reject('Failed to validate username. Please try again.');
                    });
            } else {
                // Fallback to localStorage for development
                
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
                    id: Date.now(), // Simple way to generate unique ID
                    username: userData.username,
                    email: userData.email,
                    role: userData.role || 'user',
                    // In a real app, you would hash the password
                    password: userData.password,
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
                }, 500);
            }
        });
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
        
        // Redirect to dashboard if on login page
        if (window.location.pathname.includes('login.html')) {
            this.redirectBasedOnRole();
        }
        
        // Check role access
        this.checkRoleAccess();
        
        // Hide loading state on login button if it exists
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn && window.ui) {
            window.ui.hideLoading(loginBtn);
        } else if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }
    
    /**
     * Logout user
     */
    logout() {
        if (this.useFirebase) {
            signOut(auth)
                .then(() => {
                    // Clear local state
                    this.clearLocalAuth();
                    
                    // Redirect to login
                    window.location.href = '/login.html';
                })
                .catch((error) => {
                    console.error('Firebase logout error:', error);
                    
                    // Force clear local state and redirect anyway
                    this.clearLocalAuth();
                    window.location.href = '/login.html';
                });
        } else {
            // Clear local state
            this.clearLocalAuth();
            
            // Redirect to login
            window.location.href = '/login.html';
        }
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
        
        if (this.useFirebase) {
            try {
                // Get users from Firestore
                const usersRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersRef);
                
                const users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Also update localStorage for compatibility
                localStorage.setItem('users', JSON.stringify(users));
                
                return users;
            } catch (error) {
                console.error('Error getting users from Firestore:', error);
                
                // Try to fall back to localStorage
                const usersStr = localStorage.getItem('users');
                if (usersStr) {
                    return JSON.parse(usersStr);
                } else {
                    throw new Error('Failed to fetch users');
                }
            }
        } else {
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
                                createdAt: '2024-03-01T00:00:00.000Z',
                                status: 'active'
                            },
                            {
                                id: 2,
                                username: 'user',
                                name: 'Demo User',
                                email: 'user@example.com',
                                role: 'user',
                                createdAt: '2024-03-01T00:00:00.000Z',
                                status: 'active'
                            }
                        ];
                        
                        // Save to localStorage
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    
                    resolve(users);
                }, 500);
            });
        }
    }
    
    /**
     * Delete a user (admin only)
     */
    async deleteUser(userId) {
        if (!this.isAuthenticated || this.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        
        if (this.useFirebase) {
            try {
                // Get user from Firestore first
                const userRef = doc(db, 'users', userId);
                const docSnap = await getDoc(userRef);
                
                if (!docSnap.exists()) {
                    throw new Error('User not found');
                }
                
                const userData = docSnap.data();
                
                // Don't allow deleting the admin user
                if (userData.role === 'admin') {
                    throw new Error('Cannot delete admin user');
                }
                
                // Delete from Firestore
                await deleteDoc(userRef);
                console.log('User deleted from Firestore');
                
                // We also need to delete the user from Firebase Auth
                // This requires admin rights, which we don't have in client-side code
                // In a real app, you would use a Cloud Function or server-side API
                // For now, we'll just update the local storage
                
                // Update localStorage
                const usersStr = localStorage.getItem('users') || '[]';
                let users = JSON.parse(usersStr);
                users = users.filter(user => user.id !== userId);
                localStorage.setItem('users', JSON.stringify(users));
                
                return {
                    id: userId,
                    username: userData.username
                };
            } catch (error) {
                console.error('Error deleting user:', error);
                throw error;
            }
        } else {
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
    }
}

// Initialize authentication
const auth = new Auth();

// Export for module usage
export default auth;

// Also expose globally for legacy scripts
window.auth = auth;