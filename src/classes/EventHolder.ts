import CalendarEvent from "./CalendarEvent";

/**
 * Holds all the events for 
 */
export default class EventHolder {
    events: Array<CalendarEvent> = [];

    addEvent(event: CalendarEvent) {
        this.events.push(event);
    }
    
    clearEvents() {
        this.events = [];
    }

    turnIntoICSEvents() {
        let icsEvents: Array<any> = [];
        for (let e of this.events) {
            icsEvents.push(e.turnIntoICSEvent());
        }
        return icsEvents;
    }
}