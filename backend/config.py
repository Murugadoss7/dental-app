import os
from datetime import timedelta

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # MongoDB configuration
    # MONGO_URI = "mongodb://localhost:27017/dental_db"
    
    MONGO_URI = "mongodb+srv://jmdoss7:CGSsGl2yV1qUofKR@cluster0.nzjgq.mongodb.net/dentalApp?retryWrites=true&w=majority&appName=Cluster0"
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'} 