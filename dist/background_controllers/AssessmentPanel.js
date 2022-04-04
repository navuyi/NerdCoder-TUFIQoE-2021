function middle_panel(){
    // Create semi-transparent container covering whole screen
    var container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "rgba(34,34,34,0.1)";
    container.style.zIndex = "2077";
    container.id = "acr-panel";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";
    container.style.visibility = "hidden";

    // Create panel for ACR scale
    var av_panel = document.createElement('div');
    av_panel.style.backgroundColor = "rgba(34,34,34,1)";
    av_panel.style.position = "sticky";
    av_panel.style.top = "50vh";
    av_panel.style.transform = "translateY(-25vh)";
    av_panel.style.display = "flex";
    av_panel.style.justifyContent = "center";
    av_panel.style.alignItems = "center";
    av_panel.style.flexDirection = "column";
    av_panel.style.padding = "5em 5em";
    av_panel.style.borderRadius = "1em";
    av_panel.style.maxWidth = "500px";
    container.appendChild(av_panel);

    // Create AV panel header
    var av_header = document.createElement('h1');
    av_header.innerText = "Oceń jakość filmu od strony audio-wizualnej";
    av_header.style.fontSize = "2.5rem";
    av_header.style.fontWeight = "400";
    av_header.style.color = "#6DB1BF";
    av_header.style.textAlign = "center";
    av_header.style.userSelect = "none";
    av_panel.appendChild(av_header);

    // Create form for AV panel
    var av_form = document.createElement('form');
    av_form.style.marginTop = "2em";
    av_form.style.width = "300px";
    av_form.style.display = "flex";
    av_form.style.justifyContent = "center";
    av_form.style.alignItems = "center";
    av_form.style.flexDirection = "column";
    av_panel.appendChild(av_form);

    // Create assessment buttons for AV assessment panel
    var av_descriptions = ["Zła", "Niska", "Przeciętna", "Dobra", "Doskonała"];
    for(let i=5; i>=1; i--){
        var button = document.createElement('button');
        button.setAttribute("type", "submit");
        button.setAttribute("assessment", i.toString());
        button.id = "assessment-button-"+i.toString();
        button.innerText = `${i.toString()}. ${av_descriptions[i-1]}`;
        button.style.width = "60%";
        button.style.padding = "1em 1.5em";
        button.style.margin = "0.5em 0em";
        button.style.fontWeight = "bold";
        button.style.fontSize = "1.5rem";
        button.style.border = "none";
        button.style.textAlign = "left";
        button.style.borderRadius = "0.5em";
        button.style.cursor = "pointer";

        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#6DB1BF";});
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke";});
        button.addEventListener("click", (e)=>{
            // Get the selected assessment value
            const assessment = e.target.getAttribute("assessment");

            // Assign the selected assessment value to form's ID
            av_form.setAttribute("assessment", assessment.toString());
        });
        av_form.appendChild(button);
    }

    // Create panel for interest assessment
    var int_panel = document.createElement('div');
    //int_panel.style.backgroundImage = `linear-gradient(15deg, ${'#5aeee8'}, ${'#16bcea'})`
    int_panel.style.backgroundColor = "rgba(34,34,34,1)";
    int_panel.style.position = "sticky";
    int_panel.style.top = "100vh";
    int_panel.style.transform = "translateY(-25vh)";
    int_panel.style.display = "flex";
    int_panel.style.justifyContent = "center";
    int_panel.style.alignItems = "center";
    int_panel.style.flexDirection = "row";
    int_panel.style.padding = "5em 5em";
    int_panel.style.borderRadius = "1em";
    //int_panel.style.maxWidth = "300px"
    container.appendChild(int_panel);

    // Create box for header and form
    var box = document.createElement("div");
    box.style.display = "flex";
    box.style.flexDirection = "column";



    // Create Interest panel header
    var int_header = document.createElement('h1');
    int_header.innerText = "Na ile interesuje Cię treść?";
    int_header.style.fontSize = "2.5rem";
    int_header.style.fontWeight = "400";
    int_header.style.color = "#F39A9D";
    int_header.style.textAlign = "center";
    int_header.style.userSelect = "none";
    box.appendChild(int_header);

    // Create Interest panel side texts
    var p1 = document.createElement("p");
    p1.innerText = "Nudna";
    var p2 = document.createElement("p");
    p2.innerText = "Interesująca";

    p1.style.color = "white";
    p1.style.fontSize = "2rem";
    p1.style.margin = "0";
    p1.style.marginRight = "2em";
    p1.style.marginTop = "2.3em";
    p1.style.userSelect = "none";

    p2.style.color = "white";
    p2.style.fontSize = "2rem";
    p2.style.margin = "0";
    p2.style.marginLeft = "2em";
    p2.style.marginTop = "2.3em";
    p2.style.userSelect = "none";

    int_panel.appendChild(p1);
    int_panel.appendChild(box);
    int_panel.appendChild(p2);


    // Create FORM for Interest panel
    var int_form = document.createElement('form');
    int_form.style.marginTop = "2em";
    int_form.style.width = "100%";
    int_form.style.display = "flex";
    int_form.style.justifyContent = "center";
    int_form.style.alignItems = "center";
    int_form.style.flexDirection = "row";
    box.appendChild(int_form);





    // Create assessment buttons for Interest assessment panel
    //var descriptions = ["Nudna", "Średnio interesująca", "Interesująca"]
    for(let i=1; i<=5; i++){
        var button = document.createElement('button');
        button.setAttribute("type", "submit");
        button.setAttribute("assessment", i.toString());
        //button.setAttribute("description", descriptions[i-1])
        button.id = "assessment-button-"+i.toString();
        button.innerText = i.toString();
        //button.style.padding = "1.5em 1.5em";
        button.style.width = "50px";
        button.style.height = "50px";
        button.style.margin = "0em 1em";
        button.style.fontWeight = "bold";
        button.fontSize = "1.2rem";
        button.style.border = "none";
        button.style.borderRadius = "50%";
        button.style.cursor = "pointer";

        button.addEventListener("mouseenter", (e)=>{e.target.style.backgroundColor = "#F39A9D";});
        button.addEventListener("mouseleave", (e)=>{e.target.style.backgroundColor = "whitesmoke";});
        button.addEventListener("click", (e)=>{
            // Get the selected assessment value
            const assessment = e.target.getAttribute("assessment");
            //const description = e.target.getAttribute("description")

            // Assign the selected assessment value to form's ID
            int_form.setAttribute("assessment", assessment.toString());
            //int_form.setAttribute("description", description)
        });
        int_form.appendChild(button);
    }



    // Add semi-transparent panel to ytd-app element
    document.getElementsByTagName("ytd-app")[0].appendChild(container);
    return [container, av_panel, av_form, int_panel, int_form];
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

var container = undefined;
var av_panel = undefined;
var av_form = undefined;
var int_panel = undefined;
var int_form = undefined;
var enter_time = undefined;


localStorage.setItem("ASSESSMENT_TIME", "false"); // <-- necessary for proper key assessment work
chrome.storage.local.get(["ASSESSMENT_PANEL_OPACITY"], (result) => {
    [container, av_panel, av_form, int_panel, int_form] = middle_panel();

    container.style.opacity = result.ASSESSMENT_PANEL_OPACITY.toString() + "%";
    container.style.visibility = "visible";

    // Interest panel is visible first
    int_panel.style.display = "flex";
    av_panel.style.display = "none";


    // First enter time starts when first panel becomes visible
    enter_time = Date.now();
    av_form.addEventListener('submit', assessment_handover);
    int_form.addEventListener('submit', interest_handover);
    localStorage.setItem("ASSESSMENT_TIME", "true");
});


function assessment_handover(e){
    let time_in_video;
    // Prevent default
    e.preventDefault();


    // Calculate how long the assessment panel was visible
    const assessment_duration = Date.now() - enter_time;

    // Get the subject's assessment
    const assessment = av_form.getAttribute("assessment");

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


function interest_handover(e){
    let time_in_video;
    // Prevent default
    e.preventDefault();

    // Calculate how long the assessment panel was visible
    const assessment_duration = Date.now() - enter_time;

    // Get the subject's assessment
    const assessment = int_form.getAttribute("assessment");
    //const description = int_form.getAttribute("description") // No description in this version

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
    };
    console.log(message);
    chrome.runtime.sendMessage(message);


    int_panel.style.display = "none";
    av_panel.style.display = "flex";
    enter_time = Date.now();
}


function remove_assessment_panel(){
    document.getElementById("acr-panel").remove();
    chrome.runtime.sendMessage({msg: "assessment_panel_hidden"});
    localStorage.setItem("ASSESSMENT_TIME", "false");
}
