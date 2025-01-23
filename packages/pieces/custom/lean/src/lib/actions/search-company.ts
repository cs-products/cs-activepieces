import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { createHttpPostRequest, decode } from '../common/commonFunctions';
import { httpClient, HttpHeaders, HttpMethod } from '@activepieces/pieces-common';

export const searchCompany = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'searchCompany',
  displayName: 'Search Company',
  description: 'Search Company',
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
    const data: any = decodedObject;
    const creds = data?.['credentials'];
    const leanBody: any = reqBody?.filters;

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
      console.log("lean token response:::::", token, data.hotelId);
      // return {leanBody};

      const endpoint = `${data?.url}/api/v2/customers/companies`;
      const headers: HttpHeaders = {
        Authorization: `Token ${token}`,
      };
      const queryParams: Record<string, string | undefined> = {
        id: leanBody?.id,
        name: leanBody?.name,
        phone: leanBody?.phone,
        email: leanBody?.email,
      };
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value); // Add only if value exists
        }
      });
      const finalEndPoint = `${endpoint}?${searchParams.toString()}`;
      const request = createHttpPostRequest(
        'GET' as HttpMethod,
        finalEndPoint,
        headers,
        {}
      );
      const response = await httpClient.sendRequest(request);
      const transformedRes = response.body.results.map((company:any) => {
        return {
          id: company.id || null,
          siretNumber: company.cif || null,
          vatNumber: company.tax_id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: {
            street: company.address,
            city: company.city,
            country: company.country_alfa2,
            zip: company.postal_code
          }
        };
      });
      return {deposits: transformedRes};
    }
    return {
      status: 401,
      message: 'Invalid Creds',
    };
  },
});
