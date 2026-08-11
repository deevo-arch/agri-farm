# 🌾 Agri Farm - Livestock & Antimicrobial Usage Monitoring System

[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Design](https://img.shields.io/badge/Design-Neumorphism%20Soft%20UI-10b981)](https://index.css)

**Agri Farm** is a state-of-the-art web monitoring platform designed for livestock health tracking, antimicrobial usage (AMU) compliance, veterinary record verification, and data-driven agricultural stewardship.

---

## ✨ Key Features & UI Improvements

### 🎨 Complete Neumorphism (Soft UI) Redesign
- **Dual Theme Support**: Full Light Mode (`#e8eef5`) and Dark Mode (`#181d28`) design systems powered by CSS custom properties and Neumorphic shadow math.
- **Tactile UI Elements**: Extruded 3D cards (`.neu-card`, `.stat-card`), soft recessed input fields (`.neu-inset`), and tactile push buttons (`.btn-primary-glow`, `.btn-view`).
- **Google Stitch MCP Integration**: Connected with Google Stitch MCP (`https://stitch.googleapis.com/mcp`) for design token generation and visual consistency.

### 📱 Responsive & Precision Layout Fixes
- **Full-Page Desktop Landscape Auth Modal**: Redesigned the authentication modal into a side-by-side 2-column landscape grid (`Agri Farm` branding on the left, input form on the right) so desktop users never need to scroll and the modal never overlaps the top navigation bar.
- **Clutter-Free Verification Tables**: Overhauled Vet, Farmer, and Animal verification tables with generous cell padding (`1.2rem`), vertical contact information stacking, soft status badges, and 3D action buttons.
- **No-Overlap Homepage**: Positioned hero section scroll indicators in natural flex flow to eliminate collisions with feature pills and section headers (`02`, `03`).
- **Padded Chart & Diagram Headers**: Added generous card padding (`28px 30px`) and container overflow bounds so diagram top-left icons never overshoot box edges.

---

## 🛠️ Technology Stack

- **Core Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6
- **Styling**: Pure Vanilla CSS with Neumorphic Token Variables
- **Icons & Data Visualization**: Lucide Icons, React Icons, Recharts
- **Design Synchronization**: Stitch MCP Server

---

## 📁 Project Structure

```
HackWithMumbai-main/
├── .vscode/
│   └── mcp.json                 # Stitch MCP server configuration
├── web_dashboard/
│   ├── src/
│   │   ├── components/          # StatCard, AuthModal, ThemeToggle, etc.
│   │   ├── layout/              # SidebarLayout navigation shell
│   │   ├── pages/               # Dashboard, TreatmentLog, FarmerRecords, VetRecords,
│   │   │                        # Reports, VetVerification, FarmerVerification,
│   │   │                        # AnimalVerification, LandingPage
│   │   ├── services/            # API client and mock data generators
│   │   ├── styles/              # Neumorphic CSS modules per page
│   │   ├── index.css            # Global Neumorphic design tokens & utilities
│   │   └── main.tsx             # Application entrypoint
│   ├── index.html               # Main page template
│   ├── package.json             # Project dependencies and scripts
│   └── vite.config.ts           # Vite build configuration
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm / yarn / pnpm

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/deevo-arch/agri-farm.git
   cd agri-farm
   ```

2. **Navigate to the web dashboard directory**:
   ```bash
   cd web_dashboard
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔑 Authority Portal Demo Credentials

To access the internal monitors and verification tools:
- **URL**: Click **Login** on the landing page
- **Email**: `admin@amu.gov`
- **Password**: `admin123`

---

## 📝 Recent UI Regeneration Changelog

- 🟢 **Brand Standardization**: Renamed all titles, headings, and branding references across the app from `AMU Monitoring Portal` to **`Agri Farm`**.
- 🟢 **Landing Page Overlaps**: Resolved scroll arrow collision with feature pills and section headers.
- 🟢 **Landscape Auth Modal**: Built 2-column desktop landscape modal layout to eliminate modal vertical scrolling and navbar overlap.
- 🟢 **Vet Verification Cleanup**: Formatted unspaced table cells into structured, padded data columns with soft status pills.
- 🟢 **Chart Icon Padding**: Added container bounds and inner padding to chart card heads to prevent icon overshooting.
- 🟢 **Stitch MCP Integration**: Added `.vscode/mcp.json` with Google Stitch MCP headers and server URL.

---

*Built with ❤️ for sustainable livestock farming & antimicrobial stewardship.*
