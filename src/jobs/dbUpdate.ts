import scheduledDate from '../schemas/scheduledDate';
import { removeItem } from '../utils/miscUtils';
import CalendarEvent from '../classes/CalendarEvent';
import { equalDates } from '../utils/dateUtils';

export default async function job(previousJobData: CalendarEvent[]) {
    if (previousJobData.length === 0) throw new Error('No data from previous job');

    // These should be pre-sorted but let's just make sure
    previousJobData.sort((a, z) => a.date.getTime() - z.date.getTime());

    // TODO: Clean this up
    let tempArray = await scheduledDate.find({startTime: {$gte: previousJobData[0].date}});
    let dataInDB: CalendarEvent[] = [];

    for (const key in tempArray) {
        let event = CalendarEvent.fromDates(tempArray[key].startTime, tempArray[key].endTime, tempArray[key].canceled, tempArray[key].lastUpdated);
        event.uid = tempArray[key].uid;
        dataInDB.push(event);
    }

    // Loop and check for dupes
    for (let i = 0; i < previousJobData.length; i++) {
        let updatedDB = false; // Used to check if the db was updated
        const newEvent = previousJobData[i];
        for (let j = 0; j < dataInDB.length; j++) {
            const oldEvent = dataInDB[j];

            if (!(equalDates(newEvent.date, oldEvent.date)) || !(equalDates(newEvent.dateEnd, oldEvent.dateEnd))) continue;
            newEvent.uid = removeItem(dataInDB, oldEvent).uid;
            await newEvent.save(); // Updated old event to use new event
            updatedDB = true;
            break;
        }
        if (!updatedDB) {await newEvent.save();} // If the event was not found in the db... save it
    }

    // Loop through leftover data and mark it is canceled
    for (let i = 0; i < dataInDB.length; i++) {
        dataInDB[i].canceled = true;
        await dataInDB[i].save();
    }
}