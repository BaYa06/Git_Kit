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
} from "lucide-react";
import s from "../../../styles/admin.module.css";
import { useEffect, useState, useMemo } from "react";
const COMPONENT_LABELS = {
  transport: "Транспорт",
  hotel: "Отель",
  guide: "Гид",
};

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

export default function ToursTab({ tours = [], onTourClick }) {
  const [listTab, setListTab] = useState("active"); // active | past
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | confirmed | planned

  const filteredTours = useMemo(() => {
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00Z`).getTime() : null;
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59Z`).getTime() : null;
    const today = new Date();
    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

    return (tours || []).filter((t) => {
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
  }, [tours, dateFrom, dateTo, statusFilter, listTab]);

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

      {filteredTours && filteredTours.length > 0 && (
        <div className={s.toursList}>
          {filteredTours.map((t) => {
            const dateObj = t.start_date ? new Date(t.start_date) : null;
            const month = dateObj
              ? dateObj.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
              : "";
            const day = dateObj ? dateObj.getUTCDate() : "";
            const signed = Number.isFinite(t.tourists_signed)
              ? t.tourists_signed
              : "-";
            const needed = Number.isFinite(t.tourists_count)
              ? t.tourists_count
              : "-";
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
}) {
  const list = entityListsByType(type, { guides, hotels, drivers }) || [];
  const selected =
    list.find((item) => String(item.id) === String(selectedId)) || null;

  const placeholder =
    type === "guide"
      ? "Выберите гида"
      : type === "hotel"
      ? "Выберите отель"
      : "Выберите транспорт";

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
          {list.map((item) => (
            <option key={item.id} value={item.id}>
              {type === "guide"
                ? item.full_name || item.email || "Без имени"
                : type === "hotel"
                ? item.name || "Без названия"
                : [item.car_name, item.plate_number]
                    .filter(Boolean)
                    .join(" • ") || "Транспорт"}
            </option>
          ))}
        </select>
      ) : (
        <p className={s.templateEditorEmptyText}>
          Нет доступных {entityLabelByType(type)}ов в базе.
        </p>
      )}

      {selected && (
        <div style={{ marginTop: 12 }}>
          {type === "guide" && (
            <div className={s.guideCard}>
              <div className={s.guideCardHeader}>
                <p className={s.guideName}>
                  {selected.full_name || selected.email || "Без имени"}
                </p>
              </div>
              {selected.phone && (
                <div className={s.guideRow}>
                  <span className={s.guideLabel}>Телефон</span>
                  <span className={s.guideValue}>{selected.phone}</span>
                </div>
              )}
              {selected.email && (
                <div className={s.guideRow}>
                  <span className={s.guideLabel}>Email</span>
                  <span className={s.guideValue}>{selected.email}</span>
                </div>
              )}
            </div>
          )}

          {type === "transport" && (
            <div className={s.transportCard}>
              <div className={s.transportHeader}>
                <div>
                  <p className={s.transportTitle}>
                    {selected.car_name || "Транспорт"}
                  </p>
                  <p className={s.transportPlate}>{selected.plate_number}</p>
                </div>
              </div>
              <div className={s.transportBody}>
                <div className={s.transportRow}>
                  <span className={s.transportLabel}>Водитель:</span>
                  <span className={s.transportValue}>
                    {selected.full_name || "—"}
                  </span>
                </div>
                {selected.phone && (
                  <div className={s.transportRow}>
                    <span className={s.transportLabel}>Телефон:</span>
                    <span className={s.transportValue}>{selected.phone}</span>
                  </div>
                )}
                <div className={s.transportRow}>
                  <span className={s.transportLabel}>Мест:</span>
                  <span className={s.transportValue}>{selected.seats || "-"}</span>
                </div>
                {selected.notes && (
                  <div className={s.transportRow}>
                    <span className={s.transportLabel}>Заметки:</span>
                    <span className={s.transportValue}>{selected.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === "hotel" && (
            <div className={s.hotelCard}>
              <div className={s.hotelCardHeader}>
                <div>
                  <h2 className={s.hotelTitle}>{selected.name}</h2>
                  {selected.stars ? (
                    <div className={s.hotelStarsRow}>
                      {renderStars(selected.stars)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={s.hotelCardBody}>
                {selected.phone && (
                  <div className={`${s.hotelRow}`}>
                    <div className={s.hotelRowIcon}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>{selected.phone}</p>
                  </div>
                )}

                {selected.meal_plan && (
                  <div className={s.hotelRow}>
                    <div className={s.hotelRowIcon}>
                      <Utensils className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>{selected.meal_plan}</p>
                  </div>
                )}

                {selected.address && (
                  <a
                    href={getAddressHref(selected.address)}
                    target="_blank"
                    rel="noreferrer"
                    className={`${s.hotelRow} ${s.hotelRowLink}`}
                  >
                    <div className={s.hotelRowIcon}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>{selected.address}</p>
                  </a>
                )}

                {(selected.checkin_from || selected.checkout_until) && (
                  <div className={s.hotelRow}>
                    <div className={s.hotelRowIcon}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>
                      Заезд с {formatTime(selected.checkin_from) || "14:00"} ·
                      Выезд до {formatTime(selected.checkout_until) || "12:00"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
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
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

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
      const parsedTourists = Number.isFinite(parseInt(touristsCount, 10))
        ? parseInt(touristsCount, 10)
        : null;

      const payload = {
        company_id: companyId,
        template_id: !isEditMode ? templateId || null : null,
        name: name.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        tourists_count: parsedTourists,
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

          <h1 className={s.templateEditorTitle}>
            {isEditMode ? "Редактировать тур" : "Новый тур"}
          </h1>

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

          <div className={s.templateEditorDatesRow}>
            <label className={s.templateEditorField}>
              <span className={s.templateEditorLabel}>Старт</span>
              <input
                type="date"
                className={s.templateEditorInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className={s.templateEditorField}>
              <span className={s.templateEditorLabel}>Конец</span>
              <input
                type="date"
                className={s.templateEditorInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          {/* 👇 НОВЫЙ БЛОК — КОЛИЧЕСТВО ТУРИСТОВ */}
          <div className={s.templateEditorField}>
            <span className={s.templateEditorLabel}>Количество туристов</span>
            <input
              type="number"
              min="1"
              className={s.templateEditorInput}
              value={touristsCount}
              onChange={(e) => setTouristsCount(e.target.value)}
              placeholder="Например: 17"
            />
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

              {!isLoading && (
                <div className={s.templateAccordionGrid}>
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
                    </details>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "tourists" && (
            <div className={s.templateEditorEmpty}>
              <p className={s.templateEditorEmptyTitle}>Туристы</p>
              <p className={s.templateEditorEmptyText}>
                Здесь позже будет список туристов, привязанный к этому туру.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
