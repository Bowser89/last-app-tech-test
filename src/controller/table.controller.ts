import { Controller, Get, Query } from '@nestjs/common';
import { TableService } from '../services';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get('availability')
  async getAvailableTimeSlots(
    @Query('date') dateTime: string,
    @Query('partySize') partySize: number,
  ): Promise<{ availableSlots: string[] }> {
    const slots = await this.tableService.getAvailableTimeSlots(
      dateTime,
      partySize,
    );
    return { availableSlots: slots };
  }
}
