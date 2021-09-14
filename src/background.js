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
        ASSESSMENT_INTERVAL_MS: 300000,                                             // Interval for assessment in auto mode in milliseconds
        ASSESSMENT_MODE: "auto",                                                         // Available modes are "remote", "auto" and "manual"
        ASSESSMENT_PANEL_LAYOUT: "middle",                                      // Available for now are "middle", "top", "bottom"
        ASSESSMENT_PAUSE: "disabled",                                                  // Enable/disable playback pausing/resuming on video assessment
        DEVELOPER_MODE: false,                                                               // Enable/disable developer mode - nerd stats visibility, connection check
        ASSESSMENT_RUNNING: false,                                                     // Define whether process of assessment has already begun
        SESSION_TYPE: "training",                                                    // Define whether to use "training" or "main" experiment mode
        TRAINING_MODE_ASSESSMENT_INTERVAL_MS: 120000,              // Interval for assessment in auto mode in ms for training mode
        VIDEOS_TYPE: "own",                                                                    // Gives information about videos type - "imposed" / "own" values are available
        TESTER_ID: "",                                                                              // Tester ID
        TESTER_ID_HASH: "",
        DOWNLOAD_BANDWIDTH_BYTES: undefined,                            // Used to gather information about current network throttling
        UPLOAD_BANDWIDTH_BYTES: undefined,                                   // Same as above, but upload bandwidth stays always the same, high value - unlimited bandwidth
        //MAIN_SCENARIO_ID: 1                                                              // Defines which scenario file should be used to schedule throttling, default 1
        SESSION_COUNTER: 0                                                                 // Keeps track of sessions, after trainign set to 1, after first of main set to 2, after second of main set to 3, then experiment ends
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

function execute_script(tabId){
    chrome.storage.local.get(["DEVELOPER_MODE"], res => {
        const dev_mode = res.DEVELOPER_MODE;

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
                execute_script(tab.id)
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
                    execute_script(details.tabId)
                }
            }
        })
    }
    if(details.frameId === 0 && details.url === "https://www.youtube.com/"){
        //console.log("[BackgroundScript] %cYouTube main page entered", "color: #0d6efd")
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

        //Listen for controllers reset signal
        if(request.msg === "RESET"){
            // Reset controllers and update session end time
            resetSession()
        }

        // Listen for YouTube logout signal
        if(request.msg === "yt_logout"){
            yt_logout()
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
        "TESTER_ID_HASH",
        "TESTER_ID",
        "SESSION_TYPE",
        "VIDEOS_TYPE",
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
            subject_id_hash: res.TESTER_ID_HASH,
            session_type: res.SESSION_TYPE,
            video_type: res.VIDEOS_TYPE,
            assessment_panel_layout: res.ASSESSMENT_PANEL_LAYOUT,
            assessment_panel_opacity: res.ASSESSMENT_PANEL_OPACITY,
            assessment_interval_ms: assessment_interval_ms
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




