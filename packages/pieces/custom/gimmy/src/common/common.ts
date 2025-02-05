
const {moment} = require('moment')
export const formatDate = (date: any): string => {
  if (typeof date == 'string' && date.indexOf("T") != -1) {
    return date.split("T")[0]
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

export const getMinMaxConsumedAt = (data: any) => {
  if (!data.length) return { min: null, max: null };

  const dates = data.map((item: any) => new Date(item));
  return {
    min: dates.reduce((a:any, b:any) => (a < b ? a : b)),
    max: dates.reduce((a: any, b: any) => (a > b ? a : b))
  };
};