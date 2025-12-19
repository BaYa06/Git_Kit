import Head from 'next/head';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import OwnerSidebar from '@/components/owner/layout/OwnerSidebar';
import OwnerHeader from '@/components/owner/layout/OwnerHeader';
import { useEffect, useMemo, useState } from 'react';
import TrendChart from '@/components/owner/team/PerformanceChart';
import RatingsBlock from '@/components/owner/quality/RatingsBlock';

export async function getServerSideProps({ req, params }) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));

  if (!pair) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const token = decodeURIComponent(pair.split('=')[1]);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const [companyRes, roleRes, userRes] = await Promise.all([
      pool.query('SELECT id, name, logo_url FROM companies WHERE id = $1', [params.id]),
      pool.query(
        'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
        [payload.sub, params.id]
      ),
      pool.query(
        'SELECT id, first_name, last_name, email FROM users WHERE id = $1 LIMIT 1',
        [payload.sub]
      ),
    ]);

    await pool.end();

    if (!roleRes.rows[0]) {
      return { redirect: { destination: '/cabinet', permanent: false } };
    }

    const role = roleRes.rows[0].role;
    if (role !== 'owner') {
      return { redirect: { destination: `/company/${params.id}`, permanent: false } };
    }

    const company = companyRes.rows[0] || { id: params.id, name: 'Компания' };
    const user = userRes.rows[0] || {};
    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Owner';

    return {
      props: {
        company: {
          id: company.id,
          name: company.name,
          logoUrl: company.logo_url || null,
        },
        user: {
          id: user.id,
          name: userName,
          email: user.email,
          role: 'Owner',
        },
      },
    };
  } catch (e) {
    console.error('Quality page error:', e);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

const formatScore = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(1);
};

const negatives = [
  {
    name: 'Ольга С.',
    status: 'Open',
    tag: 'Гид',
    stars: 2,
    tour: 'Тур #402, 12 Дек',
    text: 'Гид опоздал на 20 минут и не извинился. Рассказывал скучно, много говорил по телефону.',
  },
  {
    name: 'Марк Т.',
    status: 'Resolved',
    tag: 'Транспорт',
    stars: 4,
    tour: 'Тур #399, 10 Дек',
    text: 'В автобусе было очень душно, кондиционер не работал. Водитель курил на остановках рядом с дверью.',
  },
  {
    name: 'Алина Р.',
    status: 'Open',
    tag: 'Отель',
    stars: 4,
    tour: 'Тур #405, 14 Дек',
    text: 'Номер был грязный при заселении.',
  },
];

