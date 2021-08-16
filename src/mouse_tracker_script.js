
onmousemove = (e) =>{
    const data = {
        posX: e.pageX,
        posY: e.pageY,
        timestamp_utc_ms: Date.now()
    }
    console.log(e.type)
    const message = {
        msg: "mouse_tracker_data",
        data: data
    }
    chrome.runtime.sendMessage(message);
}

onmousedown = (e) => {
    console.log(e.type)
}