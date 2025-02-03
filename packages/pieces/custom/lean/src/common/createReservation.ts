import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHTTPRequest";

export const createReservation = async (origin: string, token: string, body: any) => {
    const endpoint = `${origin}/api/v2/groupreservation`;
    try {
            const request = createHttpRequest(endpoint, body, "POST", token);
            const response: any = await httpClient.sendRequest<{
                Services: any;
            }>(request);
            console.log("response create reservation",JSON.stringify(response));
            return response;
        } catch (err: any) {
        console.log("Error occured while creating reservation!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
        }

}