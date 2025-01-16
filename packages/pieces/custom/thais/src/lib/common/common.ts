import { HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { httpRequest } from './httpRequestSender'
export const formatDate = (date: any): string => {
  if (typeof date == 'string' && date.indexOf('T') != -1) {
    return date.split('T')[0];
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

export const getAuthToken = async (
  username: any,
  password: any,
  baseUrl: any
) => {
  if (!username || !password || !baseUrl) {
    return '';
  }
  const url = baseUrl + '/hub/api/partner/login';
  const headers = { Accept: 'application/json' };
  const httpResponse = await httpRequest({
    method: HttpMethod.POST,
    url,
    body: { username, password },
    timeout: 5000,
    headers,
  });
  if (httpResponse?.body?.token) {
    return httpResponse.body?.token;
  } else {
    return '';
  }
};
