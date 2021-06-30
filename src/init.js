import {get_nerd_elements} from "./modules/get_nerd_elements";
import {run_monitor} from "./modules/monitor";
import {init_assessment_controller} from "./modules/video_assessment";
import CONFIG from "./config";






// Clear running_monitor from last session - will not execute on first video playback
if(typeof running_monitor !== "undefined"){
    console.log("CLEARING");
    clearInterval(running_monitor);
}
else{
    console.log("No running monitor to clear");
}




// Activate nerd statistics popup and get the HTML elements
var [simple, complex] = get_nerd_elements();


// Start capturing nerd statistics data
var running_monitor = setInterval(run_monitor, CONFIG.INTERVAL, simple, complex);

// Turn on proper mode for controlling assessment panels

chrome.storage.local.get(["ASSESSMENT_MODE"], (result)=>{
    console.log(result)
    init_assessment_controller(result.ASSESSMENT_MODE);
})





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
    if(request.msg === "stop"){
        if(typeof running_monitor !== 'undefined'){
            clearInterval(running_monitor);
        }
    }
})