-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  locale text DEFAULT 'ru',
  timezone text DEFAULT 'Asia/Bishkek',
  status text DEFAULT 'active' CHECK (status IN ('active','blocked')),
  plan_code text,
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('trialing','active','past_due','canceled','paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  auto_renew boolean DEFAULT true,
  billing_email text,
  billing_phone text,
  billing_company_name text,
  billing_tax_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  password_hash text,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- Global app admins
CREATE TABLE IF NOT EXISTS app_admins (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now()
);

-- User roles per company
CREATE TABLE IF NOT EXISTS user_company_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','coordinator','guide','readonly')),
  invited_by uuid,
  invited_at timestamptz DEFAULT now()
);

-- Guides
CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  telegram text,
  email text,
  languages text[],
  is_active boolean DEFAULT true,
  notes text
);

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  stars int,
  phone text,
  reception_phone text,
  meal_plan text,
  address text,
  checkin_from time,
  checkout_until time
);

-- Places
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text CHECK (type IN ('city','poi','airport','other')),
  country text,
  region text,
  lat numeric,
  lon numeric,
  address text
);

-- Tour templates
CREATE TABLE IF NOT EXISTS tour_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  duration_days int,
  description text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS template_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES tour_templates(id) ON DELETE CASCADE,
  sort_order int,
  day_offset int,
  seg_type text CHECK (seg_type IN ('transfer','excursion','free','other')),
  from_place_id uuid REFERENCES places(id),
  to_place_id uuid REFERENCES places(id),
  start_time time,
  end_time time,
  default_transport_type text CHECK (default_transport_type IN ('bus','minivan','car','none')),
  notes text
);

CREATE TABLE IF NOT EXISTS template_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES tour_templates(id) ON DELETE CASCADE,
  day_no int,
  hotel_id uuid REFERENCES hotels(id),
  nights int
);

CREATE TABLE IF NOT EXISTS template_itinerary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES tour_templates(id) ON DELETE CASCADE,
  sort_order int,
  title text,
  body text
);

-- Tours
CREATE TABLE IF NOT EXISTS tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id uuid,
  name text NOT NULL,
  status text DEFAULT 'planned' CHECK (status IN ('draft','planned','confirmed','active','completed','canceled')),
  start_date date,
  end_date date,
  coordinator_id uuid,
  main_guide_id uuid REFERENCES guides(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tour_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  day_no int,
  hotel_id uuid REFERENCES hotels(id),
  checkin date,
  checkout date,
  meal_plan_override text
);

CREATE TABLE IF NOT EXISTS tour_itinerary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  sort_order int,
  title text,
  body text
);

CREATE TABLE IF NOT EXISTS tour_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  item_key text,
  title text,
  required boolean DEFAULT false,
  weight int,
  status text DEFAULT 'todo' CHECK (status IN ('todo','done')),
  completed_by uuid,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS tour_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  file_id uuid,
  kind text CHECK (kind IN ('participants','rooming','seating','other')),
  title text
);

CREATE TABLE IF NOT EXISTS tour_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  passport_no text,
  room text,
  seat text,
  notes text
);

-- Files
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  path text,
  filename text,
  size_bytes bigint,
  mime_type text,
  visibility text DEFAULT 'private' CHECK (visibility IN ('private','company','public')),
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Drivers & Vehicles
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  telegram text,
  email text,
  birth_date date,
  citizenship text,
  languages text[],
  license_number text,
  license_classes text[],
  license_issued_at date,
  license_expires_at date,
  national_id_or_passport text,
  passport_issued_at date,
  passport_expires_at date,
  rating numeric(2,1) DEFAULT 5.0,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate_number text NOT NULL,
  brand text,
  model text,
  prod_year int,
  color text,
  seats int,
  class text CHECK (class IN ('bus','minibus','van','sedan','suv','other')),
  ownership text CHECK (ownership IN ('company','contractor','driver')),
  vin text,
  insurance_number text,
  insurance_expires_at date,
  inspection_expires_at date,
  notes text
);

CREATE TABLE IF NOT EXISTS driver_vehicle (
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  since date,
  until date,
  PRIMARY KEY (driver_id, vehicle_id)
);

CREATE TABLE IF NOT EXISTS driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  doc_type text CHECK (doc_type IN ('license','passport','med_cert','insurance','other')),
  number text,
  issue_date date,
  expiry_date date,
  file_id uuid,
  notes text
);

CREATE TABLE IF NOT EXISTS driver_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  date_from date,
  date_to date,
  status text CHECK (status IN ('available','booked','vacation','sick')),
  note text
);

-- Tour segments
CREATE TABLE IF NOT EXISTS tour_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  sort_order int,
  day_no int,
  seg_type text CHECK (seg_type IN ('transfer','excursion','free','other')),
  from_place_id uuid REFERENCES places(id),
  to_place_id uuid REFERENCES places(id),
  starts_at timestamptz,
  ends_at timestamptz,
  distance_km numeric,
  transport_type text CHECK (transport_type IN ('bus','minivan','car','none')),
  notes text,
  manual_driver_full_name text,
  manual_driver_phone text,
  manual_vehicle_plate text,
  manual_vehicle_desc text
);

CREATE TABLE IF NOT EXISTS tour_segment_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_segment_id uuid NOT NULL REFERENCES tour_segments(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES drivers(id),
  vehicle_id uuid REFERENCES vehicles(id),
  role text DEFAULT 'primary' CHECK (role IN ('primary','assistant')),
  snapshot_full_name text,
  snapshot_phone text,
  snapshot_vehicle_plate text,
  snapshot_vehicle_desc text,
  UNIQUE (tour_segment_id, role)
);

-- Billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_code text,
  status text,
  started_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  seats_limit int,
  price_cents int,
  currency text,
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number text,
  amount_cents int,
  currency text,
  period_start timestamptz,
  period_end timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  status text,
  hosted_invoice_url text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  provider text,
  provider_charge_id text,
  amount_cents int,
  currency text,
  paid_at timestamptz,
  status text,
  receipt_url text,
  failure_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text,
  payload jsonb,
  signature text,
  received_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_usage_daily (
  date date,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  guides_count int DEFAULT 0,
  hotels_count int DEFAULT 0,
  tours_count int DEFAULT 0,
  files_bytes bigint DEFAULT 0,
  active_users int DEFAULT 0,
  PRIMARY KEY (date, company_id)
);

-- Audit
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  actor_user_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);
