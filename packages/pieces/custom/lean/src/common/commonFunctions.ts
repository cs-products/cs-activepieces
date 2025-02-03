import { HttpMethod, HttpRequest } from "@activepieces/pieces-common";
import { GUEST_TYPE } from "./constants";

export const createHttpPostRequest = (
  method: HttpMethod,
  url: string,
  headers: Record<string, any> = {},
  additionalBody: Record<string, any> = {}
): HttpRequest => ({
  method,
  url,
  headers,
  timeout: 5000,
  body: {
    Limitation: {
      Cursor: null,
      Count: 999,
    },
    ...additionalBody,
  },
});


export const decode = (body: string) => {
  console.log("decode", body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

export const createGimmyPayloadFromRequestBody = (data:any, roomId: string) => {

    const sales = data?.charge_set?.map((currentChargeDetails: any)=> {
        return   {
            pms_id: String(currentChargeDetails?.id) || "",
            type: "ACCOMODATION", //todo
            label: currentChargeDetails?.description || "",
            quantity: currentChargeDetails?.quantity || 1,
            category_label: "",
            category_id: "0",
            product_label: null,
            product_id: null,
            is_offered: !currentChargeDetails?.is_billable,
            amount_incl: Math.round(Number(currentChargeDetails?.net_value) + Number(currentChargeDetails?.tax_value)),
            amount_excl: Math.round(Number(currentChargeDetails?.net_value)),
            currency: currentChargeDetails?.currency || "",
            consumed_at: currentChargeDetails?.consumption_date,
            created_at: currentChargeDetails?.created_at,
            updated_at: currentChargeDetails?.updated_at,
            canceled_at: null
          }
    })
    return [
        {
          hotel_id: 1,
          pms_id: data?.reference,
          booking_group_pms_id: "",
          cm_id: null,
          ota_id: null,
          date_from: data?.date_from?.split("T")?.[0] || "",
          date_to: data?.date_to?.split("T")?.[0] || "",
          created_at: data?.date_created || "",
          updated_at: data?.updated_at,
          canceled_at: data?.cancelled_at,
          no_show_at: null,
          booking_source: data?.source,
          booking_origin: "", 
          booking_reason: "",
          room_id:  "",
          room_label: data?.room?.code || "",
          room_type_id: "",
          room_type_label: data?.room?.room_type_code || "", 
          rate_id: String(data?.rate?.id) || "",
          rate_label: data?.rate?.code,
          nb_infants: data?.total_babies,
          nb_children: data?.total_children,
          nb_adults: data?.total_adults,
          customer: {
            pms_id: String(data?.customer?.id) || "",
            type: data?.customer?.customer_type?.toUpperCase() || "",
            firstname: data?.customer?.name || "",
            lastname: data?.customer?.surname || "",
            email: data?.customer?.email || "",
            phone: data?.customer?.phone || "",
            mobile: "",
            street_address: "",
            postcode: data?.customer?.municipality_code || "",
            city: data?.customer?.city || "",
            country: data?.customer?.country_iso_2 || "",
            travel_card: null,
            birth_date: data?.customer?.birth_date || null,
            company: "",
            siren: "",
            siret: "",
            civility: data?.customer?.gender || "",
            nationality: data?.customer?.nationality_iso_2 || "",
            language: data?.customer?.language || "",
            customer_group: "",
            customer_category: "",
            customer_origin: ""
        },
        sales: [...sales],
        xdatas: []
        }
      ]
}

export const fetchRoomId = (selectedRoom: any, allRoomsResponse:any) => {
  return selectedRoom?.code ? allRoomsResponse?.body?.find((roomData:any)=> roomData?.code == selectedRoom?.code)?.id || "bcd" : "null";
}

export const areAllKeysPresentForGimmy = (data:any, roomId: string) => {
  if(!roomId) return false;
  if(!data?.room?.room_type_id || !data?.hotel?.id || !data?.customer?.surname || !data?.customer?.id) return false;
  return true; 
}

export const transformRoomsResponse = (apiResponse: any) => {
  return apiResponse?.body?.reduce((acc:any, currentRoom: any)=> {
    if(Object.keys(acc).indexOf(currentRoom?.type_id) == -1){
      acc[currentRoom?.type_id] = [currentRoom?.code];
    } else {
      acc[currentRoom?.type_id].push(currentRoom?.code);
    }
    return acc;
  }, {})
}

export const transformResponseAccordingToGateway = (apiResponse: any, roomCategoryWiseRooms: any) => {
  return { resourceTypes:  apiResponse?.body?.reduce((acc: any, currentRoomCategory: any)=>{
    acc.push({
      resourceCode: currentRoomCategory?.code || "",
      resourceLabel: currentRoomCategory?.name || "",
      minOccupancy: 1,
      maxOccupancy: currentRoomCategory?.max_pax || 1,
      resourceType: "BEDROOM",
      isActive: true,
      slots: {
        slotCodeFrom: "",
        slotCodeTo: ""
      },
      pmsFields: {
        resources: roomCategoryWiseRooms[currentRoomCategory?.id] || []
      }
    })
  return acc;
  }, []) }
}

export const findNUmberOfGuestBasedOnType = (guestArray: any, guestType: string) => {
  // Fetch total number of guests based of age category [Babies, Children, Adults]
  const totalGuests =  guestArray?.find((guest: any)=> guest?.ageCategoryId === guestType)?.numberOfGuest;
  if(totalGuests){
    return Number(totalGuests);
  } else {
    return guestType === GUEST_TYPE[0] ? 1 : 0
  }
}


export const findSimilarReservations = (selectedIndex: number, reservationData: any) => {
  const oldRes = reservationData[selectedIndex];
  const similarIndices = [];
  let oldToDate = oldRes.date_to;
  for(let j=selectedIndex+1;j<reservationData.length;j++){
      const newRes = reservationData[j];
      if(oldToDate == newRes.date_from && oldRes.room_type == newRes.room_type && oldRes.rate == newRes.rate && oldRes.contact_email == newRes.contact_email && oldRes.adults == newRes.adults && newRes.children == oldRes.children && newRes.babies == oldRes.babies){
          oldToDate = newRes.date_to;
          similarIndices.push(j);
      }
  }
  console.log("similarIndices",selectedIndex,similarIndices)
  return similarIndices;
}

export const fetchMinNoOfRoomsRequiredInSameReservations = (sameReservationIndices: any, reservationData: any) => {
    let minNoOfRooms = Number.MAX_SAFE_INTEGER;
    for(const sameIndex of sameReservationIndices){
        minNoOfRooms = Math.min(minNoOfRooms, reservationData[sameIndex].numberOfRooms);
    }
    return minNoOfRooms;
}

export const sortReservations = (reservations: any) => reservations.sort((secondRes: any, firstRes: any) => new Date(secondRes.date_from).getTime() < new Date(firstRes.date_from).getTime())
export 
const updateReservations2 = (reservations: any) => {

    if(reservations.length  == 1) return reservations;
    const reservationsData = JSON.parse(JSON.stringify(reservations));
    let i = 0;
    console.log("all reservations length", reservations.length)
    const spawnedReservations = [];
    while(i<reservations.length - 1){
        console.log(i)
        if(!reservationsData[i]["toDelete"]){
            const similarIndices = findSimilarReservations(i, reservations);
            const minStay = fetchMinNoOfRoomsRequiredInSameReservations([i,...similarIndices], reservations)
            if(similarIndices.length>0){
                if(reservationsData[i]["numberOfRooms"] > minStay){
                    spawnedReservations.push({
                        ...reservations[i],
                        numberOfRooms: reservations[i].numberOfRooms - minStay
                    })
                }
                const newToDate = reservationsData[similarIndices[similarIndices.length - 1]].date_to;
                reservationsData[i]["date_to"] = newToDate;
                reservationsData[i]["toDelete"] = false;
                reservationsData[i]["numberOfRooms"] = minStay;
                const currentPrice = reservationsData[i]["day_prices"]?.[0];
                for(const similarIndex of similarIndices){
                    if(reservationsData[similarIndex]["numberOfRooms"] > minStay){
                        spawnedReservations.push({
                            ...reservations[similarIndex],
                            numberOfRooms: reservations[similarIndex].numberOfRooms - minStay
                        })
                    }
                    reservationsData[i]["day_prices"].push({
                        ...currentPrice,
                        "date": reservationsData[similarIndex]["date_from"],
                    })
                    reservationsData[similarIndex]["toDelete"] = true;
                }
            }   
        }             
        i++;
    }

    console.log("new reservations");
  const reservationsWithNumberOfRooms = reservationsData.filter((res:any)=> !res["toDelete"]);
  console.log(reservationsWithNumberOfRooms)
  console.log("spawned");
  console.log(spawnedReservations);
  return [...reservationsWithNumberOfRooms, ...spawnedReservations];


}


export const updateReservations = (reservations: any) => {
  
  if(reservations.length  == 1) return reservations;
  const reservationsData = JSON.parse(JSON.stringify(reservations));
  let i = 0, j=1;
  // eslint-disable-next-line no-constant-condition
  while(1){
      const oldRes = reservationsData[i], newRes = reservationsData[j];
      if(oldRes.date_to == newRes.date_from && oldRes.room_type == newRes.room_type && oldRes.rate == newRes.rate && oldRes.contact_email == newRes.contact_email && oldRes.numberOfRooms == newRes.numberOfRooms){
          reservationsData[i].date_to = newRes.date_to;
          const prices = reservationsData[i].day_prices?.[0];
          reservationsData[i].day_prices.push({
              date: newRes.date_from,
              price: prices?.price,
              rate: prices?.rate
          });
          reservationsData[i]["toDelete"] = false;
          reservationsData[j]["toDelete"] = true;
          
          j += 1;
      } else {
          i = j;
          j += 1;
      }
      if(i == reservationsData.length || j >= reservationsData.length) break;
  }

  return  reservationsData.filter((res: any) => !res.toDelete);
}

export const createTotalReservations = (reservationsWithNumRoomskey: any) => {
  return reservationsWithNumRoomskey?.reduce((acc: any, currRes: any)=> {
      const numberOfRooms = currRes?.numberOfRooms;
      for(let i=0; i< numberOfRooms; i++){
          const res = { ...currRes };
          delete res["numberOfRooms"];
          delete res["toDelete"];
          acc.push({...res});
      }
      return acc;
  }, [])
}

export const createReservationDataForLean = (inputData: any,hotelId: number, guestDetails: any, checkinDate: string, checkoutDate: string) => {

  const reservations = inputData?.roomTypes?.reduce((acc: any, roomType: any) => {
    // Fetch date & room Types array from roomTypes.
    const startDate = roomType?.date;
    let endDate: any = new Date(roomType?.date);
    endDate.setDate(endDate.getDate() + 1);
    endDate = endDate?.toISOString()?.split("T")?.[0];
    const currentRoomTypes = roomType?.roomTypes;
    const data = currentRoomTypes?.reduce((cacc: any, currentRoom: any)=> {
      
      const guestCount = currentRoom?.guestCount ?? [];
      cacc.push({
        date_from: startDate,
        date_to: endDate,
        room_type: currentRoom?.roomTypeCode,
        rate: currentRoom?.ratePlanCode,
        adults: findNUmberOfGuestBasedOnType(guestCount, GUEST_TYPE[0]),
        children: findNUmberOfGuestBasedOnType(guestCount, GUEST_TYPE[1]),
        babies: findNUmberOfGuestBasedOnType(guestCount, GUEST_TYPE[2]),
        contact_name: guestDetails?.name,
        contact_surname: guestDetails?.surname,
        contact_email: guestDetails?.email,
        contact_phone: guestDetails?.phone,
        provisional: false, // todo: Understand what a provisional reservation means?
        day_prices: [
          {
            date: startDate,
            price: currentRoom?.amountAfterTax, // todo: Do we deduct discount from it???
            rate: currentRoom?.ratePlanCode
          }
        ],
        numberOfRooms: currentRoom?.numberOfRooms ?? 1
      });
    
    return cacc;
    }, []);

    acc.push(...data);     
    return acc;

  }, []);

  const reservationWithNumRooms = updateReservations2(reservations);
  const sortedRes = sortReservations(reservationWithNumRooms);
  const allReservations = createTotalReservations(sortedRes);
  console.log("all reservations-------------------------",)
  console.log(allReservations);


  return {
    company: inputData?.guest?.companyId,
    customer: inputData?.guest?.contactId,
    name: "Test group",
    contact_name: guestDetails?.name,
    contact_surname: guestDetails?.surname,
    contact_email: guestDetails?.email,
    contact_phone: guestDetails?.phone,
    hotel: hotelId,
    date_from: checkinDate,
    date_to: checkoutDate,
    reservations: allReservations
  }
}

export const fetchCheckinCheckoutDates = (inputData: any) => {
  const roomDetails = inputData?.roomTypes;
  let reservationCheckinDate, reservationCheckoutDate;
  if(roomDetails?.length == 1){
    reservationCheckinDate = roomDetails[0]?.date;
    reservationCheckoutDate = new Date(reservationCheckinDate);
    reservationCheckoutDate.setDate(reservationCheckoutDate.getDate() + 1);
    reservationCheckoutDate =  reservationCheckoutDate?.toISOString()?.split("T")?.[0];
  } else {
    reservationCheckinDate = roomDetails?.[0]?.date;
    reservationCheckoutDate = roomDetails[roomDetails.length - 1]?.date;
  }

  return {
    reservationCheckinDate,
    reservationCheckoutDate
  }
}

export const transformPurposeResponse = (apiResponse: any) => apiResponse?.body?.results?.reduce((acc:any, purposeDetails: any)=> {
    acc[purposeDetails?.id] = purposeDetails?.name;
    return acc;
  }, {})

export const transformRoomCategoriesResponse = (apiResponse:any) => {
  return apiResponse?.body?.reduce((acc:any, curr:any)=> {
    acc[curr?.id] = curr?.code;
    return acc;
    },{})
}

export const transformProductResponse = (apiResponse: any) => {
  return apiResponse?.body?.reduce((acc:any, curr:any)=> {
    acc[curr?.id] = curr;
    return acc;
  },{})

}

export const modifySearchReservationData = (currentReservation: any, purposes: any, roomCategories:any, products: any) => {
  try {
  return {
    fileId: currentReservation?.group,
    yourRefId: "UA7hdf4",
    guest: {
      companyId: currentReservation?.main_guest?.company_id,
      contactId: currentReservation?.main_guest?.id
    },
    state: currentReservation?.status, //todo: Understand the states of a reservation which we are using in gateway. 
    marketing: {
      source: "",
      segment: "",
      channel: currentReservation?.channel
    },
    purpose: purposes[currentReservation?.purpose] || "",
    reservationId: currentReservation?.id,
    roomTypes: [
      {
        roomTypeCode: roomCategories[currentReservation?.room_type_id],
        roomTypeLabel: currentReservation?.room_type,
        //
        ratePlanCode: "",
        ratePlanLabel: "",
        isVirtual: false,
        amountAfterTax: null,
        discount: null,
        taxValue: 50.5,
        taxPercent: 10,
        numberOfRooms: 1,
        //
        guestCount: [
          {
            ageCategoryId: GUEST_TYPE[0],
            numberOfGuest: currentReservation?.adults
          },
          {
            ageCategoryId: GUEST_TYPE[1],
            numberOfGuest: currentReservation?.children
          },
          {
            ageCategoryId: GUEST_TYPE[2],
            numberOfGuest: currentReservation?.babies
          }
        ],
        slots: {
          slotCodeFrom: "",
          slotCodeTo: ""
        },
        pmsFields: {
        },
        orderItems: currentReservation?.extras?.reduce((acc:any, curr: any)=> {
            const prod = products[curr?.extra_id];
            acc.push({
              name: prod?.name,
              count: 1,
              currency: prod?.currency || currentReservation?.currency,
              amountAfterTax: prod?.price,
              taxValue: prod?.tax,
              taxPercent: null
            });
            return acc
        }, []) ?? []
      }
    ],
    createdAt: `${new Date(currentReservation?.created_at).toISOString()}`,
    updatedAt: `${new Date(currentReservation?.updated_at).toISOString()}`,
  }
} catch {
  return {}
}
  
}

export const createSearchReservationsResponse = (apiResponse: any, purposes: any, roomCategories: any, products: any) => {

  return apiResponse?.body?.results?.reduce((acc: any, currentReservation: any)=> {
    const startDate = currentReservation?.date_from;
    const modifiedReservationData = modifySearchReservationData(currentReservation, purposes, roomCategories, products);
    console.log("res111", currentReservation.id, startDate);
    if(Object.keys(acc).indexOf(startDate) > -1){
      acc[startDate].push(modifiedReservationData);
    } else {
      acc[startDate] = [modifiedReservationData];
    }
    return acc;
  }, {})
  //return modifySearchReservationData(apiResponse?.body?.results?.[0], purposes, roomCategories, products);
}