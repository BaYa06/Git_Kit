import { useEffect, useMemo, useState } from 'react';

const roles = [
  { id: 'admin', label: 'Админ', icon: 'admin_panel_settings', hint: 'Доступ к CRM и управлению' },
  { id: 'manager', label: 'Менеджер', icon: 'groups', hint: 'Продажи и работа с клиентами' },
  { id: 'guide', label: 'Гид', icon: 'hiking', hint: 'Работа с турами и туристами' },
];

const RoleCard = ({ role, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(role.id)}
    className={[
      'group w-full text-left rounded-xl border p-4 transition-all',
      selected
        ? 'border-primary/40 bg-primary/5 shadow-[0_8px_20px_-12px_rgba(79,70,229,0.35)]'
        : 'border-[#e0e0e4] bg-white hover:border-primary/25 hover:bg-[#fafafa]',
    ].join(' ')}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div
          className={[
            'size-10 rounded-lg flex items-center justify-center border',
            selected
              ? 'bg-primary text-white border-primary/30'
              : 'bg-[#f6f6f8] text-[#616189] border-[#e0e0e4] group-hover:border-primary/20',
          ].join(' ')}
        >
          <span className="material-symbols-outlined">{role.icon}</span>
        </div>
        <div>
          <div className="text-sm font-bold text-[#111118]">{role.label}</div>
          <div className="text-xs text-[#616189] mt-1">{role.hint}</div>
        </div>
      </div>
      <div
        className={[
          'size-5 rounded-full border flex items-center justify-center mt-1',
          selected ? 'border-primary bg-primary' : 'border-[#e0e0e4] bg-white',
        ].join(' ')}
      >
        {selected ? (
          <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>
            check
          </span>
        ) : null}
      </div>
    </div>
  </button>
);

const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(String(value));
    return true;
  } catch {
    return false;
  }
};

export default function InviteUserModal({ open, onClose, companyId, onCreated }) {
  const [selectedRole, setSelectedRole] = useState('manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState(null); // { username, tempPassword }
  const [copiedKey, setCopiedKey] = useState(null);

  const canSubmit = Boolean(companyId) && Boolean(selectedRole) && !isSubmitting;

  const title = useMemo(() => {
    const label = roles.find((r) => r.id === selectedRole)?.label || 'Сотрудник';
    return `Пригласить: ${label}`;
  }, [selectedRole]);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setCredentials(null);
    setCopiedKey(null);
    setIsSubmitting(false);
    setSelectedRole('manager');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onGenerate = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    setCopiedKey(null);

    try {
      const res = await fetch('/api/v1/company/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          role: selectedRole,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.message || `Ошибка ${res.status}`);
      }

      if (!data?.credentials?.username || !data?.credentials?.tempPassword) {
        throw new Error('Сервер не вернул логин/пароль');
      }

      setCredentials(data.credentials);
      onCreated?.();
    } catch (e) {
      setError(e.message || 'Ошибка генерации');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (key, value) => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onClose?.()}
        aria-label="Закрыть"
      />

      <div className="relative w-[92vw] max-w-[720px] bg-white rounded-2xl border border-[#e0e0e4] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f0f4] bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[#111118]">{title}</div>
            <div className="text-xs text-[#616189] mt-0.5">
              Сгенерируйте одноразовые логин и пароль для подключения компании в кабинете
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="text-[#616189] hover:text-[#111118] p-2 rounded-lg hover:bg-white/70 transition-colors"
            aria-label="Закрыть"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRole === role.id}
                onSelect={setSelectedRole}
              />
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 rounded-xl border border-[#e0e0e4] bg-[#fcfcfd] p-4">
            {!credentials ? (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#111118]">Шаг 2 — сгенерировать приглашение</div>
                  <div className="text-xs text-[#616189] mt-1">
                    После генерации сохраните данные — пароль показывается один раз
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    key
                  </span>
                  {isSubmitting ? 'Генерируем…' : 'Сгенерировать'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#111118]">Доступ готов</div>
                    <div className="text-xs text-[#616189] mt-1">
                      Передайте логин/пароль сотруднику — они вводятся в кабинете при подключении компании
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      verified
                    </span>
                    Сгенерировано
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e0e0e4] bg-white p-4">
                    <div className="text-[10px] uppercase font-bold text-[#616189]">Логин</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="font-mono text-sm font-bold text-[#111118] break-all">
                        {credentials.username}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('login', credentials.username)}
                        className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#f6f6f8] border border-[#e0e0e4] text-sm font-semibold text-[#111118] hover:bg-white transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          content_copy
                        </span>
                        {copiedKey === 'login' ? 'Скопировано' : 'Копировать'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e0e0e4] bg-white p-4">
                    <div className="text-[10px] uppercase font-bold text-[#616189]">Пароль</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="font-mono text-sm font-bold text-[#111118] break-all">
                        {credentials.tempPassword}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('password', credentials.tempPassword)}
                        className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#f6f6f8] border border-[#e0e0e4] text-sm font-semibold text-[#111118] hover:bg-white transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          content_copy
                        </span>
                        {copiedKey === 'password' ? 'Скопировано' : 'Копировать'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCredentials(null);
                      setError(null);
                      setCopiedKey(null);
                    }}
                    className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Сгенерировать ещё
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose?.()}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-[#e0e0e4] text-sm font-semibold text-[#111118] hover:bg-[#fafafa] transition-colors"
                  >
                    Готово
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      done
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#f0f0f4] bg-[#fcfcfd] text-xs text-[#616189]">
          Подсказка: сотрудник заходит в `Кабинет` → `Добавить компанию` → `Найти по логину` и вводит эти данные.
        </div>
      </div>
    </div>
  );
}
