import {
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import {
  createSecretToken,
  createSecretToken1,
  decode,
  randomMessageIdGenerator,
  transformSearchContactResponse,
} from './../common/commonFunctions';
import { BookingDetailsRequestBody } from './../common/types';

export const searchContact = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'searchContact',
  displayName: 'Search Contact',
  description: 'Search Contact',

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
    console.log('run contact', JSON.stringify(body));

    if (!body) {
      return {
        status: 400,
        message: 'Request body missing!',
      };
    }

    const reqBody: any = body?.['data']?.['body'] || '';

    if (!reqBody) {
      return {
        status: 400,
        message: 'Request Headers missing!',
      };
    }

    const decodedObject = await decode(reqBody?.data || '');
    const mediaLogBody: any = reqBody?.body
    const data: any = decodedObject;
    const creds = data?.['credentials'];
    if (
      !data?.url ||
      !data?.hotelId ||
      !creds?.['Login'] ||
      !creds?.['Password']
    ) {
      return {
        status: 400,
        message: 'Wrong Credentials/url',
      };
    }

    const hotelId = data?.['hotelId'];
    const contactId = mediaLogBody?.['id'];
    const endpoint = `${data?.url}/GetKardex/${contactId}`;

    const password = await createSecretToken1(creds['Password'], hotelId);
    //console.log("creds",credentailsObject);
    const createHttpPostRequest = (
      url: string,
      body: Record<string, any> = {},
      method: string
    ): HttpRequest => ({
      method: method as HttpMethod,
      headers: {
        MessageID: randomMessageIdGenerator(),
        Login: creds?.['Login'],
        Password: password,
        IdHotel: hotelId,
      },
      body,
      url: url,
      timeout: 5000,
    });

    console.log('get contact', JSON.stringify(contactId));

    try {
      const request = createHttpPostRequest(endpoint, {}, 'GET');
      const response: any = await httpClient.sendRequest<{
        Services: any;
      }>(request);
      console.log('response get contact', JSON.stringify(response));
      return response.status == 200 && response?.body?.['ServerReturn']
        ? transformSearchContactResponse(response)
        : {
            status: 500,
            message: 'Some error occured!',
          };
    } catch (err: any) {
      console.log('Error occured while fetching contact details', err);
      return {
        status: 500,
        message: 'Some error occured!',
      };
    }
  },
});

// url: /api/connector/v1/payments/addAlternative
