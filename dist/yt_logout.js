const avatar_btn = document.getElementById("avatar-btn");
avatar_btn.click(); // <-- Necessary


setTimeout(()=>{
    const elements = document.getElementsByClassName("yt-simple-endpoint style-scope ytd-compact-link-renderer");
    for(let i=0; i<elements.length; i++){

        if(elements[i].getAttribute("href") === "/logout"){
            elements[i].click();
        }
    }
},1000);     // <-- The delay here is necessary because elements are loading asynchronously
