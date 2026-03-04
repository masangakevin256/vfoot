# VFOOT Backend Database Schema

**Technology:** PostgreSQL
**Architecture:** State-Driven Registration + KYC + Wallet + Payment System

---

# 1. ENUM TYPES

```sql
CREATE TYPE role_enum AS ENUM (
  'USER',
  'ADMIN',
  'SUPER_ADMIN'
);

CREATE TYPE registration_status_enum AS ENUM (
  'NOT_STARTED',
  'STEP_1_COMPLETED',
  'STEP_2_COMPLETED',
  'STEP_3_COMPLETED',
  'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED',
  'ACTIVE'
);

CREATE TYPE kyc_status_enum AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE payment_status_enum AS ENUM (
  'PENDING',
  'SUCCESS',
  'FAILED'
);
```

---

# 2. USERS TABLE (Core Authentication & State)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,

  password_hash TEXT , --since password will not be needed for google auth
  role role_enum DEFAULT 'USER',

  registration_status registration_status_enum DEFAULT 'NOT_STARTED',
  is_verified BOOLEAN DEFAULT FALSE,
  refresh_token TEXT,
  verification_code VARCHAR(10),
  auth_provider VARCHAR(50),
  google_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Stores authentication credentials
* Tracks registration state machine
* Controls user roles

---

# 3. REGISTRATION PROFILES (Step 1 + Step 3 Data)

```sql
CREATE TABLE registration_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- STEP 1: Personal Details
  full_name VARCHAR(150),
  pes_game_name VARCHAR(100),
  team_name VARCHAR(100),

  -- STEP 3: Campus & Student Info
  county VARCHAR(100),
  campus_id UUID,
  registration_number VARCHAR(100) UNIQUE,
  year_of_study VARCHAR(20),
  department VARCHAR(100),
  invitation_code VARCHAR(50),
  id_number VARCHAR(50) UNIQUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Stores structured registration data
* Separated from auth table for normalization
* Prevents overloading `users` table

---

# 4. REGISTRATION DRAFTS (Autosave / Resume Flow)

```sql
CREATE TABLE registration_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  step_number INT NOT NULL,
  data JSONB NOT NULL,

  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Enables autosave
* Prevents data loss on network failure
* Allows resume if app closes

---

# 5. KYC SUBMISSIONS

```sql
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  id_front_url TEXT NOT NULL,
  id_back_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,

  date_of_birth DATE NOT NULL,
  nationality VARCHAR(100) NOT NULL,

  status kyc_status_enum DEFAULT 'PENDING',

  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Stores ID verification
* Tracks admin approval workflow
* Keeps sensitive identity data isolated

---

# 6. COUNTIES TABLE

```sql
CREATE TABLE counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL
);
```

---

# 7. CAMPUSES TABLE

```sql
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id UUID REFERENCES counties(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL
);
```

### Purpose

* Normalized location structure
* Enables filtering campuses by county

---

# 8. WALLETS

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  balance NUMERIC(12,2) DEFAULT 0,
  is_activated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Tracks user wallet state
* Activated only after payment confirmation

---

# 9. PAYMENTS (MPESA Tracking)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  amount NUMERIC(12,2) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  reference VARCHAR(150),
  mpesa_receipt VARCHAR(100),

  status payment_status_enum DEFAULT 'PENDING',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Stores STK push transactions
* Updated only from webhook confirmation
* Prevents trusting frontend payment claims

---

# 10. INVITATION CODES

```sql
CREATE TABLE invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),

  usage_limit INT DEFAULT 1,
  used_count INT DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Controls invite-based registrations
* Tracks usage limits

---

# 11. SYSTEM SETTINGS (Registration Window Control)

```sql
CREATE TABLE system_settings (
  id INT PRIMARY KEY DEFAULT 1,

  registration_open BOOLEAN DEFAULT TRUE,
  registration_deadline TIMESTAMP,

  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Purpose

* Global registration toggle
* Countdown timer sync
* Prevents late registration

---

# 12. INDEXES (Performance Optimization)

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_kyc_user ON kyc_submissions(user_id);
CREATE INDEX idx_registration_profiles_user ON registration_profiles(user_id);
```

---

# FINAL ARCHITECTURE SUMMARY

This schema supports:

* Multi-step state-driven registration
* Hard validation with enums
* Resume flow with draft saving
* Secure KYC handling
* MPESA payment verification
* Wallet activation logic
* Invitation-based onboarding
* Admin moderation flow
* Registration deadline enforcement

---

**Status:** Production-grade foundation
**Compatible with:** Node.js + TypeScript + Express + PostgreSQL
**Ready for:** ORM (Prisma, Drizzle, TypeORM) or raw SQL implementation

---
###Added constraints
```sql
  ALTER TABLE kyc_submissions
  ADD CONSTRAINT unique_user_kyc UNIQUE (user_id);

  ALTER TABLE kyc_submissions
  ADD CONSTRAINT unique_user_kyc UNIQUE (user_id);

  ALTER TABLE kyc_submissions
  ADD COLUMN rejection_reason TEXT;
```

End of Schema Specification.
