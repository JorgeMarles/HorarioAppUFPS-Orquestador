import { JobType } from "@prisma/client";
import { z } from "zod";
import { success } from "zod/v4";


const SessionDataSchema = z.object({
    day: z.number(),
    beginHour: z.number(),
    endHour: z.number(),
    classroom: z.string(),
})

const GroupDataSchema = z.object({
    code: z.string(),
    teacher: z.string(),
    program: z.string(),
    maxCapacity: z.number(),
    availableCapacity: z.number(),
    sessions: z.array(SessionDataSchema),
});

const SubjectDataSchema = z.object({
    type: z.literal("SUBJECT"),
    isPrincipal: z.boolean(),
    code: z.string(),
    groups: z.record(z.string(), GroupDataSchema),
    equivalences: z.array(z.string()),
});

type SubjectData = z.infer<typeof SubjectDataSchema>;
type SessionData = z.infer<typeof SessionDataSchema>;
type GroupData = z.infer<typeof GroupDataSchema>;

/////////////////////////////////////////

const SubjectPensumDataSchema = z.object({
    code: z.string(),
    name: z.string(),
    credits: z.number(),
    hours: z.number(),
    semester: z.number(),
    requiredCredits: z.number().default(0),
    type: z.enum(["MANDATORY", "ELECTIVE"]),
    requisites: z.array(z.string()),
});

const PensumDataSchema = z.object({
    type: z.literal("PENSUM"),
    name: z.string().optional(),
    semesters: z.number().optional(),
    updateTeachers: z.boolean().optional(),
    subjects: z.record(z.string(), SubjectPensumDataSchema).optional(),
});

type PensumData = z.infer<typeof PensumDataSchema>;
type SubjectPensumData = z.infer<typeof SubjectPensumDataSchema>;

/////////////////////////////////////////

const DataUnionSchema = z.discriminatedUnion("type", [PensumDataSchema, SubjectDataSchema])

const JobResponseSchema = z.object({
    jobId: z.number(),
    success: z.boolean(),
    response: z.string(),
    data: DataUnionSchema.optional()
})

type JobResponse = z.infer<typeof JobResponseSchema>
type DataUnion = z.infer<typeof DataUnionSchema>

////////////////////////////////////////////

const SubjectFullSchema = z.object({
    code: z.string(),
    groupsMap: z.record(z.string(), GroupDataSchema).optional(),
    groups: z.array(GroupDataSchema),
    equivalences: z.array(z.string()),
    name: z.string(),
    credits: z.number(),
    hours: z.number(),
    semester: z.number(),
    requiredCredits: z.number().default(0),
    type: z.enum(["MANDATORY", "ELECTIVE"]),
    requisites: z.array(z.string()),
})

const PensumFullSchema = z.object({
    name: z.string().optional(),
    semesters: z.number().optional(),
    updateTeachers: z.boolean().optional(),
    subjectsMap: z.record(z.string(), SubjectFullSchema).optional(),
    subjects: z.array(SubjectFullSchema).optional()
})

type PensumFull = z.infer<typeof PensumFullSchema>
type SubjectFull = z.infer<typeof SubjectFullSchema>

export { SubjectData, SubjectDataSchema, SubjectPensumData, SubjectPensumDataSchema, SessionData, SessionDataSchema, GroupData, GroupDataSchema };
export { PensumData, PensumDataSchema };
export { JobResponse, JobResponseSchema, DataUnion, DataUnionSchema };
export { PensumFull, PensumFullSchema, SubjectFull, SubjectFullSchema }

