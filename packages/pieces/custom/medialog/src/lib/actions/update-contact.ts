import {
  createAction,
  DynamicPropsValue,
  Property,
} from "@activepieces/pieces-framework";
import {
  createSecretToken,
  createSecretToken1,
  decode,
  randomMessageIdGenerator,
  transformUpdateContactRequest,
} from "./../common/commonFunctions";
import {
  httpClient,
  HttpMethod,
  HttpRequest,
} from "@activepieces/pieces-common";

export const updateContact = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: "updateContact",
  displayName: "Update Contact",
  description: "Update Contact",

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

  async run(context: any) {
    // Action logic here

    // {
    //    "id": "ABCD"
    //   "name": "string",
    //   "surname": "string",
    //   "email": "string",
    //   "phone": "string",
    //   "address": {
    //     "street": "123 Main St",
    //     "city": "Springfield",
    //     "state": "IL",
    //     "country": "USA",
    //     "zip": "62701"
    //   }
    // }

    const { body } = context.propsValue;

    if (!body) {
      return {
        status: 400,
        message: "No body provided",
      };
    }
    

    const reqBody: any = body?.["data"]?.["body"];

    if (!reqBody) {
      return {
        status: 400,
        message: "No auth details",
      };
    }
    console.log("reqbody", JSON.stringify(reqBody))

    const decodedObject = await decode(reqBody.data);
    const mediaLogBody: any = reqBody?.body;

    const data: any = decodedObject;
    const creds = data?.["credentials"];
    if (
      !data?.url ||
      !data?.hotelId ||
      !creds?.["Login"] ||
      !creds?.["Password"]
    ) {
      return {
        status: 400,
        message: "Wrong Credentials/url",
      };
    }

    const medialogRequest: any = transformUpdateContactRequest(mediaLogBody);

    console.log("medialog update", JSON.stringify(medialogRequest));
    const hotelId = data?.["hotelId"];
    const password = await createSecretToken1(creds["Password"], hotelId);

    const endpoint = `${data?.url}/UpdateDatas`;
    const createHttpPostRequest = (
      url: string,
      body: Record<string, any> = {},
      method: string
    ): HttpRequest => ({
      method: method as HttpMethod,
      headers: {
        MessageID: randomMessageIdGenerator(),
        Login: creds?.["Login"],
        Password: password,
        IdHotel: hotelId,
      },
      body,
      url: url,
      timeout: 5000,
    });

    try {
      const request = createHttpPostRequest(endpoint, medialogRequest, "POST");
      const response: any = await httpClient.sendRequest<{
        Services: any;
      }>(request);
      console.log("response update contact request", JSON.stringify(response));
      if (
        response.status == 200 &&
        !response?.body?.["Error"] &&
        response?.body?.ServerReturn?.ErrorCode == 0
      ) {
        return {
          status: 200,
          message: "Contact updated successfully!",
        };
      }
      return {
        status: 500,
        message: "Internal Server Error",
      };
    } catch (err: any) {
      console.log("Error occured while creating contact!", err);
      return {
        status: 500,
        message: "Internal Server Error",
      };
    }
  },
});
