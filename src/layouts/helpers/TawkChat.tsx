import React, { useEffect, useRef } from "react";
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

const TawkChat = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWidgetVisible = useRef(false);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    if (document.getElementById("tawk-script")) return;

    // Suppress Tawk.to specific errors
    const originalError = console.error;
    console.error = function (...args) {
      const errorString = args.join(" ");
      if (
        errorString.includes("tawk.to") ||
        errorString.includes("twk-chunk") ||
        errorString.includes("Tawk/Widget-Settings")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/6703648b37379df10df31533/1i9ik1guj";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    // Tangani error saat load script
    s1.onerror = function (error) {
      console.warn("Tawk.to widget failed to load (non-critical)");
    };

    s1.onload = () => {
      try {
        window.Tawk_API.onLoad = function () {
          window.Tawk_API.hideWidget();
          isWidgetVisible.current = false;
          setTimeout(() => {
            startAnimationLoop();
          }, 5000);
        };
      } catch (error) {
        console.warn("Tawk.to initialization skipped");
      }
    };

    document.head.appendChild(s1);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
      console.error = originalError; // Restore original console.error
    };
  }, []);

  const startAnimationLoop = () => {
    toggleWidget();
    intervalRef.current = setInterval(() => {
      toggleWidget();
    }, 10000);
  };

  const toggleWidget = () => {
    if (!window.Tawk_API) return;

    try {
      if (window.Tawk_API.isChatMaximized()) {
        return;
      }

      if (isWidgetVisible.current) {
        window.Tawk_API.hideWidget();
        isWidgetVisible.current = false;
      } else {
        window.Tawk_API.showWidget();
        isWidgetVisible.current = true;
      }
    } catch (error) {
      // Suppress toggle errors
    }
  };

  return null;
};

export default TawkChat;
