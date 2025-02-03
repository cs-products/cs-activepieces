import { createAction, DynamicPropsValue, Property } from '@activepieces/pieces-framework';
import { createGetProductsResponseAsPerGateway, createSecretToken1, decode } from '../common/commonFunctions';
import { getProductDetails } from '../common/apis/getProductDetails';
import { getProductCategories } from '../common/apis/getProductCategories';

export const getProducts = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getProducts',
  displayName: 'Get Products',
  description: 'Get Products',
  props: {
    headers: Property.Object({
      displayName: "Headers",
      required: true,
    }),
    queryParams: Property.Object({
      displayName: "Query params",
      required: true,
    }),
    body_type: Property.StaticDropdown({
      displayName: "Body Type",
      required: true,
      defaultValue: "none",
      options: {
        disabled: false,
        options: [
          { label: "None", value: "none" },
          { label: "Form Data", value: "form_data" },
          { label: "JSON", value: "json" },
          { label: "Raw", value: "raw" },
        ],
      },
    }),
    body: Property.DynamicProperties({
      displayName: "Body",
      refreshers: ["body_type"],
      required: false,
      props: async ({ body_type }) => {
        if (!body_type) return {};

        const bodyTypeInput = body_type as unknown as string;

        const fields: DynamicPropsValue = {};

        switch (bodyTypeInput) {
          case "none":
            break;
          case "json":
            fields["data"] = Property.Json({
              displayName: "JSON Body",
              required: true,
            });
            break;
          case "raw":
            fields["data"] = Property.LongText({
              displayName: "Raw Body",
              required: true,
            });
            break;
          case "form_data":
            fields["data"] = Property.Object({
              displayName: "Form Data",
              required: true,
            });
            break;
        }
        return fields;
      },
    }),
  },

  async run(context) {
    // Action logic here
    const { body } = context.propsValue;

    console.log("body:,",JSON.stringify(body));

         if (!body) {
                 return {
                   status: 400,
                   message: "Request body missing!"
                 }
               }
             
           
               const reqBody: any = body?.["data"]?.["body"] || "";
           
               if (!reqBody) {
                 return {
                   status: 400,
                   message: "Request Headers missing!"
                 }
               }
           
               const decodedObject = await decode(reqBody?.data || "");
           
               const data: any = decodedObject;
               const creds = data?.["credentials"];
               console.log("data".repeat(10), JSON.stringify(data))
               if (
                 !data?.url ||
                 !data?.hotelId ||
                 !creds?.["Login"] ||
                 !creds?.["Password"]
               ) {
                 return {
                   status: 400,
                   message: "Wrong Credentials/url"
                 }
               }
          
       
           const hotelId = data?.["hotelId"];
       
           const pwd = createSecretToken1(creds["Password"], hotelId);
           console.log("getting prodiucts")
    try {
      const productCategoryResponse = await getProductCategories(`${data?.url}/GetProductCategories`, creds?.["Login"], pwd, hotelId);
      console.log("prod cat resp", JSON.stringify(productCategoryResponse))
      const response = await getProductDetails(`${data?.url}/GetProducts`, creds?.["Login"], pwd, hotelId);
      return response?.status === 200 ? createGetProductsResponseAsPerGateway(response, productCategoryResponse?.body?.ServerReturn ?? []) : response;
    } catch(err:any){
      console.log("Something went wrong");
      return  {
        status: 500,
        message: "Internal Server Error"
    }
  }
}
});
