DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS session_data;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS mousetracker;

CREATE TABLE IF NOT EXISTS sessions(
    id INTEGER NOT NULL PRIMARY KEY,
    video_type TEXT,  -- imposed or own are available values
    tester_id TEXT,  -- tester ID, provided in extension popup by experiment master
    sCPN TEXT NOT NULL,
    videoID TEXT NOT NULL,
    url TEXT NOT NULL,
    start_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    start_time_utc_ms INTEGER NOT NULL,
    end_time TEXT NOT NULL,
    end_time_utc_ms INTEGER NOT NULL,
    session_duration_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments(
    id INTEGER NOT NULL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    time_in_video TEXT,
    timestamp TEXT,
    timestamp_utc_ms INTEGER,
    assessment INTEGER,
    duration_ms INTEGER,

    FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS session_data(
    id INTEGER NOT NULL PRIMARY KEY,
    session_id INTEGER NOT NULL,

    viewport TEXT,
    dropped_frames INTEGER,
    total_frames INTEGER,
    current_resolution TEXT,
    optimal_resolution TEXT,
    current_framerate INTEGER,
    optimal_framerate INTEGER,
    volume INTEGER,
    codecs TEXT,
    color TEXT,
    connection_speed INTEGER,
    network_activity INTEGER,
    buffer_health INTEGER,
    mystery_s TEXT,
    mystery_t INTEGER,

    timestamp TEXT, /* only current time - date is provided in sessions */
    timestamp_utc_ms INTEGER,

    FOREIGN KEY(session_id) REFERENCES session(id)
);


CREATE TABLE IF NOT EXISTS mousetracker(
    id INTEGER NOT nULL PRIMARY KEY,
    session_id INTEGER NOT NULL,

    posX INTEGER,
    posY INTEGER,
    timestamp_utc_ms INTEGER,

    FOREIGN KEY(session_id) REFERENCES session(id)
)

