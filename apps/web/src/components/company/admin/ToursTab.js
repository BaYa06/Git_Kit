import s from "../../../styles/admin.module.css";

export default function ToursTab() {
  return (
    <div className={s.emptyState}>
      <p className={s.emptyTitle}>Все туры</p>
      <p className={s.emptyText}>Здесь позже появится список всех туров компании.</p>
    </div>
  );
}
