const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
 * Converts a date to a specific timezone
 * @param date The date to convert
 * @param tzString The timezone to convert to
 * @returns A date with the specified timezone
 */
export function convertTZ(date: Date, tzString: string) {
    return new Date(date.toLocaleString("en-US", {timeZone: tzString}));   
}

/**
 * Creates a date with a specific timezone (UTC + offset)
 * @param timeZone The timezone to use
 * @param year The year
 * @param month The month
 * @param day The day
 * @param hour The hour
 * @param minute The minute
 * @param second The second
 * @returns A date with the specified timezone
 */
export function dateWithTimeZone(timeZone, year, month, day, hour, minute, second) {
    let date = new Date(Date.UTC(year, month, day, hour, minute, second));
  
    let utcDate = new Date(date.toLocaleString('en-US', { timeZone: "UTC" }));
    let tzDate = new Date(date.toLocaleString('en-US', { timeZone: timeZone }));
    let offset = utcDate.getTime() - tzDate.getTime();
  
    date.setTime( date.getTime() + offset );
  
    return date;
};

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
    return weekDays[num - 1];
}