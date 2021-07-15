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
The "dist" directory contains bundled files. Install the extension by loading
the "dist" directory with the "load unpacked" option.


## Extension popup - Settings
In the extension popup there are several fields that can be used to configure
the extension behaviour and some element's layout.

- Assessment panel opacity [%]
  - Describes the level of invisibility of the assessment panel
  - Value is percentages
- Assessment time interval [ms]
  - Describes how much time has to elapse before next assessment panel will show up
  - This field is only relevant when Assessment mode is set to Auto - see below
- Assessment mode
  - Auto - automatic assessment panel control. This mode is connected with "Assessment Time Inerval"
  - Manual - mostly for developing purposes, user can use "o" and "p" 
    keys to control the assessment panel within the same browser the extension is running on
  - Remote - very similar to Manual mode but nodeJS server script is necessary for it to work properly.
    User can control the assessment panel from the script running on the same or remote computer from the one that extension is running on
- Assessment panel layout
  - top, middle, bottom - defines the layout of the assessment panel
- [ N E W ] Developer mode
  - Enables/disables the developer mode
  - If developer mode is enabled database connection is not checked, nerd statistics panel is visible, additional information
    panel is visible, captured data may not be saved
  - If developer mode is disabled (equals to production/experiment mode), database connection is checked every time user enters new video
  - In case connection fails (most likely reason for that is Flask REST API is not running)
    YouTube player is closed and warning screen is displayed with proper information.
  
# [ N E W ] Throttling scheduling
In the dist directory there is scenarios.json file with throttling scenarios configuration.
One can create multiple scenarios and then pick which one to use (for now only the scenario with id of 1 will be used).
Exemplary configuration is already in the file, one can use it as a template for other scenarios.

### After each change in scenarios.json one need to reload the extension for the changes to take place.