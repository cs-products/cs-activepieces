import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { createHttpPostRequest, decode } from '../common/commonFunctions';
import { httpClient, HttpHeaders, HttpMethod } from '@activepieces/pieces-common';

export const getResourceCategory = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getResourceCategory',
  displayName: 'Get Resource Category',
  description: 'Get Resource Category',
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
        message: 'Request body missing!!!',
        reqBodyres: body,
      };
    }

    // Parse the data string if it's a string
    let parsedData;
    try {
      if (typeof body?.['data'] === 'string') {
        parsedData = JSON.parse(body?.['data']);
      } else {
        parsedData = body?.['data'];
      }
    } catch (error) {
      return {
        status: 400,
        message: 'Invalid JSON in data field',
        reqBodyres: JSON.stringify(body),
        error: String(error)
      };
    }

    const reqBody: any = parsedData?.body;

    if (!reqBody) {
      return {
        status: 400,
        message: 'Request body missing in parsed data',
        reqBodyres: JSON.stringify(parsedData),
      };
    }

    // The data is in reqBody.data which is base64 encoded
    let decodedObject;
    try {
      decodedObject = await decode(reqBody?.data || '');
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to decode base64 data',
        reqBodyres: reqBody?.data,
        error: String(error)
      };
    }
    
    const data: any = decodedObject;
    const creds = data?.['credentials'];

    // Log the decoded data for debugging
    console.log("Decoded data:", JSON.stringify(data));

    if (
      !data?.url ||
      !data?.hotelId ||
      !creds?.['username'] ||
      !creds?.['password']
    ) {
      return {
        status: 400,
        message: 'Wrong Credentials/url',
        decodedData: data
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
        if (!data?.hotelId) {
        return {
          status: 400,
          message: 'Missing required details',
        };
      }

      const endpoint = `${data?.url}/api/v2/roomtypes?hotel=${Number(data?.hotelId)}`;
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
      
      const transformedRes = response.body.map((room:any) => {
        return {
          resourceCode: room.code || null,
          resourceLabel: room.name || null,
          minOccupancy: 1,
          maxOccupancy: room.max_pax || null,
          resourceType:
            room.channel_roomtype.length > 0
              ? room.channel_roomtype[0].channel_name
              : null,
          isActive: true,
          slots: {
            slotCodeFrom: null,
            slotCodeTo: null,
          },
          pmsFields: {
            serviceIds: null,
            ageCategory: {
              ageCategoryId: null,
              name: null,
              minimalAge: null,
              maximalAge: null,
            },
          },
        };
      });
      return {resourceTypes: transformedRes};
    }
    return {
      status: 401,
      message: 'Invalid Creds',
    };
  },
});
