
console.log("ADASD")
chrome.storage.local.get(["ASSESSMENT_PANEL_OPACITY"], (result)=> {
    document.getElementById("opacity-input").value = result.ASSESSMENT_PANEL_OPACITY
})
chrome.storage.local.get(["ASSESSMENT_INTERVAL_MS"], (result)=> {
    document.getElementById("interval-input").value = result.ASSESSMENT_INTERVAL_MS
})



document.getElementById("save-button").addEventListener('click', (e)=>{

    // Handle opacity save
    let opacity = document.getElementById("opacity-input").value;
    if(opacity>100){
        opacity=100;
    }
    else if(opacity<0){
        opacity = 0;
    }

    // Handle interval change
    let interval = document.getElementById("interval-input").value;
    if(interval<0){
        interval = 1000;
    }

    const new_config = {
        ASSESSMENT_PANEL_OPACITY: [opacity],
        ASSESSMENT_INTERVAL_MS: [interval]
    }
    chrome.storage.local.set(new_config, ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
})