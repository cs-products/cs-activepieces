import { HttpMethod } from '@activepieces/pieces-common';
import { httpRequest } from './httpRequestSender';

export const formatDate = (date: any): string => {
  if (typeof date == 'string' && date.indexOf('T') != -1) {
    return date.split('T')[0];
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body);
  return JSON.parse(jsonString);
};

export const getAuthToken = async (
  username: any,
  password: any,
  baseUrl: any
) => {
  if (!username || !password || !baseUrl) {
    return '';
  }
  const url = baseUrl + '/hub/api/partner/login';
  const headers = { Accept: 'application/json' };
  const httpResponse = await httpRequest({
    method: HttpMethod.POST,
    url,
    body: { username, password },
    timeout: 5000,
    headers,
  });
  if (httpResponse?.body?.token) {
    return httpResponse.body?.token;
  } else {
    return '';
  }
};

export const filterData = (data: any, filters: any) => {
  return data.filter((item: any) => {
    const matchName = !filters.name || item.name === filters.name;
    const matchPhone = !filters.phone || item.phone === filters.phone;
    const matchEmail = !filters.email || item.email === filters.email;
    return matchName && matchPhone && matchEmail;
  });
};

export const getMinMaxConsumedAt = (data: any) => {
  if (!data.length) return { min: null, max: null };

  const dates = data.map((item: any) => new Date(item?.consumedAt));
  return {
    min: new Date(Math.min(...dates)).toISOString(),
    max: new Date(Math.max(...dates)).toISOString(),
  };
};

