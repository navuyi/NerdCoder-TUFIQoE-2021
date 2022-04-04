import shutil
from datetime import datetime
import os
import sqlite3
from data_management.utils import get_sessions


def backup():
    # Make database backup copy
    today = datetime.today().strftime("%d_%m_%Y___%H_%M")
    shutil.copy("./database/nerdcoder_data.db", os.path.join(r"C:\Users\qoe_l\OneDrive\YYTOL_DB_BACKUP", f"nerdcoder_backup_{today}.db"))


datetime_format = "%Y-%m-%d %H:%M:%S"

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def check_videos(videos, session_start, session_end):
    all_ok = True

    if len(videos) == 0:
        print("No videos for that session")
        return

    for index, video in enumerate(videos):
        video_start = datetime.strptime(video["start_date"]+" " + video["start_time"], datetime_format)
        video_end = datetime.strptime(video["start_date"] + " " + video["end_time"], datetime_format)

        if video_start >= session_start and video_end <= session_end:
            pass
        else:
            print("Vide with URL: " + video["url"] + "outside of its session")
            all_ok = False

        check_video_records(video["records"])

    if all_ok:
        print("Videos OK")

def check_video_records(records):
    if len(records) == 0:
        print("Empty records")


def check_assessments(assessments, session_start, session_end):
    all_ok = True
    if len(assessments) == 0:
        print("Empty assessments")
        return

    for assessment in assessments:
        if session_start <= datetime.fromtimestamp(int(assessment["timestamp"])/1000) <= session_end:
            pass
        else:
            print(f'Assessment with ID {assessment["id"]} outside session')
            all_ok = False

    if all_ok:
        print("Assessments OK")


def check_interest(interest, session_start, session_end):
    all_ok = True
    if len(interest) == 0:
        print("Empty assessments")
        return

    for _int in interest:
        if session_start <= datetime.fromtimestamp(int(_int["timestamp"])/1000) <= session_end:
            pass
        else:
            print(f'Assessment with ID {_int["id"]} outside session')
            all_ok = False

    if all_ok:
        print("Interest OK")


def check_mouse(_type, data, session_start, session_end):
    all_ok = True

    if len(data) == 0:
        print(f"No records in {_type}")
        return

    for record in data:
        if session_start <= datetime.fromtimestamp(int(record["timestamp_utc_ms"])/1000) <= session_end:
            pass
        else:
            print(f"{_type} not OK")
            all_ok = False

    if all_ok:
        print(f"{_type} OK")

def main():
    # Check data validity
    connection = sqlite3.connect("./database/nerdcoder_data.db")
    connection.row_factory = dict_factory

    cursor = connection.cursor()

    cursor.execute("SELECT * FROM session")
    sessions = cursor.fetchall()


    sessions = get_sessions("database/nerdcoder_data.db")


    # Iterate through sessions and check if all data is there



    for session in sessions:
        subject_id = session["subject_id"]
        session_start = datetime.strptime(session["started"], datetime_format)
        session_end = datetime.strptime(session["ended"], datetime_format)

        videos = session["videos"]
        assessments = session["assessments"]
        interest = session["interest"]
        mousemove = session["mousemove"]
        mousedown = session["mousedown"]

        print(f'Checking session with ID {session["id"]} for subject {subject_id}')
        check_videos(videos, session_start, session_end)
        check_assessments(assessments, session_start, session_end)
        check_interest(interest, session_start, session_end)

        check_mouse("mousemove", mousemove, session_start, session_end)
        check_mouse("mousedown", mousedown, session_start, session_end)

    input("Press Enter to continue")





if __name__ == "__main__":
    backup()
    input("Press Enter to continue")
    #main()












