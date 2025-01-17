export const ADD_CONTACT_REQUIRED_PARAMS: Record<string, any> = {
  // Required Parameters.
  name: "name",
  surname: "surname"
};

export const ADD_CONTACT_OPTIONAL_PARAMS: Record<string, any> = {
  // Optional params accroding to API gateway DTO.
  email: 'email',
  phone: 'phone',
  address: 'address',
  birthDate: "birthdate",
};

export const UPDATE_CONTACT_REQUIRED_PARAMS: Record<string, any> = {
  // Required Parameters.
  id: 'id',
};

export const UPDATE_CONTACT_OPTIONAL_PARAMS: Record<string, any> = {
  // Optional params accroding to API gateway DTO.
  name: "name",
  surname: "surname",
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
