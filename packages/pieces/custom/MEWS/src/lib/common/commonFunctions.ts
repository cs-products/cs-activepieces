import { CREATE_COMPANY_OPTIONAL_PARAMS, CREATE_COMPANY_REQUIRED_PARAMS } from "./constants";

export const decode = (body: string) => {
  console.log('decode', body);
  const jsonString = atob(body); // Decode Base64 string to JSON string
  return JSON.parse(jsonString); // Parse JSON string back to object
};

export const transformCreateCompanyResponse = (responseData: any) => {
  if(responseData?.status == 200){
      const companyData = responseData?.body?.Companies?.[0];
      
      return  {
          status: 200,
          body: {
          id: companyData?.Id || "",
          siretNumber: companyData?.siretNumber || "",
          vatNumber: companyData?.vatNumber || "",
          name: companyData?.["Name"] || "",
          email: companyData?.["Contact"] || "",
          phone: companyData?.["Telephone"] || "",
          address: {
              street: companyData?.["Address"]?.["Line1"],
              city: companyData?.["Address"]?.["City"],
              state: companyData?.["Address"]?.["CountrySubdivisionCode"],
              country: companyData?.["Address"]?.["CountryCode"],
              zip: companyData?.["Address"]?.["PostalCode"]
          }            
      }
    }
  } else {
      return responseData;
  }
  
}

export const checkIfAllRequiredParamsArePresent = (requestBody: any, requiredParams: any) => {
  const requestBodyKeys = Object.keys(requestBody);
  let allKeysPresent = true;
  Object.keys(requiredParams).forEach((param:string)=> {
    if(!requestBodyKeys.includes(param)) allKeysPresent = false;
  });
  return allKeysPresent;
}

export const transformRequest = (requestBody:any, requiredParams:any, optionalParams:any) => {

  const requestBodyKeys = Object.keys(requestBody);
  const requiredBody = Object.entries(requiredParams).reduce<Record<string, any>>((acc,[key,val])=> {
    let mewsKey: string;
    if(requestBodyKeys.includes(key)){
      mewsKey = requiredParams[key] || "";
      acc[mewsKey] = requestBody?.[key];
    }
    return acc;
  }, {});

  const body =  Object.entries(requestBody).reduce<Record<string, any>>((acc,[key,val])=> {
    let mewsKey :string;
    if(Object.keys(optionalParams).includes(key)){
      mewsKey = optionalParams[key] || "";
      acc[mewsKey] = val;
    }
    return acc;
  }, {...requiredBody});

  if(body["Address"])
    body["Address"] = {
      "Line1": requestBody?.["address"]?.["street"] || "",
      "City": requestBody?.["address"]?.["city"] || "",
      "CountryCode":  requestBody?.["address"]?.["country"] || "",
      "PostalCode": requestBody?.["address"]?.["postalCode"] || "",
    }

  return body;
}

// export const transformRequest = (requestBody: any) => {

//   const requestBodyKeys = Object.keys(requestBody);
//   const requiredBody = Object.entries(CREATE_COMPANY_REQUIRED_PARAMS).reduce<Record<string, any>>((acc,[key,val])=> {
//     let mewsKey: string;
//     if(requestBodyKeys.includes(key)){
//       mewsKey = CREATE_COMPANY_REQUIRED_PARAMS[key] || "";
//       acc[mewsKey] = requestBody?.[key];
//     }
//     return acc;
//   }, {})

//   const body =  Object.entries(requestBody).reduce<Record<string, any>>((acc,[key,val])=> {
//     let mewsKey :string;
//     if(Object.keys(CREATE_COMPANY_OPTIONAL_PARAMS).includes(key)){
//       mewsKey = CREATE_COMPANY_OPTIONAL_PARAMS[key] || "";
//       acc[mewsKey] = val;
//     }
//     return acc;
//   }, {...requiredBody});

  

//   return body;
// }

export const transformUpdateRequest = (requestBody:any, requiredParams:any, optionalParams:any) => {

  const valuesToBeUpdatedWithObj = ["Name", "MotherCompanyId", "InvoiceDueInterval", "ContactPerson", "Contact", "Notes", "Iata", "Department", "DunsNumber", "ExternalIdentifier", "ReferenceIdentifier", "WebsiteUrl"]

  const requestBodyKeys = Object.keys(requestBody);
  const requiredBody = Object.entries(requiredParams).reduce<Record<string, any>>((acc,[key,val])=> {
    let mewsKey: string;
    if(requestBodyKeys.includes(key)){
      mewsKey = requiredParams[key] || "";
      acc[mewsKey] = requestBody?.[key];      
    }
    return acc;
  }, {});

  const body =  Object.entries(requestBody).reduce<Record<string, any>>((acc,[key,val])=> {
    let mewsKey :string;
    if(Object.keys(optionalParams).includes(key)){
      mewsKey = optionalParams[key] || "";
      if(valuesToBeUpdatedWithObj.includes(mewsKey)){
        acc[mewsKey] = {
          "Value": requestBody?.[key]
        }
      } else {
        acc[mewsKey] = requestBody?.[key];
      }
    }
    return acc;
  }, {...requiredBody});

  if(body["Address"])
    body["Address"] = {
      "Line1": requestBody?.["address"]?.["street"] || "",
      "City": requestBody?.["address"]?.["city"] || "",
      "CountryCode":  requestBody?.["address"]?.["country"] || "",
      "PostalCode": requestBody?.["address"]?.["postalCode"] || "",
    }

  return body;
}




export const createCredentialsParams = (creds: any) => {
  const requiredCreds : Record<string, any> = {
    clientToken: "ClientToken",
    accessToken: "AccessToken",
    client: "Client",
  }

  return Object.entries(creds).reduce<Record<string, any>>((acc,[key,val])=> {
    let credKey :string;
    if(Object.keys(requiredCreds).includes(key)){
      credKey = requiredCreds[key] || "";
    } else {
      credKey = key ;
    }
    acc[credKey] = val;
    return acc;
  }, {})
}
