
import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { getHotelConfig } from "./lib/actions/get-hotel-config";
import { getAuthToken } from "./lib/common/getAuthToken";

export const omnyLinkAuth = PieceAuth.BasicAuth({
  description: 'Enter your username and password',
  required: true,
  username: {
    displayName: 'Username',
    description: 'Enter your username',
  },
  password: {
    displayName: 'Password',
    description: 'Enter your password',
  },
  // Optional Validation
  validate: async ({ auth }) => {
    if (auth) {
      const token = await getAuthToken(auth)
      if (token){
        return {
          valid: true,
        };
      }else{
        return {
          valid: false,
          error: ""
        }
      }
    }else{
      return {
        valid: false,
        error: ""
      }
    }
  },
})

export const omnyLink = createPiece({
  displayName: "Omnylink",
  auth: omnyLinkAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/omnyLink.png",
  authors: [],
  actions: [getHotelConfig],
  triggers: [],
});


