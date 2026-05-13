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
-- VIESA Reserve - Ultimate Master Schema (Cala Bassa Edition)
-- Run this entire script ONCE in your Supabase SQL Editor.
-- It will drop old tables and recreate everything cleanly with the new rules.

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS venues CASCADE;

-- 0. Venues (Global settings for the business)
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Viesa Beach Club',
  location_address VARCHAR(255),
  map_image_url TEXT DEFAULT '/calabassa-map.jpg',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Locations (The main 5 zones on the map)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL, -- e.g. "Zone 1", "Zone 2"
  pos_x DECIMAL(5,2) NOT NULL DEFAULT 0,
  pos_y DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Areas (The sub-zones within a location)
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g. "Camas Chiringo"
  type VARCHAR(50) NOT NULL, -- 'BEDS', 'HAMMOCKS', 'RESTAURANT', 'VIP'
  pos_x DECIMAL(5,2) NOT NULL DEFAULT 0,
  pos_y DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Beds / Tables (With advanced status and pricing)
CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- e.g. "Row 1 - Bed A", "VIP 1"
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE' (Green), 'PARTIAL' (Orange), 'BOOKED' (Red)
  reserved_until VARCHAR(10), -- e.g., "14:00" if status is PARTIAL
  pos_x DECIMAL(5,2) NOT NULL DEFAULT 0,
  pos_y DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE areas;
ALTER PUBLICATION supabase_realtime ADD TABLE beds;
ALTER PUBLICATION supabase_realtime ADD TABLE venues;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Create the Global Venue Settings
INSERT INTO venues (id, name, location_address, map_image_url) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Cala Bassa Beach Club', 'Ibiza, Spain', '/calabassa-map.jpg');

-- Create the 5 Main Zones
INSERT INTO locations (id, name, pos_x, pos_y) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Zone 1', 15, 50),
  ('22222222-2222-2222-2222-222222222222', 'Zone 2', 30, 25),
  ('33333333-3333-3333-3333-333333333333', 'Zone 3', 65, 25),
  ('44444444-4444-4444-4444-444444444444', 'Zone 4', 85, 45),
  ('55555555-5555-5555-5555-555555555555', 'Zone 5', 90, 75);

-- Zone 1: Chiringo
INSERT INTO areas (id, location_id, name, type, pos_x, pos_y) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Restaurante Chiringo', 'RESTAURANT', 5, 40),
  ('a1111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-111111111111', 'Camas Chiringo', 'BEDS', 18, 38),
  ('a1111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 'Hamacas Chiringo', 'HAMMOCKS', 15, 60);

-- Zone 2: Mumm
INSERT INTO areas (id, location_id, name, type, pos_x, pos_y) VALUES
  ('a2222222-2222-2222-2222-111111111111', '22222222-2222-2222-2222-222222222222', 'Hamacas Mumm', 'HAMMOCKS', 35, 20),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Camas Mumm', 'BEDS', 38, 35);

-- Zone 3: Central
INSERT INTO areas (id, location_id, name, type, pos_x, pos_y) VALUES
  ('a3333333-3333-3333-3333-111111111111', '33333333-3333-3333-3333-333333333333', 'Restaurante Central', 'RESTAURANT', 60, 20),
  ('a3333333-3333-3333-3333-222222222222', '33333333-3333-3333-3333-333333333333', 'Hamacas Central', 'HAMMOCKS', 60, 45);

-- Zone 4: Taittinger
INSERT INTO areas (id, location_id, name, type, pos_x, pos_y) VALUES
  ('a4444444-4444-4444-4444-111111111111', '44444444-4444-4444-4444-444444444444', 'Camas Taittinger', 'BEDS', 80, 48);

-- Zone 5: Portobello
INSERT INTO areas (id, location_id, name, type, pos_x, pos_y) VALUES
  ('a5555555-5555-5555-5555-111111111111', '55555555-5555-5555-5555-555555555555', 'Hamacas Portobello', 'HAMMOCKS', 85, 60),
  ('a5555555-5555-5555-5555-222222222222', '55555555-5555-5555-5555-555555555555', 'Restaurante Portobello', 'RESTAURANT', 80, 80);

-- Seeding Beds for "Camas Chiringo" (Area: a1111111-1111-1111-1111-222222222222)
-- Using the stadium grid coordinate structure
INSERT INTO beds (area_id, name, price, min_spend, status, reserved_until, pos_x, pos_y) VALUES
  -- Front Row (Expensive, Booked All Day)
  ('a1111111-1111-1111-1111-222222222222', 'Row 1 - A (VIP)', 500, 1000, 'BOOKED', NULL, 20, 20),
  ('a1111111-1111-1111-1111-222222222222', 'Row 1 - B (VIP)', 500, 1000, 'BOOKED', NULL, 50, 20),
  ('a1111111-1111-1111-1111-222222222222', 'Row 1 - C (VIP)', 500, 1000, 'AVAILABLE', NULL, 80, 20),
  
  -- Middle Row (Partial bookings)
  ('a1111111-1111-1111-1111-222222222222', 'Row 2 - A', 200, 500, 'PARTIAL', '14:30', 20, 50),
  ('a1111111-1111-1111-1111-222222222222', 'Row 2 - B', 200, 500, 'AVAILABLE', NULL, 50, 50),
  ('a1111111-1111-1111-1111-222222222222', 'Row 2 - C', 200, 500, 'PARTIAL', '13:00', 80, 50),
  
  -- Back Row (Cheaper, mostly available)
  ('a1111111-1111-1111-1111-222222222222', 'Row 3 - A', 100, 250, 'AVAILABLE', NULL, 20, 80),
  ('a1111111-1111-1111-1111-222222222222', 'Row 3 - B', 100, 250, 'AVAILABLE', NULL, 50, 80),
  ('a1111111-1111-1111-1111-222222222222', 'Row 3 - C', 100, 250, 'AVAILABLE', NULL, 80, 80);
