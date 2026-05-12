-- 1. Maak de Hotels tabel (Multi-tenant basis)
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- bijv. 'vibra-algarb'
  branding_colors JSONB DEFAULT '{"primary": "#00d2d3", "accent": "#ff007a"}'::jsonb,
  logo_url TEXT DEFAULT '/vibra-logo.svg',
  primary_color TEXT DEFAULT '#00d2d3',
  font_family TEXT DEFAULT 'Inter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Maak de Guests tabel
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  zipcode TEXT,
  country TEXT,
  passport_mrz TEXT, -- Versleutelde of gehashte data, geen foto's!
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Maak de Checkins tabel
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  signature_url TEXT, -- De Cloudinary URL van de handtekening
  id_photo_url TEXT, -- De Cloudinary URL van de paspoort/ID foto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maak de Scooter Companies tabel
CREATE TABLE IF NOT EXISTS scooter_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  primary_color TEXT DEFAULT '#00d2d3',
  font_family TEXT DEFAULT 'Inter',
  logo_url TEXT,
  scooter_fleet JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Maak de Scooter Bookings tabel
CREATE TABLE IF NOT EXISTS scooter_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id BIGINT REFERENCES scooter_companies(id) ON DELETE CASCADE,
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

-- Beveiliging: Zet Row Level Security (RLS) aan
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_bookings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies:
DROP POLICY IF EXISTS "Allow public inserts for checkins" ON checkins;
CREATE POLICY "Allow public inserts for checkins" ON checkins FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public inserts for guests" ON guests;
CREATE POLICY "Allow public inserts for guests" ON guests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for hotel branding" ON hotels;
CREATE POLICY "Public read access for hotel branding" ON hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for scooter_companies" ON scooter_companies;
CREATE POLICY "Public read access for scooter_companies" ON scooter_companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts for scooter_bookings" ON scooter_bookings;
CREATE POLICY "Allow public inserts for scooter_bookings" ON scooter_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for scooter_bookings" ON scooter_bookings;
CREATE POLICY "Public read access for scooter_bookings" ON scooter_bookings FOR SELECT USING (true);
