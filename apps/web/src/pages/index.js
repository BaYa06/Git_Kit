import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Git-Kit — Добро пожаловать</title>
        <meta name="description" content="Git-Kit: быстрый старт. Создайте аккаунт или войдите." />
        <meta property="og:title" content="Git-Kit" />
        <meta property="og:description" content="Добро пожаловать! Регистрация или вход." />
      </Head>

      <main className="wrap">
        <div className="card">
          <div className="logo">Git-Kit</div>
          <p className="tagline">Быстрый старт для вашего проекта</p>

          <div className="actions">
            <Link href="/register" className="btn primary">Регистрация</Link>
            <Link href="/login" className="btn">Войти</Link>
          </div>
        </div>
      </main>

      <style jsx>{`
        .wrap{
          min-height:100svh; display:flex; align-items:center; justify-content:center;
          padding:24px;
          background:
            radial-gradient(1200px 600px at 10% -10%, #7aa2ff33, transparent 60%),
            radial-gradient(1200px 600px at 110% 110%, #22d3ee33, transparent 60%),
            linear-gradient(180deg, #0b0f1a, #0b0f1a);
        }
        .card{
          width:100%; max-width:560px; text-align:center; padding:40px;
          border-radius:24px; backdrop-filter: blur(10px);
          background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12);
          box-shadow: 0 10px 30px rgba(0,0,0,0.35); color:#fff;
        }
        .logo{
          font-weight:800; font-size:48px; letter-spacing:-0.02em;
          background: linear-gradient(90deg, #fff, #b7c9ff);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .tagline{ margin:12px 0 28px; font-size:18px; opacity:.9; }
        .actions{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .btn{
          text-decoration:none; font-weight:700; padding:12px 20px; border-radius:14px;
          border:1px solid rgba(255,255,255,.2); color:#fff; transition:.15s transform, .15s opacity;
        }
        .btn:hover{ transform: translateY(-1px); opacity:.95; }
        .primary{ background:#fff; color:#0b0f1a; border-color:#fff; }
        @media (prefers-color-scheme: light){
          .wrap{ background: linear-gradient(180deg,#eef2ff,#ffffff); }
          .card{ background:#ffffffcc; color:#0b0f1a; border-color:#00000014; }
          .btn{ color:#0b0f1a; border-color:#00000026; }
          .primary{ background:#0b0f1a; color:#fff; border-color:#0b0f1a; }
        }
      `}</style>
    </>
  );
}
