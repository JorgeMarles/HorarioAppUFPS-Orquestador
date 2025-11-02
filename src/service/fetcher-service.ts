import IORedis from 'ioredis';
import { env } from '../env';
import { Queue } from 'bullmq';
import { completeJob, createJob, CreateJobData, failJob, getJobById, getJobsCountByWorkflowId, getPendingJobsCountByWorkflowId } from '../repository/job-repository';
import { FetchingRequest, FetchingRequestData } from '../interface/workflow-request-interfaces';
import { Job, JobState, JobType, Workflow, WorkflowState } from '@prisma/client';
import { JobResponse, PensumData, PensumDataSchema, PensumFull, SubjectData, SubjectDataSchema } from '../interface/workflow-response-interfaces';
import { fetchLogger } from '../util/logger';
import { getWorkflowById, updateWorkflowState } from '../repository/workflow-repository';
import { queue } from './queue-service';
import cookieGetter from '../util/cookie-getter';
import { WorkflowService } from './workflow-service';
import { sendRequestToMainBackend } from './sender-service';

//Will manage jobs with queues
export class FetcherService {

    /**
     * Gets the Divisist ci_session Cookie from an active session
     * 
     * How? I don't know yet
     * @returns the ci_session cookie
     */
    static async getCookie(): Promise<string> {
        //Here, somehow i will get and return the cookie
        return cookieGetter.getCookie();
    }

    /**
     * Creates a Job in the database, and pushes it to the BullMQ queue
     * @param data the data for creating the entity in DB
     * @param requestData RequestData to push in the queue
     * @returns the created job
     */
    static async startJob(data: CreateJobData, requestData: FetchingRequestData) {
        const job = await createJob(data);
        const cookie = await this.getCookie();
        const request: FetchingRequest = {
            jobId: Number(job.id),
            cookie: cookie,
            ...requestData
        }
        await queue.add('fetch', request)
        return job;
    }

    /**
     * Validates that there is a Job with the given id
     * @param response 
     * @returns the job with the id of the response
     */
    static async validateJob(response: JobResponse) {
        const job = await getJobById(response.jobId)
        if (!job) {
            const errMsg = `No job with ${response.jobId}`
            fetchLogger.error(errMsg)
            throw Error(errMsg)
        }
        return job;
    }

    /**
     * Validates and returns specifically PensumData
     */
    static getPensumDataResponse(job: Job, response: JobResponse): PensumData {
        if (job.type !== JobType.PENSUM_INFO) {
            throw Error(`Expected PENSUM_INFO but got ${job.type}`);
        }
        return PensumDataSchema.parse(response.data);
    }

    /**
     * Validates and returns specifically SubjectData
     */
    static getSubjectDataResponse(job: Job, response: JobResponse): SubjectData {
        if (job.type === JobType.PENSUM_INFO) {
            throw Error(`Expected SUBJECT_INFO but got ${job.type}`);
        }
        return SubjectDataSchema.parse(response.data);
    }

    /**
     * Ends the WorkFlow
     * @param workflowId the UUID of the workflow
     * @param success `true` if all jobs were successful, `false` otherwise
     */
    static async endWorkflow(workflowId: string, success: boolean) {
        fetchLogger.info({ workflowId }, "Ending workflow ")
        let workflow = await getWorkflowById(workflowId);
        if (!workflow) {
            const errMsg = `Workflow with UUID ${workflowId} doesn't exists`;
            fetchLogger.error(errMsg);
            throw Error(errMsg);
        }
        workflow = await updateWorkflowState(workflow.id, success ? WorkflowState.SUCCESS : WorkflowState.ERROR);

        if (success) {
            //Gather all pensum data and send to main backend
            //const data: PensumFull
            const pensumFull: PensumFull = await WorkflowService.buildDataFromWorkflow(workflowId)
            await sendRequestToMainBackend(pensumFull);
        }

        await Promise.all(
            workflow.jobs.map(
                e => e.state === JobState.PENDING && failJob(Number(e.id), "Previous error: this job never executed")
            )
        )
        //TODO: This won't be good when there is other workflows at the same time
        await queue.drain();
    }

