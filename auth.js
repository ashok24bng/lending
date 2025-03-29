// Authentication Module
const auth = {
    isAuthenticated: false,
    user: null,

    // Initialize authentication state
    init() {
        const token = localStorage.getItem('token');
        if (token) {
            this.setAuthToken(token);
            this.checkAuth();
        }
        this.updateNavigation();
    },

    // Set authentication token
    setAuthToken(token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['x-auth-token'] = token;
    },

    // Check authentication status
    async checkAuth() {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/profile');
            this.user = res.data;
            this.isAuthenticated = true;
            this.updateNavigation();
        } catch (err) {
            this.logout();
        }
    },

    // Login user
    async login(email, password) {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });
            this.setAuthToken(res.data.token);
            await this.checkAuth();
            return true;
        } catch (err) {
            throw err.response?.data?.msg || 'Failed to login';
        }
    },

    // Register user
    async register(name, email, password, referralCode) {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                referralCode,
            });
            this.setAuthToken(res.data.token);
            await this.checkAuth();
            return true;
        } catch (err) {
            throw err.response?.data?.msg || 'Failed to create account';
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        this.user = null;
        this.isAuthenticated = false;
        this.updateNavigation();
    },

    // Update navigation based on auth state
    updateNavigation() {
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.isAuthenticated) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'block';
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.onclick = () => this.logout();
            }
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    },

    // Show alert message
    showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    },

    // Show loading spinner
    showSpinner(buttonId) {
        const button = document.getElementById(buttonId);
        const buttonText = document.getElementById(`${buttonId}Text`);
        const spinner = document.getElementById(`${buttonId}Spinner`);
        
        if (buttonText) buttonText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        if (button) button.disabled = true;
    },

    // Hide loading spinner
    hideSpinner(buttonId) {
        const button = document.getElementById(buttonId);
        const buttonText = document.getElementById(`${buttonId}Text`);
        const spinner = document.getElementById(`${buttonId}Spinner`);
        
        if (buttonText) buttonText.style.display = 'inline-block';
        if (spinner) spinner.style.display = 'none';
        if (button) button.disabled = false;
    }
};

// Initialize auth module
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
}); 