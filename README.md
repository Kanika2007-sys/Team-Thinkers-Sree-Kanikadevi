# CivicOS: Multi-Agent Civic Operations & ERP Platform

## Executive Summary

CivicOS is an intelligent, multi-department Civic Operations and Enterprise Resource Planning (ERP) platform built to modernize municipal governance, complaint lifecycle management, and field officer operations. By unifying citizens, departmental administrators, field officers, and executive leadership within a single role-based operational framework, CivicOS transforms traditional public service delivery into an automated, data-driven system.

Powered by Google Gemini AI and Mapbox geospatial engines, CivicOS automates complaint classification, prioritizes hazards according to real-time risk scores, projects infrastructure failure points, and offers live telemetry and route optimization for field response teams.

---

## Problem Statement

Modern municipal management faces systemic bottlenecks across multiple administrative layers:

1. Manual Routing Delays: Citizen grievances often sit in triage queues due to manual categorization and assignment processes.
2. Lack of Real-Time Observability: Department leads and city executives lack unified geospatial visibility over active hazards, leading to delayed emergency response.
3. Field Officer Coordination Gaps: Field technicians lack real-time navigation assist, workload balancing, and automated repair verification tools.
4. Low Citizen Engagement: Citizens lack transparency regarding complaint progress, resulting in repeated inquiries and diminished public trust.

---

## Key Platform Features & Role-Based Portals

CivicOS provides four specialized operational portals governed by a centralized Role-Based Access Control (RBAC) architecture:

### 1. Citizen Portal (`/citizen`)
- Intelligent Issue Reporting: Submit geotagged complaints with high-precision location selection via Mapbox and photo evidence upload.
- Automated AI Triage: Real-time department identification and priority assignment powered by Google Gemini AI.
- Visual Progress Tracking: Interactive step-by-step timeline tracking complaint status from submission to verified resolution.
- Citizen Karma Incentive Engine: Gamified reward mechanism allocating points for filing complaints and verifying resolution, redeemable for municipal bill rebates.

### 2. Field Officer Portal (`/officer`)
- Real-Time Dispatch Command: Active queue management displaying assigned tickets categorized by priority and vulnerability score.
- Telemetry & Duty Controls: On-duty/Off-duty state toggle regulating dispatch availability.
- Geospatial Navigation: Interactive Mapbox turn-by-turn route optimization and travel time estimation.
- Gemini Field AI Assistant: Embedded conversational AI providing priority recommendations and repair duration estimates.
- Proof of Work Verification: Photo capture and submission pipeline to validate completed field repairs.

### 3. Department Portal (`/department`)
- Departmental Task Oversight: Centralized ticket management across specialized sectors (Electricity, Water, Infrastructure, Solid Waste, Public Health).
- Dynamic Resource Allocation: Direct officer assignment based on duty state, proximity, and active workload.
- Inventory & Material Management: Asset tracking system for monitoring repair materials, equipment availability, and maintenance inventory.

### 4. Executive Admin Command Portal (`/admin`)
- Geospatial Hazard Analytics: Real-time Mapbox heatmaps visualizing incident density, spatial clustering, and high-risk zones.
- Gemini AI Predictive Forecasting: AI risk assessment models forecasting grid failures and infrastructure stress points prior to critical breakdowns.
- Multi-Department Analytics: Comprehensive dashboards tracking total dispatches, SLA compliance rates, average resolution times, and department performance.
- System Administration: User role management, department configuration, service catalog administration, and zone boundary adjustments.

---

## Architecture & Technology Stack

### Frontend Core
- Framework: React 18 with Vite
- Routing: React Router DOM v6
- State Management: Zustand (`authStore`, `complaintStore`, `orgStore`)
- UI & Styling: Tailwind CSS v3, Framer Motion, Lucide React
- Visualizations: Recharts, Canvas Confetti

### Mapping & Geospatial Services
- Map Engine: Mapbox GL JS & Leaflet
- Spatial Data: Real-time coordinate mapping, marker clusters, heatmaps, and routing calculations

### Artificial Intelligence & Automation
- AI Engine: Google Gemini AI API (`geminiService.js`)
- Capabilities:
  - Natural language parsing for issue categorization
  - Priority scoring (Critical, High, Medium, Low)
  - Infrastructure vulnerability scoring (0-100 index)
  - Predictive hazard forecasting
  - Conversational Field Assistant Chatbot (`AiChatbot.jsx`)

### Persistence & Data Synchronization
- Persistence Layer: Unified Database Service (`xanoService.js`) with LocalStorage fallback and reactive window event dispatching for cross-tab state sync.
- Authentication: Firebase Authentication & Custom Unified Auth Engine.

---

## System Methodology & Implementation

