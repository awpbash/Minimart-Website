from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import Product, Voucher, User

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/allocate-vouchers', methods=['POST'])
def allocate_vouchers():
    data = request.json
    user = User.query.get(data['user_id'])
    v = Voucher(product_name=data['product_name'], user=user.username, desc=data['desc'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    db.session.add(v)
    db.session.commit()
    return jsonify({'message': 'Vouchers allocated successfully'})

# Add a product
@admin_bp.route('/products/add', methods=['POST'])
def add_product():
    data = request.json
    product = Product.query.filter_by(name=data['name']).first()

    if product:  # If the product exists, increment stock
        product.stock += data['stock']
        db.session.commit()
        return jsonify({'message': f'{data["stock"]} units added to {product.name}'}), 200
    else:  # Otherwise, create a new product
        new_product = Product(name=data['name'], price=data['price'], stock=data['stock'], description=data.get('description', ''), link=data.get('link', ''))
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'New product added successfully'}), 201


@admin_bp.route('/products/remove/<int:product_id>', methods=['DELETE'])
def remove_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'message': 'Product not found'}), 404

    # Decrement stock
    product.stock -= 1

    if product.stock <= 0:  # Delete if stock is 0 or less
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'{product.name} removed completely as stock reached 0'}), 200
    else:
        db.session.commit()  # Save the updated stock
        return jsonify({'message': f'Stock decremented for {product.name}'}), 200


# Get all products (for dropdown)
@admin_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    product_list = [{'name': p.name, 'price': p.price, 'stock': p.stock, 'link':p.link} for p in products]
    return jsonify(product_list)

@admin_bp.route('/vouchers', methods=['GET'])
def get_vouchers():
    username = request.args.get('username')
    if not username:
        return jsonify({'message': 'Username is required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    vouchers = Voucher.query.filter_by(user=username).all()
    result = [{'id': v.id, 'product_name': v.product_name, 'description': v.desc} for v in vouchers]
    return jsonify(result), 200

@admin_bp.route('/delete-vouchers', methods=['DELETE'])
def delete_vouchers():
    data = request.json
    voucher_ids = data.get('voucher_ids', [])
    if not voucher_ids:
        return jsonify({'message': 'No vouchers selected'}), 400

    Voucher.query.filter(Voucher.id.in_(voucher_ids)).delete(synchronize_session='fetch')
    db.session.commit()
    return jsonify({'message': 'Selected vouchers deleted successfully'}), 200


@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    try:
        # Query all users from the database
        users = User.query.all()
        user_list = [
            {
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
            }
            for user in users
        ]
        return jsonify(user_list), 200
    except Exception as e:
        # Log error and return server error response
        print(f"Error fetching users: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

# Add a product
# @admin_bp.route('/users/add', methods=['POST'])
# def add_product():
#     data = request.json
#     product = Product.query.filter_by(name=data['name']).first()

#     if product:  # If the product exists, increment stock
#         product.stock += data['stock']
#         db.session.commit()
#         return jsonify({'message': f'{data["stock"]} units added to {product.name}'}), 200
#     else:  # Otherwise, create a new product
#         new_product = Product(name=data['name'], price=data['price'], stock=data['stock'], description=data.get('description', ''))
#         db.session.add(new_product)
#         db.session.commit()
#         return jsonify({'message': 'New product added successfully'}), 201

# Add a product
@admin_bp.route('/users/suspend/<user>', methods=['PUT'])
def suspend_user(user):
    user_obj = User.query.get(user)

    if not user_obj: 
        return jsonify({'message': f'could not find user'}), 404
    
    if user_obj.role == 'suspended':
        user_obj.role = 'resident' 
        db.session.commit()
        return jsonify({'message': 'User successfully unsuspended'}), 200
    else: 
        user_obj.role = 'suspended'
        db.session.commit()
        return jsonify({'message': 'User successfully suspended'}), 200

# Add a product
@admin_bp.route('/users/reset-password/<user>', methods=['PUT'])
def reset_password(user):
    user_obj = User.query.get(user)

    if not user_obj: 
        return jsonify({'message': f'could not find user'}), 404
    else: 
        user_obj.password = bcrypt.generate_password_hash('12345678').decode('utf-8')
        db.session.commit()
        return jsonify({'message': 'User password successfully reset'}), 200