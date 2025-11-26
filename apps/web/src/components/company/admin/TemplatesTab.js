import { useState, useMemo } from "react";
import s from "../../../styles/admin.module.css";
import { Copy, CalendarCheck, Route, Search, Trash2 } from "lucide-react";

export default function TemplatesTab({
  templates,
  loading,
  error,
  onOpenTemplate,
  onCopyTemplate,
  onDeleteTemplate,
}) {
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates || [];
    return (templates || []).filter((t) =>
      (t.name || "").toLowerCase().includes(q)
    );
  }, [templates, query]);

  return (
    <div className={s.templatesList}>
      {/* ПОИСК */}
      <div className={s.searchWrapper}>
        <span className={s.searchIcon}>
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Поиск"
          className={s.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* СТАТУСЫ */}
      {loading && (
        <p className={s.templatesLoading}>Загрузка шаблонов…</p>
      )}

      {error && !loading && (
        <p className={s.templatesError}>{error}</p>
      )}

      {!loading && !error && filteredTemplates.length === 0 && (
        <div className={s.templatesEmpty}>
          <p className={s.templatesEmptyTitle}>Шаблонов пока нет</p>
          <p className={s.templatesEmptyText}>
            Создайте первый шаблон, нажав на кнопку «+».
          </p>
        </div>
      )}

      {/* СПИСОК ШАБЛОНОВ */}
      {!loading &&
        !error &&
        filteredTemplates.length > 0 &&
        filteredTemplates.map((tpl) => (
          <div key={tpl.id} className={s.templateCard}>
            <div className={s.templateCardBody}>
              <div className={s.templateHeader}>
                <p className={s.templateTitle}>{tpl.name}</p>

                <div
                  className={`${s.templateStatus} ${
                    tpl.status === "draft"
                      ? s.templateStatusDraft
                      : s.templateStatusActive
                  }`}
                >
                  <span
                    className={s.templateStatusDot}
                    style={{
                      backgroundColor:
                        tpl.status === "draft" ? "#eab308" : "#22c55e",
                    }}
                  />
                  <span>
                    {tpl.status === "draft" ? "Черновик" : "Активен"}
                  </span>
                </div>
              </div>

              <div className={s.templateMetaRow}>
                <div className={s.templateMetaItem}>
                  <span
                    className={`material-symbols-outlined ${s.templateMetaIcon}`}
                  >
                    <CalendarCheck
                      className={`w-4 h-4 ${s.icons_color_grey}`}
                    />
                  </span>
                  <span>
                    {(tpl.days ?? 0)} дней / {(tpl.nights ?? 0)} ночей
                  </span>
                </div>
                <div className={s.templateMetaItem}>
                  <span
                    className={`material-symbols-outlined ${s.templateMetaIcon}`}
                  >
                    <Route
                      className={`w-4 h-4 ${s.icons_color_grey}`}
                    />
                  </span>
                  <span>{tpl.segments ?? 0} сегментов</span>
                </div>
              </div>
            </div>

            <div className={s.templateActionsRow}>
              {/* УДАЛИТЬ */}
              <button
                type="button"
                className={s.templateSecondaryButton}
                onClick={() =>
                  onDeleteTemplate && onDeleteTemplate(tpl.id)
                }
              >
                <span
                  className={`material-symbols-outlined ${s.templateButtonIcon}`}
                >
                  <Trash2
                    className={`w-4 h-4 ${s.icons_color_grey}`}
                  />
                </span>
                <span>Удалить</span>
              </button>

              {/* ДУБЛИРОВАТЬ */}
              <button
                type="button"
                className={s.templateSecondaryButton}
                onClick={() => onCopyTemplate && onCopyTemplate(tpl.id)}
              >
                <span
                  className={`material-symbols-outlined ${s.templateButtonIcon}`}
                >
                  <Copy
                    className={`w-4 h-4 ${s.icons_color_grey}`}
                  />
                </span>
                <span>Дублировать</span>
              </button>

              {/* ОТКРЫТЬ */}
              <button
                type="button"
                className={s.templatePrimaryButton}
                onClick={() => onOpenTemplate && onOpenTemplate(tpl.id)}
              >
                <span>Открыть</span>
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
