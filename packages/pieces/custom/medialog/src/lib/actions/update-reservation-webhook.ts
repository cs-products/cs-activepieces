import { createAction } from '@activepieces/pieces-framework';
import {  createOrderItemForAccomodationStay, createResponseFromWebhook, createSecretToken1, fetchDataFromXml, fetchGuestTypesBasedOnAge, fetchOrderItemsDateWise, fetchProductCategoryLables, fetchProductLabels, fetchRoomLabel, fetchRoomTypeLabel, formatDate, formatDateString, transformSegmentsResponse, xmlData } from '../common/commonFunctions';
import { getBookingDetails, getProductCategories, getProducts, getRooms, getRoomTypes } from '../common/apis/getBookingDetails';
import { getSegments } from '../common/apis/getSegments';
import { MEDIALOGWEBHOOKRESPONSE } from '../common/types';

export const updateReservationWebhook = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'updateReservationWebhook',
  displayName: 'Update Reservation Webhook',
  description: 'Update Reservation Webhook',
  props: {},
  async run(context) {

    try {
      const {
        reservationId,
        marketCode,
        businessSource,
        ratePlanCode,
        ratePlanDayWise,
        roomTypeCode

      } =  fetchDataFromXml(xmlData);

      console.log("update reservation webhook");
      const data =  await getBookingDetails("",{});
      const hotelId = "960"
      const client = data?.body?.ServerReturn?.Client;
      const medialogData: MEDIALOGWEBHOOKRESPONSE = data?.body?.ServerReturn;
      console.log("data",JSON.stringify(data));

      const idRoomType = data?.body?.ServerReturn?.IdRoomType || "";
      const productIds = (data?.body?.ServerReturn?.Produits?.map((prod:any)=> prod?.IdProduit)?.filter(Boolean) || []);
      const segmentsEndpoint = `https://interfaces.medialog.fr/Interface/GetSegments`;
      const pwd = createSecretToken1("Hnkyj45*fd&#YZThnb6r6fd", "960");

      const segmentsResponse = await getSegments(segmentsEndpoint, "SecretTestAccount", pwd, hotelId);
      const allSegments = segmentsResponse?.status === 200 ? transformSegmentsResponse(segmentsResponse) : {};
      console.log(JSON.stringify(allSegments))

      const roomTypeData = await getRoomTypes();
      console.log("room tyoe data", roomTypeData);
      const roomTypeLabel = fetchRoomTypeLabel(roomTypeData, idRoomType);

      const roomsData = await getRooms();
      console.log("rooms data",JSON.stringify(roomsData));
      const { roomCode, roomId } = fetchRoomLabel(roomsData, idRoomType);

      const allProducts = await getProducts();
      console.log("all prods", JSON.stringify(allProducts));

      const productLabels = fetchProductLabels(allProducts, productIds);
      console.log("prodcutLabels",productLabels);

      const productCategories = await getProductCategories();
      console.log("prod categories", JSON.stringify(productCategories));
      const prodCategoryLabels = fetchProductCategoryLables(productCategories, productLabels);
      console.log("prodCategoryLabels", JSON.stringify(prodCategoryLabels));


      const currencyCode = "EUR";//todo fetch from rate plan
      
      
    
      const ratePlanLabel = "Half Board";

      const orderItems = fetchOrderItemsDateWise(medialogData?.Produits, currencyCode, productLabels);
      const guestTypes = fetchGuestTypesBasedOnAge(medialogData);
      const accomodationSalesDateWise = createOrderItemForAccomodationStay(medialogData, ratePlanDayWise);
      const response = createResponseFromWebhook(medialogData, allSegments,orderItems, guestTypes, ratePlanCode, roomTypeCode, marketCode, businessSource, ratePlanLabel, roomTypeLabel,accomodationSalesDateWise,roomId, roomCode,ratePlanDayWise);
      return {
        status: 200,
        response: {
          response,
          reservationId
        }
      }
    }catch(err:any){
      console.log(`Some error occured`,JSON.stringify(err));
      return {
        status: 500,
        message: "Internal Server Error!"
      }
    }
  }
});
