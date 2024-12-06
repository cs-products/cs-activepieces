import { HttpMethod } from "@activepieces/pieces-common";
import { httpRequest } from "./httpRequestSender";



export const getConnectors = async () => {
    const baseUrl = 'http://192.168.19.20:4000';
    const url = baseUrl + '/connectivity';
    const headers = { Accept: 'application/json' };

    // Fetch data from API
    const httpResponse = await httpRequest({
        method: HttpMethod.GET,
        url,
        timeout: 5000,
        headers,
    });

    const data: any = httpResponse?.body;

    if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from API');
    }
    return data;
}