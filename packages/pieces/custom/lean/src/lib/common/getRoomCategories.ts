import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHTTPRequest";

export const getRoomCategories = async (origin: string, token: string, hotelId: number | string) => {
    const endpoint = `${origin}/api/v2/roomtypes?hotel=${hotelId}`;
    try {
            const request = createHttpRequest(endpoint, {}, "GET", token);
            const response: any = await httpClient.sendRequest<{
                Services: any;
            }>(request);
            console.log("response get room categories",JSON.stringify(response?.body));
            return response;
        } catch (err: any) {
        console.log("Error occured while fetching room categories!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
        }

}