import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpHeaders, HttpMethod } from '@activepieces/pieces-common';
import { TAXES_KEYS_MAPPING } from '../../common/constants';
import { createHttpPostRequest, decode } from '../../common/commonFunctions';

interface Tax {
  id: number;
  description: string;
  value: number;
  active: boolean;
  erp_code: string;
  external_id: string | null;
}

export const getHotelConfig = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getHotelConfig',
  displayName: 'Get Hotel Config',
  description: 'Get Hotel Config',
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
          return {
            status: 400,
            message: 'Request body missing!',
          };
        }
    
        const reqBody: any = body?.['data']?.['body'];
    
        if (!reqBody) {
          return {
            status: 400,
            message: 'Request Headers missing!',
          };
        }
    
        const decodedObject = await decode(reqBody?.data || '');
        const leanBody: any = reqBody?.body;
        const data: any = decodedObject;
        const creds = data?.['credentials'];
    
        if (
          !data?.url ||
          !data?.hotelId ||
          !creds?.['username'] ||
          !creds?.['password']
        ) {
          return {
            status: 400,
            message: 'Wrong Credentials/url',
          };
        }
    
        const loginUrl = `${data?.url}/api/auth/`;
        const loginBody = {
          username: creds?.['username'],
          password: creds?.['password'],
        };
        const loginRequest = createHttpPostRequest("POST" as HttpMethod, loginUrl, {} as HttpHeaders, loginBody);
        const login = await httpClient.sendRequest(loginRequest);
        if (login && login?.body?.token) {
          const token = login?.body?.token;
          console.log("lean token response:::::", token, data.hotelId, typeof data.hotelId);
          // return {token, id: data.hotelId};
          const headers: HttpHeaders = {
              Authorization: `Token ${token}`,
          };
          const hotelEndPoint = `${data.url}/api/v2/hotels?id=${Number(data.hotelId)}`
          const taxesEndPoint = `${data.url}/api/v2/taxes/`;
          const companiesEndpoint = `${data.url}/api/v2/customers/companies`;
          const hotelRequest = createHttpPostRequest(
            'GET' as HttpMethod,
            hotelEndPoint,
            headers,
            {}
          );
          const taxesRequest = createHttpPostRequest(
            'GET' as HttpMethod,
            taxesEndPoint,
            headers,
            {}
          );
          const hotelRes = await httpClient.sendRequest(hotelRequest);
          const hotelInfo = hotelRes.body[0];
          console.log("hotel info", JSON.stringify(hotelInfo));
          const companyCode = hotelInfo?.chain_company_code || "";
          const companyRequest: any = createHttpPostRequest(
            'GET' as HttpMethod,
            companiesEndpoint,
            headers,
            {}
          );          
          const companyRes = await httpClient.sendRequest(companyRequest);
          console.log("companies request", JSON.stringify(companyRes));
          const currentCompany = companyRes?.status === 200 ? companyRes?.body?.results?.find((company: any)=> 
            company?.id === companyCode || company?.name === companyCode || company?.cif === companyCode) : {};

          const cif = currentCompany?.cif ?? "", taxNumber = (currentCompany?.tax_id || currentCompany?.tax2_id) ?? "";
        
          const taxesRes = await httpClient.sendRequest(taxesRequest);
          const taxes = taxesRes.body.map((tax: any)=> {
            return Object.keys(TAXES_KEYS_MAPPING).reduce(
              (acc: Record<string, any>, key: string) => {
                const newKey =
                  TAXES_KEYS_MAPPING[key as keyof typeof TAXES_KEYS_MAPPING];
                acc[newKey] = tax[key];
                return acc;
              },
              {}
            );
          })
          const transformedData = {
            hotel: {
              hotelCode: hotelInfo.hotel_code || null,
              name: hotelInfo.name || null,
              language: hotelInfo.Enterprise?.DefaultLanguageCode || null,
              currency: hotelInfo.Enterprise?.Currencies?.find((c: any) => c.IsDefault)?.Currency || null,
              isActive: true,
              cityTaxCode: taxes.TaxRates?.[0]?.Code || null,
              address: {
                address: hotelInfo.address || '',
                city: hotelInfo.city || '',
                zipCode: hotelInfo.postal_code || '',
                country: hotelInfo.country || '',
                email: hotelInfo.email || '',
                phone: hotelInfo.phone || '',
                cif: cif,
                taxNumber: taxNumber
            },
            additionalInfo: {
              taxes,
              }
            }
          }
          return transformedData;
        }
        return {
          status: 401,
          message: 'Invalid Creds',
        };
  },
});