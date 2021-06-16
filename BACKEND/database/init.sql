DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS session_data;

CREATE TABLE IF NOT EXISTS sessions(
    id INTEGER NOT NULL PRIMARY KEY,
    sCPN TEXT NOT NULL,
    videoID TEXT NOT NULL,
    url TEXT NOT NULL,
    start_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    session_duration_ms INTEGER NOT NULL
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

    FOREIGN KEY(session_id) REFERENCES session(id)
);

