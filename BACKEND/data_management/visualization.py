import os
import glob
import csv
import matplotlib.pyplot as plt
import math
import re

def make_plots(video_data, video_assessments):
    start_time = video_data[0]["timestamp"]
    end_time = video_data[len(video_data)-1]["timestamp"]

    timeline = []
    bandwidths = []
    bufferhealth = []
    resolution = []
    assessments = []
    assessments_timeline = []
    video_changes_x = []
    pause = []
    progress = []
    for item in video_data:
        timeline.append((int(item["timestamp"]) - int(start_time))/1000)
        bufferhealth.append(item["buffer_health"])
        bandwidths.append(item["bandwidth"])

        # Check for video initial loading (49 for fresh new video 59 for video with &time query parameter - continued)
        if item["mystery_s"]:
            if int(item["mystery_s"]) == 49 or int(item["mystery_s"]) == 59:
                video_changes_x.append((int(item["timestamp"]) - int(start_time))/1000)
            if int(item["mystery_s"]) == 4:
                pause.append((int(item["timestamp"]) - int(start_time))/1000)
            if int(item["mystery_s"]) == 8:
                progress.append((int(item["timestamp"]) - int(start_time))/1000)
        else:
            video_changes_x.append((int(item["timestamp"]) - int(start_time))/1000)

        try:
            res_x, res_y = item["current_resolution"].split("x")
            resolution.append(int(res_x) * int(res_y))
        except:
            resolution.append(0)


    for assessment in video_assessments:
        if int(start_time) < int(assessment["timestamp"]) < int(end_time):
            assessments.append(assessment["value"])
            assessments_timeline.append((int(assessment["timestamp"]) - int(start_time))/1000)
    print(assessments)
    print(assessments_timeline)

    '''
    fig, ax = plt.subplots()
    ax.plot(timeline, resolution, color="blue")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Resolution", color="blue")

    ax2 = ax.twinx()
    ax2.invert_yaxis()
    ax2.plot(assessments_timeline, assessments, color="red", marker="o")
    ax2.set_ylabel("Assessments", color="red")
    plt.show()
    '''


    graph, (plot1, plot2) = plt.subplots(2, 1)
    # Plot 1
    for x in video_changes_x:
        plot1.axvline(x=x, color="#9a9a9a")
    for x in pause:
        plot1.axvline(x=x, color="#1EC6E7")
    for x in progress:
        plot1.axvline(x=x, color="#f0ad4e")

    plot1.plot(timeline, resolution, color="blue")
    plot1.set_xlabel("Time [s]")
    plot1.set_ylabel("Resolution", color="blue")

    t_plot1 = plot1.twinx()
    t_plot1.invert_yaxis()
    t_plot1.plot(assessments_timeline, assessments, color="red", marker="o")
    t_plot1.set_ylabel("Assessments", color="red")



    # Plot 2
    for x in video_changes_x:
        plot2.axvline(x=x, color="#9a9a9a")
    for x in pause:
        plot2.axvline(x=x, color="#1EC6E7")
    for x in progress:
        plot2.axvline(x=x, color="#f0ad4e")

    plot2.plot(timeline, bandwidths, color="green")
    plot2.set_xlabel("Time [s]")
    plot2.set_ylabel("Bandwidth [B/s]", color="green")
    plot2.invert_yaxis()

    t_plot2 = plot2.twinx()
    t_plot2.invert_yaxis()
    t_plot2.plot(assessments_timeline, assessments, color="red", marker="o")
    t_plot2.set_ylabel("Assessments", color="red")

    plt.show()



SESSION = 2
DIRECTORY = glob.glob(f"session_{SESSION}__*")[0]
print(DIRECTORY)

videos = os.path.join(DIRECTORY, "videos.csv")
assessments = os.path.join(DIRECTORY, "assessments.csv")



with open(videos, mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    video_data = []
    video_assessments = []

    for row in csv_reader:
        video_data.append(row)

    with open(assessments, mode='r') as a_csv_file:
        a_csv_reader = csv.DictReader(a_csv_file)
        for row in a_csv_reader:
            video_assessments.append(row)

    make_plots(video_data, video_assessments)
