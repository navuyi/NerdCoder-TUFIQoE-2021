import sqlite3

DATABASE_FILE = "nerdcoder_data.db"

try:
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()

    sql_file = open("init.sql")
    sql_as_string = sql_file.read()

    cursor.executescript(sql_as_string)
    cursor.close()
    conn.close()

except sqlite3.Error as error:
    print("Error while connecting to sqlite", error)


