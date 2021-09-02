// TODO Increment session counter
chrome.storage.local.get(["SESSION_COUNTER, SESSION_TYPE, VIDEOS_TYPE"], res => {
    const counter = res.SESSION_COUNTER
    if(counter >= 3){
        // TODO Finish experiment

        return // <-- Important return so we do not process further
    }
    else{
     // Incrementing the counter <-- proceeding with experiment, next session
     chrome.storage.local.set({
         SESSION_COUNTER: counter+1
     }, () => {proceed(res.SESSION_TYPE, res.VIDEOS_TYPE)})
    }
})

function proceed(session_type, video_type){
    let text
    if(session_type === "main" && video_type === "own"){
        text = "Sesja główna z dowolnym wyborem wideo zakończona"
        //TODO start imposed
    }
    else if(session_type === "main" && video_type === "imposed"){
        text = "Sesja główna z przygotowaną playlistą zakończona"
        //TODO start main
    }
    else if(session_type === "training"){
        text = "Sesja treningowa zakończona"
        startOneOfMain()
    }


}



function startOneOfMain(){
    const list = ["own", "imposed"]
    const choice = list[Math.round(Math.random())] // <-- generates 0 or 1 index

    if(choice === "own"){
        //TODO start main own session
    }
    else if(choice === "imposed"){
        // TODO start main imposed session
    }
}


function startMainOwn(){

}

function startMainImposed(){

}
