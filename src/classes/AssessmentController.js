import middle_panel from "../assessment_panels/middle_panel";
import top_panel from "../assessment_panels/top_panel";
import bottom_panel from "../assessment_panels/bottom_panel";
import {get_nerd_elements} from "../modules/get_nerd_elements";

import {io} from "../modules/socket-io-client";


export function AssessmentController(mode){
    this.timeout = undefined;
    this.panel = undefined;
    this.form = undefined;
    this.enter_time = undefined;
    this.timeout = undefined;
    this.mode = mode;

    this.create_assessment_panel = function(){

        localStorage.setItem("ASSESSMENT_TIME", "false");

        chrome.storage.local.get(["ASSESSMENT_PANEL_LAYOUT", "ASSESSMENT_PANEL_OPACITY"], (result) => {
            this.remove_assessment_panel();
            const layout = result.ASSESSMENT_PANEL_LAYOUT;
            switch (layout){
                case "middle":
                    [this.panel, this.form] = middle_panel();
                    break;
                case "bottom":
                    [this.panel, this.form] = bottom_panel();
                    break;
                case "top":
                    [this.panel, this.form] = top_panel();
                    break;
            }
            console.log(result)
            this.panel.style.opacity = result.ASSESSMENT_PANEL_OPACITY.toString() + "%";

            this.form.onsubmit = this.hand_over_data.bind(this);                                                            // NOTICE THE BINDING IN THIS LINE //
        })
    }
    this.remove_assessment_panel = function(){
        const panel = document.getElementById("acr-panel");
        if(panel){
            panel.remove();
        }
    }

    this.show_assessment_panel = function(){
        localStorage.setItem("ASSESSMENT_TIME", "true");

        this.enter_time = Date.now();
        this.panel.style.visibility = "visible";
        this.disable_rightclick();
        this.disable_fullscreen_scrolling();
    }

    this.hide_assessment_panel = function(){
        localStorage.setItem("ASSESSMENT_TIME", "false");

        // Hide panel
        this.panel.style.visibility = "hidden";
        this.enable_rightclick();
        // Run another timeout if the mode is set to "auto"
        if(this.mode === "auto"){
            this.run_timeout();
        }
    }

    this.hand_over_data = function(e){
        // Prevent defoult
        e.preventDefault();

        // Calculate how long the assessment panel was visible
        const assessment_duration = Date.now() - this.enter_time;

        // Get the subject's assessment
        const assessment = this.form.getAttribute("assessment");
        console.log(assessment);
        // Get timestamp data
        const timestamp = Date.now();

        // Get other data from nerd statistics
        const [simple, complex] = get_nerd_elements();
        const mysteryText = simple.mysteryText.querySelector("span").innerText;
        const time_in_video =  mysteryText.match(/t\:([0-9]+\.[0-9]+)/)[1];


        // Hand over the assessment to the background script
        const message = {
            msg: "assessment_handover",
            data: {
                assessment: assessment,
                duration: assessment_duration,
                timestamp: timestamp,
                time_in_video: time_in_video
            }
        }
        chrome.runtime.sendMessage(message);
        this.hide_assessment_panel();
    }



    this.init = function(){
        this.create_assessment_panel();
        console.log(this.mode);
        if(this.mode === "auto"){
            // Assessment panel is created automatically
            this.run_timeout();
        }
        else if(this.mode === "remote"){
            // Remote method of controlling assessment panel
            var socket = io.connect("http://localhost:7070", {"forceNew": true});
            socket.on("controls", (msg)=>{
                console.log(msg);
                if(msg.order === "create"){
                    this.show_assessment_panel();
                }
                else if(msg.order === "remove"){
                    this.hide_assessment_panel();
                }
            })
        }
        else if(this.mode === "manual"){
            // Manual method of controling assessment panel
            document.addEventListener('keydown', (e)=>{
                if(e.key === "o"){
                    this.show_assessment_panel();
                }
                else if(e.key === "p"){
                    this.hide_assessment_panel();
                }
            })
        }
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // Remove the assessment panel
            if(request.msg === "stop"){
                clearTimeout(this.timeout);
                this.remove_assessment_panel();
            }
        })
    }
    this.run_timeout = function(){
        chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=>{
            console.log("TIMEOUT")
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.show_assessment_panel.bind(this), result.ASSESSMENT_INTERVAL_MS);
        })
    }

    this.disable_rightclick = function(){
        window.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }
    this.enable_rightclick = function(){
        window.oncontextmenu = (e) => {
            // default behaviour
        }
    }
    this.disable_fullscreen_scrolling = function(){
        // Disable scrolling in fullscreen - executes when ACR scale shows up
        document.getElementsByTagName("ytd-app")[0].removeAttribute("scrolling_");
    }
}