import { z } from "zod";

const BasicRequestSchema = z.object({
  jobId: z.number().optional(),
  cookie: z.string().optional(),
  callbackUrl: z.string().url().optional()
})

const PensumRequestSchema = z.object({
  type: z.literal("PENSUM"),
  updateTeachers: z.boolean()
});

const SubjectRequestSchema = z.object({
  type: z.literal("SUBJECT"),
  code: z.string(),
  isPrincipal: z.boolean()
});

const FetchingRequestSchemaData = z.discriminatedUnion("type", [
  PensumRequestSchema,
  SubjectRequestSchema,
]);

const FetchingRequestSchema = BasicRequestSchema.and(FetchingRequestSchemaData)

type PensumRequest = z.infer<typeof PensumRequestSchema>
type SubjectRequest = z.infer<typeof SubjectRequestSchema>
type FetchingRequest = z.infer<typeof FetchingRequestSchema>
type FetchingRequestData = z.infer<typeof FetchingRequestSchemaData>

export {
  PensumRequest,
  PensumRequestSchema,
  FetchingRequest,
  FetchingRequestSchema,
  SubjectRequest,
  SubjectRequestSchema,
  FetchingRequestData,
  FetchingRequestSchemaData
};
