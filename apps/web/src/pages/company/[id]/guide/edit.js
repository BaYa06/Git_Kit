import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import s from "styles/guide.module.css";

const allowedLanguages = ["Кыргызский", "Русский", "Английский"];

export async function getServerSideProps({ req, params }) {
  const jwt = require("jsonwebtoken");
  const { Pool } = require("pg");

  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  if (!pair) return { redirect: { destination: "/login", permanent: false } };

  try {
    const token = decodeURIComponent(pair.split("=")[1]);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const [cRes, rRes, userRes] = await Promise.all([
      pool.query("SELECT id, name FROM companies WHERE id=$1", [params.id]),
      pool.query(
        "SELECT role FROM user_company_roles WHERE user_id=$1 AND company_id=$2 LIMIT 1",
        [payload.sub, params.id]
      ),
      pool.query(
        "SELECT id, email, phone, first_name, last_name FROM users WHERE id=$1 LIMIT 1",
        [payload.sub]
      ),
    ]);

    if (!cRes.rows[0]) return { notFound: true };
    const role = rRes.rows[0]?.role || null;
    if (role !== "guide") {
      return { redirect: { destination: `/company/${params.id}/manager`, permanent: false } };
    }

    const user = userRes.rows[0] || {};
    const guideRes = await pool.query(
      `
        SELECT id, full_name, email, phone, languages
        FROM guides
        WHERE company_id = $1
          AND (
            (email IS NOT NULL AND email = $2)
            OR (phone IS NOT NULL AND phone = $3)
          )
        LIMIT 1
      `,
      [params.id, user.email || null, user.phone || null]
    );
    const guide = guideRes.rows[0] || null;
    const fallbackName = (guide?.full_name || "").trim();
    const nameParts = fallbackName ? fallbackName.split(" ") : [];

    let initialLangs =
      Array.isArray(guide?.languages) && guide.languages.length > 0
        ? guide.languages.filter((l) => allowedLanguages.includes(l)).slice(0, 3)
        : ["Русский", "Английский"];
    if (!initialLangs || initialLangs.length === 0) {
      initialLangs = ["Русский", "Английский"];
    }

    const initial = {
      first_name: user.first_name || nameParts[0] || "",
      last_name: user.last_name || nameParts.slice(1).join(" ").trim() || "",
      email: guide?.email || user.email || "",
      phone: guide?.phone || user.phone || "",
      languages: initialLangs,
    };

    await pool.end();
    return { props: { company: cRes.rows[0], initial } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function GuideEditPage({ company, initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: initial.first_name || "",
    lastName: initial.last_name || "",
    email: initial.email || "",
    phone: initial.phone || "",
  });
  const [langs, setLangs] = useState(initial.languages || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleLang = (lang) => {
    setLangs((prev) => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== lang);
      }
      if (prev.length >= 3) return prev;
      return [...prev, lang];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/v1/guides/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          first_name: form.firstName.trim() || null,
          last_name: form.lastName.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          languages: langs,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Не удалось сохранить");
      }
      router.push(`/company/${company.id}/guide?tab=profile`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.editPage}>
      <div className={s.editShell}>
        <div className={s.editHeaderRow}>
          <button type="button" className={s.editBack} onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <div className={s.editTitle}>Профиль гида</div>
        </div>

        <form className={s.editCard} onSubmit={handleSubmit}>
          <div className={s.editGroup}>
            <label className={s.editLabel}>Имя</label>
            <input
              className={s.editInput}
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="Имя"
            />
          </div>
          <div className={s.editGroup}>
            <label className={s.editLabel}>Фамилия</label>
            <input
              className={s.editInput}
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Фамилия"
            />
          </div>
          <div className={s.editGroup}>
            <label className={s.editLabel}>Номер телефона</label>
            <input
              className={s.editInput}
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+996 ..."
            />
          </div>
          <div className={s.editGroup}>
            <label className={s.editLabel}>Почта</label>
            <input
              className={s.editInput}
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div className={s.editGroup}>
            <label className={s.editLabel}>Языки (до 3)</label>
            <div className={s.editLangList}>
              {allowedLanguages.map((lang) => {
                const active = langs.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    className={`${s.editLang} ${active ? s.editLangActive : ""}`}
                    onClick={() => toggleLang(lang)}
                  >
                    <span>{lang}</span>
                    {active && <Check className={s.editLangCheck} />}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className={s.editError}>{error}</div>}

          <button type="submit" className={s.editSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </>
            ) : (
              "Сохранить"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
