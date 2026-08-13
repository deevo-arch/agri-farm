# 🌾 Agri Farm - Livestock Health & Antimicrobial Stewardship Platform

![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat&logo=vite)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=flat&logo=typescript)
![WebGL](https://img.shields.io/badge/WebGL-OGL%203D%20Shaders-8b5cf6)
![GSAP](https://img.shields.io/badge/GSAP-3.15.0-green)
![Design](https://img.shields.io/badge/Design-3D%20Neumorphism%20Obsidian-13111c)

**Agri Farm** is a comprehensive, state-of-the-art web and mobile platform engineered for livestock health monitoring, transparent antimicrobial usage (AMU) tracking, veterinarian verification, and data-driven agricultural stewardship.



## 📋 Table of Contents
1. [Key Features & Visual Architecture](#-key-features--visual-architecture)
2. [Role-Based Access Control (RBAC) & Security Scoping](#-role-based-access-control-rbac--security-scoping)
3. [12-Digit Admin Invite & Upgrade System](#-12-digit-admin-invite--upgrade-system)
4. [Technology Stack](#-technology-stack)
5. [System Architecture & Module Overview](#-system-architecture--module-overview)
6. [Getting Started & Installation](#-getting-started--installation)
7. [Operational Flow & Connection Guide](#-operational-flow--connection-guide)
8. [Demo Credentials](#-demo-credentials)

---

## ✨ Key Features & Visual Architecture

### 🎨 Obsidian Neumorphic 3D Design System
- **Obsidian Neumorphism**: Dark Obsidian (`#09090f` background, `#13111c` cards, `#8b5cf6` electric violet accents) with extruded 3D neumorphic shadow math (`-6px -6px 14px #1c182b, 6px 6px 14px #050409`).
- **100% Solid Opaque Containers**: All dashboard widgets, verification tables, doc guides, and modal containers use 100% solid, non-translucent backgrounds (`#13111c`, `opacity: 1`) to guarantee text readability without background lines bleeding through.
- **Silky Smooth Hover Curves**: Soft global transitions (`0.4s cubic-bezier(0.16, 1, 0.3, 1)`) for all interactive buttons, cards, and navigation links.

### 🌌 Interactive React Bits Component Suite
- **`<LiquidEther />`**: Interactive WebGL fluid dynamics canvas rendered on the landing page background.
- **`<Topography />`**: WebGL 2 terrain contour shader rendered across all post-login pages (`SidebarLayout`), featuring fluid elevation swell on cursor movement (`opacity: 0.40` default, smoothly transitioning to `opacity: 0.25` on container hover).
- **`<TextLoop />`**: Edge-to-edge wave SVG ribbon continuously scrolling `"REAL TIME ✦ VET VERIFIED ✦ COMPLIANCE READY"`.
- **`<ParticleText />`**: 3D particle canvas scattering text (`Agri Farm`) on mouse hover.
- **`<MagicBento />`**: Interactive 3D tilt grid with particle stars, magnetism, border glow, and spotlight tracking.
- **`<GooeyNav />`**: Floating navbar with fluid gooey pill indicators.
- **`<BorderGlow />` & `<SpotlightCard />`**: Neon border animations and cursor tracking spotlights.

---

## 🔐 Role-Based Access Control (RBAC) & Security Scoping

Agri Farm enforces strict role-level view isolation across three distinct user roles:

| Workspace Role | Navigation Access | Feature Scoping & Privacy Rules |
| :--- | :--- | :--- |
| **🌾 Farmer** | Dashboard, Treatment Log, Verification, Reports, Help | Restricted. `Farmer Records` (`/farmers`) and `Vet Records` (`/vet-records`) are **hidden**. Dedicated to batch logging and withdrawal countdowns. |
| **🩺 Veterinarian** | Dashboard, Treatment Log, Verification, Reports, Help | Restricted. `Farmer Records` (`/farmers`) and `Vet Records` (`/vet-records`) are **hidden**. Dedicated to prescription review and AMU verification. |
| **🛡️ Admin Authority** | **All Routes** + Admin Invites (`/admin-invites`) | Full system authorization. Exclusive access to sensitive administrative master records (`/farmers`, `/vet-records`) and verification queues. |

---

## 🔑 12-Digit Admin Invite & Upgrade System

To prevent unauthorized role escalation to `Admin Authority`:

1. **Code Generation**: Ongoing Admins generate single-use 12-digit invite codes (e.g., `8921-4401-9012`) via the **Admin Invites** section (`/admin-invites`).
2. **Time-Limited Validity**: Each generated code is bound to a live **5-minute expiration timer** (`expiresAt = Date.now() + 5 * 60 * 1000`).
3. **Code Redemption**: Users attempting to switch their primary account role to `Authority Admin` in the *Change Account Type* modal must enter a valid, active 12-digit code.
4. **Single-Use Verification**: Once redeemed, the code is immediately invalidated and marked claimed.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5.4, TypeScript 5.6
- **Routing**: React Router DOM v6
- **Graphics & 3D Shaders**: WebGL 2, OGL (`Renderer`, `Program`, `Mesh`), GSAP (SVG Path TextLoop)
- **Styling**: Pure Vanilla CSS with CSS Custom Property Tokens & Neumorphic Math
- **Icons & Data Viz**: Lucide React, React Icons, Recharts
- **PDF Generation**: jsPDF, AutoTable
- **Backend API**: Node.js, Express, Hostinger SMTP Email OTP Service

---

## 📁 System Architecture & Module Overview

```
HackWithMumbai-main/
├── HOSTINGER_EMAIL_OTP_GUIDE.md   # Documentation for Hostinger SMTP OTP service
├── README.md                       # Master platform documentation
├── backend_server/                 # Node.js backend server API
├── Mobile_app_core/                # Mobile integration layer
└── web_dashboard/                  # Core React Vite dashboard application
    ├── src/
    │   ├── components/             # Topography, TextLoop, ParticleText, MagicBento,
    │   │                           # GooeyNav, SpotlightCard, BorderGlow, HowItWorksModal
    │   ├── context/                # AuthContext (RBAC state & active role switcher)
    │   ├── layout/                 # SidebarLayout (Topography WebGL background shell)
    │   ├── pages/                  # LandingPage, Dashboard, TreatmentLog, FarmerRecords,
    │   │                           # VetRecords, AdminInvites, VetVerification,
    │   │                           # FarmerVerification, Reports, HelpDocumentation
    │   ├── services/               # adminInviteService, API services, mock data
    │   ├── styles/                 # Page-specific Neumorphic stylesheets
    │   ├── utils/                  # 3D Avatar Generator & helper utilities
    │   ├── index.css               # Global Obsidian Neumorphic design tokens
    │   └── main.tsx                # App entrypoint
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm / yarn / pnpm

### Setup Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/deevo-arch/agri-farm.git
   cd HackWithMumbai-main
   ```

2. **Setup Backend Server** (Optional for local API backend):
   ```bash
   cd backend_server
   npm install
   npm start
   ```

3. **Setup & Run Web Dashboard**:
   ```bash
   cd ../web_dashboard
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Production Build & Verification**:
   ```bash
   npm run build
   ```

---

## 🔄 Operational Flow & Connection Guide

### 1. 🌾 Farmer Workflow
1. Log in or select `Farmer` workspace role.
2. Navigate to **Treatment Log** (`/treatments`).
3. Click **+ Log New Treatment** to record batch treatments, drug dosage, and livestock batch ID.
4. The system calculates the mandatory **Withdrawal Period** countdown.
5. Submit treatment for Veterinarian review.

### 2. 🩺 Veterinarian Workflow
1. Log in or select `Veterinarian` portal role.
2. Navigate to **Vet Verification** (`/vet-verification`).
3. Inspect pending antimicrobial treatment logs submitted by farmers.
4. Verify dosage correctness against pharmaceutical guidelines.
5. Click **Approve & Sign** or **Reject** with comments.

### 3. 🛡️ Admin Authority Workflow
1. Log in using Admin credentials or redeem a 12-digit invite code.
2. Access nationwide compliance metrics on the **Dashboard** (`/dashboard`).
3. Navigate to **Farmer Records** (`/farmers`) or **Vet Records** (`/vet-records`) to audit registered users.
4. Navigate to **Admin Invites** (`/admin-invites`) to generate single-use 12-digit authorization codes for onboarding new admins.
5. Generate official PDF audit reports on **Reports & Analytics** (`/reports`).

---

## 🔑 Demo Credentials

To explore the dashboard and role-switching features:

- **Government Admin**: `admin@amu.gov` / `admin123`
- **Registered Farmer**: `farmer@agri.com` / `farmer123`
- **Veterinarian**: `vet@health.org` / `vet123`

---
