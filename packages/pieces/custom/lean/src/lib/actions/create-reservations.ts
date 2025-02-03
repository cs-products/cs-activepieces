import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { createReservationDataForLean, decode, fetchCheckinCheckoutDates } from '../../common/commonFunctions';
import { createReservation } from '../../common/createReservation';
import { getAuthToken } from '../../common/getAuthToken';
import { searchContact } from '../../common/searchContact';

export const createReservations = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'createReservations',
  displayName: 'Create Reservations',
  description: 'Create Reservations',
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
    const inputData = {
      "fileId": "GP1234",
      "yourRefId": "UA7hdf4",
      "guest": {
        "companyId": "489d0941-a99d-4d59-b655-b1b900906586",
        "contactId": "1027"
      },
      "state": "OPTION",
      "marketing": {
        "source": "Booking",
        "segment": "MICE",
        "channel": "Web"
      },
      "roomTypes": [
        {
          "date": "2023-10-10",
          "roomTypes": [
            {
              "roomTypeCode": "39cf5a44-d9d8-4ba6-88f2-af5400b895d5",
              "ratePlanCode": "241069e9-cd53-4077-9c05-b018008b4ac1",
              "amountAfterTax": 600.5,
              "discount": 120,
              "numberOfRooms": 3,
              "guestCount": [{
                "ageCategoryId": "ADULTS",
                "numberOfGuest": "2"
              }, {
                "ageCategoryId": "CHILDREN",
                "numberOfGuest": "3"
              }
            ],
              "slots": {
                "slotCodeFrom": "2024-10-01 12:00",
                "slotCodeTo": "2024-10-01 18:00"
              },
              "pmsFields": {
                "serviceIds": "46d3c250-c717-4012-97ba-af5400b88406",
                "ageCategory": {
                  "ageCategoryId": "d0f24ab9-034b-406f-b052-af5400b88516",
                  "name": "Adult",
                  "minimalAge": 18,
                  "maximalAge": 60
                },
                "tpSale": "FREE",
                "pmsState": "string",
                "voucherCode": "string"
              }
            }
          ]
        },
        {
          "date": "2023-10-11",
          "roomTypes": [
            {
              "roomTypeCode": "123",
              "ratePlanCode": "RatePlan123",
              "amountAfterTax": 625,
              "discount": 120,
              "numberOfRooms": 2,
              "guestCount": [{
                "ageCategoryId": "ADULTS",
                "numberOfGuest": "2"
              }
            ],
              "slots": {
                "slotCodeFrom": "2024-10-01 12:00",
                "slotCodeTo": "2024-10-01 18:00"
              },
              "pmsFields": {
                "serviceIds": "46d3c250-c717-4012-97ba-af5400b88406",
                "ageCategory": {
                  "ageCategoryId": "d0f24ab9-034b-406f-b052-af5400b88516",
                  "name": "Adult",
                  "minimalAge": 18,
                  "maximalAge": 60
                },
                "tpSale": "FREE",
                "pmsState": "string",
                "voucherCode": "string"
              }
            }
          ]
        },
        {
          "date": "2023-10-12",
          "roomTypes": [
            {
              "roomTypeCode": "123",
              "ratePlanCode": "12RatePlan123",
              "amountAfterTax": 605,
              "discount": 120,
              "numberOfRooms": 2,
              "guestCount": [{
                "ageCategoryId": "ADULTS",
                "numberOfGuest": "2"
              }
            ],
              "slots": {
                "slotCodeFrom": "2024-10-01 12:00",
                "slotCodeTo": "2024-10-01 18:00"
              },
              "pmsFields": {
                "serviceIds": "46d3c250-c717-4012-97ba-af5400b88406",
                "ageCategory": {
                  "ageCategoryId": "d0f24ab9-034b-406f-b052-af5400b88516",
                  "name": "Adult",
                  "minimalAge": 18,
                  "maximalAge": 60
                },
                "tpSale": "FREE",
                "pmsState": "string",
                "voucherCode": "string"
              }
            },
            {
              "roomTypeCode": "123",
              "ratePlanCode": "RatePlan123",
              "amountAfterTax": 605,
              "discount": 120,
              "numberOfRooms": 1,
              "guestCount": [{
                "ageCategoryId": "ADULTS",
                "numberOfGuest": "2"
              }
            ],
              "slots": {
                "slotCodeFrom": "2024-10-01 12:00",
                "slotCodeTo": "2024-10-01 18:00"
              },
              "pmsFields": {
                "serviceIds": "46d3c250-c717-4012-97ba-af5400b88406",
                "ageCategory": {
                  "ageCategoryId": "d0f24ab9-034b-406f-b052-af5400b88516",
                  "name": "Adult",
                  "minimalAge": 18,
                  "maximalAge": 60
                },
                "tpSale": "FREE",
                "pmsState": "string",
                "voucherCode": "string"
              }
            }
          ]
        }
      ]
    }
  try {

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

    const baseUrl = data?.url;
    const hotelId = data?.hotelId;
    const username = creds["username"];
    const password = creds["password"];
    const authTokenResponse = await getAuthToken(baseUrl, username, password);
    if(authTokenResponse?.status != 200) throw new Error("Authentication failed");
    const authToken = authTokenResponse?.body?.token;


    const customerDetailsResponse: any =  await searchContact(baseUrl, inputData?.guest?.contactId, authToken);
    if(customerDetailsResponse.status != 200) throw new Error("Unable to fetch customer details.");
    const customerDetails = customerDetailsResponse?.body?.results?.[0];

    const { reservationCheckinDate, reservationCheckoutDate } = fetchCheckinCheckoutDates(inputData);

    const leanReservationData = createReservationDataForLean(inputData, hotelId, customerDetails, reservationCheckinDate, reservationCheckoutDate);
    const createReservationResponse = await createReservation(baseUrl, authToken, leanReservationData);
    return leanReservationData;

  } catch(err:any){
    console.log("Some error occured", JSON.stringify(err));
    return {
      status: 500,
      message: `Internal Server Error ${JSON.stringify(err)}`
    }
  }
    

  },
});
