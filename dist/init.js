function get_nerd_elements(){
    // Simulate rightclick on player to show menu list
    document.getElementById("player");
    document.getElementById("player-container-outer");
    document.getElementById("player-container-inner");
    document.getElementById("player-container");
    document.getElementById("ytd-player");

    // HTML element with id "movie_player" is the element that can be rightclicked in order to show menu list
    const movie_player = document.getElementById("movie_player");


    // Simulate right click on the movie_player element
    var element = movie_player;
    var e = element.ownerDocument.createEvent('MouseEvents');
    e.initMouseEvent('contextmenu', true, true,
        element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
        false, false, false, 2, null);
    !element.dispatchEvent(e);


    // Get through all the elements of the menu list and simulate click on the element that activates nerd statistics
    const ytp_popup = document.getElementsByClassName("ytp-popup ytp-contextmenu").item(0);
    const ytp_panel = ytp_popup.children.item(0);
    const ytp_panel_menu = ytp_panel.children.item(0);
    const menu_list = ytp_panel_menu.children;
    const nerd_stats_button = menu_list.item(menu_list.length - 1);

    /*
    console.log(ytp_popup);
    console.log(ytp_panel);
    console.log(ytp_panel_menu);
    console.log(menu_list);
    console.log(menu_list.length);
    console.log(nerd_stats_button);
     */

    // Now activate the nerd statistics calculations and popup window
    nerd_stats_button.click();

    // nerd_stats is the parent element for the nerd statistics popup window
    const nerd_stats = document.getElementsByClassName("html5-video-info-panel").item(0);
    const nerd_content = document.getElementsByClassName("html5-video-info-panel-content").item(0);

    // nerd_data is a html element, it consist multiple items
    const nerd_data = nerd_content.children;

    // Extract data from the html elements
    const videoId_sCPN = nerd_data.item(0);
    const viewport_frames = nerd_data.item(1);
    const current_optimalRes = nerd_data.item(2);
    const volume_normalized = nerd_data.item(3);
    const codecs = nerd_data.item(4);
    const color = nerd_data.item(6);
    const connectionSpeed = nerd_data.item(8);
    const networkActivity = nerd_data.item(9);
    const bufferHealth = nerd_data.item(10);
    const mysteryText = nerd_data.item(14);

    // Hide the statistics popup by setting opacity to 0 and making unclickable
    chrome.storage.local.get(["DEVELOPER_MODE"], (res) => {
        const dev_mode = res.DEVELOPER_MODE;
        if(dev_mode === true){
            nerd_stats.style.opacity = "100%";
        }
        else if(dev_mode === false){
            nerd_stats.style.opacity = "0%";
            nerd_stats.style.pointerEvents = "none";
        }
    });

    const nerd_elements_simple = {
        mysteryText: mysteryText,
        videoId_sCPN: videoId_sCPN,
        viewport_frames: viewport_frames,
        current_optimalRes: current_optimalRes,
        volume_normalized: volume_normalized,
        codecs: codecs,
        color: color
    };
    const nerd_elements_complex = {
        connectionSpeed: connectionSpeed,
        networkActivity: networkActivity,
        bufferHealth: bufferHealth
    };
    return [nerd_elements_simple, nerd_elements_complex];
}

function run_monitor(simple, complex){
    const data = {};
    const timestamp = Date.now();

    // Add timestamp to captured data
    Object.assign(data, {timestamp: timestamp});

    // Extract useful data from simple elements
    for(const [key, val] of Object.entries(simple)){
        const value = val.querySelector("span").innerText;
        let mode;
        // Check if the video has ended by extracting and checking e value from mystery text
        if(key === "mysteryText"){
            try{
                mode = value.match(/s:([a-z A-Z 0-9]{2})/)[1];
            }
            catch(err){
                console.log(err);
            }
            if(mode && mode === "e "){
                // Send onbeforeunload message with type video_end
                const message = {
                    msg: "onbeforeunload",
                    type: "video_end"
                };
                chrome.runtime.sendMessage(message);
                return true;
            }
        }
        Object.assign(data, {[key]: value});
    }
    // Extract useful data from complex elements
    for(const [key, val] of Object.entries(complex)){
        const value = val.querySelector("span").querySelectorAll("span")[1].innerText;
        Object.assign(data, {[key]: value});
    }
    // Get video ID from browser's URL - relying fully on nerd statistics can be misleading due to different loading times
    const url = window.location; // <-- This is accurate
    Object.assign(data, {url: url.href});


    // Get current scroll height
    data.scrollY = Math.round(window.scrollY);

    // Send data to background script
    chrome.storage.local.get(["DOWNLOAD_BANDWIDTH_BYTES" , "UPLOAD_BANDWIDTH_BYTES", "CURRENT_DISPLAY_MODE"], res => {
        data.download_bandwidth_bytes = res.DOWNLOAD_BANDWIDTH_BYTES;
        data.upload_bandwidth_bytes = res.UPLOAD_BANDWIDTH_BYTES;
        data.display_mode = res.CURRENT_DISPLAY_MODE;
        hand_over_data(data);
    });
}


function hand_over_data(data){
    const message = {
        msg: "data_handover",
        data: data
    };
    chrome.runtime.sendMessage(message);
}

// Clear running_monitor from last session - will not execute on first video playback
if(typeof running_monitor !== "undefined"){
    console.log("CLEARING");
    clearInterval(running_monitor);
}
else {
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

    };
    chrome.runtime.sendMessage(message);
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Clear interval in case of receiving "stop" message
    if(request.msg === "stop"){
        if(typeof running_monitor !== 'undefined'){
            clearInterval(running_monitor);
        }
    }
});


// Delete ytp-miniplayer-button ytp-button
try{
    document.getElementsByClassName("ytp-miniplayer-button ytp-button")[0].remove();
}
catch (err){
    console.log("ytp-miniplayer-button already removeed");
    console.log(err);
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
