
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
    
    export const testxml = createPiece({
      displayName: "Testxml",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/testxml.png",
      authors: [],
      actions: [],
      triggers: [],
    });
    