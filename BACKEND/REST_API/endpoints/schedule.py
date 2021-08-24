import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid


bp = Blueprint("schedule", __name__, url_prefix="/schedule")


@bp.route("/", methods=["POST"])
def create_schedule():
    scenario = request.json

    name = scenario["name"]
    session_id = scenario["session_id"]
    schedule = scenario["schedule"]


    for item in schedule:
        if item["type"] == "throttling":
            params = item["params"]
            insert = {
                "session_id": session_id,
                "name": name,
                "type": item["type"],
                "timeout_s": item["timeout_s"],
                "downloadBandwidth": params["downloadThroughput"],
                "uploadBandwidth": params["uploadThroughput"]
            }
            cursor().execute(f"INSERT INTO schedule (session_id, name, type, timeout_s, download_bandwidth_bytes, upload_bandwidth_bytes) VALUES (:session_id, :name, :type, :timeout_s, :downloadBandwidth, :uploadBandwidth)", insert)
        elif item["type"] == "finish":
            insert = {
                "session_id": session_id,
                "name": name,
                "type": item["type"],
                "timeout_s": item["timeout_s"]
            }
            cursor().execute(f"INSERT INTO schedule (session_id, name, type, timeout_s) VALUES (:session_id, :name, :type, :timeout_s)", insert)
        print(insert)

    return jsonify(msg="OK"), 201

