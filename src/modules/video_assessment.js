
export function create_acr_panel(){
    remove_acr_panel();
    // Create semi-transparent container covering whole screen
    var container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "grey";
    container.style.opacity = "70%";
    container.style.zIndex = "2077";
    container.id = "acr-panel";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";

    // Create panel for ACR scale and header
    var panel = document.createElement('div');
    panel.style.backgroundColor = "blue";
    panel.style.position = "sticky";
    panel.style.top = "100px";
    panel.style.display = "flex"
    panel.style.justifyContent = "center"
    panel.style.alignItems = "center"
    panel.style.padding = "5em 5em";

    container.appendChild(panel);

    // Create panel header
    var header = document.createElement('h1');
    header.innerText = "Proszę ocenić jakość video"
    panel.appendChild(header);


    // Add semi-transparent panel to ytd-app element and disable rightclicking
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    window.oncontextmenu = (e) => {
        e.preventDefault();
    }
}

export function remove_acr_panel(){
    var panel = document.getElementById("acr-panel");
    if(panel){
        panel.remove();
        window.oncontextmenu = (e) => {
            // default behaviour
        }
    }
}





