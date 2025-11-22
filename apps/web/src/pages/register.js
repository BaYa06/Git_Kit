import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { useRouter } from 'next/router';
import styles from '@/styles/landing.module.css';

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [msg, setMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await apiPost('/v1/auth/register', form);
      // после успешной регистрации ведём на логин
      router.push('/login');
    } catch (err) {
      setMsg({
        type: 'err',
        text: err.message || 'Ошибка регистрации',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerRoot}>
      <div className={styles.registerWrapper}>
        {/* HEADER */}
        <header className={styles.registerHeader}>
          <div className={styles.registerHeaderTop}>
            <Link href="/" className={styles.registerClose} aria-label="Закрыть">
              ✕
            </Link>
            <div className={styles.registerHeaderTitle}>Создание аккаунта</div>
          </div>

          <div className={styles.registerSteps}>
            <div
              className={`${styles.registerStepDot} ${styles.registerStepDotActive}`}
            />
            <div className={styles.registerStepDot} />
          </div>

          <h1 className={styles.registerMainTitle}>Давайте начнём</h1>
        </header>

        {/* FORM */}
        <main>
          <form className={styles.registerForm} onSubmit={onSubmit}>
            <div className={styles.registerField}>
              <label className={styles.registerLabel} htmlFor="first_name">
                Имя
              </label>
              <input
                id="first_name"
                className={styles.registerInput}
                name="first_name"
                placeholder="Введите ваше имя"
                value={form.first_name}
                onChange={onChange}
                required
              />
            </div>

            <div className={styles.registerField}>
              <label className={styles.registerLabel} htmlFor="last_name">
                Фамилия
              </label>
              <input
                id="last_name"
                className={styles.registerInput}
                name="last_name"
                placeholder="Введите вашу фамилию"
                value={form.last_name}
                onChange={onChange}
                required
              />
            </div>

            <div className={styles.registerField}>
              <label className={styles.registerLabel} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.registerInput}
                type="email"
                name="email"
                placeholder="Введите ваш email"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className={styles.registerField}>
              <label className={styles.registerLabel} htmlFor="phone">
                Телефон (Кыргызстан)
              </label>
              <input
                id="phone"
                className={styles.registerInput}
                type="tel"
                name="phone"
                placeholder="+996XXXXXXXXX"
                value={form.phone}
                onChange={onChange}
                required
              />
              <p className={styles.registerHint}>Формат: +996XXXXXXXXX</p>
            </div>

            <div className={styles.registerField}>
              <label className={styles.registerLabel} htmlFor="password">
                Пароль
              </label>
              <div className={styles.registerPasswordWrapper}>
                <input
                  id="password"
                  className={styles.registerInput}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Введите пароль"
                  value={form.password}
                  onChange={onChange}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className={styles.loginPasswordToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    // перечёркнутый глаз
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4.5 7C6.2 5.3 8.5 4 12 4c5 0 8.3 3 10 6-0.4.8-0.9 1.6-1.5 2.3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.5 9.5A3.5 3.5 0 0 1 14.5 14.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    // обычный глаз
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {msg && (
              <p
                style={{
                  color: msg.type === 'ok' ? '#22c55e' : '#f97373',
                  fontSize: 13,
                  marginTop: 4,
                  marginBottom: 4,
                }}
              >
                {msg.text}
              </p>
            )}

            <button
              className={styles.registerButton}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Отправляем…' : 'Следующий шаг'}
            </button>
          </form>

          <div className={styles.registerFooterText}>
            Уже есть аккаунт?{' '}
            <Link href="/login">
              Войти
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
