-- Basic seed with 1 row per table where reasonable

-- Company
INSERT INTO companies (id, name, locale, timezone, status, plan_code, subscription_status, current_period_start, current_period_end, billing_email)
VALUES (gen_random_uuid(), 'Demo Company', 'ru', 'Asia/Bishkek', 'active', 'pro', 'active', now(), now() + interval '30 days', 'demo@example.com')
RETURNING id
\gset

-- User
INSERT INTO users (id, email, first_name, last_name, phone, password_hash, created_at)
VALUES (gen_random_uuid(), 'demo@demo.com', 'Demo', 'User', '+996555000001', '$2a$10$Y4hQkC4M7n1h4rI/8F1c8O3V2r2S7c0D2cCkQn3I7i5iKf1S8JqW6', now())  -- password: demo1234
RETURNING id
\gset

-- Role
INSERT INTO user_company_roles (id, user_id, company_id, role, invited_at)
VALUES (gen_random_uuid(), :'users_id', :'companies_id', 'owner', now());

-- Guide
INSERT INTO guides (id, company_id, full_name, phone, is_active)
VALUES (gen_random_uuid(), :'companies_id', 'Айя Гид', '+996555000002', true)
RETURNING id
\gset

-- Hotel
INSERT INTO hotels (id, company_id, name, stars, phone)
VALUES (gen_random_uuid(), :'companies_id', 'Golden Beach', 4, '+996312000000')
RETURNING id
\gset

-- Place
INSERT INTO places (id, company_id, name, type, country, region)
VALUES (gen_random_uuid(), :'companies_id', 'Бишкек', 'city', 'KG', 'Чуйская')
RETURNING id
\gset

-- Template
INSERT INTO tour_templates (id, company_id, name, code, duration_days, description, created_at)
VALUES (gen_random_uuid(), :'companies_id', 'Issyk-Kul Weekend', 'IKW', 2, 'Шаблон тура на выходные', now())
RETURNING id
\gset

INSERT INTO template_segments (id, template_id, sort_order, day_offset, seg_type, from_place_id, to_place_id)
VALUES (gen_random_uuid(), :'tour_templates_id', 1, 0, 'transfer', :'places_id', :'places_id');

INSERT INTO template_hotels (id, template_id, day_no, hotel_id, nights)
VALUES (gen_random_uuid(), :'tour_templates_id', 1, :'hotels_id', 1);

INSERT INTO template_itinerary (id, template_id, sort_order, title, body)
VALUES (gen_random_uuid(), :'tour_templates_id', 1, 'День 1', 'Прибытие и размещение');

-- Files bucket placeholder row
INSERT INTO files (id, company_id, path, filename, size_bytes, mime_type, visibility, uploaded_by, created_at)
VALUES (gen_random_uuid(), :'companies_id', 'docs/', 'readme.txt', 10, 'text/plain', 'company', :'users_id', now())
RETURNING id
\gset

-- Driver & Vehicle
INSERT INTO drivers (id, company_id, full_name, phone, email, license_number, is_active)
VALUES (gen_random_uuid(), :'companies_id', 'Азамат Водитель', '+996555000003', 'driver@example.com', 'KG-123456', true)
RETURNING id
\gset

INSERT INTO vehicles (id, company_id, plate_number, brand, model, prod_year, seats, class, ownership)
VALUES (gen_random_uuid(), :'companies_id', 'KG123ABC', 'Hyundai', 'County', 2018, 24, 'minibus', 'contractor')
RETURNING id
\gset

INSERT INTO driver_vehicle (driver_id, vehicle_id, is_primary, since)
VALUES (:'drivers_id', :'vehicles_id', true, current_date);

INSERT INTO driver_documents (id, driver_id, doc_type, number, issue_date)
VALUES (gen_random_uuid(), :'drivers_id', 'license', 'KG-123456', current_date - 365);

INSERT INTO driver_availability (id, driver_id, date_from, date_to, status)
VALUES (gen_random_uuid(), :'drivers_id', current_date, current_date + 7, 'available');

-- Tour
INSERT INTO tours (id, company_id, template_id, name, status, start_date, end_date, main_guide_id, created_at)
VALUES (gen_random_uuid(), :'companies_id', :'tour_templates_id', 'Issyk-Kul 1-2 Dec', 'planned', current_date + 1, current_date + 2, :'guides_id', now())
RETURNING id
\gset

INSERT INTO tour_hotels (id, tour_id, day_no, hotel_id, checkin, checkout)
VALUES (gen_random_uuid(), :'tours_id', 1, :'hotels_id', current_date + 1, current_date + 2);

INSERT INTO tour_itinerary (id, tour_id, sort_order, title, body)
VALUES (gen_random_uuid(), :'tours_id', 1, 'План', 'Выезд, размещение, ужин');

INSERT INTO tour_checklist (id, tour_id, item_key, title, required, status)
VALUES (gen_random_uuid(), :'tours_id', 'pdf_ready', 'PDF-файлы готовы', true, 'todo');

INSERT INTO tour_people (id, tour_id, full_name, phone, email, passport_no)
VALUES (gen_random_uuid(), :'tours_id', 'Тест Турист', '+996555000004', 'tourist@example.com', 'P1234567');

-- Tour Segment
INSERT INTO tour_segments (id, tour_id, sort_order, day_no, seg_type, from_place_id, to_place_id, starts_at, ends_at, transport_type, manual_driver_full_name, manual_driver_phone, manual_vehicle_plate)
VALUES (gen_random_uuid(), :'tours_id', 1, 1, 'transfer', :'places_id', :'places_id', now() + interval '1 day', now() + interval '1 day 3 hours', 'minivan', 'Контрактный Водитель', '+996555000005', 'KG000XYZ')
RETURNING id
\gset

INSERT INTO tour_segment_drivers (id, tour_segment_id, driver_id, vehicle_id, role, snapshot_full_name, snapshot_phone, snapshot_vehicle_plate)
VALUES (gen_random_uuid(), :'tour_segments_id', :'drivers_id', :'vehicles_id', 'primary', 'Азамат Водитель', '+996555000003', 'KG123ABC');

-- Billing
INSERT INTO subscriptions (id, company_id, plan_code, status, started_at, current_period_start, current_period_end, price_cents, currency)
VALUES (gen_random_uuid(), :'companies_id', 'pro', 'active', now(), now(), now() + interval '30 days', 1999, 'USD')
RETURNING id
\gset

INSERT INTO invoices (id, company_id, subscription_id, invoice_number, amount_cents, currency, period_start, period_end, due_date, status)
VALUES (gen_random_uuid(), :'companies_id', :'subscriptions_id', 'INV-0001', 1999, 'USD', now(), now() + interval '30 days', now() + interval '7 days', 'open')
RETURNING id
\gset

INSERT INTO payments (id, company_id, invoice_id, provider, provider_charge_id, amount_cents, currency, paid_at, status)
VALUES (gen_random_uuid(), :'companies_id', :'invoices_id', 'stripe', 'ch_123', 1999, 'USD', now(), 'succeeded');

INSERT INTO payment_webhooks (id, provider, payload, signature)
VALUES (gen_random_uuid(), 'stripe', '{}'::jsonb, 'sig_test');

INSERT INTO company_usage_daily (date, company_id, guides_count, hotels_count, tours_count, files_bytes, active_users)
VALUES (current_date, :'companies_id', 1, 1, 1, 10, 1);

INSERT INTO audit_log (id, company_id, actor_user_id, action, entity_type, entity_id, meta)
VALUES (gen_random_uuid(), :'companies_id', :'users_id', 'seed', 'system', :'companies_id', '{}'::jsonb);
