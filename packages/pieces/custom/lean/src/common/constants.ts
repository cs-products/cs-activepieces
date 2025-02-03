export const GUEST_TYPE = {
    0: "ADULTS",
    1: "CHILDREN",
    2: "BABIES"
}

export const RESERVATION_STATUS_MAP = {
    Checkin: "Checkin",
    Confirmed: "Confirmada",
    Checkout: "Checkout",
    Cancelled: "Cancelada",
    NoShow: "NoShow"
}

export const RESERVATION_FILTER_KEYS = {
    status: "status", // key is coming from api gateway & value is the string used in LEAN.
    name: "guest_name",
    lastName: "contact_surname",
    roomType: "room_type",
    roomId: "room",
    reservtionId: "reference",
    fileId: "group",
    startDate: "date_from",
    endDate: "date_to"
}

export const TAXES_KEYS_MAPPING = {
    erp_code: 'code',
    description: 'name',
    value: 'value',
};