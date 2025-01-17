document.addEventListener('DOMContentLoaded', async () => {
    const auctionTableBody = document.getElementById('auction-table-body');
    const adminAuctionTableBody = document.getElementById('admin-auction-table-body');
    const auctionForm = document.getElementById('auction-form');
    const isAdmin = localStorage.getItem('role') === 'admin';
    const backDashboardButton = document.getElementById('back-dashboard-button');
    //console.log(isAdmin);
    //console.log(localStorage.getItem('role'));
    // Redirect to the respective dashboard
    backDashboardButton.addEventListener('click', () => {
        if (isAdmin) {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'resident_dashboard.html';
        }
    });

    // Toggle sections based on user role
    if (isAdmin) {
        document.getElementById('resident-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
    }

    // Fetch and display auctions
    async function loadAuctions() {
        try {
            const response = await fetch('http://127.0.0.1:5000/auction/products');
            const auctions = await response.json();
            console.log(auctions);
            // Clear tables
            auctionTableBody.innerHTML = '';
            adminAuctionTableBody.innerHTML = '';

            // Populate resident view
            auctions.forEach((auction) => {
                console.log(auction);
                const row = `
                    <tr>
                        <td>${auction.product_id}</td>
                        <td>$${auction.starting_price}</td>
                        <td>$${auction.highest_bid}</td>
                        <td>${auction.winner}</td>
                        <td>${new Date(auction.end_time).toLocaleString()}</td>

                        <td>
                            ${isAdmin 
                                ? `<button class="edit-button" data-id="${auction.id}">Edit</button>
                                   <button class="end-auction-button" data-id="${auction.id}">End Auction</button>`
                                : `<button class="bid-button" data-id="${auction.id}">Bid</button>`}
                        </td>
                    </tr>`;
                if (isAdmin) {
                    adminAuctionTableBody.insertAdjacentHTML('beforeend', row);
                } else {
                    auctionTableBody.insertAdjacentHTML('beforeend', row);
                }
            });
        } catch (error) {
            console.error('Error loading auctions:', error);
            alert('Failed to load auctions.');
        }
    }

    // Handle bidding for residents
    if (!isAdmin) {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('bid-button')) {
                const auctionId = e.target.getAttribute('data-id');
                const bidAmount = parseFloat(prompt('Enter your bid amount:'));
                console.log(auctionId);
                if (isNaN(bidAmount) || bidAmount <= 0) {
                    alert('Invalid bid amount.');
                    return;
                }

                try {
                    console.log(bidAmount);
                    const response = await fetch(`http://127.0.0.1:5000/auction/bid/${auctionId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bid_amount: bidAmount, user: localStorage.getItem('user') }),
                    });
                    const data = await response.json();
                    alert(data.message);
                    loadAuctions();
                } catch (error) {
                    console.error('Error placing bid:', error);
                    alert('Failed to place bid.');
                }
            }
        });
    }
    console.log(isAdmin);
    // Handle auction management for admins
    if (isAdmin) {
        auctionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productName = document.getElementById('product-name').value;
            const startingPrice = parseFloat(document.getElementById('starting-price').value);
            const biddingIncrement = parseFloat(document.getElementById('bidding-increment').value);
            const startDateTime = document.getElementById('start-time').value;
            const endDateTime = document.getElementById('end-time').value;

            if (!productName || isNaN(startingPrice) || isNaN(biddingIncrement)) {
                alert('Please fill all fields correctly.');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:5000/auction/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: productName, startingprice: startingPrice, bidding_increment: biddingIncrement, start_time: startDateTime, end_time: endDateTime})
                });
                const data = await response.json();
                alert(data.message);
                auctionForm.reset();
                loadAuctions();
            } catch (error) {
                console.error('Error creating auction:', error);
                alert('Failed to create auction.');
            }
            
        });
        await loadAuctions();
        // Handle ending auctions
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('end-auction-button')) {
                const auctionId = e.target.getAttribute('data-id');
                try {
                    const response = await fetch(`http://127.0.0.1:5000/auction/end/${auctionId}`, {
                        method: 'PUT',
                    });
                    const data = await response.json();
                    alert(data.message);
                    loadAuctions();
                } catch (error) {
                    console.error('Error ending auction:', error);
                    alert('Failed to end auction.');
                }
            }
        });
    }

    // Load auctions on page load
    await loadAuctions();
});
