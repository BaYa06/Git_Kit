import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/landing.module.css'; // если у тебя другая структура — поправь путь

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch (e) {}
        throw new Error(
          (data && data.message) || 'Не удалось войти. Проверьте данные.'
        );
      }

      // успешный логин — кидаем в кабинет
      window.location.href = '/cabinet';
    } catch (err) {
      setError(err.message || 'Не удалось войти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Git-Kit — Вход</title>
      </Head>

      <div className={styles.loginRoot}>
        <div className={styles.loginWrapper}>
          {/* HEADER */}
          <header className={styles.loginHeader}>
            <div className={styles.loginIcon}>
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="48" strokeWidth="4" fill="none" />
                <path
                  d="M60.6667 36.3333L71 50M71 50L60.6667 63.6667M71 50H29"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h1 className={styles.loginTitle}>Welcome to Git-Kit</h1>
            <p className={styles.loginSubtitle}>
              Sign in to manage your tours
            </p>
          </header>

          {/* FORM */}
          <main>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              {/* Email */}
              <label className={styles.loginLabel}>
                Email
                <div className={styles.loginFieldWrapper}>
                  <div className={styles.loginFieldIcon}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6h16v12H4z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M4 7l8 6 8-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </div>
                  <input
                    className={styles.loginInput}
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              {/* Password */}
              <label className={styles.loginLabel}>
                Пароль
                <div className={styles.loginFieldWrapper}>
                  <div className={styles.loginFieldIcon}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect
                        x="6"
                        y="10"
                        width="12"
                        height="10"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M9 10V8a3 3 0 0 1 6 0v2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </div>
                  <input
                    className={styles.loginInput}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
              </label>

              <div className={styles.loginForgot}>
                <Link href="/forgot-password">Забыли пароль?</Link>
              </div>

              {error && (
                <p
                  style={{
                    color: '#f97373',
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Входим…' : 'Войти'}
              </button>
            </form>

            <div className={styles.loginFooter}>
              Нет аккаунта?{' '}
              <Link href="/register">
                Зарегистрироваться и создать компанию
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
