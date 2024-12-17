import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { createHttpPostRequest } from '../common';

 interface RequestPayload {
  origin: string;
  clientToken: string;
  accessToken: string;
  client: string;
  rateId: string;
  startDate: string;
  endDate: string;
  productId?: string;
}

export const getPricing = async (body: RequestPayload) => {
  if (!body) {
    throw new Error('Request body is missing');
  }
  console.log('Request body:', body);
  const {
    origin,
    clientToken,
    accessToken,
    client,
    rateId,
    startDate,
    endDate,
    productId
  } = body;

  // External API call to fetch rates
  const endpoint = `${origin}/api/connector/v1/rates/getPricing`;

  const request = createHttpPostRequest('POST' as HttpMethod, endpoint, {
    ClientToken: clientToken,
    AccessToken: accessToken,
    Client: client,
    RateId: rateId,
    FirstTimeUnitStartUtc: startDate,
    LastTimeUnitEndUtc: endDate,
  });

  if(productId !== undefined) {
    request.body.ProductId = productId;
  }

  try {
    const response = await httpClient.sendRequest<any>(request);

    if (!response?.body) {
      throw new Error('Failed to fetch pricing or no pricing found');
    }

    return response.body;
  } catch (error: any) {
    console.error('Error during pricing retrieval:', error);
    throw new Error(`Pricing retrieval failed: ${error.message}`);
  }
};
