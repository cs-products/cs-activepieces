import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';

import { formatDate, getAuthToken } from '../common/common';
import { httpRequest } from '../common/httpRequestSender';
import { HttpMethod } from '@activepieces/pieces-common';

export const catchThaisWebhook = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'catchThaisWebhook',
  displayName: 'Catch Thais Webhook',
  description: 'Catch Thais Webhook',
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
    const reqBody: any = body?.['data']?.['body']?.['data'] || '';
    try {
      if (reqBody?.['booking_id']) {
        const thaisToken = await getAuthToken(
          'thaisAPI',
          'thaisAPI2024',
          'https://demo.thais-hotel.com'
        );

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${thaisToken}`,
        };

        const thaisGeturl =
          'https://demo.thais-hotel.com' +
          '/hub/api/partner/hotel/bookings/' +
          reqBody?.['booking_id'];
        const req = {
          method: HttpMethod.GET,
          url: thaisGeturl,
          timeout: 5000,
          headers,
        };
        const thaisBookingResponse = await httpRequest(req);
        const gimmyResults = [];
        const reservation = thaisBookingResponse?.body;
        const booking_rooms = reservation?.booking_rooms || [];
        for (var book = 0; book < booking_rooms.length; book++) {
          const booking_room = booking_rooms[book];
          const gimmyObj: any = {
            nb_infants: booking_room?.nb_persons?.infants || 0,
            nb_children: booking_room?.nb_persons?.children || 0,
            nb_adults: booking_room?.nb_persons?.adults || 0,
            pms_id: reservation?.id ? reservation?.id?.toString() : '',
            cm_id: null,
            ota_id: null,
            booking_group_pms_id: reservation?.booking_group_id || '',
            date_from: reservation?.start_at ? reservation?.start_at : '',
            date_to: reservation?.end_at ? reservation?.end_at : '',
            created_at: reservation?.created_at
              ? formatDate(reservation?.created_at)
              : '',
            updated_at: reservation?.updated_at
              ? formatDate(reservation?.updated_at)
              : '',
            canceled_at: reservation?.canceled
              ? formatDate(reservation?.canceled_at)
              : null,
            no_show_at: null,
            booking_source: reservation?.source,
            booking_origin: reservation?.booking_origin?.label || '',
            booking_reason: reservation?.booking_reason?.label || '',
            room_id: booking_room?.room_id
              ? booking_room?.room_id?.toString()
              : '',
            room_label: booking_room?.room?.label || '',
            room_type_id: booking_room?.room?.room_type_id
              ? booking_room?.room?.room_type_id?.toString()
              : '',
            room_type_label: booking_room?.room?.room_type?.label || 'Room',
            rate_id: booking_room?.rate?.id
              ? booking_room?.rate?.id?.toString()
              : '',
            rate_label: booking_room?.rate?.label || '',
            customer: {
              pms_id: reservation?.customer?.id
                ? reservation?.customer?.id?.toString()
                : '',
              type: 'PERSON',
              firstname: reservation?.customer?.firstname || '',
              lastname: reservation?.customer?.lastname || '',
              email: reservation?.customer?.email || '',
              phone: reservation?.customer?.phone || '',
              mobile: '',
              street_address: reservation?.customer?.address || '',
              postcode: reservation?.customer?.postcode || '',
              city: reservation?.customer?.city || '',
              country: reservation?.customer?.country_iso2 || '',
              travel_card: null,
              birth_date: reservation?.customer?.birthdate || '',
              company:
                reservation?.customer?.company?.firstname +
                  reservation?.customer?.company?.lastName || '',
              siren: reservation?.customer?.siren || null,
              siret: reservation?.customer?.siret || null,
              civility: reservation?.customer?.civility?.label || 'M.',
              nationality: reservation?.customer?.nationality?.iso2 || 'FR',
              language: reservation?.customer?.language?.code || 'fr',
              customer_group:
                reservation?.customer?.customer_group?.label || '',
              customer_category:
                reservation?.customer?.customer_category?.label || '',
              customer_origin:
                reservation?.customer?.customer_origin?.label || '',
            },
          };

          const accommodations = booking_room?.accommodations || [];
          const extras = booking_room?.extras || [];

          const salesData = [...extras, ...accommodations];
          const sales = [];
          for (var s = 0; s < salesData.length; s++) {
            const sale = salesData[s];
            const currentDate = formatDate(sale?.consumedAt);
            const salesObject = {
              pms_id: `${gimmyObj.pms_id}-${currentDate}`,
              type:
                sale?.type == 'HOTEL_RESERVATION' ? 'ACCOMODATION' : 'EXTRA',
              label: `${sale?.category?.label} ${currentDate}`,
              quantity: sale?.quantity || 1,
              category_label: sale?.category?.label,
              category_id: sale?.category?.id
                ? sale?.category?.id?.toString()
                : '',
              product_label: null,
              product_id: null,
              is_offered: sale?.offered || false,
              amount_incl: sale?.amountIncludingTaxes
                ? sale?.amountIncludingTaxes.toFixed(2)
                : 0,
              amount_excl: sale?.amountExcludingTaxes
                ? sale?.amountExcludingTaxes.toFixed(2)
                : 0,
              currency: 'EUR',
              consumed_at: currentDate,
              created_at: sale?.createdAt,
              updated_at: sale?.updatedAt ? sale?.updatedAt : sale?.createdAt,
              canceled_at: null,
            };
            sales.push(salesObject);
          }

          gimmyResults.push({
            ...gimmyObj,
            sales,
          });
        }

        const gimmyAuth = {
          username: 'clicsoft',
          password: '8FK/nJrv5eWoK17RpcPuOS',
        };
        const gimmyloginReq = {
          method: 'POST' as HttpMethod,
          url: 'https://demo.hotel-data.fr' + '/pds/api/login',
          headers: { Accept: 'application/json' },
          body: JSON.stringify({
            login: gimmyAuth['username'],
            password: gimmyAuth['password'],
          }),
          timeout: 0,
        };

        const gimmyLoginResponse = await httpRequest(gimmyloginReq);
        const gimmyBody: any = gimmyLoginResponse?.body;
        const gimmyToken = gimmyBody?.token;
        console.log('gimmybody-------', gimmyBody?.token);

        let urlGimmy = `https://demo.hotel-data.fr/pds/api/bookings/${1}`;
        const gimmyReservationReq = {
          method: 'POST' as HttpMethod,
          url: urlGimmy,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${gimmyToken}`,
          },
          body: gimmyResults,
          timeout: 0,
        };
        const gimmyReservationResponse = await httpRequest(gimmyReservationReq);
        const gimmyReservationData: any = gimmyReservationResponse?.body;
        return gimmyReservationData;
      } else {
        return 'Booking Id not found';
      }
    } catch (error) {
      console.error('Error running fetchdata action:', error);
      throw error;
    }
  },
});
