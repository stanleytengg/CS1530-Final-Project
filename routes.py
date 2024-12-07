from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from models import User, Expense, Notification
from datetime import datetime

def routes(app, db, bcrypt):

    # Checks user's authentication status
    @app.route('/')
    def check_status():
        if current_user.is_authenticated:
            redirect(url_for('home'))
        return redirect(url_for('login'))
    
    # Route for home page
    @app.route('/home')
    @login_required
    def home():
        return render_template('home.html')
    
    # Route for notifications page
    @app.route('/notifications')
    @login_required
    def notifications():
        return render_template('notifications.html')
    
    # Route for register page
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        # Runs if user submits the form
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            # Checks if the username is taken
            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                # Shows the error message
                flash('Username has already been taken')
                return redirect(url_for('register'))
            
            # Hashes the password
            hashed_password = bcrypt.generate_password_hash(password)

            # Creates a new user and add it to the database
            user = User(username=username, password=hashed_password)
            db.session.add(user)
            db.session.commit()

            return redirect(url_for('login'))
        
        return render_template('register.html')
    
    # Route for login page
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        # Runs if user submits the form
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            # Querys the database for a user with the username
            user = User.query.filter(User.username == username).first()

            # Logs the user in if username and password matches
            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('home'))
            
            # Shows the error message
            flash("Invalid username or password!")
             
        return render_template('login.html')
    
    # Route for user logout
    @app.route('/logout')
    def logout():
        logout_user()
        return redirect(url_for('login'))

    # Route for adding expenses
    @app.route('/add-expense', methods=['POST'])
    def add_expense():
        expense = float(request.form.get('add-expense'))
        new_expense = Expense(amount=expense, user_id=current_user.uid)
        db.session.add(new_expense)
        db.session.commit()

        budget = current_user.budget - new_expense.amount
        current_user.budget = budget
        if budget <= 0:
            new_notification = Notification(
                user_id=current_user.uid,  # Associate the notification with the current user
                title="Running out of Budget",
                message="After your latest expense, your budget is now empty.",
                created_at=datetime.now()  # Use the current time for the notification's creation
            )

            db.session.add(new_notification)
            db.session.commit()

        return jsonify({
            'id': new_expense.id, 
            'expense': new_expense.amount
        })
    
    # Route for setting budget
    @login_required
    @app.route('/set-budget', methods=['POST'])
    def set_budget():
        budget = float(request.form.get('set-budget'))
        if budget > 0:
            current_user.budget = budget
            db.session.commit()

            return redirect(url_for('home'))
        
        return "Invalid budget", 400
    
    # Route for getting budget
    @login_required
    @app.route('/get-budget', methods=['GET'])
    def get_budget():
        return jsonify({'budget': current_user.budget})
    
    # Route for adding notification
    @login_required
    @app.route('/add-notification', methods=['POST'])
    def add_notification():
        data = request.get_json()

        # Extract title and message from the JSON payload
        title = data.get('title')
        message = data.get('message')

        # Validate the data
        if not title or not message:
            return jsonify({'message': 'Title and message are required'}), 400
        
        new_notification = Notification(
            user_id=current_user.uid,  # Associate the notification with the current user
            title=title,
            message=message,
            created_at=datetime.now()  # Use the current time for the notification's creation
        )

        db.session.add(new_notification)
        db.session.commit()

        return jsonify({'message': 'Notification added successfully'}), 201
    
    # Route for getting notifications
    @login_required
    @app.route('/get-notification', methods=['GET'])
    def get_notification():
        notifications = Notification.query.filter_by(user_id=current_user.uid).order_by(Notification.created_at.desc()).all()

        # If no notifications found
        if not notifications:
            return jsonify({'message': 'No notifications found'}), 404

        notifications_data = [{
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'is_read': notification.is_read,
            'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for notification in notifications]

        return jsonify({'notifications': notifications_data}), 200