import { Controller, Post, Route, Body, SuccessResponse, Get, Path } from 'tsoa';
import { apiLogger } from '../util/logger.js';
import { WorkflowService } from '../service/workflow-service.js';
import { JobResponse, JobResponseSchema } from '../interface/workflow-response-interfaces.js';
import { FetcherService } from '../service/fetcher-service.js';

@Route("workflow")
class WorkflowController extends Controller {

    @Post("")
    @SuccessResponse("200", "Workflow process started")
    public async start(@Body() request: { ci_session: string }): Promise<{ message: string }> {
        await WorkflowService.createWorkflow(request.ci_session)
        return {
            message: `Flujo de trabajo iniciado correctamente`,
        };
    }

    @Post("/job/{jobId}")
    public async updateJob(@Body() body: any, @Path("jobId") jobId: number ) {        
        if(body.data){
            if(body.data.code){
                body.data.type = "SUBJECT";
            }else{
                body.data.type = "PENSUM";
            }
        }
        const job: JobResponse = JobResponseSchema.parse(body);
        job.jobId = jobId;
        await FetcherService.endJob(job);
    }

    @Get("{uuid}")
    public async getWorkflowData(@Path("uuid") uuid: string) {
        return WorkflowService.buildDataFromWorkflow(uuid)
    }
}

export { WorkflowController };