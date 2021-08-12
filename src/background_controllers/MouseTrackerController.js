export function MouseTrackerController(){

    this.isRunning = false

    this.init = function(){
        if(this.isRunning === true){
            console.log("[MouseTrackerController] Mouse tracking process already running")
            return true
        }




        // Init cursor tracking
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
            this.isRunning = true
        }
    }

    this.reset = function(){
        this.isRunning = false;
        onmousemove = (e) => {
            // Empty event handler
        }
    }
}