import csv
import json
import os
import datetime
from utils import get_sessions


sessions = get_sessions("../database/nerdcoder_data.db")

########################################################################################################################################
########################################################################################################################################



### Generate CSV files ###
session_id = 13
session = {}

# Find desired session
for s in sessions:
    if s["id"] == session_id:
        session = s
        break

order_index = 0
for session in sessions:
    directory_name = f"session_{session['id']}__{session['experiment_type']}__{session['session_type']}__{session['subject_id']}__{order_index}"
    if not os.path.exists(directory_name):
        os.makedirs(directory_name)

    order_index += 1
    if order_index == 3:
        order_index = 0

    videos = session["videos"]
    csv_filename = f"videos.csv"

    with open(os.path.join(directory_name, csv_filename), mode='w', newline='') as csv_file:
        fieldnames = ['id', 'video_id', 'timestamp', 'viewport', 'current_resolution', 'buffer_health', 'codecs', 'color', 'bandwidth', 'dropped_frames', 'total_frames', 'current_framerate', 'optimal_framerate', 'connection_speed', 'network_activity', 'mystery_s', 'mystery_t', "volume"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for video in videos:
            video_yt_id = video["videoID"]
            video_db_id = video["id"]

            for record in video["records"]:
                writer.writerow({
                    'id': video_db_id,
                    'timestamp': record["timestamp_utc_ms"],
                    'viewport': record["viewport"],
                    'current_resolution': record["current_resolution"],
                    'buffer_health': record["buffer_health"],
                    "bandwidth": record["download_bandwidth_bytes"],
                    "dropped_frames": record["dropped_frames"],
                    "total_frames": record["total_frames"],

                    "bandwidth": record["download_bandwidth_bytes"],

                    "current_framerate": record["current_framerate"],
                    "optimal_framerate": record["optimal_framerate"],
                    "connection_speed": record["connection_speed"],
                    "network_activity": record["network_activity"],
                    "mystery_t": record["mystery_t"],
                    "mystery_s": record["mystery_s"],
                    "video_id": video_yt_id,
                    "volume": record["volume"],
                    "codecs": record["codecs"],
                    "color": record["color"]
                })


    # Write CSV with assessments
    assessments = session["assessments"]
    assessments_filename = f"assessments.csv"
    with open(os.path.join(directory_name, assessments_filename), mode='w', newline='') as csv_file:
        fieldnames = ["timestamp", "duration", "value", "datetime"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for assessment in assessments:
            writer.writerow({
                "timestamp": assessment["timestamp"],
                "duration": assessment["duration"],
                "value": assessment["value"],
                "datetime": datetime.datetime.fromtimestamp(int(assessment["timestamp"])/1000)
        })

    # Write CSV with interest
    interest = session["interest"]
    interest_filename = "interest.csv"
    with open(os.path.join(directory_name, interest_filename), mode='w', newline='') as csv_file:
        fieldnames = ["timestamp", "duration", "value", "datetime"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for _int in interest:
            writer.writerow({
                "timestamp": _int["timestamp"],
                "duration": _int["duration"],
                "value": _int["value"],
                "datetime": datetime.datetime.fromtimestamp(int(_int["timestamp"])/1000)
            })


    # Write CSV with mousemove
    mousemove = session["mousemove"]
    mousemove_filename = "mousemove.csv"
    with open(os.path.join(directory_name, mousemove_filename), mode='w', newline='') as csv_file:
        fieldnames = ["timestamp", "url", "target_id", "target_nodeName", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "movementX", "movementY", "offsetX", "offsetY"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for item in mousemove:
            writer.writerow({
                "timestamp": item["timestamp_utc_ms"],
                "url": item["url"],
                "target_id": item["target_id"],
                "target_nodeName": item["target_nodeName"],
                "clientX": item["clientX"],
                "clientY": item["clientY"],
                "pageX": item["pageX"],
                "pageY": item["pageY"],
                "screenX": item["screenX"],
                "screenY": item["screenY"],
                "movementX": item["movementX"],
                "movementY": item["movementY"],
                "offsetX": item["offsetX"],
                "offsetY": item["offsetY"]
            })

    # Write CSV with mousedown
    mousedown = session["mousedown"]
    mousedown_filename = "mousedown.csv"
    with open(os.path.join(directory_name, mousedown_filename), mode='w', newline='') as csv_file:
        fieldnames = ["timestamp", "url", "target_id", "target_nodeName", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "movementX", "movementY", "offsetX", "offsetY"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for item in mousedown:
            writer.writerow({
                "timestamp": item["timestamp_utc_ms"],
                "url": item["url"],
                "target_id": item["target_id"],
                "target_nodeName": item["target_nodeName"],
                "clientX": item["clientX"],
                "clientY": item["clientY"],
                "pageX": item["pageX"],
                "pageY": item["pageY"],
                "screenX": item["screenX"],
                "screenY": item["screenY"],
                "movementX": item["movementX"],
                "movementY": item["movementY"],
                "offsetX": item["offsetX"],
                "offsetY": item["offsetY"]
            })

    # Write JSON file with general session data
    with open(os.path.join(directory_name, "general.json"), mode='w') as json_file:
        json_file.write(json.dumps(session, indent=4))


    # Analyze