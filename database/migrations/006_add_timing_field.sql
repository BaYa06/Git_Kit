-- Migration: Add timing field to tour_templates
-- Date: 2025-12-22
-- Description: Adds JSONB field for storing tour timing/schedule data

-- Добавляем поле timing для хранения расписания тура
ALTER TABLE tour_templates 
ADD COLUMN IF NOT EXISTS timing JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tour_templates.timing IS 'Tour timing schedule stored as JSON array of days with events';

-- Добавляем поле status если его нет
ALTER TABLE tour_templates 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'));

-- Добавляем поле updated_at если его нет
ALTER TABLE tour_templates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
