from flask import Flask
from extensions import db, bcrypt, jwt
from flask_cors import CORS
from routes.user_routes import user_bp
from routes.admin_routes import admin_bp
from routes.product_routes import product_bp
from routes.auction_routes import auction_bp
from models import Status

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# Register routes
app.register_blueprint(user_bp, url_prefix='/users')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(product_bp, url_prefix='/products')
app.register_blueprint(auction_bp, url_prefix='/auction')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create the database schema
        Status.create_table()
    app.run(debug=True, port=5000)
