document.addEventListener('DOMContentLoaded', async () => {
    const productTableBody = document.getElementById('product-table-body');
    const addProductForm = document.getElementById('add-product-form');
    const backButton = document.getElementById('back-button');

    // Fetch and display products
    async function loadProducts() {
        try {
            const response = await fetch('http://127.0.0.1:5000/admin/products');
            if (!response.ok) throw new Error('Failed to load products');

            const products = await response.json();
            productTableBody.innerHTML = ''; // Clear table before adding rows
            products.forEach((product) => {
                console.log(product);
                const row = document.createElement('tr');
                console.log(product.name);
                row.innerHTML = `
                    <td><img src="${product.link}"  class="product-image" /></td>
                    <td>${product.name}</td>
                    <td>$<span class="product-price">${product.price.toFixed(2)}</span></td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="edit-product-button" data-id="${product.name}" data-price="${product.price}">Edit Price</button>
                        <button class="delete-button" data-id="${product.name}" data-stock="${product.stock}">Lower Stock</button>
                    </td>
                `;
                productTableBody.appendChild(row);
            });

            // Attach event listeners to delete buttons
            document.querySelectorAll('.delete-button').forEach((button) => {
                button.addEventListener('click', async () => {
                    const productId = button.getAttribute('data-id');
                    console.log(productId);
                    const currentStock = parseInt(button.getAttribute('data-stock'));

                    // Ask user for the decrement amount
                    const decrementAmount = parseInt(prompt(`Enter the number to decrement (Current Stock: ${currentStock}):`, '1'));
                    if (isNaN(decrementAmount) || decrementAmount <= 0) {
                        errorToast('Invalid number. Please try again.');
                        return;
                    }

                    if (decrementAmount > currentStock) {
                        errorToast('Cannot decrement more than the current stock.');
                        return;
                    }

                    await decrementProduct(productId, decrementAmount);
                    await loadProducts(); // Reload products after stock update
                });
            });

            // Attach event listeners to edit price buttons
            document.querySelectorAll('.edit-product-button').forEach((button) => {
                button.addEventListener('click', async () => {
                    const productId = button.getAttribute('data-id');
                    const currentPrice = parseFloat(button.getAttribute('data-price'));

                    // Ask user for the new price
                    const newPrice = parseFloat(prompt(`Enter the new price (Current Price: $${currentPrice.toFixed(2)}):`, currentPrice.toFixed(2)));
                    if (isNaN(newPrice) || newPrice <= 0) {
                        errorToast('Invalid price. Please try again.');
                        return;
                    }

                    await updateProductPrice(productId, newPrice);
                    await loadProducts(); // Reload products after price update
                });
            });
        } catch (error) {
            console.error('Error loading products:', error);
            errorToast('Failed to load products. Please try again later.');
        }
    }

    // Add a new product or increment stock
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);
        const link = document.getElementById('product-image').value;
        try {
            const response = await fetch('http://127.0.0.1:5000/admin/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, stock, link }),
            });

            const data = await response.json();
            successToast(data.message);
            await loadProducts(); // Reload products after adding or updating stock
        } catch (error) {
            console.error('Error adding product:', error);
            errorToast('Failed to add product. Please try again later.');
        }
    });

    // Decrement product stock or remove product if stock reaches 0
    async function decrementProduct(productId, decrementAmount) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/products/decrement/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decrement: decrementAmount }),
            });

            const data = await response.json();
            successToast(data.message);
        } catch (error) {
            console.error('Error decrementing product stock:', error);
            errorToast('Failed to decrement product stock. Please try again later.');
        }
    }

    // Update product price
    async function updateProductPrice(productId, newPrice) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/products/update_price/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: newPrice }),
            });

            const data = await response.json();
            successToast(data.message);
        } catch (error) {
            console.error('Error updating product price:', error);
            errorToast('Failed to update product price. Please try again later.');
        }
    }

    // Redirect to admin_dashboard.html
    backButton.addEventListener('click', () => {
        window.location.href = 'admin_dashboard.html';
    });

    // Load products on page load
    await loadProducts();
});
