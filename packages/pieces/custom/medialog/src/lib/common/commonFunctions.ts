import {
  GUEST_TYPE_BASED_ON_AGE,
  OPTIONAL_PARAMS_CREATE_CONTACT,
  REQUIRED_PARAMS_CREATE_CONTACT,
  UPDATE_CONTACT_CHANGE_FIELDS,
  UPDATE_CONTACT_PARAMS,
} from "./constants";
import {
  BookingDetailsDTO,
  BookingDetailsResponse,
  MEDIALOGWEBHOOKRESPONSE,
  SingleBookingResponse,
} from "./types";
import crypto from "crypto"

export const RESERVATION_STATUS_ENUM = {
  R: "Confirmed",
  O: "Option",
  P: "In-House",
  D: "Gone",
  S: "Cancelled",
};

export const decode = (body: string) => {
  console.log("decode", body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

// Calculate total amount of the room based on charges per room.
export const calculateBookingAmt = (bookingDetail: any) =>
  bookingDetail?.["Produits"]?.reduce(
    (acc: number, curr: any) => acc + (curr?.["MontantCa"] ?? 0),
    0
  );

const sha512Base64 = (seed: string) => {
  // Convert the seed to a Uint8Array (byte array)
  const encoder = new TextEncoder();
  const data = encoder.encode(seed.toString());

  // Create SHA-512 hash
  return crypto.subtle.digest("SHA-512", data).then((hashBuffer:any) => {
    // Convert hash buffer to base64 string
    const hashArray = new Uint8Array(hashBuffer);
    let binary = "";
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
  let messageId = "";
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
  const tday_day = String(now.getDate()).padStart(2, '0');  // Format as 2-digit string
  const tday_month = String(now.getMonth() + 1).padStart(2, '0');  // JavaScript months are 0-indexed, so we add 1
  const tday_year = String(now.getFullYear());

  // Create the seed string
  const seed = tday_day + tday_year + password + tday_month + hotelId;

  // Create SHA-512 hash
  const sha512Hash = crypto.createHash('sha512').update(seed, 'utf8').digest();

  // Base64 encode the hash
  const b64Hash = sha512Hash.toString('base64');
  return b64Hash

}
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
      const endDate = new Date(bookings[bookingId]?.["Dates"]?.DateEnd);
      const endMonth =
        endDate.getMonth() + 1 < 10
          ? `0${endDate.getMonth() + 1}`
          : `${endDate.getMonth() + 1}`;
      const endDateString = `${endDate.getFullYear()}-${endMonth}-${endDate.getDate()}`;

      const startDate = new Date(bookings[bookingId]?.["Dates"]?.DateStart);
      const startMonth =
        startDate.getMonth() + 1 < 10
          ? `0${startDate.getMonth() + 1}`
          : `${startDate.getMonth() + 1}`;
      const startDateString = `${startDate.getFullYear()}-${startMonth}-${startDate.getDate()}`;

      const roomType = bookings[bookingId]?.["IdRoomType"];

      const data = {
        resource: bookings[bookingId]?.["IdRoom"] || "",
        resouceCateogry: roomType || "",
        //@ts-expect-error TODO
        status: RESERVATION_STATUS_ENUM[bookings[bookingId]?.["Statut"]] || "",
        amount: calculateBookingAmt(bookings[bookingId]),
        purpose: "",
        currency: "",
        segment: "",
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
  const arrivalDate: any = new Date(reservation?.["Dates"]?.DateStart);
  const departureDate: any = new Date(reservation?.["Dates"]?.DateEnd);
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
      medialogkey = val || "";
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
        medialogkey = val || "";
        acc[medialogkey] = medialogbody?.[key];
      }
      return acc;
    },
    { ...requiredBody }
  );

  console.log("body", body);

  body["Adresse"] = {
    Adresse: medialogbody?.["address"]?.["street"] || "",
    Ville: medialogbody?.["address"]?.["city"] || "",
    Pays: medialogbody?.["address"]?.["country"] || "",
    CodePostal: medialogbody?.["address"]?.["zip"] || "",
  };

  if (medialogbody?.["phone"])
    body["Telephone"] = {
      Mobile: medialogbody?.phone,
    };

  if (medialogbody?.["email"]) body["Email"] = medialogbody?.email;

  if (medialogbody?.passport)
    body["Passeport"] = {
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
      id: body?.["Id"],
      name: body?.["FirstName"],
      surname: body?.["LastName"],
      email: body?.["Email"],
      phone: body?.["Telephone"]?.["Mobile"],
      address: {
        street: body?.["Adresse"]?.["Adresse"],
        city: body?.["Adresse"]?.["Ville"],
        country: body?.["Adresse"]?.["Pays"],
        zip: body?.["Adresse"]?.["CodePostal"],
        state: "",
      },
    },
  };
};

