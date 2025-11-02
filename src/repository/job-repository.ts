import { JobState, JobType } from "@prisma/client";
import prisma from "../db/prisma";
import { DataUnion } from "../interface/workflow-response-interfaces";

export interface CreateJobData {
  workflowId: string;
  number: number;
  type: JobType;
  description: string;
  response?: string;
}


// Create a new job
export async function createJob(data: CreateJobData) {
  return await prisma.job.create({
    data: {
      workflowId: data.workflowId,
      number: data.number,
      type: data.type,
      description: data.description,
      state: JobState.PENDING,
    },
    include: {
      workflow: true
    }
  });
}

// Get job by ID
export async function getJobById(id: number) {
  return await prisma.job.findUnique({
    where: { id: BigInt(id) },
    include: {
      workflow: true
    }
  });
}

// Get jobs by workflow ID
export async function getJobsCountByWorkflowId(workflowId: string) {
  return await prisma.job.count({
    where: { workflowId },
    orderBy: { number: 'asc' }
  });
}

export async function getPendingJobsCountByWorkflowId(workflowId: string) {
  return await prisma.job.count({
    where: { workflowId, state: JobState.PENDING }
  });
}

// Get jobs by state
export async function getJobsByState(state: JobState) {
  return await prisma.job.findMany({
    where: { state },
    include: {
      workflow: true
    },
    orderBy: { createdAt: 'asc' }
  });
}

// Delete job
export async function deleteJob(id: number) {
  return await prisma.job.delete({
    where: { id: BigInt(id) }
  });
}

// Mark job as completed
export async function completeJob(id: number, response: string, data: any) {
  return await updateJobState(id, JobState.SUCCESS, response, data)
}

// Mark job as failed
export async function failJob(id: number, errorMessage: string) {
  return await updateJobState(id, JobState.ERROR, errorMessage);
}

export async function getNextPendingJob(workflowId: string) {
  return await prisma.job.findFirst({
    where: {
      workflowId: workflowId,
      state: JobState.PENDING
    },
    orderBy: {
      number: 'asc'
    }
  })
}

// Update job state and response
export async function updateJobState(id: number, state: JobState, response?: string, data?: DataUnion) {
  return await prisma.job.update({
    where: { id: BigInt(id) },
    data: {
      state,
      response,
      data
    }
  });
}