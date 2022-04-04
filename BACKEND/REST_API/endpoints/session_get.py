import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid


bp = Blueprint("session_get", __name__, url_prefix="/session")


@bp.route("/", methods=["GET"])
def get_session():

    result = []

    cursor().execute("SELECT * FROM session")
    sessions = cursor().fetchall()

    # Get session's videos
    for session in sessions:
        cursor().execute(f"SELECT * FROM video WHERE session_id=?", (session["id"], ))
        videos = cursor().fetchall()

        # Get video's captured data
        for video in videos:
            cursor().execute(f"SELECT * FROM video_data WHERE video_id=?", (video["id"], ))
            data = cursor().fetchall()
            video["records"] = data
        session["videos"] = videos

        # Get assessments
        cursor().execute("SELECT * FROM assessment WHERE session_id=?", (session["id"], ))
        assessments = cursor().fetchall()
        session["assessments"] = assessments if not [] else None

        for assessment in assessments:
            cursor().execute(f"SELECT video.id FROM video, assessment "
                             f"WHERE assessment.timestamp BETWEEN video.start_time_utc_ms AND video.end_time_utc_ms AND assessment.id=? AND video.session_id=? AND assessment.session_id=?",
                             (assessment["id"], session["id"], session["id"]))
            try:
                video_id = cursor().fetchone()["id"]
            except Exception as e:
                print(e)
                video_id = None
            assessment["video_id"] = video_id

        # Get interest assessments
        try:
            cursor().execute("SELECT * FROM interest WHERE session_id=?", (session["id"], ))
            interests = cursor().fetchall()
            session["interest"] = interests if not [] else None

            for interest in interests:
                cursor().execute(f"SELECT video.id FROM video, interest "
                                 f"WHERE interest.timestamp BETWEEN video.start_time_utc_ms AND video.end_time_utc_ms AND interest.id=? AND video.session_id=? AND interest.session_id=?",
                                 (interest["id"], session["id"], session["id"]))
                try:
                    video_id = cursor().fetchone()["id"]
                except Exception as e:
                    print(e)
                    video_id = None
                interest["video_id"] = video_id
        except:
            pass

        # Get mouse tracking data
        cursor().execute(f"SELECT * FROM mousetracker WHERE session_id=? AND type=?", (session["id"], "mousemove"))
        mousemove = cursor().fetchall()
        cursor().execute(f"SELECT * FROM mousetracker WHERE session_id=? AND type=?", (session["id"], "mousedown"))
        mousedown = cursor().fetchall()

        session["mousedown"] = mousedown
        session["mousemove"] = mousemove

        # Get schedule data
        cursor().execute(f"SELECT * FROM schedule WHERE session_id=?", (session["id"], ))
        schedule_data = cursor().fetchall()

        session["schedule"] = schedule_data

    result = sessions
    return jsonify(result), 200
