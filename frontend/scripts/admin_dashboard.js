document.addEventListener('DOMContentLoaded', async () => {
    const requestTableBody = document.getElementById('request-table-body');
    const approveButton = document.getElementById('approve-button');
    const deleteButton = document.getElementById('delete-button');
    const form = document.getElementById('allocate-vouchers-form');
    const productsButton = document.getElementById('products-button'); // New "Products" button

    // Fetch and populate requests in the table
    async function loadRequests() {
        try {
            const response = await fetch('http://127.0.0.1:5000/products/get_requests');
            if (!response.ok) throw new Error('Failed to load requests');

            const requests = await response.json();
            requestTableBody.innerHTML = ''; // Clear table before appending new rows

            requests.forEach((request) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.product_name}</td>
                    <td>${request.status}</td>
                    <td>${request.user}</td>
                    <td>${new Date(request.time).toLocaleString()}</td>
                    <td><input type="checkbox" class="request-checkbox" value="${request.id}"></td>
                `;
                requestTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading requests:', error);
            errorToast('Failed to load requests. Please try again later.');
        }
    }

    // Redirect to product_admin.html
    productsButton.addEventListener('click', () => {
        window.location.href = 'product_admin.html';
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

    // Handle Approve Requests
    approveButton.addEventListener('click', async () => {
        const selectedRequests = Array.from(
            document.querySelectorAll('.request-checkbox:checked')
        ).map((checkbox) => checkbox.value);

        if (selectedRequests.length === 0) {
            errorToast('No requests selected.');
            return;
        }
        console.log(selectedRequests);
        try {
            const response = await fetch('http://127.0.0.1:5000/products/approve_requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_ids: selectedRequests }),
            });

            const data = await response.json();
            if (response.ok) {
                successToast('Requests approved successfully!');
                loadRequests(); // Reload requests after approval
            } else {
                errorToast(data.message);
            }
        } catch (error) {
            console.error('Error approving requests:', error);
            errorToast('Failed to approve requests. Please try again later.');
        }
    });

    // Handle Delete Transactions
    deleteButton.addEventListener('click', async () => {
        const selectedTransactions = Array.from(
            document.querySelectorAll('.request-checkbox:checked')
        ).map((checkbox) => checkbox.value);

        if (selectedTransactions.length === 0) {
            errorToast('No transactions selected.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/products/delete_transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction_ids: selectedTransactions }),
            });

            const data = await response.json();
            if (response.ok) {
                successToast('Transactions deleted successfully!');
                loadRequests(); // Reload requests after deletion
            } else {
                errorToast(data.message);
            }
        } catch (error) {
            console.error('Error deleting transactions:', error);
            errorToast('Failed to delete transactions. Please try again later.');
        }
    });

    // Handle Voucher Allocation
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('user-id').value;
        const vouchers = document.getElementById('product-dropdown').value;
        console.log(vouchers);
        const voucherDescription = document.getElementById('voucher-description').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/admin/allocate-vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, product_name: vouchers, desc: voucherDescription }),
            });

            const data = await response.json();
            successToast(data.message);
        } catch (error) {
            console.error('Error allocating vouchers:', error);
            errorToast('Failed to allocate vouchers. Please try again later.');
        }
    });

    // Handle Logout
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Handle Logout
    document.getElementById('user-button').addEventListener('click', () => {
        window.location.href = 'admin_user_management.html';
    });

    // Load data on page load
    await loadRequests();
    await loadProducts();
});


document.addEventListener('DOMContentLoaded', async () => {
    const voucherTableBody = document.getElementById('voucher-table-body');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const deleteVouchersButton = document.getElementById('delete-vouchers-button');

    // Function to load vouchers for a specific username
    async function loadVouchers(username) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/admin/vouchers?username=${username}`);
            if (!response.ok) throw new Error('Failed to load vouchers');

            const vouchers = await response.json();
            voucherTableBody.innerHTML = ''; // Clear table before appending new rows

            vouchers.forEach((voucher) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${voucher.id}</td>
                    <td>${voucher.product_name}</td>
                    <td>${voucher.description}</td>
                    <td><input type="checkbox" class="voucher-checkbox" value="${voucher.id}"></td>
                `;
                voucherTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading vouchers:', error);
            errorToast('Failed to load vouchers. Please try again later.');
        }
    }

    // Handle search button click
    searchButton.addEventListener('click', async () => {
        const username = searchInput.value.trim();
        if (!username) {
            errorToast('Please enter a username.');
            return;
        }
        await loadVouchers(username);
    });

    // Handle delete vouchers button click
    deleteVouchersButton.addEventListener('click', async () => {
        const selectedVouchers = Array.from(
            document.querySelectorAll('.voucher-checkbox:checked')
        ).map((checkbox) => checkbox.value);

        if (selectedVouchers.length === 0) {
            errorToast('No vouchers selected.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/admin/delete-vouchers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucher_ids: selectedVouchers }),
            });

            const data = await response.json();
            if (response.ok) {
                successToast('Vouchers deleted successfully!');
                voucherTableBody.innerHTML = ''; // Clear the table after deletion
            } else {
                errorToast(data.message);
            }
        } catch (error) {
            errorToast('Failed to delete vouchers. Please try again later.');
            console.error('Error deleting vouchers:', error);
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const auction = document.getElementById('auction-button');

    auction.addEventListener('click', () => {
        window.location.href = 'auction.html';
    });
});