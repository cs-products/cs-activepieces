export type DateObject = {
  DateStart: string;
  DateEnd: string;
};

export type BookingDetailsDTO = {
  Dates: DateObject;
};

export type BookingDetailsBody = {
  ServerTime: string;
  ServerReturn: object;
};

export type BookingDetailsResponse = {
  status: number;
  body: BookingDetailsBody;
};

export type PMSField = {
  hotelId: string;
};

export type BookingDetailsRequestBody = {
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  pmsField: PMSField;
};

export type SoldProduit = {
  MontantCa: number;
};

export type SingleBookingResponse = {
  resource: string;
  resouceCateogry: string;
  status: string;
  amount: number;
  purpose: string;
  currency: string;
  segment: string;
  arrivalDate: string;
  departureDate: string;
};

export type PassportType = {
  Numero?: string;
};

export type TelephoneType = {
  Mobile?: string;
};

export type AddressType = {
  Adresse: string;
  CodePostal: string;
  Ville: string;
  Pays: string;
};

export type CreateContactDTO = {
  Passeport?: PassportType;
  Gender?: string;
  IdCouleur?: string;
  IdNationalite?: string;
  DateNaissance?: string;
  IdPaysNaissance?: string;
  IdOrigine?: Array<string>;
  IdCodesMktg?: Array<string>;
  IdLangue?: number;
  AcceptMailing?: boolean;
  IdTitre?: string;
  Telephone?: TelephoneType;
  Adresse: AddressType;
  LastName: string;
  FirstName?: string;
};
