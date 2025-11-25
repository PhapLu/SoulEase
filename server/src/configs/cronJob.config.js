import cron from 'node-cron'
// import { autoFinishOrders } from '../automation/order/finishOrder.automation.js'
// import { autoResetCharacterDailyMissions } from '../automation/character/dailyMission.automation.js'

// Define all cron jobs in one place
const cronJobs = [
    // {
    //     name: 'Auto Reset Character Daily Missions',
    //     schedule: '59 23 * * *', // 23:59 daily
    //     task: autoResetCharacterDailyMissions,
    // },
]

// Register each cron job dynamically
cronJobs.forEach(({ name, schedule, task, timezone }) => {
    cron.schedule(
        schedule,
        async () => {
            console.log(`[${new Date().toISOString()}] Running cron job: ${name}`)
            try {
                await task()
            } catch (error) {
                console.error(`Error in cron job: ${name}`, error)
            }
        },
        {
            timezone, // apply timezone if defined
        }
    )
})

export default cronJobs