export default function QualityPage({ company, user }) {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(null);
  const breakdown = quality?.breakdown || {};
  const hist = breakdown?.hist || {};
  const negatives = quality?.negatives || [];
  const trends = quality?.trends || { current: [], prev: [] };

  const buildBarsFromHist = (arr) => {
    const counts = Array.isArray(arr) && arr.length === 5 ? arr : [0, 0, 0, 0, 0];
    const max = Math.max(...counts);
    if (max === 0) return [0, 0, 0, 0, 0];
    return counts.map((c) => Math.max(4, Math.round((c / max) * 100)));
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/owner/quality?companyId=${id}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setQuality(data);
        } else {
          setQuality(null);
        }
      } catch (e) {
        console.error('quality load error', e);
        setQuality(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const qualityStats = useMemo(() => {
    const stats = quality?.stats || {};
    const negPercent =
      stats.reviews > 0 ? ((stats.negative / stats.reviews) * 100).toFixed(1) + '%' : '0%';
    const complaintsPercent =
      stats.reviews > 0 ? ((stats.complaints / stats.reviews) * 100).toFixed(1) + '%' : '0%';
    return [
      {
        label: 'Средняя оценка',
        value: formatScore(stats.avgAll),
        trend: loading ? '...' : 'по всем оценкам',
        icon: 'star',
        accent: 'amber',
      },
      {
        label: 'Отзывов',
        value: stats.reviews ?? '0',
        trend: loading ? '...' : 'все источники',
        icon: 'rate_review',
        accent: 'primary',
      },
      {
        label: 'Доля негативных',
        value: negPercent,
        trend: loading ? '...' : 'оценки 1-2',
        icon: 'thumb_down',
        accent: 'rose',
      },
      {
        label: 'Жалобы (Open/Total)',
        value: `${stats.complaints || 0} / ${stats.reviews || 0}`,
        trend: loading ? '...' : complaintsPercent,
        icon: 'report_problem',
        accent: 'amber',
      },
      {
        label: 'NPS',
        value: Number.isFinite(stats.nps) ? stats.nps : 0,
        trend: loading ? '...' : 'по рейтингу тура',
        icon: 'sentiment_satisfied',
        accent: 'primary',
      },
    ];
  }, [quality, loading]);

  return (
    <>
      <Head>
        <title>Контроль качества - {company?.name || 'Компания'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="bg-[#f6f6f8] text-[#111118] font-display antialiased overflow-hidden h-screen flex">
        <OwnerSidebar companyId={id} />

        <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#f6f6f8]">
          <OwnerHeader companyName={company?.name || 'Загрузка...'} user={user} />

          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1440px] mx-auto p-6 md:p-8 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#111118]">Контроль качества</h1>
                    <p className="text-[#616189] text-sm mt-1">Отзывы, оценки и слабые точки сервиса</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#616189] font-medium hidden xl:inline">Обновлено: 2 мин назад</span>
                      <button className="flex items-center gap-2 h-9 px-4 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-semibold shadow-sm hover:bg-[#f8f8fa]">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                        Экспорт
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-[#e0e0e4] shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-[#f0f0f4] rounded-lg p-1">
                      {['7 дней', '30 дней', 'Квартал', 'Кастом'].map((label, idx) => (
                        <button
                          key={label}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                            idx === 1 ? 'bg-white text-[#111118] shadow-sm' : 'text-[#616189] hover:text-[#111118]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="h-6 w-px bg-[#e0e0e4] hidden lg:block" />
                    <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium hover:border-[#cbd5e1]">
                      <span>Направление: Все</span>
                      <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
                    </button>
                    <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium hover:border-[#cbd5e1]">
                      <span>Источник: Все отзывы</span>
                      <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {qualityStats.map((card) => (
                  <div
                    key={card.label}
                    className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] flex flex-col gap-2 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between z-10">
                      <p className="text-[#616189] text-xs font-semibold uppercase tracking-wide">{card.label}</p>
                      <span className={`material-symbols-outlined ${card.accent === 'rose' ? 'text-rose-400' : card.accent === 'amber' ? 'text-amber-400' : 'text-primary/40'} group-hover:text-primary transition-colors`}>
                        {card.icon}
                      </span>
                    </div>
                    <div className="z-10">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[#111118]">{card.value}</p>
                        {card.label === 'Средняя оценка' && (
                          <span className="text-amber-500 material-symbols-outlined icon-fill text-xl">star</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 16 }}>trending_up</span>
                        <span className="text-xs font-medium text-emerald-600">{card.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { title: 'Гиды', score: breakdown.guide, accent: 'purple', issues: ['-'], hist: hist.guide },
                  { title: 'Транспорт', score: breakdown.transport, accent: 'blue', issues: ['-'], hist: hist.transport },
                  { title: 'Отели', score: breakdown.hotel, accent: 'amber', issues: ['-'], hist: hist.hotel },
                  { title: 'Туры (Программа)', score: breakdown.tour, accent: 'emerald', issues: ['-'], hist: hist.tour },
                ].map((pillar) => {
                  const bars = buildBarsFromHist(pillar.hist);
                  return (
                  <div
                    key={pillar.title}
                    className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] flex flex-col justify-between h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${pillar.accent === 'purple' ? 'bg-purple-50 text-purple-600' : pillar.accent === 'blue' ? 'bg-blue-50 text-blue-600' : pillar.accent === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <span className="material-symbols-outlined">
                            {pillar.title === 'Гиды' ? 'person' : pillar.title === 'Транспорт' ? 'directions_bus' : pillar.title === 'Отели' ? 'hotel' : 'map'}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#111118]">{pillar.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-[#111118]">
                          {formatScore(pillar.score)}
                        </span>
                        <span className="material-symbols-outlined icon-fill text-amber-500 text-sm">star</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[#616189] mb-2">Распределение оценок</p>
                      <div className="flex items-end gap-1 h-12">
                        {bars.map((h, idx) => (
                          <div
                            key={idx}
                            className="w-full rounded-t-sm"
                            style={{
                              height: `${Math.max(h, 4)}%`,
                              backgroundColor:
                                pillar.accent === 'purple'
                                  ? ['#e9d5ff', '#e9d5ff', '#c4b5fd', '#a78bfa', '#7c3aed'][idx]
                                  : pillar.accent === 'blue'
                                  ? ['#dbeafe', '#dbeafe', '#bfdbfe', '#60a5fa', '#2563eb'][idx]
                                  : pillar.accent === 'amber'
                                  ? ['#fef3c7', '#fef3c7', '#fde68a', '#f59e0b', '#d97706'][idx]
                                  : ['#d1fae5', '#d1fae5', '#a7f3d0', '#34d399', '#059669'][idx],
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[#616189] mb-2">Частые проблемы:</p>
                      <div className="flex flex-wrap gap-1">
                        {pillar.issues.map((issue) => (
                          <span key={issue} className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-md">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full py-2 border border-[#e0e0e4] rounded-lg text-sm font-semibold text-[#616189] hover:text-primary hover:bg-[#f0f0f4] transition-colors">
                      Посмотреть детали
                    </button>
                  </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#111118] text-lg font-bold">Тренды качества</h3>
                    <div className="flex bg-[#f0f0f4] rounded-lg p-0.5">
                      {['Общая', 'Гиды', 'Транспорт', 'Отели'].map((tab, idx) => (
                        <button
                          key={tab}
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            idx === 0 ? 'bg-white text-[#111118] font-bold shadow-sm' : 'text-[#616189] hover:text-[#111118]'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <TrendChart series={trends.current} prevSeries={trends.prev} />
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] flex flex-col h-[400px]">
                  <div className="px-6 py-4 border-b border-[#f0f0f4] flex items-center justify-between">
                    <h3 className="text-[#111118] text-lg font-bold">Негатив</h3>
                    <span className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">+3 сегодня</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0">
                    <div className="divide-y divide-[#f0f0f4]">
                      {negatives.length === 0 ? (
                        <div className="p-4 text-xs text-[#616189]">Нет негативных отзывов</div>
                      ) : (
                        negatives.map((item, idx) => (
                          <div key={`${item.name}-${idx}`} className="p-4 hover:bg-[#fafafa] transition-colors group cursor-pointer">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-bold text-[#111118]">{item.name}</p>
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] uppercase font-bold rounded">
                                Open
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-xs font-semibold px-1.5 rounded ${
                                  item.tag === 'Гид'
                                    ? 'text-primary bg-primary/5'
                                    : item.tag === 'Транспорт'
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-amber-600 bg-amber-50'
                                }`}
                              >
                                {item.tag}
                              </span>
                              <div className="flex text-amber-500 text-[10px]">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`material-symbols-outlined ${idx < item.rating ? 'icon-fill' : ''}`}
                                    style={{ fontSize: 12 }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] text-[#616189]">
                                {item.tour || ''}
                              </span>
                            </div>
                            <p className="text-xs text-[#444] line-clamp-2">{item.text || '—'}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-[#111118] text-lg font-bold">Слабые точки (Root Causes)</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#616189]">Категория:</span>
                    <select className="form-select text-sm border-[#e0e0e4] rounded-lg py-1.5 pl-3 pr-8 focus:ring-0 focus:border-primary">
                      <option>Все</option>
                      <option>Гиды</option>
                      <option>Транспорт</option>
                      <option>Отели</option>
                      <option>Программа</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Грубость / Коммуникация (Гиды)', count: '18 жалоб', percent: 45 },
                    { title: 'Грязный транспорт', count: '12 жалоб', percent: 32 },
                    { title: 'Опоздание на точку сбора', count: '9 жалоб', percent: 24 },
                    { title: 'Неясный тайминг тура', count: '7 жалоб', percent: 18 },
                    { title: 'Плохой сервис отеля (завтрак)', count: '5 жалоб', percent: 12 },
                  ].map((item) => (
                    <div key={item.title}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#111118]">{item.title}</span>
                        <span className="text-[#616189]">{item.count}</span>
                      </div>
                      <div className="w-full bg-[#f0f0f4] rounded-full h-2.5">
                        <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <RatingsBlock objects={quality?.objects} />

              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] flex flex-col items-center justify-center min-h-[220px] text-center p-6">
                <h3 className="text-lg font-bold text-[#111118] mb-2">План улучшений</h3>
                <p className="text-sm text-[#616189]">Скоро добавим эту функцию</p>
              </div>

              <div className="h-8" />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
