(function () {
  'use strict';

  /* ------------------- FILENAMES ------------------- */

  /* ------------------ PLACEHOLDERS ----------------- */

  const timestampPathPlaceholder = 'timestamp.json';
  const loadMessagePlaceholder = '"DEVELOPMENT build with simple auto-reloader\n[2021-07-14 21:03:25] waiting for changes..."';
  const ctScriptPathPlaceholder = '"assets/content-script-reloader-d4e346ac.js"';
  const unregisterServiceWorkersPlaceholder = 'true';
  const executeScriptPlaceholder = 'true';

  /* eslint-env browser */

  // Log load message to browser dev console
  console.log(loadMessagePlaceholder.slice(1, -1));

  const options = {
    executeScript: JSON.parse(executeScriptPlaceholder),
    unregisterServiceWorkers: JSON.parse(
      unregisterServiceWorkersPlaceholder,
    ),
  };

  /* ---------- POLYFILL TABS.EXECUTESCRIPT ---------- */

  if (options.executeScript) {
    const markerId =
      'rollup-plugin-chrome-extension-simple-reloader';

    const addMarker = `{
    const tag = document.createElement('meta');
    tag.id = '${markerId}';
    document.head.append(tag);
  }`;

    const checkMarker = `
  !!document.head.querySelector('#${markerId}')
  `;

    // Modify chrome.tabs.executeScript to inject reloader
    const _executeScript = chrome.tabs.executeScript;
    const withP = (...args) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line
        // @ts-ignore
        _executeScript(...args, (results) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(results);
          }
        });
      });

    chrome.tabs.executeScript = (...args) => {
  (async () => {
        const tabId = typeof args[0] === 'number' ? args[0] : null;
        const argsBase = (tabId === null ? [] : [tabId]); 

        const [done] = await withP(
          ...(argsBase.concat({ code: checkMarker }) 


  ),
        );

        // Don't add reloader if it's already there
        if (!done) {
          await withP(
            ...(argsBase.concat({ code: addMarker }) 


  ),
          );

          // execute reloader
          const reloaderArgs = argsBase.concat([
            // TODO: convert to file to get replacements right
            { file: JSON.parse(ctScriptPathPlaceholder) },
          ]); 

          await withP(...reloaderArgs);
        }

        _executeScript(...(args ));
      })();
    };
  }

  /* ----------- UNREGISTER SERVICE WORKERS ---------- */

  if (options.unregisterServiceWorkers) {
    // Modify chrome.runtime.reload to unregister sw's
    const _runtimeReload = chrome.runtime.reload;
    chrome.runtime.reload = () => {
  (async () => {
        await unregisterServiceWorkers();
        _runtimeReload();
      })();
    };
  }

  async function unregisterServiceWorkers() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    } catch (error) {
      console.error(error);
    }
  }

  /* -------------- CHECK TIMESTAMP.JSON ------------- */

  let timestamp;

  const id = setInterval(async () => {
    const t = await fetch(timestampPathPlaceholder)
      .then((res) => {
        localStorage.removeItem('chromeExtensionReloaderErrors');
        return res.json()
      })
      .catch(handleFetchError);

    if (typeof timestamp === 'undefined') {
      timestamp = t;
    } else if (timestamp !== t) {
      chrome.runtime.reload();
    }

    function handleFetchError(error) {
      clearInterval(id);

      const errors =
        localStorage.chromeExtensionReloaderErrors || 0;

      if (errors < 5) {
        localStorage.chromeExtensionReloaderErrors = errors + 1;

        // Should reload at least once if fetch fails.
        // The fetch will fail if the timestamp file is absent,
        // thus the new build does not include the reloader
        return 0
      } else {
        console.log(
          'rollup-plugin-chrome-extension simple reloader error:',
        );
        console.error(error);

        return timestamp
      }
    }
  }, 1000);

}());
