import { httpClient, HttpMethod, HttpRequest } from "@activepieces/pieces-common";
import { createSecretToken, randomMessageIdGenerator } from "../commonFunctions";

export const createHttpPostRequest = (
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

export const getRoomTypes = async (reservationId: string, data: any) => {

    const endpoint = `https://interfaces.medialog.fr/Interface/GetRoomTypes`;
    const password =  await createSecretToken("Hnkyj45*fd&#YZThnb6r6fd", "960");
    console.log("password",password);
    
    try {
        const request = createHttpPostRequest(endpoint, {}, "GET", {
            "Login": "SecretTestAccount"
        }, password, "960");
        console.log("request", JSON.stringify(request));
        const response: any = await httpClient.sendRequest<{
            Services: any;
        }>(request);
        console.log("response get room types contact request", JSON.stringify(response));
        return response;
        } catch (err: any) {
        console.log("Error occured while creating contact!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
        }


}