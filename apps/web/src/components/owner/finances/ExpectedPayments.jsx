export default function ExpectedPayments({ payments }) {
  const defaultPayments = [
    {
      date: '18.12',
      isOverdue: false,
      client: 'Global Soft LLC',
      tourType: 'Корпоратив',
      amount: '450k',
      status: 'waiting',
      statusLabel: 'Ожидание',
    },
    {
      date: '16.12',
      isOverdue: true,
      client: 'Группа #402',
      tourType: 'Каракол Ски',
      amount: '120k',
      status: 'overdue',
      statusLabel: 'Overdue',
    },
    {
      date: '19.12',
      isOverdue: false,
      client: 'Иван Петров',
      tourType: 'Тур Выходного дня',
      amount: '24k',
      status: 'invoice',
      statusLabel: 'Счет',
    },
    {
      date: '20.12',
      isOverdue: false,
      client: 'Tech Solutions',
      tourType: 'Тимбилдинг',
      amount: '386k',
      status: 'waiting',
      statusLabel: 'Ожидание',
    },
  ];

  const data = payments || defaultPayments;

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'text-rose-600 font-bold';
      case 'waiting':
        return 'text-amber-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-5 flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#111118] text-base font-bold">Ожидаемые поступления</h3>
        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded">
          7 дней
        </span>
      </div>

      {/* Total */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-[#111118]">980 000</p>
          <span className="text-xs font-semibold text-[#616189]">KGS</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-medium bg-rose-50 w-fit px-2 py-0.5 rounded">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
          Просрочено: 210 000 KGS
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-[#f0f0f4]">
            {data.map((payment, index) => (
              <tr key={index} className="group">
                <td className="py-2.5 pr-2">
                  <p className={`text-xs font-bold ${payment.isOverdue ? 'text-rose-600' : 'text-[#111118]'}`}>
                    {payment.date}
                  </p>
                </td>
                <td className="py-2.5 px-2">
                  <p className="text-xs font-medium text-[#111118]">{payment.client}</p>
                  <p className="text-[10px] text-[#616189]">{payment.tourType}</p>
                </td>
                <td className="py-2.5 pl-2 text-right">
                  <p className="text-xs font-bold text-[#111118]">{payment.amount}</p>
                  <span className={`text-[10px] ${getStatusColor(payment.status)}`}>
                    {payment.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
