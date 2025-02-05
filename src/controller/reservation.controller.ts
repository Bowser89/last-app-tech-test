import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ReservationService } from '../services';
import { CreateReservationInput, UpdateReservationInput } from '../input';
import { ErrorResponseInterface } from '../interfaces/error.response.interface';
import { ReservationRepository } from '../repository';
import {
  GetReservationResponseInterface,
  ReservationResponseInterface,
} from '../interfaces';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  @Post()
  async createReservation(
    @Body() createReservationInput: CreateReservationInput,
  ): Promise<ReservationResponseInterface> {
    const result = await this.reservationService.createReservation(
      createReservationInput,
    );

    return { id: result.id, status: result.status };
  }

  @Get()
  async getReservations(): Promise<GetReservationResponseInterface[]> {
    return await this.reservationRepository.getAllReservations();
  }

  @Get(':reservationId')
  async getReservationById(
    @Param('reservationId') reservationId: number,
  ): Promise<any> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['table'],
    });

    if (!reservation) {
      return {
        message: `Reservation with id ${reservationId} not found`,
        code: 404,
      };
    }

    return reservation;
  }

  @Put(':reservationId')
  async updateReservation(
    @Param('reservationId') reservationId: number,
    @Body() updateReservationInput: UpdateReservationInput,
  ): Promise<ReservationResponseInterface | ErrorResponseInterface> {
    try {
      const result = await this.reservationService.updateReservation(
        updateReservationInput,
        reservationId,
      );

      return { id: result.id, status: result.status };
    } catch (e) {
      return { message: e.message, code: e.code };
    }
  }

  @Delete(':reservationId')
  async deleteReservation(
    @Param('reservationId') reservationId: number,
  ): Promise<ReservationResponseInterface | ErrorResponseInterface> {
    try {
      const reservation =
        await this.reservationService.deleteReservation(reservationId);

      return { id: reservation.id, status: reservation.status };
    } catch (e) {
      return { message: e.message, code: e.code };
    }
  }
}
