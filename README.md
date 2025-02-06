# Project Setup & API Documentation

### Written and directed by Augusto Lamona X Last.app

## Environment Setup

### Prerequisites
- **Docker** (for containerized environment)
- **Node.js** (for local development)
- **NestJS** (as the backend framework)

### Running the Project

#### With Docker
```sh
make setup
```

#### Without Docker (Local Development)
```sh
npm install
npm run start:dev
```

### Environment Variables
- Copy `development.env` to `.env` and update necessary values.

---

## API Endpoints

### **Reservations (`/reservations` Controller)**

#### **1. Create Reservation**
- **`POST /reservations`**
- **Body Parameters:**
  - `dateTime` (string) – Reservation date and time.
  - `partySize` (number) – Number of guests.
  - `customerName` (string) – Customer name.
  - `customerPhone` (string) – Contact phone number.

#### **2. Get Reservation by ID**
- **`GET /reservations/:id`**
- **Path Parameter:**
  - `id` (string) – Reservation ID.

#### **3. Update Reservation**
- **`PUT /reservations/:id`**
- **Path Parameter:**
  - `id` (string) – Reservation ID.
- **Body Parameters:** *(same as creation)*

#### **4. Delete Reservation**
- **`DELETE /reservations/:id`**
- **Path Parameter:**
  - `id` (string) – Reservation ID.

---

### **Table Availability (`/tables` Controller)**

#### **1. Get Available Time Slots**
- **`GET /tables/availability`**
- **Query Parameters:**
  - `date` (string) – The date to check.
  - `partySize` (number) – Number of guests.

---

## Business Logic Overview

### **Reservation Flow**
1. Users create a reservation.
2. The system checks table availability.
3. If available, the reservation is confirmed.
4. If unavailable, the reservation is placed on a waitlist.
5. Cancellations or changes in availability automatically assign tables from the waitlist.

### **Table Availability Check**
- The system checks database records for open slots.
- Only free time slots are returned.

### **Waitlist System**
- If no tables are available, the reservation goes to a waitlist.
- The system continuously checks for openings.
- Notifications are sent when a slot becomes available.

### **Database Seeding**
- On module initialization, a seeder populates the database with dummy tables.
- If no tables exist, the seeder creates predefined table entries.

---

## Testing Strategy
- **E2E (End-to-End) tests** have been implemented.
- **Future improvements:**
  - Add **unit tests** for service logic.
  - Add **integration tests** for repository interactions.

