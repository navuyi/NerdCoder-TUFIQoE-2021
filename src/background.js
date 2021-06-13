const yt_watch_string = "https://www.youtube.com/watch?v="
var captured_data = [];
var last_url = "";

function submit_captured_data(data){

    const my_url = "https://reqbin.com/echo/post/json";
    const my_method = "POST";
    const my_headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    const my_body = JSON.stringify(data);

    // Submit the data
    if(data.length > 0){

        console.log(data);
        fetch(my_url, {method: my_method, headers: my_headers, body: my_body})
            .then(res => res.json())
            .then(re => console.log(re));
    }
    else{
        console.log("No data to submit")
    }
}


// Listen for entering youtube page with video player
// webNavigation.onHistoryStateUpdated is used instead of tabs.onUpdated due to multiple executions coused by iframes
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log(details.transitionType);
    if(details.frameId === 0 && details.url.includes(yt_watch_string)) {
        chrome.tabs.get(details.tabId, (tab) => {
            if(tab.url === details.url) {

                // If there is any captured data from last session submit it and clear the array
                if(captured_data.length > 0){
                    submit_captured_data(captured_data);
                    captured_data = [];
                }
                else{
                    console.log("No data captured yet");
                }
                // Inject content script into current page with video player
                chrome.tabs.executeScript(tab.id, {file: "init.js"})
                last_url = tab.url;
            }
        });
    }
});

// Listen for onCommittedd events and page reload in particular
// onCommitted - part of the page content is loaded - inject content script
chrome.webNavigation.onCommitted.addListener((details) => {
    if(details.frameId === 0 && details.url.includes(yt_watch_string)){
       chrome.tabs.get(details.tabId, (tab) => {
           if(tab.url === details.url){
               if (["reload"].includes(details.transitionType) && details.url.includes(yt_watch_string)){
                   console.log("RELOAD RELOAD RELOAD RELOAD");
                   // Inject content script into current page with video player
                   chrome.tabs.executeScript(details.id, {file: "init.js"})
                   last_url = details.url;
               }
           }
       })
    }

});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tab_id, changeInfo, tab)=>{

    // Listen for changing to pages different than youtube page with video player
    if(changeInfo.status == "complete" && !tab.url.includes(yt_watch_string)){
        // Send signal to stop capturing data
        chrome.tabs.sendMessage(tab_id, {msg: "stop"}, (response) => {
            //
        });
        // Submit captured data and clear array
        submit_captured_data(captured_data);
        captured_data = [];
    }
})


// Listen for messages from content script
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {

    // Listen for handover data - captured nerd statistics
    if(request.msg == "data_handover"){
        captured_data.push(request.data);
    }
    // Listen for onbeforeunload message - tab close, refresh, change
    else if(request.msg == "onbeforeunload"){
        submit_captured_data(captured_data);
        captured_data = [];

        if(request.type == "video_end"){
            chrome.tabs.sendMessage(sender.tab.id, {msg: "stop"});
        }
    }
}
);





















