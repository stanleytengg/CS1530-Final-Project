from flask_login import UserMixin
from app import db
from datetime import datetime

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)
    budget = db.Column(db.Float, nullable=True)
    expenses = db.relationship('Expense', backref='user', lazy=True)
    notifictaions = db.relationship('Notification', backref='user', lazy=True)
    
    def get_id(self):
        return self.uid

class Expense(db.Model):
    __tablename__ = 'expenses'

    user_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)