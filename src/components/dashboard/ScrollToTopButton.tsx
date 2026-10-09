"use client";

import {
  useEffect,
  useState,
} from "react";

export function ScrollToTopButton() {
  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(
        window.scrollY > 500,
      );
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  function handleClick() {
    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    window.scrollTo({
      top: 0,

      behavior:
        prefersReducedMotion
          ? "auto"
          : "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={
        handleClick
      }
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={`group fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-2xl border border-white/60 bg-slate-950/90 text-white shadow-[0_12px_35px_rgba(15,23,42,0.30)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_18px_45px_rgba(37,99,235,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:bottom-8 sm:right-8 ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-90 opacity-0"
      }`}
    >
      {/* BRILHO SUPERIOR */}

      <span className="pointer-events-none absolute inset-x-2 top-1 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      {/* FUNDO DECORATIVO */}

      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <span className="absolute -right-4 -top-5 h-12 w-12 rounded-full bg-blue-400/20 blur-xl" />
      </span>

      {/* SETA */}

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>

      {/* PONTO DE DESTAQUE */}

      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
    </button>
  );
}