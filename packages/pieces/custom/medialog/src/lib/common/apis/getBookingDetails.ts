import { httpClient, HttpMethod, HttpRequest } from "@activepieces/pieces-common";
import { createSecretToken, createSecretToken1, randomMessageIdGenerator } from "../commonFunctions";

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

const pwd = createSecretToken1("Hnkyj45*fd&#YZThnb6r6fd", "960");

export const getBookingDetails = async (reservationId: string, data: any) => {

    const endpoint = `https://interfaces.medialog.fr/Interface/GetBooking/${"960ReZ36B3D2A"}`;
    const pwd = createSecretToken1("Hnkyj45*fd&#YZThnb6r6fd", "960");
    
    try {
        const request = createHttpPostRequest(endpoint, {}, "GET", {
            "Login": "SecretTestAccount"
        }, pwd, "960");
        console.log("request", JSON.stringify(request));
        const response: any = await httpClient.sendRequest<{
            Services: any;
        }>(request);
        console.log("response get booking details", JSON.stringify(response));
        return response;
        } catch (err: any) {
        console.log("Error occured while fetching booking details!", JSON.stringify(err));
        return {
            status: 500,
            message: "Internal Server Error",
        };
        }


}

export const getRoomTypes = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetRoomTypes`;
 
  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, pwd, "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response get room types", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while getting room types!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }
}


export const getRooms = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetRooms`;
 
  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, "+TRUyyoC2oLBwc/1IEWIbg9kSLs6j79Tufyqtl7j6AHY4ZnP/dSEYeM8Xtrsq83uP0BdhYFKBxSUZP0930kpxg==", "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response get rooms", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while getting rooms!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }


}


export const getProductCategories = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetProductCategories`;

  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, pwd, "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response get product cateories", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while getting product categories!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }
}


export const getProducts = async () => {

  const endpoint = `https://interfaces.medialog.fr/Interface/GetProducts`;

  
  try {
      const request = createHttpPostRequest(endpoint, {}, "GET", {
          "Login": "SecretTestAccount"
      }, pwd, "960");
      console.log("request", JSON.stringify(request));
      const response: any = await httpClient.sendRequest<{
          Services: any;
      }>(request);
      console.log("response get products", JSON.stringify(response));
      return response;
      } catch (err: any) {
      console.log("Error occured while getting product details!", JSON.stringify(err));
      return {
          status: 500,
          message: "Internal Server Error",
      };
      }

}