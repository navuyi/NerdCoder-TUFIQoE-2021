import CONFIG from "../config";
import {remove_assessment_panel} from "../archives/video_assessment";

export default function default_panel(){
    // Create semi-transparent container covering whole screen
    var container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "rgba(34,34,34,1)";
    container.style.zIndex = "2077";
    container.id = "acr-panel";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";
    container.style.visibility = "hidden";

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
    panel.appendChild(form);

    // Create assessment buttons
    for(let i=5; i>=1; i--){
        var button = document.createElement('button');
        button.setAttribute("type", "submit")
        button.setAttribute("assessment", i.toString());
        button.innerText = i.toString();
        button.style.width = "50%";
        button.style.padding = "1em 1em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.border = "none";
        button.style.borderRadius = "0.5em";

        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#8ecccc"})
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke"})
        button.addEventListener("click", (e)=>{
            // Get the selected assessment value
            const assessment = e.target.getAttribute("assessment")
            // Assign the selected assessment value to form's ID
            form.setAttribute("assessment", assessment.toString());
        });
        form.appendChild(button);
    }

    // Add semi-transparent panel to ytd-app element
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    return [container, form];
}