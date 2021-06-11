

chrome.tabs.onUpdated.addListener(async (tab_id, changeInfo, tab)=>{

    const yt_watch_string = "https://www.youtube.com/watch?v="

    // Works on video change and page reload :)
    if(changeInfo.status == "complete" && tab.url.includes(yt_watch_string)){
        console.log("YOU HAVE ENTERED YOUTUBE PLAYBACK");
        chrome.tabs.executeScript(tab_id, {file: "content.js"});
    }
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    switch (request.id){
        case "tab_close":
            console.log(request);
            break;
        case "forward_backward":
            console.log(request);
            break;
        case "data":
            console.log(request.data);
            break;
    }
});















