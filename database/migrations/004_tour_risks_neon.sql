-- Упрощённая миграция для Neon (пошаговая)

-- Шаг 1: Создание таблицы
CREATE TABLE IF NOT EXISTS tour_risks (
  id SERIAL PRIMARY KEY,
  tour_id UUID NOT NULL,
  risk_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  due_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Шаг 2: Добавление constraints
ALTER TABLE tour_risks
  ADD CONSTRAINT fk_tour_risks_tour 
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE;

ALTER TABLE tour_risks
  ADD CONSTRAINT check_severity 
  CHECK (severity IN ('critical', 'warning', 'attention'));

ALTER TABLE tour_risks
  ADD CONSTRAINT check_status 
  CHECK (status IN ('open', 'resolved', 'ignored'));

-- Шаг 3: Индексы
CREATE INDEX IF NOT EXISTS idx_tour_risks_tour_id ON tour_risks(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_risks_status ON tour_risks(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_tour_risks_severity ON tour_risks(severity);
CREATE INDEX IF NOT EXISTS idx_tour_risks_type ON tour_risks(risk_type);
CREATE INDEX IF NOT EXISTS idx_tour_risks_due_at ON tour_risks(due_at) WHERE due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tour_risks_open_critical ON tour_risks(status, severity, due_at) 
  WHERE status = 'open' AND severity = 'critical';

-- Шаг 4: Функция автообновления
CREATE OR REPLACE FUNCTION update_tour_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Шаг 5: Триггер
DROP TRIGGER IF EXISTS trigger_tour_risks_updated_at ON tour_risks;
CREATE TRIGGER trigger_tour_risks_updated_at
  BEFORE UPDATE ON tour_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_risks_updated_at();

-- Шаг 6: Представление
CREATE OR REPLACE VIEW v_open_risks AS
SELECT 
  r.*,
  t.name as tour_name,
  t.start_date,
  t.end_date,
  t.status as tour_status,
  t.company_id,
  c.name as company_name,
  EXTRACT(EPOCH FROM (t.start_date - NOW())) / 3600 AS hours_to_departure
FROM tour_risks r
JOIN tours t ON r.tour_id = t.id
JOIN companies c ON t.company_id = c.id
WHERE r.status = 'open'
ORDER BY 
  CASE r.severity 
    WHEN 'critical' THEN 1
    WHEN 'warning' THEN 2
    WHEN 'attention' THEN 3
  END,
  r.due_at ASC NULLS LAST,
  r.created_at DESC;

-- Готово!
SELECT 'Migration completed successfully!' as result;
