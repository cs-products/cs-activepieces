
import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { getHotelConfig } from "./lib/actions/get-hotel-config";
import axios from "axios";
    
export const leanAuth = PieceAuth.CustomAuth({
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
  async validate({auth}) {
    try {
        const response = await axios.post("https://your-auth-api.com/token", {
            username: auth.username,
            password: auth.password,
        });

        if (response.data && response.data.token) {
            // Token retrieved successfully
            return { valid: true };
        } else {
            // Token retrieval failed
            return { valid: false, error: "Failed to retrieve token. Please check your credentials." };
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred during authentication.";
        return { valid: false, error: `Authentication failed: ${errorMessage}` };
    }
  },
});

export const lean = createPiece({
  displayName: "Lean",
  auth: leanAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/lean.png",
  authors: [],
  actions: [getHotelConfig],
  triggers: [],
});
    