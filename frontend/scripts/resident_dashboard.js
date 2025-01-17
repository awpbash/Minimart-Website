document.addEventListener('DOMContentLoaded', async () => {
    const voucherBalance = document.getElementById('voucher-balance');
    const form = document.getElementById('request-product-form');
    const tableBody = document.getElementById('voucher-table').querySelector('tbody');
    const productPage = document.getElementById('product-button');

    productPage.addEventListener('click', () => {
        window.location.href = 'product_user.html';
    });
    
    // Load user details from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
        errorToast('User not logged in!');
        window.location.href = 'index.html';
        return;
    }
    successToast(`Welcome, ${user}!`);
    // Fetch and display vouchers tagged to the username
    async function loadVouchers() {
        try {
            console.log('User object:', user); // Check the full user object

            const response = await fetch(`http://127.0.0.1:5000/users/vouchers/${user}`);
            if (!response.ok) {
                console.log('Response:', response);
                errorToast('Failed to load vouchers');
                return;
            }
            const vouchers = await response.json();
            tableBody.innerHTML = ''; // Clear existing rows
            console.log('Vouchers:', vouchers); // Check the vouchers array
            vouchers.forEach((voucher) => {
            
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${voucher.id}</td>
                    <td>${voucher.product}</td>
                    <td>${voucher.description}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading vouchers:', error);
        }
    }


    // Update voucher balance (optional, if backend supports it)
    voucherBalance.innerText = `Hi there!`;
    // Handle product requests
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productName = document.getElementById('product-dropdown').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/products/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user, product_name: productName }),
            });

            const data = await response.json();
            successToast("Product requested successfully!");
        } catch (error) {
            console.error('Error requesting product:', error);
        }
    });

    // Fetch and display products in the dropdown
    async function loadProducts() {
        const dropdown = document.getElementById('product-dropdown');
        dropdown.innerHTML = ''; // Clear existing options

        try {
            const response = await fetch('http://127.0.0.1:5000/admin/products');
            if (!response.ok) {
                errorToast('Failed to load products');
                return;
            }

            const products = await response.json();
            products.forEach((product) => {
                const option = document.createElement('option');
                option.value = product.name;
                option.textContent = `${product.name} - $${product.price} (Stock: ${product.stock})`;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }
    
    // Handle logout
    document.getElementById('logout-button').addEventListener('click', () => {
        // Clear the token and user details from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    
        console.log('LocalStorage cleared:', localStorage.getItem('user')); // Should log "null"
        console.log('Token cleared:', localStorage.getItem('token')); // Should log "null"
    
        // Redirect to the login page
        window.location.href = 'index.html';
    });

    // Load vouchers and products on page load
    await loadVouchers();
    await loadProducts();
});

document.addEventListener('DOMContentLoaded', async () => {
    const usernameDisplay = document.getElementById('username-display');
    const updateInfoButton = document.getElementById('update-info-button');
    const updateInfoModal = document.getElementById('update-info-modal');
    const closeButton = updateInfoModal.querySelector('.close-button');
    const updateInfoForm = document.getElementById('update-info-form');

    // Load user details from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
        errorToast('User not logged in!');
        window.location.href = 'index.html';
        return;
    }

    const email_field = document.getElementById('email');
    const phone_field = document.getElementById('phone');

    // Display details
    const response = await fetch(`http://localhost:5000/users/get-details?username=${user}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    const data = await response.json();
    email_field.value = data.email;
    phone_field.value = data.phone;

    // Handle Update Info Form Submission
    updateInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const newPassword = document.getElementById('password').value;
        const currentPassword = document.getElementById('current-password').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/users/update-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user,
                    email,
                    phone,
                    new_password: newPassword,
                    current_password: currentPassword,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                successToast('Info updated successfully!');
                localStorage.setItem('user', JSON.stringify(data.user)); // Update user in localStorage
                updateInfoModal.classList.add('hidden'); // Close modal
            } else {
                errorToast(data.message);
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            errorToast('Failed to update info. Please try again later.');
        }
    });

    // Handle Logout
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    const transactionTableBody = document.getElementById('transaction-table').querySelector('tbody');

    // Example data (replace with API response)
    const transactions_response = await fetch(`http://127.0.0.1:5000/users/transactions/${user}`);
    if (!transactions_response.ok) {
        console.log('Response:', response);
        errorToast(`Failed to load transaction history: ${response}`);
        return;
    }
    const transactions = await transactions_response.json();
    console.log('Transactions:', transactions); // Check the transactions array

    // Populate the table
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.product}</td>
            <td>${transaction.user}</td>
            <td>${transaction.status}</td>
            <td>${transaction.time}</td>
        `;
        transactionTableBody.appendChild(row);
    });

});

document.addEventListener('DOMContentLoaded', async () => {
    const auction_button = document.getElementById('auction-button');

    auction_button.addEventListener('click', () => {
        window.location.href = 'auction.html';
    });
});