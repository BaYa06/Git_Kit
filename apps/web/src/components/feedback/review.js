import { useMemo, useState } from "react";
import s from "./review.module.css";

const clampRating = (v) => Math.max(0, Math.min(5, Number(v) || 0));

export default function FeedbackReview({
  token = "",
  tourName = "Тур",
  guideName = "Гид",
  startDate = "",
}) {
  const [touristName, setTouristName] = useState("");
  const [guideRating, setGuideRating] = useState(4);
  const [transportRating, setTransportRating] = useState(5);
  const [tourRating, setTourRating] = useState(3);
  const [guideComment, setGuideComment] = useState("");
  const [driverComment, setDriverComment] = useState("");
  const [tourComment, setTourComment] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const metaLine = useMemo(() => {
    const parts = [];
    if (startDate) parts.push(startDate);
    if (guideName) parts.push(guideName);
    return parts.join(" • ");
  }, [startDate, guideName]);

  const submitFeedback = async () => {
    if (!token) {
      setStatus("Нет токена ссылки");
      return;
    }
    setIsSubmitting(true);
    setStatus("");
    try {
      const res = await fetch("/api/v1/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          tourist_name: touristName,
          rating_guide: clampRating(guideRating),
          rating_transport: clampRating(transportRating),
          rating_tour: clampRating(tourRating),
          guide_comment: guideComment,
          driver_comment: driverComment,
          tour_comment: tourComment,
        }),
      });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось отправить отзыв");
      }
      setStatus("Отзыв отправлен, спасибо!");
      setGuideComment("");
      setDriverComment("");
      setTourComment("");
    } catch (e) {
      setStatus(e.message || "Ошибка отправки");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (value, onChange) => {
    return (
      <div className={s.starsRow}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <button
            type="button"
            key={idx}
            className={idx <= value ? s.starFilled : s.starEmpty}
            onClick={() => onChange(idx)}
            aria-label={`Оценка ${idx}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

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
        <p className={s.meta}>{metaLine}</p>

        <div className={s.sheetBody}>
          <label className={s.field}>
            <p className={s.fieldLabel}>Имя туриста</p>
            <input
              className={s.input}
              placeholder="Введите ваше имя"
              value={touristName}
              onChange={(e) => setTouristName(e.target.value)}
            />
          </label>

          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIcon}>👤</span>
              <p className={s.sectionTitle}>Гид</p>
            </div>
            {renderStars(guideRating, setGuideRating)}
            <textarea
              className={s.textarea}
              rows={3}
              placeholder="Ваш комментарий о гиде..."
              value={guideComment}
              onChange={(e) => setGuideComment(e.target.value)}
            />
          </div>

          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIcon}>🚌</span>
              <p className={s.sectionTitle}>Транспорт</p>
            </div>
            {renderStars(transportRating, setTransportRating)}
            <textarea
              className={s.textarea}
              rows={3}
              placeholder="Ваш комментарий о транспорте..."
              value={driverComment}
              onChange={(e) => setDriverComment(e.target.value)}
            />
          </div>

          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIcon}>🗺️</span>
              <p className={s.sectionTitle}>Тур</p>
            </div>
            {renderStars(tourRating, setTourRating)}
            <textarea
              className={s.textarea}
              rows={3}
              placeholder="Ваши общие впечатления о туре..."
              value={tourComment}
              onChange={(e) => setTourComment(e.target.value)}
            />
          </div>
        </div>

        <div className={s.sheetFooter}>
          {status ? <div className={s.status}>{status}</div> : null}
          <button
            type="button"
            className={s.submitBtn}
            onClick={submitFeedback}
            disabled={isSubmitting}
          >
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
