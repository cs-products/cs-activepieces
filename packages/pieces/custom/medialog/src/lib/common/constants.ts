export const REQUIRED_PARAMS_CREATE_CONTACT = {
  surname: 'LastName',
  name: 'FirstName',
};

export const OPTIONAL_PARAMS_CREATE_CONTACT = {
  dob: 'DateNaissance',
  nationality: 'IdPaysNaissance',
  gender: 'Gender',
};

export const UPDATE_CONTACT_PARAMS = {
  reason: 'Motif',
  dataType: 'DataType',
  id: 'IdElement',
};

export const UPDATE_CONTACT_CHANGE_FIELDS = {
  surname: 1,
  name: 2,
  phone: 4,
  email: 6,
  address: 7,
  memo: 8,
  dob: 14,
  nationality: 37,
};
