
// Track mouse movement
onmousemove = (e) =>{
    const data = {
        type: e.type,
        url: window.location.href,
        timestamp: Date.now(),
        which: e.which,
        target_id: e.target.id,
        target_nodeName: e.target.nodeName,

        class_list: e.target.classList.value,
        innerText: e.target.innerText ?? null,

        clientX: e.clientX,
        clientY: e.clientY,
        movementX: e.movementX,
        movementY: e.movementY,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY
    }

    // Send data to background script
    const message = {
        msg: "mouse_tracker_data",
        data: data
    }
    chrome.runtime.sendMessage(message);
}

// Track mouse button press
onmousedown = (e) => {

    const data = {
        type: e.type,
        url: window.location.href,
        timestamp: Date.now(),
        which: e.which,
        target_id: e.target.id,
        target_nodeName: e.target.nodeName,

        class_list: e.target.classList.value,
        innerText: e.target.innerText ?? null,

        clientX: e.clientX,
        clientY: e.clientY,
        movementX: e.movementX,
        movementY: e.movementY,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY
    }
    //handleDisplayChange(e.target.classList.value)

    // Send data to background script
    const message = {
        msg: "mouse_tracker_data",
        data: data
    }
    chrome.runtime.sendMessage(message);
}



/*
function handleDisplayChange(class_list){
    if(class_list === "ytp-size-button ytp-button"){
        chrome.storage.local.get(["CURRENT_DISPLAY_MODE"], res => {
            const current_mode = res.CURRENT_DISPLAY_MODE
            if(current_mode === "default"){
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
 */

