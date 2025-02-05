import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { ReservationRepository, TableRepository } from '../src/repository';
import { Reservation } from '../src/entities';
import { ALL_TIME_SLOTS, ReservationStatus } from '../src/constants';

describe('ReservationController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let reservationRepository: ReservationRepository;
  let tableRepository: TableRepository;

  const createAndSaveReservation = async (): Promise<Reservation> => {
    const fixture = new Reservation();
    const table = await tableRepository.findOne({ where: { capacity: 8 } });
    fixture.reservationTime = '2025-05-10T17:30:00.000Z';
    fixture.partySize = 8;
    fixture.customerName = 'John Doe';
    fixture.phoneNumber = '+34651448023';
    fixture.status = ReservationStatus.CONFIRMED;
    fixture.table = table;

    return await reservationRepository.save(fixture);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    dataSource = moduleFixture.get<DataSource>(DataSource);
    reservationRepository = new ReservationRepository(dataSource);
    tableRepository = new TableRepository(dataSource);
  });

  afterEach(async () => {
    await dataSource.query(`DELETE FROM reservation;`);
  });

  describe('AvailabilityController', () => {
    it('should get only some slots', async () => {
      await createAndSaveReservation();
      const response = await request(app.getHttpServer())
        .get(`/tables/availability?partySize=8&date=2025-05-10`)
        .expect(200);
      const occupiedSlots = ['19:00', '19:15', '19:30', '19:45', '20:00'];
      const expectedResponse = {
        availableSlots: ALL_TIME_SLOTS.filter(
          (slot) => !occupiedSlots.includes(slot),
        ),
      };

      expect(response.body).toEqual(expectedResponse);
    });
  });
});
