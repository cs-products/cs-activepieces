import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { updateContact } from "./lib/actions/update-contact";
import { getPaymentModes } from "./lib/actions/get-payment-modes";
import { addContact } from "./lib/actions/add-contact";
import { searchContact } from "./lib/actions/search-contact";
import { updateReservationWebhook } from "./lib/actions/update-reservation-webhook";
import { getresourcecategories } from "./lib/actions/getresourcecategories";
import { getResources } from "./lib/actions/get-resources";
import { getHotelInfo } from "./lib/actions/get-hotel-info";
import { getProducts } from "./lib/actions/get-products";
import { getReservations } from "./lib/actions/get-reservations";

export const medialog = createPiece({
  displayName: "Medialog",
  auth: PieceAuth.None(),
  minimumSupportedRelease: "0.36.1",
  logoUrl: "https://cdn.activepieces.com/pieces/medialog.png",
  authors: [],
  actions: [addContact, updateContact, searchContact, getPaymentModes, updateReservationWebhook, getresourcecategories, getResources, getHotelInfo, getReservations, getProducts],
  triggers: [],
});
