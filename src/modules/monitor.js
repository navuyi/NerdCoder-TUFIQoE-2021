export function run_monitor(simple, complex){
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
                }
                chrome.runtime.sendMessage(message)
                return true;
            }
        }
        Object.assign(data, {[key]: value})
    }
    // Extract useful data from complex elements
    for(const [key, val] of Object.entries(complex)){
        const value = val.querySelector("span").querySelectorAll("span")[1].innerText;
        Object.assign(data, {[key]: value})
    }
    // Get video ID from browser's URL - relying fully on nerd statistics can be misleading due to different loading times
    const url = window.location; // <-- This is accurate
    Object.assign(data, {url: url.href})


    // Get current scroll height
    data.scrollY = Math.round(window.scrollY)

    // Send data to background script
    chrome.storage.local.get(["DOWNLOAD_BANDWIDTH_BYTES" , "UPLOAD_BANDWIDTH_BYTES", "CURRENT_DISPLAY_MODE"], res => {
        data.download_bandwidth_bytes = res.DOWNLOAD_BANDWIDTH_BYTES
        data.upload_bandwidth_bytes = res.UPLOAD_BANDWIDTH_BYTES
        data.display_mode = res.CURRENT_DISPLAY_MODE
        hand_over_data(data);
    })

}


function hand_over_data(data){
    const message = {
        msg: "data_handover",
        data: data
    }
    chrome.runtime.sendMessage(message);
}
