-- =========================================================================
-- VIESA PLATFORM - MASTER SQL (VOLLEDIGE RESET)
-- LET OP: Deze query herstelt de gehele database naar de fabrieksinstellingen.
-- Hotels en Scooters zijn hierin 100% gescheiden van elkaar.
-- =========================================================================

-- 1. SCHOONSCHIP MAKEN (DROP ALLES)
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

DROP TABLE IF EXISTS scooter_bookings CASCADE;
DROP TABLE IF EXISTS scooter_companies CASCADE;


-- =========================================================================
-- DEEL 1: HET HOTEL PLATFORM (CHECK-IN)
-- =========================================================================

-- Tabel 1.1: Hotels
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#00d2d3',
  font_family TEXT DEFAULT 'Inter',
  branding_colors JSONB DEFAULT '{"primary": "#00d2d3", "accent": "#ff007a"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 1.2: Hotel Gasten
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  zipcode TEXT,
  country TEXT,
  passport_mrz TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 1.3: Hotel Check-ins
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  signature_url TEXT, 
  id_photo_url TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================================
-- DEEL 2: HET SCOOTER PLATFORM (VERHUUR)
-- =========================================================================

-- Tabel 2.1: Scooter Bedrijven (Gescheiden van Hotels!)
CREATE TABLE scooter_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#00d2d3',
  font_family TEXT DEFAULT 'Inter',
  scooter_fleet JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 2.2: Scooter Reserveringen
CREATE TABLE scooter_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES scooter_companies(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  scooter_model TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_time TEXT,
  status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================================
-- DEEL 3: BEVEILIGING (ROW LEVEL SECURITY - RLS)
-- =========================================================================

-- Zet de sloten erop
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_bookings ENABLE ROW LEVEL SECURITY;

-- 3.1: Poorten open voor het Hotel Platform
CREATE POLICY "Public read access for hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Allow public inserts for guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for checkins" ON checkins FOR INSERT WITH CHECK (true);

-- 3.2: Poorten open voor het Scooter Platform
CREATE POLICY "Public read access for scooter_companies" ON scooter_companies FOR SELECT USING (true);
CREATE POLICY "Allow public inserts for scooter_bookings" ON scooter_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for scooter_bookings" ON scooter_bookings FOR SELECT USING (true); -- Voor het Admin Dashboard


-- =========================================================================
-- DEEL 4: HERLAAD DATABASE CACHE
-- =========================================================================
NOTIFY pgrst, 'reload schema';
