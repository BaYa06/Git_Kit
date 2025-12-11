import {
  Edit3,
  HelpCircle,
  LogOut,
  Settings,
  Star,
  User,
} from "lucide-react";
import s from "../../../styles/guide.module.css";

export default function GuideProfile({ company, guide, feedbackStats }) {
  const stats = feedbackStats || { count: 0, avg: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const total = stats.count || 0;
  const dist = stats.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const avgScore = Number(stats.avg) || 0;
  const roundedAvg = Math.max(0, Math.min(5, Math.round(avgScore)));
  const ratingStats = [5, 4, 3, 2, 1].map((score) => ({
    score,
    percent: total > 0 ? Math.round(((dist[score] || 0) / total) * 100) : 0,
  }));

  const displayName = guide?.name || "Без имени";
  const email = guide?.email || "";
  const languages =
    Array.isArray(guide?.languages) && guide.languages.length > 0
      ? guide.languages
      : ["Русский", "English"];

  return (
    <div className={s.profilePage}>
      <div className={s.profileHeader}>
        <div className={s.profileAvatarWrap}>
          <div
            className={s.profileAvatar}
            aria-label="Guide avatar"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCoDetySPfuiF9-dZqxMekJiSKWoOHFXCubovvG0G3PXaj--z5E-KmR3U07JBzGTsZheKQqJITxZAMAZM5fGZVk9p5MBGVcxQYKNKpH8F37O-5vamMzn3zi_Ga6TVaerhzz4Rh6oqyORmxHzpIXXp31DjTyhHElyoJqPvEORph1nNXzC_MyC189U5fpSyCXsvLktuHz0Gc92uRnA3_SQdOj9Z6GCha-pT0sw5gRZ-PwF2NmIDyAbJ_DsojmHNSVD7n_QFdQ81NgjA')",
            }}
          />
          <div className={s.profileAvatarBadge}>
            <Edit3 className="w-4 h-4" />
          </div>
        </div>
        <div className={s.profileNameBlock}>
          <p className={s.profileName}>{displayName}</p>
          <p className={s.profileEmail}>{email}</p>
        </div>
      </div>

      <div className={s.profileDivider} />

      <div className={s.profileRatingRow}>
        <div className={s.profileRatingSummary}>
          <p className={s.profileRatingValue}>{avgScore || 0}</p>
          <div className={s.profileStars}>
            {Array.from({ length: 5 }).map((_, idx) => {
              const filled = idx < roundedAvg;
              return (
                <Star
                  key={idx}
                  className={filled ? s.profileStarFilled : s.profileStarEmpty}
                />
              );
            })}
          </div>
          <p className={s.profileRatingCaption}>{stats.count || 0} отзывов</p>
        </div>
        <div className={s.profileRatingBreakdown}>
          {ratingStats.map((item) => (
            <div key={item.score} className={s.profileRatingRowItem}>
              <p className={s.profileRatingScore}>{item.score}</p>
              <div className={s.profileRatingBar}>
                <div
                  className={s.profileRatingBarFill}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <p className={s.profileRatingPercent}>{item.percent}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className={s.profileChips}>
        {languages.map((lang) => (
          <span key={lang} className={s.profileChip}>
            {lang}
          </span>
        ))}
      </div>

      <div className={s.profileSectionSpacer} />

      <div className={s.profileActionList}>
        <button type="button" className={s.profileAction}>
          <span className={s.profileActionIcon}>
            <User className="w-5 h-5" />
          </span>
          <span className={s.profileActionText}>Редактировать профиль</span>
          <span className={s.profileActionChevron}>›</span>
        </button>
        <button type="button" className={s.profileAction}>
          <span className={s.profileActionIcon}>
            <Settings className="w-5 h-5" />
          </span>
          <span className={s.profileActionText}>Настройки</span>
          <span className={s.profileActionChevron}>›</span>
        </button>
        <button type="button" className={s.profileAction}>
          <span className={s.profileActionIcon}>
            <HelpCircle className="w-5 h-5" />
          </span>
          <span className={s.profileActionText}>Поддержка</span>
          <span className={s.profileActionChevron}>›</span>
        </button>
      </div>

      <div className={s.profileGrow} />

      <div className={s.profileLogoutRow}>
        <button type="button" className={s.profileLogoutButton}>
          <span className={s.profileLogoutIcon}>
            <LogOut className="w-5 h-5" />
          </span>
          <span className={s.profileLogoutText}>Выйти</span>
        </button>
      </div>
    </div>
  );
}
