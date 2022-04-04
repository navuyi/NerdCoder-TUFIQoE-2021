// Imports work but files that provide export must be included in manifest.json //
import {ScheduleController} from "./background_controllers/ScheduleController";
import {AssessmentController} from "./background_controllers/AssessmentController";
import {MouseTrackerController} from "./background_controllers/MouseTrackerController";
import {config} from "./config";
import axios from "axios";


const yt_watch_string = "https://www.youtube.com/watch?v="
const captured_data = []
const mousetracker = []


// Initialize controllers

const asController = new AssessmentController();
const mtController = new MouseTrackerController()
const shController = new ScheduleController(resetSession);



// Initialize config values when extension is first installed to browser
chrome.runtime.onInstalled.addListener( ()=>{
    const startup_config = {
        SESSION_ID: undefined,                                                                  // Attached to request when submitting captured data
        ASSESSMENT_PANEL_OPACITY: 80,                                               // Opacity of the assessment panel in %
        ASSESSMENT_INTERVAL_MS: 150000, //TODO <-- 150000                                     // Interval for assessment in auto mode in milliseconds
        ASSESSMENT_MODE: "auto",                                                         // Available modes are "remote", "auto" and "manual"
        ASSESSMENT_PANEL_LAYOUT: "middle",                                      // Available for now are "middle", "top", "bottom"
        ASSESSMENT_PAUSE: "disabled",                                                  // Enable/disable playback pausing/resuming on video assessment
        DEVELOPER_MODE: false,  //TODO <-- false                                                               // Enable/disable developer mode - nerd stats visibility, connection check
        ASSESSMENT_RUNNING: false,                                                     // Define whether process of assessment has already begun
        SESSION_TYPE: "training",                                                             // Define whether to use "training" or "main" experiment mode
        TRAINING_MODE_ASSESSMENT_INTERVAL_MS: 120000, //TODO <-- 120000             // Interval for assessment in auto mode in ms for training mode
        VIDEOS_TYPE: "own",                                                                    //IMPORTANT Gives information about videos type - "own" is the only correct value, imposed session was rejected
        TESTER_ID: "",                                                                              // Tester ID - tester phone number
        TESTER_ID_HASH: "",
        TESTER_EYESIGHT_TEST_RESULT: null,                                           // Subjest's eyesight test result
        TESTER_SEX: "",                                                                            // Subject's sex either "male", "female" or "not_provided" values are correct
        TESTER_AGE: null,                                                                           // Subject's age - number in range from 1-100
        DOWNLOAD_BANDWIDTH_BYTES: undefined,                            // Used to gather information about current network throttling
        UPLOAD_BANDWIDTH_BYTES: undefined,                                   // Same as above, but upload bandwidth stays always the same, high value - unlimited bandwidth
        SESSION_COUNTER: 0,                                                                 // Keeps track of sessions, after trainign set to 1, after first of main set to 2, after second of main set to 3, then experiment ends
        EXPERIMENT_TYPE: "acr",                                                          // Defines experiment type proper values are "acr" or "discord", discord <-- because of using Discord for calling the tester
        ASSESSMENT_INTERVAL_DELTA_MS: 13000, //TODO <-- 13000                            // Delta of assessment interval +- this value will be added (substracted) to proper interval value
        LAST_WATCHED_URL: "",

        CURRENT_DISPLAY_MODE: "default",
        PREVIOUS_DISPLAY_MODE: "default"
    }
    chrome.storage.local.set(startup_config, ()=>{
        console.log(`[BackgroundScript] %cStartup config has been saved: ${startup_config}`, `color: ${config .SUCCESS}`);
    });
})


function submit_captured_data(captured_data, tabId){
    // Submit mouse tracker data
    if(mousetracker.length > 0){
        let tmp_mousetracker = []
        mousetracker.map((item) => {
            tmp_mousetracker.push(item)
        })
        // Clear mousetracker array
        mousetracker.splice(0, mousetracker.length)
        mtController.submit(tmp_mousetracker)
    }else{
        console.log("[BackgroundScript] %cNo MouseTracker data captured yet", `color: ${config.WARNING}`)
    }

    // Submit nerd statistics data - video data
    console.log("[BackgroundScript] %cSubmitting captured data", "color: #ffc107")
    const my_url = "http://127.0.0.1:5000/video/";
    const my_config = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }

    const index = captured_data.findIndex(record => record.id === tabId);
    if(index !== -1){
        chrome.storage.local.get(["TESTER_ID_HASH", "SESSION_ID"], (res) => {
            const session_id = res.SESSION_ID
            const session_data = captured_data[index].data;

            const my_body = JSON.stringify({
                session_data: session_data,
                session_id: session_id
            });

            // Delete sent data from captured_data array
            captured_data.splice(index,1);

            // Submit captured video data
            axios.post(my_url, my_body, my_config)
                .then(res =>{
                    console.log(res)
                })
                .catch(err => {
                    console.log(err)
                })
        })
    }
    else{
        console.log(`[BackgroundScript] %cNo data to submit`, `color: ${config.DANGER};`)
    }
}

