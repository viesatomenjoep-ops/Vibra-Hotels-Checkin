-- =========================================================================
-- VIESA PLATFORM - PROPERTY MANAGEMENT & CHECK-IN SCHEMA
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties (Hotels/Guesthouses/Villas)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  setup_fee_paid BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  passport_mrz TEXT,
  id_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkins
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  signature_url TEXT,
  checkin_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cleaners
CREATE TABLE cleaners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  pin_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cleaning Logs
CREATE TABLE cleaning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  cleaner_id UUID REFERENCES cleaners(id) ON DELETE CASCADE,
  bedrooms_clean BOOLEAN DEFAULT false,
  bathrooms_clean BOOLEAN DEFAULT false,
  kitchen_clean BOOLEAN DEFAULT false,
  outdoor_clean BOOLEAN DEFAULT false,
  photos JSONB DEFAULT '[]'::jsonb, -- Array of Cloudinary URLs for proof
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Damages
CREATE TABLE damages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  cleaner_id UUID REFERENCES cleaners(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'fixing', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE damages ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (or secure it as needed for production)
CREATE POLICY "Public read access for properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public inserts for guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for checkins" ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for cleaners" ON cleaners FOR SELECT USING (true);
CREATE POLICY "Allow public inserts for cleaning_logs" ON cleaning_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for damages" ON damages FOR INSERT WITH CHECK (true);
