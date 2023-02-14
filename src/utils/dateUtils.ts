const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type dateDiff = {
    hours: number;
    minutes: number;
}

/**
 * Finds the difference between two dates
 * @param date1 The first date 
 * @param date2 The second date
 * @returns The difference between the two dates
 */
export function dateDif(date1: Date, date2: Date): dateDiff {
    let diff = {} as dateDiff;
    let tmp = date2.getTime() - date1.getTime();
    tmp = Math.floor(tmp / 1000);
    tmp = Math.floor((tmp - (tmp % 60)) / 60);
    diff.minutes = tmp % 60;
    tmp = Math.floor((tmp - diff.minutes) / 60);
    diff.hours = tmp % 24;
    return diff;
}

/**
 * Converts a 12 hour time to a 24 hour time
 * @param time12h The 12 hour time
 * @returns The 24 hour time
 */
export function convertTime12to24(time12h: string): string {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';

    return `${modifier === 'PM' ? parseInt(hours, 10) + 12 : hours}:${minutes}`;
}

/**
 * Converts a day of the week (number) to a string (Monday, Tuesday, etc.)
 * @param num The day of the week to convert
 * @returns The day of the week as a string
 */
export function numToWeekDate(num: number): string {
    return weekDays[num]; // This is flawed thinking because the week starts on Monday, not Sunday
}

/**
 * Checks if two dates are equal with a certain margin of error
 * @param date1 The first date
 * @param date2 The second date
 * @param diff The margin of error
 * @returns True if the dates are equal, false otherwise
 */
export function equalDatesByDiff(date1: Date, date2: Date, diff: number = 0): boolean {
    return Math.abs(date1.getTime() - date2.getTime()) <= diff;
}