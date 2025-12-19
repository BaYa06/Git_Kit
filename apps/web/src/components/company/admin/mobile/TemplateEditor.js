import { useState, useEffect, useMemo } from "react";
import base from "../../../../styles/admin/base.module.css";
import cards from "../../../../styles/admin/cards.module.css";
import tabs from "../../../../styles/admin/tabs.module.css";
import filters from "../../../../styles/admin/filters.module.css";
import guidesStyles from "../../../../styles/admin/guides.module.css";
import hotelsStyles from "../../../../styles/admin/hotels.module.css";
import transportStyles from "../../../../styles/admin/transport.module.css";
import templatesStyles from "../../../../styles/admin/templates.module.css";
import editorStyles from "../../../../styles/admin/editor.module.css";

const s = {
  ...base,
  ...cards,
  ...tabs,
  ...filters,
  ...guidesStyles,
  ...hotelsStyles,
  ...transportStyles,
  ...templatesStyles,
  ...editorStyles,
};

const COMPONENT_LABELS = {
  transport: "Транспорт",
  hotel: "Отель",
  guide: "Гид",
};

export default function TemplateEditor({
  companyId,
  templateId,
  onClose,
  onSaved,
  mode = "template", // 'template' | 'tour'
}) {
  const isTourMode = mode === "tour";
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active"); // active | draft
  const [components, setComponents] = useState([]);
  const [activeTab, setActiveTab] = useState("general"); // <--- ЭТО НУЖНО
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  const handleAddComponent = (type) => {
    setComponents((prev) => [
        ...prev,
        {
        id: `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type,
        comment: "",
        },
    ]);
    setIsAddModalOpen(false);
    };

    const handleRemoveComponent = (id) => {
        setComponents((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSave = async () => {
        setError(null);

        if (!name.trim()) {
            setError("Введите название шаблона");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
            template_id: templateId || null,
            company_id: companyId,
            name: name.trim(),
            status,
            start_date: startDate || null,
            end_date: endDate || null,
            components: components.map((c, index) => ({
                type: c.type,
                comment: c.comment || "",
                position: c.position || index + 1,
            })),
            };

            const url = templateId
            ? "/api/v1/company/templates/update"
            : "/api/v1/company/templates/create";

            const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            });

            if (!res.ok) {
            let data = {};
            try {
                data = await res.json();
            } catch (_) {}
            throw new Error(data.message || "Ошибка сохранения шаблона");
            }

            if (onSaved) onSaved();

        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            setIsSaving(false);
        }
        };


        useEffect(() => {
  if (!templateId) {
    setIsLoading(false);
    return;
  }

  const loadTemplate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/company/templates/${templateId}`);
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось загрузить шаблон");
      }
      const data = await res.json();
      const t = data.template;
      setName(t.name || "");
      setStatus(t.status || "active");
      setStartDate(t.start_date ? t.start_date.slice(0, 10) : "");
      setEndDate(t.end_date ? t.end_date.slice(0, 10) : "");
      setComponents(
        (t.components || []).map((c) => ({
          id: c.id,
          type: c.type || "transport",
          comment: c.comment || "",
          position: c.position || 1,
        }))
      );
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  loadTemplate();
}, [templateId]);



  return (
    <div className={s.templateEditor}>
      {/* Верхняя панель */}
      <header className={s.templateEditorHeader}>
        <button
            type="button"
            onClick={onClose}
            className={s.templateEditorBackButton}
        >
            <span className="text-lg leading-none">←</span>
        </button>

        <h1 className={s.templateEditorTitle}>
            {isTourMode ? "Новый тур" : "Шаблон тура"}
        </h1>

        <button
            type="button"
            onClick={handleSave}
            className={s.templateEditorSaveButton}
        >
            Сохранить
        </button>
      </header>


      {/* Основные поля */}
      <div className={s.templateEditorBody}>
        <label className={s.templateEditorField}>
          <span className={s.templateFieldLabel}>{isTourMode ? "Название тура" : "Название шаблона"}</span>
          <input
            type="text"
            className={s.templateEditorInput}
            placeholder="Например: Тур по Швейцарии"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
        </label>

        <div className={s.templateEditorDatesRow}>
          <label className={s.templateEditorField}>
            <span className={s.templateEditorLabel}>Старт</span>
            <input
                type="date"
                className={s.templateEditorInput}
                value={startDate}
                placeholder="дд.мм.гггг"
                onChange={(e) => setStartDate(e.target.value)}
                />
          </label>
          <label className={s.templateEditorField}>
            <span className={s.templateEditorLabel}>Конец</span>
            <input
                type="date"
                className={s.templateEditorInput}
                value={endDate}
                placeholder="дд.мм.гггг"
                onChange={(e) => setEndDate(e.target.value)}
                />
          </label>
        </div>

        {!isTourMode && (
            <div className={s.templateEditorTagsRow}>
                <button
                    type="button"
                    className={`${s.templateTag} ${
                    status === "active" ? s.templateTagActive : ""
                    }`}
                    onClick={() => setStatus("active")}
                >
                    Активный
                </button>

                <button
                    type="button"
                    className={`${s.templateTag} ${
                    status === "draft" ? s.templateTagDraftActive : ""
                    }`}
                    onClick={() => setStatus("draft")}
                >
                    Черновик
                </button>
            </div>
        )}
      </div>

      {/* Табы */}
      <div className={s.templateEditorTabs}>
        <button
          type="button"
          className={`${s.templateEditorTab} ${
            activeTab === "general" ? s.templateEditorTabActive : ""
          }`}
          onClick={() => setActiveTab("general")}
        >
          Общая информация
        </button>
        <button
          type="button"
          className={`${s.templateEditorTab} ${
            activeTab === "tourists" ? s.templateEditorTabActive : ""
          }`}
          onClick={() => setActiveTab("tourists")}
        >
          Туристы
        </button>
      </div>

      {/* Контент вкладок */}
      <div className={s.templateEditorContent}>
        {activeTab === "general" && (
          <>
            {/* Динамически добавленные компоненты */}
            {components.map((item) => (
                <details
                    className={s.templateAccordion}
                    open
                    key={item.id}
                >
                    <summary className={s.templateAccordionSummary}>
                    <span className={s.templateAccordionTitle}>
                        {COMPONENT_LABELS[item.type] || "Компонент"}
                    </span>
                    <span className={s.templateAccordionIcon}>⌄</span>
                    </summary>

                    <div className={s.templateAccordionControls}>
                    <input
                        type="text"
                        className={s.templateAccordionInput}
                        placeholder={
                            COMPONENT_LABELS[item.type]
                            ? `Комментарий: ${COMPONENT_LABELS[item.type]}`
                            : "Комментарий"
                        }
                        value={item.comment}
                        onChange={(e) => {
                            const val = e.target.value;
                            setComponents((prev) =>
                            prev.map((c) =>
                                c.id === item.id ? { ...c, comment: val } : c
                            )
                            );
                        }}
                        />

                        <select
                        className={s.templateAccordionSelect}
                        value={item.type}
                        onChange={(e) => {
                            const val = e.target.value;
                            setComponents((prev) =>
                            prev.map((c) =>
                                c.id === item.id ? { ...c, type: val } : c
                            )
                            );
                        }}
                        >
                        <option value="transport">Транспорт</option>
                        <option value="hotel">Отель</option>
                        <option value="guide">Гид</option>
                        </select>
                    </div>

                    <div className={s.templateAccordionFooter}>
                    <button
                        type="button"
                        className={s.templateAccordionDelete}
                        onClick={() => handleRemoveComponent(item.id)}
                        >
                        Удалить
                        </button>
                    </div>
                </details>
                ))}

            {/* Кнопка "Добавьте новый компонент" */}
            <button
              type="button"
              className={s.templateEditorEmptyBlock}
              onClick={() => setIsAddModalOpen(true)}
            >
              <div>
                <p className={s.templateEditorEmptyTitle}>
                  Добавьте новый компонент
                </p>
                <p className={s.templateEditorEmptyText}>
                  Начните заполнять шаблон тура, добавив транспорт, отель и гида.
                </p>
              </div>
            </button>
          </>
        )}

        {activeTab === "tourists" && (
          <div className={s.templateEditorEmpty}>
            <p className={s.templateEditorEmptyTitle}>Туристы</p>
            <p className={s.templateEditorEmptyText}>
              Здесь позже будет список туристов, привязанный к этому шаблону
              тура.
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно выбора компонента */}
      {isAddModalOpen && (
        <div className={s.templateModalBackdrop}>
          <div className={s.templateModal}>
            <div className={s.templateModalHeader}>
              <span className={s.templateModalTitle}>Добавить компонент</span>
              <button
                type="button"
                className={s.templateModalClose}
                onClick={() => setIsAddModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={s.templateModalBody}>
              <button
                type="button"
                className={s.templateModalOption}
                onClick={() => handleAddComponent("transport")}
              >
                Транспорт
              </button>
              <button
                type="button"
                className={s.templateModalOption}
                onClick={() => handleAddComponent("hotel")}
              >
                Отель
              </button>
              <button
                type="button"
                className={s.templateModalOption}
                onClick={() => handleAddComponent("guide")}
              >
                Гид
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
