/**
 * Login Page JavaScript
 * 
 * Handles login page functionality and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
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
    }
    
    // Handle forgot password
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const passwordResetModal = document.getElementById('password-reset-modal');
    const closeResetModal = document.getElementById('close-reset-modal');
    const cancelReset = document.getElementById('cancel-reset');
    const sendReset = document.getElementById('send-reset');
    
    if (forgotPasswordLink && passwordResetModal) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Pre-fill email if available
            const usernameInput = document.getElementById('username');
            const resetEmail = document.getElementById('reset-email');
            
            if (usernameInput && resetEmail && usernameInput.value && usernameInput.value.includes('@')) {
                resetEmail.value = usernameInput.value;
            }
            
            passwordResetModal.classList.add('show');
        });
    }
    
    if (closeResetModal && passwordResetModal) {
        closeResetModal.addEventListener('click', () => {
            passwordResetModal.classList.remove('show');
        });
    }
    
    if (cancelReset && passwordResetModal) {
        cancelReset.addEventListener('click', () => {
            passwordResetModal.classList.remove('show');
        });
    }
    
    if (sendReset && passwordResetModal) {
        sendReset.addEventListener('click', () => {
            const resetEmail = document.getElementById('reset-email');
            const resetSpinner = document.getElementById('reset-spinner');
            const resetError = document.getElementById('reset-error');
            
            if (!resetEmail || !resetEmail.value) {
                if (resetError) resetError.textContent = 'Please enter your email address';
                return;
            }
            
            // Show loading
            sendReset.disabled = true;
            if (resetSpinner) resetSpinner.style.display = 'inline-block';
            
            // Clear error message
            if (resetError) resetError.textContent = '';
            
            // Call reset password function
            auth.resetPassword(resetEmail.value)
                .then(() => {
                    // Hide modal
                    passwordResetModal.classList.remove('show');
                    
                    // Show success toast
                    if (window.ui && window.ui.showToast) {
                        window.ui.showToast('Password reset email sent. Please check your inbox.', 'success');
                    } else {
                        alert('Password reset email sent. Please check your inbox.');
                    }
                    
                    // Reset form
                    resetEmail.value = '';
                })
                .catch(error => {
                    if (resetError) resetError.textContent = error;
                })
                .finally(() => {
                    // Hide loading
                    sendReset.disabled = false;
                    if (resetSpinner) resetSpinner.style.display = 'none';
                });
        });
    }
    
    // Handle credential copy buttons
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            const password = this.getAttribute('data-password');
            
            // Fill the login form
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            if (usernameInput) usernameInput.value = username;
            if (passwordInput) passwordInput.value = password;
            
            // Flash the button for feedback
            const icon = this.querySelector('i');
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check');
            
            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-copy');
            }, 1500);
        });
    });
    
    // Handle click outside of modal to close
    window.addEventListener('click', (e) => {
        if (e.target === passwordResetModal) {
            passwordResetModal.classList.remove('show');
        }
    });
    
    // Auto-focus username input
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.focus();
    }
    
    // Initialize authentication
    // Already handled by auth.js
});