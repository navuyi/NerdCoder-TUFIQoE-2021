import {get_nerd_elements} from "./modules/get_nerd_elements";
import {run_monitor} from "./modules/monitor";
import {create_assessment_panel} from "./modules/video_assessment";
import {remove_assessment_panel} from "./modules/video_assessment";
import {assessment_control_mode} from "./modules/video_assessment";
import CONFIG from "./config";

import {axios} from "axios";
import io from "socket.io-client"




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
var running_monitor = setInterval(run_monitor, CONFIG.INTERVAL, simple, complex);


// Turn on proper mode for controlling assessment panels
assessment_control_mode();









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
        clearInterval(assessment_controller);
    }
})