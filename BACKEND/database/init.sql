DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS session_details;

CREATE TABLE IF NOT EXISTS sessions(
    id INTEGER NOT NULL PRIMARY KEY,
    videoID TEXT NOT NULL,
    sCPN TEXT NOT NULL,
    url TEXT NOT NULL,
    start_date TEXT NOT NULL,
    start_time Text NOT NULL
);


CREATE TABLE IF NOT EXISTS session_data(
    id INTEGER NOT NULL PRIMARY KEY,
    session_id INTEGER NOT NULL,

    viewport TEXT NOT NULL,
    dropped_frames INTEGER NOT NULL,
    total_frames INTEGER NOT NULL,
    current_resolution TEXT NOT NULL,
    optimal_resolution TEXT NOT NULL,
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

