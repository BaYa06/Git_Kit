// pages/company/[id]/admin.js
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import base from "../../../styles/admin/base.module.css";
import navigation from "../../../styles/admin/navigation.module.css";
import cards from "../../../styles/admin/cards.module.css";

const s = { ...base, ...navigation, ...cards };
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
import ToursTab, {
  TemplatePickerModal,
  NewTourFromTemplateScreen,
} from "../../../components/company/admin/ToursTab";
import BaseTab from "../../../components/company/admin/BaseTab";
import TemplatesTab from "../../../components/company/admin/TemplatesTab";
import TemplateEditor from "../../../components/company/admin/TemplateEditor";



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

    const [companyRes, roleRes, guidesRes, hotelsRes, driversRes, toursRes] = await Promise.all([
      // компания
      pool.query("SELECT id, name FROM companies WHERE id = $1", [params.id]),

      // твоя роль
      pool.query(
        "SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1",
        [payload.sub, params.id]
      ),

      // гиды (нормализовано из таблицы guides)
      pool.query(
        `
        SELECT
          id,
          full_name,
          phone,
          email,
          languages,
          is_active,
          notes
        FROM guides
        WHERE company_id = $1
        ORDER BY full_name NULLS LAST
        `,
        [params.id]
      ),

      // отели
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

      // транспорт (drivers)
      pool.query(
        `
        SELECT
          id,
          company_id,
          full_name,
          phone,
          car_name,
          plate_number,
          seats,
          is_active,
          notes,
          created_at,
          updated_at
        FROM drivers
        WHERE company_id = $1
        ORDER BY full_name
        `,
        [params.id]
      ),

      // туры компании
      pool.query(
        `
        SELECT
          t.id,
          t.name,
          t.status,
          t.start_date,
          t.end_date,
          t.tourists_count,
          COALESCE(tg.total_guests, 0) AS tourists_signed,
          t.created_at,
          g.full_name AS main_guide_name,
          gc.guide_names,
          COALESCE(tc_meta.total_components, 0) AS total_components,
          COALESCE(tc_meta.filled_components, 0) AS filled_components,
          CASE
            WHEN COALESCE(tc_meta.total_components, 0) = 0 THEN 'planned'
            WHEN COALESCE(tc_meta.filled_components, 0) = COALESCE(tc_meta.total_components, 0)
              THEN 'confirmed'
            ELSE 'planned'
          END AS computed_status
        FROM tours t
        LEFT JOIN guides g ON g.id = t.main_guide_id
        LEFT JOIN LATERAL (
          SELECT array_agg(g2.full_name ORDER BY g2.full_name) AS guide_names
          FROM tour_components tc
          JOIN guides g2 ON g2.id = tc.guide_id
          WHERE tc.tour_id = t.id
            AND tc.type = 'guide'
            AND tc.guide_id IS NOT NULL
        ) gc ON TRUE
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS total_guests
          FROM tour_guests tg
          WHERE tg.tour_id = t.id
        ) tg ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS total_components,
            COUNT(*) FILTER (
              WHERE tc.guide_id IS NOT NULL
                 OR tc.hotel_id IS NOT NULL
                 OR tc.driver_id IS NOT NULL
                 OR tc.custom IS NOT NULL
            ) AS filled_components
          FROM tour_components tc
          WHERE tc.tour_id = t.id
        ) tc_meta ON TRUE
        WHERE t.company_id = $1
        ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC
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

    // мапим строки из guides
    const guides = (guidesRes.rows || []).map((row) => ({
      id: row.id,
      full_name: row.full_name || "Без имени",
      phone: row.phone || "",
      email: row.email || "",
      languages: Array.isArray(row.languages) ? row.languages : null,
      notes: row.notes || "",
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

    const drivers = (driversRes.rows || []).map((row) => ({
      id: row.id,
      full_name: row.full_name,
      phone: row.phone,
      car_name: row.car_name,
      plate_number: row.plate_number,
      seats: row.seats,
      notes: row.notes || "",
    }));

    const formatDate = (value) => {
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const tours = (toursRes.rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      start_date: formatDate(row.start_date),
      end_date: formatDate(row.end_date),
      tourists_count: row.tourists_count,
      tourists_signed: Number(row.tourists_signed) || 0,
      guide_names: Array.isArray(row.guide_names) ? row.guide_names : [],
      main_guide_name: row.main_guide_name || "",
      status:
        row.computed_status ||
        (row.status === "confirmed" || row.status === "active"
          ? "confirmed"
          : "planned"),
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
        drivers,
        tours,
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


export default function CompanyAdminPage({ company, role, guides, hotels, drivers, tours }) {
  const [tab, setTab] = useState("dashboard");
  const [baseSubTab, setBaseSubTab] = useState("guides"); // guides | transport | hotels | info
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [newTourOpen, setNewTourOpen] = useState(false);
  const [newTourTemplateId, setNewTourTemplateId] = useState(null);
  const [hotelList, setHotelList] = useState(hotels || []);

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);

  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [guideList, setGuideList] = useState(guides || []);  // 🔹 локальный список гидов

  const [guideMenuGuide, setGuideMenuGuide] = useState(null);      // меню по трём точкам
  const [guideDeleteGuide, setGuideDeleteGuide] = useState(null); 

  const [hotelMenuHotel, setHotelMenuHotel] = useState(null);      // для меню «ред/удалить»
  const [hotelDeleteHotel, setHotelDeleteHotel] = useState(null);  // для подтверждения удаления

  // 🔹 транспорт
  const [driverList, setDriverList] = useState(drivers || []);

  const [tourList, setTourList] = useState(tours || []);
  const [editingTourId, setEditingTourId] = useState(null);

  // 🔹 модалка транспорта
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [driverSaving, setDriverSaving] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [driverForm, setDriverForm] = useState({
    full_name: "",
    phone: "",
    car_name: "",
    plate_number: "",
    seats: "1",
    notes: "",
  });

  const [driverMenuDriver, setDriverMenuDriver] = useState(null);      // меню (ред/удалить)
  const [driverDeleteDriver, setDriverDeleteDriver] = useState(null);  // подтверждение удаления


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

  const handleDeleteTemplate = async (templateId) => {
    const ok = window.confirm("Удалить этот шаблон?");
    if (!ok) return;

    try {
      const res = await fetch("/api/v1/company/templates/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          company_id: company.id,
        }),
      });

      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось удалить шаблон");
      }

      // локально убираем из списка
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };


  const normalizeTime = (value, fallback) => {
    if (!value) return fallback;
    const s = String(value);
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
    return fallback;
  };

    function openDriverModalForCreate() {
    setEditingDriverId(null);
    setDriverForm({
      full_name: "",
      phone: "",
      car_name: "",
      plate_number: "",
      seats: "1",
      notes: "",
    });
    setDriverModalOpen(true);
  }

  function handleDriverFormChange(e) {
    const { name, value } = e.target;
    setDriverForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDriverEdit(driver) {
    setEditingDriverId(driver.id);
    setDriverForm({
      full_name: driver.full_name || "",
      phone: driver.phone || "",
      car_name: driver.car_name || "",
      plate_number: driver.plate_number || "",
      seats: String(driver.seats || "1"),
      notes: driver.notes || "",
    });
    setDriverModalOpen(true);
  }

  async function handleDriverSubmit(e) {
    e.preventDefault();
    setDriverSaving(true);
    try {
      const payload = {
        company_id: company.id,
        full_name: driverForm.full_name,
        phone: driverForm.phone,
        car_name: driverForm.car_name,
        plate_number: driverForm.plate_number,
        seats: driverForm.seats,
        notes: driverForm.notes,
      };

      let url = "/api/v1/company/drivers/create";
      if (editingDriverId) {
        url = "/api/v1/company/drivers/update";
        payload.id = editingDriverId;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && data.message) || "Не удалось сохранить транспорт"
        );
      }

      if (data && data.driver) {
        setDriverList((prev) => {
          if (!editingDriverId) {
            // новый
            return [...prev, data.driver];
          }
          // обновление
          return prev.map((d) => (d.id === data.driver.id ? data.driver : d));
        });
      }

      setDriverModalOpen(false);
      setEditingDriverId(null);
    } catch (err) {
      alert(err.message || "Ошибка сохранения транспорта");
    } finally {
      setDriverSaving(false);
    }
  }

  function handleDriverMenu(driver) {
    setDriverMenuDriver(driver);
  }

  async function handleDriverDeleteConfirm() {
    if (!driverDeleteDriver) return;
    const id = driverDeleteDriver.id;

    try {
      const res = await fetch("/api/v1/company/drivers/delete", {
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
          (data && data.message) || "Не удалось удалить транспорт"
        );
      }

      setDriverList((prev) => prev.filter((d) => d.id !== id));
      setDriverDeleteDriver(null);
    } catch (err) {
      alert(err.message || "Ошибка удаления транспорта");
    }
  }


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

  const reloadTemplates = async () => {
    if (!company?.id) return;
    try {
      const res = await fetch(
        `/api/v1/company/templates/list?company_id=${company.id}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!company?.id) return;

    const loadTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const res = await fetch(
          `/api/v1/company/templates/list?company_id=${company.id}`
        );
        if (!res.ok) {
          let data = {};
          try {
            data = await res.json();
          } catch (_) {}
          throw new Error(data.message || "Не удалось загрузить шаблоны");
        }
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (e) {
        console.error(e);
        setTemplatesError(e.message);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, [company?.id]);

  const handleOpenTemplate = (templateId) => {
    setEditingTemplateId(templateId);
    setTemplateEditorOpen(true);
  };

  const handleCreateTemplate = () => {
    setEditingTemplateId(null); // новый
    setTemplateEditorOpen(true);
  };

  const handleCopyTemplate = async (templateId) => {
    try {
      const res = await fetch("/api/v1/company/templates/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          company_id: company.id,
        }),
      });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}
        throw new Error(data.message || "Не удалось скопировать шаблон");
      }
      const data = await res.json();
      const newTemplate = data.template;
      setTemplates((prev) => [newTemplate, ...prev]);
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const handleTemplateSaved = () => {
    reloadTemplates();
    setTemplateEditorOpen(false);
    setEditingTemplateId(null);
  };

  const handleTemplatePicked = (tpl) => {
    if (!tpl) return;

    setNewTourTemplateId(tpl.id);
    setEditingTourId(null);
    setTemplatePickerOpen(false);
    setNewTourOpen(true);
  };

    // ВРЕМЕННО: заглушка для создания тура
  const handleCreateTourClick = () => {
    alert("Создание тура пока в разработке. Здесь будет форма создания тура 🙂");
  };

  const reloadTours = async () => {
    try {
      const res = await fetch(`/api/v1/tours/list?company_id=${company.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.tours)) {
        setTourList(data.tours);
      }
    } catch (e) {
      console.error("reload tours error", e);
    }
  };


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
          {tab === "dashboard" && (
            <DashboardTab
              tours={tourList}
              guides={guideList}
              hotels={hotelList}
              onTourClick={(tour) => {
                setEditingTourId(tour?.id || null);
                setNewTourTemplateId(null);
                setTemplatePickerOpen(false);
                setNewTourOpen(true);
              }}
            />
          )}
          {tab === "tours" && (
            <ToursTab
              guides={guideList}
              hotels={hotelList}
              drivers={driverList}
              tours={tourList}
              onTourClick={(tour) => {
                setEditingTourId(tour?.id || null);
                setNewTourTemplateId(null);
                setTemplatePickerOpen(false);
                setNewTourOpen(true);
              }}
            />
          )}
          {tab === "base" && (
            <BaseTab
              guides={guideList}
              hotels={hotelList}
              drivers={driverList}
              activeSubTab={baseSubTab}
              onSubTabChange={setBaseSubTab}
              onHotelMenu={handleHotelMenu}
              onHotelEdit={handleHotelEdit}
              onGuideMenu={handleGuideMenu}
              onDriverMenu={handleDriverMenu}
            />
          )}

          {tab === "templates" && !templateEditorOpen && (
            <TemplatesTab
              templates={templates}
              loading={templatesLoading}
              error={templatesError}
              onOpenTemplate={handleOpenTemplate}
              onCopyTemplate={handleCopyTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}

          {tab === "templates" && templateEditorOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-y-auto">
              <TemplateEditor
                companyId={company.id}
                templateId={editingTemplateId}   // null = новый, id = редактирование
                onClose={() => {
                  setTemplateEditorOpen(false);
                  setEditingTemplateId(null);
                }}
                onSaved={handleTemplateSaved}
              />
            </div>
          )}
        </div>

        {tab === "base" &&
          (baseSubTab === "guides" || baseSubTab === "hotels" || baseSubTab === "transport") && (
            <button
              type="button"
              onClick={() => {
                if (baseSubTab === "guides") {
                  setGuideInviteOpen(true);
                  setGuideInviteIssued(null);
                } else if (baseSubTab === "hotels") {
                  openHotelModalForCreate();
                } else if (baseSubTab === "transport") {
                  openDriverModalForCreate();
                }
              }}
              className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white ${s.add_button}`}
            >
              <Plus className={s.add_button_icon} />
            </button>
          )}

          {/* + на вкладке ДАШБОРД — быстрый старт создания тура */}
          {tab === "dashboard" && (
            <button
              type="button"
              onClick={() => setTemplatePickerOpen(true)}
              className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white ${s.add_button}`}
            >
              <Plus className={s.add_button_icon} />
            </button>
          )}

          {/* + на вкладке ВСЕ ТУРЫ — создание нового тура */}
          {tab === "tours" && (
            <button
              type="button"
              onClick={() => setTemplatePickerOpen(true)}
              className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white ${s.add_button}`}
            >
              <Plus className={s.add_button_icon} />
            </button>
          )}

          {tab === "templates" && !templateEditorOpen && (
            <button
              type="button"
              onClick={() => setTemplateEditorOpen(true)}
              className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white ${s.add_button}`}
            >
              <Plus className={s.add_button_icon} />
            </button>
          )}
      </main>

      <TemplatePickerModal
        open={templatePickerOpen}
        templates={templates}
        loading={templatesLoading}
        error={templatesError}
        onClose={() => setTemplatePickerOpen(false)}
        onSelectTemplate={handleTemplatePicked}
      />

      <NewTourFromTemplateScreen
        open={newTourOpen}
        templateId={newTourTemplateId}
        companyId={company.id}
        guides={guideList}
        hotels={hotelList}
        drivers={driverList}
        mode={editingTourId ? "edit" : "create"}
        tourId={editingTourId}
        onCreated={reloadTours}
        onClose={() => {
          setNewTourOpen(false);
          setNewTourTemplateId(null);
          setEditingTourId(null);
        }}
      />


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

      {/* Модалка транспорта: добавить / редактировать */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5">
            <div className="text-lg font-semibold text-slate-50 text-center">
              {editingDriverId ? "Редактировать транспорт" : "Новый транспорт"}
            </div>

            <form onSubmit={handleDriverSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-200 mb-1">
                  ФИО водителя
                </label>
                <input
                  name="full_name"
                  value={driverForm.full_name}
                  onChange={handleDriverFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Например, Иванов Иван"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">
                  Телефон
                </label>
                <input
                  name="phone"
                  value={driverForm.phone}
                  onChange={handleDriverFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="+996 ..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">
                  Название автомобиля
                </label>
                <input
                  name="car_name"
                  value={driverForm.car_name}
                  onChange={handleDriverFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Например, Hyundai County"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-200 mb-1">
                    Гос номер
                  </label>
                  <input
                    name="plate_number"
                    value={driverForm.plate_number}
                    onChange={handleDriverFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                    placeholder="KG 123 ABC"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-200 mb-1">
                    Мест
                  </label>
                  <input
                    type="number"
                    min={1}
                    name="seats"
                    value={driverForm.seats}
                    onChange={handleDriverFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">
                  Заметки (опционально)
                </label>
                <textarea
                  name="notes"
                  value={driverForm.notes}
                  onChange={handleDriverFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 min-h-[60px]"
                  placeholder="Например, говорит по-английски, просить ранний выезд и т.п."
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDriverModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={driverSaving}
                  className="px-4 py-2 rounded-xl bg-primary text-sm text-white disabled:opacity-70"
                >
                  {driverSaving ? "Сохраняем..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Меню транспорта (Редактировать / Удалить) */}
      {driverMenuDriver && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center px-4">
          <div className="w-full max-w-md rounded-t-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div className="text-sm text-slate-400 text-center mb-2">
              {driverMenuDriver.car_name} — {driverMenuDriver.plate_number}
            </div>

            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 text-slate-50 text-sm"
              onClick={() => {
                setDriverMenuDriver(null);
                handleDriverEdit(driverMenuDriver);
              }}
            >
              Редактировать
            </button>

            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-xl bg-red-600/10 text-red-400 text-sm"
              onClick={() => {
                setDriverMenuDriver(null);
                setDriverDeleteDriver(driverMenuDriver);
              }}
            >
              Удалить
            </button>

            <button
              type="button"
              className="w-full text-center px-3 py-2 rounded-xl text-sm text-slate-400"
              onClick={() => setDriverMenuDriver(null)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Подтверждение удаления транспорта */}
      {driverDeleteDriver && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
            <div className="text-lg font-semibold text-slate-50 text-center">
              Удалить транспорт?
            </div>
            <p className="text-sm text-slate-300 text-center">
              Вы действительно хотите удалить «{driverDeleteDriver.car_name} (
              {driverDeleteDriver.plate_number})»?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-100"
                onClick={() => setDriverDeleteDriver(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-red-600 text-sm text-white"
                onClick={handleDriverDeleteConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Нижнее меню */}
      {!(tab === "templates" && templateEditorOpen) && (
        <nav className={s.bottomNav}>
          <div className={`${s.shell} ${s.bottomNavInner}`}>
            <button
              type="button"
              onClick={() => {
                setTemplateEditorOpen(false);
                setTab("dashboard");
              }}
              className={
                tab === "dashboard"
                  ? `${s.navItem} ${s.navItemActive}`
                  : s.navItem
              }
            >
              <LayoutDashboard />
              <span className={s.navLabel}>Дашборд</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTemplateEditorOpen(false);
                setTab("tours");
              }}
              className={
                tab === "tours"
                  ? `${s.navItem} ${s.navItemActive}`
                  : s.navItem
              }
            >
              <Map />
              <span className={s.navLabel}>Все туры</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTemplateEditorOpen(false);
                setTab("base");
              }}
              className={
                tab === "base"
                  ? `${s.navItem} ${s.navItemActive}`
                  : s.navItem
              }
            >
              <Database />
              <span className={s.navLabel}>База</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTemplateEditorOpen(false);
                setTab("templates");
              }}
              className={
                tab === "templates"
                  ? `${s.navItem} ${s.navItemActive}`
                  : s.navItem
              }
            >
              <Files />
              <span className={s.navLabel}>Шаблоны</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
