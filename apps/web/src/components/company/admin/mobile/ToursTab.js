import {
  Flag,
  Hotel,
  Users,
  Orbit,
  CircleCheck,
  CirclePause,
  Calendar1,
  CalendarCheck,
  ChevronDown,
  X,
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Star,
  Utensils,
  Search,
  MoreVertical,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import base from "../../../../styles/admin/base.module.css";
import cards from "../../../../styles/admin/cards.module.css";
import tabs from "../../../../styles/admin/tabs.module.css";
import filters from "../../../../styles/admin/filters.module.css";
import guidesStyles from "../../../../styles/admin/guides.module.css";
import hotelsStyles from "../../../../styles/admin/hotels.module.css";
import transportStyles from "../../../../styles/admin/transport.module.css";
import templatesStyles from "../../../../styles/admin/templates.module.css";
import editorStyles from "../../../../styles/admin/editor.module.css";
import touristsStyles from "../../../../styles/admin/tourists.module.css";
import { GuideTouristsMock } from "../../guide/Tours";

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
  ...touristsStyles,
};
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
const COMPONENT_LABELS = {
  transport: "Транспорт",
  hotel: "Отель",
  guide: "Гид",
};
const REVIEWS_MOCK = [
  {
    id: 1,
    name: "Иван Петров",
    initials: "ИП",
    date: "24.06.2024",
    time: "10:30",
    badge: { label: "Отзыв", color: "#2d65e6" },
    ratings: { tour: 5, transport: 5, guide: 5 },
    blocks: [
      {
        title: "Гид",
        text: "Отличный гид, все было интересно и познавательно.",
        score: 5,
      },
      {
        title: "Транспорт",
        text: "Транспорт был комфортным.",
        score: 5,
      },
      {
        title: "Тур",
        text: "Сам тур превзошел все ожидания. Обязательно порекомендую друзьям!",
        score: 5,
      },
    ],
  },
  {
    id: 2,
    name: "Анна Васильева",
    initials: "АВ",
    date: "22.06.2024",
    time: "12:45",
    badge: { label: "Via QR", color: "#10b981" },
    ratings: { tour: 5, transport: 3, guide: 5 },
    blocks: [
      {
        title: "Гид",
        text: "Гид — профессионал своего дела, рассказывал очень увлекательно.",
        score: 5,
      },
      {
        title: "Транспорт",
        text: "Автобус был немного старый.",
        score: 3,
      },
      {
        title: "Тур",
        text: "Тур понравился.",
        score: 5,
      },
    ],
  },
];

const formatTime = (t) => {
  if (!t) return null;
  const s = String(t);
  return s.slice(0, 5);
};

const renderStars = (stars) => {
  const n = parseInt(stars || 0, 10);
  if (!n || n <= 0) return null;
  const count = Math.min(Math.max(n, 1), 5);
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(<Star key={i} className="w-4 h-4" />);
  }
  return items;
};

const getAddressHref = (addr) => {
  if (!addr) return null;
  const trimmed = String(addr).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const encoded = encodeURIComponent(trimmed);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
};

const entityListsByType = (type, { guides = [], hotels = [], drivers = [] }) => {
  if (type === "guide") return guides;
  if (type === "hotel") return hotels;
  return drivers;
};

const entityLabelByType = (type) => {
  if (type === "guide") return "гид";
  if (type === "hotel") return "отель";
  return "транспорт";
};

