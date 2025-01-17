# Minimart website
*submission for H4G 2025*

## Problem statement
![alt text](readme_src/problem.png)



## Available features
1) Secure password login system with one way encryption and minimum password requirements (uppercase + lowercase + number + special character)

2) Differentiated roles (Admin vs User)

3) Voucher request management system

4) Product management system

5) Auction system

## User Guide

### Getting started

Installing required dependancies

**Python Version Required: 3.10 or higher**  

`pip install -r requirements.txt`

After installing required packages, both frontend and backend must be run concurrently on separate terminals.

### Running backend
`cd backend`

`python app.py`

### Running frontend
`cd frontend`

`python -m https.server 8000`

### Login page
![alt text](readme_src/login.png)

Register an account by filling in the details and selecting either Resident or Admin for role. Username must be unique and password must contain at least (1 uppercase, 1 lowercase, 1 number and 1 special character)

After account creation, you can log in to view the respective dashboards depending on the role of user.

### Resident Dashboard
![alt text](readme_src/resident_dashboard.png)

This is the resident's dashboard. You can view your allocated vouchers and transaction history. Additionally, you can request for any vouchers for any available items, subject to admin approval. You can also update your account details and navigate to the Products page and Auctions page.

### Products page
![alt text](readme_src/resident_products.png)
![alt text](readme_src/resident_auction.png)

### Admin Dashboard

This is the admin's dashboard, you can search for residents, allocate or remove vouchers, approve or reject their requests on this page. You can navigate to user management, product management and auction management webpages.

![alt text](readme_src/admin_dashboard.png)

### Product management

You can add new products, modify prices or change stocks here. Products are identified by their unique names so you won't double count.
![alt text](readme_src/product_admin.png)

### User management

View and edit residents' account information. Allows suspension of users which prevents them from logging in. Reset password allows users to reset their password to default **"12345678"**, allowing them to log in to change their password in events of forgotten password.

![alt text](readme_src/user_admin.png)

### Auction management

Add, modify and end auctions

![alt text](readme_src/auction_admin.png)

## Future work



