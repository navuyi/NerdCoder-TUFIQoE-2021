from flask import Flask
from flask_cors import CORS

# Load blueprints
from endpoints.monitor_session import monitor_session
from endpoints.connection_check import bp as bp_connection_check

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False  # Prevents json() from sorting key in dictionaries

config = {
    "ORIGINS": [
        "*",
        "chrome-extension://*"
    ]
}
cors = CORS(app, resources={r"/*": {"origins": config["ORIGINS"]}}, supports_credentials=True)



# Register blueprints
app.register_blueprint(monitor_session)
app.register_blueprint(bp_connection_check)