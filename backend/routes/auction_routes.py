from flask import Blueprint, request, jsonify
from extensions import db
from models import Auction, User
from datetime import datetime

auction_bp = Blueprint('auction', __name__)

# Create a new auction (Admin Only)
@auction_bp.route('/create', methods=['POST'])
def create_auction():
    data = request.json
    print(data)
# Convert string timestamps to Python datetime objects
    start_time_g = datetime.fromisoformat(data['start_time'])
    end_time_g = datetime.fromisoformat(data['end_time'])
    new_auction = Auction(
        product_id=data['product_id'],
        start_time=start_time_g,
        starting_price=data['startingprice'],
        end_time=end_time_g,
        highest_bid=0,
        winner_id=None
    )
    db.session.add(new_auction)
    db.session.commit()
    return jsonify({'message': 'Auction created successfully'}), 201

# Fetch all auctions (Admin and Resident)
@auction_bp.route('/products', methods=['GET'])
def get_auctions():
    auctions = Auction.query.all()
    if not auctions:
        return jsonify([]), 200
    auction_list = [
        {
            'id': a.id,
            'product_id': a.product_id,
            'start_time': a.start_time,
            'end_time': a.end_time,
            'highest_bid': a.highest_bid,
            'winner': a.winner_id,
            'starting_price': a.starting_price,
        }
        for a in auctions
    ]
    return jsonify(auction_list), 200

# Place a bid (Resident Only)
@auction_bp.route('/bid/<int:auction_id>', methods=['PUT'])
def place_bid(auction_id):
    data = request.json
    print("ok!")
    bid_amount = data['bid_amount']
    user_id = data['user']

    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404

    if bid_amount <= auction.highest_bid:
        return jsonify({'message': 'Bid must be higher than the current highest bid'}), 400

    auction.highest_bid = bid_amount
    auction.winner_id = user_id
    db.session.commit()
    return jsonify({'message': 'Bid placed successfully'}), 200

# End an auction (Admin Only)
@auction_bp.route('/end/<int:auction_id>', methods=['PUT'])
def end_auction(auction_id):
    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404

    db.session.delete(auction)
    db.session.commit()
    return jsonify({'message': f'Auction {auction_id} ended successfully'}), 200

# Delete an auction (Admin Only)
@auction_bp.route('/delete/<int:auction_id>', methods=['DELETE'])
def delete_auction(auction_id):
    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404

    db.session.delete(auction)
    db.session.commit()
    return jsonify({'message': 'Auction deleted successfully'}), 200
