import { thaisAuth } from '@activepieces/piece-thais';
import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import {httpClient, HttpMethod, HttpRequest} from '@activepieces/pieces-common';

export const getHotelConfig = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getHotelConfig',
  displayName: 'Get Hotel Config',
  description: 'To fetch hotel details',
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
    const auth: any = context.auth;

    if (!auth || !auth['username'] || !auth['password']) {
      throw new Error(`Invalid auth`);
    }

    try {
      // Use username and password to fetch the token
      const loginUrl = 'https://demo.thais-hotel.com/hub/api/partner/login';
      const loginRequest: HttpRequest = {
        method: 'POST' as HttpMethod,
        url: loginUrl,
        headers: { Accept: 'application/json' },
        body: JSON.stringify({
          username: auth['username'],
          password: auth['password'],
        }),
        timeout: 0,
      };

      const login = await httpClient.sendRequest(loginRequest);
      if (login && login?.body?.token) {
        const token = login?.body?.token;
        console.log('Token from thais::::', token);
        return token;
      }
     
      //  // Call the getHotelConfig API with the token
      //  const response = await axios.get(
      //    `https://your-api.com/hotels/${hotelId}/config`,
      //    {
      //      headers: {
      //        Authorization: `Bearer ${token}`,
      //      },
      //    }
      //  );

      //  return response.data; // Return the API response
    } catch (error) {
      throw new Error(`Failed to fetch hotel config: ${error}`);
    }
  },
});
