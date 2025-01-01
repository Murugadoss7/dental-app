from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from config import Config

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    mongo.init_app(app)
    
    return app 

# Create the app instance
flask_app = create_app()