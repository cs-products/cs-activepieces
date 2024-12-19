import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { MewsRequest, Service } from '../common/types';
import { CREATE_COMPANY_OPTIONAL_PARAMS, CREATE_COMPANY_REQUIRED_PARAMS } from '../common/constants';
import { checkIfAllRequiredParamsArePresent, createCredentialsParams, decode, transformCreateCompanyResponse, transformRequest } from '../common/commonFunctions';

export const createCompany = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'createCompany',
  displayName: 'Create Company',
  description: 'Create Company',

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

  async run(context:any) {
    try{
      console.log("start create company");
      const { body } = context.propsValue;

      console.log("body",JSON.stringify(body))
      

      if (!body) {
        return {
          status: 400,
          message: "No body provided"
        }
      }

      const reqBody: any = body?.["data"]?.["body"];

      if (!reqBody) {
        return {
          status: 400,
          message: "No auth details"
        }
      }

      console.log("reqbody");

      const decodedObject = await decode(reqBody?.data);
      const mewsBody:any = reqBody?.["body"];
      const data: MewsRequest = decodedObject;
      const creds = data?.['credentials'];
      console.log("333 creds \n",JSON.stringify(data));

      if (
        !data?.url ||
        !creds?.accessToken ||
        !creds?.clientToken ||
        !creds?.client
      ) {
        return {
          status: 400,
          message: "Invalid auth details"
        }
      }

      console.log("mews body", JSON.stringify(mewsBody));

      if(!checkIfAllRequiredParamsArePresent(mewsBody, CREATE_COMPANY_REQUIRED_PARAMS)){
        return {
          status: 400,
          message: "Missing required details details"
        }
      }

    
      const credentialsParams = createCredentialsParams(creds);

      console.log("credentialsParams",JSON.stringify(credentialsParams));


      const endpoint = `${data?.url}/api/connector/v1/companies/add`;
      const createHttpPostRequest = (
        url: string,
        body: Record<string, any> = {}
      ): HttpRequest => ({
        method: 'POST' as HttpMethod,
        url,
        timeout: 5000,
        body: {
          ...credentialsParams,
          ...body
        },
      });

      const parsedBody = transformRequest(mewsBody, CREATE_COMPANY_REQUIRED_PARAMS, CREATE_COMPANY_OPTIONAL_PARAMS);

      console.log("parsed body",JSON.stringify(parsedBody),JSON.stringify(credentialsParams));

      try {
        const request = createHttpPostRequest(endpoint, parsedBody);
        const response =  await httpClient.sendRequest<{
          Services: Service
        }>(request);
        console.log("response 123",JSON.stringify(response));
        return transformCreateCompanyResponse(response);
      } catch(err: any){
        console.log("Error occured while adding company",JSON.stringify(err));
        return {
          status: 500,
          message: "Some error occured"
        }
      }
    } catch(err){
      return {
        status: 500,
        message: "Some error occured"
      }
    }
  }
});
