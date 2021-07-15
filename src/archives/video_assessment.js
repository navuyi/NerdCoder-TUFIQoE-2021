import {get_nerd_elements} from "../modules/get_nerd_elements";

// The import below is important!!!
// Importing {io} module directly from node_modules directory causes errors and problems with proper script execution
import {io} from '../modules/socket-io-client';

var enter_time = 0;
var assessment_timeout;


export function create_assessment_panel(){
    // Remove any ACR panel if it exists
    remove_assessment_panel();

    // Get current UTC time
    enter_time = Date.now();

    // Create semi-transparent container covering whole screen
    var container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "rgba(34,34,34,1)";
    chrome.storage.local.get(["ASSESSMENT_PANEL_OPACITY"], (result)=>{
        container.style.opacity = result.ASSESSMENT_PANEL_OPACITY.toString() + "%";
    })
    container.style.zIndex = "2077";
    container.id = "acr-panel";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";

    // Create panel for ACR scale and header
    var panel = document.createElement('div');
    panel.style.backgroundColor = "rgba(34,34,34,1)";
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
    const panel = document.getElementById("acr-panel");
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
    // Calculate how long the assessment panel was visible
    const assessment_duration = Date.now() - enter_time;

    // Get the subject's assessment
    const assessment = e.target.innerText;

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
    remove_assessment_panel();
    run_assessment_timeout();
}

export function init_assessment_controller(mode){
    console.log("THIS IS MODE "+mode);
    if(mode == "auto"){
        // Assessment panel is created automatically
        run_assessment_timeout();
    }
    else if(mode == "remote"){
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
    else if(mode == "manual"){
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

function run_assessment_timeout(){
    chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=>{
        console.log("TIMEOUT")
        clearTimeout(assessment_timeout);
        assessment_timeout = setTimeout(create_assessment_panel, result.ASSESSMENT_INTERVAL_MS);
    })
}