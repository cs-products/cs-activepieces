import {
  httpClient,
  HttpMethod,
  HttpRequest,
} from "@activepieces/pieces-common";
import {
  createAction,
  DynamicPropsValue,
  Property,
} from "@activepieces/pieces-framework";
import {
  addRservationWhichAreNotPresent,
  createBookingDetailsAccordingToGateway,
  createBookingResponse,
  createSecretToken,
  createSecretToken1,
  decode,
  randomMessageIdGenerator,
  transformArrivalDepartureResponse,
  transformBookingSoures,
  transformMarketOriginResponse,
  transformRoomTypesResponse,
  transformSegmentsResponse,
} from "../common/commonFunctions";
import {
  BookingDetailsRequestBody,
  BookingDetailsResponse,
} from "../common/types";
import { getArrivals } from "../common/apis/getArrivals";
import { getDepartures } from "../common/apis/getDepartures";
import { getRoomTypes } from "../common/apis/getRoomTypes";
import { getOrigins } from "../common/apis/getOrigins";
import { getSegments } from "../common/apis/getSegments";
import { getBookingSources } from "../common/apis/getBookingSources";

export const getReservations = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: "getReservations",
  displayName: "Get Reservations",
  description: "Get Reservations",

  props: {
    headers: Property.Object({
      displayName: "Headers",
      required: true,
    }),
    queryParams: Property.Object({
      displayName: "Query params",
      required: true,
    }),
    body_type: Property.StaticDropdown({
      displayName: "Body Type",
      required: true,
      defaultValue: "none",
      options: {
        disabled: false,
        options: [
          { label: "None", value: "none" },
          { label: "Form Data", value: "form_data" },
          { label: "JSON", value: "json" },
          { label: "Raw", value: "raw" },
        ],
      },
    }),
    body: Property.DynamicProperties({
      displayName: "Body",
      refreshers: ["body_type"],
      required: false,
      props: async ({ body_type }) => {
        if (!body_type) return {};

        const bodyTypeInput = body_type as unknown as string;

        const fields: DynamicPropsValue = {};

        switch (bodyTypeInput) {
          case "none":
            break;
          case "json":
            fields["data"] = Property.Json({
              displayName: "JSON Body",
              required: true,
            });
            break;
          case "raw":
            fields["data"] = Property.LongText({
              displayName: "Raw Body",
              required: true,
            });
            break;
          case "form_data":
            fields["data"] = Property.Object({
              displayName: "Form Data",
              required: true,
            });
            break;
        }
        return fields;
      },
    }),
  },

  async run(context) {
    const { body } = context.propsValue;

    if (!body) {
      return {
        status: 400,
        message: "Request body missing!",
      };
    }

    const reqBody: any = body?.["data"]?.["body"] || "";
    console.log("request body", JSON.stringify(reqBody))

    if (!reqBody) {
      return {
        status: 400,
        message: "Request Headers missing!",
      };
    }

    const decodedObject = await decode(reqBody?.data || "");
    const mediaLogBody: BookingDetailsRequestBody = reqBody?.["body"];
    const data: any = decodedObject;
    const creds = data?.["credentials"];
    console.log("decoded object", JSON.stringify(data));


    if (
      !data?.url ||
      !creds?.["Login"] ||
      !creds?.["Password"] ||
      !data["hotelId"] ||
      !mediaLogBody["startDate"] || 
      !mediaLogBody["endDate"]
    ) {
      return {
        status: 400,
        message: "Wrong Credentials/url/ request body",
      };
    }

    console.log("abcdddd");

    const dateFrom = mediaLogBody["startDate"];
    const dateTo = mediaLogBody["endDate"];
  
    const hotelId = data["hotelId"];

    const password = createSecretToken1(creds["Password"], hotelId);
    console.log("get all bookings");

    try {

      const allRoomTypesResponse = await getRoomTypes(`${data?.url}/GetRoomTypes`,creds["Login"], password, hotelId);
      const allRoomTypes = transformRoomTypesResponse(allRoomTypesResponse);
      console.log("all room types", JSON.stringify(allRoomTypes));
      const allChannels = await getOrigins(`${data?.url}/GetOrigines`, creds["Login"], password, hotelId);
      const allChannelTypes = transformMarketOriginResponse(allChannels);
      const allSegmentResponse = await getSegments(`${data?.url}/GetSegments`, creds["Login"], password, hotelId);
      const allSegments = transformSegmentsResponse(allSegmentResponse);
      const allBookingSourcesResponse = await getBookingSources(`${data?.url}/GetBookingSources`, creds["Login"], password, hotelId);
      const allBookingSources = transformBookingSoures(allBookingSourcesResponse);
      console.log("allBookingSourcesResponse",JSON.stringify(allBookingSourcesResponse));
      const currentDate = new Date(dateFrom);
      let condition = true;
      let allReservations = {};
      while(condition){
          console.log(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
          if(currentDate.getTime() > new Date(dateTo).getTime()) condition = false;
          const currentYear = currentDate.getFullYear(), currentMonth = currentDate.getMonth() + 1, currentDay = currentDate.getDate();
          const arrivalsEndpoint = `${data?.url}/GetArrivals/${currentYear}/${currentMonth}/${currentDay}`;
          const departuresEndpoint = `${data?.url}/GetDepartures/${currentYear}/${currentMonth}/${currentDay}`;
          const allArrivingReservations = await getArrivals(arrivalsEndpoint, creds["Login"], password, hotelId);
          if(allArrivingReservations.status == 200){
            const newReservations  = transformArrivalDepartureResponse(allArrivingReservations);
            console.log("new Res", JSON.stringify(Object.keys(newReservations)));
            allReservations = addRservationWhichAreNotPresent(newReservations, allReservations);
            console.log("all Res", JSON.stringify(Object.keys(allReservations)));
          }
          if(currentDate.getTime() != new Date(dateTo).getTime()){
            const allDepartingReservations = await getDepartures(departuresEndpoint, creds["Login"], password, hotelId);
            if(allDepartingReservations.status == 200){
              const newReservations  = transformArrivalDepartureResponse(allDepartingReservations);
              console.log("new Res deprtures", JSON.stringify(Object.keys(newReservations)));
              allReservations = addRservationWhichAreNotPresent(newReservations, allReservations);
              console.log("allReservations deprtures", JSON.stringify(Object.keys(newReservations)));
            }
          }
          console.log("allReservations:::", JSON.stringify(Object.keys(allReservations).length));
      }

      const reservationDetails = createBookingDetailsAccordingToGateway(allReservations, allRoomTypes, allChannelTypes, allSegments, allBookingSources)
      return  {
        status: 200,
        data: {
          "reservationDetails": reservationDetails,
          "allChannels": allChannelTypes,
          "allMarkets": allSegments,
          "allBookingSources": allBookingSources

        }
      }
    } catch (err: any) {
      console.log("Error occured while fetching booking details", err);
      return err?.response;
    }
  },
});

// url: /api/connector/v1/payments/addAlternative
