

export function run_monitor(simple, complex){
    const data = {};
    const timestamp = Date.now();

    Object.assign(data, {timestamp: timestamp});

    // Extract useful data from simple elements
    for(const [key, val] of Object.entries(simple)){
        const value = val.querySelector("span").innerText;

        // Check if the video has ended by extracting and checking e value from mystery text
        if(key === "mysteryText"){
            const mode = value.match(/s:([a-z A-Z 0-9]{2})/)[1];
            if(mode === "e "){
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
    // Send data to background script
    hand_over_data(data);
}



function hand_over_data(data){
    const message = {
        msg: "data_handover",
        data: data
    }
    chrome.runtime.sendMessage(message);
}







