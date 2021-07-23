import {getNerdElements} from "./GetNerdElements";
import middle_panel from "../assessment_panels/middle_panel";
import bottom_panel from "../assessment_panels/bottom_panel";
import top_panel from "../assessment_panels/top_panel";
import {get_nerd_elements} from "../modules/get_nerd_elements";


var panel = undefined
var form = undefined
var enter_time = undefined


localStorage.setItem("ASSESSMENT_TIME", "false"); // <-- necessary for proper key assessment work
chrome.storage.local.get(["ASSESSMENT_PANEL_LAYOUT", "ASSESSMENT_PANEL_OPACITY"], (result) => {
    const layout = result.ASSESSMENT_PANEL_LAYOUT;
    switch (layout){
        case "middle":
            [panel, form] = middle_panel();
            break;
        case "bottom":
            [panel, form] = bottom_panel();
            break;
        case "top":
            [panel, form] = top_panel();
            break;
    }
    console.log(result)

    panel.style.opacity = result.ASSESSMENT_PANEL_OPACITY.toString() + "%";
    panel.style.visibility = "visible"
    enter_time = Date.now()
    form.addEventListener('submit', assessment_handover)
})


function assessment_handover(e){
    // Prevent default
    e.preventDefault();

    // Calculate how long the assessment panel was visible
    const assessment_duration = Date.now() - enter_time;

    // Get the subject's assessment
    const assessment = form.getAttribute("assessment");
    console.log(assessment);
    // Get timestamp data
    const timestamp = Date.now();

    // Get other data from nerd statistics
    const [simple, complex] = getNerdElements()
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
    chrome.runtime.sendMessage(message)
    remove_assessment_panel()
}


function remove_assessment_panel(){
    document.getElementById("acr-panel").remove()
    //chrome.runtime.sendMessage({msg: "assessment_panel_hidden"})
}