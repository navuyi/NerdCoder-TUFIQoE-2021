import os
from flask import Flask, jsonify, g, request
from flask import Blueprint
from flask_cors import CORS

def create_app(test_config=None):

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_mapping(
        SECRET_KEY='dev'
    )

    app.config['JSON_SORT_KEYS'] = False  # Prevents json() from sorting key in dictionaries


    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)


    # Check if instance directory exists
    try:
        os.makedirs(app.instance_path)
    except OSError as e:
        print(e)

    ### CORS Config ###
    config = {
        "ORIGINS": [
            "*",
            "chrome-extension://*"
        ]
    }
    cors = CORS(app, resources={r"/*": {"origins": config["ORIGINS"]}}, supports_credentials=True)



    # Import database methods
    from . db import db_init_app, db_before_request, cursor, db_get

    db_init_app(app)

    # Configure hash path
    @app.route('/hash', methods=["GET"])
    def test():
        return {"msg": "OK"}, 200


    # Import blueprints ### IMPORTS BELOW ARE CORRECT DESPITE THE RED UNDERLINE ###

    from REST_API.endpoints.connection import bp as bp_connection_check
    from REST_API.endpoints.session import bp as bp_new_session
    from REST_API.endpoints.video import bp as bp_new_video
    from REST_API.endpoints.assessment import bp as bp_new_assessment
    from REST_API.endpoints.session_end import bp as bp_session_end
    from REST_API.endpoints.session_get import bp as bp_session_get
    from REST_API.endpoints.mousetracker import bp as bp_mousetracker
    from REST_API.endpoints.schedule import bp as bp_schedule
    from REST_API.endpoints.interest import bp as bp_interest

    app.register_blueprint(bp_session_end)
    app.register_blueprint(bp_new_session)
    app.register_blueprint(bp_new_video)
    app.register_blueprint(bp_new_assessment)
    app.register_blueprint(bp_connection_check)
    app.register_blueprint(bp_session_get)
    app.register_blueprint(bp_mousetracker)
    app.register_blueprint(bp_schedule)
    app.register_blueprint(bp_interest)

    # Register blueprints



    return app