export function run_monitor(simple, complex){
    let data = [];

    // Handle simple elements
    for(let i=0; i<simple.length; i++){
        const key = simple[i].querySelector("div").innerText;
        const val = simple[i].querySelector("span").innerText;

        // Check if the video has ended
        if(key === "Mystery Text"){
            console.log(val);
            const mode = val.match(/s:([a-z A-Z 0-9]{2})/)[1];
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

        data.push({[key]: val});
    }
    // Handle complex elements
    for(let i=0; i<complex.length; i++){
        const key = complex[i].querySelector("div").innerText;
        const val = complex[i].querySelector("span").querySelectorAll("span")[1].innerText;
        data.push({[key]: val});
    }
    console.log(data);
    hand_over_data(data);
}



function hand_over_data(data){
    const message = {
        msg: "data_handover",
        data: data
    }
    chrome.runtime.sendMessage(message, (response)=>{
        //
    })
}







