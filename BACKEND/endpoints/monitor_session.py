from flask import Blueprint, jsonify, request


post_session = Blueprint("post_session", __name__)


@post_session.route("/post_session", methods=["POST"])
def post_session():
    return {"msg", "OK"}, 200

