import {get_nerd_elements} from "./modules/get_nerd_elements";
import {run_monitor} from "./modules/utils";


var INTERVAL = 500; // time interval for monitor in ms


console.log("Init script executed")

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
    chrome.runtime.sendMessage(message, (response)=>{
        // nothing
    })
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // Clear interval in case of receiving "stop" message
    if(request.msg == "stop"){
        clearInterval(running_monitor);
    }
})