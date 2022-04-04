import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid

bp = Blueprint("new_interest", __name__, url_prefix="/interest")


@bp.route("/", methods=["POST"])
def new_interest_assessment():
    print(request.json)
    insert = {
        "session_id": request.json["session_id"],
        "video_id": request.json["video_id"] if "video_id" in request.json else None,
        "value": request.json["assessment"],
        "duration": request.json["duration"],
        "time_in_video": request.json["time_in_video"],
        "timestamp": request.json["timestamp"]
    }

    cursor().execute(f"INSERT INTO interest (session_id, video_id, value, duration, time_in_video, timestamp) VALUES"
                     f"(:session_id, :video_id, :value, :duration, :time_in_video, :timestamp)", insert)


    return {"msg": "OK"}, 201
