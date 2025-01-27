import { HttpMethod, HttpRequest } from "@activepieces/pieces-common";

export const createHttpPostRequest = (
  method: HttpMethod,
  url: string,
  headers: Record<string, any> = {},
  additionalBody: Record<string, any> | any[] = {}
): HttpRequest => ({
  method,
  url,
  headers,
  timeout: 5000,
  body: Array.isArray(additionalBody)
    ? additionalBody // Directly assign the array if additionalBody is an array
    : {
        Limitation: {
          Cursor: null,
          Count: 999,
        },
        ...additionalBody, // Spread additionalBody if it's an object
      },
});

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

export const checkIfAllRequiredParamsArePresent = (
  requestBody: any,
  requiredParams: any
) => {
  const requestBodyKeys = Object.keys(requestBody);
  let allKeysPresent = true;
  Object.keys(requiredParams).forEach((param: string) => {
    if (!requestBodyKeys.includes(param)) allKeysPresent = false;
  });
  return allKeysPresent;
};

export const transformRequest = (
  requestBody: any,
  requiredParams: any,
  optionalParams: any
) => {
  const requestBodyKeys = Object.keys(requestBody);
  const requiredBody = Object.entries(requiredParams).reduce<
    Record<string, any>
  >((acc, [key, val]) => {
    let mewsKey: string;
    if (requestBodyKeys.includes(key)) {
      mewsKey = requiredParams[key] || '';
      acc[mewsKey] = requestBody?.[key];
    }
    return acc;
  }, {});

  const body = Object.entries(requestBody).reduce<Record<string, any>>(
    (acc, [key, val]) => {
      let mewsKey: string;
      if (Object.keys(optionalParams).includes(key)) {
        mewsKey = optionalParams[key] || '';
        acc[mewsKey] = val;
      }
      return acc;
    },
    { ...requiredBody }
  );

  if (body['address']) {
    body['address'] = requestBody?.['address']?.['street'] || '';
    body['city'] = requestBody?.['address']?.['city'] || '';
    body['country'] = requestBody?.['address']?.['country'] || '';
    body['postal_code'] = requestBody?.['address']?.['zip'] || '';
  }
  return body;
};

export const createGimmyPayloadFromRequestBody = (
  data: any,
  roomId: string
) => {
  const sales = data?.charge_set?.map((currentChargeDetails: any) => {
    return {
      pms_id: String(currentChargeDetails?.id) || '',
      type: 'ACCOMODATION', //todo
      label: currentChargeDetails?.description || '',
      quantity: currentChargeDetails?.quantity || 1,
      category_label: '',
      category_id: '0',
      product_label: null,
      product_id: null,
      is_offered: !currentChargeDetails?.is_billable,
      amount_incl: Math.round(
        Number(currentChargeDetails?.net_value) +
          Number(currentChargeDetails?.tax_value)
      ),
      amount_excl: Math.round(Number(currentChargeDetails?.net_value)),
      currency: currentChargeDetails?.currency || '',
      consumed_at: currentChargeDetails?.consumption_date,
      created_at: currentChargeDetails?.created_at,
      updated_at: currentChargeDetails?.updated_at,
      canceled_at: null,
    };
  });
  return [
    {
      hotel_id: 1,
      pms_id: String(data?.hotel?.id),
      booking_group_pms_id: '',
      cm_id: null,
      ota_id: null,
      date_from: data?.date_from?.split('T')?.[0] || '',
      date_to: data?.date_to?.split('T')?.[0] || '',
      created_at: data?.date_created || '',
      updated_at: data?.updated_at,
      canceled_at: data?.cancelled_at,
      no_show_at: null,
      booking_source: data?.source,
      booking_origin: '',
      booking_reason: '',
      room_id: String(roomId) || '',
      room_label: data?.room?.code || '',
      room_type_id: String(data?.room?.room_type_id) || '',
      room_type_label: data?.room?.room_type_code || '',
      rate_id: String(data?.rate?.id) || '',
      rate_label: data?.rate?.code,
      nb_infants: data?.total_babies,
      nb_children: data?.total_children,
      nb_adults: data?.total_adults,
      customer: {
        pms_id: String(data?.customer?.id) || '',
        type: data?.customer?.customer_type?.toUpperCase() || '',
        firstname: data?.customer?.name || '',
        lastname: data?.customer?.surname || '',
        email: data?.customer?.email || '',
        phone: data?.customer?.phone || '',
        mobile: '',
        street_address: '',
        postcode: data?.customer?.municipality_code || '',
        city: data?.customer?.city || '',
        country: data?.customer?.country_iso_2 || '',
        travel_card: null,
        birth_date: data?.customer?.birth_date || null,
        company: '',
        siren: '',
        siret: '',
        civility: data?.customer?.gender || '',
        nationality: data?.customer?.nationality_iso_2 || '',
        language: data?.customer?.language || '',
        customer_group: '',
        customer_category: '',
        customer_origin: '',
      },
      sales: [...sales],
      xdatas: [],
    },
  ];
};

export const fetchRoomId = (selectedRoom: any, allRoomsResponse: any) => {
  return (
    allRoomsResponse?.body?.find(
      (roomData: any) => roomData?.code == selectedRoom?.code
    )?.id || ''
  );
};
