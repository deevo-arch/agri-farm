# Agri Farm - Backend Integration Guide

This document helps backend developers integrate with the Agri Farm frontend.

---

## 1. Base Configuration

### Environment Variables (Frontend)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
```

### CORS Configuration
```javascript
// Allow frontend origin
origin: ['http://localhost:3000', 'https://yourdomain.com']
credentials: true
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
allowedHeaders: ['Content-Type', 'Authorization']
```

---

## 2. Authentication

### JWT Token Format
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "userId": "uuid",
    "role": "farmer|vet|authority",
    "mobile": "9876543210",
    "exp": 1735689600,
    "iat": 1735603200
  }
}
```

### Token Storage
- Frontend stores in `localStorage`:
  - `token`: JWT string
  - `user`: User object JSON

### Auth Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 3. API Endpoints

### 3.1 Authentication

#### POST `/auth/signup`
**Request:**
```json
{
  "full_name": "John Farmer",
  "mobile": "9876543210",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "farmer",
  "farm_name": "Green Valley Farm",
  "address": "123 Farm Road, Village",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "total_animals": 0
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "full_name": "John Farmer",
    "mobile": "9876543210",
    "role": "farmer",
    "farm_name": "Green Valley Farm",
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

#### POST `/auth/login`
**Request:**
```json
{
  "mobile": "9876543210",
  "password": "securepass123",
  "role": "farmer"
}
```

**Response (200):** Same as signup

---

### 3.2 Farmer Endpoints

#### GET `/farmer/profile`
**Response (200):**
```json
{
  "id": "uuid",
  "full_name": "John Farmer",
  "mobile": "9876543210",
  "farm_name": "Green Valley Farm",
  "address": "123 Farm Road",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "total_animals": 25
}
```

#### PUT `/farmer/profile`
**Request:** Same fields as profile response (partial update allowed)

#### POST `/farmer/animals`
**Request:**
```json
{
  "breed": "Holstein",
  "dob": "2022-01-15",
  "health_status": "Healthy"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "unique_animal_id": "ANM-A1B2C3",
  "farmer_id": "uuid",
  "breed": "Holstein",
  "dob": "2022-01-15",
  "health_status": "Healthy",
  "qr_code_data": "{\"type\":\"animal\",\"uniqueId\":\"ANM-A1B2C3\",\"farmId\":\"FARM-XYZ\"}",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### GET `/farmer/animals`
**Response (200):**
```json
[
  {
    "id": "uuid",
    "unique_animal_id": "ANM-A1B2C3",
    "breed": "Holstein",
    "dob": "2022-01-15",
    "health_status": "Healthy",
    "qr_code_data": "..."
  }
]
```

#### GET `/farmer/animals/:id/qr`
**Response (200):**
```json
{
  "qr_code_data": "{\"type\":\"animal\",\"uniqueId\":\"ANM-A1B2C3\",\"farmId\":\"FARM-XYZ\"}"
}
```

#### GET `/vets/nearby?lat=28.6139&lng=77.2090&radius=10`
**Response (200):**
```json
[
  {
    "id": "uuid",
    "full_name": "Dr. Smith",
    "clinic_name": "City Vet Clinic",
    "address": "456 Main St",
    "latitude": 28.6200,
    "longitude": 77.2100,
    "specialization": "Large Animals",
    "license_number": "VET-12345",
    "distance": 2.5,
    "rating": 4.8
  }
]
```

#### POST `/appointments`
**Request:**
```json
{
  "farmer_id": "uuid",
  "vet_id": "uuid",
  "animal_id": "uuid",
  "date_time": "2024-01-20T10:00:00Z",
  "reason": "Regular checkup",
  "status": "pending"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "farmer_id": "uuid",
  "vet_id": "uuid",
  "animal_id": "uuid",
  "date_time": "2024-01-20T10:00:00Z",
  "reason": "Regular checkup",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### GET `/farmer/appointments`
**Response (200):**
```json
[
  {
    "id": "uuid",
    "vet_id": "uuid",
    "vet_name": "Dr. Smith",
    "vet_clinic": "City Vet Clinic",
    "animal_id": "uuid",
    "animal_breed": "Holstein",
    "animal_unique_id": "ANM-A1B2C3",
    "date_time": "2024-01-20T10:00:00Z",
    "reason": "Regular checkup",
    "status": "confirmed"
  }
]
```

---

### 3.3 Vet Endpoints

#### GET `/vet/appointments`
**Response (200):**
```json
[
  {
    "id": "uuid",
    "farmer_id": "uuid",
    "farmer_name": "John Farmer",
    "farm_name": "Green Valley Farm",
    "animal_id": "uuid",
    "animal_breed": "Holstein",
    "animal_unique_id": "ANM-A1B2C3",
    "date_time": "2024-01-20T10:00:00Z",
    "reason": "Regular checkup",
    "status": "pending"
  }
]
```

#### PATCH `/vet/appointments/:id/confirm`
**Response (200):**
```json
{
  "id": "uuid",
  "status": "confirmed"
}
```

#### GET `/animals/:uniqueId`
**Response (200):**
```json
{
  "id": "uuid",
  "unique_animal_id": "ANM-A1B2C3",
  "breed": "Holstein",
  "dob": "2022-01-15",
  "health_status": "Healthy",
  "farm_id": "uuid",
  "farm_name": "Green Valley Farm",
  "farm_address": "123 Farm Road",
  "farmer_id": "uuid",
  "farmer_name": "John Farmer",
  "farmer_mobile": "9876543210",
  "qr_code_data": "{\"type\":\"animal\",\"uniqueId\":\"ANM-A1B2C3\",\"farmId\":\"FARM-XYZ\"}",
  "medical_history": [
    {
      "date": "2023-06-15",
      "vet_name": "Dr. Smith",
      "treatment": "Vaccination",
      "notes": "FMD vaccine administered"
    }
  ]
}
```

#### POST `/animals/:id/regenerate-qr`
**Response (200):**
```json
{
  "qr_code_data": "{\"type\":\"animal\",\"uniqueId\":\"ANM-A1B2C3\",\"farmId\":\"FARM-XYZ\"}"
}
```

---

### 3.4 Authority Endpoints

#### GET `/authority/profile`
**Response (200):**
```json
{
  "id": "uuid",
  "full_name": "Officer Patel",
  "mobile": "9876543210",
  "department": "milk_collection",
  "organization_name": "State Dairy Board",
  "employee_id": "EMP-12345"
}
```

#### POST `/batches`
**Request:**
```json
{
  "farm_id": "uuid",
  "animal_ids": ["uuid1", "uuid2", "uuid3"],
  "quantity": 500,
  "collection_date": "2024-01-15T08:00:00Z",
  "collected_by": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "batch_code": "BATCH-XYZ789",
  "farm_id": "uuid",
  "farm_name": "Green Valley Farm",
  "collection_date": "2024-01-15T08:00:00Z",
  "collected_by": "uuid",
  "quantity": 500,
  "animals_count": 3,
  "quality_status": "pending",
  "barcode_data": "{\"type\":\"batch\",\"batchCode\":\"BATCH-XYZ789\"}",
  "created_at": "2024-01-15T08:30:00Z"
}
```

#### GET `/batches/:batchCode`
**Response (200):**
```json
{
  "id": "uuid",
  "batch_code": "BATCH-XYZ789",
  "farm_id": "uuid",
  "farm_name": "Green Valley Farm",
  "collection_date": "2024-01-15T08:00:00Z",
  "collected_by": "uuid",
  "collected_by_name": "Officer Patel",
  "quantity": 500,
  "animals_count": 3,
  "quality_status": "pass",
  "barcode_data": "{\"type\":\"batch\",\"batchCode\":\"BATCH-XYZ789\"}",
  "animals": [
    {
      "id": "uuid",
      "unique_animal_id": "ANM-A1B2C3",
      "breed": "Holstein"
    }
  ],
  "quality_checks": [
    {
      "check_date": "2024-01-15T10:00:00Z",
      "parameters": { "fat": 4.2, "snf": 8.5, "contamination": 0 },
      "result": "pass",
      "remarks": "All parameters within limits"
    }
  ]
}
```

#### POST `/batches/:batchCode/barcode`
**Response (200):**
```json
{
  "barcode_data": "{\"type\":\"batch\",\"batchCode\":\"BATCH-XYZ789\"}"
}
```

#### GET `/farms/:id/livestock`
**Response (200):**
```json
[
  {
    "id": "uuid",
    "unique_animal_id": "ANM-A1B2C3",
    "breed": "Holstein",
    "dob": "2022-01-15",
    "health_status": "Healthy",
    "milk_yield": 25,
    "batches_count": 12
  }
]
```

#### GET `/animals/:uniqueId/batches`
**Response (200):**
```json
[
  {
    "id": "uuid",
    "batch_code": "BATCH-XYZ789",
    "collection_date": "2024-01-15T08:00:00Z",
    "quantity": 500,
    "quality_status": "pass"
  }
]
```

---

### 3.5 Consumer Endpoint

#### GET `/consumer/scan?qrData={"type":"batch","batchCode":"BATCH-XYZ789"}`
**Alternative:** `GET /consumer/scan?batchCode=BATCH-XYZ789`

**Response (200) - Safe:**
```json
{
  "alert": "green",
  "message": "This milk batch has passed all quality checks and is safe for consumption.",
  "batchInfo": {
    "batch_code": "BATCH-XYZ789",
    "farm_name": "Green Valley Farm",
    "collection_date": "2024-01-15T08:00:00Z",
    "quality_status": "pass",
    "expiry_date": "2024-01-18",
    "test_results": {
      "fat": 4.2,
      "snf": 8.5,
      "contamination": 0
    }
  }
}
```

**Response (200) - Unsafe:**
```json
{
  "alert": "red",
  "message": "This milk batch has quality issues. Do not consume. Report to authority.",
  "batchInfo": {
    "batch_code": "BATCH-XYZ789",
    "farm_name": "Green Valley Farm",
    "collection_date": "2024-01-15T08:00:00Z",
    "quality_status": "fail",
    "test_results": {
      "fat": 3.1,
      "snf": 7.2,
      "contamination": 1
    },
    "failure_reason": "Fat content below minimum, contamination detected"
  }
}
```

---

## 4. QR/Barcode Data Structures

### Animal QR (Generated by Farmer)
```json
{
  "type": "animal",
  "uniqueId": "ANM-A1B2C3",
  "farmId": "FARM-XYZ"
}
```

### Batch Barcode (Generated by Authority)
```json
{
  "type": "batch",
  "batchCode": "BATCH-XYZ789"
}
```

### Consumer Scan URL
```
https://yourdomain.com/consumer/scan?batchCode=BATCH-XYZ789
```

---

## 5. Error Response Format

```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": [
    { "field": "mobile", "message": "Mobile number is required" }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (role mismatch)
- `404` - Not Found
- `500` - Server Error

---

## 6. Role-Based Access Control

| Endpoint | Farmer | Vet | Authority | Consumer |
|----------|--------|-----|-----------|----------|
| `/farmer/*` | ✓ | ✗ | ✗ | ✗ |
| `/vet/*` | ✗ | ✓ | ✗ | ✗ |
| `/authority/*` | ✗ | ✗ | ✓ | ✗ |
| `/consumer/*` | ✗ | ✗ | ✗ | ✓ (no auth) |
| `/auth/*` | ✓ | ✓ | ✓ | ✓ |

---

## 7. Suggested Webhooks/Events

For real-time updates, consider implementing:

```javascript
// Event types
'appointment.created'
'appointment.confirmed'
'appointment.completed'
'batch.created'
'batch.quality_updated'
'animal.qr_regenerated'
```

### Webhook Payload Example
```json
{
  "event": "batch.quality_updated",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "batch_id": "uuid",
    "batch_code": "BATCH-XYZ789",
    "quality_status": "pass",
    "farm_id": "uuid"
  }
}
```

---

## 8. Database Schema Reference

### Users
```sql
users: id, role, full_name, mobile, email, password_hash, created_at
farmers: user_id, farm_name, address, latitude, longitude, total_animals
vets: user_id, clinic_name, address, latitude, longitude, license_number, specialization
authority: user_id, department, organization_name, employee_id
```

### Animals
```sql
animals: id, unique_animal_id, farmer_id, breed, dob, health_status, qr_code_data, created_at
```

### Appointments
```sql
appointments: id, farmer_id, vet_id, animal_id, date_time, status, reason, created_at
```

### Batches
```sql
milk_batches: id, batch_code, farm_id, collection_date, collected_by, quantity, quality_status, barcode_data
batch_animals: batch_id, animal_id
quality_checks: id, batch_id, check_date, parameters, result, remarks
```

---

## 9. Testing Checklist

- [ ] Auth: Signup/Login for all 3 roles
- [ ] Farmer: CRUD animals, QR generation
- [ ] Farmer: Vet search by location
- [ ] Farmer: Appointment booking flow
- [ ] Vet: Appointment list with filters
- [ ] Vet: QR scan returns animal + farm
- [ ] Vet: QR regeneration
- [ ] Authority: Batch creation wizard
- [ ] Authority: Barcode generation
- [ ] Authority: QR/Barcode scanning
- [ ] Consumer: Green/Red alert logic
- [ ] Role-based route protection
- [ ] JWT token refresh/expiry handling
- [ ] CORS and error handling

---

## 10. Contact

For integration questions, contact the frontend team or refer to the [Flow.md](./Flow.md) for user journey diagrams.

---

*Generated for Agri Farm Frontend v1.0*