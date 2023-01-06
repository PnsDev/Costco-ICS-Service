import CalendarEvent from '../classes/CalendarEvent';
import scheduledDate from '../schemas/scheduledDate';
import { equalDatesByDiff } from '../utils/dateUtils';
import { eventsFromDBArray, removeItem } from '../utils/miscUtils';

export default async function job(previousJobData: CalendarEvent[]) {
    if (previousJobData.length === 0) throw new Error('No data from previous job');

    // These should be pre-sorted but let's just make sure so we can pull the first date
    previousJobData.sort((a, z) => a.date.getTime() - z.date.getTime());

    // Get all events from the db that are after the first event in the previous job
    let dbEvents = eventsFromDBArray(await scheduledDate.find({ startTime: { $gte: previousJobData[0].date } }));

    // Loop and check for dupes
    dbCompareLoop: for (let i = 0; i < previousJobData.length; i++) {
        const newEvent = previousJobData[i];
        for (let j = 0; j < dbEvents.length; j++) {
            const oldEvent = dbEvents[j];

            // If the event is the same, update the db event and continue
            if (!equalDatesByDiff(newEvent.date, oldEvent.date) ||
                !equalDatesByDiff(newEvent.dateEnd, oldEvent.dateEnd)) continue;

            newEvent.uid = removeItem(dbEvents, oldEvent).uid;
            await newEvent.save(); // Updated old event to use new event

            // Check for other events at the same time to delete them
            for (const key in dbEvents) {
                const otherEvent = dbEvents[key];
                if (!equalDatesByDiff(newEvent.date, otherEvent.date) ||
                    !equalDatesByDiff(newEvent.dateEnd, otherEvent.dateEnd)) continue;
                await removeItem(dbEvents, otherEvent).delete(); // Delete the event and remove it from the array to prevent re-saving
            }

            continue dbCompareLoop;
        }

        // If the event was not found in the db... save it
        await newEvent.save();
    }

    // Loop through leftover data and mark it is canceled
    for (let i = 0; i < dbEvents.length; i++) {
        dbEvents[i].canceled = true;
        await dbEvents[i].save();
    }
}