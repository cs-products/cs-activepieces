import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { decode, getAuthToken } from '../common/common';
import { HttpMethod } from '@activepieces/pieces-common';
import { httpRequest } from '../common/httpRequestSender';

export const getProducts = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getProducts',
  displayName: 'Get Products',
  description: 'Get Products',
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
     const { username, password } = creds;
     const { url } = data;
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

       // Fetch data from API
       const thaisGetRate = url + '/hub/api/partner/resort/articles';
       const req = {
         method: HttpMethod.GET,
         url: thaisGetRate,
         timeout: 5000,
         headers,
       };
       const thaisResponse = await httpRequest(req);
       const thaisResData: any = thaisResponse?.body;
       const productsRes: any = [];
       for (var r = 0; r < thaisResData.length; r++) {
         const itm = thaisResData[r];
         const obj = {
           productCode: itm?.id,
           productLabel: itm?.label,
           productType: itm?.article_category?.label,
           priceType: 'PERSON',
           tax: {
             taxCode: itm?.vat_rate?.id,
             taxValue: itm?.vat_rate?.vat_rate,
           },
           isActive: itm?.bookable,
         };
         productsRes.push(obj);
       }

       return { products: productsRes };
     } catch (error) {
       console.error('Error running fetchdata action:', error);
       throw error;
     }
  },
});
