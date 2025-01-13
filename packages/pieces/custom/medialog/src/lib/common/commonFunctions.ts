import {
  OPTIONAL_PARAMS_CREATE_CONTACT,
  REQUIRED_PARAMS_CREATE_CONTACT,
  UPDATE_CONTACT_CHANGE_FIELDS,
  UPDATE_CONTACT_PARAMS,
} from './constants';
// import {
//   BookingDetailsDTO,
//   BookingDetailsResponse,
//   SingleBookingResponse,
// } from './types';
import crypto from 'crypto';

export const RESERVATION_STATUS_ENUM = {
  R: 'Confirmed',
  O: 'Option',
  P: 'In-House',
  D: 'Gone',
  S: 'Cancelled',
};

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

// Calculate total amount of the room based on charges per room.
export const calculateBookingAmt = (bookingDetail: any) =>
  bookingDetail?.['Produits']?.reduce(
    (acc: number, curr: any) => acc + (curr?.['MontantCa'] ?? 0),
    0
  );

const sha512Base64 = (seed: string) => {
  // Convert the seed to a Uint8Array (byte array)
  const encoder = new TextEncoder();
  const data = encoder.encode(seed.toString());

  // Create SHA-512 hash
  return crypto.subtle.digest('SHA-512', data).then((hashBuffer: any) => {
    // Convert hash buffer to base64 string
    const hashArray = new Uint8Array(hashBuffer);
    let binary = '';
    for (let i = 0; i < hashArray.length; i++) {
      binary += String.fromCharCode(hashArray[i]);
    }
    return btoa(binary); // base64 encode the binary data
  });
};

export const createSecretToken = async (password: string, hotelId: string) => {
  const todayDate = new Date();

  console.log("todays's date", todayDate);
  const seed = `${todayDate.getDate()}${todayDate.getFullYear()}${password}${
    todayDate.getMonth() + 1
  }${hotelId}`;
  return await sha512Base64(seed);
};

export const randomMessageIdGenerator = () => {
  let messageId = '';
  // eslint-disable-next-line no-constant-condition
  while (1) {
    const j = Math.floor((Math.random() * 1000) % 128);
    if ((j >= 48 && j <= 57) || (j >= 65 && j <= 90))
      messageId += String.fromCharCode(j);
    if (messageId.length == 32) break;
  }
  console.log(messageId);
  return messageId;
};

export const createSecretToken1 = (password: string, hotelId: string) => {
  const now = new Date(); // Note: Month is 0-indexed in JavaScript (July is 6)
  const tday_day = String(now.getDate()).padStart(2, '0'); // Format as 2-digit string
  const tday_month = String(now.getMonth() + 1).padStart(2, '0'); // JavaScript months are 0-indexed, so we add 1
  const tday_year = String(now.getFullYear());

  // Create the seed string
  const seed = tday_day + tday_year + password + tday_month + hotelId;

  // Create SHA-512 hash
  const sha512Hash = crypto.createHash('sha512').update(seed, 'utf8').digest();

  // Base64 encode the hash
  const b64Hash = sha512Hash.toString('base64');
  return b64Hash;
};
//
// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

// console.log("Try programiz.pro");

export const createMediaLogResponse = (
  bookings: any,
  paramStartDate: string,
  paramEndDate: string
) => {
  const data = Object.keys(bookings).reduce<Record<string, any>>(
    (acc, bookingId) => {
      const endDate = new Date(bookings[bookingId]?.['Dates']?.DateEnd);
      const endMonth =
        endDate.getMonth() + 1 < 10
          ? `0${endDate.getMonth() + 1}`
          : `${endDate.getMonth() + 1}`;
      const endDateString = `${endDate.getFullYear()}-${endMonth}-${endDate.getDate()}`;

      const startDate = new Date(bookings[bookingId]?.['Dates']?.DateStart);
      const startMonth =
        startDate.getMonth() + 1 < 10
          ? `0${startDate.getMonth() + 1}`
          : `${startDate.getMonth() + 1}`;
      const startDateString = `${startDate.getFullYear()}-${startMonth}-${startDate.getDate()}`;

      const roomType = bookings[bookingId]?.['IdRoomType'];

      const data = {
        resource: bookings[bookingId]?.['IdRoom'] || '',
        resouceCateogry: roomType || '',
        //@ts-expect-error TODO
        status: RESERVATION_STATUS_ENUM[bookings[bookingId]?.['Statut']] || '',
        amount: calculateBookingAmt(bookings[bookingId]),
        purpose: '',
        currency: '',
        segment: '',
        arrivalDate: startDateString,
        departureDate: endDateString,
        reservationId: bookingId,
      };

      const cDate: any = new Date(paramStartDate);
      let loopCondition = true;
      while (loopCondition) {
        const currentMonth =
          cDate.getMonth() + 1 < 10
            ? `0${cDate.getMonth() + 1}`
            : `${cDate.getMonth() + 1}`;
        const currentDateString = `${cDate.getFullYear()}-${currentMonth}-${cDate.getDate()}`;
        const toAdd = isReservationOverlapping(bookings[bookingId], cDate);
        //console.log("toAdd", toAdd,cc, ee,data?.reservationId);
        if (toAdd) {
          if (Object.keys(acc)?.indexOf(currentDateString) > -1) {
            if (Object.keys(acc[currentDateString])?.indexOf(roomType) > -1) {
              acc[currentDateString][roomType][bookingId] = {
                ...data,
              };
            } else {
              acc[currentDateString][roomType] = {
                [bookingId]: {
                  ...data,
                },
              };
            }
          } else {
            acc[currentDateString] = {
              [roomType]: {
                [bookingId]: { ...data },
              },
            };
          }
        }
        cDate.setDate(cDate.getDate() + 1);
        if (cDate.getTime() > new Date(paramEndDate).getTime())
          loopCondition = false;
      }
      return acc;
    },
    {}
  );
  return data;
};

