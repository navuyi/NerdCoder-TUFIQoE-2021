export function run_monitor(simple, complex){
    const data = {};
    const timestamp = Date.now();

    Object.assign(data, {timestamp: timestamp});

    // Handle simple elements
    for(let i=0; i<simple.length; i++){
        const [key, val] = Object.entries(simple[i])[0];
        const value = val.querySelector("span").innerText;

        // Check if the video has ended
        if(key === "Mystery Text"){
            const mode = value.match(/s:([a-z A-Z 0-9]{2})/)[1];
            if(mode === "e "){
                // Send onbeforeunload message with type vide_end
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
    // Handle complex elements
    for(let i=0; i<complex.length; i++){
        const [key, val] = Object.entries(complex[i])[0];

        const value = val.querySelector("span").querySelectorAll("span")[1].innerText;
        Object.assign(data, {[key]: value})
    }
    console.log(data);
    hand_over_data(data);
}



function hand_over_data(data){
    const message = {
        msg: "data_handover",
        data: data
    }
    chrome.runtime.sendMessage(message);
}







