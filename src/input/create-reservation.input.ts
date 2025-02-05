import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';
import { IsString, Matches, Max, Min, IsPhoneNumber } from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateReservationInput {
  @IsNotEmpty({ message: 'Date should not be empty' })
  @IsDateString(undefined, {
    message: 'Invalid date format, should be YYYY-MM-DD',
  })
  date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format (24-hour format).',
  })
  time: string;

  @IsNotEmpty({ message: 'Phone number should not be empty' })
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Customer name should not be empty' })
  @IsString()
  customerName: string;

  @IsNotEmpty({ message: 'Party size should not be empty' })
  @IsInt({ message: 'Party size should be an integer number' })
  @Min(1, { message: 'Party size should be at least 1' })
  @Max(8, { message: 'Party size should be maximum 8' })
  partySize: number;

  toReservationTime(): string {
    return dayjs(`${this.date}T${this.time}`).toISOString();
  }
}
