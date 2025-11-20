import { Flag, Hotel, Users, Orbit, CircleCheck, CirclePause, Calendar1, CalendarCheck, ChevronDown } from "lucide-react";
import s from "../../../styles/admin.module.css";

export default function DashboardTab() {
  return (
    <>
      {/* Все туры туры */}
      <h3 className={s.sectionHeading}>Все туры</h3>

      {/* Фильтры: диапазон дат + статусы (как в code.html) */}
      <div className={s.toursFilter}>
        <div className={s.toursFilterRow}>
          <label className={s.toursFilterField}>
            <p className={s.toursFilterLabel}>Период от</p>
            <div className={s.toursFilterInputWrapper}>
              <input
                type="text"
                placeholder="01.01.2024"
                className={s.toursFilterInput}
              />
              <span
                className={`material-symbols-outlined ${s.toursFilterIcon}`}
              >
                <Calendar1 className={`${s.icons_color_grey}`} />
              </span>
            </div>
          </label>

          <label className={s.toursFilterField}>
            <p className={s.toursFilterLabel}>Период до</p>
            <div className={s.toursFilterInputWrapper}>
              <input
                type="text"
                placeholder="31.12.2024"
                className={s.toursFilterInput}
              />
              <span
                className={`material-symbols-outlined ${s.toursFilterIcon}`}
              >
                <CalendarCheck className={`${s.icons_color_grey}`} />
              </span>
            </div>
          </label>
        </div>

        <div className={s.toursChipsRow}>
          <button type="button" className={`${s.toursChip} ${s.toursChipPrimary}`}>
            <span className={s.toursChipText}>Все</span>
            <span
              className={`material-symbols-outlined ${s.toursChipIcon}`}
            >
              <ChevronDown className={`w-4 h-4 ${s.icons_color_grey}`} />
            </span>
          </button>
          <button type="button" className={s.toursChip}>
            <span className={s.toursChipText}>Подвержденные</span>
          </button>
          <button type="button" className={s.toursChip}>
            <span className={s.toursChipText}>Собирается</span>
          </button>
          <button type="button" className={s.toursChip}>
            <span className={s.toursChipText}>Закончено</span>
          </button>
        </div>
      </div>

      <div className={s.toursList}>
        {/* Тур 1 */}
        <div className={s.tourItem}>
          <div className={s.tourDate}>
            <span className={s.tourMonth}>Nov</span>
            <span className={s.tourDay}>12</span>
          </div>
          <div className={s.tourBody}>
            <p className={s.tourTitle}>Ala-Archa Day Tour</p>
            <p className={s.tourMeta}>Сбор 08:30 • Гид: Асан</p>
            <div className={s.tour_position_confirmed}>
              <CircleCheck className={`w-4 h-4 ${s.icons_color_green}`} />
              <p className={s.tour_ready}>Confirmed</p>
            </div>
          </div>
          <div className={s.tourChevron}>
            <div className={s.count_people}>
              <Users className={`w-4 h-4 ${s.icons_color}`} />
              <p className={s.people_count_number}>10/12</p>
            </div>
            <p className={s.people_count_right}>›</p>
          </div>
        </div>

        {/* Тур 2 */}
        <div className={s.tourItem}>
          <div className={s.tourDate}>
            <span className={s.tourMonth}>Nov</span>
            <span className={s.tourDay}>15</span>
          </div>
          <div className={s.tourBody}>
            <p className={s.tourTitle}>Issyk-Kul Weekend</p>
            <p className={s.tourMeta}>2 дня • 32 туриста • Отель: Karven</p>
            <div className={s.tour_position_waiting}>
              <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
              <p className={s.tour_ready}>Pending</p>
            </div>
          </div>
          <div className={s.tourChevron}>
            <div className={s.count_people}>
              <Users className={`w-4 h-4 ${s.icons_color}`} />
              <p className={s.people_count_number}>5/10</p>
            </div>
            <p className={s.people_count_right}>›</p>
          </div>
        </div>

        {/* Тур 3 */}
        <div className={s.tourItem}>
          <div className={s.tourDate}>
            <span className={s.tourMonth}>Nov</span>
            <span className={s.tourDay}>20</span>
          </div>
          <div className={s.tourBody}>
            <p className={s.tourTitle}>City Tour Bishkek</p>
            <p className={s.tourMeta}>Вечерний тур • Гид: Асель</p>
            <div className={s.tour_position_waiting}>
              <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
              <p className={s.tour_ready}>Pending</p>
            </div>
          </div>
          <div className={s.tourChevron}>
            <div className={s.count_people}>
              <Users className={`w-4 h-4 ${s.icons_color}`} />
              <p className={s.people_count_number}>0/8</p>
            </div>
            <p className={s.people_count_right}>›</p>
          </div>
        </div>
      </div>
    </>
  );
}
