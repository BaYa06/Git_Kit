import s from "../../../styles/guide.module.css";

export default function GuideProfile({ company }) {
  return (
    <div className={s.card}>
      <div className={s.sectionTitle}>Профиль</div>
      <p className={s.sectionText}>
        Ваш аккаунт подключён к компании <span className={s.pill}>{company?.name}</span>.
        Здесь позже можно будет менять контакты и язык, а пока это экран-заглушка.
      </p>
    </div>
  );
}
