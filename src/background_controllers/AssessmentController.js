import {config} from "../config";

export function AssessmentController(){
    this.isRunning = false
    this.isVisible = false
    this.timeout = undefined
    this.assessmentPanel = undefined
    this.interval = undefined

    this.init = function(tabId){
        if(this.isRunning === true){
            console.log("[AssessmentController] %cAssessment already running", `color: ${config.DANGER}`)
            return true
        }

        this.tabId = tabId
        this.isRunning = true
        this.timeout = undefined
        this.initMessenger()
        //this.setInterval()    <-- //IMPORTANT using setTimeout in order to apply interval delta

        // Checking for experiment type <-- there is no assessment panel in discord mode
        chrome.storage.local.get(["EXPERIMENT_TYPE"], res => {
            const type = res.EXPERIMENT_TYPE
            if(type === "discord"){
                // nothing - there is no assessment panel in discord mode
            }
            else if(type === "acr"){
                chrome.storage.local.get(["SESSION_COUNTER", "SESSION_TYPE"], res => {
                    const counter = parseInt(res.SESSION_COUNTER)
                    const session_type = res.SESSION_TYPE
                    if(counter === 0 && session_type === "training"){
                        const timer_ms = 4 * 60 * 1000  // Different timer than usual
                        chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS", "ASSESSMENT_INTERVAL_DELTA_MS"], res => {
                            console.log(`[AssessmentController] %cAssessment panel interval set to ${timer_ms}. First assessment in first training session (only ACR)`, `color: ${config.INFO};`)
                            clearTimeout(this.timeout);
                            this.timeout = setTimeout(()=>{
                                chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                            }, timer_ms);  // <-- Set to 4 minutes: 4*60*1000
                        })
                    }
                    else{
                        // Proceed with default setTimeout
                        this.setTimeout()
                    }
                })
            }
        })
    }


    this.setTimeout = function(){
        chrome.storage.local.get(["SESSION_TYPE"], res => {
            const mode = res.SESSION_TYPE
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS", "ASSESSMENT_INTERVAL_DELTA_MS"], res => {
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, this.applyDelta(res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS, res.ASSESSMENT_INTERVAL_DELTA_MS));
                })
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS", "ASSESSMENT_INTERVAL_DELTA_MS"], (res)=>{
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, this.applyDelta(res.ASSESSMENT_INTERVAL_MS, res.ASSESSMENT_INTERVAL_DELTA_MS));
                })
            }
        })
    }

    this.setInterval = function(){
        chrome.storage.local.get(["SESSION_TYPE"], res => {
            const mode = res.SESSION_TYPE
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS", "ASSESSMENT_INTERVAL_DELTA_MS"], res => {
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    //clearTimeout(this.timeout);
                    this.interval = setInterval(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                })
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS", "ASSESSMENT_INTERVAL_DELTA_MS"], (res)=>{
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    // clearTimeout(this.timeout);
                    this.interval = setInterval(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.ASSESSMENT_INTERVAL_MS);
                })
            }
        })
    }

    this.applyDelta = function(interval, delta){
        const plus_minus = Math.random() < 0.5 ? -1 : 1
        const val = parseInt(interval)  + parseInt(plus_minus*parseInt(delta))
        console.log(val)
        return val
    }

    this.initMessenger = function(){
        // Listen for messages from assessment panel component
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if(request.msg === "assessment_panel_hidden"){
                this.setTimeout()
            }
        })
    }


    this.reset = function(){
        clearInterval(this.interval)
        clearTimeout(this.timeout)
        this.isRunning = false
    }

}