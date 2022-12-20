import CalendarEvent from "../classes/CalendarEvent";
import EventHolder from "../classes/EventHolder"
import scheduledDate from "../schemas/scheduledDate";

export default async function job(input: input) {
    let tempArray = await scheduledDate.find({startTime: {$gte: input.dataFrom}});
    let dataInDB: CalendarEvent[] = [];

    for (const key in tempArray) {
        let event = CalendarEvent.fromDates(tempArray[key].startTime, tempArray[key].endTime, tempArray[key].canceled, tempArray[key].lastUpdated);
        event.uid = tempArray[key].uid;
        dataInDB.push(event);
    }
    
    // Update event holder
    input.eventHolder.events = dataInDB;
}



type input = {
    eventHolder: EventHolder,
    dataFrom: Date
}