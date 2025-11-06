-- Company
INSERT INTO companies (id, name, locale, timezone, status, plan_code, subscription_status, current_period_start, current_period_end, billing_email)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Company', 'ru', 'Asia/Bishkek', 'active', 'pro', 'active', now(), now() + interval '30 days', 'demo@example.com')
ON CONFLICT (id) DO NOTHING;

-- User (password hash for 'demo1234')
INSERT INTO users (id, email, first_name, last_name, phone, password_hash, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'demo@demo.com', 'Demo', 'User', '+996555000001', '$2a$10$Y4hQkC4M7n1h4rI/8F1c8O3V2r2S7c0D2cCkQn3I7i5iKf1S8JqW6', now())
ON CONFLICT (id) DO NOTHING;

-- Role
INSERT INTO user_company_roles (id, user_id, company_id, role, invited_at)
VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'owner', now())
ON CONFLICT (id) DO NOTHING;

-- Guide
INSERT INTO guides (id, company_id, full_name, phone, is_active)
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Айя Гид', '+996555000002', true)
ON CONFLICT (id) DO NOTHING;

-- Hotel
INSERT INTO hotels (id, company_id, name, stars, phone)
VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Golden Beach', 4, '+996312000000')
ON CONFLICT (id) DO NOTHING;

-- Place
INSERT INTO places (id, company_id, name, type, country, region)
VALUES ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Бишкек', 'city', 'KG', 'Чуйская')
ON CONFLICT (id) DO NOTHING;

-- Template
INSERT INTO tour_templates (id, company_id, name, code, duration_days, description, created_at)
VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Issyk-Kul Weekend', 'IKW', 2, 'Шаблон тура на выходные', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_segments (id, template_id, sort_order, day_offset, seg_type, from_place_id, to_place_id)
VALUES (gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 1, 0, 'transfer', '66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666')
ON CONFLICT DO NOTHING;

INSERT INTO template_hotels (id, template_id, day_no, hotel_id, nights)
VALUES (gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 1, '55555555-5555-5555-5555-555555555555', 1)
ON CONFLICT DO NOTHING;

INSERT INTO template_itinerary (id, template_id, sort_order, title, body)
VALUES (gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 1, 'День 1', 'Прибытие и размещение')
ON CONFLICT DO NOTHING;

-- File
INSERT INTO files (id, company_id, path, filename, size_bytes, mime_type, visibility, uploaded_by, created_at)
VALUES ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'docs/', 'readme.txt', 10, 'text/plain', 'company', '22222222-2222-2222-2222-222222222222', now())
ON CONFLICT (id) DO NOTHING;

-- Driver & Vehicle
INSERT INTO drivers (id, company_id, full_name, phone, email, license_number, is_active)
VALUES ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Азамат Водитель', '+996555000003', 'driver@example.com', 'KG-123456', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, company_id, plate_number, brand, model, prod_year, seats, class, ownership)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'KG123ABC', 'Hyundai', 'County', 2018, 24, 'minibus', 'contractor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO driver_vehicle (driver_id, vehicle_id, is_primary, since)
VALUES ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, current_date)
ON CONFLICT DO NOTHING;

INSERT INTO driver_documents (id, driver_id, doc_type, number, issue_date)
VALUES (gen_random_uuid(), '99999999-9999-9999-9999-999999999999', 'license', 'KG-123456', current_date - 365)
ON CONFLICT DO NOTHING;

INSERT INTO driver_availability (id, driver_id, date_from, date_to, status)
VALUES (gen_random_uuid(), '99999999-9999-9999-9999-999999999999', current_date, current_date + 7, 'available')
ON CONFLICT DO NOTHING;

-- Tour
INSERT INTO tours (id, company_id, template_id, name, status, start_date, end_date, main_guide_id, created_at)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'Issyk-Kul 1-2 Dec', 'planned', current_date + 1, current_date + 2, '44444444-4444-4444-4444-444444444444', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO tour_hotels (id, tour_id, day_no, hotel_id, checkin, checkout)
VALUES (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '55555555-5555-5555-5555-555555555555', current_date + 1, current_date + 2)
ON CONFLICT DO NOTHING;

INSERT INTO tour_itinerary (id, tour_id, sort_order, title, body)
VALUES (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 'План', 'Выезд, размещение, ужин')
ON CONFLICT DO NOTHING;

INSERT INTO tour_checklist (id, tour_id, item_key, title, required, status)
VALUES (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pdf_ready', 'PDF-файлы готовы', true, 'todo')
ON CONFLICT DO NOTHING;

INSERT INTO tour_people (id, tour_id, full_name, phone, email, passport_no)
VALUES (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Тест Турист', '+996555000004', 'tourist@example.com', 'P1234567')
ON CONFLICT DO NOTHING;

-- Segment
INSERT INTO tour_segments (id, tour_id, sort_order, day_no, seg_type, from_place_id, to_place_id, starts_at, ends_at, distance_km, transport_type, manual_driver_full_name, manual_driver_phone, manual_vehicle_plate)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 1, 'transfer', '66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', now() + interval '1 day', now() + interval '1 day 3 hours', 250, 'minivan', 'Контрактный Водитель', '+996555000005', 'KG000XYZ')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tour_segment_drivers (id, tour_segment_id, driver_id, vehicle_id, role, snapshot_full_name, snapshot_phone, snapshot_vehicle_plate)
VALUES (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'primary', 'Азамат Водитель', '+996555000003', 'KG123ABC')
ON CONFLICT DO NOTHING;

-- Billing
INSERT INTO subscriptions (id, company_id, plan_code, status, started_at, current_period_start, current_period_end, price_cents, currency)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'pro', 'active', now(), now(), now() + interval '30 days', 1999, 'USD')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, company_id, subscription_id, invoice_number, amount_cents, currency, period_start, period_end, due_date, status)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'INV-0001', 1999, 'USD', now(), now() + interval '30 days', now() + interval '7 days', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, company_id, invoice_id, provider, provider_charge_id, amount_cents, currency, paid_at, status)
VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'stripe', 'ch_123', 1999, 'USD', now(), 'succeeded')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_webhooks (id, provider, payload, signature)
VALUES (gen_random_uuid(), 'stripe', '{}'::jsonb, 'sig_test')
ON CONFLICT DO NOTHING;

INSERT INTO company_usage_daily (date, company_id, guides_count, hotels_count, tours_count, files_bytes, active_users)
VALUES (current_date, '11111111-1111-1111-1111-111111111111', 1, 1, 1, 10, 1)
ON CONFLICT DO NOTHING;

INSERT INTO audit_log (id, company_id, actor_user_id, action, entity_type, entity_id, meta, created_at)
VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'seed', 'system', '11111111-1111-1111-1111-111111111111', '{}'::jsonb, now())
ON CONFLICT DO NOTHING;