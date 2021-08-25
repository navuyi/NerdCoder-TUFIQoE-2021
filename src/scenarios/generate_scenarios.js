const util  = require("util")
const fs = require("fs")

const filename_prefix = "scenario_main_"
const filename_ext = ".json"
const ITERATIONS = 100
const QUALITY_CHANGES = 7
const baskets = ["lower", "upper"]

const LOWER_BASKET = [256000, 384000, 512000, 768000, 1024000, 1546000]                    // <-- Values in bps
const UPPER_BASKET = [2048000, 3072000, 4096000, 8192000, 16384000, 1000000000]     // <-- Values in bps
const TIMEOUTS_S = [1, 300, 600, 900, 1200, 1500, 1800, 2100]

const random_basket_list = () => {
    let baskets_random = []

    for(let i=0; i<QUALITY_CHANGES; i++){
        const random = baskets[Math.floor(Math.random()*baskets.length)]
        baskets_random.push(random)
    }

    const all_the_same = baskets_random.every((val, i, arr) => val === arr[0])
    if(all_the_same === true){
        const index = Math.floor(Math.random()*baskets_random.length)
        if(baskets_random[index] === "upper"){
            baskets_random[index] = "lower"
        }
        else if(baskets_random[index] === "lower"){
            baskets_random[index] = "upper"
        }
    }

    return baskets_random
}

const random_bw_list = (basket_list, lower_basket, upper_basket) => {
    const random_bw_list = []
    basket_list.forEach((basket) => {
        if(basket === "lower"){
            const index = Math.floor(Math.random()*lower_basket.length)
            const bw = lower_basket[index]
            lower_basket.splice(index, 1)
            random_bw_list.push(bw)
        }
        else if(basket === "upper"){
            const index = Math.floor(Math.random()*upper_basket.length)
            const bw = upper_basket[index]
            upper_basket.splice(index, 1)
            random_bw_list.push(bw)
        }
    })
    return random_bw_list
}

function padLeadingZeros(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}


// Program main loop
for(let index=0; index<ITERATIONS; index++){
    const upper_basket = UPPER_BASKET.slice()
    const lower_basket = LOWER_BASKET.slice()

    const basket_list = random_basket_list()
    const bw_list = random_bw_list(basket_list, lower_basket, upper_basket)

    const scenario = {
        name: filename_prefix + padLeadingZeros(index+1, 3),
        schedule: [

        ]
    }

    TIMEOUTS_S.forEach((timeout, index) => {
        let schedule = {}

        // Configure last position in schedule
        if(index === TIMEOUTS_S.length-1){
            schedule.type = "finish",
            schedule.timeout_s = timeout
        }
        // Configure standard position in schedule
        else{
            const params = {
                offline: false,
                latency: 1,
                downloadThroughput: bw_list[index],
                uploadThroughput: 1000000000
            }
            schedule.type = "throttling",
            schedule.timeout_s = timeout
            schedule.params = params
        }
        scenario.schedule.push(schedule)
    })

    const jsonContent = JSON.stringify(scenario, null,  4)
    const filename = filename_prefix + padLeadingZeros(index+1, 3) + filename_ext
    fs.writeFile(filename, jsonContent, 'utf-8', err => {
        if(err){
            console.log(err)
        }
    })
}









