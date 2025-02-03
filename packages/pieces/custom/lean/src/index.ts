
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
//import { catchLeanWebhook } from "./lib/actions/catch-lean-webhook";
import { getResourceCategories } from "./lib/actions/get-resource-categories";
import { createReservations } from "./lib/actions/create-reservations";
import { searchReservations } from "./lib/actions/search-reservations";
import { getHotelConfig } from "./lib/actions/get-hotel-info";
    
export const lean = createPiece({
  displayName: "Lean",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/lean.png",
  authors: [],
  actions: [getResourceCategories, createReservations, searchReservations, getHotelConfig],
  triggers: [],
});
