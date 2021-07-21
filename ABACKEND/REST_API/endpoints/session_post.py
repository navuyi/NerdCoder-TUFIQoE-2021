import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid, commit


bp = Blueprint("session_post", __name__, url_prefix="/session")


@bp.route("/", methods=["POST"])
def post_session():
    try:
        data = request.json
        session_data = data["session_data"]


        f_record = session_data[0]
        l_record = session_data[len(session_data)-1]
    except Exception as err:
        print(err)
        return {"msg": "Could not read the data"}, 422


    # Get the monitoring session general data
    try:
        # Extracting videoID and sCPN from LAST CAPTURED RECORD of session data
        # First records may have wrong information due to different time of nerd statistics update when entering new videos
        # The number of wrong/misleading records strongly depends on Internet connection
        videoID = re.search("^(.+)\s\/", l_record["videoId_sCPN"]).group(1)
    except Exception as e:
        print(e)
        videoID = None
    try:
        sCPN = re.search("\/\s(.+)", l_record["videoId_sCPN"]).group(1).replace(" ", "")
    except Exception as e:
        print(e)
        sCPN = None
    url = l_record["url"] # URL got from browser's URL not from nerd stats video ID - nerd stats may be misleading
    timestamp_start_s = (int(f_record["timestamp"])/1000) + 2 * 3600        # timestamp in seconds + 2h
    timestamp_end_s = (int(l_record["timestamp"])/1000) + 2 * 3600          # timestamp in seconds + 2h
    start_date = datetime.utcfromtimestamp(timestamp_start_s).strftime("%Y-%m-%d")
    start_time = datetime.utcfromtimestamp(timestamp_start_s).strftime("%H:%M:%S")
    start_time_utc_ms = f_record["timestamp"]
    end_time = datetime.utcfromtimestamp(timestamp_end_s).strftime("%H:%M:%S")
    end_time_utc_ms = l_record["timestamp"]
    session_duration_ms = int(l_record["timestamp"]) - int(f_record["timestamp"])



    # Database operations
    try:
        print("Opening database connection")

        # Insert general data bout the monitor session
        insert_general_data = "INSERT INTO sessions (videoID, sCPN, url, start_date, start_time, start_time_utc_ms, end_time, end_time_utc_ms, session_duration_ms) VALUES (?,?,?,?,?,?,?,?,?);"
        insert = (videoID, sCPN, url, start_date, start_time, start_time_utc_ms, end_time, end_time_utc_ms, session_duration_ms)
        cursor().execute(insert_general_data, insert)






        # Insert captured session data - details
        session_id = lastrowid()
        for record in session_data:

            timestamp_utc_ms = record["timestamp"]
            timestamp_local_ms = record["timestamp"] + 2 * 3600 * 1000
            timestamp = re.search(",\s(.+$)", str(timedelta(milliseconds=timestamp_local_ms))).group(1)

            [dropped_frames, total_frames] = get_frames(record)
            [current_resolution, optimal_resolution] = get_resolution(record)
            [current_framerate, optimal_framerate] = get_framerate(record)

            # No formating for now
            codecs = record["codecs"]
            color = record["color"]

            viewport = get_viewport(record)
            volume = get_volume(record)
            connection_speed = get_connection_speed(record)
            network_activity = get_network_activity(record)
            buffer_health = get_buffer_health(record)

            mystery_t = get_mystery_t(record)
            mystery_s = get_mystery_s(record)

            columns = """ session_id, timestamp, timestamp_utc_ms,
                viewport, dropped_frames, total_frames,
                current_resolution, optimal_resolution,
                current_framerate, optimal_framerate,
                volume, codecs, color, connection_speed,
                network_activity, buffer_health, mystery_s, mystery_t """

            insert_session_data = f"INSERT INTO session_data ({columns}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            insert = (
                session_id, timestamp, timestamp_utc_ms,
                viewport, dropped_frames, total_frames,
                current_resolution, optimal_resolution,
                current_framerate, optimal_framerate,
                volume, codecs, color, connection_speed,
                network_activity, buffer_health, mystery_s, mystery_t
            )
            cursor().execute(insert_session_data, insert)

        # Insert captured assessments
        try:
            assessment_data = data["assessment_data"]

            for record in assessment_data:
                assessment = record["assessment"]
                duration_ms = record["duration"]
                timestamp_utc_ms = record["timestamp"]
                timestamp_s = (int(timestamp_utc_ms)/1000) + 2 * 3600        # timestamp in seconds +2h
                timestamp = datetime.utcfromtimestamp(timestamp_s).strftime("%H:%M:%S")
                time_in_video = record["time_in_video"]

                statement = f"INSERT INTO assessments (session_id, assessment, timestamp, timestamp_utc_ms, time_in_video, duration_ms) VALUES (?,?,?,?,?,?)"
                insert = (session_id, assessment, timestamp, timestamp_utc_ms, time_in_video, duration_ms)
                cursor().execute(statement, insert)
        except Exception as e:
            print(e)
            print("No assessment data provided")

        # Insert captured mouse tracker data
        try:
            mouse_data = data["mousetracker"]
            for record in mouse_data:
                posX = record["posX"]
                posY = record["posY"]
                timestamp_utc_ms = record["timestamp_utc_ms"]

                statement = "INSERT INTO mousetracker (session_id, posX, posY, timestamp_utc_ms) VALUES (?,?,?,?)"
                insert = (session_id, posX, posY, timestamp_utc_ms)
                cursor().execute(statement, insert)
        except Exception as e:
            print(e)
            print("No mouse tracker data provided")
    except Exception as e:
        print(e)
        return {"msg": "Something went wrong"}, 500




    print("DONE")
    return {"msg": "OK"}, 201

