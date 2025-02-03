import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHTTPRequest";

export const getAllReservations = async (origin: string, hotelId: string, token: string, body: any) => {

    const dateFrom = body.startDate.split("T")?.[0];
    const dateTo = body.endDate.split("T")?.[0];

    const params = new URLSearchParams();
    params.append("date_from", dateFrom);
    params.append("date_end", dateTo);
    //params.append("status", body.state);
    params.append("hotel", hotelId);

    const endpoint = `${origin}/api/v2/reservations?${params.toString()}`;
    console.log("endpount", endpoint)
    try {
        const request = createHttpRequest(endpoint, {}, "GET", token);
        const response: any = await httpClient.sendRequest<{
            Services: any;
        }>(request);
        console.log("response get reservations",JSON.stringify(response?.body?.results?.length));
        return response;
    } catch (err: any) {
        console.log("Error occured while fetching reservations!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
}