export const transformUpdateContactRequest = (medialogRequest: any) => {
  // "reason",
  const mediaLogKeys = Object.keys(medialogRequest);
  const requestObj: Record<string, any> = {};
  Object.keys(UPDATE_CONTACT_PARAMS).forEach((field: string) => {
    if (mediaLogKeys.indexOf(field) >= 0)
      // @ts-expect-error TODO
      requestObj[UPDATE_CONTACT_PARAMS[field]] = medialogRequest[field];
  });

  const changes: any[] = [];
  Object.keys(medialogRequest).forEach((key: string) => {
    if (Object.keys(UPDATE_CONTACT_CHANGE_FIELDS).indexOf(key) > -1) {
      changes.push({
        //@ts-expect-error TODO
        Field: UPDATE_CONTACT_CHANGE_FIELDS[key],
        NewValue: medialogRequest[key],
      });
    }
  });

  requestObj["Changes"] = [...changes];
  requestObj["DataType"] = 4;
  return requestObj;
};


export const fetchRoomTypeLabel = (apiResponse: any, idRoomType: string) => {
  let roomLabel = ""
  if(apiResponse.status == 200){
    roomLabel = apiResponse?.body?.ServerReturn?.find((roomTypeData: any)=> roomTypeData.Id == idRoomType)?.FriendlyName || "";
  } else {
    roomLabel = "";
  }

  return roomLabel;
}


export const fetchRoomLabel = (apiResponse: any, idRoomType: string) => {
  let roomCode = "", roomId = "";
  if(apiResponse.status == 200){
    const roomData = apiResponse?.body?.ServerReturn?.find((roomTypeData: any)=> roomTypeData.IdRoomType == idRoomType);
    roomCode = roomData?.Number || "";
    roomId = roomData?.Id || ""
  }
  return { roomCode, roomId };
}

export const fetchProductLabels = (apiResponse: any, productIds: any) => {
  if(apiResponse.status == 200){
    return apiResponse?.body?.ServerReturn?.reduce((acc:any, prod: any)=> {
        if(productIds?.includes(prod.Id)){
          acc[prod.Id] = {
            ...prod
          }
        }
        return acc;
    }, {})
  }
  return {}
}

export const fetchProductCategoryLables = (apiResponse:any,productLables: any) => {
  if(apiResponse.status === 200){
    return apiResponse?.body?.ServerReturn?.reduce((acc: any, prod: any) => {
      Object.keys(productLables).find((key:any)=> {
        if(productLables[key]?.IdFamille === prod.Id){
          acc[key] = prod;
        }
      });
      return acc;
    },{})
  }
  return {};
}

export const formatDate = (dateString: string) => dateString.split("T")?.[0];

export const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if necessary
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate
}


