import { HttpMethod, HttpRequest } from "@activepieces/pieces-common";
import { randomMessageIdGenerator } from "../commonFunctions";

export const createHttpRequest = (
    url: string,
    body: Record<string, any> = {},
    method: string,
    creds: any,
    password: string,
    hotelId: string,
    ): HttpRequest => ({
    method: "GET" as HttpMethod,
    headers: {
        MessageID: randomMessageIdGenerator(),
        Login: creds?.["Login"],
        Password: password,
        IdHotel: hotelId,
    },
    url: url,
    timeout: 5000,
});
