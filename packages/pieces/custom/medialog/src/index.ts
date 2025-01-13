import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { addContact } from "./lib/actions/add-contact";
import { searchContact } from "./lib/actions/search-contact";
import { updateContact } from "./lib/actions/update-contact";
import { getHotelInfo } from "./lib/actions/get-hotel-info";
import { getresourcecategories } from "./lib/actions/get-resource-categories";
    
export const medialog = createPiece({
  displayName: "Medialog",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/medialog.png",
  authors: [],
  actions: [addContact, searchContact, updateContact, getHotelInfo, getresourcecategories],
  triggers: [],
});
    