// apps/web/src/pages/_app.js
import { useEffect } from "react";
import "@/styles/globals.css";
import "@/styles/admin/desktop.css";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Регистрируем SW только в продакшене
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      // можно регать и локально, но обычно проверяют ENV
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.log("SW registration failed", err));
    }
  }, []);

  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
