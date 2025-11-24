// pages/company/[id]/admin.js

import { useState } from "react";
import Link from "next/link";
import s from "../../../styles/admin.module.css";
import {
  Flag,
  Hotel,
  Users,
  Orbit,
  CircleCheck,
  CirclePause,
  LayoutDashboard,
  Map,
  Database,
  Files,
  Plus,
  Search,
  MoreVertical,
} from "lucide-react";
import DashboardTab from "../../../components/company/admin/DashboardTab";
import ToursTab from "../../../components/company/admin/ToursTab";
import BaseTab from "../../../components/company/admin/BaseTab";
import TemplatesTab from "../../../components/company/admin/TemplatesTab";



export async function getServerSideProps({ req, params }) {
  const jwt = require("jsonwebtoken");
  const { Pool } = require("pg");

  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  if (!pair) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    const token = decodeURIComponent(pair.split("=")[1]);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const [companyRes, roleRes, guidesRes, hotelsRes] = await Promise.all([
      // сама компания
      pool.query("SELECT id, name FROM companies WHERE id = $1", [params.id]),

      // твоя роль в этой компании
      pool.query(
        "SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1",
        [payload.sub, params.id]
      ),

      // все пользователи с ролью guide для этой компании
      pool.query(
        `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.phone,
          u.email
        FROM user_company_roles ucr
        JOIN users u ON u.id = ucr.user_id
        WHERE ucr.company_id = $1
          AND ucr.role = 'guide'
        ORDER BY
          u.first_name NULLS LAST,
          u.last_name NULLS LAST
        `,
        [params.id]
      ),

      // все отели компании
      pool.query(
        `
        SELECT
          id,
          name,
          stars,
          phone,
          meal_plan,
          address,
          checkin_from,
          checkout_until
        FROM hotels
        WHERE company_id = $1
        ORDER BY name
        `,
        [params.id]
      ),
    ]);

    await pool.end();

    if (!companyRes.rows[0]) {
      return { notFound: true };
    }

    const company = companyRes.rows[0];
    const role = roleRes.rows[0]?.role || null;

    // мапим строки из БД в формат для BaseTab (guides)
    const guides = (guidesRes.rows || []).map((row) => ({
      id: row.id,
      full_name:
        [row.first_name, row.last_name].filter(Boolean).join(" ") ||
        row.email ||
        "Без имени",
      phone: row.phone || "",
      email: row.email || "",
      languages: null, // нет отдельного поля — пусть BaseTab покажет "-"
    }));

    const hotels = (hotelsRes.rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      stars: row.stars || 0,
      phone: row.phone || "",
      meal_plan: row.meal_plan || "",
      address: row.address || "",
      checkin_from: row.checkin_from || null,
      checkout_until: row.checkout_until || null,
    }));

    // доступ к этой странице только owner/admin
    if (!(role === "owner" || role === "admin")) {
      return {
        redirect: {
          destination: `/company/${params.id}/manager`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        company,
        role,
        guides,
        hotels,
      },
    };
  } catch (e) {
    console.error("admin getServerSideProps error:", e);
    return { redirect: { destination: "/login", permanent: false } };
  }
}


const roleLabel = (r) => {
  if (!r) return null;
  if (r === "org_department" || r === "manager") return "manager";
  return r; // owner, admin, guide
};

