// src/components/sw-register.tsx
"use client";

import { useEffect } from "react";
import type React from "react";

const SWRegister: React.FC = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }
  }, []);

  return null;
};

export default SWRegister;
