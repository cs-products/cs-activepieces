import {
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

export const createHttpPostRequest = (
  method: HttpMethod,
  url: string,
  additionalBody: Record<string, any> = {}
): HttpRequest => ({
  method,
  url,
  timeout: 5000,
  body: {
    Limitation: {
      Cursor: null,
      Count: 999,
    },
    ...additionalBody,
  },
});

export const mapKeys = (data: any, obj: any) => {
  return Object.entries(data).reduce<Record<string, any>>((acc, [key, val]) => {
    let mewsKey: string;
    if (Object.keys(obj).includes(key)) {
      mewsKey = obj[key] || "";
    } else {
      mewsKey = key;
    }
    acc[mewsKey] = val;
    return acc;
  }, {})
}