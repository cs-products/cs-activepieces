import {
  createAction,
  Property,
  DynamicPropsValue,
} from '@activepieces/pieces-framework';
import {
  createGatewayResponseForRooms,
  createSecretToken1,
  decode,
} from '../common/commonFunctions';
import { getRooms } from '../common/apis/getRooms';

export const getResources = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getResources',
  displayName: 'Get Resources',
  description: 'Get Resources',
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
    // Action logic here
    const { body } = context.propsValue;
    console.log('media log body 0', JSON.stringify(body));

    if (!body) {
      return {
        status: 400,
        message: 'Request body missing!',
      };
    }

    console.log('body data', JSON.stringify(body));

    const reqBody: any = body?.['data']?.['body'] || '';
    console.log('reqbody'.repeat(100));

    if (!reqBody) {
      return {
        status: 400,
        message: 'Request Headers missing!',
      };
    }

    const decodedObject = await decode(reqBody?.data || '');

    const data: any = decodedObject;
    const creds = data?.['credentials'];
    console.log('data', JSON.stringify(data));
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

    const endpoint = `${data?.url}/GetRooms`;

    const hotelId = data?.['hotelId'];

    console.log('endpoint', endpoint, hotelId, JSON.stringify(creds));
    const pwd = createSecretToken1(creds['Password'], hotelId);
    const response = await getRooms(endpoint, creds['Login'], pwd, hotelId);
    if (response?.status === 200)
      return createGatewayResponseForRooms(response);
    return response;
  },
});
