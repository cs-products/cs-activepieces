import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { checkIfAllRequiredParamsArePresent, convertCreateContactRequestToMediaLogRequestType, createSecretToken, createSecretToken1, decode, randomMessageIdGenerator } from './../common/commonFunctions';
import { REQUIRED_PARAMS_CREATE_CONTACT } from './../common/constants';

export const addContact = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'addContact',
  displayName: 'Add Contact',
  description: 'Add Contact',

  props: {
    headers: Property.Object({
      displayName: 'Headers',
      required: true,
    }),
    queryParams: Property.Object({
      displayName: 'Query params',
      required: true,
    }),
    body_type: Property.StaticDropdown({
      displayName: 'Body Type',
      required: true,
      defaultValue: 'none',
      options: {
        disabled: false,
        options: [
          { label: 'None', value: 'none' },
          { label: 'Form Data', value: 'form_data' },
          { label: 'JSON', value: 'json' },
          { label: 'Raw', value: 'raw' },
        ],
      },
    }),
    body: Property.DynamicProperties({
      displayName: 'Body',
      refreshers: ['body_type'],
      required: false,
      props: async ({ body_type }) => {
        if (!body_type) return {};

        const bodyTypeInput = body_type as unknown as string;

        const fields: DynamicPropsValue = {};

        switch (bodyTypeInput) {
          case 'none':
            break;
          case 'json':
            fields['data'] = Property.Json({
              displayName: 'JSON Body',
              required: true,
            });
            break;
          case 'raw':
            fields['data'] = Property.LongText({
              displayName: 'Raw Body',
              required: true,
            });
            break;
          case 'form_data':
            fields['data'] = Property.Object({
              displayName: 'Form Data',
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
        message: "Request body missing!"
      }
    }
  

    const reqBody: any = body?.["data"]?.["body"];

    if (!reqBody) {
      return {
        status: 400,
        message: "Request Headers missing!"
      }
    }
    console.log("reqbody", JSON.stringify(reqBody))

    const decodedObject = await decode(reqBody?.data  || "");
    const mediaLogBody: any = reqBody?.["body"];


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
        message: "Wrong Credentials/url"
      }
    }

    const endpoint = `${data?.url}/AddKardex`;

    const hotelId = data?.["hotelId"];

    if(checkIfAllRequiredParamsArePresent(mediaLogBody, REQUIRED_PARAMS_CREATE_CONTACT)){
      if(!mediaLogBody?.phone && !mediaLogBody?.address && !mediaLogBody?.email){
        return {
          status: 400,
          message: "Incomplete data!"
        }
      }

    } else {
      return  {
        status: 400,
        message: "Incomplete data!"
      }
    }

    console.log("media log body", JSON.stringify(mediaLogBody));

    const password = createSecretToken1(creds["Password"], hotelId);

    const bodyData = convertCreateContactRequestToMediaLogRequestType(mediaLogBody);

    console.log("body data", JSON.stringify(bodyData));
    //console.log("creds",credentailsObject);
    const createHttpPostRequest = (
      url: string,
      body: Record<string, any> = {},
      method: string
    ): HttpRequest => ({
      method: method as HttpMethod,
      headers: {
        "MessageID": randomMessageIdGenerator(),
        "Login": creds?.["Login"],
        "Password": password,
        "IdHotel": hotelId
      },
      body,
      url: url,
      timeout: 5000
    });

    try {
      const request = createHttpPostRequest(endpoint, bodyData, "POST");
      const response: any=  await httpClient.sendRequest<{
        Services: any
      }>(request);
      console.log("response create request",JSON.stringify(response));
      if(response.status == 200 && !response?.body?.["Error"]){
        return {
          status: 200,
          body: {
            id: response?.["body"]?.["ServerReturn"],
            ...mediaLogBody
          }
        }
      } 
      return {
        status: 500,
        message: "Internal Server Error"
      };
    } catch(err: any){
      console.log("Error occured while creating contact!",err);
      return {
        status: 500,
        message: "Internal Server Error"
      };    
    }
  }
});

// url: /api/connector/v1/payments/addAlternative