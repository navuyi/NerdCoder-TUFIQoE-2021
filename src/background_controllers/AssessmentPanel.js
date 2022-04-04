import middle_panel from "../assessment_panels/middle_panel";
import {getNerdElements} from "./GetNerdElements";
import interest_assessment_panel from "../assessment_panels/interest_assessment_panel";

var container = undefined
var av_panel = undefined
var av_form = undefined
var int_panel = undefined
var int_form = undefined
var enter_time = undefined


localStorage.setItem("ASSESSMENT_TIME", "false"); // <-- necessary for proper key assessment work
chrome.storage.local.get(["ASSESSMENT_PANEL_OPACITY"], (result) => {
    [container, av_panel, av_form, int_panel, int_form] = middle_panel()

    container.style.opacity = result.ASSESSMENT_PANEL_OPACITY.toString() + "%";
    container.style.visibility = "visible"

    // Interest panel is visible first
    int_panel.style.display = "flex"
    av_panel.style.display = "none"


    // First enter time starts when first panel becomes visible
    enter_time = Date.now()
    av_form.addEventListener('submit', assessment_handover)
    int_form.addEventListener('submit', interest_handover)
    localStorage.setItem("ASSESSMENT_TIME", "true")
})


function assessment_handover(e){
    let time_in_video
    // Prevent default
    e.preventDefault();


    // Calculate how long the assessment panel was visible
    const assessment_duration = Date.now() - enter_time;

    // Get the subject's assessment
    const assessment = av_form.getAttribute("assessment");

    // Get timestamp data
    const timestamp = Date.now();

    // Get other data from nerd statistics
    const [simple, complex] = getNerdElements()
    const mysteryText = simple.mysteryText.querySelector("span").innerText;
    try{
        time_in_video =  mysteryText.match(/t\:([0-9]+\.[0-9]+)/)[1];
    }catch(error){
        time_in_video = null
    }


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
    console.log(message)
    chrome.runtime.sendMessage(message)

    remove_assessment_panel()
}


function interest_handover(e){
    let time_in_video
    // Prevent default
    e.preventDefault();

    // Calculate how long the assessment panel was visible
    const assessment_duration = Date.now() - enter_time;

    // Get the subject's assessment
    const assessment = int_form.getAttribute("assessment")
    //const description = int_form.getAttribute("description") // No description in this version

    // Get timestamp data
    const timestamp = Date.now();

    // Get other data from nerd statistics
    const [simple, complex] = getNerdElements()
    const mysteryText = simple.mysteryText.querySelector("span").innerText;
    try{
        time_in_video =  mysteryText.match(/t\:([0-9]+\.[0-9]+)/)[1];
    }catch(error){
        time_in_video = null
    }

    // Hand over the interest to the background script
    const message = {
        msg: "interest_handover",
        data: {
            assessment: assessment,
            //description: description,
            duration: assessment_duration,
            timestamp: timestamp,
            time_in_video: time_in_video
        }
    }
    console.log(message)
    chrome.runtime.sendMessage(message)


    int_panel.style.display = "none"
    av_panel.style.display = "flex"
    enter_time = Date.now()
}


function remove_assessment_panel(){
    document.getElementById("acr-panel").remove()
    chrome.runtime.sendMessage({msg: "assessment_panel_hidden"})
    localStorage.setItem("ASSESSMENT_TIME", "false")
}


