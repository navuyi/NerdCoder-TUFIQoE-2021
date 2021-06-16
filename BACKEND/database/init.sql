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

    viewport TEXT NOT NULL,
    dropped_frames INTEGER NOT NULL,
    total_frames INTEGER NOT NULL,
    current_resolution TEXT NOT NULL,
    optimal_resolution TEXT NOT NULL,
    current_framerate INTEGER NOT NULL,
    optimal_framerate INTEGER NOT NULL,
    volume INTEGER NOT NULL,
    codecs TEXT NOT NULL,
    color TEXT NOT NULL,
    connection_speed INTEGER NOT NULL,
    network_activity INTEGER NOT NULL,
    buffer_health INTEGER NOT NULL,
    mystery_s TEXT NOT NULL,
    mystery_t INTEGER NOT NULL,

    timestamp TEXT, /* only current time - date is provided in sessions */

    FOREIGN KEY(session_id) REFERENCES session(id)
);