export const mappedGetReservationData = async (
  apiData: any,
  ref: string,
  url: string,
  thaisToken: string
) => {
  return new Promise(async (res, rej) => {
    const getAgeRangeUrl = url + '/hub/api/partner/hotel/age-ranges';
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${thaisToken}`,
    };
    const req = {
      method: HttpMethod.GET,
      url: getAgeRangeUrl,
      timeout: 5000,
      headers,
    };
    const thaisAgeRangeResponse = await httpRequest(req);

    const thaisAgeRangeData: any = thaisAgeRangeResponse?.body;
    const ageRangeAdult = thaisAgeRangeData.find(
      (range: any) => range?.mapping_key == 'adults'
    );
    const ageRangeChildren = thaisAgeRangeData.find(
      (range: any) => range?.mapping_key == 'children'
    );
    const ageRangeInfants = thaisAgeRangeData.find(
      (range: any) => range?.mapping_key == 'infants'
    );
    const bookingDataByDate: { [date: string]: any[] } = {};
    for (var a = 0; a < apiData.length; a++) {
      const reservation: any = apiData[a];
      const booking_rooms = reservation?.booking_rooms || [];
      const startDate = new Date(reservation?.start_at);
      const endDate = new Date(reservation?.end_at);
      for (
        let d = new Date(startDate);
        d <= new Date(endDate);
        d.setDate(d.getDate() + 1)
      ) {
        const currentDate = d.toISOString().split('T')[0];
        let roomTypes = [];
        // let extraOrders = [];

        for (const booking_room of booking_rooms) {
          const { adults, children, infants } = booking_room?.nb_persons;
          const guestCount = [];
          const ageCategory = [];

          if (adults) {
            guestCount.push({
              ageCategoryId: ageRangeAdult?.id,
              numberOfGuest: adults,
            });
            ageCategory.push({
              ageCategoryId: ageRangeAdult?.id,
              name: ageRangeAdult?.mapping_key,
              minimalAge: ageRangeAdult?.age,
              maximalAge: 100,
            });
          }
          if (children) {
            guestCount.push({
              ageCategoryId: ageRangeChildren?.id,
              numberOfGuest: children,
            });
            ageCategory.push({
              ageCategoryId: ageRangeChildren?.id,
              name: ageRangeChildren?.mapping_key,
              minimalAge: ageRangeChildren?.age,
              maximalAge: ageRangeAdult?.age - 1,
            });
          }
          if (infants) {
            guestCount.push({
              ageCategoryId: ageRangeInfants?.id,
              numberOfGuest: infants,
            });
            ageCategory.push({
              ageCategoryId: ageRangeInfants?.id,
              name: ageRangeInfants?.mapping_key,
              minimalAge: ageRangeInfants?.age,
              maximalAge: ageRangeChildren?.age - 1,
            });
          }

          const accommodations = booking_room?.accommodations || [];
          const extras = booking_room?.extras || [];

          const dailyAccommodations = accommodations.filter((acc: any) =>
            acc.consumedAt.startsWith(currentDate)
          );
          const dailyExtras = extras.filter((ext: any) =>
            ext.consumedAt.startsWith(currentDate)
          );
          const accommodationsOrders = dailyAccommodations.map((acc: any) => ({
            name: `${acc.category?.label}-${acc.type}`,
            count: acc.quantity,
            currency: 'EUR',
            amountAfterTax: acc.amountIncludingTaxes,
            taxValue: acc.amountIncludingTaxes - acc.amountExcludingTaxes,
            taxPercent: acc.amountExcludingTaxes
              ? ((acc.amountIncludingTaxes - acc.amountExcludingTaxes) /
                  acc.amountExcludingTaxes) *
                100
              : 0,
          }));

          const extraOrdersForDate = dailyExtras.map((extra: any) => ({
            name: `${extra.category?.label}-${extra.type}`,
            count: extra?.quantity,
            currency: 'EUR',
            amountAfterTax: extra?.amountIncludingTaxes,
            taxValue: extra?.amountIncludingTaxes - extra?.amountExcludingTaxes,
            taxPercent: extra?.amountExcludingTaxes
              ? ((extra?.amountIncludingTaxes - extra?.amountExcludingTaxes) /
                  extra?.amountExcludingTaxes) *
                100
              : 0,
          }));

          // extraOrders.push(...extraOrdersForDate);
          const { min, max } = getMinMaxConsumedAt(accommodations);
          const room_type_standard = {
            roomTypeCode: booking_room?.room?.room_type_id,
            roomTypeLabel: booking_room?.room?.room_type?.label,
            ratePlanCode: booking_room?.rate?.id,
            ratePlanLabel: booking_room?.rate?.label,
            isVirtual: false,
            amountAfterTax: booking_room?.total_incl_taxes_extras,
            discount: 0,
            taxValue: 0,
            taxPercent: booking_room?.rate?.vat_rate?.vat_rate,
            numberOfRooms: booking_rooms?.length ?? 0,
            guestCount: guestCount,
            slots: {},
            pmsFields: {
              serviceIds: '',
              ageCategory: ageCategory,
              tpSale: '',
              pmsState: '',
              voucherCode: '',
              guest: {
                id: reservation?.customer?.id,
                name: reservation?.customer?.firstname,
                surname: reservation?.customer?.lastname,
                email: reservation?.customer?.email,
                phone: reservation?.customer?.phone,
                address: {
                  street: reservation?.customer?.address,
                  city: reservation?.customer?.city,
                  state: '',
                  country: reservation?.customer?.country_iso2,
                  zip: reservation?.customer?.postcode,
                },
              },
              // booking_room?.rooming_customer,
              roomCode: booking_room?.room_id
                ? booking_room?.room_id?.toString()
                : '',
              roomCodeLabel: booking_room?.room?.label || '',
            },
            orderItems: [...accommodationsOrders, ...extraOrdersForDate],
          };
          if (accommodationsOrders && accommodationsOrders.length) {
            roomTypes.push(room_type_standard);
          }
        }
        const standardBookingObject = {
          fileId: reservation?.booking_group_id,
          yourRefId: reservation?.reference,
          guest: {
            companyId: '',
            contactId: '',
          },
          state: 'OPTION',
          marketing: {
            source: reservation?.source,
            segment: 'MICE',
            channel: reservation?.booking_origin?.label,
          },
          purpose: reservation?.booking_reason?.label,
          reservationId: reservation?.id,
          roomTypes: roomTypes,
          orderItems: [],
          createdAt: reservation?.created_at,
          updatedAt: reservation?.updated_at,
        };

        if (roomTypes && roomTypes.length) {
          if (!bookingDataByDate[currentDate]) {
            bookingDataByDate[currentDate] = [];
          }
          bookingDataByDate[currentDate].push(standardBookingObject);
        }
      }
      if (a == apiData.length - 1) {
        res(bookingDataByDate);
      }
    }
  });
};
