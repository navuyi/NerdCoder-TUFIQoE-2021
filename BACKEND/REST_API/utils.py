import re


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_viewport(record):
    try:
        viewport = re.search("([0-9]+)x([0-9]+)", record["viewport_frames"]).group(0)
    except:
        viewport = None
    return viewport

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
    try:
        [current_resolution, optimal_resolution] = re.findall("[0-9]+x[0-9]+", record["current_optimalRes"])
    except:
        current_resolution = None
        optimal_resolution = None
    return [current_resolution, optimal_resolution]

def get_framerate(record):
    try:
        [current_framerate, optimal_framerate] = re.findall("@([0-9]+)", record["current_optimalRes"])
    except:
        current_framerate = None
        optimal_framerate = None
    return [current_framerate, optimal_framerate]


def get_volume(record):
    try:
        volume = re.search("([0-9]{1,3})%", record["volume_normalized"]).group(1)
    except:
        volume = None
    return volume


def get_connection_speed(record):
    try:
        connection_speed = re.search("[0-9]+", record["connectionSpeed"]).group(0)
    except:
        connection_speed = None
    return connection_speed

def get_network_activity(record):
    try:
        network_activity = re.search("[0-9]+", record["networkActivity"]).group(0)
    except:
        network_activity = None
    return network_activity

def get_buffer_health(record):
    try:
        buffer_health = re.search("[0-9]+\.[0-9]+", record["bufferHealth"]).group(0)
    except:
        buffer_health = None
    return buffer_health

def get_mystery_s(record):
    try:
        mystery_s = re.search("s:([a-zA-Z0-9]+)", record["mysteryText"]).group(1)
    except:
        mystery_s = None
    return mystery_s

def get_mystery_t(record):
    try:
        mystery_t = re.search("t:([0-9]+\.[0-9]+)", record["mysteryText"]).group(1)
    except:
        mystery_t = None
    return mystery_t