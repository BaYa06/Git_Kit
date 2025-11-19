import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import s from "../../../styles/admin.module.css";
import {Phone, Utensils, MapPin, Star, StarHalf, EllipsisVertical, Bus, BusFront, CarFront, Users} from "lucide-react";

export default function BaseTab() {
  // внутренняя вкладка: Гиды / Транспорт / Отели / Инфо
  const [subTab, setSubTab] = useState("guides"); // 'guides' | 'transport' | 'hotels' | 'info'

  const placeholder =
    subTab === "hotels"
      ? "Поиск по названию или локации..."
      : "Поиск";

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
        <>
          {/* Заголовок списка */}
          <div className={s.listHeader}>
            <span className={s.listHeaderLabel}>ФИО</span>
            <span className={s.listHeaderLabel}>Действия</span>
          </div>

          {/* Список гидов */}
          <div className={s.guideList}>
            <div className={s.guideCard}>
              <div className={s.guideCardHeader}>
                <p className={s.guideName}>Иванов Иван Иванович</p>
                <button type="button" className={s.guideMenuBtn}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Телефон</span>
                <span className={s.guideValue}>+7 (999) 123-45-67</span>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Email</span>
                <span className={s.guideValue}>ivanov.ivan@example.com</span>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Языки</span>
                <span className={s.guideValue}>Русский, Английский</span>
              </div>
            </div>

            <div className={s.guideCard}>
              <div className={s.guideCardHeader}>
                <p className={s.guideName}>Петрова Анна Сергеевна</p>
                <button type="button" className={s.guideMenuBtn}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Телефон</span>
                <span className={s.guideValue}>+7 (999) 987-65-43</span>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Email</span>
                <span className={s.guideValue}>petrova.anna@example.com</span>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Языки</span>
                <span className={s.guideValue}>Русский, Французский</span>
              </div>
            </div>

            <div className={s.guideCard}>
              <div className={s.guideCardHeader}>
                <p className={s.guideName}>Сидоров Пётр Олегович</p>
                <button type="button" className={s.guideMenuBtn}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Телефон</span>
                <span className={s.guideValue}>+7 (911) 555-88-99</span>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Email</span>
                <span className={s.guideValue}>sidorov.petr@example.com</span>
              </div>
              <div className={s.guideRow}>
                <span className={s.guideLabel}>Языки</span>
                <span className={s.guideValue}>Русский, Немецкий</span>
              </div>
            </div>
          </div>
        </>
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

      {/* === ОТЕЛИ (как в code.html) === */}
      {subTab === "hotels" && (
        <div className={s.hotelsList}>
          {/* Grand Hyatt */}
          <div className={s.hotelCard}>
            <div className={s.hotelCardHeader}>
              <div>
                <h2 className={s.hotelTitle}>Grand Hyatt</h2>
                <div className={s.hotelStarsRow}>
                  <Star className={`w-4 h-4 ${s.icons_color_yellow}`} />
                  <Star className={`w-4 h-4 ${s.icons_color_yellow}`} />
                  <Star className={`w-4 h-4 ${s.icons_color_yellow}`} />
                  <Star className={`w-4 h-4 ${s.icons_color_yellow}`} />
                  <StarHalf className={`w-4 h-4 ${s.icons_color_yellow}`} />
                </div>
              </div>
              <button type="button" className={s.hotelCardAction}>
                <EllipsisVertical className={`${s.icons_color_grey}`} />
              </button>
            </div>

            <div className={s.hotelCardBody}>
              <a
                href="tel:+12345678900"
                className={`${s.hotelRow} ${s.hotelRowLink}`}
              >
                <div className={s.hotelRowIcon}>
                  <Phone className={`w-4 h-4 ${s.icons_color_grey}`} />
                </div>
                <p className={s.hotelRowText}>+1 234 567 8900</p>
              </a>

              <div className={s.hotelRow}>
                <div className={s.hotelRowIcon}>
                  <Utensils className={`w-4 h-4 ${s.icons_color_grey}`} />
                </div>
                <p className={s.hotelRowText}>BB, HB, FB, AI</p>
              </div>

              <a href="#" className={`${s.hotelRow} ${s.hotelRowLink}`}>
                <div className={s.hotelRowIcon}>
                  <MapPin className={`w-4 h-4 ${s.icons_color_grey}`} />
                </div>
                <p className={s.hotelRowText}>Dubai, UAE</p>
              </a>
            </div>
          </div>

        </div>
      )}

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
