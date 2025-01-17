from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import *
from flask_jwt_extended import create_access_token

user_bp = Blueprint('users', __name__)

# Register a new user
@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    # Basic phone number validation
    if not data['phone'].isdigit() or len(data['phone']) < 8:
        return jsonify({'message': 'Invalid phone number'}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # Create a new user
    user = User(
        username=data['username'],
        password=hashed_password,
        role=data['role'],
        email=data['email'],
        phone=data['phone']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201


# Login an existing user
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        # Create a JWT token and return the user's role
        token = create_access_token(identity={'username': user.username, 'role': user.role})
        return jsonify({
            'user': user.username,
            'token': token,
            'role': user.role
        }), 200
    return jsonify({'message': 'Invalid credentials'}), 401

'''
@user_bp.route('/vouchers', methods=['GET'])
def get_vouchers():
    user_id = request.args.get('user_id')  # Use `get` to extract the `user_id` from query parameters
    if not user_id:
        return jsonify({'message': 'Missing user_id parameter'}), 400

    # Query vouchers for the given user_id
    vouchers = Voucher.query.filter_by(user_id=user_id).all()
    result = [
        {'id': voucher.id, 'product': voucher.product, 'description': voucher.description}
        for voucher in vouchers
    ]
    return jsonify(result), 200
''' 
@user_bp.route('/vouchers/<user>', methods=['GET'])
def get_vouchers_user(user):
    # Check if user is provided
    if not user:
        return jsonify({'message': 'Missing user parameter'}), 400

    # Query vouchers based on the username
    vouchers = Voucher.query.filter_by(user=user)
    if not vouchers:
        return jsonify({'message': 'No vouchers found for the given user'}), 404

    result = [
        {'id': voucher.id, 'product': voucher.product_name, 'description': voucher.desc}
        for voucher in vouchers
    ]
    return jsonify(result), 200

@user_bp.route('/forget-password', methods=['POST'])
def get_user_info():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({'message': 'Username is required'}), 400

    # Query the database for the user
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Return the user's information
    return jsonify({
        'username': user.username,
        'phone': user.phone,
        'password': user.password  # Avoid this in production!
    }), 200

@user_bp.route('/update-info', methods=['POST'])
def update_user_info():
    data = request.json
    username = data.get('username')
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    email = data.get('email')
    phone = data.get('phone')

    user = User.query.get(username)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Verify current password
    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({'message': 'Incorrect current password'}), 401

    # Update user details
    user.email = email
    user.phone = phone
    if new_password:
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')

    db.session.commit()
    return jsonify({'message': 'User info updated successfully!', 'user': {
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
    }}), 200

@user_bp.route('/get-details', methods=['GET'])
def get_details():
    username = request.args.get('username')
    
    user_obj = User.query.get(username)
    if not user_obj:
        return jsonify({'message': 'User not found'}), 404
    else:
        return jsonify({
            'username': user_obj.username,
            'email': user_obj.email,
            'phone': user_obj.phone,
            'role': user_obj.role
        }), 200


@user_bp.route('/transactions/<user>', methods=['GET'])
def get_transactions(user):
    user_obj = User.query.get(user)
    if not user_obj:
        return jsonify({'message': 'User not found'}), 404

    # Fetch user details and transactions
    transactions = (
        db.session.query(
            Transaction.id,
            Product.name.label('product_name'),  # Alias to avoid ambiguity
            Transaction.status,
            Transaction.user_id,
            Transaction.voucher_id,
            Transaction.time,
            Status.description.label('status_description')  # Alias for clarity
        )
        .join(Status, Transaction.status == Status.id)
        .join(Product, Product.name == Transaction.product_id, isouter=True)  # Left join with Product table
        .filter(Transaction.user_id==user_obj.username) 
        .all()
    )

    # Create the response structure
    transaction_details = [
        {
            'id': transaction.id,
            'user': transaction.user_id,
            'product': transaction.product_name,
            'voucher_id': transaction.voucher_id,
            'status': transaction.status_description,
            'time': transaction.time.strftime('%Y-%m-%d %H:%M:%S') if transaction.time else "Unknown",
        }
        for transaction in transactions
    ]

    return jsonify(transaction_details), 200
