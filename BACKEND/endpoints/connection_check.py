import sqlite3
from flask import request, jsonify
from flask import Blueprint
import re
from datetime import datetime, timedelta
from .utils import get_frames, get_resolution, get_framerate, dict_factory, get_volume, get_connection_speed, \
    get_network_activity, get_buffer_health, get_mystery_t, get_mystery_s, get_viewport

bp = Blueprint("connection_check", __name__)

@bp.route("/connection_check", methods=["GET"])
def check_connection():
    return {"msg": "OK"}, 200