function EntityPreview({ type, entity, comment }) {
  if (!entity) return null;

  const badgeLabel =
    type === "guide" ? "Гид" : type === "hotel" ? "Отель" : "Транспорт";
  const displayComment =
    (comment && String(comment).trim()) ||
    "";
  const phoneValue =
    entity.phone ||
    (type === "transport" ? entity.driver_phone : null) ||
    (type === "hotel" ? entity.reception_phone : null) ||
    "";

  if (type === "guide") {
    return (
      <div className={`${s.entityCard} ${s.entityCardGuide}`}>
        <div className={s.entityHeader}>
          <span className={s.entityBadge}>{badgeLabel}</span>
          {/* <button type="button" className={s.entityMenuBtn}>
            <MoreVertical className="w-4 h-4" />
          </button> */}
        </div>

        <div className={s.entityBody}>
          <div className={s.entityTitle}>{entity.full_name || entity.email || "Без имени"}</div>
          <div className={s.entityRow}>
            <span className={s.entityLabel}>Телефон</span>
            <span className={s.entityValue}>{entity.phone || "—"}</span>
          </div>
          <div className={s.entityRow}>
            <span className={s.entityLabel}>Email</span>
            <span className={s.entityValue}>{entity.email || "—"}</span>
          </div>
        </div>

        <div className={s.entityDivider} />
        <div className={s.entityComment}>
          {displayComment || "Без комментария"}
        </div>

        <div className={s.entityFooter}>
          <a
            className={`${s.entityCallBtn} ${!phoneValue ? s.entityCallBtnDisabled : ""}`}
            href={phoneValue ? `tel:${phoneValue}` : undefined}
            aria-disabled={!phoneValue}
          >
            <Phone className="w-4 h-4" />
            <span>Позвонить</span>
          </a>
        </div>
      </div>
    );
  }

  if (type === "transport") {
    return (
      <div className={`${s.entityCard} ${s.entityCardTransport}`}>
        <div className={s.entityHeader}>
          <span className={s.entityBadge}>{badgeLabel}</span>
          {/* <button type="button" className={s.entityMenuBtn}>
            <MoreVertical className="w-4 h-4" />
          </button> */}
        </div>

        <div className={s.entityBody}>
          <div className={s.entityTitle}>{entity.car_name || "Транспорт"}</div>
          <div className={s.entitySub}>{entity.plate_number || "—"}</div>

          <div className={s.entityRow}>
            <span className={s.entityLabel}>Водитель</span>
            <span className={s.entityValue}>{entity.full_name || "—"}</span>
          </div>
          <div className={s.entityRow}>
            <span className={s.entityLabel}>Телефон</span>
            <span className={s.entityValue}>{phoneValue || "—"}</span>
          </div>
          <div className={s.entityRow}>
            <span className={s.entityLabel}>Мест</span>
            <span className={s.entityValue}>{entity.seats || "—"}</span>
          </div>
        </div>

        <div className={s.entityDivider} />
        <div className={s.entityComment}>
          {displayComment || "Без комментария"}
        </div>

        <div className={s.entityFooter}>
          <a
            className={`${s.entityCallBtn} ${!phoneValue ? s.entityCallBtnDisabled : ""}`}
            href={phoneValue ? `tel:${phoneValue}` : undefined}
            aria-disabled={!phoneValue}
          >
            <Phone className="w-4 h-4" />
            <span>Позвонить</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${s.entityCard} ${s.entityCardHotel}`}>
      <div className={s.entityHeader}>
        <span className={s.entityBadge}>{badgeLabel}</span>
        {/* <button type="button" className={s.entityMenuBtn}>
          <MoreVertical className="w-4 h-4" />
        </button> */}
      </div>

      <div className={s.entityBody}>
        <div className={s.entityTitle}>{entity.name || "Отель"}</div>
        {entity.stars ? (
          <div className={s.entityStars}>{renderStars(entity.stars)}</div>
        ) : null}

        <div className={s.entityRow}>
          <span className={s.entityLabel}>Телефон</span>
          <span className={s.entityValue}>{entity.phone || "—"}</span>
        </div>
        <div className={s.entityRow}>
          <span className={s.entityLabel}>Адрес</span>
          <span className={s.entityValue}>
            {entity.address || "—"}
          </span>
        </div>
        {(entity.checkin_from || entity.checkout_until) && (
          <div className={s.entityRow}>
            <span className={s.entityLabel}>Заезд/выезд</span>
            <span className={s.entityValue}>
              Заезд с {formatTime(entity.checkin_from) || "14:00"} · Выезд до{" "}
              {formatTime(entity.checkout_until) || "12:00"}
            </span>
          </div>
        )}
      </div>

      <div className={s.entityDivider} />
      <div className={s.entityComment}>
        {displayComment || "Без комментария"}
      </div>

      <div className={s.entityFooter}>
        <a
          className={`${s.entityCallBtn} ${!phoneValue ? s.entityCallBtnDisabled : ""}`}
          href={phoneValue ? `tel:${phoneValue}` : undefined}
          aria-disabled={!phoneValue}
        >
          <Phone className="w-4 h-4" />
          <span>Позвонить</span>
        </a>
      </div>
    </div>
  );
}


const formatCents = (value) => {
  if (!Number.isFinite(value)) return "";
  return `${(value / 100).toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} с`;
};

const formatDateDisplay = (value) => {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const formatDateFriendly = (value) => {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

const parseMoneyToCents = (value) => {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^0-9.,-]/g, "");
  const normalized = cleaned.replace(/,/g, "");
  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
};

export default function ToursTab({ tours = [], onTourClick }) {
  const [listTab, setListTab] = useState("active"); // active | past
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | confirmed | planned
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredTours = useMemo(() => {
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00Z`).getTime() : null;
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59Z`).getTime() : null;
    const today = new Date();
    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

    const filtered = (tours || []).filter((t) => {
      // status filter
      if (statusFilter !== "all") {
        if (statusFilter === "confirmed") {
          if (!(t.status === "confirmed" || t.status === "active")) return false;
        } else if (statusFilter === "planned") {
          if (!(t.status === "planned" || t.status === "draft")) return false;
        }
      }

      const hasDate = !!t.start_date;
      const ts = hasDate ? new Date(`${t.start_date}T00:00:00Z`).getTime() : null;

      // tab filter: active vs past
      if (listTab === "active") {
        if (!hasDate) return false;
        if (Number.isFinite(ts) && ts < todayUTC) return false;
      } else if (listTab === "past") {
        if (!hasDate) return false;
        if (Number.isFinite(ts) && ts >= todayUTC) return false;
      }

      // date filter
      if (dateFrom || dateTo) {
        if (!hasDate) return false;
        if (Number.isFinite(fromTs) && ts < fromTs) return false;
        if (Number.isFinite(toTs) && ts > toTs) return false;
      }
      return true;
    });

    const withSort = [...filtered].sort((a, b) => {
      const tsA = a.start_date ? new Date(`${a.start_date}T00:00:00Z`).getTime() : null;
      const tsB = b.start_date ? new Date(`${b.start_date}T00:00:00Z`).getTime() : null;

      // Активные — от самого ближайшего будущего к более дальнему
      if (listTab === "active") {
        if (Number.isFinite(tsA) && Number.isFinite(tsB)) return tsA - tsB;
        if (Number.isFinite(tsA)) return -1;
        if (Number.isFinite(tsB)) return 1;
        return 0;
      }

      // Прошедшие — от самого недавнего прошедшего к более старым
      if (listTab === "past") {
        if (Number.isFinite(tsA) && Number.isFinite(tsB)) return tsB - tsA;
        if (Number.isFinite(tsA)) return -1;
        if (Number.isFinite(tsB)) return 1;
        return 0;
      }

      // Fallback
      if (Number.isFinite(tsA) && Number.isFinite(tsB)) return tsA - tsB;
      if (Number.isFinite(tsA)) return -1;
      if (Number.isFinite(tsB)) return 1;
      return 0;
    });

    // прошедшие — показываем только первые 100 ближайших, остальные скрываем
    if (listTab === "past") {
      return withSort.slice(0, 100);
    }

    return withSort;
  }, [tours, dateFrom, dateTo, statusFilter, listTab]);

  useEffect(() => {
    setPage(1);
  }, [listTab, dateFrom, dateTo, statusFilter, tours]);

  const totalPages = Math.max(1, Math.ceil((filteredTours.length || 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <div className={s.toursTabs}>
        <button
          type="button"
          className={`${s.toursTabBtn} ${
            listTab === "active" ? s.toursTabBtnActive : ""
          }`}
          onClick={() => setListTab("active")}
        >
          Активные
        </button>
        <button
          type="button"
          className={`${s.toursTabBtn} ${
            listTab === "past" ? s.toursTabBtnActive : ""
          }`}
          onClick={() => setListTab("past")}
        >
          Прошедшие
        </button>
      </div>

      <div className={s.toursFilters}>
        <div className={s.toursFiltersRow}>
          <label className={s.toursFilterField}>
            <span className={s.toursFilterLabel}>Период от</span>
            <input
              type="date"
              className={s.toursFilterInput}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className={s.toursFilterField}>
            <span className={s.toursFilterLabel}>Период до</span>
            <input
              type="date"
              className={s.toursFilterInput}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
        </div>

        <div className={s.toursStatusFilter}>
          <span className={s.toursStatusLabel}>Статус</span>
          <div className={s.toursStatusButtons}>
            <button
              type="button"
              className={`${s.toursStatusBtn} ${
                statusFilter === "all" ? s.toursStatusBtnActive : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              Все
            </button>
            <button
              type="button"
              className={`${s.toursStatusBtn} ${
                statusFilter === "planned" ? s.toursStatusBtnActive : ""
              }`}
              onClick={() => setStatusFilter("planned")}
            >
              Собирается
            </button>
            <button
              type="button"
              className={`${s.toursStatusBtn} ${
                statusFilter === "confirmed" ? s.toursStatusBtnActive : ""
              }`}
              onClick={() => setStatusFilter("confirmed")}
            >
              Подтвержденные
            </button>
          </div>
        </div>
      </div>

      {/* Все туры */}
      <h3 className={s.sectionHeading}>Все туры</h3>

      {(!filteredTours || filteredTours.length === 0) && (
        <div className={s.emptyState}>
          <p className={s.emptyTitle}>Туры не найдены</p>
          <p className={s.emptyText}>Создайте первый тур по шаблону.</p>
        </div>
      )}

      {paginatedTours && paginatedTours.length > 0 && (
        <div className={s.toursList}>
          {paginatedTours.map((t) => {
            const dateObj = t.start_date ? new Date(t.start_date) : null;
            const month = dateObj
              ? dateObj.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
              : "";
            const day = dateObj ? dateObj.getUTCDate() : "";
            const signed = Number.isFinite(t.tourists_signed)
              ? t.tourists_signed
              : 0;
            const needed = Number.isFinite(t.tourists_count)
              ? t.tourists_count
              : 0;
            const guides = Array.isArray(t.guide_names)
              ? t.guide_names.filter(Boolean)
              : [];
            const guideLabel = guides.length > 0 ? guides.join(", ") : "-";
            const status =
              t.status === "confirmed" || t.status === "active"
                ? "confirmed"
                : t.status === "planned" || t.status === "draft"
                ? "planned"
                : "other";

            return (
              <div
                className={s.tourItem}
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => onTourClick && onTourClick(t)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTourClick && onTourClick(t);
                  }
                }}
              >
                <div className={s.tourDate}>
                  <span className={s.tourMonth}>{month}</span>
                  <span className={s.tourDay}>{day}</span>
                </div>
                <div className={s.tourBody}>
                  <p className={s.tourTitle}>{t.name}</p>
                  <p className={s.tourMeta}>
                    Гид: {guideLabel}
                  </p>
                  <div
                    className={
                      status === "confirmed"
                        ? s.tour_position_confirmed
                        : s.tour_position_waiting
                    }
                  >
                    {status === "confirmed" ? (
                      <CircleCheck className={`w-4 h-4 ${s.icons_color_green}`} />
                    ) : (
                      <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
                    )}
                    <p className={s.tour_ready}>{t.status || "planned"}</p>
                  </div>
                </div>
                <div className={s.tourChevron}>
                  <div className={s.count_people}>
                    <Users className={`w-4 h-4 ${s.icons_color}`} />
                    <p className={s.people_count_number}>
                      {signed}/{needed}
                    </p>
                  </div>
                  <p className={s.people_count_right}>›</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredTours.length > PAGE_SIZE && (
        <div className={s.toursPagination}>
          <button
            type="button"
            className={s.toursPaginationBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </button>
          <span className={s.toursPaginationInfo}>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            type="button"
            className={s.toursPaginationBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </button>
        </div>
      )}
    </>
  );
}

export function TemplatePickerModal({
  open,
  templates,
  loading,
  error,
  onClose,
  onSelectTemplate,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center px-4">
      <div
        className={`w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5 ${s.add_card}`}
      >
        {/* Header: X слева и заголовок по центру */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex-1 text-center text-lg font-semibold text-slate-100">
            Выберите шаблон
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -ml-2 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <X className="w-5 h-5 text-slate-200" />
          </button>
          {/* Пустой блок для выравнивания заголовка по центру */}
          <span className="w-6" />
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="text-sm text-slate-400">Загружаем шаблоны...</p>
          )}

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && (!templates || templates.length === 0) && (
            <p className="text-sm text-slate-400">
              Пока нет шаблонов. Сначала создайте хотя бы один шаблон во вкладке
              «Шаблоны».
            </p>
          )}

          {!loading && !error && templates && templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTemplate && onSelectTemplate(tpl)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectTemplate && onSelectTemplate(tpl);
                    }
                  }}
                  className={`${s.templateCard} cursor-pointer`}
                >
                  <div className={s.templateCardBody}>
                    <div className={s.templateHeader}>
                      <p className={s.templateTitle}>
                        {tpl.name || "Без названия"}
                      </p>
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
                        <CalendarCheck
                          className={`w-4 h-4 ${s.icons_color_grey}`}
                        />
                        <span>
                          {(tpl.days ?? 0)} дней / {(tpl.nights ?? 0)} ночей
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectFromBase({
  type,
  guides = [],
  hotels = [],
  drivers = [],
  selectedId = "",
  onSelect,
  guideView = false,
  companyId = null,
  startDate = null,
}) {
  const [availability, setAvailability] = useState({});
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (type !== "guide" || !companyId || !startDate) {
        setAvailability({});
        return;
      }
      try {
        const res = await fetch(
          `/api/v1/guides/availability/date?company_id=${companyId}&date=${startDate}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data && data.statuses) {
          setAvailability(data.statuses);
        }
      } catch (e) {
        if (!ignore) setAvailability({});
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [type, companyId, startDate]);

  const list = entityListsByType(type, { guides, hotels, drivers }) || [];
  const selected =
    list.find((item) => String(item.id) === String(selectedId)) || null;

  const placeholder =
    type === "guide"
      ? "Выберите гида"
      : type === "hotel"
      ? "Выберите отель"
      : "Выберите транспорт";

  if (guideView) {
    return (
      <div style={{ marginTop: 4 }}>
        {selected ? (
          <EntityPreview type={type} entity={selected} comment={null} />
        ) : (
          <p className={s.templateEditorEmptyText}>Не выбрано</p>
        )}
      </div>
    );
  }

  return (
    <div className={s.templateEditorField}>
      <span className={s.templateEditorLabel}>{placeholder}</span>

      {list.length > 0 ? (
        <select
          className={s.templateAccordionSelect}
          value={selectedId || ""}
          onChange={(e) => onSelect && onSelect(e.target.value)}
        >
          <option value="">Не выбрано</option>
          {list.map((item) => {
            const status =
              type === "guide"
                ? availability[item.id] || "none"
                : "none";
            const prefix =
              status === "free"
                ? "🟢 "
                : status === "busy"
                ? "🔴 "
                : "⚪ ";
            return (
              <option key={item.id} value={item.id}>
                {prefix}
                {type === "guide"
                  ? item.full_name || item.email || "Без имени"
                  : type === "hotel"
                  ? item.name || "Без названия"
                  : [item.car_name, item.plate_number]
                      .filter(Boolean)
                      .join(" • ") || "Транспорт"}
              </option>
            );
          })}
        </select>
      ) : (
        <p className={s.templateEditorEmptyText}>
          Нет доступных {entityLabelByType(type)}ов в базе.
        </p>
      )}

      {selected && (
        <div style={{ marginTop: 12 }}>
          <EntityPreview type={type} entity={selected} />
        </div>
      )}
      {type === "guide" && startDate ? (
        <div className={s.templateEditorHint}>
          <span className={s.templateEditorHintDot} style={{ background: "#22c55e" }} />
          свободен на дату старта тура
          <span className={s.templateEditorHintDot} style={{ background: "#f87171", marginLeft: 12 }} />
          занят
          <span className={s.templateEditorHintDot} style={{ background: "#9ca3af", marginLeft: 12 }} />
          нет данных
        </div>
      ) : null}
    </div>
  );
}

function CustomFields({ type, value = {}, onChange }) {
  const setVal = (key, val) => {
    if (onChange) onChange({ [key]: val });
  };

  if (type === "guide") {
    return (
      <div className={s.templateEditorField}>
        <span className={s.templateEditorLabel}>Данные гида (только для этого тура)</span>
        <input
          className={s.templateEditorInput}
          placeholder="ФИО"
          value={value.full_name || ""}
          onChange={(e) => setVal("full_name", e.target.value)}
        />
        <input
          className={s.templateEditorInput}
          placeholder="Телефон"
          value={value.phone || ""}
          onChange={(e) => setVal("phone", e.target.value)}
          style={{ marginTop: 8 }}
        />
        <input
          className={s.templateEditorInput}
          placeholder="Email"
          value={value.email || ""}
          onChange={(e) => setVal("email", e.target.value)}
          style={{ marginTop: 8 }}
        />
      </div>
    );
  }

  if (type === "hotel") {
    return (
      <div className={s.templateEditorField}>
        <span className={s.templateEditorLabel}>Данные отеля (только для этого тура)</span>
        <input
          className={s.templateEditorInput}
          placeholder="Название отеля"
          value={value.name || ""}
          onChange={(e) => setVal("name", e.target.value)}
        />
        <input
          className={s.templateEditorInput}
          placeholder="Телефон"
          value={value.phone || ""}
          onChange={(e) => setVal("phone", e.target.value)}
          style={{ marginTop: 8 }}
        />
        <input
          className={s.templateEditorInput}
          placeholder="Адрес"
          value={value.address || ""}
          onChange={(e) => setVal("address", e.target.value)}
          style={{ marginTop: 8 }}
        />
        <input
          className={s.templateEditorInput}
          placeholder="Питание (BB, HB и т.п.)"
          value={value.meal_plan || ""}
          onChange={(e) => setVal("meal_plan", e.target.value)}
          style={{ marginTop: 8 }}
        />
      </div>
    );
  }

  return (
    <div className={s.templateEditorField}>
      <span className={s.templateEditorLabel}>Данные транспорта (только для этого тура)</span>
      <input
        className={s.templateEditorInput}
        placeholder="Авто / автобус"
        value={value.car_name || ""}
        onChange={(e) => setVal("car_name", e.target.value)}
      />
      <input
        className={s.templateEditorInput}
        placeholder="Гос. номер"
        value={value.plate_number || ""}
        onChange={(e) => setVal("plate_number", e.target.value)}
        style={{ marginTop: 8 }}
      />
      <input
        className={s.templateEditorInput}
        placeholder="Водитель"
        value={value.full_name || ""}
        onChange={(e) => setVal("full_name", e.target.value)}
        style={{ marginTop: 8 }}
      />
      <input
        className={s.templateEditorInput}
        placeholder="Телефон"
        value={value.phone || ""}
        onChange={(e) => setVal("phone", e.target.value)}
        style={{ marginTop: 8 }}
      />
    </div>
  );
}

export function NewTourFromTemplateScreen({
  open,
  templateId,
  onClose,
  companyId,
  guides = [],
  hotels = [],
  drivers = [],
  onCreated,
  mode = "create",
  tourId = null,
  editTitleOverride = null,
  guideView = false,
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [touristsCount, setTouristsCount] = useState(""); 
  const [components, setComponents] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const isEditMode = mode === "edit" && !!tourId;
  const [actionRowId, setActionRowId] = useState(null);
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilter, setGuestFilter] = useState("all"); // all | paid | unpaid
  const actionMenuRef = useRef(null);
  const [showQrScreen, setShowQrScreen] = useState(false);
  const [feedbackToken, setFeedbackToken] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [tourists, setTourists] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 720px)");
    const handle = (e) => setIsMobile(e.matches);
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const guideName = useMemo(() => {
    const guideComponent = components.find((c) => c.type === "guide");
    if (!guideComponent) return "";
    if (guideComponent.mode === "custom" && guideComponent.custom?.full_name) {
      return guideComponent.custom.full_name;
    }
    const list = guides || [];
    const selected = list.find(
      (row) => String(row.id) === String(guideComponent.selectedId || "")
    );
    return selected?.full_name || selected?.email || "";
  }, [components, guides]);

  const qrTourTitle = name || "Тур";
  const qrDate = formatDateFriendly(startDate);
  const qrMeta = [qrDate, guideName ? `Гид: ${guideName}` : ""]
    .filter(Boolean)
    .join(" • ");

  const guideLikeView = guideView || isMobile;
  const feedbackLink = useMemo(() => {
    if (!feedbackToken) return "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "";
    const base = origin || "";
    const path = `/feedback/${feedbackToken}`;
    return `${base}${path}`;
  }, [feedbackToken]);
  const handleCopyFeedback = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(feedbackLink);
      setCopyMsg("Ссылка скопирована");
      setTimeout(() => setCopyMsg(""), 1800);
    } catch (_) {
      setCopyMsg("Не удалось скопировать");
      setTimeout(() => setCopyMsg(""), 1800);
    }
  }, [feedbackLink]);

  const handleShareFeedback = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: qrTourTitle || "Отзыв о туре",
          text: "Оставьте, пожалуйста, отзыв о туре",
          url: feedbackLink,
        });
      } catch (_) {
        // ignore cancel
      }
    } else {
      handleCopyFeedback();
    }
  }, [feedbackLink, qrTourTitle, handleCopyFeedback]);

  const fetchReviews = useCallback(async () => {
    if (!tourId) return;
    setIsLoadingReviews(true);
    setLinkError("");
    try {
      const res = await fetch(`/api/v1/feedback/list?tour_id=${tourId}`);
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось загрузить отзывы");
      }
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setReviews(items);
    } catch (e) {
      setLinkError(e.message || "Ошибка загрузки отзывов");
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [tourId]);

  const generateFeedbackLink = useCallback(async () => {
    if (!tourId) {
      setLinkError("Сначала сохраните тур");
      return;
    }
    setIsGeneratingLink(true);
    setLinkError("");
    try {
      const res = await fetch("/api/v1/feedback/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId }),
      });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось сгенерировать ссылку");
      }
      const data = await res.json();
      if (data.token) {
        setFeedbackToken(data.token);
      }
    } catch (e) {
      setLinkError(e.message || "Ошибка генерации ссылки");
    } finally {
      setIsGeneratingLink(false);
    }
  }, [tourId]);

  useEffect(() => {
    if (activeTab === "reviews" && tourId) {
      fetchReviews();
    }
  }, [activeTab, tourId, fetchReviews]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        actionRowId &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target)
      ) {
        setActionRowId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [actionRowId]);
  const updateGuestField = (id, field, value) => {
    setTourists((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, [field]: value };
        if (field === "cost" || field === "prepayment") {
          const costCents = parseMoneyToCents(
            field === "cost" ? value : t.cost
          );
          const prepayCents = parseMoneyToCents(
            field === "prepayment" ? value : t.prepayment
          );
          next.balance = formatCents(costCents - prepayCents);
        }
        return next;
      })
    );
  };
  const loadTourGuests = async (tourIdToLoad) => {
    if (!tourIdToLoad) return;
    try {
      const res = await fetch(`/api/v1/tours/guests/list?tour_id=${tourIdToLoad}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.guests)) return;

      const rows = [];
      const primaryMap = new Map();

      // сначала добавляем основных
  data.guests
    .filter((g) => g.is_primary === true)
    .forEach((g) => {
      const mainId = g.id;
      const costCents = Number.isFinite(g.cost_cents) ? g.cost_cents : 0;
      const prepayCents = Number.isFinite(g.prepayment_cents)
        ? g.prepayment_cents
        : 0;

          const mainRow = {
            id: mainId,
            baseId: mainId,
            isExtra: false,
            name: g.full_name || "",
            phone: g.phone || "",
            cost: formatCents(costCents),
            prepayment: formatCents(prepayCents),
            balance: formatCents(costCents - prepayCents),
            paid: !!g.is_paid,
          };
          rows.push(mainRow);
          primaryMap.set(mainId, mainRow);
        });

      // затем добавляем допов, привязывая к primary_id
      data.guests
        .filter((g) => g.is_primary === false)
        .forEach((g, idx) => {
          const baseId = g.primary_id || g.base_id || null;
          if (!baseId || !primaryMap.has(baseId)) return;
          rows.push({
            id: g.id || `${baseId}-extra-${idx}`,
            baseId,
            isExtra: true,
            name: g.full_name || "",
            phone: g.phone || "",
            cost: "",
            prepayment: "",
            balance: "",
            paid: !!primaryMap.get(baseId)?.paid,
          });
        });

      setTourists(rows);
    } catch (e) {
      console.error("loadTourGuests error", e);
    }
  };

  const GROUP_COLORS = {
    A: "#3b82f6",
    B: "#a855f7",
  };
  const GUIDE_CARD_COLORS = [
    { bg: "#1f2b3a", accent: "#2d65e6" },
    { bg: "#2b1b3d", accent: "#8b5cf6" },
    { bg: "#163441", accent: "#06b6d4" },
  ];

  const zebraColors = [
    "rgba(32, 41, 54, 0.85)",
    "rgba(36, 29, 45, 0.7)",
  ];

  const getExtras = (baseId) =>
    tourists.filter((x) => x.isExtra && x.baseId === baseId);

  const displayTourists = [];
  const baseRows = tourists.filter((t) => !t.isExtra);
  const filteredBases =
    guestFilter === "paid"
      ? baseRows.filter((b) => b.paid)
      : guestFilter === "unpaid"
      ? baseRows.filter((b) => !b.paid)
      : baseRows;

  filteredBases.forEach((base, idx) => {
    const groupLabel = idx % 2 === 0 ? "A" : "B";
    const color = GROUP_COLORS[groupLabel] || "#3b82f6";
    const rowColor = zebraColors[idx % zebraColors.length];
    const extras = getExtras(base.id);

    displayTourists.push({
      ...base,
      group: groupLabel,
      color,
      isExtra: false,
      rowColor,
      baseId: base.id,
      paid: !!base.paid,
      count: 1 + extras.length,
    });

    extras.forEach((ex) => {
      displayTourists.push({
        ...ex,
        group: groupLabel,
        color,
        isExtra: true,
        rowColor,
        baseId: base.id,
        paid: !!base.paid,
      });
    });
  });

  const filteredDisplay = displayTourists.filter((row) => {
    if (!guestSearch.trim()) return true;
    const q = guestSearch.trim().toLowerCase();
    return (
      (row.name || "").toLowerCase().includes(q) ||
      (row.phone || "").toLowerCase().includes(q)
    );
  });

  const handleCountChange = (baseId, value) => {
    const parsed = Math.max(1, Number.parseInt(value, 10) || 1);
    setTourists((prev) => {
      const base = prev.find((t) => t.id === baseId && !t.isExtra);
      if (!base) return prev;
      const currentExtras = prev.filter((t) => t.isExtra && t.baseId === baseId);
      const extrasToAdd = parsed - 1 - currentExtras.length;

      let next = prev.filter((t) => !(t.isExtra && t.baseId === baseId));
      if (extrasToAdd > 0) {
        const newExtras = Array.from({ length: extrasToAdd }).map((_, idx) => ({
          id: `${baseId}-extra-${Date.now()}-${idx}`,
          baseId,
          isExtra: true,
          name: "",
          phone: "",
          cost: "",
          prepayment: "",
          balance: "",
          paid: !!base.paid,
        }));
        next = [...next, ...currentExtras, ...newExtras];
      } else if (extrasToAdd < 0) {
        const keep = currentExtras.slice(0, parsed - 1);
        next = [...next, ...keep];
      } else {
        next = [...next, ...currentExtras];
      }
      return next;
    });
  };

  const handleRemoveExtra = (row) => {
    const baseId = row.baseId || row.id;
    setTourists((prev) => prev.filter((t) => t.id !== row.id));
    setActionRowId(null);
  };

  const handleRemoveGroup = (row) => {
    setTourists((prev) => prev.filter((t) => t.baseId !== row.baseId && t.id !== row.id));
    setActionRowId(null);
  };

  const handleAddTraveler = () => {
    const newId = `new-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setTourists((prev) => [
      ...prev,
      {
        id: newId,
        baseId: newId,
        isExtra: false,
        name: "",
        phone: "",
        cost: "",
        prepayment: "",
        balance: "",
        paid: false,
      },
    ]);
  };

  const handleTogglePaid = (row) => {
    const baseId = row.baseId || row.id;
    setTourists((prev) => {
      const baseRow = prev.find((t) => t.id === baseId && !t.isExtra);
      const nextPaid = baseRow ? !baseRow.paid : !row.paid;
      return prev.map((t) =>
        t.id === baseId || t.baseId === baseId
          ? { ...t, paid: nextPaid }
          : t
      );
    });
  };

  const guideSignedCount = tourists.filter((t) => !t.isExtra).length + tourists.filter((t) => t.isExtra).length;

  const guideCards = baseRows.map((base, idx) => {
    const extras = getExtras(base.id);
    const palette = GUIDE_CARD_COLORS[idx % GUIDE_CARD_COLORS.length];
    const travelers = [
      { name: base.name || "—", phone: base.phone || "—" },
      ...extras.map((ex) => ({ name: ex.name || "—", phone: ex.phone || "—" })),
    ];
    const balanceCents = parseMoneyToCents(base.balance);
    const prepayCents = parseMoneyToCents(base.prepayment);
    let balanceTone = "neutral";
    if (balanceCents === 0) balanceTone = "success";
    else if (!prepayCents) balanceTone = "danger";

    return {
      id: base.id,
      group: `Группа ${idx + 1}`,
      groupColor: palette.bg,
      accent: palette.accent,
      travelers,
      cost: base.cost || "—",
      prepay: base.prepayment || "—",
      balance: base.balance || "—",
      paid: !!base.paid,
      balanceTone,
    };
  });

  const saveTourGuests = async (targetTourId) => {
    if (!targetTourId) return;
    const baseRows = tourists.filter((t) => !t.isExtra);
    const extras = tourists.filter((t) => t.isExtra);
    const payload = {
      tour_id: targetTourId,
      guests: [
        ...baseRows.map((t) => ({
          temp_id: t.id,
          is_extra: false,
          full_name: t.name || "",
          phone: t.phone || "",
          cost_cents: parseMoneyToCents(t.cost),
          prepayment_cents: parseMoneyToCents(t.prepayment),
          is_paid: !!t.paid,
          group_label: null,
        })),
        ...extras.map((t) => ({
          temp_id: t.id,
          base_temp_id: t.baseId,
          is_extra: true,
          full_name: t.name || "",
          phone: t.phone || "",
          cost_cents: parseMoneyToCents(t.cost),
          prepayment_cents: parseMoneyToCents(t.prepayment),
          is_paid: !!t.paid,
          group_label: null,
        })),
      ],
    };

    try {
      const res = await fetch("/api/v1/tours/guests/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось сохранить туристов");
      }
    } catch (e) {
      console.error("saveTourGuests error", e);
      throw e;
    }
  };

  // сброс формы при открытии нового контекста
  useEffect(() => {
    if (!open) {
      return;
    }
    // когда открываем форму — очищаем прежние ошибки
    setError(null);
    setSaveError(null);
  }, [open]);

  // грузим шаблон из API, чтобы 1в1 показать то, что в базе
  useEffect(() => {
    if (!open || !templateId || isEditMode) return;

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
        setStartDate(t.start_date ? t.start_date.slice(0, 10) : "");
        setEndDate(t.end_date ? t.end_date.slice(0, 10) : "");
        setTouristsCount("");
        setComponents(
          (t.components || []).map((c) => ({
            id: c.id,
            type: c.type || "transport",
            comment: c.comment || "",
            position: c.position || 1,
            selectedId: "",
            mode: "base", // base | custom
            custom: {},
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
  }, [open, templateId, isEditMode]);

  // грузим данные тура для редактирования
  useEffect(() => {
    if (!open || !isEditMode) return;

    const loadTour = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/tours/${tourId}`);
        if (!res.ok) {
          let data = {};
          try {
            data = await res.json();
          } catch (_) {}
          throw new Error(data.message || "Не удалось загрузить тур");
        }
        const data = await res.json();
        const t = data.tour;

        setName(t.name || "");
        setStartDate(t.start_date || "");
        setEndDate(t.end_date || "");
        setTouristsCount(
          Number.isFinite(parseInt(t.tourists_count, 10))
            ? String(parseInt(t.tourists_count, 10))
            : ""
        );
        setComponents(
          (t.components || []).map((c) => ({
            id: c.id,
            type: c.type || "transport",
            comment: c.comment || "",
            selectedId: c.selectedId || "",
            mode: c.mode || "base",
            custom: c.custom || {},
          }))
        );
        await loadTourGuests(tourId);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    setTourists([]);
    loadTour();
  }, [open, isEditMode, tourId]);

  const handleAddComponent = (type) => {
    setComponents((prev) => [
      ...prev,
      {
        id: `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type,
        comment: "",
        selectedId: "",
        mode: "base",
        custom: {},
      },
    ]);
    setIsAddModalOpen(false);
  };

  const handleRemoveComponent = (id) => {
    setComponents((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveClick = async () => {
    if (isSaving) return;
    if (!companyId) {
      alert("Не указан companyId");
      return;
    }
    if (!name.trim()) {
      alert("Укажите название тура");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const baseRows = tourists.filter((t) => !t.isExtra);
      const extrasCount = tourists.filter((t) => t.isExtra).length;
      const totalGuests = baseRows.length + extrasCount;
      const parsedTourists = Number.isFinite(parseInt(touristsCount, 10))
        ? parseInt(touristsCount, 10)
        : null;

      const payload = {
        company_id: companyId,
        template_id: !isEditMode ? templateId || null : null,
        name: name.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        tourists_count: parsedTourists ?? totalGuests,
        components: (components || []).map((c) => ({
          type: c.type,
          comment: c.comment || "",
          mode: c.mode || "base",
          selectedId: c.selectedId || null,
          custom: c.custom || {},
        })),
      };

      let url = "/api/v1/tours/create";
      if (isEditMode) {
        url = "/api/v1/tours/update";
        payload.tour_id = tourId;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        const msg = data.detail
          ? `${data.message || "Не удалось сохранить тур"}: ${data.detail}`
          : data.message || "Не удалось сохранить тур";
        throw new Error(msg);
      }

      const savedTourId = isEditMode ? tourId : data?.tour?.id;
      if (savedTourId) {
        await saveTourGuests(savedTourId);
      }

      alert(isEditMode ? "Тур обновлён" : "Тур сохранён");
      if (onCreated) onCreated();
      if (onClose) onClose();
    } catch (e) {
      console.error(e);
      setSaveError(e.message);
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  const headerTitle = isEditMode
    ? guideView
      ? editTitleOverride || name || "Тур"
      : editTitleOverride || "Редактировать тур"
    : "Новый тур";

  return (
    <div className={s.fullscreenOverlay}>
      <div className={s.templateEditor}>
        {/* HEADER НОВОГО ТУРА */}
        <header className={s.templateEditorHeader}>
          <button
            type="button"
            onClick={onClose}
            className={s.templateEditorBackButton}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {headerTitle ? (
            <h1 className={s.templateEditorTitle}>
              {headerTitle}
            </h1>
          ) : (
            <div className={s.templateEditorTitle} />
          )}

          <button
            type="button"
            onClick={handleSaveClick}
            className={s.templateEditorSaveButton}
            disabled={isSaving}
          >
            {isSaving ? "Сохраняем..." : "Сохранить"}
          </button>
        </header>

        {/* ОСНОВНЫЕ ПОЛЯ — 1в1 как в шаблоне */}
        <div className={s.templateEditorBody}>
          {saveError && (
            <p className={s.templateEditorError || ""}>
              {saveError}
            </p>
          )}

          {error && (
            <p className={s.templateEditorError || ""}>
              {error}
            </p>
          )}

          <div className={s.templateEditorMainRow}>
            {!guideView && (
              <label className={s.templateEditorField}>
                <span className={s.templateFieldLabel}>Название тура</span>
                <input
                  type="text"
                  className={s.templateEditorInput}
                  placeholder="Например: Тур по Швейцарии"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}

            <div className={s.templateEditorDatesInline}>
              <label className={s.templateEditorField}>
                <span className={s.templateEditorLabel}>Старт</span>
                {guideView ? (
                  <div className={s.templateEditorLabel}>{formatDateDisplay(startDate)}</div>
                ) : (
                  <input
                    type="date"
                    className={s.templateEditorInput}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                )}
              </label>
              <label className={s.templateEditorField}>
                <span className={s.templateEditorLabel}>Конец</span>
                {guideView ? (
                  <div className={s.templateEditorLabel}>{formatDateDisplay(endDate)}</div>
                ) : (
                  <input
                    type="date"
                    className={s.templateEditorInput}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                )}
              </label>
            </div>

            <div className={s.templateEditorField}>
              <span className={s.templateEditorLabel}>Количество туристов</span>
              {guideView ? (
                <div className={s.templateEditorLabel}>
                  {guideSignedCount > 0 ? `${guideSignedCount}/${touristsCount || "—"}` : touristsCount || "—"}
                </div>
              ) : (
                <input
                  type="number"
                  min="1"
                  className={s.templateEditorInput}
                  value={touristsCount}
                  onChange={(e) => setTouristsCount(e.target.value)}
                  placeholder="Например: 17"
                />
              )}
            </div>
          </div>

          {/* статус НЕ показываем */}
        </div>

        {/* ТАБЫ */}
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
              activeTab === "reviews" ? s.templateEditorTabActive : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Отзывы
          </button>
        </div>

        {/* КОНТЕНТ ТАБОВ — 1в1 как в TemplateEditor */}
        <div className={s.templateEditorContent}>
          {activeTab === "general" && (
            <>
              {isLoading && (
                <p className={s.templateEditorEmptyText}>
                  Загружаем шаблон...
                </p>
              )}

              {!isLoading && guideView && (
                <div className={s.templateAccordionGrid}>
                  {components.map((item) => {
                    const list =
                      entityListsByType(item.type, { guides, hotels, drivers }) ||
                      [];
                    const selectedEntity =
                      list.find(
                        (row) => String(row.id) === String(item.selectedId || "")
                      ) || null;
                    const customEntity =
                      item.custom && Object.keys(item.custom || {}).length > 0
                        ? item.custom
                        : null;
                    const displayEntity =
                      item.mode === "custom" ? customEntity : selectedEntity;

                    return (
                      <div key={item.id}>
                        {displayEntity ? (
                          <div style={{ marginTop: item.comment ? 12 : 0 }}>
                            <EntityPreview type={item.type} entity={displayEntity} comment={item.comment} />
                          </div>
                        ) : (
                          <p className={s.templateEditorEmptyText}>Нет данных</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoading && !guideView && (
                <div className={s.templateAccordionGrid}>
                  {components.map((item) => (
                    <details
                      className={s.templateAccordion}
                      open
                      key={item.id}
                    >
                      {(() => {
                        const list =
                          entityListsByType(item.type, {
                            guides,
                            hotels,
                            drivers,
                          }) || [];
                        const selectedEntity =
                          list.find(
                            (row) =>
                              String(row.id) === String(item.selectedId || "")
                          ) || null;
                        const customEntity =
                          item.custom &&
                          Object.keys(item.custom || {}).length > 0
                            ? item.custom
                            : null;
                        const displayEntity =
                          item.mode === "custom" ? customEntity : selectedEntity;
                        const phone =
                          displayEntity &&
                          typeof displayEntity.phone === "string" &&
                          displayEntity.phone.trim()
                            ? displayEntity.phone.trim()
                            : null;

                        return (
                          <>
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
                            </div>

                            <div className={s.templateEditorField}>
                              <span className={s.templateEditorLabel}>Источник данных</span>
                              <div className={s.templateEditorTagsRow}>
                                <button
                                  type="button"
                                  className={`${s.templateTag} ${item.mode !== "custom" ? s.templateTagActive : ""}`}
                                  onClick={() => {
                                    setComponents((prev) =>
                                      prev.map((c) =>
                                        c.id === item.id
                                          ? { ...c, mode: "base" }
                                          : c
                                      )
                                    );
                                  }}
                                >
                                  Выбрать из базы
                                </button>
                                <button
                                  type="button"
                                  className={`${s.templateTag} ${item.mode === "custom" ? s.templateTagActive : ""}`}
                                  onClick={() => {
                                    setComponents((prev) =>
                                      prev.map((c) =>
                                        c.id === item.id
                                          ? { ...c, mode: "custom", selectedId: "" }
                                          : c
                                      )
                                    );
                                  }}
                                >
                                  Ввести вручную
                                </button>
                              </div>
                            </div>

                            {item.mode === "base" ? (
                              <SelectFromBase
                                type={item.type}
                                guides={guides}
                                hotels={hotels}
                                drivers={drivers}
                                selectedId={item.selectedId || ""}
                                guideView={guideView}
                                companyId={companyId}
                                startDate={startDate}
                                onSelect={(val) => {
                                  setComponents((prev) =>
                                    prev.map((c) =>
                                      c.id === item.id ? { ...c, selectedId: val } : c
                                    )
                                  );
                                }}
                              />
                            ) : (
                              <CustomFields
                                type={item.type}
                                value={item.custom || {}}
                                onChange={(patch) => {
                                  setComponents((prev) =>
                                    prev.map((c) =>
                                      c.id === item.id
                                        ? { ...c, custom: { ...(c.custom || {}), ...patch } }
                                        : c
                                    )
                                  );
                                }}
                              />
                            )}
                          </>
                        );
                      })()}
                    </details>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "tourists" && (
            guideLikeView ? (
              <div className={s.touristsMobileWrap}>
                <div className={s.touristsMobileActions}>
                  <div className={s.touristsSearch}>
                    <Search className={s.touristsSearchIcon} />
                    <input
                      type="search"
                      placeholder="Поиск по имени или телефону"
                      className={s.touristsSearchInput}
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                    />
                  </div>
                  <div className={s.toursStatusButtons}>
                    <button
                      type="button"
                      className={`${s.toursStatusBtn} ${guestFilter === "all" ? s.toursStatusBtnActive : ""}`}
                      onClick={() => setGuestFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      type="button"
                      className={`${s.toursStatusBtn} ${guestFilter === "paid" ? s.toursStatusBtnActive : ""}`}
                      onClick={() => setGuestFilter("paid")}
                    >
                      Оплаченные
                    </button>
                    <button
                      type="button"
                      className={`${s.toursStatusBtn} ${guestFilter === "unpaid" ? s.toursStatusBtnActive : ""}`}
                      onClick={() => setGuestFilter("unpaid")}
                    >
                      Не оплаченные
                    </button>
                  </div>
                  <button
                    type="button"
                    className={s.touristsPrimaryBtn}
                    onClick={handleAddTraveler}
                  >
                    <span className={s.touristsPrimaryPlus}>+</span>
                    Добавить
                  </button>
                </div>

                <div className={s.touristsMobileList}>
                  {filteredDisplay.map((t) => (
                    <div key={t.id} className={s.touristsMobileCard} style={{ backgroundColor: t.rowColor }}>
                      <div className={s.touristsMobileHeader}>
                        {!t.isExtra ? (
                          <span
                            className={s.touristsBadge}
                            style={{ backgroundColor: `${t.color}1a`, color: t.color }}
                          >
                            {t.group}
                          </span>
                        ) : (
                          <span className={s.touristsBadge}>Доп</span>
                        )}
                        <button
                          type="button"
                          className={s.touristsMobileDelete}
                          onClick={() => (t.isExtra ? handleRemoveExtra(t) : handleRemoveGroup(t))}
                        >
                          Удалить
                        </button>
                      </div>

                      <div className={s.touristsMobileField}>
                        <label>ФИО</label>
                        <input
                          type="text"
                          className={s.templateEditorInput}
                          value={t.name}
                          placeholder="ФИО"
                          onChange={(e) => updateGuestField(t.id, "name", e.target.value)}
                        />
                      </div>

                      <div className={s.touristsMobileField}>
                        <label>Телефон</label>
                        <input
                          type="tel"
                          className={s.templateEditorInput}
                          value={t.phone}
                          placeholder="+996 ..."
                          onChange={(e) => updateGuestField(t.id, "phone", e.target.value)}
                        />
                      </div>

                      {!t.isExtra && (
                        <div className={s.touristsMobileGrid}>
                          <label className={s.touristsMobileField}>
                            <span>Стоимость</span>
                            <input
                              type="text"
                              className={`${s.templateEditorInput} ${s.touristsMoneyInput}`}
                              value={t.cost || ""}
                              placeholder="0"
                              onChange={(e) => updateGuestField(t.id, "cost", e.target.value)}
                            />
                          </label>
                          <label className={s.touristsMobileField}>
                            <span>Предоплата</span>
                            <input
                              type="text"
                              className={`${s.templateEditorInput} ${s.touristsMoneyInput}`}
                              value={t.prepayment || ""}
                              placeholder="0"
                              onChange={(e) => updateGuestField(t.id, "prepayment", e.target.value)}
                            />
                          </label>
                          <label className={s.touristsMobileField}>
                            <span>Остаток</span>
                            <input
                              type="text"
                              className={`${s.templateEditorInput} ${s.touristsMoneyInput}`}
                              value={t.balance || ""}
                              placeholder="0"
                              onChange={(e) => updateGuestField(t.id, "balance", e.target.value)}
                            />
                          </label>
                        </div>
                      )}

                      {!t.isExtra && (
                        <div className={s.touristsMobileFooter}>
                          <div className={s.touristsCountWrap}>
                            <span className={s.touristsCountValue}>{t.count}</span>
                            <button
                              type="button"
                              className={s.touristsCountAdd}
                              onClick={() => handleCountChange(t.id, (t.count || 1) + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className={`${s.touristsPaidToggle} ${t.paid ? s.touristsPaidToggleActive : ""}`}
                            onClick={() => handleTogglePaid(t)}
                          >
                            {t.paid ? <CheckCircle2 className={s.touristsPaidIcon} /> : <span className={s.touristsPaidDot} />}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={s.touristsCard}>
                <div className={s.touristsCardHeader}>
                  <div>
                    <p className={s.touristsTitle}>Туристы</p>
                    <p className={s.touristsSubtitle}>
                      Добавьте всех участников этого тура
                    </p>
                  </div>
                  <div className={s.touristsActions}>
                    <div className={s.touristsSearch}>
                      <Search className={s.touristsSearchIcon} />
                      <input
                        type="search"
                        placeholder="Поиск по имени или телефону"
                        className={s.touristsSearchInput}
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                      />
                    </div>
                    <div className={s.toursStatusButtons}>
                      <button
                        type="button"
                        className={`${s.toursStatusBtn} ${
                          guestFilter === "all" ? s.toursStatusBtnActive : ""
                        }`}
                        onClick={() => setGuestFilter("all")}
                      >
                        Все
                      </button>
                      <button
                        type="button"
                        className={`${s.toursStatusBtn} ${
                          guestFilter === "paid" ? s.toursStatusBtnActive : ""
                        }`}
                        onClick={() => setGuestFilter("paid")}
                      >
                        Оплаченные
                      </button>
                      <button
                        type="button"
                        className={`${s.toursStatusBtn} ${
                          guestFilter === "unpaid" ? s.toursStatusBtnActive : ""
                        }`}
                        onClick={() => setGuestFilter("unpaid")}
                      >
                        Не оплаченные
                      </button>
                    </div>
                    <button
                      type="button"
                      className={s.touristsPrimaryBtn}
                      onClick={handleAddTraveler}
                    >
                      <span className={s.touristsPrimaryPlus}>+</span>
                      Добавить туриста
                    </button>
                  </div>
                </div>

                <div className={s.touristsTableScroll}>
                  <table className={s.touristsTable}>
                    <thead>
                      <tr>
                        <th className={s.touristsTh} />
                        <th className={s.touristsTh}>ФИО</th>
                        <th className={s.touristsTh}>Телефон</th>
                        <th className={s.touristsTh}>Стоимость тура</th>
                        <th className={s.touristsTh}>Предоплата</th>
                        <th className={s.touristsTh}>Остаток</th>
                        <th className={s.touristsTh}>Кол-во</th>
                        <th className={s.touristsTh}>Оплачено</th>
                        <th className={s.touristsTh}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisplay.map((t) => (
                        <tr
                          key={t.id}
                          className={s.touristsRow}
                          style={{ backgroundColor: t.rowColor }}
                        >
                          <td className={s.touristsTd}>
                            {!t.isExtra ? (
                              <span
                                className={s.touristsBadge}
                                style={{ backgroundColor: `${t.color}1a`, color: t.color }}
                              >
                                {t.group}
                              </span>
                            ) : null}
                          </td>
                          <td className={`${s.touristsTd} ${s.touristsName}`}>
                            <input
                              type="text"
                              className={s.templateEditorInput}
                              value={t.name}
                              placeholder="ФИО"
                              onChange={(e) =>
                                updateGuestField(t.id, "name", e.target.value)
                              }
                            />
                          </td>
                          <td className={s.touristsTd}>
                            <input
                              type="tel"
                              className={s.templateEditorInput}
                              value={t.phone}
                              placeholder="+996 ..."
                              onChange={(e) =>
                                updateGuestField(t.id, "phone", e.target.value)
                              }
                            />
                          </td>
                          <td className={s.touristsTd}>
                            {t.isExtra ? (
                              t.cost
                            ) : (
                              <input
                                type="text"
                                className={`${s.templateEditorInput} ${s.touristsMoneyInput}`}
                                value={t.cost || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  updateGuestField(t.id, "cost", e.target.value)
                                }
                              />
                            )}
                          </td>
                          <td className={s.touristsTd}>
                            {t.isExtra ? (
                              t.prepayment
                            ) : (
                              <input
                                type="text"
                                className={`${s.templateEditorInput} ${s.touristsMoneyInput}`}
                                value={t.prepayment || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  updateGuestField(
                                    t.id,
                                    "prepayment",
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className={s.touristsTd}>
                            {t.isExtra ? (
                              t.balance
                            ) : (
                              <input
                                type="text"
                                className={`${s.templateEditorInput} ${s.touristsMoneyInput}`}
                                value={t.balance || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  updateGuestField(
                                    t.id,
                                    "balance",
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className={s.touristsTd}>
                            {!t.isExtra ? (
                              <div className={s.touristsCountWrap}>
                                <span className={s.touristsCountValue}>{t.count}</span>
                                <button
                                  type="button"
                                  className={s.touristsCountAdd}
                                  onClick={() => handleCountChange(t.id, (t.count || 1) + 1)}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              ""
                            )}
                          </td>
                          <td className={s.touristsTd}>
                            {!t.isExtra && (
                              <button
                                type="button"
                                className={`${s.touristsPaidToggle} ${
                                  t.paid ? s.touristsPaidToggleActive : ""
                                }`}
                                onClick={() => handleTogglePaid(t)}
                              >
                                {t.paid ? (
                                  <CheckCircle2 className={s.touristsPaidIcon} />
                                ) : (
                                  <span className={s.touristsPaidDot} />
                                )}
                              </button>
                            )}
                          </td>
                          <td
                            className={`${s.touristsTd} ${s.touristsActionsCell}`}
                            ref={actionRowId === t.id ? actionMenuRef : null}
                          >
                            <button
                              type="button"
                              className={s.touristsMenuBtn}
                              onClick={() =>
                                setActionRowId((prev) => (prev === t.id ? null : t.id))
                              }
                            >
                              <MoreVertical className={s.touristsMenuIcon} />
                            </button>

                            {actionRowId === t.id && (
                              <div className={s.touristsMenu}>
                                {t.isExtra ? (
                                  <button
                                    type="button"
                                    className={s.touristsMenuItem}
                                    onClick={() => handleRemoveExtra(t)}
                                  >
                                    Удалить доп
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className={s.touristsMenuItem}
                                    onClick={() => handleRemoveGroup(t)}
                                  >
                                    Удалить группу
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={s.touristsFooter}>
                  <span>Всего туристов: {displayTourists.length}</span>
                  <span className={s.touristsDotDivider}>·</span>
                  <span>
                    Оплачено:{" "}
                    {
                      displayTourists.filter(
                        (row) => !row.isExtra && row.paid
                      ).length
                    }
                  </span>
                  <span className={s.touristsDotDivider}>·</span>
                  <span>
                    Не оплачено:{" "}
                    {
                      displayTourists.filter(
                        (row) => !row.isExtra && !row.paid
                      ).length
                    }
                  </span>
                </div>
              </div>
            )
          )}

          {activeTab === "reviews" && (
            <div className={s.reviewsSection}>
              {guideView && (
                <div className={s.reviewsActions}>
                  <button
                    type="button"
                    className={s.reviewGenerateBtn}
                    onClick={() => {
                      generateFeedbackLink();
                      setShowQrScreen(true);
                    }}
                    disabled={isGeneratingLink}
                  >
                    <QrCode className={s.reviewGenerateIcon} />
                    <span>{isGeneratingLink ? "Генерируем..." : "Сгенерировать ссылку / QR"}</span>
                  </button>
                </div>
              )}
              <div className={s.reviewsList}>
                {isLoadingReviews ? (
                  <p className={s.templateEditorEmptyText}>Загружаем отзывы...</p>
                ) : reviews.length === 0 ? (
                  <p className={s.templateEditorEmptyText}>Отзывов пока нет</p>
                ) : (
                  reviews.map((rev, idx) => {
                    const dateObj = rev.created_at ? new Date(rev.created_at) : null;
                    const dateStr = dateObj
                      ? dateObj.toLocaleDateString("ru-RU")
                      : "";
                    const timeStr = dateObj
                      ? dateObj.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
                      : "";
                    const name = rev.tourist_name || "Гость";
                    const initials = name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "ГТ";

                    const blocks = [
                      { title: "Гид", text: rev.guide_comment || "Без комментария", score: rev.rating_guide || 0 },
                      { title: "Транспорт", text: rev.driver_comment || "Без комментария", score: rev.rating_transport || 0 },
                      { title: "Тур", text: rev.tour_comment || "Без комментария", score: rev.rating_tour || 0 },
                    ];
                    const ratings = {
                      tour: rev.rating_tour || 0,
                      transport: rev.rating_transport || 0,
                      guide: rev.rating_guide || 0,
                    };

                    return (
                      <div
                        key={rev.id || idx}
                        className={s.reviewCard}
                        style={{
                          background: idx % 2 === 0
                            ? "linear-gradient(145deg, #1c2a3a, #15212e)"
                            : "linear-gradient(145deg, #1c2433, #111c2b)",
                        }}
                      >
                        <div className={s.reviewHeader}>
                          <div className={s.reviewUser}>
                            <div className={s.reviewAvatar}>{initials}</div>
                            <div>
                              <p className={s.reviewName}>{name}</p>
                              <p className={s.reviewDate}>
                                {dateStr}
                                {timeStr ? ` · ${timeStr}` : ""}
                              </p>
                            </div>
                          </div>
                          <span
                            className={s.reviewPill}
                            style={{ color: "#2d65e6", backgroundColor: "#2d65e622" }}
                          >
                            Отзыв
                          </span>
                        </div>

                        <div className={s.reviewRatingsRow}>
                          <span className={s.reviewChip}>★ Тур: {ratings.tour}/5</span>
                          <span className={s.reviewChip}>🚌 Транспорт: {ratings.transport}/5</span>
                          <span className={s.reviewChip}>👤 Гид: {ratings.guide}/5</span>
                        </div>

                        <div className={s.reviewDivider} />

                        <div className={s.reviewBlocks}>
                          {blocks.map((block, blockIdx) => (
                            <div key={blockIdx} className={s.reviewBlock}>
                              <div className={s.reviewBlockTitleRow}>
                                <span className={s.reviewBlockTitle}>{block.title}</span>
                                <span className={s.reviewStars}>
                                  {"★".repeat(Math.max(0, Math.min(5, block.score || 0))).padEnd(5, "☆")}
                                </span>
                              </div>
                              <p className={s.reviewText}>{block.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {showQrScreen && guideView ? (
          <div className={s.qrOverlay} role="dialog" aria-modal="true">
            <div className={s.qrSheet}>
              <header className={s.qrHeader}>
                <button
                  type="button"
                  className={s.qrBack}
                  onClick={() => setShowQrScreen(false)}
                  aria-label="Назад"
                >
                  <span className={s.qrBackIcon}>‹</span>
                </button>
                <div className={s.qrHeaderCenter}>
                  <h1 className={s.qrTitle}>Отзывы после тура</h1>
                  <span className={s.qrSubtitle}>Tour feedback QR</span>
                </div>
                <div style={{ width: 40 }} />
              </header>

              <div className={s.qrContent}>
                    <div className={s.qrCard}>
                      <div className={s.qrTourInfo}>
                        <h2 className={s.qrTourTitle}>{qrTourTitle}</h2>
                        <p className={s.qrTourMeta}>{qrMeta || "—"}</p>
                      </div>

                  <div className={s.qrBlock}>
                    <div className={s.qrImageWrap}>
                      <img
                        alt="QR code for tour feedback"
                        className={s.qrImage}
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4Tv1i9kiE6AymwD9WNBba1b8S_fjXQmqE7Q9vw9FNkkGBwqBssk1viDlVt7nejMenF0dRsMGInuSia6OWH4zBus9PFGRK9LBbjlvi3YxtInzsJdMqLgJlPLCGqAIsVMbp_94gaHn1QFkd-L5N5IvcrVIQU2TRJWtA3LxVuXMk9r_ATY6CY5AJOhaxiKoxAxWsR_iK4PfJjg5uv2TjA1y1GN6m_gf6UOMxv3MSFjP4cgNcEViWb6sE6VJaIyyuVUY8RgIxHJJZ5g"
                      />
                    </div>
                    <p className={s.qrHint}>
                      Попросите туристов отсканировать QR-код, чтобы оставить отзыв о гиде, водителе и самом туре.
                    </p>
                  </div>

                      <div className={s.qrActions}>
                        <div className={s.qrLinkRow}>
                          <span className={s.qrLinkIcon}>🔗</span>
                          {feedbackLink ? (
                            <>
                              <a className={s.qrLinkText} href={feedbackLink}>{feedbackLink}</a>
                              <button type="button" className={s.qrCopyBtn} onClick={handleCopyFeedback}>Скопировать</button>
                            </>
                          ) : (
                            <span className={s.qrLinkText}>Сначала сгенерируйте ссылку</span>
                          )}
                        </div>
                        <button
                          className={s.qrShareBtn}
                          type="button"
                          onClick={handleShareFeedback}
                          disabled={!feedbackLink}
                        >
                          <span className={s.qrShareIcon}>⇪</span>
                          Поделиться ссылкой
                        </button>
                        {copyMsg ? (
                          <div className={s.qrCopyNote} role="status" aria-live="polite">
                            {copyMsg}
                          </div>
                        ) : null}
                        {linkError ? (
                          <div className={s.qrCopyNote} style={{ color: "#ef4444" }}>
                            {linkError}
                          </div>
                        ) : null}
                      </div>
                    </div>

                <div className={s.qrHowTo}>
                  <h3 className={s.qrHowTitle}>Как использовать</h3>
                  <ul className={s.qrHowList}>
                    <li className={s.qrHowItem}>
                      <span className={s.qrHowBadge}>1</span>
                      <p>Откройте этот экран после завершения экскурсии.</p>
                    </li>
                    <li className={s.qrHowItem}>
                      <span className={s.qrHowBadge}>2</span>
                      <p>Покажите QR-код группе для быстрого перехода к форме.</p>
                    </li>
                    <li className={s.qrHowItem}>
                      <span className={s.qrHowBadge}>3</span>
                      <p>При необходимости скопируйте ссылку и отправьте её в чат группы вручную.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
