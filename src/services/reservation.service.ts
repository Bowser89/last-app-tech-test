import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationRepository, TableRepository } from '../repository';
import { Reservation } from '../entities';
import { EVENTS, ReservationStatus } from '../constants';
import { CreateReservationInput, UpdateReservationInput } from '../input';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(ReservationRepository)
    private readonly reservationRepository: ReservationRepository,
    @InjectRepository(TableRepository)
    private readonly tableRepository: TableRepository,
    private readonly emitter: EventEmitter2,
  ) {}

  async createReservation(
    createReservationInput: CreateReservationInput,
  ): Promise<any> {
    const reservationTime = createReservationInput.toReservationTime();
    const availableTable = await this.tableRepository.findAvailableTable(
      createReservationInput.partySize,
      reservationTime,
    );

    const reservation = new Reservation();
    reservation.reservationTime = reservationTime;
    reservation.partySize = createReservationInput.partySize;
    reservation.customerName = createReservationInput.customerName;
    reservation.phoneNumber = createReservationInput.phoneNumber;
    reservation.status = !availableTable
      ? ReservationStatus.WAITLISTED
      : ReservationStatus.CONFIRMED;
    reservation.table = availableTable;

    return await this.reservationRepository.save(reservation);
  }

  async updateReservation(
    updateReservationInput: UpdateReservationInput,
    reservationId: number,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException({
        message: `Reservation with id ${reservationId} not found`,
      });
    }

    const reservationTime =
      updateReservationInput.time && updateReservationInput.date
        ? updateReservationInput.toReservationTime()
        : reservation.reservationTime;

    const availableTable = await this.tableRepository.findAvailableTable(
      updateReservationInput.partySize
        ? updateReservationInput.partySize
        : reservation.partySize,
      reservationTime,
    );

    if (!availableTable) {
      throw new NotFoundException({
        message: `Table not available for given date and time`,
        code: 404,
      });
    }

    reservation.reservationTime = reservationTime;
    if (updateReservationInput.partySize)
      reservation.partySize = updateReservationInput.partySize;
    if (updateReservationInput.customerName)
      reservation.customerName = updateReservationInput.customerName;
    if (updateReservationInput.phoneNumber)
      reservation.phoneNumber = updateReservationInput.phoneNumber;
    reservation.status = ReservationStatus.UPDATED;
    reservation.table = availableTable;

    this.emitter.emit(EVENTS.RESERVATION_UPDATED, {
      dateTime:
        updateReservationInput.time && updateReservationInput.date
          ? updateReservationInput.toReservationTime()
          : reservation.reservationTime,
      partySize: updateReservationInput?.partySize
        ? updateReservationInput.partySize
        : reservation.partySize,
    });

    return await this.reservationRepository.save(reservation);
  }

  async deleteReservation(reservationId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException({
        message: `Reservation with id ${reservationId} not found`,
        code: 404,
      });
    }

    reservation.status = ReservationStatus.CANCELLED;

    await this.reservationRepository.save(reservation);

    this.emitter.emit(EVENTS.RESERVATION_CANCELLED, {
      dateTime: reservation.reservationTime,
      partySize: reservation.partySize,
    });

    return reservation;
  }
}
