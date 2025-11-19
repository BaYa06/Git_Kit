import s from "../../../styles/admin.module.css";

export default function TemplatesTab() {
  return (
    <div className={s.emptyState}>
      <p className={s.emptyTitle}>Шаблоны</p>
      <p className={s.emptyText}>Здесь позже появятся шаблоны документов и сообщений.</p>
    </div>
  );
}
