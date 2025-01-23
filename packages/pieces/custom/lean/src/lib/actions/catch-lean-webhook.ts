import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import { getAuthToken } from '../common/getAuthToken';
import { getAllRooms } from '../common/getAllRooms';
import {
  createGimmyPayloadFromRequestBody,
  fetchRoomId,
} from '../common/commonFunctions';

export const catchLeanWebhook = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'catchLeanWebhook',
  displayName: 'Catch Lean Webhook',
  description: 'Catch Lean Webhook',
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
    const origin = 'https://uat-fr-pms.leanhotelsystem.com';
    const data = body?.['body'] || {};
    const hotelId = data?.['hotel']?.id;
    try {
      const authTokenResponse = await getAuthToken(
        origin,
        'api_clicsoft',
        'Clicsoft@123'
      );
      const authToken =
        authTokenResponse?.status == 200 ? authTokenResponse?.body?.token : '';
      console.log('auth token fetched');
      const allRoomsResponse = await getAllRooms(origin, authToken, hotelId);
      const roomId = fetchRoomId(data?.['room'], allRoomsResponse);
      console.log('Room id fetched', roomId);

      const gimmyPayload = createGimmyPayloadFromRequestBody(data, roomId);
      return { data: gimmyPayload };
    } catch (err: any) {
      console.log('Some error occured', JSON.stringify(err));
      return {
        status: 500,
        message: `Internal Server Error ${JSON.stringify(err)}`,
      };
    }
  },
});
