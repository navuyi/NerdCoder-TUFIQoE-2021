///////////////////////////////////////////////////////////////
// DO NOT TRY ANY IMPORTS IN THIS FILE - DOES NOT WORK ! ! ! //
///////////////////////////////////////////////////////////////



const yt_watch_string = "https://www.youtube.com/watch?v="
var captured_data = [];
let current_tabId;



// Initialize config values when extension is first installed to browser
chrome.runtime.onInstalled.addListener( ()=>{
    const config = {
        ASSESSMENT_PANEL_OPACITY: 80,                       // Opacity of the assessment panel in %
        ASSESSMENT_INTERVAL_MS: 5000,                       // Interval for assessment in auto mode in milliseconds
        ASSESSMENT_MODE: "auto",                            // Available modes are "remote", "auto" and "manual"
        ASSESSMENT_PANEL_LAYOUT: "middle",                  // Available for now are "middle", "top", "bottom"
        ASSESSMENT_PAUSE: "disabled",                       // Enable/disable playback pausing/resuming on video assessment
        DEVELOPER_MODE: true,                               // Enable/disable developer mode - nerd stats visibility, connection check
        ASSESSMENT_RUNNING: false,                          // Define whether process of assessment has already begun
        EXPERIMENT_MODE: "training",                            // Define whether to use training or main experiment mode
        TRAINING_MODE_ASSESSMENT_INTERVAL_MS: 30000         // Interval for assessment in auto mode in ms for training mode
    }
    chrome.storage.local.set(config, ()=>{
        console.log("Config has been saved: " + config);
    });
})


function submit_captured_data(captured_data, tabId){
    const my_url = "http://127.0.0.1:5000/new_session";
    const my_method = "POST";
    const my_headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    const index = captured_data.findIndex(record => record.id === tabId);
    console.log(index);
    if(index !== -1){
        const session_data = captured_data[index].data;
        const assessment_data = captured_data[index].assessments;
        const mousetracker = captured_data[index].mousetracker
        const my_body = JSON.stringify({session_data: session_data, assessment_data: assessment_data, mousetracker: mousetracker});

        // Delete sent data from captured_data array
        captured_data.splice(index,1);

        // Send data
        fetch(my_url, {method: my_method, headers: my_headers, body: my_body})
            .then(res => res.json())
            .then(re => console.log(re));
    }
    else{
        console.log("No data to submit")
    }
}

function execute_script(tabId){
    chrome.storage.local.get(["DEVELOPER_MODE"], res => {
        const dev_mode = res.DEVELOPER_MODE;

        if(dev_mode === false){
            // Check connection with database before executing script
            const url = "http://127.0.0.1:5000/connection_check"
            fetch(url, {method: "GET"})
                .then(res=>res.json())
                .then(data => {
                    if(data.msg === "OK"){
                        console.log("Connection OK")
                        chrome.tabs.executeScript(tabId, {file: "init.js"}, ()=>{
                            // Run debugger
                            current_tabId = tabId;
                            debuggerInit(tabId);
                        })
                    }
                })
                .catch(err => {
                    console.log("API is not reachable")
                    console.log(err);
                    // Inject content script into tab
                    chrome.tabs.executeScript(tabId, {file: "no_connection_screen.js"})
                });
        }
        else if(dev_mode === true){
            // Inject content script into tab
            chrome.tabs.executeScript(tabId, {file: "init.js"}, ()=>{
                // Run debugger
                current_tabId = tabId;
                debuggerInit(tabId);
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
        console.log("YOUTUBE MAIN ENTERED")
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tab_id, changeInfo, tab)=>{

    // Listen for changing to pages different than youtube page with video player
    if(changeInfo.status == "complete" && !tab.url.includes(yt_watch_string)){
        // Send signal to stop capturing data
        chrome.tabs.sendMessage(tab_id, {msg: "stop"});

        // Submit captured
        submit_captured_data(captured_data, tab.id);
    }
})


// Listen for messages from content script
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
            const received_assessment = request.data;
            const tabId = sender.tab.id;

            const record = captured_data.find(record => record.id === tabId);
            if(record !== undefined){
                if(record.assessments !== undefined){
                    record.assessments.push(received_assessment);
                }
                else{
                    Object.assign(record, {assessments: [received_assessment]});
                }
            }
            else{
                // This else block is very unlikely to happen
                const record = {
                    id: tabId,
                    assessments: [received_assessment]
                }
                // If there is no record found, don't append the data - causes error when data in submitted on video end
                // and only assessments are submitted
                //captured_data.push(record);
            }
        }
        //Listen for mouse tracker data
        if(request.msg === "mouse_tracker_data"){
            const data = request.data;
            const tabId = sender.tab.id;

            const record = captured_data.find(record => record.id === tabId)
            if(record !== undefined){
                if(record.mousetracker !== undefined){
                    record.mousetracker.push(data)
                }
                else{
                    Object.assign(record, {mousetracker: [data]})
                }
            }
            else{
                // nothing for now
            }
        }
        // Listen for onbeforeunload message - tab close, refresh
        else if(request.msg === "onbeforeunload"){
            submit_captured_data(captured_data, sender.tab.id);

            if(request.type === "video_end"){
                chrome.tabs.sendMessage(sender.tab.id, {msg: "stop"});
            }
        }
    }
);

///////////////////////////////////////////// Throttling Section ///////////////////////////////////////////////////////
localStorage.setItem("session_started", "false");

const bitsToBytes = (bits) => {
    return Math.floor(bits/8);
}



async function debuggerInit(tabId){
    // Implement method for reseting debugger_running option ! !
    // Manually - reload extension
    if(localStorage.getItem("session_started") === "false"){
        // Attach to the tab
        await chrome.debugger.attach({tabId}, "1.3");
        // Enable network
        await chrome.debugger.sendCommand({tabId}, "Network.enable");

        localStorage.setItem("session_started", "true");


        chrome.storage.local.get(["EXPERIMENT_MODE"], (result) =>{
            console.log("AYAYAYAYAYA")
            console.log(result)
            const mode = result.EXPERIMENT_MODE
            let scenario_file
            if(mode === "training"){
                scenario_file = "training_scenario.json"
            }
            else if(mode === "main"){
                scenario_file = "main_scenario.json"
            }

            // Get the throttling scenario data from main_scenario.json
            const url = chrome.extension.getURL(scenario_file);
            console.log("[BACKGROUND SCRIPT] Fetching "+scenario_file)
            fetch(url)
                .then(res=>res.json())
                .then(data => {
                    scheduleThrottling(tabId, data)
                })
        });
    }
}

function scheduleThrottling(tabId, data){
    const scenario = data;
    console.log(scenario);

    for(let index in scenario.schedule){
        const plan = scenario.schedule[index];
        scheduleNetworkConditions(plan.timeout_s, plan.params, scenario.name, tabId, index);
    }
}

function scheduleNetworkConditions(timeout, params, scenarioName, tabId, index){
    params.downloadThroughput = bitsToBytes(params.downloadThroughput);
    console.log(params);
    setTimeout(()=>{
        chrome.debugger.sendCommand({tabId}, "Network.emulateNetworkConditions", params, ()=>{
            console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} started`);
        })
    }, Math.round(timeout*1000))
    console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} scheduled to be launched in ${timeout} seconds`);
}






