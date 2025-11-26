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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
