function AssessmentController(){
    this.isRunning = false;
    this.isVisible = false;
    this.timeout = undefined;
    this.assessmentPanel = undefined;
    this.INTERVAL = undefined;

    this.init = function(tabId){
        if(this.isRunning === true){
            console.log("[AssessmentController] Assessment already running");
            return true
        }

        chrome.tabs.executeScript(this.tabId, {file: "AssessmentPanel.js"});
        this.tabId = tabId;
        this.isRunning = true;
        this.setTimeout();
    };


    this.setTimeout = function(){
        chrome.storage.local.get(["EXPERIMENT_MODE"], res => {
            const mode = res.EXPERIMENT_MODE;
            if(mode === "training"){
                chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], res => {
                    console.log("TIMEOUT " + res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.sendMessage(this.tabId, {msg: "show_assessment_panel"});
                    }, res.TRAINING_MODE_ASSESSMENT_INTERVAL_MS);
                });
            }
            else if (mode === "main"){
                chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=>{
                    console.log("TIMEOUT " + result.ASSESSMENT_INTERVAL_MS);
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(()=>{
                        chrome.tabs.sendMessage(this.tabId, {msg: "show_assessment_panel"});
                    }, result.ASSESSMENT_INTERVAL_MS);
                });
            }
        });
    };


    this.create_assessment_panel = function(){

    };

    this.remove_assessment_panel = function(){

    };

}

export { AssessmentController };
