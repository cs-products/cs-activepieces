
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { addContact } from "./lib/actions/add-contact";
import { searchContact } from "./lib/actions/search-contact";
import { getHotelConfig } from "./lib/actions/get-hotel-config";
import { updateContact } from "./lib/actions/update-contact";
import { getResourceCategory } from "./lib/actions/get-resource-category";
import { getProducts } from "./lib/actions/get-products";
import { getRatePlans } from "./lib/actions/get-rate-plans";
import { catchLeanWebhook } from "./lib/actions/catch-lean-webhook";
import { createDeposit } from "./lib/actions/create-deposit";
import { getDeposits } from "./lib/actions/get-deposits";
import { createCompany } from "./lib/actions/create-company";
import { searchCompany } from "./lib/actions/search-company";
import { updateCompany } from "./lib/actions/update-company";
import { searchReservations } from "./lib/actions/search-reservations";
    
export const lean = createPiece({
  displayName: 'Lean',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/lean.png',
  authors: [],
  actions: [addContact,searchContact,getHotelConfig,updateContact,getResourceCategory,getProducts,getRatePlans,catchLeanWebhook,createDeposit,getDeposits,createCompany,searchCompany,updateCompany,searchReservations],
  triggers: [],
});
    