from flask_login import UserMixin
from app import db

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)
    expenses = db.relationship('Expense', backref='user', lazy=True)
    
    def get_id(self):
        return self.uid

class Expense(db.Model):
    __tablename__ = 'expenses'

    user_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)