
///////////////////////////////////////////// Throttling Section ///////////////////////////////////////////////////////
localStorage.setItem("session_started", "false");

const bitsToBytes = (bits) => {
    return Math.floor(bits/8);
}



async function debuggerInit(tabId){
    // Implement method for reseting debugger_running option ! !
    // Manually - reload extension
    if(localStorage.getItem("session_started") === "false"){
        // Attach to the tab
        await chrome.debugger.attach({tabId}, "1.3");
        // Enable network
        await chrome.debugger.sendCommand({tabId}, "Network.enable");

        localStorage.setItem("session_started", "true");


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
                    scheduleThrottling(tabId, data)
                })
        });
    }
}

function scheduleThrottling(tabId, data){
    const scenario = data;
    console.log(scenario);

    for(let index in scenario.schedule){
        const plan = scenario.schedule[index];
        scheduleNetworkConditions(plan.timeout_s, plan.params, scenario.name, tabId, index);
    }
}

function scheduleNetworkConditions(timeout, params, scenarioName, tabId, index){
    params.downloadThroughput = bitsToBytes(params.downloadThroughput);
    console.log(params);
    setTimeout(()=>{
        chrome.debugger.sendCommand({tabId}, "Network.emulateNetworkConditions", params, ()=>{
            console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} started`);
        })
    }, Math.round(timeout*1000))
    console.log(`Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} scheduled to be launched in ${timeout} seconds`);
}
