import {get_nerd_elements} from "./get_nerd_elements";
import CONFIG from '../config';
import io from "socket.io-client";





export function create_assessment_panel(){
    // Remove any ACR panel if it exists
    remove_assessment_panel();

    // Create semi-transparent container covering whole screen
    var container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "rgba(34,34,34,0.8)";

    container.style.zIndex = "2077";
    container.id = "acr-panel";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";

    // Create panel for ACR scale and header
    var panel = document.createElement('div');
    panel.style.backgroundColor = "rgba(34,34,34,0.9)";
    panel.style.position = "sticky";
    panel.style.top = "200px";
    panel.style.display = "flex"
    panel.style.justifyContent = "center"
    panel.style.alignItems = "center"
    panel.style.flexDirection = "column"
    panel.style.padding = "5em 5em";
    panel.style.borderRadius = "1em";
    panel.style.maxWidth = "300px";

    container.appendChild(panel);

    // Create panel header
    var header = document.createElement('h1');
    header.innerText = "Proszę ocenić dotychczasową jakość audio i video"
    header.style.fontSize = "2rem";
    header.style.fontWeight = "400"
    header.style.color = "whitesmoke";
    header.style.textAlign = "center";
    panel.appendChild(header);

    // Create form
    var form = document.createElement('form');
    form.style.marginTop = "2em";
    form.style.width = "100%";
    form.style.display = "flex";
    form.style.justifyContent = "center"
    form.style.alignItems = "center"
    form.style.flexDirection = "column"
    form.onsubmit = (e) =>{e.preventDefault(); /* nothing else for now*/}
    panel.appendChild(form);

    // Create assessment buttons
    for(let i=5; i>=1; i--){
        var button = document.createElement('button');
        button.setAttribute("type", "submit")
        button.innerText = i.toString();
        button.style.width = "50%";
        button.style.padding = "1em 1em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.border = "none";
        button.style.borderRadius = "0.5em";
        button.id = i.toString()
        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#8ecccc"})
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke"})
        button.addEventListener("click", hand_over_assessment);
        form.appendChild(button);
    }


    // Add semi-transparent panel to ytd-app element and disable rightclicking
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    window.oncontextmenu = (e) => {
        e.preventDefault();
    }
    // Disable scrolling in fullscreen - executes when ACR scale shows up
    document.getElementsByTagName("ytd-app")[0].removeAttribute("scrolling_");

    if(CONFIG.ASSESSMENT_PAUSE){
        // Pause the video player
        document.getElementsByTagName('video')[0].pause();
    }
}

export function remove_assessment_panel(){
    var panel = document.getElementById("acr-panel");
    if(panel){
        panel.remove();
        window.oncontextmenu = (e) => {
            // default behaviour
        }
    }
    if(CONFIG.ASSESSMENT_PAUSE){
        // Resume video
        document.getElementsByTagName('video')[0].play();
    }
}

function hand_over_assessment(e){
    // Get the subject's assessment
    const assessment = e.target.innerText;

    // Get timestamp data
    const timestamp = Date.now();

    // Get other data from nerd statistics
    [simple, complex] = get_nerd_elements();
    const mysteryText = simple.mysteryText.querySelector("span").innerText;
    const time_in_video =  mysteryText.match(/t\:([0-9]+\.[0-9]+)/)[1];


    // Hand over the assessment to the background script
    const message = {
        msg: "assessment_handover",
        data: {
            assessment: assessment,
            timestamp: timestamp,
            time_in_video: time_in_video
        }
    }
    chrome.runtime.sendMessage(message);
    remove_assessment_panel();
}

export function assessment_control_mode(){
    if(CONFIG.ASSESSMENT_MODE === "auto"){
        // Assessment panel is created automatically
        var assessment_controller = setInterval(create_assessment_panel, CONFIG.AUTO_ASSESSMENT_INTERVAL);
    }
    else if(CONFIG.ASSESSMENT_MODE === "remote"){
        // Remote method of controlling assessment panel
        var socket = io.connect("http://localhost:7070", {"forceNew": true});
        console.log(socket.id);

        socket.on("controls", (msg)=>{
            console.log(msg);
            if(msg.order === "create"){
                create_assessment_panel();
            }
            else if(msg.order === "remove"){
                remove_assessment_panel();
            }
        })
    }
    else if(CONFIG.ASSESSMENT_MODE === "manual"){
        // Manual method of controling assessment panel
        remove_assessment_panel();
        document.addEventListener('keydown', (e)=>{
            if(e.key === "o"){
                create_assessment_panel();
            }
            else if(e.key === "p"){
                remove_assessment_panel();
            }
        })
    }
}