export const isReservationOverlapping = (
  reservation: any,
  currentDate: string
) => {
  const arrivalDate: any = new Date(reservation?.['Dates']?.DateStart);
  const departureDate: any = new Date(reservation?.['Dates']?.DateEnd);
  departureDate.setDate(departureDate.getDate() + 1);
  const cDate = new Date(currentDate);
  if (
    cDate.getTime() === arrivalDate.getTime() ||
    cDate.getTime() === departureDate.getTime()
  ) {
    return true;
  }
  if (
    arrivalDate.getTime() < cDate.getTime() &&
    cDate.getTime() < departureDate.getTime()
  )
    return true;
  return false;
};

export const createBookingResponse = (
  allBookings: any,
  startDate: string,
  endDate: string
) => {
  const allNewBookings = createMediaLogResponse(
    allBookings,
    startDate,
    endDate
  );
  console.log(allNewBookings);
  return allNewBookings;
};

export const convertCreateContactRequestToMediaLogRequestType = (
  medialogbody: any,
  requiredParams = REQUIRED_PARAMS_CREATE_CONTACT,
  optionalParams = OPTIONAL_PARAMS_CREATE_CONTACT
) => {
  //   "name": "john",
  //   "surname": "doe",
  //   "email": "johndoe@example.com",
  //   "phone": "222-555-444-444",
  //   "address": {
  //     "street": "437 Lytton",
  //     "city": "Palo Alto",
  //     "state": "CA",
  //     "country": "FR",
  //     "zip": "94301"
  //   }
  // }
  const requestBodyKeys = Object.keys(medialogbody);
  const requiredBody = Object.entries(requiredParams).reduce<
    Record<string, any>
  >((acc, [key, val]) => {
    let medialogkey: string;
    if (requestBodyKeys.includes(key)) {
      medialogkey = val || '';
      acc[medialogkey] = medialogbody?.[key];
    }
    return acc;
  }, {});

  const body: any = Object.entries(optionalParams).reduce<
    Record<string, string>
  >(
    (acc, [key, val]) => {
      let medialogkey: string;
      if (Object.keys(optionalParams).includes(key)) {
        medialogkey = val || '';
        acc[medialogkey] = medialogbody?.[key];
      }
      return acc;
    },
    { ...requiredBody }
  );

  console.log('body', body);

  body['Adresse'] = {
    Adresse: medialogbody?.['address']?.['street'] || '',
    Ville: medialogbody?.['address']?.['city'] || '',
    Pays: medialogbody?.['address']?.['country'] || '',
    CodePostal: medialogbody?.['address']?.['zip'] || '',
  };

  if (medialogbody?.['phone'])
    body['Telephone'] = {
      Mobile: medialogbody?.phone,
    };

  if (medialogbody?.['email']) body['Email'] = medialogbody?.email;

  if (medialogbody?.passport)
    body['Passeport'] = {
      Numero: medialogbody?.passport,
    };

  return body;
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

export const transformSearchContactResponse = (mediaLogResponse: any) => {
  const body = mediaLogResponse?.body?.ServerReturn;
  return {
    status: 200,
    body: {
      id: body?.['Id'],
      name: body?.['FirstName'],
      surname: body?.['LastName'],
      email: body?.['Email'],
      phone: body?.['Telephone']?.['Mobile'],
      address: {
        street: body?.['Adresse']?.['Adresse'],
        city: body?.['Adresse']?.['Ville'],
        country: body?.['Adresse']?.['Pays'],
        zip: body?.['Adresse']?.['CodePostal'],
        state: '',
      },
    },
  };
};

export const transformUpdateContactRequest = (
  medialogRequest: Record<string, any>
) => {
  const mediaLogKeys = Object.keys(medialogRequest);
  const requestObj: Record<string, any> = {};
  Object.keys(UPDATE_CONTACT_PARAMS).forEach((field: string) => {
    if (mediaLogKeys.indexOf(field) >= 0) {

        const key = field as keyof typeof UPDATE_CONTACT_PARAMS;
        requestObj[UPDATE_CONTACT_PARAMS[key]] = medialogRequest[field];
    }
  });

  const changes: any[] = [];
  Object.keys(medialogRequest).forEach((key: string) => {
    if (Object.keys(UPDATE_CONTACT_CHANGE_FIELDS).indexOf(key) > -1) {
        const fieldKey = key as keyof typeof UPDATE_CONTACT_CHANGE_FIELDS;
        changes.push({
        Field: UPDATE_CONTACT_CHANGE_FIELDS[fieldKey],
        NewValue: medialogRequest[key],
      });
    }
  });

  requestObj['Changes'] = [...changes];
  requestObj['DataType'] = 4;
  return requestObj;
};

export const fetchRoomTypeLabel = (apiResponse: any, idRoomType: string) => {
  let roomLabel = '';
  if (apiResponse.status == 200) {
    roomLabel =
      apiResponse?.body?.ServerReturn?.find(
        (roomTypeData: any) => roomTypeData.Id == idRoomType
      )?.FriendlyName || '';
  } else {
    roomLabel = '';
  }

  return roomLabel;
};

export const fetchRoomLabel = (apiResponse: any, idRoomType: string) => {
  let currentRoomLabel = '',
    currentRoomId = '';
  if (apiResponse.status == 200) {
    const roomData = apiResponse?.body?.ServerReturn?.find(
      (roomTypeData: any) => roomTypeData.IdRoomType == idRoomType
    );
    currentRoomLabel = roomData?.Number || '';
    currentRoomId = roomData?.Id || '';
  }
  return { currentRoomLabel, currentRoomId };
};

export const fetchProductLabels = (apiResponse: any, productIds: any) => {
  if (apiResponse.status == 200) {
    return apiResponse?.body?.ServerReturn?.reduce((acc: any, prod: any) => {
      if (productIds?.includes(prod.Id)) {
        acc[prod.Id] = {
          ...prod,
        };
      }
      return acc;
    }, {});
  }
  return {};
};

export const fetchProductCategoryLables = (
  apiResponse: any,
  productLables: any
) => {
  if (apiResponse.status === 200) {
    return apiResponse?.body?.ServerReturn?.reduce((acc: any, prod: any) => {
      Object.keys(productLables).find((key: any) => {
        if (productLables[key]?.IdFamille === prod.Id) {
          acc[key] = prod;
        }
      });
      return acc;
    }, {});
  }
  return {};
};

export const formatDate = (dateString: string) => dateString.split('T')?.[0];

export const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if necessary
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

export const convertRoomTypesData = (apiResponse: any, roomsData: any) => {
  return {
    resourceTypes: apiResponse?.body?.ServerReturn?.reduce(
      (acc: any, roomType: any) => {
        acc.push({
          resourceCode: roomType?.Id,
          resourceLabel: roomType?.FriendlyName,
          minOccupancy: 1,
          maxOccupancy: roomType?.MaxPax,
          resourceType: 'BEDROOM',
          isActive: !roomType?.Hidden,
          slots: {
            slotCodeFrom: '',
            slotCodeTo: '',
          },
          pmsFields: {
            resources: roomsData[roomType?.Id] ?? [],
          },
        });
        return acc;
      },
      []
    ),
  };
};

export const convertRoomResponse = (apiResponse: any) => {
  return apiResponse?.body?.ServerReturn?.reduce(
    (acc: any, currentRoom: any) => {
      if (Object.keys(acc).indexOf(currentRoom?.IdRoomType) > -1) {
        acc[currentRoom?.IdRoomType].push(currentRoom?.Id);
      } else {
        acc[currentRoom?.IdRoomType] = [currentRoom?.Id];
      }
      return acc;
    },
    {}
  );
};

export const createGatewayResponseForRooms = (apiResponse: any) => {
  return {
    resources: apiResponse?.body?.ServerReturn?.reduce(
      (acc: any, currentRoom: any) => {
        acc.push({
          resourceCode: currentRoom?.Id,
          resourceLabel: currentRoom?.Number,
          resourceCategory: currentRoom?.IdRoomType,
        });
        return acc;
      },
      []
    ),
  };
};

export const createGatewayResponseForSegments = (apiResponse: any) =>
  apiResponse?.body?.ServerReturn?.reduce((acc: any, currentSegment: any) => {
    acc.push({
      id: currentSegment?.Id,
      name: currentSegment?.Libelle || '',
    });
    return acc;
  }, []);

export const createGatewayResponseForCountryCultures = (apiResponse: any) =>
  apiResponse?.body?.ServerReturn?.filter(
    (culture: any) => culture?.ISO2Letters !== 'ZZ'
  )?.[0]?.Culture ?? '';

export const createGateWayResponseForHotelInfo = (
  hotelId: string,
  apiResponse: any,
  segments: any,
  language: string
) => {
  console.log('create gateay response');
  return {
    hotel: {
      hotelCode: hotelId,
      name: hotelId,
      language: language,
      currency: '',
      isActive: apiResponse?.body?.ServerReturn?.BusinessDate ? true : false,
      cityTaxCode: '',
      address: {},
    },
    additionalInfo: {
      taxes: [],
      businessSegments: segments,
    },
  };
};
