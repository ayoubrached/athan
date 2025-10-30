"use client";

import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  // Avoid SSR/client mismatch: render nothing until mounted, then update every second
  return <span suppressHydrationWarning>{mounted ? time : ''}</span>;
}

