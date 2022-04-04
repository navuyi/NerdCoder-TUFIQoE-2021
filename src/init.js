import {get_nerd_elements} from "./modules/get_nerd_elements";
import {run_monitor} from "./modules/monitor";

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
//IMPORTANT NERD STATS INTERVAL THAT WAS USED TO THIS MOMENT WAS 500 ms
var running_monitor = setInterval(run_monitor, 250, simple, complex);

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


// Delete ytp-miniplayer-button ytp-button
try{
    document.getElementsByClassName("ytp-miniplayer-button ytp-button")[0].remove()
}
catch (err){
    console.log("ytp-miniplayer-button already removeed")
    console.log(err)
}

/*
// Listen for to fullscreen and off fullscreen transitions (doubleclick, button press, F key)
document.addEventListener("fullscreenchange", () => {
    chrome.storage.local.get(["CURRENT_DISPLAY_MODE", "PREVIOUS_DISPLAY_MODE"], res => {
        const current_mode = res.CURRENT_DISPLAY_MODE
        const previous_mode = res.PREVIOUS_DISPLAY_MODE
        if(document.fullscreenElement){
            chrome.storage.local.set({
                "CURRENT_DISPLAY_MODE": "fullscreen",
                "PREVIOUS_DISPLAY_MODE": current_mode
            })
        }
        else{
            chrome.storage.local.set({
                "CURRENT_DISPLAY_MODE": previous_mode,
                "PREVIOUS_DISPLAY_MODE": current_mode
            })
        }
    })
})
 */

/*
// Listen for default<-->theater display mode transition using T keyboard key
document.onkeypress = (e) => {
    if(e.key === "t" || e.key ==="T"){
        if(document.activeElement.id === "search"){
            // do nothing
        }
        else{
            chrome.storage.local.get(["CURRENT_DISPLAY_MODE", "PREVIOUS_DISPLAY_MODE"], res => {
                const current_mode = res.CURRENT_DISPLAY_MODE
                const previous_mode = res.PREVIOUS_DISPLAY_MODE
                if(current_mode === "fullscreen"){
                    // After exiting fullscreen by using T key it always gets to theater
                    chrome.storage.local.set({
                        CURRENT_DISPLAY_MODE: "theater",
                        PREVIOUS_DISPLAY_MODE: current_mode
                    })
                }
                else if(current_mode === "default"){
                    chrome.storage.local.set({
                        CURRENT_DISPLAY_MODE: "theater",
                        PREVIOUS_DISPLAY_MODE: current_mode
                    })
                }
                else if(current_mode === "theater"){
                    chrome.storage.local.set({
                        CURRENT_DISPLAY_MODE: "default",
                        PREVIOUS_DISPLAY_MODE: current_mode
                    })
                }
            })
        }
    }
}
 */