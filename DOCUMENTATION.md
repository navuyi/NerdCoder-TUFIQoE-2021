# Overwiew
- Content of this project is Chrome extension that is be able to capture YouTube nerd statistics
   while user is watching videos, display video quality assessment semi-transparent panel every defined Interval 
   and execute network throttling in defined and scheduled manner.
- All captured data like nerd statistics, user's assessments and mouse tracking data are stored in SQLite database. 
  Flask REST_API module is developed for that need.




# Chrome extension part
This part of the project uses javascript Rollup bundler with plugins enabling extensions development.
Latest Chrome standard for writing extensions uses so called "manifest" in version 3. Manifest V2 is considered deprecated
but is still usable.
As for the day of 29.07.2021 the Rollup bundler's browser plugins do not support manifest v3. The project
is carried on in the deprecated version of manifest.