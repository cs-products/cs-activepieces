import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { MewsBody, MewsRequest, Service } from '../common/types';
import { createCredentialsParams, decode } from '../common/commonFunctions';

export const deleteCompany = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'deleteCompany',
  displayName: 'Delete Company',
  description: 'Delete Company',

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

  async run(context :any) {

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

    if(!mewsBody?.id){
      return {
        status: 400,
        message: "Missing Company id"
      }
    }

    const credentailsObject = createCredentialsParams(creds);


    const endpoint = `${data?.url}/api/connector/v1/companies/delete`;
    const createHttpPostRequest = (
      url: string,
      body: Record<string, any> = {}
    ): HttpRequest => ({
      method: 'POST' as HttpMethod,
      url,
      timeout: 5000,
      body: {
        ...credentailsObject,
        ...body
      },
    });

    // console.log("endpoint".repeat(1000));
    const parsedBody = {
      "CompanyIds": [mewsBody.id]
    }

    console.log("parsedBody delete",JSON.stringify(parsedBody))

    try {
      const request = createHttpPostRequest(endpoint, parsedBody);
      const response =  await httpClient.sendRequest<{
        Services: Service
      }>(request);
      console.log("response delete",JSON.stringify(response));
      if(response?.status == 200){
        return {
          status: 200,
          message: "success"
        }
      } else {
        return {
          status: response?.status,
          message: "Invalid company ID"
        }
      }
    } catch(err: any){
      console.log("Error occured while performing delete operation",err);
      return {
        status: 500,
        message: "Some error occured!"
      };
    }
  }
});