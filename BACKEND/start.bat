@ECHO OFF
ECHO Starting Flask Application

CALL venv_nerdcoder\Scripts\activate
SET FLASK_APP=REST_API

flask run