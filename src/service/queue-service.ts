import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { env } from "../env.js";
import { queueLogger } from "../util/logger.js";
import { FetchingRequest } from "../interface/workflow-request-interfaces.js";
import { sendRequestToFetcher } from "./sender-service.js";
import { FetcherService } from "./fetcher-service.js";
import { JobResponse, JobResponseSchema } from "../interface/workflow-response-interfaces.js";

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue<FetchingRequest>("scraperQueue", { connection });


async function sleep(ms: number = env.DELAY_MS, random: boolean = false): Promise<void> {
  const rnd = Math.random() * (3000) + 1000;
  await new Promise(r => setTimeout(r, ms + (random ? rnd : 0)));
}

// Worker del orquestador con integración a BD
const worker = new Worker<FetchingRequest>(
  "scraperQueue",
  async (job: Job<FetchingRequest>) => {

    const request: FetchingRequest = job.data;
    request.callbackUrl = env.SELF_URL;

    try {
      queueLogger.info({
        jobId: job.id,
        name: request.jobId + " - " + request.type,
      }, 'Processing job started');

      const response = await sendRequestToFetcher(request);
      const jobResponse: JobResponse = JobResponseSchema.parse(response);
      await FetcherService.endJob(jobResponse);

      queueLogger.debug('Starting cooldown period...');
      await sleep(undefined, true);

    } catch (error) {
      queueLogger.error({
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Job processing failed');

      throw error; // Re-throw para que BullMQ maneje el retry
    }
  },
  { concurrency: env.WORKERS, connection }
);

worker.on("failed", async (job: Job<FetchingRequest> | undefined, err: Error) => {
  if (job === undefined) {
    queueLogger.error("Unknown Job Failed")
  }
  const request: FetchingRequest = job!.data;
  queueLogger.error({
    jobId: job!.id,
    name: `${request.jobId} - ${request.type}`,
    error: err.message
  }, 'Job failed');
  const maxAttempts = job?.opts.attempts || 5;
  const currentAttempt = job?.attemptsMade || 1;
  if (currentAttempt >= maxAttempts) {
    await FetcherService.endJob({
      jobId: request.jobId!,
      response: `Sending request ${request.type} to fetcher failed`,
      success: false
    });
  }
});

export { queue };