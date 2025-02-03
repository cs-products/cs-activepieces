import { httpClient } from "@activepieces/pieces-common";
import { createHttpRequest } from "./createHttpRequest";

export const getProductDetails = async (endpoint: string, login: string, password: string, hotelId: string) => {

    try {
        const request = createHttpRequest(endpoint, {}, "GET", {
            "Login": login
        }, password, hotelId);
        const response: any = await httpClient.sendRequest<{
            Services: any;
        }>(request);
        console.log("response get products",(response?.body?.ServerReturn?.length));
        return response;
    } catch (err: any) {
    console.log("Error occured while fetching products!", JSON.stringify(err));
    return {
        status: 500,
        message: "Internal Server Error",
    };
    }
}