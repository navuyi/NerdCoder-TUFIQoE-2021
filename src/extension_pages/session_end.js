

chrome.storage.local.get(["SESSION_TYPE", "VIDEOS_TYPE"], res => {
    const session_type = res.SESSION_TYPE
    const video_type = res.VIDEOS_TYPE
    let text
    console.log(session_type)
    console.log(video_type)
    if(session_type === "main" && video_type === "own"){
        text = "Sesja główna z dowolnym wyborem wideo zakończona"
    }
    else if(session_type === "main" && video_type === "imposed"){
        text = "Sesja główna z przygotowaną playlistą zakończona"
    }
    else if(session_type === "training"){
        text = "Sesja treningowa zakończona"
    }

    document.getElementById("header").innerText = text
})

const counter = document.getElementById("counter")
let seconds = 60
counter.innerText = seconds

setInterval(() => {
    if(seconds == 1){
        counter.innerText = " . . . "
        window.location.href = "https://youtube.com"
        return
    }

    seconds -= 1
    counter.innerText = seconds

}, 1000)
