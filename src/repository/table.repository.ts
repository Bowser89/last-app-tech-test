import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TableEntity } from '../entities';
import * as dayjs from 'dayjs';
import { ReservationStatus } from '../constants';

@Injectable()
export class TableRepository extends Repository<TableEntity> {
  ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

  constructor(private dataSource: DataSource) {
    super(TableEntity, dataSource.createEntityManager());
  }

  async findAvailableTable(
    partySize: number,
    reservationTime: string,
  ): Promise<TableEntity | null> {
    const blockedStartTime = dayjs(reservationTime)
      .subtract(44, 'minute')
      .format(this.ISO_FORMAT);
    const blockedEndTime = dayjs(reservationTime)
      .add(44, 'minute')
      .format(this.ISO_FORMAT);

    return await this.createQueryBuilder('table')
      .leftJoin(
        'reservation',
        'r',
        `
    r.tableId = table.id 
    AND r.status IN (:...statuses)
    AND r.reservationTime BETWEEN :blockedStartTime AND :blockedEndTime
  `,
      )
      .where('table.capacity >= :partySize', { partySize })
      .groupBy('table.id')
      .having('COUNT(r.id) = 0')
      .orderBy('table.capacity', 'ASC')
      .setParameters({
        blockedStartTime,
        blockedEndTime,
        statuses: [ReservationStatus.CONFIRMED, ReservationStatus.UPDATED],
      })
      .getOne();
  }
}
