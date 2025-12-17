-- Migration: Create tour_risks table for risk management
-- Description: Система обнаружения и отслеживания критических рисков по турам

-- Создание таблицы tour_risks
CREATE TABLE IF NOT EXISTS tour_risks (
  id SERIAL PRIMARY KEY,
  tour_id UUID NOT NULL,
  
  -- Тип и критичность риска
  risk_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'attention')),
  
  -- Описание риска
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Контекст риска (связанная сущность)
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,
  
  -- Временные метки
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  due_at TIMESTAMP,
  
  -- Дополнительные данные (JSON)
  metadata JSONB DEFAULT '{}',
  
  -- Статус
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  
  -- Аудит
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraint (отдельно для совместимости с Neon)
  CONSTRAINT fk_tour_risks_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX idx_tour_risks_tour_id ON tour_risks(tour_id);
CREATE INDEX idx_tour_risks_status ON tour_risks(status) WHERE status = 'open';
CREATE INDEX idx_tour_risks_severity ON tour_risks(severity);
CREATE INDEX idx_tour_risks_type ON tour_risks(risk_type);
CREATE INDEX idx_tour_risks_due_at ON tour_risks(due_at) WHERE due_at IS NOT NULL AND status = 'open';

-- Composite index для фильтрации открытых критических рисков
CREATE INDEX idx_tour_risks_open_critical ON tour_risks(status, severity, due_at) 
  WHERE status = 'open' AND severity = 'critical';

-- Функция автообновления updated_at
CREATE OR REPLACE FUNCTION update_tour_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автообновления updated_at
CREATE TRIGGER trigger_tour_risks_updated_at
  BEFORE UPDATE ON tour_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tour_risks_updated_at();

-- Комментарии к таблице и колонкам
COMMENT ON TABLE tour_risks IS 'Критические риски и проблемы по турам';
COMMENT ON COLUMN tour_risks.risk_type IS 'Тип риска: missing_guide, vehicle_conflict, payment_overdue, low_rating и т.д.';
COMMENT ON COLUMN tour_risks.severity IS 'Уровень критичности: critical (критично), warning (важно), attention (внимание)';
COMMENT ON COLUMN tour_risks.title IS 'Краткое описание риска для UI';
COMMENT ON COLUMN tour_risks.description IS 'Детальное описание проблемы';
COMMENT ON COLUMN tour_risks.related_entity_type IS 'Тип связанной сущности (для быстрого перехода в UI)';
COMMENT ON COLUMN tour_risks.related_entity_id IS 'ID связанной сущности';
COMMENT ON COLUMN tour_risks.metadata IS 'JSON с дополнительными данными: текущие значения, лимиты, контекст';
COMMENT ON COLUMN tour_risks.due_at IS 'Дедлайн решения проблемы (обычно время выезда тура)';
COMMENT ON COLUMN tour_risks.status IS 'Статус: open (открыт), resolved (решён), ignored (игнорируется)';

-- Представление для быстрого получения открытых рисков с данными тура
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

COMMENT ON VIEW v_open_risks IS 'Представление открытых рисков с данными туров для дашборда';