export default function CompanyAdminPage({ company, role, guides, hotels }) {
  const [tab, setTab] = useState("dashboard");
  const [baseSubTab, setBaseSubTab] = useState("guides"); // guides | transport | hotels | info
  const [hotelList, setHotelList] = useState(hotels || []);

  const [guideList, setGuideList] = useState(guides || []);  // 🔹 локальный список гидов

  const [guideMenuGuide, setGuideMenuGuide] = useState(null);      // меню по трём точкам
  const [guideDeleteGuide, setGuideDeleteGuide] = useState(null); 

  const [hotelMenuHotel, setHotelMenuHotel] = useState(null);      // для меню «ред/удалить»
  const [hotelDeleteHotel, setHotelDeleteHotel] = useState(null);  // для подтверждения удаления


  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [hotelSaving, setHotelSaving] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: "",
    stars: "3",
    phone: "",
    meal_plan: "BB",
    address: "",
    checkin_from: "14:00",
    checkout_until: "12:00",
  });

  const [editingHotelId, setEditingHotelId] = useState(null);

  const normalizeTime = (value, fallback) => {
    if (!value) return fallback;
    const s = String(value);
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
    return fallback;
  };


  function openHotelModal() {
    setHotelForm({
      name: "",
      stars: "3",
      phone: "",
      meal_plan: "BB",
      address: "",
      checkin_from: "14:00",
      checkout_until: "12:00",
    });
    setHotelModalOpen(true);
  }

    function openHotelModalForCreate() {
      setEditingHotelId(null);
      setHotelForm({
        name: "",
        stars: "3",
        phone: "",
        meal_plan: "BB",
        address: "",
        checkin_from: "14:00",
        checkout_until: "12:00",
      });
      setHotelModalOpen(true);
    }

  function handleHotelEdit(hotel) {
    setEditingHotelId(hotel.id);
    setHotelForm({
      name: hotel.name || "",
      stars: String(hotel.stars || "3"),
      phone: hotel.phone || "",
      meal_plan: hotel.meal_plan || "BB",
      address: hotel.address || "",
      checkin_from: normalizeTime(hotel.checkin_from, "14:00"),
      checkout_until: normalizeTime(hotel.checkout_until, "12:00"),
    });
    setHotelModalOpen(true);
  }

  function handleHotelMenu(hotel) {
    setHotelMenuHotel(hotel);
  }

  async function handleHotelDeleteConfirm() {
    if (!hotelDeleteHotel) return;
    const id = hotelDeleteHotel.id;

    try {
      const res = await fetch("/api/v1/company/hotels/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          company_id: company.id,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && data.message) || "Не удалось удалить отель"
        );
      }

      // убираем из списка на фронте
      setHotelList((prev) => prev.filter((h) => h.id !== id));
      setHotelDeleteHotel(null);
    } catch (err) {
      alert(err.message || "Ошибка удаления отеля");
    }
  }

    function handleGuideMenu(guide) {
    setGuideMenuGuide(guide);
  }

  async function handleGuideDeleteConfirm() {
    if (!guideDeleteGuide) return;
    const userId = guideDeleteGuide.id;

    try {
      const res = await fetch("/api/v1/company/guides/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          user_id: userId,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && data.message) || "Не удалось удалить гида"
        );
      }

      // убираем гида из списка на фронте
      setGuideList((prev) => prev.filter((g) => g.id !== userId));
      setGuideDeleteGuide(null);
    } catch (err) {
      alert(err.message || "Ошибка удаления гида");
    }
  }


  function handleHotelFormChange(e) {
    const { name, value } = e.target;
    setHotelForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleHotelSubmit(e) {
    e.preventDefault();
    setHotelSaving(true);

    try {
      const payload = {
        company_id: company.id,
        name: hotelForm.name,
        stars: hotelForm.stars,
        phone: hotelForm.phone,
        meal_plan: hotelForm.meal_plan,
        address: hotelForm.address,
        checkin_from: hotelForm.checkin_from,
        checkout_until: hotelForm.checkout_until,
      };

      let url = "/api/v1/company/hotels/create";
      if (editingHotelId) {
        url = "/api/v1/company/hotels/update";
        payload.id = editingHotelId;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && data.message) || "Не удалось сохранить отель"
        );
      }

      if (data && data.hotel) {
        setHotelList((prev) => {
          if (!editingHotelId) {
            // создание
            return [...prev, data.hotel];
          }
          // редактирование
          return prev.map((h) =>
            h.id === data.hotel.id ? data.hotel : h
          );
        });
      }

      setHotelModalOpen(false);
      setEditingHotelId(null);
    } catch (err) {
      alert(err.message || "Ошибка сохранения отеля");
    } finally {
      setHotelSaving(false);
    }
  }

    // модалка приглашения гида (как у owner, но роль фиксирована)
  const [guideInviteOpen, setGuideInviteOpen] = useState(false)
  const [guideInviteSaving, setGuideInviteSaving] = useState(false)
  const [guideInviteIssued, setGuideInviteIssued] = useState(null) // { username, tempPassword } | null

  async function createGuideInvite(e) {
    e.preventDefault()
    setGuideInviteSaving(true)
    setGuideInviteIssued(null)
    try {
      const res = await fetch('/api/v1/company/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          role: 'guide', // тут всегда гид
        }),
      })

      let data = {}
      try { data = await res.json() } catch {}

      if (!res.ok) {
        const extra = [data.code, data.column, data.table].filter(Boolean).join(' • ')
        throw new Error(
          data.message
            ? `${data.message}${extra ? ` (${extra})` : ''}`
            : `Ошибка ${res.status}`,
        )
      }

      // показываем одноразовый логин/пароль
      if (data.credentials) {
        setGuideInviteIssued(data.credentials) // { username, tempPassword }
      } else {
        setGuideInviteOpen(false)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setGuideInviteSaving(false)
    }
  }

  return (
    <div className={s.page}>
      {/* Хедер с названием компании */}
      <header className={s.header}>
        <div className={`${s.shell} ${s.headerInner}`}>
          <Link href="/cabinet" className={s.backButton}>
            <span className={s.backIcon}>←</span>
          </Link>

          <div className={s.headerTitleWrap}>
            <div className={s.companyName}>{company.name}</div>
            {/* { <div className={s.sectionTitle}>{sectionTitle}</div> } */}
          </div>

          {roleLabel(role) && (
            <span className={s.roleBadge}>{roleLabel(role)}</span>
          )}
        </div>
      </header>

      {/* Основной контент */}
      <main className={s.main}>
        <div className={`${s.shell} ${s.mainInner}`}>
          {tab === "dashboard" && <DashboardTab />}
          {tab === "tours" && <ToursTab />}
          {tab === "base" && (
            <BaseTab
              guides={guideList}          // 🔹 вместо guides
              hotels={hotelList}
              activeSubTab={baseSubTab}
              onSubTabChange={setBaseSubTab}
              onHotelMenu={handleHotelMenu}
              onHotelEdit={handleHotelEdit}   // если есть
              onGuideMenu={handleGuideMenu}   // 🔹 добавили
            />
          )}
          {tab === "templates" && <TemplatesTab />}
        </div>

        {tab === "base" &&
          (baseSubTab === "guides" || baseSubTab === "hotels") && (
            <button
              type="button"
              onClick={() => {
                if (baseSubTab === "guides") {
                  setGuideInviteOpen(true);
                  setGuideInviteIssued(null);
                } else if (baseSubTab === "hotels") {
                  openHotelModalForCreate();
                }
              }}
              className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white ${s.add_button}`}
            >
              <Plus className={s.add_button_icon} />
            </button>
          )}
      </main>

      {/* Модалка приглашения гида */}
      {guideInviteOpen && (
        <div className={`fixed inset-0 z-40 bg-black/40 grid place-items-center px-4`}>
          <div className={`w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5 ${s.add_card}`}>
            {guideInviteIssued === null ? (
              <>
                <div className="text-lg font-semibold text-slate-100 text-center">
                  Новый гид
                </div>

                <form onSubmit={createGuideInvite} className={`mt-4 space-y-4`}>
                  <p className={`text-xs text-slate-500 ${s.add_card_color}`}>
                    После нажатия <span className="font-medium">«Сохранить»</span> будет
                    сгенерирован одноразовый логин и пароль для гида. Передайте их гиду.
                    Он должен сначала зарегистрироваться на сайте, затем в кабинете нажать
                    «Добавить компанию» → «Найти» и ввести этот логин и пароль.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setGuideInviteOpen(false)
                        setGuideInviteIssued(null)
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={guideInviteSaving}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-200 text-white hover:opacity-95 active:scale-[.99]"
                    >
                      {guideInviteSaving ? 'Создаём…' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Листок выдачи доступа для гида
              <div>
                <div className="text-lg font-semibold text-slate-100 text-center">
                  Доступ для гида создан
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Логин</span>
                    <span className="font-mono">{guideInviteIssued.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Пароль</span>
                    <span className="font-mono">{guideInviteIssued.tempPassword}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Попросите гида не передавать эти данные третьим лицам.
                    Логин и пароль работают только один раз для привязки компании.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGuideInviteOpen(false)
                        setGuideInviteIssued(null)
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-95 active:scale-[.99]"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hotelModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5">
            <div className="text-lg font-semibold text-slate-50 text-center">
              {editingHotelId ? "Редактировать отель" : "Новый отель"}
            </div>

            <form onSubmit={handleHotelSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-200 mb-1">Название</label>
                <input
                  name="name"
                  value={hotelForm.name}
                  onChange={handleHotelFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Например, Sunrise Hotel"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-200 mb-1">
                    Звёзды
                  </label>
                  <select
                    name="stars"
                    value={hotelForm.stars}
                    onChange={handleHotelFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-200 mb-1">
                    Вид питания
                  </label>
                  <select
                    name="meal_plan"
                    value={hotelForm.meal_plan}
                    onChange={handleHotelFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  >
                    <option value="RO">RO — без питания</option>
                    <option value="BB">BB — завтрак</option>
                    <option value="HB">HB — завтрак + ужин</option>
                    <option value="FB">FB — завтрак, обед, ужин</option>
                    <option value="AI">AI — всё включено</option>
                    <option value="UAI">UAI — ультра всё включено</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">
                  Телефон
                </label>
                <input
                  name="phone"
                  value={hotelForm.phone}
                  onChange={handleHotelFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="+996 ..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">Адрес</label>
                <input
                  name="address"
                  value={hotelForm.address}
                  onChange={handleHotelFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Город, район, улица"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-200 mb-1">
                    Check-in с
                  </label>
                  <input
                    type="time"
                    name="checkin_from"
                    value={hotelForm.checkin_from}
                    onChange={handleHotelFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-200 mb-1">
                    Check-out до
                  </label>
                  <input
                    type="time"
                    name="checkout_until"
                    value={hotelForm.checkout_until}
                    onChange={handleHotelFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={hotelSaving}
                  className="px-4 py-2 rounded-xl bg-primary text-sm text-white disabled:opacity-70"
                >
                  {hotelSaving ? "Сохраняем..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Меню для отеля (Редактировать / Удалить) */}
      {hotelMenuHotel && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center px-4">
          <div className="w-full max-w-md rounded-t-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div className="text-sm text-slate-400 text-center mb-2">
              {hotelMenuHotel.name}
            </div>

            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 text-slate-50 text-sm"
              onClick={() => {
                setHotelMenuHotel(null);
                // открываем уже существующий модал редактирования
                handleHotelEdit(hotelMenuHotel);
              }}
            >
              Редактировать
            </button>

            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-xl bg-red-600/10 text-red-400 text-sm"
              onClick={() => {
                setHotelMenuHotel(null);
                setHotelDeleteHotel(hotelMenuHotel);
              }}
            >
              Удалить
            </button>

            <button
              type="button"
              className="w-full text-center px-3 py-2 rounded-xl text-sm text-slate-400"
              onClick={() => setHotelMenuHotel(null)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Подтверждение удаления отеля */}
      {hotelDeleteHotel && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
            <div className="text-lg font-semibold text-slate-50 text-center">
              Удалить отель?
            </div>
            <p className="text-sm text-slate-300 text-center">
              Вы действительно хотите удалить отель «{hotelDeleteHotel.name}»?
              Это действие нельзя будет отменить.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-100"
                onClick={() => setHotelDeleteHotel(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-red-600 text-sm text-white"
                onClick={handleHotelDeleteConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Меню для гида (только Удалить) */}
      {guideMenuGuide && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center px-4">
          <div className="w-full max-w-md rounded-t-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div className="text-sm text-slate-400 text-center mb-2">
              {guideMenuGuide.first_name} {guideMenuGuide.last_name}
            </div>

            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-xl bg-red-600/10 text-red-400 text-sm"
              onClick={() => {
                setGuideMenuGuide(null);
                setGuideDeleteGuide(guideMenuGuide);
              }}
            >
              Удалить
            </button>

            <button
              type="button"
              className="w-full text-center px-3 py-2 rounded-xl text-sm text-slate-400"
              onClick={() => setGuideMenuGuide(null)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Подтверждение удаления гида */}
      {guideDeleteGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
            <div className="text-lg font-semibold text-slate-50 text-center">
              Удалить гида?
            </div>
            <p className="text-sm text-slate-300 text-center">
              Вы действительно хотите удалить гида «
              {guideDeleteGuide.first_name} {guideDeleteGuide.last_name}
              » из этой компании?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-100"
                onClick={() => setGuideDeleteGuide(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-red-600 text-sm text-white"
                onClick={handleGuideDeleteConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}




      {/* Нижнее меню */}
      <nav className={s.bottomNav}>
        <div className={`${s.shell} ${s.bottomNavInner}`}>
          <button
            type="button"
            onClick={() => setTab("dashboard")}
            className={
              tab === "dashboard"
                ? `${s.navItem} ${s.navItemActive}`
                : s.navItem
            }
          >
            <LayoutDashboard className={``} />
            <span className={s.navLabel}>Дашборд</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("tours")}
            className={
              tab === "tours" ? `${s.navItem} ${s.navItemActive}` : s.navItem
            }
          >
            <Map className={``} />
            <span className={s.navLabel}>Все туры</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("base")}
            className={
              tab === "base" ? `${s.navItem} ${s.navItemActive}` : s.navItem
            }
          >
            <Database className={``} />
            <span className={s.navLabel}>База</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("templates")}
            className={
              tab === "templates"
                ? `${s.navItem} ${s.navItemActive}`
                : s.navItem
            }
          >
            <Files className={``} />
            <span className={s.navLabel}>Шаблоны</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
