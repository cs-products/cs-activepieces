import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { getAllRooms } from '../../common/getAllRooms';
import { getAuthToken } from '../../common/getAuthToken';
import { getRoomCategories } from '../../common/getRoomCategories';
import { transformResponseAccordingToGateway, transformRoomsResponse } from '../../common/commonFunctions';

export const getResourceCategories = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getResourceCategories',
  displayName: 'Get Resource Categories',
  description: 'Get Resource Categories',
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
  async run() {
    // Action logic here
    const baseUrl = "https://uat-fr-pms.leanhotelsystem.com";
    const hotelId = 1;
    const username = "api_clicsoft";
    const password = "Clicsoft@123";

  try {
    const authTokenResponse = await getAuthToken(baseUrl, username, password);
    const authToken = authTokenResponse?.status == 200 ? authTokenResponse?.body?.token  : "";
    const allRoomCategoriesResponse = await getRoomCategories(baseUrl, authToken, hotelId);
    const allRoomsResponse = await getAllRooms(baseUrl, authToken, hotelId);
    const roomCategoryWiseRooms = transformRoomsResponse(allRoomsResponse);
    console.log("room wise category", JSON.stringify(roomCategoryWiseRooms));
    return transformResponseAccordingToGateway(allRoomCategoriesResponse, roomCategoryWiseRooms)
  } catch(err: any){
    console.log("Some error occured!", JSON.stringify(err));
    return {
      status: 500,

    }
  }

  return {
    status: 200
  }
  
  },
});
