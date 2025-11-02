import { JobState, JobType, WorkflowState } from '@prisma/client';
import prisma from '../db/prisma.js';
import { createWorkflow, getAllWorkflows, getCurrentWorkflows, getWorkflowById } from '../repository/workflow-repository.js';
import { FetcherService } from './fetcher-service.js';
import cookieGetter from '../util/cookie-getter.js';
import { PensumData, PensumFull, SubjectData } from '../interface/workflow-response-interfaces.js';

// Helper functions
export class WorkflowService {

  static async createWorkflow() {
    const currentWorkflow = await getCurrentWorkflows();
    if (currentWorkflow.length > 0) {
      throw Error("No se puede crear Flujo de Trabajo, ya hay uno ejecutándose");
    }
    const workflow = await createWorkflow();
    await FetcherService.startJobT1(workflow.id)
    return workflow;
  }

  static async getAllWorkflows() {
    const workflows = await getAllWorkflows();
    return workflows;
  }

  static async getCurrentWorkflows() {
    const workflows = await getCurrentWorkflows();
    return workflows;
  }

  static async getWorkflowById(uuid: string) {
    const workflow = await getWorkflowById(uuid);
    return workflow;
  }

  static async buildDataFromWorkflow(workflowId: string) {
    const workflow = await getWorkflowById(workflowId);
    if (!workflow) {
      throw Error(`Workflow with id ${workflow} doesn't exist`);
    }

    if (workflow.state !== WorkflowState.SUCCESS) {
      throw Error(`You can't get the data of a non-succesful Workflow`);
    }

    const segregatedJobs = workflow.jobs.reduce((acc, obj) => {
      const key = obj.type;
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj);
      return acc
    }, {} as Record<string, typeof workflow.jobs>)

    const pensumJob = segregatedJobs[JobType.PENSUM_INFO][0];
    const subjects = segregatedJobs[JobType.SUBJECT_INFO].map(el => el.data as SubjectData);
    const equivalencesArr = segregatedJobs[JobType.EQUIVALENCE_INFO].map(el => el.data as SubjectData);

    const equivalences: Record<string, SubjectData> = equivalencesArr.reduce((acc, obj) => {
      if (!obj) return acc;
      const key = obj.code;
      acc[key] = obj;
      return acc
    }, {} as Record<string, SubjectData>)

    const pensumData: PensumData = pensumJob.data as PensumData;

    const pensumFull: PensumFull = {
      name: pensumData.name,
      semesters: pensumData.semesters,
      updateTeachers: pensumData.updateTeachers,
      subjects: [],
      subjectsMap: {}
    }

    for (const code in pensumData.subjects!) {
      const subject = pensumData.subjects[code];
      pensumFull.subjectsMap![code] = {
        code: code,
        credits: subject.credits,
        equivalences: [],
        groupsMap: {},
        groups: [],
        hours: subject.hours,
        name: subject.name,
        requiredCredits: subject.requiredCredits,
        requisites: subject.requisites,
        semester: subject.semester,
        type: subject.type
      }
    }

    for (const subject of subjects) {
      pensumFull.subjectsMap![subject.code] = {
        ...pensumFull.subjectsMap![subject.code],
        groupsMap: subject.groups,
        equivalences: subject.equivalences.map(e => {return{ code: e, name: "" }})
      }

      for (const equivalenceCode of subject.equivalences) {
        const equivalence = equivalences[equivalenceCode];
        if (!equivalence) continue;
        if (Object.keys(pensumFull.subjectsMap![subject.code].groupsMap!).length === 0) {
          continue;
        }
        for (const eqGroup in equivalence.groups) {
          pensumFull.subjectsMap![subject.code].groupsMap![eqGroup] = equivalence.groups[eqGroup]
        }
      }
    }

    pensumFull.subjects = Object.values(pensumFull.subjectsMap!)


    for (const subject of pensumFull.subjects) {
      subject.groups = Object.values(subject.groupsMap!);

      delete subject.groupsMap;
    }

    delete pensumFull.subjectsMap;

    return pensumFull;
  }
}