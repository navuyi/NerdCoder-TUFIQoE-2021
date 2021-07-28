function middle_panel(){


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
    panel.style.top = "50vh";
    panel.style.transform = "translateY(-25vh)";
    panel.style.display = "flex";
    panel.style.justifyContent = "center";
    panel.style.alignItems = "center";
    panel.style.flexDirection = "column";
    panel.style.padding = "5em 5em";
    panel.style.borderRadius = "1em";
    panel.style.maxWidth = "300px";
    container.appendChild(panel);

    // Create panel header
    var header = document.createElement('h1');
    header.innerText = "Proszę ocenić dotychczasową jakość audio i video";
    header.style.fontSize = "2rem";
    header.style.fontWeight = "400";
    header.style.color = "whitesmoke";
    header.style.textAlign = "center";
    header.style.userSelect = "none";
    panel.appendChild(header);

    // Create form
    var form = document.createElement('form');
    form.style.marginTop = "2em";
    form.style.width = "100%";
    form.style.display = "flex";
    form.style.justifyContent = "center";
    form.style.alignItems = "center";
    form.style.flexDirection = "column";
    panel.appendChild(form);

    // Create assessment buttons
    for(let i=5; i>=1; i--){
        var button = document.createElement('button');
        button.setAttribute("type", "submit");
        button.setAttribute("assessment", i.toString());
        button.id = "assessment-button-"+i.toString();
        button.innerText = i.toString();
        button.style.width = "50%";
        button.style.padding = "1em 1em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.border = "none";
        button.style.borderRadius = "0.5em";
        button.style.cursor = "pointer";

        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#8ecccc";});
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke";});
        button.addEventListener("click", (e)=>{
            // Get the selected assessment value
            const assessment = e.target.getAttribute("assessment");
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
    });

    // Disable video player focus - very important, connected to the key listeners in every assessment_panel script
    // Necessary for normal display mode
    const primary_inner = document.getElementById("primary-inner");
    const player = primary_inner.children[0];
    const all = player.getElementsByTagName("*");

    console.log(all);
    for(let i=0; i<all.length; i++){
        all[i].onfocus = (e) =>{
            e.target.blur();
            console.log(all[i]);
            console.log("Blurring");
        };
    }


    // Disable movie_player and <video> - necessary for theater mode
    const movie_player = document.getElementById("movie_player");
    const video_tag = document.getElementsByTagName("video")[0];

    movie_player.addEventListener('focus', (e)=>{
        e.target.blur();
        console.log("BLUR2");
    });
    video_tag.addEventListener('focus', (e)=>{
        e.target.blur();
        console.log("BLUR3");
    });


    // Add semi-transparent panel to ytd-app element
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    return [container, form];
}

function bottom_panel(){
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
    panel.style.top = "100vh";
    panel.style.transform = "translateY(-20vh)";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.justifyContent = "center";
    panel.style.alignItems = "center";
    panel.style.padding = "2em 5em";
    panel.style.borderRadius = "1em";

    container.appendChild(panel);

    // Create panel header
    var header = document.createElement('h1');
    header.innerText = "Proszę ocenić dotychczasową jakość audio i video";
    header.style.fontSize = "3rem";
    header.style.fontWeight = "400";
    header.style.color = "whitesmoke";
    header.style.textAlign = "center";
    header.style.userSelect = "none";
    panel.appendChild(header);

    // Create form
    var form = document.createElement('form');
    form.style.marginTop = "2em";
    form.style.width = "100%";
    form.style.display = "flex";
    form.style.justifyContent = "space-between";
    form.style.flexDirection = "row";
    panel.appendChild(form);

    // Create assessment buttons
    for(let i=1; i<=5; i++){
        var button = document.createElement('button');
        button.setAttribute("type", "submit");
        button.setAttribute("assessment", i.toString());
        button.id = "assessment-button-"+i.toString();
        button.innerText = i.toString();
        button.style.width = "50%";
        button.style.padding = "1.2em 2em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.border = "none";
        button.style.borderRadius = "0.5em";
        button.style.margin = "0 2em";
        button.style.cursor = "pointer";

        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#8ecccc";});
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke";});
        button.addEventListener("click", (e)=>{
            // Get the selected assessment value
            const assessment = e.target.getAttribute("assessment");
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
    });

    // Disable video player focus - very important, connected to the key listeners in every assessment_panel script
    // Necessary for normal display mode
    const primary_inner = document.getElementById("primary-inner");
    const player = primary_inner.children[0];
    const all = player.getElementsByTagName("*");

    console.log(all);
    for(let i=0; i<all.length; i++){
        all[i].onfocus = (e) =>{
            e.target.blur();
            console.log(all[i]);
            console.log("Blurring");
        };
    }


    // Disable movie_player and <video> - necessary for theater mode
    const movie_player = document.getElementById("movie_player");
    const video_tag = document.getElementsByTagName("video")[0];

    movie_player.addEventListener('focus', (e)=>{
        e.target.blur();
        console.log("BLUR2");
    });
    video_tag.addEventListener('focus', (e)=>{
        e.target.blur();
        console.log("BLUR3");
    });

    // Add semi-transparent panel to ytd-app element
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    return [container, form];
}

function top_panel(){
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
    panel.style.top = "8%";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.justifyContent = "center";
    panel.style.alignItems = "center";
    panel.style.padding = "2em 5em";
    panel.style.borderRadius = "1em";

    container.appendChild(panel);

    // Create panel header
    var header = document.createElement('h1');
    header.innerText = "Proszę ocenić dotychczasową jakość audio i video";
    header.style.fontSize = "3rem";
    header.style.fontWeight = "400";
    header.style.color = "whitesmoke";
    header.style.textAlign = "center";
    header.style.userSelect = "none";
    panel.appendChild(header);

    // Create form
    var form = document.createElement('form');
    form.style.marginTop = "2em";
    form.style.width = "100%";
    form.style.display = "flex";
    form.style.justifyContent = "space-between";
    form.style.flexDirection = "row";
    panel.appendChild(form);

    // Create assessment buttons
    for(let i=1; i<=5; i++){
        var button = document.createElement('button');
        button.setAttribute("type", "submit");
        button.setAttribute("assessment", i.toString());
        button.id = "assessment-button-"+i.toString();
        button.innerText = i.toString();
        button.style.width = "50%";
        button.style.padding = "1.2em 2em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.border = "none";
        button.style.borderRadius = "0.5em";
        button.style.margin = "0 2em";
        button.style.cursor = "pointer";

        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#8ecccc";});
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke";});
        button.addEventListener("click", (e)=>{
            // Get the selected assessment value
            const assessment = e.target.getAttribute("assessment");
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
    });

    // Disable video player focus - very important, connected to the key listeners in every assessment_panel script
    // Necessary for normal display mode
    const primary_inner = document.getElementById("primary-inner");
    const player = primary_inner.children[0];
    const all = player.getElementsByTagName("*");

    console.log(all);
    for(let i=0; i<all.length; i++){
        console.log("ASDASD");
        all[i].onfocus = (e) =>{
            e.target.blur();
            console.log(all[i]);
            console.log("Blurring");
        };
    }


    // Disable movie_player and <video> - necessary for theater mode
    const movie_player = document.getElementById("movie_player");
    const video_tag = document.getElementsByTagName("video")[0];

    movie_player.addEventListener('focus', (e)=>{
        e.target.blur();
        console.log("BLUR2");
    });
    video_tag.addEventListener('focus', (e)=>{
        e.target.blur();
        console.log("BLUR3");
    });

    // Add semi-transparent panel to ytd-app element
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    return [container, form];
}

function getNerdElements(){
    // Simulate rightclick on player to show menu list
    document.getElementById("player");
    document.getElementById("player-container-outer");
    document.getElementById("player-container-inner");
    document.getElementById("player-container");
    document.getElementById("ytd-player");

    // HTML element with id "movie_player" is the element that can be rightclicked in order to show menu list
    const movie_player = document.getElementById("movie_player");


    // Simulate right click on the movie_player element
    var element = movie_player;
    var e = element.ownerDocument.createEvent('MouseEvents');
    e.initMouseEvent('contextmenu', true, true,
        element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
        false, false, false, 2, null);
    !element.dispatchEvent(e);


    // Get through all the elements of the menu list and simulate click on the element that activates nerd statistics
    const ytp_popup = document.getElementsByClassName("ytp-popup ytp-contextmenu").item(0);
    const ytp_panel = ytp_popup.children.item(0);
    const ytp_panel_menu = ytp_panel.children.item(0);
    const menu_list = ytp_panel_menu.children;
    const nerd_stats_button = menu_list.item(menu_list.length - 1);

    /*
    console.log(ytp_popup);
    console.log(ytp_panel);
    console.log(ytp_panel_menu);
    console.log(menu_list);
    console.log(menu_list.length);
    console.log(nerd_stats_button);
     */

    // Now activate the nerd statistics calculations and popup window
    nerd_stats_button.click();

    // nerd_stats is the parent element for the nerd statistics popup window
    const nerd_stats = document.getElementsByClassName("html5-video-info-panel").item(0);
    const nerd_content = document.getElementsByClassName("html5-video-info-panel-content").item(0);

    // nerd_data is a html element, it consist multiple items
    const nerd_data = nerd_content.children;

    // Extract data from the html elements
    const videoId_sCPN = nerd_data.item(0);
    const viewport_frames = nerd_data.item(1);
    const current_optimalRes = nerd_data.item(2);
    const volume_normalized = nerd_data.item(3);
    const codecs = nerd_data.item(4);
    const color = nerd_data.item(6);
    const connectionSpeed = nerd_data.item(8);
    const networkActivity = nerd_data.item(9);
    const bufferHealth = nerd_data.item(10);
    const mysteryText = nerd_data.item(14);

    // Hide the statistics popup by setting opacity to 0 and making unclickable
    chrome.storage.local.get(["DEVELOPER_MODE"], (res) => {
        const dev_mode = res.DEVELOPER_MODE;
        if(dev_mode === true){
            nerd_stats.style.opacity = "100%";
        }
        else if(dev_mode === false){
            nerd_stats.style.opacity = "0%";
            nerd_stats.style.pointerEvents = "none";
        }
    });

    // TAKE NOTE THAT mysteryText is first element in the array
    const nerd_elements_simple = {
        mysteryText: mysteryText,
        videoId_sCPN: videoId_sCPN,
        viewport_frames: viewport_frames,
        current_optimalRes: current_optimalRes,
        volume_normalized: volume_normalized,
        codecs: codecs,
        color: color
    };
    const nerd_elements_complex = {
        connectionSpeed: connectionSpeed,
        networkActivity: networkActivity,
        bufferHealth: bufferHealth
    };
    return [nerd_elements_simple, nerd_elements_complex];
}

var panel = undefined;
var form = undefined;
var enter_time = undefined;

console.log("ASDASDASD ASSESSMENMT PANEL");

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
    console.log(result);

    panel.style.opacity = result.ASSESSMENT_PANEL_OPACITY.toString() + "%";
    panel.style.visibility = "visible";
    enter_time = Date.now();
    form.addEventListener('submit', assessment_handover);
    localStorage.setItem("ASSESSMENT_TIME", "true");
});


function assessment_handover(e){
    let time_in_video;
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
    const [simple, complex] = getNerdElements();
    const mysteryText = simple.mysteryText.querySelector("span").innerText;
    try{
        time_in_video =  mysteryText.match(/t\:([0-9]+\.[0-9]+)/)[1];
    }catch(error){
        time_in_video = null;
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
    };
    console.log(message);
    chrome.runtime.sendMessage(message);
    remove_assessment_panel();
}


function remove_assessment_panel(){
    document.getElementById("acr-panel").remove();
    //chrome.runtime.sendMessage({msg: "assessment_panel_hidden"})
    localStorage.setItem("ASSESSMENT_TIME", "false");
}
