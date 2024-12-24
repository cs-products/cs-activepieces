import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { MewsBody, MewsRequest, Service } from '../common/types';
import { decode, mapKeys } from '../common/common';

export const deleteCharges = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'deleteCharges',
  displayName: 'Delete Charges',
  description: 'Delete Charges',

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

    const reqBody = body?.['data']
    // console.log(JSON.stringify(reqBody));

    if (!reqBody) {
      throw new Error('Missing required data');
    }

    const decodedObject = await decode(reqBody.data);
    const mewsBody: MewsBody = reqBody.body
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
    const apiKeysToBody: Record<string, any> = {
      // Required Parameters.
      clienttoken: "ClientToken",
      accesstoken: "AccessToken",
      client: "Client",
      accountid: "AccountId",
      serviceid: "ServiceId",
      // Optional Parameters.
      billid: "BillId",
      linkedreservationid: "LinkedReservationId",
      consumptionutc: "ConsumptionUtc",
      productorders: "ProductOrders",
      items: "Items",
      enterpriseid: "EnterpriseId",
      notes: "Notes"
    }

    const credentailsObject = mapKeys(creds, apiKeysToBody)
    const origin = data.url;

    const endpoints = {
      addOrders: `${origin}/api/connector/v1/orders/add`,
    };

    const createHttpPostRequest = (
      url: string,
      body: Record<string, any> = {}
    ): HttpRequest => ({
      method: 'POST' as HttpMethod,
      url,
      timeout: 5000,
      body: {
        ...credentailsObject,
        ...body,
        "Limitation": {
          "Count": 10
        },
      },
    });

    const requests = {
      addOrders: createHttpPostRequest(endpoints.addOrders),
    };

    const parsedBody = mapKeys(mewsBody, apiKeysToBody)
    console.log("parsedBody", JSON.stringify(parsedBody))

    try {
      return await httpClient.sendRequest<{
        Services: Service
      }>(requests.addOrders);
    } catch (err: any) {
      return err?.response;
    }
  }
});