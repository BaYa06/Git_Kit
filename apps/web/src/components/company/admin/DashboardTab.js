import { Flag, Hotel, Users, Orbit, CircleCheck, CirclePause } from "lucide-react";
import s from "../../../styles/admin.module.css";

export default function DashboardTab() {
  return (
    <>
      {/* Карточки-статистика */}
      <div className={s.cardsGrid}>
        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Active Tours</p>
            <span className={s.cardIcon}>
              <Flag className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>12</p>
          <p className={s.cardSub}>на этой неделе</p>
        </div>

        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Available Guides</p>
            <span className={s.cardIcon}>
              <Users className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>8</p>
          <p className={s.cardSub}>свободны завтра</p>
        </div>

        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Partner Hotels</p>
            <span className={s.cardIcon}>
              <Hotel className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>25</p>
          <p className={s.cardSub}>в базе</p>
        </div>

        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Plan Occupancy</p>
            <span className={s.cardIcon}>
              <Orbit className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>85%</p>
          <p className={s.cardSub}>заполненность туров</p>
        </div>
      </div>

      {/* Ближайшие туры */}
      <h3 className={s.sectionHeading}>Ближайшие туры</h3>

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
