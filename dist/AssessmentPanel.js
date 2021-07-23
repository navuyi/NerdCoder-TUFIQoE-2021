import { g as get_nerd_elements } from './get_nerd_elements-15f30bc3.js';

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

console.log("ASSESSMENT PANEL");

function AssessmentPanel(){
    this.isVisible = false;
    this.panel = undefined;
    this.form = undefined;
    this.timeout = undefined;
    this.enter_time = undefined;

    this.init = function(){
        this.create_assessment_panel();
        this.initialize_messenger();
    };

    this.initialize_messenger = function(){
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if(request.msg === "create_assessment_panel"){
                this.create_assessment_panel();
            }
            if(request.msg === "show_assessment_panel"){
                this.show_assessment_panel();
            }
            if(request.msg === "hide_assessment_panel"){
                this.hide_assessment_panel();
            }
        });
    };

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
        });
    };

    this.show_assessment_panel = function(){
        localStorage.setItem("ASSESSMENT_TIME", "true");

        this.enter_time = Date.now();
        this.panel.style.visibility = "visible";
        this.disable_rightclick();
        this.disable_fullscreen_scrolling();
    };

    this.hide_assessment_panel = function(){
        localStorage.setItem("ASSESSMENT_TIME", "false");

        // Hide panel
        this.panel.style.visibility = "hidden";
        this.enable_rightclick();

        //TODO Send message to background script

        console.log("[AssessmentController] Hiding Assessment Panel");
    };

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
        };
        chrome.runtime.sendMessage(message);
        this.hide_assessment_panel();
    };

    this.disable_rightclick = function(){
        window.oncontextmenu = (e) => {
            e.preventDefault();
        };
    };
    this.enable_rightclick = function(){
        window.oncontextmenu = (e) => {
            // default behaviour
        };
    };
    this.disable_fullscreen_scrolling = function(){
        // Disable scrolling in fullscreen - executes when ACR scale shows up
        document.getElementsByTagName("ytd-app")[0].removeAttribute("scrolling_");
    };
}





// Initialize Assessment Panel inside YouTube page
const assessment_panel = new AssessmentPanel();
assessment_panel.init();
