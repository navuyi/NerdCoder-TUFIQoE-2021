from flask import Blueprint


bp = Blueprint("session_get", __name__, url_prefix="/session")


@bp.route("/", methods=["GET"])
def get_session():
    return {"msg": "GET session OK"}, 200
    pass