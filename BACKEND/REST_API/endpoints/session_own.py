
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid


bp = Blueprint("session_own", __name__, url_prefix="/session")


@bp.route("/own", methods=["GET"])
def get_session_own():
    video_type = "own"

    # Database operations
    try:
        cursor().execute(f"SELECT * FROM sessions WHERE video_type = ?", (video_type, ))
        sessions = cursor().fetchall()


        # For every session provide its captured data and assessments
        for session in sessions:

            session_id = session["id"]
            # Get captured data for the session
            statement = f"SELECT * FROM session_data WHERE session_id={session_id}"
            cursor().execute(statement)
            data = cursor().fetchall()

            # Assign captured data to the session
            session["records"] = data

            # Get captured assessments for the session
            statement = f"SELECT * FROM assessments WHERE session_id={session_id}"
            cursor().execute(statement)
            data = cursor().fetchall()

            # Assign captured assessments to the session - null in case there were no assessments captured
            if len(data) == 0:
                session["assessments"] = None
            else:
                session["assessments"] = data

            # Get mouse tracker data for the session
            statement = f"SELECT posX, posY, timestamp_utc_ms FROM mousetracker WHERE session_id={session_id}"
            cursor().execute(statement)
            data = cursor().fetchall()

            if(len(data) == 0):
                session["mousetracker"] = None
            else:
                session["mousetracker"] = data


    except Exception as error:
        print(error)
        return {"msg": "Something went wrong"}, 500


    return jsonify(sessions), 200
