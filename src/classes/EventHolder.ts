import CalendarEvent from "./CalendarEvent";

/**
 * Holds all the events for 
 */
export default class EventHolder {
    #events: Array<CalendarEvent> = [];

    /**
     * Adds an event to the list of events
     * @param event The event to add
     */
    public addEvent(event: CalendarEvent) {
        this.#events.push(event);
    }

    /**
     * Replaces the current list of events with a new list
     * @param events The list of events to replace the current list with
     */
    public setEvents(events: Array<CalendarEvent>) {
        this.#events = events;
    }
    
    /**
     * Clears all the events from the list
     */
    public clearEvents() {
        this.#events.length = 0
    }

    /**
     * Turns all the events into ICSEvents
     * @returns The list of events
     */
    turnIntoICSEvents() {
        return this.#events.map(e => e.turnIntoICSEvent());
    }
}