import s from "../../../styles/guide.module.css";

export default function GuideTable() {
  return (
    <div className={s.card}>
      <div className={s.sectionTitle}>Расписание</div>
      <p className={s.sectionText}>
        Здесь будет расписание по дням и слотам. Пока оставляем заглушку.
      </p>
      <div className={s.emptyBox} style={{ marginTop: 10 }}>
        Нет событий на сегодня
      </div>
    </div>
  );
}
