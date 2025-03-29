// Login Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Basic validation
            if (!email || !password) {
                auth.showAlert('Please fill in all fields', 'error');
                return;
            }

            try {
                auth.showSpinner('loginBtn');
                await auth.login(email, password);
                window.location.href = '/dashboard.html';
            } catch (err) {
                auth.showAlert(err.message, 'error');
            } finally {
                auth.hideSpinner('loginBtn');
            }
        });
    }

    // Check if user is already authenticated
    if (auth.isAuthenticated) {
        window.location.href = '/dashboard.html';
    }
}); 