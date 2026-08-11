# How to Run and Operate the AMU Monitoring Portal Web Dashboard

This guide provides step-by-step instructions to install, configure, launch, and operate the **AMU (Antimicrobial Usage) Monitoring Web Portal**.

---

## 1. System Requirements & Prerequisites

Before running the web application, ensure your machine has the following tools installed:

- **Node.js**: `v18.0.0` or higher (Includes `npm`)
- **Python**: `v3.10` or higher (Optional, for Flask Backend API)
- **Web Browser**: Google Chrome, Mozilla Firefox, Brave, or Microsoft Edge

---

## 2. Application Architecture Overview

```
+-------------------------------------------------------+
|                 Web Dashboard (Vite + React)          |
|                 URL: http://localhost:5173              |
+---------------------------+---------------------------+
                            |
           Fetch API        | (Fallback to Mock Data if disconnected)
                            v
+-------------------------------------------------------+
|                 Backend Server (Python Flask)         |
|                 URL: http://localhost:5000              |
+-------------------------------------------------------+
```

> **Note**: The web dashboard is equipped with an **automatic fallback mechanism**. If the Flask backend API is not running, the dashboard will seamlessly switch to local **Mock Data mode** so you can test all features offline without any setup errors.

---

## 3. How to Run the Web Dashboard

### Step 1: Navigate to the Web Dashboard Directory
Open your terminal and run:
```bash
cd HackWithMumbai-main/web_dashboard
```

### Step 2: Install NPM Dependencies
If you are running the project for the first time, install the required packages:
```bash
npm install
```

### Step 3: Start the Vite Development Server
Run the local development server:
```bash
npm run dev
```

### Step 4: Open in Browser
Once Vite starts, it will output a local URL:
```text
  VITE v5.4.21  ready in 731 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 4. (Optional) How to Run the Flask Backend Server

If you want to test live data persistence from the Flask API server:

### Step 1: Navigate to Backend Directory
```bash
cd HackWithMumbai-main/backend_server
```

### Step 2: Set up Python Environment & Dependencies
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### Step 3: Start Flask Server
```bash
python run.py
```
The backend server will start on `http://127.0.0.1:5000`.

---

## 5. Portal Credentials & Login Operations

### Step 1: Landing Page
- When you open `http://localhost:5173/`, you land on the **Public Landing Page**.
- Explore sections: **Home**, **Features**, and **Impact**.

### Step 2: Access the Authority Login Modal
- Click the **Login** or **Start Monitoring Free** button in the navigation bar.

### Step 3: Default Admin Credentials
Enter the default Authority credentials:
- 📧 **Email**: `admin@amu.gov`
- 🔑 **Password**: `admin123`
- Click **Sign In**.

### Step 4: Successful Authentication
- The application sets an authentication token (`amu_auth = ok`) in `localStorage`.
- You will be automatically redirected to the **Authority Dashboard** (`/dashboard`).

---

## 6. How to Operate Each Section

### 📊 1. Main Dashboard (`/dashboard`)
- **KPI Overview**: View top cards for Total Farmers, Total Animals, Total Vets, Total Treatments, Safe Farms, Under Withdrawal, Active Monitoring, and MRL Compliance Rate.
- **Interactive Charts**:
  - *Treatments per Month*: Line chart showing usage over time.
  - *Animals by Species*: Bar chart displaying cattle, goat, buffalo, sheep counts.
  - *Farm Safety Status*: Pie chart showing safe vs under-withdrawal farms.
  - *Compliance Monitoring*: Area chart tracking compliant vs non-compliant treatments.
  - *Vet Activity*: Weekly visit histogram.
- **Top Medicine Usage**: Progress bars indicating frequency of prescribed antibiotics.
- **Data Refresh**: Click the 🔄 **Refresh** button in the top right header to reload metrics.

---

### 📋 2. Treatment Log (`/treatment-log` or `/treatments`)
- **Search & Filter**: Search by farmer name, animal ID, vet name, medicine name, or symptoms.
- **Status Indicators**:
  - 🟢 **Active**: Treatment active, withdrawal period in progress.
  - 🟡 **Warning**: Withdrawal period ending within 2 days.
  - 🔴 **Violation**: Flagged MRL/withdrawal violation.
  - ⚪ **Completed**: Withdrawal period completed.
- **View Details**: Click **View Details** on any record to inspect full prescription details, dosage, remaining withdrawal days, symptoms, diagnosis, and vet notes.

---

### 👨‍🌾 3. Farmer Records (`/farmers`)
- **Filter**: Search farmers by name, district, or status (*Verified* vs *Pending*).
- **Inspect Farmer Profiles**: Click **View Details** to open:
  - **Documents Modal**: Review uploaded Aadhar Card, Farm Registration certificates.
  - **Animals Modal**: Inspect all tagged animals belonging to the farmer, species, breed, and health status.

---

### 🩺 4. Vet Verification (`/vet-verification`)
- **Pending Review**: Inspect veterinary doctor registration applications.
- **Document Verification**: Review license numbers, veterinary council registration, and clinic details.
- **Actions**: Click **Approve** to verify a vet or **Reject** if details are incomplete.

---

### 🚜 5. Farmer Verification (`/farmer-verification`)
- **KYC Review**: Inspect pending farmer registration forms.
- **Identity & Farm Checks**: Verify Aadhar details, land ownership, animal count, and GPS coordinates.
- **Actions**: Click **Approve Farmer** or **Reject Application**.

---

### 📑 6. Reports (`/reports`)
- **Custom Report Generation**: Select Date Range, District/Region, and Commodity Type (Dairy, Poultry, Livestock).
- **Export Options**:
  - 📄 **Export PDF**: Downloads a professionally formatted PDF report using `jspdf` and `jspdf-autotable`.
  - 📊 **Export CSV**: Downloads raw data in CSV format for analysis.
- **Analytics Visuals**: View MRL Compliance percentage and Antimicrobial Consumption Index charts.

---

### 👨‍⚕️ 7. Vet Records (`/vet-records`)
- **Veterinarian Directory**: Browse all active and verified veterinarians in the system.
- **Details**: View license number, specializations, district assigned, contact details, and total treatments logged.

---

### 🏷️ 8. Animal Verification (`/animal-verification`)
- **Tag Management**: Search and track RFID / Ear Tag numbers.
- **Audit Logs**: Verify species, breed, age, health records, and owner movement logs.

---

## 7. Troubleshooting & FAQ

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `vite: command not found` | Dependencies not installed | Run `npm install` inside `web_dashboard` directory. |
| Dashboard shows "Using Mock Data" | Flask backend server is not running on port 5000 | This is normal behavior. If backend is desired, start `python run.py` in `backend_server`. |
| Login rejected with invalid credentials | Incorrect email/password typed | Use `admin@amu.gov` and `password: admin123`. |
| Page opens as blank | Missing React route | Navigate to root `http://localhost:5173/` and click Login. |

---
