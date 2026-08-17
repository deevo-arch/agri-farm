-- =============================================================
-- AGRI FARM — SUPABASE POSTGRESQL MIGRATION
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- 1. FARMERS TABLE
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  mobile TEXT UNIQUE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  aadhar_number TEXT,
  photo_path TEXT,
  aadhar_photo_path TEXT,
  tahsildar_verification_path TEXT,
  document_paths TEXT[] DEFAULT '{}',
  is_profile_completed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  maintains_record_book BOOLEAN,
  medicines_in_use BOOLEAN,
  follows_vet BOOLEAN,
  vet_name TEXT,
  milk_supply_to TEXT[] DEFAULT '{}',
  cow_count INTEGER DEFAULT 0,
  goat_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VETS TABLE
CREATE TABLE IF NOT EXISTS vets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  mobile TEXT UNIQUE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  qualification TEXT,
  registration_number TEXT,
  specialization TEXT[] DEFAULT '{}',
  profile_photo_path TEXT,
  license_certificate_path TEXT,
  degree_certificate_path TEXT,
  id_card_path TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  rating DOUBLE PRECISION DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ANIMALS TABLE
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE NOT NULL,
  species TEXT CHECK (species IN ('cow', 'buffalo', 'goat', 'sheep', 'poultry')) NOT NULL,
  breed TEXT,
  tag_number TEXT UNIQUE NOT NULL,
  age DOUBLE PRECISION,
  gender TEXT CHECK (gender IN ('male', 'female')),
  weight DOUBLE PRECISION,
  is_lactating BOOLEAN DEFAULT FALSE,
  daily_milk_yield DOUBLE PRECISION DEFAULT 0,
  pregnancy_status TEXT CHECK (pregnancy_status IN ('pregnant', 'dry', 'open', 'unknown')) DEFAULT 'unknown',
  profile_photo_path TEXT,
  additional_image_paths TEXT[] DEFAULT '{}',
  assigned_vet_id UUID REFERENCES vets(id) ON DELETE SET NULL,
  current_health_issues TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AUTHORIZED MEDICINES TABLE
CREATE TABLE IF NOT EXISTS authorized_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  dosage TEXT NOT NULL,
  route TEXT,
  frequency TEXT,
  duration_days INTEGER DEFAULT 1,
  withdrawal_period_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TREATMENTS TABLE
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE NOT NULL,
  vet_id UUID REFERENCES vets(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT,
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  treatment_start_date TIMESTAMPTZ DEFAULT NOW(),
  withdrawal_ends_on TIMESTAMPTZ,
  reminder_sent_farmer BOOLEAN DEFAULT FALSE,
  reminder_sent_authority BOOLEAN DEFAULT FALSE,
  prescription_path TEXT,
  report_paths TEXT[] DEFAULT '{}',
  is_withdrawal_completed BOOLEAN DEFAULT FALSE,
  is_flagged_violation BOOLEAN DEFAULT FALSE,
  violation_reason TEXT,
  status TEXT CHECK (status IN ('pending', 'diagnosed', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRESCRIBED MEDICINES
CREATE TABLE IF NOT EXISTS prescribed_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES authorized_medicines(id) ON DELETE CASCADE NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration_days INTEGER,
  withdrawal_period_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TREATMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS treatment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  preferred_vet_id UUID REFERENCES vets(id) ON DELETE SET NULL,
  assigned_vet_id UUID REFERENCES vets(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'assigned', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
  symptoms TEXT,
  photos TEXT[] DEFAULT '{}',
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONSUMER CHECKS TABLE
CREATE TABLE IF NOT EXISTS consumer_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  is_safe_milk BOOLEAN,
  is_safe_meat BOOLEAN,
  result_message TEXT
);

-- 9. WITHDRAWAL ALERTS TABLE
CREATE TABLE IF NOT EXISTS withdrawal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  safe_from TIMESTAMPTZ NOT NULL,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers(mobile);
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_vets_mobile ON vets(mobile);
CREATE INDEX IF NOT EXISTS idx_vets_user_id ON vets(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_farmer_id ON animals(farmer_id);
CREATE INDEX IF NOT EXISTS idx_animals_tag_number ON animals(tag_number);
CREATE INDEX IF NOT EXISTS idx_treatments_farmer_id ON treatments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_treatments_vet_id ON treatments(vet_id);
CREATE INDEX IF NOT EXISTS idx_treatments_animal_id ON treatments(animal_id);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);
CREATE INDEX IF NOT EXISTS idx_prescribed_medicines_treatment_id ON prescribed_medicines(treatment_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 11. ENABLE RLS
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescribed_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON farmers;
CREATE POLICY "service_role_all" ON farmers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON vets;
CREATE POLICY "service_role_all" ON vets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON animals;
CREATE POLICY "service_role_all" ON animals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON treatments;
CREATE POLICY "service_role_all" ON treatments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON prescribed_medicines;
CREATE POLICY "service_role_all" ON prescribed_medicines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON authorized_medicines;
CREATE POLICY "service_role_all" ON authorized_medicines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON treatment_requests;
CREATE POLICY "service_role_all" ON treatment_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON consumer_checks;
CREATE POLICY "service_role_all" ON consumer_checks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON withdrawal_alerts;
CREATE POLICY "service_role_all" ON withdrawal_alerts FOR ALL USING (true) WITH CHECK (true);

-- 12. AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_farmers ON farmers;
CREATE TRIGGER set_updated_at_farmers BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_vets ON vets;
CREATE TRIGGER set_updated_at_vets BEFORE UPDATE ON vets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_animals ON animals;
CREATE TRIGGER set_updated_at_animals BEFORE UPDATE ON animals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_treatments ON treatments;
CREATE TRIGGER set_updated_at_treatments BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_treatment_requests ON treatment_requests;
CREATE TRIGGER set_updated_at_treatment_requests BEFORE UPDATE ON treatment_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. AUTOMATED PROFILE SYNCHRONIZATION TRIGGER (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DONE!
