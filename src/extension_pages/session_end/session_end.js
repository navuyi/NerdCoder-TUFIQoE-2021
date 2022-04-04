const SECRET_PASSWORD = ["cisco", "qoe"] // Yes I know it should not be stored like that in the code but it does not really matter in this case
let USE_PASSWORD = false


chrome.storage.local.get(["SESSION_COUNTER", "EXPERIMENT_TYPE", "SESSION_TYPE"], res => {
    const counter =parseInt( res.SESSION_COUNTER) + 1
    console.log(`counter ${counter}`)

     if(counter === 1){
        console.log("Counter equals to 2. Setting USE_PASSWORD to true")
        USE_PASSWORD = true
        document.getElementById("counter-box").style.display = "none"
        document.getElementById("resume-box").style.display = "flex"
        //document.getElementById("supervisor-call-box").style.display = "unset"
    }

    if(counter >= 2){
        const doneHeader = document.getElementById("done")
        const awaitsHeader = document.getElementById("awaits")
        doneHeader.innerText = "Eksperyment zakończony. Dziękujemy,"
        awaitsHeader.innerText = "Proszę nie wyłączać przeglądarki!"
        document.getElementById("counter").style.display = "none"
        document.getElementById("counter-text").innerText = ""
        chrome.storage.local.set({
            "SESSION_COUNTER": 0
        }, ()=>{
            chrome.runtime.sendMessage({msg: "browser-clear"})
            updateSessionCounterView()
        })
        return // <-- Important return so we do not process further
    }
    else{ //IMPORTANT This 'else' might be confusing but it works properly. It elses only to the 'if' above that checks if experiment should end
        // Incrementing the counter <-- proceeding with experiment, next session
        chrome.storage.local.set({
            SESSION_COUNTER: counter
        }, () => {
            proceed(res.EXPERIMENT_TYPE, res.SESSION_TYPE)
            updateSessionCounterView()
            console.log("Incrementing SESSION_COUNTER state")
        })
    }
})

const doneHeader = document.getElementById("done")
const awaitsHeader = document.getElementById("awaits")
const duration = document.getElementById("session-duration")


function proceed(experiment_type, session_type){
    if(session_type === "training"){
        if(experiment_type === "acr"){
            doneHeader.innerText = "Zakończono: sesja treningowa"
            awaitsHeader.innerText = "Za chwilę: ACR część pierwsza"
            duration.innerText = "Czas trwania: 35 minut"
            runTimer(startMainACR, 15)
        }
    }
    else if(session_type === "main"){
        if(experiment_type === "acr"){
            doneHeader.innerText = "Zakończono: ACR część pierwsza"
            awaitsHeader.innerText = "Za chwilę: ACR część druga"
            duration.innerText = "Czas trwania: 35 minut"
            runTimer(startMainACR, 60) // <-- Most likely there will be prompt waiting for password not the timer
        }
    }
}

function startMainACR(){
    chrome.storage.local.set({
        "SESSION_TYPE": "main",
        "VIDEOS_TYPE": "own", // this is not mandatory
        "EXPERIMENT_TYPE": "acr"
    }, () => {
        chrome.storage.local.get(["SESSION_COUNTER", "LAST_WATCHED_URL"], res => {
            if(parseInt(res.SESSION_COUNTER) === 1){
                resetHistoryStack()
                window.location.href = res.LAST_WATCHED_URL
            }
            else{
                resetHistoryStack()
                window.location.href = "https://youtube.com"
            }
        })
    })
}


function resetHistoryStack(){
    chrome.runtime.sendMessage({
        msg: "reset_history",
        data: true
    })
}


function runTimer(starter, count){
    if(USE_PASSWORD === true){
        document.getElementById("password-input").addEventListener("input", (e) => {
            if(SECRET_PASSWORD.includes(e.target.value)){
                starter() // Immediate session setup and redirecting to youtube after entering the proper password
            }
        })
    }
    else{
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
}

function updateSessionCounterView(){
    chrome.storage.local.get(["SESSION_COUNTER"], res => {
        const counter = res.SESSION_COUNTER.toString()
        document.getElementsByClassName("counter-indicator")[0].innerHTML = counter
    })
}
