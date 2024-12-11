import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { MewsBody, MewsRequest, Service } from '../common/types';
import { checkIfAllRequiredParamsArePresent, createCredentialsParams, decode, transformCreateCompanyResponse, transformRequest, transformUpdateRequest } from '../common/commonFunctions';
import { UPDATE_COMPANY_OPTIONAL_PARAMS, UPDATE_COMPANY_REQUIRED_PARAMS } from '../common/constants';

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

    if (!body) {
      return;
    }
  

    const reqBody = body?.['data']?.['body'];
    console.log(JSON.stringify(reqBody));

    if (!reqBody) {
      throw new Error('Missing required data');
    }

    const decodedObject = await decode(reqBody.data);
    const mewsBody:any = reqBody.body
    const data: MewsRequest = decodedObject;
    const creds = data?.['credentials'];
    if (
      !data?.url ||
      !creds?.accessToken ||
      !creds?.clientToken ||
      !creds?.client
    ) {
      throw new Error('Missing required data1');
    }

    if(!checkIfAllRequiredParamsArePresent(mewsBody, UPDATE_COMPANY_REQUIRED_PARAMS)){
      throw new Error("Missing Required data of company");
    }

    const credObject = createCredentialsParams(creds);

    const endpoint = `${data?.url}/api/connector/v1/companies/update`;
    const createHttpPostRequest = (
      url: string,
      body: Record<string, any> = {}
    ): HttpRequest => ({
      method: 'POST' as HttpMethod,
      url,
      timeout: 5000,
      body: {
        ...credObject,
        ...body
      },
    });

    // console.log("endpoint".repeat(1000));
    const parsedBody = transformUpdateRequest(mewsBody, UPDATE_COMPANY_REQUIRED_PARAMS, UPDATE_COMPANY_OPTIONAL_PARAMS);

    console.log("parsedBody update",JSON.stringify(parsedBody), JSON.stringify(credObject));

    try {
      const request = createHttpPostRequest(endpoint, parsedBody);
      const response =  await httpClient.sendRequest<{
        Services: Service
      }>(request);
      return transformCreateCompanyResponse(response);
    } catch(err: any){
      console.log("Error occured while adding payment",JSON.stringify(err));
      return err?.response;
    }
  }
});

// url: /api/connector/v1/payments/addAlternative