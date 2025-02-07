import {
  createPiece,
  PieceAuth,
  Property,
} from '@activepieces/pieces-framework';
import { gimmibookings } from './lib/actions/manage-bookings';
import { generateGimmyData } from './lib/actions/generate-gimmy-data';

export const gimmyAuth = PieceAuth.CustomAuth({
  description: 'Enter authentication details',
  props: {
    username: Property.ShortText({
      displayName: 'Username',
      description: 'This is the Username you use to log into the server',
      required: true,
      defaultValue:"clicsoft"
    }),
    password: PieceAuth.SecretText({
      displayName: 'Password',
      description: 'This is the password you use to log into the server',
      required: true,
      defaultValue:"8FK/nJrv5eWoK17RpcPuOS"
    }),
    hotelId: Property.LongText({
      displayName: 'Hotel Id',
      description: 'This is the Id provided by the Gimmy',
      required: true,
      defaultValue:'1'
    }),
  },
  required: true,
});
export const gimmy = createPiece({
  displayName: 'Gimmy',
  auth: gimmyAuth,
  minimumSupportedRelease: '0.20.0',
  logoUrl: 'https://csapigateway.clicsoft.dev/images/gimmy.svg',
  authors: [],
  actions: [gimmibookings,generateGimmyData],
  triggers: [],
});