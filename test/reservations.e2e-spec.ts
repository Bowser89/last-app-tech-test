import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { ReservationRepository, TableRepository } from '../src/repository';
import { Reservation } from '../src/entities';
import { ReservationStatus } from '../src/constants';

describe('ReservationController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let reservationRepository: ReservationRepository;
  let tableRepository: TableRepository;

  const createAndSaveReservation = async (
    status?: string,
  ): Promise<Reservation> => {
    const fixture = new Reservation();
    const table = await tableRepository.findOne({ where: { capacity: 8 } });
    fixture.reservationTime = '2025-05-10T17:30:00.000Z';
    fixture.partySize = 8;
    fixture.customerName = 'John Doe';
    fixture.phoneNumber = '+34651448023';
    fixture.status = status ? status : ReservationStatus.CONFIRMED;
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

  describe('Reservation Creation', () => {
    it('should create a reservation', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .send({
          date: '2025-05-10',
          time: '15:00',
          phoneNumber: '+14155552671',
          customerName: 'John Doe',
          partySize: 2,
        })
        .expect(201);

      const reservations = await reservationRepository.find();

      expect(reservations.length).toBe(1);
    });
    it('should create a reservation with WAITLIST status because of time overlapping', async () => {
      await createAndSaveReservation();
      const result = await request(app.getHttpServer())
        .post('/reservations')
        .send({
          date: '2025-05-10',
          time: '17:30',
          phoneNumber: '+14155552671',
          customerName: 'John Doe',
          partySize: 8,
        })
        .expect(201);

      const reservation = await reservationRepository.findOne({
        where: { id: result.body.id },
      });

      expect(reservation?.status).toBe(ReservationStatus.WAITLISTED);
    });
  });

  describe('Reservation Update', () => {
    it('should update a reservation', async () => {
      const fixture = await createAndSaveReservation();
      await request(app.getHttpServer())
        .put(`/reservations/${fixture.id}`)
        .send({
          date: '2025-05-10',
          time: '18:00',
          phoneNumber: '+14155552671',
          partySize: 2,
        })
        .expect(200);

      const reservation = await reservationRepository.findOne({
        where: { id: fixture.id },
      });

      expect(reservation?.status).toStrictEqual(ReservationStatus.UPDATED);
    });
    it('should create a reservation with WAITLIST status because of time overlapping', async () => {
      await createAndSaveReservation();
      const result = await request(app.getHttpServer())
        .post('/reservations')
        .send({
          date: '2025-05-10',
          time: '17:30',
          phoneNumber: '+14155552671',
          customerName: 'John Doe',
          partySize: 8,
        })
        .expect(201);

      const reservation = await reservationRepository.findOne({
        where: { id: result.body.id },
      });

      expect(reservation?.status).toBe(ReservationStatus.WAITLISTED);
    });
  });

  describe('Reservation Delete', () => {
    it('should delete a reservation', async () => {
      const fixture: Reservation = await createAndSaveReservation();
      await request(app.getHttpServer())
        .delete(`/reservations/${fixture.id}`)
        .expect(200);

      const reservation = await reservationRepository.findOne({
        where: { id: fixture.id },
      });
      expect(reservation?.status).toStrictEqual(ReservationStatus.CANCELLED);
    });
    it('should promote a waitlisted entry to confirmed after deletion', async () => {
      const fixture1 = await createAndSaveReservation(
        ReservationStatus.WAITLISTED,
      );
      const fixture2 = await createAndSaveReservation();

      await request(app.getHttpServer())
        .delete(`/reservations/${fixture1.id}`)
        .expect(200);

      const updatedFixture2 = await reservationRepository.findOne({
        where: { id: fixture2.id },
      });

      expect(updatedFixture2?.status).toStrictEqual(
        ReservationStatus.CONFIRMED,
      );
    });
    it('should return a not found message', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/reservations/456`)
        .expect(200);
      expect(response.body.message).toStrictEqual(
        'Reservation with id 456 not found',
      );
    });
  });

  describe('Get Reservations', () => {
    it('should get reservations list', async () => {
      await createAndSaveReservation();
      const response = await request(app.getHttpServer())
        .get('/reservations')
        .expect(200);

      const reservations = await reservationRepository.find();
      expect(response.body.length).toBe(reservations.length);
    });
  });

  describe('Get Reservation by id', () => {
    it('should get a reservation by id', async () => {
      const fixture = await createAndSaveReservation();
      const response = await request(app.getHttpServer())
        .get(`/reservations/${fixture.id}`)
        .expect(200);

      expect(response.body.id).toBe(fixture.id);
      expect(response.body.customerName).toBe('John Doe');
    });

    it('should return a not found message', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reservations/456`)
        .expect(200);
      expect(response.body.message).toBe('Reservation with id 456 not found');
      expect(response.body.code).toBe(404);
    });
  });
});
