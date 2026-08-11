# Agri Farm - User Flow Diagrams

This document contains Mermaid flow diagrams for all major user journeys in the Agri Farm application.

---

## 1. Farmer Journey

```mermaid
flowchart TD
    A[Start] --> B{Authenticated?}
    B -->|No| C[Login/Signup]
    C --> D[Farmer Dashboard]
    B -->|Yes| D
    
    D --> E{Action}
    E -->|Add Animal| F[Add Animal Form]
    F --> G[Submit to API]
    G --> H[Receive Unique ID]
    H --> I[Display QR Code]
    I --> J[Download/Print QR]
    J --> D
    
    E -->|View Animals| K[Animals List]
    K --> L{Select Animal}
    L -->|View QR| M[QR Code Modal]
    M --> K
    L -->|Edit| N[Edit Animal Form]
    N --> K
    
    E -->|Book Vet| O[Vet List Page]
    O --> P[Select Vet]
    P --> Q[Select Animal via QR]
    Q --> R[Choose Date/Time]
    R --> S[Add Reason]
    S --> T[Confirm Booking]
    T --> U[Appointment Created]
    U --> D
    
    E -->|My Appointments| V[Appointments List]
    V --> W{Filter}
    W -->|Upcoming| X[Show Upcoming]
    W -->|Past| Y[Show Past]
    X --> Z{Action}
    Y --> Z
    Z -->|Cancel| AA[Cancel Appointment]
    Z -->|View Details| AB[Appointment Details]
    AA --> V
    AB --> V
```

---

## 2. Veterinarian Journey

```mermaid
flowchart TD
    A[Start] --> B{Authenticated?}
    B -->|No| C[Login]
    C --> D[Vet Dashboard]
    B -->|Yes| D
    
    D --> E{Action}
    E -->|View Appointments| F[Appointments List]
    F --> G{Filter}
    G -->|Upcoming| H[Show Upcoming]
    G -->|Past| I[Show Past]
    H --> J{Action}
    I --> J
    J -->|Confirm| K[Confirm Appointment]
    J -->|Complete| L[Mark Complete]
    J -->|View Details| M[Appointment Details]
    K --> F
    L --> F
    M --> F
    
    E -->|Scan Animal QR| N[QR Scanner Page]
    N --> O{Camera/Manual}
    O -->|Camera| P[Scan QR Code]
    O -->|Manual| Q[Enter Animal ID]
    P --> R[Fetch Animal Data]
    Q --> R
    R --> S{Animal Found?}
    S -->|Yes| T[Display Animal Details]
    S -->|No| U[Show Error]
    T --> V{Action}
    V -->|View History| W[Medical History]
    V -->|Regenerate QR| X[QR Regenerate Page]
    U --> N
    
    E -->|Regenerate QR| X[QR Regenerate Page]
    X --> Y[Enter Animal ID]
    Y --> Z[Fetch Current QR]
    Z --> AA[Show Current QR]
    AA --> AB[Click Regenerate]
    AB --> AC[API Call]
    AC --> AD[New QR Generated]
    AD --> AE[Display New QR]
```

---

## 3. Authority Journey

```mermaid
flowchart TD
    A[Start] --> B{Authenticated?}
    B -->|No| C[Login]
    C --> D[Authority Dashboard]
    B -->|Yes| D
    
    D --> E{Action}
    E -->|Create Batch| F[Create Batch Wizard]
    F --> G[Step 1: Select Farm]
    G --> H[Step 2: Select Animals]
    H --> I[Multi-select with QR Scan]
    I --> J[Step 3: Enter Details]
    J --> K[Quantity, Date, Time]
    K --> L[Step 4: Confirm]
    L --> M[Submit to API]
    M --> N[Batch Code Generated]
    N --> O[Display QR + Barcode]
    O --> P[Print Barcode]
    P --> D
    
    E -->|View Batches| Q[Batches List]
    Q --> R{Filter/Search}
    R --> S[Filtered List]
    S --> T{Action}
    T -->|View Details| U[Batch Details]
    T -->|Generate Barcode| V[Generate Barcode]
    T -->|Print| W[Print Barcode]
    U --> Q
    V --> Q
    W --> Q
    
    E -->|Scan QR/Barcode| X[Scanner Page]
    X --> Y{Mode}
    Y -->|Animal QR| Z[Scan Animal QR]
    Y -->|Batch Barcode| AA[Scan Batch Barcode]
    Z --> AB[Fetch Animal + Batches]
    AA --> AC[Fetch Batch Details]
    AB --> AD[Display Results]
    AC --> AD
    
    E -->|Farm & Livestock| AE[Farm Selector]
    AE --> AF[Select Farm]
    AF --> AG[Fetch Livestock]
    AG --> AH[Display Animal Table]
    AH --> AI{Action}
    AI -->|View Animal| AJ[Animal Details]
    AI -->|View Batches| AK[Animal Batches]
```

