import s from "../../../styles/admin.module.css";
import { Copy, CalendarCheck, Route, Search } from "lucide-react";

export default function TemplatesTab() {
  return (
    
    <div className={s.templatesList}>
        {/* ПОИСК (плейсхолдер меняется для Отелей) */}
        <div className={s.searchWrapper}>
            <span className={s.searchIcon}>
                <Search className="w-4 h-4" />
            </span>
            <input
                type="text"
                placeholder="Поиск"
                className={s.searchInput}
            />
        </div>

      {/* Карточка 1 — Классический тур по Италии (Активен) */}
      <div className={s.templateCard}>
        <div className={s.templateCardBody}>
          <div className={s.templateHeader}>
            <p className={s.templateTitle}>Классический тур по Италии</p>
            <div className={`${s.templateStatus} ${s.templateStatusActive}`}>
              <span
                className={s.templateStatusDot}
                style={{ backgroundColor: "#22c55e" }}
              />
              <span>Активен</span>
            </div>
          </div>

          <div className={s.templateMetaRow}>
            <div className={s.templateMetaItem}>
              <span
                className={`material-symbols-outlined ${s.templateMetaIcon}`}
              >
                <CalendarCheck className={`w-4 h-4 ${s.icons_color_grey}`} />
              </span>
              <span>10 дней / 9 ночей</span>
            </div>
            <div className={s.templateMetaItem}>
              <span
                className={`material-symbols-outlined ${s.templateMetaIcon}`}
              >
                <Route className={`w-4 h-4 ${s.icons_color_grey}`} />
              </span>
              <span>12 сегментов</span>
            </div>
          </div>
        </div>

        <div className={s.templateActionsRow}>
          <button type="button" className={s.templateSecondaryButton}>
            <span
              className={`material-symbols-outlined ${s.templateButtonIcon}`}
            >
              <Copy className={`w-4 h-4 ${s.icons_color_grey}`} />
            </span>
            <span>Дублировать</span>
          </button>
          <button type="button" className={s.templatePrimaryButton}>
            <span>Открыть</span>
          </button>
        </div>
      </div>

      {/* Карточка 2 — Альпийское приключение (Черновик) */}
      <div className={s.templateCard}>
        <div className={s.templateCardBody}>
          <div className={s.templateHeader}>
            <p className={s.templateTitle}>Альпийское приключение</p>
            <div className={`${s.templateStatus} ${s.templateStatusDraft}`}>
              <span
                className={s.templateStatusDot}
                style={{ backgroundColor: "#eab308" }}
              />
              <span>Черновик</span>
            </div>
          </div>

          <div className={s.templateMetaRow}>
            <div className={s.templateMetaItem}>
              <span
                className={`material-symbols-outlined ${s.templateMetaIcon}`}
              >
                <CalendarCheck className={`w-4 h-4 ${s.icons_color_grey}`} />
              </span>
              <span>7 дней / 6 ночей</span>
            </div>
            <div className={s.templateMetaItem}>
              <span
                className={`material-symbols-outlined ${s.templateMetaIcon}`}
              >
                <Route className={`w-4 h-4 ${s.icons_color_grey}`} />
              </span>
              <span>8 сегментов</span>
            </div>
          </div>
        </div>

        <div className={s.templateActionsRow}>
          <button type="button" className={s.templateSecondaryButton}>
            <span
              className={`material-symbols-outlined ${s.templateButtonIcon}`}
            >
              <Copy className={`w-4 h-4 ${s.icons_color_grey}`} />
            </span>
            <span>Дублировать</span>
          </button>
          <button type="button" className={s.templatePrimaryButton}>
            <span>Открыть</span>
          </button>
        </div>
      </div>

      {/* Карточка 3 — Сокровища Азии (Активен) */}
      <div className={s.templateCard}>
        <div className={s.templateCardBody}>
          <div className={s.templateHeader}>
            <p className={s.templateTitle}>Сокровища Азии</p>
            <div className={`${s.templateStatus} ${s.templateStatusActive}`}>
              <span
                className={s.templateStatusDot}
                style={{ backgroundColor: "#22c55e" }}
              />
              <span>Активен</span>
            </div>
          </div>

          <div className={s.templateMetaRow}>
            <div className={s.templateMetaItem}>
              <span
                className={`material-symbols-outlined ${s.templateMetaIcon}`}
              >
                <CalendarCheck className={`w-4 h-4 ${s.icons_color_grey}`} />
              </span>
              <span>14 дней / 13 ночей</span>
            </div>
            <div className={s.templateMetaItem}>
              <span
                className={`material-symbols-outlined ${s.templateMetaIcon}`}
              >
                <Route className={`w-4 h-4 ${s.icons_color_grey}`} />
              </span>
              <span>15 сегментов</span>
            </div>
          </div>
        </div>

        <div className={s.templateActionsRow}>
          <button type="button" className={s.templateSecondaryButton}>
            <span
              className={`material-symbols-outlined ${s.templateButtonIcon}`}
            >
              <Copy className={`w-4 h-4 ${s.icons_color_grey}`} />
            </span>
            <span>Дублировать</span>
          </button>
          <button type="button" className={s.templatePrimaryButton}>
            <span>Открыть</span>
          </button>
        </div>
      </div>
    </div>
  );
}
