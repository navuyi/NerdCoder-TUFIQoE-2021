
// Track mouse movement
onmousemove = (e) =>{

    const data = {
        type: e.type,
        url: window.location.href,
        timestamp: Date.now(),
        which: e.which,
        target_id: e.target.id,
        target_nodeName: e.target.nodeName,

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
