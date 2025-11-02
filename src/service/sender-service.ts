import { env } from "../env";
import { FetchingRequest } from "../interface/workflow-request-interfaces";
import { PensumFull } from "../interface/workflow-response-interfaces";


export async function sendRequestToFetcher(request: FetchingRequest) {
    await fetch(`${env.FETCHER_URL}/api/fetcher/fetch`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    })
}

export async function sendRequestToMainBackend(request: PensumFull){
    await fetch(`${env.MAIN_BACKEND_URL}/pensum`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    })
}