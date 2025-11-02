/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WorkflowController } from './../controller/controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Record_string._name_63_-string--code_63_-string--groups_63_-Record_string._name_63_-string--teacher_63_-string--program_63_-string--maxCapacity_63_-number--availableCapacity_63_-number--sessions_63__58__day_63_-number--beginHour_63_-number--endHour_63_-number--classroom_63_-string_-Array__--type_63_-MANDATORY-or-ELECTIVE--equivalences_63_-string-Array--credits_63_-number--hours_63_-number--semester_63_-number--requiredCredits_63_-number--requisites_63_-string-Array__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsWorkflowController_start: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"ci_session":{"dataType":"string","required":true}}},
        };
        app.post('/workflow',
            ...(fetchMiddlewares<RequestHandler>(WorkflowController)),
            ...(fetchMiddlewares<RequestHandler>(WorkflowController.prototype.start)),

            async function WorkflowController_start(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkflowController_start, request, response });

                const controller = new WorkflowController();

              await templateService.apiHandler({
                methodName: 'start',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkflowController_updateJob: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
                jobId: {"in":"path","name":"jobId","required":true,"dataType":"double"},
        };
        app.post('/workflow/job/:jobId',
            ...(fetchMiddlewares<RequestHandler>(WorkflowController)),
            ...(fetchMiddlewares<RequestHandler>(WorkflowController.prototype.updateJob)),

            async function WorkflowController_updateJob(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkflowController_updateJob, request, response });

                const controller = new WorkflowController();

              await templateService.apiHandler({
                methodName: 'updateJob',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkflowController_getWorkflowData: Record<string, TsoaRoute.ParameterSchema> = {
                uuid: {"in":"path","name":"uuid","required":true,"dataType":"string"},
        };
        app.get('/workflow/:uuid',
            ...(fetchMiddlewares<RequestHandler>(WorkflowController)),
            ...(fetchMiddlewares<RequestHandler>(WorkflowController.prototype.getWorkflowData)),

            async function WorkflowController_getWorkflowData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkflowController_getWorkflowData, request, response });

                const controller = new WorkflowController();

              await templateService.apiHandler({
                methodName: 'getWorkflowData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
