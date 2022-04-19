import generateHash from "../../popup/generate_hash";




// Setting counter to 0 just in case
chrome.storage.local.set({"SESSION_COUNTER": 0}) //IMPORTANT
chrome.runtime.sendMessage({msg: "browser-clear"})

// Update view counter indicator
chrome.storage.local.get(["SESSION_COUNTER"], res => {
    const counter = res.SESSION_COUNTER.toString()
    document.getElementsByClassName("counter-indicator")[0].innerHTML = counter
})


const eyesight_input = document.getElementById("eyesight-input")
const age_input = document.getElementById("age-input")
const sex_select = document.getElementById("sex-select")

// Fill form fields with default values
chrome.storage.local.get([
    "TESTER_EYESIGHT_TEST_RESULT",
    "TESTER_SEX",
    "TESTER_AGE"
], res => {
    //eyesight_input.value = res.TESTER_EYESIGHT_TEST_RESULT
    //sex_select.value = res.TESTER_SEX
    //age_input.value = res.TESTER_AGE
})


const handleSubmit = async (e) => {
    e.preventDefault()
    const phone_number = document.getElementById("phone-input").value
    const tester_eyesight_test_result = eyesight_input.value
    const tester_age = age_input.value
    const tester_sex = sex_select.value

    console.log(tester_eyesight_test_result)
    console.log(tester_age)
    console.log(tester_sex)

    // Check if data is valid
    if(isNaN(phone_number) === true){
        return
    }
    if(phone_number < 9){
        return
    }

    // Change ID in chrome storage
    const hash = await generateHash(phone_number, 'sha-256')

    // Pick experiment type randomly
    const list = ["acr", "discord"]
    //const type = list[Math.round(Math.random())]
    const type = "acr"  // In this version (v4) there is only ACR mode

    chrome.storage.local.set({
        SESSION_TYPE: "main",
        EXPERIMENT_TYPE: type, //TODO this value shall be picked randomly
        VIDEOS_TYPE: "own",         // videos are always own in this version
        TESTER_ID: phone_number,
        TESTER_ID_HASH: hash,
        TESTER_EYESIGHT_TEST_RESULT: tester_eyesight_test_result,
        TESTER_SEX: tester_sex,
        TESTER_AGE: tester_age
    }, () => {
        chrome.storage.local.get(["TESTER_EYESIGHT_TEST_RESULT", "TESTER_SEX", "TESTER_AGE"], res=>console.log(res))
        console.log("Setting local storage - Done")
        // Set up proper header
        const header = document.getElementById("title")
        if(type === "acr"){
            header.innerText = "Eksperyment rozpocznie się za chwilę"
        }
        else if(type === "discord"){
            header.innerText = "Sesja treningowa z wykorzystaniem aplikacji Discord rozpocznie się za chwilę."
        }
    })

    //const TRAINING_VIDEO = "https://www.youtube.com/watch?v=m2RQbSCA7-I"
    const REDIRECT_URL = "https://www.youtube.com"
    const counter = document.getElementById("counter")
    let value = 10 //TODO CHANGE IT TO LARGER VALUE
    e.target.style.display = "none"
    document.getElementById("counter-box").style.display = "block"
    counter.style.display = "block"


    setInterval(()=>{
        if(value === 0){
            // redirect to training session video
            chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
                const tabId = tabs[0].id
                chrome.runtime.sendMessage({
                    msg: "reset_history",
                    data: true
                })
                chrome.tabs.update(tabId, {url: REDIRECT_URL}, ()=>{
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