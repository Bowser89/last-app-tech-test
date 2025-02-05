import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class TableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  capacity: number;

  @OneToMany(() => Reservation, (reservation) => reservation.table)
  reservations: Reservation[];
}
