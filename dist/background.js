///////////////////////////////////////////////////////////////
// DO NOT TRY ANY IMPORTS IN THIS FILE - DOES NOT WORK ! ! ! //
///////////////////////////////////////////////////////////////


const yt_watch_string = "https://www.youtube.com/watch?v=";
var captured_data = [];


// Initialize config values when extension is first installed to browser
chrome.runtime.onInstalled.addListener( ()=>{
    const config = {
        ASSESSMENT_PANEL_OPACITY: 80,                   // Opacity of the assessment panel in %
        ASSESSMENT_INTERVAL_MS: 5000,                    // Interval for assessment in auto mode in milliseconds
        ASSESSMENT_MODE: "auto",                        // Available modes are "remote", "auto" and "manual"
        ASSESSMENT_PANEL_LAYOUT: "middle",              // Available for now are "middle", "top", "bottom"
        ASSESSMENT_PAUSE: "disabled"                    // Enable/disable playback pausing/resuming on video assessment
    };
    chrome.storage.local.set(config, ()=>{
        console.log("Config has been saved: " + config);
    });
    window.localStorage.setItem('test_val', "Dwiescie dwadziescia");
});


function submit_captured_data(captured_data, tabId){
    const my_url = " http://127.0.0.1:5000/new_session";
    const my_method = "POST";
    const my_headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    const index = captured_data.findIndex(record => record.id === tabId);
    console.log(index);
    if(index !== -1){
        const session_data = captured_data[index].data;
        const assessment_data = captured_data[index].assessments;
        const my_body = JSON.stringify({session_data: session_data, assessment_data: assessment_data});

        // Delete sent data from captured_data array
        captured_data.splice(index,1);

        // Send data
        fetch(my_url, {method: my_method, headers: my_headers, body: my_body})
            .then(res => res.json())
            .then(re => console.log(re));
    }
    else {
        console.log("No data to submit");
    }
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
                else {
                    console.log("No data captured yet");
                }
                // Inject content script into current page with video player
                chrome.tabs.executeScript(tab.id, {file: "init.js"});
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
                    chrome.tabs.executeScript(details.tabId, {file: "init.js"});
                }
            }
        });
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
});


// Listen for messages from content script
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {

        // Listen for handover data - captured nerd statistics
        if(request.msg == "data_handover"){
            const received_data = request.data;
            const tabId = sender.tab.id;

            // Look if data from this monitor session already exists
            const record = captured_data.find(record => record.id === tabId);
            if(record !== undefined){
                record.data.push(received_data);
            }
            else {
                const record = {
                    id: tabId,
                    data: [received_data]
                };
                captured_data.push(record);
            }
        }
        // Listen for assessment handover
        if(request.msg == "assessment_handover"){
            const received_assessment = request.data;
            const tabId = sender.tab.id;

            const record = captured_data.find(record => record.id === tabId);
            if(record !== undefined){
                if(record.assessments !== undefined){
                    record.assessments.push(received_assessment);
                }
                else {
                    Object.assign(record, {assessments: [received_assessment]});
                }
            }
        }
        // Listen for onbeforeunload message - tab close, refresh
        else if(request.msg == "onbeforeunload"){
            submit_captured_data(captured_data, sender.tab.id);

            if(request.type == "video_end"){
                chrome.tabs.sendMessage(sender.tab.id, {msg: "stop"});
            }
        }
    }
);
