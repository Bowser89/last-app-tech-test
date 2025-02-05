import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Reservation } from '../entities';
import * as dayjs from 'dayjs';
import { ReservationStatus } from '../constants';

@Injectable()
export class ReservationRepository extends Repository<Reservation> {
  ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

  constructor(private dataSource: DataSource) {
    super(Reservation, dataSource.createEntityManager());
  }

  async findOccupiedTimeSlots(
    date: string,
    partySize: number,
  ): Promise<string[]> {
    const reservations = await this.createQueryBuilder('reservation')
      .innerJoin('reservation.table', 'table')
      .where('table.capacity >= :partySize', { partySize })
      .where('DATE(reservation.reservationTime) = :date', { date })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: [ReservationStatus.CONFIRMED, ReservationStatus.UPDATED],
      })
      .select('reservationTime')
      .getRawMany();

    const e = reservations.flatMap((res: Reservation) => [
      dayjs(res.reservationTime).format('HH:mm'),
      dayjs(res.reservationTime).subtract(15, 'minute').format('HH:mm'),
      dayjs(res.reservationTime).subtract(30, 'minute').format('HH:mm'),
      dayjs(res.reservationTime).add(15, 'minute').format('HH:mm'),
      dayjs(res.reservationTime).add(30, 'minute').format('HH:mm'),
    ]);

    return e;
  }

  async getAllReservations(): Promise<Reservation[]> {
    return this.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.table', 'table') // ✅ Include table data
      .orderBy('reservation.reservationTime', 'ASC')
      .getMany();
  }

  async findWaitlistedReservationsWithTimeFrame(
    dateTime: string,
    partySize: number,
  ): Promise<Reservation[]> {
    const startTime = dayjs(dateTime)
      .subtract(45, 'minute')
      .format(this.ISO_FORMAT);
    const endTime = dayjs(dateTime).add(45, 'minute').format(this.ISO_FORMAT);

    return this.createQueryBuilder('reservation')
      .where('reservation.status = :status', {
        status: ReservationStatus.WAITLISTED,
      })
      .andWhere('reservation.partySize <= :partySize', { partySize })
      .andWhere('reservation.reservationTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      })
      .orderBy('reservation.createdAt', 'ASC')
      .getMany();
  }

  async findReservationsByTime(
    notificationTime: string,
  ): Promise<Reservation[]> {
    return this.createQueryBuilder('reservation')
      .where('reservation.reservationTime = :notificationTime', {
        notificationTime,
      })
      .getMany();
  }
}
