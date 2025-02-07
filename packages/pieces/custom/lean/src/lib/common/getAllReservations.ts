import { httpClient } from '@activepieces/pieces-common';
import { createHttpRequest } from './createHTTPRequest';
import { DATE_TYPE_FILTER } from './constants';

export const getAllReservations = async (
  origin: string,
  hotelId: string,
  token: string,
  body: any
) => {
  let dateFrom = body.startDate;
  let dateTo = body.endDate;
  const dateType = body?.dateType || 'updated';

  const params = new URLSearchParams();
  let startDateParam = '',
    endDateParam = '';
  if (dateType == DATE_TYPE_FILTER[0]) {
    startDateParam = 'date_from_since';
    endDateParam = 'date_from_until';
  } else if (dateType == DATE_TYPE_FILTER[1]) {
    startDateParam = 'date_to_since';
    endDateParam = 'date_to_until';
  } else if (dateType == DATE_TYPE_FILTER[2]) {
    startDateParam = 'updated_at_from';
    endDateParam = 'updated_at_until';
    // Update date in required format as per LEAN. eg:  2019-03-20T10:00:00
    dateFrom = body.startDate;
    dateTo = body.endDate;
  } else if (dateType == DATE_TYPE_FILTER[3]) {
    startDateParam = 'created_at_from';
    endDateParam = 'created_at_until';
    // Update date in required format as per LEAN. eg:  2019-03-20T10:00:00
    dateFrom = body.startDate;
    dateTo = body.endDate;
  } else if (dateType == DATE_TYPE_FILTER[4]) {
    startDateParam = 'updated_at_from';
    endDateParam = 'updated_at_until';
    // Update date in required format as per LEAN. eg:  2019-03-20T10:00:00
    dateFrom = body.startDate;
    dateTo = body.endDate;
    // Send status as cancelled
    params.append('status', 'Cancelada');
  }

  params.append(startDateParam, dateFrom);
  params.append(endDateParam, dateTo);
  //params.append("status", body.state);
  params.append('hotel', hotelId);

  const endpoint = `${origin}/api/v2/reservations?${params.toString()}`;
  console.log('endpount', endpoint);
  try {
    const request = createHttpRequest(endpoint, {}, 'GET', token);
    const response: any = await httpClient.sendRequest<{
      Services: any;
    }>(request);
    console.log(
      'response get reservations',
      JSON.stringify(response?.body?.results?.length)
    );
    return response;
  } catch (err: any) {
    console.log(
      'Error occured while fetching reservations!',
      JSON.stringify(err)
    );
    return {
      status: 500,
      message: 'Internal Server Error',
    };
  }
};
