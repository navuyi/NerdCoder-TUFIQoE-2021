export function MouseTrackerController(){

    this.isRunning = false
    this.isSessionRunning = false

    this.startTracking = function(tab_id){
        if(this.isRunning === true){
            console.log("[MouseTrackerController] %cMouse tracking process already running", "color: #ffc107")
            return true
        }
        else if(this.isSessionRunning === false){
            console.log("[MouseTrackerController] %cMouse tracking process can only run when session process is active", "color: #ffc107")
            return true
        }
        chrome.tabs.executeScript(tab_id, {
            file: "mouse_tracker_script.js"
        })
        console.log("[MouseTrackerController] %cStarting mouse tracking", "color: #28a745")
        this.isRunning = true
    }

    this.setSessionRunning = function(state){
        this.isSessionRunning = state
    }

    this.stopTracking = function(){
        //TODO Inject
        console.log("[MouseTrackerController] %cStopping mouse tracking", "color: #dc3545")
        this.isRunning = false
    }
}