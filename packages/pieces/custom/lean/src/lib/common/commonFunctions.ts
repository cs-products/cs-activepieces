import { HttpMethod, HttpRequest } from "@activepieces/pieces-common";

export const createHttpPostRequest = (
  method: HttpMethod,
  url: string,
  headers: Record<string, any> = {},
  additionalBody: Record<string, any> = {}
): HttpRequest => ({
  method,
  url,
  headers,
  timeout: 5000,
  body: {
    Limitation: {
      Cursor: null,
      Count: 999,
    },
    ...additionalBody,
  },
});

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

export const checkIfAllRequiredParamsArePresent = (
  requestBody: any,
  requiredParams: any
) => {
  const requestBodyKeys = Object.keys(requestBody);
  let allKeysPresent = true;
  Object.keys(requiredParams).forEach((param: string) => {
    if (!requestBodyKeys.includes(param)) allKeysPresent = false;
  });
  return allKeysPresent;
};

export const transformRequest = (
  requestBody: any,
  requiredParams: any,
  optionalParams: any
) => {
  const requestBodyKeys = Object.keys(requestBody);
  const requiredBody = Object.entries(requiredParams).reduce<
    Record<string, any>
  >((acc, [key, val]) => {
    let mewsKey: string;
    if (requestBodyKeys.includes(key)) {
      mewsKey = requiredParams[key] || '';
      acc[mewsKey] = requestBody?.[key];
    }
    return acc;
  }, {});

  const body = Object.entries(requestBody).reduce<Record<string, any>>(
    (acc, [key, val]) => {
      let mewsKey: string;
      if (Object.keys(optionalParams).includes(key)) {
        mewsKey = optionalParams[key] || '';
        acc[mewsKey] = val;
      }
      return acc;
    },
    { ...requiredBody }
  );

  if (body['address']) {
    body['address'] = requestBody?.['address']?.['street'] || '';
    body['city'] = requestBody?.['address']?.['city'] || '';
    body['country'] = requestBody?.['address']?.['country'] || '';
    body['postal_code'] = requestBody?.['address']?.['zip'] || '';
  }
  return body;
};