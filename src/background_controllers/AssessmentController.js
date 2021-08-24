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
        this.setInterval()
    }


    this.setTimeout = function(){
        chrome.storage.local.get(["SESSION_TYPE"], res => {
            const mode = res.SESSION_TYPE
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], res => {
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                })
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (res)=>{
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.ASSESSMENT_INTERVAL_MS);
                })
            }
        })
    }

    this.setInterval = function(){
        chrome.storage.local.get(["SESSION_TYPE"], res => {
            const mode = res.SESSION_TYPE
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], res => {
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    //clearTimeout(this.timeout);
                    this.interval = setInterval(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                })
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (res)=>{
                    console.log(`[AssessmentController] %cAssessment panel interval set to ${res.ASSESSMENT_INTERVAL_MS}`, `color: ${config.INFO};`)
                    // clearTimeout(this.timeout);
                    this.interval = setInterval(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.ASSESSMENT_INTERVAL_MS);
                })
            }
        })
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
        this.isRunning = false
    }

}