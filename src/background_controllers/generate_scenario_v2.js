//const util = require('util') // only in Node

export const generate_scenario_v2 = (first_clean=false, tester_id) => {
    let LOWER_BASKET = [256000, 384000, 512000, 768000]
    let UPPER_BASKET = [1024000, 1536000, 2048000, 3072000, 4096000, 8192000, 16384000, 1000000000]

    let random_bw = []

    for(let i=0; i<3; i++){
        const index_lower = Math.floor(Math.random()*LOWER_BASKET.length)
        const index_upper = Math.floor(Math.random()*UPPER_BASKET.length)

        random_bw.push(LOWER_BASKET[index_lower])
        random_bw.push(UPPER_BASKET[index_upper])

        LOWER_BASKET.splice(index_lower,1)
        UPPER_BASKET.splice(index_upper,1)
    }
    const upper_or_lower = ["lower", "upper"][Math.floor(Math.random()*["lower", "upper"].length)]
    if(upper_or_lower === "lower"){
        random_bw.push(LOWER_BASKET[Math.floor(Math.random()*LOWER_BASKET.length)])
    }
    else if(upper_or_lower === "upper"){
        random_bw.push(UPPER_BASKET[Math.floor(Math.random()*UPPER_BASKET.length)])
    }

    // Generate final scenario
    const scenario = {
        name: "acr_scenario_"+tester_id,
        schedule: []
    }


    if(first_clean === true){
        // Generate 40 minutes scenario with first 5 minutes clean
        for(let trigger=301; trigger<=2401; trigger+=300){
            const index = Math.floor(Math.random()*random_bw.length)
            if(trigger === 2401){
                const schedule = {
                    type: "finish",
                    timeout_s: trigger
                }
                scenario.schedule.push(schedule)
            }
            else{
                const schedule = {
                    type:"throttling",
                    timeout_s: trigger,
                    params: {
                        offline: false,
                        latency: 1,
                        downloadThroughput: random_bw[index],
                        uploadThroughput: 1000000000        // <-- very high value, documentation says that it should be set to -1 to turn off throttling but it did not always work
                    }
                }
                scenario.schedule.push(schedule)
            }
            random_bw.splice(index,1)
        }
    }
    else {
        // Generate 35 minutes scenario with throttling since beginning (1 second)
        for (let trigger = 1; trigger <= 2101; trigger += 300) {
            const index = Math.floor(Math.random() * random_bw.length)
            if (trigger === 2101) {
                const schedule = {
                    type: "finish",
                    timeout_s: trigger
                }
                scenario.schedule.push(schedule)
            } else {
                const schedule = {
                    type: "throttling",
                    timeout_s: trigger,
                    params: {
                        offline: false,
                        latency: 1,
                        downloadThroughput: random_bw[index],
                        uploadThroughput: 1000000000        // <-- very high value, documentation says that it should be set to -1 to turn off throttling but it did not always work
                    }
                }
                scenario.schedule.push(schedule)
            }
            random_bw.splice(index, 1)
        }
    }
    //console.log(util.inspect(scenario, {showHidden: false, depth: null, colors: true}))
    return scenario
}







function test(){
    for (let x=0; x<10000; x++){
        const list = generate_scenario_v2()
        const result = new Set(list).size < list.length
        console.log(list)
    }
}






