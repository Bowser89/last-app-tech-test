import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { TableEntity } from './table.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  reservationTime: string;

  @Column()
  phoneNumber: string;

  @Column()
  customerName: string;

  @Column()
  partySize: number;

  @Column()
  status: string;

  @ManyToOne(() => TableEntity, (table) => table.reservations, {
    nullable: true,
    eager: true,
  })
  table: TableEntity | null;

  @CreateDateColumn({ type: 'text', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;
}
