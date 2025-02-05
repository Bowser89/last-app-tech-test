import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { IsString, Matches, Max, Min, IsPhoneNumber } from 'class-validator';
import * as dayjs from 'dayjs';

export class UpdateReservationInput {
  @IsOptional()
  @IsDateString(undefined, { message: 'Invalid date format' })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format (24-hour format).',
  })
  time?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsInt({ message: 'Party size should be an integer number' })
  @Min(1, { message: 'Party size should be at least 1' })
  @Max(8, { message: 'Party size should be maximum 8' })
  partySize?: number;

  toReservationTime(): string {
    return dayjs(`${this.date}T${this.time}`).toISOString(); // ✅ Always sets a valid value
  }
}
