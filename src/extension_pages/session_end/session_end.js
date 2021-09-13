chrome.storage.local.get(["SESSION_COUNTER", "SESSION_TYPE", "VIDEOS_TYPE"], res => {
    const counter =parseInt( res.SESSION_COUNTER) + 1
    if(counter >= 3){
        const doneHeader = document.getElementById("done")
        const awaitsHeader = document.getElementById("awaits")
        doneHeader.innerText = "Eksperyment zakończony"
        awaitsHeader.innerText = "Dziękujemy"
        document.getElementById("counter").style.display = "none"
        document.getElementById("counter-text").innerText = "Wylogowanie nastąpi automatycznie"
        chrome.storage.local.set({
            "SESSION_COUNTER": 0
        }, ()=>{
            setTimeout(() => {
                chrome.runtime.sendMessage({msg: "yt_logout"})
                window.location.href="https://youtube.com"
            }, 3000)
        })
        return // <-- Important return so we do not process further
    }
    else{
     // Incrementing the counter <-- proceeding with experiment, next session
     chrome.storage.local.set({
         SESSION_COUNTER: counter
     }, () => {proceed(res.SESSION_TYPE, res.VIDEOS_TYPE)})
    }
})

function proceed(session_type, video_type){
    console.log(session_type)
    console.log(video_type)
    const doneHeader = document.getElementById("done")
    const awaitsHeader = document.getElementById("awaits")
    if(session_type === "main" && video_type === "own"){
        doneHeader.innerText = "Sesja główna z dowolnością wyboru video zakończona."
        awaitsHeader.innerText = "Sesja główna z narzuconą playlistą rozpocznie za chwilę."
       runTimer(startMainImposed)
    }
    else if(session_type === "main" && video_type === "imposed"){
        doneHeader.innerText = "Sesja główna z przygotowaną playlistą zakończona."
        awaitsHeader.innerText = "Sesja główna z downolnością wyboru video rozpocznie się za chwilę."
        runTimer(startMainOwn)
    }
    else if(session_type === "training"){
        doneHeader.innerText = "Sesja treningowa zakończona"
        // awaits header fill be filled depending on type of session that is about to start (own or imposed)
        startOneOfMain()
    }


}



function startOneOfMain(){
    const list = ["own", "imposed"]
    const choice = list[Math.round(Math.random())] // <-- generates 0 or 1 index
    const awaitsHeader = document.getElementById("awaits")

    if(choice === "own"){
        awaitsHeader.innerText = "Za chwilę rozpocznie się sesja z dowolnością wyboru video. Nastąpi przekierowanie do głównej strony YouTube"
        runTimer(startMainOwn)
    }
    else if(choice === "imposed"){
        awaitsHeader.innerText = "Za chwilę rozpocznie się sesja z narzuconą playlistą. Nastąpi przekierowanie do gotowej playlisty. Proszę nie odtwarzać filmów nie będących częścią playlisty."
        runTimer(startMainImposed)
    }
}


function startMainOwn(){
    chrome.storage.local.set({
        SESSION_TYPE: "main",
        VIDEOS_TYPE: "own"
    }, () => {
        window.location.href = "https://youtube.com"
    })
}

function startMainImposed(){
    chrome.storage.local.set({
        SESSION_TYPE: "main",
        VIDEOS_TYPE: "imposed"
    }, () => {
        // The link below will require a change - final uninteresting video playlist
        window.location.href = "https://www.youtube.com/watch?v=kN5IBFELZLw&list=PLFLuAvmbcaZQa4ekXnAkceJGUCMZyGRLc&index=1"
    })
}


function runTimer(starter){
    let count = 10
    const counter = document.getElementById("counter")
    setInterval(() => {
        if(count === 1){
            counter.innerText = counter
            starter()
            return
        }

        counter.innerText = count
        count -= 1
    }, 1000)
}