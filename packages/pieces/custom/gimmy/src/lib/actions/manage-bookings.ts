import {
  httpClient,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpRequest,
  QueryParams,
} from '@activepieces/pieces-common';
import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import { assertNotNullOrUndefined } from '@activepieces/shared';
import FormData from 'form-data';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import { formatDate, getMinMaxConsumedAt } from '../../common/common';

export const gimmibookings = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'manageBookings',
  displayName: 'Manage Bookings',
  description: 'Create, update and delete bookings',
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
    try {
      const { body } = context.propsValue;
      const auth: any = context.auth;

      if (!body) {
        throw new Error(`Invalid request ${JSON.stringify(body)}`);
      }
      if (!auth || !auth['username'] || !auth['password']) {
        throw new Error(`Invalid auth`);
      }
      const loginUrl = 'https://demo.hotel-data.fr/pds/api/login';
      const loginRequest: HttpRequest = {
        method: 'POST' as HttpMethod,
        url: loginUrl,
        headers: { Accept: 'application/json' },
        body: JSON.stringify({
          login: auth['username'],
          password: auth['password'],
        }),
        timeout: 0,
      };
      const login = await httpClient.sendRequest(loginRequest);
      if (login && login?.body?.token) {
        const token = login?.body?.token;
        const reqBody = body['data']
        const finalReservations: any = []
        const dates = Object.keys(reqBody.reservations)
        for (var d = 0; d < dates.length; d++) {
          const date = dates[d]
          const reservations = reqBody.reservations[date]
          for (const reservation of reservations) {
            let existingReservation = finalReservations.find((res: any) => res.reservationId === reservation.reservationId);

            if (!existingReservation) {
              existingReservation = { ...reservation, roomTypes: [], dates: [date] };
              finalReservations.push(existingReservation);
            }

            // Process roomTypes
            for (const room of reservation.roomTypes) {
              const roomCode = room.pmsFields.roomCode;
              const existingRoom = existingReservation.roomTypes.find((r: any) => r.pmsFields.roomCode === roomCode);

              if (existingRoom) {
                // Merge orderItems within the room
                existingRoom.orderItems.push(
                  ...room.orderItems.map((item: any) => ({
                    ...item,
                    reservationId: reservation.reservationId,
                    consumedAt: date,
                    roomCode
                  }))
                );
              } else {
                // Add new room type entry
                existingReservation.roomTypes.push({
                  ...room,
                  orderItems: room.orderItems.map((item: any) => ({
                    ...item,
                    reservationId: reservation.reservationId,
                    consumedAt: date,
                    roomCode
                  }))
                });
                if (!existingReservation.dates.includes(date)) {
                  existingReservation.dates.push(date);
                } else {
                  console.log("Date already exists in the reservation.");
                }
              }
            }

            // Merge all orderItems at reservation level
            // existingReservation.orderItems.push(
            //   ...reservation.orderItems.map((item: any) => ({
            //     ...item,
            //     reservationId: reservation.reservationId,
            //     consumedAt: date,
            //   }))
            // );
            if (!existingReservation.dates.includes(date)) {
              existingReservation.dates.push(date);
            } else {
              console.log("Date already exists in the reservation.");
            }
          }
        }

        const gimmyResults: any = []
        for (var r = 0; r < finalReservations.length; r++) {
          const reservation = finalReservations[r]
          const { min, max } = getMinMaxConsumedAt(reservation?.dates)
          for (var rt = 0; rt < reservation?.roomTypes.length; rt++) {
            const booking_room = reservation?.roomTypes[rt]
            const pmsFields = booking_room?.pmsFields
            const customer = pmsFields?.guest
            var nb_infants = 0
            var nb_children = 0
            var nb_adults = 0
            const guestCount = booking_room?.guestCount
            for (var g = 0; g < guestCount.length; g++) {
              const guestCon = guestCount[g]
              const ageCat = pmsFields?.ageCategory.find((ageC: any) => ageC?.ageCategoryId == guestCon?.ageCategoryId)
              if (ageCat?.name == 'adults') {
                nb_adults = guestCon?.numberOfGuest
              } else if (ageCat?.name == 'children') {
                nb_children = guestCon?.numberOfGuest
              } else {
                nb_infants = guestCon?.numberOfGuest
              }
            }
            const gimmyObj: any = {
              nb_infants: nb_infants || 0,
              nb_children: nb_children || 0,
              nb_adults: nb_adults || 0,
              pms_id: reservation?.reservationId ? reservation?.reservationId?.toString() : "",
              pms_code: 'thais',
              cm_id: null,
              ota_id: null,
              booking_group_pms_id: reservation?.fileId || "",
              date_from: min ?? "", // slots
              date_to: max ?? "", //slots
              created_at: reservation?.createdAt ? formatDate(reservation?.createdAt) : "",
              updated_at: reservation?.updatedAt ? formatDate(reservation?.updatedAt) : "",
              canceled_at: null,
              no_show_at: null,
              booking_source: reservation?.marketing?.source,
              booking_origin: reservation?.marketing?.channel || "",
              booking_reason: reservation?.purpose || "",
              room_id: booking_room?.pmsFields?.roomCode ?? '',
              room_label: booking_room?.pmsFields?.roomCodeLabel || '',
              room_type_id: booking_room?.roomTypeCode ? booking_room?.roomTypeCode.toString() : "",
              room_type_label: booking_room?.roomTypeLabel || '',
              rate_id: booking_room?.ratePlanCode ? booking_room?.ratePlanCode.toString() : "",
              rate_label: booking_room?.ratePlanLabel || "",
              customer: {
                pms_id: customer?.id ? customer?.id?.toString() : '',
                type: "PERSON",
                firstname: customer?.name || '',
                lastname: customer?.surname || "",
                email: customer?.email || "",
                phone: customer?.phone || "",
                street_address: customer?.address?.street || "",
                postcode: customer?.address?.zip || "",
                city: customer?.address?.city || "",
                country: customer?.address?.country || ""
              }
            }

            const orderItems = booking_room?.orderItems
            const sales: any = []
            for (var o = 0; o < orderItems.length; o++) {
              const orderItem = orderItems[o]
              const orderName = orderItem?.name?.split("-")[0]
              const type = orderItem?.name?.split("-")[1]
              const salesObject = {
                pms_id: `${gimmyObj.pms_id}-${orderItem?.consumedAt}`,
                type: type === 'HOTEL_PURCHASE' ? "EXTRA" : "ACCOMODATION",
                label: `${orderName} ${orderItem?.consumedAt}`,
                quantity: orderItem?.count || 1,
                is_offered: false,
                amount_incl: orderItem?.amountAfterTax,
                amount_excl: (orderItem?.amountAfterTax - orderItem?.taxValue).toFixed(2),
                currency: "EUR",
                consumed_at: orderItem?.consumedAt,
                created_at: orderItem?.consumedAt,
                updated_at: orderItem?.consumedAt,
              }
              sales.push(salesObject)
            }

            gimmyResults.push({
              ...gimmyObj,
              sales
            })
          };
        }

        const hotelId = 1;
        if (!hotelId || !token) {
          throw new Error(`Invalid request ${JSON.stringify(body)}`);
        }
        let url = `https://demo.hotel-data.fr/pds/api/bookings/${hotelId}`;

        const headers: HttpHeaders = {
          Authorization: `Bearer ${token}`,
        };

        const request: HttpRequest = {
          method: 'POST' as HttpMethod,
          url,
          headers,
          body: gimmyResults,
          timeout: 0,
        };
        return await httpClient.sendRequest(request);
      }
      return {
        status: 401,
        message: 'Invalid Creds',
      };

    } catch (error) {
      console.error('Error running fetchdata action:', error);
      throw error;
    }
  },
});
