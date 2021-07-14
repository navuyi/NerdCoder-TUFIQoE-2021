

export default function top_panel(){
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
    //panel.style.backgroundColor = "rgba(34,34,34,1)";
    panel.style.position = "sticky";
    panel.style.top = "8%"
    panel.style.display = "flex"
    panel.style.flexDirection = "column";
    panel.style.justifyContent = "center"
    panel.style.alignItems = "center"
    panel.style.padding = "2em 5em";
    panel.style.borderRadius = "1em";

    container.appendChild(panel);

    // Create panel header
    var header = document.createElement('h1');
    header.innerText = "Proszę ocenić dotychczasową jakość audio i video"
    header.style.fontSize = "3rem";
    header.style.fontWeight = "400"
    header.style.color = "whitesmoke";
    header.style.textAlign = "center";
    header.style.userSelect = "none";
    panel.appendChild(header);

    // Create form
    var form = document.createElement('form');
    form.style.marginTop = "2em";
    form.style.width = "100%";
    form.style.display = "flex";
    form.style.justifyContent = "space-between"
    form.style.flexDirection = "row"
    panel.appendChild(form);

    // Create assessment buttons
    for(let i=1; i<=5; i++){
        var button = document.createElement('button');
        button.setAttribute("type", "submit")
        button.setAttribute("assessment", i.toString());
        button.innerText = i.toString();
        button.style.width = "50%";
        button.style.padding = "1.2em 2em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.border = "none";
        button.style.borderRadius = "0.5em";
        button.style.margin = "0 2em";
        button.style.cursor = "pointer";

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
// Create key listeners
    document.addEventListener('keydown', (event) => {
        const numericKeycodes = new Set([49, 50, 51, 52, 53]); // Corresponds to 1, 2, 3, 4, 5

        const visible = localStorage.getItem("ASSESSMENT_PANEL_VISIBLE");
        const name = event.key;
        const keyCode = event.keyCode;
        if(visible === "true" && numericKeycodes.has(keyCode)){
            const value = parseInt(name);
            const button = document.getElementById("assessment-button-"+value.toString());
            console.log(localStorage.getItem("ASSESSMENT_TIME"));
            if(localStorage.getItem("ASSESSMENT_TIME") === "true"){
                button.click();
            }

        }

        // Disable video seeking
        if(numericKeycodes.has(event.which)){
            event.stopImmediatePropagation();
        }
    })

    // Disable video player focus - very important, connected to the key listeners in every assessment_panel script
    const primary_inner = document.getElementById("primary-inner");
    const player = primary_inner.children[0];
    const all = player.getElementsByTagName("*");

    for(let i=0; i<all.length; i++){
        all[i].onfocus = (e) =>{
            e.target.blur();
            console.log(all[i])
            console.log("Blurring");
        }
    }

    // Add semi-transparent panel to ytd-app element
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    return [container, form];
}