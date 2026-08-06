"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
  interval?: number;
}

export function AutoRefresh({
  interval = 60_000,
}: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [interval, router]);

  return null;
}