import { Job, Workflow } from "@prisma/client";


export type WorkflowType = Workflow & {
  jobs: Job[],
};
