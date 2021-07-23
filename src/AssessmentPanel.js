import middle_panel from "./assessment_panels/middle_panel";
import bottom_panel from "./assessment_panels/bottom_panel";
import top_panel from "./assessment_panels/top_panel";
import {get_nerd_elements} from "./modules/get_nerd_elements";

console.log("ASSESSMENT PANEL")

function AssessmentPanel(){
    this.isVisible = false
    this.panel = undefined
    this.form = undefined
    this.timeout = undefined
    this.enter_time = undefined

    this.init = function(){
        this.create_assessment_panel()
        this.initialize_messenger()
    }

    this.initialize_messenger = function(){
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if(request.msg === "create_assessment_panel"){
                this.create_assessment_panel()
            }
            if(request.msg === "show_assessment_panel"){
                this.show_assessment_panel()
            }
            if(request.msg === "hide_assessment_panel"){
                this.hide_assessment_panel()
            }
        })
    }

    this.create_assessment_panel = function(){
        // Get proper layout information from chrome storage
        chrome.storage.local.get(["ASSESSMENT_PANEL_LAYOUT", "ASSESSMENT_PANEL_OPACITY"], res => {
            const layout = res.ASSESSMENT_PANEL_LAYOUT;
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
            this.panel.style.opacity = res.ASSESSMENT_PANEL_OPACITY.toString() + "%";

            this.form.onsubmit = this.hand_over_data.bind(this);                                                            // NOTICE THE BINDING IN THIS LINE //
        })
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

        //TODO Send message to background script

        console.log("[AssessmentController] Hiding Assessment Panel")
    }

    this.hand_over_data = function(e){
        // Prevent default
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





// Initialize Assessment Panel inside YouTube page
const assessment_panel = new AssessmentPanel()
assessment_panel.init()