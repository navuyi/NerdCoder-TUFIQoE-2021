import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from .utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

DATABASE_FILE = "./database/nerdcoder_data.db"

monitor_session = Blueprint("monitor_session", __name__)



@monitor_session.route("/new_session", methods=["POST"])
def post_session():
    try:
        data = request.json
        session_data = data["session_data"]
        del session_data[0:2]

        f_record = session_data[0]
        l_record = session_data[len(session_data)-1]
    except Exception as err:
        return err

    # Get the monitoring session general data
    videoID = re.search("^(.+)\s\/", f_record["videoId_sCPN"]).group(1)
    sCPN = re.search("\/\s(.+)", f_record["videoId_sCPN"]).group(1).replace(" ", "")
    url = "https://youtube.com/watch?v=" + videoID
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
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        # Insert general data bout the monitor session
        insert_general_data = "INSERT INTO sessions (videoID, sCPN, url, start_date, start_time, start_time_utc_ms, end_time, end_time_utc_ms, session_duration_ms) VALUES (?,?,?,?,?,?,?,?,?);"
        insert = (videoID, sCPN, url, start_date, start_time, start_time_utc_ms, end_time, end_time_utc_ms, session_duration_ms)
        cursor.execute(insert_general_data, insert)

        # Insert captured session data - details
        session_id = cursor.lastrowid
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
            cursor.execute(insert_session_data, insert)

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
                cursor.execute(statement, insert)
        except:
            print("No assessment data provided - nothing to be inserted")

        cursor.close()
    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)
    finally:
        if conn:
            conn.commit()
            conn.close()
            print("The SQLite connection is closed")

    return {"msg": "OK"}, 201





@monitor_session.route("/sessions", methods=["GET"])
def get_session():
    available_args = ["id", "limit"]
    id_arg = request.args.get("id")


    # Database operations
    try:
        print("Opening database connection")
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = dict_factory
        cursor = conn.cursor()

        # If session id was not provided in the url return all sessions and their data
        if not id_arg:
            statement = "SELECT * FROM sessions"

        cursor.execute(statement)
        sessions = cursor.fetchall()


        # For every session provide its captured data and assessments
        for session in sessions:

            session_id = session["id"]
            # Get captured data for the session
            statement = f"SELECT * FROM session_data WHERE session_id={session_id}"
            cursor.execute(statement)
            data = cursor.fetchall()

            # Assign captured data to the session
            session["records"] = data

            # Get captured assessments for the session
            statement = f"SELECT * FROM assessments WHERE session_id={session_id}"
            cursor.execute(statement)
            data = cursor.fetchall()

            # Assign captured assessments to the session - null in case there were no assessments captured
            if len(data) == 0:
                session["assessments"] = None
            else:
                session["assessments"] = data

        cursor.close()
    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)

    finally:
        if conn:
            conn.commit()
            conn.close()
            print("The SQLite connection is closed")


    return jsonify(sessions), 200
