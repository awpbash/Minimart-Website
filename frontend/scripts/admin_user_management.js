document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.getElementById('user-table-body');
    const editModal = document.getElementById('edit-user-modal');
    const passwordModal = document.getElementById('change-password-modal');
    const closeEditModal = document.getElementById('close-modal');
    const closePasswordModal = document.getElementById('close-password-modal');
    const editForm = document.getElementById('edit-user-form');
    const passwordForm = document.getElementById('change-password-form');

    // Load users
    async function loadUsers() {
        try {
            const response = await fetch('http://127.0.0.1:5000/admin/users');
            if (!response.ok) throw new Error('Failed to load users');

            const users = await response.json();
            userTableBody.innerHTML = ''; // Clear existing rows

            users.forEach((user) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.role === "suspended" ? "resident" : user.role}</td>
                    <td>${user.role === "suspended" ? "suspended" : "active"}</td>
                    <td>
                        <button class="edit-product-button" data-id="${user.username}">Edit</button>
                        <button class="password-button" data-id="${user.username}">Reset Password</button>
                        <button class="suspend-button ${user.role === "suspended" ? "button" : "delete-button"}" data-id="${user.username}">${user.role === "suspended" ? "Unsuspend" : "Suspend"}</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });

            // Attach action listeners
            attachActionListeners();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    function attachActionListeners() {
        // Edit User
        document.querySelectorAll('.edit-button').forEach((button) => {
            button.addEventListener('click', async () => {
                const userId = button.getAttribute('data-id');
                const user = await fetchUser(userId);
                openEditModal(user);
            });
        });

        // Change Password
        document.querySelectorAll('.password-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const userId = button.getAttribute('data-id');
                await resetPassword(userId);
            });
        });

        // Suspend User
        document.querySelectorAll('.suspend-button').forEach((button) => {
            button.addEventListener('click', async () => {
                const userId = button.getAttribute('data-id');
                const cur_user = localStorage.getItem('user');
                if (cur_user === userId) {
                    errorToast('Cannot suspend yourself!');
                    return;
                }
                await suspendUser(userId);
                await loadUsers();
            });
        });
    }

    async function fetchUser(userId) {
        const response = await fetch(`http://127.0.0.1:5000/admin/users/${userId}`);
        return await response.json();
    }

    async function suspendUser(userId) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/admin/users/suspend/${userId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            successToast(data.message);
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    }

    async function resetPassword(userId) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/admin/users/reset-password/${userId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            successToast(data.message);
        } catch (error) {
            errorToast(`Error resetting password for user: ${error}`);
        }
    }

     // Handle Logout
     document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'admin_dashboard.html';
    });

    // Load users on page load
    await loadUsers();
});
