import { useEffect, useState } from "react";

export default function useVersionChecker(interval = 300000) {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch("/index.html", { cache: "no-store" });
        const html = await response.text();
        const newHash = html.match(/main\.[a-f0-9]{8,}\.js/);
        const oldHash = sessionStorage.getItem("appVersion");

        if (newHash && newHash[0] !== oldHash) {
          sessionStorage.setItem("appVersion", newHash[0]);
          if (oldHash) setUpdateAvailable(true);
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
