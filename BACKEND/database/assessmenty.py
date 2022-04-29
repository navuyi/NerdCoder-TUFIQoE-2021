import sqlite3
import csv
import datetime

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_exp_dur(session_started, session_ended):
    try:
        return datetime.datetime.strptime(session_ended, DATE_FORMAT) - datetime.datetime.strptime(session_started, DATE_FORMAT) or None
    except:
        return None

DATE_FORMAT = '%Y-%m-%d %H:%M:%S'

connection = sqlite3.connect("nerdcoder_data.db")
connection.row_factory = dict_factory

cursor = connection.cursor()

cursor.execute("select session.started as session_started, session.ended as session_ended, subject_id, assessment.value as asmv, interest.value as intv, assessment.duration asmd, interest.duration intd from session, assessment, interest where assessment.session_id = session.id and assessment.timestamp between interest.timestamp and interest.timestamp+20000;")
assessments = cursor.fetchall()
print(assessments[0])

with open("assessments.csv", mode='w', newline='') as csv_file:
    fieldnames = ["subject_id", "exp_dur", "assessment_val", "interest_val", "assessment_dur", "interest_dur"]
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()

    for row in assessments:
        writer.writerow({
            "subject_id": row["subject_id"],
            "exp_dur": get_exp_dur(row["session_started"], row["session_ended"]),
            "assessment_val": row["asmv"],
            "interest_val": row["intv"],
            "assessment_dur": row["asmd"],
            "interest_dur": row["intd"]
        })
