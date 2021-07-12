import {get_nerd_elements} from "./modules/get_nerd_elements";
import {run_monitor} from "./modules/monitor";

import CONFIG from "./config";

import {AssessmentController} from "./classes/AssessmentController";



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


// Start the assessment controller
chrome.storage.local.get(["ASSESSMENT_MODE"], (result)=>{
    var controller = new AssessmentController(result.ASSESSMENT_MODE)
    controller.init();
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

chrome.storage.local.get(["DEVELOPER_MODE"], (res) => {
    const mode = res.DEVELOPER_MODE;
    if(mode === true){
        const devmode_check = document.getElementById("devmode");
        if(devmode_check){
            return 1;
        }
        const devmode = document.createElement("div");

        devmode.style.backgroundColor = "rgba(34,34,34,0.8)"
        devmode.id = "devmode"
        devmode.style.position = "absolute";
        devmode.style.right = "0px";
        devmode.style.top = "0px";

        devmode.style.padding = "2em 2em";

        devmode.style.zIndex = "2077";
        devmode.style.userSelect = "none";
        devmode.style.display = "flex";
        devmode.style.flexDirection = "column";
        devmode.style.justifyContent = "center"
        devmode.style.alignItems = "center"

        const text = document.createElement("p");
        text.innerText = "NerdCoder is working in developer mode";
        text.style.fontSize = "3rem";
        text.style.color = "red";
        text.style.fontWeight = "bold";

        const subtext = document.createElement("p");
        subtext.innerText = "Databa base connection is not checked. Captured data may not be saved.";
        subtext.style.fontSize = "2rem";
        subtext.style.color = "whitesmoke";

        devmode.appendChild(text);
        devmode.appendChild(subtext);
        //document.getElementsByTagName("ytd-app")[0].appendChild(devmode);
        document.getElementById("player").appendChild(devmode);

    }
})




