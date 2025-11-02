import { Workflow, Job, JobState } from "@prisma/client";
import { WorkflowType } from "./db-interfaces";



export interface WorkflowDTO {
  uuid: string;
  start: string;
  end?: string;
  state: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  jobs?: JobDTO[];
}

export interface JobDTO {
  id: number;
  number: number;
  type: string;
  state: string;
  response?: string;
  description: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
}


export function convertWorkflowToDTO(workflow: WorkflowType): WorkflowDTO {

  const completed = workflow.jobs.reduce((curr: number, obj) =>
    obj.state === JobState.SUCCESS ? curr + 1 : curr
    , 0);

  const total = workflow.jobs.length;

  const progress = total === 0 ? 0 : (completed / total) * 100;

  return {
    uuid: workflow.id,
    start: workflow.start.toISOString(),
    end: workflow.end?.toISOString(),
    state: workflow.state,
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
    jobs: workflow.jobs?.map(convertJobToDTO),
    progress: progress
  };
}

export function convertJobToDTO(job: Job): JobDTO {
  return {
    id: Number(job.id),
    number: job.number,
    type: job.type,
    state: job.state,
    response: job.response ?? undefined,
    description: job.description,
    workflowId: job.workflowId,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString()
  };
}