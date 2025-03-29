// Register Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const referralCodeInput = document.getElementById('referralCode');
    const registerBtn = document.getElementById('registerBtn');

    // Pre-fill referral code if available
    const storedReferralCode = localStorage.getItem('referralCode');
    if (storedReferralCode && referralCodeInput) {
        referralCodeInput.value = storedReferralCode;
        localStorage.removeItem('referralCode'); // Clear stored code after using it
    }

    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const referralCode = referralCodeInput.value.trim();

            // Basic validation
            if (!name || !email || !password || !confirmPassword) {
                auth.showAlert('Please fill in all required fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                auth.showAlert('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                auth.showAlert('Password must be at least 6 characters long', 'error');
                return;
            }

            try {
                auth.showSpinner('registerBtn');
                await auth.register(name, email, password, referralCode);
                window.location.href = '/dashboard.html';
            } catch (err) {
                auth.showAlert(err.message, 'error');
            } finally {
                auth.hideSpinner('registerBtn');
            }
        });
    }

    // Check if user is already authenticated
    if (auth.isAuthenticated) {
        window.location.href = '/dashboard.html';
    }
}); 