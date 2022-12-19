import 'dotenv/config'

import mongoose from "mongoose";
import EventHolder from "./classes/EventHolder";
import ICSServer from "./classes/ICSServer";
import Scheduler from "./scheduler/Scheduler";
import path from "path";

const eventHolder: EventHolder = new EventHolder();
let icsServer: ICSServer;
let mongooseDb: mongoose.Mongoose;
let scheduler: Scheduler;


async function startServer() {
    mongooseDb = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`Connected to database!`);


    icsServer = new ICSServer(eventHolder);
    

    scheduler = new Scheduler([
        {
            name: "fetchSchedule",
            path: path.join(__dirname, "jobs", "fetchSchedule.ts"),
			endBehavior: (job, res) => {
				console.log(res);
			}
        },
    ]);
}

startServer();