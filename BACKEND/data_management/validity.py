import os
import json
import datetime
import pandas as pd

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def match_session_dir(path):
    return path if (os.path.isdir(path) and "session_" in path) else None


def get_session_directories():
    this_dir = os.listdir(".")
    directories = []

    directories = map(lambda path: match_session_dir(path), this_dir)
    directories = [i for i in directories if i]
    return directories

def calc_asmnt_dur_mean(assessments):
    value = 0
    for index, assessment in enumerate(assessments):
        value += assessment["duration"]

    return value/len(assessments)




def analyze(session):


    subject_id = session["subject_id"] or None
    print(subject_id)
    assessments = session["assessments"] or None
    duration_mean = calc_asmnt_dur_mean(assessments)

    try:
        started = datetime.datetime.strptime(session["started"], DATE_FORMAT) or None
        ended = datetime.datetime.strptime(session["ended"], DATE_FORMAT) or None
        duration = ended-started or None
    except:
        started = None
        ended = None
        duration = None


    return dict(
        subject_id=subject_id,
        started=started,
        ended=ended,
        duration=duration,
        assessments=len(assessments),
        duration_mean=duration_mean
    )




def main():
    dirs = get_session_directories()

    results = dict(
        subject_id=[],
        started=[],
        ended=[],
        duration=[],
        assessments=[],
        duration_mean=[]
    )

    for index, path in enumerate(dirs):
        json_path = os.path.join(path, "general.json")
        with open(json_path) as f:
            json_object = json.load(f)
            f.close()

        res = analyze(json_object)
        results["subject_id"].append(res["subject_id"])
        results["started"].append(res["started"])
        results["ended"].append(res["ended"])
        results["duration"].append(res["duration"])
        results["assessments"].append(res["assessments"])
        results["duration_mean"].append(res["duration_mean"])

    df = pd.DataFrame(results)
    print(df)



if __name__ == "__main__":
    main()