# VFOOT Backend System

State-Driven Registration • KYC Verification • Wallet Activation • MPESA Integration

---

## 📌 Project Overview

VFOOT Backend is a production-grade API system designed to power:

* Multi-step user registration
* KYC identity verification
* Wallet activation via MPESA
* Competition eligibility control
* Invitation-based onboarding
* Registration window enforcement

This system is built as a **state-driven onboarding engine**, not a simple authentication server.

---

## 🏗 Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT
* **Password Security:** bcrypt
* **Payments:** MPESA STK Push
* **File Storage:** Cloud Storage ( Cloudinary / S3)

---

## 🧠 Core System Philosophy

This backend is designed around:

* Progressive registration steps
* Strict backend validation
* Hard state enforcement
* Secure KYC handling
* Idempotent payment confirmation
* Resume-safe registration drafts

The frontend cannot bypass business rules — all logic is enforced server-side.

---

## 🔄 Registration State Machine

Each user progresses through controlled states:

```
NOT_STARTED
STEP_1_COMPLETED
STEP_2_COMPLETED
STEP_3_COMPLETED
PAYMENT_PENDING
PAYMENT_CONFIRMED
ACTIVE
```

All protected routes validate the user’s `registration_status` before execution.

---

## 🗄 Database Architecture

### Core Tables

* `users` – Authentication + registration state
* `registration_profiles` – Personal + campus details
* `registration_drafts` – Autosave per step
* `kyc_submissions` – Identity verification records
* `wallets` – User wallet tracking
* `payments` – MPESA transaction logs
* `invitation_codes` – Invite tracking
* `counties` – Location normalization
* `campuses` – Campus listing
* `system_settings` – Registration control

The schema is fully normalized and production-ready.

---

## 🔐 Authentication & Authorization

### Authentication

* JWT-based authentication
* Access tokens required for protected routes
* Passwords hashed using bcrypt

### Authorization Roles

* `USER`
* `ADMIN`
* `SUPER_ADMIN`

Admin-level routes are role-protected.

---

## 💳 MPESA Payment Flow

1. User submits phone number.
2. Backend triggers STK Push.
3. Payment is saved as `PENDING`.
4. MPESA sends webhook callback.
5. Backend verifies receipt.
6. Payment updated to `SUCCESS`.
7. Wallet activated.
8. Registration status updated.

### Important:

* Frontend confirmation is ignored.
* Only webhook confirmation activates wallet.
* Payment processing uses database transactions.

---

## 🪪 KYC Workflow

* User uploads ID front/back and selfie.
* Submission stored in `kyc_submissions`.
* Status defaults to `PENDING`.
* Admin reviews and updates to:

  * `APPROVED`
  * `REJECTED`

KYC approval may be required before competition eligibility.

---

## 📡 API Modules

```
/auth
/registration
/kyc
/wallet
/payments
/campus
/invites
/admin
/system
```

All routes follow consistent response format.

---

## 📦 Project Structure

```
src/
 ├── app.ts
 ├── server.ts
 ├── config/
 ├── routes/
 ├── controller/
 ├── database/
 ├── modules/
 │     ├── auth/
 │     ├── registration/
 │     ├── kyc/
 │     ├── wallet/
 │     ├── payments/
 │     ├── campus/
 │     └── invites/
 ├── middleware/
 ├── utils/
 ├── schema/
 └── types/

```

The system follows modular domain-based architecture.

---

## 🚀 Development Setup

### 1️⃣ Install Dependencies

```bash
pnpm install
```

### 2️⃣ Environment Variables

Create a `.env` file:

```
PORT=5000
DATABASE_URL=
JWT_SECRET=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
CLOUD_STORAGE_KEY=
NODE_ENV=development
```

### 3️⃣ Run Development Server

```bash
pnpm dev
```

---

## 🏭 Production Deployment

### Build

```bash
pnpm build
```

### Start

```bash
pnpm start
```

### Requirements

* HTTPS enabled
* Public webhook URL
* Production PostgreSQL database
* Secure environment variable storage

---

## ⚠️ Critical Engineering Considerations

* Unique constraints prevent duplicate accounts
* Transactions protect payment updates
* File uploads validated by type and size
* Rate limiting applied to auth routes
* Webhook signature verification required
* Registration window enforced via system settings

---

## 📊 Admin Capabilities (Backend Ready)

* Approve/reject KYC submissions
* Track payments
* Monitor registration progress
* Manage invitation codes
* Open/close registration window

---

## 🧪 Error Response Standard

All errors follow:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Consistency ensures frontend reliability.

---

## 📈 Scalability Design

* Indexed critical columns
* Stateless JWT auth
* Modular route separation
* Config-driven registration window
* Extendable wallet architecture

---

## 🛡 Security Highlights

* Password hashing (bcrypt)
* JWT authentication
* Role-based access control
* Payment idempotency
* Input validation (Zod/Joi)
* Secure file storage
* Database-level constraints

---

## 📌 System Status

✔ Production-ready architecture
✔ MPESA-compatible
✔ Secure onboarding pipeline
✔ Competition eligibility controlled
✔ Admin moderation ready

---

## 👨‍💻 Maintainer

Backend developed using Node.js, TypeScript, Express, and PostgreSQL.

---

End of Documentation.