function execute_script(tabId, url){
    chrome.storage.local.get(["DEVELOPER_MODE"], res => {
        const dev_mode = res.DEVELOPER_MODE;

        // Update last watched video url
        chrome.storage.local.set({
            "LAST_WATCHED_URL": url
        })
        if(dev_mode === false){
            // Check connection with database before executing script
            const url = "http://127.0.0.1:5000/connection/check"
            fetch(url, {method: "GET"})
                .then(res=>res.json())
                .then(data => {
                    if(data.msg === "OK"){
                        // Check if tab exists <-- to prevent uncaught no tab id error
                        chrome.tabs.get(tabId, (tab) => {
                            if(!tab){
                                console.log(`[BackgroundScript] %cThere is no tab with ID of ${tabId}`, `color: ${config.DANGER};`)
                            }
                            else{
                                console.log(`[BackgroundScript] %cConnection OK`, `color: ${config.SUCCESS};`)
                                chrome.tabs.executeScript(tabId, {file: "init.js"}, ()=>{
                                    // Run controllers
                                    create_new_session(tabId).then(()=>{
                                        shController.init(tabId)
                                        asController.init(tabId)
                                        mtController.startTracking(tabId)
                                    })
                                })
                            }
                        })
                    }
                })
                .catch(err => {
                    console.log("[BackgroundScript] API is not reachable")
                    // Inject content script into tab
                    chrome.tabs.executeScript(tabId, {file: "no_connection_screen.js"})
                });
        }
        else if(dev_mode === true){
            // Check if tab exists <-- to prevent uncaught no tab id error
            chrome.tabs.get(tabId, (tab) => {
                if(!tab){
                    console.log(`[BackgroundScript] %cThere is no tab with ID of ${tabId}`, `color: ${config.DANGER};`)
                }
                else{
                    console.log(`[BackgroundScript] %cContent script injected without database check`, `color: ${config.WARNING};`)
                    chrome.tabs.executeScript(tabId, {file: "init.js"}, ()=>{
                        // Run controllers
                        create_new_session(tabId).then(()=>{
                            shController.init(tabId)
                            asController.init(tabId)
                            mtController.startTracking(tabId)
                        })

                    })
                }
            })
        }
    })
}

// Listen for entering youtube page with video player
// webNavigation.onHistoryStateUpdated is used instead of tabs.onUpdated due to multiple executions caused by iframes
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if(details.frameId === 0 && details.url.includes(yt_watch_string)) {
        chrome.tabs.get(details.tabId, (tab) => {
            if(tab.url === details.url) {
                // If there is any captured data from last session submit it and clear the array
                if(captured_data.length > 0){
                    submit_captured_data(captured_data, details.tabId);
                }
                else{
                    console.log("[BackgroundScript] %cNo data captured yet", `color: ${config.DANGER}; font-weight: bold`);
                }
                // Inject content script into current page with video player
                execute_script(tab.id, tab.url)
            }
        });
    }
});

