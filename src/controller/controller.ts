import { Controller, Post, Route, Body, SuccessResponse, Get, Path } from 'tsoa';
import { apiLogger } from '../util/logger.js';
import { WorkflowService } from '../service/workflow-service.js';
import { JobResponse, JobResponseSchema } from '../interface/workflow-response-interfaces.js';
import { FetcherService } from '../service/fetcher-service.js';
import { convertWorkflowToDTO, WorkflowDTO } from '../interface/workflow-dtos.js';
import cookieGetter from '../util/cookie-getter.js';
import { sendRequestToMainBackend } from '../service/sender-service.js';

@Route("workflow")
class WorkflowController extends Controller {

    @Post("start")
    @SuccessResponse("200", "Workflow process started")
    public async start(): Promise<WorkflowDTO> {
        const workflow = await WorkflowService.createWorkflow()
        return convertWorkflowToDTO(workflow);
    }

    @Get("active")
    public async getActiveWorkflows(){
        const workflows = await WorkflowService.getCurrentWorkflows();
        const data = workflows.map(convertWorkflowToDTO);
        return data;
    }

     @Get("{uuid}")
    public async getWorkflowData(@Path("uuid") uuid: string) {
        const workflow = await WorkflowService.getWorkflowById(uuid);
        if(!workflow){
            this.setStatus(404);
            return {
                message: "workflow not found"
            }
        }
        return convertWorkflowToDTO(workflow);
    }

    @Post("job/{jobId}")
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

    @Post("cookie")
    public async updateCookie(@Body() body: {cookie: string}) {
        if(body.cookie && /^[a-fA-F0-9]{40}$/.test(body.cookie)){
            cookieGetter.setCookie(body.cookie);
        }else{
            throw new Error(`${body.cookie} not valid`)
        }
    }

   
    @Post("/retry/{uuid}")
    public async retryCoso(@Path("uuid") uuid: string){
        const data = await WorkflowService.buildDataFromWorkflow(uuid);
        apiLogger.info(JSON.stringify(data));
        await sendRequestToMainBackend(data);
    }
}

export { WorkflowController };