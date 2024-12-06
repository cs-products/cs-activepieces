import { createAction, DynamicProp, DynamicPropsValue, Property, StoreScope } from '@activepieces/pieces-framework';
import { getAuthToken } from '../common/getAuthToken';
import { HttpMethod } from '@activepieces/pieces-common';
import { httpRequest } from '../common/httpRequestSender';
import { getConnectors } from '../common/getConnectors';

export const getActions = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getActions',
  displayName: 'Get Actions',
  description: '',
  props: {
    connector_type: Property.Dropdown({
      displayName: 'Connector Type',
      description: 'Select a connector type from the list.',
      refreshers: [],
      required: true,
      defaultValue: '',
      options: async () => {
        const data = await getConnectors();

        if (!data || !Array.isArray(data)) {
          throw new Error('Data is missing or invalid');
        }

        // Extract distinct connector types
        const uniqueConnectors = Array.from(
          new Set(data.map((item: { connectorType: string }) => item.connectorType))
        );

        return {
          options: uniqueConnectors.map((connectorType: string) => ({
            label: connectorType,
            value: connectorType,
          })),
        };
      },
    }),

    connector_type_2: Property.Dropdown({
      displayName: 'Connector',
      description: 'Select a connector from the list.',
      refreshers: ['connector_type'], // Will refresh when connector_type changes
      required: true,
      defaultValue: '',
      options: async (propsValue) => {
        const { connector_type } = propsValue; // Retrieve selected connector_type
        const data = await getConnectors();

        if (!connector_type) {
          return { options: [] }; // Return empty options if no connector_type is selected
        }

        if (!data || !Array.isArray(data)) {
          throw new Error('Data is missing or invalid');
        }

        // Filter the connectors based on the selected connector_type
        const filteredConnectors = data.filter(
          (item: { connectorType: string }) => item.connectorType === connector_type
        );

        // Get unique connectors based on the `connector` field
        const uniqueConnectors = Array.from(
          new Map(
            filteredConnectors.map((item: { connectorCode: string }) => [item.connectorCode, item])
          ).values()
        );

        return {
          options: uniqueConnectors.map((item: { connectorCode: string }) => ({
            label: item.connectorCode,
            value: item.connectorCode,
          })),
        };
      },
    }),

    action: Property.Dropdown({
      displayName: 'Action',
      description: 'Select an action from the list.',
      refreshers: ['connector_type_2'], // Will refresh when connector changes
      required: true,
      defaultValue: '',
      options: async (propsValue) => {
        console.log("propsValue action", JSON.stringify(propsValue))
        const { connector_type_2 } = propsValue; // Retrieve both connector_type and connector
        const data = await getConnectors();

        if (!connector_type_2) {
          return { options: [] }; // Return empty options if no connector_type or connector is selected
        }

        if (!data || !Array.isArray(data)) {
          throw new Error('Data is missing or invalid');
        }

        // // Filter the actions based on both selected connector_type and connector
        const filteredActions = data.filter(
          (item: {  connectorCode: string }) =>
            item.connectorCode === connector_type_2
        );

        // // Get unique actions based on the `action` field
        const uniqueActions = Array.from(
          new Map(
            filteredActions.map((item: { action: string }) => [item.action, item])
          ).values()
        );

        return {
          options: uniqueActions.map((item: { action: string }) => ({
            label: item.action,
            value: item.action,
          })),
        };
      },
    }),
  },
  async run(context) {
    console.log("context", context)
    const { connector_type,
      connector_type_2,
      action } = context.propsValue

    const data = await getConnectors();
    const returnObject = data.filter((obj: any) => obj.connectorType === connector_type && obj.connectorCode === connector_type_2 && obj.action === action)

    return returnObject
    // Action logic here
  },
});