export const convertRoomTypesData = (apiResponse: any, roomsData: any) => {
  return {
    "resourceTypes": apiResponse?.body?.ServerReturn?.reduce((acc:any, roomType:any)=> {
        acc.push({
          resourceCode: roomType?.Id,
          resourceLabel: roomType?.FriendlyName,
          minOccupancy: 1,
          maxOccupancy: roomType?.MaxPax,
          resourceType: "BEDROOM",
          isActive: !roomType?.Hidden,
          slots: {
            slotCodeFrom: "",
            slotCodeTo: ""
          },
          pmsFields: {
            resources: roomsData[roomType?.Id] ?? []
          }
        });
        return acc;
    },[])
  }
}

export const convertRoomResponse = (apiResponse: any) => {
  return apiResponse?.body?.ServerReturn?.reduce((acc:any, currentRoom: any)=> {
    if(Object.keys(acc).indexOf(currentRoom?.IdRoomType) > -1){
      acc[currentRoom?.IdRoomType].push(currentRoom?.Id);
    } else {
      acc[currentRoom?.IdRoomType] = [currentRoom?.Id];
    }
    return acc;
  }, {});
}

export const createGatewayResponseForRooms = (apiResponse:any) => {
  return {
    "resources": apiResponse?.body?.ServerReturn?.reduce((acc:any, currentRoom: any)=> {
      acc.push({
        resourceCode: currentRoom?.Id,
        resourceLabel: currentRoom?.Number,
        resourceCategory: currentRoom?.IdRoomType
      })
      return acc;
    },[])
  }
}

export const createGatewayResponseForSegments = (apiResponse:any) => apiResponse?.body?.ServerReturn?.reduce((acc:any, currentSegment: any)=> {
  acc.push({
    id: currentSegment?.Id,
    name: currentSegment?.Libelle || ""
  });
  return acc;
},[])

export const createGatewayResponseForCountryCultures = (apiResponse: any) => apiResponse?.body?.ServerReturn?.filter((culture: any)=> culture?.ISO2Letters !== "ZZ")?.[0]?.Culture ?? "";

export const createGateWayResponseForHotelInfo = (hotelId: string, apiResponse: any, segments: any, language: string) => {
  console.log("create gateay response");
  return {
    hotel: {
      hotelCode: hotelId,
      name: hotelId,
      language: language,
      currency: "",
      isActive: apiResponse?.body?.ServerReturn?.BusinessDate ? true : false,
      cityTaxCode: "",
      address: {},
      cin: "", // compnay identification number.
      taxNumber: "" //siret
    },
    additionalInfo: {
      taxes: [],
      businessSegments: segments
    }
  }
}

export const transformArrivalDepartureResponse = (apiResponse:any) => {
  return apiResponse?.body?.ServerReturn?.reduce((acc:any, currentRes:any)=> {
    acc[currentRes?.Id] = {
      ...currentRes
    }
    return acc
  }, {}) ?? {};
}

export const addRservationWhichAreNotPresent = (newBookings:any, currentBookings: any) => {
  const currentBookingIds = Object.keys(currentBookings);
  return Object.entries(newBookings)?.reduce((acc:any, [currentResId, currentRes]: [string, any])=> {
    if(currentBookingIds.indexOf(currentRes?.Id) == -1){
      acc[currentResId] = {
        ...currentRes
      }
    };
    return acc
  }, currentBookings) ?? currentBookings;
}

