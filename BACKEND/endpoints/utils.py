import re
import sqlite3

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_frames(record):
    frames = re.search("\/\s([0-9]+)\sdropped\sof\s([0-9]+)", record["viewport_frames"])
    if not frames:
        dropped_frames = 0
        total_frames = 0
    else:
        dropped_frames = frames.group(1)
        total_frames = frames.group(2)

    return [dropped_frames, total_frames]


def get_resolution(record):
    [current_resolution, optimal_resolution] = re.findall("[0-9]+x[0-9]+", record["current_optimalRes"])
    return [current_resolution, optimal_resolution]

def get_framerate(record):
    [current_framerate, optimal_framerate] = re.findall("@([0-9]+)", record["current_optimalRes"])
    return [current_framerate, optimal_framerate]