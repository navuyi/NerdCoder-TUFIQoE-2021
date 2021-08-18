// Imports work but files that provide export must be included in manifest.json //
import {ChromeDebugger} from "./background_controllers/ChromeDebugger";
import {AssessmentController} from "./background_controllers/AssessmentController";
import {MouseTrackerController} from "./background_controllers/MouseTrackerController";

import axios from "axios";


const yt_watch_string = "https://www.youtube.com/watch?v="
const captured_data = []
const mousetracker = []


// Initialize controllers

const asController = new AssessmentController();
const mtController = new MouseTrackerController()
const chDebugger = new ChromeDebugger(resetSession);

// Initialize config values when extension is first installed to browser
chrome.runtime.onInstalled.addListener( ()=>{
    const config = {
        SESSION_ID: undefined,                                                                  // Attached to request when submitting captured data
        ASSESSMENT_PANEL_OPACITY: 80,                                               // Opacity of the assessment panel in %
        ASSESSMENT_INTERVAL_MS: 300000,                                             // Interval for assessment in auto mode in milliseconds
        ASSESSMENT_MODE: "auto",                                                         // Available modes are "remote", "auto" and "manual"
        ASSESSMENT_PANEL_LAYOUT: "middle",                                      // Available for now are "middle", "top", "bottom"
        ASSESSMENT_PAUSE: "disabled",                                                  // Enable/disable playback pausing/resuming on video assessment
        DEVELOPER_MODE: true,                                                               // Enable/disable developer mode - nerd stats visibility, connection check
        ASSESSMENT_RUNNING: false,                                                     // Define whether process of assessment has already begun
        SESSION_TYPE: "training",                                                    // Define whether to use "training" or "main" experiment mode
        TRAINING_MODE_ASSESSMENT_INTERVAL_MS: 60000,              // Interval for assessment in auto mode in ms for training mode
        VIDEOS_TYPE: "own",                                                                    // Gives information about videos type - "imposed" / "own" values are available
        TESTER_ID: "",                                                                              // Tester ID
        TESTER_ID_HASH: "",
        DOWNLOAD_BANDWIDTH_BYTES: undefined,
        UPLOAD_BANDWIDTH_BYTES: undefined
    }
    chrome.storage.local.set(config, ()=>{
        console.log("Config has been saved: " + config);
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
        console.log("[BackgroundScript] %cNo MouseTracker data captured yet", "color: #ffc107, font-weight: bold")
    }

    // Submit nerd statistics data - video data
    console.log("[BackgroundScript] %cSubmitting captured data", "color: #ffc107")
    const my_url = "http://127.0.0.1:5000/video/";
    const my_method = "POST";
    const my_headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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

            fetch(my_url, {method: my_method, headers: my_headers, body: my_body})
                .then(res => res.json())
                .then(re => console.log(re));
        })
    }
    else{
        console.log(`[BackgroundScript] %cNo data to submit`, "color: #dc3545; font-weight: bold")
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
                                console.log(`[BackgroundScript] There is no tab with ID of %c${tabId}`, "color: #0d6efd; font-weight: bold")
                            }
                            else{
                                console.log(`[BackgroundScript] Connection %cOK`, "color: #0d6efd; font-weight: bold")
                                chrome.tabs.executeScript(tabId, {file: "init.js"}, ()=>{
                                    // Run controllers
                                    create_new_session(tabId).then(()=>{
                                        chDebugger.init(tabId)
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
                    console.log(`[BackgroundScript] There is no tab with ID of %c${tabId}`, "color: #0d6efd; font-weight: bold")
                }
                else{
                    console.log(`[BackgroundScript] Content script injected %cwithout database check`, "color: #dc3545 ; font-weight: bold")
                    chrome.tabs.executeScript(tabId, {file: "init.js"}, ()=>{
                        // Run controllers
                        create_new_session(tabId).then(()=>{
                            chDebugger.init(tabId)
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
                    console.log("No data captured yet");
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
                        console.log(res.data)
                    })
                    .catch(err => {
                        console.log(err.response)
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
            console.log(mousetracker.length)
        }

        //Listen for controllers reset signal
        if(request.msg === "RESET"){
            // Reset controllers and update session end time
            resetSession()
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
    chDebugger.reset()
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
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
    })
}

async function create_new_session(tab_id){
    chrome.storage.local.get([
        "TESTER_ID_HASH",
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
            subject_id: res.TESTER_ID_HASH,
            session_type: res.SESSION_TYPE,
            video_type: res.VIDEOS_TYPE,
            assessment_panel_layout: res.ASSESSMENT_PANEL_LAYOUT,
            assessment_panel_opacity: res.ASSESSMENT_PANEL_OPACITY,
            assessment_interval_ms: assessment_interval_ms
        }
        console.log(data)
        // Create new session
        axios.post(url, data)
            .then(res => {
                // Start mouse tracking
                mtController.setSessionRunning(true)
                mtController.startTracking(tab_id)
                chrome.storage.local.set({SESSION_ID: res.data.session_id})
            })
            .catch(err => {
                console.log(err.response)
            })
    })
}


