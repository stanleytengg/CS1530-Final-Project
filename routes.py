from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from models import User, Expense

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
        new_expense = Expense(amount=expense, 
                              user_id=current_user.uid,
                              day_id=current_user.day
                              )
        db.session.add(new_expense)
        db.session.commit()

        return jsonify({
            'id': new_expense.id, 
            'expense': new_expense.amount,
            'day_id': new_expense.day_id
        })

    # Route for next day
    @app.route('/next-day', methods=['POST'])
    def next_day():
        current_user.day += 1
        db.session.commit()

        return jsonify({'day': current_user.day})