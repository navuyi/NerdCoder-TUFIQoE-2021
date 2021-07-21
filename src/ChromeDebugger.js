import con from "./main_scenario.json"
console.log(con);

export function ChromeDebugger(){
    this.currentTabID = undefined;
    this.isAttached = false;
    this.timoutArray = [];


    this.init = function(tabId){
        if(this.isAttached === true){
            console.log("[ChromeDebugger] Debugger already attached");
            return -1;
        }

        // Attach to the tab
        chrome.debugger.attach({tabId}, "1.3");
        // Enable network
        chrome.debugger.sendCommand({tabId}, "Network.enable");

        this.currentTabID = tabId;
        this.isAttached = true;

        // Load proper network throttling scenario configuration file
        chrome.storage.local.get(["EXPERIMENT_MODE"], (result) =>{
            const mode = result.EXPERIMENT_MODE
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
            this.scheduleNetworkConditions(plan.timeout_s, plan.params, scenario.name, tabId, index);
        }
    }

    this.scheduleNetworkConditions = function(timeout, params, scenarioName, tabId, index){
        params.downloadThroughput = this.bitsToBytes(params.downloadThroughput);
        this.timoutArray.push(
            setTimeout(()=>{
                chrome.debugger.sendCommand({tabId}, "Network.emulateNetworkConditions", params, ()=>{
                    console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} B/s started`);
                })
            }, Math.round(timeout*1000))
        )

        console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} B/s scheduled to be launched in ${timeout} seconds`);
    }


    this.reset = function(){
        console.log("[ChromeDebugger] Reseting process...")

        // Detach from current tab
        const tabId = this.currentTabID;
        try{
            chrome.debugger.detach({tabId}, ()=>{
                console.log("[ChromeDebugger] After detaching from tab with ID: " + tabId)
                this.isAttached = false
            });
        }catch(err){
            console.log(err);
        }

        // Redirect to YouTube main page
        try{
            chrome.tabs.update(this.currentTabID, {url: "https://youtube.com"})
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