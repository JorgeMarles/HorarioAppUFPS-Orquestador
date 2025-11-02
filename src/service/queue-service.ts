import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { env } from "../env.js";
import { queueLogger } from "../util/logger.js";
import { FetchingRequest } from "../interface/workflow-request-interfaces.js";
import { sendRequest } from "./sender-service.js";

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue<FetchingRequest>("scraperQueue", { connection });


async function sleep(ms: number = env.DELAY_MS): Promise<void> {
  await new Promise(r => setTimeout(r, ms));
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

      await sendRequest(request);

      queueLogger.debug('Starting cooldown period...');
      await sleep();

    } catch (error) {
      queueLogger.error({
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Job processing failed');

      throw error; // Re-throw para que BullMQ maneje el retry
    }
  },
  { concurrency: 1, connection }
);

worker.on("completed", async (job: Job<FetchingRequest>) => {

  const request: FetchingRequest = job.data;

  queueLogger.info({
    jobId: job.id,
    name: request.jobId + " - " + request.type,
  }, 'Job completed');
});

worker.on("failed", async (job: Job<FetchingRequest> | undefined, err: Error) => {
  if(job === undefined){
    queueLogger.error("Unknown Job Failed")
  }
  const request: FetchingRequest = job!.data;
  queueLogger.error({
    jobId: job!.id,
    url: request.jobId + " - " + request.type,
    error: err.message
  }, 'Job failed');
});

export { queue };