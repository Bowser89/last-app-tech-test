import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants';
import { WaitlistService } from '../services/waitlist.service';
import { WaitlistEventInterface } from '../interfaces/events/waitlist.event.interface';
import * as dayjs from 'dayjs';

@Injectable()
export class ReservationListener {
  private readonly logger = new Logger(ReservationListener.name);

  constructor(private readonly waitlistService: WaitlistService) {}

  @OnEvent(EVENTS.RESERVATION_UPDATED)
  @OnEvent(EVENTS.RESERVATION_CANCELLED)
  async handleReservationUpdated(payload: WaitlistEventInterface) {
    const dateTime = dayjs(payload.dateTime).format(
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    );
    this.logger.log(
      `Reservation updated: Checking waitlisted reservations for ${payload.partySize} person(s) at ${dayjs(dateTime).format('YYYY-MM-DD HH:mm')}  ...`,
    );
    await this.waitlistService.promoteFromWaitlist(
      payload.dateTime,
      payload.partySize,
    );
  }
}
