import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from REST_API.utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

from REST_API.db import cursor, db_get, lastrowid

bp = Blueprint("new_video", __name__, url_prefix="/video")


@bp.route("/", methods=["POST"])
def create_video():
    try:
        data = request.json
        video_data = data["session_data"]
        session_id = data["session_id"]

        f_record = video_data[0]
        l_record = video_data[len(video_data) - 1]
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

    url = l_record["url"]  # URL got from browser's URL not from nerd stats video ID - nerd stats may be misleading
    timestamp_start_s = int(f_record["timestamp"]) / 1000
    timestamp_end_s = int(l_record["timestamp"]) / 1000
    start_date = datetime.fromtimestamp(timestamp_start_s).strftime("%Y-%m-%d")
    start_time = datetime.fromtimestamp(timestamp_start_s).strftime("%H:%M:%S")
    start_time_utc_ms = f_record["timestamp"]
    end_time = datetime.fromtimestamp(timestamp_end_s).strftime("%H:%M:%S")
    end_time_utc_ms = l_record["timestamp"]
    monitoring_duration_ms = int(l_record["timestamp"]) - int(f_record["timestamp"])

    # Database operations
    try:
        print("Opening database connection")

        # Insert general data bout the monitor session`
        insert_general_data = f"INSERT INTO video (session_id, videoID, sCPN, url, start_date, start_time, start_time_utc_ms, end_time, end_time_utc_ms, monitoring_duration_ms) VALUES \
                                             (:session_id, :videoID, :sCPN, :url, :start_date, :start_time, :start_time_utc_ms, :end_time, :end_time_utc_ms, :monitoring_duration_ms);"
        insert = {
            "session_id": session_id,
            "videoID": videoID,
            "sCPN": sCPN,
            "url": url,
            "start_date": start_date,
            "start_time": start_time,
            "start_time_utc_ms": start_time_utc_ms,
            "end_time": end_time,
            "end_time_utc_ms": end_time_utc_ms,
            "monitoring_duration_ms": monitoring_duration_ms,
        }
        cursor().execute(insert_general_data, insert)

        # Insert captured session data - details
        video_id = lastrowid()
        for record in video_data:
            timestamp_utc_ms = record["timestamp"]
            timestamp_local_ms = datetime.fromtimestamp(record["timestamp"]/1000)
            #timestamp = re.search(",\s(.+$)", str(timedelta(milliseconds=timestamp_local_ms))).group(1)
            timestamp = datetime.fromtimestamp(int(timestamp_utc_ms)/1000).strftime("%H:%M:%S.%f")

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

            download_bandwidth_bytes = record["download_bandwidth_bytes"] if "download_bandwidth_bytes" in record else None
            upload_bandwidth_bytes = record["upload_bandwidth_bytes"] if "upload_bandwidth_bytes" in record else None

            columns = """ video_id, scrollY, timestamp, timestamp_utc_ms,
                viewport, dropped_frames, total_frames,
                current_resolution, optimal_resolution,
                current_framerate, optimal_framerate,
                volume, codecs, color, connection_speed,
                network_activity, buffer_health, mystery_s, mystery_t,
                download_bandwidth_bytes, upload_bandwidth_bytes """

            insert_session_data = f"INSERT INTO video_data ({columns}) VALUES" \
                                  f" (:video_id, :scrollY, :timestamp, :timestamp_utc_ms, :viewport, :dropped_frames, :total_frames," \
                                  f":current_resolution, :optimal_resolution, :current_framerate, :optimal_framerate, " \
                                  f":volume, :codecs, :color, :connection_speed, :network_activity, :buffer_health, :mystery_s, :mystery_t," \
                                  f":download_bandwidth_bytes, :upload_bandwidth_bytes);"
            insert = {
                "video_id": video_id,
                "scrollY": record["scrollY"],
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
                "mystery_t": mystery_t,
                "download_bandwidth_bytes": download_bandwidth_bytes,
                "upload_bandwidth_bytes": upload_bandwidth_bytes
            }
            cursor().execute(insert_session_data, insert)

    except Exception as e:
        print(e)
        return {"msg": "Something went wrong"}, 500

    print("DONE")
    return {"msg": "OK"}, 201
