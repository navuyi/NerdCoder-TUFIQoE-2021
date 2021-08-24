import axios from "axios";
import {config} from "../config";

export function ScheduleController(resetSession){
    this.currentTabID = undefined;
    this.isAttached = false;
    this.timoutArray = [];


    this.init = function(tabId){
        if(this.isAttached === true){
            console.log("[ScheduleController] Debugger already attached", `color: ${config.DANGER}`);
            return -1;
        }

        // Attach to the tab
        chrome.debugger.attach({tabId}, "1.3")
        // Establish ondetach event listener
        chrome.debugger.onDetach.addListener((source, reason)=>{
            console.log(`[ScheduleController] %cDebugger detached from tab with ID of: ${source.tabId}`, `color: ${config.SUCCESS}; font-weight: bold`)
            console.log(`[ScheduleController] %cReason ${reason}`, `color: ${config.SUCCESS}; font-weight: bold`)

            this.isAttached = false; // <-- Changing it back to false
        })
        // Enable network
        chrome.debugger.sendCommand({tabId}, "Network.enable");

        this.currentTabID = tabId;
        this.isAttached = true;

        // Load proper network throttling scenario configuration file
        chrome.storage.local.get(["SESSION_TYPE", "VIDEOS_TYPE"], (res) =>{
            const session_type = res.SESSION_TYPE
            const video_type = res.VIDEOS_TYPE
            let scenario_file

            if(session_type === "main" && video_type === "own"){
                scenario_file = "scenario_main_own.json"
            }
            else if(session_type === "main" && video_type === "imposed"){
                scenario_file = "scenario_main_imposed.json"
            }
            else if(session_type === "training"){
                scenario_file = "scenario_training.json"
            }

            // Get the throttling scenario data from main_scenario.json
            const url = chrome.extension.getURL(scenario_file);
            console.log(`[ScheduleController] %cFetching file: ${scenario_file}`, `color: ${config.SUCCESS}`)
            axios.get(url).then(res => {
                this.scheduleThrottling(tabId, res.data)
                setTimeout(()=>{
                    this.submitSchedule(res.data)
                }, 5000)
            }).catch(err => {console.log(err)})

        });
    }

    this.bitsToBytes = function(bits){
        return Math.floor(bits/8);
    }

    this.scheduleThrottling = function(tabId, data){
        const scenario = data;

        for(let index in scenario.schedule){
            const plan = scenario.schedule[index];
            if(plan.type === "throttling"){
                this.scheduleNetworkConditions(plan.timeout_s, plan.params, scenario.name, tabId, index);
            }
            else if(plan.type === "finish"){
                this.scheduleSessionFinish(plan.timeout_s)
            }
        }
    }

    this.submitSchedule = function(schedule){
        chrome.storage.local.get(["SESSION_ID"], res => {
            const url = "http://127.0.0.1:5000/schedule/"
            const session_id = res.SESSION_ID
            schedule.session_id = session_id
            console.log(schedule)
            axios.post(url, schedule)
                .then(res => {
                    if(res && res.status === 201)
                        console.log("[ScheduleController] %cSchedule data submitted successfully", `color: ${config.SUCCESS}`)
                })
                .catch(err => {
                    if(err.response && err.response.status){
                        console.log(err.response)
                    }
                })
        })
    }

    this.scheduleNetworkConditions = function(timeout, params, scenarioName, tabId, index){
        params.downloadThroughput = this.bitsToBytes(params.downloadThroughput)
        params.uploadThroughput = this.bitsToBytes(params.uploadThroughput)
        this.timoutArray.push(
            setTimeout(()=>{
                chrome.debugger.sendCommand({tabId}, "Network.emulateNetworkConditions", params, ()=>{
                    if(chrome.runtime.lastError){
                    console.log(`[ScheduleController] %cTab with ID ${tabId} is no longer active`, `color: ${config.DANGER}; font-weight: bold`)
                    }else{
                        chrome.storage.local.set({
                            DOWNLOAD_BANDWIDTH_BYTES: params.downloadThroughput,
                            UPLOAD_BANDWIDTH_BYTES: params.uploadThroughput
                        })
                        console.log(`[ScheduleController] %c Scenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} B/s started`, `color: ${config.INFO}`);
                    }
                })
            }, Math.round(timeout*1000))
        )

        console.log(`[ScheduleController] %cScenario [${scenarioName}]. Configuration with throughput: ${params.downloadThroughput} B/s scheduled to be launched in ${timeout} seconds` , `color: ${config.INFO}`);
    }

    this.scheduleSessionFinish = function(timeout){
        console.log(`[ScheduleController] %cScheduling end of session in %c${timeout} seconds`, `color: ${config.INFO}; font-weight: bold`)
        setTimeout(() => {
            resetSession()
        }, Math.round(timeout*1000))
    }


    this.reset = function(){
        console.log("[ScheduleController] %cReseting process...", `color: ${config.WARNING}`)

        // Detach from current tab  <-- try/catch will not help here - asynchronous API call
        const tabId = this.currentTabID;
        chrome.debugger.detach({tabId}, ()=>{
            if(chrome.runtime.lastError){
                console.log(`[ScheduleController] %cDebugger was not connected to tab with ID of: ${tabId}`, `color: ${config.DANGER}; font-weight: bold`)
            }
            else{
                console.log(`[ScheduleController] %cDetached from tab with ID of:" ${tabId}`, `color: ${config.WARNING}; font-weight: bold`)
                this.isAttached = false
            }
        });

        // Redirect to different page YT main or custom ! ! ! ! !
        const url = chrome.runtime.getURL("extension_pages/session_end.html")
        try{
            chrome.tabs.update(tabId, {url: url}, ()=>{
                if(chrome.runtime.lastError){
                    console.log(`[ScheduleController] Error `)
                }
            })
        }catch(err){
            console.log(err);
        }

        // Set ASSESSMENT_RUNNING back to false
        chrome.storage.local.set({ASSESSMENT_RUNNING: false}, ()=>{
            console.log("[ScheduleController] %cASSESSMENT_RUNNING set to false", `color: ${config.SUCCESS}`);
        })

        // Reset timeouts
        for(let index in this.timoutArray){
            clearInterval(this.timoutArray[index])
        }

        // Send stop signal to content script
        chrome.tabs.sendMessage(tabId, {msg: "stop"});
    }
}