import { delay } from "../utils/miscUtils";
import { msToCron, validateJobPath } from "./utils";

const cron = require('node-cron');

export default class Scheduler {
    jobs: Array<job> = [];

    constructor(jobs: Array<job>) {
        jobs.forEach(job => this.scheduleJob(job));
    }

    /**
     * Schedules a job to run at a specified interval (or once)
     * @param job The job to schedule
     * @returns A promise that is resolved when the job has been completed/registered
     */
    public async scheduleJob(job: job): Promise<void> {
        job = { ...defaultValues, ...job };
        validateJobPath(job.path); // Validates the job file (we need something to run)

        // If the job is repeating, we need to run it without waiting for it to finish
        if (job.repeatEvery === null || job.initialDelay !== 0) {
            await delay(job.initialDelay);
            if (job.repeatEvery === null) return await Scheduler.runJob(job);
            Scheduler.runJob(job);
        }

        this.jobs.push(job);
        cron.schedule(msToCron(job.repeatEvery), async () => {
            Scheduler.runJob(job);
        });
    }

    /**
     * Runs a job immediately (does not affect the schedule)
     * @param jobName The name of the job to run
     * @returns A promise that is resolved when the job has been completed
     */
    public runJobNow(jobName: string): Promise<void> {
        const job = this.jobs.find(job => job.name === jobName);
        if (!job) throw new Error(`Job ${jobName} not found`);
        return Scheduler.runJob(job);
    }

    /**
     * Inner logic for running a job
     * @param job The job to run
     */
    private static async runJob(job: job): Promise<void> {
        const jobFile: Function = require(job.path).default;

        try {
            let res = await jobFile(job.jobVariable);
            await job.endBehavior({...job}, res);
        } catch(err: any) {
            console.log(`Job ${job.name} encountered the following error:\n${err}`);
            try { await job.errorBehavior({...job}, err); }
            catch (errErr: any) {} // Lol
        }
    }
}

type job = {
    name: string, // The name of the job
    path: string, // The path to the file containing the job
    jobVariable?: any, // The variables to pass to the job
    repeatEvery?: number, // In milliseconds
    initialDelay?: number, // In milliseconds
    endBehavior?: Function, // Only runs if the job finishes successfully
    errorBehavior?: Function, // Only runs if the job errors
}

const defaultValues = {
    jobVariables: {},
    repeatEvery: null,
    initialDelay: 0,
    endBehavior: () => {},
    errorBehavior: () => {}
}