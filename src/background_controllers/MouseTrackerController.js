import axios from "axios";
import {config} from "../config";

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
        }, () =>{
            console.log("INJECTED MOUSE TRACKER SCRIPT ! ! ! ! !")
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

    this.submit = function(mousetracker){
        chrome.storage.local.get(["SESSION_ID"], res => {
            const session_id = res.SESSION_ID
            const mt_url = "http://127.0.0.1:5000/mousetracker/"
            const data = {
                session_id: session_id,
                mousetracker: mousetracker
            }
            axios.post(mt_url, data)
                .then(res => {
                    if(res.status === 201){
                        console.log("[MouseTrackerController] %cMouseTracker data submit successful", `color: ${config.SUCCESS};`)
                    }
                })
                .catch(err => {
                    console.log("[MouseTrackerController] %cMouseTracker data submit failed", `color: ${config.DANGER};`)
                })
        })
    }
}