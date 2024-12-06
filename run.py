from app import create_app

# Creates the app instance
flask_app = create_app()

if __name__ == '__main__':
    # Starts the server
    flask_app.run(debug=True)