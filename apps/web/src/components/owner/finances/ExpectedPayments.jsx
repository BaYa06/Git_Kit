import { useMemo, useState } from 'react';

const formatMoney = (value) => {
  const n = Number(value || 0);
  return n.toLocaleString('ru-RU');
};

export default function ExpectedPayments({ expected }) {
  const rows = expected?.rows || [];
  const total = Number(expected?.total || 0);
  const overdue = Number(expected?.overdue || 0);
  const monthLabel = useMemo(() => {
    if (!expected?.month?.start) return 'Текущий месяц';
    const dt = new Date(`${expected.month.start}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return 'Месяц';
    return dt.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  }, [expected]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const visible = open ? rows : rows.slice(0, 5);
  const paged = open
    ? visible.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
    : visible;

  const maxPage = open ? Math.max(1, Math.ceil(visible.length / pageSize)) : 1;

  const handleOpen = () => {
    setOpen(true);
    setPage(1);
  };
  const handleClose = () => setOpen(false);
  const nextPage = () => setPage((p) => Math.min(maxPage, p + 1));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-5 flex flex-col flex-1 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#111118] text-base font-bold">Просрочено</h3>
        <span className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase rounded">
          {monthLabel}
        </span>
      </div>

      {/* Total */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-[#111118]">{formatMoney(total)}</p>
          <span className="text-xs font-semibold text-[#616189]">KGS</span>
        </div>
        {overdue > 0 ? (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-medium bg-rose-50 w-fit px-2 py-0.5 rounded">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
            Просрочено: {formatMoney(overdue)} KGS
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
            Просрочек нет
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <div className="text-xs text-[#9ca3af]">Нет ожидаемых поступлений</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#f0f0f4]">
              {paged.map((payment) => (
                <tr key={payment.id} className="group">
                  <td className="py-2.5 pr-2">
                    <p className={`text-xs font-bold ${payment.isOverdue ? 'text-rose-600' : 'text-[#111118]'}`}>
                      {payment.date}
                    </p>
                  </td>
                  <td className="py-2.5 px-2">
                    <p className="text-xs font-medium text-[#111118]">{payment.client}</p>
                    <p className="text-[10px] text-[#616189]">{payment.tourName}</p>
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <p className="text-xs font-bold text-[#111118]">
                      {formatMoney(payment.dueAmount)} KGS
                    </p>
                    <span
                      className="text-[10px] text-rose-600 font-bold"
                    >
                      Просрочка
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > 5 && !open && (
        <button
          type="button"
          onClick={handleOpen}
          className="mt-3 text-xs font-semibold text-primary hover:text-primary-dark transition-colors self-start"
        >
          Открыть все ({rows.length})
        </button>
      )}

      {open ? (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] rounded-xl border border-[#e0e0e4] shadow-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-[#111118]">Все ожидаемые поступления</div>
              <div className="text-xs text-[#616189]">Показано {paged.length} из {rows.length}</div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-[#616189] hover:text-[#111118] p-2 rounded-lg hover:bg-[#f6f6f8]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto pr-1">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-[#f0f0f4]">
                {paged.map((payment) => (
                  <tr key={payment.id} className="group">
                    <td className="py-2.5 pr-2">
                      <p className={`text-xs font-bold ${payment.isOverdue ? 'text-rose-600' : 'text-[#111118]'}`}>
                        {payment.date}
                      </p>
                    </td>
                    <td className="py-2.5 px-2">
                      <p className="text-xs font-medium text-[#111118]">{payment.client}</p>
                      <p className="text-[10px] text-[#616189]">{payment.tourName}</p>
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                  <p className="text-xs font-bold text-[#111118]">
                    {formatMoney(payment.dueAmount)} KGS
                  </p>
                  <span className="text-[10px] text-rose-600 font-bold">Просрочка</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>

          {maxPage > 1 ? (
            <div className="flex items-center justify-between pt-3 text-xs text-[#616189]">
              <button
                type="button"
                onClick={prevPage}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-[#e0e0e4] bg-white hover:bg-[#f6f6f8] disabled:opacity-50"
              >
                Назад
              </button>
              <span>Стр. {page} / {maxPage}</span>
              <button
                type="button"
                onClick={nextPage}
                disabled={page === maxPage}
                className="px-3 py-1 rounded border border-[#e0e0e4] bg-white hover:bg-[#f6f6f8] disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
