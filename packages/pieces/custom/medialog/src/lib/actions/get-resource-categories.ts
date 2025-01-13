import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import { getRoomTypes } from '../common/apis/getRoomTypes';
import {
  convertRoomResponse,
  convertRoomTypesData,
  createSecretToken1,
  decode,
} from '../common/commonFunctions';
import { getRooms } from '../common/apis/getRooms';

export const getresourcecategories = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getresourcecategories',
  displayName: 'Get Resource Categories',
  description: 'getResourceCategories',
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
    console.log('aaaa', JSON.stringify(context.propsValue));

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

    const data: any = decodedObject;
    const creds = data?.['credentials'];
    console.log('data'.repeat(10), JSON.stringify(data));
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

    const endpoint = `${data?.url}/GetRoomTypes`;
    const roomsEndpoint = `${data?.url}/GetRooms`;

    const hotelId = data?.['hotelId'];

    const pwd = createSecretToken1(creds['Password'], hotelId);
    const response = await getRoomTypes(endpoint, creds['Login'], pwd, hotelId);
    const roomsResponse = await getRooms(
      roomsEndpoint,
      creds['Login'],
      pwd,
      hotelId
    );

    const roomsData = convertRoomResponse(roomsResponse);
    console.log('rooms rsponse', JSON.stringify(roomsResponse));
    console.log('rooms data', JSON.stringify(roomsData));
    if (response?.status === 200)
      return convertRoomTypesData(response, roomsData);
    return response;
  },
});
