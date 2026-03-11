# VFOOT Backend Database Schema

**Technology:** PostgreSQL  
**Architecture:** State-driven multi-step registration + KYC + Wallet + Payment system

---

## 1. ENUM TYPES

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
  'KYC_APPROVED',
  'KYC_REJECTED',
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

## 2. USERS TABLE

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT, -- optional for OAuth
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

**Purpose:** Core authentication, role management, and registration state tracking.

---

## 3. COUNTIES TABLE

```sql
CREATE TABLE counties (
  county_code INT PRIMARY KEY,  -- 1-47 for Kenya
  name VARCHAR(100) UNIQUE NOT NULL
);
```

**Purpose:** Normalized county structure.

---

## 4. CAMPUSES TABLE

```sql
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_code INT REFERENCES counties(county_code) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL
);
```

**Purpose:** Ensures each campus belongs to a valid county.

---

## 5. REGISTRATION PROFILES (Steps 1 & 3)

```sql
CREATE TABLE registration_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- STEP 1: Personal Details
  full_name VARCHAR(150),
  pes_game_name VARCHAR(100),
  team_name VARCHAR(100),
  konami_username VARCHAR(100),

  -- STEP 3: Campus & Student Info
  county_code INT REFERENCES counties(county_code),
  campus_id UUID REFERENCES campuses(id),
  registration_number VARCHAR(100) UNIQUE,
  year_of_study VARCHAR(20),
  department VARCHAR(100),
  invitation_code VARCHAR(50),
  id_number VARCHAR(50) UNIQUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Store structured registration data separately from the users table.

---

## 6. REGISTRATION DRAFTS

```sql
CREATE TABLE registration_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Autosave and resume registration flow.

---

## 7. KYC SUBMISSIONS

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
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure a user can only have one KYC submission
ALTER TABLE kyc_submissions
  ADD CONSTRAINT unique_user_kyc UNIQUE (user_id);
```

**Purpose:** Store KYC info, track approval/rejection by admin.

---

## 8. WALLETS

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0,
  is_activated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Track wallet state; activate after payment confirmation.

---

## 9. PAYMENTS (MPESA Tracking)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  checkout_request_id VARCHAR(150),
  merchant_request_id VARCHAR(150),
  failure_reason TEXT,
  phone VARCHAR(20) NOT NULL,
  reference VARCHAR(150),
  mpesa_receipt VARCHAR(100),
  status payment_status_enum DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Store MPESA STK push transactions, confirmed only via webhook.

---

## 10. INVITATION CODES

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

**Purpose:** Invite-based registration control.

---

## 11. SYSTEM SETTINGS

```sql
CREATE TABLE system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  registration_open BOOLEAN DEFAULT TRUE,
  registration_deadline TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

```

**Purpose:** Registration window control.

---

```sql
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,         -- e.g. 'Campus', 'National'
    campus_id UUID REFERENCES campuses(id),  -- optional, only for campus-level tournaments
    year INT NOT NULL,
    status VARCHAR(50) NOT NULL,       -- e.g. 'upcoming', 'ongoing', 'completed'
    match_type VARCHAR(20) DEFAULT '1v1',
    group_size INT DEFAULT 4,          -- number of players per group
    knockout_stages BOOLEAN DEFAULT TRUE,
    rules JSONB,                       -- flexible rules storage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

```sql
CREATE TABLE fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    home_player UUID REFERENCES users(id) NOT NULL,   
    away_player UUID REFERENCES users(id) NOT NULL,   
    scheduled_at TIMESTAMP NOT NULL,
    venue VARCHAR(100) DEFAULT 'Online',
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

```sql
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    category VARCHAR(50), -- Y1, Y2, Y3, Y4, Z-League
    season INT,
    year INT,
    max_players INT DEFAULT 16,
    status VARCHAR(50) DEFAULT 'REGISTRATION_OPEN',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

```
```sql
CREATE TABLE league_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,

    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,

    points INT DEFAULT 0,

    joined_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (league_id, user_id)
);

```

```sql
CREATE TABLE league_fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,

    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),

    round INT,
    scheduled_at TIMESTAMP,

    status VARCHAR(50) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT NOW()
);

```
```sql
CREATE TABLE league_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID REFERENCES league_fixtures(id) ON DELETE CASCADE,

    player1_score INT,
    player2_score INT,

    submitted_by UUID REFERENCES users(id),

    verified BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW()
);
 ```
## 12. INDEXES (Performance Optimization)

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_kyc_user ON kyc_submissions(user_id);
CREATE INDEX idx_registration_profiles_user ON registration_profiles(user_id);
CREATE INDEX idx_campuses_county ON campuses(county_code);
CREATE INDEX idx_league_players_league
ON league_players(league_id);
```