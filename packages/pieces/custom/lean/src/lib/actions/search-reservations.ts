import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { createSearchReservationsResponse, decode, transformProductResponse, transformPurposeResponse, transformRoomCategoriesResponse } from '../common/commonFunctions';
import { getAuthToken } from '../common/getAuthToken';
import { getPurposes } from '../common/getPurposes';
import { getProducts } from '../common/getProducts';
import { getRoomCategories } from '../common/getRoomCategories';
import { getAllReservations } from '../common/getAllReservations';

export const searchReservations = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'searchReservations',
  displayName: 'Search Reservations',
  description: 'Search Reservations',
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

    try {
      const { body } = context.propsValue;
      if (!body) {
        return {
          status: 400,
          message: 'Request body missing!',
        };
      }
      const reqBody: any = body?.['data']?.['body'];

      if (!reqBody) {
        return {
          status: 400,
          message: 'Request Headers missing!',
        };
      }

      const decodedObject = await decode(reqBody?.data || '');
      const filters = reqBody?.filters;
      const data: any = decodedObject;
      const creds = data?.['credentials'];

      if (
        !data?.url ||
        !data?.hotelId ||
        !creds?.['username'] ||
        !creds?.['password']
      ) {
        return {
          status: 400,
          message: 'Wrong Credentials/url',
        };
      }
      const baseUrl = data?.url;
      const hotelId = data?.hotelId;
      const username = creds['username'];
      const password = creds['password'];
      const authTokenResponse = await getAuthToken(baseUrl, username, password);
      if (authTokenResponse?.status != 200)
        throw new Error('Authentication failed');
      const authToken = authTokenResponse?.body?.token;
      const purposesResponse = await getPurposes(baseUrl, authToken);
      const purposes =
        purposesResponse?.status == 200
          ? transformPurposeResponse(purposesResponse)
          : {};
      const roomCategoriesResponse = await getRoomCategories(
        baseUrl,
        authToken,
        hotelId
      );
      const roomCategories =
        roomCategoriesResponse?.status == 200
          ? transformRoomCategoriesResponse(roomCategoriesResponse)
          : {};
      const productResponse = await getProducts(baseUrl, hotelId, authToken);
      const products =
        productResponse?.status == 200
          ? transformProductResponse(productResponse)
          : {};

      const searchReservationsResponse = await getAllReservations(
        baseUrl,
        hotelId,
        authToken,
        filters
      );
      const reservations = createSearchReservationsResponse(
        searchReservationsResponse,
        purposes,
        roomCategories,
        products
      );
      return reservations;
      //return { searchReservationsResponse }
    } catch (err: any) {
      console.log(`Some error occured ${JSON.stringify(err)}`);
      return {
        status: 500,
        message: 'Internal Server Error!',
      };
    }
  },
});
