import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import base from "../../../../styles/admin/base.module.css";
import tabs from "../../../../styles/admin/tabs.module.css";
import filters from "../../../../styles/admin/filters.module.css";
import guidesStyles from "../../../../styles/admin/guides.module.css";
import hotelsStyles from "../../../../styles/admin/hotels.module.css";
import transportStyles from "../../../../styles/admin/transport.module.css";
import cards from "../../../../styles/admin/cards.module.css";

const s = {
  ...base,
  ...tabs,
  ...filters,
  ...guidesStyles,
  ...hotelsStyles,
  ...transportStyles,
  ...cards,
};
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
  Mail,
  Languages,
  Notebook,
} from "lucide-react";

export default function BaseTab({
  guides = [],
  hotels = [],
  drivers = [],
  activeSubTab,
  onSubTabChange,
  onHotelEdit,
  onHotelMenu,
  onGuideMenu,
  onDriverMenu,
}) {

  // локальный стейт на случай, если сверху ничего не передали
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();


  const [innerSubTab, setInnerSubTab] = useState("guides");
  const subTab = activeSubTab || innerSubTab;
  const setSubTab = onSubTabChange || setInnerSubTab;

  const placeholder =
    subTab === "guides"
        ? "Поиск гида по имени или телефону"
        : subTab === "hotels"
        ? "Поиск отеля по названию или адресу"
        : subTab === "transport"
        ? "Поиск транспорта по авто или номеру"
        : "Поиск";

  const filteredGuides = (guides || []).filter((g) => {
    if (!query) return true;
    const text = [
      g.full_name,
      g.phone,
      g.email,
      Array.isArray(g.languages) ? g.languages.join(" ") : "",
      g.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes(query);
  });

    const filteredHotels = (hotels || []).filter((h) => {
    if (!query) return true;
    const text = [
        h.name,
        h.phone,
        h.meal_plan,
        h.address,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return text.includes(query);
    });

    const filteredDrivers = (drivers || []).filter((d) => {
    if (!query) return true;
    const text = [
        d.car_name,
        d.plate_number,
        d.full_name,
        d.phone,
        String(d.seats),
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return text.includes(query);
    });


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

  const initials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] || "").concat(parts[1][0] || "").toUpperCase();
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* === ГИДЫ === */}
      {subTab === "guides" && 
      (filteredGuides && filteredGuides.length > 0 ? (
            <>
            <div className={s.listHeader}>
                <span className={s.listHeaderLabel}>ФИО</span>
                <span className={s.listHeaderLabel}>Контакты</span>
            </div>

            <div className={s.guideList}>
                {filteredGuides.map((g) => (
                    <div key={g.id} className={s.guideCard}>
                        <div className={s.guideCardHeader}>
                        <div className={s.guideNameRow}>
                          <div className={s.guideAvatar}>
                            {g.logo_url ? (
                              <img src={g.logo_url} alt={g.full_name} className={s.guideAvatarImg} />
                            ) : (
                              <span className={s.guideAvatarFallback}>{initials(g.full_name)}</span>
                            )}
                          </div>
                          <div className={s.guideNameCol}>
                            <p className={s.guideName}>{g.full_name}</p>
                            <div className={s.guideRating}>
                              <span className={s.guideRatingValue}>{(g.avg_rating || 0).toFixed(1)}</span>
                              <span className={s.guideRatingStars}>
                                {"★".repeat(Math.round(g.avg_rating || 0)).padEnd(5, "☆")}
                              </span>
                              <span className={s.guideRatingCount}>({g.reviews_count || 0})</span>
                            </div>
                          </div>
                        </div>
                        <button
                            type="button"
                            className={s.guideCardAction}
                            onClick={() => onGuideMenu && onGuideMenu(g)}
                        >
                            <EllipsisVertical />
                        </button>
                        </div>

                        {g.phone && (
                          <a className={`${s.guideRow} ${s.guideRowLink}`} href={`tel:${g.phone}`}>
                            <span className={s.guideRowIcon}><Phone className="w-4 h-4" /></span>
                            <span className={s.guideLabel}>Телефон</span>
                            <span className={s.guideValue}>{g.phone}</span>
                          </a>
                        )}

                        {g.email && (
                          <div className={s.guideRow}>
                            <span className={s.guideRowIcon}><Mail className="w-4 h-4" /></span>
                            <span className={s.guideLabel}>Email</span>
                            <span className={s.guideValue}>{g.email}</span>
                          </div>
                        )}

                        <div className={s.guideRow}>
                          <span className={s.guideRowIcon}><Languages className="w-4 h-4" /></span>
                          <span className={s.guideLabel}>Языки</span>
                          <span className={s.guideValue}>
                            {Array.isArray(g.languages) && g.languages.length > 0
                              ? g.languages.join(", ")
                              : "-"}
                          </span>
                        </div>

                        {g.notes && (
                          <div className={s.guideRow}>
                            <span className={s.guideRowIcon}><Notebook className="w-4 h-4" /></span>
                            <span className={s.guideLabel}>Заметки</span>
                            <span className={s.guideValue}>{g.notes}</span>
                          </div>
                        )}
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
      {subTab === "transport" &&
        (filteredDrivers && filteredDrivers.length > 0 ? (
            <div className={s.transportList}>
            {filteredDrivers.map((d) => (
                <div key={d.id} className={s.transportCard}>
                <div className={s.transportHeader}>
                    <div>
                    <p className={s.transportTitle}>{d.car_name}</p>
                    <p className={s.transportPlate}>{d.plate_number}</p>
                    </div>
                    <button
                    type="button"
                    className={s.transportAction}
                    onClick={() => onDriverMenu && onDriverMenu(d)}
                    >
                    <EllipsisVertical />
                    </button>
                </div>

                <div className={s.transportBody}>
                    <div className={s.transportRow}>
                    <span className={s.transportLabel}>Водитель:</span>
                    <span className={s.transportValue}>{d.full_name}</span>
                    </div>
                    {d.phone && (
                    <a
                        href={`tel:${d.phone}`}
                        className={`${s.transportRow} ${s.transportRowLink}`}
                    >
                        <span className={s.transportLabel}>Телефон:</span>
                        <span className={s.transportValue}>{d.phone}</span>
                    </a>
                    )}
                    <div className={s.transportRow}>
                    <span className={s.transportLabel}>Мест:</span>
                    <span className={s.transportValue}>{d.seats}</span>
                    </div>
                    {d.notes && (
                    <div className={s.transportRow}>
                        <span className={s.transportLabel}>Заметки:</span>
                        <span className={s.transportValue}>{d.notes}</span>
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className={s.emptyState}>
            <p className={s.emptyTitle}>Транспорт не добавлен</p>
            <p className={s.emptyText}>
                Нажмите на кнопку «+», чтобы добавить автобус или машину.
            </p>
            </div>
        ))}


      {/* === ОТЕЛИ (из базы) === */}
    {subTab === "hotels" &&
    (filteredHotels && filteredHotels.length > 0 ? (
        <div className={s.hotelsList}>
        {filteredHotels.map((h) => (
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
