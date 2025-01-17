document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value; // Ensure this field exists
    const phone = document.getElementById('reg-phone').value; // Ensure this field exists
    const role = document.getElementById('reg-role').value;

    // Password validation requirements
    const passwordRequirements = {
        length: 8, // Minimum length
        uppercase: 1, // At least one uppercase letter
        lowercase: 1, // At least one lowercase letter
        number: 1, // At least one numeric digit
        special: 1 // At least one special character
    };

    const validatePassword = (password) => {
        const lengthValid = password.length >= passwordRequirements.length;
        const uppercaseValid = /[A-Z]/.test(password);
        const lowercaseValid = /[a-z]/.test(password);
        const numberValid = /[0-9]/.test(password);
        const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            lengthValid &&
            uppercaseValid &&
            lowercaseValid &&
            numberValid &&
            specialValid
        );
    };

    if (!validatePassword(password)) {
        errorToast(
            `Password must be at least ${passwordRequirements.length} characters long, 
            include at least ${passwordRequirements.uppercase} uppercase letter(s), 
            ${passwordRequirements.lowercase} lowercase letter(s), 
            ${passwordRequirements.number} number(s), and 
            ${passwordRequirements.special} special character(s).`
        );
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, phone, role }),
        });

        const data = await response.json();
        if (response.ok) {
            successToast('Registration successful!');
        } else {
            errorToast(data.message);
        }
    } catch (error) {
        console.error(error);
        errorToast('Registration failed.');
    }
});
