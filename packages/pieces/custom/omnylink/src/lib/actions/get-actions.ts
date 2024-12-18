import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { getConnectors } from '../common/getConnectors';
import { getAuthToken } from '../common/getAuthToken';
import { getMethod } from '../common/getMethod';
import { httpRequest } from '../common/httpRequestSender';


export const getActions = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getActions',
  displayName: 'Get Actions',
  description: '',
  props: {
    connectorType: Property.Dropdown({
      displayName: 'Connector Type',
      description: 'Select a connector type from the list.',
      refreshers: ['auth'],
      required: true,
      defaultValue: '',
      options: async (propsValue) => {
        const { auth }: any = propsValue;
        const { baseUrl } = auth;
        if (!baseUrl) {
          return { options: [] };
        }
        const connectorResponse = await getConnectors({ isActive: true }, baseUrl);

        if (!connectorResponse || !Array.isArray(connectorResponse)) {
          throw new Error('Data is missing or invalid');
        }

        // Extract distinct connector types
        const uniqueConnectors = Array.from(
          new Set(connectorResponse.map((item: { connectorType: string }) => item.connectorType))
        );

        return {
          options: uniqueConnectors.map((connectorType: string) => ({
            label: connectorType,
            value: [connectorType, connectorResponse],
          })),
        };
      },
    }),

    connectorCode: Property.Dropdown({
      displayName: 'Connector',
      description: 'Select a connector from the list.',
      refreshers: ['connectorType'],
      required: true,
      defaultValue: '',
      options: async (propsValue) => {
        const { connectorType }: any = propsValue;
        if (!connectorType) {
          return { options: [] };
        }
        const connectorTypeData = connectorType[0]
        const connectorResponse = connectorType[1].filter((connector: any) => connector?.connectorType === connectorTypeData);

        if (!connectorResponse || !Array.isArray(connectorResponse)) {
          throw new Error('Data is missing or invalid');
        }

        const uniqueConnectors = Array.from(
          new Map(
            connectorResponse.map((item: { connectorCode: string }) => [item.connectorCode, item])
          ).values()
        );

        return {
          options: uniqueConnectors.map((item: { connectorCode: string }) => ({
            label: item.connectorCode,
            value: [item.connectorCode, connectorResponse],
          })),
        };
      },
    }),

    action: Property.Dropdown({
      displayName: 'Action',
      description: 'Select an action from the list.',
      refreshers: ['connectorCode'],
      required: true,
      defaultValue: '',
      options: async (propsValue) => {
        const { connectorCode }: any = propsValue;
        if (!connectorCode) {
          return { options: [] };
        }
        const connectorCodeData = connectorCode[0]
        const connectorResponse = connectorCode[1].filter((connector: any) => connector?.connectorCode === connectorCodeData);

        if (!connectorResponse || !Array.isArray(connectorResponse)) {
          throw new Error('Data is missing or invalid');
        }

        const uniqueActions = Array.from(
          new Map(
            connectorResponse.map((item: { action: string }) => [item.action, item])
          ).values()
        );

        return {
          options: uniqueActions.map((item: any) => ({
            label: item.action,
            value: item,
          })),
        };
      },
    }),
    body_type: Property.StaticDropdown({
      displayName: 'Body Type',
      required: true,
      defaultValue: 'none',
      options: {
        disabled: false,
        options: [
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
          case 'raw':
            fields['data'] = Property.LongText({
              displayName: 'Raw Body',
              required: true,
            });
            break;
        }
        return fields;
      },
    }),
  },
  async run(context: any) {
    const { action, body, auth } = context.propsValue
    const { connectorCode } = action;
    const { baseUrl } = auth;
    const token = await getAuthToken(context.auth, baseUrl)
    if (!token) {
      return { message: 'unauthorised' }
    }
    if (action?.endPoint) {
      const url = baseUrl + action?.endPoint;
      if (!body) {
        return 'Send Body From Catch Webhook';
      }

      const reqData = body["data"];
      const reqHeaders = reqData["headers"];
      const reqQueryParams = reqData["queryParams"];
      if (!reqHeaders) {
        return { message: "Send ReqHeaders in headers", data: reqData };
      }

      const { ref, reqparams } = reqHeaders;

      if (!ref || !reqparams) {
        return { message: "Send Proper Ref and reqParams in Headers", data: reqHeaders };
      }
      const headers = {
        Accept: 'application/json',
        connectWith: connectorCode,
        reqParams: reqparams,
        ref: ref,
        Authorization: `Bearer ${token}`,
      };

      const method = getMethod(action.method);

      if (!method) {
        return { message: "Method is Not Proper", data: action };
      }
      let httpResponse;
      const httpRequestOptions: any = {
        method: method,
        url,
        timeout: 5000,
        headers,
      };

      if (reqQueryParams && Object.keys(reqQueryParams).length) {
        httpRequestOptions.queryParams = reqQueryParams;
      }

      httpResponse = await httpRequest(httpRequestOptions);

      if (httpResponse?.body) {
        return httpResponse.body;
      } else {
        return { message: "Send ReqHeaders in headers", data: reqData };
      }
    } else {
      return 'EndPoint Not Found'
    }
  },
});