---

## 4. Consumer Journey

```mermaid
flowchart TD
    A[Start] --> B[Consumer Scan Page]
    B --> C{Input Method}
    C -->|Camera| D[Start Camera]
    C -->|Manual| E[Enter Batch Code]
    D --> F[Scan QR Code]
    F --> G[Parse Batch Code]
    E --> G
    G --> H[API: /consumer/scan]
    H --> I{Quality Check}
    I -->|All Pass| J[Green Alert]
    I -->|Any Fail| K[Red Alert]
    I -->|Error| L[Error Message]
    
    J --> M[Result Page - Green]
    K --> N[Result Page - Red]
    L --> O[Show Error]
    
    M --> P{Batch Info}
    N --> P
    P -->|Available| Q[Show Batch Details]
    P -->|None| R[Basic Result]
    
    Q --> S[Display: Farm, Date, Status]
    R --> S
    
    S --> T{Action}
    T -->|Scan Another| B
    T -->|Done| U[End]
```

---

## 5. Cross-Module Data Flow

```mermaid
flowchart LR
    subgraph Farmer["Farmer Module"]
        F1[Add Animal] --> F2[Generate Unique ID]
        F2 --> F3[Create QR Code]
        F3 --> F4[Book Vet Appointment]
    end
    
    subgraph Vet["Vet Module"]
        V1[Scan Animal QR] --> V2[Fetch Animal Data]
        V2 --> V3[View Farm Details]
        V3 --> V4[Add Medical Notes]
        V4 --> V5[Regenerate QR if needed]
    end
    
    subgraph Authority["Authority Module"]
        A1[Create Batch] --> A2[Select Animals]
        A2 --> A3[Generate Batch Code]
        A3 --> A4[Create Barcode]
        A4 --> A5[Link Animals to Batch]
        A5 --> A6[Quality Checks]
    end
    
    subgraph Consumer["Consumer Module"]
        C1[Scan Batch QR] --> C2[Fetch Batch Data]
        C2 --> C3[Check Quality Status]
        C3 --> C4[Green/Red Alert]
    end
    
    F3 -.->|QR Data| V1
    F4 -.->|Appointment| V2
    V4 -.->|Medical Data| A6
    A5 -.->|Batch Link| C2
    A6 -.->|Quality Result| C3
```

---

## 6. QR/Barcode Data Structures

### Animal QR Code
```json
{
  "type": "animal",
  "uniqueId": "ANM-001",
  "farmId": "FARM-001"
}
```

### Batch Barcode
```json
{
  "type": "batch",
  "batchCode": "BATCH-001"
}
```

### Consumer Scan URL
```
/consumer/scan?batchCode=BATCH-001
```

---

## 7. API Integration Points

| Module | Endpoint | Purpose |
|--------|----------|---------|
| Auth | POST /auth/login | User authentication |
| Auth | POST /auth/signup | User registration |
| Farmer | GET /farmer/animals | List animals |
| Farmer | POST /farmer/animals | Create animal |
| Farmer | GET /farmer/animals/:id/qr | Get animal QR |
| Farmer | GET /vets/nearby | Find nearby vets |
| Farmer | POST /appointments | Book appointment |
| Farmer | GET /farmer/appointments | List appointments |
| Vet | GET /vet/appointments | List vet appointments |
| Vet | PATCH /vet/appointments/:id/confirm | Confirm appointment |
| Vet | GET /animals/:uniqueId | Get animal by QR |
| Vet | POST /animals/:id/regenerate-qr | Regenerate QR |
| Authority | POST /batches | Create batch |
| Authority | GET /batches/:batchCode | Get batch details |
| Authority | POST /batches/:batchCode/barcode | Generate barcode |
| Authority | GET /farms/:id/livestock | Get farm animals |
| Authority | GET /animals/:uniqueId/batches | Get animal batches |
| Consumer | GET /consumer/scan?qrData= | Check batch quality |

---

## 8. State Transitions

### Appointment Status
```
pending → confirmed → completed
    ↓
cancelled
```

### Batch Quality Status
```
pending → pass
    ↓
fail
```

### Animal Health Status
```
Healthy ↔ Check-up Due ↔ Under Treatment ↔ Critical
```

---

*Generated for Agri Farm Frontend v1.0*