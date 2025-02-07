export const GUEST_TYPE = {
  0: 'ADULTS',
  1: 'CHILDREN',
  2: 'BABIES',
};

export const ADD_CONTACT_REQUIRED_PARAMS: Record<string, any> = {
  // Required Parameters.
  name: 'name',
  surname: 'surname',
};

export const ADD_CONTACT_OPTIONAL_PARAMS: Record<string, any> = {
  // Optional params accroding to API gateway DTO.
  email: 'email',
  phone: 'phone',
  address: 'address',
  birthDate: 'birthdate',
};

export const UPDATE_CONTACT_REQUIRED_PARAMS: Record<string, any> = {
  // Required Parameters.
  id: 'id',
};

export const ADD_COMPANY_REQUIRED_PARAMS: Record<string, any> = {
  // Required Parameters.
  name: 'name',
};

export const ADD_COMPANY_OPTIONAL_PARAMS: Record<string, any> = {
  // Optional params accroding to API gateway DTO.
  email: 'email',
  phone: 'phone',
  siretNumber: 'cif',
  vatNumber: 'tax_id',
  address: 'address',
};

export const UPDATE_COMPANY_OPTIONAL_PARAMS: Record<string, any> = {
  // Optional params accroding to API gateway DTO.
  id: 'id',
  email: 'email',
  phone: 'phone',
  siretNumber: 'cif',
  vatNumber: 'tax_id',
  address: 'address',
};

export const UPDATE_CONTACT_OPTIONAL_PARAMS: Record<string, any> = {
  // Optional params accroding to API gateway DTO.
  name: 'name',
  surname: 'surname',
  email: 'email',
  phone: 'phone',
  address: 'address',
  birthDate: 'birthdate',
};

export const TAXES_KEYS_MAPPING = {
  erp_code: 'code',
  description: 'name',
  value: 'value',
};

export const ADD_DEPOSIT_REQUIRED_PARAMS = {
  paymentDate: 'date',
  yourRefId: 'number',
  amountInclusiveTaxes: 'value',
};

export const ADD_DEPOSIT_OPTIONAL_PARAMS = {
  folioId: 'reservation',
  modeOfPayment: 'payment_type_id',
};

export const DATE_TYPE_FILTER = {
  0: 'arrival',
  1: 'departure',
  2: 'updated',
  3: 'created',
  4: 'deleted',
};