import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationRepository, TableRepository } from '../repository';
import { ReservationStatus } from '../constants';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    @InjectRepository(ReservationRepository)
    private readonly reservationRepository: ReservationRepository,
    @InjectRepository(TableRepository)
    private readonly tableRepository: TableRepository,
  ) {}

  async promoteFromWaitlist(
    dateTime: string,
    partySize: number,
  ): Promise<void> {
    this.logger.log(`Checking waitlist...`);

    const waitlistedReservations =
      await this.reservationRepository.findWaitlistedReservationsWithTimeFrame(
        dateTime,
        partySize,
      );

    if (!waitlistedReservations.length) {
      this.logger.log(`No reservation waitlisted for this date and party size`);
      return;
    }

    for (const waitlistedReservation of waitlistedReservations) {
      const availableTable = await this.tableRepository.findAvailableTable(
        waitlistedReservation.partySize,
        dateTime,
      );

      if (!availableTable) {
        continue;
      }

      waitlistedReservation.status = ReservationStatus.CONFIRMED;
      waitlistedReservation.table = availableTable;

      await this.reservationRepository.save(waitlistedReservation);

      this.logger.log(
        `Promoted waitlisted reservation ${waitlistedReservation.id} to confirmed.`,
      );

      return;
    }
  }
}
