"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useRouter,
} from "next/navigation";

interface AutoRefreshProps {
  interval?: number;
}

export function AutoRefresh({
  interval = 60_000,
}: AutoRefreshProps) {
  const router = useRouter();

  const lastRefreshRef =
    useRef(Date.now());

  useEffect(() => {
    function refreshIfNeeded() {
      /*
       * Não atualiza o dashboard
       * enquanto a aba estiver oculta.
       */
      if (
        document.visibilityState !==
        "visible"
      ) {
        return;
      }

      const now = Date.now();

      const elapsed =
        now -
        lastRefreshRef.current;

      /*
       * Evita duas atualizações muito
       * próximas, por exemplo:
       *
       * - intervalo de 60 segundos;
       * - usuário volta para a aba
       *   exatamente no mesmo momento.
       */
      if (
        elapsed < interval
      ) {
        return;
      }

      lastRefreshRef.current =
        now;

      router.refresh();
    }

    /*
     * Mantém a atualização automática
     * normal enquanto a página estiver
     * sendo utilizada.
     */
    const timer =
      window.setInterval(
        refreshIfNeeded,
        interval,
      );

    /*
     * Quando o usuário volta para a aba,
     * verificamos se já passou o intervalo.
     *
     * Se passou, atualizamos imediatamente.
     * Se não passou, aguardamos normalmente.
     */
    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshIfNeeded();
      }
    }

    /*
     * Também cobre situações em que
     * a janela volta a receber foco.
     */
    function handleWindowFocus() {
      refreshIfNeeded();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    return () => {
      window.clearInterval(
        timer,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus,
      );
    };
  }, [
    interval,
    router,
  ]);

  return null;
}