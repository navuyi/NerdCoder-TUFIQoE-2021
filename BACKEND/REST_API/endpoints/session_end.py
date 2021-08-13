import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid


bp = Blueprint("session_end", __name__, url_prefix="/session")


@bp.route("/", methods=["PUT"])
def end_session():
    if "session_id" not in request.json:
        return {"Gone wrong"}, 422

    session_id = request.json["session_id"]
    cursor().execute(f"UPDATE session SET ended=(datetime('now', 'localtime')) WHERE id=?", (session_id, ))


    return {"msg": "Session finish time updated"}, 201
