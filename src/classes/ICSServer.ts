import express from 'express';
import EventHolder from './EventHolder';

const { createFeedRoute, generateIcs } = require('ics-service'); // no types for this package

/**
 * An ICS server that will serve the events in the eventHolder
 */
export default class ICSServer {
    expressApp: express.Application = express();
    eventHolder: EventHolder;

    /**
     * An ICS server that will serve the events in the eventHolder
     * @param eventHolder The event holder to use
     */
    constructor(eventHolder: EventHolder) {
        this.eventHolder = eventHolder;
        this.startServer();
    }

    /**
     * Starts the express server
     */
    private startServer() {
        this.expressApp.use(`/${process.env.SECRET}`, createFeedRoute(this.getIcs))
	    this.expressApp.listen(80, () => {
		    console.log('Calendar running on secret env variable');
	    });
    }

    private getIcs(feedUrl: any) {
		return generateIcs("Costco Shift Scheduler", this.eventHolder.turnIntoICSEvents(), feedUrl);
	}
}