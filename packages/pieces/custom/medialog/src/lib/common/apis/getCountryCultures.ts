import { httpClient } from '@activepieces/pieces-common';
import { createHttpRequest } from './createHttpRequest';

export const getCountryCultures = async (
  endpoint: string,
  login: string,
  password: string,
  hotelId: string
) => {
  try {
    const request = createHttpRequest(
      endpoint,
      {},
      'GET',
      {
        Login: login,
      },
      password,
      hotelId
    );
    console.log('request', JSON.stringify(request));
    const response: any = await httpClient.sendRequest<{
      Services: any;
    }>(request);
    console.log(
      'response get country culture details',
      JSON.stringify(response)
    );
    return response;
  } catch (err: any) {
    console.log(
      'Error occured while fetching country culturea!',
      JSON.stringify(err)
    );
    return {
      status: 500,
      message: 'Internal Server Error',
    };
  }
};
