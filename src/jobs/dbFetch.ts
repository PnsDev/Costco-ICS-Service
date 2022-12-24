import EventHolder from "../classes/EventHolder";
import scheduledDate from "../schemas/scheduledDate";
import { eventsFromDBArray } from "../utils/miscUtils";

export default async function job(jobData: dbFetchData) {
    // This is a very simple job that just fetches data from the database and passes it to the eventHolder
    jobData.eventHolder.setEvents(eventsFromDBArray(await scheduledDate.find({ startTime: { $gte: jobData.dataFrom } })));
}

type dbFetchData = {
    eventHolder: EventHolder,
    dataFrom: Date
}