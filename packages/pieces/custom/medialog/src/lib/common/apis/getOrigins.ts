import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHttpRequest";

export const getOrigins = async (endpoint: string, login: string, password: string, hotelId: string) => {

    try {
        const request = createHttpRequest(endpoint, {}, "GET", {
            "Login": login
        }, password, hotelId);
        const response: any = await httpClient.sendRequest<{
            Services: any;
        }>(request);
        console.log("response get origins", (response?.body?.ServerReturn?.length));
        return response;
    } catch (err: any) {
    console.log("Error occured while fetching origins!", JSON.stringify(err));
    return {
        status: 500,
        message: "Internal Server Error",
    };
    }
}