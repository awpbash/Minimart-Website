from flask import Blueprint, request, jsonify
from extensions import db
from models import *

product_bp = Blueprint('products', __name__)

from datetime import datetime
import pytz

@product_bp.route('/request', methods=['POST'])
def request_product():
    # Parse the incoming JSON payload
    data = request.json
    user_id = data.get('user_id')  # User ID or username, depending on your setup
    product_name = data.get('product_name')
    print("gay")
    if not user_id or not product_name:
        return jsonify({'message': 'Missing user_id or product_id'}), 400
    print("lesbian")
    # Fetch the product
    product = Product.query.get(product_name)
    print(product_name)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    # Log the transaction with status "request success"
    new_transaction = Transaction(
        time=datetime.now(tz=pytz.timezone('Asia/Singapore')),  # Current time in Singapore
        user_id=user_id,
        product_id=product_name,
        voucher_id=None,  # Default voucher ID
        status=0  # Request success
    )
    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({'message': 'Product requested successfully'}), 200


@product_bp.route('/get_requests', methods=['GET'])
def get_requests():
    try:
        # Join Transaction, Status, and Product tables
        transactions = (
            db.session.query(
                Transaction.id,
                Transaction.product_id,
                Transaction.status,
                Transaction.user_id,
                Transaction.time,
                Product.name.label('product_name'),
                Status.description.label('status_description')
            )
            .join(Status, Transaction.status == Status.id)  # Join with Status table
            .join(Product, Transaction.product_id == Product.name, isouter=True)  # Join with Product table
            .filter(~Transaction.status.in_([1, 2, 3, 5, 6, 7]))  # Exclude specific statuses
            .all()
        )

        # Prepare the result
        result = [
            {
                'id': transaction.id,
                'product_name': transaction.product_name or "Unknown",  # Handle missing product
                'status': transaction.status_description,
                'user': transaction.user_id,
                'time': transaction.time.strftime('%Y-%m-%d %H:%M:%S') if transaction.time else "Unknown",
            }
            for transaction in transactions
        ]

        return jsonify(result), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_requests: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500




@product_bp.route('/approve_requests', methods=['PUT'])
def approve_requests():
    data = request.json
    request_ids = data.get('request_ids')

    if not request_ids:
        return jsonify({'message': 'Missing request_ids'}), 400

    for request_id in request_ids:
        transaction = Transaction.query.get(request_id)
        if not transaction:
            return jsonify({'message': 'Transaction not found'}), 404

        # Update Voucher
        voucher = Voucher(
            product_name=Product.query.get(transaction.product_id).name,
            user=transaction.user_id,
            desc='Voucher for product purchase'
        )
        db.session.add(voucher)
        transaction.voucher_id = voucher.id

        # Update the transaction status to "request success"
        transaction.status = 1
        db.session.commit()
    # Fetch all transactions
    transactions = Transaction.query.all()

    return jsonify({'message': 'Requests approved successfully'}), 200

@product_bp.route('/delete_transactions', methods=['PUT'])
def delete_transactions():
    try:
        # Get the transaction IDs from the request
        data = request.json
        transactionids = data.get("transaction_ids", [])
        
        if not transactionids:
            return jsonify({'message': 'No transaction IDs provided'}), 400

        # Update the status of the selected transactions to 3 (deleted)
        Transaction.query.filter(Transaction.id.in_(transactionids)).update(
            {"status": 2},
            synchronize_session=False
        )
        db.session.commit()

        return jsonify({'message': 'Transactions updated successfully'}), 200

    except Exception as e:
        print(f"Error deleting transactions: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500


@product_bp.route('/decrement/<string:product_name>', methods=['PUT'])
def decrement_product(product_name):
    data = request.json
    decrement = data.get('decrement', 0)

    # Fetch product by name
    product = Product.query.filter_by(name=product_name).first()
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    if decrement > product.stock:
        return jsonify({'message': 'Decrement amount exceeds current stock'}), 400

    product.stock -= decrement
    if product.stock <= 0:
        db.session.delete(product)  # Remove product if stock reaches 0
        message = f'Product "{product.name}" removed from inventory.'
    else:
        message = f'Stock updated for "{product.name}". New stock: {product.stock}.'

    db.session.commit()
    return jsonify({'message': message}), 200


@product_bp.route('/update_price/<string:product_name>', methods=['PUT'])
def update_product_price(product_name):
    data = request.json
    new_price = data.get('price')
    if new_price is None or new_price <= 0:
        return jsonify({'message': 'Invalid price'}), 400

    # Fetch product by name
    product = Product.query.filter_by(name=product_name).first()
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    product.price = new_price
    db.session.commit()
    return jsonify({'message': 'Product price updated successfully'}), 200