// Listen for onCommitted events and page reload in particular
// onCommitted - part of the page content is loaded - inject content script
chrome.webNavigation.onCommitted.addListener((details) => {
    if(details.frameId === 0 && details.url.includes(yt_watch_string)){
        chrome.tabs.get(details.tabId, (tab) => {
            if(tab.url === details.url){
                if (["reload", "typed", "link"].includes(details.transitionType) && details.url.includes(yt_watch_string)){
                    // Inject content script into current page with video player
                    execute_script(details.tabId, tab.url)
                }
            }
        })
    }
    if(details.frameId === 0 && details.url === "https://www.youtube.com/"){
        console.log("[BackgroundScript] %cYouTube main page entered", "color: #0d6efd")
        // Update last watched video url
        chrome.storage.local.set({
            "LAST_WATCHED_URL": "https://www.youtube.com/"
        })
    }
    if(details.frameId === 0 && details.url.includes("https://www.youtube.com/")){
        console.log("[BackgroundScript] %c Entered page within YouTube domain", "color: #0d6efd")
        mtController.startTracking(details.tabId)
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tab_id, changeInfo, tab)=>{

    // Prevent from opening more than N tab ! ! ! <-- annoying in development
    const N = 2 // <-- only one tab available in experiment
    chrome.tabs.getAllInWindow(tabs => {
        if(tabs.length > N ){
            chrome.storage.local.get(["DEVELOPER_MODE"], res =>{
                if(res.DEVELOPER_MODE === false){
                    chrome.tabs.remove(tab_id)
                }
            })
        }
    })
    // Listen for changing to pages different than youtube page with video player
    if(changeInfo.status == "complete" && !tab.url.includes(yt_watch_string)){
        // Send signal to stop capturing data
        chrome.tabs.sendMessage(tab_id, {msg: "stop"});

        // Submit captured
        submit_captured_data(captured_data, tab.id);
    }
})


// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {

        // Listen for handover data - captured nerd statistics
        if(request.msg === "data_handover"){
            const received_data = request.data;
            const tabId = sender.tab.id;

            // Check if data from this monitor session already exists
            const record = captured_data.find(record => record.id === tabId);
            if(record !== undefined){
                record.data.push(received_data);
            }
            else{
                const record = {
                    id: tabId,
                    data: [received_data]
                }
                captured_data.push(record);
            }
        }
        // Listen for assessment handover
        if(request.msg === "assessment_handover"){
            chrome.storage.local.get(["SESSION_ID"], (res) => {
                const session_id = res.SESSION_ID
                const url = "http://127.0.0.1:5000/assessment/"
                const data = request.data

                console.log(data)

                data.session_id = session_id    // <-- Add information about current session ID
                axios.post(url, data)
                    .then(res => {
                        //console.log(res.data)
                        console.log("[BackgroundScript] %cAssessment submitted successfully", `color: ${config.SUCCESS};`)
                    })
                    .catch(err => {
                        //console.log(err.response)
                    })
            })
        }
        // Listen for interest assessment handover
        if(request.msg === "interest_handover"){
            chrome.storage.local.get(["SESSION_ID"], (res) => {
                const session_id = res.SESSION_ID
                const url = "http://127.0.0.1:5000/interest/"
                const data = request.data
                console.log(data)
                data.session_id = session_id    // <-- Add information about current session ID

                axios.post(url, data)
                    .then(res => {
                        //console.log(res.data)
                        console.log("[BackgroundScript] %cAssessment submitted successfully", `color: ${config.SUCCESS};`)
                    })
                    .catch(err => {
                        //console.log(err.response)
                })


                //TODO Continue HERE
            })
        }
        //Listen for mouse tracker data
        if(request.msg === "mouse_tracker_data"){
            const data = request.data;
            mousetracker.push(data)
            // Submit mousetracker data if there is more than 500 records
            if(mousetracker.length > 500){
                let tmp_mousetracker = []
                mousetracker.map(item => {
                    tmp_mousetracker.push(item)
                })
                mtController.submit(tmp_mousetracker)
                mousetracker.splice(0, mousetracker.length)
            }
        }
        if(request.msg === "reset_history"){
            const timeout = 2000
            console.log(`[BackgroundScript] Clearing history stack in ${timeout/1000} seconds`)
            setTimeout(() => {
                chrome.history.deleteAll(() => {
                   console.log(`[BackgroundScript] History stack cleared`)
                })
            }, timeout)
        }

        //Listen for controllers reset signal
        if(request.msg === "RESET"){
            // Reset controllers and update session end time
            resetSession()
        }

        // Listen for YouTube logout signal
        if(request.msg === "browser-clear"){
            // yt_logout()                                       //IMPORTANT Disabled for now. Subject is not asked to log in into his/her YT account thus logging out is not required
            // Attach chrome debugger and reset browser cache and cookies then detach
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                const tab = tabs[0]
                const tab_id = tab.id
                browserClear(tab_id)
            })
        }

        // Listen for onbeforeunload message - tab close, refresh
        else if(request.msg === "onbeforeunload"){
            mtController.stopTracking() // <-- Stop mouse tracking process
            submit_captured_data(captured_data, sender.tab.id);
            if(request.type === "video_end"){
                chrome.tabs.sendMessage(sender.tab.id, {msg: "stop"});
            }
        }
    }
);

