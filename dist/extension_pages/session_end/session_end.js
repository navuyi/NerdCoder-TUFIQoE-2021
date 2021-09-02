// TODO Increment session counter
chrome.storage.local.get(["SESSION_COUNTER, SESSION_TYPE, VIDEOS_TYPE"], res => {
    const counter = res.SESSION_COUNTER;
    if(counter >= 3){
        // TODO Finish experiment

        return // <-- Important return so we do not process further
    }
    else {
     // Incrementing the counter <-- proceeding with experiment, next session
     chrome.storage.local.set({
         SESSION_COUNTER: counter+1
     }, () => {proceed(res.SESSION_TYPE, res.VIDEOS_TYPE);});
    }
});

function proceed(session_type, video_type){


}
