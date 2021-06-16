import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from .utils import get_frames, get_resolution, get_framerate, dict_factory
from collections import OrderedDict

DATABASE_FILE = "./database/nerdcoder_data.db"

monitor_session = Blueprint("monitor_session", __name__)



@monitor_session.route("/post_session", methods=["POST"])
def post_session():
    data = request.json
    f_record = data[0]
    l_record = data[len(data)-1]

    # Get the monitoring session general data
    videoID = re.search("^(.+)\s\/", f_record["videoId_sCPN"]).group(1)
    sCPN = re.search("\/\s(.+)", f_record["videoId_sCPN"]).group(1).replace(" ", "")
    url = "https://youtube.com/watch?v=" + videoID
    timestamp_start_s = (int(f_record["timestamp"])/1000) + 2 * 3600        # timestamp in seconds
    timestamp_end_s = (int(l_record["timestamp"])/1000) + 2 * 3600
    start_date = datetime.utcfromtimestamp(timestamp_start_s).strftime("%Y-%m-%d")
    start_time = datetime.utcfromtimestamp(timestamp_start_s).strftime("%H:%M:%S")
    end_time = datetime.utcfromtimestamp(timestamp_end_s).strftime("%H:%M:%S")
    session_duration_ms = int(l_record["timestamp"]) - int(f_record["timestamp"])




    # Database operations
    try:
        print("Opening database connection")
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        # Insert general data bout the monitor session
        insert_general_data = "INSERT INTO sessions (videoID, sCPN, url, start_date, start_time, end_time, session_duration_ms) VALUES (?,?,?,?,?,?,?);"
        insert = (videoID, sCPN, url, start_date, start_time, end_time, session_duration_ms)
        cursor.execute(insert_general_data, insert)

        # Insert captured session data - details
        session_id = cursor.lastrowid
        for record in data:
            timestamp_ms = record["timestamp"] + 2 * 3600 * 1000

            timestamp = re.search(",\s(.+$)", str(timedelta(milliseconds=timestamp_ms))).group(1)
            viewport = re.search("^([0-9]+)x([0-9]+)", record["viewport_frames"]).group(0)
            [dropped_frames, total_frames] = get_frames(record)
            [current_resolution, optimal_resolution] = get_resolution(record)
            [current_framerate, optimal_framerate] = get_framerate(record)

            volume = re.search("^([0-9]{1,3})%", record["volume_normalized"]).group(1)
            codecs = record["codecs"]
            color = record["color"]

            connection_speed = re.search("[0-9]+", record["connectionSpeed"]).group(0)
            network_activity = re.search("[0-9]+", record["networkActivity"]).group(0)
            buffer_health = re.search("[0-9]+\.[0-9]+", record["bufferHealth"]).group(0)

            mystery_s = re.search("s:([a-zA-Z0-9]+)", record["mysteryText"]).group(1)
            mystery_t = re.search("t:([0-9]+\.[0-9]+)", record["mysteryText"]).group(1)

            data_marker = """ session_id, timestamp,
                viewport, dropped_frames, total_frames,
                current_resolution, optimal_resolution,
                current_framerate, optimal_framerate,
                volume, codecs, color, connection_speed,
                network_activity, buffer_health, mystery_s, mystery_t """

            insert_session_data = f"INSERT INTO session_data ({data_marker}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            insert = (
                session_id, timestamp,
                viewport, dropped_frames, total_frames,
                current_resolution, optimal_resolution,
                current_framerate, optimal_framerate,
                volume, codecs, color, connection_speed,
                network_activity, buffer_health, mystery_s, mystery_t
            )

            cursor.execute(insert_session_data, insert)

            print(cursor.lastrowid)

        cursor.close()
    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)

    finally:
        if conn:
            conn.commit()
            conn.close()
            print("The SQLite connection is closed")

    return {"msg": "OK"}, 200





@monitor_session.route("/get_session", methods=["GET"])
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
        else:
            statement = f"SELECT * FROM sessions WHERE id={id_arg}"
        cursor.execute(statement)
        sessions = cursor.fetchall()


        # For every session provide its captured data
        for session in sessions:

            session_id = session["id"]
            statement = f"SELECT * FROM session_data WHERE session_id={session_id}"
            cursor.execute(statement)
            data = cursor.fetchall()

            session["records"] = data

        cursor.close()
    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)

    finally:
        if conn:
            conn.commit()
            conn.close()
            print("The SQLite connection is closed")


    return jsonify(sessions), 200
