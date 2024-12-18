import { HttpMethod } from "@activepieces/pieces-common";
import { httpRequest } from "./httpRequestSender";
// import { asyncStorage } from "./storage";



export const getConnectors = async (data: any, baseUrl: any) => {

    const { connectorType, connectorCode, isActive = false, author } = data

    let url = baseUrl + '/connectivity' + `?isActive=${isActive}`;
    if (connectorType) {
        url = url + `&connectorType=${connectorType}`
    }
    if (connectorCode) {
        url = url + `&connectorCode=${connectorCode}`
    }
    if (author) {
        url = url + `&author=${author}`
    }

    const headers = { Accept: 'application/json' };

    // Fetch data from API
    const httpResponse = await httpRequest({
        method: HttpMethod.GET,
        url,
        timeout: 5000,
        headers,
    });

    const responseData: any = httpResponse?.body;

    if (!responseData || !Array.isArray(responseData)) {
        throw new Error('Invalid response from API');
    }
    return responseData;
}