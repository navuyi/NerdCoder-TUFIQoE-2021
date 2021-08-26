import generateHash from "./generate_hash";




//  //  // Set the default configuration    //  //  //
// Default for main session scenario file ID
chrome.storage.local.get(["MAIN_SCENARIO_ID"], res =>{
    document.getElementById("scenario-id").value = res.MAIN_SCENARIO_ID
})

// Default for tester ID
chrome.storage.local.get(["TESTER_ID", "TESTER_ID_HASH"], (result)=> {
    document.getElementById("tester-id").value = result.TESTER_ID
    document.getElementById("hash").innerHTML = result.TESTER_ID_HASH
})

// Default for assessment panel opacity
chrome.storage.local.get(["ASSESSMENT_PANEL_OPACITY"], (result)=> {
    document.getElementById("opacity-input").value = result.ASSESSMENT_PANEL_OPACITY
})
// Default for assessment interval
chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=> {
    document.getElementById("interval-input").value = result.ASSESSMENT_INTERVAL_MS
})
//Default for training mode assessment interval
chrome.storage.local.get(["TRAINING_MODE_ASSESSMENT_INTERVAL_MS"], (result)=>{
    document.getElementById("training-interval-input").value = result.TRAINING_MODE_ASSESSMENT_INTERVAL_MS
})

// Default for assessment mode - auto/remote/manual
chrome.storage.local.get(["ASSESSMENT_MODE"], (result)=>{
    const button_id = "mode-"+result.ASSESSMENT_MODE;
    document.getElementById(button_id).setAttribute("active", true)
})
// Default for assessment panel layout
chrome.storage.local.get(["ASSESSMENT_PANEL_LAYOUT"], (result)=>{
    document.getElementById(result.ASSESSMENT_PANEL_LAYOUT).setAttribute("active", true);
})
// Default for database connectioncheck
chrome.storage.local.get(["DEVELOPER_MODE"], (result)=>{
    const dev_mode = result.DEVELOPER_MODE
    const button = document.getElementById("dev-mode")
    button.setAttribute("active", dev_mode.toString());

    dev_mode ? button.innerText="Enabled" : button.innerText="Disabled"
})
// Default for experiment mode
chrome.storage.local.get(["SESSION_TYPE"], (result) => {
    const mode = result.SESSION_TYPE
    if(mode === "main"){
        document.getElementById("mode-m-btn").setAttribute("active", "true")
    }
    else if(mode === "training"){
        document.getElementById("mode-t-btn").setAttribute("active", "true")
    }
})
// Default for videos type
chrome.storage.local.get(["VIDEOS_TYPE"], result => {
    const type = result.VIDEOS_TYPE
    if(type === "own"){
        document.getElementById("video-type-own").setAttribute("active", "true")
    }
    else if(type === "imposed"){
        document.getElementById("video-type-imposed").setAttribute("active", "true")
    }
})


// Assessment mode - buttons configuration
const buttons = ["mode-remote", "mode-auto", "mode-manual"];
const handle_mode_change = (e) => {
    // Get id of the clicked button
    const clicked_button_id = e.target.id;
    // Remove active attribute from all buttons
    buttons.forEach((id)=>{
        document.getElementById(id).removeAttribute("active");
    })
    // Set active attribute to last clicked button
    document.getElementById(clicked_button_id).setAttribute("active", true);

    // Change the assessment mode in chrome storage
    const mode = clicked_button_id.match(/mode-([a-zA-Z]+)/)[1]
    chrome.storage.local.set({ASSESSMENT_MODE: mode});
}
// To every mode button attach event listener
buttons.forEach((id, index)=>{
    document.getElementById(id).addEventListener("click", handle_mode_change);
})

// Assessment panel layout
const layout_buttons = ["top", "middle", "bottom"];
const handle_layout_change = (e) => {
    // Get id of the clicked button
    const clicked_button_id = e.target.id;
    // Remove active attribute from all buttons
    layout_buttons.forEach((id)=>{
        document.getElementById(id).removeAttribute("active");
    })
    // Set active attribute to last clicked button
    document.getElementById(clicked_button_id).setAttribute("active", true);

    // Change the assessment mode in chrome storage
    const panel_layout = clicked_button_id;
    chrome.storage.local.set({ASSESSMENT_PANEL_LAYOUT: panel_layout});
}
// To every layout button attach event listener
layout_buttons.forEach((id) => {
    document.getElementById(id).addEventListener("click", handle_layout_change)
})

