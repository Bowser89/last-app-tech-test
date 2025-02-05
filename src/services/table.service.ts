import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationRepository } from '../repository';
import { ALL_TIME_SLOTS } from '../constants';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(ReservationRepository)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async getAvailableTimeSlots(
    date: string,
    partySize: number,
  ): Promise<string[]> {
    const occupiedSlots =
      await this.reservationRepository.findOccupiedTimeSlots(date, partySize);

    return ALL_TIME_SLOTS.filter((slot) => !occupiedSlots.includes(slot));
  }
}
