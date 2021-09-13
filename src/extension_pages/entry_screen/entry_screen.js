import generateHash from "../../popup/generate_hash";

const handleSubmit = async (e) => {
    e.preventDefault()
    // Change ID in chrome storage
    const phone_number = document.getElementById("phone-input").value
    const hash = await generateHash(phone_number, 'sha-256')

    chrome.storage.local.set({
        SESSION_TYPE: "training",
        VIDEOS_TYPE: "imposed",
        TESTER_ID: phone_number,
        TESTER_ID_HASH: hash
    }, () => {
        console.log("Setting local storage - Done")
    })

    const TRAINING_VIDEO = "https://www.youtube.com/watch?v=m2RQbSCA7-I"
    const counter = document.getElementById("counter")
    let value = 10
    e.target.style.display = "none"
    document.getElementById("counter-box").style.display = "block"
    counter.style.display = "block"

    setInterval(()=>{
        if(value === 0){
            // redirect to training session video
            chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
                const tabId = tabs[0].id
                chrome.tabs.update(tabId, {url: TRAINING_VIDEO}, ()=>{
                    if(chrome.runtime.lastError){
                        console.log(`[ScheduleController] Error `)
                    }
                })
            })
            return
        }
        counter.innerText = value
        value -= 1
    }, 1000)
}

document.getElementById("form").addEventListener("submit", handleSubmit)
document.getElementById("phone-input").addEventListener("input", (e) => {

    if(isNaN(e.target.value) !== true && e.target.value.length === 9){
        document.getElementById("submit-btn").style.display = "block"
    }else{
        document.getElementById("submit-btn").style.display = "none"
    }
})