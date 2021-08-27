import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid


bp = Blueprint("new_session", __name__, url_prefix="/session")


@bp.route("/", methods=["POST"])
def create_session():
    if "subject_id" not in request.json and "video_type" not in request.json and "session_type" not in request.json:
        return {"msg": "Not enough data"}, 422

    # Check if session already exists
    cursor().execute(f"SELECT subject_id, video_type, session_type FROM session")
    sessions = cursor().fetchall()
    for session in sessions:
        if session["subject_id"] == request.json["subject_id"] and session["video_type"] == request.json["video_type"] and session["session_type"] == request.json["session_type"]:
            return {"msg": "Session already exists"}, 409

    input = {
        "subject_id": request.json["subject_id"],
        "subject_id_hash": request.json["subject_id_hash"],
        "session_type": request.json["session_type"],
        "video_type": request.json["video_type"],
        "assessment_panel_layout": request.json["assessment_panel_layout"],
        "assessment_panel_opacity": request.json[ "assessment_panel_opacity"],
        "assessment_interval_ms": request.json["assessment_interval_ms"]
    }
    cursor().execute(f"INSERT INTO session (subject_id, subject_id_hash, session_type, video_type, assessment_panel_opacity, assessment_panel_layout, assessment_interval_ms) "
                     f"VALUES (:subject_id, :subject_id_hash, :session_type, :video_type, :assessment_panel_opacity, :assessment_panel_layout, :assessment_interval_ms)", input)

    session_id = lastrowid()
    response = jsonify(msg="New session created", session_id=session_id)

    return response, 200

