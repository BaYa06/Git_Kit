-- Migration: Add admin_id to tour_guests
-- Description: сохраняем пользователя (admin) добавившего главного туриста

ALTER TABLE tour_guests
  ADD COLUMN IF NOT EXISTS admin_id uuid;

ALTER TABLE tour_guests
  ADD CONSTRAINT tour_guests_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tour_guests_admin_idx ON tour_guests(admin_id);
