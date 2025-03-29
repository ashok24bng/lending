// Dashboard Module
const dashboard = {
    // Initialize dashboard
    init() {
        this.loadUserProfile();
        this.loadTransactions();
        this.setupEventListeners();
    },

    // Load user profile data
    async loadUserProfile() {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/profile');
            const user = res.data;
            
            // Update profile information
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('referralCode').textContent = user.referralCode;
            document.getElementById('referralCount').textContent = user.referralCount;
            document.getElementById('referralEarnings').textContent = `Rs ${user.referralEarnings.toFixed(2)}`;
            
            // Update referral link
            const referralLink = `http://localhost:5000/register?ref=${user.referralCode}`;
            document.getElementById('referralLink').value = referralLink;
        } catch (err) {
            auth.showAlert('Failed to load profile data', 'error');
        }
    },

    // Load lending transactions
    async loadTransactions() {
        try {
            const res = await axios.get('http://localhost:5000/api/lending/transactions');
            const transactions = res.data;
            
            const tbody = document.querySelector('#transactionsTable tbody');
            tbody.innerHTML = '';
            
            transactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>Rs ${transaction.amount.toFixed(2)}</td>
                    <td>${transaction.interestRate}%</td>
                    <td>${new Date(transaction.startDate).toLocaleDateString()}</td>
                    <td>${new Date(transaction.endDate).toLocaleDateString()}</td>
                    <td>Rs ${transaction.interestEarned.toFixed(2)}</td>
                    <td>Rs ${transaction.totalAmount.toFixed(2)}</td>
                    <td><span class="status ${transaction.status}">${transaction.status}</span></td>
                    <td>
                        ${transaction.status === 'active' ? `
                            <button class="btn btn-danger btn-sm" onclick="dashboard.withdrawLending('${transaction._id}')">
                                Withdraw
                            </button>
                        ` : ''}
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (err) {
            auth.showAlert('Failed to load transactions', 'error');
        }
    },

    // Create new lending transaction
    async createLending(amount, paymentScreenshot) {
        try {
            auth.showSpinner('createLendingBtn');
            
            // Create form data for file upload
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('paymentScreenshot', paymentScreenshot);

            // Send request with file upload
            await axios.post('http://localhost:5000/api/lending/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            auth.showAlert('Payment submitted successfully. Waiting for admin approval.');
            this.loadTransactions();
        } catch (err) {
            auth.showAlert(err.response?.data?.msg || 'Failed to submit payment', 'error');
        } finally {
            auth.hideSpinner('createLendingBtn');
        }
    },

    // Withdraw lending transaction
    async withdrawLending(transactionId) {
        try {
            auth.showSpinner('withdrawBtn');
            await axios.post(`http://localhost:5000/api/lending/withdraw/${transactionId}`);
            auth.showAlert('Withdrawal successful');
            this.loadTransactions();
            this.loadUserProfile();
        } catch (err) {
            auth.showAlert(err.response?.data?.msg || 'Failed to withdraw', 'error');
        } finally {
            auth.hideSpinner('withdrawBtn');
        }
    },

    // Withdraw referral earnings
    async withdrawReferralEarnings() {
        try {
            auth.showSpinner('withdrawReferralBtn');
            await axios.post('http://localhost:5000/api/auth/withdraw-referral');
            auth.showAlert('Referral earnings withdrawn successfully');
            this.loadUserProfile();
        } catch (err) {
            auth.showAlert(err.response?.data?.msg || 'Failed to withdraw referral earnings', 'error');
        } finally {
            auth.hideSpinner('withdrawReferralBtn');
        }
    },

    // Copy referral link to clipboard
    copyReferralLink() {
        const referralLink = document.getElementById('referralLink');
        referralLink.select();
        document.execCommand('copy');
        auth.showAlert('Referral link copied to clipboard');
    },

    // Update displayed amount in UPI section
    updateDisplayAmount(amount) {
        document.getElementById('displayAmount').textContent = amount;
    },

    // Setup event listeners
    setupEventListeners() {
        // Lending creation form
        const createLendingForm = document.getElementById('createLendingForm');
        const amountInput = document.getElementById('amount');
        const paymentScreenshotInput = document.getElementById('paymentScreenshot');

        if (createLendingForm) {
            // Update displayed amount when amount input changes
            if (amountInput) {
                amountInput.addEventListener('input', (e) => {
                    this.updateDisplayAmount(e.target.value || '0');
                });
            }

            createLendingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const amount = parseFloat(amountInput.value);
                const paymentScreenshot = paymentScreenshotInput.files[0];

                if (!amount || amount <= 0) {
                    auth.showAlert('Please enter a valid amount', 'error');
                    return;
                }

                if (!paymentScreenshot) {
                    auth.showAlert('Please upload payment screenshot', 'error');
                    return;
                }

                // Validate file type
                if (!paymentScreenshot.type.startsWith('image/')) {
                    auth.showAlert('Please upload a valid image file', 'error');
                    return;
                }

                // Validate file size (max 5MB)
                if (paymentScreenshot.size > 5 * 1024 * 1024) {
                    auth.showAlert('Image size should be less than 5MB', 'error');
                    return;
                }

                await this.createLending(amount, paymentScreenshot);
                createLendingForm.reset();
                this.updateDisplayAmount('0');
            });
        }

        // Copy referral link button
        const copyReferralBtn = document.getElementById('copyReferralBtn');
        if (copyReferralBtn) {
            copyReferralBtn.addEventListener('click', () => this.copyReferralLink());
        }

        // Withdraw referral earnings button
        const withdrawReferralBtn = document.getElementById('withdrawReferralBtn');
        if (withdrawReferralBtn) {
            withdrawReferralBtn.addEventListener('click', () => this.withdrawReferralEarnings());
        }
    }
};

// Initialize dashboard module
document.addEventListener('DOMContentLoaded', () => {
    if (auth.isAuthenticated) {
        dashboard.init();
    } else {
        window.location.href = '/login.html';
    }
}); 