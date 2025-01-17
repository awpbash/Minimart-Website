from extensions import db

class User(db.Model):
    username = db.Column(db.String(80), unique=True, nullable=False, primary_key=True)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='resident')
    phone = db.Column(db.String(20), nullable=True)
    vouchers = db.Column(db.JSON, default=list)

class Product(db.Model):
    name = db.Column(db.String(100), primary_key=True)
    price = db.Column(db.Integer, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)
    link = db.Column(db.String(200), nullable=True)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.username'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.name'), nullable=False)
    voucher_id = db.Column(db.String(200), default=0) # <--- nabei we spell wrong
    status = db.Column(db.Integer, default=0)  # 0: req pending, 1: req success, 2: req failed, 3: req cancelled, 4: preorder pending, 5: preorder success, 6: preorder failed, 7: preorder cancelled

class Auction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.name'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    starting_price = db.Column(db.Integer, nullable=False)
    highest_bid = db.Column(db.Integer, default=0)
    winner_id = db.Column(db.Integer, db.ForeignKey('user.username'), nullable=True)

class Voucher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    user = db.Column(db.Integer, db.ForeignKey('user.username'), nullable=False)
    desc = db.Column(db.String(200), nullable=False)

class Status(db.Model):
    __tablename__ = 'status'
    id = db.Column(db.Integer, primary_key=True)  # Status code
    description = db.Column(db.String(255), nullable=False)  # Status description
    def create_table():
        # Define the status map
        status_map = {
            0: 'Request Pending',
            1: 'Request Success',
            2: 'Request Failed',
            3: 'Request Cancelled',
            4: 'Preorder Pending',
            5: 'Preorder Success',
            6: 'Preorder Failed',
            7: 'Preorder Cancelled',
        }

        # Check if the table already has data
        for id, description in status_map.items():
            # Only insert if the status doesn't already exist
            existing_status = Status.query.get(id)
            if not existing_status:
                db.session.add(Status(id=id, description=description))

        db.session.commit()
        print("Status table populated successfully!")