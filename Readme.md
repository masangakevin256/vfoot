#  VFOOT - Backend System

**The National University eFootball Ecosystem Center**

State-Driven Registration • Tournament Management • Ranking System • MPESA Integration • KYC Verification

---

## 📌 Project Overview

** VFOOT** is a comprehensive national university eFootball ecosystem in Kenya. It is designed to foster a competitive gaming environment across **16 campuses**, culminating in the annual **National VFOOT Cup**.

The backend serves as the core engine powering the entire ecosystem, managing multi-tier tournaments, real-time rankings, financial transactions, and fair-play enforcement.

### 🎯 Key Ecosystem Vision
*   **National Reach:** Connecting 16 major university campuses.
*   **Competitive Tiers:** Managing Campus Leagues (Year 1–4) and the elite Z-League.
*   **National Pathway:** Qualification systems for the National VFOOT Cup.
*   **Player Growth:** Comprehensive stats tracking and "Hall of Fame" recognition.

---

## 🏗 Backend Tech Stack

*   **Runtime:** Node.js
*   **Language:** TypeScript
*   **Framework:** Express.js
*   **Database:** PostgreSQL (Relationally modeled for complex tournament & financial data)
*   **Authentication & Services:** Firebase (Auth, RTDB, Storage, FCM)
*   **Payments:** MPESA Daraja API (STK Push & Webhooks)
*   **Logic:** State-driven onboarding and tournament state machines.

---

## 🏆 Tournament & League Architecture

The system is designed to handle a complex hierarchy of competitive play:

### 1. Campus Leagues
*   **Divisional Structure:** Tiered leagues (Year 1, Year 2, Year 3, Year 4).
*   **Z-League:** The premier campus division.
*   **Promotion/Relegation:** Backend logic for end-of-season state transitions.

### 2. Cup Competitions
*   **Campus Main Cup:** Local campus-level knockout tournaments.
*   **National VFOOT Cup:** The ultimate national championship involving qualified campus champions.

### 3. VFOOT Hub
*   **Friendlies:** Matchmaking and record-keeping for casual play.
*   **Paid Matches:** Secure wagering and prize distribution logic.
*   **Public/Private Leagues:** Community-driven competition management.

---

## � Ranking & Fair Play (CP & RP)

The backend implements a sophisticated player evaluation system:

*   **Ranked Points (RP):** Measures skill and competitive performance. 
    *   Calculated based on match results, opponent strength, and tournament tier.
    *   Directly affects leaderboard position and National Cup qualification.
*   **Courtesy Points (CP):** Measures fair play, verification, and sportsmanship.
    *   Integrated with the **Fair Play & Verification System**.
    *   Deductions for toxic behavior, disqualifications, or unverified match reports.
    *   Required minimum thresholds for tournament eligibility.

---

## 💳 Wallet & MPESA Ecosystem

A secure, idempotent financial layer:

*   **MPESA STK Push:** Direct in-app wallet funding.
*   **Webhook Verification:** Only server-to-server confirmations trigger wallet updates.
*   **Transactional Integrity:** PostgreSQL-backed ACID transactions for all monetary flows (prizes, entry fees, withdrawals).
*   **Wallet States:** `PENDING_ACTIVATION`, `ACTIVE`, `FROZEN`.

---

## 🗄 Database Schema (PostgreSQL)

The system utilizes a fully normalized relational schema:

*   **Users:** Identity, Auth metadata, and registration state.
*   **Tournaments:** Settings, brackets, schedules, and prize pools.
*   **Matches:** Results, stats, and verification logs.
*   **Rankings:** Historical RP/CP snapshots per player.
*   **Wallets & Payments:** Ledger-based transaction history.
*   **Campuses:** Hierarchical organization of the 16 campuses.
*   **KYC Submissions:** Secure identity verification records.

---

## 📡 Core Backend Modules

```
/auth          - Firebase integration & JWT management
/tournaments   - Configuration, brackets, and match scheduling
/leagues       - Table standings, promotion/relegation logic
/hub           - Matchmaking and informal competition API
/ranking       - RP/CP calculation and leaderboard generation
/stats         - Player performance metrics and Hall of Fame
/wallet        - Financial ledger and balance management
/payments      - MPESA Daraja API webhooks and initiations
/kyc           - Identity verification workflow
/notifications - FCM push notifications for match alerts
```

---

## 🚀 Development & Deployment

### Setup
1. `pnpm install`
2. Configure `.env` with `DATABASE_URL` (PostgreSQL), Firebase credentials, and MPESA API keys.
3. `pnpm dev`

### Production
*   **Deployment:** Node.js environment with HTTPS.
*   **Database:** Managed PostgreSQL.
*   **Monitoring:** Health checks for MPESA webhooks and Firebase service status.

---

## 🛡 Security & Verification
*   **Multi-step KYC:** ID and selfie verification required for professional tiers.
*   **Match Verification:** Dispute resolution logic for match results.
*   **Role-Based Access (RBAC):** Admin panel permissions (Tournament Director, Financial Auditor, KYC Reviewer).

---

## ‍💻 Backend Development
Maintained as a robust, scalable Node.js API focused on performance, security, and the integrity of the national eFootball ecosystem.

---
© 2026 VFOOT. End of documentation.
