
/*#######################################################################################
#                                                                           R E A D    M E                                                                           #
########################################################################################
                                This script exports a function that is used by the ScheduleController
                                to dynamically generate scenario files for MAIN sessions.

                                It uses esm-seedrandom node module which is compatible with seedrandom
                                I am using esm-seedrandom because of ESM import syntax, seedrandom uses require.

                                Pure javascript Math.random() does not support changing seed.

                                Seed is necessary in this case because we want to generate scenario files dynamically
                                on each session start and we want the scenario file for each subject's "own" and
                                "imposed" sessions the same. Two main sessions.

                                Using subject's ID as a seed. Subject ID is subject's phone number.

######################################################################################## */
import {prng_alea} from "esm-seedrandom";

const QUALITY_CHANGES = 7
const baskets = ["lower", "upper"]

//const LOWER_BASKET = [256000, 384000, 512000, 768000, 1024000, 1546000]                    //IMPORTANT These are the old values
//const UPPER_BASKET = [2048000, 3072000, 4096000, 8192000, 16384000, 1000000000]     //IMPORTANT These are the old values

const LOWER_BASKET = [256000, 384000, 512000, 768000]
const UPPER_BASKET = [1024000, 1536000, 2048000, 3072000, 4096000, 8192000, 16384000, 1000000000]

const TIMEOUTS_S = [1, 300, 600, 900, 1200, 1500, 1800, 2100]                                              // <-- Values in seconds, last one is for scheduling end of session

const random_basket_list = (myrng) => {
    let baskets_random = []
    /*
    for(let i=0; i<QUALITY_CHANGES; i++){
        const random = baskets[Math.floor(myrng()*baskets.length)]
        baskets_random.push(random)
    }

    const all_the_same = baskets_random.every((val, i, arr) => val === arr[0])
    if(all_the_same === true){
        const index = Math.floor(myrng()*baskets_random.length)
        if(baskets_random[index] === "upper"){
            baskets_random[index] = "lower"
        }
        else if(baskets_random[index] === "lower"){
            baskets_random[index] = "upper"
        }
    }
     */

    // Get the initial basket
    const initial = baskets[Math.floor(myrng()*baskets.length)] // <-- random initial basket (lower or upper)
    baskets_random.push(initial)
    // Get rest of the baskets max 3 upper baskets and max 3 lower baskets
    const list = ["lower", "upper", "lower", "upper", "lower", "upper"] // <-- list of 6 baskets to be put in random order
    for(let x=0; x<QUALITY_CHANGES-1; x++){
        const index = Math.floor(myrng()*list.length)
        const random = list[index]
        baskets_random.push(random)
        list.splice(index, 1) // delete basket from list
    }
    console.log(baskets_random)
    return baskets_random
}

const random_bw_list = (basket_list, lower_basket, upper_basket, myrng) => {
    const random_bw_list = []
    basket_list.forEach((basket) => {


        if(basket === "lower" && lower_basket.length > 0){
            const index = Math.floor(myrng()*lower_basket.length)
            const bw = lower_basket[index]
            lower_basket.splice(index, 1)
            random_bw_list.push(bw)
        }
        else if(basket === "upper" && upper_basket.length > 0){
            const index = Math.floor(myrng()*upper_basket.length)
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
export const generate_scenario = (tester_id) => {

    // myrng function will be used instead of Math.random(), reference will be passed to helper methods
    const myrng = prng_alea(tester_id.toString())

    const upper_basket = UPPER_BASKET.slice()
    const lower_basket = LOWER_BASKET.slice()

    const basket_list = random_basket_list(myrng)
    const bw_list = random_bw_list(basket_list, lower_basket, upper_basket, myrng)

    const scenario = {
        name: "main_scenario_"+tester_id,
        schedule: []
    }

    TIMEOUTS_S.forEach((timeout, index) => {
        let schedule = {}

        // Configure last position in schedule <-- the end of session
        if(index === TIMEOUTS_S.length-1){
            schedule.type = "finish",
            schedule.timeout_s = timeout
        }
        // Configure standard position in schedule  <-- network throttling
        else{
            const params = {
                offline: false,
                latency: 1,
                downloadThroughput: bw_list[index],
                uploadThroughput: 1000000000        // <-- very high value, documentation says that it should be set to -1 to turn off throttling but it did not always work
            }
            schedule.type = "throttling",
            schedule.timeout_s = timeout
            schedule.params = params
        }
        scenario.schedule.push(schedule)
    })
    console.log(bw_list)
    console.log(scenario)
    return scenario
}











