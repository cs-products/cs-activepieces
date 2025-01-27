import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { checkIfAllRequiredParamsArePresent, createHttpPostRequest, decode, transformRequest } from '../common/commonFunctions';
import { httpClient, HttpHeaders, HttpMethod } from '@activepieces/pieces-common';
import { ADD_COMPANY_OPTIONAL_PARAMS, ADD_COMPANY_REQUIRED_PARAMS, UPDATE_COMPANY_OPTIONAL_PARAMS } from '../common/constants';

export const updateCompany = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'updateCompany',
  displayName: 'Update Company',
  description: 'Update Company',
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
    console.log('lean log body 0', JSON.stringify(body));

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
      console.log("lean token response:::::", token);
      if (
        !checkIfAllRequiredParamsArePresent(
          leanBody,
          ADD_COMPANY_REQUIRED_PARAMS
        )
      ) {
        return {
          status: 400,
          message: 'Missing required details',
        };
      }
      const endpoint = `${data?.url}/api/v2/customers/companies/`;
      const headers: HttpHeaders = {
        Authorization: `Token ${token}`,
      };
  
      const transformedLeanRequestBody = transformRequest(
        leanBody,
        ADD_COMPANY_REQUIRED_PARAMS,
        UPDATE_COMPANY_OPTIONAL_PARAMS
      );

      console.log("transformed lean body:::", transformedLeanRequestBody);

      transformedLeanRequestBody['country_alfa2'] = transformedLeanRequestBody['country'];

      transformedLeanRequestBody['id'] = Number(transformedLeanRequestBody['id']);

      delete transformedLeanRequestBody['country'];
      const requestArray = [transformedLeanRequestBody]
      // return {requestArray}
      console.log(JSON.stringify(requestArray, null, 2));
      const request = createHttpPostRequest(
        'PUT' as HttpMethod,
        endpoint,
        headers,
        requestArray
      );
      
      const response = await httpClient.sendRequest(request);
      console.log('response 123', JSON.stringify(response));
      return {
        id: response.body[0]?.id || '',
        siretNumber: response.body[0]?.cif || '',
        vatNumber: response.body[0]?.['tax_id'] || '',
        name: response.body[0]?.name || '',
        email: response.body[0]?.email || '',
        phone: response.body[0]?.phone || '',
        address: {
          street: response.body[0]?.address,
          city: response.body[0]?.city,
          country: response.body[0]?.['country_alfa2'],
          zip: response.body[0]?.['postal_code'],
        },
      };
    }
    return {
      status: 401,
      message: 'Invalid Creds',
    };
  },
});
