
import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import axios from "axios";
import { getHotelConfig } from "./lib/actions/get-hotel-config";
    
export const thaisAuth = PieceAuth.CustomAuth({
  description: 'Enter authentication details',
  props: {
  username: Property.ShortText({
    displayName: 'Username',
    description: 'This is the Username you use retrieve token',
    required: true,
  }),
  password: PieceAuth.SecretText({
    displayName: 'Password',
    description: 'This is the password you use to retrieve token',
    required: true,
  }),
},
  required: true,
});
    
export const thais = createPiece({
  displayName: "Thais",
  auth: thaisAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/thais.png",
  authors: [],
  actions: [getHotelConfig],
  triggers: [],
});
    