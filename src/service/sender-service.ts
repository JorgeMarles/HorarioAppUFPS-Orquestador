import { env } from "../env";
import { FetchingRequest } from "../interface/workflow-request-interfaces";
import { PensumFull } from "../interface/workflow-response-interfaces";
import { apiLogger } from "../util/logger";


export async function sendRequestToFetcher(request: FetchingRequest) {

    apiLogger.info(`Sending to fetcher backend ${JSON.stringify(request)}`);
    const response = await fetch(`${env.FETCHER_URL}/fetch`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    })
    if(!response.ok){
        throw Error(`HTTP Error ${`${env.FETCHER_URL}/fetch`} ${response.status} ${response.statusText}`)
    }
    return await response.json();
}

export async function sendRequestToMainBackend(request: PensumFull){
    apiLogger.info(`Sending to main backend ${request.subjects?.length} subjects`);

    const response = await fetch(`${env.MAIN_BACKEND_URL}/pensum`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    })
    if(!response.ok){
        throw Error(`HTTP Error ${response.status} ${response.statusText}`)
    }
}