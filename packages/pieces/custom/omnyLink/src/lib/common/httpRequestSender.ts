import { httpClient, HttpMethod, HttpRequest, HttpResponse } from "@activepieces/pieces-common";

type HttpRequestParams = {
    method: HttpMethod; // HTTP Method (GET, POST, PUT, DELETE, etc.)
    url: string;        // The API endpoint URL
    body?: any;         // Optional payload for methods like POST, PUT
    timeout?: number;   // Optional timeout in milliseconds
    headers?: Record<string, string>; // Optional headers
    queryParams?: Record<string, string | number | boolean | undefined>; // Query parameters
};

// Define the function for making HTTP requests
export const httpRequest = async (
  req: HttpRequestParams
): Promise<HttpResponse> => {
  const { method, url, body, timeout = 5000, headers = {}, queryParams } = req;

   let finalUrl = url;
  if (queryParams) {
    const formattedQueryParams = new URLSearchParams(
      Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined) // Remove undefined values
        .map(([key, value]) => [key, String(value)]) // Convert all values to strings
    ).toString();

    // Append the query string to the URL if not empty
    if (formattedQueryParams) {
      finalUrl += `?${formattedQueryParams}`;
    }
  }

  // Ensure headers are properly structured
  const finalHeaders = {
    ...headers, // Spread existing headers
  };
  
  // Only add Content-Type for requests that have a body
  if (method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  // Create the base request object
  const loginRequest: HttpRequest = {
    method,
    url: finalUrl,
    headers: finalHeaders,
    timeout,
  };

  // Add body only for methods that require it (POST, PUT, PATCH)
  if (method !== HttpMethod.GET && method !== HttpMethod.DELETE && body) {
    loginRequest.body = body;
  }

  console.log('Final request::::', loginRequest);

  try {
    // Send the HTTP request using the httpClient
    const httpResponse = await httpClient.sendRequest(loginRequest);

    console.log('Response received::::', httpResponse);
    return httpResponse;
  } catch (error) {
    console.error('Error during HTTP request:', error);
    throw new Error(`HTTP request failed: ${error}`);
  }
};
