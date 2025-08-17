import { type ClassValue, clsx } from "clsx";
import { useEffect } from "preact/compat";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useLocation } from "react-router-dom";
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
