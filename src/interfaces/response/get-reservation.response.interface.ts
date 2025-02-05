export interface GetReservationResponseInterface {
  id: number;
  reservationTime: string;
  partySize: number;
  customerName: string;
  phoneNumber: string;
  status: string;
  table: TableResponse | null;
}

export interface TableResponse {
  id: number;
  capacity: number;
}
