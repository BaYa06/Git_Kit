import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

const palette = [
  { bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  { bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  { bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { bgColor: 'bg-rose-100', textColor: 'text-rose-600' },
  { bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
];

const formatCompactMoney = (value) => {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${Math.round(value)}`;
};

const formatUserName = ({ first_name, last_name, email }) => {
  const fullName = [first_name, last_name].filter(Boolean).join(' ').trim();
  return fullName || email || '—';
};

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '—';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : '';
  return (first + last).toUpperCase();
};

export default function TeamTable({ companyId, data, onViewDetails }) {
  const router = useRouter();
  const resolvedCompanyId = useMemo(() => {
    const id = companyId ?? router.query?.id ?? null;
    return Array.isArray(id) ? id[0] : id;
  }, [companyId, router.query?.id]);

  const [remoteData, setRemoteData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) return;
    if (!resolvedCompanyId) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/owner/team?companyId=${resolvedCompanyId}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        if (ignore) return;
        setRemoteData(Array.isArray(payload?.members) ? payload.members : []);
      })
      .catch((e) => {
        if (ignore) return;
        setRemoteData([]);
        setError(e?.message || 'Failed to load team stats');
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [data, resolvedCompanyId]);

  const tableData = useMemo(() => {
    if (Array.isArray(data)) return data;

    return (remoteData || []).map((member, index) => {
      const color = palette[index % palette.length];
      const name = formatUserName(member);
      const salesSom = (Number(member.sales_cents) || 0) / 100;

      return {
        id: member.id || `${index}`,
        name,
        initials: initialsFromName(name),
        bgColor: color.bgColor,
        textColor: color.textColor,
        sales: formatCompactMoney(salesSom),
        plan: 0,
        planColor: 'text-[#616189]',
        barColor: 'bg-[#f0f0f4]',
      };
    });
  }, [data, remoteData]);

  const awaitingCompany = !data && !resolvedCompanyId;
  const showEmptyState =
    !awaitingCompany && !loading && !error && (!tableData || tableData.length === 0);

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0f0f4] flex items-center justify-between">
        <h3 className="text-[#111118] text-lg font-bold">Эффективность команды</h3>
        <button 
          onClick={onViewDetails}
          className="text-[#1313ec] text-sm font-semibold hover:underline"
        >
          Подробнее
        </button>
      </div>
      
      <div className="p-0">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
            <tr>
              <th className="px-6 py-2 text-xs font-semibold text-[#616189]">Менеджер</th>
              <th className="px-6 py-2 text-xs font-semibold text-[#616189] text-right">Продажи</th>
              <th className="px-6 py-2 text-xs font-semibold text-[#616189] text-right">План</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f4]">
            {awaitingCompany && (
              <tr>
                <td className="px-6 py-6 text-sm text-[#616189]" colSpan={3}>
                  Загрузка...
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td className="px-6 py-6 text-sm text-[#616189]" colSpan={3}>
                  Загрузка...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td className="px-6 py-6 text-sm text-rose-600" colSpan={3}>
                  Не удалось загрузить данные: {error}
                </td>
              </tr>
            )}

            {showEmptyState && (
              <tr>
                <td className="px-6 py-6 text-sm text-[#616189]" colSpan={3}>
                  В компании нет админов.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              tableData.map((member) => (
              <tr key={member.id} className="hover:bg-[#f8f8fa]">
                <td className="px-6 py-3 flex items-center gap-3">
                  <div className={`size-8 rounded-full ${member.bgColor} ${member.textColor} flex items-center justify-center text-xs font-bold`}>
                    {member.initials}
                  </div>
                  <span className="text-sm font-medium text-[#111118]">{member.name}</span>
                </td>
                <td className="px-6 py-3 text-right text-sm text-[#111118] font-bold">
                  {member.sales}
                </td>
                <td className="px-6 py-3 w-32">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-xs font-medium ${member.planColor}`}>{member.plan}%</span>
                    <div className="w-16 h-1.5 bg-[#f0f0f4] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${member.barColor}`}
                        style={{ width: `${Math.min(member.plan, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
