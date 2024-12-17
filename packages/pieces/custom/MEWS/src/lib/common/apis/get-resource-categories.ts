import {
  httpClient,
  HttpMethod,
} from '@activepieces/pieces-common';
import { createHttpPostRequest } from '../common';

export interface RequestPayload {
  origin: string;
  clientToken: string;
  accessToken: string;
  client: string;
  enterpriseIds?: string[];
  serviceIds: string[];
  resourceCategoryIds?: string[];
  updatedUtc?: {
    startUtc: string; // ISO 8601 format date string
    endUtc: string; // ISO 8601 format date string
  };
  status?: string;
}

export interface ResourceCategories {
  Id: string; // UUID string for the ID
  EnterpriseId: string; // UUID string for the Enterprise ID
  ServiceId: string; // UUID string for the Service ID
  IsActive: boolean; // Boolean indicating if the item is active
  Type: string; // Type of the service, in this case "Bed"
  Names: Record<string, string>; // Dictionary for names, with locale as key (e.g., 'en-US')
  ShortNames: Record<string, string>; // Dictionary for short names, with locale as key (e.g., 'en-US')
  Descriptions: Record<string, string>; // Dictionary for descriptions, can be empty
  Ordering: number; // Integer value for ordering
  Capacity: number; // Integer value for capacity
  ExtraCapacity: number; // Integer value for extra capacity
  ExternalIdentifier: string | null; // External identifier, can be null
};

export const getRates = async (body: RequestPayload) => {
  if (!body) {
    throw new Error('Request body is missing');
  }
  console.log('Request body:', body);
  const {
    origin,
    clientToken,
    accessToken,
    client,
    enterpriseIds,
    serviceIds,
    resourceCategoryIds,
    updatedUtc,
    status,
  } = body;

  // Add optional ServiceIds
  if (serviceIds !== undefined && serviceIds.length > 0) {
    throw new Error('ServiceIds are required');
  }
  // External API call to fetch rates
  const endpoint = `${origin}/api/connector/v1/rates/getAll`;

  const request = createHttpPostRequest('POST' as HttpMethod, endpoint, {
    ClientToken: clientToken,
    AccessToken: accessToken,
    Client: client,
    ServiceIds: serviceIds,
  });

  // Add optional EnterpriseIds
  if (enterpriseIds !== undefined && enterpriseIds.length > 0) {
    request.body.EnterpriseIds = enterpriseIds;
  }
  if (status !== undefined) {
    request.body.ActivityStates = status;
  }
  if(updatedUtc !== undefined) {
    request.body.UpdatedUtc = {
      StartUtc: updatedUtc.startUtc,
      EndUtc: updatedUtc.endUtc,
    };
  }

  // Add optional ResourceCategoryIds
  if (resourceCategoryIds !== undefined && resourceCategoryIds.length > 0) {
    request.body.ResourceCategoryIds = resourceCategoryIds;
  }

  try {
    const response = await httpClient.sendRequest<{ ResourceCategories: ResourceCategories[] }>(
      request
    );

    if (!response?.body?.ResourceCategories) {
      throw new Error('Failed to fetch resource categories');
    }

    return response.body.ResourceCategories;
  } catch (error: any) {
    console.error('Error during resource categories fetch:', error);
    throw new Error(`resource categories fetch failed: ${error.message}`);
  }
};
