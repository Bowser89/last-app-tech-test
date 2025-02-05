import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Reservation, TableEntity } from './entities';
import { ReservationService, TableService } from './services';
import { ReservationListener } from './listeners';
import { ReservationController, TableController } from './controller';
import { ReservationRepository, TableRepository } from './repository';
import { WaitlistService } from './services/waitlist.service';
import { SeederService } from './seeds/seeder.service';
import { NotificationService } from './cronjobs';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database:
          process.env.NODE_ENV === 'test'
            ? ':memory:'
            : configService.get<string>('DB_SQLITE_PATH') || 'database.sqlite',
        entities: [Reservation, TableEntity],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Reservation, TableEntity]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ReservationController, TableController],
  providers: [
    SeederService,
    ReservationService,
    ReservationController,
    TableService,
    ReservationListener,
    ReservationRepository,
    TableRepository,
    WaitlistService,
    NotificationService,
  ],
})
export class AppModule {}
