
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { getRatePlan } from "./lib/actions/get-rate-plan";
import { getResources } from "./lib/actions/get-resources";
import { catchThaisWebhook } from "./lib/actions/catch-thais-webhook";
    
export const thais = createPiece({
  displayName: "Thais",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/thais.png",
  authors: [],
  actions: [getRatePlan,getResources,catchThaisWebhook],
  triggers: [],
});
    