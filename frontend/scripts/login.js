document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('user', data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            console.log(data.role);
            if (data.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else if (data.role === 'resident') {
                window.location.href = 'resident_dashboard.html';
            }
            else{
                errorToast('User suspended! Please contact support.');
                return; // Stop the login process
            }
            successToast('Login successful!');
        } else {
            errorToast(data.message);
        }
    } catch (error) {
        console.error(error);
        errorToast('Login failed.');
    }
});

const forgotPassword = async () => {
    const username = prompt('Please enter your username:');
    if (!username) {
        errorToast('Username is required.');
        return;
    }

    try {
        // Send the username to the backend
        const response = await fetch('http://127.0.0.1:5000/users/forget-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        // Parse the response
        const data = await response.json();
        if (response.ok) {
            // Display the phone number and password in an alert
            successToast(`Username: ${data.username}\nPhone: ${data.phone}\nPassword: ${data.password}`);
        } else {
            // Handle user not found or other errors
            errorToast(data.message);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        errorToast('Failed to fetch user information. Please try again later.');
    }

};

