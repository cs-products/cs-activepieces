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
  createGetPaymentModesResponseAccordingToGateWay,
  createSecretToken,
  createSecretToken1,
  decode,
  randomMessageIdGenerator,
} from './../common/commonFunctions';

export const getPaymentModes = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getPaymentModes',
  displayName: 'Get Payment Modes',
  description: 'Get Payment Modes',

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

    console.log('body123', JSON.stringify(body));

    if (!body) {
      return {
        status: 400,
        message: 'No body provided',
      };
    }

    const reqBody: any = body?.['data']?.['body'];

    if (!reqBody) {
      return {
        status: 400,
        message: 'No auth details',
      };
    }

    console.log('reqbody');

    const decodedObject = await decode(reqBody?.data);
    const data: any = decodedObject;
    const creds = data?.['credentials'];
    console.log(' getPaymentModes 333 creds \n', JSON.stringify(data));
    console.log('222 \n');

    if (
      !data?.url ||
      !creds?.['Login'] ||
      !creds?.['Password'] ||
      !data?.['hotelId']
    ) {
      return {
        status: 400,
        message: 'Wrong Credentials/url',
      };
    }

    const endpoint = `${data?.url}/GetPaymentModes`;

    const hotelId = data?.['hotelId'];

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

    console.log('get all payment modes');

    try {
      const request = createHttpPostRequest(endpoint, {}, 'GET');
      const response: any = await httpClient.sendRequest<{
        Services: any;
      }>(request);
      console.log('response get all booking ids');
      if (response.status == 200) {
        console.log('allRequestIds', JSON.stringify(response));
        return createGetPaymentModesResponseAccordingToGateWay(response);
      } else return response;
    } catch (err: any) {
      console.log('Error occured while fetching booking details', err);
      return {
        status: 500,
        message: 'Internal Sever Error!',
      };
    }
  },
});

// url: /api/connector/v1/payments/addAlternative
