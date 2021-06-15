import sqlite3
from flask import request
from flask import Blueprint
import re
from datetime import datetime, timedelta
from .utils import get_frames, get_resolution, get_framerate

DATABASE_FILE = "./database/nerdcoder_data.db"

monitor_session = Blueprint("monitor_session", __name__)



@monitor_session.route("/post_session", methods=["POST", "GET"])
def post_session():
    data = request.json
    f_record = data[0]

    # Get the monitoring session general data
    videoID = re.search("^(.+)\s\/", f_record["videoId_sCPN"]).group(1)
    sCPN = re.search("\/\s(.+)", f_record["videoId_sCPN"]).group(1).replace(" ", "")
    url = "https://youtube.com/watch?v=" + videoID
    timestamp = (int(f_record["timestamp"])/1000) + 2 * 3600        # timestamp in seconds
    start_date = datetime.utcfromtimestamp(timestamp).strftime("%Y-%m-%d")
    start_time = datetime.utcfromtimestamp(timestamp).strftime("%H:%M:%S")




    # Database operations
    try:
        print("Opening database connection")
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        insert_general_data = "INSERT INTO sessions (videoID, sCPN, url, start_date, start_time) VALUES (?,?,?,?,?);"
        insert = (videoID, sCPN, url, start_date, start_time)
        cursor.execute(insert_general_data, insert)

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



        cursor.close()
    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)

    finally:
        if conn:
            conn.commit()
            conn.close()
            print("The SQLite connection is closed")

    return {"msg": "OK"}, 200

