from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from config import Config, db
from models import Interview, SavedJob, User


app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
migrate = Migrate(app, db)


@app.route("/")
def home():
    return {
        "message": "Welcome to Career Companion API 🚀"
    }


@app.route("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "configured"
    }


if __name__ == "__main__":
    app.run(debug=True)