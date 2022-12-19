
/**
 * Validates if a given path has a valid job function
 * @param path The path of the job file
 * @returns A valid function for the job
 */
export function validateJobPath(path: string): Function {
    const jobFile: Function | undefined = require(path).default;
    if (!jobFile) throw new Error('Job file does not export a default function');
    return jobFile;
}

/**
 * Converts milliseconds to a cron expression
 * @param ms The number of milliseconds to convert
 * @returns A cron expression
 */
export function msToCron(ms: number): string {
    const seconds = Math.floor(ms / 1000),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60),
        days = Math.floor(hours / 24);

    const rHours = hours % 24,
        rMinutes = minutes % 60,
        rSeconds = seconds % 60;

    if (days > 0) return `${rMinutes} ${rHours} */${days} * *`;  // every n days
    if (hours > 0) return `${rMinutes} */${hours} * * *`;  // every n hours
    if (minutes > 0) return `*/${minutes} * * * *`;  // every n minutes
    throw new Error("Invalid time interval: < 1 minute");
}