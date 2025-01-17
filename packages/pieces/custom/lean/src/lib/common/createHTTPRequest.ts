import { HttpMethod, HttpRequest } from '@activepieces/pieces-common';

export const createHttpRequest = (
  url: string,
  body: Record<string, any> = {},
  method: string,
  token: string
): HttpRequest => ({
  method: method as HttpMethod,
  headers: {
    Authorization: `Token ${token}`,
  },
  url: url,
  body: body,
  timeout: 5000,
});
