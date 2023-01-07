import { Frame, Page } from 'puppeteer';

/**
 * Finds a specific span within a frame/page and clicks if it exists
 * @param target The target frame/page to look for the span
 * @param innerText The inner text of the span we are looking to click
 * @returns Returns a promise that is completed when 
 */
export async function findAndClickSpan(target: Frame | Page, innerText: string): Promise<void> {
    for (let clickable of await target.$$('span')) {
        if (await (await clickable.getProperty('innerText')).jsonValue() !== innerText) continue;
        return clickable.click();
    }

    throw new Error(`Could not find ${innerText} span`);
}