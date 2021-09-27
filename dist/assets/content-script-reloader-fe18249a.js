(function () {
  'use strict';

  /* ------------------- FILENAMES ------------------- */
  const loadMessagePlaceholder = '"DEVELOPMENT build with simple auto-reloader\n[2021-09-27 09:28:35] waiting for changes..."';

  /* eslint-env browser */

  // Log load message to browser dev console
  console.log(loadMessagePlaceholder.slice(1, -1));

  const { name } = chrome.runtime.getManifest();

  const reload = () => {
    console.log(`${name} has reloaded...`);

    setTimeout(() => {
      location.reload();
    }, 500);
  };

  setInterval(() => {
    try {
      chrome.runtime.getManifest();
    } catch (error) {
      if (error.message === 'Extension context invalidated.') {
        reload();
      }
    }
  }, 1000);

}());
