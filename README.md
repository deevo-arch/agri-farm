# 🌾 AgriTrust — DairyTech & Livestock Traceability Platform

AgriTrust is an end-to-end **DairyTech & Food Safety Traceability Platform**. It powers farm-to-consumer milk transparency by tracking animal health, veterinary care, milk batch collection, laboratory quality & safety testing (fat %, SNF %, Somatic Cell Count, antibiotic residual checks), and consumer verification via QR code scanning.

---

## 🚀 Key Features

* **🔐 Multi-Role Access Control (RBAC):** Dedicated workflows for `FARMER`, `VET` (Veterinarian), `LAB_ANALYST` (Quality Tester), and `ADMIN`.
* **🏡 Farm & Livestock Management:** Track cattle (Cows, Buffaloes, Goats) with unique Tag Numbers, Breed, Health Status, and Farm association.
* **🩺 Veterinary Care & Medical Records:** Farmers request vet visits; certified Vets manage schedules, diagnosis notes, vaccinations, and medication logs.
* **⏳ Automatic Withdrawal Period Enforcement:** Ensures milk collection is paused until medical withdrawal periods clear to guarantee antibiotic-free milk.
* **🧪 Milk Quality & Safety Testing:** Lab analysis recording Fat %, SNF %, Somatic Cell Count, pH, Temperature, Antibiotic Residual checks, and Quality Grading.
* **📱 Public Traceability & QR Scanner:** Consumers scan QR codes to inspect the full transparent provenance chain (Farm -> Animal Health & Vaccinations -> Lab Quality Grade) with no login required.
* **📊 Analytics Dashboard:** Production charts, milk quality trends, and vet response metrics.

---

## 🛠️ Tech Stack

### 💻 Web Application (`/frontend`)
* **Framework:** React 19 (`react`, `react-dom`)
* **Build Tool:** Vite 8
* **Routing:** React Router v7
* **API Client:** Axios
* **Styling:** Custom Vanilla CSS (Design system with variables, glassmorphism, responsive layout)
* **QR Scanner:** `html5-qrcode`

### 📱 Mobile Application (`/mobile`)
* **Framework:** Flutter (iOS & Android)
* **Language:** Dart (SDK 3.13+)
* **UI Design:** Material Design 3 + Cupertino Icons
* **Networking:** Dart `http` package

### ⚙️ Backend Application (`/backend`)
* **Framework:** Java 17 / 21, Spring Boot 3.x
* **Security:** Spring Security + JWT Tokens
* **Database:** Spring Data MongoDB (Cloud MongoDB Atlas or Local MongoDB)

---

## 📁 Project Structure

```text
AGRI-TRUST/
├── backend/                  # Java Spring Boot 3 REST API Server
│   ├── src/main/java/com/livestock/trace/
│   │   ├── auth/             # Login, Register, JWT Tokens
│   │   ├── farm/             # Farm Management
│   │   ├── livestock/        # Animal Health & Tagging
│   │   ├── milk/             # Batch Quality & Lab Testing
│   │   ├── vet/              # Vet Visits & Diagnostics
│   │   ├── treatment/        # Vaccinations & Medications
│   │   ├── qr/               # QR Code Generation
│   │   └── publicapi/        # Public Traceability Portal API
│   └── src/main/resources/application.yml
├── frontend/                 # React 19 + Vite Web Application
│   ├── src/
│   │   ├── api/              # Axios instance & interceptors
│   │   ├── components/       # Layouts, Badges, Modals, Camera QR Scanner
│   │   ├── pages/            # Admin, Farmer, Vet, Quality, Traceability Pages
│   │   └── styles/           # Design Tokens, Layout, Auth, & Traceability CSS
│   └── package.json
├── mobile/                   # Flutter Mobile App for iOS & Android
│   ├── lib/                  # Dart UI screens, models, & API services
│   └── pubspec.yaml
├── .env.example              # Central Environment Variables Template
└── README.md
```

---

## ⚙️ Prerequisites

Before running the application, ensure you have installed:

1. **Java Development Kit (JDK 17 or 21)**
2. **Maven 3.8+**
3. **Node.js (v18+ LTS)** and **npm**
4. **MongoDB** (Local instance running on `localhost:27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI)
5. *(Optional for Mobile App)* **Flutter SDK**

---

## 📦 Installation & Setup

### 1. Clone Repository & Setup Environment
```bash
git clone <repository-url>
cd AGRI-TRUST

# Copy Environment Configuration
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### 2. Configure Database & Environment Variables
Open `.env` (or configure system environment variables):
```env
MONGODB_URI=mongodb://localhost:27017/agritrust
JWT_SECRET=your-super-secret-jwt-key-min-32-bytes-long
PUBLIC_TRACE_BASE_URL=http://localhost:5173/trace
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🚀 Running the Application

### Step 1: Start the Backend Server
```bash
cd backend
mvn spring-boot:run
```
*The Spring Boot server will initialize and start listening on **`http://localhost:8080`**.*
*On first launch, an Admin account is bootstrapped automatically (`admin@agritrust.com` / `password`).*

### Step 2: Start the Web Frontend
In a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will open on **`http://localhost:5173`**.*

### Step 3: (Optional) Run the Flutter Mobile App
In a third terminal tab:
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🔑 Default Credentials & Role Flow

* **Default Admin Account:**
  * **Email:** `admin@agritrust.com`
  * **Password:** `password`
* **Farmer Account:** Farmers can self-register directly via the public `/register` page.
* **Vet & Lab Analysts:** Onboarded via the Admin Dashboard.

---

## 🧪 Testing & Verification Workflow

1. Open **`http://localhost:5173`**.
2. **Login as Admin** (`admin@agritrust.com` / `password`) -> Navigates to `/admin/dashboard`.
3. **Register a Farmer** -> Add a Farm -> Add Livestock -> Request a Vet Visit.
4. **Login as Vet** -> View pending visit requests -> Accept visit -> Record Vaccination/Treatment -> Complete Visit.
5. **Log Milk Batch & Test Quality** -> Enter Fat %, SNF %, Somatic Cell Count -> Generate Batch QR Code.
6. **Public Consumer Verification:** Click "Open Public Traceability" or scan the QR Code with a camera to see the full transparent audit trail.

---

## ❓ Troubleshooting

* **Port 8080 in use:** Stop any existing Spring Boot process (`killall java` or check Task Manager).
* **MongoDB connection failure:** Ensure your local MongoDB daemon is active (`mongod` / `sudo systemctl start mongod`) or verify your Atlas URI in `.env`.
* **CORS error in browser:** Ensure `CORS_ALLOWED_ORIGINS` in `.env` includes `http://localhost:5173`.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