    /**
     * Checks if the current workflow doesn't have any jobs pending, then ends the workflow
     */
    static async checkForCompletion(workflowId: string) {
        const count = await getPendingJobsCountByWorkflowId(workflowId);
        if (count === 0) {
            //Ends
            this.endWorkflow(workflowId, true);
        }
    }

    /**
     * Given the response, updates the job
     * @param response the JobResponse
     */
    static async endJob(response: JobResponse) {
        const job: Job = await this.validateJob(response);
        if (job.state != JobState.PENDING) {
            const errorMsg = `Tried to end already ended Job with id ${job.id}`
            fetchLogger.error({ job }, errorMsg)
            throw Error(errorMsg)
        }
        if (response.success) {
            fetchLogger.info({ id: job.id }, "Ended ok");
            if (job.type === JobType.PENSUM_INFO) {
                await this.endJobT1(job, response);
            } else {
                await this.endJobT2OrT3(job, response);
            }
            await completeJob(response.jobId, response.response, response.data)
            await this.checkForCompletion(job.workflowId);
        } else {
            await failJob(response.jobId, response.response)
            await this.endWorkflow(job.workflowId, false);
        }

    }

    /**
     * Starts a job of Type 1 ("Pensum Information")
     * @param workflowId the Workflow UUID of this Job
     */
    static async startJobT1(workflowId: string) {
        const request: FetchingRequestData = {
            type: "PENSUM",
            updateTeachers: true
        }

        const job = await this.startJob({
            description: "Consultando Información del Pensum",
            number: 1,
            type: JobType.PENSUM_INFO,
            workflowId: workflowId
        }, request)
    }

    /**
     * Ends a job of Type 1 ("Pensum Information")
     * @param job The job as entity
     * @param response The JobRespone obtained
     */
    static async endJobT1(job: Job, response: JobResponse) {
        const pensumData: PensumData = this.getPensumDataResponse(job, response);
        for (const subjectCode in pensumData.subjects) {
            const subject = pensumData.subjects[subjectCode];
            await this.startJobT2OrT3(job.workflowId, subject.code);
        }
    }

    /**
     *  /**
     * Starts a Type2 ("Subject Information") or Type3 ("Equivalence Information") job
     * @param workflowId the Workflow UUID of this Job
     * @param code The code of this Subject
     * @param isPrincipal (optional, default `false`) Should be send with `true` if the subject is an equivalence
     */
    static async startJobT2OrT3(workflowId: string, code: string, isPrincipal: boolean = true) {
        const request: FetchingRequestData = {
            type: "SUBJECT",
            code: code,
            isPrincipal: isPrincipal
        }

        const jobNumber = await getJobsCountByWorkflowId(workflowId);

        const job = await this.startJob({
            description: `Consultando ${isPrincipal ? "Materia" : "Equivalencia"} ${code}`,
            number: jobNumber + 1,
            type: isPrincipal ? JobType.SUBJECT_INFO : JobType.EQUIVALENCE_INFO,
            workflowId: workflowId
        }, request)
    }

    /**
     * Ends a Type2 ("Subject Information") or Type3 ("Equivalence Information") job
     * 
     * If the Response corresponds to a Subject, it triggers new Type3 jobs
     * @param job The job as entity
     * @param response The JobRespone obtained 
     */
    static async endJobT2OrT3(job: Job, response: JobResponse) {
        const subjectData: SubjectData = this.getSubjectDataResponse(job, response);
        if (job.type === JobType.SUBJECT_INFO) {
            for (const equivalence of subjectData.equivalences) {
                await this.startJobT2OrT3(job.workflowId, equivalence, false);
            }
        }
    }

}