import { createAction, Property } from '@activepieces/pieces-framework';
import { httpRequest } from '../common/httpRequestSender';
import { HttpMethod } from '@activepieces/pieces-common';
import { omnyLinkAuth } from '../../index'
import { getAuthToken } from '../common/getAuthToken';

export const getHotelConfig = createAction({
  auth: omnyLinkAuth,
  // check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getHotelConfig',
  displayName: 'Get Hotel Config',
  description: '',
  props: {
    connect: Property.StaticDropdown({
      displayName: 'Connect',
      description: 'Select your Connection',
      required: true,
      options: {
        options: [
          {
            label: 'Mews',
            value: 'mews',
          }
        ],
      },
    }),
    reqParams: Property.LongText({
      displayName: 'reqParams',
      description: 'base64 format',
      required: true,
    }),
    ref: Property.ShortText({
      displayName: 'ref',
      description: 'Enter Ref Value',
      required: true,
    })
  },
  async run(context) {
    const token = await getAuthToken(context.auth)
    if (!token) {
      return { message: 'unauthorised' }
    }
    const { connect, reqParams, ref } = context.propsValue;
    const baseUrl = 'https://unifiedplatform.clicsoft.dev'
    const url = baseUrl + '/hotelInfo';
    const headers = { Accept: 'application/json', connectWith: connect, reqParams: reqParams, ref: ref, Authorization: `Bearer ${token}` }
    const httpResponse = await httpRequest({ method: HttpMethod.GET, url, timeout: 5000, headers })
    if (httpResponse?.body) {
      return httpResponse?.body
    } else {
      return {}
    }
  },
});