export const createBookingDetailsAccordingToGateway = (allBookings:any, allRoomTypes: any, allChannels: any, allSegments: any, allBookingSources: any) => {
  return Object.entries(allBookings)?.reduce((acc:any, [bookingId, bookingDetails]: [string, any])=> {

    const endDate = new Date(bookingDetails?.["Dates"]?.DateEnd);
      const endMonth =
        endDate.getMonth() + 1 < 10
          ? `0${endDate.getMonth() + 1}`
          : `${endDate.getMonth() + 1}`;
      const endDateString = `${endDate.getFullYear()}-${endMonth}-${endDate.getDate()}`;

      const startDate = new Date(bookingDetails?.["Dates"]?.DateStart);
      const startMonth =
        startDate.getMonth() + 1 < 10
          ? `0${startDate.getMonth() + 1}`
          : `${startDate.getMonth() + 1}`;
      const startDateString = `${startDate.getFullYear()}-${startMonth}-${startDate.getDate()}`;

    // acc.push({
    //     resource: bookingDetails?.["IdRoom"] || "",
    //     resouceCateogry: bookingDetails?.["IdRoomType"] || "",
    //     //@ts-expect-error TODO
    //     status: RESERVATION_STATUS_ENUM[bookingDetails?.["Statut"]] || "",
    //     amount: calculateBookingAmt(bookingDetails),
    //     purpose: "",
    //     currency: bookingDetails?.["IdPays"] || "",
    //     segment: bookingDetails?.["IdSegment"]?.[0] || "",
    //     arrivalDate: startDateString,
    //     departureDate: endDateString,
    //     reservationId: bookingId,
    // })
    acc.push(  {
      fileId: "", //todo
      yourRefId: "UA7hdf4", //todo
      guest: {
        companyId: "",
        contactId: bookingDetails?.Client?.Id || ""
      },
      state: "",
      marketing: {
        source: allBookingSources?.[0] || "",
        segment: bookingDetails?.IdSegment?.[0] ? allSegments[bookingDetails?.IdSegment?.[0]] : "",
        channel: bookingDetails?.IdOrigine?.[0] ? allChannels[bookingDetails?.IdOrigine?.[0]] : ""
      },
      purpose: "",
      reservationId: bookingId,
      roomTypes: [
        {
          roomTypeCode: bookingDetails?.IdRoomType || "",
          roomTypeLabel: allRoomTypes[bookingDetails?.IdRoomType]?.FriendlyName || "",
          ratePlanCode: "",
          ratePlanLabel: "",
          isVirtual: !allRoomTypes[bookingDetails?.IdRoomType]?.IsRoomType || false,
          amountAfterTax: 600.5,
          discount: 120,
          taxValue: 50.5,
          taxPercent: 10,
          numberOfRooms: 1,
          guestCount: [
            {
              ageCategoryId: "d0f24ab9-034b-406f-b052-af5400b88516",
              numberOfGuest: 2
            },
            {

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
          },
          "orderItems": [
            {
              "name": "Coffee",
              "count": 2,
              "currency": "EUR",
              "amountAfterTax": 20,
              "taxValue": 3,
              "taxPercent": 15
            }
          ]
        }
      ],
      orderItems: [
        {
          name: "Coffee",
          count: 1,
          currency: "EUR",
          amountAfterTax: 10,
          taxValue: 1.5,
          taxPercent: 15
        }
      ],
      createdAt: bookingDetails?.DateCreation,
      updatedAt: bookingDetails?.DateLastChange
    })
    return acc;
  },[])
}

export const createGetPaymentModesResponseAccordingToGateWay = (apiResponse: any) => {
  return {
    paymentModes: apiResponse?.body?.ServerReturn?.reduce((acc:any, currentMode: any)=> {
      acc.push({
        paymentModeCode: currentMode?.Libelle || "",
        paymentModeLabel: currentMode?.Id || ""
      });
      return acc;
    }, [])
  }
}

export const createGetProductsResponseAsPerGateway = (apiResponse: any, productCategories: any) => {
  return {
    "products": apiResponse?.body?.ServerReturn?.reduce((acc:any, currProd: any)=> {
      acc.push({
        productCode: currProd?.Id || "",
        productLabel: currProd?.Libelle || "",
        productType: productCategories?.find((cat:any)=> cat?.Id === currProd?.IdFamille)?.Libelle || "",
        priceType: "",
        tax: currProd?.TaxApplied?.reduce((acc: any, currentTax: any) => {
          acc.push({
            taxCode: currentTax?.Id || "",
            taxValue: currentTax?.Rate || ""
          })
          return acc;
        }, []),
        isActive: true
      });
      return acc;
    },[])
  }
}

export const transformRoomTypesResponse = (apiResponse:any) => {
  return apiResponse?.body?.ServerReturn?.reduce((acc:any, currentRoomType:any)=>{
    acc[currentRoomType?.Id] = {
      ...currentRoomType
    };
    return acc;
  },{})
}

export const transformMarketOriginResponse = (apiResponse: any) => {
  return apiResponse?.body?.ServerReturn?.reduce((acc: any, currentOrigin: any) => {
    acc[currentOrigin?.Id] = currentOrigin?.Libelle || "";
    return acc;
  }, {})
}

export const transformSegmentsResponse = (apiResponse: any) => {
  return apiResponse?.body?.ServerReturn?.reduce((acc: any, currentSegment: any) => {
    acc[currentSegment?.Id] = currentSegment?.Libelle || "";
    return acc;
  }, {}) ?? {};
}

export const transformBookingSoures = (apiResponse: any) => {
  return apiResponse?.body?.ServerReturn?.reduce((acc: any, currentBookingSource: any) => {
    acc.push(currentBookingSource?.Libelle);
    return acc;
  }, []);
}

export const calculateTaxes = (taxesApplied:any) => taxesApplied?.reduce((acc:any, taxData:any)=> acc + (taxData?.Rate || 0),0);

export const calculateTaxPercentage = (totalAmt:any, totalTax:any) => Number(((totalTax/totalAmt)*100).toFixed(2));

export const fetchOrderItemsDateWise = (products:any, currency:any,productLabels:any) => {
  return products.reduce((acc:any,cProd:any)=> {
      const productPurchasedAt = cProd?.DateAct?.split("T")?.[0];
      const price = cProd?.PrixBase;
      const taxes = calculateTaxes(cProd?.TaxApplied);
      const data = {
              "name": productLabels[cProd?.IdProduit]?.Libelle ?? "",
              "count": cProd?.QuantiteBase ?? 1,
              "currency": currency,
              "amountAfterTax": price + taxes,
              "taxValue": taxes,
              "taxPercent": calculateTaxPercentage(price+taxes, taxes)
          }
      if(Object.keys(acc).indexOf(productPurchasedAt) > -1){
          acc[productPurchasedAt].push(data)
      } else {
          acc[productPurchasedAt] = [data]
      }
      return acc;
  },{})
}

export const fetchGuestTypesBasedOnAge = (data:any) => {
  return [{
              ageCategoryId: GUEST_TYPE_BASED_ON_AGE[0],
              numberOfGuest: data?.NbPers ?? 1
            },
          {
              ageCategoryId: GUEST_TYPE_BASED_ON_AGE[1],
              numberOfGuest: data?.NbChild ?? 0
            },
            {
              ageCategoryId: GUEST_TYPE_BASED_ON_AGE[2],
              numberOfGuest: data?.NbBebe ?? 0
            }
      ]
}

export const createOrderItemForAccomodationStay = (data:any, ratePlanDayWise:any) => {
    const Dates = data?.Dates
    const sDate = new Date(Dates.DateStart);
    const tempDate = sDate;
    const sales: Record<string,any> = {}
    while(tempDate < new Date(Dates.DateEnd)){
     // console.log("1",tempDate);
      const formattedDate: string = tempDate.toISOString().split("T")[0]
      const amtAfterTax  = ratePlanDayWise[formattedDate]?.["amtAfterTax"];
      const amtBeforeTax  = ratePlanDayWise[formattedDate]?.["amtBeforeTax"];
      const currency = ratePlanDayWise[formattedDate]?.["currency"];
      const tax = Number((amtAfterTax - amtBeforeTax).toFixed(2));
     // console.log(tax,amtAfterTax ,amtBeforeTax)
      const taxPercent = calculateTaxPercentage(amtAfterTax, tax);

      
      sales[formattedDate] = {
        name: `Hébergement-${formatDateString(tempDate)}`,
        count: 1,
        currency: currency,
        amountAfterTax: amtAfterTax  ?? 0,
        taxValue: tax,
        taxPercent: taxPercent
      }
          
        tempDate.setDate(tempDate.getDate() + 1);
    }
    return sales;
}

export const transformMedialogResponse = (data:MEDIALOGWEBHOOKRESPONSE,allSegments:any,orderItemsDateWise:any, guestTypes:any, ratePlanCode:any, roomTypeCode:any, marketCode:any, businessSource:any, ratePlanLabel:any, roomTypeLabel:any, accomodationSalesDateWise:any, cDate:any, roomId:any, roomCode:any,ratePlanDayWise:any) => {
    //console.log("guestTypes",ratePlanDayWise)
    
    const taxPercentage = calculateTaxPercentage(ratePlanDayWise[cDate]?.amtAfterTax,ratePlanDayWise[cDate]?.amtAfterTax - ratePlanDayWise[cDate]?.amtBeforeTax)

    return {
        fileId: "",
        yourRefId: "",
        guest: {
          companyId: "",
          contactId: data?.Client?.Id
        },
        state: RESERVATION_STATUS_ENUM[data?.Statut],
        marketing: {
          source: businessSource,
          segment: allSegments[data.IdSegment?.[0]],
          channel: marketCode
        },
        purpose: "",
        reservationId: data?.Id,
        roomTypes: [
          {
            roomTypeCode: roomTypeCode,
            roomTypeLabel: roomTypeLabel,
            ratePlanCode: ratePlanCode,
            ratePlanLabel: ratePlanLabel,
            isVirtual: false,
            amountAfterTax: ratePlanDayWise[cDate]?.amtAfterTax,
            discount: 0,
            taxValue: ratePlanDayWise[cDate]?.amtAfterTax - ratePlanDayWise[cDate]?.amtBeforeTax,
            taxPercent: taxPercentage,
            numberOfRooms: 1,
            guestCount: [
              ...guestTypes
            ],
            slots: {
              slotCodeFrom: "",
              slotCodeTo: ""
            },
            pmsFields: {
              serviceIds: "",
              ageCategory: [],
              tpSale: "",
              pmsState: "",
              voucherCode: "",
              guest: data?.Client,
              roomCode: roomId,
              roomCodeLabel: roomCode
            },
            orderItems: [
              (accomodationSalesDateWise[cDate] ?? {})
            ]
          }
        ],
        orderItems: [
          ...(orderItemsDateWise[cDate] ?? [])
        ],
        createdAt: new Date(data?.DateCreation).toISOString(),
        updatedAt: new Date(data?.DateLastChange).toISOString()
    }
}

export const createResponseFromWebhook = (data:any,allSegments:any,orderItemsDateWise:any, guestTypes:any, ratePlanCode:string, roomTypeCode:string, marketCode:string, businessSource:string, ratePlanLabel:string, roomTypeLabel:string, accomodationSalesDateWise:any, roomId:string, roomCode:string, ratePlanDayWise:any) => {
    console.log("create response")
    const Dates = data?.Dates
    const sDate = new Date(Dates.DateStart);
    const tempDate = sDate;
    const resData: Record<string,any> = {}
    while(tempDate < new Date(Dates.DateEnd)){
        const currentDate = tempDate.toISOString().split("T")?.[0];
        console.log(currentDate);
        resData[currentDate] = transformMedialogResponse(data,allSegments,orderItemsDateWise, guestTypes, ratePlanCode, roomTypeCode, marketCode, businessSource, ratePlanLabel, roomTypeLabel, accomodationSalesDateWise, currentDate,roomId, roomCode,ratePlanDayWise);
        tempDate.setDate(tempDate.getDate() + 1);
    }
    console.log("reservations".repeat(10))
    return {
        "reservations": resData
    }
}


export const createRateObject = (rates:any) => {
  return rates.reduce((acc:any,curr:any)=> {
      acc[curr["$"]["EffectiveDate"]] = {
          amtBeforeTax: curr["Base"]?.[0]?.["$"]["AmountBeforeTax"],
          amtAfterTax: curr["Base"]?.[0]?.["$"]["AmountAfterTax"] ?? curr["Base"]?.[0]?.["$"]["AmountBeforeTax"],
          currency: curr["Base"]?.[0]?.["$"]["CurrencyCode"]
      }
      return acc;
  }, {})
}

export const fetchDataFromXml = (xmlData:any) => {
  
  const reservationId = xmlData["OTA_HotelResNotifRQ"]?.["HotelReservations"]?.[0]?.["HotelReservation"]?.[0]?.["UniqueID"]?.[0]?.["$"]?.["ID"];
  const roomStay = xmlData["OTA_HotelResNotifRQ"]["HotelReservations"][0]["HotelReservation"]?.[0]?.["RoomStays"]?.[0]?.["RoomStay"]?.[0];
  
  const marketCode = roomStay["$"]?.["MarketCode"];
  const businessSource = roomStay["$"]?.["SourceOfBusiness"];
  
  const roomRates = roomStay?.["RoomRates"]?.[0]?.["RoomRate"]?.[0];
  console.log(JSON.stringify(roomRates));
  const ratePlanCode = roomRates?.["$"]?.["RatePlanCode"];
  const roomTypeCode = roomRates?.["$"]?.["RoomTypeCode"];
  
  const rates = roomRates?.["Rates"]?.[0]?.["Rate"];
  // console.log(resStatus,roomStay,marketCode,businessSource, ratePlanCode, roomTypeCode);
  // console.log(JSON.stringify(rates));
  const ratePlanDayWise = createRateObject(rates)
  
  return {
      marketCode,
      businessSource,
      ratePlanCode,
      roomTypeCode,
      ratePlanDayWise,
      reservationId
  }
}

export const xmlData = {
  "OTA_HotelResNotifRQ": {
      "$": {
          "xmlns": "http://www.opentravel.org/OTA/2003/05",
          "ResStatus": "Commit",
          "TimeStamp": "2013-10-13T00:00:00.000Z",
          "Version": "5.000"
      },
      "HotelReservations": [
          {
              "HotelReservation": [
                  {
                      "$": {
                          "CreateDateTime": "2013-09-19T17:06:29",
                          "ResStatus": "Reserved"
                      },
                      "UniqueID": [
                          {
                              "$": {
                                  "ID": "60072IC000102",
                                  "Type": "14"
                              }
                          }
                      ],
                      "RoomStays": [
                          {
                              "RoomStay": [
                                  {
                                      "$": {
                                          "MarketCode": "MKT",
                                          "SourceOfBusiness": "ABC"
                                      },
                                      "RatePlans": [
                                          {
                                              "RatePlan": [
                                                  {
                                                      "$": {
                                                          "RatePlanCode": "AAA"
                                                      }
                                                  }
                                              ]
                                          }
                                      ],
                                      "RoomRates": [
                                          {
                                              "RoomRate": [
                                                  {
                                                      "$": {
                                                          "NumberOfUnits": "1",
                                                          "RatePlanCode": "AAA",
                                                          "RoomTypeCode": "QQ"
                                                      },
                                                      "Rates": [
                                                          {
                                                              "Rate": [
                                                                  {
                                                                      "$": {
                                                                          "EffectiveDate": "2013-10-14",
                                                                          "ExpireDate": "2013-10-15",
                                                                          "RateTimeUnit": "Day",
                                                                          "UnitMultiplier": "1"
                                                                      },
                                                                      "Base": [
                                                                          {
                                                                              "$": {
                                                                                  "AmountBeforeTax": "100.10",
                                                                                  "CurrencyCode": "USD"
                                                                              }
                                                                          }
                                                                      ]
                                                                  },
                                                                  {
                                                                      "$": {
                                                                          "EffectiveDate": "2013-10-15",
                                                                          "ExpireDate": "2013-10-17",
                                                                          "RateTimeUnit": "Day",
                                                                          "UnitMultiplier": "2"
                                                                      },
                                                                      "Base": [
                                                                          {
                                                                              "$": {
                                                                                  "AmountBeforeTax": "85",
                                                                                  "CurrencyCode": "USD"
                                                                              }
                                                                          }
                                                                      ]
                                                                  },
                                                                  {
                                                                      "$": {
                                                                          "EffectiveDate": "2013-10-17",
                                                                          "ExpireDate": "2013-10-18",
                                                                          "RateTimeUnit": "Day",
                                                                          "UnitMultiplier": "1"
                                                                      },
                                                                      "Base": [
                                                                          {
                                                                              "$": {
                                                                                  "AmountBeforeTax": "100.10",
                                                                                  "CurrencyCode": "USD"
                                                                              }
                                                                          }
                                                                      ]
                                                                  }
                                                              ]
                                                          }
                                                      ]
                                                  }
                                              ]
                                          }
                                      ],
                                      "TimeSpan": [
                                          {
                                              "$": {
                                                  "End": "2013-10-18",
                                                  "Start": "2013-10-14"
                                              }
                                          }
                                      ],
                                      "BasicPropertyInfo": [
                                          {
                                              "$": {
                                                  "HotelCode": "59072"
                                              }
                                          }
                                      ]
                                  }
                              ]
                          }
                      ],
                      "ResGuests": [
                          {
                              "ResGuest": [
                                  {
                                      "Profiles": [
                                          {
                                              "ProfileInfo": [
                                                  {
                                                      "Profile": [
                                                          {
                                                              "$": {
                                                                  "ProfileType": "1"
                                                              },
                                                              "Customer": [
                                                                  {
                                                                      "Address": [
                                                                          {
                                                                              "$": {
                                                                                  "Type": "1"
                                                                              },
                                                                              "StateProv": [
                                                                                  {
                                                                                      "$": {
                                                                                          "StateCode": "CA"
                                                                                      }
                                                                                  }
                                                                              ],
                                                                              "CountryName": [
                                                                                  {
                                                                                      "$": {
                                                                                          "code": "US"
                                                                                      }
                                                                                  }
                                                                              ]
                                                                          }
                                                                      ]
                                                                  }
                                                              ]
                                                          }
                                                      ]
                                                  },
                                                  {
                                                      "UniqueID": [
                                                          {
                                                              "$": {
                                                                  "ID": "Booking.com",
                                                                  "ID_Context": "IATA",
                                                                  "Type": "5"
                                                              }
                                                          }
                                                      ],
                                                      "Profile": [
                                                          {
                                                              "$": {
                                                                  "ProfileType": "4"
                                                              }
                                                          }
                                                      ]
                                                  }
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }
                      ],
                      "ResGlobalInfo": [
                          {
                              "HotelReservationIDs": [
                                  {
                                      "HotelReservationID": [
                                          {
                                              "$": {
                                                  "ForGuest": "true",
                                                  "ResID_Date": "2015-05-13T17:19:58.000",
                                                  "ResID_Source": "PMS",
                                                  "ResID_Type": "10",
                                                  "ResID_Value": "60072IC000102"
                                              }
                                          },
                                          {
                                              "$": {
                                                  "ResID_Type": "27",
                                                  "ResID_Value": "60072IC000102",
                                                  "ResID_Source": "PMS",
                                                  "ResID_Date": "2014-01-01T12:34:56.000",
                                                  "ForGuest": "false"
                                              }
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  }
              ]
          }
      ]
  }
}