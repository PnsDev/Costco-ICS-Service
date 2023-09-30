import process from 'node:process';
import Puppeteer from 'puppeteer';

import CalendarEvent from '../classes/CalendarEvent';
import { convertTime12to24, equalDatesByDiff } from '../utils/dateUtils';
import { delay } from '../utils/miscUtils';
import { findAndClickSpan } from '../utils/pupUtils';

/**
 * Fetches the schedule from the Costco ESS website
 * @returns An array of CalendarEvents
 */
export default async function job() {
    const finalDates: CalendarEvent[] = [];

    const browser: Puppeteer.Browser = await Puppeteer.launch({
        headless: process.env.NODE_ENV !== "dev" ? true : false,
        args: [
            '--no-sandbox',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
        ]

    });

    // Use try catch to make sure browser is closed
    try {
        const page: Puppeteer.Page = await browser.newPage();

        page.setDefaultTimeout(120000);
        page.setDefaultNavigationTimeout(120000);

        await page.goto('https://ecc.costco.com/sap/bc/webdynpro/sap/hress_a_menu?sap-language=EN&sap-wd-configId=HRESS_AC_MENU', { waitUntil: 'networkidle2' });

        /**
         * Sign in to ESS with username and password
         */

        await page.waitForSelector('#username');

        await page.type('#username', process.env.COSTCO_USER);
        await page.type('#password', process.env.COSTCO_PASS);

        // Wait to make sure the function is callable
        await delay(2000);
        await page.evaluate('postOk();');

        await page.waitForNetworkIdle({ idleTime: 6000 });


        /**
         * Navigate through internal costco website to online schedule
         */

        await findAndClickSpan(page, 'Payroll');

        await page.waitForNetworkIdle({ idleTime: 5000 });

        await findAndClickSpan(page, 'Online Schedule');



        /**
         * Login to Payroll
         */

        await page.waitForSelector('#signInBtn');

        // Select input with id username and type in username
        await page.click('#CAMUsername');
        await page.type('#CAMUsername', process.env.COSTCO_USER);

        await page.click('#CAMPassword');
        await page.type('#CAMPassword', process.env.COSTCO_PASS);

        // Submit
        await page.click('#signInBtn');

        const targetFrame = await (await page.waitForSelector('iframe')).contentFrame();
        /**
         * Select payroll dates from dropdown and scrape
         */

        await targetFrame.waitForSelector('select');

        // Select the dropdown (first one is a hidden admin menu)
        let selectDrop = (await targetFrame.$$("select"))[1];

        // We don't actually care about the options, we just want the amount
        let preOptions = await selectDrop.$$('option');

        /**
         * This variable is used for double/triple shifts in the same day
         */
        let lastDate = [];

        for (let i = 0; i < preOptions.length; i++) {
            // Reselect the dropdown because it like to change after usage
            if (i > 0) selectDrop = await targetFrame.$("select")

            await selectDrop.select(await (await preOptions[i].getProperty('value')).jsonValue());

            await delay(3000);

            // Submit the current payroll form
            await targetFrame.evaluate("oCV_NS_.promptAction('finish');");

            // Wait since we want to make sure we have the latest data for the new week
            await page.waitForNetworkIdle({ idleTime: 6000 });

            let table = await targetFrame.waitForSelector('table[lid="List3_NS_"');

            await delay(2000);

            let rows = await table.$$('tr');

            // Get data here 9-10
            for (let j = 2; j < rows.length; j++) {
                if (rows[j] === undefined) continue;
                let rowContent = await rows[j].$$('td');
                let parsedRowContent = [];
                if (rowContent.length < 9) continue; // Skip - row holds useless data
                // Usually this should only accept 10's but costco likes to schedule two back to back shifts sometimes

                for (let d = 1; d < 5; d++) {
                    let el = await rowContent[d].$('span');
                    parsedRowContent.push(await (await el.getProperty('innerHTML')).jsonValue());
                }

                if (parsedRowContent[1] === '') continue; // Skip - You don't work this day

                // Covert date into event
                let strDate = parsedRowContent[0].split('/');
                let intTime1 = convertTime12to24(parsedRowContent[strDate.length === 1 ? 0 : 1]).split(':').map(n => parseInt(n));
                let intTime2 = convertTime12to24(parsedRowContent[strDate.length === 1 ? 1 : 2]).split(':').map(n => parseInt(n));

                // Get last date if schedule is double/triple
                if (strDate.length === 1) {
                    strDate = lastDate;
                    let tempNewStartTime = new Date(strDate[2], strDate[0] - 1, strDate[1], intTime1[0] - 1, intTime1[1] - 1);

                    // Check if the new start time is equal to the last end time
                    // if so just merge the shifts together
                    if (equalDatesByDiff(tempNewStartTime, finalDates[finalDates.length - 1].dateEnd)) {
                        finalDates[finalDates.length - 1].dateEnd = new Date(strDate[2], strDate[0] - 1, strDate[1], intTime2[0] - 1, intTime2[1] - 1);
                        continue;
                    }
                } else lastDate = strDate.map(n => parseInt(n));

                finalDates.push(CalendarEvent.fromDates(
                    new Date(lastDate[2], lastDate[0] - 1, lastDate[1], intTime1[0] - 1, intTime1[1] - 1),
                    new Date(lastDate[2], lastDate[0] - 1, lastDate[1], intTime2[0] - 1, intTime2[1] - 1),
                ));
            }
        }

        await browser.close();
        return finalDates;

    } catch (e) {
        await browser.close();
        throw e;
    }
}