import 'dotenv/config';

import mongoose from "mongoose";
import EventHolder from "./classes/EventHolder";
import ICSServer from "./classes/ICSServer";
import Scheduler from "./scheduler/Scheduler";
import Logger from './utils/logger';
import {delay} from "./utils/miscUtils";

const eventHolder: EventHolder = new EventHolder();
let icsServer: ICSServer;
let scheduler: Scheduler;

let failedAttempts = 0;

// Define global logger
global.log = new Logger();


async function startServer() {
    mongoose.set('strictQuery', true);

    let runningDBConnect = false;
    while (!runningDBConnect) { // Attempt to keep connecting to db every minute
        try {
            await mongoose.connect(`${process.env.MONGO_URL}/costco?authSource=admin`);
            runningDBConnect = true;
        } catch (e) {
            global.log.warn(e);
            global.log.warn("Trying again in 1 minute...")
            await delay(60000);
        }
    }

    global.log.info('')

    icsServer = new ICSServer(eventHolder);

    scheduler = new Scheduler([
        {
            name: "fetchSchedule",
            func: require("./jobs/fetchSchedule").default,
            initialDelay: 1,
            repeatEvery: 21600000,
            errorBehavior: (job) => {
                if (++failedAttempts > 7) {
                    global.log.warn("Too many failed attempts. Shutting down.");
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
            endBehavior: () => { icsServer.registerICS() } // Start providing calendars (since we don't want to return empty calendars)
        }
    ]);

    // On disconnect from mongodb kill self and wait for restart
    mongoose.connection.on('disconnected', () => process.exit(1));
}

startServer();