function resetSession(){
    shController.reset()
    asController.reset()
    mtController.setSessionRunning(false)
    mtController.stopTracking()

    // Update session end time in session table
    chrome.storage.local.get(["SESSION_ID"], res => {
        const url = "http://127.0.0.1:5000/session/"
        const data = {
            session_id: res.SESSION_ID
        }
        axios.put(url, data)
            .then(res => {
                //console.log(res)
                console.log("[BackgroundScript] %cSession updated successfully", `color: ${config.SUCCESS}; font-weight: bold;`)
            })
            .catch(err => {
                console.log("[BackgroundScript] %cSession update attempt failed", `color: ${config.DANGER}; font-weight: bold;`)
            })
    })
}

async function create_new_session(tab_id){
    chrome.storage.local.get([
        "TESTER_EYESIGHT_TEST_RESULT",
        "TESTER_AGE",
        "TESTER_SEX",
        "TESTER_ID_HASH",
        "TESTER_ID",
        "SESSION_TYPE",
        "VIDEOS_TYPE",
        "EXPERIMENT_TYPE",
        "SESSION_COUNTER",
        "ASSESSMENT_INTERVAL_DELTA_MS",
        "ASSESSMENT_PANEL_LAYOUT",
        "ASSESSMENT_PANEL_OPACITY",
        "ASSESSMENT_INTERVAL_MS",
        "TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], (res) => {

        const url = "http://127.0.0.1:5000/session/"
        let assessment_interval_ms
        if(res.SESSION_TYPE === "main"){
            assessment_interval_ms = res.ASSESSMENT_INTERVAL_MS
        }
        else if(res.SESSION_TYPE === "training"){
            assessment_interval_ms = res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS
        }
        const data = {
            subject_id: res.TESTER_ID,
            subject_eyesight_test_result: res.TESTER_EYESIGHT_TEST_RESULT,
            subject_age: res.TESTER_AGE,
            subject_sex: res.TESTER_SEX,
            subject_id_hash: res.TESTER_ID_HASH,
            session_type: res.SESSION_TYPE,
            video_type: res.VIDEOS_TYPE,
            assessment_panel_layout: res.ASSESSMENT_PANEL_LAYOUT,
            assessment_panel_opacity: res.ASSESSMENT_PANEL_OPACITY,
            assessment_interval_ms: assessment_interval_ms,
            experiment_type: res.EXPERIMENT_TYPE,
            session_counter: res.SESSION_COUNTER,
            assessment_interval_delta_ms: res.ASSESSMENT_INTERVAL_DELTA_MS
        }

        // Create new session
        axios.post(url, data)
            .then(res => {
                // Start mouse tracking
                mtController.setSessionRunning(true)
                mtController.startTracking(tab_id)
                chrome.storage.local.set({SESSION_ID: res.data.session_id})
                console.log("[BackgroundScript] %cSession created successfully", `color: ${config.SUCCESS}; font-weight:bold;`)
            })
            .catch(err => {
                //console.log(err.response)
                if(err.response.status === 409){
                    console.log("[BackgroundScript] %cSession with current parameters already exists", `color: ${config.DANGER}; font-weight:bold;`)
                    return
                }
                console.log("[BackgroundScript] %cSession creation attempt failed", `color: ${config.DANGER}; font-weight:bold;`)
            })
    })
}

async function browserClear(tab_id){
    // Cannot use async/await here because promises are returned only in MV3 (according to the docs, also checked did not work)
    // So I have to use these nested callbacks
    await chrome.debugger.attach({tabId: tab_id}, "1.3", () => {
        console.log("[BackgroundScript] Debugger attached")
        chrome.debugger.sendCommand({tabId: tab_id}, "Network.enable", {}, () => {
            console.log("[BackgroundScript] Network enabled")
            chrome.debugger.sendCommand({tabId: tab_id}, "Network.clearBrowserCache", {}, () => {
                console.log("[BackgroundScript] Browser cache cleared.")
                chrome.debugger.sendCommand({tabId: tab_id}, "Network.clearBrowserCookies", {}, () => {
                    console.log("[BackgroundScript] Browser cookies deleted.")
                    chrome.debugger.detach({tabId: tab_id}, () => {
                        console.log("[BackgroundScript] Debugger detached.")
                    })
                })
            } )
        })
    })
}

function yt_logout(){
    setTimeout(()=>{
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            const tabId = tabs[0].id
            chrome.tabs.executeScript(tabId, {file: "yt_logout.js"}, ()=> {
                console.log(`[BackgroundScript] Logged out` )
            })
        })
    }, 2000)
}




