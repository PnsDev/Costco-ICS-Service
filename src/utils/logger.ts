import chalk from "chalk";

export default class Logger {
    postTime: boolean;
    colored: boolean;

    /**
     * A logger that logs messages to the console
     * @param postTime Whether or not to post the time in the log message
     * @param colored Whether or not to color the log messages
     */
    constructor(postTime: boolean = true, colored: boolean = true) {
        this.postTime = postTime;
        this.colored = colored;
    }

    /**
     * Logs a message to the console
     * @param message The message to log
     */
    public log(message: string): void {
        console.log(this.formatMessage(message));
    }

    /**
     * Logs a message to the console if the NODE_ENV is not production
     * @param message The message to log
     */
    public info(message: string): void {
        if (process.env.NODE_ENV === "production") return;
        console.info(this.formatMessage(message));
    }

    /**
     * Logs a warning to the console
     * @param message The message to log
     */
    public warn(message: string): void {
        console.log(this.formatMessage(chalk.red(message)));
    }

    /**
     * Formats a message
     * @param message The message to format
     * @returns The formatted message
     */
    private formatMessage(message: string): string {
        let formattedMessage = message;
        if (this.postTime) formattedMessage = `[${new Date().toLocaleString()}] ` + formattedMessage;
        if (!this.colored) formattedMessage = chalk.white(formattedMessage);
        return formattedMessage;
    }
}