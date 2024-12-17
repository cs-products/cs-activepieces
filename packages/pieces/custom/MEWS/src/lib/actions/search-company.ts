import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { createHttpPostRequest, decode } from '../common/common';
import { MewsBody, MewsRequest, Company } from '../common/types';
import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';

export const searchcompany = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'searchcompany',
  displayName: 'Search Company',
  description: 'To search company based on some filters',
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
    const {body} = context.propsValue;

    if (!body) return;
    console.log("Body::::", body);

    const reqBody = body?.['data']?.['body'];

    if (!reqBody) {
      throw new Error('Missing required data');
    }
    console.log('reqBody', reqBody);
    const decodedObject = await decode(reqBody.data);
    const {filters} = reqBody;
    console.log(decodedObject, JSON.stringify(decodedObject));
    const mewsBody:MewsBody = reqBody.filters;
    const data: MewsRequest = decodedObject;
    const creds = data?.['credentials'];
    if (
      !data?.url ||
      !creds?.accessToken ||
      !creds?.clientToken ||
      !creds?.client
    ) {
      throw new Error('Missing required data');
    }
    const { accessToken, clientToken, client } = creds;
    const origin = data.url;
    const endpoint = `${origin}/api/connector/v1/companies/getAll`;
  
    const method = 'POST' as HttpMethod;
    const request = createHttpPostRequest(method, endpoint);

    request.body.ClientToken = clientToken;
    request.body.AccessToken = accessToken;
    request.body.Client = client;

    const names = mewsBody?.names &&  mewsBody?.names.split(",");
    const ids = mewsBody?.ids &&  mewsBody?.ids.split(",");
    if (names && names.length > 0) {
      request.body.Names = names;
    }
    if (ids && ids.length > 0) {
      request.body.Ids = ids;
    }

    let companyRes: any = {};
    try {
      companyRes = await httpClient.sendRequest<any>(request);
      if (!companyRes?.body?.Companies) {
        throw new Error("companies data not found");
      }
      // return companyRes.body;
      const transformedCompanies = companyRes?.body?.['Companies'].map((company: Company) => {
        return {
          id: company.Id,
          siretNumber: company?.siretNumber || '',
          vatNumber: company?.vatNumber || '',
          name: company?.Name,
          email: company?.InvoicingEmail || '',
          phone: company?.Telephone || '',
          address: {
            street: `${company?.Address?.Line1} ${company?.Address?.Line2}` || '',
            city: company?.Address?.City || '',
            country: company?.Address?.CountryCode || '',
            zip: company?.Address?.PostalCode || ''
        }
      };
    });
    console.log("transflrmed companies::::", transformedCompanies);
        return transformedCompanies;
    } catch (error) {
        throw new Error(`Failed to fetch companies ${JSON.stringify(error)}`);
    }
  },
});
