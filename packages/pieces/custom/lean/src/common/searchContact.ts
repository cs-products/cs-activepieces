import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHTTPRequest"

export const searchContact = async (baseUrl: string, contactId: string, token: string) => {

    const endpoint = `${baseUrl}/api/v2/customers/people?customer_id=${contactId}`;
    try {
        const request = createHttpRequest(endpoint, {}, "GET", token);
        const contactResponse = await httpClient.sendRequest<{
                    Services: any;
                }>(request);
        
        return contactResponse;
    } catch(err:any){
        const message = `Some error occured while fetching contact details ${JSON.stringify(err)}`;
        console.log(message);
        return {
            status: err?.status || 500,
            message: message
        }
    }
    
}