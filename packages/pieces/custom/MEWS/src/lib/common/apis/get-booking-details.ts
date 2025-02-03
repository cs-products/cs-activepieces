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

const pwd = "+TRUyyoC2oLBwc/1IEWIbg9kSLs6j79Tufyqtl7j6AHY4ZnP/dSEYeM8Xtrsq83uP0BdhYFKBxSUZP0930kpxg==";

export const getBookingDetails = async (reservationId: string, data: any) => {

    const endpoint = `https://interfaces.medialog.fr/Interface/GetBooking/${"960ReZ3735FCZ"}`;
    const password =  await createSecretToken("Hnkyj45*fd&#YZThnb6r6fd", "960");
    console.log("password",password);
    
    try {
        const request = createHttpPostRequest(endpoint, {}, "GET", {
            "Login": "SecretTestAccount"
        }, pwd, "960");
        console.log("request", JSON.stringify(request));
        const response: any = await httpClient.sendRequest<{
            Services: any;
        }>(request);
        console.log("response update contact request", JSON.stringify(response));
        return response;
        } catch (err: any) {
        console.log("Error occured while creating contact!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
        }


}

export const getRoomTypes = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetRoomTypes`;
  const password =  await createSecretToken("Hnkyj45*fd&#YZThnb6r6fd", "960");
  console.log("password",password);
  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, pwd, "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response update contact request", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while creating contact!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }
}


export const getRooms = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetRooms`;
  const password =  await createSecretToken("Hnkyj45*fd&#YZThnb6r6fd", "960");
  console.log("password",password);
  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, "+TRUyyoC2oLBwc/1IEWIbg9kSLs6j79Tufyqtl7j6AHY4ZnP/dSEYeM8Xtrsq83uP0BdhYFKBxSUZP0930kpxg==", "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response update contact request", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while creating contact!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }


}


export const getProductCategories = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetProductCategories`;
  const password =  await createSecretToken("Hnkyj45*fd&#YZThnb6r6fd", "960");
  console.log("password",password);
  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, "+TRUyyoC2oLBwc/1IEWIbg9kSLs6j79Tufyqtl7j6AHY4ZnP/dSEYeM8Xtrsq83uP0BdhYFKBxSUZP0930kpxg==", "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response update contact request", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while creating contact!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }
}


export const getProducts = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetProducts`;
  const password =  await createSecretToken("Hnkyj45*fd&#YZThnb6r6fd", "960");
  console.log("password",password);
  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, "+TRUyyoC2oLBwc/1IEWIbg9kSLs6j79Tufyqtl7j6AHY4ZnP/dSEYeM8Xtrsq83uP0BdhYFKBxSUZP0930kpxg==", "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response update contact request", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while creating contact!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }

}