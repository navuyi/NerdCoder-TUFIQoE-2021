// Set the default configuration

// Default for assessment panel opacity
chrome.storage.local.get(["ASSESSMENT_PANEL_OPACITY"], (result)=> {
    document.getElementById("opacity-input").value = result.ASSESSMENT_PANEL_OPACITY;
});
// Default for assessment interval
chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=> {
    document.getElementById("interval-input").value = result.ASSESSMENT_INTERVAL_MS;
});
// Default for assessment mode - auto/remote/manual
chrome.storage.local.get(["ASSESSMENT_MODE"], (result)=>{
    const button_id = "mode-"+result.ASSESSMENT_MODE;
    document.getElementById(button_id).setAttribute("active", true);
});
// Default for assessment panel layout
chrome.storage.local.get(["ASSESSMENT_PANEL_LAYOUT"], (result)=>{
    document.getElementById(result.ASSESSMENT_PANEL_LAYOUT).setAttribute("active", true);
});
// Default for database connectioncheck
chrome.storage.local.get(["CONNECTION_CHECK"], (result)=>{
    const check = result.CONNECTION_CHECK;
    const button = document.getElementById("connection-check");
    button.setAttribute("active", check.toString());

    check ? button.innerText="Enabled" : button.innerText="Disabled";
});


// Assessment mode - buttons configuration
const buttons = ["mode-remote", "mode-auto", "mode-manual"];
const handle_mode_change = (e) => {
    // Get id of the clicked button
    const clicked_button_id = e.target.id;
    // Remove active attribute from all buttons
    buttons.forEach((id)=>{
        document.getElementById(id).removeAttribute("active");
    });
    // Set active attribute to last clicked button
    document.getElementById(clicked_button_id).setAttribute("active", true);

    // Change the assessment mode in chrome storage
    const mode = clicked_button_id.match(/mode-([a-zA-Z]+)/)[1];
    chrome.storage.local.set({ASSESSMENT_MODE: mode});
};
// To every mode button attach event listener
buttons.forEach((id, index)=>{
    document.getElementById(id).addEventListener("click", handle_mode_change);
});

// Assessment panel layout
const layout_buttons = ["top", "middle", "bottom"];
const handle_layout_change = (e) => {
    // Get id of the clicked button
    const clicked_button_id = e.target.id;
    // Remove active attribute from all buttons
    layout_buttons.forEach((id)=>{
        document.getElementById(id).removeAttribute("active");
    });
    // Set active attribute to last clicked button
    document.getElementById(clicked_button_id).setAttribute("active", true);

    // Change the assessment mode in chrome storage
    const panel_layout = clicked_button_id;
    chrome.storage.local.set({ASSESSMENT_PANEL_LAYOUT: panel_layout});
};
// To every layout button attach event listener
layout_buttons.forEach((id) => {
    document.getElementById(id).addEventListener("click", handle_layout_change);
});

// Connection control
const conn_control_btn = document.getElementById("connection-check");
const handle_conn_control = (e) => {
    const btn_check = e.target.getAttribute("active");
    let new_check = undefined;
    if(btn_check === "true"){
        new_check = false;
        e.target.innerText = "Disabled";
    }
    else if(btn_check === "false"){
        new_check = true;
        e.target.innerText = "Enabled";
    }
    e.target.setAttribute("active", new_check.toString());
    chrome.storage.local.set({CONNECTION_CHECK: new_check});
};
conn_control_btn.addEventListener("click", handle_conn_control);

// Handle configuration save
document.getElementById("save-button").addEventListener('click', (e)=>{
    // Handle opacity save
    let opacity = document.getElementById("opacity-input").value;
    if(opacity>100){
        opacity=100;
        document.getElementById("opacity-input").value = 100;
    }
    else if(opacity<0){
        opacity = 0;
        document.getElementById("opacity-input").value = 0;
    }

    // Handle interval change
    let interval = document.getElementById("interval-input").value;
    if(interval<0){
        interval = 1000;
        document.getElementById("interval-input").value = 1000;
    }

    const new_config = {
        ASSESSMENT_PANEL_OPACITY: [opacity],
        ASSESSMENT_INTERVAL_MS: [interval]
    };
    chrome.storage.local.set(new_config, ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
});
