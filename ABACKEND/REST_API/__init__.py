import os
from flask import Flask, jsonify, g, request
from flask import Blueprint

def create_app(test_config=None):

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_mapping(
        SECRET_KEY='dev'
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)


    # Check if instance directory exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Import database methods
    from . db import db_init_app, db_before_request, cursor, db_get

    db_init_app(app)

    # Configure test path
    @app.route('/test', methods=["GET"])
    def test():
        return {"msg": "OK"}, 200


    # Import blueprints ### IMPORTS BELOW ARE CORRECT DESPITE THE RED UNDERLINE ###
    from REST_API.endpoints.session_post import bp as bp_post_session
    from REST_API.endpoints.session_get import bp as bp_get_session

    app.register_blueprint(bp_post_session)
    app.register_blueprint(bp_get_session)

    # Register blueprints



    return app