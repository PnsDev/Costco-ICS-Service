import 'dotenv/config';

import mongoose from "mongoose";
import EventHolder from "./classes/EventHolder";
import ICSServer from "./classes/ICSServer";
import Scheduler from "./scheduler/Scheduler";

const eventHolder: EventHolder = new EventHolder();
let icsServer: ICSServer;
let mongooseDb: mongoose.Mongoose;
let scheduler: Scheduler;

let failedAttempts = 0;


async function startServer() {
    mongoose.set('strictQuery', true);
    mongooseDb = await mongoose.connect(`${process.env.MONGO_URL}/costco?authSource=admin`);

    icsServer = new ICSServer(eventHolder);

    scheduler = new Scheduler([
        {
            name: "fetchSchedule",
            func: require("./jobs/fetchSchedule").default,
            initialDelay: 1,
            repeatEvery: 21600000,
            errorBehavior: (job) => {
                if (++failedAttempts > 7) {
                    console.log("Too many failed attempts. Shutting down.");
                    process.exit(1);
                }
                // If the job fails, we want to try again in 2 hours
                scheduler.scheduleJob({ ...job, repeatEvery: null, initialDelay: 7200000 });
            },
            endBehavior: (job, res) => {
                failedAttempts = 0;
                scheduler.scheduleJob({
                    name: "dbUpdate",
                    func: require("./jobs/dbUpdate").default,
                    jobVariable: res,
                    endBehavior: () => {
                        scheduler.runJobNow("dbFetch");
                    }
                });
            }
        },
        {
            name: "dbFetch",
            func: require("./jobs/dbFetch").default,
            initialDelay: 1,
            repeatEvery: 43200000,
            jobVariable: {
                eventHolder: eventHolder,
                dataFrom: new Date((new Date().getTime() - 2.628e+9)) // One month ago
            },
            endBehavior: () => { icsServer.startServer() } // Start the server in case it hasn't been started yet (since we don't want to return empty calendars)
        }
    ]);
}

startServer();