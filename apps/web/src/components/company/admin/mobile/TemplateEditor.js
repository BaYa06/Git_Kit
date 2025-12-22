import { useState, useEffect, useMemo } from "react";
import TimingTab from "./TimingTab";
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
  const [timing, setTiming] = useState([]); // timing days data
  const [activeTab, setActiveTab] = useState("general"); // <--- ЭТО НУЖНО
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
            timing: timing || [],
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

            setSuccessMessage("Шаблон успешно сохранен!");
            setTimeout(() => setSuccessMessage(null), 3000);
            
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
      setTiming(t.timing || []);
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
            disabled={isSaving}
            className={s.templateEditorSaveButton}
            style={{ opacity: isSaving ? 0.7 : 1 }}
        >
            {isSaving ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Сохранение...
                </span>
            ) : (
                "Сохранить"
            )}
        </button>
      </header>


      {/* Основные поля */}
      <div className={s.templateEditorBody}>
        {/* Success Message */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 mb-4 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
            <span className="text-emerald-400 text-sm font-medium">{successMessage}</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
            <span className="text-red-400 text-sm font-medium">{error}</span>
          </div>
        )}
        
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

        {/* Даты только для режима тура, не для шаблона */}
        {isTourMode && (
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
        )}

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
        <button
          type="button"
          className={`${s.templateEditorTab} ${
            activeTab === "timing" ? s.templateEditorTabActive : ""
          }`}
          onClick={() => setActiveTab("timing")}
        >
          Тайминг
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

        {activeTab === "timing" && <TimingTab timing={timing} setTiming={setTiming} />}
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
