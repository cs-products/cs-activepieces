import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpHeaders, HttpMethod } from '@activepieces/pieces-common';
import { createHttpPostRequest, decode } from '../common/commonFunctions';

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
    const leanBody: any = reqBody?.body;
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

     const loginUrl = `${data?.url}/api/auth/`;
        const loginBody = {
          username: creds?.['username'],
          password: creds?.['password'],
        };
      
        const loginRequest = createHttpPostRequest("POST" as HttpMethod, loginUrl, {} as HttpHeaders, loginBody);
        const login = await httpClient.sendRequest(loginRequest);
        if (login && login?.body?.token) {
          const token = login?.body?.token;
          console.log("lean token response:::::", token, leanBody);
          // return {leanBody};
           if (!leanBody?.id) {
            return {
              status: 400,
              message: 'Missing required details',
            };
          }

          const endpoint = `${data?.url}/api/v2/customers/people/${leanBody?.id}`;
          const headers: HttpHeaders = {
            Authorization: `Token ${token}`,
          };
          const request = createHttpPostRequest(
            'GET' as HttpMethod,
            endpoint,
            headers,
            {}
          );
          const response = await httpClient.sendRequest(request);
          return response.body;
        }
        return {
          status: 401,
          message: 'Invalid Creds',
        };
  },
});
