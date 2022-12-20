import express from 'express';
import EventHolder from './EventHolder';

const { createFeedRoute, generateIcs } = require('ics-service'); // no types for this package

/**
 * An ICS server that will serve the events in the eventHolder
 */
export default class ICSServer {
    expressApp: express.Application = express();
    eventHolder: EventHolder;
    started: boolean = false;

    /**
     * An ICS server that will serve the events in the eventHolder
     * @param eventHolder The event holder to use
     */
    constructor(eventHolder: EventHolder) {
        this.eventHolder = eventHolder;
    }

    /**
     * Starts the express server
     */
    public startServer() {
        if (this.started) return;
        this.started = true;
        this.expressApp.use(`/${process.env.SECRET}`, (req) => createFeedRoute(generateIcs("Costco Shift Scheduler", this.eventHolder.turnIntoICSEvents(), new URL(req.url, 'http://' + req.headers.host))))
	    this.expressApp.listen(80, () => {
		    console.log('ICS Server is running on secret env variable');
	    });
    }
}