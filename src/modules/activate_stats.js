const run_monitor = (nerd_data) =>{
    let data_array = [];
    for(let i=0; i<5; i++){
        const key = nerd_data.item(i).querySelector("div").innerText;
        const val = nerd_data.item(i).querySelector("span").innerText;
        data_array.push({[key]: val});
    }
    console.log(data_array);
    hand_over_data(data_array);
}

const listen_for_exit = () => {
    console.log("SENDING EXIT MESSAGE");
    // Handle tabl close, page refresh, url change
    // NOTICE - this does not work for changing from video to video
    window.onbeforeunload = ()=>{
        chrome.runtime.sendMessage({id: "tab_close"}, ()=>{
            console.log(response);
        })
    }
    // Handle navigating page backward or forward
    window.addEventListener("popstate", ()=>{
        chrome.runtime.sendMessage({id: "forward_backward"}, ()=>{
            console.log(response);
        })
    })
}

const hand_over_data = (data) =>{
    const msg = {
        id: "data",
        data: data
    }
    chrome.runtime.sendMessage(msg, ()=>{
        console.log(response);
    })
}

export const activate_stats = () => {
    // Simulate rightclick on player to show menu list
    const player = document.getElementById("player");
    const player_container_outer = document.getElementById("player-container-outer");
    const player_container_inner = document.getElementById("player-container-inner");
    const player_container = document.getElementById("player-container");
    const ytd_player = document.getElementById("ytd-player");

    // HTML element with id "movie_player" is the element that can be rightclicked in order to show menu list
    const movie_player = document.getElementById("movie_player")


    // Simulate right click on the movie_player element
    var element = movie_player;
    var e = element.ownerDocument.createEvent('MouseEvents');
    e.initMouseEvent('contextmenu', true, true,
        element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
        false, false, false,2, null);
    !element.dispatchEvent(e);


    // Get through all the elements of the menu list and simulate click on the element that activates nerd statistics
    const ytp_popup = document.getElementsByClassName("ytp-popup ytp-contextmenu").item(0);
    const ytp_panel = ytp_popup.children.item(0);
    const ytp_panel_menu = ytp_panel.children.item(0);
    const menu_list = ytp_panel_menu.children;
    const nerd_stats_button = menu_list.item(menu_list.length-1);

    console.log(ytp_popup);
    console.log(ytp_panel);
    console.log(ytp_panel_menu);
    console.log(menu_list);
    console.log(menu_list.length);
    console.log(nerd_stats_button);

    // Now activate the nerd statistics calculations and popup window
    nerd_stats_button.click();

    // nerd_stats is the parent element for the nerd statistics popup window
    const nerd_stats = document.getElementsByClassName("html5-video-info-panel").item(0);
    const nerd_content = document.getElementsByClassName("html5-video-info-panel-content").item(0);
    console.log(nerd_stats);
    console.log(nerd_content);
    //nerd_stats.style.visibility = "hidden";

    // nerd_data is a html element it consist multiple items
    const nerd_data = nerd_content.children;
    console.log(nerd_data);


    // Extract data from the html elements
    const videoId_sCPN = nerd_data.item(0).querySelector("span");
    const viewport_frames = nerd_data.item(1).querySelector("span");
    const current_optimalRes = nerd_data.item(2).querySelector("span");
    const volume_normalized = nerd_data.item(3).querySelector("span");
    const codecs = nerd_data.item(4).querySelector("span");


    listen_for_exit();
    setInterval(run_monitor, 1000, nerd_data);
}