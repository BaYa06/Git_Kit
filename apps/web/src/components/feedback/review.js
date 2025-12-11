import s from "./review.module.css";

export default function FeedbackReview() {
  return (
    <div className={s.sheetPage}>
      <div className={s.sheetOverlay} />
      <div className={s.sheetContainer}>
        <div className={s.sheetHandleWrap}>
          <div className={s.sheetHandle} />
        </div>
        <div className={s.sheetHeader}>
          <div className={s.sheetHeaderSpacer} />
          <h3 className={s.sheetTitle}>Оставить отзыв о туре</h3>
          <button type="button" className={s.sheetClose}>
            ✕
          </button>
        </div>
        <p className={s.sheetSubtitle}>
          Пожалуйста, оцените гида, транспорт и тур.
        </p>

        <div className={s.sheetBody}>
          <label className={s.field}>
            <p className={s.fieldLabel}>Имя туриста</p>
            <input
              className={s.input}
              placeholder="Введите ваше имя"
              defaultValue=""
            />
          </label>

          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIcon}>👤</span>
              <p className={s.sectionTitle}>Гид</p>
            </div>
            <div className={s.starsRow}>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starEmpty}>★</span>
            </div>
            <textarea
              className={s.textarea}
              rows={3}
              placeholder="Ваш комментарий о гиде..."
            />
          </div>

          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIcon}>🚌</span>
              <p className={s.sectionTitle}>Транспорт</p>
            </div>
            <div className={s.starsRow}>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
            </div>
            <textarea
              className={s.textarea}
              rows={3}
              placeholder="Ваш комментарий о транспорте..."
            />
          </div>

          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIcon}>🗺️</span>
              <p className={s.sectionTitle}>Тур</p>
            </div>
            <div className={s.starsRow}>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starFilled}>★</span>
              <span className={s.starEmpty}>★</span>
              <span className={s.starEmpty}>★</span>
            </div>
            <textarea
              className={s.textarea}
              rows={3}
              placeholder="Ваши общие впечатления о туре..."
            />
          </div>
        </div>

        <div className={s.sheetFooter}>
          <button type="button" className={s.submitBtn}>
            Отправить отзыв
          </button>
          <button type="button" className={s.cancelBtn}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