### 1. Automated Complaint Processing Pipeline
```
[ Citizen Report ] 
       |
       v
[ Mapbox Geotagging & Image Capture ]
       |
       v
[ Gemini AI Analysis Engine ]
       |---> Categorizes Department (Electricity, Water, Roads, etc.)
       |---> Computes Vulnerability Score (0-100)
       |---> Assigns Priority Level (Critical, High, Medium)
       v
[ Unified Storage Engine Sync ]
       |
       v
[ Real-Time Notification & Dispatch ]
```

### 2. Field Resolution & Closing Loop Pipeline
```
[ Officer Dispatch ] ---> [ Mapbox Route Optimization ] 
                                  |
                                  v
                    [ Gemini Field AI Assistant Guidance ]
                                  |
                                  v
                    [ Field Repair Execution ]
                                  |
                                  v
                    [ Proof-of-Work Image Upload ]
                                  |
                                  v
                    [ Citizen Verification & Karma Award ]
```

---

## End-to-End Workflow Demonstration

To test the system locally, follow this operational walkthrough:

1. Citizen Submission:
   - Navigate to `/citizen/report`.
   - Select a location on the Mapbox interactive map.
   - Enter a description (e.g., "Transformer sparking with loud noise near main street").
   - Observe Gemini AI automatically assigning the Electricity Department, setting priority to Critical, and calculating a high vulnerability score.
   - Submit the complaint and view earned Karma points.

2. Citizen Tracking:
   - Navigate to `/citizen/track` to view the newly created ticket with live visual timeline updates.

3. Field Officer Operations:
   - Login to `/officer` or navigate to the Officer Dashboard.
   - Toggle duty status to On Duty.
   - View assigned ticket details, run route navigation, and use the embedded Civic AI Assistant.
   - Update ticket status to "Issue Resolved" and upload proof of repair.

4. Executive Monitoring:
   - Navigate to `/admin` to view updated metrics, Mapbox incident heatmap, AI predictive risk alerts, and officer efficiency rankings.

---

## Project Structure

```
.
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── main.jsx
│   ├── main.ts
│   ├── App.jsx
│   ├── router.jsx
│   ├── index.css
│   ├── components/
│   │   ├── AiChatbot.jsx
│   │   ├── AnimatedTimeline.jsx
│   │   ├── Avatar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ComplaintModal.jsx
│   │   ├── DataTable.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── MapboxView.jsx
│   │   ├── Modal.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── PriorityBadge.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SosModal.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Toast.jsx
│   │   └── Topbar.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── mapboxService.js
│   │   └── xanoService.js
│   ├── store/
│   │   ├── authStore.js
│   │   ├── complaintStore.js
│   │   └── orgStore.js
│   └── portals/
│       ├── admin/
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminLayout.jsx
│       │   ├── AnalyticsPage.jsx
│       │   ├── ComplaintsPage.jsx
│       │   ├── DepartmentsPage.jsx
│       │   ├── LocationsPage.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── RolesPage.jsx
│       │   ├── ServicesPage.jsx
│       │   └── UsersPage.jsx
│       ├── citizen/
│       │   ├── CitizenHome.jsx
│       │   ├── CitizenLayout.jsx
│       │   ├── ReportComplaintPage.jsx
│       │   └── TrackComplaintsPage.jsx
│       ├── department/
│       │   ├── DepartmentDashboard.jsx
│       │   ├── DepartmentLayout.jsx
│       │   └── InventoryPage.jsx
│       └── officer/
│           ├── OfficerDashboard.jsx
│           └── OfficerLayout.jsx
└── README.md
```

---

## Installation & Setup Instructions

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Kanika2007-sys/Team-Thinkers-Sree-Kanikadevi.git
   cd Team-Thinkers-Sree-Kanikadevi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in necessary keys if using custom API endpoints:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Pre-Configured Test Accounts

| Role | Portal Path | Email / Identifier | Initial State |
| :--- | :--- | :--- | :--- |
| Chief Administrator | `/admin` | `admin@civicone.gov.in` | Executive Command Access |
| Electricity Officer | `/officer` | `kumar@civicone.gov.in` | On Duty (Zone 4 East) |
| Water Board Officer | `/officer` | `rajesh@civicone.gov.in` | On Duty (Zone 4 Central) |
| Citizen | `/citizen` | Verified Citizen | Active Citizen Portal |

---

## Future Roadmap

1. IoT Sensor Integration: Direct telemetry connection to city smart meters, water pressure sensors, and traffic cameras for automated incident generation.
2. Offline-First Mobile App: Mobile application support for field officers working in areas with limited network connectivity.
3. Multilingual AI Assistant: Expanding Gemini AI capabilities to support regional language voice inputs for citizen reporting.
