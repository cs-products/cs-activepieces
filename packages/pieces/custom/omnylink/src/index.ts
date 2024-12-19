

import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { getAuthToken } from "./lib/common/getAuthToken";
import { getActions } from "./lib/actions/get-actions";


export const omnyLinkAuth = PieceAuth.CustomAuth({
  description: 'Enter authentication details',
  props: {
    username: Property.ShortText({
      displayName: 'Username',
      description: 'This is the Username you use to log into the server',
      required: true,
    }),
    password: PieceAuth.SecretText({
      displayName: 'Password',
      description: 'This is the password you use to log into the server',
      required: true,
    }),
    baseUrl: Property.LongText({
      displayName: 'Base Url',
      description: 'This is the Base Url',
      required: true,
    }),
  },
  required: true,
  // Optional Validation
  validate: async ({ auth }) => {
    if (auth) {
      const token = await getAuthToken(auth, auth?.baseUrl)
      if (token) {
        return {
          valid: true,
        }
      } else {
        return {
          valid: false,
          error: ""
        }
      }
    } else {
      return {
        valid: false,
        error: ""
      }
    }
  },
})

    
  export const omnylink = createPiece({
    displayName: "Omnylink",
    auth: omnyLinkAuth,
    minimumSupportedRelease: '0.36.1',
    logoUrl: "https://res.cloudinary.com/dvdj0gpzr/image/upload/c_thumb,w_200,g_face/v1734518741/gwc0zcb8cernp6qbl3ge.svg",
    authors: [],
    actions: [getActions],
    triggers: [],
  });
    