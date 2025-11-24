import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import s from "../../../styles/admin.module.css";
import {
  Phone,
  Utensils,
  MapPin,
  Star,
  StarHalf,
  EllipsisVertical,
  Bus,
  BusFront,
  CarFront,
  Users,
  Clock,
} from "lucide-react";

export default function BaseTab({
  guides = [],
  hotels = [],
  activeSubTab,
  onSubTabChange,
  onHotelEdit,
  onHotelMenu,
  onGuideMenu,  
}) {
  // локальный стейт на случай, если сверху ничего не передали
  const [innerSubTab, setInnerSubTab] = useState("guides");
  const subTab = activeSubTab || innerSubTab;
  const setSubTab = onSubTabChange || setInnerSubTab;

  const placeholder =
    subTab === "hotels"
      ? "Поиск по названию или локации..."
      : "Поиск";

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

  const formatTime = (t) => {
    if (!t) return null;
    const s = String(t);
    return s.slice(0, 5); // HH:MM
  };

  const getAddressHref = (addr) => {
    if (!addr) return null;
    const trimmed = String(addr).trim();

    // если уже https-ссылка — открываем как есть
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    // иначе — поиск в Google Maps
    const encoded = encodeURIComponent(trimmed);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  };

  return (
    <>
      {/* ВЕРХНИЙ НАВБАР ВНУТРИ БАЗЫ */}
      <div className={s.baseTabs}>
        <div className={s.baseTabsInner}>
          <button
            type="button"
            className={`${s.baseTab} ${
              subTab === "guides" ? s.baseTabActive : ""
            }`}
            onClick={() => setSubTab("guides")}
          >
            Гиды
          </button>
          <button
            type="button"
            className={`${s.baseTab} ${
              subTab === "transport" ? s.baseTabActive : ""
            }`}
            onClick={() => setSubTab("transport")}
          >
            Транспорт
          </button>
          <button
            type="button"
            className={`${s.baseTab} ${
              subTab === "hotels" ? s.baseTabActive : ""
            }`}
            onClick={() => setSubTab("hotels")}
          >
            Отели
          </button>
          <button
            type="button"
            className={`${s.baseTab} ${
              subTab === "info" ? s.baseTabActive : ""
            }`}
            onClick={() => setSubTab("info")}
          >
            Инфо
          </button>
        </div>
      </div>

      {/* ПОИСК (плейсхолдер меняется для Отелей) */}
      <div className={s.searchWrapper}>
        <span className={s.searchIcon}>
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          className={s.searchInput}
        />
      </div>

      {/* === ГИДЫ === */}
      {subTab === "guides" && (
        guides.length > 0 ? (
            <>
            <div className={s.listHeader}>
                <span className={s.listHeaderLabel}>ФИО</span>
                <span className={s.listHeaderLabel}>Контакты</span>
            </div>

            <div className={s.guideList}>
                {guides.map((g) => (
                    <div key={g.id} className={s.guideCard}>
                        <div className={s.guideCardHeader}>
                        <p className={s.guideName}>{g.full_name}</p>
                        <button
                            type="button"
                            className={s.guideCardAction}
                            onClick={() => onGuideMenu && onGuideMenu(g)}
                        >
                            <EllipsisVertical />
                        </button>
                        </div>

                        {g.phone && (
                        <div className={s.guideRow}>
                            <span className={s.guideLabel}>Телефон</span>
                            <span className={s.guideValue}>{g.phone}</span>
                        </div>
                        )}

                        {g.email && (
                        <div className={s.guideRow}>
                            <span className={s.guideLabel}>Email</span>
                            <span className={s.guideValue}>{g.email}</span>
                        </div>
                        )}

                        <div className={s.guideRow}>
                        <span className={s.guideLabel}>Языки</span>
                        <span className={s.guideValue}>
                            {Array.isArray(g.languages) && g.languages.length > 0
                            ? g.languages.join(', ')
                            : '-'}
                        </span>
                        </div>
                    </div>
                    ))}

            </div>
            </>
        ) : (
            <div className={s.emptyState}>
            <p className={s.emptyTitle}>Гиды не найдены</p>
            <p className={s.emptyText}>
                Добавьте первого гида в базе, чтобы он появился в этом списке.
            </p>
            </div>
        )
        )}


      {/* === ТРАНСПОРТ (как в code.html) === */}
      {subTab === "transport" && (
        <div className={s.transportList}>
          {/* Item 1 */}
          <div className={s.transportItem}>
            <div className={s.transportIconWrap}>
              <CarFront className={`${s.icons_color_grey}`} />
            </div>
            <div className={s.transportBody}>
              <p className={s.transportTitle}>Микроавтобус Mercedes Sprinter</p>
              <p className={s.transportMeta}>А 123 БВ 777</p>
            </div>
            <div className={s.transportRight}>
              <Users className={`w-4 h-4 ${s.icons_color_grey}`} />
              <p className={s.transportSeats}>20</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className={s.transportItem}>
            <div className={s.transportIconWrap}>
              <CarFront className={`${s.icons_color_grey}`} />
            </div>
            <div className={s.transportBody}>
              <p className={s.transportTitle}>Седан Toyota Camry</p>
              <p className={s.transportMeta}>К 456 МН 799</p>
            </div>
            <div className={s.transportRight}>
              <Users className={`w-4 h-4 ${s.icons_color_grey}`} />
              <p className={s.transportSeats}>4</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className={s.transportItem}>
            <div className={s.transportIconWrap}>
              <BusFront className={`${s.icons_color_grey}`} />
            </div>
            <div className={s.transportBody}>
              <p className={s.transportTitle}>Автобус Yutong ZK6122H9</p>
              <p className={s.transportMeta}>О 789 РС 750</p>
            </div>
            <div className={s.transportRight}>
              <Users className={`w-4 h-4 ${s.icons_color_grey}`} />
              <p className={s.transportSeats}>50</p>
            </div>
          </div>

          {/* Item 4 */}
          <div className={s.transportItem}>
            <div className={s.transportIconWrap}>
              <Bus className={`${s.icons_color_grey}`} />
            </div>
            <div className={s.transportBody}>
              <p className={s.transportTitle}>Минивэн Hyundai Staria</p>
              <p className={s.transportMeta}>Т 101 УХ 199</p>
            </div>
            <div className={s.transportRight}>
              <Users className={`w-4 h-4 ${s.icons_color_grey}`} />
              <p className={s.transportSeats}>8</p>
            </div>
          </div>
        </div>
      )}

      {/* === ОТЕЛИ (из базы) === */}
    {subTab === "hotels" &&
    (hotels && hotels.length > 0 ? (
        <div className={s.hotelsList}>
        {hotels.map((h) => (
            <div key={h.id} className={s.hotelCard}>
            <div className={s.hotelCardHeader}>
                <div>
                <h2 className={s.hotelTitle}>{h.name}</h2>
                {h.stars ? (
                    <div className={s.hotelStarsRow}>{renderStars(h.stars)}</div>
                ) : null}
                </div>
                <button
                    type="button"
                    className={s.hotelCardAction}
                    onClick={() => {
                        if (onHotelMenu) {
                        onHotelMenu(h);
                        } else if (onHotelEdit) {
                        onHotelEdit(h);
                        }
                    }}
                    >
                    <EllipsisVertical />
                </button>
            </div>

            <div className={s.hotelCardBody}>
                {h.phone && (
                <a
                    href={`tel:${h.phone}`}
                    className={`${s.hotelRow} ${s.hotelRowLink}`}
                >
                    <div className={s.hotelRowIcon}>
                    <Phone className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>{h.phone}</p>
                </a>
                )}

                {h.meal_plan && (
                <div className={s.hotelRow}>
                    <div className={s.hotelRowIcon}>
                    <Utensils className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>{h.meal_plan}</p>
                </div>
                )}

                {h.address && (
                <a
                    href={getAddressHref(h.address)}
                    target="_blank"
                    rel="noreferrer"
                    className={`${s.hotelRow} ${s.hotelRowLink}`}
                >
                    <div className={s.hotelRowIcon}>
                    <MapPin className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>{h.address}</p>
                </a>
                )}

                {(h.checkin_from || h.checkout_until) && (
                <div className={s.hotelRow}>
                    <div className={s.hotelRowIcon}>
                    <Clock className="w-4 h-4" />
                    </div>
                    <p className={s.hotelRowText}>
                    Заезд с {formatTime(h.checkin_from) || "14:00"} · Выезд до{" "}
                    {formatTime(h.checkout_until) || "12:00"}
                    </p>
                </div>
                )}
            </div>
            </div>
        ))}
        </div>
    ) : (
        <div className={s.emptyState}>
        <p className={s.emptyTitle}>Отели не найдены</p>
        <p className={s.emptyText}>
            Добавьте первый отель, чтобы он появился в этом списке.
        </p>
        </div>
    ))}


      {/* === ТРАНСПОРТ / ИНФО — пока заглушки === */}
      {(subTab === "info") && (
        <div className={s.emptyState}>
          <p className={s.emptyTitle}>
            {subTab === "transport" ? "Транспорт" : "Инфо"}
          </p>
          <p className={s.emptyText}>Здесь пока пусто.</p>
        </div>
      )}
    </>
  );
}
