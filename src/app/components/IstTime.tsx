import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const IST = 'Asia/Kolkata';

function formatIstDateDdMmYy(d: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: IST,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(d);
}

function formatIstTime(d: Date) {
  return d.toLocaleTimeString('en-IN', {
    timeZone: IST,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function IstTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      className="flex items-center gap-2 min-w-0 text-right"
      title="Date and time in India Standard Time"
    >
      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden />
      <div className="min-w-0">
        <p
          className="text-xs sm:text-sm tabular-nums leading-snug"
          style={{ fontWeight: 600 }}
        >
          <span className="text-muted-foreground font-medium">{formatIstDateDdMmYy(now)}</span>
          <span className="text-muted-foreground/80 mx-1">·</span>
          {formatIstTime(now)}
        </p>
      </div>
    </div>
  );
}
