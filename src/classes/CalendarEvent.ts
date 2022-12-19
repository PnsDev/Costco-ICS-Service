import { randomUUID } from "crypto";
import scheduledDate from "../schemas/scheduledDate";
import { dateDif, dateDiff, numToWeekDate } from "../utils/dateUtils";

/**
 * An event for the calendar
 */
export default class CalendarEvent {
    uid: String = randomUUID();
    date: Date;
    dateEnd: Date;
    lastUpdated: Date;
    canceled: boolean;

    private constructor(date: Date, dateEnd: Date, canceled: boolean, lastUpdated: Date) {
        this.date = date;
        this.dateEnd = dateEnd;
        this.lastUpdated = lastUpdated;
        this.canceled = canceled;
    }

    /**
     * Creates a CalendarEvent from a set of dates (with some optional params)
     * @param date The date/time that the event starts 
     * @param dateEnd The date/time that the event ends
     * @param canceled If the event has been canceled
     * @param lastUpdated When the event was last updated
     * @returns A CalendarEvent
     */
    public static fromDates(date: Date, dateEnd: Date, canceled: boolean = false, lastUpdated: Date = new Date()): CalendarEvent {
        return new CalendarEvent(date, dateEnd, canceled, lastUpdated);
    }

    /**
     * Fetches a CalendarEvent from the Database
     * @param dateOrID The date/time or ID of the event. It is recommended that you use the UID.
     * @returns A CalendarEvent stored in the database
     */
    public static async fromDB(dateOrID: Date | string): Promise<CalendarEvent | null> {
        let res = await CalendarEvent.findOneByObject(dateOrID instanceof Date ? {startTime: dateOrID} : {uid: dateOrID})
        if (res === null) return null;
        let cEvent = new CalendarEvent(res.startTime, res.endTime, res.canceled, res.lastUpdated);;
        cEvent.uid = res.uid; // for the UID in there
        return cEvent;
    }

    public turnIntoICSEvent(): ICSEvent {
        const dif: dateDiff = dateDif(this.date, this.dateEnd);
        return {
            uid: this.uid, 
            title: `${numToWeekDate(this.date.getDay())} Shift`,
            description: `You work ${dif.hours} hours and ${dif.minutes} minutes.\n\nLast updated on ${this.lastUpdated.getMonth() + 1}/${this.lastUpdated.getDate()}/${this.lastUpdated.getFullYear()}`,
            start: [
                this.date.getFullYear(), 
                this.date.getMonth() + 1, 
                this.date.getDate(), 
                this.date.getHours(), 
                this.date.getMinutes()
            ],
            duration: dif,
            status: this.canceled === false ? 'CONFIRMED' : 'CANCELLED',
            sequence: 1,
            productId: "Costco Shifts",
        }
    }


    /**
     * Database functions
     */

    /**
     * Attempts to save the data to the database
     * @returns true if successful, false if not
     */
    public async save() : Promise<boolean> {
        let event = await CalendarEvent.findOneByObject({uid: this.uid});
        if (event === null) {
            event = new scheduledDate();
            event.uid = this.uid;
        }
        event.startTime = this.date;
        event.endTime = this.dateEnd;
        event.lastUpdated = this.lastUpdated;
        event.canceled = this.canceled;
        return new Promise((resolve) => {
            event.save((err: any) => {
                if (err) resolve(false);
                resolve(true);
            });
        });
    }

    /**
     * Finds the date based on the provided object
     * @returns the event that matches the object if it exists in the database, null if not
     */
    private static findOneByObject(obj: Object) : Promise<any> {
        return new Promise((resolve) => {
            scheduledDate.findOne(obj, (err: any, calendarDate: any) => {
                if (err) return resolve(null);
                resolve(calendarDate);
            });
        });
    }
}

type ICSEvent = {
    uid: String,
    title: String,
    description: String,
    start: number[],
    duration: dateDiff,
    status: String,
    sequence: number,
    productId: String
}