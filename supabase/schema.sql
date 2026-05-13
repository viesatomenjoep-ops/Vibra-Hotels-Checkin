-- =========================================================================
-- VIESA PLATFORM - MULTI-TENANT SaaS SCHEMA
-- =========================================================================

-- 0. CLEANUP (Voorkomt 'already exists' errors)
DROP TABLE IF EXISTS platform_subscriptions CASCADE;
DROP TABLE IF EXISTS rental_bookings CASCADE;
DROP TABLE IF EXISTS rental_assets CASCADE;
DROP TABLE IF EXISTS hotel_checkins CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

DROP TYPE IF EXISTS branch_category_enum CASCADE;
DROP TYPE IF EXISTS subscription_status_enum CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS (Voor stricte data controle)
CREATE TYPE branch_category_enum AS ENUM ('hotel', 'rental', 'beachbeds');
CREATE TYPE subscription_status_enum AS ENUM ('trial', 'active', 'past_due', 'canceled');

-- 2. COMPANIES (De centrale 'Tenant' tabel)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  branch_category branch_category_enum NOT NULL,
  
  -- Ibiza Style Branding (Standaard naar premium zand/blauw kleuren)
  logo_url TEXT,
  primary_color TEXT DEFAULT '#d4c5b9', -- Zand / Off-white
  accent_color TEXT DEFAULT '#4a90e2',  -- Mediterraans blauw
  font_family TEXT DEFAULT 'Inter',
  
  -- SaaS & Onboarding data
  subscription_status subscription_status_enum DEFAULT 'trial',
  promo_code TEXT, 
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES (Gekoppeld aan Supabase Auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS / GUESTS (Gedeelde klantendatabase per bedrijf)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  zipcode TEXT,
  country TEXT,
  passport_mrz TEXT,
  id_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- MODULE A: HOTEL CHECK-IN
-- =========================================================================

CREATE TABLE hotel_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  signature_url TEXT,
  checkin_date DATE DEFAULT CURRENT_DATE,
  checkout_date DATE,
  room_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- MODULE B: VERHUUR (SCOOTERS ETC)
-- =========================================================================

CREATE TABLE rental_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Bijv: 'Vespa Primavera 125cc'
  asset_type TEXT DEFAULT 'scooter',
  license_plate TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES rental_assets(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'active', 'completed', 'cancelled')),
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- MODULE C: PAYMENT & SUBSCRIPTIONS (SaaS niveau)
-- =========================================================================

CREATE TABLE platform_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT,
  status subscription_status_enum,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) - STRIKTE SCHEIDING!
-- =========================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

-- Crucial: Users must be able to read their own profile to know their company_id!
CREATE POLICY "Users can read own profile" 
  ON user_profiles FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (id = auth.uid());

-- Regels: Een geauthenticeerde user mag ALLEEN data zien/wijzigen van zijn eigen company_id
CREATE POLICY "Tenant Isolation: Access own company" 
  ON companies FOR ALL 
  USING (id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant Isolation: Access own customers" 
  ON customers FOR ALL 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant Isolation: Access own checkins" 
  ON hotel_checkins FOR ALL 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant Isolation: Access own rental assets" 
  ON rental_assets FOR ALL 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant Isolation: Access own rental bookings" 
  ON rental_bookings FOR ALL 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));
