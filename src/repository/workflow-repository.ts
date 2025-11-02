import { WorkflowState } from "@prisma/client";
import prisma from "../db/prisma";
import { DataUnion, PensumFull } from "../interface/workflow-response-interfaces";

export interface CreateWorkflowData {
  isUpdateTeachers?: boolean;
}

export async function createWorkflow(data: CreateWorkflowData = {}) {
  return await prisma.workflow.create({
    data: {
      start: new Date(),
      state: WorkflowState.PROCESSING,
      isUpdateTeachers: data.isUpdateTeachers ?? true
    },
    include: {
      jobs: true
    }
  })
}

export async function getWorkflowById(uuid: string) {
  return await prisma.workflow.findUnique({
    where: {
      id: uuid
    },
    include: {
      jobs: {
        orderBy: { number: 'asc' }
      }
    }
  })
}


export async function getAllWorkflows() {
  return await prisma.workflow.findMany({
    include: {
      jobs: true
    },
    orderBy: { start: 'desc' }
  });
}
// Update workflow state
export async function updateWorkflowState(id: string, state: WorkflowState, end?: Date, data?: PensumFull) {
  return await prisma.workflow.update({
    where: { id },
    data: {
      state,
      data,
      end: end || (state !== WorkflowState.PROCESSING ? new Date() : null)
    },
    include: {
      jobs: true
    }
  });
}

// Delete workflow
export async function deleteWorkflow(id: string) {
  return await prisma.workflow.delete({
    where: { id }
  });
}

// Get workflows by state
export async function getWorkflowsByState(state: WorkflowState) {
  return await prisma.workflow.findMany({
    where: { state },
    include: {
      jobs: true
    },
    orderBy: { start: 'desc' }
  });
}

export async function getCurrentWorkflows() {
  return await prisma.workflow.findMany({
    where: {
      state: WorkflowState.PROCESSING
    },
    include: {
      jobs: true
    }
  })
}