from flask import Flask
from flask_cors import CORS

# Load blueprints
from endpoints.monitor_session import monitor_session

app = Flask(__name__)
config = {
    "ORIGINS":[
       "*"
    ]
}
cors = CORS(app, resources={r"/*": {"origins": config["ORIGINS"]}}, supports_credentials=True)



# Register blueprints
app.register_blueprint(monitor_session)
