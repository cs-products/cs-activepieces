export const WEBHOOK_SOURCES = ['public', 'admin', 'api', 'system'];

export enum CUSTOM_FIELD_TYPE {
	TEXT = 'text',
	DROPDOWN = 'dropdown',
	TEXTAREA = 'textarea',
	NUMBER = 'number',
	MONEY = 'currency',
	DATE = 'date',
	DATETIME = 'datetime',
	LIST_BOX = 'listbox',
	MULTISELECT = 'multiselect',
	RADIO = 'radio',
	CHECKBOX = 'checkbox',
	HIDDEN = 'hidden',
}

export const CREATE_COMPANY_REQUIRED_PARAMS: Record<string,any> = {
	// Required Parameters.
	name: "Name",
}

export const CREATE_COMPANY_OPTIONAL_PARAMS: Record<string,any> = {
    // Optional params accroding to API gateway DTO.
    chainid: "ChainId",
    parentCompanyId: "MotherCompanyId",
    invoicingemail: "InvoicingEmail",
    websiteurl: "WebsiteUrl",
    invoicedueinterval: "InvoiceDueInterval",
    creditrating: "CreditRating",
    department: "Department",
    dunsnumber: "DunsNumber",
    referenceidentifier: "ReferenceIdentifier",
    accountingcode: "AccountingCode",
    additionaltaxidentifier: "AdditionalTaxIdentifier",
    billingcode: "BillingCode",
    email: "Contact",
    contactperson: "ContactPerson",
    identifier: "Identifier",
    iata: "Iata",
    notes: "Notes",
    taxidentifier: "TaxIdentifier",
    phone: "Telephone",
    address: "Address",
    externalidentifier: "ExternalIdentifier"
};


export const UPDATE_COMPANY_REQUIRED_PARAMS: Record<string,any> = {
    id: "CompanyId"
}

export const UPDATE_COMPANY_OPTIONAL_PARAMS: Record<string,any> = {
    chainid: "ChainId",
    name: "Name",
    parentCompanyId: "MotherCompanyId",
    invoicingemail: "InvoicingEmail",
    websiteurl: "WebsiteUrl",
    invoicedueinterval: "InvoiceDueInterval",
    options: "Options",
    creditrating: "CreditRating",
    department: "Department",
    dunsnumber: "DunsNumber",
    referenceidentifier: "ReferenceIdentifier",
    accountingcode: "AccountingCode",
    additionaltaxidentifier: "AdditionalTaxIdentifier",
    billingcode: "BillingCode",
    email: "Contact",
    contactperson: "ContactPerson",
    identifier: "Identifier",
    iata: "Iata",
    notes: "Notes",
    taxidentifier: "TaxIdentifier",
    phone: "Telephone",
    externalidentifier: "ExternalIdentifier"
}  