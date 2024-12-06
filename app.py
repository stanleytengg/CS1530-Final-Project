from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bcrypt import Bcrypt

# Loads database
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Loads config and secret key
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
    app.secret_key = '65c0785007428fc2eff2c71154815691a0aaa586f4dee0f601d572ae04f8bbdb'

    # Initializes database
    db.init_app(app)

    # Sets up logins
    login_manager = LoginManager()
    login_manager.init_app(app)

    # Loads users
    from models import User
    @login_manager.user_loader
    def load_user(uid):
        return User.query.get(uid)
    
    # Password hashing
    bcrypt = Bcrypt(app)

    # Attaches routes to app
    from routes import routes
    routes(app, db, bcrypt)

    # Initializes migrations with SQLAlchemy
    migrate = Migrate(app, db)

    return app