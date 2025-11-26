import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/landing.module.css';

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Браузер говорит: "приложение можно установить"
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      setInstalling(true);
      deferredPrompt.prompt();
      await deferredPrompt.userChoice; // accepted / dismissed
      setDeferredPrompt(null);
      setCanInstall(false);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <Head>
        <title>Git-Kit — Your guide to seamless tours</title>
        <meta
          name="description"
          content="Git-Kit: инструмент для гидов и турфирм. Добавьте свою компанию или войдите в аккаунт."
        />
        <meta property="og:title" content="Git-Kit" />
        <meta
          property="og:description"
          content="Your guide to seamless tours. Добавьте компанию или войдите."
        />

        {/* Шрифты для текста и иконки маршрута */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap"
        />
      </Head>

      <main className={styles.root}>
        <div className={styles.phone}>
          {/* Шапка с логотипом */}
          <header className={styles.header}>
            <div className={styles.logoBlock}>
              <div className={styles.logoIcon}>
                <span className="material-symbols-outlined">route</span>
              </div>
              <div className={styles.logoText}>Git-Kit</div>
            </div>
          </header>

          {/* Картинка и текст */}
          <section className={styles.hero}>
            <div className={styles.heroImageWrapper}>
              <div className={styles.heroImage} />
            </div>

            <h1 className={styles.title}>Your guide to seamless tours.</h1>
            <p className={styles.subtitle}>
              The ultimate tool for tour guides and tour companies to
              organize, manage, and grow their business.
            </p>
          </section>

          {/* Кнопки действий */}
          <section className={styles.actions}>
            {/* 👉 "Добавить компанию" = регистрация */}
            <Link
              href="/register"
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              <span>Добавить компанию</span>
            </Link>

            {/* 👉 "Войти" = логин */}
            <Link
              href="/login"
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              <span>Войти</span>
            </Link>

            {/* 👉 Кнопка установки PWA (показывается только когда браузер готов) */}
            {canInstall && (
              <button
                type="button"
                className={`${styles.button} ${styles.pwaInstallButton}`}
                onClick={handleInstallClick}
                disabled={installing}
              >
                {installing ? 'Ожидание…' : 'Скачать приложение'}
              </button>
            )}
          </section>

          {/* Футер с условиями */}
          <footer className={styles.footer}>
            <p>
              Продолжая, вы соглашаетесь с нашими{' '}
              <a href="#" className={styles.footerLink}>
                Условиями использования
              </a>{' '}
              и{' '}
              <a href="#" className={styles.footerLink}>
                Политикой конфиденциальности
              </a>
              .
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
