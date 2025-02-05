import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { decode, getAuthToken } from '../common/common';
import { HttpMethod } from '@activepieces/pieces-common';
import { httpRequest } from '../common/httpRequestSender';

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
    const { username, password } = creds;
    const { url } = data;
    const getContactReqFilters = reqBody?.filters;
    if (!url || !username || !password) {
      return {
        status: 400,
        message: 'Wrong Credentials/url',
      };
    }

    try {
      const thaisToken = await getAuthToken(username, password, url);
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${thaisToken}`,
      };

      const { name, email, id, phone } = getContactReqFilters;
      var ids: any = [];
      const filters: any = {};

      if (id) {
        ids.push(id);
        filters['ids'] = ids;
      } else {
        if (name) {
          filters['q'] = name;
        }
        if (phone) {
          filters['q'] = phone;
        }
        if (email) {
          filters['q'] = email;
        }
      }

      const req = {
        method: HttpMethod.GET,
        url: url + `/hub/api/partner/resort/customers`,
        timeout: 5000,
        headers,
        queryParams: filters,
      };
      const thaisResponse = await httpRequest(req);
      const thaisResData: any = thaisResponse?.body
        ? thaisResponse?.body[0]
        : {};
      return {
        id: thaisResData?.id,
        name: thaisResData?.firstname,
        surname: thaisResData?.lastname,
        email: thaisResData?.email,
        phone: thaisResData?.cellphone
          ? thaisResData?.cellphone
          : thaisResData?.phone,
        address: {
          street: thaisResData?.address,
          city: thaisResData?.city,
          state: thaisResData?.nationality?.label,
          country: thaisResData?.country?.iso2,
          zip: thaisResData?.postcode,
        },
      };
    } catch (error) {
      console.error('Error running fetchdata action:', error);
      throw error;
    }
  },
});
