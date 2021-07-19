

export function MouseTracker(){
    this.interval = 10;




    this.init = function(){
        onmousemove = (e) =>{


            const data = {
                posX: e.pageX,
                posY: e.pageY,
                timestamp_utc_ms: Date.now()
            }

            const message = {
                msg: "mouse_tracker_data",
                data: data
            }
            chrome.runtime.sendMessage(message);
        }
    }
}