import { createAction, Property, DynamicPropsValue } from '@activepieces/pieces-framework';
import { createGatewayResponseForCountryCultures, createGateWayResponseForHotelInfo, createGatewayResponseForSegments, createSecretToken1, decode } from '../common/commonFunctions';
import { getHotelDetails } from '../common/apis/getHotelIDetails';
import { getSegments } from '../common/apis/getSegments';
import { getCountryCultures } from '../common/apis/getCountryCultures';

export const getHotelInfo = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getHotelInfo',
  displayName: 'Get Hotel Info',
  description: 'Get Hotel Info',
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
      // Action logic here
  
        const { body } = context.propsValue;
          console.log("media log body 0", JSON.stringify(body));
      
          if (!body) {
            return {
              status: 400,
              message: "Request body missing!"
            }
          }
        
      
          const reqBody: any = body?.["data"]?.["body"] || "";
      
          if (!reqBody) {
            return {
              status: 400,
              message: "Request Headers missing!"
            }
          }
      
          const decodedObject = await decode(reqBody?.data || "");
      
          const data: any = decodedObject;
          const creds = data?.["credentials"];
          console.log("data", JSON.stringify(data))
          if (
            !data?.url ||
            !data?.hotelId ||
            !creds?.["Login"] ||
            !creds?.["Password"]
          ) {
            return {
              status: 400,
              message: "Wrong Credentials/url"
            }
          }
      const endpoint = `${data?.url}/GetPmsProperties`;
  
      const hotelId = data?.["hotelId"];
  
      // console.log("endpoint", endpoint, hotelId, JSON.stringify(creds));
      const pwd = createSecretToken1(creds?.["Password"], hotelId);
      const response = await getHotelDetails(endpoint, creds["Login"],  pwd, hotelId);

      if(response?.status === 200){
        const segmentsEndpoint = `${data?.url}/GetSegments`;

        const segmentsResponse = await getSegments(segmentsEndpoint, creds["Login"], pwd, hotelId);
  
        const segments = segmentsResponse?.status == 200 ? createGatewayResponseForSegments(segmentsResponse) : [];
  
        console.log("segments", JSON.stringify(segments))
  
        const countryCulturesEndpoint = `${data?.url}/GetCultures`;
  
        const cultureDetailsresponse = await getCountryCultures(countryCulturesEndpoint, creds["Login"], pwd, hotelId);
  
        const hotelCulture = cultureDetailsresponse?.status == 200 ? createGatewayResponseForCountryCultures(cultureDetailsresponse) : "";
        console.log("cultures", JSON.stringify(cultureDetailsresponse));
        console.log("flow complete");
        return createGateWayResponseForHotelInfo(hotelId, response, segments, hotelCulture);
      }
      return response;
    },
});
