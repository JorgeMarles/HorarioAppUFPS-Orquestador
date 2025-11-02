import { env } from "../env";
import { FetchingRequest } from "../interface/workflow-request-interfaces";
import { PensumFull } from "../interface/workflow-response-interfaces";
import { apiLogger } from "../util/logger";


export async function sendRequestToFetcher(request: FetchingRequest) {
    await fetch(`${env.FETCHER_URL}/fetch`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    })
}

export async function sendRequestToMainBackend(request: PensumFull){

    apiLogger.info(JSON.stringify(request));

    await fetch(`${env.MAIN_BACKEND_URL}/pensum`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    })
}