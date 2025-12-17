// apps/web/src/pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        {/* PWA: manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Цвет статус-бара и фона */}
        <meta name="theme-color" content="#0f172a" />

        {/* Иконки */}
        <link rel="icon" href="/icons/maskable_icon_x192.png" />
        <link rel="apple-touch-icon" href="/icons/maskable_icon_x192.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
