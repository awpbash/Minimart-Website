document.addEventListener('DOMContentLoaded', async () => {
    const productTableBody = document.getElementById('product-table-body');
    const backbutton = document.getElementById('back-button');
    // Fetch and display products
    async function loadProducts() {
        try {
            const response = await fetch('http://127.0.0.1:5000/admin/products');
            if (!response.ok) throw new Error('Failed to load products');

            const products = await response.json();
            productTableBody.innerHTML = ''; // Clear table before adding rows

            products.forEach((product) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.link}"  class="product-image" /></td>
                    <td>${product.name}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                `;
                productTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            errorToast('Failed to load products. Please try again later.');
        }
    }

    // Logout functionality
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
        // Redirect to product_admin.html
        backbutton.addEventListener('click', () => {
            window.location.href = 'resident_dashboard.html';
        });
    

    // Load products on page load
    await loadProducts();
});
