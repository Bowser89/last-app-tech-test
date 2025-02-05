import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { ReservationRepository } from '../repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly reservationRepository: ReservationRepository) {}

  @Cron('*/15 * * * *')
  async sendReservationNotifications(): Promise<void> {
    const notificationTime = dayjs()
      .add(1, 'hour')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    const upcomingReservations =
      await this.reservationRepository.findReservationsByTime(notificationTime);

    if (!upcomingReservations.length) {
      return;
    }

    for (const reservation of upcomingReservations) {
      this.logger.log(
        `Reminder: Reservation for ${reservation.customerName} at ${reservation.reservationTime}. Contact: ${reservation.phoneNumber}`,
      );
    }
  }
}
