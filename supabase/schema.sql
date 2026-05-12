-- 1. Maak de Hotels tabel (Multi-tenant basis)
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- bijv. 'vibra-algarb'
  branding_colors JSONB DEFAULT '{"primary": "#00d2d3", "accent": "#ff007a"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Maak de Guests tabel
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
  passport_mrz TEXT, -- Versleutelde of gehashte data, geen foto's!
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Maak de Checkins tabel
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  signature_url TEXT, -- De Cloudinary URL van de handtekening
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Beveiliging: Zet Row Level Security (RLS) aan
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: API keys mogen alleen check-ins wegschrijven (Insert) of lezen o.b.v. hotel_id
CREATE POLICY "Allow public inserts for checkins" ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts for guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for hotel branding" ON hotels FOR SELECT USING (true);
