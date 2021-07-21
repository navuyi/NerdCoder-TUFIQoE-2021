from flask import Blueprint


bp = Blueprint("session_post", __name__, url_prefix="/session")


@bp.route("/", methods=["POST"])
def post_session():
    return {"msg": "POST session OK"}, 200
    pass