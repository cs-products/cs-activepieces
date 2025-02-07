import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { decode, getAuthToken, mappedGetReservationData } from '../common/common';
import { HttpMethod } from '@activepieces/pieces-common';
import { httpRequest } from '../common/httpRequestSender';

export const searchReservations = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'searchReservations',
  displayName: 'Search Reservations',
  description: 'Search Reservations',
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
  async run(context: any) {
    const { body } = context.propsValue;
    if (!body) {
      return {
        status: 400,
        message: 'Request body missing!',
      };
    }
    const reqBody: any = body?.['data']?.['body'] || '';
    if (!reqBody) {
      return {
        status: 400,
        message: 'Request Headers missing!',
      };
    }
    const decodedObject = await decode(reqBody?.data || '');
    const data: any = decodedObject;
    const creds = data?.['credentials'];
    const { username, password } = creds;
    const { url, ref } = data;
    if (!url || !username || !password) {
      return {
        status: 400,
        message: 'Wrong Credentials/url',
      };
    }
    const getReservationsReqFilters = reqBody?.filters;
    const {
      startDate = null,
      endDate = null,
      dateType = null,
      state = null,
      pmsField = null,
    } = getReservationsReqFilters || {};

    try {
      const thaisToken = await getAuthToken(username, password, url);

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${thaisToken}`,
      };
      const queryParams: any = {};
      if (startDate) {
        if (dateType == 'arrival') {
          queryParams.start_at = startDate.split('T')[0];
        } else if (dateType === 'updated') {
          queryParams.updated_since = startDate.split('T')[0];
        } else if (dateType === "created") {
          queryParams.created_between = true;
          queryParams.from = startDate.split('T')[0];
        }
      }
      if (endDate) {
        if (dateType == 'arrival') {
          queryParams.end_at = endDate.split('T')[0];
        } else if (dateType === 'created') {
          queryParams.to = endDate.split('T')[0];
        }
      }
      // Fetch data from API
      const thaisBookingurl = url + '/hub/api/partner/hotel/bookings';
      const req = {
        method: HttpMethod.GET,
        url: thaisBookingurl,
        timeout: 5000,
        headers,
        queryParams,
      };
      const thaisResponse = await httpRequest(req);

      var thaisResData: any = thaisResponse?.body;
      if (thaisResData && thaisResData.length) {
        // if (startDate) {
        //   if (dateType === 'created') {
        //     thaisResData = thaisResData.filter(
        //       (item: any) => new Date(item?.created_at) >= new Date(startDate)
        //     );
        //   } else if (dateType === 'deleted') {
        //     thaisResData = thaisResData.filter(
        //       (item: any) =>
        //         item?.canceled == true &&
        //         new Date(item?.canceled_at) >= new Date(startDate)
        //     );
        //   }
        // }
        if (endDate) {
          if (dateType === 'updated') {
            thaisResData = thaisResData.filter(
              (item: any) => new Date(item?.updated_at) <= new Date(endDate)
            );
          } else if (dateType === 'deleted') {
            thaisResData = thaisResData.filter(
              (item: any) =>
                item?.canceled == true &&
                new Date(item?.canceled_at) <= new Date(endDate)
            );
          }
        }
        // if (state) {
        //   if (state == 'confirmed') {
        //     thaisResData = thaisResData.filter(
        //       (item: any) => item?.confirmed == true
        //     );
        //   } else {
        //     thaisResData = thaisResData.filter(
        //       (item: any) => item?.confirmed == false
        //     );
        //   }
        // }
        if (thaisResData && thaisResData.length) {
          const reservations: any = await mappedGetReservationData(
            thaisResData,
            ref,
            url,
            thaisToken
          );
          return { reservations };
        } else {
          return { reservations: {} };
        }
      } else {
        return { reservations: {} };
      }
    } catch (error) {
      console.error('Error running fetchdata action:', error);
      throw error;
    }
  },
});
