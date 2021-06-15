import sqlite3
from flask import request
from flask import Blueprint
import re
from datetime import datetime, timedelta

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
    timestamp = (int(f_record["timestamp"])/1000) + 2 * 3600
    start_date = datetime.utcfromtimestamp(timestamp).strftime("%Y-%m-%d")
    start_time = datetime.utcfromtimestamp(timestamp).strftime("%H:%M:%S")







    # Database operations
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        sqlite_select_Query = "select sqlite_version();"
        cursor.execute(sqlite_select_Query)
        record = cursor.fetchall()
        print("SQLite Database Version is: ", record)
        cursor.close()

    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)

    finally:
        if conn:
            conn.close()
            print("The SQLite connection is closed")

    return {"msg": "OK"}, 200

