import CalendarEvent from "../classes/CalendarEvent";

/**
 * Removes the specified item from the array and returns it
 * @param arr The array to remove the item from
 * @param value The item to remove
 * @returns The removed item
 */
export function removeItem<T>(arr: Array<T>, value: T): T {
    const index = arr.indexOf(value);
    if (index === -1) return null;
    return arr.splice(index, 1)[0];
}

/**
 * Delays the execution of the next line of code by the specified number of milliseconds
 * @param ms The number of milliseconds to delay
 * @returns A promise that is resolved after the specified number of milliseconds
 */
export function delay(ms: number): Promise<any> {
    return new Promise(r => setTimeout(r, ms))
}

/**
 * Converts an array of events from the database to CalendarEvents
 * @param events A list of events to convert to CalendarEvents
 * @returns A list of CalendarEvents
 */
export function eventsFromDBArray(events: any[]): CalendarEvent[] {
    return events.map(
        dbEvent => {
            const event = CalendarEvent.fromDates(dbEvent.startTime, dbEvent.endTime, dbEvent.canceled, dbEvent.lastUpdated);
            event.uid = dbEvent.uid;
            return event;
        }
    );
}