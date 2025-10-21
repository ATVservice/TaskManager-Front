import { useEffect, useState } from "react";

export default function useVersionChecker(interval = 300000) {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch("/index.html", { cache: "no-store" });
        const html = await response.text();
        const newHash = html.match(/main\.[a-f0-9]{8,}\.js/)?.[0];

        if (!newHash) return;

        const oldHash = sessionStorage.getItem("appVersion");

        if (!oldHash) {
          // פעם ראשונה - נשמור את הערך הנוכחי
          sessionStorage.setItem("appVersion", newHash);
          return;
        }

        // אם השתנה – תעדכן דגל
        if (newHash !== oldHash) {
          sessionStorage.setItem("appVersion", newHash);
          setUpdateAvailable(true);
        }
      } catch (err) {
        console.error("Version check failed:", err);
      }
    };

    checkVersion();
    const timer = setInterval(checkVersion, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return updateAvailable;
}
