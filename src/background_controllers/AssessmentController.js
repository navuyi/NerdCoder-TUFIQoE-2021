export function AssessmentController(){
    this.isRunning = false
    this.isVisible = false
    this.timeout = undefined
    this.assessmentPanel = undefined
    this.interval = undefined

    this.init = function(tabId){
        if(this.isRunning === true){
            console.log("[AssessmentController] Assessment already running")
            return true
        }

        this.tabId = tabId
        this.isRunning = true
        this.timeout = undefined
        this.initMessenger()
        this.setInterval()
    }


    this.setTimeout = function(){
        chrome.storage.local.get(["EXPERIMENT_MODE"], res => {
            const mode = res.EXPERIMENT_MODE
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], res => {
                    console.log("TIMEOUT " + res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS)
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                })
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=>{
                    console.log("TIMEOUT " + result.ASSESSMENT_INTERVAL_MS)
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.sendMessage(this.tabId, {msg: "show_assessment_panel"})
                    }, result.ASSESSMENT_INTERVAL_MS);
                })
            }
        })
    }

    this.setInterval = function(){
        chrome.storage.local.get(["EXPERIMENT_MODE"], res => {
            const mode = res.EXPERIMENT_MODE
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], res => {
                    console.log("INTERVAL " + res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS)
                    //clearTimeout(this.timeout);
                    this.interval = setInterval(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                })
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=>{
                    console.log("INTERVAL " + result.ASSESSMENT_INTERVAL_MS)
                   // clearTimeout(this.timeout);
                    this.interval = setInterval(()=>{
                        chrome.tabs.executeScript(this.tabId, {file: "background_controllers/AssessmentPanel.js"})
                    }, result.ASSESSMENT_INTERVAL_MS);
                })
            }
        })
    }


    this.initMessenger = function(){
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if(request.msg === "assessment_panel_hidden"){
                this.setTimeout()
            }
        })
    }

    this.remove_assessment_panel = function(){

    }

    this.reset = function(){
        clearInterval(this.interval)
        this.isRunning = false
    }

}