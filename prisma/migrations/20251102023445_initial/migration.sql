-- CreateEnum
CREATE TYPE "WorkflowState" AS ENUM ('PROCESSING', 'ERROR', 'SUCCESS', 'STOPPED');

-- CreateEnum
CREATE TYPE "JobState" AS ENUM ('PENDING', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PENSUM_INFO', 'SUBJECT_INFO', 'EQUIVALENCE_INFO');

-- CreateTable
CREATE TABLE "workflows" (
    "id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "state" "WorkflowState" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isUpdateTeachers" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" BIGSERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "JobType" NOT NULL,
    "data" JSONB,
    "state" "JobState" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "description" TEXT NOT NULL,
    "workflow_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
