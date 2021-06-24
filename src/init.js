import {get_nerd_elements} from "./modules/get_nerd_elements";
import {run_monitor} from "./modules/monitor";
import {create_acr_panel} from "./modules/video_assessment";
import {remove_acr_panel} from "./modules/video_assessment";

import CONFIG from "./config";

var INTERVAL = CONFIG.INTERVAL; // time interval for monitor in ms




// This code section is temporary
remove_acr_panel();
document.addEventListener('keydown', (e)=>{
    if(e.key === "o"){
        create_acr_panel();
    }
    else if(e.key === "p"){
        remove_acr_panel();
    }
})


// Clear running_monitor from last session - will not execute on first video playback
if(running_monitor){
    console.log("CLEARING");
    clearInterval(running_monitor);
}
else{
    console.log("No running monitor to clear");
}

// Activate nerd statistics popup and get the HTML elements
var [simple, complex] = get_nerd_elements();

// Start capturing nerd statistics data
var running_monitor = setInterval(run_monitor, INTERVAL, simple, complex);









// Listen for tab close, refresh, redirect to different page (different address)
window.onbeforeunload = () => {
    const message = {
        msg: "onbeforeunload"
    }
    chrome.runtime.sendMessage(message);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // Clear interval in case of receiving "stop" message
    if(request.msg == "stop"){
        clearInterval(running_monitor);
    }
})