// Connection control
const dev_mode_btn = document.getElementById("dev-mode")
const handle_dev_mode = (e) => {
    const variant = e.target.getAttribute("active");
    let new_variant = undefined;
    if(variant === "true"){
        new_variant = false;
        e.target.innerText = "Disabled"
    }
    else if(variant === "false"){
        new_variant = true;
        e.target.innerText = "Enabled"
    }
    e.target.setAttribute("active", new_variant.toString());
    chrome.storage.local.set({DEVELOPER_MODE: new_variant});
}
dev_mode_btn.addEventListener("click", handle_dev_mode);


// Experiment session - main/training
document.getElementById("mode-t-btn").addEventListener("click", (e)=>{
    // Remove active attribute from the other button
    document.getElementById("mode-m-btn").removeAttribute("active");

    // Set active attribute to the clicked button
    e.target.setAttribute("active", "true");

    // Update storage
    chrome.storage.local.set({"SESSION_TYPE": "training"})
})
document.getElementById("mode-m-btn").addEventListener("click", (e)=>{
    // Remove active attribute from the other button
    document.getElementById("mode-t-btn").removeAttribute("active");

    // Set active attribute to the clicked button
    e.target.setAttribute("active", "true");

    // Update storage
    chrome.storage.local.set({"SESSION_TYPE": "main"})
})

// Videos type - own/imposed
document.getElementById("video-type-imposed").addEventListener("click", (e) => {
    // Remove active attribute from the other button
    document.getElementById("video-type-own").removeAttribute("active")

    // Set active attribute to the clicked button
    e.target.setAttribute("active", "true")

    // Update storage
    chrome.storage.local.set({"VIDEOS_TYPE": "imposed"})
})
document.getElementById("video-type-own").addEventListener("click", (e) => {
    // Remove active attribute from the other button
    document.getElementById("video-type-imposed").removeAttribute("active")

    // Set active attribute to the clicked button
    e.target.setAttribute("active", "true")

    // Update storage
    chrome.storage.local.set({"VIDEOS_TYPE": "own"})
})

// Tester ID - hash generation
document.getElementById("tester-id").addEventListener("input", async (e) => {
    // Remove whitespaces ! ! ! IMPORTANT
    e.target.value = e.target.value.replace(/\s/g, "")

    // Update frontend
    const hashHex = await generateHash(e.target.value, "sha-256")
    document.getElementById("hash").innerHTML = hashHex

    // Update storage
    chrome.storage.local.set({
        TESTER_ID: e.target.value,
        TESTER_ID_HASH: hashHex,
    })
})

// Main session scenario file
document.getElementById("scenario-id").addEventListener("input", (e) => {
    let value = e.target.value
    e.target.value = value
    chrome.storage.local.set({MAIN_SCENARIO_ID: value})
})


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

    // Handle main interval change
    let interval = document.getElementById("interval-input").value;
    if(interval<0){
        interval = 1000;
        document.getElementById("interval-input").value = t_interval;
    }

    // Handle training interval change
    let t_interval = document.getElementById("training-interval-input").value;
    if(t_interval < 0){
        t_interval = 1000;
        document.getElementById("training-interval-input").value = t_interval;
    }

    const new_config = {
        ASSESSMENT_PANEL_OPACITY: opacity,
        ASSESSMENT_INTERVAL_MS: interval,
        TRAINING_MODE_ASSESSMENT_INTERVAL_MS: t_interval,
    }
    // Update storage
    chrome.storage.local.set(new_config, ()=>{
        // Refresh page
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
})



document.getElementById("reset-button").onclick = ()=>{
    const result = window.confirm("Are you sure?")
    console.log(result);
    // Send message to background script to reset
    if(result === true){
        chrome.runtime.sendMessage({msg: "RESET"});
    }
}

