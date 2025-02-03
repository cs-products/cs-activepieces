import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHTTPRequest";

export const getAllRooms = async (origin: string, token: string, hotelId: number) => {
    const endpoint = `${origin}/api/v2/rooms?hotel=${hotelId}`;
    try {
            const request = createHttpRequest(endpoint, {}, "GET", token);
            const response: any = await httpClient.sendRequest<{
                Services: any;
            }>(request);
            //console.log("response get rooms",JSON.stringify(response?.body));
            return response;
        } catch (err: any) {
        console.log("Error occured while fetching rooms!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
        }

}