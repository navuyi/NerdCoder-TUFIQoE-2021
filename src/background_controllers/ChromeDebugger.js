

export function ChromeDebugger(resetSession){
    this.currentTabID = undefined;
    this.isAttached = false;
    this.timoutArray = [];


    this.init = function(tabId){
        if(this.isAttached === true){
            console.log("[ChromeDebugger] Debugger already attached");
            return -1;
        }

        // Attach to the tab
        chrome.debugger.attach({tabId}, "1.3")
        // Establish ondetach event listener
        chrome.debugger.onDetach.addListener((source, reason)=>{
            console.log(`[ChromeDebugger] Detached from tab with ID of: %c${source.tabId}`, "color: #1e90ff; font-weight: bold")
            console.log(`[ChromeDebugger] Reason %c${reason}`, "color: #1e90ff; font-weight: bold")

            this.isAttached = false; // <-- Changing it back to false
        })
        // Enable network
        chrome.debugger.sendCommand({tabId}, "Network.enable");

        this.currentTabID = tabId;
        this.isAttached = true;

        // Load proper network throttling scenario configuration file
        chrome.storage.local.get(["SESSION_TYPE"], (result) =>{
            const mode = result.SESSION_TYPE
            let scenario_file
            if(mode === "training"){
                scenario_file = "training_scenario.json"
            }
            else if(mode === "main"){
                scenario_file = "main_scenario.json"
            }

            // Get the throttling scenario data from main_scenario.json
            const url = chrome.extension.getURL(scenario_file);
            console.log("[BACKGROUND SCRIPT] Fetching "+scenario_file)
            fetch(url)
                .then(res=>res.json())
                .then(data => {
                    //const validate = ajv.compile(schema)
                    //const is_valid = validate(JSON.stringify(data))
                    //console.log(`VALIDITY: ${is_valid}`)

                    this.scheduleThrottling(tabId, data)
                })
        });
    }

    this.bitsToBytes = function(bits){
        return Math.floor(bits/8);
    }

    this.scheduleThrottling = function(tabId, data){
        const scenario = data;

        for(let index in scenario.schedule){
            const plan = scenario.schedule[index];
            if(plan.type === "schedule"){
                this.scheduleNetworkConditions(plan.timeout_s, plan.params, scenario.name, tabId, index);
            }
            else if(plan.type === "finish"){
                this.scheduleSessionFinish(plan.timeout_s)
            }
        }
    }

    this.scheduleNetworkConditions = function(timeout, params, scenarioName, tabId, index){
        params.downloadThroughput = this.bitsToBytes(params.downloadThroughput)
        params.uploadThroughput = this.bitsToBytes(params.uploadThroughput)
        this.timoutArray.push(
            setTimeout(()=>{
                chrome.debugger.sendCommand({tabId}, "Network.emulateNetworkConditions", params, ()=>{
                    if(chrome.runtime.lastError){
                        console.log(`[ChromeDebugger] Tab with ID %c${tabId} is no longer active`, "color: #dc3545; font-weight: bold")
                    }else{
                        chrome.storage.local.set({
                            DOWNLOAD_BANDWIDTH_BYTES: params.downloadThroughput,
                            UPLOAD_BANDWIDTH_BYTES: params.uploadThroughput
                        })
                        console.log(`[ChromeDebugger] Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} B/s started`);
                    }
                })
            }, Math.round(timeout*1000))
        )

        console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} B/s scheduled to be launched in ${timeout} seconds`);
    }

    this.scheduleSessionFinish = function(timeout){
        console.log(`[ChromeDebugger] Scheduling end of session in %c${timeout} seconds`, "color: #dc3545; font-weight: bold")
        setTimeout(() => {
            resetSession()
        }, Math.round(timeout*1000))
    }


    this.reset = function(){
        console.log("[ChromeDebugger] Reseting process...")

        // Detach from current tab  <-- try/catch will not help here - asynchronous API call
        const tabId = this.currentTabID;
        chrome.debugger.detach({tabId}, ()=>{
            if(chrome.runtime.lastError){
                console.log(`[ChromeDebugger] Debugger was not connected to tab with ID of: %c${tabId}`, "color: #1e90ff; font-weight: bold")
            }
            else{
                console.log(`[ChromeDebugger] Detached from tab with ID of:" %c${tabId}`, "color: #1e90ff; font-weight: bold")
                this.isAttached = false
            }
        });

        // Redirect to different page YT main or custom ! ! ! ! !
        const url = chrome.runtime.getURL("extension_pages/session_end.html")
        try{
            chrome.tabs.update(tabId, {url: url}, ()=>{
                if(chrome.runtime.lastError){
                    console.log(`[ChromeDebugger] Error `)
                }
            })
        }catch(err){
            console.log(err);
        }

        // Set ASSESSMENT_RUNNING back to false
        chrome.storage.local.set({ASSESSMENT_RUNNING: false}, ()=>{
            console.log("[ChromeDebugger] ASSESSMENT_RUNNING set to false");
        })

        // Reset timeouts
        for(let index in this.timoutArray){
            clearInterval(this.timoutArray[index])
        }

        // Send stop signal to content script
        chrome.tabs.sendMessage(tabId, {msg: "stop"});
    }
}