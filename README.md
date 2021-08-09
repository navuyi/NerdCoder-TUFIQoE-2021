# NerdCoder-TUFIQoE-2021
Chrome extension (and more) for recording YouTube activity and gathering "nerd statistics" 
and video assessments

## Content
This repository contains the Chrome extension and tools that are necessary or optional for it 
to work properly.
- Flask REST API 
    - POST endpoint for captured data
    - GET endpoint to get data in form of JSON
- SQLite database
- NodeJS script for remote control of video assessment panel (optional)


## Installation
#### Chrome extension
The "dist" directory contains bundled files. Install the extension by loading
the "dist" directory with the "load unpacked" option.

#### REST API
1.  To set up Flask REST API one should download BACKEND directory.
2. Then setup python virtual environment  by using command
``` python -m venv [venv-name]```
3. Activate venv
    - on Windows ```[venv-name]\Scripts\activate```
    - on Linux ```source [venv-name]/bin/activate```
4. Set environment variable FLASK_APP=REST_API
    - on Windows: ```set FLASK_APP=REST_API```
   - on Linux: ```export FLASK_APP=REST_API```
5. Install required packages ```pip install -r requirements.txt```
6. While being in BACKEND directory execute command ```flask run```

####To reset database rows one can cd into BACKEND/database and execute ```python init.py```

# Overview
1. Network throttling and video assessment processes start after user starts first video playback.
2. Network throttling and video assessment are scheduled independently from each other. For more information go to
   [network throttling](#throttling_scheduling) section. 
3. Video assessment panel may become visible when user is not watching any video but currently is searching for videos.
    In that case submitted assessment will be appended to the last captured session.
4. To submit assessment user can use mouse or keyboard's numeric keys in range 1-5.
5. In order to allow using keyboard for video assessment YouTube hotkeys had to be disabled. It means that user cannot use
    arrow keys to forward/rewind video or F key to enter fullscreen.
5. Mouse tracking is done only during video playback.
6. User is allowed to YouTube page, redirect subpages within YouTube domain, search for videos.
7. User is forbidden from using multiple tabs. One YouTube tab only. 


- For now, once started processes (after playing first video) will not stop until extension is reloaded or restarted. 
  Watch [reset button](#reset_button).


## Extension popup - Settings
In the extension popup there are several fields that can be used to configure
the extension behaviour and some element's layout.

![Image of Yaktocat](images/popup.png)



- ### [ N E W ] Tester ID
  - Used to differentiate data captured from multiple testers
  - Number should be provided
  - If provided value is not a number - random sequence is generated (temporar solution)
  - [ I D E A ] Future idea is to manually provide tester's email address and generate
  hash value from it to store in database as tester's ID - [ TO BE CONFIRMED ]
- ### Assessment panel opacity [%]
  - Describes the level of invisibility of the assessment panel
  - Value is percentages
- ### Main Assessment time interval [ms]
  - Relevant only if [Session](#session) </a> is set to "main"
  - Describes how much time has to elapse before next assessment panel will show up
  - This field is only relevant when Assessment mode is set to Auto - see below
- ### Training mode assessment time
  - Same as above but relevant only if [Session](#session) is set to "training"
- ### Assessment mode
  - Auto - automatic assessment panel control. This mode is connected with "Assessment Time Inerval"
  - Manual - mostly for developing purposes, user can use "o" and "p" 
    keys to control the assessment panel within the same browser the extension is running on
  - Remote - very similar to Manual mode but nodeJS server script is necessary for it to work properly.
    User can control the assessment panel from the script running on the same or remote computer from the one that extension is running on
- ### Assessment panel layout
  - top, middle, bottom - defines the layout and positioning of the assessment panel
- ### Developer mode
  - Enables/disables the developer mode
  - If developer mode is enabled database connection is not checked, nerd statistics panel is visible, additional information
    panel is visible, captured data may not be saved
  - If developer mode is disabled (equals to production/experiment mode), database connection is checked every time user enters new video
  - In case connection fails (most likely reason for that is Flask REST API is not running)
    YouTube player is closed and warning screen is displayed with proper information.
  - ### It is advised to set developer mode to disabled during the real experiment.
  
- ###  <a name="session"> Session </a>
  - Define mode the extension is running. Training mode should have shorter assessment panel and network throttling intervals.
  Training mode uses "Training mode assessment time interval [ms]" and "training_scenario.json" configuration file.
  Main mode uses "Main mode assessment time interval [ms] and main_scenario.json" configuration file.

- ### Videos type
  - Gives information about stage of the experiment
  - own - tester is allowed to search and watch videos they like
  - imposed - testers must watch videos imposed by experiment operator, most likely in form of prepared YouTube playlist

- ### [ N E W ] <a name="reset_button"> Reset button </a>
    - Resets assessment controller and chrome debugger modules
    - Redirects to the main page of YouTube
    - If there was ongoing throttling scenario and assessment timer counting down it is now 
  restarted and ready to begin new one after entering new video
    - <h3>[ NOTICE ] IT DOES NOT RELOAD THE EXTENSION</h3>
      <h4>All settings configured in th popup and saved are not
               affected by this operation. To restore default settings (hardcoded in background script) one needs to reload the extension manually</h4>
      <h4> In case of modyfing throttling scenarios files extension must be reloaded. Reset button will not load new files. </h4>        
  ![Image of Yaktocat](images/ext-reload.png)


# <a name="throttling_scheduling"> Throttling scheduling </a>
In the dist directory there are "main_scenario.json" and "training_scenario.json" files. In extension's popup there is [Session](#session) section where
we can choose what experiment mode are we running. Whether it is a main session or training. Training
session should be shorter than main (shorter assessment and network throttling intervals).
Extension will use one of these two files to schedule network throttling based on the [Session](#session) setting.

In the "scenarios" subdirectory there is separate JSON file for each scenario. To use particular scenario
one should copy it contents (SINGLE SCENARIO OBJECT) to the "main_scenario.json" or "training_session.json" file which is imported by the
background script and used to schedule network throttling.



### After each change in scenarios.json one needs to reload the extension for the changes to take effect.

### Exemplary scenario file content
```
{
  "name": "Long scenario",
  "schedule":[
    {
      "timeout_s": 300,
      "params": {
        "offline": false,
        "latency": 1,
        "downloadThroughput": 1500000,
        "uploadThroughput": 1000000000
      }
    },
    {
      "timeout_s": 600,
      "params": {
        "offline": false,
        "latency": 1,
        "downloadThroughput": 1000000,
        "uploadThroughput": 1000000000
      }
    },
    {
      "timeout_s": 900,
      "params": {
        "offline": false,
        "latency": 1,
        "downloadThroughput": 700000,
        "uploadThroughput": 1000000000
      }
    },
    {
      "timeout_s": 1200,
      "params": {
        "offline": false,
        "latency": 1,
        "downloadThroughput": 300000,
        "uploadThroughput": 1000000000
      }
    }
  ]
}

```