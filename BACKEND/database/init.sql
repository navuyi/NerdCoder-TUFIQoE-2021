DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS video;
DROP TABLE IF EXISTS video_data;
DROP TABLE IF EXISTS assessment;

CREATE TABLE IF NOT EXISTS session (                  -- session is created in moment of playing first video
    id INTEGER NOT NULL PRIMARY KEY,
    subject_id TEXT NOT NULL,
    session_type TEXT NOT NULL,     -- imposed or own are available values
    video_type TEXT NOT NULL,       -- training or main are available values
    started DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')), -- we can then create ms timestamp form this local datetime
    ended DATETIME DEFAULT NULL,
    assessment_panel_layout TEXT,
    assessment_panel_opacity INTEGER,
    assessment_interval_ms INTEGER
);

CREATE TABLE IF NOT EXISTS video (
    id INTEGER NOT NULL PRIMARY KEY,
    session_id INT NOT NULL,
    sCPN TEXT NOT NULL,
    videoID TEXT NOT NULL,
    url TEXT NOT NULL,
    start_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    start_time_utc_ms INTEGER NOT NULL,
    end_time TEXT NOT NULL,
    end_time_utc_ms INTEGER NOT NULL,
    monitoring_duration_ms INTEGER NOT NULL,

    FOREIGN KEY (session_id) REFERENCES session(id)
);

CREATE TABLE IF NOT EXISTS video_data(
    id INTEGER NOT NULL PRIMARY KEY,
    video_id INTEGER NOT NULL,

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

    download_bandwidth INTEGER NULLABLE ,
    upload_bandwidth INTEGER NULLABLE ,

    timestamp TEXT,  --only current time - date is provided in sessions
    timestamp_utc_ms INTEGER,

    FOREIGN KEY (video_id) REFERENCES video(id)
);

CREATE TABLE IF NOT EXISTS assessment(
    id INTEGER NOT NULL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    video_id INTEGER DEFAULT NULL,

    value INT NOT NULL,
    duration INT NOT NULL,
    time_in_video TEXT,
    timestamp INT NOT NULL,

    FOREIGN KEY (video_id) REFERENCES video(id)
);