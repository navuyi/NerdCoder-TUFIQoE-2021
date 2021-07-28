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

        if "tester_id" in data and "video_type" in data:
            tester_id = data["tester_id"]
            video_type = data["video_type"]

        f_record = session_data[0]
        l_record = session_data[len(session_data)-1]
    except Exception as err:
        print(err)
        try:
            # If no session data was provided check fo assessment data
            # If assessment data is present link it to the last session in database
            assessments = data["assessment_data"]
            cursor().execute("SELECT id, start_time_utc_ms FROM sessions ORDER BY id DESC LIMIT 1")
            last_row = cursor().fetchone()
            print(assessments)
            print(len(assessments))
            for record in assessments:
                print(record)
                assessment = record["assessment"]
                duration_ms = record["duration"]
                timestamp_utc_ms = record["timestamp"]
                timestamp_s = (int(timestamp_utc_ms)/1000) + 2 * 3600        # timestamp in seconds +2h
                timestamp = datetime.utcfromtimestamp(timestamp_s).strftime("%H:%M:%S")
                # Calculate time in video based on session start_time and assessment timestamp - mystery t text is set to 0.00 in this case
                # This is the approximative time in the video - session time can be increasing while nerd stat mystery t text can be still set to 0 - video loading
                # Value of this time can exceed total duration of the session it can be misleading
                time_in_video = (timestamp_utc_ms-last_row["start_time_utc_ms"]) / 1000 # <-- divide by 1000 to get time in seconds
                # Other option is to set the value to null - it clearly tells that this assessment was done outside the video playback
                time_in_video = None

                statement = f"INSERT INTO assessments (session_id, assessment, timestamp, timestamp_utc_ms, time_in_video, duration_ms) VALUES " \
                            f"(:session_id, :assessment, :timestamp, :timestamp_utc_ms, :time_in_video, :duration_ms);"
                insert = {
                    "session_id": last_row["id"],
                    "assessment": assessment,
                    "timestamp": timestamp,
                    "timestamp_utc_ms": timestamp_utc_ms,
                    "time_in_video": time_in_video,
                    "duration_ms": duration_ms
                }
                cursor().execute(statement, insert)
                print("Lone Assessments - DONE")
            return {"msg": "OK"}, 201
        except Exception as e:
            print(e)
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
        insert_general_data = f"INSERT INTO sessions (videoID, sCPN, url, start_date, start_time, start_time_utc_ms, end_time, end_time_utc_ms, session_duration_ms, tester_id, video_type) VALUES \
                                             (:videoID, :sCPN, :url, :start_date, :start_time, :start_time_utc_ms, :end_time, :end_time_utc_ms, :session_duration_ms, :tester_id, :video_type);"
        insert = {
            "videoID": videoID,
            "sCPN": sCPN,
            "url": url,
            "start_date": start_date,
            "start_time": start_time,
            "start_time_utc_ms": start_time_utc_ms,
            "end_time": end_time,
            "end_time_utc_ms": end_time_utc_ms,
            "session_duration_ms": session_duration_ms,
            "tester_id": tester_id,
            "video_type": video_type
        }

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

            insert_session_data = f"INSERT INTO session_data ({columns}) VALUES" \
                                  f" (:session_id, :timestamp, :timestamp_utc_ms, :viewport, :dropped_frames, :total_frames," \
                                  f":current_resolution, :optimal_resolution, :current_framerate, :optimal_framerate, " \
                                  f":volume, :codecs, :color, :connection_speed, :network_activity, :buffer_health, :mystery_s, :mystery_t);"
            insert = {
                "session_id": session_id,
                "timestamp": timestamp,
                "timestamp_utc_ms": timestamp_utc_ms,
                "viewport": viewport,
                "dropped_frames": dropped_frames,
                "total_frames": total_frames,
                "current_resolution": current_resolution,
                "optimal_resolution": optimal_resolution,
                "current_framerate": current_framerate,
                "optimal_framerate": optimal_framerate,
                "volume": volume,
                "codecs": codecs,
                "color": color,
                "connection_speed": connection_speed,
                "network_activity": network_activity,
                "buffer_health": buffer_health,
                "mystery_s": mystery_s,
                "mystery_t": mystery_t
            }
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

                statement = f"INSERT INTO assessments (session_id, assessment, timestamp, timestamp_utc_ms, time_in_video, duration_ms) VALUES " \
                            f"(:session_id, :assessment, :timestamp, :timestamp_utc_ms, :time_in_video, :duration_ms);"
                insert = {
                    "session_id": session_id,
                    "assessment": assessment,
                    "timestamp": timestamp,
                    "timestamp_utc_ms": timestamp_utc_ms,
                    "time_in_video": time_in_video,
                    "duration_ms": duration_ms
                }
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

