import CONFIG from "../config"

export function get_nerd_elements(){
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
    if(CONFIG.MODE === "development"){
        nerd_stats.style.opacity = "55%";
    }
    else if(CONFIG.MODE === "production"){
        nerd_stats.style.opacity = "0%";
        nerd_stats.style.pointerEvents = "none";
    }


    // TAKE NOTE THAT mysteryText is first element in the array
    const nerd_elements_simple = [
        {mysteryText: mysteryText},
        {videoId_sCPN: videoId_sCPN},
        {viewport_frames: viewport_frames},
        {current_optimalRes: current_optimalRes},
        {volume_normalized: volume_normalized},
        {codecs: codecs},
        {color: color}
    ]
    const nerd_elements_complex = [
        {connectionSpeed: connectionSpeed},
        {networkActivity: networkActivity},
        {bufferHealth: bufferHealth}
    ]
    return [nerd_elements_simple, nerd_elements_complex];
}