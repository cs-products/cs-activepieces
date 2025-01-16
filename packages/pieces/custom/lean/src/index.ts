
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { addContact } from "./lib/actions/add-contact";
import { searchContact } from "./lib/actions/search-contact";
import { getHotelConfig } from "./lib/actions/get-hotel-config";
import { updateContact } from "./lib/actions/update-contact";
    
export const lean = createPiece({
  displayName: 'Lean',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/lean.png',
  authors: [],
  actions: [addContact,searchContact,getHotelConfig,updateContact],
  triggers: [],
});
    