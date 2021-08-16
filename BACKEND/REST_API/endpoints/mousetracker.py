import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid


bp = Blueprint("mousetracker_data", __name__, url_prefix="/mousetracker")


@bp.route("/", methods=["POST"])
def get_mousetracker():
    if "session_id" not in request.json or "mousetracker" not in request.json:
        return {"msg": "No data provided"}, 422

    session_id = request.json["session_id"]
    data = request.json["mousetracker"]

    for record in data:
        insert = {
            "session_id": session_id,
            "timestamp_utc_ms": record["timestamp"],
            "which": record["which"],
            "target_id": record["target_id"],
            "target_nodeName": record["target_nodeName"],
            "clientX": record["clientX"],
            "clientY": record["clientY"],
            "pageX": record["pageX"],
            "pageY": record["pageY"],
            "screenX": record["screenX"],
            "screenY": record["screenY"],
            "movementX": record["movementX"],
            "movementY": record["movementY"],
            "offsetX": record["offsetX"],
            "offsetY": record["offsetY"]
        }

        statement = f"INSERT INTO {record['type']} (session_id, timestamp_utc_ms, which, target_id, target_nodeName, clientX, clientY, pageX, pageY, screenX, screenY, movementX, movementY, offsetX, offsetY) " \
                    f"VALUES (:session_id, :timestamp_utc_ms, :which, :target_id, :target_nodeName, :clientX, :clientY, :pageX, :pageY, :screenX, :screenY, :movementX, :movementY, :offsetX, :offsetY );"
        cursor().execute(statement, insert)


    return jsonify(msg="OK"), 201

