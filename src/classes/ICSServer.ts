import express from 'express';
import EventHolder from './EventHolder';

const { generateIcs } = require('ics-service'); // no types for this package

let eventHolder: EventHolder;

/**
 * An ICS server that will serve the events in the eventHolder
 */
export default class ICSServer {
    expressApp: express.Application = express();
    started: boolean = false;

    /**
     * An ICS server that will serve the events in the eventHolder
     * @param eventHolder The event holder to use
     */
    constructor(eventH: EventHolder) {
        eventHolder = eventH;
    }

    /**
     * Starts the express server
     */
    public startServer() {
        if (this.started) return;

        this.started = true;
        this.expressApp.use(`/${process.env.ICS_SECRET}`, (req, res) => {
            res.writeHead(200, 'ok', { 'content-type': 'text/calendar' })
            res.end(generateIcs("Costco Shift Scheduler", eventHolder.turnIntoICSEvents(), new URL(req.url, 'http://' + req.headers.host)));
        });

        this.expressApp.listen(process.env.ICS_PORT, () => {
            global.log.log(`ICS server listening on port ${process.env.ICS_PORT}`);
        });
    }
}