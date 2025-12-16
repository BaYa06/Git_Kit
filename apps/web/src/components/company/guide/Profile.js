import { Edit3, LogOut, Star, Trash2, Upload, User } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import s from "../../../styles/guide.module.css";

export default function GuideProfile({ company, guide, feedbackStats }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(guide?.logo_url || guide?.logoUrl || "");
  const [avatarModal, setAvatarModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);
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
      : ["Русский", "Английский"];
  const phone = guide?.phone || "";
  const initials = useMemo(() => {
    if (!displayName) return "G";
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] || "").concat(parts[1][0] || "").toUpperCase() || "G";
  }, [displayName]);

  const handleExit = () => {
    router.push("/cabinet");
  };

  const handleEditProfile = () => {
    router.push(`/company/${company.id}/guide/edit`);
  };

  useEffect(() => {
    if (guide?.logo_url || guide?.logoUrl) {
      setAvatarUrl(guide.logo_url || guide.logoUrl || "");
    }
  }, [guide?.logo_url, guide?.logoUrl]);

  const triggerFile = () => {
    setAvatarError("");
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setAvatarLoading(true);
    setAvatarError("");
    try {
      const fd = new FormData();
      fd.append("company_id", company.id);
      fd.append("photo", file);
      const res = await fetch("/api/v1/guides/photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Не удалось загрузить фото");
      }
      setAvatarUrl(data.logo_url || "");
      setAvatarModal(false);
    } catch (e) {
      setAvatarError(e.message || "Не удалось загрузить фото");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarLoading(true);
    setAvatarError("");
    try {
      const fd = new FormData();
      fd.append("company_id", company.id);
      fd.append("action", "remove");
      const res = await fetch("/api/v1/guides/photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Не удалось удалить фото");
      }
      setAvatarUrl("");
      setAvatarModal(false);
    } catch (e) {
      setAvatarError(e.message || "Не удалось удалить фото");
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className={s.profilePage}>
      <div className={s.profileHeader}>
        <div className={s.profileAvatarWrap}>
          <button
            type="button"
            className={s.profileAvatarButton}
            onClick={() => {
              setAvatarError("");
              setAvatarModal(true);
            }}
            aria-label="Изменить фото профиля"
          >
            <div
              className={s.profileAvatar}
              aria-label="Guide avatar"
              style={avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : {}}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Фото гида" className={s.profileAvatarImg} />
              ) : (
                <span className={s.profileAvatarFallback}>{initials}</span>
              )}
            </div>
            <div className={s.profileAvatarBadge}>
              <Edit3 className="w-4 h-4" />
            </div>
          </button>
        </div>
        <div className={s.profileNameBlock}>
          <p className={s.profileName}>{displayName}</p>
          <p className={s.profileEmail}>{email}</p>
          {phone && <p className={s.profileEmail}>{phone}</p>}
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
        <button type="button" className={s.profileAction} onClick={handleEditProfile}>
          <span className={s.profileActionIcon}>
            <User className="w-5 h-5" />
          </span>
          <span className={s.profileActionText}>Редактировать профиль</span>
          <span className={s.profileActionChevron}>›</span>
        </button>
      </div>

      <div className={s.profileGrow} />

      <div className={s.profileLogoutRow}>
        <button type="button" className={s.profileLogoutButton} onClick={handleExit}>
          <span className={s.profileLogoutIcon}>
            <LogOut className="w-5 h-5" />
          </span>
          <span className={s.profileLogoutText}>Выйти</span>
        </button>
      </div>

      {avatarModal ? (
        <div className={s.modalOverlay} role="dialog" aria-modal="true">
          <button
            type="button"
            className={s.modalBackdrop}
            aria-label="Закрыть окно смены фото"
            onClick={() => {
              if (avatarLoading) return;
              setAvatarModal(false);
              setAvatarError("");
            }}
          />
          <div className={`${s.modalSheet} ${s.avatarModalSheet}`}>
            <div className={s.modalHandle} />
            <h3 className={s.modalTitle}>Фото профиля</h3>
            <div className={s.avatarPreview}>
              <div
                className={s.avatarPreviewCircle}
                style={avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : {}}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Фото гида" className={s.profileAvatarImg} />
                ) : (
                  <span className={s.profileAvatarFallback}>{initials}</span>
                )}
              </div>
            </div>
            {avatarError ? <p className={s.modalError}>{avatarError}</p> : null}
            <div className={s.avatarActions}>
              <button
                type="button"
                className={s.avatarButton}
                onClick={triggerFile}
                disabled={avatarLoading}
              >
                {avatarLoading ? <span className={s.avatarButtonSpinner} /> : <Upload className="w-5 h-5" />}
                <span>Загрузить новое</span>
              </button>
              <button
                type="button"
                className={s.avatarGhostButton}
                onClick={handleRemovePhoto}
                disabled={avatarLoading || !avatarUrl}
              >
                <Trash2 className="w-5 h-5" />
                <span>Удалить фото</span>
              </button>
              <button
                type="button"
                className={s.avatarGhostButton}
                onClick={() => {
                  setAvatarModal(false);
                  setAvatarError("");
                }}
                disabled={avatarLoading}
              >
                Отмена
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className={s.fileInput}
              onChange={(e) => uploadAvatar(e.target.files?.[0])}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
