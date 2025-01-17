import { httpClient } from '@activepieces/pieces-common';
import { createHttpRequest } from './createHTTPRequest';

import { HttpMethod, HttpRequest } from '@activepieces/pieces-common';

const createRequest = (
  url: string,
  body: Record<string, any> = {},
  method: string
): HttpRequest => ({
  method: method as HttpMethod,
  url: url,
  body: body,
  timeout: 5000,
});

export const getAuthToken = async (
  origin: string,
  username: string,
  password: string
) => {
  try {
    const endpoint = `${origin}/api/auth/`;
    const request = createRequest(
      endpoint,
      {
        username: username,
        password: password,
      },
      'POST'
    );
    const response: any = await httpClient.sendRequest<{
      Services: any;
    }>(request);
    console.log('response get auth token', response);
    return response;
  } catch (err: any) {
    console.log(
      'Error occured while fetching aith token!',
      JSON.stringify(err)
    );
    return {
      status: 500,
      message: 'Internal Server Error',
    };
  }
};
