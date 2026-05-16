import { useEffect, useState } from 'react';

export default function CountUp({ end = 0, duration = 800 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const target = Number(end) || 0;
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return <span>{value}</span>;
}
